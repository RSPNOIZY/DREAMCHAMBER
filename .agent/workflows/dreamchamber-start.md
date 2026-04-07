# /dreamchamber — Start DreamChamber

Launch the DreamChamber multi-model AI command center.

## Steps

1. Pre-flight:
   - Check if port 7777 is already in use: `lsof -i :7777`
   - If running, report status and skip to step 5
   - Verify `dreamchamber/node_modules/` exists, run `npm install` if not
   - Verify `dreamchamber/.env` exists with required keys
2. Required .env keys (check presence, NOT values):
   - ANTHROPIC_API_KEY
   - OPENAI_API_KEY (optional)
   - GOOGLE_AI_API_KEY (optional)
   - TOGETHER_API_KEY (optional)
   - GABRIEL_MODEL (default: claude-sonnet-4)
   - NOIZY_API_KEY
3. Start DreamChamber:
   - `cd dreamchamber && npm start`
   - Wait for "Server running on port 7777" message
4. Post-start verification:
   - `curl -s http://localhost:7777/health`
   - Verify Gabriel profile loaded
   - Verify Heaven bridge connected
5. Report:
   ```
   DREAMCHAMBER — ONLINE
   Port: 7777
   Providers: [list active]
   Gabriel: [LOADED/ERROR]
   Heaven: [CONNECTED/DISCONNECTED]
   WebSocket: [READY]
   ```
6. CRITICAL: Single process mode only. Never run multiple instances.
