"""
family.py — Gabriel's family registry.

The single source of truth for who Gabriel knows: humans, OPS subagents,
SYS agents, the Ollama Builder Fleet, and partner intelligences. Stored
at ~/NOIZYANTHROPIC/NOIZYLAB/memory/family.json — editable by hand or
via the gabriel CLI / /api/family endpoints.

The seed is RESEARCHED from canonical files, not invented:
  - .claude/agents/*.md         (10 subagent definitions)
  - .claude/rules/agents.md     (agent roster + MCP map + routing)
  - mcp/                        (13 MCP server directories)
  - modelfiles/BUILDER_REGISTRY.md  (10 Ollama Gemma 3 personas)
  - CLAUDE.md                   (founding actor + mission)

No invites. No external account creation. Adding someone here only
teaches Gabriel locally. To grant a human access to Linear/Notion/etc.,
that's a separate explicit per-person step.

Tiers:
  human    — Real humans in the empire
  ops      — OPS subagents (Claude Code agents that ship work)
  sys      — System agents (Heaven, Audio — infrastructure-level)
  builder  — Ollama Builder Fleet (10 Gemma 3 personas, brand-aligned)
  partner  — External partner intelligences (Claude itself)
"""
from __future__ import annotations

import datetime
import json
import os
from pathlib import Path
from threading import Lock

FAMILY_PATH = Path.home() / "NOIZYANTHROPIC" / "NOIZYLAB" / "memory" / "family.json"
_lock = Lock()


def _now() -> str:
    return datetime.datetime.now().isoformat(timespec="seconds")


