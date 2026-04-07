---
description: Coding standards, conventions, and patterns for all NOIZY Empire code.
---

# CODING STANDARDS

## JavaScript / Node.js (Heaven, DreamChamber, Voice Bridge)

- **Formatting**: Prettier with default config (enforced by pre-commit hook)
- **Style**: ES modules where supported, CommonJS in older Node code
- **Async**: Always use async/await, never raw Promise chains
- **Error handling**: Try/catch with specific error messages, never swallow errors
- **Logging**: Structured JSON logs to `logs/` directory (not CWD)
- **Environment**: All secrets via `.env` files, never hardcoded

## Cloudflare Worker Patterns (Heaven)

- Response format: `{ success: boolean, data?: any, error?: string, timestamp: string }`
- Auth check: `X-NOIZY-Key` header validated on every protected route
- Rate limiting: KV-based, 60 req/min/IP
- Cache: KV with TTL (health 30s, actors 5min, rate-table 10min, union-tiers 1hr)
- Cache invalidation: fires on ALL write operations
- All POST operations: log to `noizy_ledger` automatically

## Python (MCP Servers, Audio Pipeline)

- **Formatting**: Black + isort
- **Type hints**: Required on all function signatures
- **Models**: Pydantic v2 for all input/output validation
- **MCP pattern**: FastMCP with `@mcp.tool` decorators and Pydantic input models
- **Dependencies**: `pip install --break-system-packages` on GOD.local

## SQL (D1 / PostgreSQL)

- Table names: `hvs_` prefix for consent kernel, `noizy_` for platform
- Column names: snake_case
- All tables MUST have `created_at` and `updated_at` timestamps
- Never Clause checks: `SELECT ... WHERE actor_id = ? AND is_active = 1`
- Ledger inserts: append-only, never UPDATE or DELETE

## Security Rules

- NEVER commit `.env` files or API keys
- NEVER log API keys or tokens to console
- NEVER bypass Never Clause checks for any reason
- All new endpoints MUST have auth check
- All new write endpoints MUST log to ledger
- C2PA content credentials on all synth responses

## Git Conventions

- Commit messages: imperative mood, describe the "why"
- Branch naming: `feature/`, `fix/`, `infra/`
- Every stage committed. No stage left open.
- `deploy.sh` runs smoke tests before pushing
