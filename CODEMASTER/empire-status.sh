#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# empire-status.sh
# Single-command health check for all NOIZY Empire services
# RSP_001 | NOIZY Empire | 2026
# ═══════════════════════════════════════════════════════════════

GABRIEL="http://localhost:7777"
HEAVEN="https://heaven.noizylab.workers.dev"
N8N="http://localhost:5678"
ANTHROPIC="https://status.claude.com/api/v2/status.json"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

TS=$(date '+%Y-%m-%d %H:%M:%S')

echo ""
echo -e "${BOLD}═══════════════════════════════════════════${NC}"
echo -e "${BOLD}  🏛️  NOIZY EMPIRE — STATUS REPORT${NC}"
echo -e "${BOLD}  $TS${NC}"
echo -e "${BOLD}═══════════════════════════════════════════${NC}"
echo ""

TOTAL=0
UP=0

# ── Helper ──
check_service() {
    local name="$1"
    local url="$2"
    local detail_cmd="$3"

    TOTAL=$((TOTAL + 1))
    RESPONSE=$(curl -s --max-time 5 "$url" 2>/dev/null)

    if [ -n "$RESPONSE" ]; then
        UP=$((UP + 1))
        DETAIL=""
        if [ -n "$detail_cmd" ]; then
            DETAIL=$(echo "$RESPONSE" | python3 -c "$detail_cmd" 2>/dev/null)
        fi
        echo -e "  ${GREEN}✅ $name${NC}  ${CYAN}$DETAIL${NC}"
    else
        echo -e "  ${RED}❌ $name${NC}  ${YELLOW}unreachable${NC}"
    fi
}

# ── 1. GABRIEL ──
echo -e "${BOLD}Local Services${NC}"
check_service "GABRIEL  (localhost:7777)" "$GABRIEL/health" \
    "import sys,json; d=json.load(sys.stdin); print(f'uptime: {d.get(\"uptime\",0)/3600:.1f}h')"

# ── 2. n8n ──
check_service "n8n      (localhost:5678)" "$N8N" ""

# ── 3. System vitals ──
TOTAL=$((TOTAL + 1))
LOAD=$(uptime | awk -F'load averages:' '{print $2}' | awk '{print $1}' | tr -d ',')
DISK_PCT=$(df -h / | tail -1 | awk '{print $5}')
DISK_FREE=$(df -h / | tail -1 | awk '{print $4}')
SWAP=$(sysctl vm.swapusage 2>/dev/null | awk -F'used = ' '{print $2}' | awk '{print $1}')
UP=$((UP + 1))
echo -e "  ${GREEN}✅ System${NC}   ${CYAN}load: $LOAD | disk: $DISK_PCT used ($DISK_FREE free) | swap: ${SWAP:-0}${NC}"

echo ""
echo -e "${BOLD}Cloud Services${NC}"

# ── 4. HEAVEN ──
check_service "HEAVEN   (workers.dev)" "$HEAVEN/health" \
    "import sys,json; d=json.load(sys.stdin); print(f'v{d.get(\"version\",\"?\")} | {d.get(\"ledger_events\",\"?\")} events')"

# ── 5. Anthropic API ──
TOTAL=$((TOTAL + 1))
ANTH_RESP=$(curl -sL --max-time 5 "$ANTHROPIC" 2>/dev/null)
if [ -n "$ANTH_RESP" ]; then
    ANTH_IND=$(echo "$ANTH_RESP" | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin); ind=d['status']['indicator']; desc=d['status']['description']
    print(f'{ind} — {desc}')
except:
    print('parse error')
" 2>/dev/null)
    if echo "$ANTH_IND" | grep -q "^none" 2>/dev/null; then
        UP=$((UP + 1))
        echo -e "  ${GREEN}✅ Anthropic${NC} ${CYAN}$ANTH_IND${NC}"
    else
        echo -e "  ${YELLOW}⚠️  Anthropic${NC} ${YELLOW}$ANTH_IND${NC}"
    fi
else
    echo -e "  ${RED}❌ Anthropic${NC} ${YELLOW}unreachable${NC}"
fi

# ── 6. Git status ──
echo ""
echo -e "${BOLD}Repository${NC}"
TOTAL=$((TOTAL + 1))
BRANCH=$(git -C "$HOME/NOIZYLAB/CODEMASTER" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "?")
DIRTY=$(git -C "$HOME/NOIZYLAB/CODEMASTER" status --porcelain 2>/dev/null | wc -l | tr -d ' ')
LAST_COMMIT=$(git -C "$HOME/NOIZYLAB/CODEMASTER" log --oneline -1 2>/dev/null || echo "no commits")
UP=$((UP + 1))
if [ "$DIRTY" = "0" ]; then
    echo -e "  ${GREEN}✅ Git${NC}      ${CYAN}$BRANCH (clean) | $LAST_COMMIT${NC}"
else
    echo -e "  ${YELLOW}⚠️  Git${NC}      ${CYAN}$BRANCH ($DIRTY uncommitted) | $LAST_COMMIT${NC}"
fi

# ── Summary ──
echo ""
echo -e "${BOLD}═══════════════════════════════════════════${NC}"
if [ "$UP" -eq "$TOTAL" ]; then
    echo -e "  ${GREEN}${BOLD}ALL SYSTEMS OPERATIONAL ($UP/$TOTAL)${NC}"
else
    echo -e "  ${YELLOW}${BOLD}$UP/$TOTAL SERVICES UP${NC}"
fi
echo -e "${BOLD}═══════════════════════════════════════════${NC}"
echo ""
