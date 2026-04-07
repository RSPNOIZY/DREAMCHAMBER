import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   NOIZYVOX × VSI LONDON — THE CHARACTER DNA PITCH
   "One Character. Twenty Languages. Perfect Consistency."
   Fish Music Inc. × NOIZY.ai × GORUNFREEX1000
═══════════════════════════════════════════════════════════════ */

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;0,700;1,300;1,600;1,700&family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
::-webkit-scrollbar{width:2px}
::-webkit-scrollbar-thumb{background:#c8a96e;border-radius:2px}

@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes wave{0%,100%{transform:scaleY(.25)}50%{transform:scaleY(1)}}
@keyframes scan{0%{top:-1%}100%{top:101%}}
@keyframes flicker{0%,100%{opacity:1}91%{opacity:1}92%{opacity:.3}93%{opacity:1}97%{opacity:.7}98%{opacity:1}}
@keyframes pring{0%{transform:scale(1);opacity:.5}100%{transform:scale(3);opacity:0}}
@keyframes drift{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-8px) rotate(1deg)}}
@keyframes reveal{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0% 0 0)}}
@keyframes typewriter{from{width:0}to{width:100%}}
@keyframes dna-pulse{0%,100%{box-shadow:0 0 0 0 rgba(200,169,110,.4)}70%{box-shadow:0 0 0 12px rgba(200,169,110,0)}}
@keyframes matrix-glow{0%,100%{background:rgba(200,169,110,.06)}50%{background:rgba(200,169,110,.14)}}
@keyframes slide-in{from{transform:translateX(-30px);opacity:0}to{transform:translateX(0);opacity:1}}

