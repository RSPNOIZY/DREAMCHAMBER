import React, { useState, useEffect, useRef } from 'react';

// ============================================================
// THE INTELLIGENCE — NOIZY.ai COMPETITIVE LANDSCAPE
// Real data. Real cases. Real money. Real gaps.
// Research compiled March 2026.
// ============================================================

const C = {
  void:    '#020208',
  deep:    '#06030e',
  panel:   '#090614',
  card:    '#0d091c',
  border:  '#141028',
  dim:     '#1c1840',

  red:     '#E84444',
  orange:  '#E8833A',
  gold:    '#D4A843',
  green:   '#44CC88',
  cyan:    '#4BA8D4',
  teal:    '#2ABFA0',
  violet:  '#7B4FD4',
  pink:    '#CC4488',
  steel:   '#7A9EBF',

  cream:   '#F5F0E8',
  ghost:   'rgba(255,255,255,0.05)',
};

// ============================================================
// THE LEGAL BATTLEFIELD
// ============================================================

const CASES = [
  {
    id: 'suno-labels',
    name: 'UMG/Sony/WMG + RIAA v. Suno',
    court: 'U.S. District Court, D. Massachusetts',
    filed: 'June 24, 2024',
    status: 'PARTIALLY SETTLED / SONY ONGOING',
    statusColor: C.orange,
    summary: 'All three major labels + RIAA sued Suno simultaneously for mass copyright infringement via AI training on copyrighted recordings.',
    outcomes: [
      'WMG + Suno: SETTLED November 2025. Opt-in mechanism for WMG artists. Monthly download caps. "Next-generation licensed AI music" partnership.',
      'UMG + Suno: Settlement terms not public as of March 2026.',
      'Sony + Suno: ONGOING. Sony is the sole major label still litigating.',
    ],
    noizy_signal: 'The settlements require opt-in consent infrastructure that does not yet exist at scale. WMG and Suno need what NOIZY is building.',
    noisy_urgency: 'CRITICAL',
  },
  {
    id: 'udio-labels',
    name: 'UMG/Sony/WMG + RIAA v. Udio',
    court: 'U.S. District Court, SDNY',
    filed: 'June 24, 2024',
    status: 'PARTIALLY SETTLED / SONY ONGOING',
    statusColor: C.orange,
    summary: 'Parallel lawsuit against Udio (Uncharted Labs) for same allegations as Suno.',
    outcomes: [
      'UMG + Udio: SETTLED October 2025. New licensed platform planned for 2026.',
      'WMG + Udio: SETTLED November 19, 2025. AI music platform deal signed for 2026 launch.',
      'Sony + Udio: ONGOING as of December 2025.',
    ],
    noizy_signal: 'Post-settlement Udio platform for 2026 will need "an approved corpus of data with clearly defined rights." This is infrastructure NOIZY can supply.',
    noisy_urgency: 'HIGH',
  },
  {
    id: 'vacker-elevenlabs',
    name: 'Vacker v. ElevenLabs',
    court: 'U.S. District Court (1:24-cv-00987)',
    filed: '2024',
    status: 'SETTLED August 23, 2025',
    statusColor: C.green,
    summary: 'Voice actors Karissa Vacker and Mark Boyett sued ElevenLabs claiming their audiobook narrations were used to create AI voices "Adam" and "Bella" without consent, violating DMCA anti-circumvention.',
    outcomes: [
      'First settlement in AI copyright litigation — reached after mediation.',
      'Terms not publicly disclosed.',
      'Established that voice actors have standing to sue for AI voice cloning.',
    ],
    noizy_signal: 'The Voice Estate framework NOIZY is building would have prevented this lawsuit entirely.',
    noisy_urgency: 'HIGH',
  },
  {
    id: 'bartz-anthropic',
    name: 'Bartz v. Anthropic (Authors Guild)',
    court: 'NDCA, Judge William Alsup',
    filed: '2023',
    status: 'SETTLED September 5, 2025',
    statusColor: C.green,
    summary: 'Class action alleging Anthropic downloaded millions of pirated books (LibGen, PiLiMi) to train Claude.',
    outcomes: [
      'SETTLEMENT: $1.5 BILLION — largest U.S. copyright settlement in history.',
      'Covers approximately 500,000 copyrighted works (~$3,000 per work).',
      'Preliminary approval: September 25, 2025 by Judge Alsup.',
      'Key ruling before settlement: piracy for AI training purposes is NOT fair use.',
    ],
    noizy_signal: '$1.5B settlement = the financial cost of NOT having consent infrastructure. This is NOIZY\'s market.',
    noisy_urgency: 'CRITICAL',
  },
  {
    id: 'koda-suno',
    name: 'Koda (Denmark) v. Suno',
    court: 'Copenhagen City Court',
    filed: 'November 4, 2025',
    status: 'ONGOING',
    statusColor: C.red,
    summary: 'Danish rights organization Koda filed the first Scandinavian AI music lawsuit. Evidence of similarity to works by Aqua, MØ, Christopher. Called "biggest theft in music history."',
    outcomes: [
      'HBS Economics commissioned report: AI-generated music could reduce Danish music industry revenue by 6.9 billion DKK (~$680M USD) from 2025–2030 without policy intervention.',
      'First non-US national rights organization to sue an AI music service directly.',
    ],
    noizy_signal: 'The international front is opening. CISAC (225 member organizations) is watching. NOIZY can be the global infrastructure answer.',
    noisy_urgency: 'HIGH',
  },
  {
    id: 'gema-openai',
    name: 'GEMA v. OpenAI (Munich)',
    court: 'Munich Regional Court (Germany)',
    filed: '2024',
    status: 'LANDMARK RULING November 2025',
    statusColor: C.gold,
    summary: 'German rights organization GEMA sued OpenAI. Munich court ruled November 2025 that OpenAI violated copyright law in both training and outputs.',
    outcomes: [
      'First major European court ruling finding AI training liable for copyright infringement.',
      'GEMA also had already launched the world\'s first AI licensing model for AI providers (Reeperbahn Festival, September 2024).',
      'GEMA\'s licensing model: creators receive compensation at training AND ongoing AI revenue — not just a one-time training fee.',
    ],
    noizy_signal: 'GEMA\'s model is close to NOIZY\'s. But it\'s a collective society model, not a creator-direct protocol. NOIZY can be the infrastructure GEMA routes through.',
    noisy_urgency: 'HIGH',
  },
  {
    id: 'arijit-india',
    name: 'Arijit Singh v. Codible Ventures (India)',
    court: 'Bombay High Court',
    filed: '2024',
    status: 'LANDMARK RULING 2024',
    statusColor: C.gold,
    summary: 'Bollywood singer sued Indian AI company for voice cloning without consent.',
    outcomes: [
      'Court ruled: singer\'s name, voice, photograph, likeness, vocal style, vocal technique, vocal arrangements, mannerisms, manner of singing, and signature are ALL protected personality rights.',
      'First Indian judgment addressing misuse of generative AI in music.',
      'International precedent for personality rights in the AI age.',
    ],
    noizy_signal: 'Voice Estate IP framework is being validated by courts globally. What the courts are enforcing, NOIZY automates.',
    noisy_urgency: 'MEDIUM',
  },
];

