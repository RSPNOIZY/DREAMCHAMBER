---
name: empire-status
description: "Complete infrastructure health check and status report across all NOIZY systems — Heaven, DreamChamber, MCP servers, agents"
---

# EMPIRE STATUS — Full Infrastructure Check

Use this skill to get a complete picture of the NOIZY Empire's health, infrastructure state, agent readiness, and roadmap progress.

## Trigger Phrases

- "empire status", "what's live?", "infrastructure check"
- "system health", "status report", "what's running?"
- "show me everything", "empire overview"

## Status Check Procedure

Run these checks in order. Report results as a structured status table.

### 1. Heaven (Consent Kernel API)

```bash
# Health check
curl -s https://heaven.rsp-5f3.workers.dev/health | jq .

# Endpoint count verification
curl -s -H "X-NOIZY-Key: $NOIZY_API_KEY" \
  https://heaven.rsp-5f3.workers.dev/api/v1/stats | jq .

# Never Clauses (must be 9 active)
curl -s -H "X-NOIZY-Key: $NOIZY_API_KEY" \
  https://heaven.rsp-5f3.workers.dev/api/v1/never-clauses | jq '.data | length'

# Actors (RSP_001 must exist)
curl -s -H "X-NOIZY-Key: $NOIZY_API_KEY" \
  https://heaven.rsp-5f3.workers.dev/api/v1/actors | jq '.data[0].actor_id'

# KPI Dashboard
curl -s -H "X-NOIZY-Key: $NOIZY_API_KEY" \
  https://heaven.rsp-5f3.workers.dev/api/v1/kpi/trust | jq .
```

### 2. DreamChamber (Local AI Command Center)

```bash
# Health check (local)
curl -s http://localhost:7777/health | jq . 2>/dev/null || echo "NOT RUNNING"
```

### 3. Voice Bridge

```bash
curl -s http://localhost:8080/health | jq . 2>/dev/null || echo "NOT RUNNING"
```

### 4. MCP Servers

Check all 9 servers have their dependencies installed:

```bash
for dir in mcp/*/; do
  name=$(basename "$dir")
  if [ -f "$dir/node_modules/.package-lock.json" ] || [ -f "$dir/package-lock.json" ]; then
    echo "$name: READY"
  elif [ -f "$dir/package.json" ]; then
    echo "$name: NEEDS npm install"
  elif [ -f "$dir/pyproject.toml" ] || [ -f "$dir/setup.py" ]; then
    echo "$name: Python MCP"
  fi
done
```

### 5. Agent Definitions

```bash
# Count agent definitions
ls -1 .claude/agents/*.md 2>/dev/null | wc -l
# Should be 10
```

### 6. Skills

```bash
# Count skills
ls -1d .claude/skills/*/SKILL.md 2>/dev/null | wc -l
```

### 7. Cloudflare Resources

Via Cloudflare MCP or wrangler:

```bash
# Workers
npx wrangler deployments list 2>/dev/null | head -5

# D1 Databases
npx wrangler d1 list 2>/dev/null

# KV Namespaces
npx wrangler kv:namespace list 2>/dev/null | head -20
```

## Status Report Format

```
NOIZY EMPIRE STATUS REPORT
===========================
Date: [timestamp]
Machine: GOD.local (M2 Ultra)
Operator: RSP_001

LIVE SYSTEMS:
  [UP/DOWN] Heaven        — heaven.rsp-5f3.workers.dev
  [UP/DOWN] DreamChamber    — localhost:7777
  [UP/DOWN] Voice Bridge    — localhost:8080
  [UP/DOWN] noizy.ai        — noizy.ai (pending deploy)

CONSENT KERNEL:
  Never Clauses:  [9/9 active]
  Actors:         [count]
  Tokens:         [count active]
  Violations:     [count]
  Ledger entries: [count]

MCP SERVERS (9):
  [READY/NEEDS INSTALL] gabriel-mcp       (4 tools)
  [READY/NEEDS INSTALL] lucy-mcp          (11 tools)
  [READY/NEEDS INSTALL] heaven-mcp      (12 tools)
  [READY/NEEDS INSTALL] engr-keith-mcp    (6 tools)
  [READY/NEEDS INSTALL] dream-mcp         (5 tools)
  [READY/NEEDS INSTALL] cb01-mcp          (6 tools)
  [READY/NEEDS INSTALL] shirley-mcp       (6 tools)
  [READY/NEEDS INSTALL] family-mcp        (6 tools)
  [READY/NEEDS INSTALL] audio-mcp         (13 tools)

AGENTS: [10/10 definitions loaded]
SKILLS: [count loaded]

CLOUDFLARE:
  Account:    Fishmusicinc (2446d788)
  Workers:    [count]
  D1 DBs:     [count]
  KV:         [count]
  R2:         NOT ENABLED

ROADMAP:
  Completed:  [count] items
  Pending:    [count] items
  Next up:    [item]

WARNINGS:
  [list any issues found]
```

## Key Metrics to Track

| Metric | Target | How to Check |
|--------|--------|-------------|
| Never Clauses active | 9 | API query |
| Consent coverage | 100% | KPI trust view |
| Violations | 0 | Ledger query |
| Creator royalty | 75% | Rate table check |
| Estate duration | Infinite | Estate table check |
| Health response | < 200ms | curl timing |
| MCP servers ready | 9/9 | Package check |
| Agent defs loaded | 10/10 | File count |

## Infrastructure IDs Quick Reference

| Resource | ID |
|----------|-----|
| D1 gabriel_db | a31d68e2-f2d4-4203-a803-8039fdff31cb |
| D1 agent-memory | 7b813205-fd12-4a23-84a6-ce83bc49ec70 |
| D1 noizyanthropic | 932e36f7-b5a9-4063-a8d2-4e88cfc874c5 |
| GABRIEL_KV | f205b56a9914413da0ec454a9dc4c2bd |
| GABRIEL_VOICE | 16532a32b2e8455486cc966403f3442e |
| CF Account | rsp@noizy.ai — 5f36aa9795348ea681d0b21910dfc82a |
| CF Login | rsp@noizyfish.com (MIGRATE TO rsplowman@icloud.com) |

## Rules

- Run this check at the START of every major work session
- Report any DOWN systems immediately
- If Never Clauses < 9, STOP everything and investigate
- If ledger shows violations, escalate to RSP_001
- Log the status report to DAZEFLOW via Lucy
