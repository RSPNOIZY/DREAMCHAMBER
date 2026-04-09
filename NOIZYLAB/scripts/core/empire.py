"""
empire.py — non-entity content for Gabriel.

family.py holds entities (people, agents, brands, machines, zones, etc.).
empire.py holds the things that are NOT entities but are still part of
the inclusion blueprint:

  - The 12 top-level cockpit sections
  - Thematic / emotional language for the UI
  - Document inventory (session journal, runbooks, etc.)
  - Founder identity layer pieces (HVS, Voice Estate, consent receipts, ...)
  - Workflow/build layer surfaces (command palette, search, ...)

This module is the canonical source for the SUPERSONIC dashboard structure.
The cockpit reads from here to render its top-level navigation.

Source: ~/NOIZYANTHROPIC/NOIZYLAB/spec/INCLUSION_BLUEPRINT.md
Authored by: RSP_001 (2026-04-09)
Materialized by: Gabriel (2026-04-09)
"""
from __future__ import annotations


# ── 12 top-level cockpit sections ─────────────────────────────────────────
SECTIONS = [
    {
        "id": "mission",
        "title": "Mission",
        "icon": "🎯",
        "tagline": "Doctrine · countdown · current critical path",
        "queries": ["countdown", "doctrine", "blockers", "linear/critical"],
    },
    {
        "id": "brands",
        "title": "Brands",
        "icon": "🌐",
        "tagline": "Six brand worlds — one consent kernel",
        "family_tier": "brand",
    },
    {
        "id": "agents",
        "title": "Agents",
        "icon": "⚔",
        "tagline": "The 33-member family — humans, ops, sys, ava, builders, partners",
        "family_tiers": ["human", "ops", "sys", "ava", "builder", "partner"],
    },
    {
        "id": "infrastructure",
        "title": "Infrastructure",
        "icon": "🏛",
        "tagline": "Cloudflare · D1 · KV · R2 · Workers · local Docker · kind k8s",
        "queries": ["docker/ps", "tools", "linear/issues"],
    },
    {
        "id": "voice",
        "title": "Voice",
        "icon": "🎤",
        "tagline": "NOIZYVOX · Voice DNA · AVAs · Audio MCP · capture pipeline",
        "family_tier": "ava",
    },
    {
        "id": "archive",
        "title": "Archive",
        "icon": "📦",
        "tagline": "NOIZYFISH · Aquarium · lineage · 100-year record",
        "queries": ["NOIZYFISH", "Wisdom Capsule", "OAIS"],
    },
    {
        "id": "research",
        "title": "Research",
        "icon": "🔬",
        "tagline": "Neuro-Acoustic · Sonic Aid · Mastoid Patch · Neural Earbud · clinical roadmap",
        "family_tier": "research",
    },
    {
        "id": "learning",
        "title": "Learning",
        "icon": "🧒",
        "tagline": "NOIZYKIDZ · accessibility · haptics · curriculum · care",
        "queries": ["NOIZYKIDZ", "Kidz Worldbuilder", "haptics"],
    },
    {
        "id": "governance",
        "title": "Governance",
        "icon": "⚖",
        "tagline": "75/25 · Never Clauses · consent kernel · Guild · constitutional checks",
        "family_tier": "governance",
    },
    {
        "id": "deploy",
        "title": "Deploy",
        "icon": "🚀",
        "tagline": "Heaven · noizy.ai landing · smoke tests · deployment receipts",
        "queries": ["heaven", "deploy", "smoke", "wrangler"],
    },
    {
        "id": "memory",
        "title": "Memory",
        "icon": "🧠",
        "tagline": "MemCell V3 · DAZEFLOW · session journal · memory spine",
        "queries": ["memcell", "lucy", "dazeflow"],
    },
    {
        "id": "live_health",
        "title": "Live Health",
        "icon": "💚",
        "tagline": "Vitals · network · containers · SSE stream · health dashboard",
        "queries": ["vitals", "net", "stream", "docker/stats"],
    },
]


# ── Thematic / emotional UI language ──────────────────────────────────────
THEMES = [
    "built with passion",
    "built with purpose",
    "creator-first",
    "sovereignty",
    "lineage",
    "protection",
    "care",
    "proof",
    "beauty",
    "wonder",
    "sanctuary",
    "future-facing without erasing the human",
]


