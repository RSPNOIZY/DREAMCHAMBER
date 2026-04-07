import React, { useState, useEffect, useRef } from 'react';

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Lora:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500;600&family=IM+Fell+English:ital@0;1&display=swap');`;

const C = {
  bg: '#07070c',
  surface: '#0c0c14',
  card: '#11111a',
  border: '#18182a',
  accent: '#d4af37',
  accentDim: '#a08020',
  accentFaint: 'rgba(212,175,55,0.07)',
  gold2: '#f5c842',
  cyan: '#00e5ff',
  cyanFaint: 'rgba(0,229,255,0.07)',
  green: '#00e676',
  greenFaint: 'rgba(0,230,118,0.07)',
  purple: '#bb86fc',
  purpleFaint: 'rgba(187,134,252,0.07)',
  amber: '#ffb300',
  rose: '#ff6b9d',
  roseFaint: 'rgba(255,107,157,0.07)',
  text: '#f0f0f8',
  textMid: '#9898b8',
  textDim: '#505068',
  white: '#ffffff',
};

const VIEWS = [
  { id: 'declaration', label: 'The Declaration', icon: '◈' },
  { id: 'components', label: 'Five Components', icon: '⬡' },
  { id: 'onboarding', label: 'Creator Onboarding', icon: '⊕' },
  { id: 'governance', label: 'Guild Governance', icon: '⚖' },
  { id: 'intelligence', label: 'Cultural Intelligence', icon: '◎' },
  { id: 'legacy', label: 'Estate & Legacy', icon: '♾' },
  { id: 'global', label: 'Global Scope', icon: '🌍' },
  { id: 'moat', label: 'Strategic Moat', icon: '🏰' },
];

const HVS_COMPONENTS = [
  {
    name: 'Voice Estate',
    icon: '🎙️',
    color: C.accent,
    tagline: 'Every voice is an asset. Every asset is owned by the voice.',
    description: 'Each artist holds a complete digital identity — voice samples, stems, AI training models, estate provisions. The Voice Estate is a legally enforceable, royalty-generating instrument that survives the artist\'s lifetime and continues generating for their heirs.',
    impact: 'Creates a legally enforceable, royalty-generating asset that survives the artist\'s lifetime',
    tech: 'GABRIEL_V3 tokenization → D1 permanent record → NOIZY PROOF timestamp',
    metrics: ['Voice ID registered in < 60 seconds', 'Estate inheritable on day 1', '70-year posthumous protection'],
  },
  {
    name: 'Consent Ledger',
    icon: '📋',
    color: C.cyan,
    tagline: 'Not a contract. Not a policy. A fact in the protocol.',
    description: 'Immutable, cryptographically verified consent for every use of the voice in AI, media, or derivative works. Enforced at the Cloudflare D1/KV layer — before the voice is used, not after. The Consent Ledger is the only record a court needs.',
    impact: 'Non-negotiable enforcement: platforms cannot monetize the voice without permission',
    tech: 'Cloudflare D1 consent layer → GABRIEL audit trail → NOIZY PROOF fingerprint',
    metrics: ['Every use logged in real time', 'Consent auditable by any court', 'Revocation instant and permanent'],
  },
  {
    name: 'Cultural Intelligence Layer',
    icon: '🌐',
    color: C.purple,
    tagline: 'Every voice carries a world inside it. We map the world.',
    description: 'Metadata tagging at the deepest level: emotional tone, linguistic nuance, regional adaptation, polyvagal response profile, neuroacoustic mapping. Culturally resonant voices command premium rates. Generic voices become commodity. HVS voices become irreplaceable.',
    impact: 'Premium differentiation: culturally resonant voices command higher value — unbuyable by competitors',
    tech: 'Emotional profile mapping → Regional validation → Neuroacoustic index → Polyvagal tier',
    metrics: ['12 primary emotional dimensions', '190+ regional language tags', 'Neuroacoustic therapeutic tier'],
  },
  {
    name: 'Royalty Protocol (75/25)',
    icon: '⚡',
    color: C.green,
    tagline: '75% to the creator. Coded. Automatic. Always.',
    description: 'Instant payout of royalties for every licensed use. Smart contract enforcement of the 75/25 split. No intermediaries. No invoice. No waiting. The day a use is recorded, 75% routes to the creator. 25% supports HVS guild infrastructure and global impact programs.',
    impact: 'Artists earn immediately, verifiably, and continuously — not 18 months later through three intermediaries',
    tech: 'Cloudflare KV royalty routing → Smart distribution layer → Real-time creator dashboard',
    metrics: ['Same-day payment', 'No minimum threshold', 'Full transaction audit trail'],
  },
  {
    name: 'Guild Governance',
    icon: '🏛️',
    color: C.amber,
    tagline: 'Artists govern the Guild. The Guild serves artists.',
    description: 'Democratic oversight of all HVS rules, ethics, protocol updates, and dispute resolution. Every major decision requires creator ratification. No corporate board. No external shareholder override. Guild law is artist law.',
    impact: 'Ensures artist-first control, prevents corporate capture, maintains trust across the global network',
    tech: 'Tiered voting (registered → active → legacy) → Transparent governance log → GABRIEL witness',
    metrics: ['One creator, one vote on protocol changes', 'All governance logged publicly', 'Dispute resolution in 72 hours'],
  },
];