.gcard{transition:all .3s cubic-bezier(.4,0,.2,1)}
.gcard:hover{transform:translateY(-3px)}
.tab-btn{transition:all .22s cubic-bezier(.4,0,.2,1)}
.tab-btn:hover{transform:translateY(-2px)}
.culture-card{transition:all .32s cubic-bezier(.4,0,.2,1);cursor:pointer}
.culture-card:hover{transform:scale(1.02)}
.culture-card.active{transform:scale(1.02)}
input[type=range]{-webkit-appearance:none;height:2px;outline:none;cursor:pointer}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;cursor:pointer}
`;

/* ── PALETTE ─────────────────────────────────────────────────── */
const C = {
  bg:     "#08070a",
  bg2:    "#0c0b10",
  film:   "#100f14",
  card:   "#141218",
  cardHi: "#1a1820",
  border: "#1e1c24",
  borderBright: "#2e2a38",
  gold:   "#c8a96e",
  goldSoft: "#c8a96e18",
  goldDim: "#c8a96e44",
  amber:  "#e8942a",
  amberSoft: "#e8942a14",
  blue:   "#4a9eff",
  blueSoft: "#4a9eff12",
  red:    "#ff4444",
  redSoft: "#ff444415",
  green:  "#44ff88",
  greenSoft: "#44ff8812",
  teal:   "#00d4c8",
  tealSoft: "#00d4c812",
  white:  "#f0ede8",
  mid:    "#888099",
  dim:    "#443f54",
  faint:  "#1a1826",
};

/* ── CULTURE DATA ─────────────────────────────────────────────── */
const CULTURES = [
  {
    lang: "ENGLISH", city: "Brooklyn, NYC", flag: "🇺🇸", color: C.gold,
    archetype: "The Burned Detective",
    framework: "Working-class New York toughness",
    execution: "Sharp sarcasm, clipped vowels, aggressive humor as armor",
    breath: "Fast, controlled — inhales before every cutting remark",
    silence: "Weaponized — uses pause to let sarcasm land",
    weariness: "Sarcastic resignation. Heavy sighs. 'I've seen worse' energy.",
    anger: "Explosive edge under a thin calm surface. Jaw tight. Clipped words.",
    vulnerability: "Raw honesty breaking through humor. Voice cracks on the last word.",
    line: "I've seen enough bodies to know when someone's lying.",
    subtext: "I'm done being surprised by how broken people are.",
    dna_contribution: 100,
  },
  {
    lang: "JAPANESE", city: "Tokyo", flag: "🇯🇵", color: "#e8c5a0",
    archetype: "The Stoic Guardian",
    framework: "Controlled restraint, weighted silence, societal decay observer",
    execution: "Minimal words, dangerous calm, internal processing made audible through breath",
    breath: "Slow, deliberate — long exhales carry the emotional weight",
    silence: "Sacred — the pause IS the performance. Silence speaks volumes.",
    weariness: "Stoic restraint. Weighted pauses. The world failed him quietly.",
    anger: "Dangerous quiet. Slight vocal tightening. Controlled breath. The room goes cold.",
    vulnerability: "Shame revealed through formality breaking — a stammer, a dropped honorific.",
    line: "何体見ても、嘘はすぐにわかる。",
    subtext: "Society's rot runs so deep, I stopped being surprised.",
    dna_contribution: 97,
  },
  {
    lang: "FRENCH", city: "Paris", flag: "🇫🇷", color: "#b8d4ff",
    archetype: "The Philosophical Exile",
    framework: "Film noir intellectualism, existential resignation, dark poetry",
    execution: "Philosophical tangents, existential weariness, bitter humor with intellectual edge",
    breath: "Contemplative — inhales before philosophical observations",
    silence: "Used for effect — the existential pause before the devastating insight",
    weariness: "Philosophical exhaustion. Bitter poetry. 'The world is exactly as terrible as Camus predicted.'",
    anger: "Cold precision meets intellectual fury. Devastating calmness. Thinks before he destroys.",
    vulnerability: "Existential truth beneath cynicism. Admits defeat like it's a philosophical position.",
    line: "J'ai vu assez de corps pour reconnaître un mensonge.",
    subtext: "Truth and lies are both illusions — I've seen enough to know the difference anyway.",
    dna_contribution: 96,
  },
  {
    lang: "ARABIC", city: "Cairo", flag: "🇪🇬", color: "#ffd4a0",
    archetype: "The Fatalistic Witness",
    framework: "Street-smart fatalism, spiritual disillusionment, prophetic wisdom",
    execution: "Fatalistic wisdom, references to fate and God, moral weight in every word",
    breath: "Deep, resonant — breath carries the weight of history and faith",
    silence: "Heavy with meaning — silence before a truth that will change everything",
    weariness: "Spiritual disillusionment. God-given fatalism. 'This is how the world has always been.'",
    anger: "Prophetic warning. Moral judgment. Anger that sounds ancient and righteous.",
    vulnerability: "Spiritual admission — removes the street armor to show the wound beneath the wisdom.",
    line: "رأيت من الجثث ما يكفي لأعرف الكذاب من بعيد.",
    subtext: "God witnesses everything. I've merely become his tired instrument.",
    dna_contribution: 95,
  },
  {
    lang: "SPANISH", city: "Buenos Aires", flag: "🇦🇷", color: "#ffa0a0",
    archetype: "The Street Philosopher",
    framework: "Urban survival wisdom, passionate restraint, tango-inflected rhythm",
    execution: "Street-smart rhythm, passionate undertones held in check, dark humor with warmth",
    breath: "Musical — rhythmic breathing that follows the emotional cadence",
    silence: "Charged — the intake of breath before the devastating truth",
    weariness: "Lived-in exhaustion with flashes of dark humor. Still cares. Hates that he still cares.",
    anger: "Passionate restraint — the pressure building before the release. Never cold, always felt.",
    vulnerability: "Drops the street armor with the directness that only Buenos Aires produces.",
    line: "Vi suficientes cuerpos para saber cuándo alguien miente.",
    subtext: "This city will break you. I just got here first.",
    dna_contribution: 94,
  },
];

const DIRECTOR_NOTES = [
  {
    note: "More weariness — he's carrying the weight of every case",
    icon: "😔",
    responses: [
      "Sarcastic resignation. Heavy sighs. Bitter half-laugh. Clipped words slower now.",
      "Stoic restraint deepens. Longer pauses. Breath more audible. Eyes-down energy.",
      "Philosophical exhaustion. Bitter poetry seeps in. Speaks slower, like he's choosing final words.",
      "Fatalistic calm increases. Spiritual weight. Like he's confessing to God.",
      "Lived-in tiredness with a flash of dark humor. Still cares — hates himself for it.",
    ]
  },
  {
    note: "Restrained anger — he won't explode, but you feel it simmering",
    icon: "😤",
    responses: [
      "Explosive edge under thin calm surface. Jaw tight. Words clipped to the bone.",
      "Dangerous quiet. Slight vocal tightening. Controlled breath. The room temperature drops.",
      "Cold precision. Intellectual fury. Devastating composure. Thinks before destroying.",
      "Prophetic warning. Ancient, righteous anger. Moral judgment wrapped in calm.",
      "Passionate restraint. Pressure building. The breath before the release.",
    ]
  },
  {
    note: "Vulnerable confession — the walls are coming down",
    icon: "💔",
    responses: [
      "Raw honesty breaking through humor. Voice cracks on the last word. Unexpected.",
      "Shame revealed through formality breaking. A stammer. A dropped honorific. Catastrophic.",
      "Existential truth beneath cynicism. Admits defeat as philosophical position.",
      "Spiritual admission beneath street wisdom. Removes the armor. Shows the wound.",
      "Drops the street toughness with directness. No poetry. Just the raw fact.",
    ]
  },
  {
    note: "Darkly humorous — using wit as a weapon against pain",
    icon: "😏",
    responses: [
      "Sharp sarcasm in full flight. Aggressive humor. Laugh that says 'I hate this job.'",
      "Dry wit delivered with absolute deadpan. The joke is funnier because he doesn't smile.",
      "Dark philosophical joke — laughs at the absurdity of existence. Beautifully bleak.",
      "Bitter irony with God as the punchline. Fatalistic humor that somehow still lands.",
      "Street humor with warmth — the joke is dark but there's life in it.",
    ]
  },
];

const SLIDES = [
  { id: "paradox", label: "THE PARADOX", num: "01" },
  { id: "cost",    label: "THE COST",    num: "02" },
  { id: "dna",     label: "CHARACTER DNA", num: "03" },
  { id: "demo",    label: "LIVE DEMO",   num: "04" },
  { id: "director",label: "DIRECTOR TEST", num: "05" },
  { id: "vsi",     label: "VSI DEAL",    num: "06" },
  { id: "revenue", label: "REVENUE",     num: "07" },
];

/* ── WAVEFORM ─────────────────────────────────────────────────── */
function Wave({ color, bars = 32, h = 48, active = true }) {
  const [hs] = useState(() => Array.from({ length: bars }, () => 10 + Math.random() * 90));
  const [ds] = useState(() => Array.from({ length: bars }, () => (Math.random() * 1.6).toFixed(2)));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2.5, height: h }}>
      {hs.map((bh, i) => (
        <div key={i} style={{
          width: 2.5, height: `${bh}%`, borderRadius: 2, flexShrink: 0,
          background: `linear-gradient(to top,${color}44,${color})`,
          animation: active ? `wave ${.6 + Math.random() * 1}s ease-in-out ${ds[i]}s infinite` : "none",
          opacity: active ? 1 : 0.3,
          transformOrigin: "center",
        }} />
      ))}
    </div>
  );
}

/* ── PULSE DOT ────────────────────────────────────────────────── */
function Pulse({ color, sz = 8 }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", width: sz, height: sz, flexShrink: 0 }}>
      <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color, animation: "pring 2.2s ease-out infinite" }} />
      <span style={{ width: sz * .45, height: sz * .45, borderRadius: "50%", background: color, position: "relative", zIndex: 1 }} />
    </span>
  );
}

/* ── SECTION LABEL ────────────────────────────────────────────── */
function SL({ children, color = C.gold }) {
  return <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: 6, color, textTransform: "uppercase" }}>{children}</span>;
}

/* ── DNA NODE ─────────────────────────────────────────────────── */
function DNANode({ label, value, color = C.gold, pct = 100 }) {
  return (
    <div style={{ padding: "12px 16px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", bottom: 0, left: 0, height: 2, width: `${pct}%`, background: `linear-gradient(to right,${color}44,${color})`, transition: "width 1s ease-out" }} />
      <div style={{ fontSize: 9, letterSpacing: 4, color: C.dim, marginBottom: 5, textTransform: "uppercase", fontFamily: "'DM Mono',monospace" }}>{label}</div>
      <div style={{ fontSize: 12, color: C.mid, lineHeight: 1.6, fontStyle: "italic" }}>{value}</div>
    </div>
  );
}

/* ── FILM GRAIN ───────────────────────────────────────────────── */
function Grain() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.018,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    }} />
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════ */
export default function NOIZYVOXPitch() {
  const [slide, setSlide] = useState("paradox");
  const [activeDemo, setActiveDemo] = useState(0);
  const [activeNote, setActiveNote] = useState(0);
  const [noteTriggered, setNoteTriggered] = useState(false);
  const [demoPlaying, setDemoPlaying] = useState(false);
  const [playedCultures, setPlayedCultures] = useState([]);

  const triggerNote = (idx) => {
    setActiveNote(idx);
    setNoteTriggered(false);
    setTimeout(() => setNoteTriggered(true), 100);
  };

  const playDemo = () => {
    setDemoPlaying(true);
    setPlayedCultures([]);
    CULTURES.forEach((_, i) => {
      setTimeout(() => setPlayedCultures(p => [...p, i]), i * 800 + 300);
    });
    setTimeout(() => setDemoPlaying(false), CULTURES.length * 800 + 1000);
  };

  const cu = CULTURES[activeDemo];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'DM Mono',monospace", color: C.white, overflowX: "hidden", position: "relative" }}>
      <style>{STYLE}</style>
      <Grain />

      {/* ── CINEMATIC HEADER ───────────────────────────────── */}
      <div style={{ position: "relative", textAlign: "center", padding: "72px 32px 60px", borderBottom: `1px solid ${C.border}`, overflow: "hidden" }}>
        {/* Film bars top/bottom */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 12, background: C.bg, zIndex: 2, display: "flex", gap: 3, padding: "0 16px", alignItems: "center" }}>
          {Array.from({ length: 60 }).map((_, i) => <div key={i} style={{ width: 8, height: 8, background: C.faint, borderRadius: 1, flexShrink: 0 }} />)}
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 12, background: C.bg, zIndex: 2, display: "flex", gap: 3, padding: "0 16px", alignItems: "center" }}>
          {Array.from({ length: 60 }).map((_, i) => <div key={i} style={{ width: 8, height: 8, background: C.faint, borderRadius: 1, flexShrink: 0 }} />)}
        </div>

        {/* Scan line */}
        <div style={{ position: "absolute", left: 0, right: 0, height: 1, background: `linear-gradient(to right,transparent,${C.gold}22,transparent)`, animation: "scan 10s linear infinite", pointerEvents: "none" }} />

        {/* Radial glow */}
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 600, height: 400, background: `radial-gradient(${C.gold}08,transparent 70%)`, pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, animation: "fadeUp .9s ease-out" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: C.goldSoft, border: `1px solid ${C.goldDim}`, borderRadius: 100, padding: "7px 18px", marginBottom: 28 }}>
            <Pulse color={C.gold} />
            <SL color={C.gold}>NOIZYVOX × VSI London — Confidential Pitch</SL>
          </div>

          <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(40px,8vw,92px)", fontWeight: 700, lineHeight: .9, letterSpacing: -2, marginBottom: 6, animation: "flicker 12s infinite" }}>
            <span style={{ display: "block", color: C.white }}>THE IMPOSSIBLE</span>
            <span style={{ display: "block", color: C.white }}>PROBLEM</span>
            <span style={{ display: "block", color: C.gold, fontStyle: "italic", textShadow: `0 0 60px ${C.gold}40` }}>Solved.</span>
          </h1>

          <div style={{ display: "flex", justifyContent: "center", margin: "24px 0 20px", opacity: 0.5 }}>
            <Wave color={C.gold} bars={80} h={36} />
          </div>

          <p style={{ fontSize: 14, color: C.mid, maxWidth: 620, margin: "0 auto 32px", lineHeight: 1.95 }}>
            The localization industry has spent <strong style={{ color: C.white }}>30 years</strong> trying to crack this. How do you maintain character consistency across 20 languages while ensuring regional authenticity? Until now, you couldn't. <strong style={{ color: C.gold }}>You chose one or the other.</strong>
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {["Character DNA Technology", "Cultural Performance Translation", "Director-Consistent AI", "20 Languages × 1 Character"].map((b, i) => (
              <div key={b} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 100, padding: "7px 16px", fontSize: 11, color: C.mid }}>{b}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ── NAV ────────────────────────────────────────────── */}
      <div style={{ position: "sticky", top: 0, zIndex: 200, background: `${C.bg}f0`, backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 3, padding: "10px 16px", overflowX: "auto", alignItems: "center" }}>
        {SLIDES.map(s => (
          <button key={s.id} className="tab-btn" onClick={() => setSlide(s.id)} style={{
            background: slide === s.id ? C.gold : "transparent",
            color: slide === s.id ? "#0a0808" : C.dim,
            border: `1px solid ${slide === s.id ? C.gold : C.border}`,
            borderRadius: 8, padding: "8px 14px", cursor: "pointer",
            fontSize: 10, fontWeight: 700, whiteSpace: "nowrap",
            letterSpacing: 1, fontFamily: "'DM Mono',monospace",
            boxShadow: slide === s.id ? `0 0 20px ${C.gold}30` : "none",
          }}>
            <span style={{ opacity: .5, marginRight: 6 }}>{s.num}</span>{s.label}
          </button>
        ))}
        <div style={{ marginLeft: "auto", paddingLeft: 12, borderLeft: `1px solid ${C.border}` }}>
          <SL color={C.dim}>NOIZYVOX × VSI</SL>
        </div>
      </div>

      {/* ── CONTENT ────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 24px 100px", animation: "fadeIn .4s ease-out" }}>

        {/* ══ SLIDE: THE PARADOX ══════════════════════════════════ */}
        {slide === "paradox" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <SL color={C.gold}>Slide 01 — The Impossible Problem</SL>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(32px,5vw,64px)", fontWeight: 700, lineHeight: 1.05, color: C.white, margin: "18px 0 20px" }}>
                The Localization Paradox
              </h2>
              <p style={{ fontSize: 13, color: C.mid, maxWidth: 560, margin: "0 auto", lineHeight: 1.9 }}>
                Every current solution sacrifices one for the other. The industry has accepted this as an impossible tradeoff. Until now.
              </p>
            </div>

            {/* Two approaches */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 1fr", gap: 0, marginBottom: 52, alignItems: "stretch" }}>
              {/* Approach 1 */}
              <div style={{ background: C.redSoft, border: `1px solid ${C.red}22`, borderRadius: "20px 0 0 20px", padding: "36px 32px" }}>
                <SL color={C.red}>Approach 01 — Current</SL>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, color: C.white, margin: "12px 0 8px", lineHeight: 1.2 }}>Preserve Original Performance</h3>
                <p style={{ fontSize: 12, color: C.mid, lineHeight: 1.8, marginBottom: 24 }}>Try to match the English voice actor's delivery exactly in every language.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                  <div style={{ display: "flex", gap: 9, padding: "9px 13px", background: "#00ff4410", border: `1px solid #00ff4422`, borderRadius: 9 }}>
                    <span style={{ color: C.green, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 11, color: C.mid }}>Character stays consistent</span>
                  </div>
                  {["Sounds like a foreigner in the local language", "Cultural performance feels 'wrong'", "Regional audiences reject it as inauthentic"].map(f => (
                    <div key={f} style={{ display: "flex", gap: 9, padding: "9px 13px", background: C.redSoft, border: `1px solid ${C.red}20`, borderRadius: 9 }}>
                      <span style={{ color: C.red, flexShrink: 0 }}>✗</span>
                      <span style={{ fontSize: 11, color: C.mid }}>{f}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "14px 16px", background: C.film, borderRadius: 10, border: `1px solid ${C.border}` }}>
                  <SL color={C.dim}>Real Example</SL>
                  <div style={{ fontSize: 11, color: C.mid, marginTop: 8, lineHeight: 1.8, fontStyle: "italic" }}>
                    Detective says "I've seen enough" with American cynicism. Japanese actor <em>tries</em> to mimic American cynicism. Japanese detectives don't perform cynicism that way. Sounds wrong to every Japanese viewer.
                  </div>
                </div>
              </div>

              {/* VS divider */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: C.card, border: `1px solid ${C.border}` }}>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, color: C.gold, fontWeight: 700, fontStyle: "italic" }}>vs</span>
              </div>

              {/* Approach 2 */}
              <div style={{ background: C.redSoft, border: `1px solid ${C.red}22`, borderRadius: "0 20px 20px 0", padding: "36px 32px" }}>
                <SL color={C.red}>Approach 02 — Current</SL>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, color: C.white, margin: "12px 0 8px", lineHeight: 1.2 }}>Adapt to Local Culture</h3>
                <p style={{ fontSize: 12, color: C.mid, lineHeight: 1.8, marginBottom: 24 }}>Cast local actors, let them interpret the character through their cultural lens.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                  <div style={{ display: "flex", gap: 9, padding: "9px 13px", background: "#00ff4410", border: `1px solid #00ff4422`, borderRadius: 9 }}>
                    <span style={{ color: C.green, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 11, color: C.mid }}>Culturally authentic performance</span>
                  </div>
                  {["Character becomes completely different per region", "No consistency in the emotional arc", "Players in different countries play different games"].map(f => (
                    <div key={f} style={{ display: "flex", gap: 9, padding: "9px 13px", background: C.redSoft, border: `1px solid ${C.red}20`, borderRadius: 9 }}>
                      <span style={{ color: C.red, flexShrink: 0 }}>✗</span>
                      <span style={{ fontSize: 11, color: C.mid }}>{f}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "14px 16px", background: C.film, borderRadius: 10, border: `1px solid ${C.border}` }}>
                  <SL color={C.dim}>Real Example</SL>
                  <div style={{ fontSize: 11, color: C.mid, marginTop: 8, lineHeight: 1.8, fontStyle: "italic" }}>
                    American: Gruff, sarcastic detective. Japanese: Stoic, honor-bound detective. French: Philosophical, existential detective. <strong style={{ color: C.red }}>These are three different characters.</strong> Players experience different stories.
                  </div>
                </div>
              </div>
            </div>

            {/* The Solution Teaser */}
            <div style={{ textAlign: "center", padding: "56px 40px", background: C.card, border: `1px solid ${C.gold}33`, borderRadius: 24, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at center,${C.gold}08,transparent 65%)`, pointerEvents: "none" }} />
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(to right,transparent,${C.gold},transparent)` }} />
              <SL color={C.gold}>The NOIZYVOX Answer</SL>
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(24px,4vw,48px)", fontWeight: 700, color: C.white, margin: "18px auto 20px", maxWidth: 800, lineHeight: 1.15, fontStyle: "italic" }}>
                "What if the character's <span style={{ color: C.gold }}>emotional DNA</span> was immutable — while the <span style={{ color: C.amber }}>cultural execution</span> adapted perfectly to every region?"
              </h3>
              <p style={{ fontSize: 13, color: C.mid, maxWidth: 560, margin: "0 auto 28px", lineHeight: 1.9 }}>
                One character. Twenty languages. Perfect consistency. Total authenticity. For the first time in history — both, simultaneously.
              </p>
              <button onClick={() => setSlide("dna")} style={{ background: C.gold, border: "none", borderRadius: 10, padding: "13px 28px", cursor: "pointer", fontSize: 12, fontWeight: 800, color: "#0a0808", fontFamily: "'DM Mono',monospace", letterSpacing: 2, transition: "all .2s" }} onMouseEnter={e => e.target.style.transform = "scale(1.04)"} onMouseLeave={e => e.target.style.transform = "scale(1)"}>
                SEE HOW IT WORKS →
              </button>
            </div>
          </div>
        )}

        {/* ══ SLIDE: THE COST ═════════════════════════════════════ */}
        {slide === "cost" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <SL color={C.amber}>Slide 02 — Why This Matters</SL>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(30px,5vw,60px)", fontWeight: 700, color: C.white, margin: "18px 0 20px" }}>
                The Cost of the Paradox
              </h2>
              <p style={{ fontSize: 13, color: C.mid, maxWidth: 580, margin: "0 auto", lineHeight: 1.9 }}>
                Studios spend $50M building a character players love — then $10M trying to recreate that character in 20 languages. They fail. Every single time.
              </p>
            </div>

            {/* Money breakdown */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18, marginBottom: 48 }}>
              {[
                { a: "$50M", l: "Game Development", d: "Building the world, the characters, the story", c: C.white },
                { a: "$10M", l: "English Voice Acting", d: "Creating characters players fall in love with", c: C.gold },
                { a: "$10M", l: "Localization", d: "Trying — and failing — to recreate those characters in 20 languages", c: C.red },
              ].map(s => (
                <div key={s.l} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: "28px 24px", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Bebas Neue',serif", fontSize: 56, color: s.c, letterSpacing: 2, lineHeight: 1 }}>{s.a}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 600, color: C.white, margin: "10px 0 8px" }}>{s.l}</div>
                  <div style={{ fontSize: 11, color: C.mid, lineHeight: 1.7 }}>{s.d}</div>
                </div>
              ))}
            </div>

            {/* Current workflow breakdown */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 36 }}>
              <div style={{ background: C.redSoft, border: `1px solid ${C.red}20`, borderRadius: 18, padding: "30px 28px" }}>
                <SL color={C.red}>VSI's Current Workflow — Painful</SL>
                <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    ["1.", "LA studio records English — character is fully defined"],
                    ["2.", "Scripts + reference audio shipped to 20 regional studios"],
                    ["3.", "Each regional director interprets through their cultural lens"],
                    ["4.", "Each actor performs based on local director's interpretation"],
                    ["5.", "Result: 20 different versions of the 'same' character"],
                  ].map(([n, t]) => (
                    <div key={n} style={{ display: "flex", gap: 10, padding: "10px 14px", background: C.film, borderRadius: 9, border: `1px solid ${C.border}` }}>
                      <span style={{ color: C.red, flexShrink: 0, minWidth: 22, fontWeight: 700, fontSize: 12 }}>{n}</span>
                      <span style={{ fontSize: 12, color: C.mid, lineHeight: 1.7 }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: "30px 28px" }}>
                <SL color={C.dim}>VSI's Quality Control Nightmare</SL>
                <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { city: "Tokyo", issue: "Makes Morrison too stoic — loses the New York grit", col: "#e8c5a0" },
                    { city: "Paris", issue: "Makes Morrison too theatrical — loses the working-class edge", col: "#b8d4ff" },
                    { city: "Berlin", issue: "Makes Morrison too aggressive — loses the dark humor", col: "#ffd4a0" },
                    { city: "Cairo", issue: "Makes Morrison too philosophical — loses the urgency", col: "#ffa0a0" },
                  ].map(({ city, issue, col }) => (
                    <div key={city} style={{ padding: "10px 14px", background: C.film, borderRadius: 9, border: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: 10, color: col, letterSpacing: 3, textTransform: "uppercase", fontFamily: "'DM Mono',monospace" }}>{city}</span>
                      <div style={{ fontSize: 11, color: C.mid, marginTop: 4, lineHeight: 1.7, fontStyle: "italic" }}>{issue}</div>
                    </div>
                  ))}
                  <div style={{ padding: "12px 14px", background: C.redSoft, border: `1px solid ${C.red}25`, borderRadius: 9, marginTop: 4 }}>
                    <div style={{ fontSize: 12, color: C.red, fontStyle: "italic" }}>No one is wrong. But they're all different. VSI spends millions on "alignment meetings." Still fails.</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center", padding: "36px 32px", background: C.goldSoft, border: `1px solid ${C.gold}30`, borderRadius: 18 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(20px,3vw,34px)", fontWeight: 700, color: C.white, maxWidth: 720, margin: "0 auto", fontStyle: "italic", lineHeight: 1.5 }}>
                "American players fall in love with Morrison. Japanese players meet a completely different character. The studio accidentally made <span style={{ color: C.red }}>20 different games.</span>"
              </div>
            </div>
          </div>
        )}

        {/* ══ SLIDE: CHARACTER DNA ════════════════════════════════ */}
        {slide === "dna" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <SL color={C.gold}>Slide 03 — The NOIZYVOX Solution</SL>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(30px,5vw,64px)", fontWeight: 700, color: C.white, margin: "18px 0 20px", lineHeight: 1.05 }}>
                Character DNA +<br /><span style={{ color: C.gold, fontStyle: "italic" }}>Cultural Translation</span>
              </h2>
              <p style={{ fontSize: 13, color: C.mid, maxWidth: 580, margin: "0 auto", lineHeight: 1.9 }}>
                We separate what's <em>immutable</em> about a character from how that character <em>must</em> be expressed in any given culture. The first is locked forever. The second adapts perfectly.
              </p>
            </div>

            {/* 3 Steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 48 }}>
              {[
                {
                  step: "01", color: C.gold, title: "Capture Character DNA (DreamChamber)",
                  desc: "When Robert records Detective Morrison, we're not just capturing his voice. We're capturing the immutable performance architecture:",
                  pts: [
                    ["Emotional Geometry", "How he builds tension — slow burn vs. explosive"],
                    ["Silence Architecture", "When he pauses for effect, when he rushes"],
                    ["Breath Patterns", "Where he breathes, how deep, how controlled"],
                    ["Subtext Delivery", "How he says one thing but means another"],
                    ["Moral Weight", "How exhaustion sits in his voice"],
                    ["Humor Markers", "How he uses sarcasm as a defense mechanism"],
                  ],
                  tag: "IMMUTABLE — This is 'Morrison-ness'",
                },
                {
                  step: "02", color: C.amber, title: "Map DNA to Regional Performance Frameworks",
                  desc: "American cynicism ≠ Japanese cynicism ≠ French cynicism. But they're all expressing the SAME underlying emotion. The AI translates the INTENTION, not the execution.",
                  pts: [
                    ["'I've seen too much'", "The shared emotional truth beneath every version"],
                    ["'Trust is a luxury'", "Morrison's core worldview — immutable across cultures"],
                    ["English delivery", "Sharp sarcasm, clipped words, aggressive humor"],
                    ["Japanese delivery", "Controlled restraint, weighted pauses, subtle bitterness"],
                    ["French delivery", "Philosophical resignation, existential weariness"],
                    ["Arabic delivery", "Fatalistic wisdom, spiritual disillusionment"],
                  ],
                  tag: "TRANSLATION — Intention preserved, execution adapted",
                },
                {
                  step: "03", color: C.teal, title: "Performance Lock Across All Languages",
                  desc: "A director in ANY region can give the SAME note and get the SAME emotional result. The character doesn't drift. The emotional arc is locked.",
                  pts: [
                    ["Same note", "'More weariness' → identical emotional result in 20 languages"],
                    ["Different execution", "Each version sounds culturally native, authentically local"],
                    ["No alignment meetings", "The AI maintains alignment automatically"],
                    ["No character drift", "Morrison is Morrison in every language, every time"],
                    ["Directors trust it", "Same directability as a real actor — in every language"],
                    ["For the first time", "20 languages. 1 character arc. Perfect."],
                  ],
                  tag: "LOCKED — One character. Twenty languages. Perfect.",
                },
              ].map(s => (
                <div key={s.step} style={{ background: C.card, border: `1px solid ${s.color}22`, borderRadius: 20, padding: "0", overflow: "hidden" }}>
                  <div style={{ height: 2, background: `linear-gradient(to right,${s.color},transparent)` }} />
                  <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 0 }}>
                    <div style={{ padding: "28px 24px", borderRight: `1px solid ${C.border}`, minWidth: 90, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <div style={{ fontFamily: "'Bebas Neue',serif", fontSize: 52, color: s.color, lineHeight: 1, letterSpacing: 2 }}>{s.step}</div>
                      <div style={{ width: 2, flex: 1, background: `linear-gradient(to bottom,${s.color}66,transparent)`, borderRadius: 2 }} />
                    </div>
                    <div style={{ padding: "28px 28px" }}>
                      <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 700, color: C.white, marginBottom: 10 }}>{s.title}</h3>
                      <p style={{ fontSize: 12, color: C.mid, lineHeight: 1.8, marginBottom: 20 }}>{s.desc}</p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 8, marginBottom: 16 }}>
                        {s.pts.map(([k, v]) => (
                          <div key={k} style={{ padding: "9px 13px", background: C.film, borderRadius: 9, border: `1px solid ${C.border}` }}>
                            <div style={{ fontSize: 10, color: s.color, letterSpacing: 2, textTransform: "uppercase", marginBottom: 3 }}>{k}</div>
                            <div style={{ fontSize: 11, color: C.mid, lineHeight: 1.6 }}>{v}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "inline-block", background: s.color + "18", border: `1px solid ${s.color}33`, borderRadius: 100, padding: "5px 14px", fontSize: 10, color: s.color, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono',monospace" }}>{s.tag}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* The breakthrough */}
            <div style={{ padding: "44px 40px", background: C.goldSoft, border: `1px solid ${C.gold}30`, borderRadius: 22, textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: `radial-gradient(${C.gold}07,transparent 70%)`, pointerEvents: "none" }} />
              <SL color={C.gold}>The Revolutionary Result</SL>
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(22px,3.5vw,44px)", fontWeight: 700, color: C.white, margin: "18px auto 16px", maxWidth: 860, lineHeight: 1.2 }}>
                The Emotional Arc Is Identical.<br /><span style={{ color: C.gold, fontStyle: "italic" }}>The Cultural Execution Is Authentic.</span>
              </h3>
              <p style={{ fontSize: 12, color: C.mid, maxWidth: 560, margin: "0 auto", lineHeight: 1.9 }}>
                Japanese players feel the same emotional beats as American players. French players experience the same character arc. Arabic players meet the same Morrison. Culturally native in every language. Emotionally identical across all of them.
              </p>
            </div>
          </div>
        )}

        {/* ══ SLIDE: LIVE DEMO ════════════════════════════════════ */}
        {slide === "demo" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <SL color={C.gold}>Slide 04 — Live Demo</SL>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(28px,5vw,58px)", fontWeight: 700, color: C.white, margin: "18px 0 16px" }}>
                Detective Morrison<br /><span style={{ color: C.gold, fontStyle: "italic" }}>Five Languages. One Character.</span>
              </h2>
              <div style={{ display: "inline-block", background: C.goldSoft, border: `1px solid ${C.gold}33`, borderRadius: 12, padding: "12px 22px", marginBottom: 12 }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(16px,2.5vw,24px)", fontStyle: "italic", color: C.white }}>
                  "I've seen enough bodies to know when someone's lying."
                </div>
              </div>
              <div style={{ fontSize: 11, color: C.dim, marginBottom: 28 }}>
                Same line. Same character. Same emotional DNA. Five completely different cultural performances.
              </div>
              <button onClick={playDemo} disabled={demoPlaying} style={{ background: demoPlaying ? C.dim : C.gold, border: "none", borderRadius: 10, padding: "13px 28px", cursor: demoPlaying ? "default" : "pointer", fontSize: 12, fontWeight: 800, color: demoPlaying ? C.mid : "#0a0808", fontFamily: "'DM Mono',monospace", letterSpacing: 2, transition: "all .2s" }}>
                {demoPlaying ? "⬛ PLAYING ALL 5 VERSIONS..." : "▶ PLAY ALL 5 VERSIONS"}
              </button>
            </div>

            {/* Culture selector */}
            <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap", justifyContent: "center" }}>
              {CULTURES.map((c, i) => (
                <button key={i} onClick={() => setActiveDemo(i)} style={{
                  background: activeDemo === i ? c.color + "20" : C.card,
                  border: `2px solid ${activeDemo === i ? c.color : C.border}`,
                  borderRadius: 12, padding: "10px 18px", cursor: "pointer",
                  color: activeDemo === i ? c.color : C.dim, fontSize: 12,
                  fontWeight: 700, transition: "all .2s", fontFamily: "'DM Mono',monospace",
                  boxShadow: activeDemo === i ? `0 0 20px ${c.color}22` : "none",
                  position: "relative",
                }}>
                  {c.flag} {c.lang}
                  {playedCultures.includes(i) && !demoPlaying && (
                    <span style={{ position: "absolute", top: -6, right: -6, width: 14, height: 14, background: C.green, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#000", fontWeight: 800 }}>✓</span>
                  )}
                  {demoPlaying && playedCultures.includes(i) && (
                    <span style={{ position: "absolute", top: -6, right: -6, width: 14, height: 14, background: C.amber, borderRadius: "50%", animation: "pring 1s ease-out infinite" }} />
                  )}
                </button>
              ))}
            </div>

            {/* Active culture detail */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 20, marginBottom: 24 }}>
              <div style={{ background: C.card, border: `1px solid ${cu.color}33`, borderRadius: 20, padding: "32px 28px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(to right,${cu.color},transparent)` }} />
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 22 }}>
                  <div style={{ fontSize: 48, lineHeight: 1 }}>{cu.flag}</div>
                  <div>
                    <SL color={cu.color}>{cu.lang} — {cu.city}</SL>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: C.white, marginTop: 6 }}>{cu.archetype}</div>
                  </div>
                </div>

                {/* The line */}
                <div style={{ padding: "16px 18px", background: cu.color + "0e", border: `1px solid ${cu.color}22`, borderRadius: 12, marginBottom: 20 }}>
                  <SL color={cu.color}>The Line</SL>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(14px,2vw,20px)", color: C.white, marginTop: 8, fontStyle: "italic", lineHeight: 1.5 }}>"{cu.line}"</div>
                  <div style={{ fontSize: 11, color: C.mid, marginTop: 8, fontStyle: "italic" }}>Subtext: "{cu.subtext}"</div>
                </div>

                {/* Waveform */}
                <Wave color={cu.color} bars={40} h={52} active={demoPlaying && playedCultures.includes(activeDemo)} />

                {/* DNA alignment */}
                <div style={{ marginTop: 18, padding: "12px 16px", background: C.film, borderRadius: 10, border: `1px solid ${C.border}` }}>
                  <SL color={C.dim}>Character DNA Alignment</SL>
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${cu.dna_contribution}%`, background: `linear-gradient(to right,${cu.color}88,${cu.color})`, borderRadius: 2, transition: "width 1.2s ease-out" }} />
                    </div>
                    <span style={{ fontFamily: "'Bebas Neue',serif", fontSize: 20, color: cu.color, letterSpacing: 1 }}>{cu.dna_contribution}%</span>
                  </div>
                  <div style={{ fontSize: 10, color: C.dim, marginTop: 5 }}>Morrison's emotional DNA preserved in {cu.lang} performance</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "22px 22px" }}>
                  <SL color={C.dim}>Cultural Performance Framework</SL>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: C.white, margin: "8px 0 6px", fontWeight: 600 }}>{cu.framework}</div>
                  <div style={{ fontSize: 12, color: C.mid, lineHeight: 1.7 }}>{cu.execution}</div>
                </div>
                {[
                  { k: "BREATH", v: cu.breath },
                  { k: "SILENCE", v: cu.silence },
                ].map(({ k, v }) => (
                  <div key={k} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px" }}>
                    <SL color={cu.color}>{k} Architecture</SL>
                    <div style={{ fontSize: 12, color: C.mid, marginTop: 8, lineHeight: 1.7, fontStyle: "italic" }}>{v}</div>
                  </div>
                ))}
                {[
                  { emotion: "WEARINESS", data: cu.weariness, c: C.mid },
                  { emotion: "ANGER", data: cu.anger, c: C.amber },
                  { emotion: "VULNERABILITY", data: cu.vulnerability, c: cu.color },
                ].map(({ emotion, data, c }) => (
                  <div key={emotion} style={{ background: C.film, border: `1px solid ${C.border}`, borderRadius: 13, padding: "14px 16px" }}>
                    <SL color={c}>{emotion} — Morrison through {cu.lang} lens</SL>
                    <div style={{ fontSize: 12, color: C.mid, marginTop: 7, lineHeight: 1.7 }}>{data}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* All 5 comparison grid */}
            <div>
              <SL color={C.dim}>All 5 Performances — Emotional DNA Preserved</SL>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginTop: 14 }}>
                {CULTURES.map((c, i) => (
                  <div key={i} className="culture-card" onClick={() => setActiveDemo(i)} style={{
                    background: activeDemo === i ? c.color + "14" : C.card,
                    border: `1px solid ${activeDemo === i ? c.color + "55" : C.border}`,
                    borderRadius: 14, padding: "16px 14px", textAlign: "center",
                    boxShadow: activeDemo === i ? `0 0 24px ${c.color}18` : "none",
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{c.flag}</div>
                    <SL color={c.color}>{c.lang}</SL>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: C.mid, marginTop: 6, lineHeight: 1.5 }}>{c.archetype}</div>
                    <Wave color={c.color} bars={16} h={28} active={demoPlaying && playedCultures.includes(i)} />
                    <div style={{ marginTop: 8, height: 2, background: C.border, borderRadius: 1, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${c.dna_contribution}%`, background: `linear-gradient(to right,${c.color}66,${c.color})` }} />
                    </div>
                    <div style={{ fontSize: 9, color: C.dim, marginTop: 3 }}>{c.dna_contribution}% DNA</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, padding: "16px 20px", background: C.goldSoft, border: `1px solid ${C.gold}25`, borderRadius: 12, textAlign: "center" }}>
                <div style={{ fontSize: 13, color: C.gold, fontStyle: "italic", fontFamily: "'Cormorant Garamond',serif" }}>
                  Ask the VSI executives: "Are these the same character?" The answer is always yes.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ SLIDE: DIRECTOR TEST ════════════════════════════════ */}
        {slide === "director" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <SL color={C.amber}>Slide 05 — The Director Test</SL>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(28px,5vw,58px)", fontWeight: 700, color: C.white, margin: "18px 0 16px" }}>
                Give the Same Note.<br /><span style={{ color: C.gold, fontStyle: "italic" }}>Get the Same Emotion.</span>
              </h2>
              <p style={{ fontSize: 13, color: C.mid, maxWidth: 580, margin: "0 auto", lineHeight: 1.9 }}>
                Select a directorial note. NOIZYVOX applies Character DNA + Cultural Framework in every language simultaneously. Directors never need alignment meetings again.
              </p>
            </div>

            {/* Note selector */}
            <div style={{ display: "flex", gap: 10, marginBottom: 32, flexWrap: "wrap", justifyContent: "center" }}>
              {DIRECTOR_NOTES.map((n, i) => (
                <button key={i} onClick={() => triggerNote(i)} style={{
                  background: activeNote === i ? C.gold + "20" : C.card,
                  border: `1px solid ${activeNote === i ? C.gold : C.border}`,
                  borderRadius: 12, padding: "12px 18px", cursor: "pointer",
                  color: activeNote === i ? C.gold : C.mid, fontSize: 12,
                  fontWeight: 700, transition: "all .2s", fontFamily: "'DM Mono',monospace",
                  maxWidth: 200, textAlign: "center",
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{n.icon}</div>
                  <div style={{ lineHeight: 1.4 }}>{n.note.split("—")[0].trim()}</div>
                </button>
              ))}
            </div>

            {/* The note */}
            <div style={{ padding: "20px 28px", background: C.goldSoft, border: `1px solid ${C.gold}30`, borderRadius: 14, marginBottom: 28, textAlign: "center" }}>
              <SL color={C.gold}>Director's Note — Applied Simultaneously to All 5 Languages</SL>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(18px,3vw,30px)", color: C.white, marginTop: 10, fontStyle: "italic" }}>
                "{DIRECTOR_NOTES[activeNote].note}"
              </div>
            </div>

            {/* Responses */}
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              {CULTURES.map((c, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 0, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden", animation: noteTriggered ? `slide-in ${.15 + i * .1}s ease-out both` : "none" }}>
                  <div style={{ padding: "18px 18px", background: c.color + "0e", borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <div style={{ fontSize: 28 }}>{c.flag}</div>
                    <SL color={c.color}>{c.lang}</SL>
                    <div style={{ fontSize: 10, color: C.dim, textAlign: "center", lineHeight: 1.4 }}>{c.archetype}</div>
                    <Wave color={c.color} bars={14} h={24} active={noteTriggered} />
                  </div>
                  <div style={{ padding: "18px 22px" }}>
                    <SL color={C.dim}>NOIZYVOX Response — Character DNA + {c.lang} Cultural Framework</SL>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(14px,2vw,18px)", color: C.white, marginTop: 8, lineHeight: 1.6, fontStyle: "italic" }}>
                      "{DIRECTOR_NOTES[activeNote].responses[i]}"
                    </div>
                    <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ background: c.color + "14", border: `1px solid ${c.color}28`, borderRadius: 100, padding: "3px 10px", fontSize: 9, color: c.color }}>Morrison DNA: {c.dna_contribution}%</span>
                      <span style={{ background: C.film, border: `1px solid ${C.border}`, borderRadius: 100, padding: "3px 10px", fontSize: 9, color: C.dim }}>{c.framework}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* The proof */}
            <div style={{ marginTop: 28, padding: "36px 36px", background: C.goldSoft, border: `1px solid ${C.gold}28`, borderRadius: 20, textAlign: "center" }}>
              <SL color={C.gold}>The Proof</SL>
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(20px,3vw,38px)", fontWeight: 700, color: C.white, margin: "16px auto", maxWidth: 800, lineHeight: 1.25 }}>
                Five languages. Five culturally authentic performances. <span style={{ color: C.gold, fontStyle: "italic" }}>Emotionally identical across all of them.</span>
              </h3>
              <p style={{ fontSize: 12, color: C.mid, maxWidth: 520, margin: "0 auto", lineHeight: 1.9 }}>
                VSI's directors don't need alignment meetings. They don't need cross-cultural briefings. They give the note. NOIZYVOX handles the rest. For the first time in 30 years, the character doesn't drift.
              </p>
            </div>
          </div>
        )}

        {/* ══ SLIDE: VSI DEAL ═════════════════════════════════════ */}
        {slide === "vsi" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <SL color={C.teal}>Slide 06 — The Partnership</SL>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(28px,5vw,58px)", fontWeight: 700, color: C.white, margin: "18px 0 20px" }}>
                Why VSI Signs This Deal
              </h2>
              <p style={{ fontSize: 13, color: C.mid, maxWidth: 560, margin: "0 auto", lineHeight: 1.9 }}>
                NOIZYVOX doesn't replace VSI's cultural expertise. It amplifies it into a capability nobody else on earth has.
              </p>
            </div>

            {/* Workflow comparison */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 1fr", gap: 0, marginBottom: 44 }}>
              <div style={{ background: C.redSoft, border: `1px solid ${C.red}20`, borderRadius: "18px 0 0 18px", padding: "32px 28px" }}>
                <SL color={C.red}>VSI Today — 6 Steps to Inconsistency</SL>
                <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    "LA studio records English — character defined",
                    "Scripts + audio shipped to 20 regional studios",
                    "Regional director interprets through their lens",
                    "Regional actor performs to local interpretation",
                    "QC nightmare: 20 versions of Morrison, all different",
                    "Millions in alignment meetings. Never fully solved.",
                  ].map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "9px 13px", background: C.film, borderRadius: 9, border: `1px solid ${C.border}` }}>
                      <span style={{ color: C.red, flexShrink: 0, minWidth: 20, fontSize: 11, fontWeight: 700 }}>{i + 1}.</span>
                      <span style={{ fontSize: 11, color: C.mid, lineHeight: 1.6 }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: C.card, border: `1px solid ${C.border}` }}>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, color: C.gold, fontWeight: 700 }}>→</span>
              </div>
              <div style={{ background: C.greenSoft, border: `1px solid ${C.green}20`, borderRadius: "0 18px 18px 0", padding: "32px 28px" }}>
                <SL color={C.green}>VSI + NOIZYVOX — 5 Steps to Perfect</SL>
                <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    "DreamChamber captures Morrison's Character DNA — one session",
                    "NOIZYVOX generates English performance — DNA locked",
                    "VSI regional studios provide cultural consulting notes",
                    "NOIZYVOX applies notes while maintaining Character DNA",
                    "20 regionally authentic performances — emotionally identical",
                  ].map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "9px 13px", background: C.film, borderRadius: 9, border: `1px solid ${C.border}` }}>
                      <span style={{ color: C.green, flexShrink: 0, minWidth: 20, fontSize: 11, fontWeight: 700 }}>{i + 1}.</span>
                      <span style={{ fontSize: 11, color: C.mid, lineHeight: 1.6 }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* VSI's value preserved */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 36 }}>
              {[
                { icon: "🌍", title: "Cultural Expertise", desc: "VSI still provides irreplaceable human cultural intelligence — 36 years of it. NOIZYVOX makes that expertise go further.", color: C.teal },
                { icon: "🤝", title: "Client Relationships", desc: "VSI still manages every client relationship. NOIZYVOX is the invisible AI layer that makes deliverables extraordinary.", color: C.gold },
                { icon: "⭐", title: "Regional Authenticity", desc: "VSI's reputation for authentic localization is amplified — not replaced. The AI executes what their experts prescribe.", color: C.amber },
              ].map(s => (
                <div key={s.title} style={{ background: C.card, border: `1px solid ${s.color}22`, borderRadius: 16, padding: "24px 22px", textAlign: "center" }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{s.icon}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: C.white, marginBottom: 8 }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: C.mid, lineHeight: 1.7 }}>{s.desc}</div>
                  <div style={{ marginTop: 12, padding: "6px 12px", background: s.color + "14", border: `1px solid ${s.color}22`, borderRadius: 100, display: "inline-block" }}>
                    <span style={{ fontSize: 10, color: s.color }}>PRESERVED + AMPLIFIED</span>
                  </div>
                </div>
              ))}
            </div>

            {/* The 3-sentence pitch */}
            <div style={{ padding: "44px 40px", background: C.goldSoft, border: `1px solid ${C.gold}28`, borderRadius: 22, textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(to right,transparent,${C.gold},transparent)` }} />
              <SL color={C.gold}>The Three-Sentence Pitch</SL>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(17px,2.5vw,28px)", color: C.white, margin: "20px auto", maxWidth: 900, lineHeight: 1.75, fontStyle: "italic" }}>
                "VSI has 36 years of cultural excellence and 720 humans who understand language. NOIZYVOX has the AI layer that locks Character DNA so it never drifts — while VSI's cultural experts ensure every regional performance is authentically local. Together, VSI delivers{" "}
                <strong style={{ color: C.gold }}>perfect character consistency AND regional authenticity for the first time in localization history.</strong>"
              </p>
            </div>
          </div>
        )}

        {/* ══ SLIDE: REVENUE ══════════════════════════════════════ */}
        {slide === "revenue" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <SL color={C.green}>Slide 07 — The Revenue Model</SL>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(28px,5vw,56px)", fontWeight: 700, color: C.white, margin: "18px 0 20px" }}>
                The Business Case
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18, marginBottom: 36 }}>
              {[
                { n: "$70M", l: "Cost of current AAA game + localization", d: "$50M dev + $10M voice acting + $10M broken localization", c: C.red },
                { n: "80%", l: "Potential localization cost reduction", d: "NOIZYVOX eliminates alignment meetings, reshoots, and QC failures", c: C.green },
                { n: "20×", l: "Character reach multiplier", d: "One DreamChamber session unlocks 20 culturally authentic performances", c: C.gold },
              ].map(s => (
                <div key={s.l} style={{ background: C.card, border: `1px solid ${s.c}22`, borderRadius: 18, padding: "26px 22px", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Bebas Neue',serif", fontSize: 56, color: s.c, letterSpacing: 2, lineHeight: 1 }}>{s.n}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: C.white, margin: "10px 0 8px", fontWeight: 600, lineHeight: 1.3 }}>{s.l}</div>
                  <div style={{ fontSize: 11, color: C.mid, lineHeight: 1.7 }}>{s.d}</div>
                </div>
              ))}
            </div>

            {/* Revenue streams */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 32 }}>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: "28px 26px" }}>
                <SL color={C.gold}>NOIZYVOX Revenue Streams</SL>
                <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    ["DreamChamber Capture", "$5,000–15,000 per character DNA session"],
                    ["Per-Language Generation", "$500–2,000 per language per character"],
                    ["Director Interface License", "$10,000–50,000/mo per studio"],
                    ["AAA Game Packages", "$100,000–500,000 per full game localization"],
                    ["VSI Revenue Share", "15–20% of all VSI contracts using NOIZYVOX"],
                    ["Performance Lock Maintenance", "$2,000–5,000/month per active IP"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ padding: "10px 14px", background: C.film, borderRadius: 9, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 10, color: C.gold, letterSpacing: 2, textTransform: "uppercase", marginBottom: 3 }}>{k}</div>
                      <div style={{ fontSize: 11, color: C.mid }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: "28px 26px" }}>
                <SL color={C.teal}>VSI Revenue Impact</SL>
                <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    ["Current AAA contract", "$2–5M for 20-language localization"],
                    ["With NOIZYVOX", "Same contract. 40% margin improvement."],
                    ["New competitive offer", "Guarantee character consistency — only VSI can offer this"],
                    ["New market segments", "Clients who abandoned localization due to quality concerns"],
                    ["Speed advantage", "20 languages delivered 3× faster with DNA lock"],
                    ["Premium positioning", "VSI becomes the only agency that can promise consistency"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ padding: "10px 14px", background: C.film, borderRadius: 9, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 10, color: C.teal, letterSpacing: 2, textTransform: "uppercase", marginBottom: 3 }}>{k}</div>
                      <div style={{ fontSize: 11, color: C.mid }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Proof of concept proposal */}
            <div style={{ padding: "40px 40px", background: C.goldSoft, border: `1px solid ${C.gold}28`, borderRadius: 22, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(to right,transparent,${C.gold},transparent)` }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "center" }}>
                <div>
                  <SL color={C.gold}>Proof of Concept Proposal</SL>
                  <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(22px,3vw,38px)", fontWeight: 700, color: C.white, margin: "14px 0 14px", lineHeight: 1.2 }}>
                    One AAA Game.<br />3-Month Test.<br /><span style={{ color: C.gold, fontStyle: "italic" }}>VSI Signs Based on Results.</span>
                  </h3>
                  <p style={{ fontSize: 12, color: C.mid, lineHeight: 1.85 }}>
                    NOIZYVOX handles Character DNA capture for 3 key characters. VSI provides cultural consulting for 5 languages. Together we deliver the demo that proves everything — and prices the full contract.
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    ["Month 1", "DreamChamber: Capture DNA for 3 characters"],
                    ["Month 2", "Generate 5-language performances with VSI cultural notes"],
                    ["Month 3", "Director test with VSI QC team — prove consistency"],
                    ["Result", "VSI presents results to AAA studio client"],
                    ["Outcome", "Full contract signed. NOIZYVOX becomes standard VSI workflow."],
                  ].map(([t, d]) => (
                    <div key={t} style={{ display: "flex", gap: 10, padding: "9px 14px", background: C.film, borderRadius: 9, border: `1px solid ${C.border}` }}>
                      <span style={{ color: C.gold, flexShrink: 0, fontSize: 10, minWidth: 50 }}>{t}</span>
                      <span style={{ fontSize: 11, color: C.mid, lineHeight: 1.6 }}>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "36px 28px", textAlign: "center", position: "relative" }}>
        {/* Film strip bottom */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 10, background: C.bg, display: "flex", gap: 3, padding: "0 16px", alignItems: "center" }}>
          {Array.from({ length: 60 }).map((_, i) => <div key={i} style={{ width: 8, height: 6, background: C.faint, borderRadius: 1, flexShrink: 0 }} />)}
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14, opacity: 0.35 }}>
          <Wave color={C.gold} bars={80} h={24} />
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: C.gold, fontStyle: "italic", marginBottom: 8 }}>
          "One Character. Twenty Languages. Perfect Consistency."
        </div>
        <SL color={C.dim}>NOIZYVOX × NOIZY.ai × Fish Music Inc. — Confidential — Rob Plowman</SL>
        <div style={{ marginTop: 12, fontSize: 10, color: C.faint }}>GORUNFREEX1000 — MC96ECOUNIVERSE — THE AQUARIUM — 40 Years of Creative Intelligence</div>
      </div>
    </div>
  );
}
