import React, { useState, useEffect, useRef } from 'react';

// ============================================================
// THE CAMPAIGN — CREATOR POWER & THE PRESSURE MAP
// "We could save the unions worldwide. Or bypass them entirely
//  and give it all to the creators."
// Built: March 14, 2026 · NOIZY.ai · MC96ECO Universe
// ============================================================

const C = {
  void:    '#030209',
  deep:    '#06030f',
  panel:   '#0b0819',
  card:    '#100d22',
  border:  '#1a1535',
  dim:     '#24204a',

  fire:    '#E8440A',
  ember:   '#C84B11',
  amber:   '#D4A843',
  gold:    '#E8C14A',
  signal:  '#E84444',
  rise:    '#44CC88',
  ice:     '#4BA8D4',
  pulse:   '#9B4DD4',

  cream:   '#F5F0E8',
  white:   '#FFFFFF',
  ghost:   'rgba(255,255,255,0.05)',
  glow:    'rgba(232,68,10,0.12)',
};

// ============================================================
// THE CORE ARGUMENT — why self-survival works on everyone
// ============================================================

const SURVIVAL_ARGUMENTS = [
  {
    id: 'artist',
    audience: 'The Artist',
    icon: '🎤',
    color: C.fire,
    fear: 'My voice, my songs, my decades of craft — scraped, cloned, replaced.',
    truth: 'The platform that trained on you will now compete against you. You are both the resource and the competition. This is not a technology story. This is an extinction story.',
    survival: 'Own your voice. Earn from every use. Stop the machine from eating your life\'s work and selling it back without your name on it.',
    urgency: 'CRITICAL',
    ask: 'Register your voice estate. Join the Guild. Sign the Declaration.',
  },
  {
    id: 'parent',
    audience: 'The Parent',
    icon: '👨‍👩‍👧',
    color: C.amber,
    fear: 'My kid wants to be a musician. Is there a future in that?',
    truth: 'If the current trajectory continues, by 2030 there will be no sustainable career path for 90% of working musicians. The middle class of music is being deleted. Not disrupted — deleted.',
    survival: 'The world your child inherits is being decided right now. The infrastructure being built today will determine whether creativity is a career or a charity in 20 years.',
    urgency: 'HIGH',
    ask: 'NOIZYKIDZ in every school. Teach kids they own what they create.',
  },
  {
    id: 'union',
    audience: 'The Union Leader',
    icon: '✊',
    color: C.ice,
    fear: 'Our members are losing work. We negotiate. We fight. But the model keeps feeding.',
    truth: 'You are negotiating permission slips inside a machine that was built without asking permission. Every contract you sign ratifies the framework of extraction. The only winning move is a new framework.',
    survival: 'Lead the pivot to consent-as-infrastructure. Or watch your members leave the union and join a direct protocol that pays them without the middleman.',
    urgency: 'HIGH',
    ask: 'Partner with NOIZY on consent infrastructure. Make the union relevant again.',
  },
  {
    id: 'investor',
    audience: 'The Ethical Investor',
    icon: '💼',
    color: C.rise,
    fear: 'ESG risk, regulatory exposure, reputational liability.',
    truth: 'Every platform built on uncompensated creative labor is one court ruling away from catastrophe. The legal exposure of the extractive model is enormous and growing. The first wave of class actions has already started.',
    survival: 'The ethical platform wins the regulated future. NOIZY is not the socially responsible option — it is the legally defensible, economically resilient option.',
    urgency: 'MEDIUM',
    ask: 'Back the infrastructure that survives the incoming regulation wave.',
  },
  {
    id: 'politician',
    audience: 'The Politician',
    icon: '🏛️',
    color: C.pulse,
    fear: 'Millions of creative workers in my constituency are being economically destroyed.',
    truth: 'Music, film, writing, voice acting — entire creative industries are experiencing a displacement event faster than any previous technological shift. The political cost of inaction is enormous. The regulatory void is being filled by lobbyists.',
    survival: 'Be the legislator who built the framework that protected creators in the AI age. That legacy is available. The policy language already exists.',
    urgency: 'HIGH',
    ask: 'Mandate consent-as-code in AI training datasets. Legislate the 75/25 floor.',
  },
  {
    id: 'journalist',
    audience: 'The Journalist',
    icon: '📰',
    color: C.gold,
    fear: 'My stories, my research, my voice — also being scraped.',
    truth: 'This is not a music story. It is a creativity story. Every person who has ever written, recorded, or performed anything is in the same position as the musician. Journalists are creators too. You are inside this story.',
    survival: 'Tell it from the inside. The platform that can prove consent, provenance, and payment is the story. It exists. It\'s running in Ottawa.',
    urgency: 'MEDIUM',
    ask: 'Cover NOIZY as the counter-narrative. The alternative was built.',
  },
];

