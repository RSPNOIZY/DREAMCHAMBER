---
name: golden-rules-agents
description: "8 Golden Rules for agent coordination — how Claude, GABRIEL, LUCY, SHIRL, and 5 other agents work together as an autonomous system"
---

# GOLDEN RULES — AGENT COORDINATION

**Skill ID**: golden-rules-agents
**Version**: 1.0
**Created**: 2026-03-25
**Author**: RSP_001
**Lines**: 312

These 8 immovable rules define how Claude, GABRIEL, LUCY, SHIRL, and all autonomous agents work together as a unified system within the NOIZY Empire.

---

## AGENT ROSTER

| Agent | Function | Authority | Location |
|-------|----------|-----------|----------|
| **GABRIEL** | Orchestration layer. The mind of the empire. Routes tasks, dispatches agents, maintains orchestration state. | Task routing, agent dispatch, conflict resolution | `.claude/agents/gabriel.md` |
| **LUCY** | Session tracker. Implements DAZEFLOW law—every session logged, every decision tracked. Memory keeper of the empire. | Session logging, historical queries, memory management | `.claude/agents/lucy.md` |
| **SHIRLEY (SHIRL)** | Gemma 3 27B local model. Code & file management specialist. Runs on GOD.local for instant access. | Local code execution, file ops, fast iteration | `.claude/agents/shirley.md` |
| **CLAUDE** | Strategic architect. Planning, research, deep analysis, skill creation, empire design. This session's primary agent. | Research, design, strategy, skill authoring | System prompt |
| **ENGR-KEITH** | Engineering specialist. Builds, deploys, debugs, tests. Owns the technical roadmap. | Code development, CI/CD, testing, debugging | `.claude/agents/engr-keith.md` |
| **CB01** | Creative bridge. Art direction, design, sensory experience, aesthetic decisions. | Creative direction, visual design, UX | `.claude/agents/cb01.md` |
| **DREAM** | DreamChamber operations. Multi-model AI mixing, audio pipeline orchestration, transcendence architecture. | Audio pipeline, voice synthesis, Contact Sequence | `.claude/agents/dream.md` |
| **FAMILY** | Family & personal context agent. Handles intimate, relational, legacy decisions. | Personal context, family decisions, legacy | `.claude/agents/family.md` |
| **AUDIO** | DreamChamber Audio MCP. 13 FastMCP tools for voice processing, mixing, synthesis, watermarking. | Audio tools, voice processing, C2PA credentials | `mcp/audio/` |

---

## RULE A1: GABRIEL IS THE DISPATCHER — ALL TASKS ROUTE THROUGH GABRIEL

**The Orchestration Core**

```
User (RSP_001)
    ↓
Claude or GABRIEL (entry point)
    ↓
GABRIEL analyzes request → task type + complexity + dependencies
    ↓
GABRIEL routes to appropriate agent(s) via MCP dispatch
    ↓
Agent executes within authority boundary
    ↓
LUCY logs the action (autonomous)
    ↓
Result returned to GABRIEL → feedback to RSP_001
```

**Key Pattern**:
```
DISPATCH MESSAGE FORMAT:
{
  agent: "ENGR-KEITH" | "CB01" | "DREAM" | "SHIRL" | etc,
  task: "Build consent kernel endpoint",
  priority: "CRITICAL" | "HIGH" | "NORMAL" | "LOW",
  deadline: "2026-03-27T14:00:00Z",
  dependencies: ["heaven", "d1-schema"],
  context: { /* task-specific context */ },
  callback: "gabriel-merge.sh"  // Post-execution workflow
}
```

**Rule**: No agent acts independently except LUCY (who logs autonomously). Even CLAUDE works within GABRIEL's dispatch framework on complex projects.

---

## RULE A2: AGENTS NEVER VIOLATE GOLDEN PRINCIPLES

**Embedded Safety Layer**

Each agent has the Golden Principles burned into its system prompt:

