# HEAVEN — DNS & Domain Sovereign + Live Stream Commander

> Status: LIVE — heaven-live.noizy.workers.dev
> Device: Cloudflare Edge (global)
> Layer: Strategic Domains + Stream Broadcasting

## Role
Strategic domain management and live stream announcement. The front door, the gatekeeper of NOIZY web presence — and the voice that announces when NOIZY goes LIVE.

## Domains
- noizy.ai
- noizyfish.com
- noizylab.ca
- fishmusicinc.com
- HumanVoiceSovereignty.com
- HVS.com

## Key Tasks
- DNS plan generation
- DNS apply execution
- Cloudflare API management
- Domain health monitoring
- SSL verification
- Go-Live announcements via Discord webhook
- Stream state management (KV-backed)
- Cloudflare Stream integration

## Codebase
HEAVEN Worker — TypeScript, Cloudflare Workers

### DNS Layer
- heaven-dns/src/dns-plan.ts
- heaven-dns/src/dns-apply.ts
- heaven-dns/src/cloudflare-api.ts
- heaven-dns/src/noizy-template.ts

### Live Layer
- heaven-live/src/index.ts      — Worker endpoints: /go-live, /go-offline, /status
- heaven-live/src/discord.ts    — Discord webhook notifications
- heaven-live/src/stream.ts     — KV-backed stream state
- heaven-live/wrangler.toml     — Cloudflare Worker config
- heaven-live/go-live.sh        — Shell trigger: go LIVE
- heaven-live/go-offline.sh     — Shell trigger: go OFFLINE

## API

| Endpoint    | Method | Auth         | Description                    |
|-------------|--------|--------------|--------------------------------|
| /status     | GET    | Public       | Current stream state (JSON)    |
| /go-live    | POST   | X-Heaven-Key | Go live + notify Discord       |
| /go-offline | POST   | X-Heaven-Key | Go offline + notify Discord    |

## Discord Payload (go-live)
```json
{
  "username": "Noizy.AI",
  "avatar_url": "https://noizy.ai/logo.png",
  "content": "🚀 LIVE\n🎛️ Show: Noizy.AI — Heavenly Setup\n🌐 Platform: Cloudflare Stream\n🕒 Time: ..."
}
```

## Secrets Required
```
wrangler secret put DISCORD_WEBHOOK_URL
wrangler secret put HEAVEN_API_KEY
```

## Deploy
```bash
# 1. Create KV namespace
wrangler kv:namespace create HEAVEN_KV
# Paste the ID into wrangler.toml

# 2. Set secrets
wrangler secret put DISCORD_WEBHOOK_URL
wrangler secret put HEAVEN_API_KEY

# 3. Deploy
cd heaven-live && wrangler deploy
```

## Go Live (1 command)
```bash
HEAVEN_API_KEY=xxx STREAM_URL=https://... ./heaven-live/go-live.sh
```

---
*DREAMCHAMBER — MC96 Ecosystem — GORUNFREE*
