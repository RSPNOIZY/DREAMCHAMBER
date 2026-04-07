import React, { useState, useEffect, useRef } from 'react';

// ============================================================
// NOIZYFISH INC. — FOUNDER BLUEPRINT
// The 5th Epoch: AI as Creative Protocol
// RSP_001 · Ottawa, Canada · March 2026
// Confidential — Board of Aligned Minds
// ============================================================

const C = {
  void:    '#020208',
  deep:    '#050410',
  panel:   '#09071a',
  card:    '#0e0b20',
  border:  '#18153a',
  dim:     '#201c40',

  gold:    '#D4A843',
  amber:   '#E8833A',
  cyan:    '#4BA8D4',
  teal:    '#2ABFA0',
  pulse:   '#7B4FD4',
  signal:  '#E84444',
  rise:    '#44CC88',

  ep1:     '#8B6914',
  ep2:     '#9E3A1A',
  ep3:     '#1A4B9E',
  ep4:     '#4B1A9E',
  ep5:     '#D4A843',

  cream:   '#F5F0E8',
  ghost:   'rgba(255,255,255,0.05)',
  glow:    'rgba(212,168,67,0.10)',
};

// ============================================================
// DATA
// ============================================================

const EPOCHS = [
  {
    n: 'I',
    name: 'The Publishing Age',
    era: '1400s – 1900s',
    product: 'Notation (Sheet Music)',
    mechanism: 'Physical Sale of Paper / Printing Monopoly',
    mogul: 'The Printer',
    color: C.ep1,
    pivot: 'Ottaviano Petrucci secured First Rights in 1498 — a monopoly on music printing. Power = physical reproduction.',
  },
  {
    n: 'II',
    name: 'The Recording Era',
    era: '1920s – 1990s',
    product: 'Performance (Records / CDs)',
    mechanism: 'Physical Sale of an Object',
    mogul: 'The Record Label',
    color: C.ep2,
    pivot: 'Edison\'s phonograph (1877) → Victor Records → Columbia → The Big Four. Power = distribution.',
  },
  {
    n: 'III',
    name: 'The Digital Disruption',
    era: '2000s',
    product: 'File (MP3)',
    mechanism: 'File Ownership (99¢) or Piracy (Free)',
    mogul: 'The Tech Platform (iTunes)',
    color: C.ep3,
    pivot: 'Napster broke the physical sale. iTunes rebuilt it digitally. Power = the store.',
  },
  {
    n: 'IV',
    name: 'The Streaming Age',
    era: '2010s – Present',
    product: 'Access (Rights / Streams)',
    mechanism: 'Licensing of IP (Recurring Micro-Payment)',
    mogul: 'The IP Holder / Asset Manager',
    color: C.ep4,
    pivot: 'Spotify reframed music as a service. Catalog sales financialized the IP. Power = the rights stack.',
  },
  {
    n: 'V',
    name: 'NOIZY MC96ECO Universe',
    era: '2026 → 2526',
    product: 'Inheritable Asset (Voice Estate)',
    mechanism: 'Protocol (Consent-as-Code) · 75/25 Perpetual Royalty',
    mogul: 'The Infrastructure Architect',
    color: C.ep5,
    pivot: 'Rights enforced at the infrastructure level. The consent ledger, not the legal contract, is the law. Power = the protocol.',
    isNOIZY: true,
  },
];

const PRINCIPLES = [
  {
    n: '01',
    title: 'Artist Creator First',
    subtitle: 'RSP_001 is the proof of concept.',
    desc: 'Everything in the NOIZY universe is built for Rob as an artist before it is offered to anyone else. If it doesn\'t work for the creator who needs it most, it ships to nobody.',
    quote: '"I am the first client. If it doesn\'t work for me, it ships to nobody."',
    color: C.gold,
    icon: '🎤',
  },
  {
    n: '02',
    title: 'Consent as Code',
    subtitle: 'Rights enforced at the infrastructure level.',
    desc: 'The 75/25 perpetual royalty split, no buyout clauses, and the Consent-as-Code architecture built on Cloudflare Workers and D1. Artist rights are in the code — not the terms of service.',
    quote: '"If the consent isn\'t in the code, it isn\'t consent."',
    color: C.cyan,
    icon: '⚖️',
  },
  {
    n: '03',
    title: 'The 500-Year Vision',
    subtitle: '7 epochs. 2026 to 2526.',
    desc: 'The MC96ECO Universe operates on a 500-year timeline. Rob\'s 40-year body of work is the seed. The Codex is the map. The goal is not to build a company — it is to plant a civilization.',
    quote: '"We are not building a company. We are planting a civilization."',
    color: C.teal,
    icon: '∞',
  },
  {
    n: '04',
    title: 'Infrastructure is Policy',
    subtitle: 'Code enforces. Terms of service do not.',
    desc: 'Legal terms can be rewritten. Code enforces. Every ethical commitment NOIZY makes to creators is implemented at the architecture level — in the consent ledger, in the royalty split mechanics, in the watermarking system.',
    quote: '"The policy is the infrastructure."',
    color: C.pulse,
    icon: '🏗️',
  },
];

