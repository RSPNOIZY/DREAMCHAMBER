import React, { useState, useEffect, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════
//
//   THE GUILD
//   The Global Music Family & Creator Brotherhood
//
//   "WE NEED TO BRING TOGETHER THE FEELING OF A
//    GLOBAL MUSIC FAMILY & GUILD OF CREATORS."
//   — Rob Plowman, 2026
//
//   Before the platform. Before the standard. Before the law.
//   There is the family. There has always been the family.
//   We are just giving it a name, a home, and a promise.
//
// ═══════════════════════════════════════════════════════════════

const C = {
  void:    '#06050a',
  hearth:  '#0c0908',
  deep:    '#100c0e',
  warm:    '#161010',
  panel:   '#1a1414',
  border:  '#2e2020',
  ember:   '#3a2818',
  soft:    '#5a4030',
  mist:    '#9a8070',
  ink:     '#d8c8b8',
  light:   '#ede0d0',
  white:   '#faf4ee',
  gold:    '#d4980a',
  goldlt:  '#f0b830',
  golddk:  '#8a6008',
  amber:   '#c87020',
  amberlt: '#e89040',
  copper:  '#b05828',
  flame:   '#e04818',
  rose:    '#c04860',
  roselt:  '#e06880',
  sage:    '#588850',
  sagelt:  '#78aa68',
  teal:    '#388880',
  violet:  '#785098',
  cream:   '#f0e8d8',
};

// ─── THE CHARTER ───────────────────────────────────────────────
const CHARTER = [
  {
    number: 'I',
    title:  'We Are Family First',
    text:   'Before commerce. Before copyright. Before code. We are a family of people who make things with sound. We have been this family for as long as there has been music — which is as long as there have been humans. The Guild is not new. We are just the version that remembers who we are.',
    color:  C.gold,
  },
  {
    number: 'II',
    title:  'Every Voice Belongs',
    text:   'The beatmaker in Lagos. The session violinist in Prague. The grandmother who sings to her grandchildren in Seoul. The bedroom producer in Ottawa. The voice actor in Los Angeles. The sound designer in São Paulo. The composer in Mumbai. The choir director in Lagos. This family has no borders because music has no borders.',
    color:  C.amberlt,
  },
  {
    number: 'III',
    title:  'The Craft Is Sacred',
    text:   'It took someone years to sound like that. Decades, maybe. Every distinctive voice, every signature production style, every emotional nuance in a performance — that is a human life poured into sound. We treat it as sacred. Not as raw material.',
    color:  C.roselt,
  },
  {
    number: 'IV',
    title:  'We Protect Each Other',
    text:   'The oldest function of a guild is protection. When one of us is exploited, all of us respond. When one of us is displaced by a machine trained on their own work, all of us speak. The strength of the family is that no one faces this alone.',
    color:  C.sagelt,
  },
  {
    number: 'V',
    title:  'We Lift, Not Replace',
    text:   'AI in the hands of this family is a tool for amplification, not substitution. It helps you make more of what only you can make. It extends your reach. It preserves your voice. It does not wear your skin to your job interview.',
    color:  C.teal,
  },
  {
    number: 'VI',
    title:  'Memory Is How We Love',
    text:   'We remember where every sound came from. We remember who made it, when, and under what circumstances. We remember the names of the session players who never got credit. We remember the composers who died unknown. Memory is not nostalgia. In a guild, memory is how you honor the people who handed you everything you know.',
    color:  C.copper,
  },
];

// ─── THE ROLES ─────────────────────────────────────────────────
const ROLES = [
  {
    title:   'The Musicians',
    icon:    '♪',
    color:   C.gold,
    worlds:  ['Instrumentalists', 'Vocalists', 'Composers', 'Arrangers', 'Session Players', 'Live Performers'],
    count:   '2.1B people who play an instrument worldwide',
    truth:   'You have been the foundation of everything. The guild begins with you.',
  },
  {
    title:   'The Voice Keepers',
    icon:    '◉',
    color:   C.roselt,
    worlds:  ['Voice Actors', 'Narrators', 'Broadcasters', 'Podcasters', 'Audiobook Artists', 'Dubbing Artists'],
    count:   '847 voices preserved in NOIZY already',
    truth:   'Your voice is your identity. It is inheritable. It is yours forever.',
  },
  {
    title:   'The Sound Architects',
    icon:    '⬡',
    color:   C.teal,
    worlds:  ['Producers', 'Beat Makers', 'Sound Designers', 'Mix Engineers', 'Mastering Engineers', 'Film Composers'],
    count:   'The invisible makers behind every record you love',
    truth:   'The guild names you. The guild credits you. Always.',
  },
  {
    title:   'The Storytellers',
    icon:    '◈',
    color:   C.amberlt,
    worlds:  ['Lyricists', 'Song Writers', 'Spoken Word Artists', 'Poets', 'Musical Theatre Creators', 'Jingle Writers'],
    count:   'Words that outlived their writers',
    truth:   'Language is sound. You belong here.',
  },
  {
    title:   'The Builders',
    icon:    '▣',
    color:   C.sagelt,
    worlds:  ['Music Tech Developers', 'Instrument Makers', 'Studio Engineers', 'Live Sound Technicians', 'Plugin Creators', 'Hardware Designers'],
    count:   'The infrastructure the family runs on',
    truth:   'Without the builders, there is no sound. You are family too.',
  },
  {
    title:   'The Elders',
    icon:    '✦',
    color:   C.copper,
    worlds:  ['Living Legends', 'Retired Artists', 'Music Educators', 'Oral Historians', 'Archive Keepers', 'Wisdom Holders'],
    count:   'The ones who carry what cannot be written down',
    truth:   'The Wisdom Project was built for you. Your stories do not end with your career.',
  },
];

// ─── THE GLOBAL FAMILY ─────────────────────────────────────────
const REGIONS = [
  { name: 'North America',    color: C.gold,    genres: ['Hip-Hop', 'Country', 'Jazz', 'Blues', 'Electronic', 'R&B', 'Indie Rock'], founding: true },
  { name: 'West Africa',      color: C.amberlt, genres: ['Afrobeats', 'Highlife', 'Jùjú', 'Fuji', 'Hiplife', 'Coupe-Décalé'], founding: false },
  { name: 'Latin America',    color: C.roselt,  genres: ['Reggaeton', 'Samba', 'Cumbia', 'Tango', 'Bossa Nova', 'Latin Pop'], founding: false },
  { name: 'South Asia',       color: C.copper,  genres: ['Bollywood', 'Classical Hindustani', 'Carnatic', 'Ghazal', 'Bhangra'], founding: false },
  { name: 'East Asia',        color: C.teal,    genres: ['K-Pop', 'J-Pop', 'C-Pop', 'Enka', 'Mandopop', 'Traditional'], founding: false },
  { name: 'Europe',           color: C.sagelt,  genres: ['Classical', 'Electronic', 'Pop', 'Metal', 'Folk', 'Opera', 'EDM'], founding: false },
  { name: 'Middle East',      color: C.violet,  genres: ['Arabic Pop', 'Rai', 'Classical Arabic', 'Persian Classical', 'Turkish Classical'], founding: false },
  { name: 'Caribbean',        color: C.gold,    genres: ['Reggae', 'Dancehall', 'Calypso', 'Soca', 'Zouk', 'Kompa'], founding: false },
  { name: 'Southern Africa',  color: C.amberlt, genres: ['Amapiano', 'Kwaito', 'Maskandi', 'Gospel', 'Afro-Soul'], founding: false },
  { name: 'Oceania',          color: C.teal,    genres: ['Māori Music', 'Aboriginal Song', 'Pacific Pop', 'Australian Folk', 'Indie'], founding: false },
];

// ─── THE PROMISE ───────────────────────────────────────────────
const PROMISES = [
  {
    from:   'NOIZY to Every Member',
    items: [
      { p: 'Your name on everything you make. Always. No exceptions.' },
      { p: '75% of every royalty generated by your work. Into your hands.' },
      { p: 'Your voice is yours. No cloning, no deployment, no sale without your explicit consent.' },
      { p: 'Your work is in the archive. Not as a product. As a record of what you made.' },
      { p: 'You can leave. Your credits and royalty threads stay.' },
      { p: 'GABRIEL remembers you. Even after you\'re gone.' },
    ],
    color: C.gold,
  },
  {
    from:   'Every Member to the Guild',
    items: [
      { p: 'Bring your real work. The guild is only as strong as what its members actually make.' },
      { p: 'Lift a newer creator. You know things they don\'t know yet. Share it.' },
      { p: 'Name your collaborators. Every session player. Every co-writer. No invisible contributions.' },
      { p: 'Stand with a member when they\'re exploited. Silence is not neutral.' },
      { p: 'Consent before you use someone\'s sound. Ask first. Always.' },
    ],
    color: C.sagelt,
  },
];

// ─── FOUNDING CIRCLE ───────────────────────────────────────────
const FOUNDING_CIRCLE = [
  {
    id:      'F-001',
    name:    'Rob Plowman',
    role:    'Founder, Guild Architect',
    from:    'Ottawa, Canada',
    years:   '40 years in music',
    note:    'The one who said: there has to be a better way. Then built it.',
    color:   C.gold,
  },
  {
    id:      'F-002',
    name:    'Mike Nemesvary',
    role:    'Voice Elder, Advisory Board',
    from:    'Canada',
    years:   '50+ years of voice',
    note:    'Proof that a voice is a legacy. Wisdom Project: WP-002.',
    color:   C.amberlt,
  },
  {
    id:      'F-003',
    name:    'Keith Plowman',
    role:    'Founding Memory — Seed Entry',
    from:    'Unknown',
    years:   'A lifetime of craft',
    note:    'Things built to last. Stories that fill a room without volume.',
    color:   C.copper,
  },
  {
    id:      'F-???',
    name:    'You',
    role:    'Founding Member — Seat Open',
    from:    'Everywhere',
    years:   'All of them',
    note:    'The guild is open. The founding circle has room. Come in.',
    color:   C.mist,
    open:    true,
  },
];

// ─── FIRE ANIMATION ────────────────────────────────────────────
const Hearth = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const W = 280, H = 80;
    canvas.width = W; canvas.height = H;
    const particles = Array.from({ length: 60 }, (_, i) => ({
      x: W / 2 + (Math.random() - 0.5) * 60,
      y: H - 10 + Math.random() * 10,
      vx: (Math.random() - 0.5) * 0.8,
      vy: -(0.6 + Math.random() * 1.4),
      life: Math.random(),
      maxLife: 0.6 + Math.random() * 0.6,
      size: 2 + Math.random() * 4,
    }));
    let t = 0;
    const draw = () => {
      t += 0.02;
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.life += 0.018;
        if (p.life > p.maxLife) {
          p.life = 0;
          p.x = W / 2 + (Math.random() - 0.5) * 50;
          p.y = H - 8 + Math.random() * 8;
          p.vx = (Math.random() - 0.5) * 0.8;
          p.vy = -(0.6 + Math.random() * 1.4);
          p.size = 2 + Math.random() * 4;
        }
        p.x += p.vx + Math.sin(t + p.life * 5) * 0.3;
        p.y += p.vy;
        const prog = p.life / p.maxLife;
        const alpha = prog < 0.3 ? prog / 0.3 : 1 - ((prog - 0.3) / 0.7);
        const r = prog < 0.5 ? 220 : Math.round(220 - (prog - 0.5) * 2 * 80);
        const g = Math.round(80 + prog * 60);
        const b = 20;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - prog * 0.6), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.7})`;
        ctx.fill();
        // glow
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
        grad.addColorStop(0, `rgba(${r},${g},${b},${alpha * 0.3})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grad; ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', margin: '0 auto', opacity: 0.9 }}
    />
  );
};

