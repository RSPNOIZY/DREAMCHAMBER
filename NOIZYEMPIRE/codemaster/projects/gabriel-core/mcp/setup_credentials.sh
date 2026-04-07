#!/bin/bash
# =====================================================
# GABRIEL MCP CREDENTIALS SETUP
# =====================================================
# Interactive script to configure all MCP credentials
# Run: bash setup_credentials.sh
# =====================================================

echo "=================================================="
echo "🤖 GABRIEL MCP CREDENTIALS SETUP"
echo "=================================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ZSHRC="$HOME/.zshrc"
ENV_FILE="$HOME/.gabriel_mcp_env"

# Function to add credential
add_credential() {
    local name=$1
    local prompt=$2
    local current_value=$(eval echo \$$name)

    if [ -n "$current_value" ]; then
        echo -e "${GREEN}✅ $name already set${NC}"
        read -p "   Update? (y/N): " update
        if [ "$update" != "y" ] && [ "$update" != "Y" ]; then
            return
        fi
    fi

    echo -e "${YELLOW}$prompt${NC}"
    read -p "   Enter value (or press Enter to skip): " value

    if [ -n "$value" ]; then
        echo "export $name=\"$value\"" >> "$ENV_FILE"
        export $name="$value"
        echo -e "${GREEN}   ✅ $name configured${NC}"
    else
        echo -e "${YELLOW}   ⏭️  Skipped${NC}"
    fi
    echo ""
}

# Create or clear env file
echo "# GABRIEL MCP Environment Variables" > "$ENV_FILE"
echo "# Generated: $(date)" >> "$ENV_FILE"
echo "" >> "$ENV_FILE"

echo ""
echo "📋 Setup each service (press Enter to skip any):"
echo ""

# GitHub
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  GITHUB"
echo "   Get token: https://github.com/settings/tokens"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
add_credential "GITHUB_TOKEN" "Personal Access Token:"

# Google Workspace
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  GOOGLE WORKSPACE"
echo "   Setup: https://console.cloud.google.com/apis/credentials"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
add_credential "GOOGLE_OAUTH_CLIENT_ID" "OAuth Client ID:"
add_credential "GOOGLE_OAUTH_CLIENT_SECRET" "OAuth Client Secret:"

# Google AI Studio
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  GOOGLE AI STUDIO (GEMINI)"
echo "   Get key: https://aistudio.google.com/app/apikey"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
add_credential "GEMINI_API_KEY" "Gemini API Key:"

# Slack
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  SLACK"
echo "   Create app: https://api.slack.com/apps"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
add_credential "SLACK_BOT_TOKEN" "Bot User OAuth Token (xoxb-...):"
add_credential "SLACK_TEAM_ID" "Team ID (Txxxxxxxxxx):"

# Discord
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  DISCORD"
echo "   Create bot: https://discord.com/developers/applications"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
add_credential "DISCORD_TOKEN" "Bot Token:"

# Brave Search
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  BRAVE SEARCH (Optional)"
echo "   Get key: https://brave.com/search/api/"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
add_credential "BRAVE_API_KEY" "Brave API Key:"

# Add source to .zshrc if not already there
if ! grep -q "gabriel_mcp_env" "$ZSHRC" 2>/dev/null; then
    echo "" >> "$ZSHRC"
    echo "# GABRIEL MCP Credentials" >> "$ZSHRC"
    echo "[ -f ~/.gabriel_mcp_env ] && source ~/.gabriel_mcp_env" >> "$ZSHRC"
    echo -e "${GREEN}✅ Added source to $ZSHRC${NC}"
fi

echo ""
echo "=================================================="
echo "🎉 SETUP COMPLETE!"
echo "=================================================="
echo ""
echo "Credentials saved to: $ENV_FILE"
echo ""
echo "Next steps:"
echo "  1. Run: source ~/.zshrc"
echo "  2. Restart Claude Desktop"
echo "  3. Test with: python3 $(dirname $0)/gabriel_mcp_config.py"
echo ""
echo "GORUNFREE!! 🚀"
