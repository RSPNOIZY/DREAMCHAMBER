#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# AI_MORNING_NEWS.sh
# Daily 10am briefing — fetches empire status, speaks via GABRIEL
# RSP_001 | NOIZY Empire | 2026
# ═══════════════════════════════════════════════════════════════

GABRIEL="http://localhost:7777"
LOG_DIR="$HOME/NOIZYLAB/CODEMASTER/logs"
LOG="$LOG_DIR/morning_news.log"
DATE=$(date '+%A, %B %d %Y')
TS=$(date '+%Y-%m-%d %H:%M:%S')

mkdir -p "$LOG_DIR"
echo "" >> "$LOG"
echo "═══ MORNING BRIEFING $TS ═══" >> "$LOG"

# ── Empire status checks ──
GABRIEL_HEALTH=$(curl -s --max-time 5 "$GABRIEL/health" 2>/dev/null)
UPTIME=$(echo "$GABRIEL_HEALTH" | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin); print(f'{d.get(\"uptime\",0)/3600:.1f}')
except:
    print('?')
" 2>/dev/null || echo "?")

HEAVEN_HEALTH=$(curl -s --max-time 5 "https://heaven.rsp-5f3.workers.dev/health" 2>/dev/null)
HEAVEN_VER=$(echo "$HEAVEN_HEALTH" | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin); print(d.get('version','?'))
except:
    print('?')
" 2>/dev/null || echo "?")
LEDGER=$(echo "$HEAVEN_HEALTH" | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin); print(d.get('ledger_events','?'))
except:
    print('?')
" 2>/dev/null || echo "?")

# ── Anthropic API status ──
ANTHROPIC_RAW=$(curl -sL --max-time 5 "https://status.claude.com/api/v2/status.json" 2>/dev/null)
ANTHROPIC_STATUS=$(echo "$ANTHROPIC_RAW" | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin); ind=d['status']['indicator']
    print('operational' if ind=='none' else ind)
except:
    print('unknown')
" 2>/dev/null || echo "unknown")

# ── Days to April 17 deadline ──
DAYS_LEFT=$(python3 -c "
from datetime import date
d=(date(2026,4,17)-date.today()).days
print(d if d >= 0 else 0)
" 2>/dev/null || echo "0")

# ── Build briefing ──
BRIEF="Good morning Rob. Today is $DATE."

if [ "$DAYS_LEFT" != "0" ]; then
    BRIEF="$BRIEF $DAYS_LEFT days to April 17."
fi

BRIEF="$BRIEF GABRIEL uptime: $UPTIME hours. Heaven version $HEAVEN_VER with $LEDGER ledger events. Anthropic API: $ANTHROPIC_STATUS. Empire is operational. What are we building today?"

echo "[$TS] BRIEF: $BRIEF" >> "$LOG"

# ── Speak via GABRIEL, fallback to macOS say ──
GABRIEL_RESULT=$(curl -s --max-time 10 -X POST "$GABRIEL/speak" \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"$BRIEF\"}" 2>/dev/null)

if echo "$GABRIEL_RESULT" | grep -q "ok\|success\|spoken" 2>/dev/null; then
    echo "[$TS] ✅ Delivered via GABRIEL" >> "$LOG"
else
    /usr/bin/say -v Daniel "$BRIEF" &
    echo "[$TS] ⚠ GABRIEL unavailable — used macOS say" >> "$LOG"
fi

# ── Store briefing in GABRIEL memcell (safe JSON) ──
MEMCELL_JSON=$(python3 -c "
import json
print(json.dumps({'value': {
    'brief': '''$BRIEF''',
    'uptime_h': '$UPTIME',
    'heaven_ver': '$HEAVEN_VER',
    'anthropic': '$ANTHROPIC_STATUS',
    'days_to_deadline': int('$DAYS_LEFT') if '$DAYS_LEFT'.isdigit() else 0,
    'ts': '$TS'
}}))
" 2>/dev/null)

if [ -n "$MEMCELL_JSON" ]; then
    curl -s --max-time 5 -X POST "$GABRIEL/memcell/briefing:morning:$(date +%Y%m%d)" \
        -H "Content-Type: application/json" \
        -d "$MEMCELL_JSON" >> "$LOG" 2>&1
    echo "" >> "$LOG"
fi

exit 0
