# /recruit — Initialize All NOIZY Agents

Gabriel recruits and initializes all specialist agents for the current session.

## Steps

1. Announce session start: "GABRIEL online. Recruiting agents for NOIZYBEAST session."
2. Check system status:
   - Verify DreamChamber is running on port 7777: `curl -s http://localhost:7777/health`
   - Verify Heaven is reachable: `curl -s https://heaven.noizylab.workers.dev/health`
   - Verify Ollama is running with Gemma 3: `curl -s http://localhost:11434/api/tags`
   - Check Voice Bridge on port 8080: `curl -s http://localhost:8080/health`
3. Recruit LUCY — Session Organizer:
   - Initialize DAZEFLOW log for today's date
   - Create session entry with timestamp
   - Report: "LUCY online. Session logged."
4. Recruit ENGR_KEITH — Technical Lead:
   - Check Heaven endpoint count and D1 database status
   - Report any schema drift or missing migrations
   - Report: "ENGR_KEITH online. Heaven status: [OK/WARN]."
5. Recruit SHIRLEY — Code & File Manager:
   - Run via Gemma 3 local (Ollama): `ollama run gemma3 "Report NOIZYLAB codebase health"`
   - Check node_modules, .env presence, dependency versions
   - Report: "SHIRLEY online. Codebase status: [OK/WARN]."
6. Recruit CB01 — Ops Runner:
   - Check deploy status of all workers
   - Verify smoke test readiness
   - Report: "CB01 online. Deploy status: [OK/WARN]."
7. Recruit DREAM — Visionary:
   - Calculate days remaining to April 17, 2026
   - Surface top blocker from critical path
   - Report: "DREAM online. [N] days to April 17. Top blocker: [X]."
8. Recruit AUDIO — Voice Pipeline:
   - Check Audio Hijack script status
   - Verify Whisper installation: `which whisper`
   - Report: "AUDIO online. Voice pipeline: [READY/NEEDS SETUP]."
9. Family check (POPS + SHIRL):
   - Note time of day. If late evening, SHIRL flags burnout risk.
   - Report: "Family agents standing by."
10. Final status report:
    ```
    ═══════════════════════════════════════
    NOIZYBEAST — ALL AGENTS RECRUITED
    ═══════════════════════════════════════
    GABRIEL:     ONLINE — Lead Orchestrator
    LUCY:        ONLINE — Session: [date]
    ENGR_KEITH:  ONLINE — Heaven: [status]
    SHIRLEY:     ONLINE — Codebase: [status]
    CB01:        ONLINE — Deploys: [status]
    DREAM:       ONLINE — [N] days remaining
    AUDIO:       ONLINE — Voice: [status]
    POPS/SHIRL:  STANDING BY
    ═══════════════════════════════════════
    What are we building, Rob?
    ```