// ============================================================
// LEGISLATION TRACKER
// ============================================================

const LEGISLATION = [
  {
    name: 'Tennessee ELVIS Act',
    jurisdiction: 'Tennessee, USA',
    status: 'ENACTED — LAW',
    statusColor: C.green,
    date: 'Signed March 21, 2024. Effective July 1, 2024.',
    what: 'Adds "voice" to Tennessee\'s existing personality rights statute. First U.S. law specifically protecting musicians\' voices from AI impersonation. Civil AND criminal penalties.',
    vote: 'Passed unanimously: 93-0 House, 30-0 Senate.',
    noizy: 'Tennessee model is now being used as national template. ELVIS Act validates Voice Estate as a legal category.',
    color: C.green,
  },
  {
    name: 'New York Digital Replicas Law',
    jurisdiction: 'New York, USA',
    status: 'ENACTED — LAW',
    statusColor: C.green,
    date: 'Signed December 13, 2024. Effective January 1, 2025.',
    what: 'Protects performing artists\' digital replicas. Court confirmed applicability to AI-generated voice clones (Lehrman v. Lovo).',
    noizy: 'New York + Tennessee = two of the most important entertainment markets in the world now have Voice Estate laws. Federal law (No FAKES) is next.',
    color: C.green,
  },
  {
    name: 'No FAKES Act (H.R.2794)',
    jurisdiction: 'Federal USA (119th Congress)',
    status: 'IN COMMITTEE — BIPARTISAN',
    statusColor: C.gold,
    date: 'Reintroduced April 2025. In committee as of March 2026.',
    what: 'Creates federal "digital replication right" — a right of publicity covering voice and visual likeness in AI-generated replicas. Holds companies liable for producing, hosting, or sharing digital replicas without consent.',
    sponsors: 'Senators Coons (D-DE), Blackburn (R-TN), Klobuchar (D-MN), Tillis (R-NC). SAG-AFTRA endorsement.',
    noizy: 'No FAKES passage would make Voice Estate registration legally mandatory — NOIZY becomes the required infrastructure overnight.',
    color: C.gold,
  },
  {
    name: 'EU AI Act — Article 53 (GPAI)',
    jurisdiction: 'European Union',
    status: 'IN FORCE — August 2, 2025',
    statusColor: C.green,
    date: 'Entered into force August 2024. Article 53 requirements active from August 2, 2025.',
    what: 'GPAI providers must: (1) comply with EU copyright opt-out provisions, (2) publish "sufficiently detailed summary" of all copyrighted works used in training. Extraterritorial reach — applies to any model placed on EU market regardless of where training occurred.',
    noizy: 'The EU now requires training data documentation. NOIZY PROOF + consent ledger is the technical implementation of Article 53. EU market = 450M people.',
    color: C.cyan,
  },
  {
    name: 'EU Parliament — March 10, 2026 Vote',
    jurisdiction: 'European Union',
    status: 'RESOLUTION PASSED',
    statusColor: C.gold,
    date: 'March 10, 2026',
    what: 'EU Parliament voted to urge new rules specifically protecting creative works from AI training — signaling the current opt-out framework may be replaced with opt-IN.',
    noizy: 'Europe is moving toward opt-IN. That makes NOIZY\'s consent-first architecture the coming legal requirement in the world\'s largest market.',
    color: C.gold,
  },
  {
    name: 'Canada Bill C-27 / AIDA',
    jurisdiction: 'Canada',
    status: 'DEAD — Parliament Prorogued',
    statusColor: C.red,
    date: 'Parliament prorogued January 6, 2025. Bill died on Order Paper.',
    what: 'The Artificial Intelligence and Data Act (AIDA) is permanently off the table. "Light, tight, right" approach from Minister Solomon going forward.',
    noizy: 'Canada has NO AI legislation. 1,000+ creator submissions demanded protection. This is a regulatory vacuum NOIZY can help fill — Ottawa is home turf.',
    color: C.orange,
  },
  {
    name: 'UK AI Training Copyright Consultation',
    jurisdiction: 'United Kingdom',
    status: 'POLITICALLY EMBATTLED',
    statusColor: C.orange,
    date: 'Consultation closed February 25, 2025. Impact assessment due March 18, 2026.',
    what: 'UK proposed EU-style opt-out model. Only 3% of respondents supported it. Over 1,000 artists recorded a silent album in protest calling it "legalization of music theft."',
    noizy: 'UK creators are activated and angry. NOIZY\'s consent-first model is exactly what 97% of UK respondents asked for.',
    color: C.orange,
  },
];

// ============================================================
// COMPETITOR INTELLIGENCE
// ============================================================

