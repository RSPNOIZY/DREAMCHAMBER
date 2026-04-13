# NOIZY Empire Infrastructure

## Live Systems

| System | Status | Location |
|--------|--------|----------|
| Heaven — Consent Kernel API | LIVE | heaven.rsp-5f3.workers.dev — 55 endpoints, 25 tables + 9 views |
| DreamChamber — Multi-Model AI Command Center | LOCAL | Port 7777 — 11 providers, all streaming |
| Voice Bridge — Phone → GOD.local | LOCAL | Port 8080 — Siri/Google → Power Automate → commands |
| noizy.ai — Landing Page Worker | BUILT | noizy-landing/ — awaiting deploy |
| DreamChamber Audio MCP — Multi-AI voice mixing | BUILT | dreamchamber-audio-mcp/ — 13 FastMCP tools |
| 9 MCP Servers | LIVE | 74 tools across gabriel, lucy, heaven, engr-keith, dream, cb01, shirley, family, audio |

## Infrastructure IDs (AUTHORITATIVE — 2026-03-27)

```
# TWO CLOUDFLARE ACCOUNTS — both real, both in use
CF_HEAVEN:      5f36aa9795348ea681d0b21910dfc82a   ← HEAVEN worker, noizy.ai, KVs
CF_CONSENT:     5f36aa9795348ea681d0b21910dfc82a   ← consent-gateway, wrangler auth

# D1 DATABASES
agent-memory:   7b813205-fd12-4a23-84a6-ce83bc49ec70  (DB_MEMORY — CANONICAL)
noizylab-repairs: 2bd4aa06-f9b2-4761-b235-e92e8a21fe45 (DB_REPAIRS)
aquarium-archive: e6f98279-656b-4f7a-979d-9197821193f5 (DB_AQUARIUM)

# KV NAMESPACES (HEAVEN)
KV_MEMCELL:     9aa2511652ce4a2faeb106858f76df67
KV_SIGNUPS:     392c1bf429114148999824a9f9e15169
KV_ROYALTIES:   4cf36e4bd1fd44fe802096925413f694
KV_GUILD:       8a15ed31fea8462da7c92a8237d6f854
KV_SESSIONS:    c90299891f684de7bcc7c53967133748
KV_SUBMISSIONS: 6e888a017ebe4ba78ed7497c4929439b

# GABRIEL MEMCELLS: 333 total | Split brain: DEAD
```

> ⚠️ `gabriel_db` / `f75939d5` = PERMANENTLY DEAD. Never use. Never reference.
> ⚠️ `aeon-god-kernel-state` KV = DELETED. `god-kernel-state` is sole GOD state store.

## Local Models (GOD.local via Ollama)

- Gemma 3 27B (SHIRLEY) — Code & File Manager
- Qwen3-Coder — Local code generation
- Ollama endpoint: http://localhost:11434/v1

## Antigravity Local Model Config

Settings → Models → OpenAI Compatible:
- Endpoint: http://localhost:11434/v1
- Model: gemma3
- API Key: ollama (ignored locally)

## DreamChamber

- Port: 7777 (localhost on GOD.local)
- CRITICAL: Single process mode only (WebSocket + in-memory state)
- Start: `cd dreamchamber && npm start`
- Dev: `cd dreamchamber && npm run dev`

## Quick Commands

```bash
npx wrangler deploy                      # Deploy Heaven
npx wrangler d1 execute gabriel_db --remote --file seed.sql
bash smoke_test.sh                       # 14 smoke tests
cd dreamchamber && npm start             # DreamChamber (7777)
node voice-bridge-server.js              # Voice Bridge (8080)
cd noizy-landing && npx wrangler deploy  # Deploy noizy.ai
curl https://heaven.rsp-5f3.workers.dev/health
```

## Critical Path → April 17, 2026

- BLOCK 0: GoDaddy exit (CF login change → domain transfer → email routing)
- BLOCK 1: Deploy Heaven with real consent kernel
- BLOCK 2: Enable Cloudflare R2 for voice storage
- BLOCK 3: Fix ANTHROPIC_API_KEY on GOD.local
- BLOCK 4: Custom Cloudflare API token
- BLOCK 5: GitHub consolidation under noizy-anthropic org
