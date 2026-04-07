import { useState, useEffect, useRef } from "react";

const C = {
  bg: "#05050d",
  surface: "#0a0a16",
  card: "#0f0f1c",
  cardHover: "#141428",
  border: "#1a1a30",
  borderBright: "#2a2a50",
  accent: "#ff2d6e",
  accentGlow: "#ff2d6e40",
  gold: "#ffc140",
  goldGlow: "#ffc14030",
  cyan: "#00f0ff",
  cyanGlow: "#00f0ff28",
  green: "#00ff88",
  greenGlow: "#00ff8820",
  purple: "#c060ff",
  purpleGlow: "#c060ff20",
  orange: "#ff8c40",
  text: "#eeeeff",
  textDim: "#7777aa",
  textFaint: "#333355",
  white: "#ffffff",
};

// ─── ANIMATED COUNTER ───────────────────────────────────────────────
function Counter({ end, suffix = "", prefix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const steps = 60;
        const inc = end / steps;
        let cur = 0;
        const timer = setInterval(() => {
          cur += inc;
          if (cur >= end) { setCount(end); clearInterval(timer); }
          else setCount(Math.floor(cur));
        }, duration / steps);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ─── PULSE DOT ───────────────────────────────────────────────────────
function PulseDot({ color }) {
  return (
    <span style={{ position: "relative", display: "inline-block", width: 10, height: 10 }}>
      <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color, animation: "pulse 2s infinite", opacity: 0.4 }} />
      <span style={{ position: "absolute", inset: 2, borderRadius: "50%", background: color }} />
      <style>{`@keyframes pulse { 0%,100%{transform:scale(1);opacity:0.4} 50%{transform:scale(2.5);opacity:0} }`}</style>
    </span>
  );
}

