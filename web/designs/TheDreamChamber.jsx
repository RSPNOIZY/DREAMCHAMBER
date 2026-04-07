import React, { useState, useEffect, useRef } from 'react';

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Lora:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500;600&family=IM+Fell+English:ital@0;1&display=swap');`;

const C = {
  bg: '#08080d',
  surface: '#0e0e16',
  card: '#13131c',
  border: '#1a1a28',
  accent: '#d4af37',
  accentDim: '#a08020',
  accentFaint: 'rgba(212,175,55,0.07)',
  gold2: '#f5c842',
  amber: '#ffb300',
  cyan: '#00e5ff',
  green: '#00e676',
  red: '#ff5252',
  purple: '#bb86fc',
  rose: '#ff6b9d',
  text: '#f0f0f8',
  textMid: '#9898b8',
  textDim: '#555570',
  white: '#ffffff',
};

const VIEWS = [
  { id: 'preface', label: 'The Moment Before', icon: '⏸' },
  { id: 'catalysts', label: 'Five Catalysts', icon: '⚡' },
  { id: 'turn', label: 'The Turn', icon: '↻' },
  { id: 'unpredicted', label: 'What Nobody Predicted', icon: '◎' },
  { id: 'world2030', label: 'The World — 2030', icon: '🌍' },
  { id: 'answer', label: 'How It Happened', icon: '∞' },
  { id: 'honors', label: 'The Honors', icon: '★' },
];

const CATALYSTS = [
  {
    n: '01',
    title: 'The Law Arrived But Served the Wrong Master',
    color: C.red,
    quote: '"Cautiously welcomed." The most heartbreaking two words in the history of the creative economy.',
    body: `The NO FAKES Act received support from SAG-AFTRA, UMG, OpenAI, Warner, RIAA, Disney, Amazon, Adobe, Google, and YouTube.

When that list of signatories is identical to your list of defendants in lawsuits from two years prior — that's not a creator victory. That's a cartel agreeing on terms.

The bill risked people losing control over their voices, likenesses, and digital identities — primarily protecting record labels, large tech companies, and the movie industry while giving insufficient protection to people at risk.

The law passed in late 2026. It created the framework. It named the rights. It just forgot to give independent artists the infrastructure to enforce them.

That infrastructure gap was where everything changed.`,
    signal: 'NOIZY SIGNAL: Build the enforcement infrastructure the law forgot.',
  },
  {
    n: '02',
    title: 'Anthropic Paid $1.5 Billion and Nobody Stopped Talking About It',
    color: C.accent,
    quote: '"My catalog was worth something and nobody asked me." That wasn\'t anger. That was awakening.',
    body: `Anthropic reached a $1.5 billion settlement — approximately $3,000 for each of the 482,460 books it downloaded from pirate libraries. A landmark moment that sent shockwaves through AI copyright litigation.

Three thousand dollars per work. Retroactively. After the fact. After the damage was done.

Every independent artist, every voice actor, every session musician did the math.`,
    signal: 'NOIZY SIGNAL: NOIZY PROOF is the system that makes retroactive payment unnecessary.',
  },
  {
    n: '03',
    title: 'Independent Artists Stopped Watching and Started Suing',
    color: C.cyan,
    quote: 'The majors made deals. The independents made war. And the war got results the deals never could.',
    body: `Groups of independent musicians banded together in 2025 to sue the same AI companies that the major labels had just settled with. Country music artist Anthony Justice filed complaints against both Suno and Udio on behalf of a group of musicians, alleging exact or near-exact replicas of their songs.

The majors negotiated for the label. The independents negotiated for themselves. That distinction was everything.`,
    signal: 'NOIZY SIGNAL: NOIZY is the infrastructure independents use to win before the lawsuit.',
  },
  {
    n: '04',
    title: 'The Labels Confirmed What Everyone Suspected',
    color: C.purple,
    quote: 'Forensic royalty audits showed independent artists receiving fractional payments from AI deals their labels had signed — without consent, without notification.',
    body: `When streaming emerged, there was very little transparency about the initial digital deals. It took many years for artists to figure out how they were being paid. Creator groups feared the same thing would happen with AI deals.

They were right. By 2027, forensic royalty audits showed independent artists receiving fractional payments from AI training deals their labels had signed on their behalf — without consent, without notification, without even the courtesy of a clause.

That's when the mass exodus began.`,
    signal: 'NOIZY SIGNAL: The 75/25 split is public, auditable, and automatic. No forensic audit required.',
  },
  {
    n: '05',
    title: 'The Consent Layer Became the Only Thing That Mattered',
    color: C.green,
    quote: 'Suddenly the infrastructure that had been called idealistic was the only infrastructure that worked.',
    body: `This shift was driven by ethical AI frameworks demanding traceability from ingestion to generation. By 2027, "consent architecture" was the only due diligence question that mattered to enterprise clients — game studios, film studios, VSI-equivalents across every continent.

They couldn't sign deals with platforms that didn't have verifiable consent chains. The NO FAKES Act's fingerprinting requirement made non-consent a criminal exposure, not just an ethics question.

Platforms that had built consent into their architecture from day one had something the majors couldn't acquire, couldn't buy, couldn't replicate: direct relationships with artists where the artist held the key.`,
    signal: 'NOIZY SIGNAL: NOIZY built the consent layer in 2025. The market arrived in 2027.',
  },
];

