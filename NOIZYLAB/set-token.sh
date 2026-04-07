#!/bin/bash

# Replace 'your-token-here' with your actual token
export CLOUDFLARE_API_TOKEN='your-token-here'

# Test it
echo "Testing Cloudflare authentication..."
wrangler whoami

# If successful, make it permanent
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Authentication successful!"
    echo ""
    echo "To make permanent, add to ~/.zshrc:"
    echo "export CLOUDFLARE_API_TOKEN='$CLOUDFLARE_API_TOKEN'"
else
    echo "❌ Authentication failed. Check your token."
fi