const REGIONS = [
  { name: 'North America', flag: '🇨🇦🇺🇸', creators: 'Montreal indie folk → LA voice actors → Nashville session vocalists', priority: 'Launch region', color: C.accent },
  { name: 'South Asia', flag: '🇮🇳', creators: 'Mumbai playback singers → Carnatic tradition → Bollywood vocals', priority: 'Year 1 expansion', color: C.cyan },
  { name: 'West Africa', flag: '🌍', creators: 'Afrobeats Lagos → Griot tradition Senegal → Gospel choirs Ghana', priority: 'Cultural intelligence anchor', color: C.green },
  { name: 'Latin America', flag: '🌎', creators: 'Buenos Aires tango → São Paulo baile funk → Cumbia tradition Colombia', priority: 'Year 1 expansion', color: C.purple },
  { name: 'Nordic / Europe', flag: '🇸🇪🇩🇪', creators: 'Swedish pop tradition → GEMA network → Folk archive voices', priority: 'Alliance path (CISAC/Björn)', color: C.amber },
  { name: 'East Asia', flag: '🇯🇵🇰🇷', creators: 'J-pop and K-pop vocal traditions → Classical Chinese instrument vocals', priority: 'Year 2 expansion', color: C.rose },
  { name: 'Middle East / MENA', flag: '🌙', creators: 'Maqam modal tradition → Sufi vocal heritage → Contemporary Arabic pop', priority: 'Cultural preservation tier', color: C.accent },
  { name: 'Indigenous / First Nations', flag: '◈', creators: 'Inuit throat singing → Andean folk → Aboriginal songlines', priority: 'Heritage protection tier', color: C.cyan },
];

const GOVERNANCE_TIERS = [
  {
    tier: 'Registered Artist',
    color: C.textDim,
    criteria: 'Voice Estate created and verified',
    rights: ['Access creator dashboard', 'Receive royalties', 'Vote on community issues'],
    count: 'Base tier — all HVS members',
  },
  {
    tier: 'Active Creator',
    color: C.green,
    criteria: '12+ months active, 3+ licensed uses',
    rights: ['Vote on protocol updates', 'Nominate governance candidates', 'Access collective licensing pool'],
    count: 'Estimated 40% of members after Year 1',
  },
  {
    tier: 'Guild Elder',
    color: C.accent,
    criteria: '3+ years, 50+ licensed uses, community nomination',
    rights: ['Protocol proposal rights', 'Dispute arbitration panel', 'Legacy program design'],
    count: 'Capped at 5% — earned, not bought',
  },
  {
    tier: 'Heritage Voice',
    color: C.purple,
    criteria: 'Designated cultural or historic preservation',
    rights: ['Permanent archive status', 'Educational licensing controls', 'Heritage fund allocation'],
    count: 'Special designation — no cap, committee-reviewed',
  },
];

