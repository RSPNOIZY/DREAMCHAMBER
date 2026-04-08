#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# turbo_empire_status.sh
# Full NOIZY Empire health check — one command, full picture
# RSP_001 | NOIZY Empire | 2026
# ═══════════════════════════════════════════════════════════════

GABRIEL="http://localhost:7777"
HEAVEN="https://heaven.noizylab.workers.dev"
N8N="http://localhost:5678"
ANTHROPIC="https://status.anthropic.com/api/v2/status.json"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'
CHECK="✅"
FAIL="❌"
WARN="⚠️"

TS=$(date '+%Y-%m-%d %H:%M:%S')
SCORE=0
TOTAL=0

check_service() {
    local name="$1"
    local url="$2"
    local timeout="${3:-5}"
    TOTAL=$((TOTAL + 1))

    RESULT=$(curl -s --max-time "$timeout" "$url" 2>/dev/null)
    if [ -n "$RESULT" ]; then
        SCORE=$((SCORE + 1))
        echo -e "  ${CHECK} ${GREEN}${name}${NC} — online"
        echo "$RESULT"
    else
        echo -e "  ${FAIL} ${RED}${name}${NC} — unreachable"
        echo ""
    fi
}

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  🏛️  NOIZY EMPIRE STATUS — $TS${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo ""

# ─── GABRIEL ───────────────────────────────────────────────
echo -e "${YELLOW}[GABRIEL]${NC} localhost:7777"
GABRIEL_RAW=$(check_service "GABRIEL" "$GABRIEL/health")
echo "$GABRIEL_RAW" | head -1
GABRIEL_JSON=$(echo "$GABRIEL_RAW" | tail -1)
if [ -n "$GABRIEL_JSON" ] && [ "$GABRIEL_JSON" != "" ]; then
    UPTIME=$(echo "$GABRIEL_JSON" | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin); h=d.get('uptime',0)/3600; print(f'{h:.1f}h')
except:
    print('?')
" 2>/dev/null)
    echo -e "     Uptime: $UPTIME"
fi
echo ""

# ─── HEAVEN ────────────────────────────────────────────────
echo -e "${YELLOW}[HEAVEN]${NC} heaven.noizylab.workers.dev"
HEAVEN_RAW=$(check_service "HEAVEN" "$HEAVEN/health" 10)
echo "$HEAVEN_RAW" | head -1
HEAVEN_JSON=$(echo "$HEAVEN_RAW" | tail -1)
if [ -n "$HEAVEN_JSON" ] && [ "$HEAVEN_JSON" != "" ]; then
    echo "$HEAVEN_JSON" | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    print(f'     Version: {d.get(\"version\",\"?\")}, Ledger: {d.get(\"ledger_events\",\"?\")} events')
except:
    pass
" 2>/dev/null
fi
echo ""

# ─── n8n ───────────────────────────────────────────────────
echo -e "${YELLOW}[n8n]${NC} localhost:5678"
TOTAL=$((TOTAL + 1))
N8N_RESULT=$(curl -s --max-time 5 -o /dev/null -w "%{http_code}" "$N8N" 2>/dev/null)
if [ "$N8N_RESULT" = "200" ] || [ "$N8N_RESULT" = "401" ] || [ "$N8N_RESULT" = "302" ]; then
    SCORE=$((SCORE + 1))
    echo -e "  ${CHECK} ${GREEN}n8n${NC} — online (HTTP $N8N_RESULT)"
else
    # Check Docker
    if command -v docker >/dev/null 2>&1; then
        N8N_CONTAINER=$(docker ps --filter "ancestor=n8nio/n8n" --format "{{.Status}}" 2>/dev/null | head -1)
        if [ -n "$N8N_CONTAINER" ]; then
            SCORE=$((SCORE + 1))
            echo -e "  ${CHECK} ${GREEN}n8n${NC} — container running ($N8N_CONTAINER)"
        else
            echo -e "  ${FAIL} ${RED}n8n${NC} — not running"
            echo -e "     Start: ${CYAN}cd governance && docker compose up -d${NC}"
        fi
    else
        echo -e "  ${FAIL} ${RED}n8n${NC} — not running (Docker not found)"
    fi
fi
echo ""

# ─── Anthropic API ─────────────────────────────────────────
echo -e "${YELLOW}[ANTHROPIC]${NC} status.anthropic.com"
TOTAL=$((TOTAL + 1))
ANTHRO_RAW=$(curl -s --max-time 10 "$ANTHROPIC" 2>/dev/null)
if [ -n "$ANTHRO_RAW" ]; then
    ANTHRO_STATUS=$(echo "$ANTHRO_RAW" | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    ind=d.get('status',{}).get('indicator','unknown')
    desc=d.get('status',{}).get('description','?')
    print(f'{ind}|{desc}')
except:
    print('error|Parse failed')
" 2>/dev/null)
    ANTHRO_IND=$(echo "$ANTHRO_STATUS" | cut -d'|' -f1)
    ANTHRO_DESC=$(echo "$ANTHRO_STATUS" | cut -d'|' -f2)
    if [ "$ANTHRO_IND" = "none" ]; then
        SCORE=$((SCORE + 1))
        echo -e "  ${CHECK} ${GREEN}Anthropic API${NC} — $ANTHRO_DESC"
    else
        echo -e "  ${WARN} ${YELLOW}Anthropic API${NC} — $ANTHRO_IND: $ANTHRO_DESC"
    fi
else
    echo -e "  ${FAIL} ${RED}Anthropic API${NC} — unreachable"
fi
echo ""

# ─── System Vitals ─────────────────────────────────────────
echo -e "${YELLOW}[SYSTEM]${NC} Mac M2 Ultra"
python3 -c "
import shutil, subprocess, os

# Disk
t,u,f = shutil.disk_usage('/')
pct = (u/t)*100
gb_free = f/(1024**3)
icon = '✅' if pct < 80 else ('⚠️' if pct < 90 else '❌')
print(f'  {icon} Disk: {pct:.1f}% used ({gb_free:.0f} GB free)')

# CPU
out = subprocess.check_output('uptime', shell=True).decode()
load = out.split('load averages:')[-1].strip()
loads = [float(x.strip()) for x in load.split(',')]
icon = '✅' if loads[0] < 8 else ('⚠️' if loads[0] < 16 else '❌')
print(f'  {icon} CPU Load: {load}')

# Swap
out = subprocess.check_output('sysctl vm.swapusage', shell=True).decode().strip()
swap = out.replace('vm.swapusage: ', '')
print(f'  💾 Swap: {swap}')
" 2>/dev/null
echo ""

# ─── Score ─────────────────────────────────────────────────
echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
if [ $SCORE -eq $TOTAL ]; then
    echo -e "  ${CHECK} ${GREEN}EMPIRE STATUS: $SCORE/$TOTAL — ALL SYSTEMS OPERATIONAL${NC}"
elif [ $SCORE -ge $((TOTAL - 1)) ]; then
    echo -e "  ${WARN} ${YELLOW}EMPIRE STATUS: $SCORE/$TOTAL — MOSTLY OPERATIONAL${NC}"
else
    echo -e "  ${FAIL} ${RED}EMPIRE STATUS: $SCORE/$TOTAL — DEGRADED${NC}"
fi
echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo ""
