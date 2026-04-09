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
        ("builder", "🏗  BUILDER FLEET (Ollama Gemma 3)"),
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
    members = data["members"].values()
    return {
        "total": len(list(members)),
        "humans": sum(1 for m in members if m.get("tier") == "human"),
        "ops": sum(1 for m in members if m.get("tier") == "ops"),
        "sys": sum(1 for m in members if m.get("tier") == "sys"),
        "builders": sum(1 for m in members if m.get("tier") == "builder"),
        "partners": sum(1 for m in members if m.get("tier") == "partner"),
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
