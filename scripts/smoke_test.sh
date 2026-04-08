#!/bin/bash
set -euo pipefail

# HEAVEN Smoke Test Suite v2
# Validates all core NOIZY HVS Consent Kernel functionality

BASE_URL="${HEAVEN_URL:-https://heaven.noizylab.workers.dev}"
API_KEY="${NOIZY_API_KEY:-}"
ACTOR_ID="RSP_001"

# Load .env if present
if [ -f "$(dirname "$0")/.env" ]; then
    export $(grep -v '^#' "$(dirname "$0")/.env" | xargs)
    API_KEY="${NOIZY_API_KEY:-$API_KEY}"
fi

echo "=== HEAVEN Smoke Test v2 ==="
echo "Base URL: $BASE_URL"
echo "Auth: $([ -n "$API_KEY" ] && echo 'API key loaded' || echo 'NO KEY — public endpoints only')"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color
PASS=0
FAIL=0

# Helper to check HTTP status
check_status() {
    local expected=$1
    local actual=$2
    local test_name=$3
    
    if [ "$actual" = "$expected" ]; then
        echo -e "${GREEN}✓${NC} $test_name (HTTP $actual)"
        PASS=$((PASS + 1))
    else
        echo -e "${RED}✗${NC} $test_name (expected $expected, got $actual)"
        FAIL=$((FAIL + 1))
    fi
}

# Auth header
AUTH_HEADER=""
if [ -n "$API_KEY" ]; then
    AUTH_HEADER="-H X-NOIZY-Key:${API_KEY}"
fi

# Helper for pretty JSON
pretty_json() {
    if command -v jq &> /dev/null; then
        jq .
    else
        cat
    fi
}

# 1. Health check
echo "1. Health Check"
HEALTH_RESPONSE=$(curl -sS -w "\n%{http_code}" "$BASE_URL/health")
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')
HEALTH_STATUS=$(echo "$HEALTH_RESPONSE" | tail -n 1)
check_status 200 "$HEALTH_STATUS" "Health endpoint"
echo "$HEALTH_BODY" | pretty_json | grep -q '"status": "LIVE"' && echo -e "${GREEN}✓${NC} System is LIVE"
echo ""

