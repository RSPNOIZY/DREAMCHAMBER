# =====================================================
# GABRIEL ALIASES - NOIZY.AI AI COMMAND CENTER
# =====================================================
# Add to .zshrc: source ~/NOIZYLAB/CODEMASTER/projects/gabriel-core/gabriel_aliases.zsh
# =====================================================

# Gabriel CLI
export PATH="$HOME/NOIZYLAB/CODEMASTER/projects/gabriel-core/bin:$PATH"

# Quick commands
alias gab='gabriel'
alias gabs='gabriel status'
alias gabm='gabriel mcp'
alias gabl='gabriel launch'
alias gabt='gabriel test'

# MCP Quick Launch
alias mcp-github='docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server'
alias mcp-fetch='uvx mcp-server-fetch'
alias mcp-git='uvx mcp-server-git'
alias mcp-time='uvx mcp-server-time'
alias mcp-sqlite='uvx mcp-server-sqlite'
alias mcp-google='uvx workspace-mcp --tool-tier complete'
alias mcp-gemini='uvx aistudio-mcp-server'

# Claude shortcuts
alias claude-config='code-insiders ~/Library/Application\ Support/Claude/claude_desktop_config.json'
alias claude-restart='osascript -e "quit app \"Claude\"" && sleep 1 && open -a Claude'

# Quick credential check
gabriel-check() {
    echo "🔑 GABRIEL CREDENTIAL STATUS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    [[ -n "$GITHUB_TOKEN" && "$GITHUB_TOKEN" != '${GITHUB_TOKEN}' ]] && echo "✅ GITHUB_TOKEN" || echo "❌ GITHUB_TOKEN"
    [[ -n "$GOOGLE_OAUTH_CLIENT_ID" ]] && echo "✅ GOOGLE_OAUTH_CLIENT_ID" || echo "❌ GOOGLE_OAUTH_CLIENT_ID"
    [[ -n "$GEMINI_API_KEY" ]] && echo "✅ GEMINI_API_KEY" || echo "❌ GEMINI_API_KEY"
    [[ -n "$SLACK_BOT_TOKEN" ]] && echo "✅ SLACK_BOT_TOKEN" || echo "❌ SLACK_BOT_TOKEN"
    [[ -n "$DISCORD_TOKEN" ]] && echo "✅ DISCORD_TOKEN" || echo "❌ DISCORD_TOKEN"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# NOIZYLAB master command
alias nl='noizylab'
alias nls='noizylab status'
alias nlm='noizylab mcp'
alias nlmagic='noizylab magic'
alias nll='noizylab launch'

# GORUNFREE!!
echo "🤖 NOIZYLAB & Gabriel loaded. Run 'noizylab magic' to see the power!"
