#!/bin/bash
set -euo pipefail

echo "🔓 Quick Unblock for Cascade"
echo ""
echo "1. Go to: https://dash.cloudflare.com/profile/api-tokens"
echo "2. Create Token → Custom Token"
echo "3. Permissions:"
echo "   - Account → Cloudflare Workers Scripts: Edit"
echo "   - Account → D1: Edit"
echo "   - Account → Workers KV Storage: Edit"
echo "4. Select your account"
echo "5. Create & Copy Token"
echo ""

# Secure read — token hidden
read -rsp "Token: " TOKEN
echo

if [ -z "$TOKEN" ]; then
  echo "❌ No token provided. Aborting."
  exit 1
fi

export CLOUDFLARE_API_TOKEN="$TOKEN"

echo "Testing..."
if wrangler whoami; then
  echo ""
  echo "✅ Cascade should unblock automatically."
  echo "If not, restart Windsurf: Cmd+Shift+P → Developer: Reload Window"
else
  echo ""
  echo "❌ Authentication failed. Double-check the token."
  exit 1
fi
