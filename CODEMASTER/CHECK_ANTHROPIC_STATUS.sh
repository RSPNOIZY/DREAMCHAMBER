#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# CHECK_ANTHROPIC_STATUS.sh
# Polls Anthropic API status every 30min (via launchd)
# Alerts GABRIEL if degraded or down
# RSP_001 | NOIZY Empire | 2026
# ═══════════════════════════════════════════════════════════════

GABRIEL="http://localhost:7777"
LOG_DIR="$HOME/NOIZYLAB/CODEMASTER/logs"
LOG="$LOG_DIR/anthropic_status.log"
STATUS_URL="https://status.anthropic.com/api/v2/status.json"
COMPONENTS_URL="https://status.anthropic.com/api/v2/components.json"

mkdir -p "$LOG_DIR"

TS=$(date '+%Y-%m-%d %H:%M:%S')

# Fetch status
STATUS=$(curl -s --max-time 10 "$STATUS_URL" 2>/dev/null)
if [ -z "$STATUS" ]; then
    echo "[$TS] ERROR: Could not reach status.anthropic.com" >> "$LOG"
    exit 1
fi

INDICATOR=$(echo "$STATUS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['status']['indicator'])" 2>/dev/null)
DESCRIPTION=$(echo "$STATUS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['status']['description'])" 2>/dev/null)

echo "[$TS] Anthropic: $INDICATOR — $DESCRIPTION" >> "$LOG"

# Alert on anything worse than 'none'
if [ "$INDICATOR" != "none" ]; then
    MSG="Anthropic API alert: $DESCRIPTION"
    echo "[$TS] 🚨 ALERTING GABRIEL: $MSG" >> "$LOG"

    # Push to GABRIEL memcell
    curl -s -X POST "$GABRIEL/memcell/anthropic:status" \
        -H "Content-Type: application/json" \
        -d "{\"value\": {\"indicator\": \"$INDICATOR\", \"description\": \"$DESCRIPTION\", \"ts\": \"$TS\"}}" \
        >> "$LOG" 2>&1

    # Speak alert
    /usr/bin/say -v Daniel "Anthropic API warning: $DESCRIPTION" &
fi

exit 0
