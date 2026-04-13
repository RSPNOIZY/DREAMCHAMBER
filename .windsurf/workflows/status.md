---
description: Check health and status of all NOIZY Empire services
---

Check the live status of every service in the NOIZY Empire.

Steps:

1. Check Heaven Worker (live Cloudflare edge)
// turbo
Run: `curl -s https://heaven.rsp-5f3.workers.dev/health` from `/Users/m2ultra/NOIZYLAB`

2. Check Heaven Stats (requires auth)
// turbo
Run: `source .env && curl -s -H "X-NOIZY-Key: $NOIZY_API_KEY" https://heaven.rsp-5f3.workers.dev/api/v1/stats` from `/Users/m2ultra/NOIZYLAB`

3. Check DreamChamber (local)
// turbo
Run: `curl -s --max-time 2 http://localhost:7777/health || echo "NOT_RUNNING"` from `/Users/m2ultra/NOIZYLAB`

4. Check Voice Bridge Server (local)
// turbo
Run: `lsof -ti:8080 | head -1 | xargs -I{} sh -c 'echo "RUNNING (PID {})"' 2>/dev/null || echo "NOT_RUNNING"` from `/Users/m2ultra/NOIZYLAB`

5. Check git status
// turbo
Run: `git log --oneline -5` from `/Users/m2ultra/NOIZYLAB`

6. Summarize all results in a clean status table:
   - HEAVEN: status, actor count, ledger event count
   - DreamChamber: RUNNING / NOT RUNNING
   - Voice Bridge: RUNNING / NOT RUNNING
   - Git: last 3 commits
   - Any warnings or issues found
