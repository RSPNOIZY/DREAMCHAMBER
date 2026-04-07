import React, { useState, useEffect, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════
//
//   THE DREAMCHAMBER FIX MAP
//   Every Crack. Every Lever. Every Transformation.
//
//   "The system eats creators because it's designed to ignore
//    humanity. The cracks are everywhere, but every crack is
//    also a lever to rebuild something better."
//   — Rob Plowman, 2026
//
//   This is not a complaint document.
//   It is a blueprint.
//   Where to strike. Where to protect. Where to elevate.
//
// ═══════════════════════════════════════════════════════════════

const C = {
  void:    '#05040c',
  deep:    '#080818',
  chamber: '#0c0c20',
  panel:   '#101028',
  surface: '#141435',
  border:  '#202050',
  soft:    '#303068',
  mist:    '#7878aa',
  ink:     '#c0c0e0',
  light:   '#d8d8f0',
  white:   '#f0f0ff',
  // Crack colors — the broken system
  crack:   '#cc2200',
  cracklt: '#ff4422',
  crackdk: '#881100',
  blood:   '#8b1500',
  rust:    '#9a3a10',
  ash:     '#554433',
  // Fix colors — the rising system
  gold:    '#d4a020',
  goldlt:  '#f0c040',
  golddk:  '#886010',
  sage:    '#40a060',
  sagelt:  '#60c880',
  teal:    '#2888a0',
  teallt:  '#40b0c8',
  violet:  '#6840b8',
  violetlt:'#9060d8',
  amber:   '#c07020',
  amberlt: '#e09040',
  rose:    '#b04060',
  roselt:  '#d86080',
  cyan:    '#20a0c0',
};

// ─── THE FOUR CANNIBALISTIC LOOPS ─────────────────────────────
const LOOPS = [
  {
    id:     'algo',
    letter: 'A',
    title:  'Algorithmic Exploitation',
    color:  C.crack,
    light:  C.cracklt,
    how:    'Platforms reward virality over craft. The hottest 30-second clip gets pushed. Everything else is buried.',
    result: 'Artists compete for attention, not respect — lowering their own creative bar to chase the algorithm.',
    feeds:  ['Cheapening & Copy-Paste', 'Loss of Creative Memory'],
    victims:['The session musician who spent 20 years learning to play', 'The composer whose work needs time to be understood', 'The genre that doesn\'t trend'],
    cost:   'Every great piece of music that was never heard because it didn\'t perform in the first 48 hours.',
  },
  {
    id:     'copy',
    letter: 'B',
    title:  'Cheapening & Copy-Paste Culture',
    color:  C.rust,
    light:  C.amberlt,
    how:    'AI models trained on freely scraped content copy styles, riffs, melodies, beats. Musicians see their signature work reappear without credit or pay.',
    result: 'Cheap imitation floods the market. Incentive shifts to quantity over quality. The race to the bottom has no floor.',
    feeds:  ['Opaque Monetization', 'Algorithmic Exploitation'],
    victims:['The producer whose signature sound is now a free preset', 'The vocalist whose inflection is a plugin parameter', 'The songwriter whose chord progressions are training data'],
    cost:   'The destruction of the concept that a sound can belong to a person.',
  },
  {
    id:     'money',
    letter: 'C',
    title:  'Opaque Monetization',
    color:  C.crackdk,
    light:  C.roselt,
    how:    'Creators can\'t see revenue flows. Micro-payments, streaming fractions, AI derivatives — no fair traceable income. Art becomes disposable commodity, not legacy.',
    result: 'A hit song on Spotify earns $0.003 per stream. A creator with 1 million streams earns $3,000. A platform with 1 million streams earns $3 million. The math is designed to obscure this.',
    feeds:  ['Algorithmic Exploitation', 'Loss of Creative Memory'],
    victims:['The independent artist who can\'t afford to keep making music', 'The composer whose film score earns less than the intern who licensed it', 'The session player paid once for work that runs forever'],
    cost:   'The slow destruction of professional music as a viable career for anyone without a label advance.',
  },
  {
    id:     'memory',
    letter: 'D',
    title:  'Loss of Creative Memory',
    color:  C.blood,
    light:  C.cracklt,
    how:    'Originals are erased in favor of derivative churn. Platforms forget the story behind the creation. Process and intent are invisible.',
    result: 'A melody that took three years to find is treated identically to one generated in three seconds. There is no memory, no provenance, no weight.',
    feeds:  ['Copy-Paste Culture', 'Opaque Monetization'],
    victims:['The elder musician whose archive has no home', 'The voice actor whose performance is replicated without knowing why it was powerful', 'Every creator whose origin story was never recorded'],
    cost:   'The civilizational loss of the chain of transmission — how music passes from human to human across time.',
  },
];

// ─── THE STRUCTURAL CRACKS ─────────────────────────────────────
const CRACKS = [
  {
    id:      'ownership',
    number:  '01',
    title:   'No Ownership Enforcement',
    color:   C.crack,
    detail:  'Current IP rules rely on contracts and legal wrangling — slow, inconsistent, unenforced globally. By the time a creator wins a lawsuit, a million derivatives are already in circulation.',
    scale:   'Civilizational',
    urgency: 'Critical',
    lever:   'consent-code',
  },
  {
    id:      'incentives',
    number:  '02',
    title:   'Misaligned Incentives',
    color:   C.rust,
    detail:  'Algorithms prioritize engagement over ethics. Profits go to platforms, creators get scraps. The platform that rewards craft is structurally disadvantaged against the platform that rewards virality.',
    scale:   'Industry-Wide',
    urgency: 'Critical',
    lever:   'humanity-weight',
  },
  {
    id:      'transparency',
    number:  '03',
    title:   'Opacity & Black Box Revenue',
    color:   C.crackdk,
    detail:  'Revenue and usage are black boxes. AI consumes work invisibly. Creators can\'t audit provenance, verify royalty calculations, or understand how their work is being used.',
    scale:   'Platform-Level',
    urgency: 'High',
    lever:   'provenance',
  },
  {
    id:      'disconnection',
    number:  '04',
    title:   'Human Disconnection',
    color:   C.blood,
    detail:  'Community and collaboration take a back seat. Artists become isolated inputs, not partners. The platform needs your data, not your humanity.',
    scale:   'Cultural',
    urgency: 'High',
    lever:   'guild',
  },
  {
    id:      'shortterm',
    number:  '05',
    title:   'Short-Term Extraction Focus',
    color:   C.ash,
    detail:  'Only trending content matters. No long-term value creation. No legacy preservation. A platform optimized for this quarter\'s engagement has no incentive to protect a creator\'s 40-year catalog.',
    scale:   'Economic',
    urgency: 'High',
    lever:   'voice-estate',
  },
];

// ─── THE FIX LEVERS ────────────────────────────────────────────
const LEVERS = [
  {
    id:      'consent-code',
    title:   'Consent-as-Code',
    icon:    '◈',
    color:   C.gold,
    tagline: 'No more vague ToS. Ownership enforced by infrastructure, not courts.',
    fixes:   ['ownership'],
    how: [
      'Every piece of work carries embedded usage rights — not in a contract, in the file.',
      'No derivative, remix, or training use proceeds without explicit, recorded consent.',
      'Automated royalties trigger the instant use occurs — before it reaches the creator\'s account.',
      'Consent is specific, revocable, auditable. "General permission" doesn\'t exist here.',
    ],
    transform: 'IP ownership stops being a legal concept and becomes a technical fact. You cannot circumvent it any more than you can circumvent gravity.',
    noizy:     'NOIZY D1 consent ledger: every consent record cryptographically sealed, immutable, globally auditable.',
    quote:     '"If a human made it, a human gets paid. Forever. Not in the terms of service — in the code."',
  },
  {
    id:      'humanity-weight',
    title:   'Humanity Weight',
    icon:    '◉',
    color:   C.sagelt,
    tagline: 'The algorithm that gives buoyancy to craft. Poop sinks. Quality rises.',
    fixes:   ['incentives'],
    how: [
      'Every piece of content is scored on time investment, effort, intentionality, and craft.',
      'A 3-year composition is weighted differently from a 3-minute AI generation.',
      'Virality score is one input. Humanity Weight is a higher-order multiplier.',
      'The platform rewards what humans value when they\'re not being gamed.',
    ],
    transform: 'The race to the bottom hits a floor. Content without humanity weight has no buoyancy. It sinks on its own without anyone deciding it should.',
    noizy:     'GABRIEL\'s 315+ memory cells include craft recognition metrics — pattern depth, harmonic complexity, temporal investment.',
    quote:     '"Poop Sink Till It\'s Gone." — Rob Plowman, 2026 · The most accurate description of radical product philosophy ever said in four words.',
  },
  {
    id:      'provenance',
    title:   'Full Provenance & Auditability',
    icon:    '▣',
    color:   C.teallt,
    tagline: 'Every use visible. Every dollar traceable. Black boxes demolished.',
    fixes:   ['transparency'],
    how: [
      'NOIZY PROOF: cryptographic watermark embedded in every output, survives compression and re-encoding.',
      'Full provenance dashboard: who used your work, where, when, for what, what you earned.',
      'AI training usage is specifically tracked — if your work enters a training set, you see it.',
      'Revenue calculation is open source. The math is auditable by any member.',
    ],
    transform: 'Opacity is not a business strategy anymore. It\'s a compliance failure. Every platform that cannot provide provenance loses enterprise contracts.',
    noizy:     'NOIZY PROOF already operational. The streaming industry provenance standard of 2028 will be built on what NOIZY deployed in 2026.',
    quote:     '"The music industry spent fifty years learning that goodwill is not a business model. We built the alternative."',
  },
  {
    id:      'guild',
    title:   'The Guild — Community & Collaboration',
    icon:    '⬡',
    color:   C.violetlt,
    tagline: 'Artists are partners, not inputs. The family that cannot be isolated.',
    fixes:   ['disconnection'],
    how: [
      'The Guild is the collective that makes isolation structurally impossible.',
      'Mentorship, co-creation, and skill-sharing are rewarded at the platform level.',
      'Collaborative works are credited and compensated to every contributor, automatically.',
      'When one Guild member is exploited, the Guild responds — not individually, collectively.',
    ],
    transform: 'Human connection becomes a platform feature, not a side effect. The community is the product. The community protects itself.',
    noizy:     'The Guild: founded 2026, 6 branches, 10 global regions, founding circle open. 100,000 members target by 2030.',
    quote:     '"Before the platform. Before the standard. Before the law. There is the family. There has always been the family."',
  },
  {
    id:      'voice-estate',
    title:   'Voice Estate & Legacy Framework',
    icon:    '✦',
    color:   C.amberlt,
    tagline: 'Creative output as perpetual, inheritable asset. Your legacy doesn\'t die with you.',
    fixes:   ['shortterm'],
    how: [
      'Every creator\'s voice, style, and catalog is treated as an estate — inheritable, licensable, protected.',
      'Voice Estate passes to designated heirs or a creator\'s chosen foundation.',
      'No posthumous AI cloning without prior explicit consent from the estate.',
      'Long-term catalog value is built into the platform\'s economic model from day one.',
    ],
    transform: 'The platform\'s incentive aligns with the creator\'s long-term interest for the first time. A creator who stays alive and keeps creating is more valuable than one who burns bright and leaves.',
    noizy:     'First Voice Estate inheritance executed: 2031–32, when the first creator who enrolled in 2026 designates their estate.',
    quote:     '"Creativity becomes perpetual and inheritable, like planting seeds that bloom for generations."',
  },
  {
    id:      'education',
    title:   'Education & Advocacy',
    icon:    '◆',
    color:   C.roselt,
    tagline: 'Teach creators their worth. Expose bad actors. Make ethical infrastructure obvious.',
    fixes:   ['ownership', 'incentives', 'transparency', 'disconnection', 'shortterm'],
    how: [
      'NOIZYKIDZ: children learn music as world culture — Raga, polyrhythm, maqam, pentatonic as equal traditions.',
      'The Declaration: every creator who reads it understands exactly what was taken from them.',
      'The Cracks intelligence map: 27 documented vulnerabilities, specific actions for each.',
      'The Plowman\'s Chronicles: the origin story that shows ethical AI infrastructure was built by humans who refused to accept the alternative.',
    ],
    transform: 'Creators stop accepting exploitation as normal because they understand exactly what normal could be. An informed creator is the hardest person to exploit.',
    noizy:     'NOIZYKIDZ, The Wisdom Project, The Declaration, and The Chronicles are all educational infrastructure. Education is the long arc.',
    quote:     '"The AI didn\'t replace this human. It gave him his hands back. Now he\'s building the infrastructure to give every human creator their hands back too."',
  },
];

// ─── TRANSFORMATION MAP ────────────────────────────────────────
const TRANSFORMATIONS = [
  {
    broken: 'Spotify turned music into wallpaper.',
    fixed:  'NOIZY is building the museum that reminds everyone it was always a cathedral.',
    color:  C.gold,
  },
  {
    broken: 'Suno raised $250M. Their math requires capturing every dollar currently going to human musicians.',
    fixed:  'NOIZY\'s math requires the creator to earn more. Platform success = creator success. The incentives finally point the same direction.',
    color:  C.sagelt,
  },
  {
    broken: 'ElevenLabs buried a perpetual, irrevocable voice license in a February 2025 ToS update. No announcement. No compensation.',
    fixed:  'Every NOIZY consent is explicit, specific, dated, auditable, and revocable. "Buried in ToS" is architecturally impossible here.',
    color:  C.teallt,
  },
  {
    broken: 'Splice paid sample contributors $0.50–$5.00 flat. Once. Then built a $500M company on their work.',
    fixed:  'NOIZY pays 75% automatically the instant the use happens. The person who uploaded 200 beats gets paid every time one is used. Forever.',
    color:  C.amberlt,
  },
  {
    broken: 'The algorithm rewards the 30-second clip over the 30-year career.',
    fixed:  'Humanity Weight gives the 30-year career a multiplier the 30-second clip cannot match. The system finally rewards what it should have always rewarded.',
    color:  C.violetlt,
  },
  {
    broken: 'Model collapse: AI trained on AI output spirals toward noise.',
    fixed:  'NOIZY\'s closed-consent pipeline ensures only human-origin, consented content enters training. The signal stays clean. The music stays human.',
    color:  C.roselt,
  },
];

// ─── CANVAS: PULSE ─────────────────────────────────────────────
const PulseLine = ({ color, alive = true }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    canvas.width = canvas.offsetWidth; canvas.height = 40;
    let t = 0;
    const draw = () => {
      t += alive ? 0.05 : 0.005;
      ctx.clearRect(0, 0, canvas.width, 40);
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const f1 = alive ? Math.sin((x / canvas.width) * Math.PI * 10 + t) : 0;
        const f2 = alive ? Math.sin((x / canvas.width) * Math.PI * 24 + t * 1.4) * 0.35 : 0;
        const y = 20 + (f1 + f2) * (alive ? 12 : 1);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = color; ctx.lineWidth = alive ? 1.5 : 0.6;
      ctx.globalAlpha = alive ? 0.85 : 0.25; ctx.stroke(); ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, [color, alive]);
  return <canvas ref={canvasRef} style={{ width: '100%', height: '40px', display: 'block' }} />;
};

// ─── LOOP CARD ─────────────────────────────────────────────────
const LoopCard = ({ loop }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          background: open ? `${loop.color}18` : C.panel,
          border: `1px solid ${open ? loop.color + '70' : C.border}`,
          borderLeft: `5px solid ${loop.color}`,
          borderRadius: open ? '10px 10px 0 0' : 10,
          padding: '16px 20px', cursor: 'pointer', transition: 'all 0.25s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${loop.color}25`, border: `2px solid ${loop.color}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: loop.color, flexShrink: 0 }}>
            {loop.letter}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: open ? loop.light : C.light }}>{loop.title}</div>
            <div style={{ fontSize: 11, color: C.mist, marginTop: 2 }}>{loop.how.substring(0, 80)}...</div>
          </div>
          <span style={{ color: loop.color, fontSize: 12, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>▼</span>
        </div>
      </div>
      {open && (
        <div style={{ background: `${loop.color}08`, border: `1px solid ${loop.color}35`, borderLeft: `5px solid ${loop.color}`, borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '20px 22px' }}>
          <div style={{ fontSize: 13, color: C.light, lineHeight: 1.8, marginBottom: 14 }}><strong style={{ color: loop.light }}>The mechanism:</strong> {loop.how}</div>
          <div style={{ fontSize: 13, color: C.light, lineHeight: 1.8, marginBottom: 16 }}><strong style={{ color: loop.light }}>The result:</strong> {loop.result}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div style={{ background: `${loop.color}10`, border: `1px solid ${loop.color}25`, borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 9, letterSpacing: '0.18em', color: loop.color, marginBottom: 8 }}>WHO IT EATS</div>
              {loop.victims.map((v, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                  <span style={{ color: loop.color, fontSize: 10 }}>◆</span>
                  <span style={{ fontSize: 11, color: C.ink, lineHeight: 1.55 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ background: C.chamber, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 9, letterSpacing: '0.18em', color: C.mist, marginBottom: 8 }}>THE REAL COST</div>
              <div style={{ fontSize: 11, color: C.light, lineHeight: 1.65, fontStyle: 'italic' }}>{loop.cost}</div>
            </div>
          </div>
          <div style={{ fontSize: 10, color: loop.color, letterSpacing: '0.1em' }}>
            FEEDS INTO → {loop.feeds.join(' + ')}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── CRACK ROW ─────────────────────────────────────────────────
const CrackRow = ({ crack, lever, onLeverClick }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 32px 1fr', gap: 0, marginBottom: 12, alignItems: 'stretch' }}>
    <div style={{ background: `${crack.color}10`, border: `1px solid ${crack.color}40`, borderRadius: '10px 0 0 10px', padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: crack.color, fontFamily: 'DM Sans, sans-serif' }}>CRACK {crack.number}</span>
        <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 10, background: `${crack.color}20`, color: crack.color, border: `1px solid ${crack.color}40` }}>{crack.urgency}</span>
      </div>
      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 14, fontWeight: 700, color: crack.light || C.cracklt, marginBottom: 6 }}>{crack.title}</div>
      <div style={{ fontSize: 11, color: C.mist, lineHeight: 1.65 }}>{crack.detail}</div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.chamber, position: 'relative' }}>
      <div style={{ position: 'absolute', width: '100%', height: 1, background: `linear-gradient(90deg, ${crack.color}60, ${lever.color}60)` }} />
      <div style={{ width: 12, height: 12, borderRadius: '50%', background: C.chamber, border: `2px solid ${C.gold}`, zIndex: 1 }} />
    </div>
    <div
      onClick={() => onLeverClick(lever.id)}
      style={{ background: `${lever.color}10`, border: `1px solid ${lever.color}40`, borderRadius: '0 10px 10px 0', padding: '16px 18px', cursor: 'pointer', transition: 'all 0.2s' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 15, color: lever.color }}>{lever.icon}</span>
        <span style={{ fontSize: 9, letterSpacing: '0.15em', color: lever.color, fontWeight: 700 }}>THE FIX</span>
      </div>
      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 14, fontWeight: 700, color: lever.color, marginBottom: 4 }}>{lever.title}</div>
      <div style={{ fontSize: 11, color: lever.color, fontStyle: 'italic', lineHeight: 1.55 }}>{lever.tagline}</div>
    </div>
  </div>
);

