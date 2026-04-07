---
description: Heaven Cloudflare Worker API — endpoints, database schema, KV namespaces, infrastructure IDs.
paths:
  - "src/index.js"
  - "src/dashboard.js"
  - "src/covenant.js"
  - "wrangler.toml"
  - "schema.sql"
  - "seed.sql"
---

# HEAVEN — CONSENT KERNEL API

## Live Infrastructure

- **URL**: `https://heaven.noizylab.workers.dev`
- **Auth**: `X-NOIZY-Key` header (except /health, /dashboard, /)
- **Source**: `src/index.js` (1,571 lines) + `src/dashboard.js` + `src/covenant.js`
- **Version**: v3.5.0 — 55 authenticated REST endpoints
- **Deploy**: `npx wrangler deploy` from project root

## Infrastructure IDs (AUTHORITATIVE — updated 2026-03-30)

```
Worker:        heaven @ heaven.noizylab.workers.dev
D1 Database:   gabriel_db — fc0edd97-5a4c-49ff-a5fb-b3d7d8fda1aa  ← LIVE
               ⚠️ f75939d5 = DEAD. Never use.
GABRIEL_KV:    6fe434a8020147c7bc4788e7057b843a
GABRIEL_VOICE: afef27e69f634d2b941482435d042167
NOIZY_API_KEY: in .env (NEVER COMMIT)
```

## Database: gabriel_db (25 tables + 9 views)

| Table | Status | Notes |
|-------|--------|-------|
| hvs_actors | Seeded | RSP_001 founding actor |
| hvs_never_clauses | Seeded | 9 clauses (6 personal + 3 system) |
| hvs_voice_dna | Live | Ready for first recording |
| hvs_descendants | Live | Synthetic voice models |
| hvs_consent_tokens | Live | Scoped, revocable tokens |
| hvs_synth_requests | Live | Never Clause checked on every request |
| hvs_licenses | Live | License registry |
| hvs_licensees | Live | Licensee registry |
| hvs_rate_table | Seeded | 10 use categories |
| hvs_union_tiers | Seeded | 5 tiers (2%→10%) |
| hvs_estates | Seeded | EST-RSP-001 active |
| hvs_premis_events | Live | OAIS/PREMIS archival events |
| noizy_ledger | Seeded | GENESIS-RSP-001 entry |

Views: kpi_trust, kpi_safety, kpi_revenue, kpi_quality, kpi_risk, enterprise_audit + 3 more

## KV Namespaces

| Binding | Purpose | Caching |
|---------|---------|---------|
| GABRIEL_KV | Rate limiting (60 req/min/IP) + response caching | health 30s, actors 5min, rate-table 10min, union-tiers 1hr |
| GABRIEL_VOICE | Voice asset storage | — |

Cache invalidation fires on all write operations.

## Key API Patterns

- All endpoints return JSON with `{ success, data?, error?, timestamp }`
- Auth failures return 401 with `{ error: "Unauthorized" }`
- Never Clause violations return 403 with clause details
- POST operations log to noizy_ledger automatically
- C2PA content credentials attached to synth request responses
- New endpoint: `GET /api/v1/synth-requests/:id/c2pa` for credential retrieval

> **Skill**: Use `heaven-dev` skill when adding new endpoints. Use `consent-audit` before deploying.

## Verified D1 Databases (2026-03-25)

| Database | ID | Size | Purpose |
|----------|-----|------|---------|
| gabriel_db | fc0edd97-5a4c-49ff-a5fb-b3d7d8fda1aa | 565KB | Primary consent kernel |
| agent-memory | 7b813205-fd12-4a23-84a6-ce83bc49ec70 | 2.5MB | Agent persistent memory |
| noizyanthropic | 932e36f7-b5a9-4063-a8d2-4e88cfc874c5 | 80KB | Anthropic integration |

## Verified KV Namespaces (2026-03-25)

| Binding | ID | Purpose |
|---------|-----|---------|
| GABRIEL_KV | 68710a32a1814ce7994a5be532f871cc | Rate limiting + cache |
| GABRIEL_VOICE | 28f2fdce465243759e7f5df6468c8228 | Voice asset storage |

Note: KV IDs in wrangler.toml may use different bindings. The IDs above are the Cloudflare account-level namespace IDs verified via API.