const UNIVERSE = [
  {
    id: 'noizy',
    name: 'NOIZY.ai',
    subtitle: 'The Mothership',
    desc: 'Flagship intelligence platform. Dark space aesthetic. Consent-first onboarding. DreamChamber portal entry. Every other brand lives inside NOIZY.ai.',
    status: 'LIVE — noizy.ai',
    stack: 'React JSX · Cloudflare · D1 Consent Ledger · GABRIEL_V3',
    revenue: 'Subscription + Enterprise',
    color: C.gold,
    icon: '🌌',
  },
  {
    id: 'noizyvox',
    name: 'NOIZYVOX',
    subtitle: 'A.I.V.A. Voice Platform',
    desc: 'Artificially Intelligent Voice Acting. Consent-first voice platform. RSP_001 is the proof of concept. Pipeline: Librosa + XTTS v2 + RVC + pedalboard + Gemma2.',
    status: 'In Development — Q2 2026',
    stack: 'Librosa · XTTS v2 · RVC · Pedalboard · Gemma2',
    revenue: '75/25 Perpetual Royalty · No Buyout Clauses',
    color: C.cyan,
    icon: '🎙️',
    differentiator: 'Voice Estate IP — voices as inheritable, licensable assets',
  },
  {
    id: 'noizylab',
    name: 'NOIZYLAB',
    subtitle: 'Ottawa Tech Services',
    desc: 'The practical revenue engine. Device repair at $89 flat rate, 12 repairs per day target. Ottawa-area consumer and small business. Funds the visionary work.',
    status: 'noizylab.ca',
    revenue: '$389,280 / year target · $89 × 12 repairs/day',
    color: C.amber,
    icon: '🔧',
  },
  {
    id: 'noizykidz',
    name: 'NOIZYKIDZ',
    subtitle: 'Haptic Music for Every Child',
    desc: 'Haptic music solutions for deaf children and autism spectrum families. Every child deserves to feel music. Inspired by Nims (Mike Nemesvary). Frequency-to-haptic mapping.',
    status: 'Prototype — August 2026',
    stack: 'Haptic Transmission · Neuro-Acoustic Frequency Mapping',
    revenue: 'N/A — Soul Mission / Research',
    color: C.rise,
    icon: '🎵',
    soul: 'Inspired by Nims — Mike Nemesvary',
  },
  {
    id: 'fish',
    name: 'Fish Music Inc.',
    subtitle: 'The Legacy Vault',
    desc: '40 years. 34 terabytes. THE_AQUARIUM catalog. Ed Edd n Eddy, Dragon Tales, Johnny Test, Transformers, Barbie films. The archive that proves the vision is earned.',
    status: 'fishmusicinc.com — LIVE',
    revenue: 'Sync Licensing · Music Supervision · Catalog Licensing',
    color: C.teal,
    icon: '🐟',
    archive: '34TB — THE_AQUARIUM',
  },
];

const MOAT = [
  { cap: 'Consent-as-Code Architecture',    noizy: true,  el: false,   suno: false  },
  { cap: '75/25 Perpetual Royalty Split',   noizy: true,  el: false,   suno: false  },
  { cap: 'Voice Estate IP Framework',       noizy: true,  el: false,   suno: false  },
  { cap: 'Neuro-Acoustic Research Layer',   noizy: true,  el: false,   suno: false  },
  { cap: 'Haptic / Accessibility Pipeline', noizy: true,  el: false,   suno: false  },
  { cap: 'Watermark / NOIZY PROOF',         noizy: true,  el: 'Partial', suno: false },
  { cap: 'Living Score Adaptive Music',     noizy: true,  el: false,   suno: 'Partial' },
  { cap: 'Own AI Stack ($16K+/yr savings)', noizy: true,  el: false,   suno: false  },
  { cap: '40-Year Creator Archive',         noizy: true,  el: false,   suno: false  },
  { cap: 'Creator-Founder Proof of Concept', noizy: 'RSP_001', el: false, suno: false },
  { cap: 'Canadian Ethics Alignment',       noizy: true,  el: false,   suno: false  },
  { cap: '500-Year Codex Vision',           noizy: true,  el: false,   suno: false  },
];

const ROADMAP = [
  {
    month: 'Mar 2026',
    label: 'Foundation',
    color: C.gold,
    items: [
      'NOIZY.ai temp homepage LIVE',
      'Founder Blueprint published',
      'Brand system designed',
      'Master Encyclopedia launched',
    ],
  },
  {
    month: 'Apr 2026',
    label: 'Voice',
    color: C.cyan,
    items: [
      'NOIZYVOX portal build begins',
      'RSP_001 GPU inference environment',
      'A.I.V.A. branding rollout',
    ],
  },
  {
    month: 'May 2026',
    label: 'Army',
    color: C.amber,
    items: [
      'Operation Voice Army — first voice actor onboarding',
      'NOIZY PROOF watermarking alpha',
      'License flags cleared with Alex',
    ],
  },
  {
    month: 'Jun 2026',
    label: 'Sync',
    color: C.teal,
    items: [
      'Living Score prototype',
      'Fish Music / THE_AQUARIUM sync portal LIVE',
      'NOIZYLAB portal launch',
    ],
  },
  {
    month: 'Jul 2026',
    label: 'Research',
    color: C.pulse,
    items: [
      'Cultural Resonance Engine research phase',
      'NAI research partnership with Dr. Benoit deepens',
      'NRC IRAP application',
    ],
  },
  {
    month: 'Aug 2026',
    label: 'Soul',
    color: C.rise,
    items: [
      'NOIZYKIDZ haptics prototype',
      'LIFELUV companion AI alpha for Nims',
      'DreamChamber client beta',
    ],
  },
  {
    month: 'Sep 2026',
    label: 'Series A',
    color: C.gold,
    items: [
      'Full MC96ECO Universe LIVE',
      '6-month competitive lead LOCKED IN',
      'Series A readiness assessment',
    ],
    milestone: true,
  },
];

const BOARD = [
  {
    name: 'Rob Plowman — RSP_001',
    role: 'Founder & Creator',
    desc: '40-year professional composer, sound designer, audio director. Ed Edd n Eddy, Dragon Tales, Johnny Test, Transformers, Barbie films. Q107 Homegrown winner. Audio Director, Fuel Industries (150-person agency, 14 years). GORUNFREE survival architect.',
    color: C.gold,
    icon: '🎵',
  },
  {
    name: 'Alex',
    role: 'Enterprise & Capital',
    desc: 'Board lead. Enterprise strategy and capital architecture. License flag review authority for commercial deployment of MusicGen, MaskGCT, Tango 2, and Fish Speech.',
    color: C.cyan,
    icon: '💼',
  },
  {
    name: 'Dr. Brien Benoit',
    role: 'Wisdom Keeper',
    desc: 'Neurosurgeon, Ottawa Civic Hospital. Health Canada PMPRB Chair. NAI (Neuro-Acoustic Intelligence) research partner. Scientific backbone of NOIZYKIDZ and Living Score frontiers.',
    color: C.teal,
    icon: '🧠',
  },
  {
    name: 'Adam Robb',
    role: 'Security Architect',
    desc: 'Senior Security Consultant, iPSS Inc. Owns watermarking and NOIZY PROOF development. The cryptographic authenticity layer for the AI audio age.',
    color: C.pulse,
    icon: '🔐',
  },
];

