import React, { useState, useEffect, useRef } from 'react';

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');`;

const C = {
  bg: '#0a0a0f',
  surface: '#111118',
  card: '#16161f',
  border: '#1e1e2e',
  accent: '#d4af37',
  accentDim: '#a08020',
  accentFaint: 'rgba(212,175,55,0.08)',
  cyan: '#00e5ff',
  cyanDim: '#0097aa',
  green: '#00e676',
  greenDim: '#00a152',
  red: '#ff5252',
  redDim: '#b71c1c',
  purple: '#bb86fc',
  text: '#f0f0f8',
  textMid: '#a0a0b8',
  textDim: '#606080',
  white: '#ffffff',
};

const SLIDES = [
  {
    id: 'hook',
    label: '01 — The Problem',
    title: 'Every AI voice platform is printing money with stolen voices.',
    subtitle: 'No consent. No contract. No cut for the creator.',
    icon: '⚡',
    color: C.red,
  },
  {
    id: 'market',
    label: '02 — The Market',
    title: '$791M raised. $2.45B valuation. $1.5B settlement.',
    subtitle: 'The AI voice market is exploding. The legal infrastructure doesn\'t exist yet.',
    icon: '📊',
    color: C.accent,
  },
  {
    id: 'product',
    label: '03 — The Product',
    title: 'Voice Estate Protocol',
    subtitle: 'Own your voice. License it on your terms. Get paid — automatically, forever.',
    icon: '🔐',
    color: C.cyan,
  },
  {
    id: 'how',
    label: '04 — How It Works',
    title: 'Consent-as-Code.',
    subtitle: '75/25 split enforced at the infrastructure layer — not in a contract, in the protocol.',
    icon: '⚙️',
    color: C.purple,
  },
  {
    id: 'proof',
    label: '05 — NOIZY PROOF',
    title: 'Cryptographic audio watermarking.',
    subtitle: 'Every file timestamped, signed, provenance-locked. Permanent. Undeniable.',
    icon: '🔏',
    color: C.green,
  },
  {
    id: 'moat',
    label: '06 — The Moat',
    title: 'They build tools. We build infrastructure.',
    subtitle: 'No competitor has coded consent into their royalty stack. Zero.',
    icon: '🏰',
    color: C.accent,
  },
  {
    id: 'traction',
    label: '07 — Traction',
    title: 'Protocol. Stack. Studio. Alliances.',
    subtitle: 'GABRIEL_V3 live. Consent stack built. Studio in design. SOCAN, SAG-AFTRA, CISAC queued.',
    icon: '🚀',
    color: C.cyan,
  },
  {
    id: 'ask',
    label: '08 — The Ask',
    title: '$2.5M CAD Series A Bridge.',
    subtitle: 'Studio build. Stack deployment. First 10,000 Voice Estates registered.',
    icon: '💰',
    color: C.green,
  },
  {
    id: 'team',
    label: '09 — The Team',
    title: 'Built by a creator. Defended by counsel. Engineered for scale.',
    subtitle: 'Rob Plowman (Founder), Alex (Tech), Dr. Brien Benoit (Legal), Adam Robb (Strategy).',
    icon: '👥',
    color: C.purple,
  },
  {
    id: 'vision',
    label: '10 — The Vision',
    title: 'The 5th Epoch.',
    subtitle: 'Not a platform. A protocol for how humans and AI make music — for the next 500 years.',
    icon: '∞',
    color: C.accent,
  },
];

const MARKET_DATA = [
  { label: 'ElevenLabs Valuation', value: '$11B', sub: 'Feb 2026 — $500M Series D', color: C.red, flag: 'NO CONSENT PROTOCOL' },
  { label: 'Suno Valuation', value: '$2.45B', sub: 'Nov 2025 — $200M ARR', color: C.red, flag: 'STILL IN LITIGATION' },
  { label: 'Anthropic Settlement', value: '$1.5B', sub: 'Bartz v. Anthropic — Sept 2025', color: C.accent, flag: 'LARGEST IN U.S. HISTORY' },
  { label: 'ElevenLabs Total Raised', value: '$791M', sub: 'Against voices with no deal', color: C.red, flag: 'ZERO ROYALTY INFRASTRUCTURE' },
  { label: 'AI Music Market', value: '$6.9B', sub: '2025 → $40B by 2030', color: C.green, flag: 'NOIZY\'S PLAYING FIELD' },
  { label: 'Creator Economy', value: '$480B', sub: 'Global — growing 22%/yr', color: C.cyan, flag: 'THE CONSTITUENCY' },
];

