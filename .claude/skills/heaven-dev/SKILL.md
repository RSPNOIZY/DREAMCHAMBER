---
name: heaven-dev
description: "API development patterns, endpoint creation, D1/KV patterns, and Covenant integration for the Heaven Cloudflare Worker"
---

# HEAVEN DEV — Consent Kernel API Development

Use this skill when building, modifying, or debugging Heaven endpoints, D1 database schema, KV caching, or any consent kernel logic.

## Trigger Phrases

- "add an endpoint", "new API route", "modify heaven"
- "update schema", "add a table", "migration"
- "KV cache", "rate limiting", "auth check"
- Any work on `src/index.js`, `src/covenant.js`, `schema.sql`, `seed.sql`, `wrangler.toml`

## Architecture Overview

```
Client Request
    |
    v
Cloudflare Edge (nearest POP)
    |
    v
Heaven Worker (src/index.js — 1,571 lines, 55 endpoints)
    |--- Auth: X-NOIZY-Key header validation
    |--- Rate Limit: KV-based, 60 req/min/IP
    |--- Cache: KV with tiered TTLs
    |
    |--- /api/v1/actors          (CRUD)
    |--- /api/v1/never-clauses   (Read + enforce)
    |--- /api/v1/consent-tokens  (CRUD + revoke)
    |--- /api/v1/synth-requests  (Create + audit)
    |--- /api/v1/voice-dna       (Upload + manage)
    |--- /api/v1/descendants     (CRUD)
    |--- /api/v1/licenses        (CRUD)
    |--- /api/v1/licensees       (CRUD)
    |--- /api/v1/rate-table      (Read)
    |--- /api/v1/union-tiers     (Read)
    |--- /api/v1/estates         (CRUD)
    |--- /api/v1/ledger          (Read — append-only)
    |--- /api/v1/kpi/*           (5 KPI views)
    |--- /api/v1/audit           (Enterprise audit view)
    |--- /health                 (Public)
    |--- /dashboard              (Public HTML)
    |
    v
D1 Database: gabriel_db (25 tables + 9 views)
KV: GABRIEL_KV (cache) + GABRIEL_VOICE (voice assets)
```

## New Endpoint Pattern

When creating a new endpoint, follow this exact pattern:

```javascript
// In src/index.js — inside the router

// GET endpoint (read)
router.get('/api/v1/your-resource', async (request, env) => {
  try {
    // 1. Auth check (skip for public endpoints)
    const authError = checkAuth(request, env);
    if (authError) return authError;

    // 2. Cache check
    const cacheKey = 'your-resource:list';
    const cached = await env.GABRIEL_KV.get(cacheKey);
    if (cached) return jsonResponse(JSON.parse(cached));

    // 3. Query D1
    const result = await env.DB.prepare(
      'SELECT * FROM your_table WHERE is_active = 1'
    ).all();

    // 4. Cache result
    const response = { success: true, data: result.results, timestamp: new Date().toISOString() };
    await env.GABRIEL_KV.put(cacheKey, JSON.stringify(response), { expirationTtl: 300 });

    return jsonResponse(response);
  } catch (err) {
    return jsonResponse({ success: false, error: err.message, timestamp: new Date().toISOString() }, 500);
  }
});

// POST endpoint (write)
router.post('/api/v1/your-resource', async (request, env) => {
  try {
    // 1. Auth
    const authError = checkAuth(request, env);
    if (authError) return authError;

    // 2. Parse + validate body
    const body = await request.json();
    if (!body.required_field) {
      return jsonResponse({ success: false, error: 'required_field is required', timestamp: new Date().toISOString() }, 400);
    }

    // 3. Write to D1
    const id = crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO your_table (id, field, created_at, updated_at) VALUES (?, ?, datetime("now"), datetime("now"))'
    ).bind(id, body.required_field).run();

    // 4. Log to ledger (MANDATORY for all writes)
    await env.DB.prepare(
      'INSERT INTO noizy_ledger (event_type, actor_id, details, created_at) VALUES (?, ?, ?, datetime("now"))'
    ).bind('YOUR_RESOURCE_CREATED', body.actor_id || 'SYSTEM', JSON.stringify({ id, ...body })).run();

    // 5. Invalidate relevant caches
    await env.GABRIEL_KV.delete('your-resource:list');

    return jsonResponse({ success: true, data: { id }, timestamp: new Date().toISOString() }, 201);
  } catch (err) {
    return jsonResponse({ success: false, error: err.message, timestamp: new Date().toISOString() }, 500);
  }
});
```

