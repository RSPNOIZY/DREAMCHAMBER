# GABRIEL MCP SETUP GUIDE
## NOIZY.AI Ecosystem Integration

**GORUNFREE!!**

---

## Quick Start

1. Copy `.env.template` to `.env`
2. Fill in your credentials (see guides below)
3. Add to your shell profile: `source /path/to/.env`
4. Restart Claude Desktop

---

## 1. GITHUB TOKEN

**URL:** https://github.com/settings/tokens

### Steps:
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Name it: `GABRIEL-MCP`
4. Select scopes:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
   - `read:org` (Read org membership)
   - `read:user` (Read user profile data)
5. Generate and copy token

### What You Can Do:
- Browse any repository
- Create/manage issues and PRs
- Monitor GitHub Actions
- Access Dependabot alerts
- Manage code reviews

---

## 2. GOOGLE WORKSPACE

**URL:** https://console.cloud.google.com/apis/credentials

### Steps:
1. Create or select a project
2. Enable APIs:
   - Gmail API
   - Google Calendar API
   - Google Drive API
   - Google Docs API
   - Google Sheets API
   - Google Slides API
   - People API
   - Tasks API
3. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
4. Application type: **Desktop app**
5. Name it: `GABRIEL-MCP`
6. Download JSON or copy Client ID and Secret

### What You Can Do:
- Read/send Gmail
- Manage Calendar events
- Access Drive files
- Edit Docs/Sheets/Slides
- Manage contacts
- Handle tasks

---

## 3. GOOGLE AI STUDIO (GEMINI)

**URL:** https://aistudio.google.com/app/apikey

### Steps:
1. Sign in with Google account
2. Click "Create API Key"
3. Copy the key

### What You Can Do:
- Generate content with Gemini 2.5
- Analyze images and diagrams
- Transcribe audio with speaker ID
- Convert PDFs to Markdown
- Process video content

### Supported File Types:
- Images: JPG, PNG, GIF, WebP, SVG
- Video: MP4, AVI, MOV, WEBM
- Audio: MP3, WAV, AAC, OGG, FLAC
- Documents: PDF, TXT, MD, JSON

---

## 4. SLACK

**URL:** https://api.slack.com/apps

### Steps:
1. Create New App → From scratch
2. Name: `GABRIEL-MCP`, select workspace
3. Go to OAuth & Permissions
4. Add Bot Token Scopes:
   - `channels:read` - View channels
   - `channels:history` - View messages
   - `chat:write` - Send messages
   - `search:read` - Search messages
   - `users:read` - View users
5. Install to Workspace
6. Copy Bot User OAuth Token (starts with `xoxb-`)
7. Get Team ID: Workspace settings → About this workspace

### What You Can Do:
- Send messages to any channel
- Search messages and files
- List channels and users
- Access conversation history
- Create and manage canvases

---

## 5. DISCORD

**URL:** https://discord.com/developers/applications

### Steps:
1. Create New Application
2. Name: `GABRIEL-MCP`
3. Go to Bot section
4. Click "Reset Token" and copy it
5. Enable these Privileged Gateway Intents:
   - Message Content Intent
6. Go to OAuth2 → URL Generator
7. Select scopes: `bot`
8. Select permissions:
   - Send Messages
   - Read Message History
   - View Channels
9. Copy generated URL and open in browser
10. Add bot to your server

### What You Can Do:
- Send messages to channels
- Read message history
- List channels and servers
- Monitor community activity

---

## 6. BRAVE SEARCH (Optional)

**URL:** https://brave.com/search/api/

### Steps:
1. Sign up for Brave Search API
2. Choose plan (free tier available)
3. Generate API key

### What You Can Do:
- Web search from Claude
- Independent search results (not Google)
- Privacy-focused searching

---

## Shell Profile Setup

Add these to your `~/.zshrc` or `~/.bashrc`:

```bash
# GABRIEL MCP Credentials
export GITHUB_TOKEN="your_token_here"
export GOOGLE_OAUTH_CLIENT_ID="your_client_id"
export GOOGLE_OAUTH_CLIENT_SECRET="your_secret"
export GEMINI_API_KEY="your_key"
export SLACK_BOT_TOKEN="xoxb-your-token"
export SLACK_TEAM_ID="Txxxxxxxxxx"
export DISCORD_TOKEN="your_bot_token"
export BRAVE_API_KEY="your_key"
```

Then run: `source ~/.zshrc`

---

## Testing Your Setup

Run this to check status:

```bash
python3 /Users/m2ultra/NOIZYLAB/CODEMASTER/projects/gabriel-core/mcp/gabriel_mcp_config.py
```

Expected output:
```
==================================================
GABRIEL MCP ORCHESTRATOR - Status Check
==================================================
✅ github: Configured
✅ google_workspace: Configured
✅ google_ai_studio: Configured
✅ slack: Configured
✅ discord: Configured
✅ brave_search: Configured
==================================================
GORUNFREE!!
```

---

## Restart Claude Desktop

After configuring credentials:
1. Quit Claude Desktop completely
2. Reopen Claude Desktop
3. MCP servers will auto-connect

---

## Troubleshooting

### Server not connecting?
- Check credentials are exported: `echo $GITHUB_TOKEN`
- Verify Claude Desktop config syntax: `cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq .`
- Check Docker is running (for GitHub): `docker ps`

### Permission denied?
- GitHub: Regenerate token with correct scopes
- Google: Re-authorize with correct API scopes
- Slack: Reinstall app to workspace
- Discord: Check bot permissions in server settings

---

## Support

Questions? Issues? Ideas?
- Email: rsplowman@icloud.com
- NOIZY.AI Ecosystem

**GORUNFREE!!**
