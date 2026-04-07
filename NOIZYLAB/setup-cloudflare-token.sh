#!/bin/bash

echo "🔑 Cloudflare API Token Setup"
echo "============================"
echo ""
echo "Step 1: Get your API token"
echo "1. Open: https://dash.cloudflare.com/profile/api-tokens"
echo "2. Click 'Create Token'"
echo "3. Use 'Custom token' template"
echo "4. Set permissions:"
echo "   - Account: Cloudflare Workers Scripts:Edit"
echo "   - Account: D1:Edit"
echo "   - Account: Workers KV Storage:Edit"
echo "   - Zone: Workers Routes:Edit (if using custom domains)"
echo "5. Copy the token"
echo ""
echo "Step 2: Enter your token below"
read -p "Paste your Cloudflare API token: " CF_TOKEN

# Set environment variable
export CLOUDFLARE_API_TOKEN="$CF_TOKEN"

# Also save to .env file
echo "CLOUDFLARE_API_TOKEN=$CF_TOKEN" > .env

# Test the token
echo ""
echo "Testing token..."
wrangler whoami

echo ""
echo "✅ Token saved to .env file"
echo "✅ Environment variable set for current session"
echo ""
echo "To make permanent, add to ~/.zshrc:"
echo "export CLOUDFLARE_API_TOKEN=\"$CF_TOKEN\""
