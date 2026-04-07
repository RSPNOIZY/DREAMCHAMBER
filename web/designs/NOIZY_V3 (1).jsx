import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   NOIZY.ai — THE COMPLETE SYSTEM V3
   Fish Music Inc. × Rob Plowman × GORUNFREEX1000
   "Honor. Respect. Gather. Nurture. Preserve."
═══════════════════════════════════════════════════════════════ */

const C = {
  bg: "#03030a", bg2: "#06060f", surface: "#090918", card: "#0d0d1e",
  border: "#141430", borderBright: "#222244",
  accent: "#ff1f5e", accentGlow: "#ff1f5e20",
  gold: "#ffb830", goldGlow: "#ffb83018",
  cyan: "#00eaff", cyanGlow: "#00eaff15",
  green: "#00ff7a", greenGlow: "#00ff7a15",
  purple: "#bb55ff", purpleGlow: "#bb55ff15",
  orange: "#ff7a20", orangeGlow: "#ff7a2015",
  teal: "#00ffcc", tealGlow: "#00ffcc15",
  pink: "#ff55aa",
  text: "#eeeeff", textMid: "#8888bb", textDim: "#444466", textFaint: "#1e1e38",
};

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-thumb{background:${C.accent};border-radius:2px}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes wave{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}
@keyframes pring{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.8);opacity:0}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes scan{0%{top:-1%}100%{top:101%}}
@keyframes shimmer{0%{opacity:.4}50%{opacity:1}100%{opacity:.4}}
@keyframes glitch{0%,100%{transform:translate(0)}20%{transform:translate(-2px,1px)}40%{transform:translate(2px,-1px)}60%{transform:translate(-1px,2px)}80%{transform:translate(1px,-2px)}}
.gcard{transition:all .28s cubic-bezier(.4,0,.2,1)}
.gcard:hover{transform:translateY(-3px)}
.tabpill{transition:all .2s}
.tabpill:hover{transform:translateY(-2px)}
input[type=range]{-webkit-appearance:none;height:3px;border-radius:2px;outline:none;cursor:pointer}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;cursor:pointer}
`;

// ── WAVEFORM ──────────────────────────────────────────────────
function Wave({ color = C.accent, bars = 36, h = 52 }) {
  const [hs] = useState(() => Array.from({ length: bars }, () => 15 + Math.random() * 85));
  const [ds] = useState(() => Array.from({ length: bars }, () => (Math.random() * 1.4).toFixed(2)));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: h }}>
      {hs.map((bh, i) => (
        <div key={i} style={{
          width: 3, height: `${bh}%`, borderRadius: 2, flexShrink: 0,
          background: `linear-gradient(to top,${color}55,${color})`,
          animation: `wave ${.7 + Math.random() * .9}s ease-in-out ${ds[i]}s infinite`,
          transformOrigin: "center"
        }} />
      ))}
    </div>
  );
}

// ── PULSE ─────────────────────────────────────────────────────
function Pulse({ color, sz = 10 }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", width: sz, height: sz, flexShrink: 0 }}>
      <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color, animation: "pring 2s ease-out infinite" }} />
      <span style={{ width: sz * .5, height: sz * .5, borderRadius: "50%", background: color, position: "relative", zIndex: 1 }} />
    </span>
  );
}

// ── COUNTER ───────────────────────────────────────────────────
function Count({ to, pre = "", suf = "", dur = 1800 }) {
  const [v, setV] = useState(0);
  const ref = useRef(null);
  const fired = useRef(false);
  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !fired.current) {
        fired.current = true;
        const s = Date.now();
        const tick = () => {
          const p = Math.min((Date.now() - s) / dur, 1);
          setV(Math.floor((1 - Math.pow(1 - p, 3)) * to));
          if (p < 1) requestAnimationFrame(tick); else setV(to);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: .3 });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, [to]);
  return <span ref={ref}>{pre}{v.toLocaleString()}{suf}</span>;
}

// ── SECTION HEADER ────────────────────────────────────────────
function SH({ eyebrow, title, body, color = C.accent, center = false }) {
  const a = center ? "center" : "left";
  return (
    <div style={{ marginBottom: 48, textAlign: a }}>
      {eyebrow && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <Pulse color={color} />
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: 5, color, textTransform: "uppercase" }}>{eyebrow}</span>
        </div>
      )}
      <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(26px,4vw,52px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: -1, color: C.text, marginBottom: body ? 14 : 0 }}>{title}</h2>
      {body && <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, color: C.textMid, maxWidth: 600, lineHeight: 1.9, margin: center ? "0 auto" : 0 }}>{body}</p>}
      <div style={{ height: 2, width: 44, background: `linear-gradient(to right,${color},transparent)`, marginTop: 18, borderRadius: 2, marginLeft: center ? "auto" : 0, marginRight: center ? "auto" : 0 }} />
    </div>
  );
}

// ── GLOW CARD ─────────────────────────────────────────────────
function GC({ children, color = C.accent, pad = 26, style: sx = {}, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div className="gcard" onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: C.card, borderRadius: 20, position: "relative", overflow: "hidden",
        border: `1px solid ${hov ? color + "55" : C.border}`,
        boxShadow: hov ? `0 0 60px ${color}14` : "none",
        cursor: onClick ? "pointer" : "default", padding: pad,
        transition: "all .28s cubic-bezier(.4,0,.2,1)", ...sx
      }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 80% 10%,${color}07,transparent 55%)`, pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

