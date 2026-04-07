# Deploy Heaven

Deploy the Heaven Consent Kernel API to Cloudflare Workers with full safety checks.

## Steps

1. Run the consent-audit skill checklist against any changed files in `src/`
2. Verify `wrangler.toml` has D1 database_id = `fc0edd97-5a4c-49ff-a5fb-b3d7d8fda1aa`
3. Check for exposed secrets: `grep -r "NOIZY_API_KEY\|sk-" src/ --include="*.js"`
4. Run `npx wrangler deploy`
5. Run `bash smoke_test.sh` — all 14 tests must pass
6. Verify health: `curl -s https://heaven.noizylab.workers.dev/health | jq .`
7. Verify Never Clauses: must return 9 active
8. Log the deploy to DAZEFLOW via Lucy

If any check fails, STOP and report. Do not continue to the next step.
