---
description: Start DreamChamber AI Command Center on port 7777
---

Start the DreamChamber server locally for development.

Steps:

1. Check if DreamChamber is already running on port 7777
// turbo
Run: `lsof -ti:7777 | head -1` from `/Users/m2ultra/NOIZYLAB`

If a PID is returned, the server is already running — report this to the user and ask if they want to restart it.

2. Check that the .env file exists and has required keys
// turbo
Run: `grep -c 'ANTHROPIC_API_KEY\|JWT_SECRET\|NOIZY_API_KEY' dreamchamber/.env` from `/Users/m2ultra/NOIZYLAB`

If the count is less than 3, warn the user that required env vars may be missing.

3. Install dependencies if node_modules is missing or outdated
Run: `npm install` from `/Users/m2ultra/NOIZYLAB/dreamchamber`

4. Start the development server (non-blocking)
Run: `npm run dev` from `/Users/m2ultra/NOIZYLAB/dreamchamber`

5. Wait for server to be ready, then open browser
// turbo
Run: `sleep 3 && curl -s http://localhost:7777/health` from `/Users/m2ultra/NOIZYLAB`

6. Report server status. If healthy, tell the user DreamChamber is live at http://localhost:7777
