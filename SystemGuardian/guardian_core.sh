#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# guardian_core.sh — NOIZY System Guardian
# Runs every hour via launchd (com.noizylab.guardian)
# Monitors system resources, auto-heals services, alerts GABRIEL
# RSP_001 | NOIZY Empire | 2026
# ═══════════════════════════════════════════════════════════════

GABRIEL="http://localhost:7777"
LOG="$HOME/NOIZYLAB/SystemGuardian/logs/guardian.log"
TS=$(date '+%Y-%m-%d %H:%M:%S')

mkdir -p "$(dirname $LOG)"

log() { echo "[$TS] $1" >> "$LOG"; }
log "Guardian cycle start"

# ── Disk Space ────────────────────────────────────────────────
DISK_PCT=$(df -h / | awk 'NR==2 {gsub(/%/,""); print $5}')
if [ "$DISK_PCT" -gt 85 ]; then
    log "⚠ DISK WARNING: ${DISK_PCT}% used"
    /usr/bin/say -v Daniel "Disk warning: ${DISK_PCT} percent full on GOD" &
fi

# ── Memory ────────────────────────────────────────────────────
MEM_PRESSURE=$(memory_pressure 2>/dev/null | grep "System memory pressure" | awk '{print $NF}' || echo "unknown")
log "Memory pressure: $MEM_PRESSURE | Disk: ${DISK_PCT}%"

# ── Service Watchdog ──────────────────────────────────────────
services_down=()

# GABRIEL
if ! curl -s --max-time 5 "$GABRIEL/health" | grep -q "ok" 2>/dev/null; then
    log "❌ GABRIEL DOWN — attempting restart"
    launchctl kickstart -k "gui/$(id -u)/ai.noizy.gabriel" 2>/dev/null || \
    launchctl start ai.noizy.gabriel 2>/dev/null
    services_down+=("GABRIEL")
fi

# Voice Bridge
if ! curl -s --max-time 5 "http://localhost:8080/health" | grep -q "healthy" 2>/dev/null; then
    log "❌ Voice Bridge DOWN"
    "$HOME/.npm-global/bin/pm2" restart voice-bridge 2>/dev/null
    services_down+=("VoiceBridge")
fi

# Ollama
if ! curl -s --max-time 5 "http://localhost:11434/api/tags" | grep -q "models" 2>/dev/null; then
    log "❌ Ollama DOWN — attempting restart"
    brew services restart ollama 2>/dev/null
    services_down+=("Ollama")
fi

# ── Report to GABRIEL ─────────────────────────────────────────
STATUS="ok"
[ ${#services_down[@]} -gt 0 ] && STATUS="degraded: $(IFS=','; echo "${services_down[*]}")"

curl -s -X POST "$GABRIEL/memcell/guardian:status" \
    -H "Content-Type: application/json" \
    -d "{\"value\": {\"status\": \"$STATUS\", \"disk_pct\": $DISK_PCT, \"mem_pressure\": \"$MEM_PRESSURE\", \"ts\": \"$TS\"}}" \
    >> "$LOG" 2>&1

log "Guardian cycle complete — $STATUS"
exit 0