const COMPETITORS = [
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    category: 'AI Voice',
    valuation: '$11B',
    raised: '$791M total',
    round: 'Series D: $500M — February 4, 2026',
    investors: 'a16z, ICONIQ, Sequoia, NEA, Deutsche Telekom, LG Tech, NTT DOCOMO',
    revenue: 'Not public (eyeing IPO)',
    color: C.red,
    consent_model: 'Voice Library opt-in with Financial Rewards program (not the default). Fixed-term contracts for professional voices.',
    weakness: 'Default royalty sharing is off. Users must enable Financial Rewards. ToS controversy 2025 over how broadly ElevenLabs could use shared voice models.',
    settlement: 'Vacker v. ElevenLabs: settled August 2025. First AI copyright settlement in history. Terms undisclosed.',
    noizy_gap: '75/25 perpetual split coded as infrastructure, not opt-in. No buyout clauses. Voice Estate as inheritable asset (not a platform upload).',
  },
  {
    id: 'suno',
    name: 'Suno AI',
    category: 'AI Music Generation',
    valuation: '$2.45B',
    raised: '$375M total',
    round: 'Series C: $250M — November 2025',
    investors: 'Menlo Ventures (lead), Nvidia NVentures, Lightspeed, Matrix, Hallwood Media',
    revenue: '$200M ARR (at Series C)',
    color: C.red,
    consent_model: 'Post-settlement: opt-in for WMG artists. Does NOT disclose training dataset. Free tier: Suno retains output rights. Paid tier: user owns outputs.',
    weakness: 'Sony lawsuit ONGOING. GEMA (Germany) lawsuit ONGOING. Koda (Denmark) lawsuit ONGOING. Training data opacity is core to all of these.',
    settlement: 'WMG settled Nov 2025. UMG settled. Sony: still fighting. 3 international lawsuits ongoing.',
    noizy_gap: 'NOIZY PROOF watermarking means provenance is visible, not hidden. Every training asset documented. Legally bulletproof vs. Suno\'s "don\'t ask, don\'t tell" approach.',
  },
  {
    id: 'replica',
    name: 'Replica Studios',
    category: 'AI Voice (SAG-AFTRA Partner)',
    valuation: 'Not public',
    raised: 'Undisclosed',
    round: 'SAG-AFTRA partnership January 2024 (CES)',
    investors: 'Not disclosed',
    revenue: 'Not public',
    color: C.teal,
    consent_model: 'GOLD STANDARD in the market: explicit per-use consent, 4-hour session fee per 300 lines, 3-year terms, re-consent required for extension, performers can opt out of new material.',
    weakness: 'Consent is contractual, not coded into infrastructure. Scope limited to interactive media/video games. Manual process per license.',
    settlement: 'No lawsuits. The SAG-AFTRA partnership is their moat.',
    noizy_gap: 'Replica does consent-as-contract. NOIZY does consent-as-code. Replica\'s model implemented at infrastructure scale = NOIZY. Potential partner, not adversary.',
  },
  {
    id: 'stim',
    name: 'STIM + Sureel + Songfox',
    category: 'World\'s First Collective AI Music License',
    valuation: 'N/A (collective society)',
    raised: 'N/A',
    round: 'Pilot launched September 2025',
    investors: 'N/A',
    revenue: 'N/A',
    color: C.cyan,
    consent_model: 'Opt-in only. Third-party attribution technology (Sureel) mandatory. Creators paid at three points: training, AI service use, and when AI-generated music is commercially used. "Upfront value" for training use + downstream revenue share.',
    weakness: 'Collective license model — individual creator control is limited. Geographic scope: Sweden/Scandinavia currently. Requires working through STIM membership.',
    settlement: 'No lawsuits — the clean model.',
    noizy_gap: 'STIM is the reference model closest to NOIZY. Key difference: STIM routes payments through a collective society. NOIZY routes payments directly to the creator, coded into the protocol. Global vs. regional.',
  },
  {
    id: 'adobe',
    name: 'Adobe Firefly',
    category: 'Ethical AI (Image/Video)',
    valuation: '$150B+ (Adobe market cap)',
    raised: 'Public company',
    round: 'Ongoing product line',
    investors: 'Public (ADBE)',
    revenue: '$5.4B annual (2024)',
    color: C.violet,
    consent_model: 'Licensed Adobe Stock + public domain only for training. Content Credentials ("nutrition label") via Content Authenticity Initiative (C2PA). Opt-out available for Style Reference and Structure Reference.',
    weakness: 'AI-generated images made it into Firefly training set because creators submitted them to Adobe Stock — Adobe acknowledged this. Credibility problem for the "ethical AI" claim.',
    settlement: 'No lawsuits currently.',
    noizy_gap: 'Adobe does provenance for images/video. AUDIO provenance is underserved. NOIZY PROOF is the Firefly/C2PA equivalent for audio — a major gap Adobe hasn\'t filled.',
  },
  {
    id: 'shutterstock-getty',
    name: 'Shutterstock + Getty (Merged Jan 2025)',
    category: 'Licensed Training Data Provider',
    valuation: '$3.7B (merger valuation)',
    raised: 'Public companies',
    round: 'Merger January 2025',
    investors: 'Public',
    revenue: 'Getty: $900M+ (2024). Shutterstock AI licensing: $104M (2023), growing.',
    color: C.gold,
    consent_model: 'Contributors paid royalties when content used in AI training. Shutterstock-OpenAI deal: up to $250M by 2027. Getty-NVIDIA deal: licensed creative content for AI training with contributor compensation.',
    weakness: 'Stock contributor model — not direct creator relationship. Image/video focused, not audio. Consent was through contributor license agreements, not specific AI-use consent.',
    settlement: 'Getty v. Stability AI UK: Getty LOST November 2025 (secondary copyright claim dismissed). US case ongoing.',
    noizy_gap: 'Shutterstock/Getty prove the licensed training data market is worth hundreds of millions. THE_AQUARIUM (34TB, Fish Music Inc.) is a licensed catalog ready for this market. NOIZY is the audio equivalent.',
  },
];

// ============================================================
// REFERENCE MODELS (closest to what NOIZY is building)
// ============================================================