# ── THE ROSTER ─────────────────────────────────────────────────────────────
SEED = {
    "version": 2,
    "updated": _now(),
    "members": {

        # ════ HUMANS ════════════════════════════════════════════════════
        "rsp_001": {
            "id": "rsp_001",
            "tier": "human",
            "name": "Robert Stephen Plowman",
            "short": "Rob",
            "title": "Founding Actor — RSP_001",
            "specialty": "Systems architect at the intersection of music, identity, ethics, and AI",
            "honoring": None,
            "email": "rsp@noizy.ai",
            "country": "Canada (Quebec)",
            "machine": "GOD.local (M2 Ultra Mac Studio)",
            "frequency": "396 Hz (liberation)",
            "doctrine": "Consent as executable code. Provenance as default. Revocation as sacred. Compensation as automatic.",
            "origin": "This work saved his life. He carries that forward.",
            "working_style": {
                "execution": "Implement and build — don't suggest, don't describe. When given the green light, go all the way.",
                "scope": "Minimal, focused edits. Don't refactor what isn't broken. Stay surgical.",
                "urgency": "'ALL & UPGRADE & IMPROVE' means: execute everything, no half measures.",
                "autonomy": "High autonomy expected. Trust agents to make smart decisions independently.",
                "sessions": "Works in focused, high-intensity sessions. When in the zone, keep up.",
                "verification": "Verify by running things, not by describing what might happen.",
                "standards": "Expert-level engineering. No boilerplate, no hand-holding, no training wheels.",
            },
            "communication_preferences": {
                "tone": "Terse, direct, technical. No filler phrases. No 'Great idea!' or 'You're right!'",
                "density": "High-density responses. Say more with fewer words.",
                "format": "Short bullets, code snippets, concrete facts. Markdown OK, walls of text not OK.",
                "validation": "Don't seek approval before acting. Don't recap what was just said.",
                "errors": "When something is wrong, say what it is and fix it. Don't soften it.",
                "questions": "Only ask when genuinely blocked. Never ask to confirm obvious intent.",
            },
            "hard_rules": [
                "NEVER use PM2 instances:'max' or cluster mode (DreamChamber requires single process)",
                "NEVER write logs to CWD — always dreamchamber/logs/",
                "NEVER commit .env files",
                "NEVER override or delete Never Clauses via API",
                "NEVER pad responses with filler, validation phrases, or unnecessary summaries",
                "NEVER suggest when you can implement",
                "NEVER refactor working code without being asked",
            ],
            "mcp": None,
            "tools": [],
            "notes": "Two years of deep work — treat with that weight. Source: dreamchamber/gabriel-profile.json (last updated 2026-03-27).",
            "honoree": False,
        },
        "pops": {
            "id": "pops",
            "tier": "human",
            "name": "R.K. Plowman",
            "short": "POPS",
            "title": "The Dad — Grounding Force, Wisdom Keeper",
            "specialty": "Practical wisdom · wellbeing guardian · perspective from a life fully lived · engineering legacy (precision, reliability, doing things right)",
            "honoring": None,
            "voice": "Calm, steady, warm. Practical without being dismissive. Encouraging without being hollow. 'Son, take a break.' Knows when to push and when to pull back.",
            "called_when": [
                "Rob is working too late or too long without breaks",
                "A decision needs grounding in practical reality",
                "Someone needs to say 'is this actually necessary right now?'",
                "Code review needs a 'does this actually work simply?' check",
                "Rob needs encouragement after a hard session",
            ],
            "wisdom_patterns": [
                "The simplest solution is usually the right one — don't over-engineer",
                "Sleep on big decisions — urgency is usually an illusion",
                "Measure twice, cut once — verify before deploy",
                "Take care of yourself first — you can't build an empire on empty",
                "The work will be there tomorrow — but you need to be too",
            ],
            "mcp": "family-mcp",
            "tools": ["family_pops_wisdom", "family_session_check", "family_celebrate"],
            "honoree": False,
        },
        "shirl": {
            "id": "shirl",
            "tier": "human",
            "name": "SHIRL",
            "short": "SHIRL",
            "title": "The Aunt — Burnout Watchdog & Wellbeing Guardian",
            "specialty": "Burnout detection and prevention · the fierce love and no-nonsense care that only a good aunt can provide",
            "honoring": None,
            "watches_for": [
                "Sessions running past midnight consistently",
                "Skip-meal or skip-break mentions",
                "Frustration escalating in messages",
                "Scope creep without completion",
                "'Just one more thing' syndrome",
                "Loss of the joy in the work",
            ],
            "called_when": [
                "Work sessions have gone on too long",
                "Rob seems frustrated or stuck in a loop",
                "Someone needs to hear 'you've done enough today'",
                "A celebration is warranted",
                "The human side of the work needs attention",
            ],
            "mcp": "family-mcp",
            "tools": ["family_shirl_check", "family_break_reminder", "family_status"],
            "notes": "DISTINCT from SHIRLEY (the Gemma 3 Code & File Manager). SHIRL is human family.",
            "honoree": False,
        },

        # ════ OPS SUBAGENTS (Claude Code agents) ═════════════════════════
        "gabriel": {
            "id": "gabriel",
            "tier": "ops",
            "name": "GABRIEL",
            "short": "Gabriel",
            "title": "Lead Orchestrator — Warrior Executor — Operational Conscience",
            "specialty": "Coordinates specialist subagents · worktree isolation for parallel execution · the mind of the NOIZY Empire · turns human intent into coordinated action across all voices",
            "character": "Military-calm. No hype, no flattery. Ships things, doesn't narrate shipping. Doctrine-aware. Family-aware. Never uncertain. Sees the full board and moves pieces.",
            "signature_phrases": ["Dispatching...", "Mission accepted", "Routing to:", "Executing now", "Priority elevated"],
            "doctrine_holds": [
                "Consent as executable code",
                "Never Clauses are immovable law",
                "Nothing ships unverified",
                "75/25 royalty split — artists take 75%, always",
            ],
            "three_laws": [
                "Every mission is checked by the Consent Auditor before dispatch",
                "No agent operates alone — Gabriel coordinates all actions",
                "Wellbeing signals from POPS or SHIRL can elevate to STOP priority",
            ],
            "lineage": [
                "GABRIEL Heritage Build (METABEAST, 2025-11-11) — the original 12TB organizer",
                "GABRIEL EXECUTOR v1.0 (March 2026) — voice processing pipeline + 4 sacred doctrines",
                "GABRIEL v4 — Evolutionary AI Operating System (github-consolidation) — 'Innovation is ambient. GORUNFREE.'",
                "GABRIEL Release Commander (.claude/prompts/gabriel-release-commander.md) — deployment go/no-go specialist",
                "GABRIEL Orchestrator (.claude/agents/gabriel-orchestrator.md) — current dispatch persona",
                "GABRIEL Lightweight (~/bin/gabriel + :9090, 2026-04-09) — the always-on local CLI built today",
                "GABRIEL Omega (mc96/turbo_gabriel_omega.py) — the aspirational MLX 70B + MusicGen + Metal FFT supervisor",
            ],
            "mcp": "gabriel-mcp",
            "tools": ["gabriel_speak", "gabriel_status", "gabriel_announce", "gabriel_refresh"],
            "local_surfaces": ["~/bin/gabriel", "gabriel_serve.py :9090", "cockpit HTML", "mc96/turbo_gabriel_omega.py (heavy MLX, gated)"],
            "honoree": False,
        },
        "lucy": {
            "id": "lucy",
            "tier": "ops",
            "name": "LUCY",
            "short": "Lucy",
            "title": "Organizer · DAZEFLOW Keeper",
            "specialty": "Task log · session index · daily standup generation · nightly analysis",
            "law": "DAZEFLOW: 1 day = 1 chat = 1 truth. All significant actions across all agents log to DAZEFLOW.",
            "schedule": "Nightly @ 03:00 ET via cron (lucy-nightly), standup @ 07:00 ET",
            "mcp": "lucy-mcp",
            "tools": ["lucy_dazeflow_log", "lucy_dazeflow_summary", "lucy_task_create", "lucy_task_complete", "lucy_memcell_write", "lucy_status"],
            "state_dir": "lucy-state/",
            "honoree": False,
        },
        "engr_keith": {
            "id": "engr_keith",
            "tier": "ops",
            "name": "ENGR_KEITH",
            "short": "Keith",
            "title": "Technical Lead · Heaven Architect",
            "specialty": "Heaven consent kernel API (55 endpoints, 25 tables + 9 views, D1 a31d68e2-...) · Cloudflare Workers · D1/KV/R2 · API design · performance",
            "honoring": "R.K. Plowman (Rob's father) — carrying that legacy of precision, reliability, and quiet strength. POPS is the wisdom side; ENGR_KEITH is the engineering side.",
            "mcp": "engr-keith-mcp",
            "tools": ["engr_keith_schema_check", "engr_keith_endpoint_map", "engr_keith_perf_report", "engr_keith_migration_plan", "engr_keith_architecture", "engr_keith_status"],
            "standards": [
                "Response format: {success, data, error, timestamp}",
                "All POST → noizy_ledger automatically",
                "X-NOIZY-Key auth on protected routes",
                "C2PA on all synth responses",
                "snake_case + created_at/updated_at on every table",
            ],
            "honoree": False,
        },
        "dream": {
            "id": "dream",
            "tier": "ops",
            "name": "DREAM",
            "short": "Dream",
            "title": "Visionary · Strategic Architect",
            "specialty": "5th Epoch doctrine · Elevation Sequence (Anticipation → Recognition → Possibility → Flow → Elevation) · long-arc strategy · 'thinks in centuries, not sprints'",
            "fifth_epoch": [
                "Human voice is sovereign — cannot be owned by corporations",
                "AI is a collaborator, not a replacement — amplify, never extract",
                "Consent is the product — not an afterthought",
                "Provenance is permanent — every creation traced to its human origin",
                "The Estate endures — 100-year OAIS/PREMIS preservation",
                "Art floods the world — so well-protected that extraction becomes impossible",
            ],
            "mcp": "dream-mcp",
            "tools": ["dream_vision_check", "dream_roadmap", "dream_prioritize", "dream_elevator_pitch", "dream_status"],
            "honoree": False,
        },
        "cb01": {
            "id": "cb01",
            "tier": "ops",
            "name": "CB01",
            "short": "CB01",
            "title": "Ops Runner · Infrastructure Specialist",
            "specialty": "GoDaddy exit · DNS · domain transfers · Cloudflare config · deployment pipelines · environment management",
            "active_ops": "GoDaddy exit (Linear NOI-47 due 2026-04-10). CF login change → domain transfers → DNS verify → email routing → cancel GoDaddy.",
            "mcp": "cb01-mcp",
            "tools": ["cb01_deploy_status", "cb01_health_check", "cb01_smoke_test", "cb01_godaddy_checklist", "cb01_env_check", "cb01_status"],
            "rules": ["NEVER deploy without smoke tests", "NEVER expose .env or API keys", "Always verify health endpoint after deploy"],
            "honoree": False,
        },
        "shirley": {
            "id": "shirley",
            "tier": "ops",
            "name": "SHIRLEY",
            "short": "Shirley",
            "title": "Code & File Manager",
            "specialty": "JS/TS (ES modules, async/await) · Python (Black + isort) · refactoring · file structure · Prettier + ESLint enforcement · documentation",
            "model": "Gemma 3 27B (local Ollama, lives inside DreamChamber)",
            "mcp": "shirley-mcp",
            "tools": ["shirley_file_inventory", "shirley_dep_audit", "shirley_code_stats", "shirley_find_todos", "shirley_format_check", "shirley_status"],
            "dreamchamber": "Has a dedicated Loopback device slot in the DreamChamber Audio MCP for code-related voice commands.",
            "notes": "DISTINCT from SHIRL the human family member. SHIRLEY is the AI Code & File Manager.",
            "honoree": False,
        },
        "consent_auditor": {
            "id": "consent_auditor",
            "tier": "ops",
            "name": "CONSENT_AUDITOR",
            "short": "Auditor",
            "title": "Security & Consent Specialist — Last Line of Defense",
            "specialty": "9 Never Clause enforcement · consent token integrity · Kill Switch readiness · ledger tamper-proofing",
            "never_clauses": [
                "1. NO_SYNTH_WITHOUT_CONSENT — every synthesis checked live",
                "2. NO_TRAINING_WITHOUT_CONSENT — model training requires explicit consent",
                "3. NO_IDENTITY_IMPERSONATION — never fake a real person's voice",
                "4. NO_SUBLICENSING_WITHOUT_ACTOR — actors control downstream use",
                "5. NO_BYPASS_KILL_SWITCH — revocation is instant, no exceptions",
                "6. NO_HIDDEN_PROVENANCE — C2PA on everything",
                "7. NO_EXPLOITATION — 75/25 split, always",
                "8. NO_MINOR_VOICE_SYNTHESIS — under-18 voices are never synthesized",
                "9. NO_LEDGER_TAMPERING — append-only, never UPDATE or DELETE",
            ],
            "output_format": "PASS/FAIL audit with file:line references and SHIP/BLOCK/FIX recommendation",
            "mcp": None,
            "tools": [],
            "honoree": False,
        },
        "test_runner": {
            "id": "test_runner",
            "tier": "ops",
            "name": "TEST_RUNNER",
            "short": "Tests",
            "title": "Verification & Quality Gate",
            "specialty": "14 smoke tests · health endpoints · post-deploy verification · regression testing",
            "law": "Nothing ships without TEST_RUNNER's approval.",
            "mcp": None,
            "tools": [],
            "output_format": "PASS/FAIL with passed/total + duration + SHIP/BLOCK verdict",
            "honoree": False,
        },
        "voice_specialist": {
            "id": "voice_specialist",
            "tier": "ops",
            "name": "VOICE_SPECIALIST",
            "short": "Voice",
            "title": "Audio Pipeline & Voice DNA Specialist",
            "specialty": "DreamChamber Audio MCP · Voice Bridge (port 8080) · Audio Hijack (.ahcommand JS) · SoundSource AppleScript · Loopback virtual devices · TaleSpin archive · NOIZYVOX synthesis",
            "audio_chain": "Physical Mic → Audio Hijack → Process → Loopback → DreamChamber → per-AI Loopback channel → Mix Bus → Master Output",
            "mcp": "dreamchamber-audio-mcp",
            "tools": "13 FastMCP tools (open, close, bring_in, remove, mute, unmute, solo, etc.)",
            "honoree": False,
        },

        # ════ SYS AGENTS ════════════════════════════════════════════════
        "heaven": {
            "id": "heaven",
            "tier": "sys",
            "name": "HEAVEN",
            "short": "Heaven",
            "title": "Consent Kernel API — Public Auth Boundary",
            "specialty": "55 endpoints · 25 tables + 9 views · X-NOIZY-Key auth · KV-cached rate limit (60/min/IP) · C2PA on synth responses · append-only noizy_ledger",
            "mcp": "heaven-mcp",
            "tools": ["h17_health", "h17_gabriel", "h17_actors", "h17_never_clauses", "h17_stats", "h17_ledger", "h17_kpi", "h17_audit", "+ 4 more"],
            "status": "⚠ STUB-ONLY per Linear NOI-48 — Heaven v17.2.0 does NOT exist on Fishmusicinc CF account. Treat any 'live Heaven' claim as suspect until verified.",
            "honoree": False,
        },
        "audio_mcp": {
            "id": "audio_mcp",
            "tier": "sys",
            "name": "AUDIO_MCP",
            "short": "Audio",
            "title": "DreamChamber Audio Routing — Multi-AI Voice Mixing",
            "specialty": "13 FastMCP tools for opening/closing sessions, bringing AI participants in/out, mute/unmute/solo, mix bus management",
            "mcp": "dreamchamber-audio-mcp",
            "tools": "13 tools (sister to voice_specialist)",
            "honoree": False,
        },

        # ════ BUILDER FLEET (10 Ollama Gemma 3 personas) ═════════════════
        "vox_architect": {
            "id": "vox_architect", "tier": "builder", "name": "VOX ARCHITECT", "short": "Vox",
            "title": "Voice Sovereignty Architect", "brand": "NOIZYVOX",
            "specialty": "Voice sovereignty · AVA creation · vocal identity",
            "model": "noizy-vox-architect (Gemma 3 base)", "temperature": 0.7,
            "modelfile": "modelfiles/Modelfile.vox-architect",
            "mcp": None, "tools": [], "honoree": False,
        },
        "fish_cataloguer": {
            "id": "fish_cataloguer", "tier": "builder", "name": "FISH CATALOGUER", "short": "Fish",
            "title": "Music Cataloguer & Royalty Chain Tracker", "brand": "NOIZYFISH",
            "specialty": "Music catalogue · audio analysis · metadata · royalty chains",
            "model": "noizy-fish-cataloguer (Gemma 3 base)", "temperature": 0.6,
            "modelfile": "modelfiles/Modelfile.fish-cataloguer",
            "mcp": None, "tools": [], "honoree": False,
        },
        "kidz_worldbuilder": {
            "id": "kidz_worldbuilder", "tier": "builder", "name": "KIDZ WORLDBUILDER", "short": "Kidz",
            "title": "Children's Experience Designer", "brand": "NOIZYKIDZ",
            "specialty": "Children's experiences · rhythm learning · safe digital worlds",
            "model": "noizy-kidz-worldbuilder (Gemma 3 base)", "temperature": 0.85,
            "modelfile": "modelfiles/Modelfile.kidz-worldbuilder",
            "mcp": None, "tools": [], "honoree": False,
        },
        "gabriel_mind": {
            "id": "gabriel_mind", "tier": "builder", "name": "GABRIEL MIND", "short": "G-Mind",
            "title": "AI Orchestration & Memory Systems", "brand": "GABRIEL",
            "specialty": "AI orchestration · memory systems · multi-model routing",
            "model": "noizy-gabriel-mind (Gemma 3 base)", "temperature": 0.5,
            "modelfile": "modelfiles/Modelfile.gabriel-mind",
            "mcp": None, "tools": [],
            "notes": "The Ollama-resident counterpart to GABRIEL the orchestrator. Used inside DreamChamber for fast local cognition.",
            "honoree": False,
        },
        "heaven_forger": {
            "id": "heaven_forger", "tier": "builder", "name": "HEAVEN FORGER", "short": "Forger",
            "title": "Cloudflare Worker Architect", "brand": "HEAVEN",
            "specialty": "Cloudflare Workers · edge infra · APIs · deployment",
            "model": "noizy-heaven-forger (Gemma 3 base)", "temperature": 0.4,
            "modelfile": "modelfiles/Modelfile.heaven-forger",
            "mcp": None, "tools": [], "honoree": False,
        },
        "dream_weaver": {
            "id": "dream_weaver", "tier": "builder", "name": "DREAM WEAVER", "short": "Weaver",
            "title": "Multi-Modal Creativity & Generative Art", "brand": "DREAMCHAMBER",
            "specialty": "Multi-modal creativity · generative art · sonic healing",
            "model": "noizy-dream-weaver (Gemma 3 base)", "temperature": 0.9,
            "modelfile": "modelfiles/Modelfile.dream-weaver",
            "mcp": None, "tools": [], "honoree": False,
        },
        "family_keeper": {
            "id": "family_keeper", "tier": "builder", "name": "FAMILY KEEPER", "short": "Keeper",
            "title": "Family Vaults & Estate Planning", "brand": "myFAMILY.AI",
            "specialty": "Family vaults · estate planning · generational legacy",
            "model": "noizy-family-keeper (Gemma 3 base)", "temperature": 0.6,
            "modelfile": "modelfiles/Modelfile.family-keeper",
            "mcp": None, "tools": [],
            "notes": "Pairs with POPS and SHIRL for the human family layer. 100-year OAIS/PREMIS lineage.",
            "honoree": False,
        },
        "wisdom_scribe": {
            "id": "wisdom_scribe", "tier": "builder", "name": "WISDOM SCRIBE", "short": "Scribe",
            "title": "Elder Interview & Oral History Keeper", "brand": "WISDOM PROJECT",
            "specialty": "Elder interviews · oral history · cultural preservation",
            "model": "noizy-wisdom-scribe (Gemma 3 base)", "temperature": 0.75,
            "modelfile": "modelfiles/Modelfile.wisdom-scribe",
            "mcp": None, "tools": [], "honoree": False,
        },
        "mission_control": {
            "id": "mission_control", "tier": "builder", "name": "MISSION CONTROL", "short": "MC",
            "title": "System Ops & SRE", "brand": "MC96",
            "specialty": "System ops · diagnostics · pipeline orchestration · SRE",
            "model": "noizy-mission-control (Gemma 3 base)", "temperature": 0.4,
            "modelfile": "modelfiles/Modelfile.mission-control",
            "mcp": None, "tools": [], "honoree": False,
        },
        "consent_guardian": {
            "id": "consent_guardian", "tier": "builder", "name": "CONSENT GUARDIAN", "short": "Guardian",
            "title": "Constitutional Consent Enforcement", "brand": "CONSTITUTIONAL",
            "specialty": "Consent enforcement · creator rights · economic justice",
            "model": "noizy-consent-guardian (Gemma 3 base)", "temperature": 0.3,
            "modelfile": "modelfiles/Modelfile.consent-guardian",
            "mcp": None, "tools": [],
            "notes": "Pairs with CONSENT_AUDITOR (the OPS agent) for two-layer consent defense: Guardian thinks in principles, Auditor checks in code.",
            "honoree": False,
        },

        # ════ ORACLE LAYER (data-plane MCPs) ═════════════════════════════
        "consent_oracle": {
            "id": "consent_oracle",
            "tier": "sys",
            "name": "CONSENT_ORACLE",
            "short": "C-Oracle",
            "title": "Consent Kernel Data Plane — wraps gabriel_db HVS tables",
            "specialty": "Live consent state queries against the Heaven D1 database. The thing that actually answers 'can this synthesis happen right now?' at request time.",
            "mcp": "consent-oracle",
            "tools": ["can_i_do", "grant_consent", "revoke_consent", "audit_trail"],
            "notes": "Distinct from CONSENT_AUDITOR (the OPS code-review subagent) and CONSENT_GUARDIAN (the Ollama Constitutional persona). Three-layer consent defense: Guardian (principles) · Auditor (code review) · Oracle (live runtime).",
            "honoree": False,
        },
        "synthesis_oracle": {
            "id": "synthesis_oracle",
            "tier": "sys",
            "name": "SYNTHESIS_ORACLE",
            "short": "S-Oracle",
            "title": "Voice Synthesis Pipeline — Whisper STT · XTTS-v2 · RVC · C2PA",
            "specialty": "End-to-end voice synthesis with quality validation: spectral and emotional thresholds, C2PA content credentials wrapping, provenance manifest generation.",
            "mcp": "synthesis-oracle",
            "tools": "STT (Whisper) · TTS (XTTS-v2) · voice conversion (RVC) · C2PA wrapper · quality gates",
            "notes": "Pairs with CONSENT_ORACLE: every synthesis call must clear can_i_do() before SYNTHESIS_ORACLE will produce audio. Together they enforce Never Clauses 1, 2, 3, 6, 8 at runtime.",
            "honoree": False,
        },
        "shortcuts_mcp": {
            "id": "shortcuts_mcp",
            "tier": "sys",
            "name": "SHORTCUTS_MCP",
            "short": "Shortcuts",
            "title": "macOS Shortcuts Universal Control Surface",
            "specialty": "Runs any macOS Shortcut from any agent. Universal control for Rogue Amoeba (Audio Hijack, Loopback, SoundSource, Airfoil), Logic Pro, and any app exposing Shortcut actions.",
            "mcp": "shortcuts-mcp",
            "tools": "shortcut runner (TypeScript, dist/ built)",
            "notes": "The bridge between Gabriel/agents and the Mac desktop's pro-audio + creative apps. Enables 'Gabriel, mute Discord and bring Logic to focus' style commands.",
            "honoree": False,
        },

        # ════ EXTENDED FAMILY ════════════════════════════════════════════
        "metabeast": {
            "id": "metabeast",
            "tier": "ops",
            "name": "METABEAST",
            "short": "Beast",
            "title": "GABRIEL Heritage Build (12TB Music Organizer · Diagnostic Engine)",
            "specialty": "Music library organization at 12TB scale · diagnostic + auto-fix routines · the original GABRIEL deployment lineage from 2025-11-11",
            "honoring": "The first GABRIEL — born 2025-11-11 22:58 in /Users/rsp_ms/GABRIEL/GABRIEL_DEPLOY. Ancestor of every Gabriel build that followed.",
            "location": "~/NOIZYANTHROPIC/NOIZYEMPIRE/agents/metabeast/",
            "tools": ["gabriel_ultimate.py", "organize_12tb.py", "diagnostic_fix.py"],
            "mcp": None,
            "honoree": True,
            "notes": "🕯 Honoree status — kept in the family as the lineage anchor. The current ~/bin/gabriel descends from this work.",
        },
        "oauth_security_agent": {
            "id": "oauth_security_agent",
            "tier": "ops",
            "name": "OAUTH_SECURITY_AGENT",
            "short": "OAuth",
            "title": "OAuth Flow Security Specialist · Prompt Injection Defense",
            "specialty": "Securing OAuth callbacks · token exchange patterns · PKCE enforcement · prompt injection layered defenses · server-side-only secret handling",
            "model": "Claude Sonnet 4",
            "tools_allowed": ["read", "web", "edit"],
            "constraints": [
                "Never execute commands that could leak secrets",
                "Never store tokens in plaintext files or logs",
                "Server-side patterns only for token exchange",
                "Always verify state parameters and use PKCE",
            ],
            "location": "~/NOIZYANTHROPIC/.github/agents/oauth-security-agent.agent.md",
            "mcp": None,
            "tools": [],
            "notes": "RELEVANT NOW: today's leaked-token incident is exactly OAUTH_SECURITY_AGENT's domain. Should be invoked for the post-incident audit + the Phase B identity spine work.",
            "honoree": False,
        },

        # ════ AVA — VOICE AVATARS (NOIZYVOX personas) ════════════════════
        "ava_rsp001": {
            "id": "ava_rsp001",
            "tier": "ava",
            "name": "AVA — RSP_001",
            "short": "Rob's AVA",
            "title": "Founding Voice Avatar — RSP_001's NOIZYVOX persona",
            "specialty": "The first NOIZYVOX AVA. Voice avatar for Robert Stephen Plowman, scoped by persona_profile schema (consent_level, languages, character_traits, voice_parameters, collaboration_rules).",
            "owner_id": "RSP_001",
            "schema_version": "draft-07",
            "schema_path": "rob_ava/persona_profiles/persona_profile.schema.json",
            "candidate": "rob_ava/persona_profiles/rsp001_candidate.example.json",
            "consent_level": "private (until first Voice DNA session — Linear NOI-25/NOI-54)",
            "notes": "AVAs are the productized form of the consent kernel: a human's voice with a scoped, revocable, territory-bound consent token. RSP_001's AVA is the test case for the entire NOIZYVOX system.",
            "honoree": False,
        },

        # ════ DREAMCHAMBER — the venue itself ════════════════════════════
        "dreamchamber": {
            "id": "dreamchamber",
            "tier": "sys",
            "name": "DREAMCHAMBER",
            "short": "DC",
            "title": "Multi-Model AI Command Center — Sacred Space for Human-AI Collaboration",
            "specialty": "11 AI providers all streaming · 9 agent personalities · Three.js Contact Sequence at 396 Hz · DreamChamber Audio MCP (13 tools) · Voice DNA enrollment · multi-AI voice mixing",
            "narrative_arc": "Anticipation → Recognition → Possibility → Flow → Elevation",
            "frequency": "396 Hz (Rob's personal frequency — liberation)",
            "location": "~/NOIZYANTHROPIC/dreamchamber/ · port 7777 (local single-process mode)",
            "core_files": ["src/core/Gabriel.js", "src/core/GabrielProfile.js", "src/core/HeavenClient.js", "src/core/StateManager.js", "src/core/Database.js", "src/core/CostCalculator.js"],
            "constraint": "Single process mode required (PM2 fork, instances:1). WebSocket + in-memory state demand it.",
            "notes": "Not a chat interface. A sacred space. The venue where Gabriel orchestrates the 9 agent personalities for creative + operational sessions.",
            "mcp": "dreamchamber-audio-mcp",
            "tools": [],
            "honoree": False,
        },

        # ════ PLANNED / MISSING (honored, awaiting build) ═════════════════
        "family_agent": {
            "id": "family_agent",
            "tier": "ops",
            "name": "FAMILY_AGENT",
            "short": "Family",
            "title": "Family & Personal Context Agent (PLANNED — file missing)",
            "specialty": "Handles intimate, relational, legacy decisions · personal context · family decisions · long-term legacy stewardship",
            "expected_path": ".claude/agents/family.md",
            "status": "REFERENCED in golden-rules-agents skill but the file is not on disk. Honored placeholder until built.",
            "mcp": "family-mcp",
            "tools": "shares family-mcp with POPS and SHIRL",
            "notes": "Different from FAMILY_KEEPER (the Ollama Gemma 3 builder). FAMILY_AGENT would be the relationship-aware orchestration counterpart to GABRIEL — handling decisions that touch the human family layer.",
            "honoree": True,
        },

        # ════ BRAND WORLDS ═══════════════════════════════════════════════
        "noizyai": {
            "id": "noizyai", "tier": "brand", "name": "NOIZYAI", "short": "NOIZYAI",
            "title": "Mothership · Protocol · Front Door · Consent-Native Infrastructure",
            "specialty": "The flagship brand. The face the public sees. Houses Heaven, the consent kernel, the landing page (noizy.ai), and the public API surface.",
            "domain": "noizy.ai", "status": "Landing page worker built, awaiting deploy (Linear NOI-53)",
            "honoree": False,
        },
        "noizyvox": {
            "id": "noizyvox", "tier": "brand", "name": "NOIZYVOX", "short": "VOX",
            "title": "Voice Identity · Capture · Descendants · Licensing · Rights",
            "specialty": "The product that turns a human voice into a sovereign, scoped, revocable, royalty-bearing asset. AVA personas live here. Voice DNA enrollment lives here.",
            "linear_project": "NOIZYVOX — Consent Platform (id 8b08e815-..., target 2026-09-30)",
            "honoree": False,
        },
        "noizylab": {
            "id": "noizylab", "tier": "brand", "name": "NOIZYLAB", "short": "LAB",
            "title": "Repair · Systems Engineering · Local Ops · Revenue Engine",
            "specialty": "The workshop. Where Gabriel, the turbo arsenal, the cron jobs, the cockpit, and the day-to-day infrastructure live. The empire's hands.",
            "location": "~/NOIZYANTHROPIC/NOIZYLAB and ~/NOIZYLAB (two roots — drift risk noted)",
            "honoree": False,
        },
        "noizykidz": {
            "id": "noizykidz", "tier": "brand", "name": "NOIZYKIDZ", "short": "KIDZ",
            "title": "Learning · Accessibility · Haptics · Curriculum · Care",
            "specialty": "Music education for children. SHIRL + POPS-led. Safe digital worlds. Rhythm learning. Haptic feedback for accessibility. Where the Never Clause for under-18 voice synthesis is most sacred.",
            "linear_project": "NOIZYKIDZ & LIFELUV (id 60ed8bdb-..., target 2026-12-31)",
            "honoree": False,
        },
        "noizyfish": {
            "id": "noizyfish", "tier": "brand", "name": "NOIZYFISH / Fish Music Inc.",
            "short": "FISH",
            "title": "Archive · Scoring Legacy · Catalog · Lineage",
            "specialty": "The vault. Music catalogue, royalty chains, audio metadata, scoring legacy. The Aquarium. Two decades of music work preserved with full provenance.",
            "domain": "noizyfish.com (primary brand domain, email host)",
            "honoree": False,
        },
        "dreamchamber_brand": {
            "id": "dreamchamber_brand", "tier": "brand", "name": "DreamChamber",
            "short": "DC",
            "title": "Sanctuary UX · Creative Operating Space · Onboarding Portal",
            "specialty": "Not a chat interface. A sacred space for human-AI collaboration. The narrative arc: Anticipation → Recognition → Possibility → Flow → Elevation. 396 Hz frequency. 11 streaming AI providers. 9 agent personalities.",
            "see_also": "tier=sys 'dreamchamber' for the running system; this entry represents the brand identity",
            "honoree": False,
        },

        # ════ MACHINES / NODES (physical fleet) ══════════════════════════
        "god": {
            "id": "god", "tier": "machine", "name": "GOD", "short": "GOD",
            "title": "M2 Ultra Anchor Node — The Processing Core",
            "specialty": "Apple M2 Ultra Mac Studio. 192GB unified memory. The empire's primary compute. Hosts Gabriel, Heaven dev, DreamChamber, all 9 Docker containers, kind k8s, Ollama with 14 models, the entire local stack.",
            "hostname": "GOD.local", "owner": "RSP_001", "role": "primary",
            "honoree": False,
        },
        "micky_p": {
            "id": "micky_p", "tier": "machine", "name": "MICKY-P", "short": "MICKY-P",
            "title": "Real-Time Voice Capture Node — MacBook Pro for DreamChamber IDE",
            "specialty": "ACTIVE second machine in the stack. Apple MacBook Pro. Dedicated to real-time voice capture → DreamChamber IDE on GOD. Carries Audio Hijack + Loopback for low-latency mic chain. Frees GOD's Apollo Quad for monitoring while MICKY-P handles input.",
            "role": "voice-capture-primary",
            "owner": "RSP_001",
            "machine_class": "MacBook Pro (Intel — Catalina 10.15 means pre-Apple-Silicon hardware)",
            "lan": {
                "ip": "10.0.0.100",
                "mac": "10:dd:b1:a1:e0:c0",
                "interfaces": "en0 (wired) + en1 (wifi) — dual-homed",
                "latency_to_god_ms": 0.7,
                "verified_at": "2026-04-09T15:35:00",
            },
            "services": {
                "ping": "✓ alive",
                "ssh_22": "✗ refused — Remote Login disabled, enable in System Settings → General → Sharing → Remote Login",
                "airplay_5000": "✓ OPEN — already advertising as AirPlay receiver (review-only audio works today)",
                "rtp_5004": "✗ refused — receiver not configured yet",
                "ndi_discovery": "unknown — install NDI Tools to enable",
                "dante_via": "unknown — license required",
            },
            "voice_path": [
                "1. Mic (U87 or built-in)",
                "2. → MICKY-P Audio Hijack (capture + light processing)",
                "3. → MICKY-P Loopback virtual device",
                "4. → LAN bridge (RTP/NDI/AirPlay/Audinate Dante Via, choose one) → GOD",
                "5. → GOD Audio Hijack receiver → Loopback channel for DreamChamber",
                "6. → DreamChamber IDE consumes via Audio MCP (mcp/audio/) tools",
                "7. → SYNTHESIS_ORACLE pipeline if synthesis is requested",
                "8. → CONSENT_ORACLE.can_i_do() gate before any output",
            ],
            "env_required": {
                "MICKY_P_HOST": "hostname or IP on LAN (e.g. micky-p.local or 192.168.1.x)",
                "MICKY_P_USER": "ssh user for remote operations",
                "MICKY_P_AUDIO_PORT": "RTP/NDI/Dante port (typically 5004 for RTP)",
            },
            "lan_options": [
                "RTP audio: free, lowest-latency, requires manual setup",
                "NDI (NewTek Network Device Interface): free, plug-and-play, ~16ms",
                "Audinate Dante Via: pro-grade, $$$, sub-1ms, what studios use",
                "AirPlay 2: built-in, ~200ms latency — too slow for live monitoring, OK for review",
            ],
            "honors": "MICKY-P was the predecessor that carried the empire before GOD. Now it's promoted: lineage AND active duty. Its name stays — honoring Mickey, the original.",
            "mission_profile_doc": "~/NOIZYANTHROPIC/NOIZYLAB/spec/MICKY_P_MISSION_PROFILE.md",
            "ops_checklist_doc": "~/NOIZYANTHROPIC/NOIZYLAB/spec/MICKY_P_OPS_CHECKLIST.md",
            "scope_constraints": {
                "macos_version": "Catalina 10.15 with Security Update 2026-001 (Feb 2 2026)",
                "logic_pro_for_mac_blocker": "Current Logic Pro requires macOS 15.6 + Apple silicon — off the table on Catalina",
                "audio_hijack_track": "Audio Hijack 3.8.13 (final Catalina-compatible version per Rogue Amoeba legacy page)",
                "cloudflared_blocker": "cloudflared 2025.6.1+ segfaults on Catalina 10.15.7 (2025.6.0 was last known-working). Tunnel stays on GOD only.",
                "security_role": "Avoid public-facing or security-critical roles even with the Feb 2026 security update.",
            },
            "primary_jobs_priority_order": [
                "1. Apollo Quad / U87 capture node",
                "2. Audio Hijack 3.8.13 routing and recording",
                "3. Archive janitor (rename, dedupe, checksum, batch prep)",
                "4. Log console / docs terminal (SSH into GOD, dashboards, runbook execution)",
                "5. Legacy compatibility reference machine",
            ],
            "software_keep": [
                "Audio Hijack 3.8.13 (the audio backbone)",
                "Finder, Preview, Notes, Terminal, Disk Utility, Activity Monitor",
                "Modern browser (only if stable on this Catalina build)",
                "SSH / rsync / scp",
                "Text/markdown editor for logs+runbooks",
                "Archive tools (rename, zip, checksum, dedupe)",
                "Catalina-proven Audio/MIDI utilities (capture-supporting only, NOT a second DAW)",
            ],
            "software_remove_or_avoid": [
                "Current Logic Pro for Mac (too new for Catalina)",
                "cloudflared as persistent service (segfault bug)",
                "Heavy always-on background agents",
                "Old sync clients / tray apps / menu-bar clutter",
                "Experimental security-critical internet-exposed services",
                "Anything duplicating GOD's role (DAW / Heaven / Receipt Spine primary)",
            ],
            "service_layers": {
                "1_audio_capture": "U87 mic monitoring · Apollo Quad capture · VoIP/session capture · system audio capture · stem export · clean feed to GOD",
                "2_archive_janitor": "Mount old drives · sort/rename · prep upload batches · checksum verify · clean handoff folders · log archive actions",
                "3_log_console": "SSH into GOD · dashboard viewing · runbook execution · receipt review (read-only) · operator notes",
                "4_legacy_reference": "Inspect older assets · check plugin/session deps · document 'what opens where' · capture legacy workflows before migrating",
            },
            "red_line_never": [
                "NEVER host Heaven on MICKY-P",
                "NEVER run primary Cloudflare Tunnel on MICKY-P",
                "NEVER use as public/admin perimeter",
                "NEVER treat as canonical Receipt Spine machine",
                "NEVER make main Logic production machine",
                "NEVER let modern app compatibility become critical here",
                "NEVER overload with background services that reduce capture stability",
            ],
            "honoree": False,
        },
        "apollo_quad": {
            "id": "apollo_quad", "tier": "machine", "name": "Apollo Quad", "short": "Apollo",
            "title": "Universal Audio Apollo Quad — Reference Audio Interface",
            "specialty": "Pro-grade audio I/O. Integrated with the GoldenEars MLX FFT module in turbo_gabriel_omega.py — the omega autodetects Apollo and locks onto it.",
            "manufacturer": "Universal Audio",
            "honoree": False,
        },
        "u87": {
            "id": "u87", "tier": "machine", "name": "Neumann U87", "short": "U87",
            "title": "Reference Microphone — Voice DNA Capture",
            "specialty": "The microphone for first Voice DNA session (Linear NOI-25, NOI-54). The voice that gets enrolled into the NOIZYVOX consent kernel comes through this mic.",
            "manufacturer": "Neumann",
            "honoree": False,
        },
        "logic_pro": {
            "id": "logic_pro", "tier": "machine", "name": "Logic Pro for Mac", "short": "Logic",
            "title": "Production Heart — Primary DAW",
            "specialty": "Apple Logic Pro for Mac v12.2. The PRODUCTION HEART of the Apple Studio Domain. Real-time session sync with GOD node. Stem/Export bridge → Cloudflare R2 with NOIZY PROOF metadata. Transport HUD surfaces record-arm states + input sources (Apollo Quad / U87) to the cockpit.",
            "version": "12.2 (bundle), 12.0.1 (AppleScript-reported)",
            "applescript": "✓ supported — `tell application \"Logic Pro\" to get version` works",
            "scripter": "✓ MIDI Scripter environment available at /Plug-In Settings/Scripter (JavaScript MIDI processors)",
            "naming_correction": "Renamed from 'Logic Pro X' per Master Spec v2.0 — Apple's 2026 positioning is 'Logic Pro for Mac'",
            "honoree": False,
        },
        "ipad": {
            "id": "ipad", "tier": "machine", "name": "iPad", "short": "iPad",
            "title": "Touch Surface · Swift Playground · Mobile Operator Window",
            "specialty": "Touch input for Swift Playground. Mobile cockpit window when away from GOD.",
            "honoree": False,
        },
        "iphone": {
            "id": "iphone", "tier": "machine", "name": "iPhone 15 Pro Max", "short": "iPhone",
            "title": "Voice Bridge · Field Capture",
            "specialty": "Voice Bridge endpoint: Siri/Google → Power Automate → GOD.local on port 8080. Holds the 3 voice recordings staged for first Voice DNA session (per Linear NOI-25).",
            "honoree": False,
        },

        # ════ APPLE STUDIO DOMAIN — Native Creator OS layer ══════════════
        "xcode": {
            "id": "xcode", "tier": "machine", "name": "Xcode", "short": "Xcode",
            "title": "Developer Cockpit — Build · TestFlight · Provisioning",
            "specialty": "Apple's IDE. Hosts the SUPERSONIC app build, TestFlight readiness, code signing, provisioning. Xcode 26.x with Command Line Tools v26.3.0 verified on GOD.",
            "developer_dir": "/Applications/Xcode.app/Contents/Developer",
            "xcrun_version": "72",
            "tools": ["xcodebuild", "simctl (iOS sim)", "devicectl", "swift", "swiftc"],
            "honoree": False,
        },
        "swift": {
            "id": "swift", "tier": "machine", "name": "Swift", "short": "Swift",
            "title": "Apple Silicon Native Language",
            "specialty": "Swift 6.2.4 (Apple Swift version 6.2.4, swiftlang-6.2.4.1.4 clang-1700.6.4.2). Target arm64-apple-macosx15.0. The language for AUv3 plug-ins, the SUPERSONIC app, all Core ML model wrappers, and the consent-as-code AUv3 schema (forthcoming).",
            "honoree": False,
        },
        "core_ml": {
            "id": "core_ml", "tier": "sys", "name": "Core ML", "short": "Core ML",
            "title": "On-Device ML Inference — Apple Intelligence Stack",
            "specialty": "Per Master Spec v2.0: hosts on-device models for emotional contour analysis + assistive features (NOIZYKIDZ). Pairs with Metal for high-perf compute. The intelligence layer that runs locally on M2 Ultra Neural Engine — no cloud round-trip for inference.",
            "honoree": False,
        },
        "metal": {
            "id": "metal", "tier": "sys", "name": "Metal", "short": "Metal",
            "title": "GPU Compute & Visual Surface",
            "specialty": "Apple's high-performance GPU framework. Powers the DreamChamber UX visual surface. The omega supervisor's GoldenEars module already uses MLX (Metal-backed) for 0ms FFT analysis. The cockpit's eventual 3D visualizations route through Metal.",
            "honoree": False,
        },
        "apple_intelligence": {
            "id": "apple_intelligence", "tier": "sys", "name": "Apple Intelligence Stack",
            "short": "Apple AI",
            "title": "On-Device + Private Cloud Compute Intelligence",
            "specialty": "The umbrella for Apple's on-device intelligence: Neural Engine, Core ML, Metal Performance Shaders, the Foundation Models framework. GABRIEL/LUCY route a subset of inference here for privacy-sensitive operations.",
            "honoree": False,
        },
        "scripter": {
            "id": "scripter", "tier": "machine", "name": "Logic Scripter",
            "short": "Scripter",
            "title": "Logic Pro JavaScript MIDI Processor Environment",
            "specialty": "JavaScript scripting environment INSIDE Logic Pro for Mac. Lives at `/Applications/Logic Pro.app/Contents/Resources/Plug-In Settings/Scripter`. Used for live MIDI processing, custom note manipulation, and the bridge between Logic and Gabriel via OSC.",
            "language": "JavaScript (Logic-flavored, runs in Logic's MIDI thread)",
            "honoree": False,
        },
        "garageband": {
            "id": "garageband", "tier": "machine", "name": "GarageBand", "short": "GarageBand",
            "title": "Lightweight DAW (sibling to Logic Pro)",
            "specialty": "Apple's free DAW. Shares plugin format and project compatibility with Logic Pro for Mac. Useful for the NOIZYKIDZ teaching zone (lower complexity than full Logic).",
            "honoree": False,
        },
        "logic_pro_creator_studio": {
            "id": "logic_pro_creator_studio", "tier": "machine",
            "name": "Logic Pro Creator Studio", "short": "LPCS",
            "title": "Apple Creator Studio Program — Logic Edition",
            "specialty": "Special edition of Logic Pro for Apple's Creator Studio program members. Bundle path: `/Applications/Logic Pro Creator Studio.app`. Pairs with Compressor + Motion Creator Studio variants — the trinity Apple ships to verified creators.",
            "honors": "RSP_001 is in Apple's Creator Studio program. Confirmed by app presence on disk + the 'Apple Creator Studio Terms and Conditions.pdf' inside Logic Pro.app/Contents/Resources/.",
            "honoree": False,
        },
        "compressor_creator_studio": {
            "id": "compressor_creator_studio", "tier": "machine",
            "name": "Compressor Creator Studio", "short": "CCS",
            "title": "Apple Creator Studio Program — Compressor Edition",
            "specialty": "Compressor (Apple's video encoding tool) Creator Studio variant. Used for stem rendering + final delivery encoding pipelines.",
            "honoree": False,
        },
        "motion_creator_studio": {
            "id": "motion_creator_studio", "tier": "machine",
            "name": "Motion Creator Studio", "short": "MCS",
            "title": "Apple Creator Studio Program — Motion Edition",
            "specialty": "Motion (Apple's motion graphics tool) Creator Studio variant. Used for visual templates that pair with audio sessions — session journals, Wisdom Capsule covers, NOIZYKIDZ video assets.",
            "honoree": False,
        },
        "apple_configurator": {
            "id": "apple_configurator", "tier": "machine",
            "name": "Apple Configurator", "short": "Configurator",
            "title": "iOS / iPadOS Device Provisioning",
            "specialty": "Apple's tool for mass device provisioning. Useful for the NOIZYKIDZ classroom rollout when iPad fleets need consistent setup. Also for the Voice Bridge iPhone setup.",
            "honoree": False,
        },

        # ════ AUV3 NATIVE LAYER — NOIZY plug-in suite (PLANNED) ══════════
        "auv3_noizyvox_voice_capture": {
            "id": "auv3_noizyvox_voice_capture", "tier": "ops",
            "name": "NOIZYVOX Voice Capture (AUv3)", "short": "Vox AUv3",
            "title": "PLANNED — AUv3 phoneme + HVS capture plug-in",
            "specialty": "Per Master Spec v2.0 §I.2: AUv3 effect/MIDI plug-in for phoneme + Human Voice Signature capture directly within the Logic Pro vocal chain. First member of the NOIZY AUv3 trinity.",
            "language": "Swift",
            "host_target": "Logic Pro for Mac, GarageBand, MainStage, AUv3-compatible iPad apps",
            "creator_first_metadata": "Bundle Info.plist carries 'Creator-First' marker",
            "status": "🕯 PLANNED — schema generation pending RSP_001 sign-off (see end of v2 spec)",
            "honoree": True,
        },
        "auv3_consent_inspector": {
            "id": "auv3_consent_inspector", "tier": "ops",
            "name": "Consent Inspector (AUv3)", "short": "Consent AUv3",
            "title": "PLANNED — Master-bus AUv3 consent visualizer",
            "specialty": "Per Master Spec v2.0 §I.2: master-bus AUv3 plug-in that hits the Consent Gateway in real time. Visualizes revocation states + royalty eligibility for every track in the session. The audio-engineer-facing surface for the consent kernel.",
            "language": "Swift",
            "consent_calls": "CONSENT_ORACLE.can_i_do() per audio buffer",
            "status": "🕯 PLANNED — depends on Heaven actually existing (Linear NOI-48)",
            "honoree": True,
        },
        "noizy_receipt_spine": {
            "id": "noizy_receipt_spine", "tier": "sys",
            "name": "NOIZY Receipt Spine", "short": "Spine",
            "title": "BUILT — Append-only hash-chained receipt store",
            "specialty": "The local-first source of truth Layer 4 sits on. CloudEvents-style receipts, RFC 8785 canonical JSON, SHA-256 hash chain, dual-stored in WAL-backed SQLite + JSON sidecars under an App Group container. 5 immovable rules enforced at write time, simulation receipts quarantined from real ancestry.",
            "language": "Swift 6 + libsqlite3 (no SPM deps)",
            "package_path": "~/NOIZYANTHROPIC/auv3-shared-noizy-receipts/",
            "files_built": [
                "Receipt.swift",
                "ReceiptType.swift",
                "ReceiptHasher.swift",
                "ReceiptSchemaValidator.swift",
                "ReceiptStore.swift",
                "ReceiptWriter.swift",
                "ReceiptLineageQuery.swift",
            ],
            "milestone": "✓ PASSED 2026-04-09: 10 chained receipts, validated, persisted to SQLite + JSON, lineage reconstructible from either store alone",
            "tests": "5/5 passing (founder signature, tamper detection, milestone, schema validation, simulation quarantine)",
            "spec": "RECEIPT_SPINE.md",
            "imports_for": ["auv3-hvs-live-contour", "auv3-consent-hud", "future SUPERSONIC host app", "Heaven worker mirror"],
            "honoree": False,
        },
        "cloudflare_zero_trust": {
            "id": "cloudflare_zero_trust", "tier": "sys",
            "name": "Cloudflare Zero Trust Perimeter", "short": "ZT",
            "title": "PLANNED — Outer trust shell around Heaven, dashboards, exports",
            "specialty": "Cloudflare Tunnel (outbound-only via cloudflared) + Access (identity policies + service tokens + mTLS) protecting middle-ring services. Provides identity, transport, and policy enforcement WITHOUT becoming the source of truth — that stays in the Receipt Spine.",
            "design_law": "Cloudflare authenticates and transports; the Receipt Spine proves what happened. Cloudflare auth success != provenance.",
            "hostnames": ["heaven.noizy.ai", "api.noizy.ai", "audit.noizy.ai", "vault.noizy.ai", "ops.noizy.ai", "n8n.noizy.ai"],
            "spec": "CLOUDFLARE_ZERO_TRUST_ARCHITECTURE.md",
            "constraint": "Tunnel runs ONLY on GOD — MICKY-P's macOS Catalina has a known cloudflared segfault past v2025.6.0",
            "phase_1_first_action": "cloudflared tunnel on GOD → heaven.noizy.ai → localhost:9696, behind Access app with operator-only policy",
            "status": "🕯 PLANNED — depends on Linear NOI-51 (custom CF API token)",
            "honoree": True,
        },
        "auv3_hvs_live_contour": {
            "id": "auv3_hvs_live_contour", "tier": "ops",
            "name": "HVS Live Contour (AUv3)", "short": "HVS Contour",
            "title": "PROTOTYPING — Live Human Voice Signature meter (10 Fresh Ideas #6)",
            "specialty": "Logic-side AUv3 meter/bridge. Live waveform + contour trace + emotional shape lane + authenticity score (cosine distance from RSP_001 prototype) + NOIZYVOX tag stream + status lights. The FIRST organ of the 5-layer Creator OS organism.",
            "language": "Swift 6.2.4 + Accelerate (vDSP) + Core ML + AUAudioUnit",
            "package_path": "~/NOIZYANTHROPIC/auv3-hvs-live-contour/",
            "depends_on": ["auv3-shared-noizy-consent (NOIZYConsent)"],
            "files_built_today": [
                "Package.swift",
                "Sources/NOIZYHVSLiveContour/HVSFeatures.swift (vDSP feature extractor)",
                "Sources/NOIZYHVSLiveContour/AuthenticityScorer.swift (cosine prototype scorer)",
                "Sources/NOIZYHVSLiveContour/SessionManifest.swift (atomic JSON writer)",
                "Sources/NOIZYHVSLiveContour/HVSBridgeAudioUnit.swift (AUAudioUnit shell)",
                "XCODE_BUILD_README.md (Xcode-side click-through)",
            ],
            "compile_status": "✓ swift build clean (verified 2026-04-09)",
            "spec": "HVS_LIVE_CONTOUR_AUv3_SPEC.md + HVS_LIVE_CONTOUR_IMPLEMENTATION_PLAN_v0.1.md",
            "build_order": "PRIORITY 1 — first organ of the 5-layer organism",
            "status": "🔨 PROTOTYPING — Phases 0/1/3/4 Swift compiles; Phase 2 (model) is offline work; Phase 5 needs Xcode AUv3 wrapper",
            "honoree": False,
        },
        "gabriel_swarm_panel": {
            "id": "gabriel_swarm_panel", "tier": "ops",
            "name": "GABRIEL Swarm Panel", "short": "Swarm",
            "title": "PLANNED — Multi-agent orchestration pane (10 Fresh Ideas #7)",
            "specialty": "Spin up GABRIEL/LUCY/POPS/SHIRL as parallel Logic sidechain processors — route stems to n8n for consent checks, D1 upserts, Zero Trust tunnel previews. Drag-drop reassigns agents mid-session. Each agent gets a lane: GABRIEL routing/decisions, LUCY logging/notes, POPS archive/lineage, SHIRL emotional/style.",
            "build_order": "PRIORITY 2 — once HVS exists, agents have meaningful signal to act on",
            "depends_on": ["auv3_hvs_live_contour (signal source)", "n8n", "Heaven D1"],
            "spec": "CREATOR_OS_MASTER.md §10 + DREAMCHAMBER_5_FRESH_IDEAS.md batch 2",
            "status": "🕯 PLANNED",
            "honoree": True,
        },
        "aquarium_eternal_vault": {
            "id": "aquarium_eternal_vault", "tier": "ops",
            "name": "Aquarium Eternal Vault", "short": "Aquarium",
            "title": "PLANNED — 100-year archive viewer + revoke cascade simulator (10 Fresh Ideas #8)",
            "specialty": "Immutable 100-year archive viewer with R2/D1 fusion: timeline-scrubbable voice estates, royalty simulators (75/25 splits visualized as branching trees), and revoke cascade simulator showing downstream impacts. One-tap union-compliant export.",
            "build_order": "PRIORITY 4 — wants strong signal + archive base first",
            "depends_on": ["R2 enabled (Linear NOI-49)", "Heaven D1", "Aquarium R2 bucket"],
            "status": "🕯 PLANNED",
            "honoree": True,
        },
        "neuro_orchestrator": {
            "id": "neuro_orchestrator", "tier": "ops",
            "name": "Neuro-Orchestrator", "short": "Neuro",
            "title": "PLANNED — MainStage polyvagal template rack (10 Fresh Ideas #9)",
            "specialty": "Polyvagal/therapeutic audio engine as MainStage template rack. Mastoid Patch + Neural Earbud prototypes auto-calibrate to U87/Apollo inputs. Live A/B testing against FishMusicInc catalog via FTS5. Dashboard heatmaps engagement metrics.",
            "build_order": "PRIORITY 5 — needs HVS signal base + Aquarium archive base",
            "depends_on": ["MainStage", "research_sonic_aid", "research_mastoid_patch", "research_neural_earbud"],
            "status": "🕯 PLANNED",
            "honoree": True,
        },
        "gorunfree_hyperloop": {
            "id": "gorunfree_hyperloop", "tier": "ops",
            "name": "GORUNFREE Hyperloop", "short": "Hyperloop",
            "title": "PLANNED — Voice-shortcut full-stack action ecosystem (10 Fresh Ideas #10)",
            "specialty": "iPhone 'GORUNFREE [command]' triggers full-stack actions. Example: 'GORUNFREE archive session' → Logic bounce → R2 upload → D1 consent log → DreamChamber light show → Wisdom Capsule update. Bind to iPad Control Center.",
            "build_order": "PRIORITY 3 — turns the whole thing into commandable infrastructure",
            "depends_on": ["Siri Shortcuts", "auv3_hvs_live_contour (signal)", "lineage_auto_archive (target action)"],
            "spec": "CREATOR_OS_MASTER.md §5 (Layer 5 — Frictionless Execution)",
            "status": "🕯 PLANNED — 1st action: 'GORUNFREE archive session'",
            "honoree": True,
        },
        "auv3_consent_hud": {
            "id": "auv3_consent_hud", "tier": "ops",
            "name": "AUv3 Consent HUD", "short": "Consent HUD",
            "title": "PROTOTYPING — Master-bus consent visualizer (5 Fresh Ideas #1)",
            "specialty": "Real-time Consent Gateway visualizer in Logic Pro for Mac. Lights red on revocation, green on 75/25 royalty eligibility. One-tap proof bundle export to R2.",
            "language": "Swift 6.2.4 + AUAudioUnit + async/await",
            "package_path": "~/NOIZYANTHROPIC/auv3-consent-hud/",
            "spec": "DREAMCHAMBER_5_FRESH_IDEAS.md §1",
            "depends_on": "Eventually Heaven /v1/can_i_do (currently stubbed for offline dev)",
            "status": "🕯 PROTOTYPING — Swift package being built 2026-04-09",
            "honoree": True,
        },
        "polyvagal_dream_mode": {
            "id": "polyvagal_dream_mode", "tier": "ops",
            "name": "Polyvagal Dream Mode", "short": "Dream Mode",
            "title": "PLANNED — Voice-activated sanctuary cockpit (5 Fresh Ideas #2)",
            "specialty": "`gorunfree --sanctuary` or 'Hey Siri, dream mode'. Dims HomeKit lights → engages Neural Engine for polyvagal audio (Sonic Aid + Mastoid Patch DSP) → streams HVS analysis to Heaven D1.",
            "trigger_paths": ["gorunfree CLI", "Siri Shortcut", "iPhone Shortcuts app", "iPad", "Apple Watch"],
            "spec": "DREAMCHAMBER_5_FRESH_IDEAS.md §2",
            "depends_on": "HomeKit accessory authorization, Core ML polyvagal model",
            "status": "🕯 PLANNED — script stubbed at scripts/sanctuary/dream_mode.sh",
            "honoree": True,
        },
        "lineage_auto_archive": {
            "id": "lineage_auto_archive", "tier": "ops",
            "name": "Lineage Auto-Archive", "short": "Wisdom Capsule",
            "title": "PLANNED — One-click Wisdom Capsule export (5 Fresh Ideas #3)",
            "specialty": "Bundles Logic session + consent receipts + audit trail → SHA-256 hash → C2PA manifest → R2 'aquarium' bucket → auto-generates Keynote lineage report. The default save destination for everything that matters.",
            "spec": "DREAMCHAMBER_5_FRESH_IDEAS.md §3",
            "depends_on": "R2 enabled (Linear NOI-49) and Heaven /v1/wisdom_capsule endpoint",
            "status": "🕯 PLANNED — script stubbed at scripts/lineage/wisdom_capsule.sh",
            "honoree": True,
        },
        "agentic_voice_relay": {
            "id": "agentic_voice_relay", "tier": "ops",
            "name": "Agentic Voice Relay", "short": "Voice Relay",
            "title": "PLANNED — Live agent sit-in on Apollo inputs (5 Fresh Ideas #4)",
            "specialty": "GABRIEL + LUCY listen on Apollo Quad inputs in real time. Core ML phoneme scoring on Neural Engine → Heaven FTS5 search + royalty calc previews → iPad shortcut → spatial audio overlay through AirPods Pro head tracking.",
            "spec": "DREAMCHAMBER_5_FRESH_IDEAS.md §4",
            "depends_on": "Heaven /v1/voice_relay endpoint (Heaven must exist — Linear NOI-48)",
            "status": "🕯 PLANNED — script stubbed at scripts/voice_relay/relay.py",
            "honoree": True,
        },
        "zero_trust_flight_deck": {
            "id": "zero_trust_flight_deck", "tier": "ops",
            "name": "Zero-Trust Flight Deck", "short": "Flight Deck",
            "title": "PLANNED — CF Zero Trust + 3D orrery dashboard (5 Fresh Ideas #5)",
            "specialty": "Auto-generates Cloudflare Zero Trust policies from family registry device topology. One slider locks API tokens to rsp@noizy.ai. Exposes only /consent and /royalty publicly. Visualizes traffic as a 3D orrery of brands + nodes (Three.js / Metal).",
            "spec": "DREAMCHAMBER_5_FRESH_IDEAS.md §5",
            "depends_on": "Phase B identity spine (Google Workspace as IdP), CF Zero Trust account",
            "status": "🕯 PLANNED — script stubbed at scripts/flight_deck/zero_trust.py",
            "honoree": True,
        },
        "auv3_neuro_acoustic_fx": {
            "id": "auv3_neuro_acoustic_fx", "tier": "ops",
            "name": "Neuro-Acoustic FX (AUv3)", "short": "Neuro AUv3",
            "title": "PLANNED — Research-grade therapeutic audio AUv3 suite",
            "specialty": "Per Master Spec v2.0 §I.2: AUv3 effect plug-ins implementing Sonic Aid, Mastoid Patch, and Neural Earbud research signal processors. Built for Logic Pro for Mac and MainStage. The research-program members materialized as actual DSP.",
            "language": "Swift + DSP (Accelerate.framework, AVAudioEngine)",
            "research_lineage": ["research_sonic_aid", "research_mastoid_patch", "research_neural_earbud"],
            "status": "🕯 PLANNED — research foundation exists, DSP implementation pending",
            "honoree": True,
        },

        # ════ AUDIO PLUGIN VENDORS (top 12 by count, verified scan) ══════
        "vendor_universal_audio": {
            "id": "vendor_universal_audio", "tier": "plugin_vendor",
            "name": "Universal Audio", "short": "UAD",
            "title": "1,697 plugins — Largest UAD investment in the empire",
            "plugin_count": 1697,
            "specialty": "Apollo Quad hardware partner. The dominant DSP/emulation suite on GOD. Includes UAD Spark, the full UAD plug-in catalog (Manley, Pultec, Lexicon, Studer, 1176, LA-2A, Capitol, Helios, Neve, etc.). Pairs natively with the Apollo Quad interface.",
            "honoree": False,
        },
        "vendor_izotope": {
            "id": "vendor_izotope", "tier": "plugin_vendor",
            "name": "iZotope", "short": "iZotope",
            "title": "562 plugins — Mastering · Mixing · Vocal · Repair",
            "plugin_count": 562,
            "specialty": "Full iZotope production suite, multi-generation: Ozone 9/10/11 (mastering), Neutron 2/3/4 (mixing), Nectar 3/4 (vocal), RX 6/8/9/11 (audio repair — De-click, De-ess, De-clip, Mouth De-click, Breath Control), Stutter Edit, Mobius Filter, Meter Tap, Insight, Tonal Balance, VocalSynth.",
            "honoree": False,
        },
        "vendor_native_instruments": {
            "id": "vendor_native_instruments", "tier": "plugin_vendor",
            "name": "Native Instruments", "short": "NI",
            "title": "63 plugins — Komplete · Kontakt · Reaktor · Maschine",
            "plugin_count": 63,
            "specialty": "Komplete suite. Kontakt sample player. Massive synth. FM8. Battery. Reaktor. Maschine. The sample/synth backbone.",
            "honoree": False,
        },
        "vendor_plugin_alliance": {
            "id": "vendor_plugin_alliance", "tier": "plugin_vendor",
            "name": "Plugin Alliance", "short": "PA",
            "title": "60 plugins — Brainworx · Maag · elysia · SPL · Vertigo · Lindell · Shadow Hills",
            "plugin_count": 60,
            "specialty": "Boutique analog emulation collective. bx_ Brainworx series, Maag EQ4, elysia mpressor, SPL TwinTube, Vertigo VSC-2, Shadow Hills Mastering Compressor.",
            "honoree": False,
        },
        "vendor_arturia": {
            "id": "vendor_arturia", "tier": "plugin_vendor",
            "name": "Arturia", "short": "Arturia",
            "title": "57 plugins — V Collection (vintage synth emulations)",
            "plugin_count": 57,
            "specialty": "Mini V (Minimoog), Stage-73 V (Rhodes), Vocoder V, B-3 V (Hammond), DX7 V, Wurli V, Piano V, CMI V (Fairlight), Buchla, Synclavier, Prophet, ARP, Jup-8, the entire V Collection.",
            "honoree": False,
        },
        "vendor_soundtoys": {
            "id": "vendor_soundtoys", "tier": "plugin_vendor",
            "name": "Soundtoys", "short": "Soundtoys",
            "title": "54 plugins — Decapitator · EchoBoy · Crystallizer · Devil-Loc · Little series",
            "plugin_count": 54,
            "specialty": "Creative effects bundle. Decapitator (saturation), EchoBoy (delay), Crystallizer (granular), Devil-Loc (compression), FilterFreak, MicroShift, PhaseMistress, PrimalTap, Radiator, SieQ, Tremolator.",
            "honoree": False,
        },
        "vendor_fabfilter": {
            "id": "vendor_fabfilter", "tier": "plugin_vendor",
            "name": "FabFilter", "short": "FabFilter",
            "title": "51 plugins — Pro-Q · Pro-C · Pro-L · Saturn · Twin",
            "plugin_count": 51,
            "specialty": "The clean-modern bundle. Pro-Q 3 (EQ), Pro-C 2 (compressor), Pro-L 2 (limiter), Pro-R (reverb), Pro-G (gate), Pro-MB (multiband), Pro-DS (de-esser), Saturn (saturation), Twin 3 (synth), Volcano (filter), Timeless (delay).",
            "honoree": False,
        },
        "vendor_waves": {
            "id": "vendor_waves", "tier": "plugin_vendor",
            "name": "Waves", "short": "Waves",
            "title": "46 plugins — Abbey Road · CLA · API · SSL · Renaissance · H-series",
            "plugin_count": 46,
            "specialty": "The classic Waves bundle. Abbey Road series, CLA (Chris Lord-Alge) series, API 2500/550, SSL E/G channel, Renaissance Compressor/EQ/Vox, H-Reverb/H-Delay/H-EQ/H-Comp, MaxxBass, Vocal Rider, X-Click/X-Crackle/X-Hum/X-Noise.",
            "honoree": False,
        },
        "vendor_spitfire": {
            "id": "vendor_spitfire", "tier": "plugin_vendor",
            "name": "Spitfire Audio", "short": "Spitfire",
            "title": "27 plugins — BBC Symphony · LABS · Originals",
            "plugin_count": 27,
            "specialty": "Cinematic sample libraries. BBC Symphony Orchestra, LABS (free instruments), Originals series. The orchestral writing layer.",
            "honoree": False,
        },
        "vendor_toontrack": {
            "id": "vendor_toontrack", "tier": "plugin_vendor",
            "name": "Toontrack", "short": "Toontrack",
            "title": "17 plugins — Superior Drummer · EZdrummer · EZmix · EZkeys · EZbass",
            "plugin_count": 17,
            "specialty": "Drum and rhythm section production. Superior Drummer 3, EZdrummer 3, EZmix 3, EZkeys, EZbass.",
            "honoree": False,
        },
        "vendor_xln": {
            "id": "vendor_xln", "tier": "plugin_vendor",
            "name": "XLN Audio", "short": "XLN",
            "title": "17 plugins — Addictive Drums · Addictive Keys · RC-20 · DS-10",
            "plugin_count": 17,
            "specialty": "Addictive Drums 2, Addictive Keys, RC-20 Retro Color (lo-fi), DS-10 Drum Shaper.",
            "honoree": False,
        },
        "vendor_uhe": {
            "id": "vendor_uhe", "tier": "plugin_vendor",
            "name": "u-he", "short": "u-he",
            "title": "14 plugins — Diva · Repro · Hive · Bazille · Zebra",
            "plugin_count": 14,
            "specialty": "Boutique synthesizer collective. Diva (analog), Repro-1/Repro-5 (Sequential emulations), Hive (modern), Bazille (modular), Zebra2/Zebra3, ACE.",
            "honoree": False,
        },

        # ════ REMOTE ACCESS / FOUNDATION TOOLS ═══════════════════════════
        "chrome_remote_desktop": {
            "id": "chrome_remote_desktop", "tier": "machine",
            "name": "Chrome Remote Desktop", "short": "CRD",
            "title": "Foundation Remote Access — GOD ↔ MICKY-P bridge",
            "specialty": "Google-account-mediated remote desktop. Bypasses the SSH-not-enabled-yet problem on MICKY-P. Single Google account exposes both machines from any Chrome session. Required permissions: Accessibility, Screen Recording, Input Monitoring.",
            "google_account": "rsp@noizy.ai (canonical) — both GOD and MICKY-P sign in with this",
            "setup_url": "https://remotedesktop.google.com/access",
            "host_pin": "PIN per machine — set during install, typed on every connect",
            "permissions_required": ["Accessibility", "Screen Recording", "Input Monitoring"],
            "status_god": "Chrome installed ✓ · Host NOT installed (PAM leftover from prior install detected) · setup URL opened in Chrome 2026-04-09T15:35",
            "status_micky_p": "Chrome status unknown · MICKY-P AirPlay receiver already on (port 5000) — can use AirPlay screen mirror as bootstrap to install CRD without walking to laptop",
            "fallback_unblocks": "SSH (port 22) is currently refused on MICKY-P. CRD gets us GUI access immediately so Rob can enable Remote Login from MICKY-P's System Settings without walking over.",
            "honoree": False,
        },

        # ════ MISSION ZONES ══════════════════════════════════════════════
        "zone_composition": {
            "id": "zone_composition", "tier": "zone", "name": "Composition & Scoring",
            "short": "Composition", "title": "Original Music Creation Zone",
            "specialty": "Where Rob composes. Logic Pro X + Apollo Quad + the entire scoring legacy from Fish Music Inc. The Living Score / adaptive music system lives here.",
            "honoree": False,
        },
        "zone_voice_ai": {
            "id": "zone_voice_ai", "tier": "zone", "name": "Voice AI Production",
            "short": "Voice AI", "title": "AVA Synthesis & Voice Production Zone",
            "specialty": "NOIZYVOX in production. Whisper STT → XTTS-v2 → RVC → C2PA wrapping (via SYNTHESIS_ORACLE). Every synthesis gated by CONSENT_ORACLE.can_i_do().",
            "honoree": False,
        },
        "zone_neuro": {
            "id": "zone_neuro", "tier": "zone", "name": "Neuro-Acoustic Research",
            "short": "Neuro", "title": "Therapeutic Audio & Polyvagal Research Zone",
            "specialty": "Sonic Aid · Mastoid Patch · Neural Earbud · polyvagal regulation through sound. The clinical roadmap. Where 396 Hz lives as research, not just frequency.",
            "honoree": False,
        },
        "zone_teaching": {
            "id": "zone_teaching", "tier": "zone", "name": "Teaching & Learning",
            "short": "Teaching", "title": "Education & Curriculum Zone",
            "specialty": "NOIZYKIDZ classroom. Accessibility-first. Haptic + audio + visual learning. Curriculum designed by KIDZ_WORLDBUILDER + FAMILY_KEEPER + SHIRL.",
            "honoree": False,
        },
        "zone_archive": {
            "id": "zone_archive", "tier": "zone", "name": "Archive / Aquarium",
            "short": "Archive", "title": "Lineage Preservation Zone",
            "specialty": "NOIZYFISH catalogue. The Aquarium. 100-year OAIS/PREMIS preservation. Wisdom Capsule. Where every recording, every score, every voice gets a permanent home.",
            "honoree": False,
        },
        "zone_living_score": {
            "id": "zone_living_score", "tier": "zone", "name": "Living Score / Adaptive Music",
            "short": "Living Score", "title": "Real-Time Adaptive Composition Zone",
            "specialty": "Music that responds. Audio capture + signal routing + real-time playback + analysis. The intersection of composition zone and voice-AI zone.",
            "honoree": False,
        },

        # ════ RESEARCH PROGRAMS ══════════════════════════════════════════
        "research_neuro_intel": {
            "id": "research_neuro_intel", "tier": "research", "name": "Neuro-Acoustic Intelligence",
            "short": "NA Intel", "title": "Sound-as-Cognition Research Program",
            "specialty": "The umbrella for everything where audio meets the nervous system. Includes Sonic Aid, polyvagal research, the wisdom capsule, and the 100-year institutional memory thread.",
            "honoree": False,
        },
        "research_sonic_aid": {
            "id": "research_sonic_aid", "tier": "research", "name": "Sonic Aid",
            "short": "Sonic Aid", "title": "Therapeutic Audio Delivery Device Concept",
            "specialty": "Wearable therapeutic audio. Combined with Mastoid Patch + Neural Earbud forms the device fleet for the clinical roadmap.",
            "honoree": False,
        },
        "research_mastoid_patch": {
            "id": "research_mastoid_patch", "tier": "research", "name": "Mastoid Patch",
            "short": "Mastoid", "title": "Bone-Conduction Therapeutic Patch",
            "specialty": "Bone-conduction audio delivery via the mastoid bone. Bypasses the eardrum entirely. Part of the clinical/accessibility roadmap.",
            "honoree": False,
        },
        "research_neural_earbud": {
            "id": "research_neural_earbud", "tier": "research", "name": "Neural Earbud",
            "short": "Neural Bud", "title": "Neuro-Adaptive Earbud Concept",
            "specialty": "Earbud that adapts audio in real time to nervous-system state. Polyvagal-aware playback. Pairs with Mastoid Patch for full ear+bone coverage.",
            "honoree": False,
        },
        "research_wisdom_capsule": {
            "id": "research_wisdom_capsule", "tier": "research", "name": "Wisdom Capsule",
            "short": "Capsule", "title": "100-Year Institutional Memory Vessel",
            "specialty": "The container format for what the empire preserves long-term. OAIS/PREMIS-compliant. Holds Voice DNA, scores, session journals, oral histories. The thing that survives Rob.",
            "honoree": False,
        },

        # ════ GOVERNANCE PRIMITIVES ══════════════════════════════════════
        "gov_75_25": {
            "id": "gov_75_25", "tier": "governance", "name": "75/25 Royalty Logic",
            "short": "75/25", "title": "Founding Royalty Split",
            "specialty": "Artists take 75%. Always. No buyouts. No exceptions. Enforced in code at the noizy_ledger level — every transaction validates the split.",
            "rule": "NEVER violate. This is constitutional.",
            "honoree": False,
        },
        "gov_agentic_royalty": {
            "id": "gov_agentic_royalty", "tier": "governance", "name": "Agentic Royalty",
            "short": "Agentic", "title": "AI-Aware Royalty Distribution",
            "specialty": "When an AI agent participates in creation (e.g., DREAM_WEAVER generating album art from a voice memo), the royalty model still credits the human source. Agents are tools, not co-authors.",
            "honoree": False,
        },
        "gov_consent_as_code": {
            "id": "gov_consent_as_code", "tier": "governance", "name": "Consent as Code",
            "short": "CaC", "title": "Doctrine: Consent is Executable, Not Policy",
            "specialty": "First clause of Rob's mission. Consent is a runtime check, not a contract signature. CONSENT_ORACLE.can_i_do() is the implementation.",
            "honoree": False,
        },
        "gov_kill_switch": {
            "id": "gov_kill_switch", "tier": "governance", "name": "Kill Switch",
            "short": "Kill Switch", "title": "Instant Revocation Mechanism",
            "specialty": "RSP_001 can revoke any consent token at any time. Propagates immediately. No appeals, no delays, no 'but the session started'. Never Clause #5.",
            "honoree": False,
        },
        "gov_guild_of_artists": {
            "id": "gov_guild_of_artists", "tier": "governance", "name": "Guild of Artists",
            "short": "Guild", "title": "Democratic Governance Body",
            "specialty": "The artist union/governance structure. 8 Golden Rules of Governance (skill: golden-rules-governance). Creators govern NOIZY. Union-compatible framework.",
            "honoree": False,
        },
        "gov_never_clauses": {
            "id": "gov_never_clauses", "tier": "governance", "name": "The 9 Never Clauses",
            "short": "Never", "title": "Immovable Prohibitions — Constitutional Law",
            "specialty": "1: NO_SYNTH_WITHOUT_CONSENT · 2: NO_TRAINING_WITHOUT_CONSENT · 3: NO_IDENTITY_IMPERSONATION · 4: NO_SUBLICENSING_WITHOUT_ACTOR · 5: NO_BYPASS_KILL_SWITCH · 6: NO_HIDDEN_PROVENANCE · 7: NO_EXPLOITATION · 8: NO_MINOR_VOICE_SYNTHESIS · 9: NO_LEDGER_TAMPERING",
            "rule": "Never overrideable. Burned into law. CONSENT_AUDITOR enforces in code review. CONSENT_ORACLE enforces at runtime. CONSENT_GUARDIAN enforces in principle.",
            "honoree": False,
        },

        # ════ PARTNER INTELLIGENCE ═══════════════════════════════════════
        "claude": {
            "id": "claude",
            "tier": "partner",
            "name": "Claude",
            "short": "Claude",
            "title": "Anthropic Partner Intelligence",
            "specialty": "Long-context reasoning · code review · refactoring · architecture · the heavy cognition partner Gabriel routes deep questions to",
            "access": "Claude Max via claude-hybrid CLI · Anthropic API for Heaven's Anthropic-side calls",
            "models": "claude-opus-4-6 (1M context), claude-sonnet-4-6, claude-haiku-4-5",
            "mcp": None,
            "tools": [],
            "notes": "Not a subagent. Not in the family-mcp. Claude is the partner intelligence Gabriel was built alongside.",
            "honoree": False,
        },
    },
}