# ── Founder / identity layer (non-entity concepts) ────────────────────────
IDENTITY_LAYER = [
    {"id": "voice_estate", "name": "Voice Estate",
     "what": "Long-term legacy of an actor's voice — the OAIS/PREMIS-archived corpus that survives them"},
    {"id": "hvs", "name": "Human Voice Signature (HVS)",
     "what": "Cryptographic fingerprint of an enrolled human voice; the primary key for the consent kernel"},
    {"id": "creator_profile", "name": "Creator profile",
     "what": "Per-actor record holding consent state, royalty history, descendants, and public-facing identity"},
    {"id": "guild_registration", "name": "Guild registration",
     "what": "Membership in the Guild of Artists — gives the actor governance voice and union protection"},
    {"id": "session_manifest", "name": "Session manifest",
     "what": "Per-recording-session document listing every voice, consent token, instrument, and resulting artifact"},
    {"id": "artist_dignity", "name": "Artist dignity / authorship visibility",
     "what": "Doctrinal commitment that the human creator is always credited, always visible, always paid"},
    {"id": "consent_receipt", "name": "Consent receipt",
     "what": "Cryptographic proof that consent was granted at a specific time, scope, and territory"},
    {"id": "revocation_state", "name": "Revocation state",
     "what": "Live status of every consent token — Kill Switch reads/writes here"},
    {"id": "royalty_visibility", "name": "Royalty visibility",
     "what": "Real-time view into where every dollar from every play/license is flowing"},
]


# ── Documents / living artifacts ──────────────────────────────────────────
DOCUMENTS = [
    {"id": "session_journal", "name": "Session journal", "where": "Lucy / DAZEFLOW logs"},
    {"id": "memory_spine", "name": "Memory spine", "where": "MemCell V3 + ~/.claude/memory"},
    {"id": "consent_checklist", "name": "Consent checklist", "where": ".claude/skills/consent-audit/"},
    {"id": "voice_rights_ledger", "name": "Voice-rights ledger", "where": "Heaven D1 (noizy_ledger table)"},
    {"id": "guardian_review_mode", "name": "Guardian review mode", "where": "CONSENT_GUARDIAN ollama persona"},
    {"id": "emergency_stop_policy", "name": "Emergency stop policy", "where": ".claude/rules/consent-kernel.md (Kill Switch)"},
    {"id": "routing_policy", "name": "Routing policy", "where": ".claude/rules/agents.md (agent routing matrix)"},
    {"id": "risk_classes", "name": "Risk classes", "where": ".claude/skills/adversarial-threat-modeling/"},
    {"id": "wisdom_capsule_log", "name": "Wisdom capsule log", "where": "Future — part of 100-year preservation track"},
    {"id": "operator_runbooks", "name": "Operator runbooks", "where": ".claude/prompts/ + integrations/HUB.md"},
    {"id": "capture_notes", "name": "Capture notes", "where": "Per-session notes attached to session manifest"},
    {"id": "deployment_readme", "name": "Deployment README", "where": "Each worker's wrangler.toml + README"},
    {"id": "topology_sketch", "name": "Topology sketch", "where": "INCLUSION_BLUEPRINT.md sec 8 + integrations/HUB.md"},
]


# ── Workflow / build surfaces (cockpit feature checklist) ─────────────────
# ── Voice topology — MICKY-P → GOD → DreamChamber IDE ─────────────────────
VOICE_TOPOLOGY = {
    "name": "Real-Time Voice → DreamChamber IDE",
    "primary_capture": "MICKY-P (MacBook Pro)",
    "primary_compute": "GOD (M2 Ultra)",
    "deadline": "T-8 days to April 17, 2026",
    "chain": [
        {"step": 1, "node": "Mic",         "device": "Neumann U87 (or MICKY-P built-in)", "tier": "input"},
        {"step": 2, "node": "MICKY-P",     "device": "Audio Hijack — capture + light DSP", "tier": "capture"},
        {"step": 3, "node": "MICKY-P",     "device": "Loopback virtual device", "tier": "capture"},
        {"step": 4, "node": "LAN bridge",  "device": "RTP / NDI / Dante Via (pick one)", "tier": "transport"},
        {"step": 5, "node": "GOD",         "device": "Audio Hijack receiver → Loopback channel", "tier": "ingest"},
        {"step": 6, "node": "GOD",         "device": "DreamChamber Audio MCP (mcp/audio/)", "tier": "consume"},
        {"step": 7, "node": "GOD",         "device": "SYNTHESIS_ORACLE pipeline (Whisper STT → XTTS-v2 → RVC → C2PA)", "tier": "synth"},
        {"step": 8, "node": "GOD",         "device": "CONSENT_ORACLE.can_i_do() gate — Never Clauses 1, 3, 6, 8", "tier": "guard"},
    ],
    "transport_options": [
        {"name": "RTP audio",        "latency_ms": "5-10",  "cost": "free", "setup": "manual"},
        {"name": "NDI",              "latency_ms": "~16",   "cost": "free", "setup": "plug-and-play"},
        {"name": "Audinate Dante Via", "latency_ms": "<1",  "cost": "$$$",  "setup": "pro-grade"},
        {"name": "AirPlay 2",        "latency_ms": "~200",  "cost": "free", "setup": "built-in (review-only, too slow for live)"},
    ],
    "env_vars_needed": {
        "MICKY_P_HOST": "hostname or IP (e.g. micky-p.local)",
        "MICKY_P_USER": "ssh user",
        "MICKY_P_AUDIO_PORT": "transport port (5004 for RTP)",
    },
    "honors": "MICKY-P was predecessor to GOD. Now it's both lineage AND active duty.",
}


