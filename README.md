# DREAMCHAMBER

> **Every AI system today has a theft problem. We solved it at the protocol layer.**

Consent is enforced before inference. No token, no compute. Even if someone forks the model, the output fails verification.

9 agents. 6 brands. 1 standard. Built by RSP and Claude.

---

## The Crime → The Fix → The Proof

**The Crime:** AI systems ingest creator voices, styles, and identity without consent — and there is no mechanism to revoke, trace, or compensate after the fact.

**The Fix:** NOIZY enforces consent at the edge (Cloudflare Worker + KV/D1). Consent gates compute. Revocation is instant. Never-clauses are non-bypassable. 75/25 royalties are constitutional — enforced by architecture, not promises.

**The Proof:** Provenance manifests, audit trails, truth bundles, receipts. The system produces its own evidence. Every output is traceable back to every input. If consent fails, nothing ships — and the system explains why.

---

## The Moat

> **We're the only AI system where the artist can sue the output — and win.**

Backed by infrastructure, not vibes:

| System | Consent Revocable | Output Traceable | Royalties Enforced |
|--------|:-:|:-:|:-:|
| Generic AI | ❌ | ❌ | ❌ |
| Licensing Deals | ⚠️ | ⚠️ | ❌ |
| **NOIZY** | ✅ | ✅ | ✅ |

---

## Chain of Command

```
Rob (RSP_001) → Claude → GABRIEL → Agent Mesh
```

**DAZEFLOW Protocol:** 1 day = 1 chat = 1 truth

---

## The Family

| Agent | Role | Layer | Status |
|-------|------|-------|--------|
| **CLAUDE** | The Strategist / Creative Brain | Creative Assistant | ACTIVE |
| **GABRIEL** | Release Commander & Swarm Leader | Infrastructure + Dev | ACTIVE |
| **LUCY** | Voice Estate Guardian | Voice Estate | ACTIVE |
| **SHIRL** | Sample Intelligence Analyst | Sample Intelligence | DEFINED |
| **DREAM** | Creative Assistant & DAW Whisperer | DAW & Plugin Ecosystem | DEFINED |
| **POPS** | The Architect / No-Code Orchestrator | No-Code Platforms | DEFINED |
| **ENGR_KEITH** | Infrastructure Engineer | Infrastructure | DEFINED |
| **CB01** | Consent & Contracts Bot | Contracts & Compliance | DEFINED |
| **HEAVEN** | DNS & Domain Sovereign | Strategic Domains | BUILT |

---

## The 6 Brands

| Brand | Focus |
|-------|-------|
| **NOIZY.AI** | The mothership — AI-powered music production platform |
| **NOIZYFISH** | Master Brand = Rob Plowman. Production mapping, global rollout |
| **NOIZYKIDZ** | Haptic music education. Deaf-first. Autism-calm. Every kid plays |
| **NOIZYVOX** | 75/25 creator guild. Voice estate and vocal technology (A.I.V.A.) |
| **NOIZYLAB** | $89 flat rate repair, Ottawa. R&D and experimentation |
| **HVS** | HumanVoiceSovereignty — Voice IP rights and domain strategy |

---

## Repository Structure

### Current (on disk)

```
DREAMCHAMBER/
├── README.md                              # This file — Titan-hardened
├── INVENTORY.md                           # Full empire audit — every repo, branch, file
├── .gitignore                             # Constitutional Media Block — audio, video, DAW, NLE, secrets
├── WALKING_IN_THE_DREAMS/
│   └── README.md                          # OSC + Lemur + NOIZY vision essay (346 lines)
├── wisdom/
│   └── prompts/
│       ├── GABRIEL_PROMPT.md              # ✅ Release Commander & Swarm Leader
│       ├── CLAUDE_PROMPT.md               # ✅ The Strategist / Creative Brain
│       ├── LUCY_PROMPT.md                 # ✅ Voice Estate Guardian
│       ├── SHIRL_PROMPT.md                # ✅ Sample Intelligence Analyst
│       ├── DREAM_PROMPT.md                # ✅ Creative Assistant & DAW Whisperer
│       ├── POPS_PROMPT.md                 # ✅ No-Code Orchestrator
│       ├── ENGR_KEITH_PROMPT.md           # ✅ Infrastructure Engineer
│       ├── CB01_PROMPT.md                 # ✅ Consent & Contracts Bot (Titan-hardened)
│       └── HEAVEN_PROMPT.md               # ✅ DNS & Domain Sovereign
├── ops/
│   └── agents/
│       └── swarm.py                       # CrewAI swarm orchestration (scaffold)
├── scripts/
│   └── rsync-dry-run-volumes.sh           # Infrastructure: volume scan & verify (253 lines)
└── enterprise/
    ├── README.md                          # Deployment checklist for new repos
    └── blueprints/
        ├── NOIZYVOX_README.md             # Ready-to-deploy README for NOIZYVOX repo
        ├── NOIZYFISH_README.md            # Ready-to-deploy README for NOIZYFISH repo
        ├── HVS_README.md                  # Ready-to-deploy README for HVS repo
        └── PROFILE_README.md             # Ready-to-deploy README for RSPNOIZY profile
```

