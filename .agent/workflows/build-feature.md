# /build — Build a New Feature

Gabriel orchestrates feature development across the agent team.

## Steps

1. GABRIEL: Receive feature description from Rob
2. DREAM: Check alignment with NOIZY mission and critical path
   - Does this advance April 17 goals?
   - Does it respect Never Clauses?
   - What's the strategic value?
3. ENGR_KEITH: Technical assessment
   - Which systems are involved? (Heaven, DreamChamber, Voice Pipeline, etc.)
   - What's the schema impact?
   - What endpoints need creating/modifying?
   - Estimate complexity (S/M/L)
4. GABRIEL: Create build plan
   - Break into numbered steps
   - Assign each step to the right agent
   - Identify dependencies between steps
   - Flag any consent-audit requirements
5. Execute build plan:
   - SHIRLEY: Create/modify files
   - ENGR_KEITH: API endpoints, schema changes
   - CB01: Infrastructure, deploy configs
   - AUDIO: Voice pipeline changes (if applicable)
6. ENGR_KEITH: Code review
   - Security check
   - Pattern compliance
   - Error handling
   - Ledger logging on writes
7. If touches consent: run /consent-audit workflow
8. CB01: Run smoke tests
9. LUCY: Log to DAZEFLOW
10. GABRIEL: Report completion to Rob
