#!/usr/bin/env bash
set -euo pipefail

echo "🔍 Wrangler Doctor"

# Check Node
node -v >/dev/null || { echo "❌ Node missing"; exit 1; }
echo "✅ Node $(node -v)"

# Check Wrangler
npx wrangler --version >/dev/null || { echo "❌ Wrangler missing"; exit 1; }
echo "✅ Wrangler $(npx wrangler --version 2>/dev/null)"

# Check env vars
: "${CLOUDFLARE_API_TOKEN:?❌ CLOUDFLARE_API_TOKEN not set}"
: "${CLOUDFLARE_ACCOUNT_ID:?❌ CLOUDFLARE_ACCOUNT_ID not set}"
echo "✅ CLOUDFLARE_API_TOKEN is set"
echo "✅ CLOUDFLARE_ACCOUNT_ID is set"

# Verify auth
npx wrangler whoami >/dev/null 2>&1 || { echo "❌ Wrangler auth failed"; exit 1; }
echo "✅ Wrangler auth OK (API token)"

echo ""
echo "🚀 Ready to deploy"