SURFACES = [
    {"id": "command_palette", "name": "Command palette", "status": "todo"},
    {"id": "task_runner", "name": "Task runner", "status": "partial — gabriel CLI dispatches tools"},
    {"id": "workspace_switcher", "name": "Workspace switcher", "status": "todo"},
    {"id": "file_tree", "name": "File tree", "status": "live — cockpit /api/tree"},
    {"id": "split_preview", "name": "Split preview", "status": "todo"},
    {"id": "terminal_tabs", "name": "Terminal tabs", "status": "live — cockpit 3 tabs (events/output/think)"},
    {"id": "deployment_dashboard", "name": "Deployment dashboard", "status": "todo"},
    {"id": "health_dashboard", "name": "Health dashboard", "status": "live — cockpit right rail SSE"},
    {"id": "memory_viewer", "name": "Memory viewer", "status": "live — cockpit MemCell panel + /api/memcell"},
    {"id": "d1_inspector", "name": "D1 inspector", "status": "todo (blocked on Heaven actually existing)"},
    {"id": "rest_client", "name": "REST client", "status": "live — Postman collection at integrations/postman/"},
    {"id": "search_overlay", "name": "Search overlay", "status": "live — /api/search (built today)"},
    {"id": "drag_resize_panes", "name": "Drag-resize panes", "status": "todo"},
    {"id": "voice_command_triggers", "name": "Voice command triggers", "status": "partial — voice-bridge-server.js port 8080 + shortcuts-mcp"},
    {"id": "gorunfree_actions", "name": "1-click GORUNFREE actions", "status": "todo"},
]


def section(section_id: str) -> dict | None:
    for s in SECTIONS:
        if s["id"] == section_id:
            return s
    return None


def all_sections() -> list[dict]:
    return list(SECTIONS)


def themes() -> list[str]:
    return list(THEMES)


def identity_layer() -> list[dict]:
    return list(IDENTITY_LAYER)


def documents() -> list[dict]:
    return list(DOCUMENTS)


def surfaces() -> list[dict]:
    return list(SURFACES)


def voice_topology() -> dict:
    return dict(VOICE_TOPOLOGY)


def search(query: str) -> dict:
    """Search every non-entity collection for a substring match."""
    q = query.lower()
    out: dict[str, list] = {"sections": [], "identity": [], "documents": [], "surfaces": [], "themes": []}
    for s in SECTIONS:
        hay = " ".join(str(v) for v in s.values()).lower()
        if q in hay:
            out["sections"].append(s)
    for i in IDENTITY_LAYER:
        if q in (i["name"] + " " + i["what"]).lower():
            out["identity"].append(i)
    for d in DOCUMENTS:
        if q in (d["name"] + " " + d["where"]).lower():
            out["documents"].append(d)
    for s in SURFACES:
        if q in (s["name"] + " " + s.get("status", "")).lower():
            out["surfaces"].append(s)
    for t in THEMES:
        if q in t.lower():
            out["themes"].append(t)
    return out


if __name__ == "__main__":
    import json, sys
    if len(sys.argv) < 2:
        print(json.dumps({
            "sections": len(SECTIONS),
            "themes": len(THEMES),
            "identity_layer": len(IDENTITY_LAYER),
            "documents": len(DOCUMENTS),
            "surfaces": len(SURFACES),
        }, indent=2))
    elif sys.argv[1] == "sections":
        for s in SECTIONS:
            print(f"  {s['icon']} {s['id']:15s} {s['title']:18s} — {s['tagline']}")
    elif sys.argv[1] == "search" and len(sys.argv) > 2:
        print(json.dumps(search(" ".join(sys.argv[2:])), indent=2))
    else:
        print("usage: empire.py [sections | search <q>]")
