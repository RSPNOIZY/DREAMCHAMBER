import React, { useState, useEffect, useRef } from 'react';

// ============================================================
// THE HARMONY — NOIZY.AI MARKETING CAMPAIGN
// AI & Humans in Perfect Harmony. Always Growing.
// Helpful. Synchronic. Alive.
// Built: March 14, 2026 · NOIZY.ai · MC96ECO Universe
// ============================================================

const C = {
  void:    '#020209',
  deep:    '#06040f',
  panel:   '#0a0718',
  card:    '#0e0b1f',
  border:  '#161330',
  dim:     '#201c3a',

  gold:    '#D4A843',
  amber:   '#E8833A',
  dawn:    '#E8B84A',
  rose:    '#CC4488',
  teal:    '#2ABFA0',
  cyan:    '#4BA8D4',
  violet:  '#7B4FD4',
  lime:    '#88CC44',

  cream:   '#F5F0E8',
  white:   '#FFFFFF',
  ghost:   'rgba(255,255,255,0.05)',
};

// ============================================================
// CAMPAIGN LINES — the language of The Harmony
// ============================================================

const HEADLINE_LINES = [
  { line: 'AI doesn\'t replace you.', color: C.gold },
  { line: 'It remembers you perfectly.', color: C.dawn },
  { line: 'You bring the soul.', color: C.rose },
  { line: 'We bring the signal.', color: C.cyan },
  { line: 'Together we make', color: C.teal },
  { line: 'something neither could alone.', color: C.violet },
];

const CAMPAIGN_LINES = [
  {
    id: 'signal',
    tagline: 'Your signal. Perfectly transmitted.',
    body: 'For 100,000 years, musicians have tried to close the gap between what they hear in their heads and what the world actually receives. NOIZY.ai is the first transmission cable with no signal loss.',
    visual: 'Two waveforms converging into one — human voice and AI harmonic, becoming a single clean line.',
    channel: 'Landing page hero',
    color: C.gold,
    icon: '〰',
  },
  {
    id: 'memory',
    tagline: 'AI that remembers everything you made.',
    body: 'Every chord, every decision, every creative choice you\'ve ever recorded — understood, indexed, and ready to help you build the next thing. Your archive is not storage. It\'s memory.',
    visual: 'Constellation of music nodes lighting up as a hand touches the center — each node a song, a session, a voice.',
    channel: 'NOIZYVOX launch campaign',
    color: C.cyan,
    icon: '✦',
  },
  {
    id: 'bandmate',
    tagline: 'The bandmate who never sleeps.',
    body: 'GABRIEL isn\'t a tool. It\'s a creative partner that knows your catalogue, your preferences, your instincts. It doesn\'t replace your bandmates. It\'s the one who shows up at 3am when inspiration hits.',
    visual: 'Two silhouettes side by side — one human, one luminous — both leaning over a mixing board.',
    channel: 'Social / Creator community',
    color: C.teal,
    icon: '🎸',
  },
  {
    id: 'paid',
    tagline: 'Paid before the song reaches the world.',
    body: '75% of every use. Instant. Coded into the infrastructure before anyone can change it. Not a promise in a contract — a mathematical certainty in the ledger.',
    visual: 'A stream of light from a microphone to a wallet — no intermediaries in the chain.',
    channel: 'Rights / IP campaign — media, journalist, policy',
    color: C.amber,
    icon: '⚡',
  },
  {
    id: 'voice',
    tagline: 'Your voice is an estate. Not an asset.',
    body: 'Assets are owned by whoever holds the contract. Estates are inherited, protected, and permanent. Your voice, your creativity, your sound — registered forever, owned entirely by you.',
    visual: 'A living tree with roots labeled "consent" and "provenance" — the branches are voice waves, songs, styles.',
    channel: 'Voice Estate launch · legacy campaign',
    color: C.rose,
    icon: '🌱',
  },
  {
    id: 'children',
    tagline: 'Every child alive deserves to feel music.',
    body: 'NOIZYKIDZ is not a feature. It is the reason the whole system exists. Technology that amplifies humanity until even a child who has never heard a sound can feel the rhythm of the world.',
    visual: 'A child with headphones — not listening, feeling — hands on a glowing surface that pulses in color.',
    channel: 'NOIZYKIDZ soul campaign · education · press',
    color: C.lime,
    icon: '🎵',
  },
  {
    id: 'epoch',
    tagline: 'This is not the future. This is now.',
    body: 'Four epochs of music history led here. The printing press. The record player. The MP3. The stream. And now: the protocol. NOIZY.ai is the infrastructure for the next 500 years.',
    visual: 'A timeline of 5 eras — each one a glowing node — the fifth one pulsing brightest, labeled NOW.',
    channel: 'Investor / industry / press · B2B',
    color: C.violet,
    icon: '⚗️',
  },
  {
    id: 'family',
    tagline: 'The world\'s first global music family.',
    body: 'Not a platform. Not a tool. A civilization of creators who share one belief: that music belongs to the humans who make it, the communities that receive it, and the future that inherits it.',
    visual: 'A rotating globe — each continent lit by a music note, lines of connection drawn between them.',
    channel: 'The Guild · community campaign',
    color: C.gold,
    icon: '🌍',
  },
];

