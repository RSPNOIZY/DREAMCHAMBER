# DreamChamber Bridge (Slack ↔ Discord)

Two-way message mirror between selected Slack channels and Discord channels.

## What this does

- Mirrors messages Slack → Discord and Discord → Slack (configurable)
- Adds a lightweight header showing author + origin platform
- Prevents echo loops by ignoring bot messages

## Setup (one time)

### 1) Create a Slack App (Socket Mode)

1. Create an app at https://api.slack.com/apps
2. **Socket Mode** → Enable Socket Mode → generate an app token (`xapp-...`)
3. **OAuth & Permissions** → add bot token scopes:
   - `channels:history`, `channels:read`, `chat:write`, `users:read`
   - If you need private channels: `groups:history`, `groups:read`
4. Install the app → copy **Bot User OAuth Token** (`xoxb-...`)
5. **Event Subscriptions** → Enable
   - Subscribe to bot events:
     - Public channels: `message.channels`
     - Private channels (optional): `message.groups`
6. In Slack, invite the bot to the channel you want mirrored.

### 2) Create a Discord Bot

1. Create an application at https://discord.com/developers/applications
2. Bot → reset token → copy **DISCORD_TOKEN**
3. Bot → enable **Message Content Intent**
4. OAuth2 → URL Generator → scopes: `bot`
   - Bot permissions: View Channels, Read Message History, Send Messages
5. Use generated URL to add the bot to your server.

### 3) Get Channel IDs

- Slack: right-click channel → “View channel details” → Channel ID
- Discord: enable Developer Mode → right-click channel → “Copy Channel ID”

## Run it

```bash
cd projects/dreamchamber-bridge
cp .env.example .env
cp bridge.config.example.json bridge.config.json
npm install
npm run dev
```

## Notes

- This replicates messages across platforms. Only mirror channels you’re OK duplicating.
- If Slack permalinks are enabled, Discord users still need Slack access to view them.

