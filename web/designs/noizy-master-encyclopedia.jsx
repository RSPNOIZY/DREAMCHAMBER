import { useState, useMemo } from "react";

// ─────────────────────────────────────────────
// THE NOIZY MASTER ENCYCLOPEDIA
// MC96ECO Universe · Founder Intelligence Archive
// RSP_001 · Ottawa, Canada · 2026
// ─────────────────────────────────────────────

const VOLUMES = [
  { id: "philosophy", label: "I — Philosophy", icon: "◈", color: "#F59E0B" },
  { id: "systems",    label: "II — Systems",   icon: "⬡", color: "#06B6D4" },
  { id: "platforms",  label: "III — Platforms", icon: "◎", color: "#A855F7" },
  { id: "technology", label: "IV — Technology", icon: "⟡", color: "#10B981" },
  { id: "business",   label: "V — Business",   icon: "✦", color: "#F97316" },
  { id: "research",   label: "VI — Research",  icon: "◆", color: "#60A5FA" },
];

const TAGS = {
  "NOIZY.ai":      "#F59E0B",
  "NOIZYVOX":      "#A855F7",
  "NOIZYLAB":      "#10B981",
  "NOIZYKIDZ":     "#F97316",
  "Fish Music":    "#60A5FA",
  "Infrastructure":"#06B6D4",
  "Philosophy":    "#E2E8F0",
  "A.I.V.A.":     "#EC4899",
  "GABRIEL":       "#34D399",
  "MC96ECO":       "#F59E0B",
  "LIFELUV":       "#FB923C",
  "DreamChamber":  "#818CF8",
};

