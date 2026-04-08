#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# governance_boot.sh
# Start governance stack: n8n + validate all endpoints
# RSP_001 | NOIZY Empire | 2026
# ═══════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
GOVERNANCE_DIR="$SCRIPT_DIR/../governance"
GABRIEL="http://localhost:7777"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${CYAN}═══ GOVERNANCE BOOT SEQUENCE ═══${NC}"
echo ""

# ─── Step 1: Check Docker ──────────────────────────────────
echo -e "${YELLOW}[1/4] Checking Docker...${NC}"
if ! command -v docker >/dev/null 2>&1; then
    echo -e "  ${RED}❌ Docker not found. Install Docker Desktop first.${NC}"
    exit 1
fi

DOCKER_RUNNING=$(docker info >/dev/null 2>&1 && echo "yes" || echo "no")
if [ "$DOCKER_RUNNING" = "no" ]; then
    echo -e "  ${RED}❌ Docker daemon not running. Start Docker Desktop.${NC}"
    exit 1
fi
echo -e "  ${GREEN}✅ Docker ready${NC}"

# ─── Step 2: Start n8n ─────────────────────────────────────
echo -e "${YELLOW}[2/4] Starting n8n...${NC}"
cd "$GOVERNANCE_DIR" || { echo "governance/ dir not found"; exit 1; }

# Check if already running
N8N_RUNNING=$(docker ps --filter "name=governance-n8n" --format "{{.Status}}" 2>/dev/null | head -1)
if [ -n "$N8N_RUNNING" ]; then
    echo -e "  ${GREEN}✅ n8n already running ($N8N_RUNNING)${NC}"
else
    docker compose up -d 2>/dev/null
    echo -e "  ⏳ Waiting for n8n to start..."
    sleep 5

    # Verify
    N8N_CODE=$(curl -s --max-time 5 -o /dev/null -w "%{http_code}" "http://localhost:5678" 2>/dev/null)
    if [ "$N8N_CODE" = "200" ] || [ "$N8N_CODE" = "401" ] || [ "$N8N_CODE" = "302" ]; then
        echo -e "  ${GREEN}✅ n8n started (HTTP $N8N_CODE)${NC}"
    else
        echo -e "  ${YELLOW}⚠️ n8n may still be starting (HTTP $N8N_CODE)${NC}"
    fi
fi

# ─── Step 3: Check GABRIEL ─────────────────────────────────
echo -e "${YELLOW}[3/4] Checking GABRIEL...${NC}"
GABRIEL_HEALTH=$(curl -s --max-time 5 "$GABRIEL/health" 2>/dev/null)
if [ -n "$GABRIEL_HEALTH" ]; then
    echo -e "  ${GREEN}✅ GABRIEL online${NC}"
else
    echo -e "  ${YELLOW}⚠️ GABRIEL offline (alerts will use macOS say fallback)${NC}"
fi

# ─── Step 4: Validate endpoints ────────────────────────────
echo -e "${YELLOW}[4/4] Validating endpoints...${NC}"

# n8n webhook test (just check it accepts connections)
N8N_WEBHOOK=$(curl -s --max-time 5 -o /dev/null -w "%{http_code}" "http://localhost:5678/webhook/ai-commit-validate" 2>/dev/null)
echo -e "  n8n webhook: HTTP $N8N_WEBHOOK (expected 404 until workflow activated)"

# HEAVEN
HEAVEN_CODE=$(curl -s --max-time 10 -o /dev/null -w "%{http_code}" "https://heaven.noizylab.workers.dev/health" 2>/dev/null)
if [ "$HEAVEN_CODE" = "200" ]; then
    echo -e "  ${GREEN}✅ HEAVEN reachable${NC}"
else
    echo -e "  ${YELLOW}⚠️ HEAVEN HTTP $HEAVEN_CODE${NC}"
fi

echo ""
echo -e "${CYAN}═══ GOVERNANCE BOOT COMPLETE ═══${NC}"
echo ""
echo -e "Next steps:"
echo -e "  1. Open ${CYAN}http://localhost:5678${NC} in browser"
echo -e "  2. Import workflow: ${CYAN}governance/n8n-workflows/ai-commit-validation.json${NC}"
echo -e "  3. Import Postman collection: ${CYAN}governance/postman/governance-webhooks.postman_collection.json${NC}"
echo -e "  4. Activate the workflow and test with Postman"
echo ""