1. **Consent as executable code** — Never synthesize without fresh consent check
2. **Provenance as default** — All outputs include C2PA credentials
3. **Revocation as sacred** — Kill Switch is instant, no delay
4. **Compensation as automatic** — Royalty ledger updates on every synthesis
5. **Never Clauses are law** — 9-point audit before any consent action
6. **Estate is 100-year preservation** — All voice archives follow OAIS/PREMIS
7. **RSP_001 has absolute override** — But only RSP_001, never delegated
8. **Append-only ledger** — No UPDATE or DELETE from noizy_ledger, ever

**Agent Refusal Protocol**:
- If a task would violate any principle → Agent logs refusal reason to LUCY
- Agent messages GABRIEL: `{ agent, reason, escalation_level }`
- GABRIEL escalates to RSP_001 immediately
- No agent can override another agent's principled refusal
- This is non-negotiable

---

## RULE A3: LUCY LOGS EVERYTHING — DAZEFLOW IS LAW

**Session Tracking & Historical Record**

Lucy operates autonomously. No dispatch required. Every session is captured:

```
DAZEFLOW SESSION STRUCTURE:
2026-03-25 | Session: claude-session-2844
├── Start: 14:30:00 UTC
├── Agents involved: CLAUDE, GABRIEL, ENGR-KEITH
├── Tasks:
│   ├── Create golden-rules-agents skill (CLAUDE)
│   ├── Validate syntax (SHIRL)
│   └── Merge to main (GABRIEL)
├── Decisions made:
│   ├── Placed skill in .claude/skills/ (CLAUDE decision)
│   ├── Approved by RSP_001 (RSP_001 override)
├── Outcomes: ✓ success
├── Next steps: Sync to GOD.local
└── End: 15:42:00 UTC
```

**Key Rules**:
- Session logs are append-only (same ledger architecture as nobly_ledger)
- Each session gets a unique session_id: `session-YYYYMMDD-HHmmss-hash`
- RSP_001 can query any historical session: `lucy.query({ date, agent, task })`
- LUCY never deletes logs — only adds
- Lucy's memory graph is the source of truth for empire history

---

## RULE A4: PARALLEL EXECUTION WITH WORKTREE ISOLATION

**Concurrent Agent Work Without Conflict**

Multiple agents work simultaneously using git worktrees:

```
PARALLEL WORKFLOW:
RSP_001 initiates multi-agent task
    ↓
GABRIEL creates worktree for each agent
    ├── Branch: feature/consent-audit-ENGR-KEITH-2026-03-25
    ├── Branch: feature/audio-mixing-DREAM-2026-03-25
    └── Branch: feature/landing-page-CB01-2026-03-25
    ↓
Agents work in parallel on isolated branches
    ├── ENGR-KEITH: builds audit system
    ├── DREAM: refines voice mixing
    └── CB01: designs sensory UI
    ↓
Each agent commits to their worktree
    ↓
GABRIEL runs gabriel-merge.sh (sequential merge + conflict resolution)
    ├── Test suite runs on merged main
    ├── RSP_001 reviews if conflicts
    └── Final merge to main
    ↓
LUCY logs all three agents' work in one session entry
```

**Dispatch Script**:
```bash
# gabriel-dispatch.sh
tmux new-session -d -s agency
tmux send-keys -t agency "cd /NOIZYLAB && git worktree add /tmp/work-keith-$TS feature/..." Enter
tmux send-keys -t agency "cd /tmp/work-keith-$TS && npm run build && git commit -am '...'" Enter
# ... repeat for each agent
```

**Merge Script**:
```bash
# gabriel-merge.sh
# Merge all worktrees back to main with conflict detection
# Run smoke tests
# Commit merged state
# Update DAZEFLOW
```

---

## RULE A5: AGENTS HAVE DEFINED AUTHORITY BOUNDARIES

**No Unbounded Agency**