// ============================================================
// CHANNELS — where and how each campaign deploys
// ============================================================

const CHANNELS = [
  {
    id: 'organic',
    name: 'Creator Organic',
    icon: '🎤',
    color: C.gold,
    desc: 'Let the first 100 creators become the campaign. Give them the language, give them the tools, get out of the way.',
    tactics: [
      'Voice Estate registration — make it a moment, not a form',
      'Every first registration gets a personal message from Rob',
      'Creator "proof of concept" posts — show the 75/25 payment in real time',
      '"My voice is an estate" as a shareable card / badge',
      'The Guild membership as a public identity marker',
    ],
    reach: '0 → 100K organic',
    cost: 'Near zero',
    timing: 'Month 1',
  },
  {
    id: 'social',
    name: 'Social Presence',
    icon: '📱',
    color: C.cyan,
    desc: 'Not a broadcast channel. A living demonstration. Every post proves the technology works.',
    tactics: [
      'Rob creates 1 track/week using only GABRIEL + voice commands — posts the process',
      '"35% voice, 65% AI" as a recurring content format — show the GORUNFREE workflow',
      'Side-by-side: what Rob imagines vs. what GABRIEL executes (gap = zero)',
      'TikTok/Reels: "watch an AI learn a musician\'s style in real time"',
      'Quote cards from TheDeclaration — built to go viral in creator communities',
      'RSP_001 voice demo: "this is my voice model — here\'s what it can do"',
    ],
    reach: '100K → 1M potential',
    cost: 'Creator time only',
    timing: 'Month 1–3',
  },
  {
    id: 'press',
    name: 'Media & Press',
    icon: '📰',
    color: C.amber,
    desc: 'The story is not "new AI music tool." The story is "Ottawa composer builds the infrastructure for the next 500 years of music."',
    tactics: [
      'Pitch angle 1: The 5th Epoch — the music industry\'s next paradigm shift, built in Ottawa',
      'Pitch angle 2: The Consent-as-Code story — what if your rights were in the code, not the contract?',
      'Pitch angle 3: GORUNFREE — the C3 injury that became a new creative operating system',
      'Pitch angle 4: NOIZYKIDZ — haptic music for deaf children (guaranteed coverage)',
      'Target: Wired, Fast Company, The Verge, Pitchfork, Music Business Worldwide, CBC',
      'The Aquarium as a hook: 34TB of animation / game / film audio — a living archive',
    ],
    reach: '1M+ via earned media',
    cost: 'PR effort only',
    timing: 'Month 2–4',
  },
  {
    id: 'community',
    name: 'Creator Communities',
    icon: '✊',
    color: C.teal,
    desc: 'Go where creators already are. Don\'t build a community — join the one that exists, then offer something they don\'t have.',
    tactics: [
      'Discord servers: production, sound design, voice acting, beatmaking',
      'Reddit: r/WeAreTheMusicMakers, r/audioengineering, r/VoiceActing',
      'Offer free Voice Estate registration to any creator in these communities',
      'The Declaration as a shareable document — ask creators to sign publicly',
      'Partnership with independent creator newsletters (Bandcamp Weekly, Create Magazine)',
      'Presence at: NAMM, SXSW, Canadian Music Week, FACTOR sessions',
    ],
    reach: 'Deep trust within 50K–500K niche creators',
    cost: 'Time + travel',
    timing: 'Month 2–6',
  },
  {
    id: 'education',
    name: 'Education Ecosystem',
    icon: '🎓',
    color: C.lime,
    desc: 'NOIZYKIDZ is the Trojan horse for the education sector. Every school that touches it opens a door to the whole NOIZY universe.',
    tactics: [
      'Free NOIZYKIDZ pilot to 10 schools in Ottawa — document it fully',
      'Partner with music teachers associations (Canada, UK, US)',
      'Global Music Theory Atlas as a free educational resource (the NOIZYKidz.jsx component)',
      'Guest lecture series: "The History of Music Technology" — 5 Epochs as curriculum',
      'YouTube series: Rob teaches music theory through a world lens — every tradition, every era',
    ],
    reach: 'Long-term: millions of children globally',
    cost: 'Low — leverage existing assets',
    timing: 'Month 3–8',
  },
  {
    id: 'partnerships',
    name: 'Strategic Partnerships',
    icon: '🤝',
    color: C.rose,
    desc: 'One right partnership multiplies everything. Target the organizations that already have the trust of the people NOIZY needs to reach.',
    tactics: [
      'SOCAN (Ottawa — home turf, first call)',
      'Duncan Crabtree-Ireland / SAG-AFTRA — AI consent infrastructure partnership',
      'Dr. Brien Benoit / NAI — joint research announcement (credibility + press)',
      'Adam Robb / iPSS — NOIZY PROOF beta announcement',
      'Canadian Music Week — official launch vehicle',
      'FACTOR (Canadian music funding) — grant application + visibility',
      'NFB (National Film Board) — THE_AQUARIUM sync licensing partnership',
    ],
    reach: 'Institutional legitimacy → millions via proxy',
    cost: 'Relationship capital',
    timing: 'Month 1–6 (relationship building)',
  },
  {
    id: 'events',
    name: 'Live Events & Summits',
    icon: '🎪',
    color: C.violet,
    desc: 'The "Summit for the Future of Creative Rights" is not a conference. It is the public unveiling of the 5th Epoch. The new civilization is announced live.',
    tactics: [
      'Board of Aligned Minds Summit — small, invitation-only, maximum press',
      '"The 5th Epoch: Live Demo" — Rob composes a complete track using only voice commands',
      'NOIZYKIDZ live demonstration with a child experiencing haptic music for the first time',
      'Panel: "What happens when rights are in the code?" — Rob, Duncan, Dr. Benoit',
      'Guild founding ceremony — the first 100 creators sign The Declaration together',
    ],
    reach: '200 in room · 100K+ via video',
    cost: 'Significant but high ROI — the defining moment',
    timing: 'September 2026 (Series A readiness)',
  },
];