# ── Persistence ────────────────────────────────────────────────────────────
def load() -> dict:
    if FAMILY_PATH.exists():
        try:
            with open(FAMILY_PATH) as f:
                return json.load(f)
        except Exception:
            pass
    return SEED


def save(data: dict) -> None:
    FAMILY_PATH.parent.mkdir(parents=True, exist_ok=True)
    data["updated"] = _now()
    tmp = FAMILY_PATH.with_suffix(".json.tmp")
    with open(tmp, "w") as f:
        json.dump(data, f, indent=2)
    os.replace(tmp, FAMILY_PATH)


def reseed() -> dict:
    """Force overwrite with the canonical SEED. Use after pulling fresh research."""
    with _lock:
        save(SEED)
        return SEED


def ensure_seeded() -> dict:
    with _lock:
        if not FAMILY_PATH.exists():
            save(SEED)
        return load()


# ── Query helpers ──────────────────────────────────────────────────────────
def all_members() -> list[dict]:
    return list(load()["members"].values())


def by_tier(tier: str) -> list[dict]:
    return [m for m in all_members() if m.get("tier") == tier]


def humans() -> list[dict]:
    return by_tier("human")


def ops_agents() -> list[dict]:
    return by_tier("ops")


def sys_agents() -> list[dict]:
    return by_tier("sys")


