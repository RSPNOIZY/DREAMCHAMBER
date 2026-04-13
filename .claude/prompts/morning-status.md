# Morning Status Check

Run a complete NOIZY Empire status check at the start of every work session.

## Sequence

1. **Health Checks**
   - `curl -s https://heaven.rsp-5f3.workers.dev/health | jq .`
   - `curl -s http://localhost:7777/health` (DreamChamber — may be down)
   - `curl -s http://localhost:8080/health` (Voice Bridge — may be down)

2. **Consent Integrity**
   - Never Clauses: must be 9 active
   - Ledger: check for any VIOLATION events since last session
   - KPI trust score

3. **MCP Server Status**
   - Check each of the 9 servers has node_modules installed
   - Verify `.claude/mcp-config-godlocal.json` matches current server list

4. **Agent Readiness**
   - Count `.claude/agents/*.md` — should be 10
   - Count `.claude/skills/*/SKILL.md` — should be 5+

5. **Roadmap Progress**
   - Review CLAUDE.md ACTIVE ROADMAP section
   - Identify next pending item

6. **Wellbeing Check**
   - What time is it? If before 6am or after 10pm → flag
   - Last session duration? If > 4 hours → Pops says rest

## Output

Provide a concise status report. Flag anything RED. Celebrate anything new that's LIVE.