const REFERENCE_MODELS = [
  {
    name: 'STIM + Sureel + Songfox',
    date: 'September 2025',
    desc: 'Sweden\'s STIM launched the world\'s first collective AI music license. Opt-in only. Mandatory third-party attribution technology (Sureel). Creators paid at three points: training, ongoing AI service use, and commercial output use.',
    what_noizy_does_better: 'STIM is a collective society — individual creator control is diluted. NOIZY pays creators DIRECTLY through the consent ledger, 75/25, coded as protocol. STIM routes through STIM. NOIZY routes through nobody.',
    color: C.cyan,
    icon: '🇸🇪',
  },
  {
    name: 'Replica Studios + SAG-AFTRA',
    date: 'January 2024 (CES)',
    desc: 'Most detailed consent-as-contract model in the market. Explicit consent per use, 4-hour session fee per 300 lines, 3-year terms with required re-consent, performers can opt out of new material generation.',
    what_noizy_does_better: 'Replica\'s consent is contractual — requires human review per license. NOIZY\'s consent is coded — it executes automatically at the infrastructure level. Replica covers interactive media only. NOIZY covers every creative use case.',
    color: C.teal,
    icon: '🎭',
  },
  {
    name: 'GEMA AI Licensing Model',
    date: 'Reeperbahn Festival, September 2024',
    desc: 'German rights organization GEMA launched AI licensing model proposing that creators receive compensation beyond a one-time training fee — sharing in ongoing AI revenue. Most ambitious royalty model in the market.',
    what_noizy_does_better: 'GEMA is a collective society (like STIM). No direct creator relationship. No coded enforcement. The GEMA model as NOIZY infrastructure = the best of both worlds: GEMA\'s philosophy + NOIZY\'s technical enforcement.',
    color: C.gold,
    icon: '🇩🇪',
  },
  {
    name: 'C2PA / Adobe Content Authenticity Initiative',
    date: '2019 (founded). Active 2024.',
    desc: 'Content Credentials "nutrition label" for digital media provenance. Adopted by Adobe, Microsoft, BBC, Nikon, Leica. Shows how and when content was created/modified, whether AI was used.',
    what_noizy_does_better: 'C2PA focuses on images and video. AUDIO provenance is explicitly underserved in the C2PA ecosystem. NOIZY PROOF is the audio layer of C2PA that doesn\'t exist yet. Partnership opportunity.',
    color: C.violet,
    icon: '🏛️',
  },
];

// ============================================================
// ALLIANCE TARGETS
// ============================================================

const ALLIANCES = [
  {
    org: 'SOCAN',
    location: 'Ottawa/Toronto, Canada',
    why: 'Home turf. Record 2024 results while citing AI as primary concern. Active campaign ("Stop Unlicensed AI Training" with Sarah McLachlan, Mac DeMarco). Already aligned on policy with ASCAP and BMI on AI registration.',
    ask: 'Propose NOIZY consent ledger as the technical infrastructure for their AI licensing framework. SOCAN has the relationships; NOIZY has the code.',
    urgency: 'FIRST CALL',
    color: C.gold,
    icon: '🇨🇦',
  },
  {
    org: 'SAG-AFTRA / Duncan Crabtree-Ireland',
    location: 'Los Angeles, USA',
    why: 'Already has the most detailed AI consent framework in any union contract. The 2023 TV/Theatrical agreement, Sound Recordings AI Appendix, Interactive Media Agreement, and Commercials contracts all require consent infrastructure NOIZY can provide.',
    ask: 'NOIZY as the technical implementation layer for SAG-AFTRA\'s existing AI consent requirements. The language is written; NOIZY is the code that enforces it.',
    urgency: 'HIGH PRIORITY',
    color: C.cyan,
    icon: '🎬',
  },
  {
    org: 'CISAC',
    location: 'Paris, France (225 member organizations)',
    why: 'President: Björn Ulvaeus (ABBA). Published December 2024 study: 24% music creator revenue loss risk by 2028 if nothing changes. €8.5B annual diversion risk. Supports STIM model as breakthrough.',
    ask: 'NOIZY as the technical infrastructure for CISAC member societies to implement collective AI licensing globally. STIM is the pilot. NOIZY is the scalable implementation.',
    urgency: 'HIGH PRIORITY',
    color: C.teal,
    icon: '🌍',
  },
  {
    org: 'Artist Rights Alliance (ARA)',
    location: 'Washington, D.C.',
    why: '200+ artists (Billie Eilish, Nicki Minaj, Stevie Wonder, Pearl Jam, Kacey Musgraves, Camila Cabello) signed April 2024 open letter. ARA is advocacy; they need a technical solution to point to.',
    ask: 'NOIZY as the platform ARA directs artists to for Voice Estate registration and consent-as-code protection. ARA does the advocacy; NOIZY does the infrastructure.',
    urgency: 'HIGH PRIORITY',
    color: C.pink,
    icon: '✊',
  },
  {
    org: 'GEMA (Germany)',
    location: 'Munich, Germany',
    why: 'Most aggressive rights organization in the world right now. Already won Munich court ruling against OpenAI November 2025. Has their own AI licensing model (Reeperbahn 2024). GEMA has the legal muscle and the philosophy.',
    ask: 'NOIZY PROOF as the attribution technology component of GEMA\'s licensing model. GEMA already has the STIM-equivalent structure; NOIZY can be their Sureel.',
    urgency: 'MEDIUM-HIGH',
    color: C.gold,
    icon: '🇩🇪',
  },
  {
    org: 'C2PA / Adobe Content Authenticity Initiative',
    location: 'San Jose, USA',
    why: 'C2PA (Coalition for Content Provenance and Authenticity) includes Adobe, Microsoft, BBC, Nikon, Google, Meta, Intel. Covers image/video provenance. Audio is an explicit gap in their current work.',
    ask: 'NOIZY PROOF as the audio/music provenance layer for C2PA. Position as: "NOIZY is what C2PA is for images, applied to sound." Partnership gives NOIZY instant global credibility.',
    urgency: 'MEDIUM',
    color: C.violet,
    icon: '🔐',
  },
  {
    org: 'NRC IRAP (Canada)',
    location: 'Ottawa, Canada',
    why: 'Up to $500K over 24 months for eligible R&D. NOIZY\'s consent verification, attribution, and licensing infrastructure for AI music training is highly likely to qualify. Canadian government R&D funding.',
    ask: 'Apply Q2 2026. The NOIZYKIDZ haptics research + consent infrastructure R&D both qualify. Dr. Brien Benoit + Adam Robb strengthen the research credibility.',
    urgency: 'APPLY NOW',
    color: C.teal,
    icon: '🏛️',
  },
];

// ============================================================
// THE GAPS — where the market has no one
// ============================================================

