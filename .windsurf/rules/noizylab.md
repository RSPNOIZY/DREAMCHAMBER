---
description: NOIZY Empire — Master project context for Cascade. Architecture, patterns, env vars, file map.
---

# NOIZY EMPIRE — MASTER CONTEXT

## IDENTITY

- **Owner**: Robert Stephen Plowman (RSP_001) — rsp@noizyfish.com — Canada
- **Machine**: M2 Ultra Mac Studio — hostname `GOD.local`
- **Mission**: "Consent as executable code. Provenance as default. Revocation as sacred. Compensation as automatic."
- **Root**: `~/NOIZYLAB/`

---

## AI AGENT FAMILY (7 ACTIVE)

| Agent | Type | Role |
|---|---|---|
| **GABRIEL** | OPS | Warrior executor · 326 memcells · D1 agent-memory · MCP: `gabriel-mcp` |
| **LUCY** | OPS | Organizer · DAZEFLOW keeper · task log · session index · MCP: `lucy-mcp` |
| **ENGR_KEITH** | OPS | Technical Lead · HEAVEN architect · R.K. Plowman legacy |
| **DREAM** | OPS | Visionary · 5th Epoch · Elevation Doctrine · 2526 DreamChamber |
| **CB01** | OPS | Ops Runner · GoDaddy escape · DNS · domain transfers |
| **SHIRL** | FAM | The Aunt · burnout watchdog · wellbeing |
| **POPS** | FAM | The Dad · R.K. Plowman · grounding force · wisdom |

**LUCY — DAZEFLOW Law**: 1 day = 1 chat = 1 truth. Log sessions via `lucy_dazeflow_log`. State stored in `~/NOIZYLAB/lucy-state/`.

**Agent routing**: Tech → ENGR_KEITH · Vision → DREAM · Execute/deploy → GABRIEL · Organize/log → LUCY · Domains → CB01

---

## MCP SERVERS (Windsurf/Cascade tools)

| Server | Tools | Backend |
|---|---|---|
| `gabriel-mcp` | `gabriel_speak`, `gabriel_status`, `gabriel_announce`, `gabriel_refresh` | DreamChamber `:7777` |
| `lucy-mcp` | `lucy_dazeflow_*`, `lucy_task_*`, `lucy_memcell_*`, `lucy_status` | Local `lucy-state/` + Heaven |
| `heaven-mcp` | `h17_health`, `h17_gabriel`, `h17_actors`, `h17_never_clauses`, `h17_stats`, `h17_ledger`, `h17_kpi`, `h17_audit` | Heaven worker |

Source: `~/NOIZYLAB/mcp/` — each server has its own `package.json` + `index.js`.
Registered in: `~/.codeium/windsurf/mcp_config.json`

---

## FIVE SERVICES

| Service | Type | Location | Port / URL |
|---|---|---|---|
| **HEAVEN** | Cloudflare Worker | `src/index.js` | `https://heaven.rsp-5f3.workers.dev` |
| **gabriel_db** | D1 SQLite | Cloudflare | binding `GABRIEL_DB` (a31d68e2-f2d4-4203-a803-8039fdff31cb) |
| **DreamChamber** | Node.js/Express | `dreamchamber/` | `:7777` |
| **Voice Bridge** | Node.js/Express | `voice-bridge-server.js` | `:8080` |
| **Power Automate** | Azure Logic App | `power-automate-flows/` | → `GOD.local:8080` |

---

## KEY FILE MAP

