import { useState } from "react";

const COLORS = {
  bg: "#080810",
  surface: "#0e0e1a",
  card: "#13131f",
  border: "#1e1e32",
  accent: "#ff3c6e",
  accentDim: "#ff3c6e22",
  gold: "#f0c040",
  goldDim: "#f0c04018",
  cyan: "#00e5ff",
  cyanDim: "#00e5ff18",
  green: "#00ff94",
  greenDim: "#00ff9418",
  purple: "#b060ff",
  purpleDim: "#b060ff18",
  text: "#f0f0ff",
  textDim: "#8888aa",
  textFaint: "#444466",
};

const pillars = [
  {
    icon: "🎭",
    color: COLORS.accent,
    dim: COLORS.accentDim,
    title: "INTUITIVE AI VOICE ACTORS",
    sub: "Characters That Live Inside Cultures",
    points: [
      "5 Dimensions of Cultural Voice Performance",
      "Acoustic Emotional Fingerprint Engine",
      "Somatic Performance Mapping (80+ cultures)",
      "Adaptive Real-Time Social Change tracking",
      "Signal-native — Librosa, not token-based",
    ],
    vs: "ElevenLabs clones voices. NOIZY performs culture.",
  },
  {
    icon: "🧠",
    color: COLORS.cyan,
    dim: COLORS.cyanDim,
    title: "THE DREAMER PERSONA ENGINE",
    sub: "Your Creative Identity — Forever Growing",
    points: [
      "AI persona that learns YOUR creative voice",
      "Accumulates taste, style, history over time",
      "Persona-to-persona collaboration",
      "Pinecone vector memory — never forgets",
      "The longer you stay, the more valuable it gets",
    ],
    vs: "ElevenLabs has no memory of you. NOIZY becomes you.",
  },
  {
    icon: "🎵",
    color: COLORS.gold,
    dim: COLORS.goldDim,
    title: "SIGNAL-REACTIVE AUDIO ENGINE",
    sub: "Audio That Listens & Responds",
    points: [
      "Librosa spectral analysis — BPM, key, timbre",
      "SFX that matches your mix's acoustic fingerprint",
      "Adaptive game audio in real-time",
      "Music-reactive voice generation",
      "Onset detection → sync to any track",
    ],
    vs: "ElevenLabs is text-in, audio-out. NOIZY hears the room.",
  },
  {
    icon: "🌍",
    color: COLORS.green,
    dim: COLORS.greenDim,
    title: "THE LIVING KNOWLEDGE ARCHIVE",
    sub: "40 Years of Human Creativity + All of History",
    points: [
      "Complete music theory — all global traditions",
      "Film history & sound design from birth to now",
      "Art history across ALL cultures (not just Western)",
      "Cultural performance data — 200 cultural contexts",
      "Daily updates — social language evolves, so does NOIZY",
    ],
    vs: "ElevenLabs teaches nothing. NOIZY makes you a master.",
  },
  {
    icon: "💰",
    color: COLORS.purple,
    dim: COLORS.purpleDim,
    title: "ARTIST-FIRST REVENUE MODEL",
    sub: "75/25 Splits. Artists Win. Always.",
    points: [
      "70% revenue to creators on NOIZYFISH marketplace",
      "NOIZYVOX guild — 75/25 voice acting splits",
      "Dreamers supply AND consume the marketplace",
      "Sync licensing portal — zero copyright risk",
      "Streaming royalty pass-through via DistroKid",
    ],
    vs: "ElevenLabs extracts from artists. NOIZY pays them.",
  },
];

const tiers = [
  { name: "DREAMER SEED", price: "FREE", color: COLORS.textDim, features: ["Basic persona creation", "Community access", "Daily culture drops", "Limited history queries"] },
  { name: "DREAMER", price: "$15", color: COLORS.cyan, features: ["Full persona development", "Deep music/art/film history", "Librosa audio analysis", "Create + learn simultaneously"] },
  { name: "DREAMER PRO", price: "$35", color: COLORS.gold, features: ["Signal-reactive audio tools", "Persona-to-persona collab", "Master classes", "Full SFX generator"] },
  { name: "DREAMER STUDIO", price: "$99", color: COLORS.accent, features: ["Commercial rights", "White-label persona", "DAW integration", "API access"] },
];