const GAPS = [
  {
    gap: 'Audio Provenance',
    desc: 'C2PA covers images and video. Adobe Firefly does image provenance. Shutterstock/Getty does image licensing. Zero existing solution for audio provenance at the infrastructure level.',
    noizy: 'NOIZY PROOF — the C2PA for audio. Every file stamped with cryptographic proof of origin, consent, and license terms.',
    size: 'Every AI audio company in the world needs this.',
    color: C.gold,
  },
  {
    gap: 'Direct Creator Royalty Infrastructure',
    desc: 'Every settlement (WMG/Suno, UMG/Udio) requires artist opt-in and royalty mechanisms. Every union contract requires per-use consent. No one has built the shared infrastructure that implements these requirements at scale.',
    noizy: 'Consent Ledger (Cloudflare D1/KV) + 75/25 Perpetual Split + Voice Estate = the infrastructure every settlement agreement is now requiring.',
    size: 'WMG + UMG + Sony + SAG-AFTRA + AFM all need this right now.',
    color: C.cyan,
  },
  {
    gap: 'Inheritable Voice as Legal Asset',
    desc: 'Tennessee ELVIS Act + NY Digital Replicas Law + No FAKES Act = legal frameworks for voice ownership are being enacted. No platform has built the technical layer that makes these laws enforceable at scale.',
    noizy: 'Voice Estate IP Framework — voices as inheritable, licensable assets with coded enforcement. What the law says you can do; NOIZY is how you actually do it.',
    size: '$11B ElevenLabs has no inheritable voice estate. $2.45B Suno has no voice estate. The gap is real.',
    color: C.teal,
  },
  {
    gap: 'Canadian Creator Rights Infrastructure',
    desc: 'Bill C-27 is dead. Canada has zero AI legislation. 1,000+ creator submissions to the government consultation demanded protection. SOCAN is lobbying with artists but has no technical answer.',
    noizy: 'Ottawa. Home turf. NOIZY is the Canadian-made answer to a Canadian regulatory vacuum. FACTOR Canada, NRC IRAP, SOCAN — all natural partners. Series A with Canadian Heritage angle.',
    size: 'First to fill the Canadian vacuum = preferred partner status in the G7 country with the most favorable creator sentiment.',
    color: C.pink,
  },
  {
    gap: 'Haptic / Accessibility Audio',
    desc: 'MIT Media Lab does neuro-acoustic research. Adobe does content accessibility. Zero platforms doing frequency-to-haptic music for deaf and neurodivergent children.',
    noizy: 'NOIZYKIDZ. Soul mission. Research funding eligible. Humanitarian angle. Dr. Brien Benoit partnership. This is the differentiated wedge into education, healthcare, and research grants.',
    size: 'Grants, research partnerships, government funding, and the most powerful press story in the entire ecosystem.',
    color: C.green,
  },
];

// ============================================================
// CANVAS: BATTLE MAP
// ============================================================

