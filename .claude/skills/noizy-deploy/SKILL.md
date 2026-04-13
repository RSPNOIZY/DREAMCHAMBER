---
name: noizy-deploy
description: "Full deploy procedures for all NOIZY services with safety checks, smoke tests, and rollback procedures"
---

# NOIZY DEPLOY — Ship the Empire

Use this skill whenever deploying, shipping, or releasing any NOIZY service. Covers Heaven, DreamChamber, Voice Bridge, noizy.ai landing page, and MCP servers.

## Trigger Phrases

- "deploy heaven", "ship it", "push to prod", "deploy landing page"
- "run smoke tests", "health check", "is it live?"
- "start dreamchamber", "start voice bridge"
- Any mention of `wrangler deploy`, deployment, or shipping

## Pre-Deploy Checklist (MANDATORY — every deploy)

Before ANY deployment, verify all of these:

1. **No secrets exposed** — Run `grep -r "NOIZY_API_KEY\|sk-\|API_KEY=" src/ --include="*.js" | grep -v ".env"` — must return empty
2. **Smoke tests pass** — `bash smoke_test.sh` — all 14 must pass
3. **Never Clauses intact** — Query `SELECT COUNT(*) FROM hvs_never_clauses WHERE is_active = 1` — must return 9
4. **Ledger append-only** — Confirm no UPDATE/DELETE in any migration touching `noizy_ledger`
5. **wrangler.toml correct** — D1 database_id = `a31d68e2-f2d4-4203-a803-8039fdff31cb`
6. **Environment file present** — `.env` exists and contains NOIZY_API_KEY

## Service Deploy Procedures

### Heaven (Cloudflare Worker — Consent Kernel API)

```bash
# 1. Verify wrangler.toml
cat wrangler.toml | grep database_id
# Must show: a31d68e2-f2d4-4203-a803-8039fdff31cb

# 2. Deploy
npx wrangler deploy

# 3. Health check
curl -s https://heaven.rsp-5f3.workers.dev/health | jq .

# 4. Smoke tests (14 tests with auth)
bash smoke_test.sh

# 5. Verify ledger
curl -s -H "X-NOIZY-Key: $NOIZY_API_KEY" \
  https://heaven.rsp-5f3.workers.dev/api/v1/ledger?limit=5 | jq .
```

### noizy.ai Landing Page

```bash
cd noizy-landing
npx wrangler deploy
# Verify: curl -s https://noizy.ai | head -20
```

### DreamChamber (Local — GOD.local port 7777)

```bash
cd dreamchamber && npm start
# Or with Docker:
docker-compose up -d
# Health: curl http://localhost:7777/health
```

**CRITICAL**: Single process mode only. WebSocket + in-memory state = `instances: 1`.

### Voice Bridge (Local — GOD.local port 8080)

```bash
node voice-bridge-server.js
# Health: curl http://localhost:8080/health
```

### MCP Servers (9 servers on GOD.local)

```bash
# Install deps for all MCP servers
for dir in mcp/*/; do
  if [ -f "$dir/package.json" ]; then
    (cd "$dir" && npm install)
  fi
done

# Test individual server
node mcp/gabriel-mcp/index.js    # Should start stdio transport
```

## Post-Deploy Verification

After every deploy, run this sequence:

```bash
# 1. Health
curl -s https://heaven.rsp-5f3.workers.dev/health | jq '.success'

# 2. Actor check (RSP_001 must exist)
curl -s -H "X-NOIZY-Key: $NOIZY_API_KEY" \
  https://heaven.rsp-5f3.workers.dev/api/v1/actors | jq '.data[0].actor_id'

# 3. Never Clauses (must return 9)
curl -s -H "X-NOIZY-Key: $NOIZY_API_KEY" \
  https://heaven.rsp-5f3.workers.dev/api/v1/never-clauses | jq '.data | length'

# 4. KPIs
curl -s -H "X-NOIZY-Key: $NOIZY_API_KEY" \
  https://heaven.rsp-5f3.workers.dev/api/v1/kpi/trust | jq .
```

## Rollback Procedure

```bash
# Check recent deployments
npx wrangler deployments list

# Rollback to previous
npx wrangler rollback
```

## Infrastructure IDs (verified 2026-03-25)

| Resource | ID |
|----------|-----|
| Worker | heaven @ heaven.rsp-5f3.workers.dev |
| D1 Database | gabriel_db — `a31d68e2-f2d4-4203-a803-8039fdff31cb` |
| GABRIEL_KV | `f205b56a9914413da0ec454a9dc4c2bd` |
| GABRIEL_VOICE | `16532a32b2e8455486cc966403f3442e` |
| CF Account | rsp@noizy.ai — `5f36aa9795348ea681d0b21910dfc82a` |
| CF Login | `rsp@noizyfish.com` (MUST migrate to rsplowman@icloud.com) |

## GoDaddy Exit Warning

The Cloudflare login is `rsp@noizyfish.com` via GoDaddy M365. If M365 is cancelled before changing the CF login to `rsplowman@icloud.com`, you lose access to EVERYTHING. Step 0 of GoDaddy exit: change CF email first.

## Rules

- NEVER deploy without smoke tests passing
- NEVER commit .env files
- NEVER deploy with a modified noizy_ledger schema that includes UPDATE or DELETE
- ALWAYS verify the D1 database_id in wrangler.toml before deploying
- ALWAYS run health check after deploy
- ALWAYS log the deploy event (CB01 tracks this)
