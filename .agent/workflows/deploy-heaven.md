# /deploy-heaven — Deploy Heaven Consent Kernel

Full deploy procedure with all safety gates. CB01 leads, ENGR_KEITH validates.

## Steps

1. CB01: Pre-flight checks
   - Verify `.env` is present and contains NOIZY_API_KEY
   - Verify D1 database ID is agent-memory / 7b813205 (NOT gabriel_db / f75939d5)
   - Run `npx wrangler d1 list` to confirm database binding
2. ENGR_KEITH: Schema validation
   - Check all 25 tables exist in D1
   - Verify 9 views are intact
   - Confirm noizy_ledger is append-only (no UPDATE/DELETE triggers)
3. If changes touch consent logic: run consent-audit workflow first (MANDATORY)
4. Run smoke tests: `bash smoke_test.sh`
   - All 14 tests must pass
   - Any failure = STOP. Do not deploy.
5. Deploy: `npx wrangler deploy`
6. Post-deploy verification:
   - `curl https://heaven.rsp-5f3.workers.dev/health`
   - Verify response contains `{ success: true }`
   - Check KV cache is warming
7. LUCY: Log deploy event to DAZEFLOW
8. Report: "Heaven deployed. Health: [OK/FAIL]. Smoke: [14/14]."