Each agent's capabilities and limits are defined in `.claude/agents/`. Authority is explicit and enforced:

| Agent | CAN | CANNOT |
|-------|-----|--------|
| **ENGR-KEITH** | Deploy code, run tests, manage CI/CD | Modify consent kernel without consent-audit skill |
| **CB01** | Create designs, UX, aesthetics, Contact Sequence | Access Voice DNA vault, revoke tokens |
| **DREAM** | Audio pipeline, voice mixing, synthesis, C2PA | Modify compensation ledger, onboard licensees |
| **SHIRL** | Local code execution, file ops, fast iteration | Write to production databases, deploy to Cloudflare |
| **LUCY** | Log all actions, query history, generate reports | Modify past logs, execute code outside logging |
| **RSP_001** | Override any agent, halt any task, activate Kill Switch | Violate Golden Principles (violating kills the system) |

**Enforcement**:
- Authority boundaries are coded into MCP tool permissions
- Each tool has pre-check: `if (!agent.can('operation')) throw UnauthorizedError`
- GABRIEL validates dispatch target matches task authority
- Violation logs to LUCY as security incident

---

## RULE A6: AGENT FAILURE IS HANDLED GRACEFULLY

**Resilience by Design**

If any agent fails, the system continues:

```
FAILURE RECOVERY TREE:
Task assigned to Agent A
    ↓ (Agent A fails)
GABRIEL detects failure (timeout, error, refusal)
    ↓
GABRIEL dispatches task to Backup Agent B
    ↓ (Backup succeeds OR also fails)
    ├─→ Success: LUCY logs recovery, GABRIEL reports to RSP_001
    └─→ Failure: Task queued with priority bump + RSP_001 alert
    ↓
Recovery procedures documented in gabriel-ops skill
    ├── Retry logic: exponential backoff, max 3 attempts
    ├── State recovery: use LUCY's session logs as source of truth
    └── Manual intervention: RSP_001 can inject override
```

**Specific Failure Modes**:
- **If GABRIEL fails**: CLAUDE assumes dispatch role temporarily
- **If LUCY fails**: DAZEFLOW queue persists in KV; LUCY resumes on restart
- **If ENGR-KEITH fails**: SHIRL takes tactical code tasks; CLAUDE takes strategy
- **If DREAM fails**: Audio pipeline queues in Cloudflare KV; resumes on recovery

**Rule**: No single agent failure should halt the system. The empire is resilient by architecture.

---

## RULE A7: MCP SERVERS ARE THE COMMUNICATION BACKBONE

**Agent-to-Agent Communication via MCP Tools**

9 MCP servers provide deterministic tool access between agents:

```
AGENT COMMUNICATION FLOW:
Agent A needs external capability
    ↓
Looks up required MCP server (e.g., gabriel, heaven, lucy)
    ↓
Calls MCP tool with Pydantic input validation
    ↓
MCP server executes tool in isolated process
    ↓
Returns JSON response with { success, data, error }
    ↓
Agent processes result
    ↓
Agent calls LUCY to log the interaction (optional, but recommended)
    ↓
Next action decided
```

**MCP Server Directory**:

| Server | Tools | Agents | Protocol |
|--------|-------|--------|----------|
| `gabriel` | dispatch, route, merge, query_state | All | FastMCP |
| `heaven` | consent_check, token_revoke, rate_limit | GABRIEL, DREAM | FastMCP |
| `lucy` | log_session, query_history, generate_report | All | FastMCP |
| `engr-keith` | build, test, deploy, debug | ENGR-KEITH, GABRIEL | FastMCP |
| `dream` | mix_audio, synthesize, apply_c2pa, contact_seq | DREAM, AUDIO | FastMCP |
| `cb01` | design_frame, generate_aesthetic, create_asset | CB01, GABRIEL | FastMCP |
| `shirley` | exec_local, file_read, file_write, code_check | SHIRL, ENGR-KEITH | FastMCP |
| `family` | get_context, log_decision, query_legacy | FAMILY, RSP_001 | FastMCP |
| `audio` | voice_process, apply_watermark, c2pa_gen | AUDIO, DREAM | FastMCP (13 tools) |