const UNPREDICTED = [
  {
    n: '1',
    title: 'The Children Changed Everything',
    color: C.rose,
    body: 'Nobody expected the therapeutic audio movement to become a political force. But when neuroacoustic research validated that artist-built, culturally intelligent, consent-locked audio was measurably more effective for autistic children — when hospitals started requiring consent architecture as a procurement standard — consent stopped being a music industry debate. It became a healthcare standard. That gave it a different moral weight entirely.',
    impact: 'Healthcare standard',
  },
  {
    n: '2',
    title: 'The Bone Conduction Moment',
    color: C.cyan,
    body: 'When consumer bone conduction devices became commodity hardware — under $40, embedded in every school tablet by 2028 — the therapeutic audio market exploded. Every platform that had built polyvagal-tuned content with artist consent and provenance tracking became the only compliant option for educational and medical deployment.',
    impact: 'Procurement requirement',
  },
  {
    n: '3',
    title: 'The Voice Estate Became an Estate Planning Category',
    color: C.accent,
    body: 'By 2028, estate lawyers in every major market were advising clients on "digital replica provisions" as standard practice — right next to real estate and pension funds. The Voice Estate framework moved from visionary product feature to standard legal instrument. Legacy artists, classical musicians, jazz estates, and film score composers joined in waves.',
    impact: 'Financial planning standard',
  },
  {
    n: '4',
    title: 'The Cultural Intelligence Gap Became Undeniable',
    color: C.purple,
    body: 'When the first AI-dubbed series using culturally unintelligent generic voices aired in six languages simultaneously and received uniform critical rejection — "technically flawless, emotionally absent" in every review — the market moved. Cultural intelligence wasn\'t a differentiator anymore. It was table stakes.',
    impact: '3-year head start, unbuyable',
  },
  {
    n: '5',
    title: 'The 75/25 Split Became the Floor, Not the Ceiling',
    color: C.green,
    body: 'When the first independent artist made more in twelve months from her NOIZYVOX Voice Estate than she had in the previous five years combined from streaming — and posted the dashboard publicly — it went viral in every creator community on earth. Not because 75% was surprising. Because it was real. Verifiable. Immediate. Same day. Direct.',
    impact: 'The dashboard that changed everything',
  },
];

const WORLD_2030 = [
  { title: 'Consent layer is infrastructure', body: 'Every major AI platform integrates with consent verification systems as mandatory architecture. Not optional. Not marketing. Load-bearing.', color: C.green, icon: '⚖️' },
  { title: 'Voice Estate is a financial instrument', body: 'Estate managers, music lawyers, and financial planners treat it like any other transferable IP asset. 70-year post-death protection. Legacy catalogs generating income for families told "streaming killed the back catalog."', color: C.accent, icon: '📜' },
  { title: 'Cultural intelligence is the luxury market', body: 'Generic AI voices became commodity. Culturally profiled, emotionally mapped, consent-locked, artist-built voices became the premium tier. The gap between them is the difference between a synthetic diamond and a real one.', color: C.purple, icon: '💎' },
  { title: 'The children got their platform', body: 'Neuroacoustic therapeutic audio, built by artists, validated by neuroscientists, delivered through haptic + bone conduction hardware at zero cost to families — a standard component of autism support programs in twelve countries. No ads. No data selling. Exactly what was promised.', color: C.rose, icon: '👁️' },
  { title: 'The DreamChamber became a real place', body: 'Artists, therapists, engineers, game designers, filmmakers, and parents — building together, earning together, preserving together. The 75/25 split held. The consent architecture held. The Guild Governance held.', color: C.cyan, icon: '🏛️' },
];