const ONBOARDING_STEPS = [
  { n: '01', title: 'Identity Verification', detail: 'Secure identity confirmation. Legal name, jurisdiction, and existing publishing affiliations (if any).', time: '< 5 min', color: C.accent },
  { n: '02', title: 'Voice Sampling', detail: 'Record a minimum of 3 voice samples: spoken, sung, emotive. Captured securely and tokenized into the Voice Estate.', time: '< 15 min', color: C.cyan },
  { n: '03', title: 'Consent Configuration', detail: 'Define your consent terms: which use types are pre-approved, which require explicit per-request approval, which are never permitted.', time: '< 10 min', color: C.green },
  { n: '04', title: 'Estate Designation', detail: 'Name your Voice Estate beneficiary. Set inheritance terms. Define posthumous licensing rules.', time: '< 5 min', color: C.purple },
  { n: '05', title: 'Cultural Profile', detail: 'Optional but powerful: tag emotional tones, language traditions, regional identity, neuroacoustic profile. Higher tags = higher value tier.', time: '< 20 min', color: C.amber },
  { n: '06', title: 'Guild Registration', detail: 'HVS ID issued. GABRIEL_V3 tokenizes your Voice Estate. NOIZY PROOF timestamps your registration. You are now infrastructure.', time: '< 1 min', color: C.accent },
];

const MOAT_DIMENSIONS = [
  { label: 'Legal enforceability', status: 'Coded into protocol — not a policy', color: C.green },
  { label: 'Cultural irreplicability', status: 'Built from real voices, not synthetic data', color: C.green },
  { label: 'Network effect', status: 'Every new voice strengthens every other voice', color: C.green },
  { label: 'Regulatory alignment', status: 'NO FAKES Act, EU AI Act, C2PA compliant', color: C.green },
  { label: 'Institutional alliance path', status: 'SOCAN, SAG-AFTRA, CISAC, GEMA — queued', color: C.accent },
  { label: 'Speed of replication', status: 'Cannot be replicated retroactively — consent requires individuals', color: C.green },
  { label: 'Heritage protection tier', status: 'Indigenous and minority voices — no competitor addresses', color: C.cyan },
  { label: 'Estate planning integration', status: 'No competitor has inheritance architecture', color: C.green },
];

// ─── Canvas: Voice Fingerprint ─────────────────────────────────────────────
function VoiceFingerprint({ color = C.accent }) {
  const ref = useRef(null);
  const af = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;
    const bars = Array.from({ length: 60 }, (_, i) => ({
      h: 0.1 + Math.random() * 0.9,
      phase: Math.random() * Math.PI * 2,
      speed: 0.8 + Math.random() * 1.4,
    }));
    const draw = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const barW = W / bars.length;
      bars.forEach((bar, i) => {
        const animated = bar.h * (0.4 + 0.6 * Math.abs(Math.sin(t * bar.speed + bar.phase)));
        const h = animated * H * 0.8;
        const x = i * barW;
        const y = (H - h) / 2;
        const alpha = 0.3 + 0.5 * animated;
        ctx.fillStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.fillRect(x + 1, y, barW - 2, h);
      });
      t += 0.016;
      af.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(af.current);
  }, [color]);
  return <canvas ref={ref} style={{ width: '100%', height: '80px', display: 'block' }} />;
}

// ─── Canvas: Guild Rings ───────────────────────────────────────────────────
function GuildRings() {
  const ref = useRef(null);
  const af = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;
    const tiers = [
      { r: 0.15, color: C.textDim, label: 'Registered', count: '∞' },
      { r: 0.28, color: C.green, label: 'Active', count: '40%' },
      { r: 0.40, color: C.accent, label: 'Elder', count: '5%' },
      { r: 0.50, color: C.purple, label: 'Heritage', count: '◈' },
    ];
    const draw = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2, cy = H / 2;
      ctx.clearRect(0, 0, W, H);

      tiers.forEach((tier, i) => {
        const r = tier.r * Math.min(W, H);
        const pulse = 1 + 0.04 * Math.sin(t * 1.2 + i * 1.5);
        ctx.beginPath();
        ctx.arc(cx, cy, r * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = tier.color + '44';
        ctx.lineWidth = i === 2 ? 2 : 1;
        ctx.stroke();

        // Dots on ring
        const dotCount = 4 + i * 3;
        for (let d = 0; d < dotCount; d++) {
          const angle = (d / dotCount) * Math.PI * 2 + t * (0.1 + i * 0.05);
          const dx = cx + r * pulse * Math.cos(angle);
          const dy = cy + r * pulse * Math.sin(angle);
          ctx.beginPath();
          ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = tier.color;
          ctx.globalAlpha = 0.7;
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        ctx.fillStyle = tier.color;
        ctx.font = '10px DM Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(tier.label, cx + r * 0.7, cy - 6);
        ctx.fillText(tier.count, cx + r * 0.7, cy + 8);
      });

      // Center
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fillStyle = C.accent;
      ctx.fill();
      ctx.fillStyle = C.bg;
      ctx.font = 'bold 8px DM Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('HVS', cx, cy);
      ctx.textBaseline = 'alphabetic';

      t += 0.016;
      af.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(af.current);
  }, []);
  return <canvas ref={ref} style={{ width: '100%', height: '240px', display: 'block' }} />;
}

