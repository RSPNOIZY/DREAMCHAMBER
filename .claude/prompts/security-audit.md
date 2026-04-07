# Security Audit

Run a comprehensive security audit of the NOIZY Empire codebase and infrastructure.

## Scope

All code in `src/`, `schema.sql`, `seed.sql`, `wrangler.toml`, MCP servers, and deployment scripts.

## Audit Checklist

### 1. Secrets Exposure
```bash
grep -rn "NOIZY_API_KEY\|sk-ant-\|sk-\|API_KEY=" src/ mcp/ scripts/ --include="*.js" --include="*.sh" | grep -v ".env\|node_modules"
grep -rn "password\|secret\|token" src/ --include="*.js" | grep -v "consent_token\|token_id\|checkAuth"
```
MUST return empty (or only false positives in variable names).

### 2. Never Clause Integrity
Run the full consent-audit skill checklist (9 points).

### 3. Ledger Immutability
```bash
grep -rn "UPDATE.*noizy_ledger\|DELETE.*noizy_ledger\|DROP.*noizy_ledger" src/ schema.sql seed.sql
```
MUST return empty.

### 4. Auth Coverage
Every endpoint in `src/index.js` (except /health, /dashboard, /) must call `checkAuth`.
```bash
# Find routes without auth
grep -n "router\.\(get\|post\|put\|delete\)" src/index.js | grep -v "health\|dashboard\|checkAuth"
```

### 5. SQL Injection
All D1 queries must use parameterized bindings (`.bind()`), never string concatenation.
```bash
grep -n "prepare(" src/index.js | grep -v "\.bind\|\.all()\|\.run()\|\.first()"
```

### 6. Rate Limiting
Verify KV-based rate limiting is active (60 req/min/IP).

### 7. C2PA Credentials
Verify synth responses include content credentials.

### 8. Environment Security
- `.env` is in `.gitignore`
- No secrets in `wrangler.toml`
- MCP configs don't contain API keys

### 9. Infrastructure Access
- CF login status (still rsp@noizyfish.com — migration needed)
- R2 not enabled (voice storage pending)
- GoDaddy exit dependency flagged

## Output

```
SECURITY AUDIT REPORT
=====================
Date: [timestamp]
Scope: Full codebase + infrastructure

[PASS/FAIL] 1. Secrets Exposure
[PASS/FAIL] 2. Never Clause Integrity
[PASS/FAIL] 3. Ledger Immutability
[PASS/FAIL] 4. Auth Coverage
[PASS/FAIL] 5. SQL Injection Prevention
[PASS/FAIL] 6. Rate Limiting
[PASS/FAIL] 7. C2PA Credentials
[PASS/FAIL] 8. Environment Security
[PASS/FAIL] 9. Infrastructure Access

VERDICT: SECURE / AT RISK / CRITICAL
FINDINGS: [detailed list]
RECOMMENDATIONS: [prioritized actions]
```