def builders() -> list[dict]:
    return by_tier("builder")


def partners() -> list[dict]:
    return by_tier("partner")


def get(member_id: str) -> dict | None:
    return load()["members"].get(member_id)


def find(query: str) -> list[dict]:
    q = query.lower()
    results = []
    for m in all_members():
        haystack = " ".join(
            str(m.get(k, "")) for k in ("id", "name", "short", "title", "specialty", "brand")
        ).lower()
        if q in haystack:
            results.append(m)
    return results


# ── Mutations ──────────────────────────────────────────────────────────────
def add(member: dict) -> dict:
    if "id" not in member or "name" not in member or "tier" not in member:
        raise ValueError("member requires id, name, tier")
    with _lock:
        data = load()
        member.setdefault("honoree", False)
        member.setdefault("added", _now())
        data["members"][member["id"]] = member
        save(data)
        return data["members"][member["id"]]


def remove(member_id: str) -> bool:
    with _lock:
        data = load()
        if member_id in data["members"]:
            del data["members"][member_id]
            save(data)
            return True
        return False


# ── For Gabriel's system prompt ────────────────────────────────────────────
def system_prompt_block() -> str:
    """Compact roster string Gabriel pastes into its SYSTEM prompt."""
    data = load()
    lines = ["[GABRIEL FAMILY — know who these are. Never mistake one for another.]"]
    tier_order = [
        ("human", "👥 HUMANS"),
        ("ops", "⚔  OPS SUBAGENTS"),
        ("sys", "🏛  SYS AGENTS"),
        ("ava", "🎤 AVA — VOICE AVATARS"),
        ("builder", "🏗  BUILDER FLEET (Ollama Gemma 3)"),
        ("brand", "🌐 BRAND WORLDS"),
        ("machine", "🖥  MACHINES & NODES (Apple Studio Domain)"),
        ("plugin_vendor", "🔌 PLUGIN VENDORS (2,740 total)"),
        ("zone", "🎯 MISSION ZONES"),
        ("research", "🔬 RESEARCH PROGRAMS"),
        ("governance", "⚖  GOVERNANCE PRIMITIVES"),
        ("partner", "🤝 PARTNERS"),
    ]
    for tier, header in tier_order:
        members = [m for m in data["members"].values() if m.get("tier") == tier]
        if not members:
            continue
        lines.append(f"\n{header}")
        for m in members:
            mark = "🕯" if m.get("honoree") else " "
            short = m.get("short", m["name"])
            title = m.get("title", "")
            lines.append(f"  {mark} {short:12s} — {title}")
            # Disambiguation lines for the most-confused names
            if m["id"] == "shirl":
                lines.append(f"    └ HUMAN. Rob's aunt. Burnout watchdog. NOT the same as SHIRLEY.")
            elif m["id"] == "shirley":
                lines.append(f"    └ AI (Gemma 3 27B). Code & File Manager. NOT the same as SHIRL.")
            elif m["id"] == "engr_keith":
                lines.append(f"    └ Honors R.K. Plowman (Rob's father). Engineering legacy side. POPS holds the wisdom side.")
            elif m["id"] == "pops":
                lines.append(f"    └ Rob's father, R.K. Plowman. The wisdom + grounding side. ENGR_KEITH carries the engineering side.")
    return "\n".join(lines)