```
~/NOIZYLAB/
├── src/
│   └── index.js              ← Heaven Worker (35 endpoints, ALL auth guarded except /health /dashboard /)
├── dreamchamber/
│   ├── src/
│   │   ├── server.js         ← Express + WebSocket (port 7777, WS at /ws)
│   │   ├── core/
│   │   │   ├── Gabriel.js    ← AI orchestration layer — speak(), refreshContext(), announce()
│   │   │   ├── HeavenClient.js ← Bridge to consent kernel (reportUsage, health, stats, actors)
│   │   │   ├── Database.js   ← PostgreSQL via pg Pool
│   │   │   ├── StateManager.js   ← In-memory conversations + model stats
│   │   │   └── CostCalculator.js ← Per-token pricing for all models
│   │   ├── providers/        ← AnthropicProvider, OpenAIProvider, GoogleProvider, etc.
│   │   ├── routes/
│   │   │   ├── api.js        ← REST: /api/chat, /api/compare, /api/conversations, /api/heaven/*
│   │   │   └── gabriel.js    ← REST: POST /api/gabriel/speak, GET /api/gabriel/status
│   │   ├── websocket/
│   │   │   └── handler.js    ← WS streaming chat (chat:chunk, chat:complete, chat:error)
│   │   └── auth/
│   │       └── jwt.js        ← JWT auth, bcrypt passwords, encrypted API key storage
│   ├── public/index.html     ← DreamChamber UI (4 tabs: Chat, Consent Kernel, Stats, Gabriel)
│   ├── nginx/nginx.conf      ← Nginx proxy (SSL, rate limiting, /ws WebSocket location)
│   ├── docker-compose.yml    ← dreamchamber + postgres + redis + nginx + pgadmin
│   ├── ecosystem.config.js   ← PM2 (instances:1, fork mode — WebSocket requires single instance)
│   └── logs/                 ← All logs written here (server, database, providers)
├── voice-bridge-server.js    ← Express voice command handler (port 8080, VOICE_AUTH_TOKEN auth)
├── wrangler.toml             ← Cloudflare Worker config (bindings: GABRIEL_DB, GABRIEL_KV, GABRIEL_VOICE)
├── schema.sql                ← D1 schema (18 tables, 6 views)
├── seed.sql                  ← Seed data (RSP_001, 9 never clauses, 5 union tiers, rate table)
├── smoke_test.sh             ← 14 live tests against Heaven worker
├── deploy.sh                 ← Deploy Heaven worker via wrangler
├── .env                      ← Root env (NOIZY_API_KEY, HEAVEN_URL)
└── dreamchamber/.env         ← DreamChamber env (all API keys, JWT_SECRET, DB creds)
```

---

## ENV VARS REFERENCE

### Root `~/NOIZYLAB/.env`
| Var | Purpose |
|---|---|
| `NOIZY_API_KEY` | Heaven API auth (X-NOIZY-Key header) |
| `HEAVEN_URL` | `https://heaven.rsp-5f3.workers.dev` |

### `dreamchamber/.env`
| Var | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Claude (primary Gabriel provider) |
| `OPENAI_API_KEY` | GPT-4o, GPT-4 Turbo |
| `GOOGLE_API_KEY` | Gemini Flash, Gemini Pro |
| `TOGETHER_API_KEY` | Llama 3.3 70B (cheapest) |
| `MISTRAL_API_KEY` | Mistral Large |
| `COHERE_API_KEY` | Command R+ |
| `PERPLEXITY_API_KEY` | Online search (FREE model) |
| `GABRIEL_MODEL` | Override Gabriel's model (default: `claude-sonnet-4`) |
| `GABRIEL_VOICE_NAME` | macOS say voice (default: `Daniel`) |
| `GABRIEL_SPEECH_RATE` | Words per minute (default: `180`) |
| `JWT_SECRET` | 64-char hex secret for session tokens |
| `NOIZY_API_KEY` | Passed through to HeavenClient |
| `HEAVEN_URL` | Kernel URL |
| `VOICE_AUTH_TOKEN` | Auth token for Voice Bridge |
| `DATABASE_URL` | `postgresql://dreamchamber:...@localhost:5432/dreamchamber` |
| `REDIS_URL` | `redis://localhost:6379` |

---

## MODEL PRICING (per 1M tokens — input / output)

| Model | Input | Output | Notes |
|---|---|---|---|
| `claude-opus-4` | $15.00 | $75.00 | Reserved for complex reasoning only |
| `claude-sonnet-4` | $3.00 | $15.00 | Gabriel default |
| `gpt-4o` | $2.50 | $10.00 | |
| `mistral-large` | $2.00 | $6.00 | |
| `llama-3.3-70b` | $0.88 | $0.88 | Best cost for bulk |
| `gemini-2.0-flash` | $0.075 | $0.30 | Best for non-critical tasks |
| `perplexity-online` | $0 | $0 | Always use for web search |

**Gabriel prompt caching**: `GABRIEL_SYSTEM_PROMPT` is passed as `systemPromptStatic` (cached, 10% price) — `contextBlock` as `systemPromptDynamic` (not cached). Context TTL is 30 min.

---

## CRITICAL PATTERNS

### Heaven Auth
- All API calls require `X-NOIZY-Key: ${NOIZY_API_KEY}` header
- Exceptions: `/health`, `/dashboard`, `/` (public)
- Heaven health returns `{ status: "LIVE" }` — NOT "healthy"

