import React, { useState, useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────
// THE CRACKS
// "FIND ALL THE WAYS TO CHANGE & FIX — WHERE ARE THE CRACKS?"
//  — Rob Plowman, 2026
//
// A strategic map of every legal, economic, cultural, and
// technical vulnerability in the extractive AI platform model.
// Where the pressure goes. Where the walls are thin.
// Where we walk through.
// ─────────────────────────────────────────────────────────────

const C = {
  void:    '#06060c',
  deep:    '#0a0a14',
  chamber: '#0e0e1a',
  panel:   '#141420',
  border:  '#24243a',
  soft:    '#3a3a55',
  mist:    '#7a7a99',
  light:   '#d0d0e8',
  white:   '#f2f2ff',
  gold:    '#d4a843',
  goldlt:  '#f0c060',
  golddk:  '#886820',
  crack:   '#ff6030',
  cracklt: '#ff8855',
  crackdk: '#992a10',
  legal:   '#3399cc',
  legallt: '#66bbee',
  econ:    '#44aa66',
  econlt:  '#66cc88',
  cult:    '#aa55cc',
  cultlt:  '#cc88ee',
  tech:    '#33bbaa',
  techlt:  '#55ddcc',
  labor:   '#cc8833',
  laborlt: '#eeaa55',
};

// ─── CRACK CATEGORIES ─────────────────────────
const CATEGORIES = [
  { id: 'legal',  label: 'Legal Exposure',       icon: '⚖',  color: C.legal,  lightColor: C.legallt,  count: 7 },
  { id: 'econ',   label: 'Economic Fragility',   icon: '◈',  color: C.econ,   lightColor: C.econlt,   count: 5 },
  { id: 'cult',   label: 'Cultural Pressure',    icon: '◉',  color: C.cult,   lightColor: C.cultlt,   count: 6 },
  { id: 'tech',   label: 'Technical Weakness',   icon: '⬡',  color: C.tech,   lightColor: C.techlt,   count: 4 },
  { id: 'labor',  label: 'Labor Mobilization',   icon: '✦',  color: C.labor,  lightColor: C.laborlt,  count: 5 },
];

// ─── THE CRACKS ───────────────────────────────
const CRACKS = [

  // ── LEGAL ──────────────────────────────────
  {
    id: 1, category: 'legal',
    title: 'Copyright Subsists in Training Data',
    severity: 'critical',
    status: 'Active litigation',
    detail: 'The core legal argument has never been definitively settled. The "fair use" defense that AI companies rely on has not been tested at the Supreme Court level for generative AI. Multiple active cases — Andersen v. Stability AI, UMG v. Suno, RIAA v. Udio — are building the precedent record right now. The outcome of even one major ruling could expose every AI audio platform to retroactive liability for the entire training corpus.',
    pressure_point: 'File amicus briefs. Fund the plaintiffs. Publicize every discovery document.',
    our_move: 'NOIZY has no exposure here. We do not train on unconsented work. This crack destroys our competitors, not us.',
    timeline: '2026–2028',
  },
  {
    id: 2, category: 'legal',
    title: 'The Right of Publicity — Voice Cloning',
    severity: 'critical',
    status: 'Legislation advancing',
    detail: 'The NO FAKES Act (federal) and state-level right of publicity laws are specifically targeting unauthorized voice and likeness replication. Platforms that have already ingested and are commercially deploying voice models are directly in the crosshairs. The legal standard for "likeness" is being extended to encompass vocal signature, not just face. This is a direct kill shot at ElevenLabs, Respeecher, and every platform with a voice cloning product built on unconsented data.',
    pressure_point: 'Support the NO FAKES Act publicly. Demand every platform disclose whose voices are in their models.',
    our_move: 'The NOIZY Voice Estate Framework already implements the standard this law is moving toward. We comply before compliance is required.',
    timeline: '2026–2027',
  },
  {
    id: 3, category: 'legal',
    title: 'Class Action Surface Area',
    severity: 'high',
    status: 'Organizing',
    detail: 'A single class action representing all musicians whose work was scraped without consent would be the largest IP case in history. The class is potentially millions of people globally. Opt-out rates will be low because the damages per person may be small, but aggregate damages could be civilizationally significant. The discovery process alone — forcing platforms to disclose the full contents of their training sets — would be devastating to the "we can\'t tell you what\'s in there" defense.',
    pressure_point: 'Help organize the class. Provide infrastructure for creators to document their works and assert their membership.',
    our_move: 'NOIZY\'s consent ledger (D1) is the proof of a different model and is admissible evidence that ethical compliance was possible.',
    timeline: '2027–2030',
  },
  {
    id: 4, category: 'legal',
    title: 'EU AI Act — Disclosure Requirements',
    severity: 'high',
    status: 'In force 2026',
    detail: 'The EU AI Act requires high-risk AI systems to disclose training data composition. The definition of "high-risk" is being applied broadly to generative AI. Platforms operating in Europe (which is all major platforms) must now disclose what is in their training sets. This creates a discovery mechanism that doesn\'t require litigation. A formal EU complaint costs nothing to file and forces disclosure.',
    pressure_point: 'File EU AI Act complaints on behalf of European artists. Get NOAH, IMPALA, and the featured artists coalitions to do the same.',
    our_move: 'NOIZY is EU AI Act compliant by design. Our consent ledger is the disclosure document the law requires.',
    timeline: '2026',
  },
  {
    id: 5, category: 'legal',
    title: 'Terms of Service Retroactive Weaponization',
    severity: 'high',
    status: 'Exploitable now',
    detail: 'Many AI platforms changed their terms of service after launch to claim broader rights to user-submitted content and outputs. In numerous jurisdictions, retroactive terms changes are legally unenforceable against prior users. Any platform that changed its terms to claim rights to training on user content after those users had already uploaded material has a retroactive exposure on every piece of content uploaded before the change.',
    pressure_point: 'Document and archive original terms of service. File in every jurisdiction where retroactive ToS changes are prohibited.',
    our_move: 'NOIZY terms have not changed since launch. The consent is recorded. We can prove what people agreed to and when.',
    timeline: '2026–2027',
  },
  {
    id: 6, category: 'legal',
    title: 'GDPR / CCPA — Biometric Data Classification',
    severity: 'medium',
    status: 'Building',
    detail: 'Vocal data is increasingly being classified as biometric data under GDPR and CCPA. Biometric data has the highest protection class — explicit consent required, right to deletion enforceable, cross-border transfer restricted. Any platform processing European or California users\' voices without explicit biometric consent has a direct regulatory violation.',
    pressure_point: 'File GDPR biometric data complaints with EU DPAs on behalf of artists whose voices appear in training sets.',
    our_move: 'Every voice in NOIZY carries explicit biometric consent documentation. Deletion requests trigger full retirement protocol.',
    timeline: '2026–2027',
  },
  {
    id: 7, category: 'legal',
    title: 'Moral Rights — European and Commonwealth Jurisdictions',
    severity: 'medium',
    status: 'Underutilized',
    detail: 'Moral rights (droit moral) in France, Germany, the UK, and Canada cannot be contractually waived. They include the right of integrity — the right to object to derogatory treatment of a work. Using a composer\'s work to train a model that produces outputs that undercut their artistic value or are used in contexts they would find objectionable is a colorable moral rights violation. This weapon has barely been used in AI litigation.',
    pressure_point: 'French and German artist associations should lead. File moral rights claims in Paris and Berlin. The law is favorable.',
    our_move: 'NOIZY\'s Canadian base (Ottawa) is a moral rights jurisdiction. We are already operating within a framework that respects this.',
    timeline: '2027–2029',
  },

  // ── ECONOMIC ────────────────────────────────
  {
    id: 8, category: 'econ',
    title: 'The Training Data Debt',
    severity: 'critical',
    status: 'Accumulating',
    detail: 'AI companies have front-loaded their value creation by using training data that they did not pay for. If they are ever required to pay for it retroactively — even at pennies per work — the aggregate cost across millions of compositions, recordings, and performances would exceed the total venture capital invested in most of these companies. Their balance sheets assume a zero cost basis for training data. That assumption is legally contestable.',
    pressure_point: 'Quantify the training data debt publicly. Force investors to acknowledge it as a contingent liability. SEC disclosure rules may require it.',
    our_move: 'NOIZY paid for its training data. Our cost basis is real. Our competitors\' is a legal fiction.',
    timeline: '2026–2028',
  },
  {
    id: 9, category: 'econ',
    title: 'Creator Exodus as Product Degradation',
    severity: 'high',
    status: 'Beginning',
    detail: 'The best creators are leaving extractive platforms. As they leave, the quality of new training data declines. Models trained on AI-generated AI content (model collapse) produce increasingly degraded outputs. Extractive platforms are in a race against their own parasitism — they need continuous fresh creative input from humans, but they\'re building the conditions that drive humans away. This is a slow-motion quality crisis.',
    pressure_point: 'Actively recruit the best creators to NOIZY. Every great creator who moves is both a NOIZY asset and a competitive platform degradation.',
    our_move: 'NOIZY creates the conditions where great creators stay. The flywheel is inverse: the better the creator community, the better the platform.',
    timeline: '2027–2030',
  },
  {
    id: 10, category: 'econ',
    title: 'Institutional Licensing Leverage',
    severity: 'high',
    status: 'Organizing',
    detail: 'The major music labels (Universal, Sony, Warner) collectively represent the most commercially valuable recorded music catalog on earth. They are in direct negotiations with AI platforms right now. When the labels move — licensing deals, withholding catalogs, or demanding structural changes — the market resets. The labels\' interests and the independent creator\'s interests are aligned on this one issue: the training data should be paid for.',
    pressure_point: 'Make NOIZY\'s Fair Trade Standard the proposed industry model in label negotiations. Offer to be the implementation vehicle for any label that wants to license into AI properly.',
    our_move: 'NOIZY is positioned to be the ethical licensing layer that major labels can trust. We\'ve already built the infrastructure they would require.',
    timeline: '2026–2027',
  },
  {
    id: 11, category: 'econ',
    title: 'Brand Safety and AI Association Risk',
    severity: 'medium',
    status: 'Growing',
    detail: 'Companies that license AI-generated music, voiceovers, or sound design are increasingly exposed to reputational risk when the source of that AI is found to have been trained on stolen work. A major brand caught using music that was generated by a model trained on unconsented work faces a PR crisis that dwarfs the cost of doing it ethically. Brand procurement departments are beginning to ask for provenance documentation they cannot get from extractive platforms.',
    pressure_point: 'Target brand procurement. NOIZY PROOF cryptographic provenance is the document they need. Make it a procurement requirement.',
    our_move: 'This is a direct market opening. Every Fortune 500 brand is a potential NOIZY B2B customer for this exact reason.',
    timeline: '2026–2027',
  },
  {
    id: 12, category: 'econ',
    title: 'The Subscription Ceiling Problem',
    severity: 'medium',
    status: 'Visible',
    detail: 'Extractive AI audio platforms are racing to capture market share with low-cost or free tiers, but their long-term unit economics require significant creator-side costs to be externalized. Once legal liability for training data materializes, their cost structure breaks. Platforms giving away AI audio generation at scale will be unable to absorb even a modest per-work licensing cost without restructuring their entire business model.',
    pressure_point: 'Document their unit economics publicly. When the cost comes due, the subscription model fails.',
    our_move: 'NOIZY\'s economics are built with creator costs included from day one. We are structurally more sustainable.',
    timeline: '2027–2029',
  },

  // ── CULTURAL ────────────────────────────────
  {
    id: 13, category: 'cult',
    title: 'The Musician\'s Union Infrastructure',
    severity: 'critical',
    status: 'Mobilizing',
    detail: 'AFM (American Federation of Musicians), the MU (UK), and SAG-AFTRA represent hundreds of thousands of creators with existing collective bargaining infrastructure, political leverage, and strike capability. The 2023 SAG-AFTRA strike demonstrated that AI provisions are now central to labor negotiations. The next round of union contracts in music will include AI provisions. Which side of those provisions NOIZY is on determines everything.',
    pressure_point: 'Approach AFM, MU, and SAG-AFTRA directly with NOIZY\'s Fair Trade Standard as a proposed AI annex for their next contracts. Be the platform that walked in first.',
    our_move: 'NOIZY should be the platform the unions recommend. That relationship needs to be built before the next contract cycle.',
    timeline: '2026–2027',
  },
  {
    id: 14, category: 'cult',
    title: 'The 100 Founding Creators Signal',
    severity: 'high',
    status: 'Our move',
    detail: 'When 100 well-known musicians and artists publicly declare their alignment with NOIZY\'s Fair Trade Standard and reject unconsented training — including their existing catalog — it creates a signal that is impossible to ignore. It is a public record of who is on which side. Journalists cover it. Fans follow it. Other creators calibrate against it.',
    pressure_point: 'Identify the 100. Find the ones with the most moral authority in their genre — the respected elder, the rising name, the legend who has nothing to lose. Start with three. Three becomes ten. Ten becomes a hundred.',
    our_move: 'The Wisdom Project already has the relationship model. Mike Nemesvary is one of the first hundred. Who is the second?',
    timeline: '2026',
  },
  {
    id: 15, category: 'cult',
    title: 'The Young Artist Retention War',
    severity: 'high',
    status: 'Now',
    detail: 'Artists aged 18–28 who are building their careers right now will make structural platform decisions that last decades. The platforms that capture them now — not as exploitable data sources but as genuine partners — win the next generation of catalog. Extractive platforms are competing for their training data. NOIZY is competing for their future.',
    pressure_point: 'Go into music schools, online communities, and emerging artist networks. The pitch is simple: "Would you rather build your career on a platform that owns your work or one where you own yours?"',
    our_move: 'Build the NOIZY young artist program. First year free. Full Fair Trade terms from day one. Lifetime record.',
    timeline: '2026',
  },
  {
    id: 16, category: 'cult',
    title: 'The Journalism Moment',
    severity: 'high',
    status: 'Ready',
    detail: 'The story of an individual artist — specific, named, with a specific work that was identifiably used in an AI training set without consent — is the story that breaks the mainstream. It has happened in visual art (Greg Rutkowski). It has not yet fully landed in music. When it does, the platform behind it will face a public reckoning. Every extractive platform is sitting on a time bomb of discoverable training data that includes the work of someone who will be willing to tell their story.',
    pressure_point: 'Find those artists. Help them tell the story. NOIZY doesn\'t need to be the journalist — we need to be the platform that exists after the story breaks.',
    our_move: 'Be positioned as the ethical alternative when journalists covering the story need a counterexample. "And then there\'s NOIZY.ai..."',
    timeline: '2026',
  },
  {
    id: 17, category: 'cult',
    title: 'The Grief Narrative',
    severity: 'medium',
    status: 'Untapped',
    detail: 'The story of what was lost — the sound designer who can no longer afford to work, the session musician whose commissions disappeared, the voice actor whose livelihood was copied and deployed without them — is not yet told with the weight it deserves. These are real people. Their economic devastation is measurable. When those stories are told with the emotional precision they deserve, the cultural conversation shifts.',
    pressure_point: 'Document the human cost. Make TheExtraction.jsx a real campaign. Find real people for each role.',
    our_move: 'The Wisdom Project is already the infrastructure for this. Capture the voices before they\'re gone.',
    timeline: '2026–2027',
  },
  {
    id: 18, category: 'cult',
    title: 'The Superfan Alliance',
    severity: 'medium',
    status: 'Buildable',
    detail: 'Music fans have demonstrated willingness to boycott, organize, and apply consumer pressure when their artists are treated unfairly (Spotify payouts, Ticketmaster, streaming rates). They have not yet organized around AI training theft, largely because they don\'t know it\'s happening. When they find out — when they understand that their favorite artist\'s voice was used to train a model that then competed with that artist — the fan response will be significant.',
    pressure_point: 'Educate the superfans. Not with outrage bait — with factual, documented explanation of what happened to the artists they love.',
    our_move: 'NOIZY fans are advocates. Build the fan-facing transparency layer that makes it easy to see what was done with their artists\' work.',
    timeline: '2027',
  },

  // ── TECHNICAL ───────────────────────────────
  {
    id: 19, category: 'tech',
    title: 'Model Inversion and Attribution Detection',
    severity: 'high',
    status: 'Research advancing',
    detail: 'Model inversion attacks — techniques that extract training data from AI models — are advancing rapidly in research. It is increasingly possible to demonstrate with statistical certainty that a specific copyrighted work is contained in a model\'s training set. This is not speculative. Tools are being built right now that can essentially "reach into" a model and find the fingerprints of specific works. When those tools are available at scale, every extractive platform faces retroactive discovery.',
    pressure_point: 'Fund and support model inversion research as applied to music and voice AI. The technical proof that enables legal remedy.',
    our_move: 'NOIZY is immune to this attack. Our model has no unconsented training data to be found. The audit would clear us.',
    timeline: '2026–2028',
  },
  {
    id: 20, category: 'tech',
    title: 'Audio Watermarking as Legal Evidence',
    severity: 'high',
    status: 'Operational',
    detail: 'NOIZY PROOF — built with Adam Robb / iPSS Inc. — embeds cryptographic provenance watermarks in audio outputs that survive compression, re-encoding, and mixing. This is already operational. The technical capability to prove that a NOIZY output was produced under Fair Trade conditions — and that a competitor\'s output was not — exists now. It is a legal and commercial differentiator that competitors cannot replicate without rebuilding their entire infrastructure.',
    pressure_point: 'Push for NOIZY PROOF to become an industry standard. Approach the Recording Academy, RIAA, and streaming platforms about requiring provenance watermarks.',
    our_move: 'We have the technology. Push to make it the requirement.',
    timeline: '2026',
  },
  {
    id: 21, category: 'tech',
    title: 'Model Collapse — The Quality Time Bomb',
    severity: 'medium',
    status: 'Scientific consensus',
    detail: 'Training AI models on AI-generated content causes measurable, progressive degradation of output quality. As extractive platforms poison the internet with generated audio and then scrape it back for the next training run, the quality spiral accelerates. This is not a theory — it is a documented phenomenon. Platforms that depend on fresh human creative input and have driven away their human creator base are training on their own waste.',
    pressure_point: 'Document and publish the quality degradation publicly. Every researcher who can quantify this should.',
    our_move: 'NOIZY\'s closed-consent pipeline ensures only human-origin, consented content enters training. We are structurally protected from model collapse.',
    timeline: '2027–2030',
  },
  {
    id: 22, category: 'tech',
    title: 'The Open Source Accountability Gap',
    severity: 'medium',
    status: 'Growing',
    detail: 'Open source audio AI models — many released with no training data disclosure — are being used by businesses that have no way to verify their legality. Any business using an open source model trained on unconsented data inherits the liability of that training. This gap between "free to use" and "legally safe to deploy commercially" is not understood by most businesses. When it is, demand for provenance-verified models increases dramatically.',
    pressure_point: 'Educate business buyers. The free model is not free if it exposes them to copyright litigation.',
    our_move: 'NOIZY\'s commercial offering is legally defensible in a way that no open source model can be. This is a direct enterprise sales argument.',
    timeline: '2026–2027',
  },

  // ── LABOR ───────────────────────────────────
  {
    id: 23, category: 'labor',
    title: 'The Collective Licensing Model',
    severity: 'critical',
    status: 'Buildable now',
    detail: 'PROs (ASCAP, BMI, SESAC, PRS, SOCAN) already have the infrastructure to collectively license music at scale. A new collective licensing mechanism — specifically for AI training rights — could be structured to distribute payments back to the affected class of creators automatically. If SOCAN (Canada) moves first, it creates a precedent that other PROs follow. Rob is in Ottawa. SOCAN is in Toronto.',
    pressure_point: 'Bring the Fair Trade AI Standard to SOCAN as the framework for a new AI Training Rights license. This is an actionable meeting that could be on the calendar.',
    our_move: 'NOIZY becomes the first platform to operate under a SOCAN AI Training Rights license. The infrastructure already exists to route the payments.',
    timeline: '2026',
  },
  {
    id: 24, category: 'labor',
    title: 'Independent Artist Organizing — The Long Tail',
    severity: 'high',
    status: 'Distributed',
    detail: 'Independent artists — the 99% who are not signed to major labels and not represented by unions — have no collective voice in the current legal and negotiation landscape. They are the ones most exposed to training data scraping, and they have the least institutional protection. An independent creator coalition with a clear platform of demands and a meaningful membership base (even 10,000 creators) changes the negotiating table.',
    pressure_point: 'Build the coalition. Not a petition — a membership organization with dues, governance, and the ability to negotiate collectively.',
    our_move: 'NOIZY can provide the consent ledger infrastructure for this coalition. Every member\'s rights are recorded. The coalition negotiates on their behalf.',
    timeline: '2026–2027',
  },
  {
    id: 25, category: 'labor',
    title: 'The Music Education Pipeline',
    severity: 'medium',
    status: 'Early',
    detail: 'Berklee, Musicians Institute, McNally Smith, and hundreds of music schools are training the next generation of creators right now. Those students will graduate into a world where their choices about which platforms they align with will have lifetime consequences. Curricula about AI, rights, and creator economics are underdeveloped. The platform that is taught as the ethical standard in music schools wins the long game.',
    pressure_point: 'Develop curriculum materials around the Fair Trade AI Standard. Offer to speak at and partner with music schools. Get on the syllabus.',
    our_move: 'NOIZY as case study in every music business program. This is a 5-year play that compounds.',
    timeline: '2027–2030',
  },
  {
    id: 26, category: 'labor',
    title: 'The International Dimension',
    severity: 'medium',
    status: 'Open',
    detail: 'While the US debates fair use, the EU is regulating. While Canada considers rights, South Korea, Japan, and Brazil have their own frameworks. Extractive platforms built for US legal permissiveness face a patchwork of international obligations that they are not structured to handle. The platform that builds compliance-first — with consent-as-code across jurisdictions — becomes the trusted global standard.',
    pressure_point: 'File in the most favorable jurisdictions first. Use international wins to establish the legal record.',
    our_move: 'NOIZY\'s infrastructure is jurisdiction-agnostic by design. The consent ledger records what rights were granted under which framework.',
    timeline: '2026–2028',
  },
  {
    id: 27, category: 'labor',
    title: 'The Remix Economy Rights Gap',
    severity: 'medium',
    status: 'Emerging',
    detail: 'AI-generated music that is "remixed," "inspired by," or derivative of specific artists is proliferating on streaming platforms. Streaming platforms are struggling to develop policies that distinguish between legitimate derivative works and platform-scale infringement. The rights gap here is massive — and it specifically harms the artists whose work is most recognizable and therefore most imitated.',
    pressure_point: 'Push Spotify, Apple Music, and YouTube Music to require provenance documentation for AI-generated content before monetization.',
    our_move: 'NOIZY PROOF is the technical solution they need. Every NOIZY output carries the documentation streaming platforms will eventually require.',
    timeline: '2026–2027',
  },
];

// ─── SEVERITY INDICATORS ──────────────────────
const SEVERITY = {
  critical: { label: 'CRITICAL', color: C.crack, bg: `${C.crack}20` },
  high:     { label: 'HIGH',     color: C.labor,  bg: `${C.labor}18` },
  medium:   { label: 'MEDIUM',   color: C.legal,  bg: `${C.legal}18` },
};

// ─── CRACK CARD ───────────────────────────────
const CrackCard = ({ crack, catColor, catLight }) => {
  const [open, setOpen] = useState(false);
  const sev = SEVERITY[crack.severity];
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          background: open ? `linear-gradient(135deg, ${catColor}15, ${C.chamber})` : C.panel,
          border: `1px solid ${open ? catColor + '70' : C.border}`,
          borderLeft: `4px solid ${open ? catColor : C.soft}`,
          borderRadius: open ? '8px 8px 0 0' : 8,
          padding: '14px 18px',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, paddingRight: 12 }}>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 14, color: open ? catLight : C.light, marginBottom: 4 }}>
              {crack.title}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', padding: '2px 8px', borderRadius: 12, background: sev.bg, color: sev.color }}>{sev.label}</span>
              <span style={{ fontSize: 10, color: C.mist }}>{crack.status}</span>
              <span style={{ fontSize: 10, color: C.soft }}>{crack.timeline}</span>
            </div>
          </div>
          <div style={{ fontSize: 14, color: open ? catColor : C.soft, transition: 'transform 0.3s', transform: open ? 'rotate(180deg)' : 'none' }}>▼</div>
        </div>
      </div>

      {open && (
        <div style={{
          background: `linear-gradient(180deg, ${catColor}08, ${C.deep})`,
          border: `1px solid ${catColor}40`,
          borderLeft: `4px solid ${catColor}`,
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          padding: '20px 22px',
        }}>
          <div style={{ fontSize: 13, color: C.light, lineHeight: 1.8, marginBottom: 20 }}>
            {crack.detail}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: `${C.crack}10`, border: `1px solid ${C.crack}30`, borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 9, letterSpacing: '0.18em', color: C.crack, marginBottom: 6, fontWeight: 700 }}>PRESSURE POINT</div>
              <div style={{ fontSize: 11, color: C.light, lineHeight: 1.65 }}>{crack.pressure_point}</div>
            </div>
            <div style={{ background: `${C.gold}10`, border: `1px solid ${C.gold}30`, borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 9, letterSpacing: '0.18em', color: C.gold, marginBottom: 6, fontWeight: 700 }}>OUR MOVE</div>
              <div style={{ fontSize: 11, color: C.light, lineHeight: 1.65 }}>{crack.our_move}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── CATEGORY TAB ─────────────────────────────
