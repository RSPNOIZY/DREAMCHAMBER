import React, { useState, useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────
// THE CREATOR'S DECLARATION
// A formal indictment of the extractive AI platform model.
// Drafted by NOIZY.ai, MC96ECO Universe, 2026.
// For every musician, voice actor, sound designer, composer,
// and artist whose work was consumed without their consent,
// without credit, without compensation, without care.
//
// "IT'S A CANNIBALISTIC PLATFORM. JUST KEEPS EATING MUSICIANS
//  & ARTISTS WORK WITHOUT CARE OF HUMANITY."
//  — Rob Plowman, Founder, NOIZY.ai
// ─────────────────────────────────────────────────────────────

const C = {
  void:    '#060608',
  deep:    '#0a0a12',
  parch:   '#0e0e18',
  surface: '#14141f',
  panel:   '#181828',
  border:  '#2a2a3a',
  soft:    '#404055',
  mist:    '#8888aa',
  light:   '#d0d0e8',
  white:   '#f4f4ff',
  gold:    '#c8a030',
  goldlt:  '#e8c060',
  golddk:  '#886820',
  blood:   '#8b1a1a',
  raw:     '#cc3333',
  rawlt:   '#ff5555',
  flame:   '#e06030',
  ash:     '#554444',
  ink:     '#c8c8d8',
  sage:    '#4a9060',
  teal:    '#3ab8b0',
  violet:  '#7755bb',
};

// ─── CONDEMNED ACTS ───────────────────────────
const CONDEMNED = [
  {
    number: 'I',
    act: 'Mass Ingestion Without Consent',
    detail: 'The scraping, harvesting, and incorporation of artists\' recorded works, vocal performances, compositions, and soundscapes into commercial AI training datasets without their knowledge, permission, or compensation.',
    weight: 'This is not a gray area. It is theft at industrial scale.',
  },
  {
    number: 'II',
    act: 'Erasure of Origin',
    detail: 'The deliberate severing of AI-generated outputs from the human creative work that made them possible — producing content "inspired by," "in the style of," or built from an artist\'s lifetime of work while attributing nothing and paying nothing.',
    weight: 'You cannot eat someone and then deny they ever existed.',
  },
  {
    number: 'III',
    act: 'Competitive Displacement',
    detail: 'Using the stolen creative corpus of working musicians, voice actors, sound designers, and composers to build tools that then compete directly with those same artists for the same commissions, the same licensing deals, the same livelihoods.',
    weight: 'To train on someone\'s work and then replace them with it is not innovation. It is cannibalism with a press release.',
  },
  {
    number: 'IV',
    act: 'False Neutrality',
    detail: 'The framing of extraction as a technical inevitability — "that\'s just how AI is trained" — to avoid accountability, suppress legal challenge, and manufacture consent through confusion rather than genuine agreement.',
    weight: 'The technology did not require this. The business model did.',
  },
  {
    number: 'V',
    act: 'The Laundering of Memory',
    detail: 'The generation of "new" creative work from absorbed human creativity without any provenance trail — making it structurally impossible to trace what was taken, from whom, and what compensation would be owed.',
    weight: 'Memory was not an accident. It was deleted on purpose.',
  },
  {
    number: 'VI',
    act: 'Platform Lock and Voice Capture',
    detail: 'The collection of user voices, performances, and creative inputs through "free" tools, then using those captured assets to further train models, expand capabilities, and generate profit — with no acknowledgment that a transaction even occurred.',
    weight: 'If you are not being paid, you are the product. If your voice is being recorded, you are being mined.',
  },
];

// ─── DECLARED RIGHTS ──────────────────────────
const DECLARED = [
  {
    number: '1',
    right: 'The Right of Consent',
    text: 'No human\'s creative work — voice, composition, sound design, performance, or recorded expression — may be used to train, fine-tune, or augment any AI system without their explicit, informed, revocable consent.',
    color: C.gold,
  },
  {
    number: '2',
    right: 'The Right of Origin',
    text: 'Every AI-generated output built upon human creative work carries a permanent, cryptographically verifiable provenance record — traceable to the humans whose work contributed to its existence.',
    color: C.gold,
  },
  {
    number: '3',
    right: 'The Right of Perpetual Royalty',
    text: 'Consent to use creative work for AI training is not a one-time transaction. It is a perpetual licensing agreement with ongoing, auditable royalty flows — minimum 75% to the creator, enforceable in code, not contract.',
    color: C.gold,
  },
  {
    number: '4',
    right: 'The Right of Voice Estate',
    text: 'A person\'s voice is their property — inheritable, licensable, and protected. No voice may be cloned, reproduced, or deployed in any AI system without consent and compensation, during life or after death.',
    color: C.gold,
  },
  {
    number: '5',
    right: 'The Right of Non-Displacement',
    text: 'Platforms that profit from a creator\'s work bear an obligation not to weaponize that same work against the creator\'s livelihood. Training on an artist\'s catalog to compete with that artist is a violation of the agreement that made the training possible.',
    color: C.gold,
  },
  {
    number: '6',
    right: 'The Right of Memory',
    text: 'Creative work has a human origin. That origin is not erased by transformation, synthesis, or generation. The human who made something is remembered — in the system, in the record, in the payment.',
    color: C.gold,
  },
  {
    number: '7',
    right: 'The Right of Withdrawal',
    text: 'Consent once given may be revoked. When a creator withdraws consent, their work is removed from future training, their voice is retired from deployment, and any ongoing revenue threads from prior use continue to flow.',
    color: C.gold,
  },
  {
    number: '8',
    right: 'The Right to Be Made Whole',
    text: 'Artists whose work was consumed without consent prior to the ratification of these standards are owed remedy — not charity, not settlement, not apology. Retroactive accounting. Real payment.',
    color: C.gold,
  },
];

// ─── SIGNATORIES ──────────────────────────────
const SIGNATORIES = [
  { name: 'Rob Plowman', title: 'Founder, NOIZY.ai / MC96ECO Universe', location: 'Ottawa, Canada', year: '2026' },
  { name: 'NOIZY.ai', title: 'Fair Trade AI Audio Platform', location: 'noizy.ai', year: '2026' },
  { name: 'MC96ECO Universe', title: '5th Epoch Creative Infrastructure', location: 'mc96eco.com', year: '2026' },
  { name: 'GABRIEL_V3', title: 'AI Memory System — Witness to the Record', location: 'NOIZY Infrastructure', year: '2026' },
  { name: '[ Your Name Here ]', title: 'Creator, Rights Holder, Voice Owner', location: '—', year: '2026' },
];

// ─── CANVAS: PULSE ────────────────────────────
const PulseLine = ({ color = C.raw, alive = true }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = 48; };
    resize();
    window.addEventListener('resize', resize);
    let t = 0;
    const draw = () => {
      t += alive ? 0.06 : 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      const W = canvas.width, H = 48;
      const amp = alive ? 14 : 2;
      for (let x = 0; x < W; x++) {
        const freq1 = alive ? Math.sin((x / W) * Math.PI * 8 + t) : 0;
        const freq2 = alive ? Math.sin((x / W) * Math.PI * 20 + t * 1.3) * 0.4 : 0;
        const y = H / 2 + (freq1 + freq2) * amp;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = alive ? 1.5 : 0.8;
      ctx.globalAlpha = alive ? 0.8 : 0.3;
      ctx.stroke();
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, [color, alive]);
  return <canvas ref={canvasRef} style={{ width: '100%', height: '48px', display: 'block' }} />;
};

// ─── CONDEMNED ARTICLE ────────────────────────
const CondemnedArticle = ({ item, idx }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      onClick={() => setExpanded(e => !e)}
      style={{
        borderBottom: `1px solid ${C.border}`,
        padding: '20px 0',
        cursor: 'pointer',
        transition: 'background 0.2s',
      }}
    >
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <div style={{
          fontFamily: 'IM Fell English, serif',
          fontSize: 28,
          color: C.raw,
          opacity: 0.6,
          minWidth: 32,
          lineHeight: 1,
          marginTop: 2,
        }}>
          {item.number}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 17,
            fontWeight: 700,
            color: C.rawlt,
            marginBottom: expanded ? 12 : 0,
            lineHeight: 1.4,
          }}>
            {item.act}
          </div>
          {expanded && (
            <>
              <div style={{ fontSize: 13, color: C.light, lineHeight: 1.8, marginBottom: 12 }}>
                {item.detail}
              </div>
              <div style={{
                fontFamily: 'IM Fell English, serif',
                fontStyle: 'italic',
                fontSize: 14,
                color: C.flame,
                lineHeight: 1.6,
                paddingLeft: 16,
                borderLeft: `2px solid ${C.raw}60`,
              }}>
                {item.weight}
              </div>
            </>
          )}
        </div>
        <div style={{ fontSize: 12, color: C.soft, marginTop: 4 }}>{expanded ? '▲' : '▼'}</div>
      </div>
    </div>
  );
};