// ─── Canvas: Global Pulse ─────────────────────────────────────────────────
function GlobalPulse() {
  const ref = useRef(null);
  const af = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;
    // Approximate lat/lng → canvas coords for 8 regions
    const points = [
      { x: 0.2, y: 0.38, color: C.accent, label: 'North America' },
      { x: 0.63, y: 0.42, color: C.cyan, label: 'South Asia' },
      { x: 0.5, y: 0.52, color: C.green, label: 'West Africa' },
      { x: 0.27, y: 0.6, color: C.purple, label: 'Latin America' },
      { x: 0.50, y: 0.3, color: C.amber, label: 'Nordic' },
      { x: 0.77, y: 0.38, color: C.rose, label: 'East Asia' },
      { x: 0.58, y: 0.38, color: C.accent, label: 'MENA' },
      { x: 0.15, y: 0.3, color: C.cyan, label: 'Indigenous' },
    ];
    const draw = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // connections
      points.forEach((a, i) => {
        points.forEach((b, j) => {
          if (j <= i) return;
          const ax = a.x * W, ay = a.y * H;
          const bx = b.x * W, by = b.y * H;
          const progress = (Math.sin(t * 0.5 + i * 0.3 + j * 0.5) + 1) / 2;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.strokeStyle = C.accent + Math.floor(progress * 22).toString(16).padStart(2, '0');
          ctx.lineWidth = 0.5;
          ctx.stroke();
        });
      });

      points.forEach((p, i) => {
        const px = p.x * W, py = p.y * H;
        const pulse = 1 + 0.25 * Math.sin(t * 1.5 + i * 0.8);
        // outer ring
        ctx.beginPath();
        ctx.arc(px, py, 14 * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = p.color + '44';
        ctx.lineWidth = 1;
        ctx.stroke();
        // inner dot
        ctx.beginPath();
        ctx.arc(px, py, 5 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      t += 0.016;
      af.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(af.current);
  }, []);
  return <canvas ref={ref} style={{ width: '100%', height: '200px', display: 'block' }} />;
}

// ─── Views ────────────────────────────────────────────────────────────────

function ViewDeclaration() {
  return (
    <div>
      <VoiceFingerprint color={C.accent} />
      <div style={{ textAlign: 'center', padding: '40px 0 28px' }}>
        <div style={{ fontSize: '11px', color: C.accent, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.22em', marginBottom: '16px' }}>Human Voice Signature</div>
        <div style={{ fontSize: '42px', fontFamily: 'IM Fell English', color: C.text, lineHeight: 1.2, marginBottom: '12px' }}>
          The Global Guild of Artists
        </div>
        <div style={{ fontSize: '16px', fontFamily: 'Lora', color: C.textMid, fontStyle: 'italic', marginBottom: '32px' }}>
          Every human voice is irreplaceable. Every voice is an asset. Every voice belongs to the person who made it.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '28px' }}>
        {[
          { word: 'Artists are owners.', color: C.accent },
          { word: 'Artists are sovereign.', color: C.cyan },
          { word: 'Artists are the infrastructure.', color: C.green },
        ].map((s, i) => (
          <div key={i} style={{ background: C.card, border: `1px solid ${s.color}33`, borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontFamily: 'IM Fell English', color: s.color, lineHeight: 1.4 }}>{s.word}</div>
          </div>
        ))}
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.accent}44`, borderRadius: '14px', padding: '32px', marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', color: C.accent, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '14px' }}>What HVS Is</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {[
            { label: 'NOT a product', detail: 'HVS is not a platform feature or a subscription tier. It\'s a protocol standard — like HTTPS, but for consent.', neg: true },
            { label: 'NOT a union', detail: 'HVS doesn\'t negotiate on behalf of artists. It gives artists the infrastructure to negotiate — or not negotiate — for themselves.', neg: true },
            { label: 'A movement', detail: 'A networked guild that redefines what ownership, consent, and legacy mean in the AI era.', neg: false },
            { label: 'An infrastructure layer', detail: 'Once HVS exists at scale, the "creator-first infrastructure" becomes the de facto standard. Any platform ignoring it is automatically second-tier.', neg: false },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px' }}>
              <div style={{ fontSize: '16px', flexShrink: 0, marginTop: '2px' }}>{item.neg ? '✗' : '✓'}</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: item.neg ? C.textDim : C.text, marginBottom: '4px' }}>{item.label}</div>
                <div style={{ fontSize: '12px', color: C.textMid, lineHeight: 1.6 }}>{item.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: C.accentFaint, border: `1px solid ${C.accent}44`, borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '20px', fontFamily: 'Playfair Display', color: C.accent, fontWeight: '700' }}>
          HVS — Human Voice Signature
        </div>
        <div style={{ fontSize: '13px', color: C.textMid, marginTop: '8px' }}>
          Powered by NOIZY.ai · GABRIEL_V3 · NOIZY PROOF · Consent-as-Code
        </div>
      </div>
    </div>
  );
}

function ViewComponents() {
  const [active, setActive] = useState(0);
  const c = HVS_COMPONENTS[active];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {HVS_COMPONENTS.map((comp, i) => (
          <div key={i} onClick={() => setActive(i)} style={{ background: active === i ? comp.color + '18' : C.card, border: `1px solid ${active === i ? comp.color : C.border}`, borderRadius: '10px', padding: '14px', cursor: 'pointer', transition: 'all 0.15s' }}>
            <div style={{ fontSize: '18px', marginBottom: '6px' }}>{comp.icon}</div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: active === i ? comp.color : C.text }}>{comp.name}</div>
            <div style={{ fontSize: '10px', color: C.textDim, marginTop: '3px', lineHeight: 1.4 }}>{comp.tagline}</div>
          </div>
        ))}
      </div>
      <div>
        <div style={{ background: c.color + '0e', border: `1px solid ${c.color}44`, borderRadius: '14px', padding: '32px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div style={{ fontSize: '32px' }}>{c.icon}</div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: c.color, fontFamily: 'Playfair Display' }}>{c.name}</div>
              <div style={{ fontSize: '13px', color: C.textMid, fontStyle: 'italic', fontFamily: 'Lora' }}>{c.tagline}</div>
            </div>
          </div>
          <div style={{ fontSize: '14px', color: C.textMid, lineHeight: 1.8, fontFamily: 'Lora', marginBottom: '20px' }}>{c.description}</div>
          <div style={{ background: C.bg, border: `1px solid ${c.color}22`, borderRadius: '8px', padding: '14px', marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', color: c.color, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Technical Layer</div>
            <div style={{ fontSize: '12px', color: C.textMid, fontFamily: 'DM Sans' }}>{c.tech}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: c.color, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Key Metrics</div>
            {c.metrics.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                <span style={{ color: c.color }}>→</span>
                <span style={{ fontSize: '12px', color: C.textMid }}>{m}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: C.accentFaint, border: `1px solid ${C.accent}33`, borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '10px', color: C.accent, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Strategic Impact</div>
          <div style={{ fontSize: '13px', color: C.text }}>{c.impact}</div>
        </div>
      </div>
    </div>
  );
}

function ViewOnboarding() {
  const [active, setActive] = useState(null);
  return (
    <div>
      <div style={{ fontSize: '14px', color: C.textMid, fontFamily: 'Lora', fontStyle: 'italic', marginBottom: '24px', lineHeight: 1.6 }}>
        From zero to Voice Estate in under an hour. From unknown artist to HVS-registered Guild member in six steps.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {ONBOARDING_STEPS.map((step, i) => (
          <div key={i} onClick={() => setActive(active === i ? null : i)} style={{ background: active === i ? step.color + '11' : C.card, border: `1px solid ${active === i ? step.color : C.border}`, borderRadius: '10px', padding: '18px 20px', cursor: 'pointer', transition: 'all 0.2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: active === i ? step.color + '22' : C.border, border: `2px solid ${active === i ? step.color : C.textDim}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', color: active === i ? step.color : C.textDim, flexShrink: 0 }}>{step.n}</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: active === i ? C.text : C.textMid }}>{step.title}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: step.color + '22', color: step.color, fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '12px' }}>{step.time}</div>
                <div style={{ color: C.textDim, fontSize: '14px' }}>{active === i ? '▲' : '▼'}</div>
              </div>
            </div>
            {active === i && (
              <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: `1px solid ${step.color}22`, fontSize: '13px', color: C.textMid, lineHeight: 1.7, fontFamily: 'Lora', paddingLeft: '52px' }}>
                {step.detail}
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ background: C.accentFaint, border: `1px solid ${C.accent}33`, borderRadius: '12px', padding: '24px', marginTop: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', fontFamily: 'Playfair Display', color: C.accent, marginBottom: '8px' }}>
          Total onboarding time: under 60 minutes.
        </div>
        <div style={{ fontSize: '13px', color: C.textDim }}>After Step 6 — you are no longer just a creator. You are infrastructure.</div>
      </div>
    </div>
  );
}

function ViewGovernance() {
  const [active, setActive] = useState(0);
  return (
    <div>
      <GuildRings />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '16px' }}>
        {GOVERNANCE_TIERS.map((tier, i) => (
          <div key={i} onClick={() => setActive(i)} style={{ background: active === i ? tier.color + '14' : C.card, border: `1px solid ${active === i ? tier.color : C.border}`, borderRadius: '10px', padding: '20px', cursor: 'pointer', transition: 'all 0.15s' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: tier.color, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{tier.tier}</div>
            <div style={{ fontSize: '11px', color: C.textDim, marginBottom: '10px', fontStyle: 'italic' }}>{tier.criteria}</div>
            {active === i && tier.rights.map((r, j) => (
              <div key={j} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                <span style={{ color: tier.color, fontSize: '10px' }}>✓</span>
                <span style={{ fontSize: '11px', color: C.textMid }}>{r}</span>
              </div>
            ))}
            <div style={{ fontSize: '10px', color: C.textDim, marginTop: '8px', borderTop: `1px solid ${C.border}`, paddingTop: '8px' }}>{tier.count}</div>
          </div>
        ))}
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.accent}33`, borderRadius: '12px', padding: '24px', marginTop: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: C.accent, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Guild Law — Core Principles</div>
        {[
          'No decision affecting royalty splits can pass without 60% supermajority of Active Creators + Guild Elders.',
          'Protocol updates are published 30 days in advance for creator review.',
          'Any corporate partnership requires full transparency disclosure to all Guild members.',
          'The Guild cannot be sold, merged, or transferred without unanimous Elder ratification.',
          'Every governance vote, motion, and outcome is logged publicly and permanently via GABRIEL.',
        ].map((rule, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <span style={{ color: C.accent, fontSize: '12px', flexShrink: 0 }}>{i + 1}.</span>
            <span style={{ fontSize: '12px', color: C.textMid, lineHeight: 1.6 }}>{rule}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ViewIntelligence() {
  return (
    <div>
      <div style={{ background: C.card, border: `1px solid ${C.purple}44`, borderRadius: '14px', padding: '32px', marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', color: C.purple, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>The Premium Tier</div>
        <div style={{ fontSize: '22px', fontFamily: 'Playfair Display', color: C.text, lineHeight: 1.4, marginBottom: '16px' }}>
          Generic AI voices become commodity. Culturally mapped, consent-locked, emotionally intelligent voices become irreplaceable.
        </div>
        <div style={{ fontSize: '14px', color: C.textMid, fontFamily: 'Lora', lineHeight: 1.7 }}>
          The Cultural Intelligence Layer is how HVS turns a voice into a world. Every voice sample is tagged across twelve primary emotional dimensions, regional linguistic markers, polyvagal response profile, and neuroacoustic therapeutic tier. That metadata is the difference between a synthetic replacement and a living archive.
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
        {[
          { label: '12 Emotional Dimensions', items: ['Joy / Exuberance', 'Grief / Lament', 'Sacred / Reverent', 'Protective / Fierce', 'Contemplative', 'Playful / Childlike', 'Erotic / Intimate', 'Political / Declarative', 'Meditative / Healing', 'Narrative / Bardic', 'Comic / Satirical', 'Transcendent / Ecstatic'], color: C.purple },
          { label: 'Regional & Linguistic', items: ['Primary language + dialect', 'Regional vocal tradition', 'Indigenous language flag', 'Minority language preservation flag', 'Heritage designation', 'Cross-cultural fusion tier'], color: C.cyan },
          { label: 'Neuroacoustic Profile', items: ['Polyvagal activation tier', 'Frequency range mapping', 'Therapeutic application tags', 'Autism support validated', 'Trauma-informed tier', 'Hospital/school deployment approved'], color: C.rose },
        ].map((col, i) => (
          <div key={i} style={{ background: C.card, border: `1px solid ${col.color}33`, borderRadius: '10px', padding: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: col.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>{col.label}</div>
            {col.items.map((item, j) => (
              <div key={j} style={{ fontSize: '11px', color: C.textMid, marginBottom: '6px', display: 'flex', gap: '6px' }}>
                <span style={{ color: col.color, opacity: 0.6 }}>·</span>
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ background: C.purpleFaint, border: `1px solid ${C.purple}33`, borderRadius: '10px', padding: '20px' }}>
        <div style={{ fontSize: '13px', color: C.textMid, lineHeight: 1.7 }}>
          <strong style={{ color: C.purple }}>Why this is the unbuyable moat:</strong> Cultural intelligence is built from real voices over real time with real consent. It cannot be reverse-engineered from synthetic data. A competitor launching in 2027 starts three years behind — not in technology, but in <em>trust</em>.
        </div>
      </div>
    </div>
  );
}

function ViewLegacy() {
  return (
    <div>
      <div style={{ background: C.card, border: `1px solid ${C.accent}44`, borderRadius: '14px', padding: '36px', marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', color: C.accent, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '14px' }}>The Principle</div>
        <div style={{ fontSize: '24px', fontFamily: 'IM Fell English', color: C.text, lineHeight: 1.4, marginBottom: '16px' }}>
          "Your voice passes to your estate. Your children inherit the IP."
        </div>
        <div style={{ fontSize: '14px', color: C.textMid, fontFamily: 'Lora', lineHeight: 1.8 }}>
          HVS is the first platform to treat voice as heritable property in the same legal sense as real estate, publishing rights, or a business ownership stake. The Voice Estate is structured to transfer at death — or earlier, on the artist's terms — to designated beneficiaries, with all consent and royalty terms preserved.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        {[
          {
            title: 'During the Artist\'s Lifetime',
            color: C.cyan,
            items: [
              'Full control over consent terms',
              'Real-time royalty dashboard',
              'Ability to revoke any license instantly',
              'Right to update Voice Estate anytime',
              'Transfer partial rights (co-licensing)',
            ],
          },
          {
            title: 'After the Artist\'s Death',
            color: C.accent,
            items: [
              '70-year posthumous protection period',
              'Designated heir(s) manage the Estate',
              'Original consent terms remain legally binding',
              'Heir can extend, restrict, or archive',
              'Heritage designation available for legacy voices',
            ],
          },
        ].map((col, i) => (
          <div key={i} style={{ background: C.card, border: `1px solid ${col.color}33`, borderRadius: '12px', padding: '24px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: col.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>{col.title}</div>
            {col.items.map((item, j) => (
              <div key={j} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <span style={{ color: col.color }}>→</span>
                <span style={{ fontSize: '12px', color: C.textMid, lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ background: C.accentFaint, border: `1px solid ${C.accent}33`, borderRadius: '12px', padding: '24px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: C.accent, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Why Estate Lawyers Will Recommend HVS by 2028</div>
        <div style={{ fontSize: '13px', color: C.textMid, lineHeight: 1.7 }}>
          By 2028, estate lawyers in every major market will advise clients on "digital replica provisions" as standard practice — right next to real estate and pension funds. The platforms that built inheritance architecture early become the platforms estate managers recommend. HVS was built with this in mind from day one.
        </div>
      </div>
    </div>
  );
}

function ViewGlobal() {
  const [hov, setHov] = useState(null);
  return (
    <div>
      <GlobalPulse />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
        {REGIONS.map((r, i) => (
          <div key={i} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} style={{ background: hov === i ? r.color + '11' : C.card, border: `1px solid ${hov === i ? r.color : C.border}`, borderRadius: '10px', padding: '16px', transition: 'all 0.15s', cursor: 'default' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: hov === i ? C.text : C.textMid }}>{r.flag} {r.name}</div>
              <div style={{ background: r.color + '22', color: r.color, fontSize: '9px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' }}>{r.priority}</div>
            </div>
            <div style={{ fontSize: '11px', color: C.textDim, lineHeight: 1.5 }}>{r.creators}</div>
          </div>
        ))}
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.accent}33`, borderRadius: '12px', padding: '24px', marginTop: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: C.accent, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Cultural Preservation Commitment</div>
        <div style={{ fontSize: '13px', color: C.textMid, lineHeight: 1.7 }}>
          HVS treats indigenous languages, minority vocal traditions, and heritage art forms as equal to commercial genres — not charity cases. They receive the same consent protections, the same royalty protocols, and the same estate planning rights. They are also the most irreplaceable voices in the entire network. HVS archives them, monetizes them on creator terms, and celebrates them.
        </div>
      </div>
    </div>
  );
}