const vs = [
  { feature: "Voice Generation", eleven: "✓ Text → Voice", noizy: "✓ Signal-aware Cultural Performance" },
  { feature: "Cultural Adaptation", eleven: "✗ None", noizy: "✓ 200 Cultural Contexts" },
  { feature: "Artist Memory", eleven: "✗ Starts from zero every time", noizy: "✓ Persona grows forever" },
  { feature: "Music Reactivity", eleven: "✗ None", noizy: "✓ Librosa real-time analysis" },
  { feature: "Teaching / Education", eleven: "✗ None", noizy: "✓ Complete creative history" },
  { feature: "Revenue for Artists", eleven: "✗ None", noizy: "✓ 70-75% splits" },
  { feature: "SFX Intelligence", eleven: "✓ Text → SFX", noizy: "✓ Mix-matched acoustic SFX" },
  { feature: "Game Audio", eleven: "✗ Static generation", noizy: "✓ Adaptive real-time engine" },
  { feature: "Community", eleven: "✓ Basic Discord", noizy: "✓ AI-powered Dreamer Universe" },
  { feature: "Persona Collaboration", eleven: "✗ None", noizy: "✓ Persona × Persona creation" },
  { feature: "Long Game", eleven: "IPO / Enterprise only", noizy: "✓ Artists first, always" },
];

const techStack = [
  { layer: "BRAIN", tools: ["Claude Sonnet 4.6 (Reasoning)", "Pinecone (Vector Memory)", "Anthropic API (Dreamer Personas)"], color: COLORS.cyan },
  { layer: "AUDIO SIGNAL", tools: ["Librosa (Spectral Analysis)", "ElevenLabs API (Voice Gen)", "Suno (Music Generation)"], color: COLORS.gold },
  { layer: "CULTURE ENGINE", tools: ["Custom Cultural Dataset (200 contexts)", "Real-time Social Feed Ingestion", "Academic Research Pipeline"], color: COLORS.green },
  { layer: "COMMUNITY", tools: ["Discord MCP + Claude Bot", "n8n Workflow Automation", "LaunchPass (Subscriptions)"], color: COLORS.purple },
  { layer: "MARKETPLACE", tools: ["NOIZYFISH.com (Asset Hub)", "DistroKid (Royalty Routing)", "Sync Licensing Portal"], color: COLORS.accent },
];

const roadmap = [
  { phase: "PHASE 1", time: "Month 1–3", title: "Proof of Concept", color: COLORS.cyan, items: ["60-second cultural voice demo (VSI pitch)", "Dreamer persona MVP on Discord", "NOIZYFISH.com goes live", "10 paying Dreamers"] },
  { phase: "PHASE 2", time: "Month 3–6", title: "Community Launch", color: COLORS.gold, items: ["Discord server fully live with all AI layers", "Librosa audio analysis in Discord bot", "LaunchPass subscriptions active", "100 paying Dreamers"] },
  { phase: "PHASE 3", time: "Month 6–12", title: "Platform Build", color: COLORS.green, items: ["VSI partnership secured", "Unity/Unreal plugin alpha", "NOIZYFISH marketplace open", "500 paying Dreamers — $10K MRR"] },
  { phase: "PHASE 4", time: "Year 2", title: "World Scale", color: COLORS.purple, items: ["Latin America & West Africa expansion", "API white-label for publishers", "Game studio partnerships live", "3,000 Dreamers — $75K MRR"] },
  { phase: "PHASE 5", time: "Year 3", title: "Category Dominance", color: COLORS.accent, items: ["The cultural voice AI layer for all platforms", "UNESCO endangered language preservation", "Series A raise", "$2M+ MRR"] },
];

