#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# record_preflight.sh — Gate recording sessions behind health checks
# Refuses to proceed unless all conditions are green.
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

EVENTS_LOG="$HOME/Recovered/events.jsonl"
MACHINE_NAME="${HOSTNAME:-$(hostname -s)}"
CURRENT_USER="$(whoami)"
SCRIPT_NAME="record_preflight"
RECORD_DEST="${1:-$HOME/Music/Sessions}"
MIN_DISK_GB="${2:-50}"
DRY_RUN="${DRY_RUN:-false}"

# ── Recovery Preamble ────────────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════"
echo " host:        $MACHINE_NAME"
echo " user:        $CURRENT_USER"
echo " command:     $SCRIPT_NAME"
echo " source:      (local system checks)"
echo " destination: $RECORD_DEST"
echo " dry-run:     $DRY_RUN"
echo "═══════════════════════════════════════════════════"

log_event() {
  printf '{"ts":"%s","script":"%s","machine":"%s","user":"%s","action":"%s","detail":%s}\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$SCRIPT_NAME" "$MACHINE_NAME" "$CURRENT_USER" "$1" "$2" \
    >> "$EVENTS_LOG"
}

log_event "preflight_started" "{\"user\":\"$CURRENT_USER\",\"dest\":\"$RECORD_DEST\",\"min_disk_gb\":$MIN_DISK_GB,\"dry_run\":$DRY_RUN}"

pass=0
fail=0
blockers=""

# ── 1. Logic Pro running ─────────────────────────────────────────────────────
echo -n "  Logic Pro running... "
if pgrep -x "Logic Pro" >/dev/null 2>&1 || pgrep -f "Logic Pro" >/dev/null 2>&1; then
  echo "YES"
  ((pass++))
else
  echo "NO — BLOCKER"
  ((fail++))
  blockers+="logic_not_running,"
fi

# ── 2. Sample rate check (via system_profiler) ──────────────────────────────
echo -n "  Audio sample rate... "
sample_rate=$(system_profiler SPAudioDataType 2>/dev/null | grep "Current SampleRate" | head -1 | awk '{print $NF}')
if [ -n "$sample_rate" ]; then
  echo "${sample_rate} Hz"
  ((pass++))
else
  echo "UNKNOWN — WARNING (check Audio MIDI Setup)"
  # Not a blocker, just a warning
  ((pass++))
fi

# ── 3. Central gateway health ────────────────────────────────────────────────
echo -n "  Central gateway health... "
if curl -fsS --max-time 3 "http://127.0.0.1:9696/health" >/dev/null 2>&1; then
  echo "GREEN"
  ((pass++))
else
  echo "DOWN — BLOCKER"
  ((fail++))
  blockers+="gateway_down,"
fi

# ── 4. Writable destination ──────────────────────────────────────────────────
echo -n "  Recording destination ($RECORD_DEST)... "
if [ -d "$RECORD_DEST" ] && [ -w "$RECORD_DEST" ]; then
  echo "WRITABLE"
  ((pass++))
else
  mkdir -p "$RECORD_DEST" 2>/dev/null
  if [ -w "$RECORD_DEST" ]; then
    echo "CREATED + WRITABLE"
    ((pass++))
  else
    echo "NOT WRITABLE — BLOCKER"
    ((fail++))
    blockers+="dest_not_writable,"
  fi
fi

# ── 5. Disk space ────────────────────────────────────────────────────────────
echo -n "  Disk space (minimum ${MIN_DISK_GB}GB)... "
free_gb=$(df -g / 2>/dev/null | tail -1 | awk '{print $4}')
if [ "${free_gb:-0}" -ge "$MIN_DISK_GB" ]; then
  echo "${free_gb}GB free — OK"
  ((pass++))
else
  echo "${free_gb:-0}GB free — BLOCKER (need ${MIN_DISK_GB}GB)"
  ((fail++))
  blockers+="low_disk,"
fi

# ── 6. KEITH responds ───────────────────────────────────────────────────────
echo -n "  ENGR_KEITH (7004)... "
if curl -fsS --max-time 3 "http://127.0.0.1:7004/health" >/dev/null 2>&1; then
  echo "GREEN"
  ((pass++))
else
  echo "DOWN — WARNING (recording possible without KEITH)"
  ((pass++))
fi

# ── Verdict ──────────────────────────────────────────────────────────────────
echo ""
echo "=== RESULTS: $pass passed, $fail failed ==="

if [ "$fail" -eq 0 ]; then
  echo "=== PREFLIGHT PASSED — clear to record ==="
  log_event "preflight_pass" "{\"pass\":$pass,\"fail\":$fail}"
  exit 0
else
  echo "=== PREFLIGHT FAILED — DO NOT RECORD ==="
  echo "  Blockers: ${blockers%,}"
  log_event "preflight_fail" "{\"pass\":$pass,\"fail\":$fail,\"blockers\":\"${blockers%,}\"}"
  exit 1
fi