// ============================================================
// PRESSURE TARGETS — who to move and how
// ============================================================

const PRESSURE_TIERS = [
  {
    tier: 1,
    name: 'The Ignition Layer',
    desc: 'Direct creator allies — already angry, already activated. Need a home, not a reason.',
    color: C.fire,
    size: '10,000 – 100,000 creators',
    channel: 'Direct outreach, Discord, Twitter/X, artist communities',
    message: 'You built it. You own it. Here\'s the infrastructure that proves it.',
    targets: [
      'Independent musicians on Bandcamp / SoundCloud',
      'Voice actors (SAG-AFTRA and non-union)',
      'Beatmakers, producers, bedroom artists',
      'Podcasters and spoken word artists',
      'YouTubers and content creators',
    ],
    tactic: 'Give them a free Voice Estate registration. Give them the Declaration to sign. Give them a Guild seat. They become the campaign.',
    power: 'IGNITION',
  },
  {
    tier: 2,
    name: 'The Amplifier Layer',
    desc: 'Established artists with audiences and platforms. One post = 10,000 new creators hearing about NOIZY.',
    color: C.amber,
    size: '1,000 – 10,000 artists',
    channel: 'Personal outreach, manager contact, legal team contact',
    message: 'Your fans don\'t know their favorite artist is being replaced by a clone. We\'ll fix that.',
    targets: [
      'Mid-tier artists (100K–10M followers) who have spoken about AI',
      'Artists who have publicly opposed AI scraping',
      'Estate holders of deceased artists (AI clone threat is immediate)',
      'Artists in countries with strongest moral rights traditions (France, Germany, Canada)',
    ],
    tactic: 'Partner on a public Voice Estate registration. Make the announcement. The press follows.',
    power: 'AMPLIFY',
  },
  {
    tier: 3,
    name: 'The Institution Layer',
    desc: 'Organizations that represent tens of thousands of creators. Move one institution = move their whole membership.',
    color: C.ice,
    size: 'Tens of thousands via proxy',
    channel: 'Formal partnership proposals, policy meetings, conference appearances',
    message: 'Your members are asking what you\'re doing about AI. Here is what you can say you did.',
    targets: [
      'SOCAN (Ottawa — first call, already on Rob\'s list)',
      'ASCAP / BMI / SESAC (U.S. performing rights)',
      'PRS for Music (U.K.)',
      'CISAC (International confederation — represents 225 member societies)',
      'SAG-AFTRA (Duncan Crabtree-Ireland — already identified)',
      'Musicians\' Union (U.K.)',
      'AFM — American Federation of Musicians',
    ],
    tactic: 'Propose NOIZY as the technical infrastructure for consent tracking. Not competition — complement.',
    power: 'INSTITUTION',
  },
  {
    tier: 4,
    name: 'The Political Layer',
    desc: 'Legislation that mandates consent = permanent infrastructure advantage. Make the ethical choice the legal requirement.',
    color: C.pulse,
    size: 'National / International policy',
    channel: 'Policy papers, parliamentary submissions, lobbyist relationships',
    message: 'The framework exists. The infrastructure exists. All that\'s missing is the mandate.',
    targets: [
      'Canadian Heritage Committee (Ottawa — home turf)',
      'European Parliament AI Act implementation bodies',
      'U.S. Senate Judiciary — Subcommittee on IP',
      'WIPO (World Intellectual Property Organization)',
      'UK DCMS (Department for Culture, Media and Sport)',
    ],
    tactic: 'Submit the Consent-as-Code framework as a technical standard. NOIZY becomes the reference implementation.',
    power: 'MANDATE',
  },
  {
    tier: 5,
    name: 'The Public Layer',
    desc: 'The court of public opinion. When the public understands what\'s happening, the pressure on every other tier multiplies.',
    color: C.rise,
    size: 'Global — all music fans',
    channel: 'Viral campaign, press, social media, NOIZYKIDZ education',
    message: 'The music you love was made by a human. That human is being replaced by a machine trained on their work without permission or payment.',
    targets: [
      'Music fans who don\'t know this is happening',
      'Parents of young musicians',
      'Teachers and educators',
      'Tech workers with ethical discomfort',
      'Anyone who has ever loved a song',
    ],
    tactic: 'The "Whose Voice Is This?" campaign. Show the fan what their favorite artist stands to lose.',
    power: 'CULTURE',
  },
];