const CategoryTab = ({ cat, active, onClick }) => {
  const count = CRACKS.filter(c => c.category === cat.id).length;
  const critCount = CRACKS.filter(c => c.category === cat.id && c.severity === 'critical').length;
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? `linear-gradient(135deg, ${cat.color}25, ${cat.color}10)` : 'transparent',
        border: `1px solid ${active ? cat.color + '80' : C.border}`,
        borderRadius: 10,
        padding: '10px 14px',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
        transition: 'all 0.2s ease',
        marginBottom: 6,
        boxShadow: active ? `0 0 14px ${cat.color}20` : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 16, color: active ? cat.color : C.soft }}>{cat.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: active ? cat.color : C.mist }}>{cat.label}</div>
          <div style={{ fontSize: 10, color: C.soft, marginTop: 1 }}>{count} vulnerabilities{critCount > 0 ? ` · ${critCount} critical` : ''}</div>
        </div>
      </div>
    </button>
  );
};

// ─── OVERVIEW MAP ─────────────────────────────
const OverviewMap = ({ onSelect }) => (
  <div>
    <div style={{ marginBottom: 24, fontSize: 13, color: C.mist, lineHeight: 1.7 }}>
      The extractive AI platform model has 27 documented points of vulnerability across five domains. Every crack below is a place where the wall is thin — legally, economically, culturally, technically, and in terms of labor mobilization. Our job is not to attack blindly. It is to know exactly where to apply pressure.
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
      {[
        { label: 'Total Cracks', value: '27', color: C.crack },
        { label: 'Critical', value: CRACKS.filter(c => c.severity === 'critical').length.toString(), color: C.crack },
        { label: 'High', value: CRACKS.filter(c => c.severity === 'high').length.toString(), color: C.labor },
        { label: 'Active Now', value: CRACKS.filter(c => c.status.includes('Active') || c.status === 'Operational' || c.status === 'Now' || c.status === 'Mobilizing').length.toString(), color: C.econ },
        { label: 'Our Advantage', value: '27/27', color: C.gold },
        { label: 'Their Exposure', value: '∞', color: C.crack },
      ].map(s => (
        <div key={s.label} style={{ background: C.panel, border: `1px solid ${s.color}40`, borderRadius: 10, padding: '14px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
          <div style={{ fontSize: 10, letterSpacing: '0.12em', color: C.mist, marginTop: 4 }}>{s.label}</div>
        </div>
      ))}
    </div>
    <div style={{ background: `${C.crack}10`, border: `1px solid ${C.crack}30`, borderRadius: 12, padding: '20px 22px', marginBottom: 24 }}>
      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: C.cracklt, marginBottom: 10 }}>The Structural Reality</div>
      <div style={{ fontSize: 13, color: C.light, lineHeight: 1.8 }}>
        Extractive AI platforms are structurally exposed on every front simultaneously. Their legal strategy assumes current copyright law stays static — it won't. Their economic model assumes zero training data cost — the debt is coming due. Their cultural position assumes creators stay passive — they aren't. Their technical model assumes no attribution is possible — it increasingly is. Their labor strategy assumes no collective bargaining — unions are mobilizing.
        <br /><br />
        <strong style={{ color: C.cracklt }}>They built a fortress on sand. We built our foundation on consent. When the tide comes in, we are still standing.</strong>
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {CATEGORIES.map(cat => (
        <div
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          style={{ background: C.panel, border: `1px solid ${cat.color}40`, borderLeft: `4px solid ${cat.color}`, borderRadius: 8, padding: '16px 18px', cursor: 'pointer', transition: 'all 0.2s ease' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 18, color: cat.color }}>{cat.icon}</span>
            <span style={{ fontWeight: 700, fontSize: 13, color: cat.lightColor }}>{cat.label}</span>
          </div>
          <div style={{ fontSize: 11, color: C.mist }}>{CRACKS.filter(c => c.category === cat.id).length} vulnerabilities documented</div>
        </div>
      ))}
    </div>
  </div>
);