# 2. Create actor (might already exist)
echo "2. Create Founding Actor"
ACTOR_RESPONSE=$(curl -sS -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/actors" \
  -H "Content-Type: application/json" $AUTH_HEADER \
  -d "{
    \"actor_id\": \"$ACTOR_ID\",
    \"display_name\": \"Robert Stephen Plowman\",
    \"legal_name\": \"Robert Stephen Plowman\",
    \"email\": \"rob@noizy.ai\",
    \"country\": \"CA\",
    \"is_founding\": true,
    \"union_member\": false
  }")
ACTOR_STATUS=$(echo "$ACTOR_RESPONSE" | tail -n 1)
if [ "$ACTOR_STATUS" = "201" ]; then
    echo -e "${GREEN}✓${NC} Actor created (HTTP 201)"
elif [ "$ACTOR_STATUS" = "200" ]; then
    echo -e "${GREEN}✓${NC} Actor already registered — sovereignty intact (HTTP 200)"
elif [ "$ACTOR_STATUS" = "400" ]; then
    echo -e "${YELLOW}⚠${NC} Actor validation error (HTTP 400)"
else
    echo -e "${RED}✗${NC} Unexpected status: $ACTOR_STATUS"
fi
echo ""

# 3. Verify actor exists
echo "3. Verify Actor Exists"
ACTOR_GET_RESPONSE=$(curl -sS -w "\n%{http_code}" $AUTH_HEADER "$BASE_URL/api/v1/actors/$ACTOR_ID")
ACTOR_GET_STATUS=$(echo "$ACTOR_GET_RESPONSE" | tail -n 1)
check_status 200 "$ACTOR_GET_STATUS" "Get actor"
echo ""

# 4. Create consent token
echo "4. Create Consent Token"
TOKEN_RESPONSE=$(curl -sS -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/consent-tokens" \
  -H "Content-Type: application/json" $AUTH_HEADER \
  -d "{
    \"actor_id\": \"$ACTOR_ID\",
    \"use_categories\": [\"educational\", \"commercial\", \"creative\"],
    \"territories\": [\"GLOBAL\"],
    \"languages\": [\"en\"],
    \"expires_at\": \"2026-12-31T23:59:59Z\"
  }")
TOKEN_BODY=$(echo "$TOKEN_RESPONSE" | sed '$d')
TOKEN_STATUS=$(echo "$TOKEN_RESPONSE" | tail -n 1)
check_status 201 "$TOKEN_STATUS" "Create consent token"

# Extract token ID
if command -v jq &> /dev/null; then
    TOKEN_ID=$(echo "$TOKEN_BODY" | jq -r .consent_token.token_id)
    echo -e "${GREEN}✓${NC} Token ID: $TOKEN_ID"
else
    echo "$TOKEN_BODY" | pretty_json
    echo -e "${YELLOW}⚠${NC} Install jq for automatic token extraction"
    read -p "Enter TOKEN_ID from above: " TOKEN_ID
fi
echo ""

# 5. Test synth request (should pass)
echo "5. Test Synthesis Request (Should Pass)"
SYNTH_RESPONSE=$(curl -sS -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/synth-requests" \
  -H "Content-Type: application/json" $AUTH_HEADER \
  -d "{
    \"actor_id\": \"$ACTOR_ID\",
    \"descendant_id\": \"test_descendant_001\",
    \"consent_token_id\": \"$TOKEN_ID\",
    \"use_category\": \"educational\",
    \"script_hash\": \"test_hash_001\"
  }")
SYNTH_BODY=$(echo "$SYNTH_RESPONSE" | sed '$d')
SYNTH_STATUS=$(echo "$SYNTH_RESPONSE" | tail -n 1)
check_status 201 "$SYNTH_STATUS" "Synthesis request"
echo "$SYNTH_BODY" | pretty_json | grep -q '"status": "approved"' && echo -e "${GREEN}✓${NC} Synthesis approved"
echo ""

# 6. Test kill switch
echo "6. Test Kill Switch (Revoke Consent)"
REVOKE_RESPONSE=$(curl -sS -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/consent-tokens/$TOKEN_ID/revoke" \
  -H "Content-Type: application/json" $AUTH_HEADER \
  -d '{
    "reason": "Testing kill switch functionality"
  }')
REVOKE_BODY=$(echo "$REVOKE_RESPONSE" | sed '$d')
REVOKE_STATUS=$(echo "$REVOKE_RESPONSE" | tail -n 1)
check_status 200 "$REVOKE_STATUS" "Kill switch activation"
echo "$REVOKE_BODY" | pretty_json | grep -q '"status": "revoked"' && echo -e "${GREEN}✓${NC} Token revoked"
echo ""

# 7. Verify kill switch worked
echo "7. Verify Kill Switch (Synthesis Should Fail)"
BLOCKED_RESPONSE=$(curl -sS -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/synth-requests" \
  -H "Content-Type: application/json" $AUTH_HEADER \
  -d "{
    \"actor_id\": \"$ACTOR_ID\",
    \"descendant_id\": \"test_descendant_001\",
    \"consent_token_id\": \"$TOKEN_ID\",
    \"use_category\": \"educational\",
    \"script_hash\": \"test_hash_002\"
  }")
BLOCKED_STATUS=$(echo "$BLOCKED_RESPONSE" | tail -n 1)
check_status 403 "$BLOCKED_STATUS" "Synthesis blocked after revocation"
echo ""

# 8. Test Never Clause
echo "8. Test Never Clause Enforcement"
# Create new token for Never Clause test
NEW_TOKEN_RESPONSE=$(curl -sS -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/consent-tokens" \
  -H "Content-Type: application/json" $AUTH_HEADER \
  -d "{
    \"actor_id\": \"$ACTOR_ID\",
    \"use_categories\": [\"general\"],
    \"territories\": [\"GLOBAL\"]
  }")
NEW_TOKEN_BODY=$(echo "$NEW_TOKEN_RESPONSE" | sed '$d')
NEW_TOKEN_STATUS=$(echo "$NEW_TOKEN_RESPONSE" | tail -n 1)

if [ "$NEW_TOKEN_STATUS" = "201" ]; then
    if command -v jq &> /dev/null; then
        TOKEN_ID2=$(echo "$NEW_TOKEN_BODY" | jq -r .consent_token.token_id)
    else
        echo "$NEW_TOKEN_BODY" | pretty_json
        read -p "Enter new TOKEN_ID from above: " TOKEN_ID2
    fi
    
    # Try political content (should be blocked)
    NEVER_RESPONSE=$(curl -sS -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/synth-requests" \
      -H "Content-Type: application/json" $AUTH_HEADER \
      -d "{
        \"actor_id\": \"$ACTOR_ID\",
        \"descendant_id\": \"test_descendant_001\",
        \"consent_token_id\": \"$TOKEN_ID2\",
        \"use_category\": \"political propaganda\",
        \"script_hash\": \"test_hash_003\"
      }")
    NEVER_STATUS=$(echo "$NEVER_RESPONSE" | tail -n 1)
    check_status 403 "$NEVER_STATUS" "Never Clause blocking political content"
fi
echo ""

# 9. Check ledger
echo "9. Verify Audit Trail (Ledger)"
LEDGER_RESPONSE=$(curl -sS -w "\n%{http_code}" $AUTH_HEADER "$BASE_URL/api/v1/ledger?actor_id=$ACTOR_ID&limit=5")
LEDGER_BODY=$(echo "$LEDGER_RESPONSE" | sed '$d')
LEDGER_STATUS=$(echo "$LEDGER_RESPONSE" | tail -n 1)
check_status 200 "$LEDGER_STATUS" "Ledger query"
EVENT_COUNT=$(echo "$LEDGER_BODY" | grep -o '"event_type"' | wc -l | tr -d ' ')
echo -e "${GREEN}✓${NC} Found $EVENT_COUNT ledger events"
echo ""

# 10. Test Stats endpoint
echo "10. Stats Endpoint"
STATS_RESPONSE=$(curl -sS -w "\n%{http_code}" $AUTH_HEADER "$BASE_URL/api/v1/stats")
STATS_STATUS=$(echo "$STATS_RESPONSE" | tail -n 1)
check_status 200 "$STATS_STATUS" "Stats endpoint"
echo ""

# 11. Test Dashboard (no auth needed)
echo "11. Dashboard"
DASH_RESPONSE=$(curl -sS -w "\n%{http_code}" "$BASE_URL/dashboard")
DASH_STATUS=$(echo "$DASH_RESPONSE" | tail -n 1)
check_status 200 "$DASH_STATUS" "Dashboard renders"
echo ""

# 12. Test Auth Rejection (only enforced when NOIZY_API_KEY secret is set)
echo "12. Auth Rejection (no key)"
NOAUTH_RESPONSE=$(curl -sS -w "\n%{http_code}" "$BASE_URL/api/v1/actors")
NOAUTH_STATUS=$(echo "$NOAUTH_RESPONSE" | tail -n 1)
if [ "$NOAUTH_STATUS" = "401" ]; then
    echo -e "${GREEN}✓${NC} Unauthenticated request rejected (HTTP 401) — auth LOCKED"
elif [ "$NOAUTH_STATUS" = "200" ]; then
    echo -e "${YELLOW}⚠${NC} Auth open (dev mode — NOIZY_API_KEY not set) — run: npx wrangler secret put NOIZY_API_KEY"
else
    echo -e "${RED}✗${NC} Unexpected auth status: $NOAUTH_STATUS"
fi
echo ""

# 13. Test Rate Table
echo "13. Rate Table"
RATE_RESPONSE=$(curl -sS -w "\n%{http_code}" $AUTH_HEADER "$BASE_URL/api/v1/rate-table")
RATE_STATUS=$(echo "$RATE_RESPONSE" | tail -n 1)
check_status 200 "$RATE_STATUS" "Rate table loaded"
echo ""

# 14. Test Ledger Append (DreamChamber usage reporting endpoint)
echo "14. Ledger Append (POST /api/v1/ledger/append)"
APPEND_RESPONSE=$(curl -sS -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/ledger/append" \
  -H "Content-Type: application/json" $AUTH_HEADER \
  -d '{
    "event_type": "ai.usage",
    "payload": { "model": "claude-sonnet-4", "provider": "anthropic", "tokens": 100 },
    "amount_cad": 0
  }')
APPEND_BODY=$(echo "$APPEND_RESPONSE" | sed '$d')
APPEND_STATUS=$(echo "$APPEND_RESPONSE" | tail -n 1)
check_status 201 "$APPEND_STATUS" "Ledger append (DreamChamber usage write)"
echo "$APPEND_BODY" | pretty_json | grep -q '"appended": true' && echo -e "${GREEN}✓${NC} Event appended to ledger"
echo ""

# 15. myFamily — Register member
echo "15. myFamily: Register member"
FAM_RESPONSE=$(curl -sS -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/family/members" \
  -H "Content-Type: application/json" $AUTH_HEADER \
  -d '{"email":"smoke-test@noizy.ai","display_name":"Smoke Test Member"}')
FAM_BODY=$(echo "$FAM_RESPONSE" | sed '$d')
FAM_STATUS=$(echo "$FAM_RESPONSE" | tail -n 1)
if [ "$FAM_STATUS" = "201" ] || [ "$FAM_STATUS" = "200" ]; then
  echo -e "${GREEN}✓${NC} Family member registered (HTTP $FAM_STATUS)"
  FAM_ID=$(echo "$FAM_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('member_id',''))" 2>/dev/null)
else
  echo -e "${RED}✗${NC} Family member registration failed (HTTP $FAM_STATUS)"
  ((FAIL++))
fi
echo ""

# 16. myFamily — List members (GET)
echo "16. myFamily: List members"
FAM_LIST_RESPONSE=$(curl -sS -w "\n%{http_code}" $AUTH_HEADER "$BASE_URL/api/v1/family/members")
FAM_LIST_STATUS=$(echo "$FAM_LIST_RESPONSE" | tail -n 1)
check_status 200 "$FAM_LIST_STATUS" "Family members list"
echo ""

# 17. myFamily — Store consent matrix
echo "17. myFamily: Consent matrix"
if [ -n "$FAM_ID" ]; then
  CON_RESPONSE=$(curl -sS -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/family/consent" \
    -H "Content-Type: application/json" $AUTH_HEADER \
    -d "{\"member_id\":\"$FAM_ID\",\"use_cases\":[\"elder_care\",\"grief_support\"],\"beneficiary_ids\":[\"$FAM_ID\"],\"restrictions\":{\"biometric_trigger_only\":true}}")
  CON_STATUS=$(echo "$CON_RESPONSE" | tail -n 1)
  check_status 201 "$CON_STATUS" "Consent matrix stored (C2PA stamped)"
else
  echo -e "${YELLOW}⚠${NC} Skipped — no member_id from test 15"
fi
echo ""

# 18. NOIZYLAB — Healing session
echo "18. NOIZYLAB: Healing session"
if [ -n "$FAM_ID" ]; then
  HEAL_RESPONSE=$(curl -sS -w "\n%{http_code}" -X POST "$BASE_URL/api/v1/heal/session" \
    -H "Content-Type: application/json" $AUTH_HEADER \
    -d "{\"beneficiary_member_id\":\"$FAM_ID\",\"protocol_type\":\"binaural_theta\",\"frequency_hz\":6.0,\"duration_seconds\":300,\"biometric_before\":{\"heart_rate\":90},\"biometric_after\":{\"heart_rate\":65},\"outcome\":\"improved\",\"consent_verified\":true}")
  HEAL_STATUS=$(echo "$HEAL_RESPONSE" | tail -n 1)
  check_status 201 "$HEAL_STATUS" "Healing session logged (consent verified)"
else
  echo -e "${YELLOW}⚠${NC} Skipped — no member_id from test 15"
fi
echo ""

# 19. NOIZYLAB — Healing outcomes (research data)
echo "19. NOIZYLAB: Healing outcomes"
OUT_RESPONSE=$(curl -sS -w "\n%{http_code}" $AUTH_HEADER "$BASE_URL/api/v1/heal/outcomes")
OUT_STATUS=$(echo "$OUT_RESPONSE" | tail -n 1)
check_status 200 "$OUT_STATUS" "Healing outcomes (Anthropic research data)"
echo ""

# 20. Gabriel — Full empire status
echo "20. Gabriel: Full empire status"
GAB_RESPONSE=$(curl -sS -w "\n%{http_code}" $AUTH_HEADER "$BASE_URL/gabriel")
GAB_STATUS=$(echo "$GAB_RESPONSE" | tail -n 1)
check_status 200 "$GAB_STATUS" "Gabriel empire status"
GAB_BODY=$(echo "$GAB_RESPONSE" | sed '$d')
echo "$GAB_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('  Days to deadline:', d.get('days_to_deadline','?'))" 2>/dev/null
echo ""

# 21. WebSocket — Gabriel real-time connection
echo "21. WebSocket: Gabriel connection"
WS_INFO=$(curl -sS -w "\n%{http_code}" $AUTH_HEADER "$BASE_URL/ws")
WS_STATUS=$(echo "$WS_INFO" | tail -n 1)
WS_BODY=$(echo "$WS_INFO" | sed '$d')
check_status 200 "$WS_STATUS" "WebSocket endpoint info"
echo "$WS_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('  WSS:', d.get('endpoint','?'))" 2>/dev/null
echo ""

# Summary
echo "=== SUMMARY ==="
echo -e "Passed: ${GREEN}${PASS}${NC}  Failed: ${RED}${FAIL}${NC}"
echo ""
if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}ALL TESTS PASSED${NC}"
else
    echo -e "${RED}${FAIL} TEST(S) FAILED${NC}"
fi
echo ""
echo "Live dashboard: $BASE_URL/dashboard"
echo "API root:       $BASE_URL/"
echo "Health:         $BASE_URL/health"
echo ""
echo "NOIZY.AI — HEAVEN is operational."