// ============================================================
// THE CORE MESSAGES — distilled to one sentence each
// ============================================================

const MESSAGES = [
  { audience: 'Artist', message: 'Your music is your estate. Own it forever.', color: C.gold },
  { audience: 'Fan', message: 'The artists you love will never be replaced. They\'ll be amplified.', color: C.cyan },
  { audience: 'Parent', message: 'Your child\'s creativity is the most valuable thing in the AI age.', color: C.lime },
  { audience: 'Tech', message: 'The most ethical AI infrastructure ever built. Come build it with us.', color: C.violet },
  { audience: 'Investor', message: 'Zero direct competitors. 500-year horizon. Protocol, not platform.', color: C.amber },
  { audience: 'Media', message: 'Ottawa composer builds the consent infrastructure for the AI age.', color: C.teal },
  { audience: 'Politician', message: 'The legal framework you need already exists in code.', color: C.rose },
  { audience: 'Educator', message: 'Every child deserves to know music belongs to all of humanity.', color: C.dawn },
];

// ============================================================
// THE 25 GROWTH MOVES
// ============================================================

const GROWTH_MOVES = [
  { n: '01', move: 'RSP_001 Weekly Creation Series', power: 'VIRAL', desc: 'Rob records one full composition using only voice commands + GABRIEL per week. Posted raw, unedited. Shows the workflow. Shows the gap closing in real time.', color: C.gold },
  { n: '02', move: 'Voice Estate Launch Event', power: 'IGNITION', desc: 'The moment Voice Estate goes live, make it a public ceremony. First 100 registrations get a personal acknowledgment from Rob and founding Guild member status.', color: C.cyan },
  { n: '03', move: '"Whose Voice Is This?" Campaign', power: 'VIRAL', desc: 'Show a popular AI-generated clone of a recognizable voice. Ask: did they consent? Did they get paid? Drives urgency and differentiates NOIZY instantly.', color: C.rose },
  { n: '04', move: 'NOIZYKIDZ First Pilot', power: 'PRESS MAGNET', desc: '10 deaf children. Haptic vests. A room full of music they\'ve never felt before. Document it. Release it. The world will share it 10 million times.', color: C.lime },
  { n: '05', move: 'The 75/25 Live Dashboard', power: 'TRUST', desc: 'A public, real-time dashboard showing every royalty payment made through the consent ledger. Not a promise. A scoreboard. Watch the money move instantly.', color: C.amber },
  { n: '06', move: 'TheDeclaration Public Signing', power: 'MOVEMENT', desc: 'Open TheDeclaration.jsx to public signature. Every creator who signs gets a permanent, provenance-stamped record on the NOIZY ledger. 10,000 signatures = a press story.', color: C.violet },
  { n: '07', move: 'The Guild First 100', power: 'COMMUNITY', desc: 'Personally recruit 100 founding Guild members across 10 regions. Each one becomes a regional ambassador. Ship them something physical — a package that says "you are a founder."', color: C.teal },
  { n: '08', move: 'GORUNFREE Masterclass', power: 'EDUCATION', desc: 'Free, public masterclass: "How I compose at 35% voice + 65% AI — and why it\'s better than before." Rob\'s survival architecture as teachable content. Captures the creator audience.', color: C.gold },
  { n: '09', move: 'THE_AQUARIUM Sync Portal Launch', power: 'REVENUE', desc: 'Make the 34TB catalog available for sync licensing through a beautiful, provenance-first portal. Every track stamped with NOIZY PROOF. Sell to games, film, TV.', color: C.amber },
  { n: '10', move: 'The Epoch V Announcement', power: 'INDUSTRY', desc: 'A formal, press-covered announcement: "NOIZY.ai declares the beginning of the 5th Epoch of music." White paper + interactive experience + live demo. The narrative moment.', color: C.violet },
  { n: '11', move: '"AI Bandmate" Branding Shift', power: 'POSITIONING', desc: 'Everywhere in the NOIZY universe: never say "AI tool." Always: "AI collaborator," "AI bandmate," "AI partner." Small language change, massive perception shift.', color: C.cyan },
  { n: '12', move: 'SOCAN Partnership Announcement', power: 'CREDIBILITY', desc: 'The moment SOCAN acknowledges NOIZY as a consent infrastructure partner, the industry pays attention. First Ottawa meeting: pitch the D1 consent ledger as their backend solution.', color: C.teal },
  { n: '13', move: 'Duncan Crabtree-Ireland Outreach', power: 'ALLIANCE', desc: 'SAG-AFTRA already has AI consent language from the 2023 strike. NOIZY is the technical infrastructure that makes it real-time and permanent. This is a natural alliance.', color: C.rose },
  { n: '14', move: 'The Creator Economy Report', power: 'AUTHORITY', desc: 'Publish "The State of Creator Rights in the AI Age 2026" — a data-driven report co-authored with Dr. Benoit. Position NOIZY as the authoritative research voice.', color: C.gold },
  { n: '15', move: 'NRC IRAP Application', power: 'FUNDING', desc: 'National Research Council Industrial Research Assistance Program. The NOIZYKIDZ haptics research + NAI neuro-acoustic work qualifies. Canadian government funding + credibility.', color: C.amber },
  { n: '16', move: 'FACTOR Canada Application', power: 'FUNDING', desc: 'FACTOR funds Canadian music technology and artist development. THE_AQUARIUM + NOIZYVOX are fundable projects. Apply Q2 2026.', color: C.lime },
  { n: '17', move: 'Competitor Comparison Campaign', power: 'POSITIONING', desc: '"ElevenLabs: 0/12. Suno: 0/12. NOIZY: 12/12." The moat table, visualized, simplified, posted. Not aggressive — factual. Let the comparison do the work.', color: C.cyan },
  { n: '18', move: 'The Transmission Problem Video', power: 'VIRAL', desc: 'A 90-second film: a composer\'s hands on a piano, hearing a symphony in their head, describing it over a cell phone to someone who can\'t hear it. Then: the gap closes. No dialogue. Just music.', color: C.violet },
  { n: '19', move: 'Operation Voice Army Phase 1', power: 'SCALE', desc: 'Onboard 50 voice actors in Month 1. Each gets: free Voice Estate registration, 75/25 perpetual terms, Guild founding membership. Their word-of-mouth reaches the entire voice acting community.', color: C.teal },
  { n: '20', move: 'The Living Score Prototype Demo', power: 'INNOVATION', desc: 'Live demo: a piece of music that changes in real time based on audience emotion. Dr. Benoit\'s NAI research + GABRIEL + Living Score engine. Nothing like it exists anywhere.', color: C.gold },
  { n: '21', move: 'Global Music Theory Atlas Release', power: 'EDUCATION', desc: 'Release NOIZYKidz.jsx publicly as a free educational resource. 10 traditions. 100,000 years of music. Let every teacher in the world use it. They become NOIZY ambassadors.', color: C.lime },
  { n: '22', move: 'The AscensionMap Public Launch', power: 'NARRATIVE', desc: 'Publish the 10-year AscensionMap as a public document. "Here is where we are going. Phase 1 has already started. We\'d like you to be part of it." Invite creators to mark their place on the map.', color: C.rose },
  { n: '23', move: 'NOIZY PROOF Beta Announcement', power: 'TECHNOLOGY', desc: 'The moment NOIZY PROOF watermarking is live in alpha, announce it with Adam Robb. "Every audio file on NOIZY now carries cryptographic proof of origin." This is the technical differentiator for the industry press.', color: C.amber },
  { n: '24', move: 'The DreamChamber Opening', power: 'EXCLUSIVE', desc: 'Invite 10 "Genius Creators" for the first DreamChamber session. Invitation-only. They experience the GORUNFREE workflow firsthand. They become the most credible possible advocates.', color: C.violet },
  { n: '25', move: 'September 2026 Summit — The Declaration of the 5th Epoch', power: 'MILESTONE', desc: 'The capstone event. Full MC96ECO Universe live. Series A readiness. The Guild\'s first 100 in the room. TheDeclaration signed publicly. NOIZY PROOF live. A moment in music history — witnessed.', color: C.gold },
];

