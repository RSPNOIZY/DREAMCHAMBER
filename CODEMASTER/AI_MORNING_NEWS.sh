#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# AI_MORNING_NEWS.sh
# Daily 10am briefing — fetches full empire status, speaks via GABRIEL
# Checks: GABRIEL, HEAVEN, Anthropic, n8n, Docker, Ollama, WireGuard, system vitals
# RSP_001 | NOIZY Empire | 2026
# ═══════════════════════════════════════════════════════════════

GABRIEL="http://localhost:7777"
N8N="http://localhost:5678"
OLLAMA="http://localhost:11434"
LOG_DIR="$HOME/NOIZYLAB/CODEMASTER/logs"
LOG="$LOG_DIR/morning_news.log"
DATE=$(date '+%A, %B %d %Y')
TS=$(date '+%Y-%m-%d %H:%M:%S')
SERVICES_DOWN=0

mkdir -p "$LOG_DIR"
echo "" >> "$LOG"
echo "═══ MORNING BRIEFING $TS ═══" >> "$LOG"

# ─── Helper: check HTTP endpoint ──────────────────────────
check_http() {
    local url="$1" timeout="${2:-5}"
    curl -s --max-time "$timeout" "$url" 2>/dev/null
}

# ─── GABRIEL ───────────────────────────────────────────────
GABRIEL_STATUS="offline"
UPTIME="?"
GABRIEL_HEALTH=$(check_http "$GABRIEL/health")
if [ -n "$GABRIEL_HEALTH" ]; then
    GABRIEL_STATUS="online"
    UPTIME=$(echo "$GABRIEL_HEALTH" | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin); h=d.get('uptime',0)/3600; print(f'{h:.1f}')
except:
    print('?')
" 2>/dev/null || echo "?")
else
    SERVICES_DOWN=$((SERVICES_DOWN + 1))
fi

# ─── HEAVEN ────────────────────────────────────────────────
HEAVEN_STATUS="offline"
HEAVEN_VER="?"
LEDGER="?"
HEAVEN_HEALTH=$(check_http "https://heaven.noizylab.workers.dev/health")
if [ -n "$HEAVEN_HEALTH" ]; then
    HEAVEN_STATUS="online"
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
else
    SERVICES_DOWN=$((SERVICES_DOWN + 1))
fi