## Database Schema Pattern

```sql
-- New table template
CREATE TABLE IF NOT EXISTS hvs_your_table (
    id TEXT PRIMARY KEY,
    actor_id TEXT NOT NULL REFERENCES hvs_actors(actor_id),
    -- your columns here --
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Index on foreign keys
CREATE INDEX IF NOT EXISTS idx_your_table_actor ON hvs_your_table(actor_id);
```

**Naming rules:**
- `hvs_` prefix for consent kernel tables
- `noizy_` prefix for platform tables
- snake_case columns
- ALWAYS include `created_at` and `updated_at`

## Response Format (MANDATORY)

Every endpoint returns:

```json
{
  "success": true|false,
  "data": { ... },       // on success
  "error": "message",    // on failure
  "timestamp": "ISO8601"
}
```

Status codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden/Never Clause), 404 (Not Found), 500 (Error)

## KV Caching Strategy

| Resource | TTL | Invalidation |
|----------|-----|-------------|
| /health | 30s | Auto-expire |
| Actors list | 5min | On actor CRUD |
| Rate table | 10min | On rate change |
| Union tiers | 1hr | On tier change |
| Never Clauses | 5min | On clause change |
| KPI views | 2min | On any write |

**Rule**: ALL write operations MUST invalidate relevant caches.

## Covenant Integration

Any endpoint that processes synthesis MUST go through the Covenant validator:

```javascript
// src/covenant.js — 9 checks in sequence
const covenantResult = await validateCovenant(env, {
  actor_id,
  descendant_id,
  consent_token_id,
  use_category,
  territory,
  license_id  // optional
});

if (!covenantResult.valid) {
  // Log violation to ledger
  await logToLedger(env, 'COVENANT_VIOLATION', actor_id, covenantResult);
  return jsonResponse({ success: false, error: covenantResult.reason, timestamp: new Date().toISOString() }, 403);
}
```

## Infrastructure IDs

```
D1:          gabriel_db — a31d68e2-f2d4-4203-a803-8039fdff31cb
GABRIEL_KV:  f205b56a9914413da0ec454a9dc4c2bd
GABRIEL_VOICE: 16532a32b2e8455486cc966403f3442e
Worker URL:  https://heaven.rsp-5f3.workers.dev
```

## Testing New Endpoints

```bash
# After adding a new endpoint, test it:

# 1. Deploy
npx wrangler deploy

# 2. Test unauthenticated (should 401)
curl -s https://heaven.rsp-5f3.workers.dev/api/v1/your-endpoint | jq .

# 3. Test authenticated
curl -s -H "X-NOIZY-Key: $NOIZY_API_KEY" \
  https://heaven.rsp-5f3.workers.dev/api/v1/your-endpoint | jq .

# 4. Test write
curl -s -X POST -H "X-NOIZY-Key: $NOIZY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"field": "value"}' \
  https://heaven.rsp-5f3.workers.dev/api/v1/your-endpoint | jq .

# 5. Verify ledger entry
curl -s -H "X-NOIZY-Key: $NOIZY_API_KEY" \
  https://heaven.rsp-5f3.workers.dev/api/v1/ledger?limit=1 | jq .
```

## Rules

- EVERY new endpoint MUST have auth check (except /health, /dashboard, /)
- EVERY write endpoint MUST log to noizy_ledger
- EVERY write endpoint MUST invalidate relevant KV caches
- NEVER use UPDATE or DELETE on noizy_ledger
- NEVER hardcode API keys — use env bindings
- ALWAYS include C2PA credentials on synthesis responses
- ALWAYS run the consent-audit skill before deploying changes to covenant logic
