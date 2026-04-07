# OPTIONAL MCP SERVERS

These servers require credentials and can be added once you have the tokens.

## Add to Claude Desktop Config

Once you have the credentials, add these to your `claude_desktop_config.json`:

### Slack (after getting Bot Token)

```json
"slack": {
  "command": "docker",
  "args": [
    "run",
    "-i",
    "--rm",
    "-e", "SLACK_BOT_TOKEN",
    "-e", "SLACK_TEAM_ID",
    "mcp/slack"
  ],
  "env": {
    "SLACK_BOT_TOKEN": "xoxb-your-token",
    "SLACK_TEAM_ID": "Txxxxxxxxxx"
  }
}
```

### Discord (after creating bot)

```json
"discord": {
  "command": "uvx",
  "args": ["mcp-discord"],
  "env": {
    "DISCORD_TOKEN": "your-bot-token"
  }
}
```

### Brave Search (after getting API key)

```json
"brave-search": {
  "command": "uvx",
  "args": ["mcp-server-brave-search"],
  "env": {
    "BRAVE_API_KEY": "your-api-key"
  }
}
```

## Get Your Tokens

| Service | URL |
|---------|-----|
| Slack Bot | https://api.slack.com/apps |
| Discord Bot | https://discord.com/developers/applications |
| Brave Search | https://brave.com/search/api/ |