// ============================================================
// CANVAS: HARMONY WAVES
// ============================================================

function HarmonyWaves() {
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

      // Human wave — irregular, organic
      const humanColor = C.amber;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 2) {
        const y = H / 2 + Math.sin(x * 0.015 + t * 0.02) * 28 +
                  Math.sin(x * 0.031 + t * 0.013) * 14 +
                  Math.sin(x * 0.007 + t * 0.031) * 8;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = humanColor + '80';
      ctx.lineWidth = 2;
      ctx.stroke();

      // AI wave — precise, harmonic
      const aiColor = C.cyan;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 2) {
        const y = H / 2 + Math.sin(x * 0.015 + t * 0.02 + Math.PI) * 28 +
                  Math.sin(x * 0.03 + t * 0.013 + 0.5) * 14;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = aiColor + '80';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Harmony wave — the convergence
      const harmColor = C.gold;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 2) {
        const human = Math.sin(x * 0.015 + t * 0.02) * 28 + Math.sin(x * 0.031 + t * 0.013) * 14;
        const ai = Math.sin(x * 0.015 + t * 0.02 + Math.PI) * 28 + Math.sin(x * 0.03 + t * 0.013 + 0.5) * 14;
        const y = H / 2 + (human + ai) * 0.35;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = harmColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Center glow
      const grd = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, 80);
      grd.addColorStop(0, C.gold + '20');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      t++;
      animRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