# ─── Anthropic API ─────────────────────────────────────────
ANTHROPIC_STATUS="unknown"
ANTHRO_RAW=$(check_http "https://status.anthropic.com/api/v2/status.json")
if [ -n "$ANTHRO_RAW" ]; then
    ANTHROPIC_STATUS=$(echo "$ANTHRO_RAW" | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    ind=d.get('status',{}).get('indicator','unknown')
    print('operational' if ind=='none' else ind)
except:
    print('unknown')
" 2>/dev/null || echo "unknown")
fi

# ─── n8n Orchestrator ──────────────────────────────────────
N8N_STATUS="offline"
N8N_HEALTH=$(check_http "$N8N/healthz")
if echo "$N8N_HEALTH" | grep -q "ok" 2>/dev/null; then
    N8N_STATUS="online"
else
    SERVICES_DOWN=$((SERVICES_DOWN + 1))
fi

# ─── Docker containers ────────────────────────────────────
DOCKER_STATUS="unavailable"
DOCKER_RUNNING=0
DOCKER_TOTAL=0
if command -v docker &>/dev/null; then
    DOCKER_RUNNING=$(docker ps -q 2>/dev/null | wc -l | tr -d ' ')
    DOCKER_TOTAL=$(docker ps -aq 2>/dev/null | wc -l | tr -d ' ')
    if [ "$DOCKER_RUNNING" -gt 0 ] 2>/dev/null; then
        DOCKER_STATUS="${DOCKER_RUNNING} running"
    else
        DOCKER_STATUS="0 running"
    fi
fi

# ─── Ollama LLM ───────────────────────────────────────────
OLLAMA_STATUS="offline"
OLLAMA_MODELS=0
OLLAMA_HEALTH=$(check_http "$OLLAMA/api/tags")
if [ -n "$OLLAMA_HEALTH" ]; then
    OLLAMA_STATUS="online"
    OLLAMA_MODELS=$(echo "$OLLAMA_HEALTH" | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin); print(len(d.get('models',[])))
except:
    print(0)
" 2>/dev/null || echo "0")
else
    SERVICES_DOWN=$((SERVICES_DOWN + 1))
fi

# ─── WireGuard VPN ─────────────────────────────────────────
WG_STATUS="not configured"
if command -v wg &>/dev/null; then
    WG_IFACE=$(sudo wg show 2>/dev/null | head -1 | awk '{print $2}' 2>/dev/null)
    if [ -n "$WG_IFACE" ]; then
        WG_STATUS="active ($WG_IFACE)"
    else
        WG_STATUS="inactive"
    fi
fi

# ─── System vitals ─────────────────────────────────────────
DISK_FREE=$(python3 -c "
import shutil
t,u,f = shutil.disk_usage('/')
print(f'{f/(1024**3):.0f}')
" 2>/dev/null || echo "?")

CPU_LOAD=$(python3 -c "
import subprocess
out=subprocess.check_output('uptime',shell=True).decode()
load=out.split('load averages:')[-1].strip().split(',')[0].strip()
print(load)
" 2>/dev/null || echo "?")

MEM_PRESSURE=$(python3 -c "
import subprocess,re
out=subprocess.check_output(['memory_pressure'],timeout=5).decode()
pct=re.search(r'System-wide memory free percentage:\s+(\d+)',out)
print(f'{pct.group(1)}%' if pct else '?')
" 2>/dev/null || echo "?")

# ─── Days to deadline ──────────────────────────────────────
DAYS_LEFT=$(python3 -c "from datetime import date; d=(date(2026,4,17)-date.today()).days; print(d)" 2>/dev/null || echo "?")

# ─── Build briefing ────────────────────────────────────────
BRIEF="Good morning Rob. Today is $DATE."

# Deadline
if [ "$DAYS_LEFT" != "?" ] && [ "$DAYS_LEFT" -gt 0 ] 2>/dev/null; then
    BRIEF="$BRIEF $DAYS_LEFT days to April 17."
elif [ "$DAYS_LEFT" = "0" ] 2>/dev/null; then
    BRIEF="$BRIEF Today is April 17. Deadline day."
fi

# Core services
BRIEF="$BRIEF GABRIEL is $GABRIEL_STATUS"
[ "$UPTIME" != "?" ] && BRIEF="$BRIEF, uptime $UPTIME hours"
BRIEF="$BRIEF. HEAVEN $HEAVEN_STATUS"
[ "$HEAVEN_VER" != "?" ] && [ "$HEAVEN_STATUS" = "online" ] && BRIEF="$BRIEF, version $HEAVEN_VER, $LEDGER ledger events"
BRIEF="$BRIEF. Anthropic API: $ANTHROPIC_STATUS."

# Infrastructure
BRIEF="$BRIEF n8n orchestrator: $N8N_STATUS."
BRIEF="$BRIEF Docker: $DOCKER_STATUS."
BRIEF="$BRIEF Ollama: $OLLAMA_STATUS"
[ "$OLLAMA_MODELS" != "0" ] && BRIEF="$BRIEF with $OLLAMA_MODELS models loaded"
BRIEF="$BRIEF. WireGuard: $WG_STATUS."

# System
BRIEF="$BRIEF System: ${DISK_FREE}G disk free, CPU load $CPU_LOAD, memory free $MEM_PRESSURE."

# Summary
if [ "$SERVICES_DOWN" -eq 0 ]; then
    BRIEF="$BRIEF All systems operational. Empire is green. What are we building today?"
elif [ "$SERVICES_DOWN" -eq 1 ]; then
    BRIEF="$BRIEF One service needs attention. Check the logs."
else
    BRIEF="$BRIEF $SERVICES_DOWN services are down. Recommend running diagnostics."
fi

echo "[$TS] BRIEF: $BRIEF" >> "$LOG"

# ─── Speak via GABRIEL ─────────────────────────────────────
GABRIEL_RESULT=$(curl -s --max-time 10 -X POST "$GABRIEL/speak" \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"$BRIEF\"}" 2>/dev/null)

if echo "$GABRIEL_RESULT" | grep -q "ok\|success\|spoken" 2>/dev/null; then
    echo "[$TS] ✅ Delivered via GABRIEL" >> "$LOG"
else
    /usr/bin/say -v Daniel "$BRIEF" &
    echo "[$TS] ⚠ GABRIEL unavailable — used macOS say" >> "$LOG"
fi

# ─── Store in GABRIEL memcell ──────────────────────────────
curl -s --max-time 5 -X POST "$GABRIEL/memcell/briefing:morning:$(date +%Y%m%d)" \
    -H "Content-Type: application/json" \
    -d "{\"value\": {
        \"brief\": \"$BRIEF\",
        \"gabriel\": \"$GABRIEL_STATUS\",
        \"heaven\": \"$HEAVEN_STATUS\",
        \"anthropic\": \"$ANTHROPIC_STATUS\",
        \"n8n\": \"$N8N_STATUS\",
        \"docker\": \"$DOCKER_STATUS\",
        \"ollama\": \"$OLLAMA_STATUS\",
        \"ollama_models\": \"$OLLAMA_MODELS\",
        \"wireguard\": \"$WG_STATUS\",
        \"disk_free_gb\": \"$DISK_FREE\",
        \"cpu_load\": \"$CPU_LOAD\",
        \"mem_free\": \"$MEM_PRESSURE\",
        \"services_down\": $SERVICES_DOWN,
        \"ts\": \"$TS\"
    }}" \
    >> /dev/null 2>&1

# ─── Notify n8n (if online) for audit trail ────────────────
if [ "$N8N_STATUS" = "online" ]; then
    curl -s --max-time 5 -X POST "$N8N/webhook/morning-briefing" \
        -H "Content-Type: application/json" \
        -d "{\"event\": \"morning_briefing\", \"operator\": \"RSP_001\", \"services_down\": $SERVICES_DOWN, \"ts\": \"$TS\"}" \
        >> /dev/null 2>&1
    echo "[$TS] 📡 n8n notified" >> "$LOG"
fi

echo "[$TS] ── END BRIEFING ──" >> "$LOG"
exit 0