// ─── GLOW CARD ───────────────────────────────────────────────────────
function GlowCard({ children, color = C.accent, style = {} }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.card, border: `1px solid ${hovered ? color + "88" : C.border}`,
        borderRadius: 18, position: "relative", overflow: "hidden",
        transition: "all 0.3s", boxShadow: hovered ? `0 0 40px ${color}20` : "none",
        ...style
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at top right, ${color}08, transparent 60%)`, pointerEvents: "none" }} />
      {children}
    </div>
  );
}

// ─── BADGE ───────────────────────────────────────────────────────────
function Badge({ label, color }) {
  return (
    <span style={{ background: color + "18", border: `1px solid ${color}44`, borderRadius: 100, padding: "4px 12px", fontSize: 11, color, fontWeight: 700, letterSpacing: 1, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

// ─── SECTION HEADER ──────────────────────────────────────────────────
function SectionHeader({ eyebrow, title, sub, color = C.accent }) {
  return (
    <div style={{ marginBottom: 48 }}>
      {eyebrow && <div style={{ fontSize: 10, letterSpacing: 6, color, textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
        <PulseDot color={color} /> {eyebrow}
      </div>}
      <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, margin: "0 0 12px", fontFamily: "Georgia, serif", letterSpacing: -1, color: C.text, lineHeight: 1.1 }}>{title}</h2>
      {sub && <p style={{ fontSize: 16, color: C.textDim, maxWidth: 640, margin: 0, lineHeight: 1.8 }}>{sub}</p>}
      <div style={{ height: 2, width: 60, background: `linear-gradient(to right, ${color}, transparent)`, marginTop: 20, borderRadius: 2 }} />
    </div>
  );
}

// ─── TABS ────────────────────────────────────────────────────────────
const TABS = [
  { id: "system", label: "🔥 THE SYSTEM", color: C.accent },
  { id: "vs", label: "⚔️ VS ELEVEN", color: C.gold },
  { id: "culture", label: "🌍 CULTURE ENGINE", color: C.cyan },
  { id: "tiers", label: "💎 DREAMERS", color: C.purple },
  { id: "partners", label: "🤝 PARTNERS", color: C.green },
  { id: "tech", label: "🛠️ STACK", color: C.orange },
  { id: "roadmap", label: "🗺️ ROADMAP", color: C.cyan },
  { id: "alex", label: "💰 INVESTMENT", color: C.gold },
];

// ─── DATA ─────────────────────────────────────────────────────────────
const PILLARS = [
  {
    n: "01", icon: "🎭", color: C.accent,
    title: "INTUITIVE AI VOICE ACTORS",
    sub: "Characters That Live Inside Cultures",
    desc: "Not text-to-speech. Not voice cloning. AI voice actors that understand the difference between how grief sounds in Lagos vs Tokyo, how authority lands in Berlin vs Buenos Aires — and deliver it through every performance.",
    points: ["5 Dimensions of Cultural Voice Performance", "Acoustic Emotional Fingerprint Engine", "Somatic Performance Mapping — 200 cultures", "Adaptive Real-Time Social Change Tracking", "Signal-native Librosa, not token-based"],
    kill: "ElevenLabs clones voices. NOIZY performs culture.",
  },
  {
    n: "02", icon: "🧠", color: C.cyan,
    title: "THE DREAMER PERSONA ENGINE",
    sub: "Your Creative Identity — Forever Growing",
    desc: "Every subscriber builds an AI persona that accumulates their creative knowledge, taste, style, and history. The persona grows with them. It becomes their creative partner, teacher, and co-writer — and it can never be taken to ElevenLabs.",
    points: ["AI persona learns YOUR creative voice", "Pinecone vector memory — never forgets", "Persona-to-persona collaboration", "Commercial rights to everything created", "The longer you stay, the more powerful it gets"],
    kill: "ElevenLabs has no memory of you. NOIZY becomes you.",
  },
  {
    n: "03", icon: "🎵", color: C.gold,
    title: "SIGNAL-REACTIVE AUDIO ENGINE",
    sub: "Audio That Listens and Responds",
    desc: "ElevenLabs is text-in, audio-out. NOIZY hears the room. Librosa spectral analysis reads the acoustic fingerprint of existing audio and generates voice, SFX, and music that is sonically consistent with the source material.",
    points: ["Librosa: BPM, key, timbre, onset detection", "SFX matched to your mix's acoustic fingerprint", "Adaptive game audio in real-time", "Music-reactive voice generation", "Spectral chromagram → emotional state mapping"],
    kill: "ElevenLabs generates. NOIZY responds to what's playing.",
  },
  {
    n: "04", icon: "📚", color: C.green,
    title: "THE LIVING KNOWLEDGE ARCHIVE",
    sub: "40 Years of Human Creativity + All of History",
    desc: "The most knowledgeable creative AI in existence across music, art, film, and voice. Every session teaches you why — not just what. The AI doesn't just help you create, it makes you a master.",
    points: ["Complete music theory — all global traditions", "Film history & sound design from birth to now", "Art history across ALL cultures — not just Western", "Cultural performance data — 200+ contexts", "Daily updates as social language evolves"],
    kill: "ElevenLabs teaches nothing. NOIZY makes you a master.",
  },
  {
    n: "05", icon: "💰", color: C.purple,
    title: "ARTIST-FIRST REVENUE MODEL",
    sub: "75/25 Splits. Artists Win. Always.",
    desc: "ElevenLabs extracts from artists — their voices train the model, their creativity builds the product, and they see none of the revenue. NOIZY flips this entirely. Artists are partners, not data sources.",
    points: ["70% to creators on NOIZYFISH marketplace", "NOIZYVOX guild — 75/25 voice acting splits", "Streaming royalty pass-through via DistroKid", "Sync licensing portal — zero copyright risk", "Dreamers supply AND consume the marketplace"],
    kill: "ElevenLabs extracts from artists. NOIZY pays them.",
  },
  {
    n: "06", icon: "🎮", color: C.orange,
    title: "GAMING AUDIO DOMINANCE",
    sub: "Adaptive Audio Nobody Else Has Built",
    desc: "The global game audio market is $1.77B and racing to $3.73B. 60-95% of game audio is outsourced. NOIZY is the only platform offering adaptive, signal-reactive audio that responds to game state in real time — not static loops.",
    points: ["Unity & Unreal plugin integration", "Real-time adaptive scoring engine", "Character voice that evolves with gameplay", "Cultural localization for 80+ language markets", "NOIZYFISH marketplace for indie game devs"],
    kill: "Every competitor makes static audio. NOIZY makes audio that thinks.",
  },
];

const VS_DATA = [
  { feature: "Voice Generation", e: ["✓", "Text → Voice", C.textDim], n: ["✓", "Signal-Aware Cultural Performance", C.green] },
  { feature: "Cultural Adaptation", e: ["✗", "None — zero cultural intelligence", "#ff5555"], n: ["✓", "200 Cultural Contexts, Live Updating", C.green] },
  { feature: "Artist Memory", e: ["✗", "Starts from zero every session", "#ff5555"], n: ["✓", "Dreamer Persona grows forever", C.green] },
  { feature: "Music Reactivity", e: ["✗", "None", "#ff5555"], n: ["✓", "Librosa real-time spectral analysis", C.green] },
  { feature: "Teaching / Education", e: ["✗", "None — no knowledge layer", "#ff5555"], n: ["✓", "Complete creative history — all traditions", C.green] },
  { feature: "Artist Revenue", e: ["✗", "0% — artists are data, not partners", "#ff5555"], n: ["✓", "70-75% splits across all revenue streams", C.green] },
  { feature: "SFX Intelligence", e: ["⚡", "Text → SFX (good)", C.textDim], n: ["✓", "Mix-matched acoustic SFX generation", C.green] },
  { feature: "Game Audio", e: ["✗", "Static generation only", "#ff5555"], n: ["✓", "Adaptive real-time engine", C.green] },
  { feature: "Persona Collaboration", e: ["✗", "None", "#ff5555"], n: ["✓", "AI persona × AI persona co-creation", C.green] },
  { feature: "Community", e: ["⚡", "Basic Discord — developer focused", C.textDim], n: ["✓", "AI-powered Dreamer Universe", C.green] },
  { feature: "Endangered Languages", e: ["✗", "Not on roadmap", "#ff5555"], n: ["✓", "UNESCO-adjacent preservation layer", C.green] },
  { feature: "Long Game", e: ["⚡", "IPO / Enterprise — 85% revenue there", C.textDim], n: ["✓", "Artists first. Category creation. Always.", C.green] },
];

const CULTURES = [
  { region: "WEST AFRICA", langs: ["Yoruba", "Igbo", "Hausa", "Pidgin"], emotion: "Grief is communal & vocal. Authority is elder-centered. Warmth is expansive & physical.", color: C.gold, flag: "🌍" },
  { region: "EAST ASIA", langs: ["Mandarin", "Japanese", "Korean", "Cantonese"], emotion: "Grief is contained & private. Authority lives in controlled breath. Humor is subtle wordplay.", color: C.cyan, flag: "🌏" },
  { region: "LATIN AMERICA", langs: ["Brazilian Portuguese", "Mexican Spanish", "Argentine Spanish", "Colombian Spanish"], emotion: "Warmth lives in the chest. Urgency is openly expressed. Humor is performative & physical.", color: C.accent, flag: "🌎" },
  { region: "SOUTH ASIA", langs: ["Hindi", "Tamil", "Bengali", "Urdu"], emotion: "Reverence is formal & tonal. Emotion is layered with context. Authority shifts with social register.", color: C.purple, flag: "🌏" },
  { region: "MIDDLE EAST", langs: ["Arabic (Gulf)", "Arabic (Levant)", "Farsi", "Turkish"], emotion: "Hospitality is acoustic — warmth has specific prosodic signatures. Formality is multi-layered.", color: C.green, flag: "🌍" },
  { region: "NORTHERN EUROPE", langs: ["German", "Swedish", "Finnish", "Dutch"], emotion: "Authority is slow & deliberate. Emotion is understated. Urgency is controlled — never performative.", color: C.orange, flag: "🌍" },
];

const TIERS = [
  { name: "DREAMER SEED", price: "FREE", color: C.textDim, tag: null, features: ["Basic persona creation", "Community Discord access", "Daily culture drops", "10 history queries/month", "NOIZYFISH browsing"] },
  { name: "DREAMER", price: "$15", period: "/mo", color: C.cyan, tag: null, features: ["Full persona development", "Deep music/art/film history", "Librosa audio analysis", "100 SFX generations/mo", "Create + learn simultaneously", "NOIZYFISH commercial license"] },
  { name: "DREAMER PRO", price: "$35", period: "/mo", color: C.gold, tag: "MOST POPULAR", features: ["Signal-reactive audio tools", "Persona-to-persona collab", "Full Master Class access", "500 SFX generations/mo", "VSI cultural voice tools", "Game audio adaptive engine"] },
  { name: "DREAMER STUDIO", price: "$99", period: "/mo", color: C.accent, tag: "FULL POWER", features: ["Commercial rights to everything", "White-label persona for creators", "Unlimited SFX & voice gen", "DAW plugin access", "API access for builders", "Priority model access + Opus 4.6"] },
];

const PARTNERS_DATA = [
  { name: "VSI London", role: "Localization Partner", desc: "720 people, 80+ languages, Netflix & Disney preferred vendor. NOIZY's cultural voice AI fills the gap their human directors can't scale.", color: C.cyan, status: "TARGETING" },
  { name: "ElevenLabs API", role: "Voice Generation Layer", desc: "Their API powers the output. NOIZY powers the cultural intelligence above it. We use their tools. We don't compete on voice generation.", color: C.gold, status: "INTEGRATE" },
  { name: "Merlin / Kobalt", role: "Music Rights Layer", desc: "They cleared ElevenLabs for music training. NOIZY pursues the same artist-first licensing framework — but with 70% splits built in.", color: C.green, status: "PIPELINE" },
  { name: "Nollywood Studios", role: "West Africa Content Layer", desc: "Second largest film industry by volume. Zero culturally authentic AI voice representation. NOIZY owns this market first.", color: C.accent, status: "PIPELINE" },
  { name: "Anthropic", role: "Fellowship & AI Partner", desc: "The brain of every NOIZY Dreamer persona. Claude API powers the knowledge engine, cultural reasoning, and teaching layer.", color: C.purple, status: "ACTIVE" },
  { name: "Unity / Unreal", role: "Game Engine Integration", desc: "Plugin layer bringing NOIZY's adaptive audio directly into the game dev workflow. One-time $299 + $99/year recurring.", color: C.orange, status: "PIPELINE" },
];

const TECH_STACK = [
  { layer: "AI BRAIN", color: C.purple, tools: [{ n: "Claude Sonnet 4.6", d: "Reasoning + Cultural Context" }, { n: "Pinecone", d: "Vector Memory" }, { n: "Anthropic API", d: "Dreamer Personas" }] },
  { layer: "AUDIO SIGNAL", color: C.gold, tools: [{ n: "Librosa", d: "Spectral Analysis Engine" }, { n: "ElevenLabs API", d: "Voice Generation" }, { n: "Suno / Udio", d: "Music Generation" }] },
  { layer: "CULTURE ENGINE", color: C.cyan, tools: [{ n: "Custom Dataset", d: "200 Cultural Contexts" }, { n: "Social Feed Ingestion", d: "Real-time Language Shifts" }, { n: "Academic Pipeline", d: "Anthropology Research" }] },
  { layer: "COMMUNITY", color: C.green, tools: [{ n: "Discord MCP", d: "Claude Controls Server" }, { n: "n8n + Albato", d: "Workflow Automation" }, { n: "LaunchPass", d: "Subscription Management" }] },
  { layer: "MARKETPLACE", color: C.orange, tools: [{ n: "NOIZYFISH.com", d: "Asset Hub + Creator Economy" }, { n: "DistroKid", d: "Royalty Routing" }, { n: "Stripe", d: "Global Payments" }] },
  { layer: "DEPLOYMENT", color: C.accent, tools: [{ n: "Cloudflare Workers", d: "60+ Workers Built" }, { n: "D1 + KV", d: "11 Databases / 20 Namespaces" }, { n: "FastAPI + React PWA", d: "Frontend Stack" }] },
];

const ROADMAP = [
  { phase: "PHASE 1", time: "Month 1–3", title: "Proof of Concept", color: C.cyan, items: ["60-second cultural voice demo for VSI", "Dreamer persona MVP on Discord", "NOIZYFISH.com goes live", "10 paying Dreamers", "Outreach to Dimitri Konovalov + Scott Rose"] },
  { phase: "PHASE 2", time: "Month 3–6", title: "Community Launch", color: C.gold, items: ["Discord server fully live with all AI layers", "Librosa audio analysis in !analyze command", "LaunchPass subscriptions active", "100 paying Dreamers — $1,500 MRR", "First game studio client"] },
  { phase: "PHASE 3", time: "Month 6–12", title: "Platform Build", color: C.green, items: ["VSI partnership secured + first project live", "Unity/Unreal plugin alpha", "NOIZYFISH marketplace open to all creators", "500 Dreamers — $10K MRR", "Latin America expansion begins"] },
  { phase: "PHASE 4", time: "Year 2", title: "World Scale", color: C.purple, items: ["West Africa & Nollywood partnerships", "API white-label for publishers", "12,000 Dreamers — $250K MRR", "Endangered language preservation program", "Series A conversations"] },
  { phase: "PHASE 5", time: "Year 3", title: "Category Dominance", color: C.accent, items: ["The cultural voice AI layer for all platforms", "University + UNESCO institutional licensing", "$2M+ MRR", "Category creation — NOIZY is the standard", "The ElevenLabs acquisition conversation"] },
];

const ALEX_STACK = [
  { tool: "Claude Max 5x", mo: "$100", yr: "$2,400", why: "The brain — never hits a wall mid-build" },
  { tool: "ElevenLabs Creator", mo: "$22", yr: "$528", why: "Voice generation layer — 100K credits/mo" },
  { tool: "Midjourney Standard", mo: "$30", yr: "$720", why: "Visual asset creation for NOIZYFISH" },
  { tool: "Suno Pro", mo: "$10", yr: "$240", why: "AI music generation for demos" },
  { tool: "Cursor IDE Pro", mo: "$20", yr: "$480", why: "AI-powered code editor — builds faster" },
  { tool: "n8n Cloud", mo: "$20", yr: "$480", why: "All Discord/Slack automation workflows" },
  { tool: "Pinecone Starter", mo: "$25", yr: "$600", why: "Dreamer persona vector memory" },
  { tool: "Albato", mo: "$15", yr: "$360", why: "Claude ↔ Discord two-way bridge" },
  { tool: "LaunchPass", mo: "$29", yr: "$696", why: "Dreamer subscription management" },
  { tool: "Notion AI", mo: "$16", yr: "$384", why: "Knowledge base + project management" },
  { tool: "Discord Nitro", mo: "$10", yr: "$240", why: "Community server boosts + features" },
  { tool: "Anthropic API Credits", mo: "$50", yr: "$1,200", why: "NOIZY bot + persona backend calls" },
];

// ─── MAIN COMPONENT ────────────────────────────────────────────────
export default function NOIZYSystem() {
  const [activeTab, setActiveTab] = useState("system");
  const [activePillar, setActivePillar] = useState(0);
  const [activeCulture, setActiveCulture] = useState(0);

  const totalMonthly = ALEX_STACK.reduce((s, i) => s + parseInt(i.mo.replace("$", "")), 0);
  const total24 = ALEX_STACK.reduce((s, i) => s + parseInt(i.yr.replace("$", "")), 0) * 2;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "Georgia, 'Times New Roman', serif", color: C.text, overflowX: "hidden" }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.accent}; border-radius: 2px; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(400%)} }
        .tab-btn:hover { transform: translateY(-1px); }
        .pillar-btn:hover { border-color: ${C.accent}88 !important; }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 20px 60px #00000060; }
      `}</style>

      {/* ── HERO ── */}
      <div style={{ position: "relative", padding: "80px 24px 64px", textAlign: "center", borderBottom: `1px solid ${C.border}`, overflow: "hidden" }}>
        {/* Animated grid bg */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: `linear-gradient(${C.cyan} 1px, transparent 1px), linear-gradient(90deg, ${C.cyan} 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
        {/* Diagonal accent */}
        <div style={{ position: "absolute", top: -100, left: -100, width: 500, height: 500, background: `conic-gradient(from 0deg, ${C.accent}08, transparent, ${C.accent}08)`, borderRadius: "50%", animation: "spin 20s linear infinite" }} />
        <div style={{ position: "absolute", top: -80, right: -80, width: 400, height: 400, background: `conic-gradient(from 180deg, ${C.cyan}08, transparent, ${C.cyan}08)`, borderRadius: "50%", animation: "spin 15s linear infinite reverse" }} />
        {/* Orbs */}
        <div style={{ position: "absolute", top: 20, left: "15%", width: 500, height: 300, background: `radial-gradient(${C.accent}15, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 20, right: "15%", width: 500, height: 300, background: `radial-gradient(${C.cyan}10, transparent 70%)`, pointerEvents: "none" }} />

        <div style={{ position: "relative", animation: "fadeIn 0.8s ease-out" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.accentGlow, border: `1px solid ${C.accent}44`, borderRadius: 100, padding: "6px 18px", marginBottom: 28 }}>
            <PulseDot color={C.accent} />
            <span style={{ fontSize: 10, letterSpacing: 5, color: C.accent, textTransform: "uppercase" }}>NOIZY.ai — ACTIVE BUILD</span>
          </div>

          <h1 style={{ fontSize: "clamp(44px, 8vw, 96px)", fontWeight: 900, margin: "0 0 4px", lineHeight: 0.95, letterSpacing: -3, fontFamily: "Georgia, serif" }}>
            <span style={{ display: "block", color: C.text }}>THE SYSTEM THAT</span>
            <span style={{ display: "block", color: C.accent, textShadow: `0 0 60px ${C.accent}60` }}>SERVES ARTISTS</span>
            <span style={{ display: "block", color: C.text }}>BETTER THAN</span>
            <span style={{ display: "block", background: `linear-gradient(135deg, ${C.gold} 0%, ${C.accent} 50%, ${C.purple} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>ELEVENLABS</span>
          </h1>

          <p style={{ fontSize: "clamp(14px, 2vw, 18px)", color: C.textDim, maxWidth: 700, margin: "28px auto 0", lineHeight: 1.8 }}>
            ElevenLabs makes voices. <strong style={{ color: C.white }}>NOIZY.ai builds the emotional and cultural intelligence layer</strong> that understands what it means to be human in 200 different cultural contexts — and pays artists for it.
          </p>

          {/* STAT ROW */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 40, flexWrap: "wrap" }}>
            {[
              { n: 200, suf: "+", label: "Cultures Mapped", color: C.cyan },
              { n: 47, suf: "B", pre: "$", label: "Voice AI Market '34", color: C.gold },
              { n: 75, suf: "%", label: "Artist Revenue Split", color: C.green },
              { n: 1, suf: "", pre: "#", label: "Cultural AI — Anywhere", color: C.accent },
            ].map(s => (
              <div key={s.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "16px 24px", textAlign: "center", minWidth: 130 }}>
                <div style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 900, color: s.color, lineHeight: 1 }}>
                  <Counter end={s.n} prefix={s.pre || ""} suffix={s.suf} />
                </div>
                <div style={{ fontSize: 11, color: C.textDim, marginTop: 4, letterSpacing: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}>
            {["🎭 Intuitive AI Voice Actors", "🧠 Dreamer Personas", "🎵 Signal-Reactive Audio", "🌍 Cultural Intelligence", "💰 Artist-First Revenue", "🎮 Game Audio Engine"].map(b => (
              <div key={b} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 100, padding: "7px 16px", fontSize: 12, color: C.textDim }}>{b}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: C.bg + "f0", backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 2, padding: "10px 16px", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} className="tab-btn" onClick={() => setActiveTab(t.id)} style={{
            background: activeTab === t.id ? t.color : "transparent",
            color: activeTab === t.id ? (t.color === C.gold ? "#000" : "#fff") : C.textDim,
            border: `1px solid ${activeTab === t.id ? t.color : C.border}`,
            borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 12,
            fontWeight: 700, whiteSpace: "nowrap", letterSpacing: 0.5,
            transition: "all 0.2s", fontFamily: "Georgia, serif"
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "52px 24px 100px", animation: "fadeIn 0.4s ease-out" }}>

        {/* ━━━ SYSTEM ━━━ */}
        {activeTab === "system" && (
          <div>
            <SectionHeader eyebrow="The 6 Pillars" title="Why Every Pillar Is a Gap ElevenLabs Left Wide Open" sub="Each pillar targets a specific failure in the current AI voice market. Together they are impossible to replicate." color={C.accent} />

            {/* Pillar navigator */}
            <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
              {PILLARS.map((p, i) => (
                <button key={i} className="pillar-btn" onClick={() => setActivePillar(i)} style={{
                  background: activePillar === i ? p.color + "22" : C.surface,
                  border: `1px solid ${activePillar === i ? p.color : C.border}`,
                  borderRadius: 12, padding: "10px 18px", cursor: "pointer",
                  color: activePillar === i ? p.color : C.textDim, fontSize: 13,
                  fontWeight: 700, transition: "all 0.2s", fontFamily: "Georgia, serif"
                }}>
                  {p.icon} {p.n}
                </button>
              ))}
            </div>

            {/* Active pillar */}
            {(() => {
              const p = PILLARS[activePillar];
              return (
                <GlowCard color={p.color} style={{ padding: 40, marginBottom: 32 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
                    <div>
                      <div style={{ fontSize: 72, marginBottom: 16, animation: "float 3s ease-in-out infinite" }}>{p.icon}</div>
                      <div style={{ fontSize: 10, letterSpacing: 5, color: p.color, marginBottom: 8, textTransform: "uppercase" }}>PILLAR {p.n}</div>
                      <h3 style={{ fontSize: "clamp(20px, 3vw, 32px)", fontWeight: 900, margin: "0 0 8px", color: C.text, fontFamily: "Georgia, serif" }}>{p.title}</h3>
                      <div style={{ fontSize: 14, color: p.color, marginBottom: 20, fontStyle: "italic" }}>{p.sub}</div>
                      <p style={{ fontSize: 15, color: C.textDim, lineHeight: 1.8, margin: 0 }}>{p.desc}</p>
                      <div style={{ marginTop: 24, padding: "16px 20px", background: p.color + "12", borderRadius: 12, borderLeft: `3px solid ${p.color}` }}>
                        <div style={{ fontSize: 11, color: p.color, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>The Kill Shot</div>
                        <div style={{ fontSize: 14, color: C.text, fontStyle: "italic" }}>{p.kill}</div>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, letterSpacing: 3, color: C.textFaint, textTransform: "uppercase", marginBottom: 20 }}>Core Capabilities</div>
                      {p.points.map((pt, i) => (
                        <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 18, padding: "12px 16px", background: C.surface, borderRadius: 10, border: `1px solid ${C.border}` }}>
                          <span style={{ color: p.color, fontSize: 18, lineHeight: 1, flexShrink: 0 }}>◆</span>
                          <span style={{ fontSize: 14, color: C.textDim, lineHeight: 1.6 }}>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlowCard>
              );
            })()}

            {/* All pillars grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
              {PILLARS.map((p, i) => (
                <GlowCard key={i} color={p.color} style={{ padding: 24, cursor: "pointer" }} onClick={() => setActivePillar(i)}>
                  <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 28 }}>{p.icon}</span>
                    <div>
                      <div style={{ fontSize: 10, color: p.color, letterSpacing: 3, textTransform: "uppercase" }}>{p.n}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{p.title}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.6 }}>{p.kill}</div>
                </GlowCard>
              ))}
            </div>

            {/* THE CORE QUOTE */}
            <div style={{ marginTop: 48, textAlign: "center", padding: "52px 40px", background: `linear-gradient(135deg, ${C.accent}08, ${C.cyan}08)`, border: `1px solid ${C.border}`, borderRadius: 24, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(to right, transparent, ${C.accent}, ${C.cyan}, transparent)` }} />
              <div style={{ fontSize: 10, letterSpacing: 6, color: C.accent, marginBottom: 20, textTransform: "uppercase" }}>The Founding Vision</div>
              <p style={{ fontSize: "clamp(18px, 2.5vw, 28px)", lineHeight: 1.7, color: C.text, maxWidth: 880, margin: "0 auto", fontStyle: "italic" }}>
                "NOIZY.ai is not building a voice tool. It's building <strong style={{ color: C.accent }}>the emotional and cultural intelligence layer of the entire AI voice industry</strong> — the layer that every other platform will eventually need to license, partner with, or acquire. Because the data isn't scraped. It's earned through <strong style={{ color: C.cyan }}>creative partnership with humans.</strong>"
              </p>
              <div style={{ marginTop: 24, fontSize: 13, color: C.textDim }}>— Rob Plowman, Founder, Fish Music Inc. × NOIZY.ai</div>
              <div style={{ marginTop: 16, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <Badge label="Honor" color={C.cyan} />
                <Badge label="Respect" color={C.gold} />
                <Badge label="Gather" color={C.green} />
                <Badge label="Nurture" color={C.purple} />
                <Badge label="Preserve" color={C.accent} />
              </div>
            </div>
          </div>
        )}

        {/* ━━━ VS ━━━ */}
        {activeTab === "vs" && (
          <div>
            <SectionHeader eyebrow="Head to Head" title="NOIZY.ai vs ElevenLabs" sub="12 features. Every single one where NOIZY wins — and why ElevenLabs chose not to build it." color={C.gold} />

            <GlowCard color={C.gold} style={{ overflow: "hidden", marginBottom: 32 }}>
              {/* Header */}
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 2fr", background: C.surface, padding: "16px 28px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, letterSpacing: 4, color: C.textFaint, textTransform: "uppercase" }}>FEATURE</div>
                <div style={{ fontSize: 10, letterSpacing: 4, color: C.textFaint, textTransform: "uppercase" }}>ELEVENLABS</div>
                <div style={{ fontSize: 10, letterSpacing: 4, color: C.accent, textTransform: "uppercase" }}>NOIZY.ai ✦</div>
              </div>
              {VS_DATA.map((row, i) => (
                <div key={row.feature} style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 2fr", padding: "14px 28px", borderBottom: i < VS_DATA.length - 1 ? `1px solid ${C.border}` : "none", background: i % 2 === 0 ? "transparent" : "#ffffff03", alignItems: "center" }}>
                  <div style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>{row.feature}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 14 }}>{row.e[0]}</span>
                    <span style={{ fontSize: 13, color: row.e[2] }}>{row.e[1]}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 14 }}>{row.n[0]}</span>
                    <span style={{ fontSize: 13, color: row.n[2], fontWeight: 700 }}>{row.n[1]}</span>
                  </div>
                </div>
              ))}
            </GlowCard>

            {/* Side by side strategy */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <GlowCard color="#ff5555" style={{ padding: 32, opacity: 0.75 }}>
                <div style={{ fontSize: 10, letterSpacing: 4, color: "#ff5555", marginBottom: 20, textTransform: "uppercase" }}>ElevenLabs Long Game</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: C.text, marginBottom: 4 }}>$11B</div>
                <div style={{ fontSize: 13, color: C.textDim, marginBottom: 24 }}>Series D valuation. IPO 2027. 85% enterprise revenue.</div>
                {["Racing to embed in Meta / NVIDIA ecosystem", "15% creator revenue — shrinking", "Text → Audio. The ceiling is visible.", "Artists are training data, not partners", "Going WIDER — video, agents, enterprise", "Abandoning the cultural intelligence layer"].map((l, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                    <span style={{ color: "#ff5555", flexShrink: 0 }}>✗</span>
                    <span style={{ fontSize: 13, color: C.textDim }}>{l}</span>
                  </div>
                ))}
              </GlowCard>

              <GlowCard color={C.accent} style={{ padding: 32 }}>
                <div style={{ fontSize: 10, letterSpacing: 4, color: C.accent, marginBottom: 20, textTransform: "uppercase" }}>NOIZY.ai Long Game</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: C.text, marginBottom: 4 }}>Category 1</div>
                <div style={{ fontSize: 13, color: C.textDim, marginBottom: 24 }}>Cultural intelligence layer. The standard nobody has set yet.</div>
                {["Building WHERE ElevenLabs is moving away from", "Artists are partners — 70-75% revenue split", "Audio-in → Intelligent Response (nobody has this)", "Going DEEPER into signal intelligence", "Cultural + emotional AI compounding daily", "Honor, Respect, Gather, Nurture, Preserve"].map((l, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                    <span style={{ color: C.accent, flexShrink: 0 }}>→</span>
                    <span style={{ fontSize: 13, color: C.textDim }}>{l}</span>
                  </div>
                ))}
              </GlowCard>
            </div>
          </div>
        )}

        {/* ━━━ CULTURE ENGINE ━━━ */}
        {activeTab === "culture" && (
          <div>
            <SectionHeader eyebrow="The Moat Nobody Can Cross" title="The Cultural Intelligence Engine" sub="200 cultural contexts. 6 emotional performance dimensions. Real-time social language tracking. This is what NOIZY is building that nobody else is even trying to build." color={C.cyan} />

            {/* 5 Dimensions */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 48 }}>
              {[
                { n: "01", d: "LINGUISTIC SURFACE", desc: "Words, grammar, accent, dialect. What everyone else does. Table stakes.", color: C.textDim, icon: "🔤" },
                { n: "02", d: "PROSODIC CULTURE", desc: "Pacing, rhythm, intonation patterns. The emotional architecture of a culture's speech.", color: C.cyan, icon: "🌊" },
                { n: "03", d: "SOMATIC PERFORMANCE", desc: "How emotions live in the body — and how the body affects the voice in each culture.", color: C.gold, icon: "🫀" },
                { n: "04", d: "SOCIAL REGISTER", desc: "When to shift tone, formality, warmth. A character doesn't change — their cultural performance does.", color: C.green, icon: "🎭" },
                { n: "05", d: "ADAPTIVE SOCIAL CHANGE", desc: "As language evolves — slang shifts, movements reshape speech — NOIZY's model updates. Always current.", color: C.accent, icon: "🌀" },
              ].map(dim => (
                <GlowCard key={dim.n} color={dim.color} style={{ padding: 24 }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{dim.icon}</div>
                  <div style={{ fontSize: 10, color: dim.color, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>DIM {dim.n}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 10 }}>{dim.d}</div>
                  <div style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6 }}>{dim.desc}</div>
                </GlowCard>
              ))}
            </div>

            {/* Culture selector */}
            <SectionHeader eyebrow="Regional Intelligence" title="How NOIZY Maps Every Region" color={C.cyan} />
            <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
              {CULTURES.map((c, i) => (
                <button key={i} onClick={() => setActiveCulture(i)} style={{
                  background: activeCulture === i ? c.color + "22" : C.surface,
                  border: `1px solid ${activeCulture === i ? c.color : C.border}`,
                  borderRadius: 12, padding: "10px 18px", cursor: "pointer",
                  color: activeCulture === i ? c.color : C.textDim, fontSize: 13,
                  fontWeight: 700, transition: "all 0.2s", fontFamily: "Georgia, serif"
                }}>{c.flag} {c.region}</button>
              ))}
            </div>

            {(() => {
              const cu = CULTURES[activeCulture];
              return (
                <GlowCard color={cu.color} style={{ padding: 36, marginBottom: 32 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36 }}>
                    <div>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>{cu.flag}</div>
                      <div style={{ fontSize: 10, color: cu.color, letterSpacing: 4, textTransform: "uppercase", marginBottom: 8 }}>REGION PROFILE</div>
                      <h3 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 20px", color: C.text, fontFamily: "Georgia, serif" }}>{cu.region}</h3>
                      <div style={{ fontSize: 11, color: C.textFaint, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Languages Mapped</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {cu.langs.map(l => <Badge key={l} label={l} color={cu.color} />)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: C.textFaint, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Emotional Performance Signature</div>
                      <div style={{ background: cu.color + "12", border: `1px solid ${cu.color}33`, borderRadius: 14, padding: 24 }}>
                        <div style={{ fontSize: 15, color: C.textDim, lineHeight: 1.9, fontStyle: "italic" }}>{cu.emotion}</div>
                      </div>
                      <div style={{ marginTop: 20, padding: "14px 20px", background: C.surface, borderRadius: 12, border: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 11, color: cu.color, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>NOIZY Advantage</div>
                        <div style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6 }}>This cultural acoustic data doesn't exist anywhere in any AI platform today. NOIZY builds it first, owns it permanently, and nobody can replicate it without years of human creative partnership.</div>
                      </div>
                    </div>
                  </div>
                </GlowCard>
              );
            })()}

            {/* Emotional data table */}
            <SectionHeader eyebrow="Acoustic Data" title="How Emotions Sound Differently Across Cultures" color={C.cyan} />
            <GlowCard color={C.cyan} style={{ overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", background: C.surface, padding: "14px 24px", borderBottom: `1px solid ${C.border}` }}>
                {["EMOTION", "DATA CAPTURED", "WESTERN DEFAULT", "WHAT NOIZY KNOWS DIFFERENTLY"].map(h => (
                  <div key={h} style={{ fontSize: 10, letterSpacing: 3, color: C.textFaint, textTransform: "uppercase" }}>{h}</div>
                ))}
              </div>
              {[
                { e: "Grief", data: "Pitch drop rate, breath pattern, tempo collapse", west: "Private, contained — vocal expression seen as private", diff: "Communal & vocal in West Africa. Silent in Japan. Performatively expressed in Mediterranean cultures." },
                { e: "Authority", data: "Vocal fry, pace, pause placement, chest resonance", west: "Slow, deliberate American cadence — the 'CEO voice'", diff: "Elder-centered in West Africa. Rapid & confident in Brazil. Controlled breath at throat in Mandarin." },
                { e: "Warmth", data: "Upward inflection, resonance, softening patterns", west: "Friendly upspeak with American verbal cues", diff: "Italian warmth is chest-physical. British warmth is underplayed. Nigerian warmth is expansive & communal." },
                { e: "Humor", data: "Timing, tonal shift, deadpan vs performative", west: "Ironic detachment or physical comedy rhythm", diff: "British dry understatement. Nigerian performative energy. Japanese subtle wordplay in pitch shifts." },
                { e: "Reverence", data: "Volume drop, pace slowdown, formality shift", west: "Quiet, slowed, lowered register", diff: "Religious, professional, elder — all acoustically distinct PER culture. Not interchangeable." },
              ].map((row, i) => (
                <div key={row.e} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", padding: "14px 24px", borderBottom: i < 4 ? `1px solid ${C.border}` : "none", background: i % 2 === 0 ? "transparent" : "#ffffff02", alignItems: "start", gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.cyan }}>{row.e}</div>
                  <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.6 }}>{row.data}</div>
                  <div style={{ fontSize: 12, color: "#ff7777", lineHeight: 1.6 }}>{row.west}</div>
                  <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{row.diff}</div>
                </div>
              ))}
            </GlowCard>
          </div>
        )}

        {/* ━━━ TIERS ━━━ */}
        {activeTab === "tiers" && (
          <div>
            <SectionHeader eyebrow="The Dreamer Economy" title="Subscription Tiers Built for Artists" sub="The longer you stay, the more powerful your persona becomes. That's the subscription lock-in no competitor can replicate." color={C.purple} />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 48 }}>
              {TIERS.map((t, i) => (
                <div key={t.name} className="card-hover" style={{ background: C.card, border: `2px solid ${i === 3 ? t.color : C.border}`, borderRadius: 20, padding: 28, position: "relative", transition: "all 0.3s", boxShadow: i === 3 ? `0 0 60px ${t.color}20` : "none" }}>
                  {t.tag && <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: t.color, borderRadius: 100, padding: "4px 16px", fontSize: 10, fontWeight: 900, letterSpacing: 3, color: t.color === C.gold ? "#000" : "#fff", textTransform: "uppercase", whiteSpace: "nowrap" }}>{t.tag}</div>}
                  <div style={{ fontSize: 10, letterSpacing: 4, color: t.color, marginBottom: 10, textTransform: "uppercase" }}>{t.name}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 20 }}>
                    <span style={{ fontSize: 52, fontWeight: 900, color: C.text, lineHeight: 1 }}>{t.price}</span>
                    {t.period && <span style={{ fontSize: 14, color: C.textDim }}>{t.period}</span>}
                  </div>
                  <div style={{ height: 1, background: `linear-gradient(to right, ${t.color}44, transparent)`, marginBottom: 20 }} />
                  {t.features.map(f => (
                    <div key={f} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                      <span style={{ color: t.color, flexShrink: 0, fontSize: 12 }}>◆</span>
                      <span style={{ fontSize: 13, color: C.textDim, lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Revenue trajectory */}
            <SectionHeader eyebrow="Revenue Model" title="The Growth Trajectory" color={C.purple} />
            <GlowCard color={C.gold} style={{ padding: 36, marginBottom: 32 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
                {[
                  { t: "Launch", d: "10 Dreamers", m: "$150", yr: "MO 1" },
                  { t: "Month 3", d: "100 Dreamers", m: "$1,500", yr: "MO 3" },
                  { t: "Month 6", d: "500 Dreamers", m: "$10,000", yr: "MO 6" },
                  { t: "Month 12", d: "2,500 Dreamers", m: "$50,000", yr: "MO 12" },
                  { t: "Year 2", d: "12,000 Dreamers", m: "$250,000", yr: "YR 2" },
                  { t: "Year 3", d: "API + Enterprise", m: "$2M+", yr: "YR 3" },
                ].map((r, i) => (
                  <div key={r.t} style={{ background: C.surface, borderRadius: 14, padding: 20, textAlign: "center", border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 10, color: C.textFaint, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>{r.yr}</div>
                    <div style={{ fontSize: 13, color: C.textDim, marginBottom: 8 }}>{r.d}</div>
                    <div style={{ fontSize: "clamp(18px, 2vw, 26px)", fontWeight: 900, color: i >= 4 ? C.accent : C.gold }}>{r.m}<span style={{ fontSize: 11, color: C.textDim }}>/mo</span></div>
                  </div>
                ))}
              </div>
            </GlowCard>

            {/* The flywheel */}
            <GlowCard color={C.purple} style={{ padding: 36 }}>
              <div style={{ fontSize: 10, letterSpacing: 4, color: C.purple, marginBottom: 20, textTransform: "uppercase" }}>The Flywheel That Compounds Forever</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 8 }}>
                {["Dreamers Create", "→", "List on NOIZYFISH", "→", "Devs Buy", "→", "Devs Join NOIZY", "→", "Devs Create Game Audio", "→", "List on NOIZYFISH", "→", "Cycle Repeats"].map((item, i) => (
                  <div key={i} style={{
                    background: item === "→" ? "transparent" : C.surface,
                    border: item === "→" ? "none" : `1px solid ${C.border}`,
                    borderRadius: item === "→" ? 0 : 8,
                    padding: item === "→" ? "0 4px" : "8px 14px",
                    fontSize: item === "→" ? 20 : 12,
                    color: item === "→" ? C.purple : C.textDim, fontWeight: item === "→" ? 900 : 400
                  }}>{item}</div>
                ))}
              </div>
              <p style={{ marginTop: 24, fontSize: 14, color: C.textDim, lineHeight: 1.8, textAlign: "center" }}>Every user is simultaneously a <strong style={{ color: C.text }}>customer AND a supplier.</strong> The marketplace gets richer every month without NOIZY creating a single asset. The Roblox model applied to AI creative audio.</p>
            </GlowCard>
          </div>
        )}

        {/* ━━━ PARTNERS ━━━ */}
        {activeTab === "partners" && (
          <div>
            <SectionHeader eyebrow="Partnership Architecture" title="Who NOIZY Builds With" sub="Strategic partnerships are the distribution layer. Each one opens a market that would take years to crack alone." color={C.green} />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, marginBottom: 48 }}>
              {PARTNERS_DATA.map(p => (
                <GlowCard key={p.name} color={p.color} style={{ padding: 28 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: C.text, marginBottom: 4 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: p.color }}>{p.role}</div>
                    </div>
                    <Badge label={p.status} color={p.status === "ACTIVE" ? C.green : p.status === "INTEGRATE" ? C.cyan : C.gold} />
                  </div>
                  <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.7, margin: 0 }}>{p.desc}</p>
                </GlowCard>
              ))}
            </div>

            {/* VSI Deep Dive */}
            <SectionHeader eyebrow="Priority Target" title="VSI London — The Dream Partnership" sub="720 people. 80+ languages. Netflix & Disney preferred vendor. And a brand new Director of Technology who came from an AI dubbing company." color={C.cyan} />
            <GlowCard color={C.cyan} style={{ padding: 36 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 32 }}>
                {[
                  { name: "Dimitri Konovalov", role: "Director of Technology & Innovation", note: "YOUR FIRST CALL — New hire, AI native, came from Dubformer", color: C.accent },
                  { name: "Scott Rose", role: "Group CTO", note: "Has literally described NOIZY's value in his own LinkedIn posts", color: C.cyan },
                  { name: "Mark Howorth", role: "Group CEO", note: "Harvard MBA — responds to revenue, efficiency, and competitive edge", color: C.gold },
                  { name: "Norman Dawood", role: "Chairman & Founder", note: "Language is his bloodline — his father translated the Koran into English", color: C.purple },
                ].map(person => (
                  <div key={person.name} style={{ background: C.surface, borderRadius: 14, padding: 20, border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 11, color: person.color, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>TARGET</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>{person.name}</div>
                    <div style={{ fontSize: 12, color: C.textDim, marginBottom: 10 }}>{person.role}</div>
                    <div style={{ fontSize: 12, color: person.color, fontStyle: "italic", lineHeight: 1.5 }}>{person.note}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "20px 24px", background: C.cyanGlow, borderRadius: 14, borderLeft: `3px solid ${C.cyan}` }}>
                <div style={{ fontSize: 11, color: C.cyan, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>The Pitch in 3 Sentences</div>
                <p style={{ fontSize: 15, color: C.text, lineHeight: 1.8, margin: 0, fontStyle: "italic" }}>"VSI has 36 years of cultural excellence and 720 humans who understand language. NOIZY has the AI layer that tells those humans — and the AI voice actors working alongside them — exactly how a character should feel, breathe, and perform in every culture on Earth, in real time. Together, VSI delivers 20 languages in the time it used to take to deliver 5."</p>
              </div>
            </GlowCard>
          </div>
        )}

        {/* ━━━ TECH ━━━ */}
        {activeTab === "tech" && (
          <div>
            <SectionHeader eyebrow="Architecture" title="The Technical Stack" sub="Every layer is a competitive moat. Combined they are impossible to replicate. Built by Rob Plowman on GOD — Mac Studio M2 Ultra, 192GB RAM." color={C.orange} />

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 48 }}>
              {TECH_STACK.map(layer => (
                <GlowCard key={layer.layer} color={layer.color} style={{ padding: "22px 28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
                    <div style={{ minWidth: 160, flexShrink: 0 }}>
                      <div style={{ fontSize: 10, letterSpacing: 4, color: layer.color, textTransform: "uppercase" }}>{layer.layer}</div>
                    </div>
                    <div style={{ display: "flex", gap: 10, flex: 1, flexWrap: "wrap" }}>
                      {layer.tools.map(tool => (
                        <div key={tool.n} style={{ background: layer.color + "12", border: `1px solid ${layer.color}33`, borderRadius: 10, padding: "10px 16px" }}>
                          <div style={{ fontSize: 13, color: layer.color, fontWeight: 700 }}>{tool.n}</div>
                          <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{tool.d}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlowCard>
              ))}
            </div>

            {/* Infrastructure */}
            <SectionHeader eyebrow="Current Infrastructure" title="MC96ECOUNIVERSE — What's Already Built" color={C.orange} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
              {[
                { n: "60+", label: "Cloudflare Workers Built", color: C.orange },
                { n: "11", label: "D1 Databases", color: C.cyan },
                { n: "20", label: "KV Namespaces", color: C.gold },
                { n: "34TB", label: "THE AQUARIUM Archive", color: C.green },
                { n: "40yr", label: "Creative Catalog", color: C.purple },
                { n: "3", label: "Production Machines", color: C.accent },
              ].map(s => (
                <div key={s.n} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 40, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.n}</div>
                  <div style={{ fontSize: 12, color: C.textDim, marginTop: 6 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* The moat */}
            <GlowCard color={C.cyan} style={{ padding: 36 }}>
              <div style={{ fontSize: 10, letterSpacing: 4, color: C.cyan, marginBottom: 20, textTransform: "uppercase" }}>The Compounding Data Moat</div>
              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 28 }}>
                {["More Dreamers", "→", "More Cultural Data", "→", "Better Performance", "→", "More VSI Projects", "→", "More Revenue", "→", "Better Models", "→", "More Dreamers"].map((item, i) => (
                  <div key={i} style={{ background: item === "→" ? "transparent" : C.surface, border: item === "→" ? "none" : `1px solid ${C.border}`, borderRadius: 8, padding: item === "→" ? "0 4px" : "8px 14px", fontSize: item === "→" ? 18 : 12, color: item === "→" ? C.cyan : C.textDim }}>{item}</div>
                ))}
              </div>
              <p style={{ fontSize: 14, color: C.textDim, lineHeight: 1.8, textAlign: "center", margin: 0 }}>By Year 3, NOIZY's cultural acoustic database is so deep that <strong style={{ color: C.text }}>no company starting from scratch can replicate it.</strong> Not ElevenLabs. Not OpenAI. Not Google. The data is earned through <strong style={{ color: C.cyan }}>creative partnership with humans</strong> — and it compounds every single day.</p>
            </GlowCard>
          </div>
        )}

        {/* ━━━ ROADMAP ━━━ */}
        {activeTab === "roadmap" && (
          <div>
            <SectionHeader eyebrow="90 Days to World" title="From Proof of Concept to Category Dominance" sub="Five phases. One unstoppable direction. The cultural voice AI layer for the entire planet." color={C.cyan} />

            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 28, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${C.cyan}, ${C.gold}, ${C.green}, ${C.purple}, ${C.accent})`, opacity: 0.4, borderRadius: 2 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                {ROADMAP.map((phase, i) => (
                  <div key={phase.phase} style={{ display: "flex", gap: 28 }}>
                    <div style={{ flexShrink: 0, width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg, ${phase.color}, ${phase.color}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: phase.color === C.gold ? "#000" : "#fff", position: "relative", zIndex: 1, boxShadow: `0 0 20px ${phase.color}40` }}>{i + 1}</div>
                    <GlowCard color={phase.color} style={{ padding: "24px 28px", flex: 1 }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                        <Badge label={phase.phase} color={phase.color} />
                        <span style={{ fontSize: 12, color: C.textFaint }}>— {phase.time}</span>
                      </div>
                      <h3 style={{ fontSize: 22, fontWeight: 900, color: C.text, margin: "0 0 20px", fontFamily: "Georgia, serif" }}>{phase.title}</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                        {phase.items.map(item => (
                          <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <span style={{ color: phase.color, flexShrink: 0, marginTop: 2 }}>◆</span>
                            <span style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6 }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </GlowCard>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ━━━ INVESTMENT ━━━ */}
        {activeTab === "alex" && (
          <div>
            <SectionHeader eyebrow="The Ask" title="Alex's Investment — The Full Stack" sub="Every tool. Every cost. Every reason. Completely transparent. This is what it costs to build NOIZY.ai at full power for 24 months." color={C.gold} />

            <GlowCard color={C.gold} style={{ overflow: "hidden", marginBottom: 32 }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 3fr", background: C.surface, padding: "14px 24px", borderBottom: `1px solid ${C.border}` }}>
                {["TOOL", "MONTHLY", "ANNUAL", "WHY NOIZY NEEDS IT"].map(h => (
                  <div key={h} style={{ fontSize: 10, letterSpacing: 3, color: C.textFaint, textTransform: "uppercase" }}>{h}</div>
                ))}
              </div>
              {ALEX_STACK.map((item, i) => (
                <div key={item.tool} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 3fr", padding: "14px 24px", borderBottom: i < ALEX_STACK.length - 1 ? `1px solid ${C.border}` : "none", background: i % 2 === 0 ? "transparent" : "#ffffff03", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{item.tool}</div>
                  <div style={{ fontSize: 13, color: C.textDim }}>{item.mo}</div>
                  <div style={{ fontSize: 13, color: C.gold, fontWeight: 700 }}>{item.yr}</div>
                  <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.5 }}>{item.why}</div>
                </div>
              ))}
            </GlowCard>

            {/* Totals */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
              {[
                { label: "Monthly Stack", value: `$${totalMonthly}`, sub: "All tools running", color: C.cyan },
                { label: "Annual Stack", value: `$${(total24 / 2).toLocaleString()}`, sub: "12 months prepaid", color: C.gold },
                { label: "24-Month Total", value: `$${total24.toLocaleString()}`, sub: "Full runway buy", color: C.accent },
                { label: "Daily Cost", value: `$${Math.round(totalMonthly / 30)}`, sub: "Less than a lunch", color: C.green },
              ].map(s => (
                <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: C.textFaint, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 40, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: C.textDim, marginTop: 6 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* The pitch */}
            <GlowCard color={C.gold} style={{ padding: 48, textAlign: "center" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(to right, transparent, ${C.gold}, transparent)`, borderRadius: "18px 18px 0 0" }} />
              <div style={{ fontSize: 10, letterSpacing: 6, color: C.gold, marginBottom: 20, textTransform: "uppercase" }}>The Alex Pitch — 60 Seconds</div>
              <p style={{ fontSize: "clamp(16px, 2.5vw, 22px)", lineHeight: 1.8, color: C.text, maxWidth: 800, margin: "0 auto 32px", fontStyle: "italic" }}>
                "$5,500 for 24 months keeps NOIZY.ai's complete creative AI stack alive — every tool needed to build the platform, prove the concept, land VSI London as a partner, and show the world what a real AI creative partnership looks like. This is not a donation. It's a <strong style={{ color: C.gold }}>runway purchase.</strong> The category doesn't exist yet. We're building it."
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                {["12 months of uninterrupted building", "Zero subscription anxiety", "Full NOIZY proof-of-concept stack", "Credibility for next investor conversation", "VSI demo ready in 90 days"].map(b => (
                  <Badge key={b} label={b} color={C.gold} />
                ))}
              </div>
            </GlowCard>
          </div>
        )}

      </div>

      {/* ── FOOTER ── */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "40px 24px", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(to right, transparent, ${C.accent}66, ${C.cyan}66, transparent)` }} />
        <div style={{ fontSize: 10, letterSpacing: 8, color: C.textFaint, textTransform: "uppercase", marginBottom: 12 }}>GORUNFREEX1000</div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 }}>
          <Badge label="NOIZY.ai" color={C.accent} />
          <Badge label="NOIZYFISH.com" color={C.cyan} />
          <Badge label="NOIZYVOX" color={C.gold} />
          <Badge label="Fish Music Inc." color={C.green} />
          <Badge label="THE AQUARIUM" color={C.purple} />
        </div>
        <div style={{ fontSize: 12, color: C.textFaint }}>Honor · Respect · Gather · Nurture · Preserve — Rob Plowman, Founded 1996</div>
      </div>
    </div>
  );
}
