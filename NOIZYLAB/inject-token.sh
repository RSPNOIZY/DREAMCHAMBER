#!/bin/bash
set -euo pipefail

echo "🔓 Injecting Cloudflare API Token to unblock Cascade"
echo ""
echo "Get your token from:"
echo "https://dash.cloudflare.com/profile/api-tokens"
echo ""

# Secure read — token hidden from terminal output
read -rsp "Paste your Cloudflare API token here: " TOKEN
echo

if [ -z "$TOKEN" ]; then
    echo "❌ No token provided. Aborting."
    exit 1
fi

# Export for current session
export CLOUDFLARE_API_TOKEN="$TOKEN"

# Test it works
echo ""
echo "Testing authentication..."
if wrangler whoami; then
    echo ""
    echo "✅ Success! Token is working."
    echo ""
    echo "Cascade should now unblock automatically."
    echo "If not, restart Windsurf: Cmd+Shift+P → Developer: Reload Window"
    echo ""
    echo "To make permanent, run:"
    echo "  echo 'export CLOUDFLARE_API_TOKEN=\"YOUR_TOKEN\"' >> ~/.zshrc"
else
    echo ""
    echo "❌ Authentication failed. Check your token."
    exit 1
fi
