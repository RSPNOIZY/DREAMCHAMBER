#!/usr/bin/env bash
set -euo pipefail

echo "🔐 Token Scope Lint"

: "${CLOUDFLARE_API_TOKEN:?❌ CLOUDFLARE_API_TOKEN missing}"
: "${CLOUDFLARE_ACCOUNT_ID:?❌ CLOUDFLARE_ACCOUNT_ID missing}"

# Verify token is usable (account tokens need account_id set)
if ! npx wrangler whoami >/dev/null 2>&1; then
  echo "❌ Token not usable by Wrangler"
  echo "   Check: token permissions, account_id match"
  exit 1
fi

echo "✅ Token usable by Wrangler"