const ENTRIES = [
  // ── VOLUME I: PHILOSOPHY ──────────────────────────────────
  {
    id: "p1",
    volume: "philosophy",
    date: "2026-01 — Foundational",
    title: "GORUNFREE",
    subtitle: "The Operating Philosophy",
    tags: ["Philosophy", "MC96ECO"],
    content: `The core principle of everything Rob Plowman builds: 35% voice + 65% AI + 1-click execution = zero friction between intention and execution. Born from necessity — a C3 spinal injury with permanent nerve damage means that every tool must serve the mind directly. GORUNFREE is not a productivity hack. It is a survival philosophy that became a design religion.`,
    keyQuote: "The goal is zero distance between what you see in your mind and what exists in the world.",
    relatedIds: ["p2", "s1", "t1"],
  },
  {
    id: "p2",
    volume: "philosophy",
    date: "2026-01 — Foundational",
    title: "Artist Creator First",
    subtitle: "The Builder's Covenant",
    tags: ["Philosophy", "NOIZY.ai"],
    content: `Everything in the NOIZY universe is built for Rob as an artist before it is offered to anyone else. RSP_001 — his own voice model — is the proof of concept for the entire NOIZYVOX platform. Every product is validated by the creator who needs it most before it touches the world. This is the covenant that separates NOIZY from every other AI music platform.`,
    keyQuote: "I am the first client. If it doesn't work for me, it ships to nobody.",
    relatedIds: ["pl1", "t2"],
  },
  {
    id: "p3",
    volume: "philosophy",
    date: "2026-02 — Developed",
    title: "Painting in Your Head",
    subtitle: "The Creative Transmission Problem",
    tags: ["Philosophy", "A.I.V.A.", "NOIZY.ai"],
    content: `Some artists paint all their pictures in their heads and then have to convey what they see — like describing a miracle over a cell phone. AI is not a replacement for that vision. It is the highest-fidelity transmission cable ever built. For the first time in history, the gap between imagination and execution can approach zero. NOIZY.ai is built entirely around solving this transmission problem.`,
    keyQuote: "AI is the freest thinking tool ever created — it lets the mind move at the speed of imagination.",
    relatedIds: ["p1", "p2"],
  },
  {
    id: "p4",
    volume: "philosophy",
    date: "2026-02 — Developed",
    title: "Consent as Code",
    subtitle: "The Ethics Architecture",
    tags: ["Philosophy", "NOIZY.ai", "NOIZYVOX"],
    content: `Consent-first is not a feature. It is the DNA of every NOIZY platform. The 75/25 perpetual royalty split, no buyout clauses, and the Consent-as-Code architecture built on Cloudflare Workers + D1 (the consent ledger) mean that artist rights are enforced at the infrastructure level — not just in the terms of service. This is what makes NOIZY the only ethical choice in AI music.`,
    keyQuote: "If the consent isn't in the code, it isn't consent.",
    relatedIds: ["s3", "t3"],
  },
  {
    id: "p5",
    volume: "philosophy",
    date: "2026-03 — Active",
    title: "500-Year Vision",
    subtitle: "The DreamChamber Codex",
    tags: ["Philosophy", "DreamChamber", "MC96ECO"],
    content: `The MC96ECO Universe operates on a 500-year timeline — 7 epochs from 2026 to 2526. This is documented in the interactive DreamChamber Codex (HTML artifact). The vision: music, voice, and creativity as living infrastructure that evolves with humanity across centuries. Rob's 40-year body of work is the seed. The Codex is the map.`,
    keyQuote: "We are not building a company. We are planting a civilization.",
    relatedIds: ["s2", "pl4"],
  },

  // ── VOLUME II: SYSTEMS ──────────────────────────────────
  {
    id: "s1",
    volume: "systems",
    date: "2025-Q4 — Built",
    title: "SUPERSONIC AI STACK v2.0",
    subtitle: "The 9-Layer Intelligence Engine",
    tags: ["Infrastructure", "GABRIEL", "NOIZY.ai"],
    content: `9 layers, 19 HuggingFace models. Saves $16,000+/year vs. commercial alternatives. This is the operational nervous system of NOIZYFISH INC. Key models include: MusicGen, MaskGCT, Tango 2, Fish Speech, Librosa, XTTS v2, RVC, pedalboard, Gemma2. License flags for MusicGen, MaskGCT, Tango 2, and Fish Speech require review by Alex (board) before commercial sync or DreamChamber client launch.`,
    keyQuote: "We own our stack. We own our destiny.",
    relatedIds: ["t1", "t2", "s3"],
  },
  {
    id: "s2",
    volume: "systems",
    date: "2025-Q4 — Built",
    title: "GABRIEL_V3",
    subtitle: "The Warrior Executor / External Memory",
    tags: ["GABRIEL", "Infrastructure", "NOIZY.ai"],
    content: `GABRIEL lives at 10.90.90.20. 315+ memcells. D1 databases: memcells + knowledge + patterns + mutations. Mutation-ready architecture. GABRIEL is not just a server — it is the external memory and execution arm of the entire NOIZY operation. Command chain: Rob → Claude → Gabriel. The HEAVEN Worker (master Cloudflare router) connects everything. Infrastructure nodes: GOD and DaFixer.`,
    keyQuote: "Gabriel is the warrior. He executes what the mind commands.",
    relatedIds: ["s1", "t3"],
  },
  {
    id: "s3",
    volume: "systems",
    date: "2026-01 — Built",
    title: "Cloudflare Infrastructure",
    subtitle: "The Consent Ledger & Routing Layer",
    tags: ["Infrastructure", "NOIZY.ai"],
    content: `Cloudflare account: 2446d788cc4280f5ea22a9948410c355 (Fishmusicinc) = primary. D1×11 (at limit), KV×20, W×1 deployed. HEAVEN Worker = master router. noizy.ai, noizyfish.com, noizylab.ca, fishmusicinc.com all live here. DNS bulk import: BIND format via Records → Import/Export. The D1 consent ledger enforces Consent-as-Code at infrastructure level.`,
    keyQuote: "The infrastructure is the policy.",
    relatedIds: ["s2", "p4"],
  },
  {
    id: "s4",
    volume: "systems",
    date: "2026-01 — Active",
    title: "DAZEFLOW Methodology",
    subtitle: "1 Day = 1 Chat = 1 Truth",
    tags: ["Philosophy", "Infrastructure", "MC96ECO"],
    content: `1day=1chat=1truth. Every session is date+timestamped. Transcripts sync all Claudes. NOIZYHIVE = multi-Claude coordination via shared daily chat. TASK_CUE commands: /add /next /done. FOREST = load recent chats. NOIZYMEM = log session. This methodology ensures continuity, auditability, and momentum across the entire operation.`,
    keyQuote: "One chat, one day, one truth. The archive never lies.",
    relatedIds: ["s2", "s3"],
  },
  {
    id: "s5",
    volume: "systems",
    date: "2026-02 — Built",
    title: "MissionControl96",
    subtitle: "Full Autonomy Stack",
    tags: ["Infrastructure", "GABRIEL", "NOIZY.ai"],
    content: `5 core modules + README: Agents + File Watcher + Email Triage + Calendar Autonomy. Built complete. Ready for Claude Code deployment. The AI agent family: SHIRL (aunt), POPS (dad), ENGR_KEITH (honoring R.K. Plowman — studio help agent), DREAM (vision), GABRIEL (warrior/executor). ENGR (product) is separate from ENGR_KEITH (agent).`,
    keyQuote: "Autonomy is not automation. It is liberation.",
    relatedIds: ["s2", "t1"],
  },
  {
    id: "s6",
    volume: "systems",
    date: "2026-02 — Built",
    title: "SuperSonic VSC IDE Blueprint",
    subtitle: "The Creative Development Environment",
    tags: ["Infrastructure", "NOIZY.ai", "NOIZYVOX"],
    content: `Four pillars: Composition & Scoring, Voice AI Production (NOIZYVOX pipeline), Neuro-Acoustic Research, and Teaching & Learning. This is the integrated development environment for the MC96ECO Universe — where sound design, AI orchestration, and creative research converge into a single workspace.`,
    keyQuote: "The studio and the lab are the same room now.",
    relatedIds: ["t2", "pl2"],
  },

  // ── VOLUME III: PLATFORMS ──────────────────────────────
  {
    id: "pl1",
    volume: "platforms",
    date: "2026-02 — LIVE",
    title: "NOIZY.ai Homepage",
    subtitle: "The Mothership · LIVE",
    tags: ["NOIZY.ai", "MC96ECO"],
    content: `STATUS: LIVE. React JSX. Dark space aesthetic. Amber/cyan palette. Cormorant Garamond typography. Tailwind CSS. Parallax hero. Glass morphism navigation. This is the flagship. Every other brand should feel like it could live inside NOIZY.ai. Production order confirmed: (1) NOIZY.ai temp home ✓ → (2) NOIZYVOX portal → (3) A.I.V.A. branding rollout.`,
    keyQuote: "The mothership is live. The fleet is launching.",
    relatedIds: ["pl2", "s3"],
  },
  {
    id: "pl2",
    volume: "platforms",
    date: "2026-03 — IN PROGRESS",
    title: "NOIZYVOX Portal",
    subtitle: "The Voice Actor Consent Platform",
    tags: ["NOIZYVOX", "A.I.V.A.", "NOIZY.ai"],
    content: `Next in production queue. The consent-first platform for voice actors joining A.I.V.A. (Artificially Intelligent Voice Acting). 75/25 perpetual royalty split. No buyout clauses. RSP_001 (Rob's own voice model) is the proof of concept. Pipeline: Librosa + XTTS v2 + RVC + pedalboard + Gemma2. NOIZYVOX Business Walkthrough DOCX delivered (12 sections, competitive moat table).`,
    keyQuote: "RSP_001 is not a demo. RSP_001 is the promise.",
    relatedIds: ["t2", "pl1", "r1"],
  },
  {
    id: "pl3",
    volume: "platforms",
    date: "2026-Q2 — Planned",
    title: "NOIZYLAB Repair Portal",
    subtitle: "Ottawa Tech Services · $389K Target",
    tags: ["NOIZYLAB"],
    content: `$89 × 12 repairs/day = $389,280/year target. noizylab.ca. DNS/MX resolved. Ottawa-area consumer and small business device repair. The repair portal includes service booking, status tracking, flat-rate pricing display, technician dashboard, and trust signals. The practical revenue engine that funds the visionary work.`,
    keyQuote: "Fix the phone. Fund the dream.",
    relatedIds: ["b1"],
  },
  {
    id: "pl4",
    volume: "platforms",
    date: "2025-Q4 — Built",
    title: "DreamChamber Codex",
    subtitle: "500-Year Interactive Encyclopedia",
    tags: ["DreamChamber", "Philosophy", "MC96ECO"],
    content: `Interactive HTML artifact. 7 epochs spanning 2026–2526. The DreamChamber is both a product concept (the ultimate creative AI environment for artists) and a philosophy document (the long arc of human creativity + AI). It is the artifact that demonstrates to Anthropic, Apple, and Google that NOIZY is not a startup — it is a civilization-scale idea.`,
    keyQuote: "Seven epochs. One vision. The DreamChamber never closes.",
    relatedIds: ["p5", "r3"],
  },
  {
    id: "pl5",
    volume: "platforms",
    date: "2026-Q3 — Planned",
    title: "NOIZYKIDZ",
    subtitle: "Haptic Music for Deaf & Autism Spectrum Children",
    tags: ["NOIZYKIDZ", "LIFELUV"],
    content: `Haptic solutions for deaf children and autism spectrum calming. The soul of this brand is Nims (Mike Nemesvary) — quadriplegic world champion and the inspiration for the LIFELUV project. LIFELUV = AI companion for Nims. Every child deserves to feel music. Frequency-to-haptic mapping UI. Accessible-first design (orange warmth, rounded shapes, gentle pulse animations). Parent/educator onboarding flows.`,
    keyQuote: "If they cannot hear it, they will feel it.",
    relatedIds: ["r4", "b3"],
  },
  {
    id: "pl6",
    volume: "platforms",
    date: "2026-Q2 — Planned",
    title: "Fish Music Inc. · THE_AQUARIUM",
    subtitle: "34TB Legacy Catalog · Sync Licensing",
    tags: ["Fish Music", "MC96ECO"],
    content: `34TB archive. 40 years of professional composition and sound design. Credits include Ed Edd n Eddy, Dragon Tales, Johnny Test, Transformers, Barbie films, 14 years as Audio Director at Fuel Industries (150-person agency). THE_AQUARIUM = the catalog browser. Sync licensing portal, score + sound design showcase, legacy reel player, music supervision inquiry. fishmusicinc.com.`,
    keyQuote: "The archive is the proof. 40 years of earned trust.",
    relatedIds: ["r2", "b2"],
  },

  // ── VOLUME IV: TECHNOLOGY ──────────────────────────────
  {
    id: "t1",
    volume: "technology",
    date: "2025-Q4 — Built",
    title: "Operation Voice Army",
    subtitle: "RSP_001 AAA Voice Cloning Pipeline",
    tags: ["NOIZYVOX", "A.I.V.A.", "Infrastructure"],
    content: `RSP_001 AAA voice cloning pipeline. Stack: Librosa + XTTS v2 + RVC + pedalboard + Gemma2. Project scaffold complete. Next step: GPU inference environment setup. RSP_001 is the identifier for Rob as the first human voice actor to formally join A.I.V.A. This is the core brand differentiator — replacing generic "AI Voice" language with "Artificially Intelligent Voice Acting."`,
    keyQuote: "RSP_001 is not a robot. RSP_001 is Rob.",
    relatedIds: ["pl2", "s1"],
  },
  {
    id: "t2",
    volume: "technology",
    date: "2026-01 — Active",
    title: "NOIZY PROOF",
    subtitle: "Watermarking & IP Authentication",
    tags: ["NOIZY.ai", "Infrastructure"],
    content: `One of the 7 frontier plays in the NOIZY 6-month strategic vision. Board member: Adam Robb (Senior Security Consultant, iPSS Inc.) owns watermarking and NOIZY PROOF development. Creates cryptographic provenance for every piece of AI-generated audio. The answer to "how do we know this is real?" in an AI-saturated world.`,
    keyQuote: "Every sound leaves a fingerprint. We build the fingerprint reader.",
    relatedIds: ["s3", "b1"],
  },
  {
    id: "t3",
    volume: "technology",
    date: "2026-02 — Research",
    title: "Neuro-Acoustic Research",
    subtitle: "40,000 Years of Sound Science",
    tags: ["NOIZY.ai", "NOIZYKIDZ"],
    content: `Research brief completed. 40,000 years of human acoustic traditions + advanced non-aural science. Board partner: Dr. Brien Benoit (neurosurgeon, Ottawa Civic, Health Canada PMPRB Chair — Wisdom Keeper, NAI research partner). The NAI (Neuro-Acoustic Intelligence) is one of the 7 frontier plays. This research underpins NOIZYKIDZ haptics and the broader Living Score concept.`,
    keyQuote: "Sound is not heard. Sound is experienced by the entire nervous system.",
    relatedIds: ["pl5", "r4"],
  },
  {
    id: "t4",
    volume: "technology",
    date: "2026-03 — Active",
    title: "Living Score",
    subtitle: "Music That Breathes and Responds",
    tags: ["NOIZY.ai", "DreamChamber"],
    content: `One of the 7 frontier plays. Music that adapts in real-time to context, emotion, biometrics, and environment. Not a playlist. Not generative loop music. A score that is alive — composed once at the intention level, executed infinitely at the moment level. This is the convergence of Rob's 40 years in film/animation scoring and the SUPERSONIC AI STACK.`,
    keyQuote: "A score that knows where you are, what you feel, and what comes next.",
    relatedIds: ["t3", "pl4"],
  },
  {
    id: "t5",
    volume: "technology",
    date: "2026-02 — Active",
    title: "Cultural Resonance Engine",
    subtitle: "The 7th Frontier Play",
    tags: ["NOIZY.ai", "MC96ECO"],
    content: `One of the 7 frontier plays in the NOIZY strategic vision. The CRE identifies and amplifies cultural resonance patterns in music and sound across geographies, demographics, and generations. It is the intelligence layer that allows NOIZY to serve not just individual creators but entire cultural ecosystems. The intersection of AI, musicology, and global identity.`,
    keyQuote: "Some sounds move the whole world. We find them first.",
    relatedIds: ["t4", "r3"],
  },

  // ── VOLUME V: BUSINESS ────────────────────────────────
  {
    id: "b1",
    volume: "business",
    date: "2026-01 — Active",
    title: "NOIZY 6-Month Strategic Vision",
    subtitle: "7 Frontier Plays · March–September 2026",
    tags: ["NOIZY.ai", "MC96ECO"],
    content: `7 frontier plays: NCP (NOIZY Creator Platform), NAI (Neuro-Acoustic Intelligence), Living Score, Voice Estate, NOIZY PROOF, Cultural Resonance Engine, Operation Voice Army. March–September 2026 build timeline. Zero direct competitors across 12 capability dimensions confirmed after competitive intelligence sweep (ElevenLabs, Replica, Suno, Udio, DistroKid benchmarked).`,
    keyQuote: "Zero competitors across 12 dimensions. The moat is real.",
    relatedIds: ["b2", "r1"],
  },
  {
    id: "b2",
    volume: "business",
    date: "2026-01 — Active",
    title: "Board of Aligned Minds",
    subtitle: "Alex · Dr. Brien Benoit · Adam Robb",
    tags: ["NOIZY.ai", "MC96ECO"],
    content: `Alex: enterprise/capital, board lead, license flag review authority (MusicGen, MaskGCT, Tango 2, Fish Speech must be reviewed before commercial sync licensing or DreamChamber client launch). Dr. Brien Benoit: neurosurgeon, Ottawa Civic, Health Canada PMPRB Chair — Wisdom Keeper, NAI research partner. Adam Robb: Senior Security Consultant, iPSS Inc. — watermarking/NOIZY PROOF.`,
    keyQuote: "The board is not advisors. They are co-architects.",
    relatedIds: ["b1", "t2"],
  },
  {
    id: "b3",
    volume: "business",
    date: "2026-02 — Active",
    title: "Revenue Architecture",
    subtitle: "Repair → Voice → Sync → Platform",
    tags: ["NOIZYLAB", "NOIZYVOX", "Fish Music"],
    content: `Four revenue streams: (1) NOIZYLAB repairs: $89×12/day = $389K/yr. (2) NOIZYVOX: 75/25 royalty split on voice licensing. (3) Fish Music Inc: sync licensing from 34TB THE_AQUARIUM catalog. (4) NOIZY.ai platform: creator subscriptions + DreamChamber enterprise. Stripe: acct_1S7kf5B1WYNnCLY0. GitHub: NOIZYLAB-io (8 repos).`,
    keyQuote: "Repair funds the dream. The dream funds the future.",
    relatedIds: ["pl3", "pl6"],
  },
  {
    id: "b4",
    volume: "business",
    date: "2026-02 — Research",
    title: "Competitive Intelligence",
    subtitle: "ElevenLabs · Replica · Suno · Udio · DistroKid",
    tags: ["NOIZY.ai", "NOIZYVOX"],
    content: `Full sweep conducted. VSI Group contacts researched (Norman Dawood, Mark Howorth). Grayson Music / Tom Westin investigated as potential partners. Conclusion: NOIZY.ai consent-first platform has no direct competitor across 12 capability dimensions. The 6-month competitive lead map (March–Sept 2026) is the window. NOIZY PROOF and the consent ledger are the permanent moat.`,
    keyQuote: "They built voice products. We built voice rights infrastructure.",
    relatedIds: ["b1", "p4"],
  },
  {
    id: "b5",
    volume: "business",
    date: "2026-01 — Active",
    title: "NRC IRAP Alignment",
    subtitle: "Canadian Identity & Innovation Strategy",
    tags: ["NOIZY.ai", "MC96ECO"],
    content: `Canadian patriot identity. Ottawa-based. NRC IRAP (National Research Council Industrial Research Assistance Program) alignment is a meaningful strategic context for NOIZYFISH INC. Canadian identity is not just cultural — it is a competitive differentiator in a US/UK-dominated AI landscape. The ethical AI alignment with Anthropic's approach reinforces the Canadian innovation narrative.`,
    keyQuote: "We are building the Canadian answer to the AI music revolution.",
    relatedIds: ["r3", "b2"],
  },

  // ── VOLUME VI: RESEARCH ───────────────────────────────
  {
    id: "r1",
    volume: "research",
    date: "2025-Q3 — Complete",
    title: "NOIZYVOX Business Walkthrough",
    subtitle: "12-Section Competitive Moat Document",
    tags: ["NOIZYVOX", "A.I.V.A."],
    content: `12 sections. Competitive moat table. Delivered as DOCX. Covers: platform architecture, consent mechanics, royalty structure, pipeline technical specs, market positioning vs. ElevenLabs/Replica, A.I.V.A. brand identity, RSP_001 proof of concept, launch sequence, enterprise licensing, long-term vision. The foundational business document for NOIZYVOX fundraising.`,
    keyQuote: "The moat is not a feature. The moat is the consent architecture.",
    relatedIds: ["pl2", "b4"],
  },
  {
    id: "r2",
    volume: "research",
    date: "2025 — Ongoing",
    title: "THE_AQUARIUM Archive",
    subtitle: "34TB · 40 Years of Professional Work",
    tags: ["Fish Music", "MC96ECO"],
    content: `34 terabytes. 40 years of professional composition and sound design. Animation: Ed Edd n Eddy, Dragon Tales, Johnny Test. Feature film: Transformers, Barbie films. 14 years as Audio Director at Fuel Industries (150-person agency, major clients — until bankruptcy). Q107 Homegrown Contest winner (early 1990s). THE_AQUARIUM is not storage. It is the most valuable creative archive in Canadian animation audio history.`,
    keyQuote: "40 years. Every frame scored. Every sound designed. All of it ours.",
    relatedIds: ["pl6", "b3"],
  },
  {
    id: "r3",
    volume: "research",
    date: "2026-01 — Complete",
    title: "Neuro-Acoustic Research Brief",
    subtitle: "40,000 Years of Human Sound Tradition",
    tags: ["NOIZY.ai", "NOIZYKIDZ"],
    content: `Research brief completed. Scope: 40,000 years of human acoustic traditions + advanced non-aural sensory science. Covers: shamanic drumming traditions, Pythagorean frequency theory, modern neuroscience of auditory processing, binaural beat research, haptic sound transmission for deaf populations, and AI-generated frequency mapping. Foundation for NAI and NOIZYKIDZ product lines.`,
    keyQuote: "We have been using sound to heal, create, and connect for 40,000 years. AI is just the newest instrument.",
    relatedIds: ["t3", "pl5"],
  },
  {
    id: "r4",
    volume: "research",
    date: "2026-02 — Active",
    title: "LIFELUV Research",
    subtitle: "AI Companion for Nims · Disability Innovation",
    tags: ["LIFELUV", "NOIZYKIDZ"],
    content: `LIFELUV = AI companion designed for Nims (Mike Nemesvary) — quadriplegic world champion and Rob's close friend. The LIFELUV project explores AI as genuine life companion and accessibility amplifier for people with severe physical disabilities. It is the most personal project in the NOIZY universe and the one that carries the most human stakes. Nims is always the inspiration.`,
    keyQuote: "Nims showed the world what a human being can do with no limits. LIFELUV shows what AI can do when it serves that kind of spirit.",
    relatedIds: ["pl5", "p3"],
  },
  {
    id: "r5",
    volume: "research",
    date: "2026-03 — Active",
    title: "Voice Estate Concept",
    subtitle: "The Permanent Voice Rights Framework",
    tags: ["NOIZYVOX", "A.I.V.A.", "Philosophy"],
    content: `One of the 7 frontier plays. Voice Estate is the legal and technical framework for treating a voice actor's AI-cloned voice as a permanent, inheritable, licensable estate — like a music publishing catalog. The voice model lives beyond the artist if they choose. It can earn, be licensed, be protected. It is a new category of intellectual property that NOIZYVOX is defining from the ground up.`,
    keyQuote: "Your voice is an estate. We are building the registry.",
    relatedIds: ["pl2", "p4"],
  },
];