// ============================================================
// CANVAS: SYNC FIELD (growing constellation)
// ============================================================

function SyncField() {
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

    const nodes = Array.from({ length: 40 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 1.5 + Math.random() * 2.5,
      phase: Math.random() * Math.PI * 2,
      speed: 0.01 + Math.random() * 0.02,
      color: [C.gold, C.cyan, C.teal, C.amber, C.rose, C.violet][Math.floor(Math.random() * 6)],
    }));

    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.15;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(212,168,67,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Nodes
      nodes.forEach(n => {
        n.phase += n.speed;
        const pulse = Math.sin(n.phase) * 0.4;
        const alpha = 0.4 + pulse;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = n.color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + pulse * 1.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      t++;
      animRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function TheHarmony() {
  const [view, setView] = useState('vision');
  const [activeLine, setActiveLine] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [activeMove, setActiveMove] = useState(null);
  const [headlineIdx, setHeadlineIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeadlineIdx(i => (i + 1) % HEADLINE_LINES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const NAV = [
    { id: 'vision',   label: 'The Vision' },
    { id: 'language', label: 'The Language' },
    { id: 'channels', label: 'The Channels' },
    { id: 'moves',    label: 'The 25 Moves' },
    { id: 'messages', label: 'One Line Each' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.void, fontFamily: 'DM Sans, sans-serif', color: C.cream }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;600&family=IM+Fell+English:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #201c3a; border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{
        position: 'relative',
        padding: '52px 40px 44px',
        borderBottom: `1px solid ${C.border}`,
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${C.deep} 0%, ${C.void} 100%)`,
      }}>
        {/* Waves canvas */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.5 }}>
          <HarmonyWaves />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: C.gold + '99', textTransform: 'uppercase', marginBottom: 12, fontFamily: 'DM Sans, sans-serif' }}>
            NOIZY.ai · Marketing Campaign · The Harmony
          </div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 52, color: C.cream, fontWeight: 700, lineHeight: 1.0, marginBottom: 12 }}>
            The Harmony
          </div>
          {/* Rotating headline */}
          <div style={{ height: 42, marginBottom: 16, overflow: 'hidden' }}>
            {HEADLINE_LINES.map((h, i) => (
              <div
                key={i}
                style={{
                  fontFamily: 'IM Fell English, serif',
                  fontSize: 22,
                  color: h.color,
                  fontStyle: 'italic',
                  transition: 'opacity 0.6s, transform 0.6s',
                  opacity: headlineIdx === i ? 1 : 0,
                  transform: headlineIdx === i ? 'translateY(0)' : 'translateY(8px)',
                  position: 'absolute',
                }}
              >
                {h.line}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 2, background: C.amber }} />
              <span style={{ fontSize: 12, color: C.amber, fontFamily: 'DM Sans, sans-serif' }}>Human</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 2, background: C.cyan }} />
              <span style={{ fontSize: 12, color: C.cyan, fontFamily: 'DM Sans, sans-serif' }}>AI</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 2.5, background: C.gold }} />
              <span style={{ fontSize: 12, color: C.gold, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>Harmony</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: C.void + 'f2',
        borderBottom: `1px solid ${C.border}`,
        padding: '0 40px',
        display: 'flex',
        backdropFilter: 'blur(16px)',
      }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setView(n.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '13px 18px',
            fontFamily: 'DM Sans, sans-serif', fontSize: 13,
            color: view === n.id ? C.gold : C.cream + '60',
            borderBottom: view === n.id ? `2px solid ${C.gold}` : '2px solid transparent',
            marginBottom: -1, transition: 'color 0.15s', letterSpacing: 0.4,
          }}>{n.label}</button>
        ))}
      </div>

      {/* Main */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '44px 40px 80px' }}>

        {/* ========== VISION ========== */}
        {view === 'vision' && (
          <div>
            {/* Core proposition */}
            <div style={{
              background: `linear-gradient(135deg, ${C.gold}12 0%, ${C.cyan}06 100%)`,
              border: `1.5px solid ${C.gold}40`,
              borderRadius: 16,
              padding: '40px 48px',
              textAlign: 'center',
              marginBottom: 36,
            }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, color: C.cream, fontWeight: 700, lineHeight: 1.3, marginBottom: 20, maxWidth: 700, margin: '0 auto 20px' }}>
                AI & Humans in Perfect Harmony.<br />
                <span style={{ color: C.gold }}>Always Growing. Always Helpful.</span><br />
                Always Synchronic.
              </div>
              <div style={{ fontFamily: 'Lora, serif', fontSize: 16, color: C.cream + 'cc', lineHeight: 1.9, maxWidth: 680, margin: '0 auto', fontStyle: 'italic' }}>
                The campaign is not about what NOIZY does. It is about what becomes possible when AI and human creativity stop competing and start completing each other. Every note. Every voice. Every child who deserves to feel music. Every artist who deserves to be paid for what they made.
              </div>
            </div>

            {/* The three feelings */}
            <div style={{ marginBottom: 12, fontFamily: 'Playfair Display, serif', fontSize: 18, color: C.cream }}>
              The Campaign Creates Three Feelings
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 36 }}>
              {[
                {
                  feeling: 'Recognition',
                  icon: '✦',
                  color: C.gold,
                  desc: 'Every creator sees themselves in it. "That\'s exactly what I\'ve been feeling." The frustration of the gap between imagination and execution. The fear of replacement. The hope of something better.',
                  howTo: 'Show Rob\'s actual workflow. The struggle before GORUNFREE. The freedom after. Real, specific, earned.',
                },
                {
                  feeling: 'Possibility',
                  icon: '🌌',
                  color: C.cyan,
                  desc: '"I didn\'t know it could work like this." The moment a creator sees GABRIEL respond to a voice command and produce something that sounds exactly like what they imagined — that\'s the moment the campaign wins.',
                  howTo: 'Demo-first marketing. Let the technology speak. 60-second clips: voice command → full composition.',
                },
                {
                  feeling: 'Belonging',
                  icon: '🌍',
                  color: C.teal,
                  desc: '"I want to be part of this." The Guild. The Declaration. The founding creators. Not just a platform — a civilization being built in real time, with room for exactly you.',
                  howTo: 'Founding member identity. The first 100 get a moment. The first 1,000 get a history.',
                },
              ].map((f, i) => (
                <div key={i} style={{ background: C.card, border: `1px solid ${f.color}30`, borderRadius: 14, padding: '24px 26px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 24 }}>{f.icon}</span>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: f.color, fontWeight: 700 }}>{f.feeling}</div>
                  </div>
                  <div style={{ fontFamily: 'Lora, serif', fontSize: 13, color: C.cream + 'bb', lineHeight: 1.7, marginBottom: 14 }}>{f.desc}</div>
                  <div style={{ background: f.color + '10', border: `1px solid ${f.color}30`, borderRadius: 6, padding: '8px 12px', fontSize: 12, color: f.color, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5 }}>
                    <strong>How:</strong> {f.howTo}
                  </div>
                </div>
              ))}
            </div>

            {/* Sync field + core principle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, height: 220, overflow: 'hidden' }}>
                <SyncField />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { principle: 'Never say "AI tool."', instead: 'Say "AI collaborator," "AI bandmate," "AI partner."', color: C.gold },
                  { principle: 'Never lead with technology.', instead: 'Lead with the feeling. The gap closing. The thing you couldn\'t make before.', color: C.cyan },
                  { principle: 'Never compete.', instead: 'The platform that treats creators like humans wins automatically.', color: C.teal },
                  { principle: 'Always show, not tell.', instead: 'One real demo of GORUNFREE workflow is worth 10,000 words of copy.', color: C.amber },
                ].map((p, i) => (
                  <div key={i} style={{ background: C.ghost, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 10 }}>
                    <div style={{ color: p.color, fontSize: 12, flexShrink: 0, marginTop: 2 }}>✗</div>
                    <div>
                      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.cream + '80', marginBottom: 2, textDecoration: 'line-through' }}>{p.principle}</div>
                      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: p.color }}>✓ {p.instead}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========== LANGUAGE ========== */}
        {view === 'language' && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: C.cream, marginBottom: 6 }}>The Language of The Harmony</div>
              <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + '70', fontStyle: 'italic' }}>
                Eight campaign lines. Each one a different door into the same truth.
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {CAMPAIGN_LINES.map((line, i) => (
                <div
                  key={line.id}
                  onClick={() => setActiveLine(activeLine === line.id ? null : line.id)}
                  style={{
                    background: activeLine === line.id ? line.color + '10' : C.card,
                    border: `1.5px solid ${activeLine === line.id ? line.color + '60' : C.border}`,
                    borderRadius: 12,
                    padding: '18px 22px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 22, width: 32, textAlign: 'center', flexShrink: 0 }}>{line.icon}</span>
                      <div>
                        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: line.color, fontWeight: 600, marginBottom: 4 }}>
                          "{line.tagline}"
                        </div>
                        <div style={{ fontSize: 11, color: line.color + '80', fontFamily: 'DM Sans, sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>{line.channel}</div>
                      </div>
                    </div>
                    <span style={{ color: line.color, fontSize: 18, flexShrink: 0 }}>{activeLine === line.id ? '−' : '+'}</span>
                  </div>

                  {activeLine === line.id && (
                    <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <div style={{ fontSize: 10, color: line.color, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif', marginBottom: 8 }}>The Copy</div>
                        <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + 'cc', lineHeight: 1.8 }}>{line.body}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: line.color, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif', marginBottom: 8 }}>The Visual</div>
                        <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + 'aa', lineHeight: 1.7, fontStyle: 'italic', background: C.ghost, borderRadius: 8, padding: '12px 14px' }}>
                          {line.visual}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== CHANNELS ========== */}
        {view === 'channels' && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: C.cream, marginBottom: 6 }}>Where the Campaign Lives</div>
              <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + '70', fontStyle: 'italic' }}>
                Seven channels. Each one a different audience. All saying the same thing.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {CHANNELS.map(ch => (
                <div
                  key={ch.id}
                  onClick={() => setActiveChannel(activeChannel === ch.id ? null : ch.id)}
                  style={{
                    background: activeChannel === ch.id ? ch.color + '10' : C.card,
                    border: `1.5px solid ${activeChannel === ch.id ? ch.color + '60' : C.border}`,
                    borderRadius: 13,
                    padding: '20px 24px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 22 }}>{ch.icon}</span>
                      <div>
                        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: ch.color, fontWeight: 600 }}>{ch.name}</div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 10, color: ch.color + '80', fontFamily: 'DM Sans, sans-serif' }}>{ch.reach}</span>
                          <span style={{ fontSize: 10, color: C.cream + '50', fontFamily: 'DM Sans, sans-serif' }}>·</span>
                          <span style={{ fontSize: 10, color: C.cream + '60', fontFamily: 'DM Sans, sans-serif' }}>Cost: {ch.cost}</span>
                          <span style={{ fontSize: 10, color: C.cream + '50', fontFamily: 'DM Sans, sans-serif' }}>·</span>
                          <span style={{ fontSize: 10, color: ch.color + '80', fontFamily: 'DM Sans, sans-serif' }}>{ch.timing}</span>
                        </div>
                      </div>
                    </div>
                    <span style={{ color: ch.color, fontSize: 16 }}>{activeChannel === ch.id ? '−' : '+'}</span>
                  </div>

                  <div style={{ fontFamily: 'Lora, serif', fontSize: 13, color: C.cream + 'aa', lineHeight: 1.6, marginBottom: activeChannel === ch.id ? 14 : 0, fontStyle: 'italic' }}>{ch.desc}</div>

                  {activeChannel === ch.id && (
                    <div>
                      <div style={{ fontSize: 10, color: ch.color, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif', marginBottom: 10 }}>Tactics</div>
                      {ch.tactics.map((t, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 7 }}>
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: ch.color, marginTop: 6, flexShrink: 0 }} />
                          <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.cream + 'cc', lineHeight: 1.5 }}>{t}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== 25 MOVES ========== */}
        {view === 'moves' && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: C.cream, marginBottom: 6 }}>The 25 Moves That Spread NOIZY Worldwide</div>
              <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + '70', fontStyle: 'italic', maxWidth: 600 }}>
                In sequence, these 25 moves build from ignition to institution. Each one creates the conditions for the next. By Move 25, the campaign has become a moment in music history.
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {GROWTH_MOVES.map((move, i) => (
                <div
                  key={move.n}
                  onClick={() => setActiveMove(activeMove === move.n ? null : move.n)}
                  style={{
                    background: activeMove === move.n ? move.color + '10' : C.ghost,
                    border: `1px solid ${activeMove === move.n ? move.color + '50' : 'transparent'}`,
                    borderRadius: 10,
                    padding: '12px 18px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: move.color + '20',
                        border: `1.5px solid ${move.color}60`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700, color: move.color,
                        flexShrink: 0,
                      }}>{move.n}</div>
                      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: activeMove === move.n ? move.color : C.cream + 'cc', fontWeight: activeMove === move.n ? 600 : 400 }}>{move.move}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        fontSize: 9, fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
                        letterSpacing: 1, textTransform: 'uppercase',
                        color: move.color,
                        background: move.color + '18',
                        padding: '2px 7px', borderRadius: 3,
                      }}>{move.power}</span>
                      <span style={{ color: move.color + '80', fontSize: 14 }}>{activeMove === move.n ? '−' : '+'}</span>
                    </div>
                  </div>
                  {activeMove === move.n && (
                    <div style={{ marginTop: 12, paddingLeft: 40 }}>
                      <div style={{ fontFamily: 'Lora, serif', fontSize: 13, color: C.cream + 'cc', lineHeight: 1.7 }}>{move.desc}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== ONE LINE EACH ========== */}
        {view === 'messages' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: C.cream, marginBottom: 6 }}>One Line for Every Person</div>
              <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + '70', fontStyle: 'italic' }}>
                The Harmony campaign distilled to its minimum. Every audience. One sentence. The truth they need to hear.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 40 }}>
              {MESSAGES.map((m, i) => (
                <div key={i} style={{
                  background: `linear-gradient(135deg, ${m.color}10 0%, transparent 100%)`,
                  border: `1px solid ${m.color}30`,
                  borderRadius: 12,
                  padding: '20px 24px',
                }}>
                  <div style={{ fontSize: 10, color: m.color, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif', marginBottom: 10 }}>{m.audience}</div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, color: C.cream, lineHeight: 1.5, fontWeight: 600 }}>"{m.message}"</div>
                </div>
              ))}
            </div>

            {/* The single line that contains everything */}
            <div style={{
              background: `linear-gradient(135deg, ${C.gold}12 0%, ${C.cyan}06 100%)`,
              border: `2px solid ${C.gold}50`,
              borderRadius: 16,
              padding: '40px 48px',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.gold + '80', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>The One Line That Contains All of Them</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 30, color: C.cream, fontWeight: 700, lineHeight: 1.3, marginBottom: 24, maxWidth: 640, margin: '0 auto 24px' }}>
                "AI and humans, building music together —<br />
                <span style={{ color: C.gold }}>where every creator is paid, protected, and remembered forever."</span>
              </div>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.cream + '60' }}>
                NOIZY.ai · The Harmony Campaign · MC96ECO Universe · March 2026
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: '24px 40px', textAlign: 'center', background: C.deep }}>
        <div style={{ fontFamily: 'IM Fell English, serif', fontSize: 15, color: C.gold, fontStyle: 'italic', marginBottom: 6 }}>
          "Together we make something neither could alone."
        </div>
        <div style={{ fontSize: 11, color: C.cream + '40', fontFamily: 'DM Sans, sans-serif', letterSpacing: 1 }}>
          THE HARMONY · NOIZY.AI MARKETING CAMPAIGN · MC96ECO UNIVERSE · MARCH 2026
        </div>
      </div>
    </div>
  );
}