const PRODUCT_PILLARS = [
  {
    name: 'Voice Estate',
    tagline: 'Your voice as a legal asset',
    description: 'Every voice is registered, timestamped, and converted into a licensable IP asset. Inheritable. Transferable. Yours.',
    color: C.cyan,
    icon: '🎙️',
  },
  {
    name: 'Consent-as-Code',
    tagline: '75/25 split in the protocol',
    description: 'Not a contract you can lose in court. A consent layer enforced at the Cloudflare D1/KV infrastructure level. Every use. Every time.',
    color: C.accent,
    icon: '⚖️',
  },
  {
    name: 'NOIZY PROOF',
    tagline: 'Cryptographic audio watermark',
    description: 'Every output file carries a cryptographic signature: creator ID, timestamp, session, consent chain. Permanent. Undeniable in any court.',
    color: C.green,
    icon: '🔏',
  },
  {
    name: 'GABRIEL_V3',
    tagline: '315+ memcells, always watching',
    description: 'AI orchestrator that routes, remembers, and enforces. D1 × 11, KV × 20. The nervous system of the protocol.',
    color: C.purple,
    icon: '🧠',
  },
  {
    name: 'GORUNFREE',
    tagline: '35% voice, 65% AI — 1 click',
    description: 'A studio workflow that puts a human creator at the center of every AI session. Voice in, finished track out, consent stamped automatically.',
    color: C.cyan,
    icon: '▶️',
  },
  {
    name: 'Voice Estate Inheritance',
    tagline: 'Voices that outlive their owners',
    description: 'The first legal framework for voice as heritable property. Your estate can license your voice long after you\'re gone — with your rules intact.',
    color: C.accent,
    icon: '♾️',
  },
];

const MOAT_MATRIX = [
  { dimension: 'Coded Consent Layer', noizy: true, eleven: false, suno: false, adobe: false },
  { dimension: '75/25 Royalty Protocol', noizy: true, eleven: false, suno: false, adobe: false },
  { dimension: 'Voice Estate (IP asset)', noizy: true, eleven: false, suno: false, adobe: false },
  { dimension: 'Cryptographic Watermark', noizy: true, eleven: false, suno: false, adobe: 'partial' },
  { dimension: 'Inheritance Framework', noizy: true, eleven: false, suno: false, adobe: false },
  { dimension: 'Creator Union Relationships', noizy: true, eleven: false, suno: false, adobe: false },
  { dimension: 'Canadian Legal Jurisdiction', noizy: true, eleven: false, suno: false, adobe: false },
  { dimension: 'Consent Audit Trail', noizy: true, eleven: false, suno: false, adobe: 'partial' },
];

const ROADMAP = [
  { month: 'Mar 2026', phase: 'Foundation', milestone: 'Series A Bridge close. Studio design locked.', status: 'NOW', color: C.accent },
  { month: 'Apr 2026', phase: 'Build', milestone: 'Sound Vault + Policy Vault construction begins.', status: 'NEXT', color: C.cyan },
  { month: 'May 2026', phase: 'Deploy', milestone: 'GABRIEL_V3 full production. GORUNFREE v1 live.', status: 'Q2', color: C.green },
  { month: 'Jun 2026', phase: 'Launch', milestone: 'First 1,000 Voice Estates. Creator beta.', status: 'Q2', color: C.green },
  { month: 'Jul 2026', phase: 'Alliance', milestone: 'SOCAN partnership signed. SAG-AFTRA MOU.', status: 'Q3', color: C.purple },
  { month: 'Sep 2026', phase: 'Scale', milestone: '10,000 Voice Estates. Series A full round opens.', status: 'Q3', color: C.accent },
];

const USE_OF_FUNDS = [
  { item: 'Sound Vault + DreamChamber Studio', amount: '$180K–$350K CAD', pct: 42, color: C.cyan },
  { item: 'Policy Vault Server Room', amount: '$80K–$150K CAD', pct: 22, color: C.purple },
  { item: 'GABRIEL_V3 + Stack Deployment', amount: '$60K–$120K CAD', pct: 18, color: C.green },
  { item: 'Legal (IP, Voice Estate Framework)', amount: '$40K–$80K CAD', pct: 11, color: C.accent },
  { item: 'Creator Acquisition + SOCAN/SAG', amount: '$20K–$50K CAD', pct: 7, color: C.accentDim },
];