// ─── MAIN ─────────────────────────────────────
export default function TheCracks() {
  const [activeCategory, setActiveCategory] = useState('overview');
  const cat = CATEGORIES.find(c => c.id === activeCategory);
  const visibleCracks = CRACKS.filter(c => c.category === activeCategory);

  return (
    <div style={{ minHeight: '100vh', background: C.void, fontFamily: 'DM Sans, sans-serif', color: C.light }}>

      {/* HEADER */}
      <div style={{ background: `linear-gradient(180deg, ${C.deep}, ${C.void})`, borderBottom: `1px solid ${C.border}`, padding: '56px 24px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.3em', color: C.mist, marginBottom: 16 }}>NOIZY.AI · STRATEGIC INTELLIGENCE · 2026</div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(30px, 5vw, 52px)', fontWeight: 900, color: C.white, margin: '0 0 12px', lineHeight: 1.2 }}>
            The Cracks
          </h1>
          <h2 style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', fontSize: 'clamp(14px, 2vw, 20px)', color: C.mist, fontWeight: 400, margin: '0 0 16px', lineHeight: 1.5 }}>
            27 Documented Vulnerabilities in the Extractive AI Platform Model
          </h2>
          <p style={{ fontSize: 13, color: C.soft, lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
            Where the legal walls are thin. Where the economic model breaks. Where the culture turns. Where the technology betrays them. Where the labor organizes. Every crack is a door.
          </p>
        </div>
      </div>

      {/* LAYOUT */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, alignItems: 'start' }}>

          {/* SIDEBAR */}
          <div style={{ background: C.deep, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, position: 'sticky', top: 20 }}>
            <div style={{ fontSize: 9, letterSpacing: '0.18em', color: C.soft, marginBottom: 10, paddingLeft: 4 }}>DOMAINS</div>
            <button
              onClick={() => setActiveCategory('overview')}
              style={{ background: activeCategory === 'overview' ? `${C.crack}20` : 'transparent', border: `1px solid ${activeCategory === 'overview' ? C.crack + '80' : C.border}`, borderRadius: 10, padding: '10px 14px', cursor: 'pointer', width: '100%', textAlign: 'left', marginBottom: 6 }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: activeCategory === 'overview' ? C.cracklt : C.mist }}>⊕ Full Map</div>
              <div style={{ fontSize: 10, color: C.soft, marginTop: 1 }}>All 27 vulnerabilities</div>
            </button>
            {CATEGORIES.map(c => <CategoryTab key={c.id} cat={c} active={activeCategory === c.id} onClick={() => setActiveCategory(c.id)} />)}

            <div style={{ marginTop: 16, padding: '12px', background: C.chamber, borderRadius: 8, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 9, letterSpacing: '0.15em', color: C.mist, marginBottom: 6 }}>THEIR EXPOSURE</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: C.crack, fontWeight: 700 }}>27</div>
              <div style={{ fontSize: 9, color: C.soft }}>documented cracks</div>
              <div style={{ marginTop: 8, fontSize: 9, letterSpacing: '0.15em', color: C.mist, marginBottom: 4 }}>OUR EXPOSURE</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: C.gold, fontWeight: 700 }}>0</div>
              <div style={{ fontSize: 9, color: C.soft }}>we are not them</div>
            </div>
          </div>

          {/* CONTENT */}
          <div>
            {activeCategory === 'overview' && <OverviewMap onSelect={setActiveCategory} />}

            {cat && (
              <div>
                <div style={{ background: `linear-gradient(135deg, ${cat.color}15, ${C.deep})`, border: `1px solid ${cat.color}50`, borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: 24, color: cat.color }}>{cat.icon}</span>
                    <div>
                      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, color: cat.lightColor }}>{cat.label}</div>
                      <div style={{ fontSize: 11, color: C.mist }}>{visibleCracks.length} vulnerabilities · {visibleCracks.filter(c => c.severity === 'critical').length} critical</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: C.light, lineHeight: 1.7 }}>
                    Each vulnerability below has a documented pressure point and a specific NOIZY counter-position. Expand any card to read the full analysis.
                  </div>
                </div>

                {visibleCracks
                  .sort((a, b) => {
                    const order = { critical: 0, high: 1, medium: 2 };
                    return order[a.severity] - order[b.severity];
                  })
                  .map(crack => (
                    <CrackCard key={crack.id} crack={crack} catColor={cat.color} catLight={cat.lightColor} />
                  ))
                }
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: '28px 24px', textAlign: 'center', background: C.deep, marginTop: 60 }}>
        <div style={{ fontSize: 11, color: C.mist, marginBottom: 6 }}>NOIZY.ai · Strategic Intelligence Division · MC96ECO Universe</div>
        <div style={{ fontSize: 11, color: C.soft, fontStyle: 'italic', fontFamily: 'Lora, serif' }}>
          "They built a fortress on sand. We built our foundation on consent. When the tide comes in, we are still standing."
        </div>
      </div>

    </div>
  );
}
