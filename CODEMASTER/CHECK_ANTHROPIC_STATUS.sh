#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# CHECK_ANTHROPIC_STATUS.sh
# Polls Anthropic API status every 30min (via launchd)
# Alerts GABRIEL if degraded or down
# Also checks n8n + Docker health, notifies n8n webhook for audit trail
# RSP_001 | NOIZY Empire | 2026
# ═══════════════════════════════════════════════════════════════

GABRIEL="http://localhost:7777"
N8N="http://localhost:5678"
LOG_DIR="$HOME/NOIZYLAB/CODEMASTER/logs"
LOG="$LOG_DIR/anthropic_status.log"
LAST_STATE_FILE="$LOG_DIR/.anthropic_last_state"
STATUS_URL="https://status.anthropic.com/api/v2/status.json"

mkdir -p "$LOG_DIR"

TS=$(date '+%Y-%m-%d %H:%M:%S')

# ─── Helper: check HTTP endpoint ──────────────────────────
check_http() {
    local url="$1" timeout="${2:-5}"
    curl -s --max-time "$timeout" "$url" 2>/dev/null
}

# ─── Fetch Anthropic status ───────────────────────────────
STATUS=$(check_http "$STATUS_URL" 10)
if [ -z "$STATUS" ]; then
    echo "[$TS] ERROR: Could not reach status.anthropic.com" >> "$LOG"
    # Still check infra before exiting
fi

# Parse with safe defaults — fixes the empty-indicator bug that caused
# false alerts every 30min since 2026-03-30
INDICATOR=$(echo "$STATUS" | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    print(d.get('status',{}).get('indicator','unknown'))
except:
    print('error')
" 2>/dev/null)
INDICATOR="${INDICATOR:-unknown}"

DESCRIPTION=$(echo "$STATUS" | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    print(d.get('status',{}).get('description','No description'))
except:
    print('Parse error')
" 2>/dev/null)
DESCRIPTION="${DESCRIPTION:-No description}"

echo "[$TS] Anthropic: $INDICATOR — $DESCRIPTION" >> "$LOG"

# ─── Infrastructure sidecar checks ────────────────────────
N8N_OK="false"
N8N_HEALTH=$(check_http "$N8N/healthz")
if echo "$N8N_HEALTH" | grep -q "ok" 2>/dev/null; then
    N8N_OK="true"
fi

DOCKER_RUNNING=0
if command -v docker &>/dev/null; then
    DOCKER_RUNNING=$(docker ps -q 2>/dev/null | wc -l | tr -d ' ')
fi

echo "[$TS] Sidecar: n8n=$N8N_OK, docker_containers=$DOCKER_RUNNING" >> "$LOG"

# ─── Read last known state to avoid repeat alerts ─────────
LAST_STATE=""
[ -f "$LAST_STATE_FILE" ] && LAST_STATE=$(cat "$LAST_STATE_FILE" 2>/dev/null)

# Only alert on real degradation, not parse failures or unchanged state
if [ "$INDICATOR" != "none" ] && [ "$INDICATOR" != "unknown" ] && [ "$INDICATOR" != "error" ]; then
    # Only alert if state changed (prevents 30min alert spam)
    if [ "$INDICATOR" != "$LAST_STATE" ]; then
        MSG="Anthropic API alert: $DESCRIPTION"
        echo "[$TS] 🚨 ALERTING: $MSG" >> "$LOG"

        # Push to GABRIEL memcell
        MEMCELL_RESULT=$(curl -s --max-time 5 -X POST "$GABRIEL/memcell/anthropic:status" \
            -H "Content-Type: application/json" \
            -d "{\"value\": {\"indicator\": \"$INDICATOR\", \"description\": \"$DESCRIPTION\", \"n8n\": \"$N8N_OK\", \"docker_containers\": $DOCKER_RUNNING, \"ts\": \"$TS\"}}" 2>/dev/null)
        echo "[$TS] MemCell: $MEMCELL_RESULT" >> "$LOG"

        # Speak alert via GABRIEL, fallback to say
        SPEAK_RESULT=$(curl -s --max-time 5 -X POST "$GABRIEL/speak" \
            -H "Content-Type: application/json" \
            -d "{\"text\": \"$MSG\"}" 2>/dev/null)
        if ! echo "$SPEAK_RESULT" | grep -q "ok\|success\|spoken" 2>/dev/null; then
            /usr/bin/say -v Daniel "$MSG" &
            echo "[$TS] ⚠ GABRIEL unavailable — used macOS say" >> "$LOG"
        fi

        # Notify n8n webhook for governance audit trail
        if [ "$N8N_OK" = "true" ]; then
            curl -s --max-time 5 -X POST "$N8N/webhook/health-monitor" \
                -H "Content-Type: application/json" \
                -d "{
                    \"event\": \"health_degraded\",
                    \"service\": \"anthropic_api\",
                    \"indicator\": \"$INDICATOR\",
                    \"description\": \"$DESCRIPTION\",
                    \"operator\": \"RSP_001\",
                    \"ts\": \"$TS\"
                }" >> /dev/null 2>&1
            echo "[$TS] 📡 n8n notified: health_degraded" >> "$LOG"
        fi
    else
        echo "[$TS] ⏭ State unchanged ($INDICATOR) — suppressing repeat alert" >> "$LOG"
    fi
elif [ "$INDICATOR" = "none" ] && [ "$LAST_STATE" != "none" ] && [ -n "$LAST_STATE" ]; then
    # Recovered — log and notify
    echo "[$TS] ✅ Anthropic recovered: $DESCRIPTION" >> "$LOG"
    curl -s --max-time 5 -X POST "$GABRIEL/speak" \
        -H "Content-Type: application/json" \
        -d "{\"text\": \"Anthropic API recovered. All systems operational.\"}" 2>/dev/null || true

    # Store recovery in memcell
    curl -s --max-time 5 -X POST "$GABRIEL/memcell/anthropic:status" \
        -H "Content-Type: application/json" \
        -d "{\"value\": {\"indicator\": \"none\", \"description\": \"$DESCRIPTION\", \"recovered\": true, \"ts\": \"$TS\"}}" 2>/dev/null || true

    # Notify n8n of recovery
    if [ "$N8N_OK" = "true" ]; then
        curl -s --max-time 5 -X POST "$N8N/webhook/health-monitor" \
            -H "Content-Type: application/json" \
            -d "{
                \"event\": \"health_restored\",
                \"service\": \"anthropic_api\",
                \"indicator\": \"none\",
                \"description\": \"$DESCRIPTION\",
                \"operator\": \"RSP_001\",
                \"ts\": \"$TS\"
            }" >> /dev/null 2>&1
        echo "[$TS] 📡 n8n notified: health_restored" >> "$LOG"
    fi