### WebSocket
- Server mounts WS at `/ws` path — nginx proxies `/ws` to backend
- Client connects to `ws://${location.host}/ws`
- Messages: `chat:chunk`, `chat:complete`, `chat:error`, `chat:typing`
- **Never use `instances: 'max'` in PM2** — StateManager is in-memory, breaks with multiple processes

### Logging
- ALL logs go to `dreamchamber/logs/` — never to CWD
- Directory created at startup via `fs.mkdirSync(LOGS_DIR, { recursive: true })`

### Ledger
- Append-only — DB triggers prevent UPDATE/DELETE on `noizy_ledger`
- DreamChamber writes usage via `POST /api/v1/ledger/append`
- `HeavenClient.reportUsage()` is fire-and-forget (never throw on failure)

### Never Clauses
- 9 clauses for RSP_001 — checked on every `POST /api/v1/synth-requests`
- Blocked requests log to ledger automatically
- Never Clauses cannot be overridden by any API call

---

## CODING RULES

- **No cluster mode PM2** — always `exec_mode: 'fork', instances: 1`
- **Logs always in `dreamchamber/logs/`** — never bare filenames
- **Gabriel always uses `systemPromptStatic` + `systemPromptDynamic`** — never combined `systemPrompt`
- **`reportUsage()` is always fire-and-forget** — wrap in `.catch(() => {})`
- **Heaven status check**: `!!health.value?.status` (truthy) — not `=== "healthy"`
- **`node-fetch`** is required in api.js — already declared at top
- **WebSocket path** is always `/ws` — nginx, server.js, index.html all aligned

---

## CLOUDFLARE RESOURCES

| Resource | Binding | ID |
|---|---|---|
| D1 Database | `GABRIEL_DB` | `a31d68e2-f2d4-4203-a803-8039fdff31cb` |
| KV (rate limit + cache) | `GABRIEL_KV` | `f205b56a9914413da0ec454a9dc4c2bd` |
| KV (voice assets) | `GABRIEL_VOICE` | `16532a32b2e8455486cc966403f3442e` |
| Worker URL | — | `https://heaven.rsp-5f3.workers.dev` |
| Worker version | — | `6c7a12c5` (last deployed) |

---

## ENTERPRISE GIT DOCTRINE

**One-line law**: noizy.ai is the authority. git.noizy.ai is the source of truth. Push enterprise-first, migrate in phases, retire GitHub safely.

| Concept | Value |
|---|---|
| Public/control root | `noizy.ai` — homepage, status, bootstrap, brand |
| Canonical Git host | `git.noizy.ai` — only source of truth for all push/pull/clone |
| Remote `enterprise` | `git@git.noizy.ai:NOIZYFISH/<repo>.git` — **default push target** |
| Remote `github` | `github.com/NOIZYLAB-io` — backup pull only during migration |
| SSH URL | `git@git.noizy.ai:NOIZYFISH/<repo>.git` |
| HTTPS fallback | `https://git.noizy.ai/NOIZYFISH/<repo>.git` |

**Cutover scripts**: `~/NOIZYLAB/git-align.sh` (remote setup) → `~/NOIZYLAB/git-mirror.sh` (push all branches+tags)

**Safe global defaults**:
```bash
git config --global push.default current
git config --global fetch.prune true
git config --global init.defaultBranch main
git config remote.pushDefault enterprise   # per-repo
```

**5 phases**: 1-Lock naming → 2-Stand up git.noizy.ai → 3-Mirror repos → 4-Safe push defaults → 5-Freeze GitHub to archive

**Cutover gates** (must all pass before freeze): git.noizy.ai live + SSH verified · SSH clone works · NOIZYFISH org + 8 repos in Gitea · all branches+tags mirrored · pushDefault=enterprise everywhere · branch protections on main · GitHub archive-only

**Branch protection on git.noizy.ai**: default=main · no force-push · no delete protected · PR required on critical repos · signed commits on · secrets scanning on · tags preserved

---

## QUICK COMMANDS

```bash
# Deploy Heaven worker
bash ~/NOIZYLAB/deploy.sh

# Start DreamChamber dev
cd ~/NOIZYLAB/dreamchamber && npm run dev

# Run smoke tests
cd ~/NOIZYLAB && bash smoke_test.sh

# Heaven health
curl https://heaven.rsp-5f3.workers.dev/health

# DreamChamber health (when running)
curl http://localhost:7777/health

# D1 schema migration
cd ~/NOIZYLAB && npx wrangler d1 execute gabriel_db --remote --file=schema.sql

# D1 seed
cd ~/NOIZYLAB && npx wrangler d1 execute gabriel_db --remote --file=seed.sql
```