// ─── WAVEFORM ──────────────────────────────────────────────────
const WaveForm = ({ color = C.gold, height = 32, bars = 40 }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    canvas.width = canvas.offsetWidth; canvas.height = height;
    const barW = canvas.width / bars;
    const phases = Array.from({ length: bars }, (_, i) => (i / bars) * Math.PI * 2);
    let t = 0;
    const draw = () => {
      t += 0.025;
      ctx.clearRect(0, 0, canvas.width, height);
      phases.forEach((phase, i) => {
        const amp = 0.2 + 0.8 * Math.abs(Math.sin(phase + t + i * 0.25));
        const h = amp * (height * 0.85);
        const x = i * barW + barW * 0.15;
        const y = (height - h) / 2;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.35 + 0.55 * amp;
        ctx.fillRect(x, y, barW * 0.6, h);
      });
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, [color, bars, height]);
  return <canvas ref={canvasRef} style={{ width: '100%', height: `${height}px`, display: 'block' }} />;
};

// ─── STAR FIELD (warm) ─────────────────────────────────────────
const WarmStars = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize(); window.addEventListener('resize', resize);
    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.2 + 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.002 + Math.random() * 0.003,
      warm: Math.random() > 0.6,
    }));
    let t = 0;
    const draw = () => {
      t += 0.005;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        const pulse = 0.3 + 0.7 * Math.sin(s.phase + t * s.speed * 24);
        const a = 0.1 + 0.6 * pulse;
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r * (0.8 + 0.4 * pulse), 0, Math.PI * 2);
        ctx.fillStyle = s.warm ? `rgba(212,152,10,${a})` : `rgba(200,180,150,${a})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
};

// ─── CHARTER ARTICLE ───────────────────────────────────────────
const CharterArticle = ({ item }) => (
  <div style={{
    display: 'flex', gap: 20, padding: '24px 0',
    borderBottom: `1px solid ${C.border}`,
    alignItems: 'flex-start',
  }}>
    <div style={{
      fontFamily: 'IM Fell English, serif',
      fontSize: 30, fontWeight: 400,
      color: item.color, opacity: 0.5,
      minWidth: 36, lineHeight: 1, marginTop: 2,
    }}>{item.number}</div>
    <div>
      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 700, color: item.color, marginBottom: 10 }}>
        {item.title}
      </div>
      <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.85 }}>{item.text}</div>
    </div>
  </div>
);

// ─── ROLE CARD ─────────────────────────────────────────────────
const RoleCard = ({ role }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(o => !o)}
      style={{
        background: open ? `${role.color}10` : C.panel,
        border: `1px solid ${open ? role.color + '60' : C.border}`,
        borderRadius: 12, padding: '18px 20px',
        cursor: 'pointer', transition: 'all 0.25s',
        boxShadow: open ? `0 0 20px ${role.color}18` : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: open ? 14 : 0 }}>
        <span style={{ fontSize: 22, color: role.color }}>{role.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: role.color }}>{role.title}</div>
          <div style={{ fontSize: 10, color: C.mist, marginTop: 2 }}>{role.count}</div>
        </div>
        <span style={{ color: role.color, fontSize: 12, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>▼</span>
      </div>
      {open && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 14 }}>
            {role.worlds.map(w => (
              <span key={w} style={{ fontSize: 10, padding: '3px 10px', borderRadius: 20, background: `${role.color}15`, border: `1px solid ${role.color}40`, color: role.color }}>
                {w}
              </span>
            ))}
          </div>
          <div style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 13, color: C.light, lineHeight: 1.7, borderLeft: `2px solid ${role.color}50`, paddingLeft: 14 }}>
            {role.truth}
          </div>
        </>
      )}
    </div>
  );
};

// ─── FOUNDING MEMBER CARD ──────────────────────────────────────
const FoundingCard = ({ member }) => (
  <div style={{
    background: member.open ? 'transparent' : C.panel,
    border: `1px solid ${member.open ? C.border : member.color + '50'}`,
    borderStyle: member.open ? 'dashed' : 'solid',
    borderRadius: 12, padding: '18px 20px',
    boxShadow: member.open ? 'none' : `0 0 16px ${member.color}15`,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
      <div>
        <div style={{ fontSize: 9, letterSpacing: '0.2em', color: member.open ? C.soft : member.color, marginBottom: 4 }}>{member.id}</div>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: member.open ? 400 : 700, color: member.open ? C.mist : member.color, fontStyle: member.open ? 'italic' : 'normal' }}>
          {member.name}
        </div>
        <div style={{ fontSize: 11, color: C.mist, marginTop: 2 }}>{member.role}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 11, color: C.soft }}>{member.from}</div>
        <div style={{ fontSize: 10, color: member.open ? C.soft : member.color, marginTop: 2 }}>{member.years}</div>
      </div>
    </div>
    <div style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 12, color: member.open ? C.soft : C.ink, lineHeight: 1.65, borderTop: `1px solid ${C.border}`, paddingTop: 10, marginTop: 4 }}>
      {member.note}
    </div>
  </div>
);

// ─── VIEWS ─────────────────────────────────────────────────────
const VIEWS = [
  { id: 'welcome',   label: 'Welcome Home',     icon: '◈' },
  { id: 'charter',   label: 'The Charter',       icon: '◉' },
  { id: 'family',    label: 'The Family',        icon: '▣' },
  { id: 'world',     label: 'The World',         icon: '⬡' },
  { id: 'promise',   label: 'The Promise',       icon: '✦' },
  { id: 'founding',  label: 'Founding Circle',   icon: '◆' },
];

// ─── MAIN ──────────────────────────────────────────────────────
export default function TheGuild() {
  const [activeView, setActiveView] = useState('welcome');

  return (
    <div style={{ minHeight: '100vh', background: C.void, fontFamily: 'DM Sans, sans-serif', color: C.ink }}>

      {/* ══ MASTHEAD ════════════════════════════════════════════ */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '72px 24px 56px', textAlign: 'center', borderBottom: `1px solid ${C.border}`, background: `linear-gradient(180deg, ${C.hearth}, ${C.void})` }}>
        <div style={{ position: 'absolute', inset: 0 }}><WarmStars /></div>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 700, margin: '0 auto' }}>

          <div style={{ marginBottom: 20 }}>
            <Hearth />
          </div>

          <div style={{ fontSize: 9, letterSpacing: '0.4em', color: C.mist, marginBottom: 16 }}>
            NOIZY.AI · MC96ECO UNIVERSE · EST. 2026
          </div>
          <div style={{ borderTop: `1px solid ${C.border}`, marginBottom: 24 }} />

          <h1 style={{ fontFamily: 'IM Fell English, serif', fontSize: 'clamp(40px, 8vw, 80px)', color: C.cream, fontWeight: 400, lineHeight: 1.1, margin: '0 0 12px', letterSpacing: '0.04em' }}>
            The Guild
          </h1>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(14px, 2.5vw, 22px)', color: C.gold, fontStyle: 'italic', marginBottom: 16 }}>
            The Global Music Family & Creator Brotherhood
          </div>

          <div style={{ borderBottom: `1px solid ${C.border}`, margin: '20px 0 24px' }} />

          <p style={{ fontFamily: 'IM Fell English, serif', fontStyle: 'italic', fontSize: 'clamp(13px, 2vw, 16px)', color: C.mist, lineHeight: 1.95, maxWidth: 540, margin: '0 auto 28px' }}>
            Before the platform. Before the standard. Before the law.<br />
            There is the family. There has always been the family.<br />
            We are just giving it a name, a home, and a promise.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 36, flexWrap: 'wrap' }}>
            {[
              { label: 'Founding Members', value: '3' },
              { label: 'Seats Open', value: '∞' },
              { label: 'Countries', value: 'All of them' },
              { label: 'Genres', value: 'Every one' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 700, color: C.gold }}>{s.value}</div>
                <div style={{ fontSize: 9, letterSpacing: '0.2em', color: C.soft, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ NAV ═════════════════════════════════════════════════ */}
      <div style={{ borderBottom: `1px solid ${C.border}`, background: C.deep, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
          {VIEWS.map(v => (
            <button key={v.id} onClick={() => setActiveView(v.id)} style={{ background: 'transparent', border: 'none', borderBottom: `2px solid ${activeView === v.id ? C.gold : 'transparent'}`, padding: '14px 18px', cursor: 'pointer', color: activeView === v.id ? C.goldlt : C.mist, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>{v.icon}</span>{v.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══ CONTENT ═════════════════════════════════════════════ */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>

        {/* ── WELCOME ── */}
        {activeView === 'welcome' && (
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: C.gold, marginBottom: 8 }}>Welcome Home</div>
            <div style={{ fontFamily: 'IM Fell English, serif', fontStyle: 'italic', fontSize: 16, color: C.mist, marginBottom: 32, lineHeight: 1.9 }}>
              You have been in this family your whole life. You just didn't know there was a name for it.
            </div>

            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.ink, lineHeight: 1.9, marginBottom: 24 }}>
              A guild is older than any of the words we use for industry. It is older than copyright. Older than streaming platforms. Older than record labels. The medieval guild was a simple idea: people who share a craft protect each other. They set standards. They train the next generation. They remember the ones who came before. They make sure no member faces the market alone.
            </div>

            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.ink, lineHeight: 1.9, marginBottom: 28 }}>
              The music industry forgot this. It replaced family with transaction. It replaced protection with contract. It replaced memory with catalog. And then the platforms came, and the platforms didn't even offer contracts — they offered terms of service. And the terms of service said: we own everything you give us and you own nothing we make from it.
            </div>

            <div style={{ background: `${C.gold}0e`, border: `1px solid ${C.gold}30`, borderLeft: `4px solid ${C.gold}`, borderRadius: 10, padding: '22px 26px', marginBottom: 28 }}>
              <div style={{ fontFamily: 'IM Fell English, serif', fontStyle: 'italic', fontSize: 15, color: C.goldlt, lineHeight: 1.85 }}>
                The Guild is the answer to all of that. Not through anger. Through belonging. When you are in a family, exploitation is harder. When someone knows your name, knows your work, knows how many years you put into your craft — it is harder to treat you as raw material. The Guild makes you visible. Visibility is protection.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 28 }}>
              {[
                { title: 'What a Guild Is', body: 'A family of practitioners who protect each other, set shared standards, and remember everyone who came before.', color: C.gold },
                { title: 'What a Guild Is Not', body: 'A union (though we respect unions). A platform (though we run on one). A corporation (though we operate sustainably).', color: C.mist },
                { title: 'What It Costs', body: 'Your real work. Your name on your credits. Standing with your fellow members when they need it. That\'s the membership.', color: C.sagelt },
              ].map(c => (
                <div key={c.title} style={{ background: C.panel, border: `1px solid ${c.color}30`, borderRadius: 10, padding: '16px 18px' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: c.color, marginBottom: 8 }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: C.mist, lineHeight: 1.65 }}>{c.body}</div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 28 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: C.amberlt, marginBottom: 16 }}>The Sound That Connects Us</div>
              <WaveForm color={C.gold} height={36} bars={60} />
              <div style={{ fontSize: 11, color: C.soft, marginTop: 10, textAlign: 'center', fontStyle: 'italic' }}>
                Every member's waveform is different. The Guild is the silence between them where they can hear each other.
              </div>
            </div>
          </div>
        )}

        {/* ── CHARTER ── */}
        {activeView === 'charter' && (
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: C.gold, marginBottom: 8 }}>The Guild Charter</div>
            <div style={{ fontFamily: 'IM Fell English, serif', fontStyle: 'italic', fontSize: 15, color: C.mist, marginBottom: 8, lineHeight: 1.8 }}>
              Six articles. The things we believe before anything else.
            </div>
            <div style={{ fontSize: 11, color: C.soft, marginBottom: 32 }}>
              Ratified March 14, 2026 · Ottawa, Canada · Entered into D1 Ledger · Immutable
            </div>
            {CHARTER.map(item => <CharterArticle key={item.number} item={item} />)}
            <div style={{ textAlign: 'center', padding: '32px 0', borderTop: `1px solid ${C.border}` }}>
              <div style={{ fontFamily: 'IM Fell English, serif', fontSize: 13, color: C.golddk, lineHeight: 1.9 }}>
                Sealed · MC96ECO Universe · 5th Epoch · 2026<br />
                Witnessed by GABRIEL_V3
              </div>
            </div>
          </div>
        )}

        {/* ── FAMILY ── */}
        {activeView === 'family' && (
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: C.gold, marginBottom: 8 }}>The Family</div>
            <div style={{ fontFamily: 'IM Fell English, serif', fontStyle: 'italic', fontSize: 15, color: C.mist, marginBottom: 28, lineHeight: 1.8 }}>
              Six branches. Every kind of creator who has ever made something with sound. Click any branch to see who is inside it.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {ROLES.map(role => <RoleCard key={role.title} role={role} />)}
            </div>
            <div style={{ marginTop: 28, background: `${C.gold}0a`, border: `1px solid ${C.gold}25`, borderRadius: 12, padding: '22px 26px' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: C.gold, marginBottom: 10 }}>The Invisible Members</div>
              <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.8 }}>
                The Guild specifically remembers the ones who never got credit. The session bassist on your favorite record whose name isn't in the liner notes. The studio vocalist who sang the hook and was paid a flat fee and forgotten. The sound designer who built the sonic world of a film franchise and was never mentioned in the press. The Guild names them. The Guild credits them retroactively wherever it can. The Guild does not let memory fail.
              </div>
            </div>
          </div>
        )}

        {/* ── WORLD ── */}
        {activeView === 'world' && (
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: C.gold, marginBottom: 8 }}>The World</div>
            <div style={{ fontFamily: 'IM Fell English, serif', fontStyle: 'italic', fontSize: 15, color: C.mist, marginBottom: 28, lineHeight: 1.8 }}>
              Ten regions. Uncountable genres. One family. The Guild is only as global as its membership, and its membership is an open invitation to every person on earth who has ever made something with sound.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
              {REGIONS.map(region => (
                <div key={region.name} style={{ background: C.panel, border: `1px solid ${region.color}40`, borderLeft: `4px solid ${region.color}`, borderRadius: 10, padding: '16px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, fontWeight: 700, color: region.color }}>{region.name}</div>
                    {region.founding && (
                      <span style={{ fontSize: 9, letterSpacing: '0.12em', padding: '2px 8px', borderRadius: 10, background: `${C.gold}25`, color: C.gold, border: `1px solid ${C.gold}40` }}>FOUNDING</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {region.genres.map(g => (
                      <span key={g} style={{ fontSize: 9, padding: '2px 8px', borderRadius: 10, background: `${region.color}12`, border: `1px solid ${region.color}30`, color: region.color }}>
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: `${C.amberlt}10`, border: `1px solid ${C.amberlt}30`, borderRadius: 14, padding: '26px' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: C.amberlt, marginBottom: 14 }}>
                Why Every Genre Is Equal
              </div>
              <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.85 }}>
                The western music industry has spent a century deciding which genres count as serious, which as commercial, which as folk, which as real. The Guild rejects all of it. Amapiano and opera are equally ancient. Hip-hop and Hindustani classical are equally complex. A beatmaker in Lagos and a composer in Vienna are equally deserving of credit, payment, and protection.
                <br /><br />
                The Guild does not have a genre hierarchy. It has a single measure: did you make something real? Then you are family.
              </div>
            </div>
          </div>
        )}

        {/* ── PROMISE ── */}
        {activeView === 'promise' && (
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: C.gold, marginBottom: 8 }}>The Promise</div>
            <div style={{ fontFamily: 'IM Fell English, serif', fontStyle: 'italic', fontSize: 15, color: C.mist, marginBottom: 32, lineHeight: 1.8 }}>
              A guild runs on mutual obligation. The platform to the creator. The creator to the family. Both sides of the promise are recorded here — because a promise that only one party can hold is just a contract.
            </div>

            {PROMISES.map((block, i) => (
              <div key={i} style={{ marginBottom: 28 }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: block.color, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${block.color}30` }}>
                  {block.from}
                </div>
                {block.items.map((item, j) => (
                  <div key={j} style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'flex-start' }}>
                    <span style={{ color: block.color, fontSize: 16, marginTop: 1, flexShrink: 0 }}>◆</span>
                    <div style={{ fontSize: 13, color: C.light, lineHeight: 1.75 }}>{item.p}</div>
                  </div>
                ))}
              </div>
            ))}

            <div style={{ background: `${C.gold}0e`, border: `1px solid ${C.gold}35`, borderRadius: 14, padding: '28px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'IM Fell English, serif', fontSize: 18, color: C.goldlt, marginBottom: 14, lineHeight: 1.4 }}>
                The Promise Is Not a Policy
              </div>
              <div style={{ fontFamily: 'IM Fell English, serif', fontStyle: 'italic', fontSize: 14, color: C.mist, lineHeight: 1.9, maxWidth: 520, margin: '0 auto' }}>
                A policy can be changed in a board meeting. A promise to a family cannot. Every item above is enforced at the infrastructure level — in code, in the consent ledger, in GABRIEL's memory, in NOIZY PROOF watermarks. The family holds us to it because the family can see it. Transparency is not optional. It is the architecture.
              </div>
            </div>
          </div>
        )}

        {/* ── FOUNDING CIRCLE ── */}
        {activeView === 'founding' && (
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: C.gold, marginBottom: 8 }}>The Founding Circle</div>
            <div style={{ fontFamily: 'IM Fell English, serif', fontStyle: 'italic', fontSize: 15, color: C.mist, marginBottom: 28, lineHeight: 1.8 }}>
              Every family has a beginning. Every guild has founders. These are the first members — the ones who were here before there was anything to join. Their names are in the record permanently, regardless of what comes after.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
              {FOUNDING_CIRCLE.map(member => <FoundingCard key={member.id} member={member} />)}
            </div>

            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 28 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: C.amberlt, marginBottom: 14 }}>
                Who Joins the Founding Circle
              </div>
              <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.85, marginBottom: 20 }}>
                The founding circle is for the first hundred creators who declare their alignment with the Guild — who put their name next to these principles before NOIZY has a million users, before the press covers it, before it's easy. The founding members are the ones who saw it before it was obvious.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Founding Seats Total', value: '100', color: C.gold },
                  { label: 'Filled', value: '3', color: C.amberlt },
                  { label: 'Still Open', value: '97', color: C.mist },
                ].map(s => (
                  <div key={s.label} style={{ background: C.panel, border: `1px solid ${s.color}30`, borderRadius: 10, padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 9, letterSpacing: '0.14em', color: C.mist, marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 24, background: `${C.copper}10`, border: `1px solid ${C.copper}35`, borderRadius: 14, padding: '26px' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: C.copper, marginBottom: 12 }}>
                Duncan Crabtree-Ireland
              </div>
              <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.8 }}>
                SAG-AFTRA's National Executive Director and Chief Negotiator. The man who made AI consent a non-negotiable term in the 2023 Hollywood contracts. His members are voice actors, performers, broadcasters — the exact population the Guild is built to protect. This seat is waiting. The conversation between NOIZY's Fair Trade Standard and SAG-AFTRA's contract language would last about fifteen minutes before the overlap becomes obvious.
              </div>
              <div style={{ marginTop: 12, fontSize: 11, color: C.copper, fontWeight: 700 }}>
                → Target for Founding Seat F-005
              </div>
            </div>

            <div style={{ textAlign: 'center', padding: '32px 0', borderTop: `1px solid ${C.border}`, marginTop: 28 }}>
              <div style={{ fontFamily: 'IM Fell English, serif', fontStyle: 'italic', fontSize: 15, color: C.golddk, lineHeight: 1.9 }}>
                The record of the founding circle is open.<br />
                When it is full, the founding is closed.<br />
                It will not be open again.<br /><br />
                Come in.
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ══ FOOTER ══════════════════════════════════════════════ */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: '32px 24px', textAlign: 'center', background: C.deep }}>
        <div style={{ marginBottom: 16 }}><Hearth /></div>
        <div style={{ fontFamily: 'IM Fell English, serif', fontSize: 13, color: C.golddk, lineHeight: 1.9, marginBottom: 12 }}>
          The Guild · NOIZY.ai · MC96ECO Universe · Est. 2026 · Ottawa, Canada
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginBottom: 14 }}>
          {['noizy.ai', 'mc96eco.com', 'gorunfree.com'].map(d => (
            <a key={d} href={`https://${d}`} style={{ fontSize: 11, color: C.soft, textDecoration: 'none', letterSpacing: '0.1em' }}>{d}</a>
          ))}
        </div>
        <div style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 12, color: C.soft }}>
          "Before the platform. Before the standard. Before the law. There is the family."
        </div>
      </div>

    </div>
  );
}