**Pattern** (Python FastMCP):
```python
from fastmcp import MCP, Tool
from pydantic import BaseModel

mcp = MCP("gabriel")

class DispatchInput(BaseModel):
    agent: str
    task: str
    priority: str
    deadline: str

@mcp.tool
async def dispatch(input: DispatchInput) -> dict:
    """Route task to appropriate agent via GABRIEL orchestration."""
    # Validate agent authority
    # Check LUCY history for similar tasks
    # Dispatch to agent
    # Return { success, dispatch_id, agent, eta }
```

---

## RULE A8: RSP_001 HAS ABSOLUTE OVERRIDE

**The Founding Actor's Authority**

Robert Stephen Plowman (RSP_001) is the architect. The agents serve.

**RSP_001 Powers**:
1. Override any agent decision at any time
2. Halt any agent execution instantly
3. Modify any agent's system prompt
4. Revoke any consent token (Kill Switch)
5. Order immediate audit of any component
6. Escalate to Guild governance (after Guild matures)

**RSP_001 Limitations** (Sacred):
- Cannot violate Golden Principles (violating this kills the system)
- Cannot bypass Never Clause checks
- Cannot modify append-only ledgers
- Cannot delete historical logs

**How RSP_001 Invokes Override**:
```
RSP_001 → CLAUDE or GABRIEL (voice, email, or direct message)
Message: "Override: <agent> stop <task>" OR "Override: activate Kill Switch for token <id>"
GABRIEL: Verifies RSP_001 identity, halts agent immediately
LUCY: Logs override with reason and timestamp
Result: System state snapshot saved, agents resume on RSP_001 signal
```

**Succession Planning** (2028+):
- As Guild governance matures, some overrides transfer to Guild Council
- RSP_001 retains Kill Switch and veto power permanently
- Guild can override agents; RSP_001 retains override of Guild
- This ensures creator protection never decays

---

## DISPATCH WORKFLOW DIAGRAM (TEXT)

```
┌─────────────────────────────────────────────────────────────┐
│                    DISPATCH WORKFLOW                         │
└─────────────────────────────────────────────────────────────┘

1. REQUEST ARRIVES
   RSP_001 or CLAUDE → "Build new Heaven endpoint"

2. GABRIEL ANALYZES
   ├─ Parse task: "endpoint building"
   ├─ Estimate complexity: HIGH
   ├─ Dependencies: heaven MCP, D1 schema, testing
   ├─ Authority required: ENGR-KEITH (code), CLAUDE (design), consent-audit (review)
   └─ Parallelization: ENGR-KEITH builds while CLAUDE designs spec

3. GABRIEL CREATES DISPATCH
   {
     "task_id": "task-20260325-1447-abc",
     "primary_agent": "ENGR-KEITH",
     "secondary_agents": ["CLAUDE", "SHIRL"],
     "worktree": "feature/new-endpoint-EK-2026-03-25",
     "deadline": "2026-03-27T14:00:00Z",
     "callback": "gabriel-merge.sh"
   }

4. AGENTS EXECUTE IN PARALLEL (WORKTREE ISOLATION)
   ├─ CLAUDE: Write endpoint spec (.claude/rules/heaven-api.md)
   ├─ ENGR-KEITH: Build endpoint handler (src/endpoints/new.js)
   ├─ SHIRL: Validate syntax, run linter
   └─ LUCY: Log all three agents' work in one session

5. COMMIT & MERGE
   ├─ Each agent commits to their worktree
   ├─ GABRIEL merges in sequence
   ├─ Conflict resolution: GABRIEL arbitrates, RSP_001 final say
   └─ Smoke tests run

6. DEPLOYMENT
   ├─ ENGR-KEITH runs heaven deploy
   ├─ Deploy script auto-runs 14 smoke tests
   ├─ Never Clause audit: consent-audit skill
   └─ LUCY logs final deployment state

7. HANDOFF
   ├─ Result reported to RSP_001
   ├─ Endpoint live on heaven.rsp-5f3.workers.dev
   ├─ Task marked complete in DAZEFLOW
   └─ System idle, awaiting next dispatch
```

