---
description: Run the full 14-test smoke test suite against the live Heaven worker
---

Run smoke tests against the live HEAVEN Consent Kernel to verify all endpoints are operational.

Steps:

1. Confirm the NOIZY_API_KEY is available
// turbo
Run: `grep -q NOIZY_API_KEY .env && echo "KEY FOUND" || echo "KEY MISSING"` from `/Users/m2ultra/NOIZYLAB`

If the key is missing, stop and tell the user to set NOIZY_API_KEY in ~/NOIZYLAB/.env

2. Run the full smoke test suite
Run: `bash smoke_test.sh` from `/Users/m2ultra/NOIZYLAB`

3. Parse results and report:
   - Total PASSED / FAILED count
   - List any failed tests with their HTTP status
   - Confirm if all 14 tests passed
   - Show the live dashboard URL at the end