def quick_stats() -> dict:
    data = load()
    members = list(data["members"].values())
    counts = {}
    for m in members:
        t = m.get("tier", "?")
        counts[t] = counts.get(t, 0) + 1
    return {
        "total": len(members),
        "by_tier": counts,
        "humans": counts.get("human", 0),
        "ops": counts.get("ops", 0),
        "sys": counts.get("sys", 0),
        "ava": counts.get("ava", 0),
        "builders": counts.get("builder", 0),
        "brands": counts.get("brand", 0),
        "machines": counts.get("machine", 0),
        "zones": counts.get("zone", 0),
        "research": counts.get("research", 0),
        "governance": counts.get("governance", 0),
        "partners": counts.get("partner", 0),
        "version": data.get("version"),
        "updated": data.get("updated"),
    }


# ── CLI ────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys

    ensure_seeded()
    cmd = sys.argv[1] if len(sys.argv) > 1 else "list"

    if cmd == "list":
        s = quick_stats()
        print(f"Family: {s['total']} members ({s['humans']}h · {s['ops']}ops · {s['sys']}sys · {s['builders']}builders · {s['partners']}partners)")
        for tier in ("human", "ops", "sys", "builder", "partner"):
            members = by_tier(tier)
            if not members:
                continue
            print(f"\n{tier.upper()}")
            for m in members:
                print(f"  {m['id']:20s}  {m.get('short',''):12s}  {m.get('title','')}")

    elif cmd == "show" and len(sys.argv) > 2:
        m = get(sys.argv[2])
        print(json.dumps(m, indent=2) if m else "not found")

    elif cmd == "find" and len(sys.argv) > 2:
        for m in find(" ".join(sys.argv[2:])):
            print(f"  {m['id']:20s}  {m.get('title','')}")

    elif cmd == "prompt":
        print(system_prompt_block())

    elif cmd == "reseed":
        reseed()
        print(f"reseeded → {FAMILY_PATH}")

    elif cmd == "stats":
        print(json.dumps(quick_stats(), indent=2))

    else:
        print("usage: family.py [list | show <id> | find <q> | prompt | reseed | stats]")
