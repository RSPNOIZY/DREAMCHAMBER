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
LAST_STATE_FILE="$LOG_DIR/.anthropic_last_state"

mkdir -p "$LOG_DIR"

TS=$(date '+%Y-%m-%d %H:%M:%S')

# Fetch status
STATUS=$(curl -s --max-time 10 "$STATUS_URL" 2>/dev/null)
if [ -z "$STATUS" ]; then
    echo "[$TS] ERROR: Could not reach status.anthropic.com" >> "$LOG"
    exit 1
fi

# Parse safely — default to empty on failure
INDICATOR=$(echo "$STATUS" | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    print(d['status']['indicator'])
except:
    print('')
" 2>/dev/null)

DESCRIPTION=$(echo "$STATUS" | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    print(d['status']['description'])
except:
    print('Parse error')
" 2>/dev/null)

# Guard: if parsing failed, log and exit — do NOT alert
if [ -z "$INDICATOR" ]; then
    echo "[$TS] ⚠ Could not parse Anthropic status response — skipping" >> "$LOG"
    exit 0
fi

echo "[$TS] Anthropic: $INDICATOR — $DESCRIPTION" >> "$LOG"

# Read last known state to avoid repeat alerts
LAST_STATE=""
[ -f "$LAST_STATE_FILE" ] && LAST_STATE=$(cat "$LAST_STATE_FILE")

# Alert on anything worse than 'none' — but only on state CHANGE
if [ "$INDICATOR" != "none" ]; then
    if [ "$INDICATOR" != "$LAST_STATE" ]; then
        MSG="Anthropic API alert: $DESCRIPTION"
        echo "[$TS] 🚨 ALERTING: $MSG" >> "$LOG"

        # Push to GABRIEL memcell
        MEMCELL_RESULT=$(curl -s --max-time 5 -X POST "$GABRIEL/memcell/anthropic:status" \
            -H "Content-Type: application/json" \
            -d "{\"value\": {\"indicator\": \"$INDICATOR\", \"description\": \"$DESCRIPTION\", \"ts\": \"$TS\"}}" 2>/dev/null)
        echo "" >> "$LOG"

        # Speak via GABRIEL, fallback to macOS say
        SPEAK_RESULT=$(curl -s --max-time 5 -X POST "$GABRIEL/speak" \
            -H "Content-Type: application/json" \
            -d "{\"text\": \"$MSG\"}" 2>/dev/null)

        if echo "$SPEAK_RESULT" | grep -q "ok\|success\|spoken" 2>/dev/null; then
            echo "[$TS] ✅ Alert delivered via GABRIEL" >> "$LOG"
        else
            /usr/bin/say -v Daniel "$MSG" &
            echo "[$TS] ⚠ GABRIEL unavailable — used macOS say" >> "$LOG"
        fi
    else
        echo "[$TS] ⏸ Still degraded ($INDICATOR) — suppressing repeat alert" >> "$LOG"
    fi
elif [ "$LAST_STATE" != "none" ] && [ -n "$LAST_STATE" ]; then
    # Recovered — announce it
    RECOVERY_MSG="Anthropic API recovered: $DESCRIPTION"
    echo "[$TS] ✅ RECOVERED: $RECOVERY_MSG" >> "$LOG"
    curl -s --max-time 5 -X POST "$GABRIEL/speak" \
        -H "Content-Type: application/json" \
        -d "{\"text\": \"$RECOVERY_MSG\"}" 2>/dev/null || \
        /usr/bin/say -v Daniel "$RECOVERY_MSG" &
fi

# Save current state
echo "$INDICATOR" > "$LAST_STATE_FILE"

exit 0