const STACK_MODELS = [
  { name: 'MusicGen', role: 'Generative music composition', flag: true },
  { name: 'MaskGCT', role: 'Masked generative codec transformer', flag: true },
  { name: 'Tango 2', role: 'Audio generation from text', flag: true },
  { name: 'Fish Speech', role: 'Neural text-to-speech', flag: true },
  { name: 'Librosa', role: 'Audio analysis and feature extraction', flag: false },
  { name: 'XTTS v2', role: 'Cross-lingual text-to-speech synthesis', flag: false },
  { name: 'RVC', role: 'Real-time voice conversion', flag: false },
  { name: 'pedalboard', role: 'Audio effects pipeline', flag: false },
  { name: 'Gemma2', role: 'Language model orchestration', flag: false },
];

const GORUNFREE = [
  { n: '35%', label: 'Voice', desc: 'Input by spoken command — narrate intentions, concepts, directions' },
  { n: '65%', label: 'AI', desc: 'Execution by GABRIEL_V3 and the agent stack' },
  { n: '1-Click', label: 'Execution', desc: 'Zero friction between intention and execution' },
  { n: '0', label: 'Friction', desc: 'Gap between imagination and reality approaches zero' },
];

// ============================================================
// CANVAS: EPOCH TIMELINE
// ============================================================