const TAG_COLOR = (tag) => TAGS[tag] || "#64748B";

export default function NOIZYEncyclopedia() {
  const [activeVolume, setActiveVolume] = useState("all");
  const [activeEntry, setActiveEntry] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTags, setActiveTags] = useState([]);

  const filtered = useMemo(() => {
    return ENTRIES.filter(e => {
      const matchVol = activeVolume === "all" || e.volume === activeVolume;
      const matchSearch = !search || 
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.subtitle.toLowerCase().includes(search.toLowerCase()) ||
        e.content.toLowerCase().includes(search.toLowerCase());
      const matchTags = activeTags.length === 0 || activeTags.every(t => e.tags.includes(t));
      return matchVol && matchSearch && matchTags;
    });
  }, [activeVolume, search, activeTags]);

  const toggleTag = (tag) => {
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const vol = VOLUMES.find(v => v.id === activeVolume);
  const volColor = vol?.color || "#F59E0B";

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#02040A", minHeight: "100vh", color: "#E2E8F0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #0A0F1A; }
        ::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 2px; }
        .vol-btn { cursor: pointer; border: none; text-align: left; transition: all 250ms ease; }
        .vol-btn:hover { background: rgba(255,255,255,0.05) !important; }
        .entry-card { cursor: pointer; transition: all 250ms ease; border: 1px solid rgba(255,255,255,0.06); }
        .entry-card:hover { border-color: rgba(255,255,255,0.16); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
        .tag-pill { cursor: pointer; transition: all 200ms ease; user-select: none; }
        .tag-pill:hover { opacity: 0.8; }
        .fade { animation: fadein 0.35s ease; }
        @keyframes fadein { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        input { outline: none; }
        .glow { animation: glowpulse 3s ease infinite; }
        @keyframes glowpulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
        .modal-overlay { position:fixed; inset:0; background:rgba(2,4,10,0.88); z-index:1000; display:flex; align-items:center; justify-content:center; padding:24px; backdrop-filter:blur(8px); animation:fadein 0.2s ease; }
        .modal-box { background:#0A0F1A; border:1px solid rgba(255,255,255,0.1); border-radius:20px; width:100%; max-width:680px; max-height:88vh; overflow-y:auto; padding:40px; position:relative; }
        .close-btn { position:absolute; top:20px; right:20px; background:rgba(255,255,255,0.06); border:none; color:#94A3B8; cursor:pointer; width:32px; height:32px; border-radius:50%; font-size:16px; display:flex; align-items:center; justify-content:center; transition:all 200ms; }
        .close-btn:hover { background:rgba(255,255,255,0.12); color:#fff; }
      `}</style>

      {/* Top Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(2,4,10,0.97)", position: "sticky", top: 0, zIndex: 90 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, background: "linear-gradient(135deg,#F59E0B,#06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            MC96ECO
          </div>
          <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.1)" }} />
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: "#64748B", fontStyle: "italic" }}>
            Master Encyclopedia
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="glow" style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981" }} />
          <span style={{ fontSize: 10, color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            RSP_001 · Ottawa · {ENTRIES.length} Entries
          </span>
        </div>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 61px)" }}>

        {/* LEFT SIDEBAR — Volume Nav */}
        <div style={{ width: 220, borderRight: "1px solid rgba(255,255,255,0.06)", padding: "24px 0", flexShrink: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ padding: "0 16px 16px", fontSize: 9, color: "#334155", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700 }}>Volumes</div>
          
          <button className="vol-btn" onClick={() => setActiveVolume("all")} style={{ padding: "10px 16px", background: activeVolume === "all" ? "rgba(245,158,11,0.1)" : "transparent", borderLeft: activeVolume === "all" ? "2px solid #F59E0B" : "2px solid transparent", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14 }}>◉</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: activeVolume === "all" ? "#F59E0B" : "#94A3B8" }}>All Entries</div>
              <div style={{ fontSize: 10, color: "#475569" }}>{ENTRIES.length} total</div>
            </div>
          </button>

          {VOLUMES.map(v => {
            const count = ENTRIES.filter(e => e.volume === v.id).length;
            const isActive = activeVolume === v.id;
            return (
              <button key={v.id} className="vol-btn" onClick={() => setActiveVolume(v.id)} style={{ padding: "10px 16px", background: isActive ? `${v.color}14` : "transparent", borderLeft: isActive ? `2px solid ${v.color}` : "2px solid transparent", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 14, color: v.color }}>{v.icon}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: isActive ? v.color : "#94A3B8", lineHeight: 1.3 }}>{v.label}</div>
                  <div style={{ fontSize: 10, color: "#475569" }}>{count} entries</div>
                </div>
              </button>
            );
          })}

          {/* Tag Cloud */}
          <div style={{ margin: "24px 16px 8px", fontSize: 9, color: "#334155", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700 }}>Filter by Brand</div>
          <div style={{ padding: "0 12px", display: "flex", flexDirection: "column", gap: 4 }}>
            {Object.entries(TAGS).map(([tag, color]) => {
              const isOn = activeTags.includes(tag);
              return (
                <div key={tag} className="tag-pill" onClick={() => toggleTag(tag)} style={{ padding: "5px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", background: isOn ? `${color}22` : "rgba(255,255,255,0.03)", color: isOn ? color : "#475569", border: `1px solid ${isOn ? color + "44" : "rgba(255,255,255,0.05)"}` }}>
                  {tag}
                </div>
              );
            })}
            {activeTags.length > 0 && (
              <div onClick={() => setActiveTags([])} style={{ cursor: "pointer", padding: "4px 10px", fontSize: 10, color: "#64748B", textDecoration: "underline" }}>Clear filters</div>
            )}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, padding: "24px 28px", overflow: "auto" }}>
          
          {/* Search */}
          <div style={{ marginBottom: 24, position: "relative" }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search the encyclopedia..."
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "11px 16px 11px 40px", color: "#E2E8F0", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}
            />
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#475569", fontSize: 14 }}>◈</span>
          </div>

          {/* Volume Header */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, color: "#E2E8F0", lineHeight: 1.2 }}>
              {activeVolume === "all" ? "The Complete Archive" : VOLUMES.find(v => v.id === activeVolume)?.label}
            </div>
            <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
              {filtered.length} {filtered.length === 1 ? "entry" : "entries"}{search ? ` matching "${search}"` : ""}{activeTags.length > 0 ? ` · filtered by ${activeTags.join(", ")}` : ""}
            </div>
          </div>

          {/* Entry Grid */}
          <div className="fade" key={activeVolume + search + activeTags.join()} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {filtered.map(entry => {
              const vdata = VOLUMES.find(v => v.id === entry.volume);
              return (
                <div key={entry.id} className="entry-card" onClick={() => setActiveEntry(entry)} style={{ background: "rgba(255,255,255,0.025)", borderRadius: 14, padding: "20px", cursor: "pointer" }}>
                  {/* Volume Badge */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12, color: vdata?.color }}>{vdata?.icon}</span>
                      <span style={{ fontSize: 9, color: vdata?.color, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>{vdata?.label}</span>
                    </div>
                    <span style={{ fontSize: 9, color: "#334155", fontFamily: "'JetBrains Mono', monospace" }}>{entry.date}</span>
                  </div>
                  
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: "#F1F5F9", lineHeight: 1.2, marginBottom: 4 }}>{entry.title}</div>
                  <div style={{ fontSize: 11, color: "#64748B", marginBottom: 12, fontStyle: "italic" }}>{entry.subtitle}</div>
                  <div style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.65, marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{entry.content}</div>
                  
                  {/* Tags */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {entry.tags.map(tag => (
                      <span key={tag} style={{ padding: "2px 8px", borderRadius: 99, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", background: `${TAG_COLOR(tag)}18`, color: TAG_COLOR(tag), border: `1px solid ${TAG_COLOR(tag)}30` }}>{tag}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#334155" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>◈</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18 }}>No entries found</div>
            </div>
          )}
        </div>
      </div>

      {/* Entry Modal */}
      {activeEntry && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setActiveEntry(null); }}>
          <div className="modal-box fade">
            <button className="close-btn" onClick={() => setActiveEntry(null)}>✕</button>

            {/* Vol badge */}
            {(() => {
              const vdata = VOLUMES.find(v => v.id === activeEntry.volume);
              return (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                  <span style={{ fontSize: 14, color: vdata?.color }}>{vdata?.icon}</span>
                  <span style={{ fontSize: 10, color: vdata?.color, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700 }}>{vdata?.label}</span>
                  <span style={{ color: "#1E293B" }}>·</span>
                  <span style={{ fontSize: 10, color: "#334155", fontFamily: "'JetBrains Mono', monospace" }}>{activeEntry.date}</span>
                </div>
              );
            })()}

            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 600, color: "#F1F5F9", lineHeight: 1.15, marginBottom: 6 }}>{activeEntry.title}</div>
            <div style={{ fontSize: 14, color: "#64748B", fontStyle: "italic", marginBottom: 24 }}>{activeEntry.subtitle}</div>

            {/* Tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
              {activeEntry.tags.map(tag => (
                <span key={tag} style={{ padding: "4px 12px", borderRadius: 99, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", background: `${TAG_COLOR(tag)}1A`, color: TAG_COLOR(tag), border: `1px solid ${TAG_COLOR(tag)}33` }}>{tag}</span>
              ))}
            </div>

            <div style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.85, marginBottom: 28 }}>{activeEntry.content}</div>

            {/* Key Quote */}
            <div style={{ borderLeft: "3px solid #F59E0B", paddingLeft: 20, marginBottom: 28 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: "#F59E0B", fontStyle: "italic", lineHeight: 1.5 }}>"{activeEntry.keyQuote}"</div>
            </div>

            {/* Related */}
            {activeEntry.relatedIds?.length > 0 && (
              <div>
                <div style={{ fontSize: 9, color: "#334155", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>Related Entries</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {activeEntry.relatedIds.map(rid => {
                    const rel = ENTRIES.find(e => e.id === rid);
                    if (!rel) return null;
                    const rv = VOLUMES.find(v => v.id === rel.volume);
                    return (
                      <div key={rid} onClick={() => setActiveEntry(rel)} style={{ cursor: "pointer", padding: "8px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", transition: "all 200px ease" }}>
                        <div style={{ fontSize: 9, color: rv?.color, letterSpacing: "0.1em", marginBottom: 2 }}>{rv?.icon} {rv?.label}</div>
                        <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>{rel.title}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "20px 28px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 12, color: "#1E293B", letterSpacing: "0.2em" }}>
          NOIZYFISH INC. · MC96ECO FOUNDER INTELLIGENCE ARCHIVE · v1.0 · OTTAWA 2026 · RSP_001
        </div>
      </div>
    </div>
  );
}
