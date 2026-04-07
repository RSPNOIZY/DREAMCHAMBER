#!/bin/bash
set -euo pipefail

# Secure read — hide token from terminal
read -rsp "Paste Cloudflare API token: " TOKEN
echo

if [ -z "$TOKEN" ]; then
  echo "❌ No token provided. Aborting."
  exit 1
fi

# Set for current session
export CLOUDFLARE_API_TOKEN="$TOKEN"

# Test authentication
echo "Testing..."
if ! wrangler whoami; then
  echo "❌ Authentication failed. Check your token."
  exit 1
fi

# Save to .env — replace existing entry or append
ENV_FILE=".env"
if [ -f "$ENV_FILE" ]; then
  # Remove any existing CLOUDFLARE_API_TOKEN line
  sed -i '' '/^CLOUDFLARE_API_TOKEN=/d' "$ENV_FILE"
fi
echo "CLOUDFLARE_API_TOKEN=$TOKEN" >> "$ENV_FILE"

echo "✅ Done! Token saved to .env. Cascade should unblock now."