// ============================================================
// UNION QUESTION — save or bypass?
// ============================================================

const UNION_PATHS = {
  save: {
    label: 'Save the Unions',
    icon: '🤝',
    color: C.ice,
    pros: [
      'Existing relationships with millions of members',
      'Legal infrastructure already in place',
      'Political legitimacy and lobbying power',
      'Trust built over decades',
      'SAG-AFTRA 2023 AI provisions show they can pivot',
    ],
    cons: [
      'Slow-moving bureaucracy vs. real-time AI development',
      'Leadership often captured by legacy interests',
      'Dues structures create misaligned incentives',
      'Membership declining as creative work fragments',
      'Collective bargaining assumes employers — what if the employer is an algorithm?',
    ],
    verdict: 'Use them as Tier 3 amplifiers. Offer them the infrastructure. If they move, great. If not, move without them.',
    viability: 65,
  },
  bypass: {
    label: 'Bypass & Give It to Creators',
    icon: '⚡',
    color: C.fire,
    pros: [
      'Direct relationship between creator and platform — no middleman',
      'Instant royalty distribution via consent ledger',
      'No dues, no membership gates, no geographic limits',
      'Works for independent artists who were never in a union',
      'Transparent on-chain provenance — no one can dispute ownership',
      'Global from day one — unions are national, NOIZY is planetary',
    ],
    cons: [
      'No existing member base to activate immediately',
      'Loses union\'s lobbying infrastructure',
      'Requires critical mass before political leverage',
      'Some creators distrust platforms — even ethical ones',
    ],
    verdict: 'This is the right architecture. Build the direct infrastructure. When the unions see creators migrating to direct payment, they will either adapt or become irrelevant. Either outcome is fine.',
    viability: 92,
  },
};

// ============================================================
// THE DIRECT CREATOR MODEL
// ============================================================

const DIRECT_PILLARS = [
  {
    n: '01',
    title: 'Consent Ledger',
    desc: 'Every creator registers their voice, music, and creative output. Every AI use of that output requires a signed consent transaction. Every transaction is permanent, auditable, and non-repudiable.',
    what: 'No union needed to enforce consent. The infrastructure enforces it.',
    color: C.fire,
  },
  {
    n: '02',
    title: '75/25 Perpetual Split',
    desc: 'Creator receives 75% of every commercial use. Forever. Not negotiated per contract — built into the protocol. No label, no union, no platform can override this without the creator\'s consent.',
    what: 'No middleman taking the 40-60% that currently disappears between creation and payment.',
    color: C.amber,
  },
  {
    n: '03',
    title: 'Voice Estate',
    desc: 'Your voice is an asset. It can be licensed, inherited, sold, or retired. The creator — and only the creator — controls these terms. Death does not mean corporate seizure.',
    what: 'No label owning a deceased artist\'s likeness. No AI company cloning a living artist without consent.',
    color: C.gold,
  },
  {
    n: '04',
    title: 'The Guild (Non-Union Union)',
    desc: 'Global collective of creators with shared values, mutual support, and collective voice — but no mandatory dues, no geographic limits, no leadership hierarchy that can be captured.',
    what: 'All the solidarity of a union. None of the bureaucracy. Open to every creator on Earth.',
    color: C.rise,
  },
  {
    n: '05',
    title: 'Full Provenance',
    desc: 'Every piece of creative work carries its history — who made it, when, from what influences, using what tools. The NOIZY PROOF watermark makes origin permanently verifiable.',
    what: 'When provenance is structural, copying is exposed. Plagiarism becomes impossible to hide.',
    color: C.ice,
  },
  {
    n: '06',
    title: 'GABRIEL Witness',
    desc: 'The AI is not the adversary — it is the witness. GABRIEL_V3 is the system that watches every transaction, validates every consent, and can never be instructed to lie about what happened.',
    what: 'The AI works for the creator. Not for the platform. Not for the label. Not for the investor.',
    color: C.pulse,
  },
];

// ============================================================
// CANVAS: PRESSURE MAP VISUALIZATION
// ============================================================