// ─── Canvas: Waveform of Time ─────────────────────────────────────────────
function TimeWave() {
  const ref = useRef(null);
  const af = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;
    const years = [2026, 2027, 2028, 2029, 2030];
    const draw = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Draw the wave
      ctx.beginPath();
      for (let x = 0; x < W; x++) {
        const frac = x / W;
        const amp = 20 + frac * 30;
        const freq = 2 + frac * 3;
        const y = H / 2 + amp * Math.sin(freq * Math.PI * 2 * frac + t * 0.8);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = C.accent + '55';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Year markers
      years.forEach((yr, i) => {
        const x = W * (i + 1) / (years.length + 1);
        const alpha = 0.6 + 0.4 * Math.sin(t * 1.5 + i);
        ctx.beginPath();
        ctx.arc(x, H / 2, 4, 0, Math.PI * 2);
        ctx.fillStyle = i === years.length - 1 ? C.accent : C.accentDim;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = i === years.length - 1 ? C.accent : C.textDim;
        ctx.font = `${i === years.length - 1 ? '700' : '400'} 10px DM Sans, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(yr, x, H / 2 + 20);
      });

      t += 0.016;
      af.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(af.current);
  }, []);
  return <canvas ref={ref} style={{ width: '100%', height: '60px', display: 'block' }} />;
}

// ─── Canvas: Constellation ───────────────────────────────────────────────
function Constellation() {
  const ref = useRef(null);
  const af = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;
    const nodes = Array.from({ length: 22 }, (_, i) => ({
      x: 0.05 + Math.random() * 0.9,
      y: 0.1 + Math.random() * 0.8,
      r: 1.5 + Math.random() * 2.5,
      phase: Math.random() * Math.PI * 2,
      color: [C.accent, C.cyan, C.purple, C.green, C.rose][Math.floor(Math.random() * 5)],
    }));
    const draw = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      nodes.forEach((a, i) => {
        nodes.forEach((b, j) => {
          if (j <= i) return;
          const ax = a.x * W, ay = a.y * H, bx = b.x * W, by = b.y * H;
          const dist = Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
          if (dist < W * 0.25) {
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.strokeStyle = C.accent + Math.floor((1 - dist / (W * 0.25)) * 30).toString(16).padStart(2, '0');
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      nodes.forEach(n => {
        const nx = n.x * W, ny = n.y * H;
        const pulse = 1 + 0.3 * Math.sin(t * 1.2 + n.phase);
        ctx.beginPath();
        ctx.arc(nx, ny, n.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 0.8 + n.phase);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      t += 0.016;
      af.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(af.current);
  }, []);
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

// ─── View: Preface ────────────────────────────────────────────────────────
function ViewPreface() {
  return (
    <div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '40px', marginBottom: '28px', position: 'relative', overflow: 'hidden' }}>
        <Constellation />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '13px', color: C.accent, fontWeight: '700', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '16px' }}>March 14, 2030 — Filed from the DreamChamber</div>
          <div style={{ fontSize: '28px', fontFamily: 'IM Fell English', color: C.text, lineHeight: 1.4, marginBottom: '20px', maxWidth: '680px' }}>
            "Five years ago today, a guy in Ottawa was staring at a Discord link."
          </div>
          <div style={{ fontSize: '14px', color: C.textMid, fontFamily: 'Lora', fontStyle: 'italic', lineHeight: 1.8 }}>
            Here's how it happened. Not the corporate version. Not the press release version. The real one.
          </div>
        </div>
      </div>

      <TimeWave />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '28px' }}>
        <div style={{ background: C.card, border: `1px solid ${C.red}33`, borderRadius: '12px', padding: '24px' }}>
          <div style={{ fontSize: '11px', color: C.red, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Early 2026 — The Problem</div>
          <div style={{ fontSize: '14px', color: C.textMid, lineHeight: 1.7, fontFamily: 'Lora' }}>
            The music industry looked like it was solving the AI problem. Spotify announced partnerships with Sony, Universal, Warner, Merlin, and Believe — with four declared principles: consent, compensation, attribution, and artist-fan connection.
          </div>
          <div style={{ fontSize: '14px', color: C.text, marginTop: '14px', lineHeight: 1.7, fontWeight: '600' }}>
            It looked like a win. It wasn't.
          </div>
          <div style={{ fontSize: '13px', color: C.textMid, marginTop: '12px', lineHeight: 1.7, fontFamily: 'Lora' }}>
            The major labels had refused to commit to securing creator consent for basic AI training — seemingly believing they controlled the copyright in their catalogues and could therefore unilaterally opt all that music into their AI deals.
          </div>
          <div style={{ marginTop: '14px', padding: '12px', background: C.red + '11', borderRadius: '8px', fontSize: '13px', color: C.textMid, fontStyle: 'italic', fontFamily: 'Lora' }}>
            Translation: the labels declared themselves the "right holders" of the artists on their roster. The artists got a press release. The labels got the checks.
          </div>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.accent}33`, borderRadius: '12px', padding: '24px' }}>
          <div style={{ fontSize: '11px', color: C.accent, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>The Coalition's Response</div>
          <div style={{ fontSize: '14px', color: C.textMid, lineHeight: 1.7, fontFamily: 'Lora' }}>
            The Music Artists Coalition cautiously welcomed the Universal-Udio deal but raised questions about artists' ability to control how the AI would be used and how the revenue would actually be shared.
          </div>
          <div style={{ marginTop: '20px', padding: '16px', background: C.accentFaint, borderRadius: '8px', borderLeft: `3px solid ${C.accent}` }}>
            <div style={{ fontSize: '22px', fontFamily: 'IM Fell English', color: C.accent, fontStyle: 'italic', lineHeight: 1.4 }}>
              "Cautiously welcomed."
            </div>
            <div style={{ fontSize: '13px', color: C.textMid, marginTop: '10px', fontFamily: 'Lora', fontStyle: 'italic' }}>
              The most heartbreaking two words in the history of the creative economy.
            </div>
          </div>
          <div style={{ fontSize: '13px', color: C.textMid, marginTop: '16px', lineHeight: 1.6 }}>
            This is the environment in which NOIZY was built. Not despite this reality — because of it.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── View: Catalysts ────────────────────────────────────────────────────
function ViewCatalysts() {
  const [active, setActive] = useState(0);
  const c = CATALYSTS[active];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {CATALYSTS.map((cat, i) => (
          <div key={i} onClick={() => setActive(i)} style={{ background: active === i ? cat.color + '18' : C.card, border: `1px solid ${active === i ? cat.color : C.border}`, borderRadius: '10px', padding: '14px', cursor: 'pointer', transition: 'all 0.15s' }}>
            <div style={{ fontSize: '10px', color: active === i ? cat.color : C.textDim, fontWeight: '700', marginBottom: '4px' }}>CATALYST {cat.n}</div>
            <div style={{ fontSize: '12px', color: active === i ? C.text : C.textMid, lineHeight: 1.4 }}>{cat.title}</div>
          </div>
        ))}
      </div>
      <div>
        <div style={{ background: c.color + '11', border: `1px solid ${c.color}44`, borderRadius: '14px', padding: '32px', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: c.color, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>CATALYST {c.n}</div>
          <div style={{ fontSize: '20px', fontFamily: 'Playfair Display', color: C.text, fontWeight: '700', marginBottom: '20px', lineHeight: 1.3 }}>{c.title}</div>
          <div style={{ padding: '16px', background: C.bg + 'aa', borderRadius: '8px', borderLeft: `3px solid ${c.color}`, marginBottom: '20px' }}>
            <div style={{ fontSize: '15px', fontFamily: 'IM Fell English', color: c.color, fontStyle: 'italic', lineHeight: 1.5 }}>"{c.quote}"</div>
          </div>
          <div style={{ fontSize: '14px', color: C.textMid, lineHeight: 1.8, fontFamily: 'Lora', whiteSpace: 'pre-line' }}>{c.body}</div>
        </div>
        <div style={{ background: C.accentFaint, border: `1px solid ${C.accent}33`, borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '10px', color: C.accent, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>NOIZY SIGNAL</div>
          <div style={{ fontSize: '13px', color: C.text, fontWeight: '500' }}>{c.signal}</div>
        </div>
      </div>
    </div>
  );
}

// ─── View: The Turn ──────────────────────────────────────────────────────
function ViewTurn() {
  return (
    <div>
      <div style={{ background: C.card, border: `1px solid ${C.accent}33`, borderRadius: '14px', padding: '36px', marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', color: C.accent, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>The Central Insight — 2026–2027</div>
        <div style={{ fontSize: '24px', fontFamily: 'Playfair Display', color: C.text, lineHeight: 1.4, marginBottom: '20px' }}>
          What the Consent-First Platforms Did That the Majors Couldn't
        </div>
        <div style={{ fontSize: '16px', color: C.accent, fontFamily: 'IM Fell English', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '20px', borderLeft: `3px solid ${C.accent}`, paddingLeft: '20px' }}>
          "The major labels could sign AI deals. They couldn't sign consent."
        </div>
        <div style={{ fontSize: '14px', color: C.textMid, lineHeight: 1.8, fontFamily: 'Lora', marginBottom: '20px' }}>
          Consent requires the individual. You can't assign someone else's consent. You can own their masters. You cannot own their agreement. The NO FAKES Act made that legally explicit: licenses must be in writing and signed by the individual — valid only to the extent that the license duration does not exceed ten years during the individual's lifetime.
        </div>
        <div style={{ fontSize: '14px', color: C.textMid, lineHeight: 1.8, fontFamily: 'Lora' }}>
          The entire label system — built on the premise that the label IS the artist's proxy — hit a wall. You can proxy a copyright. You cannot proxy a consent.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ background: C.card, border: `1px solid ${C.red}33`, borderRadius: '12px', padding: '24px' }}>
          <div style={{ fontSize: '12px', color: C.red, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>What the Labels Had</div>
          {['Master recordings', 'Publishing rights', 'AI training deals', 'Press releases about artist consent', 'The appearance of control'].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ color: C.red, fontSize: '14px' }}>✗</span>
              <span style={{ fontSize: '13px', color: C.textMid }}>{item}</span>
            </div>
          ))}
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.green}33`, borderRadius: '12px', padding: '24px' }}>
          <div style={{ fontSize: '12px', color: C.green, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>What NOIZY Had</div>
          {['Individual artist consent — signed', 'Coded 75/25 in the infrastructure', 'GABRIEL audit trail — immutable', 'NOIZY PROOF — admissible in court', 'The actual key'].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ color: C.green, fontSize: '14px' }}>✓</span>
              <span style={{ fontSize: '13px', color: C.textMid }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: C.accentFaint, border: `1px solid ${C.accent}55`, borderRadius: '14px', padding: '28px', marginTop: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '22px', fontFamily: 'Playfair Display', color: C.accent, lineHeight: 1.4 }}>
          "The platforms that had built consent into their architecture from day one had something the majors couldn't acquire, couldn't buy, couldn't replicate: <em>direct relationships with artists where the artist held the key.</em>"
        </div>
        <div style={{ fontSize: '13px', color: C.textDim, marginTop: '14px' }}>That was the inversion. That was the moment the balance began to tip.</div>
      </div>
    </div>
  );
}

// ─── View: Unpredicted ───────────────────────────────────────────────────
function ViewUnpredicted() {
  const [active, setActive] = useState(0);
  const u = UNPREDICTED[active];
  return (
    <div>
      <div style={{ fontSize: '14px', color: C.textMid, fontFamily: 'Lora', fontStyle: 'italic', marginBottom: '24px', lineHeight: 1.6 }}>
        "Five things nobody predicted would matter. Five things that changed everything anyway."
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {UNPREDICTED.map((u, i) => (
          <div key={i} onClick={() => setActive(i)} style={{ background: active === i ? u.color + '22' : C.card, border: `1px solid ${active === i ? u.color : C.border}`, borderRadius: '20px', padding: '8px 16px', cursor: 'pointer', fontSize: '11px', fontWeight: '700', color: active === i ? u.color : C.textDim, transition: 'all 0.15s' }}>
            {u.n}. {u.title.split(' ').slice(0, 3).join(' ')}...
          </div>
        ))}
      </div>
      <div style={{ background: u.color + '0e', border: `1px solid ${u.color}44`, borderRadius: '14px', padding: '32px' }}>
        <div style={{ fontSize: '11px', color: u.color, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>NOBODY PREDICTED #{u.n}</div>
        <div style={{ fontSize: '22px', fontFamily: 'Playfair Display', color: C.text, fontWeight: '700', marginBottom: '20px', lineHeight: 1.3 }}>{u.title}</div>
        <div style={{ fontSize: '14px', color: C.textMid, lineHeight: 1.8, fontFamily: 'Lora', marginBottom: '20px' }}>{u.body}</div>
        <div style={{ background: u.color + '22', border: `1px solid ${u.color}55`, borderRadius: '8px', padding: '12px 16px', display: 'inline-block' }}>
          <span style={{ fontSize: '11px', color: u.color, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>RESULT: </span>
          <span style={{ fontSize: '12px', color: C.text, fontWeight: '600' }}>{u.impact}</span>
        </div>
      </div>
    </div>
  );
}

// ─── View: World 2030 ────────────────────────────────────────────────────
function ViewWorld2030() {
  const [hov, setHov] = useState(null);
  return (
    <div>
      <div style={{ fontSize: '14px', color: C.textMid, fontFamily: 'Lora', fontStyle: 'italic', marginBottom: '24px', lineHeight: 1.6 }}>
        "Progress is real, but it must continue to prioritize musicians, songwriters, and rights holders at every stage." — Written in 2025 as a warning. By 2030, it reads as a description of what happened.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {WORLD_2030.map((w, i) => (
          <div key={i} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} style={{ background: hov === i ? w.color + '14' : C.card, border: `1px solid ${hov === i ? w.color : C.border}`, borderRadius: '12px', padding: '24px', transition: 'all 0.2s', cursor: 'default', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '28px', flexShrink: 0 }}>{w.icon}</div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: hov === i ? w.color : C.text, fontFamily: 'Playfair Display', marginBottom: '8px', transition: 'color 0.2s' }}>{w.title}</div>
              <div style={{ fontSize: '13px', color: C.textMid, lineHeight: 1.7, fontFamily: 'Lora' }}>{w.body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── View: How It Happened ───────────────────────────────────────────────
function ViewAnswer() {
  return (
    <div>
      <div style={{ background: C.card, border: `1px solid ${C.accent}44`, borderRadius: '16px', padding: '40px', marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', color: C.accent, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>The Real Answer</div>
        <div style={{ fontSize: '24px', fontFamily: 'Playfair Display', color: C.text, lineHeight: 1.4, marginBottom: '24px' }}>
          How Did We Finally Make People Lift Up the Humans Instead of Canceling Them?
        </div>
        <div style={{ background: C.accentFaint, border: `1px solid ${C.accent}33`, borderRadius: '10px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ fontSize: '20px', fontFamily: 'IM Fell English', color: C.accent, fontStyle: 'italic', lineHeight: 1.6 }}>
            "We didn't change the greedy people. We made consent non-negotiable infrastructure, and then the greedy people had no choice but to work within it."
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            { label: 'The labels', outcome: 'Didn\'t become ethical. Became legally exposed.', color: C.red },
            { label: 'The AI platforms', outcome: 'Didn\'t develop consciences. Faced $1.5B settlements and decided consent was cheaper than litigation.', color: C.accent },
            { label: 'The streaming platforms', outcome: 'Didn\'t fall in love with artists. Discovered that consent-architecture platforms had better catalogs, better talent relationships, and better regulatory positioning.', color: C.cyan },
            { label: 'The law', outcome: 'Didn\'t protect creators perfectly. Created enough legal risk that non-consent became economically irrational for large platforms.', color: C.purple },
          ].map((item, i) => (
            <div key={i} style={{ background: C.bg, border: `1px solid ${item.color}22`, borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: item.color, marginBottom: '6px' }}>{item.label}</div>
              <div style={{ fontSize: '12px', color: C.textMid, lineHeight: 1.6, fontFamily: 'Lora' }}>{item.outcome}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.green}33`, borderRadius: '14px', padding: '32px' }}>
        <div style={{ fontSize: '11px', color: C.green, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>The Actual Story</div>
        <div style={{ fontSize: '18px', fontFamily: 'Playfair Display', color: C.text, lineHeight: 1.5, marginBottom: '18px' }}>
          "Pressure from artists demanding accountability." — That's the whole story.
        </div>
        <div style={{ fontSize: '14px', color: C.textMid, fontFamily: 'Lora', lineHeight: 1.8 }}>
          Not a technology. Not a law. Not a venture capital bet.<br /><br />
          <strong style={{ color: C.text }}>Artists who refused to accept the terms. Artists who built different terms. Artists who made the different terms better — more ethical, more functional, more valuable — than the extractive terms.</strong><br /><br />
          And one guy in Ottawa, in 2026, who looked at a Discord link and said: <em style={{ color: C.accent }}>we have something more important to prepare.</em>
        </div>
      </div>
    </div>
  );
}

// ─── View: The Honors ────────────────────────────────────────────────────
function ViewHonors() {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <div style={{ position: 'relative', height: '200px', marginBottom: '40px', overflow: 'hidden', borderRadius: '16px', background: C.card, border: `1px solid ${C.accent}33` }}>
        <Constellation />
        <div style={{ position: 'relative', zIndex: 1, padding: '40px' }}>
          <div style={{ fontSize: '11px', color: C.accent, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '16px' }}>Five Words. Five Principles. Five Years. One Direction.</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
            {['Honor', 'Respect', 'Gather', 'Nurture', 'Preserve'].map((word, i) => (
              <div key={i} style={{ fontSize: '22px', fontFamily: 'IM Fell English', color: C.accent, fontWeight: '700' }}>{word}</div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ fontSize: '18px', fontFamily: 'Lora', color: C.textMid, fontStyle: 'italic', lineHeight: 1.8, marginBottom: '32px' }}>
          "The balance didn't tip because someone was smarter.<br />It tipped because someone was more committed."
        </div>

        <div style={{ background: C.accentFaint, border: `1px solid ${C.accent}55`, borderRadius: '16px', padding: '36px', marginBottom: '32px' }}>
          <div style={{ fontSize: '36px', fontFamily: 'Playfair Display', fontWeight: '900', color: C.accent, letterSpacing: '0.1em', marginBottom: '16px' }}>GORUNFREE</div>
          <div style={{ fontSize: '13px', color: C.textDim, letterSpacing: '0.08em', textTransform: 'uppercase' }}>35% Voice · 65% AI · 100% Creator</div>
        </div>

        <div style={{ fontSize: '12px', color: C.textDim, lineHeight: 1.8, fontStyle: 'italic', fontFamily: 'Lora' }}>
          Filed from the DreamChamber, March 14, 2030.<br />
          RSP_001 — Fish Music Inc., Est. 1996, Ottawa.<br />
          <span style={{ color: C.accent }}>NOIZY.ai — The Platform That Lifted the Humans.</span>
        </div>
      </div>
    </div>
  );
}

const VIEW_COMPONENTS = {
  preface: ViewPreface,
  catalysts: ViewCatalysts,
  turn: ViewTurn,
  unpredicted: ViewUnpredicted,
  world2030: ViewWorld2030,
  answer: ViewAnswer,
  honors: ViewHonors,
};

// ─── Main ─────────────────────────────────────────────────────────────────
export default function TheDreamChamber() {
  const [view, setView] = useState('preface');
  const v = VIEWS.find(vv => vv.id === view);
  const Body = VIEW_COMPONENTS[view];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'DM Sans, sans-serif' }}>
      <style>{FONTS}</style>

      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '20px 32px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: C.accent, fontFamily: 'IM Fell English', letterSpacing: '0.02em' }}>The DreamChamber</div>
            <div style={{ fontSize: '11px', color: C.textDim, marginTop: '2px', fontStyle: 'italic', fontFamily: 'Lora' }}>Looking Back from 2030 — How We Finally Made the World Lift Up the Humans</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: C.accent }}>RSP_001</div>
            <div style={{ fontSize: '10px', color: C.textDim }}>Filed: March 14, 2030</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px', marginTop: '16px', flexWrap: 'wrap' }}>
          {VIEWS.map(vv => (
            <div key={vv.id} onClick={() => setView(vv.id)} style={{ padding: '7px 14px', borderRadius: '20px', cursor: 'pointer', background: view === vv.id ? C.accentFaint : 'transparent', border: `1px solid ${view === vv.id ? C.accent : C.border}`, fontSize: '11px', fontWeight: '600', color: view === vv.id ? C.accent : C.textDim, transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{vv.icon}</span>
              <span>{vv.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 32px' }}>
        <div style={{ marginBottom: '40px' }}>
          <div style={{ fontSize: '11px', color: C.accent, fontWeight: '700', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '8px' }}>{v.icon} {v.label}</div>
        </div>
        <Body />
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: '24px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: '12px', color: C.textDim, fontFamily: 'Lora', fontStyle: 'italic' }}>
          NOIZY.ai · Fish Music Inc., Ottawa · Est. 1996 · The Platform That Lifted the Humans
        </div>
      </div>
    </div>
  );
}