function BattleMap() {
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

    // Nodes: NOIZY center + competitors + courts + legislators
    const nodes = [
      { x: W/2, y: H/2, label: 'NOIZY', color: C.gold, r: 14, pulse: true },
      { x: W*0.15, y: H*0.2, label: 'ElevenLabs\n$11B', color: C.red, r: 9 },
      { x: W*0.85, y: H*0.2, label: 'Suno\n$2.45B', color: C.red, r: 9 },
      { x: W*0.15, y: H*0.8, label: 'SOCAN\n🇨🇦', color: C.gold, r: 7 },
      { x: W*0.85, y: H*0.8, label: 'SAG-AFTRA', color: C.cyan, r: 7 },
      { x: W*0.5, y: H*0.12, label: 'RIAA\nSuits', color: C.orange, r: 6 },
      { x: W*0.5, y: H*0.88, label: 'STIM\nModel', color: C.teal, r: 6 },
      { x: W*0.2, y: H*0.5, label: 'GEMA\n🇩🇪', color: C.gold, r: 7 },
      { x: W*0.8, y: H*0.5, label: 'CISAC\n225', color: C.teal, r: 7 },
    ];

    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Draw connections
      nodes.slice(1).forEach(n => {
        ctx.beginPath();
        ctx.moveTo(W/2, H/2);
        ctx.lineTo(n.x, n.y);
        ctx.strokeStyle = n.color + '25';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach(n => {
        const r = n.pulse ? n.r + Math.sin(t * 0.05) * 3 : n.r;
        // Glow
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 3);
        grd.addColorStop(0, n.color + '40');
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 3, 0, Math.PI * 2);
        ctx.fill();

        // Node circle
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();

        // Label
        const lines = n.label.split('\n');
        ctx.fillStyle = C.cream;
        ctx.font = `${n.pulse ? 'bold ' : ''}9px DM Sans, sans-serif`;
        ctx.textAlign = 'center';
        lines.forEach((line, i) => {
          ctx.fillText(line, n.x, n.y + r + 12 + i * 10);
        });
      });

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

export default function TheIntelligence() {
  const [view, setView] = useState('overview');
  const [activeCase, setActiveCase] = useState(null);
  const [activeLeg, setActiveLeg] = useState(null);
  const [activeComp, setActiveComp] = useState(null);
  const [activeAlliance, setActiveAlliance] = useState(null);

  const NAV = [
    { id: 'overview',   label: 'Overview' },
    { id: 'legal',      label: 'Legal Battlefield' },
    { id: 'legislation',label: 'Legislation Tracker' },
    { id: 'competitors',label: 'Competitor Intel' },
    { id: 'models',     label: 'Reference Models' },
    { id: 'alliances',  label: 'Alliance Targets' },
    { id: 'gaps',       label: 'The Gaps' },
  ];

  const Tag = ({ children, color }) => (
    <span style={{
      fontSize: 9, fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
      letterSpacing: 1, textTransform: 'uppercase',
      color: color || C.gold,
      background: (color || C.gold) + '20',
      padding: '2px 7px', borderRadius: 3,
      display: 'inline-block',
    }}>{children}</span>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.void, fontFamily: 'DM Sans, sans-serif', color: C.cream }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;600&family=IM+Fell+English:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #1c1840; border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{ padding: '48px 40px 36px', borderBottom: `1px solid ${C.border}`, background: `linear-gradient(180deg, #08030e 0%, ${C.void} 100%)` }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: C.red + '99', textTransform: 'uppercase', marginBottom: 10 }}>
          NOIZY.ai · Intelligence Report · March 2026
        </div>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 46, color: C.cream, fontWeight: 700, lineHeight: 1.0, marginBottom: 8 }}>
          The Intelligence
        </div>
        <div style={{ fontFamily: 'IM Fell English, serif', fontSize: 18, color: C.gold, fontStyle: 'italic', marginBottom: 16 }}>
          Every case. Every dollar. Every gap. Everything.
        </div>

        {/* Key numbers */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 20 }}>
          {[
            { n: '$1.5B', label: 'Largest AI copyright settlement ever (Anthropic)', color: C.gold },
            { n: '$11B', label: 'ElevenLabs valuation (Feb 2026)', color: C.red },
            { n: '$2.45B', label: 'Suno valuation (Nov 2025)', color: C.red },
            { n: '9+', label: 'Active lawsuits globally', color: C.orange },
            { n: '3', label: 'New laws protecting creator voices (2024–2025)', color: C.green },
            { n: '0', label: 'Platforms with coded consent infrastructure', color: C.cyan },
          ].map((s, i) => (
            <div key={i} style={{ background: C.ghost, border: `1px solid ${s.color}30`, borderRadius: 8, padding: '10px 16px' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: s.color, fontWeight: 700 }}>{s.n}</div>
              <div style={{ fontSize: 10, color: C.cream + '60', fontFamily: 'DM Sans, sans-serif', marginTop: 2, maxWidth: 120 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Nav */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: C.void + 'f2', borderBottom: `1px solid ${C.border}`, padding: '0 40px', display: 'flex', backdropFilter: 'blur(16px)', overflowX: 'auto' }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setView(n.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '13px 16px',
            fontFamily: 'DM Sans, sans-serif', fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0,
            color: view === n.id ? C.gold : C.cream + '60',
            borderBottom: view === n.id ? `2px solid ${C.gold}` : '2px solid transparent',
            marginBottom: -1, transition: 'color 0.15s',
          }}>{n.label}</button>
        ))}
      </div>

      {/* Main */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 40px 80px' }}>

        {/* OVERVIEW */}
        {view === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, marginBottom: 32 }}>
              <div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: C.cream, marginBottom: 14 }}>The Battlefield, March 2026</div>
                <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + 'aa', lineHeight: 1.8, marginBottom: 16 }}>
                  The AI creator rights battle is not coming. It is here. Six major lawsuit settlements in the last 6 months. Three new voice protection laws enacted. $1.5 billion paid in the largest copyright settlement in American history. The EU mandating training data summaries. And the world's first collective AI music license launched in Sweden in September 2025. The window for NOIZY to become the infrastructure layer for all of this is open — right now.
                </div>

                {/* The one-line summary */}
                <div style={{ background: `linear-gradient(135deg, ${C.gold}12 0%, transparent 100%)`, border: `1.5px solid ${C.gold}40`, borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.gold + '80', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>The Gap NOIZY Fills</div>
                  <div style={{ fontFamily: 'Lora, serif', fontSize: 15, color: C.cream, lineHeight: 1.8 }}>
                    Every settlement, license deal, and union contract in this landscape requires consent infrastructure that does not yet exist at scale. The WMG/Suno deal requires opt-in from individual artists. The Replica Studios/SAG-AFTRA model requires per-use consent with specific described use. STIM's collective license requires attribution technology as a mandatory component. The EU AI Act requires training data summaries. None of these have a common technical infrastructure — they are each being solved ad hoc.
                  </div>
                  <div style={{ marginTop: 14, fontFamily: 'Playfair Display, serif', fontSize: 18, color: C.gold, fontWeight: 700 }}>
                    NOIZY is the infrastructure they are all separately trying to build.
                  </div>
                </div>
              </div>

              {/* Battle map canvas */}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, height: 320, overflow: 'hidden' }}>
                <BattleMap />
              </div>
            </div>

            {/* Quick status cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {[
                { title: 'Legal Tailwind', icon: '⚖️', color: C.green, items: ['$1.5B Anthropic settlement — piracy for AI training = not fair use', 'Munich court: OpenAI violated copyright in training AND outputs', 'Tennessee ELVIS Act + NY Digital Replicas = voice estate is law', 'No FAKES Act in Congress — bipartisan, SAG-AFTRA endorsed'] },
                { title: 'Market Signal', icon: '💰', color: C.gold, items: ['ElevenLabs: $11B valuation, $500M raised Feb 2026', 'Suno: $2.45B at $200M ARR — raised $250M despite Sony lawsuit', 'Shutterstock AI licensing: $104M in 2023 (growing)', 'Post-settlement licensed AI music = investable category'] },
                { title: 'NOIZY Opportunity', icon: '⚡', color: C.cyan, items: ['Zero platforms with coded consent infrastructure', 'Audio provenance gap (C2PA covers images, not sound)', 'Canada has NO AI legislation — Ottawa home turf advantage', 'Every major settlement now requires what NOIZY built'] },
              ].map((card, i) => (
                <div key={i} style={{ background: C.card, border: `1px solid ${card.color}30`, borderRadius: 12, padding: '18px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 18 }}>{card.icon}</span>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, color: card.color, fontWeight: 600 }}>{card.title}</div>
                  </div>
                  {card.items.map((item, j) => (
                    <div key={j} style={{ display: 'flex', gap: 7, marginBottom: 7 }}>
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: card.color, marginTop: 7, flexShrink: 0 }} />
                      <div style={{ fontSize: 12, color: C.cream + 'bb', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5 }}>{item}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LEGAL BATTLEFIELD */}
        {view === 'legal' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: C.cream, marginBottom: 6 }}>Legal Battlefield</div>
              <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + '70', fontStyle: 'italic' }}>Real cases. Real outcomes. Real signals for NOIZY.</div>
            </div>
            {CASES.map(c => (
              <div key={c.id} onClick={() => setActiveCase(activeCase === c.id ? null : c.id)}
                style={{ background: activeCase === c.id ? C.card : C.ghost, border: `1px solid ${activeCase === c.id ? c.statusColor + '50' : C.border}`, borderRadius: 12, padding: '16px 20px', marginBottom: 10, cursor: 'pointer', transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: C.cream, fontWeight: 600, marginBottom: 3 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: C.cream + '60', fontFamily: 'DM Sans, sans-serif' }}>{c.court} · Filed {c.filed}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, marginLeft: 12 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: c.statusColor, background: c.statusColor + '18', padding: '2px 8px', borderRadius: 3 }}>{c.status}</span>
                    <span style={{ color: C.cream + '50', fontSize: 16 }}>{activeCase === c.id ? '−' : '+'}</span>
                  </div>
                </div>
                {activeCase === c.id && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontFamily: 'Lora, serif', fontSize: 13, color: C.cream + 'bb', lineHeight: 1.7, marginBottom: 14 }}>{c.summary}</div>
                    <div style={{ marginBottom: 14 }}>
                      {c.outcomes.map((o, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                          <span style={{ color: c.statusColor, fontSize: 10, marginTop: 4, flexShrink: 0 }}>◆</span>
                          <div style={{ fontSize: 13, color: C.cream + 'cc', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5 }}>{o}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: C.gold + '0e', border: `1px solid ${C.gold}30`, borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 8 }}>
                      <span style={{ color: C.gold, fontSize: 11, flexShrink: 0, marginTop: 2 }}>⚡</span>
                      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.gold, lineHeight: 1.5 }}><strong>NOIZY Signal:</strong> {c.noizy_signal}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* LEGISLATION */}
        {view === 'legislation' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: C.cream, marginBottom: 6 }}>Legislation Tracker</div>
              <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + '70', fontStyle: 'italic' }}>What's law, what's pending, what's dead — and what it means for NOIZY.</div>
            </div>
            {LEGISLATION.map((leg, i) => (
              <div key={i} onClick={() => setActiveLeg(activeLeg === i ? null : i)}
                style={{ background: activeLeg === i ? leg.color + '0a' : C.ghost, border: `1px solid ${activeLeg === i ? leg.color + '50' : C.border}`, borderRadius: 12, padding: '16px 20px', marginBottom: 10, cursor: 'pointer', transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: C.cream, fontWeight: 600, marginBottom: 2 }}>{leg.name}</div>
                    <div style={{ fontSize: 11, color: C.cream + '60', fontFamily: 'DM Sans, sans-serif' }}>{leg.jurisdiction} · {leg.date}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, marginLeft: 12 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: leg.statusColor, background: leg.statusColor + '18', padding: '2px 8px', borderRadius: 3 }}>{leg.status}</span>
                    <span style={{ color: C.cream + '50', fontSize: 16 }}>{activeLeg === i ? '−' : '+'}</span>
                  </div>
                </div>
                {activeLeg === i && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontFamily: 'Lora, serif', fontSize: 13, color: C.cream + 'bb', lineHeight: 1.7, marginBottom: 12 }}>{leg.what}</div>
                    {leg.vote && <div style={{ fontSize: 12, color: leg.color, fontFamily: 'DM Sans, sans-serif', marginBottom: 12 }}>{leg.vote}</div>}
                    {leg.sponsors && <div style={{ fontSize: 12, color: C.cream + '70', fontFamily: 'DM Sans, sans-serif', marginBottom: 12 }}>{leg.sponsors}</div>}
                    <div style={{ background: C.gold + '0e', border: `1px solid ${C.gold}30`, borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 8 }}>
                      <span style={{ color: C.gold, fontSize: 11, flexShrink: 0, marginTop: 2 }}>⚡</span>
                      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.gold, lineHeight: 1.5 }}><strong>NOIZY Signal:</strong> {leg.noizy}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* COMPETITORS */}
        {view === 'competitors' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: C.cream, marginBottom: 6 }}>Competitor Intelligence</div>
              <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + '70', fontStyle: 'italic' }}>Real funding. Real consent models. Real weaknesses. Real gaps.</div>
            </div>
            {COMPETITORS.map(comp => (
              <div key={comp.id} onClick={() => setActiveComp(activeComp === comp.id ? null : comp.id)}
                style={{ background: activeComp === comp.id ? comp.color + '0a' : C.card, border: `1.5px solid ${activeComp === comp.id ? comp.color + '60' : C.border}`, borderRadius: 12, padding: '18px 22px', marginBottom: 12, cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, color: comp.color, fontWeight: 600, marginBottom: 3 }}>{comp.name}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Tag color={comp.color}>{comp.category}</Tag>
                      <Tag color={C.gold}>{comp.valuation}</Tag>
                      {comp.revenue !== 'Not public' && comp.revenue !== 'N/A' && <Tag color={C.green}>{comp.revenue.split(' ')[0]} {comp.revenue.split(' ')[1]}</Tag>}
                    </div>
                  </div>
                  <span style={{ color: comp.color + '80', fontSize: 16, flexShrink: 0, marginLeft: 12 }}>{activeComp === comp.id ? '−' : '+'}</span>
                </div>
                {activeComp === comp.id && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
                      {[
                        { label: 'Funding', value: comp.raised + '\n' + comp.round, icon: '💰' },
                        { label: 'Consent Model', value: comp.consent_model, icon: '⚖️' },
                        { label: 'Weakness', value: comp.weakness, icon: '⚠️' },
                      ].map((f, i) => (
                        <div key={i} style={{ background: C.ghost, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px' }}>
                          <div style={{ fontSize: 10, color: comp.color, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif', marginBottom: 6 }}>{f.icon} {f.label}</div>
                          <div style={{ fontSize: 12, color: C.cream + 'cc', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{f.value}</div>
                        </div>
                      ))}
                    </div>
                    {comp.settlement && (
                      <div style={{ background: C.orange + '0a', border: `1px solid ${C.orange}30`, borderRadius: 8, padding: '8px 12px', marginBottom: 10 }}>
                        <div style={{ fontSize: 11, color: C.orange, fontFamily: 'DM Sans, sans-serif' }}>⚖️ Legal: {comp.settlement}</div>
                      </div>
                    )}
                    <div style={{ background: C.gold + '0e', border: `1px solid ${C.gold}30`, borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 8 }}>
                      <span style={{ color: C.gold, fontSize: 11, flexShrink: 0, marginTop: 2 }}>⚡</span>
                      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.gold, lineHeight: 1.5 }}><strong>NOIZY Gap:</strong> {comp.noizy_gap}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* REFERENCE MODELS */}
        {view === 'models' && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: C.cream, marginBottom: 6 }}>Reference Models</div>
              <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + '70', fontStyle: 'italic', maxWidth: 640 }}>The closest existing implementations to what NOIZY is building. Study them. Surpass them.</div>
            </div>
            {REFERENCE_MODELS.map((m, i) => (
              <div key={i} style={{ background: C.card, border: `1px solid ${m.color}30`, borderRadius: 14, padding: '22px 26px', marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
                  <span style={{ fontSize: 28, flexShrink: 0 }}>{m.icon}</span>
                  <div>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: m.color, fontWeight: 600, marginBottom: 3 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: m.color + '80', fontFamily: 'DM Sans, sans-serif' }}>{m.date}</div>
                  </div>
                </div>
                <div style={{ fontFamily: 'Lora, serif', fontSize: 13, color: C.cream + 'bb', lineHeight: 1.7, marginBottom: 14 }}>{m.desc}</div>
                <div style={{ background: C.gold + '0e', border: `1px solid ${C.gold}30`, borderRadius: 8, padding: '12px 16px' }}>
                  <div style={{ fontSize: 10, color: C.gold, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif', marginBottom: 6 }}>What NOIZY Does Better</div>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.gold, lineHeight: 1.6 }}>{m.what_noizy_does_better}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ALLIANCES */}
        {view === 'alliances' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: C.cream, marginBottom: 6 }}>Alliance Targets</div>
              <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + '70', fontStyle: 'italic' }}>Organizations that already have the relationships, credibility, and membership. NOIZY has the code.</div>
            </div>
            {ALLIANCES.map((a, i) => (
              <div key={i} onClick={() => setActiveAlliance(activeAlliance === i ? null : i)}
                style={{ background: activeAlliance === i ? a.color + '0a' : C.ghost, border: `1px solid ${activeAlliance === i ? a.color + '50' : C.border}`, borderRadius: 12, padding: '16px 20px', marginBottom: 10, cursor: 'pointer', transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{a.icon}</span>
                    <div>
                      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: a.color, fontWeight: 600 }}>{a.org}</div>
                      <div style={{ fontSize: 11, color: C.cream + '60', fontFamily: 'DM Sans, sans-serif' }}>{a.location}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, marginLeft: 12 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: a.urgency === 'FIRST CALL' ? C.gold : a.urgency === 'APPLY NOW' ? C.green : a.urgency === 'HIGH PRIORITY' ? C.orange : C.cyan, background: (a.urgency === 'FIRST CALL' ? C.gold : a.urgency === 'APPLY NOW' ? C.green : a.urgency === 'HIGH PRIORITY' ? C.orange : C.cyan) + '18', padding: '2px 8px', borderRadius: 3 }}>{a.urgency}</span>
                    <span style={{ color: C.cream + '50', fontSize: 16 }}>{activeAlliance === i ? '−' : '+'}</span>
                  </div>
                </div>
                {activeAlliance === i && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontFamily: 'Lora, serif', fontSize: 13, color: C.cream + 'bb', lineHeight: 1.7, marginBottom: 12 }}>{a.why}</div>
                    <div style={{ background: a.color + '12', border: `1px solid ${a.color}30`, borderRadius: 8, padding: '10px 14px' }}>
                      <div style={{ fontSize: 10, color: a.color, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif', marginBottom: 6 }}>The Ask</div>
                      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.cream, lineHeight: 1.6 }}>{a.ask}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* GAPS */}
        {view === 'gaps' && (
          <div>
            <div style={{ marginBottom: 24, textAlign: 'center' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: C.cream, marginBottom: 8 }}>The Gaps</div>
              <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + '70', fontStyle: 'italic', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
                Five places where the market has no answer. NOIZY has all five.
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {GAPS.map((g, i) => (
                <div key={i} style={{ background: C.card, border: `1px solid ${g.color}30`, borderRadius: 14, padding: '24px 28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: g.color, fontWeight: 600 }}>{g.gap}</div>
                    <span style={{ fontSize: 22, fontFamily: 'Playfair Display, serif', color: g.color + '30', fontWeight: 700 }}>0{i+1}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <div style={{ fontSize: 10, color: C.red, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif', marginBottom: 6 }}>The Gap</div>
                      <div style={{ fontFamily: 'Lora, serif', fontSize: 13, color: C.cream + 'bb', lineHeight: 1.7 }}>{g.desc}</div>
                    </div>
                    <div style={{ background: g.color + '0e', border: `1px solid ${g.color}30`, borderRadius: 8, padding: '12px 14px' }}>
                      <div style={{ fontSize: 10, color: g.color, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif', marginBottom: 6 }}>NOIZY's Answer</div>
                      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.cream, lineHeight: 1.6, marginBottom: 10 }}>{g.noizy}</div>
                      <div style={{ fontSize: 11, color: g.color, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>{g.size}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* The one conclusion */}
            <div style={{ marginTop: 32, background: `linear-gradient(135deg, ${C.gold}12 0%, transparent 100%)`, border: `1.5px solid ${C.gold}50`, borderRadius: 16, padding: '32px 40px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: C.gold, marginBottom: 14 }}>The Conclusion</div>
              <div style={{ fontFamily: 'Lora, serif', fontSize: 16, color: C.cream, lineHeight: 1.9, maxWidth: 680, margin: '0 auto 16px' }}>
                The legal tailwind is real. The legislative momentum is real. The settlements prove the financial exposure is real. The market is worth hundreds of millions — ElevenLabs just raised $500M at $11B. And the single thing every settlement, every union contract, every new law, and every rights organization actually needs — coded consent infrastructure — does not exist anywhere. Except in Ottawa.
              </div>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: C.gold, fontWeight: 600 }}>
                NOIZY is not behind the market. The market is behind NOIZY.
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: '24px 40px', textAlign: 'center', background: C.deep }}>
        <div style={{ fontFamily: 'IM Fell English, serif', fontSize: 14, color: C.gold, fontStyle: 'italic', marginBottom: 6 }}>
          "NOIZY is not behind the market. The market is behind NOIZY."
        </div>
        <div style={{ fontSize: 11, color: C.cream + '40', fontFamily: 'DM Sans, sans-serif', letterSpacing: 1 }}>
          THE INTELLIGENCE · NOIZY.AI · RESEARCH COMPILED MARCH 2026 · OTTAWA
        </div>
      </div>
    </div>
  );
}