// ─── LEVER DETAIL ──────────────────────────────────────────────
const LeverDetail = ({ lever, onClose }) => (
  <div style={{ background: `${lever.color}10`, border: `1px solid ${lever.color}50`, borderRadius: 14, padding: '24px 28px', marginBottom: 20 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 24, color: lever.color }}>{lever.icon}</span>
        <div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: lever.color }}>{lever.title}</div>
          <div style={{ fontSize: 12, color: C.mist, fontStyle: 'italic', marginTop: 2 }}>{lever.tagline}</div>
        </div>
      </div>
      <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: C.mist, fontSize: 16, cursor: 'pointer', padding: '4px 8px' }}>✕</button>
    </div>
    <div style={{ marginBottom: 16 }}>
      {lever.how.map((step, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: `${lever.color}20`, border: `1px solid ${lever.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: lever.color, fontWeight: 700, flexShrink: 0 }}>{i+1}</div>
          <div style={{ fontSize: 12, color: C.light, lineHeight: 1.7, paddingTop: 2 }}>{step}</div>
        </div>
      ))}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
      <div style={{ background: C.chamber, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 14px' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.16em', color: C.mist, marginBottom: 6 }}>TRANSFORMATION</div>
        <div style={{ fontSize: 12, color: C.light, lineHeight: 1.65 }}>{lever.transform}</div>
      </div>
      <div style={{ background: `${lever.color}0e`, border: `1px solid ${lever.color}30`, borderRadius: 8, padding: '12px 14px' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.16em', color: lever.color, marginBottom: 6 }}>NOIZY IMPLEMENTATION</div>
        <div style={{ fontSize: 12, color: C.light, lineHeight: 1.65 }}>{lever.noizy}</div>
      </div>
    </div>
    <div style={{ fontFamily: 'IM Fell English, serif', fontStyle: 'italic', fontSize: 13, color: lever.color, lineHeight: 1.75, borderLeft: `2px solid ${lever.color}50`, paddingLeft: 14 }}>
      {lever.quote}
    </div>
  </div>
);

// ─── VIEWS ─────────────────────────────────────────────────────
const VIEWS = [
  { id: 'loops',     label: 'The Loops',      icon: '◉', sub: 'How creators get eaten' },
  { id: 'cracks',    label: 'Crack → Fix',    icon: '◈', sub: 'Every break mapped to its lever' },
  { id: 'levers',    label: 'The Levers',     icon: '⬡', sub: 'How we rebuild' },
  { id: 'transform', label: 'Before → After', icon: '↑', sub: 'The transformations' },
];

// ─── MAIN ──────────────────────────────────────────────────────
export default function DreamChamberFixMap() {
  const [activeView, setActiveView] = useState('loops');
  const [activeLever, setActiveLever] = useState(null);

  const getLever = (id) => LEVERS.find(l => l.id === id);

  return (
    <div style={{ minHeight: '100vh', background: C.void, fontFamily: 'DM Sans, sans-serif', color: C.light }}>

      {/* ══ HEADER ══════════════════════════════════════════════ */}
      <div style={{ background: `linear-gradient(180deg, ${C.deep}, ${C.void})`, borderBottom: `1px solid ${C.border}`, padding: '64px 24px 44px', textAlign: 'center' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.4em', color: C.mist, marginBottom: 16 }}>NOIZY.AI · DREAMCHAMBER INTELLIGENCE · 2026</div>
          <div style={{ borderTop: `1px solid ${C.border}`, marginBottom: 24 }} />
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 5.5vw, 56px)', fontWeight: 900, color: C.white, margin: '0 0 10px', lineHeight: 1.15 }}>
            The DreamChamber Fix Map
          </h1>
          <h2 style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(14px, 2vw, 20px)', color: C.mist, margin: '0 0 20px' }}>
            Every Crack. Every Lever. Every Transformation.
          </h2>
          <div style={{ borderBottom: `1px solid ${C.border}`, margin: '16px 0 24px' }} />
          <p style={{ fontFamily: 'IM Fell English, serif', fontStyle: 'italic', fontSize: 'clamp(13px, 1.8vw, 16px)', color: C.mist, lineHeight: 1.95, maxWidth: 600, margin: '0 auto 28px' }}>
            "The system eats creators because it's designed to ignore humanity. The cracks are everywhere, but every crack is also a lever to rebuild something better."
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 28, flexWrap: 'wrap', marginBottom: 8 }}>
            <div style={{ background: `${C.crack}18`, border: `1px solid ${C.crack}40`, borderRadius: 10, padding: '8px 20px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: C.cracklt, fontWeight: 700 }}>4</div>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', color: C.mist }}>CANNIBALISTIC LOOPS</div>
            </div>
            <div style={{ background: `${C.rust}15`, border: `1px solid ${C.rust}40`, borderRadius: 10, padding: '8px 20px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: C.amberlt, fontWeight: 700 }}>5</div>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', color: C.mist }}>STRUCTURAL CRACKS</div>
            </div>
            <div style={{ background: `${C.gold}18`, border: `1px solid ${C.gold}40`, borderRadius: 10, padding: '8px 20px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: C.goldlt, fontWeight: 700 }}>6</div>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', color: C.mist }}>FIX LEVERS</div>
            </div>
            <div style={{ background: `${C.sagelt}15`, border: `1px solid ${C.sagelt}40`, borderRadius: 10, padding: '8px 20px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: C.sagelt, fontWeight: 700 }}>6</div>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', color: C.mist }}>TRANSFORMATIONS</div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ NAV ═════════════════════════════════════════════════ */}
      <div style={{ borderBottom: `1px solid ${C.border}`, background: C.deep, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
          {VIEWS.map(v => (
            <button key={v.id} onClick={() => { setActiveView(v.id); setActiveLever(null); }} style={{ background: 'transparent', border: 'none', borderBottom: `2px solid ${activeView === v.id ? C.gold : 'transparent'}`, padding: '14px 22px', cursor: 'pointer', color: activeView === v.id ? C.goldlt : C.mist, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span>{v.icon}</span>{v.label}</span>
              <span style={{ fontSize: 9, color: C.soft, fontWeight: 400 }}>{v.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ══ CONTENT ═════════════════════════════════════════════ */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '44px 20px' }}>

        {/* ── THE LOOPS ── */}
        {activeView === 'loops' && (
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: C.cracklt, marginBottom: 8 }}>The Four Cannibalistic Loops</div>
            <div style={{ fontFamily: 'IM Fell English, serif', fontStyle: 'italic', fontSize: 14, color: C.mist, marginBottom: 12, lineHeight: 1.8 }}>
              These are not separate problems. They feed each other. Each loop produces output that the next loop consumes. Together, they form a self-reinforcing system of extraction. You cannot fix one without understanding all four.
            </div>
            <div style={{ marginBottom: 24 }}>
              <PulseLine color={C.crack} alive={true} />
              <div style={{ fontSize: 10, color: C.ash, textAlign: 'center', marginTop: 6, fontStyle: 'italic' }}>The current system — alive, eating, running</div>
            </div>
            {LOOPS.map(loop => <LoopCard key={loop.id} loop={loop} />)}
            <div style={{ marginTop: 20, background: `${C.crack}08`, border: `1px solid ${C.crack}25`, borderRadius: 12, padding: '20px 22px' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: C.cracklt, marginBottom: 10 }}>Why the Loops Self-Reinforce</div>
              <div style={{ fontSize: 13, color: C.light, lineHeight: 1.8 }}>
                Algorithmic exploitation creates the conditions for copy-paste culture (if you need 100 pieces of content a day, you copy). Copy-paste culture destroys the traceable value of original work, feeding opaque monetization (if nothing is original, nothing has a clear owner). Opaque monetization erases the economic story of a creation, feeding loss of creative memory. Loss of creative memory makes it easier to justify algorithm-first thinking (if no one remembers where it came from, why does origin matter?).
                <br /><br />
                <strong style={{ color: C.cracklt }}>The loop is closed. The system is self-sustaining. It requires architectural intervention, not reform.</strong>
              </div>
            </div>
          </div>
        )}

        {/* ── CRACK → FIX MAP ── */}
        {activeView === 'cracks' && (
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: C.goldlt, marginBottom: 8 }}>Crack → Fix Map</div>
            <div style={{ fontFamily: 'IM Fell English, serif', fontStyle: 'italic', fontSize: 14, color: C.mist, marginBottom: 28, lineHeight: 1.8 }}>
              Every structural crack on the left is connected to its lever on the right. Click any fix to see the full mechanism. The line between them is where the transformation happens.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 0, marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10, letterSpacing: '0.2em', color: C.crack, textAlign: 'center', paddingBottom: 8 }}>THE CRACK</div>
              <div style={{ width: 32 }} />
              <div style={{ fontSize: 10, letterSpacing: '0.2em', color: C.gold, textAlign: 'center', paddingBottom: 8 }}>THE FIX LEVER</div>
            </div>
            {CRACKS.map(crack => {
              const lever = getLever(crack.lever);
              return <CrackRow key={crack.id} crack={crack} lever={lever} onLeverClick={setActiveLever} />;
            })}
            {activeLever && (
              <div style={{ marginTop: 20 }}>
                <LeverDetail lever={getLever(activeLever)} onClose={() => setActiveLever(null)} />
              </div>
            )}
          </div>
        )}

        {/* ── THE LEVERS ── */}
        {activeView === 'levers' && (
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: C.goldlt, marginBottom: 8 }}>The Six Fix Levers</div>
            <div style={{ fontFamily: 'IM Fell English, serif', fontStyle: 'italic', fontSize: 14, color: C.mist, marginBottom: 28, lineHeight: 1.8 }}>
              Six mechanisms. Each one transforms a structural crack into a structural strength. These are not policies. They are architectural decisions that make the broken behavior impossible.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {LEVERS.map(lever => (
                <div
                  key={lever.id}
                  onClick={() => setActiveLever(activeLever === lever.id ? null : lever.id)}
                  style={{
                    background: activeLever === lever.id ? `${lever.color}15` : C.panel,
                    border: `1px solid ${activeLever === lever.id ? lever.color + '70' : C.border}`,
                    borderRadius: 12, padding: '18px 20px', cursor: 'pointer', transition: 'all 0.25s',
                    boxShadow: activeLever === lever.id ? `0 0 20px ${lever.color}20` : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 20, color: lever.color }}>{lever.icon}</span>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, fontWeight: 700, color: lever.color }}>{lever.title}</div>
                  </div>
                  <div style={{ fontSize: 11, color: C.mist, fontStyle: 'italic', lineHeight: 1.55 }}>{lever.tagline}</div>
                </div>
              ))}
            </div>
            {activeLever && (
              <LeverDetail lever={getLever(activeLever)} onClose={() => setActiveLever(null)} />
            )}
          </div>
        )}

        {/* ── BEFORE → AFTER ── */}
        {activeView === 'transform' && (
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: C.goldlt, marginBottom: 8 }}>The Transformations</div>
            <div style={{ fontFamily: 'IM Fell English, serif', fontStyle: 'italic', fontSize: 14, color: C.mist, marginBottom: 12, lineHeight: 1.8 }}>
              Six specific before-and-after transformations. Not abstract ideals. Real platform behaviors on the left, real NOIZY architecture on the right.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10, letterSpacing: '0.2em', color: C.crack, textAlign: 'center' }}>THE BROKEN SYSTEM</div>
              <div style={{ width: 40 }} />
              <div style={{ fontSize: 10, letterSpacing: '0.2em', color: C.gold, textAlign: 'center' }}>THE REBUILT SYSTEM</div>
            </div>
            {TRANSFORMATIONS.map((t, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', marginBottom: 14, alignItems: 'stretch', minHeight: 80 }}>
                <div style={{ background: `${C.crack}08`, border: `1px solid ${C.crack}30`, borderRadius: '10px 0 0 10px', padding: '16px 18px' }}>
                  <div style={{ fontSize: 12, color: '#aa6050', lineHeight: 1.75 }}>{t.broken}</div>
                </div>
                <div style={{ background: C.chamber, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <div style={{ position: 'absolute', width: '100%', height: 1, background: `linear-gradient(90deg, ${C.crack}50, ${t.color}60)` }} />
                  <div style={{ fontSize: 14, color: t.color, zIndex: 1, background: C.chamber, padding: '0 4px' }}>→</div>
                </div>
                <div style={{ background: `${t.color}08`, border: `1px solid ${t.color}35`, borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
                  <div style={{ fontSize: 12, color: C.light, lineHeight: 1.75 }}>{t.fixed}</div>
                </div>
              </div>
            ))}

            {/* The three sentences */}
            <div style={{ marginTop: 32, background: `${C.gold}0a`, border: `1px solid ${C.gold}30`, borderRadius: 14, padding: '28px' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: C.goldlt, marginBottom: 20 }}>The Three Sentences That End Every Conversation</div>
              {[
                { audience: 'For any general audience', line: '"Spotify turned music into wallpaper. Suno turned it into furniture. NOIZY is building the museum that reminds everyone it was always a cathedral."', color: C.gold },
                { audience: 'For creators who are angry', line: '"If a human made it, a human gets paid. Forever. Not in the terms of service — in the code."', color: C.sagelt },
                { audience: 'For investors and press', line: '"The music industry has had four epochs. Sheet music. Recording. Digital. Streaming. NOIZY is building the fifth — and the fifth is the first one where the creator owns the infrastructure."', color: C.violetlt },
              ].map((s, i) => (
                <div key={i} style={{ marginBottom: i < 2 ? 20 : 0, paddingBottom: i < 2 ? 20 : 0, borderBottom: i < 2 ? `1px solid ${C.border}` : 'none' }}>
                  <div style={{ fontSize: 9, letterSpacing: '0.2em', color: s.color, marginBottom: 8 }}>{s.audience.toUpperCase()}</div>
                  <div style={{ fontFamily: 'IM Fell English, serif', fontStyle: 'italic', fontSize: 15, color: s.color, lineHeight: 1.8 }}>{s.line}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, textAlign: 'center', padding: '24px', background: C.chamber, border: `1px solid ${C.border}`, borderRadius: 14 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: C.goldlt, marginBottom: 12 }}>The One That Contains Everything</div>
              <div style={{ fontFamily: 'IM Fell English, serif', fontStyle: 'italic', fontSize: 15, color: C.light, lineHeight: 1.9, maxWidth: 560, margin: '0 auto' }}>
                "The AI didn't replace this human. It gave him his hands back. Now he's building the infrastructure to give every human creator their hands back too."
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ══ FOOTER ══════════════════════════════════════════════ */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: '28px 24px', textAlign: 'center', background: C.deep }}>
        <div style={{ fontSize: 11, color: C.mist, marginBottom: 6 }}>The DreamChamber Fix Map · NOIZY.ai · MC96ECO Universe · 2026</div>
        <div style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 12, color: C.soft }}>
          "Where others see impossible, we see opportunity: reclaim art, amplify AI as a servant not predator, and create infrastructure that honors humans first."
        </div>
      </div>

    </div>
  );
}