export default function NOIZYSystem() {
  const [activeTab, setActiveTab] = useState("pillars");
  const tabs = [
    { id: "pillars", label: "🔥 THE SYSTEM" },
    { id: "vs", label: "⚔️ VS ELEVENLABS" },
    { id: "tiers", label: "💎 TIERS" },
    { id: "tech", label: "🛠️ STACK" },
    { id: "roadmap", label: "🗺️ ROADMAP" },
  ];

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'Georgia', 'Times New Roman', serif", color: COLORS.text, overflowX: "hidden" }}>
      {/* HERO */}
      <div style={{ position: "relative", padding: "60px 24px 48px", textAlign: "center", borderBottom: `1px solid ${COLORS.border}` }}>
        {/* Background grid */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px", pointerEvents: "none"
        }} />
        {/* Glow orbs */}
        <div style={{ position: "absolute", top: 0, left: "20%", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(${COLORS.accent}22, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, right: "20%", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(${COLORS.cyan}18, transparent 70%)`, pointerEvents: "none" }} />

        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 11, letterSpacing: 8, color: COLORS.accent, marginBottom: 16, textTransform: "uppercase" }}>Fish Music Inc. × NOIZY.ai</div>
          <h1 style={{ fontSize: "clamp(36px, 7vw, 80px)", fontWeight: 900, margin: "0 0 8px", lineHeight: 1, fontFamily: "'Georgia', serif", letterSpacing: -2 }}>
            <span style={{ color: COLORS.text }}>THE SYSTEM THAT</span><br />
            <span style={{ color: COLORS.accent }}>SERVES ARTISTS</span><br />
            <span style={{ color: COLORS.text }}>BETTER THAN</span><br />
            <span style={{ background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ELEVENLABS</span>
          </h1>
          <p style={{ fontSize: 18, color: COLORS.textDim, maxWidth: 640, margin: "24px auto 0", lineHeight: 1.7 }}>
            ElevenLabs makes voices. <strong style={{ color: COLORS.text }}>NOIZY.ai makes voices that understand what it means to be human in 200 different cultural contexts</strong> — and pays artists for it.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
            {[["🌍", "200 Cultures"], ["🎭", "AI Voice Actors"], ["🧠", "Dreamer Personas"], ["💰", "75/25 Artist Splits"], ["🎵", "Signal-Reactive Audio"]].map(([icon, label]) => (
              <div key={label} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 100, padding: "8px 16px", fontSize: 13, color: COLORS.textDim }}>
                {icon} {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: 4, padding: "16px 24px", borderBottom: `1px solid ${COLORS.border}`, overflowX: "auto", flexWrap: "nowrap" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            background: activeTab === t.id ? COLORS.accent : COLORS.surface,
            color: activeTab === t.id ? "#fff" : COLORS.textDim,
            border: `1px solid ${activeTab === t.id ? COLORS.accent : COLORS.border}`,
            borderRadius: 8, padding: "10px 18px", cursor: "pointer", fontSize: 13,
            fontWeight: 700, whiteSpace: "nowrap", letterSpacing: 0.5,
            transition: "all 0.15s"
          }}>{t.label}</button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* PILLARS */}
        {activeTab === "pillars" && (
          <div>
            <SectionHeader title="THE 5 PILLARS" sub="Every pillar is a gap ElevenLabs left open. NOIZY fills them all." />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
              {pillars.map(p => (
                <div key={p.title} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 28, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, right: 0, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(${p.dim}, transparent 70%)`, pointerEvents: "none" }} />
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{p.icon}</div>
                  <div style={{ fontSize: 11, letterSpacing: 4, color: p.color, marginBottom: 6, textTransform: "uppercase" }}>{p.title}</div>
                  <div style={{ fontSize: 15, color: COLORS.textDim, marginBottom: 20, fontStyle: "italic" }}>{p.sub}</div>
                  {p.points.map(pt => (
                    <div key={pt} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                      <span style={{ color: p.color, fontSize: 14, marginTop: 2, flexShrink: 0 }}>→</span>
                      <span style={{ fontSize: 14, color: COLORS.textDim, lineHeight: 1.5 }}>{pt}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 20, padding: "12px 16px", background: p.dim, borderRadius: 10, borderLeft: `3px solid ${p.color}` }}>
                    <span style={{ fontSize: 13, color: p.color, fontStyle: "italic" }}>{p.vs}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* THE CORE INSIGHT */}
            <div style={{ marginTop: 48, background: `linear-gradient(135deg, ${COLORS.accentDim}, ${COLORS.cyanDim})`, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: "40px 36px", textAlign: "center" }}>
              <div style={{ fontSize: 11, letterSpacing: 6, color: COLORS.accent, marginBottom: 16, textTransform: "uppercase" }}>The Core Insight</div>
              <p style={{ fontSize: "clamp(18px, 3vw, 28px)", lineHeight: 1.6, color: COLORS.text, maxWidth: 800, margin: "0 auto", fontStyle: "italic" }}>
                "ElevenLabs generates voice. NOIZY builds <strong style={{ color: COLORS.accent }}>the emotional and cultural intelligence layer</strong> that every other AI voice platform will eventually need to license, partner with, or acquire."
              </p>
              <div style={{ marginTop: 24, fontSize: 13, color: COLORS.textDim }}>— Rob Plowman, Founder, Fish Music Inc.</div>
            </div>
          </div>
        )}

        {/* VS ELEVENLABS */}
        {activeTab === "vs" && (
          <div>
            <SectionHeader title="NOIZY vs ELEVENLABS" sub="Feature by feature. Culture by culture. Artist by artist." />
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: COLORS.surface, padding: "16px 24px", borderBottom: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: 12, letterSpacing: 3, color: COLORS.textFaint, textTransform: "uppercase" }}>FEATURE</div>
                <div style={{ fontSize: 12, letterSpacing: 3, color: COLORS.textFaint, textTransform: "uppercase" }}>ELEVENLABS</div>
                <div style={{ fontSize: 12, letterSpacing: 3, color: COLORS.accent, textTransform: "uppercase" }}>NOIZY.ai</div>
              </div>
              {vs.map((row, i) => (
                <div key={row.feature} style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                  padding: "16px 24px", borderBottom: i < vs.length - 1 ? `1px solid ${COLORS.border}` : "none",
                  background: i % 2 === 0 ? "transparent" : "#ffffff04"
                }}>
                  <div style={{ fontSize: 14, color: COLORS.text, fontWeight: 600 }}>{row.feature}</div>
                  <div style={{ fontSize: 13, color: row.eleven.startsWith("✗") ? "#ff6666" : COLORS.textDim }}>{row.eleven}</div>
                  <div style={{ fontSize: 13, color: COLORS.green, fontWeight: 600 }}>{row.noizy}</div>
                </div>
              ))}
            </div>

            {/* ElevenLabs Long Game vs NOIZY */}
            <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ background: COLORS.card, border: `1px solid #333`, borderRadius: 16, padding: 28, opacity: 0.7 }}>
                <div style={{ fontSize: 12, letterSpacing: 4, color: "#ff6666", marginBottom: 16, textTransform: "uppercase" }}>ElevenLabs Long Game</div>
                {["IPO at $11B valuation (2027)", "85% revenue from enterprise", "Abandoning the creator layer", "Text → Audio. That's it.", "Racing to be embedded in Meta, etc.", "Artists are data sources, not partners"].map(l => (
                  <div key={l} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                    <span style={{ color: "#ff6666" }}>✗</span>
                    <span style={{ fontSize: 13, color: COLORS.textDim }}>{l}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.accent}`, borderRadius: 16, padding: 28 }}>
                <div style={{ fontSize: 12, letterSpacing: 4, color: COLORS.accent, marginBottom: 16, textTransform: "uppercase" }}>NOIZY.ai Long Game</div>
                {["Cultural intelligence layer for all platforms", "Artists are the product AND the partners", "Going deeper, not wider", "Audio-in → intelligent response", "Building where ElevenLabs left", "Honor, Respect, Gather, Nurture, Preserve"].map(l => (
                  <div key={l} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                    <span style={{ color: COLORS.accent }}>→</span>
                    <span style={{ fontSize: 13, color: COLORS.textDim }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TIERS */}
        {activeTab === "tiers" && (
          <div>
            <SectionHeader title="DREAMER TIERS" sub="The longer you stay, the more powerful your persona becomes. That's the lock-in nobody can copy." />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
              {tiers.map((t, i) => (
                <div key={t.name} style={{
                  background: COLORS.card,
                  border: `1px solid ${i === 3 ? t.color : COLORS.border}`,
                  borderRadius: 16, padding: 28, position: "relative",
                  transform: i === 3 ? "scale(1.02)" : "scale(1)"
                }}>
                  {i === 3 && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: t.color, borderRadius: 100, padding: "4px 14px", fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#000", textTransform: "uppercase" }}>TOP TIER</div>}
                  <div style={{ fontSize: 11, letterSpacing: 4, color: t.color, marginBottom: 8, textTransform: "uppercase" }}>{t.name}</div>
                  <div style={{ fontSize: 42, fontWeight: 900, color: COLORS.text, marginBottom: 4 }}>{t.price}<span style={{ fontSize: 16, color: COLORS.textDim }}>{t.price !== "FREE" ? "/mo" : ""}</span></div>
                  <div style={{ height: 1, background: COLORS.border, margin: "20px 0" }} />
                  {t.features.map(f => (
                    <div key={f} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                      <span style={{ color: t.color, flexShrink: 0 }}>◆</span>
                      <span style={{ fontSize: 13, color: COLORS.textDim, lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Revenue projection */}
            <div style={{ marginTop: 40, background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 32 }}>
              <div style={{ fontSize: 12, letterSpacing: 4, color: COLORS.gold, marginBottom: 24, textTransform: "uppercase" }}>Revenue Trajectory</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
                {[["Month 3", "100 Dreamers", "~$1,500/mo"], ["Month 6", "500 Dreamers", "~$10,000/mo"], ["Month 12", "2,500 Dreamers", "~$50,000/mo"], ["Year 2", "12,000 Dreamers", "~$250,000/mo"], ["Year 3", "API + Enterprise", "$2M+/mo"]].map(([time, users, rev]) => (
                  <div key={time} style={{ background: COLORS.surface, borderRadius: 12, padding: 20, textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: COLORS.textFaint, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>{time}</div>
                    <div style={{ fontSize: 14, color: COLORS.textDim, marginBottom: 6 }}>{users}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.gold }}>{rev}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TECH STACK */}
        {activeTab === "tech" && (
          <div>
            <SectionHeader title="THE TECHNICAL STACK" sub="Every layer is a competitive moat. Combined they are impossible to replicate." />
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {techStack.map(layer => (
                <div key={layer.layer} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "20px 28px", display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 140 }}>
                    <div style={{ fontSize: 11, letterSpacing: 4, color: layer.color, textTransform: "uppercase" }}>{layer.layer}</div>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flex: 1 }}>
                    {layer.tools.map(tool => (
                      <div key={tool} style={{ background: layer.color + "18", border: `1px solid ${layer.color}44`, borderRadius: 8, padding: "6px 14px", fontSize: 13, color: layer.color }}>
                        {tool}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* The Moat */}
            <div style={{ marginTop: 40, background: COLORS.card, border: `1px solid ${COLORS.cyan}`, borderRadius: 16, padding: 32 }}>
              <div style={{ fontSize: 12, letterSpacing: 4, color: COLORS.cyan, marginBottom: 20, textTransform: "uppercase" }}>The Compounding Data Moat</div>
              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {["More Dreamers", "→", "More Cultural Data", "→", "Better Voice Performance", "→", "More VSI Projects", "→", "More Revenue", "→", "Better Models", "→", "More Dreamers"].map((item, i) => (
                  <div key={i} style={{
                    background: item === "→" ? "transparent" : COLORS.surface,
                    border: item === "→" ? "none" : `1px solid ${COLORS.border}`,
                    borderRadius: 8, padding: item === "→" ? "0" : "8px 14px",
                    fontSize: item === "→" ? 20 : 13,
                    color: item === "→" ? COLORS.cyan : COLORS.textDim
                  }}>{item}</div>
                ))}
              </div>
              <p style={{ marginTop: 24, fontSize: 14, color: COLORS.textDim, lineHeight: 1.7, textAlign: "center" }}>
                By Year 3, NOIZY's cultural acoustic database is so deep that <strong style={{ color: COLORS.text }}>it cannot be replicated by any company starting from scratch</strong> — not ElevenLabs, not OpenAI, not Google. Because the data isn't scraped. It's <strong style={{ color: COLORS.cyan }}>earned through creative partnership with humans.</strong>
              </p>
            </div>
          </div>
        )}

        {/* ROADMAP */}
        {activeTab === "roadmap" && (
          <div>
            <SectionHeader title="90 DAYS TO WORLD" sub="From proof of concept to category dominance. One phase at a time." />
            <div style={{ position: "relative" }}>
              {/* Timeline line */}
              <div style={{ position: "absolute", left: 28, top: 0, bottom: 0, width: 2, background: `linear-gradient(${COLORS.cyan}, ${COLORS.accent})`, opacity: 0.3 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {roadmap.map((phase, i) => (
                  <div key={phase.phase} style={{ display: "flex", gap: 28, paddingLeft: 8 }}>
                    <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: "50%", background: phase.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#000", position: "relative", zIndex: 1 }}>{i + 1}</div>
                    <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "20px 24px", flex: 1 }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                        <div style={{ fontSize: 11, letterSpacing: 4, color: phase.color, textTransform: "uppercase" }}>{phase.phase}</div>
                        <div style={{ fontSize: 11, color: COLORS.textFaint }}>— {phase.time}</div>
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>{phase.title}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                        {phase.items.map(item => (
                          <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <span style={{ color: phase.color, flexShrink: 0 }}>◆</span>
                            <span style={{ fontSize: 13, color: COLORS.textDim, lineHeight: 1.5 }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alex Investment Summary */}
            <div style={{ marginTop: 40, background: `linear-gradient(135deg, ${COLORS.goldDim}, ${COLORS.accentDim})`, border: `1px solid ${COLORS.gold}`, borderRadius: 20, padding: 36 }}>
              <div style={{ fontSize: 12, letterSpacing: 4, color: COLORS.gold, marginBottom: 16, textTransform: "uppercase" }}>Alex's Investment — The 24-Month Stack</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
                {[["Claude Max 5x", "$100/mo", "$2,400"], ["ElevenLabs Creator", "$22/mo", "$264"], ["Midjourney", "$30/mo", "$360"], ["Cursor IDE Pro", "$20/mo", "$480"], ["n8n + Albato", "$35/mo", "$840"], ["Pinecone + APIs", "$50/mo", "$1,200"]].map(([tool, mo, annual]) => (
                  <div key={tool} style={{ background: "#ffffff08", borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ fontSize: 12, color: COLORS.textDim, marginBottom: 4 }}>{tool}</div>
                    <div style={{ fontSize: 11, color: COLORS.textFaint }}>{mo}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.gold }}>{annual}</div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 13, color: COLORS.textDim, marginBottom: 8 }}>Total 24-Month Investment</div>
                <div style={{ fontSize: 56, fontWeight: 900, color: COLORS.gold }}>$5,544</div>
                <div style={{ fontSize: 14, color: COLORS.textDim, marginTop: 8, maxWidth: 500, margin: "8px auto 0" }}>
                  That's the cost of keeping NOIZY.ai's full creative AI stack alive for 24 months — every tool needed to build the platform, prove the concept, land VSI, and show the world what a real AI creative partnership looks like.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: 6, color: COLORS.textFaint, textTransform: "uppercase", marginBottom: 8 }}>GORUNFREEX1000</div>
        <div style={{ fontSize: 13, color: COLORS.textDim }}>NOIZY.ai × NOIZYFISH.com × Fish Music Inc. × THE AQUARIUM</div>
        <div style={{ fontSize: 11, color: COLORS.textFaint, marginTop: 8 }}>Honor. Respect. Gather. Nurture. Preserve. — Rob Plowman</div>
      </div>
    </div>
  );
}

function SectionHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ fontSize: 11, letterSpacing: 6, color: COLORS.accent, marginBottom: 10, textTransform: "uppercase" }}>{title}</div>
      <p style={{ fontSize: 16, color: COLORS.textDim, margin: 0, maxWidth: 640 }}>{sub}</p>
      <div style={{ height: 1, background: `linear-gradient(to right, ${COLORS.accent}, transparent)`, marginTop: 20 }} />
    </div>
  );
}
