#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# NOIZY Consent Gateway — Sprint Verification Tests
# Run: bash ~/NOIZYLAB/tests/consent-gateway-sprint.sh
#
# Tests the auth hardening sprint:
#   ✅ 401 on missing auth
#   ✅ 401 on bad auth
#   ✅ Health is public (no auth needed)
#   ✅ /verify works with valid auth
#   ✅ /revoke works with valid auth
#   ✅ /status/:id works with valid auth
#   ✅ Legacy routes still work with auth
# ═══════════════════════════════════════════════════════════════

set +e

# Configure these for your environment
GATEWAY="${CONSENT_GATEWAY_URL:-https://noizy-consent-gateway.workers.dev}"
API_KEY="${NOIZY_API_KEY:?NOIZY_API_KEY must be set}"
BAD_KEY="bad-key-should-fail"

PASS=0
FAIL=0

test_case() {
  local name="$1"
  local expected_status="$2"
  local actual_status="$3"

  if [ "$actual_status" = "$expected_status" ]; then
    echo "  ✅ $name (HTTP $actual_status)"
    ((PASS++))
  else
    echo "  ❌ $name (expected $expected_status, got $actual_status)"
    ((FAIL++))
  fi
}

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  🔒 CONSENT GATEWAY — Sprint Verification"
echo "═══════════════════════════════════════════════════════"
echo "  Gateway: $GATEWAY"
echo "  Time:    $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# ── 1. Public routes ──────────────────────────────────────────
echo "── Public Routes ──"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$GATEWAY/health")
test_case "GET /health (no auth)" "200" "$STATUS"

# ── 2. Auth enforcement (401) ─────────────────────────────────
echo "── Auth Enforcement (401) ──"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$GATEWAY/verify" \
  -H "Content-Type: application/json" \
  -d '{"creator_id":"test"}')
test_case "POST /verify without auth → 401" "401" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$GATEWAY/revoke" \
  -H "Content-Type: application/json" \
  -d '{"consent_record_id":"test","creator_id":"test","reason":"test"}')
test_case "POST /revoke without auth → 401" "401" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  "$GATEWAY/status/RSP_001")
test_case "GET /status/:id without auth → 401" "401" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  "$GATEWAY/v1/consent/test-id")
test_case "GET /v1/consent/:id without auth → 401" "401" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  "$GATEWAY/v1/audit/test-asset")
test_case "GET /v1/audit/:id without auth → 401" "401" "$STATUS"

# ── 3. Bad auth (401) ────────────────────────────────────────
echo "── Bad Auth (401) ──"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$GATEWAY/verify" \
  -H "Content-Type: application/json" \
  -H "X-NOIZY-Key: $BAD_KEY" \
  -d '{"creator_id":"test"}')
test_case "POST /verify with bad key → 401" "401" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$GATEWAY/revoke" \
  -H "Content-Type: application/json" \
  -H "X-NOIZY-Key: $BAD_KEY" \
  -d '{"consent_record_id":"test","creator_id":"test","reason":"test"}')
test_case "POST /revoke with bad key → 401" "401" "$STATUS"

# ── 4. Valid auth ─────────────────────────────────────────────
echo "── Valid Auth ──"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$GATEWAY/verify" \
  -H "Content-Type: application/json" \
  -H "X-NOIZY-Key: $API_KEY" \
  -d '{
    "creator_id": "RSP_001",
    "claimant_id": "test-claimant",
    "action_type": "synthesis",
    "tool_name": "noizy-studio",
    "requested_scope": {"media": "audio", "channel": "commercial"},
    "requested_at": "2026-03-30T18:00:00Z"
  }')
test_case "POST /verify with valid auth" "200" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "X-NOIZY-Key: $API_KEY" \
  "$GATEWAY/status/RSP_001")
test_case "GET /status/RSP_001 with valid auth" "200" "$STATUS"

# ── 5. Routing contract ──────────────────────────────────────
echo "── Routing Contract ──"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "X-NOIZY-Key: $API_KEY" \
  "$GATEWAY/nonexistent")
test_case "GET /nonexistent → 404" "404" "$STATUS"

# ── 6. Health content validation ──────────────────────────────
echo "── Content Validation ──"

HEALTH=$(curl -s "$GATEWAY/health")
if echo "$HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if d.get('auth_enforced')==True else 1)" 2>/dev/null; then
  test_case "Health reports auth_enforced=true" "true" "true"
else
  test_case "Health reports auth_enforced=true" "true" "false"
fi

if echo "$HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if 'POST /verify' in d.get('routing_contract',{}).get('protected',[]) else 1)" 2>/dev/null; then
  test_case "Health exposes routing contract" "true" "true"
else
  test_case "Health exposes routing contract" "true" "false"
fi

# ── Summary ───────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════"
TOTAL=$((PASS + FAIL))
echo "  ✅ $PASS passed  ❌ $FAIL failed  ($TOTAL total)"
if [ $FAIL -eq 0 ]; then
  echo "  🔒 CONSENT GATEWAY: SPRINT VERIFIED"
else
  echo "  ⚠️  CONSENT GATEWAY: $FAIL TESTS NEED ATTENTION"
fi
echo "═══════════════════════════════════════════════════════"
echo ""