// ── BADGE ─────────────────────────────────────────────────────
function Bdg({ label, color }) {
  return (
    <span style={{ fontFamily: "'DM Mono',monospace", background: color + "14", border: `1px solid ${color}30`, borderRadius: 100, padding: "5px 13px", fontSize: 11, color, letterSpacing: 1, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

// ── MONO LABEL ────────────────────────────────────────────────
function ML({ children, color = C.textDim }) {
  return <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: 5, color, textTransform: "uppercase" }}>{children}</span>;
}

/* ═══════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════ */

const PILLARS = [
  { n: "01", icon: "🎭", color: C.accent, title: "INTUITIVE AI VOICE ACTORS", sub: "Characters That Live Inside Cultures",
    desc: "Not text-to-speech. Not voice cloning. AI voice actors that understand the difference between how grief sounds in Lagos vs Tokyo, how authority lands in Berlin vs Buenos Aires — and deliver it through every performance in real time.",
    pts: ["5 Dimensions of Cultural Voice Performance", "Acoustic Emotional Fingerprint Engine", "Somatic Performance Mapping — 200 cultures", "Adaptive Real-Time Social Change Tracking", "Signal-native Librosa intelligence — not token-based"],
    kill: "ElevenLabs clones voices. NOIZY performs culture." },
  { n: "02", icon: "🧠", color: C.cyan, title: "DREAMER PERSONA ENGINE", sub: "Your Creative Identity — Forever Growing",
    desc: "Every subscriber builds an AI persona that accumulates their creative knowledge, taste, style, and history. The persona grows with them. It becomes their creative partner, teacher, and co-writer — and it can never be taken to any other platform.",
    pts: ["AI persona learns YOUR unique creative voice", "Pinecone vector memory — never forgets anything", "Persona-to-persona collaboration between Dreamers", "Commercial rights to everything you create", "The longer you stay — the more irreplaceable it gets"],
    kill: "ElevenLabs has no memory of you. NOIZY becomes you." },
  { n: "03", icon: "🎵", color: C.gold, title: "SIGNAL-REACTIVE AUDIO ENGINE", sub: "Audio That Listens and Responds",
    desc: "Librosa spectral analysis reads the acoustic fingerprint of existing audio and generates voice, SFX, and music sonically consistent with the source. ElevenLabs is text-in audio-out. NOIZY hears the room before it speaks.",
    pts: ["Librosa: BPM, key, timbre, onset detection", "SFX matched to your mix's acoustic fingerprint", "Adaptive game audio responding in real-time", "Music-reactive voice generation from signal data", "Chromagram → emotional state → performance mapping"],
    kill: "ElevenLabs generates audio. NOIZY responds to what's playing." },
  { n: "04", icon: "📚", color: C.green, title: "THE LIVING KNOWLEDGE ARCHIVE", sub: "40 Years of Human Creativity + All of History",
    desc: "The most knowledgeable creative AI in existence across music, art, film, and voice. Every session teaches you why — not just what. The AI doesn't just help you create, it makes you understand the masters so deeply you become one.",
    pts: ["Complete music theory — every global tradition", "Film history & sound design from birth to now", "Art history across ALL cultures — not just Western", "Cultural performance data — 200+ living contexts", "Daily updates as social language and culture evolves"],
    kill: "ElevenLabs teaches nothing. NOIZY makes you a master." },
  { n: "05", icon: "💰", color: C.purple, title: "ARTIST-FIRST REVENUE MODEL", sub: "75/25 Splits. Artists Win. Always.",
    desc: "ElevenLabs extracts from artists — voices train the model, creativity builds the product, artists see nothing. NOIZY flips this completely. Artists are not data sources. They are founding partners in the ecosystem they're creating.",
    pts: ["70% to creators on every NOIZYFISH sale", "NOIZYVOX guild — 75/25 voice acting splits", "Streaming royalty pass-through via DistroKid", "Sync licensing portal — zero copyright risk", "Dreamers supply AND consume the marketplace"],
    kill: "ElevenLabs extracts from artists. NOIZY pays them." },
  { n: "06", icon: "🎮", color: C.orange, title: "GAMING AUDIO DOMINANCE", sub: "Adaptive Audio Nobody Else Has Built",
    desc: "The global game audio market is $1.77B racing to $3.73B. 60-95% of game audio is outsourced. NOIZY is the only platform offering adaptive, signal-reactive audio that responds to game state in real time — not static loops.",
    pts: ["Unity & Unreal Engine plugin integration", "Real-time adaptive scoring engine per game state", "Character voice that evolves with gameplay", "Cultural localization across 80+ language markets", "NOIZYFISH game audio marketplace for indie devs"],
    kill: "Every competitor makes static audio. NOIZY makes audio that thinks." },
];

const CULTURES = [
  { r: "WEST AFRICA", flag: "🌍", color: C.gold, langs: ["Yoruba", "Igbo", "Hausa", "Pidgin English"],
    profile: { Grief: "Communal, vocal, externalized — grief is shared and performed", Authority: "Elder-centered, oral tradition depth, proverb-weighted delivery", Warmth: "Expansive, physically expressive, communal by nature", Humor: "Performative, storytelling-driven, audience-participatory" },
    insight: "Nollywood is the 2nd largest film industry by volume on Earth. Zero culturally authentic AI voice representation exists anywhere today. NOIZY owns this market first." },
  { r: "EAST ASIA", flag: "🌏", color: C.cyan, langs: ["Mandarin", "Japanese", "Korean", "Cantonese"],
    profile: { Grief: "Contained, private, restrained — control signals depth", Authority: "Breath control at throat, measured pacing, controlled register", Warmth: "Subtle, understated, expressed through action not effusion", Humor: "Wordplay-based, tonal, deadpan precision timing" },
    insight: "K-drama, J-pop, and Mandarin cinema are three of the world's fastest-growing entertainment markets. NOIZY's cultural accuracy is the difference between authentic and offensive." },
  { r: "LATIN AMERICA", flag: "🌎", color: C.accent, langs: ["Brazilian Portuguese", "Mexican Spanish", "Argentine Spanish", "Colombian Spanish"],
    profile: { Grief: "Openly expressed, chest-centered, physically embodied", Authority: "Rapid confident cadence, warmth woven into command", Warmth: "Chest-physical, expansive, linguistically affectionate", Humor: "Physical energy, wordplay, performative delivery" },
    insight: "Brazil alone — 215 million people, thriving music and film culture. One of the most underserved markets for culturally accurate AI voice. NOIZY's Phase 2 beachhead." },
  { r: "SOUTH ASIA", flag: "🌏", color: C.purple, langs: ["Hindi", "Tamil", "Bengali", "Urdu"],
    profile: { Grief: "Formal structure, ritual expression, community witnessed", Authority: "Layered with social context — caste, age, profession all register", Warmth: "Hospitality as acoustic signature — specific prosodic patterns", Humor: "Layered, indirect, context-dependent, audience-read" },
    insight: "Bollywood alone produces 1,500+ films per year. Every single one needs culturally authentic voice adaptation. NOIZY's cultural engine is trained for this specificity from day one." },
  { r: "MIDDLE EAST", flag: "🌍", color: C.teal, langs: ["Arabic (Gulf)", "Arabic (Levant)", "Farsi", "Turkish"],
    profile: { Grief: "Public ritual, formal structure, gender-differentiated expression", Authority: "Religious register intersects with political authority acoustically", Warmth: "Hospitality is acoustic — generosity expressed through voice cadence", Humor: "Sophisticated wordplay, classical reference, context-dense delivery" },
    insight: "Arabic alone is spoken by 420 million people across 22 countries — each with distinct dialect variants requiring separate cultural calibration. One AI voice doesn't cover them." },
  { r: "NORTHERN EUROPE", flag: "🌍", color: C.green, langs: ["German", "Swedish", "Finnish", "Dutch"],
    profile: { Grief: "Private, compressed, unexpressed publicly", Authority: "Slow deliberate pace — the 'room changes' model of authority", Warmth: "Underplayed, dry, expressed through reliability not effusion", Humor: "Deadpan, ironic, referential, often missed cross-culturally" },
    insight: "Northern European dubs of American content often fail because warmth is performed at American vocal levels in voices that culturally signal coldness. NOIZY catches this automatically." },
];

const VS = [
  ["Cultural Adaptation", "✗  None — zero cultural intelligence", C.accent, "✓  200 Contexts, Live Updating", C.green],
  ["Artist Memory", "✗  Starts from zero every session", C.accent, "✓  Dreamer Persona grows forever", C.green],
  ["Music Reactivity", "✗  None — no signal analysis", C.accent, "✓  Librosa real-time spectral engine", C.green],
  ["Education Layer", "✗  None — no knowledge system", C.accent, "✓  Complete creative history — all traditions", C.green],
  ["Artist Revenue", "✗  0% — artists are data, not partners", C.accent, "✓  70–75% splits across all streams", C.green],
  ["SFX Intelligence", "⚡  Text → SFX (good but static)", C.gold, "✓  Mix-matched acoustic fingerprint SFX", C.green],
  ["Game Audio", "✗  Static generation only", C.accent, "✓  Adaptive real-time game audio engine", C.green],
  ["Voice Generation", "✓  Strong text → voice", C.textMid, "✓  Signal-Aware Cultural Performance", C.green],
  ["Persona Collab", "✗  None", C.accent, "✓  AI persona × AI persona co-creation", C.green],
  ["Endangered Langs", "✗  Not on roadmap", C.accent, "✓  UNESCO-adjacent preservation layer", C.green],
  ["Long Game", "⚡  IPO / 85% enterprise, creators shrinking", C.gold, "✓  Artists first. Category creation. Forever.", C.green],
];

const TIERS = [
  { name: "DREAMER SEED", price: "FREE", color: C.textMid, tag: null,
    feats: ["Basic persona creation", "Community Discord access", "Daily culture drops", "10 history queries/month", "NOIZYFISH browsing"] },
  { name: "DREAMER", price: "$15", per: "/mo", color: C.cyan, tag: null,
    feats: ["Full persona development", "Deep music/art/film history", "Librosa audio analysis", "100 SFX generations/month", "NOIZYFISH commercial license"] },
  { name: "DREAMER PRO", price: "$35", per: "/mo", color: C.gold, tag: "MOST POPULAR",
    feats: ["Signal-reactive audio tools", "Persona × persona collaboration", "Full Master Class library", "500 SFX + voice generations", "Adaptive game audio engine"] },
  { name: "DREAMER STUDIO", price: "$99", per: "/mo", color: C.accent, tag: "FULL POWER",
    feats: ["Commercial rights to everything", "White-label persona for creators", "Unlimited generation", "DAW plugin access", "Full API + priority Opus 4.6"] },
];

const TECH = [
  { layer: "AI BRAIN", color: C.purple, items: [{ n: "Claude Sonnet 4.6", d: "Reasoning + Cultural Context" }, { n: "Pinecone", d: "Vector Persona Memory" }, { n: "Anthropic API", d: "Dreamer Engine Backend" }] },
  { layer: "AUDIO SIGNAL", color: C.gold, items: [{ n: "Librosa", d: "Spectral Analysis Core" }, { n: "ElevenLabs API", d: "Voice Generation Layer" }, { n: "Suno / Udio", d: "Music Generation" }] },
  { layer: "CULTURE ENGINE", color: C.cyan, items: [{ n: "Custom Dataset", d: "200 Cultural Contexts" }, { n: "Social Feed Pipeline", d: "Real-time Language Drift" }, { n: "Academic Research", d: "Anthropology + Linguistics" }] },
  { layer: "COMMUNITY", color: C.green, items: [{ n: "Discord MCP", d: "Claude Controls Server" }, { n: "n8n + Albato", d: "Full Workflow Automation" }, { n: "LaunchPass", d: "Subscription Management" }] },
  { layer: "MARKETPLACE", color: C.orange, items: [{ n: "NOIZYFISH.com", d: "Asset Hub + Creator Economy" }, { n: "DistroKid", d: "Royalty Routing" }, { n: "Stripe", d: "Global Payments" }] },
  { layer: "INFRASTRUCTURE", color: C.accent, items: [{ n: "60+ CF Workers Built", d: "GOD — Mac Studio M2 Ultra" }, { n: "11 D1 Databases", d: "20 KV Namespaces Active" }, { n: "FastAPI + React PWA", d: "Full Stack Foundation" }] },
];

const ROADMAP = [
  { p: "01", time: "Month 1–3", title: "Proof of Concept", color: C.cyan,
    items: ["60-second cultural voice demo for VSI", "Dreamer persona MVP on Discord", "NOIZYFISH.com public launch", "Dimitri + Scott Rose outreach", "10 founding Dreamers paying"] },
  { p: "02", time: "Month 3–6", title: "Community Launch", color: C.gold,
    items: ["Discord fully AI-powered", "LaunchPass subscriptions active", "100 Dreamers — $1,500 MRR", "First game studio client signed", "Librosa !analyze bot command live"] },
  { p: "03", time: "Month 6–12", title: "Platform Build", color: C.green,
    items: ["VSI partnership signed", "Unity/Unreal plugin alpha ships", "NOIZYFISH open to all creators", "500 Dreamers — $10K MRR", "Latin America expansion begins"] },
  { p: "04", time: "Year 2", title: "World Scale", color: C.purple,
    items: ["West Africa & Nollywood active", "API white-label for publishers", "12,000 Dreamers — $250K MRR", "Endangered language program", "Series A conversations open"] },
  { p: "05", time: "Year 3", title: "Category Dominance", color: C.accent,
    items: ["Cultural voice AI standard — set", "UNESCO institutional licensing", "$2M+ MRR — category created", "ElevenLabs acquisition conversation", "NOIZY is not a contender. It's the standard."] },
];

const ALEX = [
  { t: "Claude Max 5x", m: 100, note: "Never hits a wall mid-build" },
  { t: "ElevenLabs Creator", m: 22, note: "100K voice credits/month" },
  { t: "Midjourney Standard", m: 30, note: "Visual assets for NOIZYFISH" },
  { t: "Suno Pro", m: 10, note: "AI music for demos & proofs" },
  { t: "Cursor IDE Pro", m: 20, note: "AI code editor — 3x faster builds" },
  { t: "n8n Cloud", m: 20, note: "All Discord/Slack automation" },
  { t: "Pinecone Starter", m: 25, note: "Dreamer persona vector memory" },
  { t: "Albato", m: 15, note: "Claude ↔ Discord bridge" },
  { t: "LaunchPass", m: 29, note: "Dreamer subscription management" },
  { t: "Notion AI", m: 16, note: "Knowledge base + project ops" },
  { t: "Discord Nitro", m: 10, note: "Community server boosts" },
  { t: "Anthropic API Credits", m: 50, note: "NOIZY bot + persona backend" },
];

const VSI_PEOPLE = [
  { name: "Dimitri Konovalov", role: "Director of Technology & Innovation", status: "FIRST CALL", color: C.accent, note: "New hire from Dubformer AI. Brand new, AI-native, hungry to prove himself. Your warmest door into VSI." },
  { name: "Scott Rose", role: "Group CTO", status: "SECOND", color: C.cyan, note: "Literally described NOIZY's core value in his own NAB Talk. Mirror his words back to him verbatim." },
  { name: "Mark Howorth", role: "Group CEO", status: "THIRD", color: C.gold, note: "Harvard MBA. Mandate: scale VSI globally, expand Asia. Responds to revenue and competitive edge." },
  { name: "Norman Dawood", role: "Chairman & Founder", status: "SOUL", color: C.purple, note: "His father translated the Koran into modern English. Language is his bloodline. Save him for when it matters most." },
];

const EMAILS = [
  { label: "Direct & Bold — Your Version Polished", target: "dimitri.konovalov@vsi.tv",
    subject: "AI Voice Actors That Perform Inside Cultures — Proof of Concept for VSI",
    body: `Hi Dimitri,

Congratulations on joining VSI — the timing of your arrival and what we're building at NOIZY.ai feels like more than coincidence.

I'm building an AI voice and audio platform called NOIZY.ai with one core capability nobody else has: voice actors that don't just speak a language — they perform inside a culture. The system analyzes acoustic, emotional, and cultural performance data in real time and adapts character delivery to match the social and emotional register of any target market.

Not text-to-speech. Not voice cloning. Intuitive AI voice performance that understands the difference between how grief sounds in Lagos vs. Tokyo, how authority lands in Berlin vs. Buenos Aires — and delivers it through the voice actor in the room or the AI voice persona in the pipeline.

I know you came from Dubformer. You understand exactly why this matters and exactly where the current AI dubbing ceiling is. NOIZY is being built to break through it.

I'd love 20 minutes to show you the proof of concept we're assembling — and explore what a VSI partnership could look like.

Would you be open to a call this month?

Best,
Rob Plowman
Founder, NOIZY.ai | Fish Music Inc.
noizyfish.com` },
  { label: "With Demo Hook — Maximum Impact", target: "dimitri.konovalov@vsi.tv",
    subject: "The AI Dubbing Ceiling — We're Breaking Through It",
    body: `Hi Dimitri,

Congratulations on joining VSI — moving from Dubformer into VSI's technology seat at this exact moment in AI voice development is a fascinating position to be in.

I wanted to reach you early because what we're assembling at NOIZY.ai sits precisely at the gap you know better than almost anyone.

NOIZY.ai is building AI voice actors that don't just speak a language — they perform inside a culture. The system reads acoustic, emotional, and cultural performance data in real time and adapts character delivery to the social and emotional register of any target market.

Not TTS. Not cloning. The difference between how grief sounds in Lagos vs. Tokyo. How authority lands in Berlin vs. Buenos Aires. How warmth lives in the chest in Brazilian Portuguese but behind the eyes in Japanese — delivered through every performance automatically.

We're assembling a 60-second proof-of-concept demo right now — the same scene dubbed into three languages, first with standard AI, then with NOIZY's cultural adaptation layer. The difference is immediate. You don't need to explain the technology. You just press play.

VSI is the partner we have in mind to test this at real scale. I'd love 20 minutes.

Would you be open to a call this month?

Best,
Rob Plowman
Founder, NOIZY.ai | Fish Music Inc.
noizyfish.com` },
  { label: "Ruthlessly Short — Maximum Respect for His Time", target: "dimitri.konovalov@vsi.tv",
    subject: "NOIZY.ai — AI Voice That Performs Inside Cultures",
    body: `Hi Dimitri,

Congratulations on joining VSI.

I'm building NOIZY.ai — AI voice actors that don't just speak a language, they perform inside a culture. Acoustic, emotional, and cultural adaptation in real time.

You came from Dubformer. You know exactly where the AI dubbing ceiling is. NOIZY is built to break through it — and VSI is the partner I want to test it with.

20 minutes. Proof of concept. This month?

Rob Plowman
Founder, NOIZY.ai | noizyfish.com` },
  { label: "Scott Rose — Mirror His Own NAB Words Back", target: "scott.rose@vsi.tv",
    subject: '"A Random, Noisy, One-Off Assortment of Artistic Choices" — We Solved That',
    body: `Hi Scott,

You said it at NAB — the reason automation fails in localization is that content is "a random, noisy, one-off assortment of artistic choices" and the AI has to analyze on the fly what technology, workflow, and artistic constraints apply to each piece.

That is the exact problem NOIZY.ai was built to solve.

We're developing AI voice actors that don't just translate — they perform inside a culture. The system uses Librosa-native signal analysis to read the acoustic and emotional fingerprint of existing content, then generates culturally-adapted voice performance that matches the artistic register of the source material in every target language.

Your workflow gets a layer that tells every voice actor — human or AI — exactly how this character should feel, breathe, and move in Brazilian Portuguese vs. Japanese vs. Swahili. Not from a style guide. From the signal.

VSI is the partner we have in mind to test this at real scale.

I'd love 20 minutes of your time.

Best,
Rob Plowman
Founder, NOIZY.ai | Fish Music Inc.
noizyfish.com` },
];

const TABS = [
  { id: "system", label: "🔥 System", color: C.accent },
  { id: "vs", label: "⚔️ vs ElevenLabs", color: C.gold },
  { id: "culture", label: "🌍 Culture Engine", color: C.cyan },
  { id: "dreamers", label: "💎 Dreamers", color: C.purple },
  { id: "calc", label: "📊 Revenue Calc", color: C.green },
  { id: "vsi", label: "🤝 VSI London", color: C.teal },
  { id: "tech", label: "🛠️ Stack", color: C.orange },
  { id: "roadmap", label: "🗺️ Roadmap", color: C.cyan },
  { id: "alex", label: "💰 Investment", color: C.gold },
  { id: "email", label: "✉️ Outreach", color: C.pink },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════ */
export default function NOIZY() {
  const [tab, setTab] = useState("system");
  const [pillar, setPillar] = useState(0);
  const [cult, setCult] = useState(0);
  const [emailIdx, setEmailIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  // Revenue calc
  const [dreamer, setDreamer] = useState(80);
  const [pro, setPro] = useState(40);
  const [studio, setStudio] = useState(15);
  const seed = Math.round((dreamer + pro + studio) * 4);
  const subRev = dreamer * 15 + pro * 35 + studio * 99;
  const mktRev = Math.round((dreamer + pro + studio) * 2 * 35 * 0.3);
  const mrr = subRev + mktRev;
  const total = dreamer + pro + studio + seed;

  const alexMonthly = ALEX.reduce((s, i) => s + i.m, 0);
  const alex12 = alexMonthly * 12;
  const alex24 = alexMonthly * 24;

  const copyEmail = () => {
    navigator.clipboard?.writeText(EMAILS[emailIdx].body).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'DM Mono',monospace", color: C.text, overflowX: "hidden" }}>
      <style>{STYLE}</style>

      {/* ── HERO ─────────────────────────────────────────── */}
      <div style={{ position: "relative", padding: "80px 32px 72px", textAlign: "center", borderBottom: `1px solid ${C.border}`, overflow: "hidden" }}>
        {/* orbs */}
        <div style={{ position: "absolute", top: -100, left: "3%", width: 700, height: 500, background: `radial-gradient(${C.accent}0d,transparent 70%)`, pointerEvents: "none", borderRadius: "50%" }} />
        <div style={{ position: "absolute", top: -80, right: "3%", width: 600, height: 400, background: `radial-gradient(${C.cyan}0a,transparent 70%)`, pointerEvents: "none", borderRadius: "50%" }} />
        {/* grid */}
        <div style={{ position: "absolute", inset: 0, opacity: .022, backgroundImage: `linear-gradient(${C.cyan} 1px,transparent 1px),linear-gradient(90deg,${C.cyan} 1px,transparent 1px)`, backgroundSize: "48px 48px", pointerEvents: "none" }} />
        {/* scanline */}
        <div style={{ position: "absolute", left: 0, right: 0, height: 1, background: `linear-gradient(to right,transparent,${C.cyan}44,transparent)`, animation: "scan 8s linear infinite", pointerEvents: "none" }} />

        <div style={{ position: "relative", animation: "fadeUp .9s ease-out" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: C.accentGlow, border: `1px solid ${C.accent}30`, borderRadius: 100, padding: "8px 20px", marginBottom: 30 }}>
            <Pulse color={C.accent} />
            <ML color={C.accent}>NOIZY.ai — Active Build — Fish Music Inc. Est. 1996</ML>
          </div>

          <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(48px,9vw,108px)", fontWeight: 900, lineHeight: .92, letterSpacing: -4, margin: "0 0 8px" }}>
            <span style={{ display: "block", color: C.text }}>THE SYSTEM</span>
            <span style={{ display: "block", color: C.text }}>THAT SERVES</span>
            <span style={{ display: "block", color: C.accent, textShadow: `0 0 80px ${C.accent}55` }}>ARTISTS</span>
            <span style={{ display: "block", color: C.text }}>BETTER THAN</span>
            <span style={{ display: "block", background: `linear-gradient(135deg,${C.gold} 0%,${C.accent} 40%,${C.purple} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>ELEVENLABS</span>
          </h1>

          <div style={{ display: "flex", justifyContent: "center", margin: "28px 0", opacity: .55 }}>
            <Wave color={C.accent} bars={64} h={44} />
          </div>

          <p style={{ fontSize: 14, color: C.textMid, maxWidth: 660, margin: "0 auto 40px", lineHeight: 1.95 }}>
            ElevenLabs makes voices. <strong style={{ color: C.text }}>NOIZY.ai builds the emotional and cultural intelligence layer</strong> that understands what it means to be human in 200 different cultural contexts — and pays artists for it.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 36 }}>
            {[{ n: 200, s: "+", l: "Cultures Mapped", c: C.cyan }, { n: 47, p: "$", s: "B", l: "Voice AI Mkt 2034", c: C.gold }, { n: 75, s: "%", l: "Artist Split", c: C.green }, { n: 40, s: "yr", l: "Creative Archive", c: C.purple }].map(x => (
              <div key={x.l} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px 22px", minWidth: 110, textAlign: "center" }}>
                <div style={{ fontFamily: "'Bebas Neue',serif", fontSize: "clamp(30px,4vw,46px)", color: x.c, lineHeight: 1, letterSpacing: 1 }}>
                  <Count to={x.n} pre={x.p || ""} suf={x.s} />
                </div>
                <div style={{ fontSize: 10, color: C.textDim, marginTop: 6, letterSpacing: 1 }}>{x.l}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {["🎭 AI Voice Actors", "🧠 Dreamer Personas", "🎵 Signal-Reactive Audio", "🌍 200 Cultural Contexts", "💰 Artist Revenue 75%", "🎮 Game Audio Engine", "📚 Living Archive"].map(b => (
              <div key={b} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 100, padding: "7px 16px", fontSize: 11, color: C.textMid }}>{b}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TAB BAR ──────────────────────────────────────── */}
      <div style={{ position: "sticky", top: 0, zIndex: 200, background: `${C.bg}ec`, backdropFilter: "blur(24px)", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 4, padding: "10px 18px", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} className="tabpill" onClick={() => setTab(t.id)} style={{
            background: tab === t.id ? t.color : "transparent",
            color: tab === t.id ? ([C.gold, C.green, C.teal].includes(t.color) ? "#000" : "#fff") : C.textMid,
            border: `1px solid ${tab === t.id ? t.color : C.border}`,
            borderRadius: 10, padding: "8px 15px", cursor: "pointer",
            fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
            letterSpacing: .5, fontFamily: "'DM Mono',monospace",
            boxShadow: tab === t.id ? `0 0 20px ${t.color}30` : "none",
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── CONTENT ──────────────────────────────────────── */}
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "52px 24px 100px", animation: "fadeUp .35s ease-out" }}>

        {/* ▸▸ SYSTEM ──────────────────────────────────────── */}
        {tab === "system" && (
          <div>
            <SH eyebrow="The 6 Pillars" title="Every Pillar Is a Gap ElevenLabs Left Open" body="Each pillar targets a specific failure in the current AI voice market. Together they form an impossible-to-replicate moat." color={C.accent} />

            <div style={{ display: "flex", gap: 8, marginBottom: 26, flexWrap: "wrap" }}>
              {PILLARS.map((p, i) => (
                <button key={i} onClick={() => setPillar(i)} style={{
                  background: pillar === i ? p.color + "1e" : C.surface,
                  border: `1px solid ${pillar === i ? p.color : C.border}`,
                  borderRadius: 12, padding: "9px 17px", cursor: "pointer",
                  color: pillar === i ? p.color : C.textMid, fontSize: 12,
                  fontWeight: 700, transition: "all .2s", fontFamily: "'DM Mono',monospace",
                  boxShadow: pillar === i ? `0 0 16px ${p.color}22` : "none",
                }}>{p.icon} {p.n}</button>
              ))}
            </div>

            {/* Active pillar */}
            {(() => {
              const p = PILLARS[pillar];
              return (
                <GC color={p.color} pad={0} sx={{ marginBottom: 28 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                    <div style={{ padding: "40px 36px", borderRight: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 68, marginBottom: 18, animation: "float 4s ease-in-out infinite" }}>{p.icon}</div>
                      <ML color={p.color}>Pillar {p.n} / 06</ML>
                      <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(20px,3vw,32px)", fontWeight: 900, color: C.text, margin: "12px 0 6px", lineHeight: 1.1 }}>{p.title}</h3>
                      <div style={{ fontSize: 13, color: p.color, marginBottom: 22, fontStyle: "italic" }}>{p.sub}</div>
                      <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.9, marginBottom: 26 }}>{p.desc}</p>
                      <div style={{ background: p.color + "0f", border: `1px solid ${p.color}28`, borderLeft: `3px solid ${p.color}`, borderRadius: "0 10px 10px 0", padding: "14px 18px" }}>
                        <ML color={p.color}>The Kill Shot</ML>
                        <div style={{ fontSize: 13, color: C.text, marginTop: 8, fontStyle: "italic", lineHeight: 1.7 }}>{p.kill}</div>
                      </div>
                    </div>
                    <div style={{ padding: "40px 36px" }}>
                      <ML color={C.textDim}>Core Capabilities</ML>
                      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                        {p.pts.map((b, i) => (
                          <div key={i} style={{ display: "flex", gap: 12, padding: "12px 16px", background: C.surface, borderRadius: 11, border: `1px solid ${C.border}` }}>
                            <span style={{ color: p.color, flexShrink: 0, fontSize: 14 }}>◆</span>
                            <span style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7 }}>{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </GC>
              );
            })()}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: 14 }}>
              {PILLARS.map((p, i) => (
                <GC key={i} color={p.color} pad={22} onClick={() => setPillar(i)}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 28 }}>{p.icon}</span>
                    <div>
                      <ML color={p.color}>{p.n}</ML>
                      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: 700, color: C.text, margin: "6px 0 7px", lineHeight: 1.2 }}>{p.title}</div>
                      <div style={{ fontSize: 11, color: C.textMid, lineHeight: 1.6 }}>{p.kill}</div>
                    </div>
                  </div>
                </GC>
              ))}
            </div>

            <div style={{ marginTop: 52, textAlign: "center", padding: "56px 36px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 24, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at center top,${C.accent}07,transparent 60%)`, pointerEvents: "none" }} />
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(to right,transparent,${C.accent},${C.cyan},transparent)` }} />
              <ML color={C.accent}>The Founding Vision</ML>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(17px,2.5vw,27px)", lineHeight: 1.75, color: C.text, maxWidth: 880, margin: "22px auto 30px", fontStyle: "italic" }}>
                "NOIZY.ai is not building a voice tool. It's building <strong style={{ color: C.accent }}>the emotional and cultural intelligence layer of the entire AI voice industry</strong> — the layer that every other platform will eventually need to license, partner with, or acquire. Because the data isn't scraped. It's earned through <strong style={{ color: C.cyan }}>creative partnership with humans.</strong>"
              </p>
              <div style={{ fontSize: 12, color: C.textDim, marginBottom: 22 }}>— Rob Plowman, Founder, Fish Music Inc. | NOIZY.ai</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {["Honor", "Respect", "Gather", "Nurture", "Preserve"].map((w, i) => (
                  <Bdg key={w} label={w} color={[C.cyan, C.gold, C.green, C.purple, C.accent][i]} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ▸▸ VS ───────────────────────────────────────────── */}
        {tab === "vs" && (
          <div>
            <SH eyebrow="Head to Head" title="NOIZY.ai vs ElevenLabs" body="11 features. Every gap ElevenLabs chose not to fill — and exactly why they made that choice." color={C.gold} />
            <GC color={C.gold} pad={0} sx={{ overflow: "hidden", marginBottom: 28 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.3fr 2fr 2fr", background: C.surface, padding: "14px 26px", borderBottom: `1px solid ${C.border}`, gap: 10 }}>
                {["FEATURE", "ELEVENLABS", "NOIZY.ai ✦"].map((h, i) => <ML key={h} color={i === 2 ? C.accent : C.textDim}>{h}</ML>)}
              </div>
              {VS.map(([feat, el, ec, nz, nc], i) => (
                <div key={feat} style={{ display: "grid", gridTemplateColumns: "1.3fr 2fr 2fr", padding: "13px 26px", borderBottom: i < VS.length - 1 ? `1px solid ${C.border}` : "none", background: i % 2 === 0 ? "transparent" : "#ffffff03", alignItems: "center", gap: 10 }}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: 700, color: C.text }}>{feat}</div>
                  <div style={{ fontSize: 12, color: ec, lineHeight: 1.5 }}>{el}</div>
                  <div style={{ fontSize: 12, color: nc, fontWeight: 700, lineHeight: 1.5 }}>{nz}</div>
                </div>
              ))}
            </GC>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <GC color="#ff4444" pad={30} sx={{ opacity: .72 }}>
                <ML color="#ff5555">ElevenLabs Long Game</ML>
                <div style={{ fontFamily: "'Bebas Neue',serif", fontSize: 54, color: C.text, margin: "10px 0 4px", letterSpacing: 2 }}>$11B</div>
                <div style={{ fontSize: 11, color: C.textMid, marginBottom: 22 }}>Series D. IPO 2027. 85% enterprise revenue.</div>
                {["Racing toward Meta / NVIDIA embedding", "Creator revenue shrinking — 15% and falling", "Text → Audio ceiling becoming visible", "Artists are training data, not partners", "Going wider: video, agents, enterprise", "Cultural intelligence layer: abandoned"].map((l, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 9 }}>
                    <span style={{ color: "#ff5555", flexShrink: 0 }}>✗</span>
                    <span style={{ fontSize: 11, color: C.textMid, lineHeight: 1.6 }}>{l}</span>
                  </div>
                ))}
              </GC>
              <GC color={C.accent} pad={30}>
                <ML color={C.accent}>NOIZY.ai Long Game</ML>
                <div style={{ fontFamily: "'Bebas Neue',serif", fontSize: 54, color: C.text, margin: "10px 0 4px", letterSpacing: 2 }}>CATEGORY 1</div>
                <div style={{ fontSize: 11, color: C.textMid, marginBottom: 22 }}>Cultural intelligence layer. The standard nobody has set yet.</div>
                {["Building WHERE ElevenLabs is moving away from", "Artists are founding partners — 70–75% splits", "Audio-in → Intelligent Response (nobody has this)", "Going deeper into signal intelligence", "Cultural + emotional AI compounding daily", "Honor. Respect. Gather. Nurture. Preserve."].map((l, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 9 }}>
                    <span style={{ color: C.accent, flexShrink: 0 }}>→</span>
                    <span style={{ fontSize: 11, color: C.textMid, lineHeight: 1.6 }}>{l}</span>
                  </div>
                ))}
              </GC>
            </div>
          </div>
        )}

        {/* ▸▸ CULTURE ──────────────────────────────────────── */}
        {tab === "culture" && (
          <div>
            <SH eyebrow="The Moat Nobody Can Cross" title="The Cultural Intelligence Engine" body="200 cultural contexts. 5 performance dimensions. Real-time social language tracking. This is what NOIZY builds that nobody else is attempting." color={C.cyan} />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 13, marginBottom: 48 }}>
              {[
                { n: "01", icon: "🔤", d: "LINGUISTIC SURFACE", desc: "Words, grammar, accent. What everyone else builds. Table stakes.", color: C.textMid },
                { n: "02", icon: "🌊", d: "PROSODIC CULTURE", desc: "Pacing, rhythm, intonation. The emotional architecture of speech.", color: C.cyan },
                { n: "03", icon: "🫀", d: "SOMATIC PERFORMANCE", desc: "How emotions live in the body — chest, throat, breath — and shape voice.", color: C.gold },
                { n: "04", icon: "🎭", d: "SOCIAL REGISTER", desc: "When to shift tone and formality. The character doesn't change — the cultural performance does.", color: C.green },
                { n: "05", icon: "🌀", d: "ADAPTIVE SOCIAL CHANGE", desc: "As slang shifts and movements reshape speech — NOIZY's model updates. Always current.", color: C.accent },
              ].map(d => (
                <GC key={d.n} color={d.color} pad={20}>
                  <div style={{ fontSize: 26, marginBottom: 10 }}>{d.icon}</div>
                  <ML color={d.color}>Dim {d.n}</ML>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 12, fontWeight: 700, color: C.text, margin: "7px 0 8px" }}>{d.d}</div>
                  <div style={{ fontSize: 11, color: C.textMid, lineHeight: 1.7 }}>{d.desc}</div>
                </GC>
              ))}
            </div>

            <SH eyebrow="Regional Intelligence" title="How NOIZY Maps Every Region" color={C.cyan} />
            <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
              {CULTURES.map((c, i) => (
                <button key={i} onClick={() => setCult(i)} style={{
                  background: cult === i ? c.color + "1e" : C.surface,
                  border: `1px solid ${cult === i ? c.color : C.border}`,
                  borderRadius: 11, padding: "9px 16px", cursor: "pointer",
                  color: cult === i ? c.color : C.textMid, fontSize: 11,
                  fontWeight: 700, transition: "all .2s", fontFamily: "'DM Mono',monospace",
                }}>{c.flag} {c.r}</button>
              ))}
            </div>

            {(() => {
              const cu = CULTURES[cult];
              return (
                <GC color={cu.color} pad={0} sx={{ marginBottom: 28 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                    <div style={{ padding: "34px 32px", borderRight: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 52, marginBottom: 14 }}>{cu.flag}</div>
                      <ML color={cu.color}>Region Profile</ML>
                      <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900, color: C.text, margin: "10px 0 18px" }}>{cu.r}</h3>
                      <ML color={C.textDim}>Languages Mapped</ML>
                      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 10, marginBottom: 24 }}>
                        {cu.langs.map(l => <Bdg key={l} label={l} color={cu.color} />)}
                      </div>
                      <div style={{ padding: "16px 18px", background: cu.color + "0e", border: `1px solid ${cu.color}22`, borderRadius: 13 }}>
                        <ML color={cu.color}>NOIZY Advantage</ML>
                        <div style={{ fontSize: 12, color: C.textMid, marginTop: 9, lineHeight: 1.8 }}>{cu.insight}</div>
                      </div>
                    </div>
                    <div style={{ padding: "34px 32px" }}>
                      <ML color={C.textDim}>Emotional Performance Signature</ML>
                      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                        {Object.entries(cu.profile).map(([emo, data]) => (
                          <div key={emo} style={{ padding: "12px 16px", background: C.surface, borderRadius: 11, border: `1px solid ${C.border}` }}>
                            <div style={{ fontSize: 10, color: cu.color, letterSpacing: 3, textTransform: "uppercase", marginBottom: 5 }}>{emo}</div>
                            <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.6, fontStyle: "italic" }}>{data}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </GC>
              );
            })()}

            <SH eyebrow="Acoustic Data" title="How Emotions Sound Across Cultures" color={C.cyan} />
            <GC color={C.cyan} pad={0} sx={{ overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "0.7fr 1.1fr 1.2fr 1.8fr", background: C.surface, padding: "13px 22px", borderBottom: `1px solid ${C.border}`, gap: 10 }}>
                {["EMOTION", "DATA CAPTURED", "WESTERN AI DEFAULT", "WHAT NOIZY KNOWS DIFFERENTLY"].map(h => <ML key={h} color={C.textDim}>{h}</ML>)}
              </div>
              {[
                ["Grief", "Pitch drop, breath, tempo collapse", "Private, contained — stays personal", "Communal in West Africa. Silent in Japan. Embodied in Mediterranean cultures."],
                ["Authority", "Vocal fry, pace, pause, chest resonance", "Slow American cadence — the 'CEO voice'", "Elder-centered in West Africa. Rapid in Brazil. Controlled throat-breath in Mandarin."],
                ["Warmth", "Upward inflection, resonance, softening", "Friendly upspeak with verbal affirmations", "Chest-physical in Italy. Underplayed British. Expansive and communal Nigerian."],
                ["Humor", "Timing, tonal shift, deadpan vs performative", "Ironic detachment or broad physical comedy", "Dry understatement (British). Performative energy (Nigerian). Tonal wordplay (Japanese)."],
                ["Reverence", "Volume drop, pace slow, formality shift", "Quiet, slowed, register lowered uniformly", "Religious, professional, elder reverence — acoustically distinct per culture. Never interchangeable."],
              ].map(([e, d, w, n], i) => (
                <div key={e} style={{ display: "grid", gridTemplateColumns: "0.7fr 1.1fr 1.2fr 1.8fr", padding: "13px 22px", borderBottom: i < 4 ? `1px solid ${C.border}` : "none", background: i % 2 === 0 ? "transparent" : "#ffffff02", gap: 10, alignItems: "start" }}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: 700, color: C.cyan }}>{e}</div>
                  <div style={{ fontSize: 11, color: C.textMid, lineHeight: 1.6 }}>{d}</div>
                  <div style={{ fontSize: 11, color: "#ff7070", lineHeight: 1.6 }}>{w}</div>
                  <div style={{ fontSize: 11, color: C.text, lineHeight: 1.6 }}>{n}</div>
                </div>
              ))}
            </GC>
          </div>
        )}

        {/* ▸▸ DREAMERS ─────────────────────────────────────── */}
        {tab === "dreamers" && (
          <div>
            <SH eyebrow="The Dreamer Economy" title="Subscription Tiers Built for Artists" body="The longer you stay, the more powerful your persona becomes. The lock-in no competitor can copy." color={C.purple} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 18, marginBottom: 48 }}>
              {TIERS.map((t, i) => (
                <div key={t.name} className="gcard" style={{ background: C.card, border: `2px solid ${i === 3 ? t.color : C.border}`, borderRadius: 22, padding: 28, position: "relative", boxShadow: i === 3 ? `0 0 70px ${t.color}16` : "none" }}>
                  {t.tag && <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: t.color, borderRadius: 100, padding: "4px 16px", fontSize: 9, fontWeight: 800, letterSpacing: 3, color: [C.gold].includes(t.color) ? "#000" : "#fff", textTransform: "uppercase", whiteSpace: "nowrap", fontFamily: "'DM Mono',monospace" }}>{t.tag}</div>}
                  <ML color={t.color}>{t.name}</ML>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "14px 0 18px" }}>
                    <span style={{ fontFamily: "'Bebas Neue',serif", fontSize: 58, color: C.text, lineHeight: 1, letterSpacing: 1 }}>{t.price}</span>
                    {t.per && <span style={{ fontSize: 12, color: C.textMid }}>{t.per}</span>}
                  </div>
                  <div style={{ height: 1, background: `linear-gradient(to right,${t.color}44,transparent)`, marginBottom: 18 }} />
                  {t.feats.map(f => (
                    <div key={f} style={{ display: "flex", gap: 10, marginBottom: 11 }}>
                      <span style={{ color: t.color, flexShrink: 0, fontSize: 10 }}>◆</span>
                      <span style={{ fontSize: 12, color: C.textMid, lineHeight: 1.6 }}>{f}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <GC color={C.purple} pad={36}>
              <ML color={C.purple}>The Compounding Flywheel</ML>
              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, margin: "20px 0 20px", justifyContent: "center" }}>
                {["Dreamers Create", "→", "List on NOIZYFISH", "→", "Devs Buy", "→", "Devs Join", "→", "Game Audio Created", "→", "Listed on NOIZYFISH", "→", "Cycle Compounds"].map((item, i) => (
                  <div key={i} style={{ background: item === "→" ? "transparent" : C.surface, border: item === "→" ? "none" : `1px solid ${C.border}`, borderRadius: 7, padding: item === "→" ? "0 3px" : "7px 12px", fontSize: item === "→" ? 16 : 10, color: item === "→" ? C.purple : C.textMid }}>{item}</div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: C.textMid, lineHeight: 1.9, textAlign: "center" }}>Every user is simultaneously a <strong style={{ color: C.text }}>customer AND a supplier.</strong> The Roblox model — applied to AI creative audio and cultural intelligence.</p>
            </GC>
          </div>
        )}

        {/* ▸▸ REVENUE CALCULATOR ───────────────────────────── */}
        {tab === "calc" && (
          <div>
            <SH eyebrow="Revenue Model" title="Interactive Revenue Calculator" body="Drag the sliders to model NOIZY.ai monthly recurring revenue at different subscriber mixes." color={C.green} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
              <GC color={C.green} pad={34}>
                <ML color={C.green}>Adjust Subscriber Counts</ML>
                <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 26 }}>
                  {[
                    { label: "Dreamer ($15/mo)", val: dreamer, set: setDreamer, color: C.cyan, max: 500, rev: dreamer * 15 },
                    { label: "Dreamer Pro ($35/mo)", val: pro, set: setPro, color: C.gold, max: 300, rev: pro * 35 },
                    { label: "Dreamer Studio ($99/mo)", val: studio, set: setStudio, color: C.accent, max: 100, rev: studio * 99 },
                  ].map(s => (
                    <div key={s.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 9 }}>
                        <span style={{ fontSize: 11, color: C.textMid }}>{s.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.val} users → ${s.rev.toLocaleString()}/mo</span>
                      </div>
                      <input type="range" min={0} max={s.max} value={s.val} onChange={e => s.set(+e.target.value)}
                        style={{ width: "100%", accentColor: s.color, background: `linear-gradient(to right,${s.color} ${s.val / s.max * 100}%,${C.border} ${s.val / s.max * 100}%)` }} />
                    </div>
                  ))}
                  <div style={{ padding: "14px 16px", background: C.surface, borderRadius: 11, border: `1px solid ${C.border}` }}>
                    <ML color={C.textDim}>Free Tier (Funnel Top)</ML>
                    <div style={{ fontSize: 20, color: C.textMid, marginTop: 6, fontFamily: "'Bebas Neue',serif", letterSpacing: 1 }}>{seed.toLocaleString()} members estimated</div>
                  </div>
                </div>
              </GC>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { l: "Total Community", v: total.toLocaleString(), u: "members", c: C.textMid },
                  { l: "Subscription Revenue", v: `$${subRev.toLocaleString()}`, u: "/month", c: C.cyan },
                  { l: "Marketplace Revenue", v: `$${mktRev.toLocaleString()}`, u: "/month (est.)", c: C.gold },
                  { l: "Monthly Recurring Revenue", v: `$${mrr.toLocaleString()}`, u: "/month", c: C.green },
                  { l: "Annual Run Rate", v: `$${(mrr * 12).toLocaleString()}`, u: "/year", c: C.accent },
                ].map(r => (
                  <GC key={r.l} color={r.c} pad={20}>
                    <ML color={r.c}>{r.l}</ML>
                    <div style={{ fontFamily: "'Bebas Neue',serif", fontSize: 40, color: C.text, lineHeight: 1, marginTop: 8, letterSpacing: 1 }}>{r.v}</div>
                    <div style={{ fontSize: 10, color: C.textDim, marginTop: 3 }}>{r.u}</div>
                  </GC>
                ))}
              </div>
            </div>
            <GC color={C.gold} pad={32} sx={{ marginTop: 22 }}>
              <ML color={C.gold}>Revenue Trajectory — Realistic Milestones</ML>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12, marginTop: 22 }}>
                {[["MO 1", "10 Dreamers", "$150"], ["MO 3", "100 Dreamers", "$1,500"], ["MO 6", "500 Dreamers", "$10K"], ["MO 12", "2,500 Dreamers", "$50K"], ["YR 2", "12,000 Dreamers", "$250K"], ["YR 3", "API + Enterprise", "$2M+"]].map(([t, u, r]) => (
                  <div key={t} style={{ background: C.surface, borderRadius: 12, padding: 16, textAlign: "center", border: `1px solid ${C.border}` }}>
                    <ML color={C.textFaint}>{t}</ML>
                    <div style={{ fontSize: 11, color: C.textMid, margin: "7px 0 5px", lineHeight: 1.4 }}>{u}</div>
                    <div style={{ fontFamily: "'Bebas Neue',serif", fontSize: 24, color: C.gold, letterSpacing: 1 }}>{r}</div>
                  </div>
                ))}
              </div>
            </GC>
          </div>
        )}

        {/* ▸▸ VSI ──────────────────────────────────────────── */}
        {tab === "vsi" && (
          <div>
            <SH eyebrow="Priority Partnership" title="VSI London — The Dream Deal" body="720 people. 80+ languages. Netflix, Disney, and Prime Video preferred vendor. A new Director of Technology who came from an AI dubbing company." color={C.teal} />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12, marginBottom: 36 }}>
              {[["720", "People"], ["80+", "Languages"], ["36yr", "Operating"], ["28", "Offices"], ["200K+", "Hours/Year"], ["Netflix", "Preferred Vendor"]].map(([n, l]) => (
                <div key={l} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 13, padding: 16, textAlign: "center" }}>
                  <div style={{ fontFamily: "'Bebas Neue',serif", fontSize: 28, color: C.teal, letterSpacing: 1 }}>{n}</div>
                  <div style={{ fontSize: 10, color: C.textDim, marginTop: 4, lineHeight: 1.4 }}>{l}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: 16, marginBottom: 36 }}>
              {VSI_PEOPLE.map((p, i) => (
                <GC key={p.name} color={p.color} pad={26}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ fontFamily: "'Bebas Neue',serif", fontSize: 44, color: p.color, letterSpacing: 1, lineHeight: 1 }}>{String(i + 1).padStart(2, "0")}</div>
                    <Bdg label={p.status} color={p.color} />
                  </div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: p.color, marginBottom: 12, letterSpacing: 1 }}>{p.role}</div>
                  <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7, fontStyle: "italic" }}>{p.note}</div>
                </GC>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 28 }}>
              <GC color={C.teal} pad={26}>
                <ML color={C.teal}>Contact Intelligence</ML>
                <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                  {[["Primary (Dimitri)", "dimitri.konovalov@vsi.tv"], ["CTO Direct", "scott.rose@vsi.tv"], ["Partnership", "meet@vsi.tv"], ["Marketing", "sarah.goff@vsi.tv"], ["HQ Phone", "+44 207 692 7700"]].map(([l, v]) => (
                    <div key={l} style={{ padding: "10px 14px", background: C.surface, borderRadius: 9, border: `1px solid ${C.border}` }}>
                      <ML color={C.textDim}>{l}</ML>
                      <div style={{ fontSize: 12, color: C.teal, marginTop: 5 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </GC>
              <GC color={C.gold} pad={26}>
                <ML color={C.gold}>3-Week Outreach Sequence</ML>
                <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                  {[["Day 1", "LinkedIn connect — Dimitri + Scott. No message yet. Let them see your profile."], ["Day 3", "Email Dimitri — Direct & Bold. Subject line is the hook."], ["Day 5", "Email Scott Rose — mirror his NAB words back at him."], ["Day 7", "LinkedIn DM both — mention the email, offer 2-min audio clip."], ["Day 10", "Email meet@vsi.tv + CC Sarah Goff — shows traction."], ["Day 14", "Drop the 60-second demo. No explanation. Just press play."]].map(([d, v]) => (
                    <div key={d} style={{ display: "flex", gap: 10, padding: "9px 12px", background: C.surface, borderRadius: 9, border: `1px solid ${C.border}` }}>
                      <span style={{ color: C.gold, fontSize: 10, flexShrink: 0, minWidth: 32 }}>{d}</span>
                      <span style={{ fontSize: 11, color: C.textMid, lineHeight: 1.6 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </GC>
            </div>

            <GC color={C.teal} pad={40} sx={{ textAlign: "center" }}>
              <ML color={C.teal}>The VSI Pitch — 3 Sentences</ML>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(15px,2.5vw,22px)", lineHeight: 1.85, color: C.text, maxWidth: 840, margin: "22px auto", fontStyle: "italic" }}>
                "VSI has 36 years of cultural excellence and 720 humans who understand language. NOIZY has the AI layer that tells those humans — and the AI voice actors working alongside them — exactly how a character should feel, breathe, and perform in every culture on Earth, in real time. Together, VSI delivers <strong style={{ color: C.teal }}>20 languages in the time it used to take to deliver 5.</strong>"
              </p>
            </GC>
          </div>
        )}

        {/* ▸▸ TECH ─────────────────────────────────────────── */}
        {tab === "tech" && (
          <div>
            <SH eyebrow="Architecture" title="The Technical Stack" body="Every layer is a competitive moat. Built on GOD — Mac Studio M2 Ultra, 192GB RAM." color={C.orange} />
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 44 }}>
              {TECH.map(layer => (
                <GC key={layer.layer} color={layer.color} pad={0}>
                  <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ minWidth: 170, flexShrink: 0, padding: "18px 22px", borderRight: `1px solid ${C.border}` }}>
                      <ML color={layer.color}>{layer.layer}</ML>
                    </div>
                    <div style={{ display: "flex", gap: 9, flex: 1, flexWrap: "wrap", padding: "14px 20px" }}>
                      {layer.items.map(item => (
                        <div key={item.n} style={{ background: layer.color + "0f", border: `1px solid ${layer.color}22`, borderRadius: 9, padding: "9px 14px" }}>
                          <div style={{ fontSize: 12, color: layer.color, fontWeight: 700, marginBottom: 2 }}>{item.n}</div>
                          <div style={{ fontSize: 10, color: C.textDim }}>{item.d}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </GC>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12, marginBottom: 28 }}>
              {[["60+", "CF Workers Built"], ["11", "D1 Databases"], ["20", "KV Namespaces"], ["34TB", "AQUARIUM Archive"], ["40yr", "Creative Catalog"], ["192GB", "GOD Machine RAM"]].map(([n, l]) => (
                <div key={l} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 13, padding: 18, textAlign: "center" }}>
                  <div style={{ fontFamily: "'Bebas Neue',serif", fontSize: 30, color: C.orange, letterSpacing: 1 }}>{n}</div>
                  <div style={{ fontSize: 10, color: C.textDim, marginTop: 5, lineHeight: 1.4 }}>{l}</div>
                </div>
              ))}
            </div>

            <GC color={C.gold} pad={28}>
              <ML color={C.gold}>The Librosa Signal Pipeline</ML>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginTop: 20 }}>
                {[["SPECTRAL ANALYSIS", C.cyan], ["EMOTIONAL MAPPING", C.gold], ["CULTURAL OUTPUT", C.green]].map(([label, color]) => (
                  <div key={label} style={{ background: C.surface, borderRadius: 11, padding: "14px 14px 11px", border: `1px solid ${C.border}` }}>
                    <Wave color={color} bars={22} h={44} />
                    <div style={{ marginTop: 8 }}><ML color={color}>{label}</ML></div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11, color: C.textDim, lineHeight: 1.9, marginTop: 18, textAlign: "center" }}>Audio enters as signal → Librosa extracts spectral features → Claude maps to cultural emotional context → ElevenLabs generates the culturally-calibrated performance. Nobody else has this pipeline.</p>
            </GC>
          </div>
        )}

        {/* ▸▸ ROADMAP ──────────────────────────────────────── */}
        {tab === "roadmap" && (
          <div>
            <SH eyebrow="90 Days to World" title="From Proof of Concept to Category Dominance" body="Five phases. One unstoppable direction. The cultural voice AI standard for the entire planet." color={C.cyan} />
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 32, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom,${C.cyan},${C.gold},${C.green},${C.purple},${C.accent})`, opacity: .28, borderRadius: 2 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {ROADMAP.map((phase, i) => (
                  <div key={phase.p} style={{ display: "flex", gap: 22 }}>
                    <div style={{ flexShrink: 0, width: 64, height: 64, borderRadius: "50%", background: `radial-gradient(${phase.color},${phase.color}66)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1, boxShadow: `0 0 28px ${phase.color}38` }}>
                      <span style={{ fontFamily: "'Bebas Neue',serif", fontSize: 22, color: [C.gold, C.green].includes(phase.color) ? "#000" : "#fff", letterSpacing: 1 }}>{phase.p}</span>
                    </div>
                    <GC color={phase.color} pad={26} sx={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 9, flexWrap: "wrap" }}>
                        <Bdg label={`Phase ${phase.p}`} color={phase.color} />
                        <span style={{ fontSize: 10, color: C.textDim }}>— {phase.time}</span>
                      </div>
                      <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, color: C.text, margin: "0 0 18px" }}>{phase.title}</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 8 }}>
                        {phase.items.map(item => (
                          <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <span style={{ color: phase.color, flexShrink: 0, marginTop: 2, fontSize: 10 }}>◆</span>
                            <span style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7 }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </GC>
                  </div>
                ))}
              </div>
            </div>
            <GC color={C.accent} pad={44} sx={{ marginTop: 36, textAlign: "center" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(to right,transparent,${C.accent},${C.cyan},transparent)`, borderRadius: "20px 20px 0 0" }} />
              <ML color={C.accent}>Year 3 Vision</ML>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(17px,2.5vw,28px)", color: C.text, margin: "20px auto", maxWidth: 780, lineHeight: 1.65, fontStyle: "italic" }}>
                "NOIZY is not a contender. NOIZY is <strong style={{ color: C.accent }}>the standard.</strong> The cultural voice AI layer that every platform — including ElevenLabs — needs to license, partner with, or acquire."
              </p>
            </GC>
          </div>
        )}

        {/* ▸▸ ALEX ─────────────────────────────────────────── */}
        {tab === "alex" && (
          <div>
            <SH eyebrow="The Investment Ask" title={`Alex's 24-Month Runway — $${alex24.toLocaleString()}`} body="Every tool. Every cost. Every reason. Completely transparent. This is not a donation. It's a runway purchase." color={C.gold} />
            <GC color={C.gold} pad={0} sx={{ overflow: "hidden", marginBottom: 26 }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr .7fr .9fr 2.5fr", background: C.surface, padding: "13px 26px", borderBottom: `1px solid ${C.border}`, gap: 10 }}>
                {["TOOL", "MO", "ANNUAL", "WHY NOIZY NEEDS IT"].map(h => <ML key={h} color={C.textDim}>{h}</ML>)}
              </div>
              {ALEX.map((item, i) => (
                <div key={item.t} style={{ display: "grid", gridTemplateColumns: "2fr .7fr .9fr 2.5fr", padding: "12px 26px", borderBottom: i < ALEX.length - 1 ? `1px solid ${C.border}` : "none", background: i % 2 === 0 ? "transparent" : "#ffffff02", alignItems: "center", gap: 10 }}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: 700, color: C.text }}>{item.t}</div>
                  <div style={{ fontSize: 12, color: C.textDim }}>${item.m}</div>
                  <div style={{ fontSize: 12, color: C.gold, fontWeight: 700 }}>${item.m * 12}</div>
                  <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.6 }}>{item.note}</div>
                </div>
              ))}
            </GC>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 28 }}>
              {[{ l: "Monthly Stack", v: `$${alexMonthly}`, c: C.cyan }, { l: "12-Month Prepay", v: `$${alex12.toLocaleString()}`, c: C.gold }, { l: "24-Month Prepay", v: `$${alex24.toLocaleString()}`, c: C.accent }, { l: "Daily Cost", v: `$${Math.round(alexMonthly / 30)}`, c: C.green }].map(s => (
                <GC key={s.l} color={s.c} pad={22} sx={{ textAlign: "center" }}>
                  <ML color={s.c}>{s.l}</ML>
                  <div style={{ fontFamily: "'Bebas Neue',serif", fontSize: 42, color: C.text, lineHeight: 1, margin: "9px 0 3px", letterSpacing: 1 }}>{s.v}</div>
                </GC>
              ))}
            </div>
            <GC color={C.gold} pad={48} sx={{ textAlign: "center" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(to right,transparent,${C.gold},transparent)` }} />
              <ML color={C.gold}>The Alex Pitch — 60 Seconds</ML>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(16px,2.5vw,22px)", lineHeight: 1.85, color: C.text, maxWidth: 800, margin: "22px auto 32px", fontStyle: "italic" }}>
                "${alex24.toLocaleString()} for 24 months keeps NOIZY.ai's complete creative AI stack alive — every tool needed to build the platform, prove the concept, land VSI London, and show the world what a real AI creative partnership looks like. This is not a donation. It's a <strong style={{ color: C.gold }}>runway purchase.</strong> The category doesn't exist yet. We're building it."
              </p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {["24 months uninterrupted building", "Zero subscription anxiety", "VSI demo ready in 90 days", "Full proof-of-concept stack", "Credibility for next investor"].map(b => (
                  <Bdg key={b} label={b} color={C.gold} />
                ))}
              </div>
            </GC>
          </div>
        )}

        {/* ▸▸ EMAIL ────────────────────────────────────────── */}
        {tab === "email" && (
          <div>
            <SH eyebrow="VSI Outreach — Ready to Send" title="Four Versions. One Goal. Get the Meeting." body="Pick your approach. All four are finalized and ready. Add your name, hit send." color={C.pink} />

            <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
              {EMAILS.map((v, i) => (
                <button key={i} onClick={() => setEmailIdx(i)} style={{
                  background: emailIdx === i ? C.pink + "1e" : C.surface,
                  border: `1px solid ${emailIdx === i ? C.pink : C.border}`,
                  borderRadius: 11, padding: "9px 16px", cursor: "pointer",
                  color: emailIdx === i ? C.pink : C.textMid,
                  fontSize: 11, fontWeight: 700, transition: "all .2s",
                  fontFamily: "'DM Mono',monospace",
                }}>{String(i + 1).padStart(2, "0")} — {v.label}</button>
              ))}
            </div>

            <GC color={C.pink} pad={0} sx={{ marginBottom: 24 }}>
              <div style={{ padding: "18px 26px", background: C.surface, borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                  <ML color={C.textDim}>TO:</ML>
                  <span style={{ fontSize: 12, color: C.teal }}>{EMAILS[emailIdx].target}</span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <ML color={C.textDim}>SUBJECT:</ML>
                  <span style={{ fontSize: 12, color: C.text, fontStyle: "italic", lineHeight: 1.5 }}>{EMAILS[emailIdx].subject}</span>
                </div>
              </div>
              <div style={{ padding: "26px 26px" }}>
                <pre style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: C.textMid, lineHeight: 1.95, whiteSpace: "pre-wrap", margin: 0 }}>
                  {EMAILS[emailIdx].body}
                </pre>
              </div>
              <div style={{ padding: "14px 26px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 10, alignItems: "center" }}>
                <button onClick={copyEmail} style={{ background: copied ? C.green : C.pink, border: "none", borderRadius: 9, padding: "10px 20px", cursor: "pointer", fontSize: 11, fontWeight: 800, color: copied ? "#000" : "#fff", fontFamily: "'DM Mono',monospace", letterSpacing: 1, transition: "all .2s" }}>
                  {copied ? "✓ COPIED" : "COPY EMAIL"}
                </button>
                <span style={{ fontSize: 11, color: C.textDim }}>Ready to paste into Gmail, Apple Mail, or Outlook</span>
              </div>
            </GC>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <GC color={C.green} pad={26}>
                <ML color={C.green}>Before You Hit Send</ML>
                <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 9 }}>
                  {["LinkedIn connect with Dimitri 48hrs before emailing", "Verify dimitri.konovalov@vsi.tv — standard VSI format", "Send Tuesday or Wednesday, 9–11am London time (GMT)", "Make sure NOIZY.ai is front and centre on your LinkedIn", "NOIZYFISH.com must be live — they will check it", "Have a demo clip ready to send on Day 14"].map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 9, padding: "9px 12px", background: C.surface, borderRadius: 9, border: `1px solid ${C.border}` }}>
                      <span style={{ color: C.green, flexShrink: 0, fontSize: 10, marginTop: 1 }}>◆</span>
                      <span style={{ fontSize: 11, color: C.textMid, lineHeight: 1.6 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </GC>
              <GC color={C.cyan} pad={26}>
                <ML color={C.cyan}>No Reply After 5 Days — Exact Words</ML>
                <div style={{ marginTop: 18 }}>
                  <div style={{ padding: "18px 18px", background: C.surface, borderRadius: 11, border: `1px solid ${C.border}`, marginBottom: 14 }}>
                    <ML color={C.textDim}>LinkedIn DM</ML>
                    <div style={{ fontSize: 12, color: C.text, marginTop: 10, lineHeight: 1.9, fontStyle: "italic" }}>"Hi Dimitri — sent you an email about NOIZY.ai a few days ago. Just wanted to make sure it didn't land in the wrong folder. Happy to send a 2-minute audio clip if easier than a call."</div>
                  </div>
                  <div style={{ padding: "16px 18px", background: C.surface, borderRadius: 11, border: `1px solid ${C.border}` }}>
                    <ML color={C.textDim}>The 60-Second Demo</ML>
                    <div style={{ fontSize: 11, color: C.textMid, marginTop: 9, lineHeight: 1.85 }}>Same film scene. Three languages. Standard AI dub first — then NOIZY's cultural adaptation layer. Play them side by side. No explanation. Just press play. That's the meeting.</div>
                  </div>
                </div>
              </GC>
            </div>
          </div>
        )}

      </div>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "44px 28px", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(to right,transparent,${C.accent}55,${C.cyan}44,${C.gold}44,transparent)` }} />
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14, opacity: .4 }}>
          <Wave color={C.accent} bars={80} h={28} />
        </div>
        <ML color={C.textFaint}>GORUNFREEX1000</ML>
        <div style={{ display: "flex", gap: 7, justifyContent: "center", flexWrap: "wrap", margin: "14px 0" }}>
          {["NOIZY.ai", "NOIZYFISH.com", "NOIZYVOX", "NOIZYKIDZ", "NOIZYLAB", "LIFELUV", "Fish Music Inc."].map((b, i) => (
            <Bdg key={b} label={b} color={[C.accent, C.cyan, C.gold, C.green, C.purple, C.orange, C.teal][i]} />
          ))}
        </div>
        <div style={{ fontSize: 10, color: C.textFaint }}>Honor · Respect · Gather · Nurture · Preserve — Rob Plowman, Fish Music Inc. Est. 1996</div>
        <div style={{ fontSize: 10, color: C.textFaint, marginTop: 4 }}>THE AQUARIUM — 40 Years · 34TB · MC96ECOUNIVERSE</div>
      </div>
    </div>
  );
}
