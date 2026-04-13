---
description: Deploy Heaven Cloudflare Worker to production
---

Deploy the HEAVEN Consent Kernel worker to Cloudflare.

Steps:

1. Check wrangler is authenticated
// turbo
Run: `npx wrangler whoami` from `/Users/m2ultra/NOIZYLAB`

2. Deploy the worker
// turbo
Run: `bash deploy.sh` from `/Users/m2ultra/NOIZYLAB`

3. Verify the deployment is healthy
// turbo
Run: `curl -s https://heaven.rsp-5f3.workers.dev/health | python3 -m json.tool` from `/Users/m2ultra/NOIZYLAB`

4. Run the smoke test suite to confirm all 14 endpoints pass
Run: `bash smoke_test.sh` from `/Users/m2ultra/NOIZYLAB`

5. Report the deployment result — include the worker version from the health response and the smoke test pass/fail count.