// ─── Canvas: Pulse Rings ───────────────────────────────────────────────────
function PulseRings({ color = C.accent }) {
  const ref = useRef(null);
  const af = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;
    const rings = [0, 0.4, 0.8, 1.2, 1.6];
    const draw = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      rings.forEach((offset, i) => {
        const progress = ((t * 0.4 + offset) % 2) / 2;
        const r = progress * Math.min(cx, cy) * 0.9;
        const alpha = (1 - progress) * 0.35;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
      t += 0.016;
      af.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(af.current);
  }, [color]);
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

// ─── Canvas: Market Bars ───────────────────────────────────────────────────
function MarketBars() {
  const ref = useRef(null);
  const af = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;
    const bars = [
      { label: 'ElevenLabs', val: 11, max: 12, color: '#ff5252' },
      { label: 'Suno', val: 2.45, max: 12, color: '#ffab40' },
      { label: 'AI Music Mkt', val: 6.9, max: 12, color: '#00e676' },
      { label: 'NOIZY (target)', val: 0.5, max: 12, color: '#d4af37' },
    ];
    const draw = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const W = canvas.width;
      const H = canvas.height;
      const barH = H / (bars.length + 1);
      bars.forEach((b, i) => {
        const y = (i + 0.5) * barH;
        const maxW = W * 0.7;
        const pct = Math.min(b.val / b.max, 1);
        const w = pct * maxW * Math.min(1, t * 0.6);
        const pulse = 1 + 0.03 * Math.sin(t * 2 + i);
        ctx.fillStyle = b.color + '22';
        ctx.fillRect(0, y - barH * 0.3, maxW, barH * 0.6);
        ctx.fillStyle = b.color;
        ctx.fillRect(0, y - barH * 0.3, w * pulse, barH * 0.6);
        ctx.fillStyle = '#f0f0f8';
        ctx.font = `500 11px DM Sans, sans-serif`;
        ctx.fillText(b.label, maxW + 8, y + 4);
        ctx.fillStyle = b.color;
        ctx.font = `700 11px DM Sans, sans-serif`;
        ctx.fillText(`$${b.val}B`, maxW + 8, y + 18);
      });
      t += 0.016;
      af.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(af.current);
  }, []);
  return <canvas ref={ref} style={{ width: '100%', height: '140px', display: 'block' }} />;
}

// ─── Canvas: Protocol Flow ────────────────────────────────────────────────
function ProtocolFlow() {
  const ref = useRef(null);
  const af = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;
    const nodes = [
      { label: 'Creator Voice', x: 0.1, y: 0.5, color: C.accent },
      { label: 'CONSENT', x: 0.3, y: 0.5, color: C.cyan },
      { label: 'GABRIEL', x: 0.5, y: 0.5, color: C.purple },
      { label: 'PROOF', x: 0.7, y: 0.5, color: C.green },
      { label: 'Voice Estate', x: 0.9, y: 0.5, color: C.accent },
    ];
    const draw = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // connections
      for (let i = 0; i < nodes.length - 1; i++) {
        const a = nodes[i];
        const b = nodes[i + 1];
        const ax = a.x * W, ay = a.y * H;
        const bx = b.x * W, by = b.y * H;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.strokeStyle = '#ffffff18';
        ctx.lineWidth = 2;
        ctx.stroke();

        // animated dot
        const p = (t * 0.3 + i * 0.25) % 1;
        const dx = ax + (bx - ax) * p;
        const dy = ay + (by - ay) * p;
        ctx.beginPath();
        ctx.arc(dx, dy, 3, 0, Math.PI * 2);
        ctx.fillStyle = a.color;
        ctx.fill();
      }

      // nodes
      nodes.forEach((n, i) => {
        const nx = n.x * W, ny = n.y * H;
        const pulse = 1 + 0.08 * Math.sin(t * 1.5 + i * 1.2);
        ctx.beginPath();
        ctx.arc(nx, ny, 18 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = n.color + '33';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(nx, ny, 12 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();
        ctx.fillStyle = '#0a0a0f';
        ctx.font = 'bold 7px DM Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.label.split(' ')[0].substring(0, 4).toUpperCase(), nx, ny);
        ctx.fillStyle = '#a0a0b8';
        ctx.font = '9px DM Sans, sans-serif';
        ctx.fillText(n.label, nx, ny + 28);
      });

      t += 0.016;
      af.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(af.current);
  }, []);
  return <canvas ref={ref} style={{ width: '100%', height: '120px', display: 'block' }} />;
}

// ─── Slide Components ─────────────────────────────────────────────────────