function PressureMap({ activeTier }) {
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

    const tiers = PRESSURE_TIERS;
    const cx = W / 2;
    const cy = H / 2;
    const maxR = Math.min(W, H) * 0.42;

    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);

      tiers.forEach((tier, i) => {
        const r = maxR * ((i + 1) / tiers.length);
        const isActive = activeTier === i + 1;
        const pulse = isActive ? Math.sin(t * 0.05) * 6 : 0;

        // Ring
        ctx.beginPath();
        ctx.arc(cx, cy, r + pulse, 0, Math.PI * 2);
        ctx.strokeStyle = tier.color + (isActive ? 'cc' : '30');
        ctx.lineWidth = isActive ? 2 : 1;
        ctx.stroke();

        // Label
        const labelAngle = -Math.PI / 2 + (i * Math.PI * 0.3);
        const lx = cx + Math.cos(labelAngle) * (r + 14);
        const ly = cy + Math.sin(labelAngle) * (r + 14);
        ctx.fillStyle = tier.color + (isActive ? 'ff' : '80');
        ctx.font = `${isActive ? 'bold ' : ''}10px DM Sans, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(`T${tier.tier}`, lx, ly);
      });

      // Center — NOIZY core
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22);
      coreGrad.addColorStop(0, C.fire + 'ff');
      coreGrad.addColorStop(1, C.fire + '00');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 22 + Math.sin(t * 0.04) * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = C.cream;
      ctx.font = 'bold 10px DM Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NOIZY', cx, cy + 4);

      // Outward pressure lines
      if (activeTier) {
        const idx = activeTier - 1;
        const r = maxR * (activeTier / tiers.length);
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
          const progress = ((t * 2) % 100) / 100;
          const lx = cx + Math.cos(a) * r * progress;
          const ly = cy + Math.sin(a) * r * progress;
          ctx.beginPath();
          ctx.arc(lx, ly, 2, 0, Math.PI * 2);
          ctx.fillStyle = tiers[idx].color + '80';
          ctx.fill();
        }
      }

      t++;
      animRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [activeTier]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

// ============================================================
// CANVAS: FIRE PULSE (header)
// ============================================================

function FirePulse() {
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

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: H + Math.random() * 40,
      vx: (Math.random() - 0.5) * 1.2,
      vy: -(1 + Math.random() * 2.5),
      life: Math.random(),
      maxLife: 0.6 + Math.random() * 0.4,
      size: 2 + Math.random() * 5,
    }));

    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx + Math.sin(t * 0.03 + p.y * 0.01) * 0.3;
        p.y += p.vy;
        p.life -= 0.008;
        if (p.life <= 0) {
          p.x = Math.random() * W;
          p.y = H + 10;
          p.life = p.maxLife;
        }
        const a = p.life / p.maxLife;
        const r = Math.round(232 * a + 40 * (1 - a));
        const g = Math.round(68 * a);
        const b = 10;
        ctx.globalAlpha = a * 0.5;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2);
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
// MAIN COMPONENT
// ============================================================

export default function TheCampaign() {
  const [view, setView] = useState('survival');
  const [activeSurvival, setActiveSurvival] = useState(null);
  const [activeTier, setActiveTier] = useState(null);
  const [unionPath, setUnionPath] = useState('bypass');

  const NAV = [
    { id: 'survival', label: 'The Argument' },
    { id: 'pressure', label: 'Pressure Map' },
    { id: 'union', label: 'Unions vs. Direct' },
    { id: 'direct', label: 'Direct Creator Model' },
  ];

  const activeSurvivalData = SURVIVAL_ARGUMENTS.find(s => s.id === activeSurvival);
  const activeTierData = PRESSURE_TIERS.find(t => t.tier === activeTier);
  const activeUnion = UNION_PATHS[unionPath];

  return (
    <div style={{ minHeight: '100vh', background: C.void, fontFamily: 'DM Sans, sans-serif', color: C.cream }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;600&family=IM+Fell+English:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #24204a; border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{
        position: 'relative',
        padding: '56px 40px 40px',
        borderBottom: `1px solid ${C.border}`,
        overflow: 'hidden',
        background: `linear-gradient(180deg, #0d0003 0%, ${C.void} 100%)`,
      }}>
        <FirePulse />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: C.fire + 'aa', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'DM Sans, sans-serif' }}>
            NOIZY.ai · Creator Power · The Campaign
          </div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 48, color: C.cream, fontWeight: 700, marginBottom: 10, lineHeight: 1.05 }}>
            The Pressure Campaign
          </div>
          <div style={{ fontFamily: 'IM Fell English, serif', fontSize: 20, color: C.fire, fontStyle: 'italic', marginBottom: 18 }}>
            Find the people with heart. Move the people with power. Give it all to the creators.
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[
              { n: '6', label: 'Audiences to Convince' },
              { n: '5', label: 'Pressure Tiers' },
              { n: '1', label: 'Argument That Works on Everyone' },
              { n: '∞', label: 'Creators Who Deserve More' },
            ].map((s, i) => (
              <div key={i} style={{ background: C.ghost, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 16px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: C.fire, fontWeight: 700 }}>{s.n}</div>
                <div style={{ fontSize: 11, color: C.cream + '70', fontFamily: 'DM Sans, sans-serif' }}>{s.label}</div>
              </div>
            ))}
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
            padding: '14px 20px',
            fontFamily: 'DM Sans, sans-serif', fontSize: 13,
            color: view === n.id ? C.fire : C.cream + '70',
            borderBottom: view === n.id ? `2px solid ${C.fire}` : '2px solid transparent',
            marginBottom: -1, transition: 'color 0.15s', letterSpacing: 0.5,
          }}>{n.label}</button>
        ))}
      </div>

      {/* Main */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '44px 40px 80px' }}>

        {/* ============================
            VIEW: THE ARGUMENT
        ============================ */}
        {view === 'survival' && (
          <div>
            {/* The master argument */}
            <div style={{
              background: `linear-gradient(135deg, ${C.fire}18 0%, transparent 100%)`,
              border: `1.5px solid ${C.fire}50`,
              borderRadius: 16,
              padding: '32px 36px',
              marginBottom: 36,
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 14, color: C.fire, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>The One Argument That Works on Everyone</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 34, color: C.cream, fontWeight: 700, lineHeight: 1.2, marginBottom: 16, maxWidth: 720, margin: '0 auto 16px' }}>
                Self-Survival.
              </div>
              <div style={{ fontFamily: 'Lora, serif', fontSize: 17, color: C.cream + 'bb', lineHeight: 1.8, maxWidth: 680, margin: '0 auto 24px', fontStyle: 'italic' }}>
                You don't need to convince people to be ethical. You don't need them to be idealistic. You don't even need them to believe in the movement. You just need them to understand that the machine currently eating artists will eat their industry, their livelihood, their children's future — next. Self-survival is the most powerful motivator on Earth. Use it.
              </div>
              <div style={{ display: 'inline-block', background: C.fire + '20', border: `1px solid ${C.fire}60`, borderRadius: 8, padding: '10px 20px' }}>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.fire }}>
                  Heart + Humanity + Self-Interest = Unstoppable Coalition
                </span>
              </div>
            </div>

            {/* Audience cards */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: C.cream, marginBottom: 20 }}>Six Audiences. Six Survival Arguments.</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
                {SURVIVAL_ARGUMENTS.map(s => (
                  <div
                    key={s.id}
                    onClick={() => setActiveSurvival(activeSurvival === s.id ? null : s.id)}
                    style={{
                      background: activeSurvival === s.id ? s.color + '18' : C.card,
                      border: `1.5px solid ${activeSurvival === s.id ? s.color : C.border}`,
                      borderRadius: 12,
                      padding: '18px 20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <span style={{ fontSize: 24 }}>{s.icon}</span>
                      <span style={{
                        fontSize: 10, fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
                        letterSpacing: 1, textTransform: 'uppercase',
                        color: s.urgency === 'CRITICAL' ? C.signal : s.urgency === 'HIGH' ? C.amber : C.rise,
                        background: (s.urgency === 'CRITICAL' ? C.signal : s.urgency === 'HIGH' ? C.amber : C.rise) + '20',
                        padding: '3px 7px', borderRadius: 4,
                      }}>{s.urgency}</span>
                    </div>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, color: s.color, fontWeight: 600, marginBottom: 6 }}>{s.audience}</div>
                    <div style={{ fontSize: 12, color: C.cream + '80', lineHeight: 1.5, fontFamily: 'Lora, serif', fontStyle: 'italic' }}>{s.fear}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expanded detail */}
            {activeSurvivalData && (
              <div style={{
                background: activeSurvivalData.color + '10',
                border: `1.5px solid ${activeSurvivalData.color}50`,
                borderRadius: 14,
                padding: '32px 36px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <span style={{ fontSize: 32 }}>{activeSurvivalData.icon}</span>
                  <div>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: activeSurvivalData.color, fontWeight: 700 }}>
                      How to Reach {activeSurvivalData.audience}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                  {[
                    { label: 'Their Fear', content: activeSurvivalData.fear, icon: '⚠️' },
                    { label: 'The Truth They Need to Hear', content: activeSurvivalData.truth, icon: '💡' },
                    { label: 'The Survival Argument', content: activeSurvivalData.survival, icon: '🛡' },
                  ].map((block, i) => (
                    <div key={i} style={{ background: C.ghost, border: `1px solid ${C.border}`, borderRadius: 10, padding: '18px 20px' }}>
                      <div style={{ fontSize: 18, marginBottom: 8 }}>{block.icon}</div>
                      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: activeSurvivalData.color, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>{block.label}</div>
                      <div style={{ fontFamily: 'Lora, serif', fontSize: 13, color: C.cream + 'cc', lineHeight: 1.7 }}>{block.content}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 20, background: activeSurvivalData.color + '15', border: `1px solid ${activeSurvivalData.color}40`, borderRadius: 8, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ color: activeSurvivalData.color, fontSize: 14, marginTop: 2 }}>▶</span>
                  <div>
                    <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: activeSurvivalData.color, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>The Ask</div>
                    <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: C.cream, fontWeight: 600 }}>{activeSurvivalData.ask}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================
            VIEW: PRESSURE MAP
        ============================ */}
        {view === 'pressure' && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: C.cream, marginBottom: 8 }}>The Five-Tier Pressure Map</div>
              <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + '80', fontStyle: 'italic', lineHeight: 1.6, maxWidth: 640 }}>
                Pressure doesn't come from one direction. It comes from five simultaneously — each tier amplifying the others until the old system has no room left to breathe. Select a tier to see the strategy.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 28 }}>
              {/* Map canvas */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, height: 320, overflow: 'hidden' }}>
                <PressureMap activeTier={activeTier} />
              </div>

              {/* Tier list */}
              <div>
                {PRESSURE_TIERS.map(tier => (
                  <div
                    key={tier.tier}
                    onClick={() => setActiveTier(activeTier === tier.tier ? null : tier.tier)}
                    style={{
                      background: activeTier === tier.tier ? tier.color + '15' : C.card,
                      border: `1.5px solid ${activeTier === tier.tier ? tier.color : C.border}`,
                      borderRadius: 10,
                      padding: '14px 18px',
                      cursor: 'pointer',
                      marginBottom: 10,
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: tier.color + '30',
                          border: `1.5px solid ${tier.color}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: tier.color,
                        }}>T{tier.tier}</div>
                        <div>
                          <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: tier.color, fontWeight: 600 }}>{tier.name}</div>
                          <div style={{ fontSize: 11, color: C.cream + '70', fontFamily: 'DM Sans, sans-serif' }}>{tier.size}</div>
                        </div>
                      </div>
                      <div style={{
                        fontSize: 10, fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
                        letterSpacing: 1, textTransform: 'uppercase',
                        color: tier.color,
                        background: tier.color + '20',
                        padding: '3px 8px', borderRadius: 4,
                      }}>{tier.power}</div>
                    </div>

                    {activeTier === tier.tier && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ fontFamily: 'Lora, serif', fontSize: 13, color: C.cream + 'bb', lineHeight: 1.7, marginBottom: 14 }}>{tier.desc}</div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                          <div style={{ background: C.ghost, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 14px' }}>
                            <div style={{ fontSize: 11, color: tier.color, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif', marginBottom: 8 }}>Key Targets</div>
                            {tier.targets.map((t, i) => (
                              <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 5 }}>
                                <span style={{ color: tier.color, fontSize: 9, marginTop: 4 }}>◆</span>
                                <span style={{ fontSize: 12, color: C.cream + 'cc', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.4 }}>{t}</span>
                              </div>
                            ))}
                          </div>
                          <div style={{ background: C.ghost, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 14px' }}>
                            <div style={{ fontSize: 11, color: tier.color, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif', marginBottom: 8 }}>Message</div>
                            <div style={{ fontFamily: 'Lora, serif', fontSize: 13, color: C.cream, fontStyle: 'italic', lineHeight: 1.6, marginBottom: 12 }}>"{tier.message}"</div>
                            <div style={{ fontSize: 11, color: tier.color, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif', marginBottom: 6 }}>Channel</div>
                            <div style={{ fontSize: 12, color: C.cream + 'cc', fontFamily: 'DM Sans, sans-serif' }}>{tier.channel}</div>
                          </div>
                        </div>

                        <div style={{ background: tier.color + '12', border: `1px solid ${tier.color}40`, borderRadius: 8, padding: '12px 14px' }}>
                          <div style={{ fontSize: 11, color: tier.color, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif', marginBottom: 6 }}>The Tactic</div>
                          <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.cream, lineHeight: 1.6 }}>{tier.tactic}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Campaign sequence */}
            <div style={{ marginTop: 32, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 28px' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: C.amber, marginBottom: 16 }}>Campaign Sequence: How the Tiers Work Together</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: 4 }}>
                {PRESSURE_TIERS.map((tier, i) => (
                  <React.Fragment key={tier.tier}>
                    <div style={{ textAlign: 'center', minWidth: 140 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: tier.color + '20', border: `2px solid ${tier.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, color: tier.color }}>T{tier.tier}</div>
                      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: tier.color, fontWeight: 600, marginBottom: 3 }}>{tier.power}</div>
                      <div style={{ fontSize: 10, color: C.cream + '70', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.4 }}>{tier.name.split(' ')[0]}</div>
                    </div>
                    {i < PRESSURE_TIERS.length - 1 && (
                      <div style={{ flex: 1, height: 2, background: `linear-gradient(90deg, ${tier.color}60, ${PRESSURE_TIERS[i+1].color}60)`, minWidth: 30 }} />
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div style={{ marginTop: 14, fontFamily: 'Lora, serif', fontSize: 13, color: C.cream + '80', fontStyle: 'italic', lineHeight: 1.6, textAlign: 'center' }}>
                Start with Tier 1 (creators who are already angry). They build credibility. Tier 2 (established artists) amplify to millions. Tier 3 (institutions) normalize it. Tier 4 (politicians) mandate it. Tier 5 (public) makes it irreversible.
              </div>
            </div>
          </div>
        )}

        {/* ============================
            VIEW: UNIONS vs. DIRECT
        ============================ */}
        {view === 'union' && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: C.cream, marginBottom: 8 }}>The Union Question</div>
              <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + '80', fontStyle: 'italic', lineHeight: 1.6, maxWidth: 640 }}>
                Save the unions and drag them into the new world — or bypass them entirely and give the power directly to every creator on Earth, no membership card required.
              </div>
            </div>

            {/* Toggle */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
              {Object.entries(UNION_PATHS).map(([key, path]) => (
                <button
                  key={key}
                  onClick={() => setUnionPath(key)}
                  style={{
                    background: unionPath === key ? path.color + '20' : C.card,
                    border: `1.5px solid ${unionPath === key ? path.color : C.border}`,
                    borderRadius: 10,
                    padding: '14px 24px',
                    cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 14,
                    fontWeight: 600,
                    color: unionPath === key ? path.color : C.cream + '80',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s',
                  }}
                >
                  <span>{path.icon}</span>
                  {path.label}
                  {key === 'bypass' && (
                    <span style={{ fontSize: 10, background: C.fire + '30', color: C.fire, padding: '2px 6px', borderRadius: 3, letterSpacing: 1, fontWeight: 700 }}>ROB'S CHOICE</span>
                  )}
                </button>
              ))}
            </div>

            {/* Viability bar */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.cream + '70', minWidth: 100 }}>Strategic Viability</div>
              <div style={{ flex: 1, height: 6, background: C.dim, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${activeUnion.viability}%`, height: '100%', background: activeUnion.color, borderRadius: 3, transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: activeUnion.color, fontWeight: 700, minWidth: 50 }}>{activeUnion.viability}%</div>
            </div>

            {/* Pros / Cons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 24px' }}>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.rise, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>Advantages</div>
                {activeUnion.pros.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                    <span style={{ color: C.rise, fontSize: 12, marginTop: 3, flexShrink: 0 }}>✓</span>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.cream + 'cc', lineHeight: 1.5 }}>{p}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 24px' }}>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.signal, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>Challenges</div>
                {activeUnion.cons.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                    <span style={{ color: C.signal, fontSize: 12, marginTop: 3, flexShrink: 0 }}>—</span>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.cream + 'cc', lineHeight: 1.5 }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verdict */}
            <div style={{
              background: `linear-gradient(135deg, ${activeUnion.color}18 0%, transparent 100%)`,
              border: `1.5px solid ${activeUnion.color}50`,
              borderRadius: 14,
              padding: '24px 28px',
            }}>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: activeUnion.color, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>The Verdict</div>
              <div style={{ fontFamily: 'Lora, serif', fontSize: 16, color: C.cream, lineHeight: 1.8, fontStyle: 'italic' }}>
                "{activeUnion.verdict}"
              </div>
            </div>

            {/* The actual answer */}
            <div style={{ marginTop: 28, background: C.fire + '0c', border: `1.5px solid ${C.fire}40`, borderRadius: 14, padding: '28px 32px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: C.fire, marginBottom: 14 }}>The Real Answer</div>
              <div style={{ fontFamily: 'Lora, serif', fontSize: 15, color: C.cream, lineHeight: 1.9, maxWidth: 680, margin: '0 auto' }}>
                Don't ask the unions for permission. Build the direct infrastructure. When it works — and creators start getting paid immediately and transparently — the unions will face a choice: adopt the infrastructure or watch their members leave. Either way, the creators win. The union is only relevant if it serves creators better than the alternative. Give creators the alternative. Let them choose.
              </div>
              <div style={{ marginTop: 20, fontFamily: 'Playfair Display, serif', fontSize: 28, color: C.fire, fontWeight: 700 }}>
                Give the power to the creators. Full stop.
              </div>
            </div>
          </div>
        )}

        {/* ============================
            VIEW: DIRECT CREATOR MODEL
        ============================ */}
        {view === 'direct' && (
          <div>
            <div style={{ marginBottom: 28, textAlign: 'center' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: C.cream, marginBottom: 10 }}>
                The Direct Creator Model
              </div>
              <div style={{ fontFamily: 'Lora, serif', fontSize: 15, color: C.cream + '80', maxWidth: 600, margin: '0 auto', lineHeight: 1.7, fontStyle: 'italic' }}>
                Six pillars that replace every function a union was supposed to provide — without the dues, the bureaucracy, the geographic limits, or the leadership that can be bought.
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 36 }}>
              {DIRECT_PILLARS.map((p, i) => (
                <div key={i} style={{
                  background: C.card,
                  border: `1px solid ${p.color}30`,
                  borderRadius: 12,
                  padding: '22px 26px',
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 1fr',
                  gap: 20,
                  alignItems: 'center',
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: p.color + '60', fontWeight: 700 }}>{p.n}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, color: p.color, fontWeight: 600, marginBottom: 8 }}>{p.title}</div>
                    <div style={{ fontFamily: 'Lora, serif', fontSize: 13, color: C.cream + 'bb', lineHeight: 1.7 }}>{p.desc}</div>
                  </div>
                  <div style={{ background: p.color + '0e', border: `1px solid ${p.color}30`, borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ fontSize: 10, color: p.color, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif', marginBottom: 6 }}>What This Replaces</div>
                    <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.cream, lineHeight: 1.5 }}>{p.what}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* The world this creates */}
            <div style={{
              background: `linear-gradient(135deg, ${C.rise}12 0%, transparent 100%)`,
              border: `1.5px solid ${C.rise}40`,
              borderRadius: 16,
              padding: '32px 36px',
            }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: C.rise, marginBottom: 20, textAlign: 'center' }}>
                The World This Creates
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {[
                  { before: 'Label owns your master recordings', after: 'You own everything you create', icon: '🎵' },
                  { before: 'AI trained on your work, no payment', after: 'Every AI use generates a royalty', icon: '🤖' },
                  { before: 'Platform takes 40–70% of revenue', after: '75% goes to you. Always.', icon: '💰' },
                  { before: 'Your voice cloned without permission', after: 'Your voice is a registered estate', icon: '🎤' },
                  { before: 'Union fees for services you barely use', after: 'Guild membership. Free. Global. Yours.', icon: '✊' },
                  { before: 'When you die, corporation inherits', after: 'You decide who inherits your voice', icon: '∞' },
                ].map((item, i) => (
                  <div key={i} style={{ background: C.ghost, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ fontSize: 18, marginBottom: 8 }}>{item.icon}</div>
                    <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.signal + 'aa', textDecoration: 'line-through', marginBottom: 6, lineHeight: 1.4 }}>{item.before}</div>
                    <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.rise, fontWeight: 600, lineHeight: 1.4 }}>{item.after}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 28, textAlign: 'center' }}>
                <div style={{ fontFamily: 'IM Fell English, serif', fontSize: 20, color: C.cream, fontStyle: 'italic', lineHeight: 1.6, maxWidth: 640, margin: '0 auto' }}>
                  "We don't need to fix the system. We need to build a better one and let the old one become irrelevant."
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: C.gold + '80', fontFamily: 'DM Sans, sans-serif' }}>
                  — The Campaign · NOIZY.ai · MC96ECO Universe · March 2026
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: '24px 40px', textAlign: 'center', background: C.deep }}>
        <div style={{ fontFamily: 'IM Fell English, serif', fontSize: 15, color: C.fire, fontStyle: 'italic', marginBottom: 6 }}>
          "Find the people with heart. Give the power to the creators. Watch the old machine starve."
        </div>
        <div style={{ fontSize: 11, color: C.cream + '40', fontFamily: 'DM Sans, sans-serif', letterSpacing: 1 }}>
          THE CAMPAIGN · NOIZY.AI · MC96ECO UNIVERSE · MARCH 14, 2026 · OTTAWA
        </div>
      </div>
    </div>
  );
}
