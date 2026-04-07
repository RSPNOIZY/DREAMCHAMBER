import { useState } from "react";

const brands = [
  {
    id: "noizy-ai",
    name: "NOIZY.ai",
    tagline: "The Intelligence Layer of Sound",
    universe: "MC96ECO Universe · Flagship",
    personality: ["Visionary", "Precise", "Commanding", "Futurist"],
    colors: {
      primary: "#F59E0B",
      secondary: "#06B6D4",
      bg: "#020409",
      surface: "#0D1117",
      accent: "#1E293B",
      text: "#F1F5F9",
      muted: "#64748B",
    },
    fonts: {
      display: "'Cormorant Garamond', serif",
      body: "'DM Sans', sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
    gradient: "linear-gradient(135deg, #F59E0B 0%, #06B6D4 100%)",
    glowColor: "rgba(245, 158, 11, 0.3)",
    icon: "◈",
    audience: "Creators, studios, enterprise AI licensees",
    voice: "Authoritative, elegant, forward-looking. Never casual. Never corporate.",
    keyComponents: [
      "Parallax hero with dark space atmosphere",
      "Glass morphism navigation",
      "Amber/cyan gradient accents",
      "Cormorant Garamond display headings",
      "Consent-first onboarding flows",
      "DreamChamber portal entry",
    ],
    motionPrinciple: "Slow, deliberate reveals. Stars. Depth. Nothing rushed.",
    designNotes: "The mothership. Every other brand should feel like it could live inside NOIZY.ai. Maximum sophistication.",
  },
  {
    id: "noizyvox",
    name: "NOIZYVOX",
    tagline: "A.I.V.A. — Artificially Intelligent Voice Acting",
    universe: "MC96ECO Universe · Voice Division",
    personality: ["Expressive", "Intimate", "Electric", "Human-first"],
    colors: {
      primary: "#A855F7",
      secondary: "#EC4899",
      bg: "#0A0612",
      surface: "#130D1F",
      accent: "#1E1035",
      text: "#F5F0FF",
      muted: "#7C6FAA",
    },
    fonts: {
      display: "'Playfair Display', serif",
      body: "'Outfit', sans-serif",
      mono: "'Fira Code', monospace",
    },
    gradient: "linear-gradient(135deg, #A855F7 0%, #EC4899 100%)",
    glowColor: "rgba(168, 85, 247, 0.3)",
    icon: "◎",
    audience: "Voice actors, game studios, AAA publishers, content creators",
    voice: "Warm, exciting, human. This is art, not tech. RSP_001 leads.",
    keyComponents: [
      "Waveform visualizer hero",
      "Voice actor consent portal (75/25 split)",
      "RSP_001 demo showcase",
      "XTTS v2 + RVC pipeline UI",
      "Voice Estate management dashboard",
      "A.I.V.A. enrollment flow",
    ],
    motionPrinciple: "Sound-responsive animations. Waveforms. Pulse. Breath.",
    designNotes: "Where human voice meets AI precision. Purple-magenta spectrum. Feels like a recording studio at midnight.",
  },
  {
    id: "noizylab",
    name: "NOIZYLAB",
    tagline: "We Fix. We Build. We Know.",
    universe: "MC96ECO Universe · Tech Services",
    personality: ["Dependable", "Skilled", "Direct", "No-BS"],
    colors: {
      primary: "#10B981",
      secondary: "#F59E0B",
      bg: "#050F0A",
      surface: "#0A1F14",
      accent: "#0F2D1A",
      text: "#ECFDF5",
      muted: "#4B7A62",
    },
    fonts: {
      display: "'Space Grotesk', sans-serif",
      body: "'IBM Plex Sans', sans-serif",
      mono: "'IBM Plex Mono', monospace",
    },
    gradient: "linear-gradient(135deg, #10B981 0%, #F59E0B 100%)",
    glowColor: "rgba(16, 185, 129, 0.3)",
    icon: "⬡",
    audience: "Ottawa-area consumers, small business, device repair seekers",
    voice: "Confident, local, expert. $89 flat rate. Done.",
    keyComponents: [
      "Service booking portal",
      "Repair status tracker",
      "Flat-rate pricing display ($89 × 12/day)",
      "Technician dashboard",
      "Walk-in vs. pickup CTA",
      "Trust signals + reviews",
    ],
    motionPrinciple: "Snappy, precise. Tool-clicking energy. No fluff.",
    designNotes: "Green = go. Technical credibility without intimidation. Ottawa-proud identity.",
  },
  {
    id: "noizykidz",
    name: "NOIZYKIDZ",
    tagline: "Feel the Music. Every Frequency.",
    universe: "MC96ECO Universe · Accessibility & Heart",
    personality: ["Joyful", "Inclusive", "Warm", "Wonder-filled"],
    colors: {
      primary: "#F97316",
      secondary: "#FBBF24",
      bg: "#0F0805",
      surface: "#1A1008",
      accent: "#2D1F0A",
      text: "#FFF7ED",
      muted: "#92745A",
    },
    fonts: {
      display: "'Nunito', sans-serif",
      body: "'Nunito Sans', sans-serif",
      mono: "'Courier Prime', monospace",
    },
    gradient: "linear-gradient(135deg, #F97316 0%, #FBBF24 100%)",
    glowColor: "rgba(249, 115, 22, 0.3)",
    icon: "✦",
    audience: "Parents, deaf children, autism spectrum families, educators, therapists",
    voice: "Gentle, hopeful, empowering. Nims is the soul of this brand.",
    keyComponents: [
      "Haptic music exploration interface",
      "LIFELUV companion integration",
      "Parent/educator onboarding",
      "Accessible-first design patterns",
      "Frequency-to-haptic mapping UI",
      "Community story hub",
    ],
    motionPrinciple: "Gentle pulses. Warm glows. No sudden motion. Accessible-first always.",
    designNotes: "Inspired by Nims. Joy through vibration. Every child deserves to feel music. Orange warmth, never harsh.",
  },
  {
    id: "fish-music",
    name: "Fish Music Inc.",
    tagline: "40 Years. 34 Terabytes. One Legacy.",
    universe: "MC96ECO Universe · Heritage Catalog",
    personality: ["Storied", "Timeless", "Rich", "Archive-proud"],
    colors: {
      primary: "#60A5FA",
      secondary: "#93C5FD",
      bg: "#02050F",
      surface: "#060D1F",
      accent: "#0D1B3E",
      text: "#EFF6FF",
      muted: "#4B6A9B",
    },
    fonts: {
      display: "'EB Garamond', serif",
      body: "'Source Sans 3', sans-serif",
      mono: "'Source Code Pro', monospace",
    },
    gradient: "linear-gradient(135deg, #60A5FA 0%, #2563EB 100%)",
    glowColor: "rgba(96, 165, 250, 0.3)",
    icon: "⟡",
    audience: "Sync licensors, music supervisors, archivists, legacy clients",
    voice: "Earned gravitas. Animation legacy. Ed Edd n Eddy. Johnny Test. Transformers. Real credits.",
    keyComponents: [
      "THE_AQUARIUM catalog browser",
      "Sync licensing portal",
      "Score + sound design showcase",
      "Legacy reel / showreel player",
      "Music supervision inquiry form",
      "Animation credit wall",
    ],
    motionPrinciple: "Film-reel pacing. Deep blue atmospherics. Cinematic scrolling.",
    designNotes: "The vault. Deep ocean blue. Speaks to music supervisors and sync licensors. Legacy earns trust.",
  },
];

const SHARED_SYSTEM = {
  spacing: ["4px", "8px", "16px", "24px", "32px", "48px", "64px", "96px"],
  borderRadius: { sm: "4px", md: "8px", lg: "16px", xl: "24px", pill: "999px" },
  shadows: {
    glow: "0 0 40px var(--brand-glow)",
    card: "0 4px 24px rgba(0,0,0,0.4)",
    deep: "0 8px 48px rgba(0,0,0,0.6)",
  },
  motion: {
    fast: "150ms ease",
    normal: "300ms ease",
    slow: "600ms ease",
    reveal: "800ms cubic-bezier(0.16, 1, 0.3, 1)",
  },
  breakpoints: { sm: "640px", md: "768px", lg: "1024px", xl: "1280px" },
};

export default function NOIZYFamilySpec() {
  const [active, setActive] = useState(brands[0]);
  const [tab, setTab] = useState("overview");

  const tabs = ["overview", "colors", "typography", "components", "motion", "notes"];

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      background: "#020409",
      minHeight: "100vh",
      color: "#F1F5F9",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0D1117; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
        .brand-pill {
          cursor: pointer;
          padding: 10px 18px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.05em;
          border: 1px solid transparent;
          transition: all 300ms ease;
          white-space: nowrap;
        }
        .brand-pill:hover { transform: translateY(-1px); }
        .tab-btn {
          cursor: pointer;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: none;
          transition: all 200ms ease;
          background: transparent;
        }
        .card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 20px;
        }
        .swatch {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.1);
          transition: transform 200ms ease;
          cursor: default;
          position: relative;
        }
        .swatch:hover { transform: scale(1.1); }
        .component-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          margin: 4px;
        }
        .fade-in {
          animation: fadeIn 0.4s ease forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .glow-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          animation: pulse 2s ease infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "20px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(2,4,9,0.95)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 22,
            fontWeight: 600,
            background: "linear-gradient(135deg, #F59E0B, #06B6D4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "0.02em",
          }}>MC96ECO</div>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.12)" }} />
          <div style={{ fontSize: 12, color: "#64748B", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Brand Family Design Spec
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="glow-dot" style={{ background: "#10B981" }} />
          <span style={{ fontSize: 11, color: "#64748B", letterSpacing: "0.08em" }}>NOIZYFISH INC. · OTTAWA</span>
        </div>
      </div>

      {/* Brand Selector */}
      <div style={{
        padding: "20px 32px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        gap: 8,
        overflowX: "auto",
      }}>
        {brands.map((b) => (
          <button
            key={b.id}
            className="brand-pill"
            onClick={() => { setActive(b); setTab("overview"); }}
            style={{
              background: active.id === b.id
                ? `linear-gradient(135deg, ${b.colors.primary}, ${b.colors.secondary})`
                : "rgba(255,255,255,0.04)",
              color: active.id === b.id ? "#fff" : "#94A3B8",
              borderColor: active.id === b.id ? "transparent" : "rgba(255,255,255,0.08)",
              boxShadow: active.id === b.id ? `0 0 20px ${b.glowColor}` : "none",
            }}
          >
            <span style={{ marginRight: 6 }}>{b.icon}</span>
            {b.name}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ padding: "32px", maxWidth: 1100, margin: "0 auto" }} className="fade-in" key={active.id}>

        {/* Brand Hero */}
        <div style={{
          background: `linear-gradient(135deg, ${active.colors.bg} 0%, ${active.colors.surface} 100%)`,
          border: `1px solid ${active.colors.primary}22`,
          borderRadius: 24,
          padding: "40px 48px",
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* BG glow */}
          <div style={{
            position: "absolute", top: -60, right: -60,
            width: 300, height: 300, borderRadius: "50%",
            background: active.glowColor, filter: "blur(80px)", opacity: 0.4,
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: active.colors.primary, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>
                  {active.universe}
                </div>
                <div style={{
                  fontFamily: active.fonts.display,
                  fontSize: 48,
                  fontWeight: 700,
                  background: active.gradient,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 1.1,
                  marginBottom: 10,
                }}>
                  {active.name}
                </div>
                <div style={{ fontSize: 18, color: active.colors.muted, fontStyle: "italic", marginBottom: 20 }}>
                  {active.tagline}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {active.personality.map(p => (
                    <span key={p} style={{
                      padding: "4px 12px", borderRadius: 999,
                      fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                      background: `${active.colors.primary}22`,
                      color: active.colors.primary,
                      border: `1px solid ${active.colors.primary}44`,
                      textTransform: "uppercase",
                    }}>{p}</span>
                  ))}
                </div>
              </div>
              <div style={{
                fontSize: 80, opacity: 0.15,
                color: active.colors.primary,
                fontFamily: active.fonts.display,
                lineHeight: 1,
              }}>{active.icon}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, flexWrap: "wrap" }}>
          {tabs.map(t => (
            <button key={t} className="tab-btn"
              onClick={() => setTab(t)}
              style={{
                background: tab === t ? `${active.colors.primary}22` : "transparent",
                color: tab === t ? active.colors.primary : "#64748B",
                border: tab === t ? `1px solid ${active.colors.primary}44` : "1px solid transparent",
              }}
            >{t}</button>
          ))}
        </div>

        {/* Tab: Overview */}
        {tab === "overview" && (
          <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="card">
              <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#64748B", textTransform: "uppercase", marginBottom: 12, fontWeight: 700 }}>Target Audience</div>
              <div style={{ fontSize: 14, lineHeight: 1.7, color: "#CBD5E1" }}>{active.audience}</div>
            </div>
            <div className="card">
              <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#64748B", textTransform: "uppercase", marginBottom: 12, fontWeight: 700 }}>Brand Voice</div>
              <div style={{ fontSize: 14, lineHeight: 1.7, color: "#CBD5E1", fontStyle: "italic" }}>{active.voice}</div>
            </div>
            <div className="card" style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#64748B", textTransform: "uppercase", marginBottom: 12, fontWeight: 700 }}>Design Director Notes</div>
              <div style={{ fontSize: 15, lineHeight: 1.8, color: active.colors.primary }}>{active.designNotes}</div>
            </div>
            {/* Shared System */}
            <div className="card" style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#64748B", textTransform: "uppercase", marginBottom: 16, fontWeight: 700 }}>Shared Design System — MC96ECO</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                {[
                  { label: "Border Radius", val: "sm:4px · md:8px · lg:16px · xl:24px · pill:999px" },
                  { label: "Motion: Fast", val: "150ms ease" },
                  { label: "Motion: Normal", val: "300ms ease" },
                  { label: "Motion: Slow", val: "600ms ease" },
                  { label: "Motion: Reveal", val: "800ms cubic-bezier(0.16,1,0.3,1)" },
                  { label: "Spacing Scale", val: "4 · 8 · 16 · 24 · 32 · 48 · 64 · 96px" },
                ].map(item => (
                  <div key={item.label} style={{ padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: 10, color: "#64748B", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.label}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#94A3B8" }}>{item.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Colors */}
        {tab === "colors" && (
          <div className="fade-in">
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#64748B", textTransform: "uppercase", marginBottom: 20, fontWeight: 700 }}>Color System</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
                {Object.entries(active.colors).map(([key, val]) => (
                  <div key={key} style={{ textAlign: "center" }}>
                    <div className="swatch" style={{ background: val, margin: "0 auto 8px" }} />
                    <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>{key}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#94A3B8" }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#64748B", textTransform: "uppercase", marginBottom: 16, fontWeight: 700 }}>Gradient</div>
              <div style={{
                height: 80, borderRadius: 12,
                background: active.gradient,
                boxShadow: `0 8px 32px ${active.glowColor}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.8)" }}>
                  {active.gradient}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Typography */}
        {tab === "typography" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { label: "Display / Heading", role: "display", size: 42, weight: 700, sample: active.name },
              { label: "Body", role: "body", size: 16, weight: 400, sample: "Consent-first. Creator-owned. Built for the future of sound." },
              { label: "Monospace / Code", role: "mono", size: 13, weight: 400, sample: `rsp_001.voice_model.load() → ACTIVE` },
            ].map(({ label, role, size, weight, sample }) => (
              <div key={role} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>{label}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#475569" }}>
                    {active.fonts[role]}
                  </div>
                </div>
                <div style={{
                  fontFamily: active.fonts[role],
                  fontSize: size,
                  fontWeight: weight,
                  color: active.colors.text,
                  lineHeight: 1.2,
                  background: role === "display" ? active.gradient : "none",
                  WebkitBackgroundClip: role === "display" ? "text" : "none",
                  WebkitTextFillColor: role === "display" ? "transparent" : active.colors.text,
                }}>{sample}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Components */}
        {tab === "components" && (
          <div className="fade-in">
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#64748B", textTransform: "uppercase", marginBottom: 16, fontWeight: 700 }}>Key UI Components</div>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {active.keyComponents.map((c) => (
                  <span key={c} className="component-tag">
                    <span style={{ color: active.colors.primary }}>→</span>
                    <span style={{ color: "#CBD5E1" }}>{c}</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="card">
              <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#64748B", textTransform: "uppercase", marginBottom: 20, fontWeight: 700 }}>Button System Preview</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <button style={{
                  padding: "12px 28px", borderRadius: 999, border: "none", cursor: "pointer",
                  background: active.gradient, color: "#fff", fontWeight: 700, fontSize: 13,
                  letterSpacing: "0.05em", boxShadow: `0 4px 20px ${active.glowColor}`,
                }}>Primary CTA</button>
                <button style={{
                  padding: "12px 28px", borderRadius: 999, cursor: "pointer",
                  background: "transparent", color: active.colors.primary, fontWeight: 600, fontSize: 13,
                  border: `1.5px solid ${active.colors.primary}`,
                }}>Secondary</button>
                <button style={{
                  padding: "12px 28px", borderRadius: 8, cursor: "pointer",
                  background: "rgba(255,255,255,0.05)", color: "#94A3B8", fontWeight: 500, fontSize: 13,
                  border: "1px solid rgba(255,255,255,0.1)",
                }}>Tertiary</button>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Motion */}
        {tab === "motion" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card">
              <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#64748B", textTransform: "uppercase", marginBottom: 12, fontWeight: 700 }}>Motion Principle</div>
              <div style={{ fontSize: 22, color: active.colors.primary, fontStyle: "italic", lineHeight: 1.5 }}>
                "{active.motionPrinciple}"
              </div>
            </div>
            <div className="card">
              <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#64748B", textTransform: "uppercase", marginBottom: 16, fontWeight: 700 }}>Easing Reference</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {Object.entries(SHARED_SYSTEM.motion).map(([key, val]) => (
                  <div key={key} style={{ padding: 14, background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: 10, color: active.colors.primary, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4, fontWeight: 700 }}>{key}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#94A3B8" }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#64748B", textTransform: "uppercase", marginBottom: 16, fontWeight: 700 }}>Glow Effect Preview</div>
              <div style={{
                height: 100, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
                background: active.colors.surface, position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  width: 80, height: 80, borderRadius: "50%",
                  background: active.colors.primary,
                  boxShadow: `0 0 60px 20px ${active.glowColor}`,
                  opacity: 0.7,
                }} />
              </div>
            </div>
          </div>
        )}

        {/* Tab: Notes */}
        {tab === "notes" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card">
              <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#64748B", textTransform: "uppercase", marginBottom: 12, fontWeight: 700 }}>Design Director Notes</div>
              <div style={{ fontSize: 16, color: active.colors.primary, lineHeight: 1.8 }}>{active.designNotes}</div>
            </div>
            <div className="card">
              <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#64748B", textTransform: "uppercase", marginBottom: 16, fontWeight: 700 }}>Cross-Brand Rules</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "Every brand lives inside the MC96ECO Universe — visual cohesion through shared system tokens.",
                  "Dark backgrounds only. No light themes in v1.",
                  "Consent-first UI patterns apply across all platforms.",
                  "Artist Creator First — Rob (RSP_001) is the proof of concept for everything.",
                  "Typography: each brand owns its own display font. Body fonts may share family DNA.",
                  "Glass morphism and grain overlays are fair game across all brands.",
                  "The NOIZY.ai mothership must always feel like the most premium in the family.",
                  "NOIZYKIDZ is the only brand that can use rounded, soft, joyful shapes — others stay geometric.",
                ].map((rule, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ color: active.colors.primary, fontSize: 14, marginTop: 1, flexShrink: 0 }}>◆</span>
                    <span style={{ fontSize: 13, color: "#CBD5E1", lineHeight: 1.6 }}>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <div style={{
        textAlign: "center", padding: "32px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        marginTop: 32,
      }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: "#334155", letterSpacing: "0.2em" }}>
          NOIZYFISH INC. · MC96ECO UNIVERSE · DESIGN SYSTEM v1.0 · OTTAWA 2026
        </div>
      </div>
    </div>
  );
}