function SlideHook() {
  return (
    <div style={{ padding: '40px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '40px' }}>
        {[
          { stat: '0', label: 'AI voice platforms with coded consent', note: 'ElevenLabs, Suno, Adobe — zero.', color: C.red },
          { stat: '∞', label: 'Voices used without creator permission', note: 'Training data, inference output.', color: C.red },
          { stat: '$1.5B', label: 'Largest AI copyright settlement ever', note: 'Bartz v. Anthropic, Sept 2025', color: C.accent },
        ].map((s, i) => (
          <div key={i} style={{ background: C.card, border: `1px solid ${s.color}44`, borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '42px', fontWeight: '900', color: s.color, fontFamily: 'Playfair Display' }}>{s.stat}</div>
            <div style={{ fontSize: '12px', color: C.text, marginTop: '8px', lineHeight: 1.4 }}>{s.label}</div>
            <div style={{ fontSize: '11px', color: C.textDim, marginTop: '6px', fontStyle: 'italic' }}>{s.note}</div>
          </div>
        ))}
      </div>
      <div style={{ background: C.accentFaint, border: `1px solid ${C.accent}44`, borderRadius: '12px', padding: '28px' }}>
        <div style={{ fontSize: '20px', color: C.accent, fontFamily: 'Playfair Display', fontWeight: '700', marginBottom: '12px' }}>
          The gap is not technical. It's structural.
        </div>
        <div style={{ fontSize: '14px', color: C.textMid, lineHeight: 1.7 }}>
          Every major AI audio platform built a generation engine first and a rights framework never. The litigation is proof.
          The settlements are proof. The market has created a $40B+ industry on a foundation that courts are now dismantling.
        </div>
        <div style={{ fontSize: '14px', color: C.text, marginTop: '16px', lineHeight: 1.7, fontWeight: '600' }}>
          NOIZY doesn't sue after the fact. NOIZY builds the consent layer first — before the voice is ever used.
        </div>
      </div>
    </div>
  );
}

function SlideMarket() {
  return (
    <div style={{ padding: '40px 0' }}>
      <MarketBars />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '24px' }}>
        {MARKET_DATA.map((m, i) => (
          <div key={i} style={{ background: C.card, border: `1px solid ${m.color}33`, borderRadius: '10px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: m.color, fontFamily: 'Playfair Display' }}>{m.value}</div>
              <div style={{ fontSize: '11px', color: C.text, marginTop: '2px' }}>{m.label}</div>
              <div style={{ fontSize: '10px', color: C.textDim, marginTop: '2px', fontStyle: 'italic' }}>{m.sub}</div>
            </div>
            <div style={{ background: m.color + '22', border: `1px solid ${m.color}44`, borderRadius: '6px', padding: '4px 8px', fontSize: '8px', fontWeight: '700', color: m.color, textAlign: 'right', maxWidth: '90px', lineHeight: 1.4 }}>{m.flag}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '20px', background: C.accentFaint, borderRadius: '10px', padding: '20px', border: `1px solid ${C.accent}33` }}>
        <div style={{ fontSize: '13px', color: C.textMid, lineHeight: 1.6 }}>
          The competitors raised this capital against voices they didn't own. The legal exposure is enormous. The market reward for the first platform with
          <span style={{ color: C.accent, fontWeight: '700' }}> a provable, protocol-level consent system</span> is equally enormous.
        </div>
      </div>
    </div>
  );
}

function SlideProduct() {
  const [active, setActive] = useState(0);
  const p = PRODUCT_PILLARS[active];
  return (
    <div style={{ padding: '40px 0' }}>
      <ProtocolFlow />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '24px', marginBottom: '20px' }}>
        {PRODUCT_PILLARS.map((pp, i) => (
          <div key={i} onClick={() => setActive(i)} style={{ background: active === i ? pp.color + '22' : C.card, border: `1px solid ${active === i ? pp.color : C.border}`, borderRadius: '10px', padding: '14px', cursor: 'pointer', transition: 'all 0.2s' }}>
            <div style={{ fontSize: '20px', marginBottom: '6px' }}>{pp.icon}</div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: active === i ? pp.color : C.text }}>{pp.name}</div>
            <div style={{ fontSize: '10px', color: C.textDim, marginTop: '3px' }}>{pp.tagline}</div>
          </div>
        ))}
      </div>
      {p && (
        <div style={{ background: p.color + '11', border: `1px solid ${p.color}44`, borderRadius: '12px', padding: '24px' }}>
          <div style={{ fontSize: '22px', marginBottom: '8px' }}>{p.icon}</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: p.color, marginBottom: '10px', fontFamily: 'Playfair Display' }}>{p.name} — {p.tagline}</div>
          <div style={{ fontSize: '14px', color: C.textMid, lineHeight: 1.7 }}>{p.description}</div>
        </div>
      )}
    </div>
  );
}