function ViewMoat() {
  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
        {MOAT_DIMENSIONS.map((m, i) => (
          <div key={i} style={{ background: C.card, border: `1px solid ${m.color}22`, borderRadius: '8px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '13px', color: C.text }}>{m.label}</div>
            <div style={{ fontSize: '12px', color: m.color, fontWeight: '500', textAlign: 'right', maxWidth: '280px' }}>{m.status}</div>
          </div>
        ))}
      </div>
      <div style={{ background: C.accentFaint, border: `1px solid ${C.accent}55`, borderRadius: '14px', padding: '32px', textAlign: 'center' }}>
        <div style={{ fontSize: '24px', fontFamily: 'Playfair Display', color: C.accent, fontWeight: '700', lineHeight: 1.4, marginBottom: '14px' }}>
          "HVS isn't a product. It's a movement."
        </div>
        <div style={{ fontSize: '14px', color: C.textMid, fontFamily: 'Lora', lineHeight: 1.7, maxWidth: '600px', margin: '0 auto' }}>
          A networked guild that redefines what ownership, consent, and legacy mean in the AI era. Once this exists, the creator-first infrastructure becomes the de facto standard. Any platform ignoring it is automatically second-tier.
        </div>
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {['NOIZY.ai', 'NOIZYVOX', 'GABRIEL_V3', 'NOIZY PROOF', 'Consent-as-Code', '75/25 Protocol'].map((tag, i) => (
            <div key={i} style={{ background: C.card, border: `1px solid ${C.accent}33`, borderRadius: '20px', padding: '6px 14px', fontSize: '11px', color: C.accent }}>{tag}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

const VIEW_COMPONENTS = {
  declaration: ViewDeclaration,
  components: ViewComponents,
  onboarding: ViewOnboarding,
  governance: ViewGovernance,
  intelligence: ViewIntelligence,
  legacy: ViewLegacy,
  global: ViewGlobal,
  moat: ViewMoat,
};

// ─── Main ──────────────────────────────────────────────────────────────────
export default function TheHVS() {
  const [view, setView] = useState('declaration');
  const v = VIEWS.find(vv => vv.id === view);
  const Body = VIEW_COMPONENTS[view];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'DM Sans, sans-serif' }}>
      <style>{FONTS}</style>

      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '18px 32px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: C.accentFaint, border: `2px solid ${C.accent}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🎙️</div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: C.accent, fontFamily: 'IM Fell English', letterSpacing: '0.04em' }}>HVS</div>
              <div style={{ fontSize: '10px', color: C.textDim, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Human Voice Signature · The Global Guild of Artists</div>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: C.textDim, textAlign: 'right' }}>
            <div style={{ color: C.accent }}>NOIZY.ai</div>
            <div>Protocol Layer</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {VIEWS.map(vv => (
            <div key={vv.id} onClick={() => setView(vv.id)} style={{ padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', background: view === vv.id ? C.accentFaint : 'transparent', border: `1px solid ${view === vv.id ? C.accent : C.border}`, fontSize: '11px', fontWeight: '600', color: view === vv.id ? C.accent : C.textDim, transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '10px' }}>{vv.icon}</span>
              <span>{vv.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '940px', margin: '0 auto', padding: '48px 32px' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '11px', color: C.accent, fontWeight: '700', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '4px' }}>{v.icon} {v.label}</div>
        </div>
        <Body />
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: '20px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: '12px', color: C.textDim, fontFamily: 'Lora', fontStyle: 'italic' }}>
          HVS — Human Voice Signature · Global Guild of Artists · NOIZY.ai · Every voice is irreplaceable.
        </div>
      </div>
    </div>
  );
}
