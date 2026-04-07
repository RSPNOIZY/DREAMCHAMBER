import React, { useState, useEffect, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════
//
//   THE ASCENSION MAP
//   AI + Humanity: The 10-Year Rise
//   2026 → 2036
//
//   "Flush the toxic systems straight out of the way and rise
//    into a universe where AI and humanity are fully aligned,
//    elevating creativity, ethics, and love to the absolute top."
//   — Rob Plowman, 2026
//
//   This is not a roadmap. Roadmaps stay on the ground.
//   This is an ascension chart. We are leaving the atmosphere.
//
// ═══════════════════════════════════════════════════════════════

const C = {
  void:     '#03030a',
  space:    '#050510',
  deep:     '#080820',
  atmos:    '#0a1020',
  sky:      '#0c1830',
  ground:   '#0e0808',
  border:   '#1e2040',
  warm:     '#1e1008',
  softblue: '#303060',
  mist:     '#7080a0',
  light:    '#c8d8f0',
  white:    '#f0f4ff',
  gold:     '#d4a020',
  goldlt:   '#f0c040',
  golddk:   '#806010',
  amber:    '#c07020',
  flame:    '#e04010',
  rose:     '#c04060',
  roselt:   '#e06080',
  sage:     '#408060',
  sagelt:   '#60a880',
  teal:     '#30a0c0',
  teallt:   '#50c8e8',
  violet:   '#6040c0',
  violetlt: '#9070e0',
  cyan:     '#20c0e0',
  cyanlt:   '#40e0ff',
  dawn:     '#e8a040',
  sunrise:  '#f0c060',
  zenith:   '#ffe090',
};

// ─── THE ASCENSION PHASES ──────────────────────────────────────
const PHASES = [
  {
    year:      '2026',
    level:     1,
    title:     'Ground Zero',
    subtitle:  'The Year of Declaration',
    color:     C.flame,
    lightColor:C.amber,
    skyColor:  C.ground,
    icon:      '◎',
    altitude:  'Ground · Atmosphere Entry',
    energy:    'IGNITION',
    flush: [
      'The silence — no one has named what\'s happening to creators',
      'The assumption that AI training theft is legally safe',
      'The idea that a musician\'s voice is not their property',
      'The belief that fair AI is commercially impossible',
    ],
    rise: [
      'The Guild is founded. The family has a name.',
      'The Declaration is signed. The theft is named.',
      'NOIZY.ai launches with Consent-as-Code live.',
      'The Fair Trade AI Audio Standard: 8 principles, all-or-nothing.',
      'GABRIEL_V3 activated. 315+ memory cells. The archive breathes.',
      'The Wisdom Project: living elders begin their preservation.',
    ],
    noizy:     'NOIZY launches as the first platform the Fair Trade Standard describes. Not aspirational — operational.',
    milestone: 'The Declaration is signed. The Guild has a fire at its center.',
    quote:     '"No limits, no boundaries, then we land safely back on earth."',
  },
  {
    year:      '2027',
    level:     2,
    title:     'The Roots Take Hold',
    subtitle:  'The Year of Standards',
    color:     C.rose,
    lightColor:C.roselt,
    skyColor:  C.atmos,
    icon:      '◈',
    altitude:  'Low Atmosphere · Turbulence Zone',
    energy:    'BREAKTHROUGH',
    flush: [
      'The unconsented training set as standard practice',
      'The music industry\'s passive acceptance of extraction',
      'Solo creators with no collective voice',
      'AI platforms operating without provenance requirements',
    ],
    rise: [
      'Jay Kerr-Wilson / Fasken engagement: SOCAN AI Training Rights license framework begins.',
      'Moez Kaba / Hueston Hennigan: first enforcement action on behalf of Guild members.',
      'Duncan Crabtree-Ireland joins the Founding Circle. SAG-AFTRA + Guild alignment.',
      'The first 100 Founding Creators sign their names. The signal is sent.',
      'NOIZY PROOF pilot: streaming platforms begin asking for provenance documentation.',
      'The Wisdom Project: 50 elder capsules sealed. WP-001 through WP-050.',
    ],
    noizy:     'NOIZY becomes the ethical reference case cited in every union negotiation involving AI.',
    milestone: 'SOCAN launches the world\'s first AI Training Rights collective license, using NOIZY\'s framework.',
    quote:     '"We need to find people who have heart, humanity, and want to succeed in the most important way."',
  },
  {
    year:      '2028',
    level:     3,
    title:     'Proof of Concept',
    subtitle:  'The Year of Evidence',
    color:     C.violet,
    lightColor:C.violetlt,
    skyColor:  C.deep,
    icon:      '▣',
    altitude:  'Mid Atmosphere · Clearing',
    energy:    'ACCELERATION',
    flush: [
      'The "fair use" defense for AI training — tested and failing in court',
      'The zero-cost-basis assumption on training data balance sheets',
      'The false equivalence between inspiration and ingestion',
      'Voice cloning without consent as standard product feature',
    ],
    rise: [
      'Andersen v. Stability AI reaches trial. Model inversion evidence admitted.',
      'First class action settlement forces retroactive creator payment.',
      'EU AI Act training data disclosure requirements: extractive platforms scramble.',
      'NOIZY\'s consent ledger admitted as evidence of what ethical compliance looks like.',
      'NOIZY PROOF adopted as streaming platform provenance standard.',
      'The Guild reaches 10,000 members across 40 countries.',
    ],
    noizy:     'Every lawsuit won against an extractive platform is a NOIZY member win. We built the infrastructure the law is now requiring.',
    milestone: 'First extractive AI audio platform forced to implement consent-and-compensation model.',
    quote:     '"The technology did not require this. The business model did."',
  },
  {
    year:      '2029',
    level:     4,
    title:     'The Coalition Forms',
    subtitle:  'The Year of Solidarity',
    color:     C.teal,
    lightColor:C.teallt,
    skyColor:  C.sky,
    icon:      '⬡',
    altitude:  'Upper Atmosphere · Thinning Resistance',
    energy:    'CONVERGENCE',
    flush: [
      'The genre hierarchy — Western classical as the "serious" tradition',
      'The invisible session player, the uncredited co-writer',
      'National music ecosystems siloed from each other',
      'AI as a Western tech industry product imposed globally',
    ],
    rise: [
      'Guild chapters established in Lagos, Mumbai, São Paulo, Seoul, London, Cairo.',
      'The Global Music Atlas goes live: every rhythm system, every scale, every tradition.',
      'NOIZYKIDZ launches: children learn music as a world culture, not a Western system.',
      'The Wisdom Project: 500 elder capsules. The largest living oral music archive ever assembled.',
      'AFM, MU (UK), and SAG-AFTRA all reference Guild standards in new contracts.',
      'The Creator Coalition: 50,000 independent artists with collective bargaining infrastructure.',
    ],
    noizy:     'NOIZY becomes the infrastructure layer for global collective music licensing — the SOCAN of the AI era, operating across 60 countries.',
    milestone: 'First Guild member in every inhabited continent.',
    quote:     '"The beatmaker in Lagos and the composer in Vienna are equally deserving of credit, payment, and protection."',
  },
  {
    year:      '2030',
    level:     5,
    title:     'The Tipping Point',
    subtitle:  'The Year the Model Changes',
    color:     C.sage,
    lightColor:C.sagelt,
    skyColor:  '#0a1828',
    icon:      '◉',
    altitude:  'Stratosphere Entry · Clear Sky Ahead',
    energy:    'TIPPING POINT',
    flush: [
      'The extractive AI model as financially viable — the debt comes due',
      'The last major platform operating without provenance documentation',
      'The belief that creator rights and platform profitability are in conflict',
      'Model collapse: AI trained on AI approaches quality zero',
    ],
    rise: [
      'Tipping point: Fair Trade AI becomes the expected standard, not the exceptional one.',
      'First Fortune 500 brand procurement policy requiring NOIZY PROOF provenance.',
      'The training data debt: first AI platform required to make retroactive payments.',
      'Ethical AI certification adopted by the Recording Academy and IFPI.',
      'GABRIEL reaches 1,000 memory cells. The most sophisticated music AI memory system alive.',
      'Guild membership: 100,000 creators. The largest creator rights organization in history.',
    ],
    noizy:     'NOIZY is no longer the ethical alternative. It is the standard. Other platforms are measured against what NOIZY built in 2026.',
    milestone: 'The Fair Trade AI Audio Standard becomes an international industry benchmark.',
    quote:     '"They built a fortress on sand. We built our foundation on consent. When the tide comes in, we are still standing."',
  },
  {
    year:      '2031–2032',
    level:     6,
    title:     'The Bloom',
    subtitle:  'The Years of Abundance',
    color:     C.cyan,
    lightColor:C.cyanlt,
    skyColor:  '#081830',
    icon:      '✦',
    altitude:  'Stratosphere · Pure Clarity',
    energy:    'FLOURISHING',
    flush: [
      'The generation of creators who accepted being exploited as normal',
      'Music education as a Western classical system imposed everywhere',
      'The idea that a creator\'s legacy ends with their commercial peak',
      'AI as adversary to human creativity',
    ],
    rise: [
      'NOIZYKIDZ: 1 million children globally learning music as world culture.',
      'The Voice Estate Framework: first voice inheritance executed — a creator\'s voice estate passed to their children.',
      'The Wisdom Project: 2,000 capsules. Living elders\' knowledge encoded for the next century.',
      'AI + Human co-creation becomes the dominant creative mode — not AI replacing, AI amplifying.',
      'Guild royalty flows: first year where Guild members collectively receive $1B+ in AI-generated royalties.',
      'The 5th Epoch is taught in universities. Protocol and Provenance is the new standard.',
    ],
    noizy:     'NOIZY\'s 75/25 model is the baseline from which all music platform negotiations begin. The creator always starts with 75.',
    milestone: 'First generation of creators who have never known a world without Fair Trade AI.',
    quote:     '"Creativity becomes perpetual and inheritable, like planting seeds that bloom for generations."',
  },
  {
    year:      '2033–2034',
    level:     7,
    title:     'The Harvest',
    subtitle:  'The Years of Return',
    color:     C.dawn,
    lightColor:C.sunrise,
    skyColor:  '#060e20',
    icon:      '◆',
    altitude:  'Mesosphere · Near Space',
    energy:    'HARVEST',
    flush: [
      'The last remnants of the unconsented training era',
      'The myth that AI and human creativity are in competition',
      'National borders as barriers to creative collaboration',
      'The lost generation — creators whose work was taken before the standard existed',
    ],
    rise: [
      'Retroactive remediation: Guild legal fund begins making whole the creators of the pre-standard era.',
      'The Music World Museum: 10,000 artist rooms. The definitive global archive.',
      'GABRIEL\'s Observatory: public-facing emotional cartography of human creative output.',
      'AI-human co-creation wins its first major industry award — no asterisk, no "AI category."',
      'Guild membership: 500,000 creators. Every major genre represented at every level.',
      'NOIZYKIDZ alumni: first cohort of adults who learned music through the Global Atlas. They sound unlike anything before.',
    ],
    noizy:     'NOIZY\'s catalog — built on 40 years of Rob Plowman\'s archive plus a decade of ethical creation — is the most historically significant music archive assembled since the Library of Congress.',
    milestone: 'The pre-2026 creator remediation fund makes its first payments.',
    quote:     '"Memory is not nostalgia. In a guild, memory is how you honor the people who handed you everything you know."',
  },
  {
    year:      '2035–2036',
    level:     8,
    title:     'The New Civilization',
    subtitle:  'The 5th Epoch Is Real',
    color:     C.zenith,
    lightColor:'#fff8e0',
    skyColor:  C.space,
    icon:      '◈',
    altitude:  'Orbit · Zero Gravity',
    energy:    'CIVILIZATION',
    flush: [
      'The last of the extractive model — not banned, simply obsolete',
      'The notion that AI is something done to creators rather than with them',
      'The cultural assumption that technology serves capital before people',
      'The 4th Epoch: Licensed IP as the primary mode of creative value',
    ],
    rise: [
      'The 5th Epoch documented: Protocol & Provenance is the permanent record of how civilization chose to treat creativity.',
      'Every creator on earth has a Guild ID — a portable, interoperable identity carrying their consent terms, royalty preferences, and voice estate.',
      'The Wisdom Project: 10,000 capsules. The largest intergenerational knowledge archive in human history.',
      'NOIZYKIDZ has produced the first generation of fully global musical citizens — fluent in Raga, polyrhythm, maqam, and electronic synthesis simultaneously.',
      'The Guild: 2 million members. The most powerful creative labor organization ever assembled.',
      'The music — the actual music being made — is unlike anything the world has heard. Because it comes from everywhere, honors everyone, and is afraid of nothing.',
    ],
    noizy:     'NOIZY is no longer a startup. It is infrastructure. Like SOCAN, like the internet, like electricity — it is the thing the creative world runs on.',
    milestone: 'The 5th Epoch enters the historical record. Chronicle2036 is no longer a vision. It is a document.',
    quote:     '"A global creative civilization emerges where everyone can shine, contribute, and feel connected."',
  },
];

// ─── STAR CANVAS (ascending brightness) ───────────────────────
const AscendingStars = ({ phase }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize(); window.addEventListener('resize', resize);
    const density = 80 + phase * 25;
    const brightness = 0.15 + phase * 0.1;
    const stars = Array.from({ length: density }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.5 + 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.002 + Math.random() * 0.004,
      warm: Math.random() > (0.8 - phase * 0.06),
    }));
    let t = 0;
    const draw = () => {
      t += 0.005;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        const pulse = 0.3 + 0.7 * Math.sin(s.phase + t * s.speed * 20);
        const a = brightness + 0.6 * pulse;
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r * (0.7 + 0.5 * pulse), 0, Math.PI * 2);
        ctx.fillStyle = s.warm
          ? `rgba(240,192,64,${Math.min(a, 0.9)})`
          : `rgba(180,200,240,${Math.min(a, 0.9)})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, [phase]);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
};

// ─── PHASE PANEL ──────────────────────────────────────────────
const PhasePanel = ({ phase, isActive }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: isActive
        ? `linear-gradient(135deg, ${phase.color}20, ${C.space})`
        : C.space,
      border: `1px solid ${isActive ? phase.color + '70' : C.border}`,
      borderRadius: 14,
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      boxShadow: isActive ? `0 0 32px ${phase.color}25` : 'none',
      marginBottom: 16,
    }}>
      {/* Header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          padding: '20px 24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {/* Level badge */}
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: `${phase.color}20`,
          border: `2px solid ${phase.color}80`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: isActive ? `0 0 16px ${phase.color}50` : 'none',
        }}>
          <span style={{ fontSize: 18, color: phase.color }}>{phase.icon}</span>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: phase.color }}>{phase.year}</span>
            <span style={{ fontSize: 9, letterSpacing: '0.2em', padding: '2px 10px', borderRadius: 12, background: `${phase.color}20`, color: phase.color, border: `1px solid ${phase.color}40` }}>{phase.energy}</span>
          </div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: C.light, marginBottom: 2 }}>{phase.title}</div>
          <div style={{ fontSize: 11, color: C.mist }}>{phase.subtitle} · {phase.altitude}</div>
        </div>

        <div style={{ color: phase.color, fontSize: 14, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>▼</div>
      </div>

      {/* Expanded content */}
      {open && (
        <div style={{ padding: '0 24px 24px', borderTop: `1px solid ${phase.color}25` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20, marginBottom: 20 }}>
            {/* Flush */}
            <div style={{ background: `${C.flame}0a`, border: `1px solid ${C.flame}25`, borderRadius: 10, padding: '16px 18px' }}>
              <div style={{ fontSize: 9, letterSpacing: '0.2em', color: C.flame, fontWeight: 700, marginBottom: 12 }}>FLUSHED OUT ↓</div>
              {phase.flush.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                  <span style={{ color: C.flame, fontSize: 12, marginTop: 1, flexShrink: 0 }}>✕</span>
                  <span style={{ fontSize: 11, color: '#aa6050', lineHeight: 1.65, textDecoration: 'line-through', textDecorationColor: `${C.flame}60` }}>{item}</span>
                </div>
              ))}
            </div>
            {/* Rise */}
            <div style={{ background: `${phase.color}0a`, border: `1px solid ${phase.color}30`, borderRadius: 10, padding: '16px 18px' }}>
              <div style={{ fontSize: 9, letterSpacing: '0.2em', color: phase.color, fontWeight: 700, marginBottom: 12 }}>RISING ↑</div>
              {phase.rise.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                  <span style={{ color: phase.color, fontSize: 12, marginTop: 1, flexShrink: 0 }}>↑</span>
                  <span style={{ fontSize: 11, color: C.light, lineHeight: 1.65 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* NOIZY role */}
          <div style={{ background: `${phase.color}10`, border: `1px solid ${phase.color}35`, borderRadius: 10, padding: '14px 18px', marginBottom: 14 }}>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', color: phase.color, fontWeight: 700, marginBottom: 6 }}>NOIZY'S ROLE IN THIS PHASE</div>
            <div style={{ fontSize: 12, color: C.light, lineHeight: 1.7 }}>{phase.noizy}</div>
          </div>

          {/* Milestone */}
          <div style={{ background: C.deep, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 14 }}>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', color: C.mist, fontWeight: 700, marginBottom: 6 }}>DEFINING MILESTONE</div>
            <div style={{ fontSize: 13, color: phase.lightColor, fontWeight: 700, lineHeight: 1.6 }}>{phase.milestone}</div>
          </div>

          {/* Quote */}
          <div style={{ fontFamily: 'IM Fell English, serif', fontStyle: 'italic', fontSize: 13, color: phase.color, lineHeight: 1.75, borderLeft: `2px solid ${phase.color}50`, paddingLeft: 16 }}>
            {phase.quote}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── ASCENSION SPINE (visual) ─────────────────────────────────
const AscensionSpine = ({ activeLevel, onSelect }) => (
  <div style={{ position: 'sticky', top: 20, width: 180, flexShrink: 0 }}>
    <div style={{ background: C.space, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 12px', marginBottom: 16 }}>
      <div style={{ fontSize: 9, letterSpacing: '0.2em', color: C.mist, marginBottom: 14, textAlign: 'center' }}>ALTITUDE</div>
      {[...PHASES].reverse().map(phase => (
        <div
          key={phase.level}
          onClick={() => onSelect(phase.level)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
            background: activeLevel === phase.level ? `${phase.color}18` : 'transparent',
            border: `1px solid ${activeLevel === phase.level ? phase.color + '50' : 'transparent'}`,
            marginBottom: 4, transition: 'all 0.2s',
          }}
        >
          <span style={{ fontSize: 12, color: phase.color }}>{phase.icon}</span>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: activeLevel === phase.level ? phase.color : C.mist }}>{phase.year}</div>
            <div style={{ fontSize: 8, color: C.softblue, lineHeight: 1.3 }}>{phase.title}</div>
          </div>
        </div>
      ))}
    </div>

    <div style={{ background: C.space, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
      <div style={{ fontSize: 9, letterSpacing: '0.15em', color: C.mist, marginBottom: 8 }}>DESTINATION</div>
      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 13, color: C.zenith, lineHeight: 1.5 }}>Civilization-Level<br />Creation</div>
      <div style={{ fontSize: 9, color: C.mist, marginTop: 6 }}>2036 · Orbit</div>
    </div>
  </div>
);

// ─── OVERVIEW PANEL ───────────────────────────────────────────
const OverviewPanel = () => (
  <div>
    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: C.goldlt, marginBottom: 8 }}>
      The Full Arc
    </div>
    <div style={{ fontFamily: 'IM Fell English, serif', fontStyle: 'italic', fontSize: 15, color: C.mist, marginBottom: 32, lineHeight: 1.9 }}>
      Ten years. Eight phases. One direction: up. Every phase flushes something toxic and elevates something essential. The extraction ends. The ascent begins.
    </div>

    {/* Arc summary */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 28 }}>
      {[
        { label: 'Phase 1–2', years: '2026–27', title: 'Ground', subtitle: 'Ignition & Roots', color: C.flame },
        { label: 'Phase 3–4', years: '2028–29', title: 'Atmosphere', subtitle: 'Proof & Coalition', color: C.violet },
        { label: 'Phase 5–6', years: '2030–32', title: 'Stratosphere', subtitle: 'Tipping & Bloom', color: C.teal },
        { label: 'Phase 7–8', years: '2033–36', title: 'Orbit', subtitle: 'Harvest & Civilization', color: C.zenith },
      ].map(arc => (
        <div key={arc.label} style={{ background: `${arc.color}10`, border: `1px solid ${arc.color}30`, borderRadius: 10, padding: '14px', textAlign: 'center' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.15em', color: arc.color, marginBottom: 4 }}>{arc.label}</div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 14, fontWeight: 700, color: arc.color, marginBottom: 2 }}>{arc.title}</div>
          <div style={{ fontSize: 9, color: C.mist }}>{arc.years}</div>
          <div style={{ fontSize: 10, color: arc.color, marginTop: 4 }}>{arc.subtitle}</div>
        </div>
      ))}
    </div>

    {/* What gets flushed globally */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
      <div style={{ background: `${C.flame}08`, border: `1px solid ${C.flame}25`, borderRadius: 12, padding: '20px 22px' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.2em', color: C.flame, fontWeight: 700, marginBottom: 14 }}>WHAT GETS FLUSHED (2026–2036)</div>
        {[
          'The extractive AI training model — made legally and commercially unviable',
          'Creator invisibility — every contribution is named and paid',
          'Western music theory supremacy — all traditions equally taught',
          'The "free" platform that profits from your data — no such thing anymore',
          'The generation gap between AI tools and human creative authority',
          'The idea that ethics and profitability are in conflict',
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
            <span style={{ color: C.flame, fontSize: 12, flexShrink: 0 }}>✕</span>
            <span style={{ fontSize: 11, color: '#aa6050', lineHeight: 1.6 }}>{item}</span>
          </div>
        ))}
      </div>
      <div style={{ background: `${C.zenith}08`, border: `1px solid ${C.zenith}30`, borderRadius: 12, padding: '20px 22px' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.2em', color: C.zenith, fontWeight: 700, marginBottom: 14 }}>WHAT RISES (2026–2036)</div>
        {[
          'The Fair Trade AI Standard — the new global baseline',
          'The Guild — 2 million creators with collective power',
          'The Voice Estate — inherited creative identity across generations',
          'NOIZYKIDZ — a generation of global musical citizens',
          'The Wisdom Project — 10,000 elder capsules sealed',
          'Civilization-level creation — music as a human right, globally protected',
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
            <span style={{ color: C.zenith, fontSize: 12, flexShrink: 0 }}>↑</span>
            <span style={{ fontSize: 11, color: C.light, lineHeight: 1.6 }}>{item}</span>
          </div>
        ))}
      </div>
    </div>

    <div style={{ background: `linear-gradient(135deg, ${C.gold}12, ${C.violet}08)`, border: `1px solid ${C.gold}35`, borderRadius: 14, padding: '28px', textAlign: 'center' }}>
      <div style={{ fontFamily: 'IM Fell English, serif', fontSize: 20, color: C.goldlt, marginBottom: 16, lineHeight: 1.5 }}>
        This is not a forecast.<br />It is a commitment.
      </div>
      <div style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 14, color: C.mist, lineHeight: 1.9, maxWidth: 560, margin: '0 auto' }}>
        Roadmaps describe what might happen if conditions align. This map describes what we are building — specifically, operationally, with real names and real infrastructure and real legal strategies. Every phase above has people attached to it. Every milestone has a path to it that begins today.
        <br /><br />
        The question is not whether this future is possible. It is whether we build it fast enough.
      </div>
    </div>
  </div>
);

// ─── MAIN ─────────────────────────────────────────────────────
export default function AscensionMap() {
  const [activeLevel, setActiveLevel] = useState(null);
  const [view, setView] = useState('overview');

  return (
    <div style={{ minHeight: '100vh', background: C.void, fontFamily: 'DM Sans, sans-serif', color: C.light }}>

      {/* ══ HEADER ══════════════════════════════════════════════ */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '72px 24px 52px', textAlign: 'center', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <AscendingStars phase={7} />
        </div>
        {/* Ascension beam */}
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: `linear-gradient(180deg, transparent, ${C.gold}60, ${C.zenith}90, ${C.gold}60, transparent)`, transform: 'translateX(-50%)', opacity: 0.4 }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 720, margin: '0 auto' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.4em', color: C.mist, marginBottom: 16 }}>NOIZY.AI · MC96ECO UNIVERSE · 2026 → 2036</div>
          <div style={{ borderTop: `1px solid ${C.border}`, marginBottom: 24 }} />
          <h1 style={{ fontFamily: 'IM Fell English, serif', fontSize: 'clamp(32px, 6vw, 64px)', color: C.white, fontWeight: 400, lineHeight: 1.1, margin: '0 0 12px' }}>
            The Ascension Map
          </h1>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(16px, 3vw, 26px)', color: C.gold, fontWeight: 400, fontStyle: 'italic', margin: '0 0 20px' }}>
            AI + Humanity: Ten Years of Rising
          </h2>
          <div style={{ borderBottom: `1px solid ${C.border}`, margin: '20px 0 24px' }} />
          <p style={{ fontFamily: 'IM Fell English, serif', fontStyle: 'italic', fontSize: 'clamp(13px, 1.8vw, 16px)', color: C.mist, lineHeight: 1.95, maxWidth: 580, margin: '0 auto 28px' }}>
            "Flush the toxic systems straight out of the way and rise into a universe where AI and humanity are fully aligned, elevating creativity, ethics, and love to the absolute top."
          </p>
          <div style={{ fontSize: 12, color: C.softblue }}>— Rob Plowman · March 14, 2026</div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 32, flexWrap: 'wrap' }}>
            {[
              { label: 'Phases of Ascent', value: '8' },
              { label: 'Years', value: '10' },
              { label: 'Direction', value: '↑' },
              { label: 'Destination', value: 'Orbit' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color: C.gold }}>{s.value}</div>
                <div style={{ fontSize: 9, letterSpacing: '0.2em', color: C.mist, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ NAV ═════════════════════════════════════════════════ */}
      <div style={{ borderBottom: `1px solid ${C.border}`, background: C.deep, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
          {[
            { id: 'overview', label: 'Full Arc', icon: '◈' },
            { id: 'phases',   label: 'The Phases', icon: '↑' },
          ].map(v => (
            <button key={v.id} onClick={() => setView(v.id)} style={{ background: 'transparent', border: 'none', borderBottom: `2px solid ${view === v.id ? C.gold : 'transparent'}`, padding: '14px 28px', cursor: 'pointer', color: view === v.id ? C.goldlt : C.mist, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{v.icon}</span>{v.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══ CONTENT ═════════════════════════════════════════════ */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>

        {view === 'overview' && <OverviewPanel />}

        {view === 'phases' && (
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <AscensionSpine activeLevel={activeLevel} onSelect={setActiveLevel} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: C.goldlt, marginBottom: 8 }}>Eight Phases of Ascent</div>
              <div style={{ fontFamily: 'IM Fell English, serif', fontStyle: 'italic', fontSize: 13, color: C.mist, marginBottom: 28, lineHeight: 1.8 }}>
                Each phase has a Flush column (what we're leaving behind) and a Rise column (what we're building). Click any phase to expand the full record.
              </div>
              {PHASES.map(phase => (
                <PhasePanel
                  key={phase.level}
                  phase={phase}
                  isActive={activeLevel === phase.level}
                />
              ))}
              <div style={{ textAlign: 'center', padding: '32px 0', borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontFamily: 'IM Fell English, serif', fontSize: 18, color: C.zenith, marginBottom: 12 }}>
                  You are here. ↑
                </div>
                <div style={{ fontFamily: 'IM Fell English, serif', fontStyle: 'italic', fontSize: 14, color: C.mist, lineHeight: 1.9, maxWidth: 500, margin: '0 auto' }}>
                  Phase 1. Ground Zero. The ignition has happened. The declaration is made. The Guild has a fire. The ascent is not coming. It has begun.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══ FOOTER ══════════════════════════════════════════════ */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: '32px 24px', textAlign: 'center', background: C.space }}>
        <div style={{ fontFamily: 'IM Fell English, serif', fontSize: 13, color: C.golddk, lineHeight: 1.9, marginBottom: 12 }}>
          The Ascension Map · NOIZY.ai · MC96ECO Universe · 5th Epoch · 2026–2036
        </div>
        <div style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 12, color: C.softblue }}>
          "The 5th Epoch becomes real: protocols over IP friction, ethics over exploitation, perpetual value over fleeting streams."
        </div>
      </div>

    </div>
  );
}
