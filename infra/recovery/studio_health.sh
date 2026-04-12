#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# studio_health.sh — Emit studio_health.json for GOD.local
# Checks: Logic Pro, agent ports, Heaven, disk, current session
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

OUTFILE="$HOME/Recovered/studio_health.json"
EVENTS_LOG="$HOME/Recovered/events.jsonl"
MACHINE_NAME="${HOSTNAME:-$(hostname -s)}"
CURRENT_USER="$(whoami)"
SCRIPT_NAME="studio_health"
DRY_RUN="${DRY_RUN:-false}"

# ── Recovery Preamble ────────────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════"
echo " host:        $MACHINE_NAME"
echo " user:        $CURRENT_USER"
echo " command:     $SCRIPT_NAME"
echo " source:      (local system)"
echo " destination: $OUTFILE"
echo " dry-run:     $DRY_RUN"
echo "═══════════════════════════════════════════════════"

log_event() {
  printf '{"ts":"%s","script":"%s","machine":"%s","user":"%s","action":"%s","detail":%s}\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$SCRIPT_NAME" "$MACHINE_NAME" "$CURRENT_USER" "$1" "$2" \
    >> "$EVENTS_LOG"
}

log_event "health_started" "{\"user\":\"$CURRENT_USER\",\"dry_run\":$DRY_RUN}"

# ── Logic Pro running? ───────────────────────────────────────────────────────
logic_running="false"
if pgrep -x "Logic Pro" >/dev/null 2>&1 || pgrep -f "Logic Pro" >/dev/null 2>&1; then
  logic_running="true"
fi

# ── Port checks ──────────────────────────────────────────────────────────────
check_port() {
  local name="$1" port="$2"
  if curl -fsS --max-time 3 "http://127.0.0.1:${port}/health" >/dev/null 2>&1; then
    echo "{\"name\":\"$name\",\"port\":$port,\"status\":\"up\"}"
  else
    echo "{\"name\":\"$name\",\"port\":$port,\"status\":\"down\"}"
  fi
}

gateway=$(check_port "central-gateway" 9696)
engr_keith=$(check_port "engr-keith" 7004)
dreamchamber=$(check_port "dreamchamber" 7777)
voice_bridge=$(check_port "voice-bridge" 8080)

# ── Heaven cloud health ──────────────────────────────────────────────────────
heaven_status="unknown"
heaven_detail="{}"
if heaven_res=$(curl -fsS --max-time 5 "https://heaven.rsp-5f3.workers.dev/api/health" 2>/dev/null); then
  heaven_status="live"
  heaven_detail="$heaven_res"
else
  heaven_status="unreachable"
fi

# ── Disk space ───────────────────────────────────────────────────────────────
root_free_gb=$(df -g / 2>/dev/null | tail -1 | awk '{print $4}')

# ── Assemble JSON ────────────────────────────────────────────────────────────
cat > "$OUTFILE" <<JSON
{
  "machine": "$MACHINE_NAME",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "logic_pro": $logic_running,
  "services": [
    $gateway,
    $engr_keith,
    $dreamchamber,
    $voice_bridge
  ],
  "heaven": {
    "status": "$heaven_status",
    "url": "https://heaven.rsp-5f3.workers.dev",
    "detail": $heaven_detail
  },
  "disk": {
    "root_free_gb": ${root_free_gb:-0}
  }
}
JSON

echo "=== Studio health written: $OUTFILE ==="
cat "$OUTFILE"
log_event "health_captured" "{\"logic\":$logic_running,\"heaven\":\"$heaven_status\",\"disk_free_gb\":${root_free_gb:-0}}"
