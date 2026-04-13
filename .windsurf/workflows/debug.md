---
description: Debug DreamChamber — check logs, test endpoints, diagnose issues
---

Diagnose issues with DreamChamber or Heaven. Gather all diagnostic info before suggesting fixes.

Steps:

1. Check if DreamChamber is running and healthy
// turbo
Run: `curl -s --max-time 3 http://localhost:7777/health || echo "NOT_RUNNING"` from `/Users/m2ultra/NOIZYLAB`

2. Tail the last 50 lines of all DreamChamber logs
// turbo
Run: `ls dreamchamber/logs/ 2>/dev/null && tail -n 50 dreamchamber/logs/*.log 2>/dev/null || echo "No logs found"` from `/Users/m2ultra/NOIZYLAB`

3. Check PM2 process list (if using PM2)
// turbo
Run: `pm2 list 2>/dev/null || echo "PM2 not running"` from `/Users/m2ultra/NOIZYLAB`

4. Verify all required env vars are set (without exposing values)
// turbo
Run: `node -e "const keys=['ANTHROPIC_API_KEY','JWT_SECRET','NOIZY_API_KEY','HEAVEN_URL','DATABASE_URL']; require('dotenv').config({path:'dreamchamber/.env'}); keys.forEach(k=>console.log(k+':', process.env[k]?'SET':'MISSING'))"` from `/Users/m2ultra/NOIZYLAB`

5. Test the Heaven kernel connection
// turbo
Run: `source .env && curl -s -H "X-NOIZY-Key: $NOIZY_API_KEY" https://heaven.rsp-5f3.workers.dev/health` from `/Users/m2ultra/NOIZYLAB`

6. Test a basic Gabriel speak (if DreamChamber is running)
// turbo
Run: `curl -s -X POST http://localhost:7777/api/gabriel/speak -H 'Content-Type: application/json' -d '{"message":"status check"}' 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "Gabriel endpoint unavailable"` from `/Users/m2ultra/NOIZYLAB`

7. Read the relevant source file(s) for any errors found in the logs.
   Analyze all collected diagnostic data and report:
   - Root cause of any errors
   - Which service is failing
   - Specific file and line if identifiable
   - Recommended fix