function EpochCanvas({ activeEpoch }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const W = canvas.width;
    const H = canvas.height;

    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);

      const n = EPOCHS.length;
      const nodeSpacing = W / (n + 1);

      // Connection line
      for (let i = 0; i < n - 1; i++) {
        const x1 = nodeSpacing * (i + 1);
        const x2 = nodeSpacing * (i + 2);
        const grad = ctx.createLinearGradient(x1, H / 2, x2, H / 2);
        grad.addColorStop(0, EPOCHS[i].color + '60');
        grad.addColorStop(1, EPOCHS[i + 1].color + '60');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, H / 2);
        ctx.lineTo(x2, H / 2);
        ctx.stroke();
      }

      EPOCHS.forEach((ep, i) => {
        const x = nodeSpacing * (i + 1);
        const y = H / 2;
        const isActive = activeEpoch === i;
        const r = isActive ? 18 + Math.sin(t * 0.05) * 3 : (ep.isNOIZY ? 14 : 10);

        // Glow
        if (ep.isNOIZY || isActive) {
          const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
          glow.addColorStop(0, ep.color + '40');
          glow.addColorStop(1, 'transparent');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, r * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Node
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? ep.color : ep.color + (ep.isNOIZY ? 'ff' : '80');
        ctx.fill();

        // Epoch number
        ctx.fillStyle = C.void;
        ctx.font = `bold ${isActive ? 11 : 9}px DM Sans, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(ep.n, x, y + 4);

        // Label
        ctx.fillStyle = isActive ? ep.color : ep.color + 'aa';
        ctx.font = `${isActive ? 'bold ' : ''}9px DM Sans, sans-serif`;
        ctx.fillText(ep.era.split('–')[0].trim(), x, y + r + 14);
      });

      t++;
      animRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [activeEpoch]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

// ============================================================
// CANVAS: STAR FIELD
// ============================================================

function StarField() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const W = canvas.width;
    const H = canvas.height;

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
      speed: 0.005 + Math.random() * 0.015,
    }));

    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      stars.forEach(s => {
        s.phase += s.speed;
        const alpha = 0.1 + Math.sin(s.phase) * 0.15;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = C.gold;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      t++;
      animRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

// ============================================================
// REUSABLE COMPONENTS
// ============================================================

function Check({ value }) {
  if (value === true) return <span style={{ color: C.rise, fontWeight: 700 }}>✓</span>;
  if (value === false) return <span style={{ color: C.signal + '60' }}>✗</span>;
  return <span style={{ color: C.amber, fontSize: 11 }}>{value}</span>;
}

function Tag({ children, color }) {
  return (
    <span style={{
      display: 'inline-block',
      background: (color || C.gold) + '18',
      border: `1px solid ${color || C.gold}50`,
      color: color || C.gold,
      fontSize: 10,
      fontFamily: 'DM Sans, sans-serif',
      fontWeight: 600,
      letterSpacing: 1,
      textTransform: 'uppercase',
      padding: '3px 8px',
      borderRadius: 4,
    }}>{children}</span>
  );
}

// ============================================================
// VIEW: THE COVER
// ============================================================

function CoverView() {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0 40px' }}>
      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 13, color: C.gold + '80', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 20 }}>
        Confidential · Board of Aligned Minds
      </div>

      <div style={{ position: 'relative', display: 'inline-block', marginBottom: 32 }}>
        <div style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 60,
          color: C.cream,
          fontWeight: 700,
          lineHeight: 1.0,
          letterSpacing: -1,
        }}>
          MC96ECO<br />
          <span style={{ color: C.gold }}>UNIVERSE</span>
        </div>
      </div>

      <div style={{ fontFamily: 'IM Fell English, serif', fontSize: 22, color: C.cream + 'cc', fontStyle: 'italic', marginBottom: 8 }}>
        Founder Blueprint · 2026
      </div>
      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: C.gold, marginBottom: 32 }}>
        ROB PLOWMAN — RSP_001 — NOIZYFISH INC.<br />
        <span style={{ color: C.cream + '60', fontSize: 12 }}>Ottawa, Canada · March 2026</span>
      </div>

      {/* Key stats */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 0, marginBottom: 44 }}>
        {[
          { n: '40', label: 'Years Professional\nCredits' },
          { n: '34TB', label: 'THE_AQUARIUM\nArchive' },
          { n: 'Zero', label: 'Direct Competitors\nacross 12 Dimensions' },
          { n: '500', label: 'Year Vision\n2026 → 2526' },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1, padding: '24px 20px',
            borderRight: i < 3 ? `1px solid ${C.border}` : 'none',
          }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, color: C.gold, fontWeight: 700, marginBottom: 6 }}>{s.n}</div>
            <div style={{ fontSize: 11, color: C.cream + '70', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* The one-sentence summary */}
      <div style={{
        background: C.glow,
        border: `1.5px solid ${C.gold}40`,
        borderRadius: 16,
        padding: '28px 40px',
        maxWidth: 720,
        margin: '0 auto 36px',
      }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: C.cream, lineHeight: 1.5, marginBottom: 16 }}>
          "NOIZY is not disrupting the music industry.<br />It is building the next era."
        </div>
        <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + '80', lineHeight: 1.8 }}>
          The transition from Epoch IV (Licensing IP / Streaming Age) to Epoch V (NOIZY) is the shift from legal contracts to protocol — from access to inheritable assets — from optional watermarking to cryptographic provenance. Rights are no longer negotiated. They are enforced by code.
        </div>
      </div>

      {/* GORUNFREE */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 32px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.amber, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>GORUNFREE Protocol</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
          {GORUNFREE.map((g, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: C.amber, fontWeight: 700 }}>{g.n}</div>
              <div style={{ fontSize: 12, color: C.amber, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>{g.label}</div>
              <div style={{ fontSize: 10, color: C.cream + '60', fontFamily: 'DM Sans, sans-serif', marginTop: 3, lineHeight: 1.4, maxWidth: 90 }}>{g.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, fontFamily: 'Lora, serif', fontSize: 13, color: C.cream + '80', fontStyle: 'italic', lineHeight: 1.6, textAlign: 'center' }}>
          "35% voice. 65% AI. 1-click execution. Zero friction between intention and execution."
        </div>
      </div>
    </div>
  );
}

// ============================================================
// VIEW: THE ORIGIN
// ============================================================

function OriginView() {
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: C.cream, marginBottom: 8 }}>I. The Origin Story</div>
        <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + '70', fontStyle: 'italic' }}>Where 40 years of professional creation meets the AI age.</div>
      </div>

      {/* Rob's story */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '28px 32px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
          <div style={{ fontSize: 44, flexShrink: 0 }}>🎵</div>
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: C.gold, fontWeight: 700, marginBottom: 6 }}>Rob Plowman — RSP_001</div>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.gold + '80', marginBottom: 14, letterSpacing: 0.5 }}>Ottawa, Canada · 40-Year Professional Composer, Sound Designer, Audio Director</div>
            <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + 'bb', lineHeight: 1.8 }}>
              Won the Q107 Homegrown Contest in the early 1990s. Scored Ed Edd n Eddy, Dragon Tales, Johnny Test, Transformers, and Barbie feature films. Served as Audio Director at Fuel Industries — a 150-person agency with major global clients — for 14 years, until the company went bankrupt. In 2024, a C3 spinal injury with permanent nerve damage fundamentally altered how Rob can work. Most people would stop. Rob built a new operating system for his mind.
            </div>
          </div>
        </div>
      </div>

      {/* Three pillars of origin */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          {
            title: 'The Transmission Problem',
            icon: '📡',
            color: C.cyan,
            body: 'Some artists paint all their pictures in their heads — complete, fully-rendered miracles. Then they have to describe them over a cell phone. The history of creative technology is the history of building better phones. NOIZY.ai is built on one conviction: AI is the highest-fidelity creative transmission cable ever built.',
            quote: '"AI does not replace artists. It removes friction between imagination and creation."',
          },
          {
            title: 'The Father\'s Blueprint',
            icon: '📐',
            color: C.teal,
            body: 'Rob\'s father, R.K. Plowman, was a civil engineer. Engineering principles — precision, systems thinking, infrastructure-first design — are in the DNA of every NOIZY product. The ENGR_KEITH agent honors that legacy directly. The MC96ECO Universe is, at its core, a precision-engineered creative infrastructure.',
            quote: 'Infrastructure first. Everything else follows.',
          },
          {
            title: 'Nims and the Soul',
            icon: '🏆',
            color: C.rise,
            body: 'Mike Nemesvary — known as Nims — is a quadriplegic world champion and Rob\'s close friend. Nims is the inspiration for the LIFELUV project and the NOIZYKIDZ accessibility mission. He is the proof that human limits are negotiable and that technology serves the freest possible version of a human being.',
            quote: '"Nims showed the world what a human being can do with no limits. LIFELUV shows what AI can do when it serves that kind of spirit."',
          },
        ].map((p, i) => (
          <div key={i} style={{ background: C.card, border: `1px solid ${p.color}30`, borderRadius: 12, padding: '20px 22px' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{p.icon}</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, color: p.color, fontWeight: 600, marginBottom: 10 }}>{p.title}</div>
            <div style={{ fontFamily: 'Lora, serif', fontSize: 13, color: C.cream + 'bb', lineHeight: 1.7, marginBottom: 12 }}>{p.body}</div>
            <div style={{ fontSize: 12, color: p.color + '99', fontStyle: 'italic', fontFamily: 'Lora, serif', lineHeight: 1.5 }}>"{p.quote.replace(/^"|"$/g, '')}"</div>
          </div>
        ))}
      </div>

      {/* Credits */}
      <div style={{ background: C.ghost, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 24px' }}>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.gold, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>Professional Credits (Selected)</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {['Ed Edd n Eddy', 'Dragon Tales', 'Johnny Test', 'Transformers', 'Barbie Films', 'Q107 Homegrown Winner', 'Fuel Industries (Audio Director, 14 years)', '34TB THE_AQUARIUM Archive'].map((c, i) => (
            <Tag key={i} color={C.gold}>{c}</Tag>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// VIEW: THE 5 EPOCHS
// ============================================================

function EpochsView() {
  const [activeEpoch, setActiveEpoch] = useState(4);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: C.cream, marginBottom: 8 }}>The Five Epochs of Music</div>
        <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + '70', fontStyle: 'italic', maxWidth: 640 }}>
          500 years of music business history reveals a single pattern: power shifts to whoever controls the dominant format of each era. NOIZY controls the format of Epoch V.
        </div>
      </div>

      {/* Timeline canvas */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, height: 100, marginBottom: 20, overflow: 'hidden', padding: '0 20px' }}>
        <EpochCanvas activeEpoch={activeEpoch} />
      </div>

      {/* Epoch tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto' }}>
        {EPOCHS.map((ep, i) => (
          <button key={i} onClick={() => setActiveEpoch(i)} style={{
            background: activeEpoch === i ? ep.color + '20' : C.card,
            border: `1.5px solid ${activeEpoch === i ? ep.color : C.border}`,
            borderRadius: 8,
            padding: '8px 16px',
            cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 12,
            color: activeEpoch === i ? ep.color : C.cream + '70',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>
            <span style={{ fontWeight: 700 }}>Epoch {ep.n}</span><br />
            <span style={{ fontSize: 10 }}>{ep.era}</span>
          </button>
        ))}
      </div>

      {/* Active epoch detail */}
      {activeEpoch !== null && (() => {
        const ep = EPOCHS[activeEpoch];
        return (
          <div style={{
            background: ep.isNOIZY ? `linear-gradient(135deg, ${ep.color}15 0%, ${ep.color}05 100%)` : C.card,
            border: `1.5px solid ${ep.isNOIZY ? ep.color + '70' : ep.color + '40'}`,
            borderRadius: 14,
            padding: '28px 32px',
            marginBottom: 28,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: ep.color + '99', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Epoch {ep.n} · {ep.era}</div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: ep.color, fontWeight: 700, marginBottom: 6 }}>{ep.name}</div>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: C.cream + 'aa' }}>Dominant Mogul: <span style={{ color: ep.color }}>{ep.mogul}</span></div>
              </div>
              {ep.isNOIZY && <Tag color={C.gold}>NOIZY EPOCH</Tag>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
              {[
                { label: 'The Product', value: ep.product },
                { label: 'Value Mechanism', value: ep.mechanism },
                { label: 'Pivot Moment', value: ep.pivot },
              ].map((f, i) => (
                <div key={i} style={{ background: C.ghost, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, color: ep.color, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif', marginBottom: 6 }}>{f.label}</div>
                  <div style={{ fontFamily: ep.isNOIZY && i === 2 ? 'Lora, serif' : 'DM Sans, sans-serif', fontSize: 13, color: C.cream + 'cc', lineHeight: 1.6, fontStyle: ep.isNOIZY && i === 2 ? 'italic' : 'normal' }}>{f.value}</div>
                </div>
              ))}
            </div>

            {ep.isNOIZY && (
              <div style={{ background: C.gold + '10', border: `1px solid ${C.gold}40`, borderRadius: 8, padding: '14px 18px' }}>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.gold, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>The Investor Thesis</div>
                <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream, lineHeight: 1.7 }}>
                  NOIZY's long-term value lies not in selling music or services, but in the licensing and widespread adoption of the Consent-as-Code, NOIZY PROOF, and Voice Estate protocols by other major platforms. The future Spotifys, Apples, and Metas will license our infrastructure. This is the true meaning of "planting a civilization."
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Comparison table */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.gold, letterSpacing: 1, textTransform: 'uppercase' }}>Epoch IV vs. Epoch V</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
          {/* Header */}
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, color: C.cream + '50', fontFamily: 'DM Sans, sans-serif' }}>Metric</div>
          </div>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}`, background: C.ep4 + '08' }}>
            <div style={{ fontSize: 11, color: C.ep4, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>Streaming Age (Epoch IV)</div>
          </div>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, background: C.ep5 + '10' }}>
            <div style={{ fontSize: 11, color: C.ep5, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>NOIZY MC96ECO (Epoch V)</div>
          </div>
          {/* Rows */}
          {[
            ['IP Mechanism', 'Legal Contract (Terms of Service)', 'Protocol (Consent-as-Code)'],
            ['The "Product"', 'Licensed Stream (Access)', 'Inheritable Asset (Voice Estate)'],
            ['Authenticity', 'Watermarking (Optional)', 'Cryptographic Provenance (NOIZY PROOF)'],
            ['Mogul Role', 'IP Holder / Asset Manager', 'Infrastructure Architect'],
          ].map(([metric, old, next], i) => (
            <React.Fragment key={i}>
              <div style={{ padding: '12px 16px', borderBottom: i < 3 ? `1px solid ${C.border}` : 'none', borderRight: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 12, color: C.cream + '80', fontFamily: 'DM Sans, sans-serif' }}>{metric}</div>
              </div>
              <div style={{ padding: '12px 16px', borderBottom: i < 3 ? `1px solid ${C.border}` : 'none', borderRight: `1px solid ${C.border}`, background: C.ep4 + '05' }}>
                <div style={{ fontSize: 12, color: C.cream + 'aa', fontFamily: 'DM Sans, sans-serif' }}>{old}</div>
              </div>
              <div style={{ padding: '12px 16px', borderBottom: i < 3 ? `1px solid ${C.border}` : 'none', background: C.ep5 + '08' }}>
                <div style={{ fontSize: 12, color: C.gold, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>{next}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// VIEW: THE UNIVERSE
// ============================================================

function UniverseView() {
  const [active, setActive] = useState('noizy');
  const brand = UNIVERSE.find(b => b.id === active);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: C.cream, marginBottom: 6 }}>III. The MC96ECO Universe</div>
        <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + '70', fontStyle: 'italic' }}>Five brands. One civilization.</div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {UNIVERSE.map(b => (
          <button key={b.id} onClick={() => setActive(b.id)} style={{
            background: active === b.id ? b.color + '20' : C.card,
            border: `1.5px solid ${active === b.id ? b.color : C.border}`,
            borderRadius: 10,
            padding: '10px 18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s',
          }}>
            <span style={{ fontSize: 18 }}>{b.icon}</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: active === b.id ? b.color : C.cream + '80', fontWeight: 600 }}>{b.name}</div>
              <div style={{ fontSize: 10, color: C.cream + '50', fontFamily: 'DM Sans, sans-serif' }}>{b.subtitle}</div>
            </div>
          </button>
        ))}
      </div>

      {brand && (
        <div style={{
          background: `linear-gradient(135deg, ${brand.color}12 0%, transparent 100%)`,
          border: `1.5px solid ${brand.color}50`,
          borderRadius: 16,
          padding: '32px 36px',
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <span style={{ fontSize: 44 }}>{brand.icon}</span>
            <div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: brand.color, fontWeight: 700 }}>{brand.name}</div>
              <div style={{ fontFamily: 'IM Fell English, serif', fontSize: 16, color: C.cream + 'aa', fontStyle: 'italic' }}>{brand.subtitle}</div>
            </div>
          </div>

          <div style={{ fontFamily: 'Lora, serif', fontSize: 15, color: C.cream + 'cc', lineHeight: 1.8, marginBottom: 20 }}>{brand.desc}</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {[
              brand.status && { label: 'Status', value: brand.status },
              brand.stack && { label: 'Stack', value: brand.stack },
              brand.revenue && { label: 'Revenue Model', value: brand.revenue },
              brand.differentiator && { label: 'Differentiator', value: brand.differentiator },
              brand.soul && { label: 'Soul', value: brand.soul },
              brand.archive && { label: 'Archive', value: brand.archive },
            ].filter(Boolean).map((f, i) => (
              <div key={i} style={{ background: C.ghost, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ fontSize: 10, color: brand.color, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif', marginBottom: 4 }}>{f.label}</div>
                <div style={{ fontSize: 12, color: C.cream + 'cc', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5 }}>{f.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue summary */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.gold, letterSpacing: 1, textTransform: 'uppercase' }}>Revenue Architecture</div>
        </div>
        {[
          { stream: 'Device Repair', platform: 'NOIZYLAB', model: '$89 flat rate × 12/day', target: '$389K/yr', ready: true },
          { stream: 'Voice Licensing', platform: 'NOIZYVOX / A.I.V.A.', model: '75/25 perpetual royalty', target: 'TBD', ready: false },
          { stream: 'Sync Licensing', platform: 'Fish Music / THE_AQUARIUM', model: 'Per-license + catalog', target: 'TBD', ready: true },
          { stream: 'Creator Platform', platform: 'NOIZY.ai / DreamChamber', model: 'Subscription + Enterprise', target: 'Series A', ready: false },
        ].map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.5fr 1fr 80px', padding: '12px 20px', borderBottom: i < 3 ? `1px solid ${C.border}` : 'none', alignItems: 'center' }}>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.cream, fontWeight: 600 }}>{r.stream}</div>
            <div style={{ fontSize: 12, color: C.cream + '80', fontFamily: 'DM Sans, sans-serif' }}>{r.platform}</div>
            <div style={{ fontSize: 12, color: C.cream + '80', fontFamily: 'DM Sans, sans-serif' }}>{r.model}</div>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.gold, fontWeight: 600 }}>{r.target}</div>
            <Tag color={r.ready ? C.rise : C.amber}>{r.ready ? 'READY' : 'Q2-Q3'}</Tag>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// VIEW: THE MOAT
// ============================================================

function MoatView() {
  return (
    <div>
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: C.cream, marginBottom: 8 }}>V. Zero Direct Competitors</div>
        <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + '70', fontStyle: 'italic', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
          Full competitive intelligence sweep conducted across ElevenLabs, Replica, Suno, Udio, and DistroKid. Conclusion: NOIZY.ai operates in an uncontested category across 12 capability dimensions.
        </div>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 28 }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 140px 140px', background: C.dim }}>
          <div style={{ padding: '14px 20px', fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.cream + '60', letterSpacing: 1, textTransform: 'uppercase' }}>Capability</div>
          {[
            { name: 'NOIZY.ai', color: C.gold },
            { name: 'ElevenLabs', color: C.cream + '50' },
            { name: 'Suno / Udio', color: C.cream + '50' },
          ].map((h, i) => (
            <div key={i} style={{ padding: '14px 20px', textAlign: 'center', borderLeft: `1px solid ${C.border}` }}>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: h.color, fontWeight: 600 }}>{h.name}</div>
            </div>
          ))}
        </div>
        {MOAT.map((row, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '1fr 140px 140px 140px',
            borderTop: `1px solid ${C.border}`,
            background: i % 2 === 0 ? 'transparent' : C.ghost,
          }}>
            <div style={{ padding: '12px 20px', fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.cream + 'cc' }}>{row.cap}</div>
            <div style={{ padding: '12px 20px', textAlign: 'center', borderLeft: `1px solid ${C.border}` }}><Check value={row.noizy} /></div>
            <div style={{ padding: '12px 20px', textAlign: 'center', borderLeft: `1px solid ${C.border}` }}><Check value={row.el} /></div>
            <div style={{ padding: '12px 20px', textAlign: 'center', borderLeft: `1px solid ${C.border}` }}><Check value={row.suno} /></div>
          </div>
        ))}
      </div>

      {/* Stack */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 28px' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: C.cyan, marginBottom: 16 }}>SUPERSONIC AI STACK v2.0</div>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.cream + '70', marginBottom: 16 }}>9 layers · 19 HuggingFace models · $16,000+/year in savings vs. commercial alternatives</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {STACK_MODELS.map((m, i) => (
            <div key={i} style={{
              background: m.flag ? C.amber + '0e' : C.ghost,
              border: `1px solid ${m.flag ? C.amber + '40' : C.border}`,
              borderRadius: 8,
              padding: '10px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: m.flag ? C.amber : C.cyan, fontWeight: 600 }}>{m.name}</div>
                <div style={{ fontSize: 11, color: C.cream + '70', fontFamily: 'DM Sans, sans-serif', marginTop: 2 }}>{m.role}</div>
              </div>
              {m.flag && <Tag color={C.amber}>License ⚑</Tag>}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, padding: '10px 14px', background: C.amber + '0a', border: `1px solid ${C.amber}30`, borderRadius: 8 }}>
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.amber + 'cc' }}>
            ⚑ License flags for MusicGen, MaskGCT, Tango 2, and Fish Speech require review by Alex (board) before commercial sync licensing or DreamChamber client launch.
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// VIEW: THE ROADMAP
// ============================================================

function RoadmapView() {
  const [expanded, setExpanded] = useState(0);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: C.cream, marginBottom: 6 }}>VII. The Six-Month Competitive Lead</div>
        <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + '70', fontStyle: 'italic' }}>March – September 2026. Zero direct competitors. Full MC96ECO ecosystem live.</div>
      </div>

      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 28, borderRadius: 8, overflow: 'hidden', border: `1px solid ${C.border}` }}>
        {ROADMAP.map((m, i) => (
          <div
            key={i}
            onClick={() => setExpanded(expanded === i ? null : i)}
            style={{
              flex: 1,
              padding: '10px 0',
              textAlign: 'center',
              cursor: 'pointer',
              background: expanded === i ? m.color + '30' : 'transparent',
              borderRight: i < ROADMAP.length - 1 ? `1px solid ${C.border}` : 'none',
              transition: 'background 0.2s',
            }}
          >
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: m.color, fontWeight: 600 }}>{m.month}</div>
            <div style={{ fontSize: 10, color: C.cream + '60', fontFamily: 'DM Sans, sans-serif' }}>{m.label}</div>
            {m.milestone && <div style={{ fontSize: 9, color: C.gold, fontFamily: 'DM Sans, sans-serif', marginTop: 2 }}>★ MILESTONE</div>}
          </div>
        ))}
      </div>

      {/* Expanded month */}
      {expanded !== null && (() => {
        const m = ROADMAP[expanded];
        return (
          <div style={{
            background: m.milestone ? `linear-gradient(135deg, ${m.color}15 0%, transparent 100%)` : C.card,
            border: `1.5px solid ${m.milestone ? m.color : C.border}`,
            borderRadius: 14,
            padding: '24px 28px',
            marginBottom: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: m.color, fontWeight: 700 }}>{m.month}</div>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: m.color + '80', letterSpacing: 1, textTransform: 'uppercase' }}>{m.label}</div>
              </div>
              {m.milestone && <Tag color={C.gold}>Series A Readiness</Tag>}
            </div>
            {m.items.map((item, j) => (
              <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: m.color, marginTop: 6, flexShrink: 0 }} />
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: C.cream + 'cc', lineHeight: 1.5 }}>{item}</div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* All milestones stacked */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {ROADMAP.map((m, i) => (
          <div
            key={i}
            onClick={() => setExpanded(expanded === i ? null : i)}
            style={{
              background: expanded === i ? m.color + '12' : C.ghost,
              border: `1px solid ${expanded === i ? m.color + '50' : 'transparent'}`,
              borderRadius: 8,
              padding: '12px 16px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color }} />
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: m.color, fontWeight: 600 }}>{m.month}</span>
              <span style={{ fontSize: 12, color: C.cream + '70', fontFamily: 'DM Sans, sans-serif' }}>{m.items[0]}{m.items.length > 1 ? ` + ${m.items.length - 1} more` : ''}</span>
            </div>
            {m.milestone && <Tag color={C.gold}>★</Tag>}
          </div>
        ))}
      </div>

      {/* Board */}
      <div style={{ marginTop: 32 }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: C.cream, marginBottom: 16 }}>Board of Aligned Minds</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {BOARD.map((b, i) => (
            <div key={i} style={{ background: C.card, border: `1px solid ${b.color}30`, borderRadius: 12, padding: '18px 22px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{b.icon}</span>
              <div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, color: b.color, fontWeight: 600, marginBottom: 3 }}>{b.name}</div>
                <div style={{ fontSize: 11, color: b.color + '80', fontFamily: 'DM Sans, sans-serif', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>{b.role}</div>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.cream + 'aa', lineHeight: 1.6 }}>{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// VIEW: THE LONGER ARC
// ============================================================

function ArcView() {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 13, color: C.gold + '70', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>∞ The Longer Arc</div>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, color: C.cream, fontWeight: 700, lineHeight: 1.2, marginBottom: 16 }}>
          What We Are Actually Building
        </div>
        <div style={{ fontFamily: 'Lora, serif', fontSize: 17, color: C.cream + 'bb', maxWidth: 680, margin: '0 auto', lineHeight: 1.8, fontStyle: 'italic' }}>
          NOIZY is not a startup in the conventional sense. It is a civilization-level creative infrastructure project that happens to begin with a startup. The DreamChamber Codex maps 7 epochs — 500 years of creator-owned, ethically-governed music intelligence.
        </div>
      </div>

      {/* Three transmissions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 36 }}>
        {[
          {
            icon: '📡',
            color: C.cyan,
            title: 'The Transmission Problem — Solved',
            body: 'Some artists paint all their pictures in their heads. They see complete, fully-rendered miracles — and then they have to describe them over a cell phone. AI is the highest-fidelity creative transmission cable ever built. NOIZY.ai closes the gap.',
            quote: '"For the first time, the gap between imagination and execution can approach zero."',
          },
          {
            icon: '⚖️',
            color: C.gold,
            title: 'The Rights Problem — Solved',
            body: 'The Copyright Act of 1909 established mechanical royalties as a legal requirement. NOIZY\'s equivalent is the 75/25 Perpetual Royalty Split enforced by Cloudflare D1/KV architecture — the first Agentic Royalty, distributed instantly to the Voice Estate every time GABRIEL uses the asset.',
            quote: '"The consent isn\'t in the terms of service. It\'s in the code."',
          },
          {
            icon: '🏗️',
            color: C.teal,
            title: 'The Power Problem — Solved',
            body: 'Power shifted from Printer (Epoch I) to Record Label (Epoch II) to Tech Platform (Epoch IV). The 5th Epoch shift is from Platform to Protocol Architect. NOIZY\'s value is in the adoption of its protocols by other platforms — the future Spotifys will license our infrastructure.',
            quote: '"We are not building a company. We are planting a civilization."',
          },
        ].map((p, i) => (
          <div key={i} style={{ background: C.card, border: `1px solid ${p.color}30`, borderRadius: 14, padding: '22px 24px' }}>
            <span style={{ fontSize: 32, display: 'block', marginBottom: 12 }}>{p.icon}</span>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, color: p.color, fontWeight: 600, marginBottom: 10, lineHeight: 1.3 }}>{p.title}</div>
            <div style={{ fontFamily: 'Lora, serif', fontSize: 13, color: C.cream + 'bb', lineHeight: 1.7, marginBottom: 12 }}>{p.body}</div>
            <div style={{ fontSize: 12, color: p.color + '99', fontStyle: 'italic', fontFamily: 'Lora, serif', lineHeight: 1.5 }}>"{p.quote.replace(/^"|"$/g, '')}"</div>
          </div>
        ))}
      </div>

      {/* The 40 years */}
      <div style={{
        background: `linear-gradient(135deg, ${C.gold}12 0%, transparent 100%)`,
        border: `1.5px solid ${C.gold}40`,
        borderRadius: 16,
        padding: '32px 40px',
        marginBottom: 28,
        textAlign: 'center',
      }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 13, color: C.gold + '70', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>The Archive as Proof</div>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: C.cream, fontWeight: 700, marginBottom: 14 }}>
          The 40 years of professional work in THE_AQUARIUM<br />are not a back catalog.
        </div>
        <div style={{ fontFamily: 'Lora, serif', fontSize: 17, color: C.cream + 'cc', lineHeight: 1.8, maxWidth: 620, margin: '0 auto 20px' }}>
          They are proof that this vision is not hypothetical. It is earned, documented, and ready.
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32 }}>
          {[['34TB', 'Catalog'], ['40', 'Years'], ['∞', 'Value']].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: C.gold, fontWeight: 700 }}>{s[0]}</div>
              <div style={{ fontSize: 11, color: C.cream + '70', fontFamily: 'DM Sans, sans-serif' }}>{s[1]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Final statement */}
      <div style={{ background: C.void, border: `1px solid ${C.border}`, borderRadius: 14, padding: '36px 48px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: C.cream, lineHeight: 1.6, marginBottom: 24, maxWidth: 640, margin: '0 auto 24px' }}>
          "Some artists paint all their pictures in their heads and then have to convey what they see — like describing a miracle over a cell phone. AI is the highest-fidelity transmission cable ever built. NOIZY.ai closes the gap."
        </div>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.gold, fontWeight: 600 }}>Rob Plowman — RSP_001</div>
        <div style={{ fontSize: 12, color: C.cream + '50', fontFamily: 'DM Sans, sans-serif', marginTop: 4 }}>NOIZYFISH INC. · MC96ECO Universe · Ottawa, Canada · 2026</div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function FounderBlueprint() {
  const [view, setView] = useState('cover');

  const NAV = [
    { id: 'cover',    label: 'Overview' },
    { id: 'origin',   label: 'I. Origin' },
    { id: 'epochs',   label: 'II. Five Epochs' },
    { id: 'universe', label: 'III. The Universe' },
    { id: 'moat',     label: 'IV. The Moat' },
    { id: 'roadmap',  label: 'V. Roadmap' },
    { id: 'arc',      label: '∞ The Arc' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.void, fontFamily: 'DM Sans, sans-serif', color: C.cream, position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;600&family=IM+Fell+English:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #201c40; border-radius: 2px; }
      `}</style>

      {/* Star field */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
        <StarField />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Top bar */}
        <div style={{
          borderBottom: `1px solid ${C.border}`,
          padding: '14px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: C.void + 'f0',
          backdropFilter: 'blur(16px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: C.gold, fontWeight: 700 }}>NOIZYFISH INC.</div>
            <div style={{ width: 1, height: 16, background: C.border }} />
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.cream + '60' }}>Founder Blueprint · March 2026</div>
          </div>
          <Tag color={C.gold}>Confidential · Board of Aligned Minds</Tag>
        </div>

        {/* Nav */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: C.void + 'f2',
          borderBottom: `1px solid ${C.border}`,
          padding: '0 40px',
          display: 'flex',
          backdropFilter: 'blur(16px)',
          overflowX: 'auto',
        }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setView(n.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '13px 16px',
              fontFamily: 'DM Sans, sans-serif', fontSize: 12,
              color: view === n.id ? C.gold : C.cream + '60',
              borderBottom: view === n.id ? `2px solid ${C.gold}` : '2px solid transparent',
              marginBottom: -1, transition: 'color 0.15s', letterSpacing: 0.3,
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>{n.label}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '44px 40px 80px' }}>
          {view === 'cover'    && <CoverView />}
          {view === 'origin'   && <OriginView />}
          {view === 'epochs'   && <EpochsView />}
          {view === 'universe' && <UniverseView />}
          {view === 'moat'     && <MoatView />}
          {view === 'roadmap'  && <RoadmapView />}
          {view === 'arc'      && <ArcView />}
        </div>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.deep }}>
          <div style={{ fontFamily: 'IM Fell English, serif', fontSize: 14, color: C.gold + '80', fontStyle: 'italic' }}>
            "We are not building a company. We are planting a civilization."
          </div>
          <div style={{ fontSize: 11, color: C.cream + '40', fontFamily: 'DM Sans, sans-serif', letterSpacing: 1, textAlign: 'right' }}>
            NOIZYFISH INC. · MC96ECO UNIVERSE<br />
            RSP_001 · rsp@noizyfish.com · noizy.ai
          </div>
        </div>
      </div>
    </div>
  );
}
