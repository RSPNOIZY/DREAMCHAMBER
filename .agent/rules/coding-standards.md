# NOIZY Empire Coding Standards

## Languages & Runtime

- TypeScript primary | Python (AI/ML) | Bash (infra)
- Runtime: Node 20+ / Bun preferred
- Cloudflare-first: Workers, D1, KV, R2 — no AWS unless explicit

## JavaScript / TypeScript

- ES modules where supported, CommonJS in older Node code
- Always use async/await, never raw Promise chains
- Try/catch with specific error messages, never swallow errors
- Structured JSON logs to `logs/` directory
- All secrets via `.env` files, never hardcoded
- No placeholder comments. No TODO stubs in production. If not deployable, not done.

## Cloudflare Worker Patterns (Heaven)

- Response: `{ success: boolean, data?: any, error?: string, timestamp: string }`
- Auth: `X-NOIZY-Key` header validated on every protected route
- Rate limiting: KV-based, 60 req/min/IP
- Cache: KV with TTL (health 30s, actors 5min, rate-table 10min, union-tiers 1hr)
- All POST operations: log to `noizy_ledger` automatically

## Python (MCP Servers, Audio Pipeline)

- Black + isort formatting
- Type hints required on all function signatures
- Pydantic v2 for all input/output validation
- FastMCP with `@mcp.tool` decorators
- `pip install --break-system-packages` on GOD.local

## SQL (D1)

- Table names: `hvs_` prefix for consent kernel, `noizy_` for platform
- Column names: snake_case
- All tables MUST have `created_at` and `updated_at`
- Ledger: append-only, never UPDATE or DELETE

## Security

- NEVER commit `.env` files or API keys
- NEVER log API keys or tokens
- NEVER bypass Never Clause checks
- All new endpoints MUST have auth check
- All write endpoints MUST log to ledger
- C2PA content credentials on all synth responses

## Git

- Commit messages: imperative mood, describe the "why"
- Branch naming: `feature/`, `fix/`, `infra/`
- Every stage committed. No stage left open.