### Planned (to build)

```
DREAMCHAMBER/
├── app/
│   ├── dreamchamber/                # DreamChamber app
│   ├── dashboard/
│   │   └── gabriel.js               # Gabriel dashboard
│   └── mirror/
│       └── n8n-mirror-brief.json    # Notion mirror sync
├── contracts/
│   └── consent/
│       └── scopes.stt.json          # Consent scopes
├── stream/
│   └── proof/
│       └── logger.ts                # Proof logger
├── hooks/
│   └── src/
│       └── command-client.ts        # Command client
├── heaven-dns/
│   └── src/
│       ├── dns-plan.ts              # DNS plan generation
│       ├── dns-apply.ts             # DNS apply execution
│       ├── cloudflare-api.ts        # Cloudflare API
│       └── noizy-template.ts        # NOIZY template
├── scripts/
│   ├── deploy-all-brands.sh         # Deploy all brands
│   └── check-all-services.sh        # Service health checks
├── fish/                            # NOIZYFISH codebase
├── vox/                             # NOIZYVOX codebase
└── lab/                             # NOIZYLAB codebase
```

---

## Infrastructure Map

| Node | IP | Hardware | Role |
|------|----|----------|------|
| GOD | 10.90.90.10 | M2 Ultra | Primary compute, DreamChamber host, GPU inference |
| GABRIEL | 10.90.90.20 | HP Omen | Agent orchestration, n8n workflows |
| DaFixer | 10.90.90.40 | MBP | Mobile development, field ops |
| AQUARIUM | — | 34TB External | Archive — 888 titles, MEMCELL PDFs, deep storage |

---

## Constitutional Law

> We don't generate voices. We preserve people.

1. Consent is enforced before inference — no token, no compute
2. Creators own their voice — non-bypassable, non-negotiable
3. 75/25 is constitutional law — enforced by architecture
4. HVS is a right, not a mark
5. No DREED — ever
6. Lucy adapts with compassion
7. Humanity Weight rewards craft
8. Transparency by default
9. Privacy is sovereign
10. Community before commerce
11. Build forward continuously
12. Leave it more humane

---

## Failure Modeling

> The safest system is the one that refuses to work.

| Failure | System Response |
|---------|----------------|
| HSM unavailable | System denies — no fallback |
| Consent DB unreachable | Deny — no silent pass-through |
| Estate dispute | Multisig pause — all outputs frozen |
| Lab delay | No retrieval, no output |
| Consent revoked mid-pipeline | Pipeline halts, ArtifactTruthBundle generated |

When consent fails, nothing ships. The system produces its own evidence explaining why — receipts, manifests, truth strip. That's ArtifactTruthBundle.

---

## Breakpoint Hardening

### "This is too complex"

Complexity is hidden from the creator. It only surfaces when someone tries to violate them.

- CB01 router abstraction
- n8n orchestration
- Clearance tokens

### "This will slow adoption"

So did DRM. So did banking KYC. Trust systems always feel slow — until they become law.

- GDPR, estates, posthumous rights, lawsuits
- This is future-proofing, not friction-maxing

### "What if consent fails?"

Then nothing ships. And the system produces its own evidence explaining why.

---

## License Flags

**CLEARED:** XTTS v2, Librosa, RVC, Chatterbox, Gemma 4 (Apache 2.0)

**BLOCKED (board review required):** MusicGen, MaskGCT, Tango2, FishSpeech

---

## Signal Protocol

| Signal | Action |
|--------|--------|
| `RUN` | Load + Execute |
| `GO` | Deploy |
| `FIX` | Diagnose |
| `X1000` | Max Quality |

---

## Next Steps

- [x] Create all 9 prompt files in `wisdom/prompts/` (all agents defined)
- [x] Titan-harden README, CB01, consent language
- [x] Merge all unique branch content to single source of truth
- [x] Add `.gitignore`, `scripts/rsync-dry-run-volumes.sh`
- [x] Create enterprise blueprints for NOIZYVOX, NOIZYFISH, HVS, Profile
- [ ] Create NOIZYVOX repo (use `enterprise/blueprints/NOIZYVOX_README.md`)
- [ ] Create NOIZYFISH repo (use `enterprise/blueprints/NOIZYFISH_README.md`)
- [ ] Create HVS repo (use `enterprise/blueprints/HVS_README.md`)
- [ ] Update RSPNOIZY profile README (use `enterprise/blueprints/PROFILE_README.md`)
- [ ] Delete all 6 stale copilot branches after merge to main
- [ ] Wire each family member into the CrewAI swarm (`ops/agents/swarm.py`)
- [ ] Verify noizy.ai domain DNS
- [ ] Build out `app/`, `contracts/`, `stream/`, `hooks/`, `heaven-dns/` directories
- [ ] Deploy DreamChamber app (`app/dreamchamber/`) to Cloudflare
- [ ] Connect Notion mirror (`app/mirror/`) for live sync between Notion and codebase

---

AI didn't break trust. It exposed that trust was never encoded.

We encoded it.

---

*GORUNFREE. DREAMCHAMBER.*