fi

# ─── Persist current state ─────────────────────────────────
echo "$INDICATOR" > "$LAST_STATE_FILE"

# ─── Alert if n8n itself is down ───────────────────────────
N8N_LAST_FILE="$LOG_DIR/.n8n_last_state"
N8N_LAST=""
[ -f "$N8N_LAST_FILE" ] && N8N_LAST=$(cat "$N8N_LAST_FILE" 2>/dev/null)

if [ "$N8N_OK" = "false" ] && [ "$N8N_LAST" != "down" ]; then
    echo "[$TS] 🚨 n8n is DOWN" >> "$LOG"
    curl -s --max-time 5 -X POST "$GABRIEL/speak" \
        -H "Content-Type: application/json" \
        -d "{\"text\": \"Warning. n8n orchestrator is offline. Docker containers running: $DOCKER_RUNNING.\"}" 2>/dev/null || \
    /usr/bin/say -v Daniel "Warning. n 8 n orchestrator is offline." &
    curl -s --max-time 5 -X POST "$GABRIEL/memcell/infra:n8n" \
        -H "Content-Type: application/json" \
        -d "{\"value\": {\"status\": \"down\", \"docker_containers\": $DOCKER_RUNNING, \"ts\": \"$TS\"}}" 2>/dev/null || true
    echo "down" > "$N8N_LAST_FILE"
elif [ "$N8N_OK" = "true" ] && [ "$N8N_LAST" = "down" ]; then
    echo "[$TS] ✅ n8n recovered" >> "$LOG"
    curl -s --max-time 5 -X POST "$GABRIEL/speak" \
        -H "Content-Type: application/json" \
        -d "{\"text\": \"n8n orchestrator is back online.\"}" 2>/dev/null || true
    echo "ok" > "$N8N_LAST_FILE"
else
    echo "$( [ "$N8N_OK" = "true" ] && echo "ok" || echo "down" )" > "$N8N_LAST_FILE"
fi

exit 0