function SlideHow() {
  return (
    <div style={{ padding: '40px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
        {[
          {
            label: 'How it works — technical',
            points: [
              'Creator registers voice → GABRIEL_V3 tokenizes into Voice Estate record',
              'Each use request hits Cloudflare D1 consent layer — 75/25 enforced before output',
              'GORUNFREE session: voice in → composition out → NOIZY PROOF stamp applied',
              'Royalty routed via smart distribution — no manual claims, no middleman',
            ],
            color: C.cyan,
          },
          {
            label: 'How it works — for the creator',
            points: [
              'Record once. License forever.',
              'See every use in real time. Approve or block.',
              'Your 75% arrives automatically — no forms, no invoicing, no labels.',
              'Your voice passes to your estate. Your children inherit the IP.',
            ],
            color: C.accent,
          },
        ].map((col, i) => (
          <div key={i} style={{ background: C.card, border: `1px solid ${col.color}33`, borderRadius: '12px', padding: '24px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: col.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>{col.label}</div>
            {col.points.map((pt, j) => (
              <div key={j} style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: col.color, marginTop: '7px', flexShrink: 0 }} />
                <div style={{ fontSize: '13px', color: C.textMid, lineHeight: 1.6 }}>{pt}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ background: C.accentFaint, border: `1px solid ${C.accent}44`, borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '28px', fontWeight: '900', color: C.accent, fontFamily: 'Playfair Display', letterSpacing: '-0.02em' }}>
          75% to the creator. Always. Coded. Permanent.
        </div>
        <div style={{ fontSize: '13px', color: C.textDim, marginTop: '10px' }}>Not a policy. Not a promise. A protocol. The split lives in the infrastructure, not in a document someone can revise.</div>
      </div>
    </div>
  );
}

function SlideProof() {
  return (
    <div style={{ padding: '40px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '28px' }}>
        {[
          { icon: '🔏', title: 'Cryptographic Signature', body: 'Every audio file output carries a tamper-proof hash: creator ID, session ID, timestamp, consent chain. Readable by any court in the world.', color: C.green },
          { icon: '⛓️', title: 'Immutable Ledger', body: 'GABRIEL_V3 writes every voice use to D1 (11 databases). The audit trail cannot be edited, deleted, or disputed.', color: C.cyan },
          { icon: '📋', title: 'Legal Admissibility', body: 'NOIZY PROOF was designed in consultation with IP counsel to meet evidentiary standards in US, EU, and Canadian copyright proceedings.', color: C.purple },
        ].map((c, i) => (
          <div key={i} style={{ background: C.card, border: `1px solid ${c.color}44`, borderRadius: '12px', padding: '24px' }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>{c.icon}</div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: c.color, marginBottom: '10px' }}>{c.title}</div>
            <div style={{ fontSize: '12px', color: C.textMid, lineHeight: 1.6 }}>{c.body}</div>
          </div>
        ))}
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.green}33`, borderRadius: '12px', padding: '24px' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: C.green, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Why this matters for investors</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ fontSize: '12px', color: C.textMid, lineHeight: 1.6 }}>
            ElevenLabs and Suno are currently litigating because they <em>cannot prove</em> consent was obtained for the voices in their models. Sony is still fighting Suno. The cost of that fight is existential.
          </div>
          <div style={{ fontSize: '12px', color: C.textMid, lineHeight: 1.6 }}>
            NOIZY PROOF means NOIZY can walk into any courtroom and produce a signed, timestamped, consent-linked record for every single voice in the platform. That is an entirely different legal posture.
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideMoat() {
  return (
    <div style={{ padding: '40px 0' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: '11px', color: C.textDim, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: `1px solid ${C.border}` }}>Capability</th>
              {['NOIZY', 'ElevenLabs', 'Suno', 'Adobe'].map(h => (
                <th key={h} style={{ textAlign: 'center', padding: '10px 14px', fontSize: '11px', fontWeight: '700', color: h === 'NOIZY' ? C.accent : C.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: `1px solid ${C.border}`, minWidth: '80px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOAT_MATRIX.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : C.surface }}>
                <td style={{ padding: '10px 14px', fontSize: '12px', color: C.text }}>{row.dimension}</td>
                {[row.noizy, row.eleven, row.suno, row.adobe].map((val, j) => (
                  <td key={j} style={{ textAlign: 'center', padding: '10px 14px' }}>
                    {val === true && <span style={{ fontSize: '16px', color: j === 0 ? C.green : C.green }}>✓</span>}
                    {val === false && <span style={{ fontSize: '14px', color: C.red }}>✗</span>}
                    {val === 'partial' && <span style={{ fontSize: '11px', color: C.accent, fontWeight: '600' }}>~</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: '24px', background: C.accentFaint, border: `1px solid ${C.accent}33`, borderRadius: '10px', padding: '20px' }}>
        <div style={{ fontSize: '15px', fontWeight: '700', color: C.accent, fontFamily: 'Playfair Display', marginBottom: '8px' }}>
          The moat is not a feature. It's a position.
        </div>
        <div style={{ fontSize: '13px', color: C.textMid, lineHeight: 1.6 }}>
          Every row with a ✗ for competitors is a lawsuit waiting to happen. NOIZY's entire architecture was designed to make each of those ✗ rows legally and technically impossible.
          You cannot add a consent layer after the fact. You have to build it first. NOIZY built it first.
        </div>
      </div>
    </div>
  );
}

function SlideTraction() {
  const items = [
    { label: 'GABRIEL_V3', detail: 'Live at 10.90.90.20 — 315+ memcells, D1 × 11, KV × 20', status: 'LIVE', color: C.green },
    { label: 'Consent Stack', detail: 'Cloudflare D1/KV consent enforcement layer — built and tested', status: 'BUILT', color: C.green },
    { label: 'NOIZY PROOF', detail: 'Cryptographic watermarking protocol — IP filed', status: 'FILED', color: C.green },
    { label: 'Voice Estate Framework', detail: 'Legal architecture — Dr. Brien Benoit (counsel) reviewing', status: 'IN REVIEW', color: C.accent },
    { label: 'DreamChamber Studio', detail: 'Physical build plan complete. Location scouted. Ottawa.', status: 'DESIGN', color: C.cyan },
    { label: 'GORUNFREE v1', detail: 'Workflow engine built. Integration testing Q2 2026.', status: 'TESTING', color: C.cyan },
    { label: 'SOCAN Alliance', detail: 'Approach prepared. First call Q2. Partnership path identified.', status: 'QUEUED', color: C.purple },
    { label: 'SAG-AFTRA / Duncan Crabtree-Ireland', detail: 'Referenced in No FAKES Act advocacy. Contact identified.', status: 'QUEUED', color: C.purple },
    { label: 'CISAC / Björn Ulvaeus', detail: 'Leading global composer rights reform. High alignment.', status: 'IDENTIFIED', color: C.purple },
  ];
  return (
    <div style={{ padding: '40px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item, i) => (
          <div key={i} style={{ background: C.card, border: `1px solid ${item.color}22`, borderRadius: '8px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: C.text }}>{item.label}</div>
              <div style={{ fontSize: '11px', color: C.textDim, marginTop: '2px' }}>{item.detail}</div>
            </div>
            <div style={{ background: item.color + '22', border: `1px solid ${item.color}55`, color: item.color, fontSize: '9px', fontWeight: '800', letterSpacing: '0.1em', padding: '4px 10px', borderRadius: '20px', flexShrink: 0 }}>{item.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideAsk() {
  return (
    <div style={{ padding: '40px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
        <div style={{ background: C.accentFaint, border: `1px solid ${C.accent}44`, borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', fontWeight: '900', color: C.accent, fontFamily: 'Playfair Display' }}>$2.5M</div>
          <div style={{ fontSize: '14px', color: C.text, marginTop: '6px', fontWeight: '600' }}>CAD — Series A Bridge</div>
          <div style={{ fontSize: '12px', color: C.textDim, marginTop: '8px', lineHeight: 1.6 }}>Convertible note or equity. 18-month runway to Series A full round.</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Use of Funds</div>
          {USE_OF_FUNDS.map((u, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', color: C.textMid }}>{u.item}</span>
                <span style={{ fontSize: '11px', color: u.color, fontWeight: '600' }}>{u.amount}</span>
              </div>
              <div style={{ height: '4px', background: C.border, borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${u.pct}%`, background: u.color, borderRadius: '2px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'NRC IRAP', detail: 'Innovation assistance — apply immediately', color: C.green },
          { label: 'FACTOR Canada', detail: 'Music technology funding eligible', color: C.cyan },
          { label: 'SR&ED Tax Credits', detail: 'AI R&D — retroactive + ongoing', color: C.purple },
        ].map((g, i) => (
          <div key={i} style={{ background: C.card, border: `1px solid ${g.color}33`, borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: g.color }}>{g.label}</div>
            <div style={{ fontSize: '10px', color: C.textDim, marginTop: '4px' }}>{g.detail}</div>
          </div>
        ))}
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.accent}33`, borderRadius: '10px', padding: '20px' }}>
        <div style={{ fontSize: '12px', color: C.textMid, lineHeight: 1.6 }}>
          <strong style={{ color: C.accent }}>Series A full round target (Q3 2026):</strong> $10–15M CAD. At 10,000 Voice Estates registered, revenue active, SOCAN partnership live.
          Bridge investors convert at pre-A valuation with standard discount.
        </div>
      </div>
    </div>
  );
}

function SlideTeam() {
  const team = [
    {
      name: 'Rob Plowman',
      title: 'Founder & CEO',
      role: 'NOIZYFISH INC. / MC96ECO Universe',
      detail: 'Creator-operator. Built the entire protocol architecture, product vision, and creator rights framework from first principles. Ottawa, Canada.',
      color: C.accent,
      icon: '🎙️',
    },
    {
      name: 'Alex',
      title: 'CTO',
      role: 'AI Stack & Infrastructure',
      detail: 'Architected GABRIEL_V3, the Cloudflare consent layer, and the SUPERSONIC AI Stack. 9 model layers, 19 HuggingFace integrations.',
      color: C.cyan,
      icon: '⚙️',
    },
    {
      name: 'Dr. Brien Benoit',
      title: 'Legal Counsel',
      role: 'IP & Voice Rights Law',
      detail: 'Reviewing Voice Estate inheritance framework. Ensuring NOIZY PROOF meets evidentiary standards in US, EU, and Canadian proceedings.',
      color: C.purple,
      icon: '⚖️',
    },
    {
      name: 'Adam Robb',
      title: 'Strategic Advisor',
      role: 'Business & Partnerships',
      detail: 'Alliance strategy, institutional partnerships, and Series A positioning. Network spans Canadian music industry and tech investment community.',
      color: C.green,
      icon: '🤝',
    },
  ];
  return (
    <div style={{ padding: '40px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
        {team.map((m, i) => (
          <div key={i} style={{ background: C.card, border: `1px solid ${m.color}33`, borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: m.color + '22', border: `2px solid ${m.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{m.icon}</div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: C.text, fontFamily: 'Playfair Display' }}>{m.name}</div>
                <div style={{ fontSize: '11px', color: m.color, fontWeight: '600' }}>{m.title}</div>
                <div style={{ fontSize: '10px', color: C.textDim }}>{m.role}</div>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: C.textMid, lineHeight: 1.6 }}>{m.detail}</div>
          </div>
        ))}
      </div>
      <div style={{ background: C.accentFaint, border: `1px solid ${C.accent}33`, borderRadius: '10px', padding: '20px' }}>
        <div style={{ fontSize: '13px', color: C.textMid, lineHeight: 1.6 }}>
          <strong style={{ color: C.accent }}>Advisory pipeline:</strong> SOCAN executive contact, SAG-AFTRA / Duncan Crabtree-Ireland, CISAC / Björn Ulvaeus, Artist Rights Alliance.
          None confirmed — all queued for Q2 2026 approach.
        </div>
      </div>
    </div>
  );
}