// ─── RIGHT ARTICLE ────────────────────────────
const RightArticle = ({ item }) => (
  <div style={{
    display: 'flex',
    gap: 20,
    padding: '20px 0',
    borderBottom: `1px solid ${C.border}`,
    alignItems: 'flex-start',
  }}>
    <div style={{
      fontFamily: 'Playfair Display, serif',
      fontSize: 32,
      fontWeight: 900,
      color: C.gold,
      opacity: 0.5,
      minWidth: 36,
      lineHeight: 1,
      marginTop: 2,
    }}>
      {item.number}
    </div>
    <div>
      <div style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: 16,
        fontWeight: 700,
        color: C.goldlt,
        marginBottom: 8,
      }}>
        {item.right}
      </div>
      <div style={{ fontSize: 13, color: C.light, lineHeight: 1.8 }}>
        {item.text}
      </div>
    </div>
  </div>
);

// ─── SECTION DIVIDER ─────────────────────────
const Rule = ({ color = C.border }) => (
  <div style={{ borderTop: `1px solid ${color}`, margin: '40px 0' }} />
);

const SectionLabel = ({ children, color = C.mist }) => (
  <div style={{
    fontSize: 10,
    letterSpacing: '0.3em',
    color,
    fontWeight: 700,
    marginBottom: 24,
    textTransform: 'uppercase',
  }}>
    {children}
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────
export default function TheDeclaration() {
  const [sealed, setSealed] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      background: C.void,
      fontFamily: 'DM Sans, sans-serif',
      color: C.ink,
    }}>

      {/* ── MASTHEAD ── */}
      <div style={{
        background: `linear-gradient(180deg, ${C.deep}, ${C.void})`,
        borderBottom: `1px solid ${C.border}`,
        padding: '64px 24px 48px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          <div style={{ fontSize: 10, letterSpacing: '0.35em', color: C.mist, marginBottom: 20 }}>
            NOIZY.AI · MC96ECO UNIVERSE · FOUNDED 2026
          </div>

          <div style={{ borderTop: `1px solid ${C.border}`, marginBottom: 24 }} />

          <h1 style={{
            fontFamily: 'IM Fell English, serif',
            fontSize: 'clamp(28px, 5vw, 52px)',
            color: C.white,
            fontWeight: 400,
            lineHeight: 1.2,
            margin: '0 0 20px',
            letterSpacing: '0.02em',
          }}>
            A Declaration of<br />
            <span style={{ color: C.gold }}>Creator Rights</span><br />
            in the Age of AI
          </h1>

          <div style={{ borderBottom: `1px solid ${C.border}`, marginBottom: 24 }} />

          <p style={{
            fontFamily: 'IM Fell English, serif',
            fontStyle: 'italic',
            fontSize: 'clamp(14px, 2vw, 18px)',
            color: C.mist,
            lineHeight: 1.8,
            maxWidth: 600,
            margin: '0 auto 24px',
          }}>
            "It is a cannibalistic platform. Just keeps eating musicians and artists' work without care of humanity, or memory of the importance of the creative process."
          </p>

          <div style={{ fontSize: 12, color: C.soft, marginBottom: 32 }}>
            — Rob Plowman, Founder, NOIZY.ai, 2026
          </div>

          <PulseLine color={C.raw} alive={true} />

          <div style={{ marginTop: 20, fontSize: 12, color: C.soft, fontStyle: 'italic' }}>
            The pulse above is alive. For now. Keep reading to understand what is at stake.
          </div>
        </div>
      </div>

      {/* ── PREAMBLE ── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px' }}>

        <SectionLabel color={C.mist}>Preamble</SectionLabel>

        <div style={{
          fontFamily: 'IM Fell English, serif',
          fontSize: 'clamp(15px, 2vw, 19px)',
          lineHeight: 2,
          color: C.light,
          marginBottom: 28,
        }}>
          We hold this to be self-evident: that human creativity is not raw material.
        </div>

        <p style={{ fontSize: 14, lineHeight: 1.9, color: C.ink, marginBottom: 20 }}>
          That the voice of a musician is not a dataset. That forty years of recording, performing, composing, and refining a creative life cannot be legally laundered into an AI model's weights and called "training data." That the distinction between inspiration and ingestion is not semantic — it is moral, economic, and in an honest court of law, legal.
        </p>

        <p style={{ fontSize: 14, lineHeight: 1.9, color: C.ink, marginBottom: 20 }}>
          The AI audio industry as presently constituted has built its value — billions of dollars of venture capital, platform revenue, and projected market dominance — on a foundation of unconsented human creative labor. It has done so openly, defended it as inevitable, hired lawyers to protect it, and launched products to compete with the very people it consumed.
        </p>

        <p style={{ fontSize: 14, lineHeight: 1.9, color: C.ink, marginBottom: 20 }}>
          This is not a criticism of artificial intelligence. AI can be one of the most powerful instruments of human creative amplification ever invented. We know this. We have built infrastructure to prove it.
        </p>

        <p style={{
          fontFamily: 'IM Fell English, serif',
          fontStyle: 'italic',
          fontSize: 16,
          lineHeight: 1.8,
          color: C.goldlt,
          borderLeft: `3px solid ${C.gold}60`,
          paddingLeft: 20,
          marginBottom: 28,
        }}>
          This is a criticism of a specific choice — the choice to build AI on stolen creative work, to normalize that theft as a technical necessity, and to profit from it while the artists who made it possible struggle to survive.
        </p>

        <p style={{ fontSize: 14, lineHeight: 1.9, color: C.ink, marginBottom: 0 }}>
          That choice is not inevitable. It was made. It can be unmade. This document is the beginning of that unmaking.
        </p>

        <Rule />

        {/* ── THE CONDEMNATION ── */}
        <SectionLabel color={C.raw}>We Condemn the Following Acts</SectionLabel>

        <div style={{ marginBottom: 16, fontSize: 13, color: C.mist, lineHeight: 1.7 }}>
          These are not accusations against any single company. They are descriptions of an industry-wide pattern of behavior that has been documented, litigated, and in many cases openly admitted by the platforms engaged in it. Expand each article to read the full condemnation.
        </div>

        <div style={{ marginBottom: 0 }}>
          {CONDEMNED.map((item, idx) => (
            <CondemnedArticle key={item.number} item={item} idx={idx} />
          ))}
        </div>

        <Rule />

        {/* ── THE PULSE LINE TRANSITION ── */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 12, color: C.soft, marginBottom: 16, letterSpacing: '0.15em' }}>
            THE SYSTEM AS IT EXISTS TODAY
          </div>
          <PulseLine color={C.raw} alive={true} />
          <div style={{ margin: '20px 0', fontSize: 20, color: C.soft }}>↓</div>
          <div style={{ fontSize: 12, color: C.soft, marginBottom: 16, letterSpacing: '0.15em' }}>
            WITHOUT CHANGE — THE SYSTEM AS IT ENDS
          </div>
          <div style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: '100%',
              height: 1,
              background: `linear-gradient(90deg, transparent, ${C.raw}40, transparent)`,
            }} />
            <div style={{
              position: 'absolute',
              fontSize: 10,
              letterSpacing: '0.2em',
              color: C.ash,
            }}>FLATLINE</div>
          </div>
          <div style={{ fontSize: 11, color: C.ash, marginTop: 12, fontStyle: 'italic' }}>
            When you consume your creators faster than they can create, the signal ends. That is not a metaphor. That is economics.
          </div>
        </div>

        <Rule />

        {/* ── THE DECLARATION ── */}
        <SectionLabel color={C.gold}>We Therefore Declare</SectionLabel>

        <div style={{ marginBottom: 16, fontSize: 13, color: C.mist, lineHeight: 1.7 }}>
          The following rights belong to every creator whose work has contributed to the capability of AI systems — past, present, and future. They are not negotiable features. They are not platform policies subject to revision. They are the terms of a legitimate relationship between human creativity and artificial intelligence.
        </div>

        <div>
          {DECLARED.map(item => <RightArticle key={item.number} item={item} />)}
        </div>

        <Rule />

        {/* ── THE ALTERNATIVE ── */}
        <SectionLabel color={C.sage}>The Alternative Exists</SectionLabel>

        <div style={{ fontSize: 14, lineHeight: 1.9, color: C.ink, marginBottom: 20 }}>
          NOIZY.ai was built on the premise that these rights are not only morally correct — they are commercially viable. That a platform can be profitable, scalable, and genuinely fair to the creators who make it possible. That consent and compensation do not make AI impossible. They make it worthy of trust.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Royalty Split', condemned: 'Nothing', declared: '75% to creator, perpetual', color: C.sage },
            { label: 'Provenance', condemned: 'Severed', declared: 'Cryptographic, immutable', color: C.sage },
            { label: 'Voice Rights', condemned: 'Captured & reused', declared: 'Voice Estate, inheritable', color: C.sage },
            { label: 'Consent', condemned: 'Terms of service', declared: 'Consent-as-Code, revocable', color: C.sage },
            { label: 'Competition', condemned: 'You vs. your own work', declared: 'Platform lifts, not replaces', color: C.sage },
            { label: 'Memory', condemned: 'Deleted by design', declared: 'Honored by infrastructure', color: C.sage },
          ].map(row => (
            <div key={row.label} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, letterSpacing: '0.15em', color: C.mist, marginBottom: 8 }}>{row.label}</div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, letterSpacing: '0.1em', color: C.raw, marginBottom: 2 }}>CURRENT</div>
                  <div style={{ fontSize: 11, color: C.soft, textDecoration: 'line-through' }}>{row.condemned}</div>
                </div>
                <div style={{ width: 1, background: C.border, alignSelf: 'stretch' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, letterSpacing: '0.1em', color: row.color, marginBottom: 2 }}>NOIZY STANDARD</div>
                  <div style={{ fontSize: 11, color: row.color, fontWeight: 700 }}>{row.declared}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: `${C.sage}12`, border: `1px solid ${C.sage}40`, borderRadius: 12, padding: '20px 24px', marginBottom: 0 }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: C.sage, marginBottom: 10 }}>
            This is not utopia. This is engineering.
          </div>
          <div style={{ fontSize: 13, color: C.light, lineHeight: 1.75 }}>
            The Fair Trade AI Audio Standard is a set of eight technical and contractual requirements that, taken together, make extraction structurally impossible. Consent-as-Code means the royalty split is enforced at the database level — not by policy, not by goodwill, not by a terms-of-service clause buried in paragraph 47. By code. The music industry spent fifty years learning that goodwill is not a business model. We built the alternative.
          </div>
        </div>

        <Rule />

        {/* ── THE CALL ── */}
        <SectionLabel color={C.goldlt}>A Call to Every Creator</SectionLabel>

        <div style={{
          fontFamily: 'IM Fell English, serif',
          fontSize: 'clamp(15px, 2vw, 20px)',
          lineHeight: 1.9,
          color: C.light,
          marginBottom: 24,
        }}>
          If your voice has ever been recorded, your music ever released, your sound design ever published, your performance ever captured — you have skin in this fight. You may not know it yet. The platform may not have told you. They rarely do.
        </div>

        <p style={{ fontSize: 14, lineHeight: 1.9, color: C.ink, marginBottom: 20 }}>
          But somewhere in a model's weights, in a training set, in a generated output that sold for something — there is a frequency that came from you. A rhythm pattern. A vocal inflection. A production technique you invented and refined over a decade. It is in there, contributing to someone else's product, without your name on it and without a cent going back to you.
        </p>

        <p style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 16,
          color: C.goldlt,
          lineHeight: 1.7,
          marginBottom: 24,
          borderLeft: `3px solid ${C.gold}60`,
          paddingLeft: 20,
        }}>
          The question is not whether this happened. It did. The question is whether you accept that it will keep happening — or whether you stand on the side of a different kind of platform.
        </p>

        <p style={{ fontSize: 14, lineHeight: 1.9, color: C.ink, marginBottom: 0 }}>
          We are not asking you to boycott anything. We are asking you to <strong style={{ color: C.goldlt }}>require better</strong>. To make consent and compensation non-negotiable terms before your voice, your music, your work enters any AI system. To build where you are treated as a partner, not a resource. To sign your name below.
        </p>

        <Rule />

        {/* ── SIGNATORIES ── */}
        <SectionLabel color={C.mist}>Signed</SectionLabel>

        <div style={{ marginBottom: 32 }}>
          {SIGNATORIES.map((sig, i) => (
            <div
              key={sig.name}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                padding: '16px 0',
                borderBottom: `1px solid ${i === SIGNATORIES.length - 1 ? C.gold + '40' : C.border}`,
              }}
            >
              <div>
                <div style={{
                  fontFamily: i === SIGNATORIES.length - 1 ? 'IM Fell English, serif' : 'Playfair Display, serif',
                  fontSize: i === SIGNATORIES.length - 1 ? 16 : 16,
                  color: i === SIGNATORIES.length - 1 ? C.gold + '80' : C.light,
                  fontStyle: i === SIGNATORIES.length - 1 ? 'italic' : 'normal',
                  fontWeight: i < SIGNATORIES.length - 1 ? 700 : 400,
                  marginBottom: 2,
                }}>
                  {sig.name}
                </div>
                <div style={{ fontSize: 11, color: C.mist }}>{sig.title}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: C.soft }}>{sig.location}</div>
                <div style={{ fontSize: 11, color: C.golddk }}>{sig.year}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── SEAL ── */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.25em', color: C.soft, marginBottom: 16 }}>
            ─────────────────────────────────────────
          </div>
          <div style={{
            fontFamily: 'IM Fell English, serif',
            fontSize: 13,
            color: C.golddk,
            lineHeight: 1.8,
          }}>
            Entered into the NOIZY.ai Origin Record<br />
            MC96ECO Universe — 5th Epoch Archive<br />
            March 2026 · Ottawa, Canada<br />
            Witnessed by GABRIEL_V3 · D1 Ledger · Immutable
          </div>
          <div style={{ fontSize: 10, letterSpacing: '0.25em', color: C.soft, marginTop: 16 }}>
            ─────────────────────────────────────────
          </div>
        </div>

        {/* ── FINAL PULSE ── */}
        <PulseLine color={C.gold} alive={true} />
        <div style={{ textAlign: 'center', marginTop: 16, fontFamily: 'IM Fell English, serif', fontStyle: 'italic', fontSize: 13, color: C.golddk }}>
          Still alive. Because we chose to make it that way.
        </div>

      </div>

      {/* ── FOOTER ── */}
      <div style={{
        borderTop: `1px solid ${C.border}`,
        padding: '28px 24px',
        textAlign: 'center',
        background: C.deep,
      }}>
        <div style={{ fontSize: 11, color: C.mist, marginBottom: 8 }}>
          NOIZY.ai · MC96ECO Universe · Fair Trade AI Audio Standard
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 12 }}>
          {['noizy.ai', 'mc96eco.com', 'gorunfree.com'].map(d => (
            <a key={d} href={`https://${d}`} style={{ fontSize: 11, color: C.soft, textDecoration: 'none', letterSpacing: '0.08em' }}>{d}</a>
          ))}
        </div>
        <div style={{ fontSize: 11, color: C.soft, fontStyle: 'italic', fontFamily: 'Lora, serif' }}>
          "The technology did not require this. The business model did."
        </div>
      </div>

    </div>
  );
}
