# Create New Heaven Endpoint

Add a new REST endpoint to the Heaven Consent Kernel API following all established patterns.

## Before You Start

1. Read the `heaven-dev` skill (`.claude/skills/heaven-dev/SKILL.md`)
2. Read `src/index.js` to understand the existing router structure
3. Identify which table(s) the endpoint will query

## Endpoint Specification

Define these before writing code:
- **Method**: GET / POST / PUT / DELETE
- **Path**: `/api/v1/<resource>`
- **Auth required**: Yes (unless public like /health)
- **Request body schema** (for POST/PUT)
- **Response schema**
- **D1 table(s) touched**
- **KV cache key** (if cacheable)
- **Ledger event type** (for writes)

## Implementation Checklist

- [ ] Auth check (`checkAuth(request, env)`)
- [ ] Input validation (all required fields checked)
- [ ] KV cache check (for reads)
- [ ] D1 query with parameterized bindings (never string concatenation)
- [ ] Response format: `{ success, data, timestamp }` or `{ success, error, timestamp }`
- [ ] Ledger entry (for all writes)
- [ ] Cache invalidation (for all writes)
- [ ] Error handling with try/catch
- [ ] Correct HTTP status codes (200/201/400/401/403/404/500)

## After Implementation

1. Deploy: `npx wrangler deploy`
2. Test unauthenticated → expect 401
3. Test authenticated → expect correct response
4. Test write → verify ledger entry created
5. Run full smoke test suite: `bash smoke_test.sh`
6. Run consent-audit skill if endpoint touches consent logic