---

## MCP SERVER COMMUNICATION PATTERNS

**Pattern 1: Agent → MCP Synchronous Call**
```python
# Agent code (ENGR-KEITH)
result = await mcp["gabriel"].tools.dispatch({
    "agent": "SHIRL",
    "task": "validate TypeScript syntax",
    "files": ["src/heaven/endpoints/*.ts"]
})
if result["success"]:
    print(f"✓ Syntax valid. SHIRL reports: {result['data']}")
else:
    print(f"✗ Syntax error: {result['error']}")
```

**Pattern 2: Agent → MCP Asynchronous Dispatch**
```python
# Agent code (GABRIEL)
dispatch_id = await mcp["gabriel"].tools.dispatch_async({
    "agent": "DREAM",
    "task": "mix 9-agent voices for Contact Sequence",
    "priority": "HIGH",
    "callback": "python gabriel-merge.sh"
})
# GABRIEL doesn't wait. LUCY will log completion.
print(f"Dispatched: {dispatch_id}. DREAM will report via callback.")
```

**Pattern 3: Agent → LUCY Logging**
```python
# Any agent (e.g., ENGR-KEITH after deploy)
await mcp["lucy"].tools.log_session({
    "session_id": "session-20260325-1447-abc",
    "agent": "ENGR-KEITH",
    "action": "deployed Heaven",
    "outcome": "success",
    "timestamp": "2026-03-25T14:47:22Z",
    "next_steps": "Run smoke tests"
})
```

**Pattern 4: RSP_001 → GABRIEL Override**
```python
# CLAUDE or system handling override
await mcp["gabriel"].tools.override({
    "from": "RSP_001",
    "target_agent": "DREAM",
    "action": "HALT",
    "reason": "Urgent manual intervention required",
    "snapshot": True  # Save state for recovery
})
```

---

## CROSS-REFERENCES

- **gabriel-ops skill**: Deep dive into orchestration mechanics, state machine, recovery procedures
- **agents rule** (`.claude/rules/agents.md`): Individual agent system prompts and capabilities
- **golden-principles** (`.claude/rules/identity.md` § Core Doctrine): The 8 immovable rules agents never violate
- **heaven-api** (`.claude/rules/heaven-api.md`): Consent kernel API agents use for Never Clause checks
- **deployment** (`.claude/rules/deployment.md`): How agents coordinate on release cycles

---

## SUMMARY

The NOIZY Empire operates as a federated autonomous system where:

1. **GABRIEL** is the dispatcher — all tasks flow through orchestration
2. **Agents** execute within defined boundaries — authority is explicit
3. **LUCY** logs everything — history is tamper-proof and queryable
4. **Worktrees** enable parallel work — no conflicts between agents
5. **MCP servers** enable deterministic communication — agents talk via tools
6. **Golden Principles** are embedded — no agent can violate them
7. **Failure is handled gracefully** — system resilience by architecture
8. **RSP_001 has absolute override** — the founding actor's will is law

This is not democracy. This is benevolent monarchy with checks. RSP_001 designed it; agents execute it; creators benefit from it.

---

*"The agents serve the architect. The architect serves the creators. The creators serve the art."*

---

**Metadata**:
- **Skill**: golden-rules-agents
- **Version**: 1.0
- **Lines**: 312
- **Created**: 2026-03-25 by RSP_001
- **Dependencies**: `.claude/agents/`, `.claude/rules/`, `mcp/`
- **Next Review**: 2026-04-17 (pre-launch)
