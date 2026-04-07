#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# CONSENT GATEWAY DEPLOYMENT SCRIPT
# The court of record. Deploy with care.
# ═══════════════════════════════════════════════════════════════════════════
set -euo pipefail

cd "$(dirname "$0")"

echo "═══════════════════════════════════════════════════════════════════════════"
echo "  CONSENT GATEWAY DEPLOYMENT"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

# Step 1: Check authentication
echo "[1/6] Checking Cloudflare authentication..."
if ! npx wrangler whoami 2>&1 | grep -q "You are logged in"; then
    echo "ERROR: Not authenticated. Run: npx wrangler login"
    exit 1
fi
echo "✓ Authenticated"
echo ""

# Step 2: Create D1 database (if not exists)
echo "[2/6] Creating D1 database..."
DB_OUTPUT=$(npx wrangler d1 create consent_gateway 2>&1 || true)
if echo "$DB_OUTPUT" | grep -q "already exists"; then
    echo "✓ Database already exists"
    DB_ID=$(npx wrangler d1 list 2>&1 | grep consent_gateway | awk '{print $1}')
else
    DB_ID=$(echo "$DB_OUTPUT" | grep "database_id" | awk -F'"' '{print $2}')
    echo "✓ Database created: $DB_ID"
fi
echo ""

# Step 3: Create KV namespace (if not exists)
echo "[3/6] Creating KV namespace..."
KV_OUTPUT=$(npx wrangler kv namespace create RATE_LIMIT 2>&1 || true)
if echo "$KV_OUTPUT" | grep -q "already exists"; then
    echo "✓ KV namespace already exists"
    KV_ID=$(npx wrangler kv namespace list 2>&1 | grep -A1 "consent-gateway-RATE_LIMIT" | grep "id" | awk -F'"' '{print $2}')
else
    KV_ID=$(echo "$KV_OUTPUT" | grep '"id"' | awk -F'"' '{print $4}')
    echo "✓ KV namespace created: $KV_ID"
fi
echo ""

# Step 4: Update wrangler.toml with real IDs
echo "[4/6] Updating wrangler.toml..."
if [[ -n "${DB_ID:-}" ]]; then
    sed -i '' "s/{{CONSENT_GATEWAY_DB_ID}}/$DB_ID/" wrangler.toml 2>/dev/null || true
fi
if [[ -n "${KV_ID:-}" ]]; then
    sed -i '' "s/{{CONSENT_RATE_LIMIT_KV_ID}}/$KV_ID/" wrangler.toml 2>/dev/null || true
fi
echo "✓ Configuration updated"
echo ""

# Step 5: Initialize schema
echo "[5/6] Initializing database schema..."
npx wrangler d1 execute consent_gateway --remote --file=schema.sql
echo "✓ Schema initialized"
echo ""

# Step 6: Deploy worker
echo "[6/6] Deploying worker..."
npx wrangler deploy
echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "  DEPLOYMENT COMPLETE"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "IMPORTANT: Set the API key secret:"
echo "  npx wrangler secret put NOIZY_API_KEY"
echo ""
echo "Endpoints:"
echo "  POST https://consent.noizy.ai/consent/{voice_id}/check"
echo "  POST https://consent.noizy.ai/consent/{voice_id}/grant"
echo "  POST https://consent.noizy.ai/consent/{voice_id}/revoke"
echo "  GET  https://consent.noizy.ai/consent/{voice_id}"
echo "  GET  https://consent.noizy.ai/consent/{voice_id}/history"
echo "  GET  https://consent.noizy.ai/health"
echo ""