function SlideVision() {
  const epochs = [
    { n: 'I', label: 'Acoustic Era', detail: 'Live performance. Physical presence required.', color: C.textDim },
    { n: 'II', label: 'Recording Era', detail: 'Capture and distribute. Labels emerge.', color: C.textDim },
    { n: 'III', label: 'Digital Era', detail: 'Streaming. Spotify. Creator share collapses.', color: C.textDim },
    { n: 'IV', label: 'Streaming Age', detail: 'Licensed streams. Optional watermarks. AI training on unlicensed data.', color: C.accentDim },
    { n: 'V', label: 'Protocol Era', detail: 'Consent-as-Code. Voice Estate. NOIZY PROOF. Creator owns the infrastructure.', color: C.accent },
  ];
  return (
    <div style={{ padding: '40px 0' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch', marginBottom: '32px' }}>
        {epochs.map((e, i) => (
          <div key={i} style={{ flex: e.n === 'V' ? 2 : 1, background: e.n === 'V' ? C.accentFaint : C.card, border: `1px solid ${e.color}44`, borderRadius: '10px', padding: '16px', transition: 'all 0.2s' }}>
            <div style={{ fontSize: '24px', fontWeight: '900', color: e.color, fontFamily: 'Playfair Display' }}>{e.n}</div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: e.n === 'V' ? C.accent : C.textMid, margin: '6px 0 6px' }}>{e.label}</div>
            <div style={{ fontSize: '11px', color: C.textDim, lineHeight: 1.5 }}>{e.detail}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'NOIZY.ai', tagline: 'The protocol platform', color: C.accent },
          { label: 'NOIZYVOX', tagline: 'Voice Estate marketplace', color: C.cyan },
          { label: 'NOIZYLAB', tagline: 'AI music creation studio', color: C.purple },
          { label: 'NOIZYKIDZ', tagline: 'Music education + haptics', color: C.green },
          { label: 'Fish Music Inc.', tagline: 'Label & publishing arm', color: C.accentDim },
          { label: 'MC96ECO Universe', tagline: 'Rob\'s creative catalog', color: C.accent },
        ].map((b, i) => (
          <div key={i} style={{ background: C.card, border: `1px solid ${b.color}22`, borderRadius: '8px', padding: '12px 14px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: b.color }}>{b.label}</div>
            <div style={{ fontSize: '10px', color: C.textDim, marginTop: '3px' }}>{b.tagline}</div>
          </div>
        ))}
      </div>
      <div style={{ background: C.accentFaint, border: `1px solid ${C.accent}55`, borderRadius: '16px', padding: '28px', textAlign: 'center' }}>
        <div style={{ fontSize: '22px', fontWeight: '900', color: C.accent, fontFamily: 'Playfair Display', lineHeight: 1.3, marginBottom: '12px' }}>
          "AI and humans, building music together — where every creator is paid, protected, and remembered forever."
        </div>
        <div style={{ fontSize: '13px', color: C.textDim, lineHeight: 1.6 }}>
          Not a platform play. A protocol that outlasts any single company — because the consent layer is in the infrastructure, not the interface.
        </div>
      </div>
    </div>
  );
}

const SLIDE_COMPONENTS = {
  hook: SlideHook,
  market: SlideMarket,
  product: SlideProduct,
  how: SlideHow,
  proof: SlideProof,
  moat: SlideMoat,
  traction: SlideTraction,
  ask: SlideAsk,
  team: SlideTeam,
  vision: SlideVision,
};

// ─── Main Component ───────────────────────────────────────────────────────
export default function ThePitch() {
  const [active, setActive] = useState('hook');
  const slide = SLIDES.find(s => s.id === active);
  const SlideBody = SLIDE_COMPONENTS[active];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'DM Sans, sans-serif' }}>
      <style>{FONTS}</style>

      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: '900', color: C.accent, fontFamily: 'Playfair Display', letterSpacing: '-0.02em' }}>NOIZY.ai</div>
          <div style={{ fontSize: '10px', color: C.textDim, marginTop: '1px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Series A Bridge — Investor Briefing</div>
        </div>
        <div style={{ fontSize: '11px', color: C.textDim, textAlign: 'right' }}>
          <div>March 2026</div>
          <div style={{ color: C.accent }}>Confidential</div>
        </div>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 58px)' }}>
        {/* Slide Nav */}
        <div style={{ width: '220px', background: C.surface, borderRight: `1px solid ${C.border}`, padding: '16px 0', flexShrink: 0 }}>
          {SLIDES.map(s => (
            <div
              key={s.id}
              onClick={() => setActive(s.id)}
              style={{
                padding: '12px 20px',
                cursor: 'pointer',
                background: active === s.id ? s.color + '14' : 'transparent',
                borderLeft: `3px solid ${active === s.id ? s.color : 'transparent'}`,
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: '10px', color: active === s.id ? s.color : C.textDim, fontWeight: '700', letterSpacing: '0.08em', marginBottom: '3px' }}>{s.label}</div>
              <div style={{ fontSize: '11px', color: active === s.id ? C.text : C.textDim, lineHeight: 1.3, fontWeight: active === s.id ? '600' : '400' }}>{s.title}</div>
            </div>
          ))}
        </div>

        {/* Slide Content */}
        <div style={{ flex: 1, padding: '0 48px', overflowY: 'auto', maxWidth: '900px' }}>
          {/* Slide header */}
          <div style={{ position: 'relative', paddingTop: '48px', paddingBottom: '8px', borderBottom: `1px solid ${C.border}` }}>
            <PulseRings color={slide.color} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '11px', color: slide.color, fontWeight: '700', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '10px' }}>{slide.label}</div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: C.text, fontFamily: 'Playfair Display', lineHeight: 1.2, marginBottom: '12px', letterSpacing: '-0.02em' }}>{slide.title}</div>
              <div style={{ fontSize: '15px', color: C.textMid, lineHeight: 1.5, maxWidth: '700px', fontStyle: 'italic', fontFamily: 'Lora' }}>{slide.subtitle}</div>
            </div>
          </div>

          {/* Slide body */}
          <SlideBody />

          {/* Navigation arrows */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '24px 0 48px' }}>
            {(() => {
              const idx = SLIDES.findIndex(s => s.id === active);
              const prev = SLIDES[idx - 1];
              const next = SLIDES[idx + 1];
              return (
                <>
                  <div>
                    {prev && (
                      <div onClick={() => setActive(prev.id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: C.textDim, fontSize: '12px', transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = C.text}
                        onMouseLeave={e => e.currentTarget.style.color = C.textDim}>
                        <span>←</span>
                        <span>{prev.label}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    {next && (
                      <div onClick={() => setActive(next.id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: C.textDim, fontSize: '12px', transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = C.text}
                        onMouseLeave={e => e.currentTarget.style.color = C.textDim}>
                        <span>{next.label}</span>
                        <span>→</span>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Right sidebar — quick stats */}
        <div style={{ width: '180px', background: C.surface, borderLeft: `1px solid ${C.border}`, padding: '24px 16px', flexShrink: 0 }}>
          <div style={{ fontSize: '9px', color: C.textDim, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>Quick Stats</div>
          {[
            { label: 'Ask', value: '$2.5M CAD', color: C.accent },
            { label: 'Market', value: '$40B+', color: C.green },
            { label: 'Competitors\nw/ consent', value: '0', color: C.red },
            { label: 'Settlements\n2024–25', value: '4', color: C.cyan },
            { label: 'GABRIEL\nmemcells', value: '315+', color: C.purple },
            { label: 'Creator split', value: '75%', color: C.accent },
          ].map((s, i) => (
            <div key={i} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: '20px', fontWeight: '900', color: s.color, fontFamily: 'Playfair Display', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '9px', color: C.textDim, marginTop: '4px', whiteSpace: 'pre-line', lineHeight: 1.4 }}>{s.label}</div>
            </div>
          ))}
          <div style={{ marginTop: '8px', padding: '10px', background: C.accentFaint, border: `1px solid ${C.accent}33`, borderRadius: '8px' }}>
            <div style={{ fontSize: '9px', color: C.accent, fontWeight: '700', marginBottom: '6px' }}>BOTTOM LINE</div>
            <div style={{ fontSize: '9px', color: C.textMid, lineHeight: 1.5 }}>The market is behind NOIZY. Not the other way around.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
