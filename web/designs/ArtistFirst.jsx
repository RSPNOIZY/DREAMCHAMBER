import { useState, useEffect, useRef } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Syne+Mono&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');`;

// ─── BRAND COLORS PER PLATFORM ─────────────────────────────────────────────
const BRANDS = {
  suno:    { name:"SUNO",    accent:"#FF6B35", dim:"rgba(255,107,53,0.08)",  border:"rgba(255,107,53,0.2)",  tag:"Music Generation" },
  moises:  { name:"MOISES",  accent:"#7C3AED", dim:"rgba(124,58,237,0.08)",  border:"rgba(124,58,237,0.2)",  tag:"Audio Intelligence" },
  splice:  { name:"SPLICE",  accent:"#0EA5E9", dim:"rgba(14,165,233,0.08)",   border:"rgba(14,165,233,0.2)",   tag:"Sample Marketplace" },
  noizy:   { name:"NOIZY.ai",accent:"#C9A84C", dim:"rgba(201,168,76,0.08)",  border:"rgba(201,168,76,0.2)",  tag:"Artist-First Platform" },
};

// ─── COMPLETE REVERSAL DATA ─────────────────────────────────────────────────
const REVERSALS = {
  suno: [
    {
      id:"suno_ownership",
      title:"Who Owns the Music You Make",
      impact:"CRITICAL",
      them_verdict:"YOUR MUSIC IS THEIR CONTENT",
      us_verdict:"YOUR MUSIC IS YOUR PROPERTY",
      them_how:"Suno's terms grant them a broad license to use, display, reproduce, and distribute anything you create. Songs made on the free tier cannot be commercialized. On paid tiers you get commercial rights — but Suno retains a sublicense. Your music trains their next model. You consented to that in the ToS.",
      them_tech:"Centralized generation on Suno servers. Output stored in Suno's cloud. Training data: your generated outputs are logged and potentially used to improve base model. No artist attribution in training pipeline. Free-tier content: all rights reserved to Suno.",
      us_how:"Everything created in NOIZY's DreamChamber is artist property from the moment of generation. No license granted to NOIZY beyond hosting. Free tier requires attribution, not rights assignment. Nothing you create trains NOIZY's base model without a compensated data licensing agreement.",
      us_tech:"Generation output: immediately artist-owned. Metadata stamp: artist_id, timestamp, consent_terms on every file. No training pipeline ingestion without separate opt-in contract. Base model improvement funded through explicit partnerships with compensated contributors, not passive data harvesting.",
    },
    {
      id:"suno_revenue",
      title:"Who Gets Paid When Music Earns",
      impact:"EXISTENTIAL",
      them_verdict:"SUNO PROFITS. YOU SUBSCRIBE.",
      us_verdict:"ARTIST EARNS. PLATFORM TAKES REMAINDER.",
      them_how:"Suno charges $10-30/month for Pro/Premier tiers. When your music succeeds commercially, Suno collects zero percent of downstream revenue — but they also give you zero infrastructure for tracking, collecting, or distributing those earnings. You built the hit. You figure out the money. Meanwhile Suno is worth $500M+ on the backs of every song ever made.",
      them_tech:"Subscription-only revenue model. No royalty infrastructure. No streaming distribution integration. No sync licensing pipeline. No publishing administration. Creators must independently connect to DistroKid/TuneCore/CD Baby and manage all rights administration themselves. Suno provides the tool, nothing else.",
      us_how:"NOIZY Dream Chamber includes a native distribution pipeline. Every commercial sync, stream, or license routes 75% to the creating artist automatically. NOIZY administers publishing, tracks performance royalties, and provides the complete earnings infrastructure that Suno deliberately left out.",
      us_tech:"Stripe Connect: direct artist payouts on every transaction. DistroKid API integration: one-click streaming distribution from DreamChamber to 150+ platforms. Sync licensing portal: browse open briefs, submit tracks, earn on placement. Publishing admin: mechanical royalty collection via SOCAN/ASCAP/BMI partnership. All transparent, all auditable.",
    },
    {
      id:"suno_training",
      title:"Whose Music Trained the Model",
      impact:"EXISTENTIAL",
      them_verdict:"COPYRIGHTED MUSIC TRAINED THEM. NO ONE WAS ASKED.",
      us_verdict:"ONLY LICENSED & CONSENTED DATA TRAINS NOIZY.",
      them_how:"Suno was sued in June 2024 by the RIAA representing Sony, Universal, and Warner Music — alleging 'willful infringement on an almost unimaginable scale.' Rolling Stone reported there is 'substantial reason to believe' Suno was trained on copyrighted recordings. Suno settled with Warner in 2025 but the training corpus remains undisclosed. Every song Suno generates carries that original sin.",
      them_tech:"Training data: undisclosed. Settlement terms: undisclosed. Suno's position pre-lawsuit: training constitutes 'fair use.' Post-settlement: Suno formed label partnerships. No public audit of training corpus. Artists whose recordings were scraped without consent: compensated $0. Rights holders who sued: settled for undisclosed sum. Everyone else: still owed nothing.",
      us_how:"NOIZY's audio models are trained exclusively on: (1) Creative Commons licensed music, (2) public domain recordings, (3) artist-contributed archives with explicit consent and compensation contracts, (4) synthesized training data. No scraping. No fair use arguments. No settlements required.",
      us_tech:"Training corpus: fully audited, publicly documented by source category. Every contributing artist: named, credited, compensated. NOIZY Consent Protocol (NCP): every training contribution creates an immutable on-chain record of consent terms and payment. Third-party audit: annual independent review of training data provenance published publicly.",
    },
    {
      id:"suno_signal",
      title:"Who Has Intelligence About Your Sound",
      impact:"HIGH",
      them_verdict:"SUNO KNOWS YOUR SOUND. YOU DON'T.",
      us_verdict:"YOU KNOW YOUR SOUND. WE HELP YOU UNDERSTAND IT.",
      them_how:"Suno v4.5 added 'Personas' — a feature that remembers your style preferences across sessions. Suno now has a model of what you like, what you create, and how your tastes evolve. That intelligence lives on Suno's servers. It improves their product. It helps them retain you as a subscriber. You get no analytical access to your own creative fingerprint.",
      them_tech:"Persona system: Suno's internal user preference model. No export. No artist dashboard showing signal characteristics. No spectral analysis. No commercial placement matching. No insight into what makes your sound distinctive, what it sounds like to industry buyers, or how it compares to benchmarks. Suno uses your data. You don't.",
      us_how:"GABRIEL — NOIZY's signal intelligence engine — provides complete analytics on everything you create: spectral fingerprint, harmonic complexity, genre classification, mood mapping, commercial placement potential, and longitudinal evolution. Your creative intelligence belongs to you.",
      us_tech:"Librosa pipeline on every generated track: MFCC analysis, chroma features, spectral centroid, rhythmic complexity, harmonic ratio. GABRIEL AI layer: identifies what market categories your sound fits, which sync briefs it matches, how it's evolved over your last 20 sessions. Full export: your entire creative profile as a portable JSON report. Yours forever.",
    },
    {
      id:"suno_lock",
      title:"What Happens If You Leave",
      impact:"HIGH",
      them_verdict:"YOUR CATALOG IS HOSTAGE TO YOUR SUBSCRIPTION.",
      us_verdict:"YOUR CATALOG LEAVES WITH YOU. ALWAYS.",
      them_how:"Suno's Premier plan: $30/month, 10,000 credits. If you stop paying, you lose the ability to generate. Your existing downloads stay — but your history, your Personas, your style data, your generation logs all disappear. Building a catalog on Suno means building on someone else's foundation.",
      them_tech:"Zero portability for Personas/style data. Generation history: not exportable in structured format. Account deletion: all associated metadata gone. Model trained to know your style: Suno's property, not yours. Switching costs: start from zero on any other platform.",
      us_how:"Full data portability. Export your entire NOIZY history: every generation, every signal report, every earnings record, your DreamChamber preferences — as a portable archive. Switch platforms. Self-host. The 14 years of creative intelligence you build inside NOIZY comes with you.",
      us_tech:"Full export API: /export/artist/{id} returns zip containing all generation metadata, signal fingerprints, earning records, consent logs, and model configurations. Format: open standard JSON + WAV. Migration assistant: automated import to self-hosted NOIZY instance or partner platforms. Your creative history is yours.",
    },
  ],

  moises: [
    {
      id:"moises_intelligence",
      title:"Who Benefits from Your Audio Intelligence",
      impact:"CRITICAL",
      them_verdict:"YOUR MUSIC TRAINS THEIR PLATFORM.",
      us_verdict:"YOUR MUSIC BUILDS YOUR OWN INTELLIGENCE.",
      them_how:"Moises / Music.AI processes over 2 million minutes of audio daily across 40M+ users. Every stem separation, every chord analysis, every key detection — that data trains and improves their models. Their platform gets smarter from your music. You get a processed file back. The intelligence differential compounds in their favor.",
      them_tech:"Music.AI processes audio through 50+ AI models: stem separation (Spleeter/Demucs variants), chord recognition, key detection, beat tracking, lyrics transcription. Processed audio: returned to user. Processing data: used to improve models. User audio: potentially retained for model training. Music.AI annual report: '2M+ minutes processed daily' = massive training dataset no competitor can match. Funded by your uploads.",
      us_how:"Every track processed through NOIZY's signal intelligence layer generates a permanent creative fingerprint that lives in your artist profile. The intelligence compounds for you — not the platform. GABRIEL learns what your sound is over time. That model of your creativity belongs to you.",
      us_tech:"NOIZY signal layer: non-destructive analysis. Input audio never stored beyond processing window unless artist explicitly opts in to archive. Output: artist-owned JSON fingerprint containing full spectral analysis. GABRIEL longitudinal model: updated with each session, fully exportable, artist-controlled. Platform learns nothing without artist consent. Artist learns everything.",
    },
    {
      id:"moises_stems",
      title:"Who Controls Stem Separation",
      impact:"HIGH",
      them_verdict:"STEMS ARE A FEATURE. YOU RENT ACCESS.",
      us_verdict:"STEMS ARE YOUR WORK. YOU OWN THE PIPELINE.",
      them_how:"Moises Pro: $7.99/month for 10 song separations. Moises Max: $15.99/month for 50. Every separation is a transaction against your subscription. Run out of credits: pay more. Cancel your subscription: lose access to the tool. The stems you created are yours — but the capability to create more is metered and monetized against you.",
      them_tech:"Stem separation: cloud-based Demucs-class models. Processing: Moises servers. Credits: per-song consumption. Outputs: 2-6 stems (vocals, bass, drums, melody, piano, guitar) in MP3/WAV. No offline processing option. No API for developers on base plans. No integration with DAW workflow. One more subscription in the stack.",
      us_how:"NOIZY's stem separation is included in every tier as a permanent tool, not a credit-metered feature. The pipeline runs locally via open-source Demucs. For artists who want cloud processing, NOIZY handles it — and the stems are immediately integrated into the DreamChamber workflow for further creation.",
      us_tech:"Local processing option: Demucs 4.0 via NOIZY desktop client (free, unlimited, private). Cloud option: NOIZY-hosted Demucs with 48kHz output, all stems to DreamChamber automatically. DAW integration: NOIZY stems plugin for Logic Pro, Ableton, Pro Tools — one-click export. No credit limits. No subscription metering. Stems are a right, not a premium feature.",
    },
    {
      id:"moises_attribution",
      title:"Artist Attribution in AI Music Tools",
      impact:"HIGH",
      them_verdict:"40M USERS. ZERO ARTIST ATTRIBUTION.",
      us_verdict:"EVERY ANALYSIS CREDITS THE MUSIC IT ANALYZED.",
      them_how:"Moises' Moises app is Apple's iPad App of the Year 2024. It processes tens of millions of songs. The artists whose recordings are separated, analyzed, and used to train better separation models are not credited, not compensated, and not informed. Music.AI's enterprise pitch is built on a capability developed entirely on unattributed musical labor.",
      them_tech:"API docs: no attribution requirement for processed audio. Enterprise clients: Music.AI's B2B pitch includes 'stem separation as a service' built on model training data that is not publicly sourced. No public training data disclosure. No artist compensation pool. No acknowledgment that 40M users processing their music libraries created the training set.",
      us_how:"NOIZY's Consent Protocol applies to analysis as well as generation. Artists who contribute music to NOIZY's training corpus are named, credited, and compensated. Every feature NOIZY builds that required learning from music — that music is attributed. That is the minimum respect the craft deserves.",
      us_tech:"NOIZY Attribution Registry: public database of every artist and recording that contributed to NOIZY's model training. Searchable. Compensated: monthly distributions to training contributors based on usage metrics. NOIZY Certificate of Attribution: every artist receives a certificate documenting their contribution to the platform's capabilities. Not charity — accounting.",
    },
    {
      id:"moises_creator_economy",
      title:"The Creator Economy Inside Music AI",
      impact:"MEDIUM",
      them_verdict:"YOUR CREATIVITY SERVES THEIR PRODUCT DEMOS.",
      us_verdict:"YOUR CREATIVITY EARNS YOU MONEY INSIDE THE PLATFORM.",
      them_how:"Music.AI showcases artists using their tools in promotional content. These artists provide authentic demonstrations of the platform's value. They receive: exposure. Music.AI receives: credibility, user acquisition, and the social proof that justifies their pricing. The asymmetry is complete.",
      them_tech:"Artist partnerships: promotional, not commercial. No revenue share for featured artists. No ambassador compensation structure. No integration between 'artist uses Moises' and 'artist earns from the content they created using Moises.' The platform's showcase is built on unpaid creative labor.",
      us_how:"The NOIZY Dreamer community earns from the platform they're part of. Featured artists on the platform receive a percentage of new subscriptions they generate. Tutorial creators earn from the views their educational content drives. The platform's growth is the artist community's growth.",
      us_tech:"NOIZY Ambassador Program: trackable referral links, 20% of first-year subscription value for every artist referred. Content Creator Program: educators who create NOIZY tutorials earn 15% of conversion revenue from their content. Community Fund: 2% of NOIZY platform revenue distributed quarterly to active Guild members by tenure and contribution score.",
    },
  ],

  splice: [
    {
      id:"splice_ownership",
      title:"Who Owns the Samples You Upload",
      impact:"EXISTENTIAL",
      them_verdict:"SPLICE LICENSES YOUR SOUND FOREVER.",
      us_verdict:"YOUR SOUND. YOUR LICENSE. YOUR CONTROL.",
      them_how:"Splice's contributor terms grant them a 'non-exclusive, royalty-free, worldwide, sublicensable, perpetual license' to use, reproduce, distribute your uploaded samples. Royalty-free means: one-time payment (or no payment), perpetual use, no ongoing compensation. Your custom drum hit, your signature synth patch, your recorded Foley — licensed to Splice forever for what they choose to pay you once.",
      them_tech:"Splice Sounds contributor portal: upload samples. License: royalty-free perpetual worldwide. Payout: one-time flat fee per accepted sample (typically $0.50-$5 per sample accepted). Revenue model: Splice charges subscribers $10.99/month for unlimited access. 4 million+ sounds available. Your $2 sample: accessed by 4M+ subscribers at $0 additional to you. Splice: keeps subscription revenue.",
      us_how:"NOIZY's sample marketplace uses a streaming royalty model, not a flat buyout. Every time a producer uses your sample in a tracked production, you earn. Every commercial release that uses your sound earns you a percentage. You never sell perpetual rights for a flat fee ever again.",
      us_tech:"NOIZY Sample Marketplace: usage-based royalty model. Rates: $0.008 per download (vs Splice's flat ~$2 one-time), PLUS 3% of any commercial sync placement where your sample appears, tracked via content ID. Blockchain-backed usage ledger: every download logged, every earning routed. No flat buyouts. No perpetual licenses. Ongoing relationship between creator and creation.",
    },
    {
      id:"splice_discovery",
      title:"Who Controls Whether Artists Are Found",
      impact:"CRITICAL",
      them_verdict:"SPLICE'S ALGORITHM CONTROLS YOUR VISIBILITY.",
      us_verdict:"YOUR SIGNAL INTELLIGENCE CONTROLS YOUR POSITIONING.",
      them_how:"Splice has 4M+ sounds. Discovery is entirely algorithm-dependent. Splice optimizes the algorithm for engagement and subscription retention — not for equitable artist discovery or financial success. New contributors start with zero visibility. Established contributors with viral sounds dominate the discovery layer. The rich get richer. New talent is buried.",
      them_tech:"Splice search: keyword + category + BPM + key filters. Trending: engagement-driven ranking. Featured placement: editorial curation by Splice staff. No transparency into ranking factors. No artist dashboard showing why your sample ranked 4,000 vs 40. No predictive tools telling you what will surface. Visibility: a black box controlled entirely by the platform.",
      us_how:"GABRIEL's commercial placement engine matches producer briefs directly to artist samples. If a producer needs a specific BPM, key, spectral characteristic, or mood — GABRIEL surfaces the exact samples from Guild members that fit. Discovery is driven by signal intelligence, not engagement metrics. Every sample has an equal algorithmic shot.",
      us_tech:"GABRIEL commercial matching: producer posts brief → GABRIEL scans Guild sample library using Librosa features (tempo, key, mood, spectral centroid, harmonic complexity) → returns ranked matches → producer browses with full signal context. Artist dashboard: shows exactly why their samples are or aren't surfacing for specific brief types. Transparent. Actionable. Predictive.",
    },
    {
      id:"splice_community",
      title:"The Community That Built the Platform",
      impact:"HIGH",
      them_verdict:"YOUR COMMUNITY BUILT THEIR MOAT.",
      us_verdict:"YOUR COMMUNITY IS YOUR COLLECTIVE ASSET.",
      them_how:"Splice's 4 million sound library — the core competitive moat that makes their subscription valuable — was built by hundreds of thousands of independent sound designers, musicians, and producers. The contributors who built this moat do not share in Splice's valuation. They received flat fees. Splice's investors received the return.",
      them_tech:"Splice raised $55M Series C in 2021. Valuation: reported at $500M+. Total contributor payout at $2 average per sample for 4M samples: ~$8M total historical payouts to all contributors combined. Splice valuation: $500M. Contributor share of that value: 0%. The moat was built by the community. The community did not receive equity, profit sharing, or compounding return.",
      us_how:"The NOIZY Guild is a community that receives a share of the platform value it creates. Guild members above threshold earn equity-equivalent tokens in NOIZY's creator economy. When the platform grows because of the community that built it, the community participates in that growth.",
      us_tech:"NOIZY Creator Economy: Guild members earn NOIZY Credits (convertible to cash or held as platform stake) based on: contribution volume, stream earnings, lift activity, and tenure. When NOIZY raises investment, 5% of each round is allocated to a Community Pool distributed to active Guild members by contribution score. Not charity — structural equity participation.",
    },
    {
      id:"splice_rent",
      title:"The Subscription You Can Never Stop Paying",
      impact:"HIGH",
      them_verdict:"STOP SUBSCRIBING. LOSE ACCESS TO YOUR OWN WORKFLOW.",
      us_verdict:"STOP SUBSCRIBING. KEEP EVERYTHING YOU BUILT.",
      them_how:"Splice is a $10.99/month subscription for sample access. Cancel: lose access to downloaded credits, lose your pack history, lose the organizational tools you used to build your library. The workflow you built around Splice — the sample organization, the project integration, the search history — is Splice's property. Your creative process is hostage to your subscription.",
      them_tech:"Splice Sounds cancellation: downloaded samples remain (if saved locally). Sample credits: expire. Pack subscriptions: terminate. Collaborative features: gone. The 'workflow layer' — saved searches, project associations, custom tags, stems content — all Splice property, non-exportable. Switching cost: rebuild your entire sample library curation from scratch.",
      us_how:"NOIZY subscription: cancel anytime. Your entire sample library, curation, tagging, project history, GABRIEL fingerprints, earnings records — all exportable as a portable archive. The creative workflow you built in NOIZY travels with you wherever you go. No hostage subscription. No lock-in.",
      us_tech:"NOIZY full portability package: /export returns structured ZIP with: all downloaded samples (WAV), signal fingerprints (JSON), project associations (XML), earnings history (CSV), GABRIEL creative profile (JSON). Readable by any DAW. Import tool: upload NOIZY archive to any partner platform. Migration takes 2 minutes. Carrier pigeon optional.",
    },
    {
      id:"splice_rent2",
      title:"The Rent vs. Own Problem",
      impact:"MEDIUM",
      them_verdict:"YOU RENT TOOLS. PLATFORMS OWN EVERYTHING.",
      us_verdict:"YOU OWN YOUR TOOLS. YOUR TOOLS EARN FOR YOU.",
      them_how:"Suno: $30/month for 10,000 credits. Splice: $10.99/month for sample access. Moises: $15.99/month for stem separation. ElevenLabs: $22-99/month for voice generation. Stack these subscriptions: $80-165/month minimum for a professional creator. Each platform extracts rent. None of them pay the creator for their contribution to the platform's value.",
      them_tech:"Total subscription spend for a professional creator using Suno+Splice+Moises+ElevenLabs: $70-165/month = $840-1,980/year. Return from these platforms: $0 (Suno — no royalty structure). $2 average per sample accepted (Splice — flat fee). Credits (ElevenLabs — not cash). $0 (Moises — no creator economy). The platforms collectively extract $1,500-2,000/year from a professional creator and return approximately $20-50 in flat fees.",
      us_how:"NOIZY is one subscription that replaces all four — and pays you. Generation, stem separation, voice modeling, sample marketplace, analytics, distribution — unified. And every commercial use of anything you create routes 75% back to you. The platform pays the creator. That inverts the entire subscription economy.",
      us_tech:"NOIZY All-Access: $49/month (Studio tier). Replaces: Suno Pro ($10), Splice ($11), Moises Max ($16), ElevenLabs Creator ($22) = $59/month saved, plus $0 combined creator income from those platforms vs NOIZY's 75% routing. For an artist earning $500/month in commercial usage: NOIZY returns $375 vs $0. Net position vs competing stack: +$375 income + $59 savings = $434/month artist-positive delta.",
    },
  ],
};

// ─── STATS ──────────────────────────────────────────────────────────────────
const PLATFORM_STATS = {
  suno: [
    { label:"Songs Generated", value:"500M+", note:"100M users" },
    { label:"Model Lawsuit Settlement", value:"$0", note:"disclosed to artists" },
    { label:"Training Data", value:"UNDISCLOSED", note:"after RIAA lawsuit" },
    { label:"Artist Royalty", value:"$0", note:"from Suno's revenue" },
    { label:"Valuation", value:"$500M+", note:"built on unlicensed music" },
  ],
  moises: [
    { label:"Users", value:"40M+", note:"Music.AI" },
    { label:"Daily Minutes Processed", value:"2M+", note:"your music, their training" },
    { label:"AI Models", value:"50+", note:"trained on unattributed music" },
    { label:"Artist Attribution", value:"NONE", note:"in training corpus" },
    { label:"Creator Economy", value:"$0", note:"built in" },
  ],
  splice: [
    { label:"Sounds in Library", value:"4M+", note:"built by contributors" },
    { label:"Avg Payout Per Sample", value:"$0.50-5", note:"one-time, perpetual license" },
    { label:"Contributor Share of $500M+ Val", value:"0%", note:"zero equity participation" },
    { label:"Monthly Subscription", value:"$10.99", note:"you pay to access your own community" },
    { label:"Community Profit Share", value:"NONE", note:"investors only" },
  ],
};

// ─── UNIFIED PRINCIPLES ─────────────────────────────────────────────────────
const PRINCIPLES = [
  { n:"01", title:"Generation belongs to the generative.", body:"Everything created using NOIZY's tools is the artist's property. Not the platform's content. Not a licensed output. Your work." },
  { n:"02", title:"Intelligence flows to the artist.", body:"Signal analysis, creative fingerprints, commercial placement intelligence — all of it belongs to the artist who created the work being analyzed." },
  { n:"03", title:"Revenue routes to the creator first.", body:"75% of every commercial transaction to the artist. Automatically. In cash. Without asking. The platform takes remainder, not the lead." },
  { n:"04", title:"Consent is architecture, not policy.", body:"Every use of an artist's voice, music, or samples is governed by terms the artist wrote — enforced at the infrastructure level, not subject to platform TOS updates." },
  { n:"05", title:"Training data is not raw material.", body:"Music trained on music that was trained on stolen music has a provenance problem. NOIZY builds from fully consented, fully attributed, fully compensated source data only." },
  { n:"06", title:"Subscriptions should pay the subscriber.", body:"A creator platform that extracts rent without returning value is extraction dressed as service. NOIZY's subscription model generates net positive income for active artists." },
  { n:"07", title:"Community value belongs to community.", body:"The library, the network, the reputation — these are built by the artists who participate. They must share in the platform value they create." },
  { n:"08", title:"Portability is sovereignty.", body:"Your catalog, your history, your intelligence, your earnings — all exportable, all yours, always. A platform you cannot leave owns you. NOIZY does not own you." },
  { n:"09", title:"Discovery should be blind to engagement history.", body:"New artists deserve equal algorithmic consideration. Signal intelligence matches, not popularity rankings, determine who gets found for what." },
  { n:"10", title:"Build what you needed first.", body:"RSP_001 is the proof. An artist with 40 years of craft and a C3 injury built the platform he needed. Every feature exists because a real artist needed it first." },
];

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

const Tag = ({ text, color, bg }) => (
  <span style={{
    padding:"3px 10px", borderRadius:2,
    border:`1px solid ${color}`, background:bg,
    color, fontFamily:"Syne Mono", fontSize:9, letterSpacing:2,
    display:"inline-block",
  }}>{text}</span>
);

const ImpactTag = ({ level }) => {
  const c = level==="EXISTENTIAL"?"#FF3333":level==="CRITICAL"?"#FF8C00":"#C9A84C";
  return <Tag text={level} color={c} bg={`${c}15`}/>;
};

const StatGrid = ({ stats, brand }) => (
  <div style={{display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:1, marginBottom:24}}>
    {stats.map((s,i)=>(
      <div key={i} style={{
        padding:"16px", background:"#080808",
        borderTop:`2px solid ${brand.accent}`,
      }}>
        <div style={{fontFamily:"Syne", fontSize:18, fontWeight:800, color:brand.accent, marginBottom:4, letterSpacing:-0.5}}>{s.value}</div>
        <div style={{fontFamily:"Syne Mono", fontSize:9, color:"#EEE", letterSpacing:1, marginBottom:3}}>{s.label}</div>
        <div style={{fontFamily:"Syne Mono", fontSize:9, color:"#444", fontStyle:"italic"}}>{s.note}</div>
      </div>
    ))}
  </div>
);

const ReversalBlock = ({ item, brand, idx }) => {
  const [open, setOpen] = useState(idx < 2);
  return (
    <div style={{
      marginBottom:8,
      border:`1px solid ${open ? brand.border : "#111"}`,
      borderLeft:`3px solid ${
        item.impact==="EXISTENTIAL"?"#FF3333":
        item.impact==="CRITICAL"?"#FF8C00":"#C9A84C"
      }`,
      borderRadius:2, overflow:"hidden",
      transition:"border-color 0.2s",
    }}>
      <button onClick={()=>setOpen(o=>!o)} style={{
        width:"100%", padding:"14px 20px",
        background:open?"#0C0C0A":"#080808",
        border:"none", cursor:"pointer", textAlign:"left",
        display:"flex", alignItems:"center", gap:14,
      }}>
        <ImpactTag level={item.impact}/>
        <span style={{fontFamily:"Syne", fontSize:13, fontWeight:700, color:"#EEE", flex:1, letterSpacing:0.3}}>{item.title}</span>
        <span style={{
          fontFamily:"Syne Mono", fontSize:9, color:"#E74C3C",
          letterSpacing:1, marginRight:12, opacity:0.8,
        }}>{item.them_verdict}</span>
        <span style={{color:"#333", fontSize:12}}>{open?"▲":"▼"}</span>
      </button>
      {open && (
        <div style={{
          display:"grid", gridTemplateColumns:"1fr 1fr",
          gap:1, background:"#0A0A0A",
          borderTop:"1px solid #111",
          animation:"fadeIn 0.2s ease",
        }}>
          {/* Them */}
          <div style={{padding:"20px 24px", background:`${brand.dim}`, borderRight:"1px solid #111"}}>
            <div style={{
              fontFamily:"Syne", fontSize:10, fontWeight:800,
              color:brand.accent, letterSpacing:3, marginBottom:10,
            }}>{brand.name} REALITY</div>
            <div style={{fontFamily:"Libre Baskerville", fontSize:12, color:"#888", lineHeight:1.8, marginBottom:14}}>{item.them_how}</div>
            <div style={{
              padding:"12px 14px", background:"rgba(0,0,0,0.4)",
              borderLeft:`2px solid ${brand.accent}44`, marginBottom:12,
            }}>
              <div style={{fontFamily:"Syne Mono", fontSize:8, color:brand.accent+"66", letterSpacing:2, marginBottom:6}}>TECHNICAL REALITY</div>
              <div style={{fontFamily:"Syne Mono", fontSize:10, color:"#555", lineHeight:1.7}}>{item.them_tech}</div>
            </div>
            <div style={{
              padding:"8px 14px",
              background:"rgba(231,76,60,0.06)",
              border:"1px solid rgba(231,76,60,0.15)",
              fontFamily:"Syne", fontSize:10, fontWeight:800,
              color:"#E74C3C", letterSpacing:1,
            }}>{item.them_verdict}</div>
          </div>
          {/* Us */}
          <div style={{padding:"20px 24px", background:"#080808"}}>
            <div style={{
              fontFamily:"Syne", fontSize:10, fontWeight:800,
              color:"#C9A84C", letterSpacing:3, marginBottom:10,
            }}>NOIZY.ai INVERSION</div>
            <div style={{fontFamily:"Libre Baskerville", fontSize:12, color:"#AAA", lineHeight:1.8, marginBottom:14}}>{item.us_how}</div>
            <div style={{
              padding:"12px 14px", background:"rgba(0,0,0,0.4)",
              borderLeft:"2px solid rgba(201,168,76,0.3)", marginBottom:12,
            }}>
              <div style={{fontFamily:"Syne Mono", fontSize:8, color:"#C9A84C66", letterSpacing:2, marginBottom:6}}>TECHNICAL IMPLEMENTATION</div>
              <div style={{fontFamily:"Syne Mono", fontSize:10, color:"#666", lineHeight:1.7}}>{item.us_tech}</div>
            </div>
            <div style={{
              padding:"8px 14px",
              background:"rgba(201,168,76,0.08)",
              border:"1px solid rgba(201,168,76,0.25)",
              fontFamily:"Syne", fontSize:10, fontWeight:800,
              color:"#C9A84C", letterSpacing:1,
            }}>{item.us_verdict}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── COST CALCULATOR ─────────────────────────────────────────────────────────
const CostCalc = () => {
  const [earnings, setEarnings] = useState(500);
  const stackCost = 10+11+16+22; // Suno+Splice+Moises+EL
  const stackReturn = earnings * 0.15;
  const noizyReturn = earnings * 0.75;
  const noizyDelta = noizyReturn - stackCost;
  const stackDelta = stackReturn - stackCost;

  return (
    <div style={{
      padding:"28px 32px",
      background:"#080808",
      border:"1px solid #1A1A1A",
      borderTop:"3px solid #C9A84C",
      borderRadius:2, marginTop:32,
    }}>
      <div style={{fontFamily:"Syne", fontSize:11, fontWeight:800, letterSpacing:3, color:"#C9A84C", marginBottom:20}}>
        ARTIST ECONOMICS CALCULATOR
      </div>
      <div style={{marginBottom:20}}>
        <div style={{fontFamily:"Syne Mono", fontSize:10, color:"#555", marginBottom:8}}>
          YOUR MONTHLY COMMERCIAL EARNINGS FROM MUSIC/VOICE
        </div>
        <div style={{display:"flex", alignItems:"center", gap:16}}>
          <input
            type="range" min="0" max="5000" step="50"
            value={earnings} onChange={e=>setEarnings(+e.target.value)}
            style={{flex:1, accentColor:"#C9A84C"}}
          />
          <div style={{fontFamily:"Syne", fontSize:24, fontWeight:800, color:"#EEE", width:80}}>
            ${earnings.toLocaleString()}
          </div>
        </div>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16}}>
        <div style={{padding:"20px", background:"rgba(231,76,60,0.04)", border:"1px solid rgba(231,76,60,0.1)", borderRadius:2}}>
          <div style={{fontFamily:"Syne", fontSize:10, fontWeight:800, color:"#E74C3C", letterSpacing:2, marginBottom:14}}>COMPETITOR STACK</div>
          {[
            {l:"Suno Pro",v:"-$10"},
            {l:"Splice",v:"-$11"},
            {l:"Moises Max",v:"-$16"},
            {l:"ElevenLabs Creator",v:"-$22"},
            {l:"Your earnings × 15% est. return",v:`+$${Math.floor(stackReturn)}`},
          ].map((r,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #0F0F0F"}}>
              <span style={{fontFamily:"Syne Mono",fontSize:10,color:"#555"}}>{r.l}</span>
              <span style={{fontFamily:"Syne",fontSize:12,fontWeight:700,color:r.v.startsWith("+")?"#2ECC71":"#E74C3C"}}>{r.v}</span>
            </div>
          ))}
          <div style={{
            marginTop:12,display:"flex",justifyContent:"space-between",
            padding:"10px 0",borderTop:"1px solid #222",
          }}>
            <span style={{fontFamily:"Syne",fontSize:11,fontWeight:800,color:"#666"}}>NET MONTHLY</span>
            <span style={{fontFamily:"Syne",fontSize:20,fontWeight:800,color:stackDelta>0?"#2ECC71":"#E74C3C"}}>{stackDelta>0?"+":""}{stackDelta}/mo</span>
          </div>
        </div>
        <div style={{padding:"20px", background:"rgba(201,168,76,0.04)", border:"1px solid rgba(201,168,76,0.15)", borderRadius:2}}>
          <div style={{fontFamily:"Syne", fontSize:10, fontWeight:800, color:"#C9A84C", letterSpacing:2, marginBottom:14}}>NOIZY.ai STUDIO</div>
          {[
            {l:"NOIZY Studio (all tools)",v:"-$49"},
            {l:"Generation, stems, voice, samples",v:"included"},
            {l:"Your earnings × 75% return",v:`+$${Math.floor(noizyReturn)}`},
          ].map((r,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #0F0F0F"}}>
              <span style={{fontFamily:"Syne Mono",fontSize:10,color:"#666"}}>{r.l}</span>
              <span style={{fontFamily:"Syne",fontSize:12,fontWeight:700,color:r.v.startsWith("+")||r.v==="included"?"#2ECC71":"#C9A84C"}}>{r.v}</span>
            </div>
          ))}
          <div style={{
            marginTop:12,display:"flex",justifyContent:"space-between",
            padding:"10px 0",borderTop:"1px solid #222",
          }}>
            <span style={{fontFamily:"Syne",fontSize:11,fontWeight:800,color:"#AAA"}}>NET MONTHLY</span>
            <span style={{fontFamily:"Syne",fontSize:20,fontWeight:800,color:"#C9A84C"}}>+${Math.max(0,noizyDelta).toLocaleString()}/mo</span>
          </div>
        </div>
      </div>
      <div style={{
        marginTop:16,padding:"12px 16px",
        background:"rgba(201,168,76,0.04)",border:"1px solid rgba(201,168,76,0.1)",
        display:"flex",justifyContent:"space-between",alignItems:"center",
      }}>
        <span style={{fontFamily:"Syne Mono",fontSize:10,color:"#555"}}>ARTIST-POSITIVE DELTA vs COMPETITOR STACK</span>
        <span style={{fontFamily:"Syne",fontSize:22,fontWeight:800,color:"#2ECC71"}}>
          +${Math.max(0,noizyDelta-stackDelta).toLocaleString()}/month
        </span>
      </div>
    </div>
  );
};

// ─── MAIN ───────────────────────────────────────────────────────────────────
export default function ArtistFirst() {
  const [platform, setPlatform] = useState("suno");
  const [view, setView] = useState("reversals");

  const brand = BRANDS[platform] || BRANDS.suno;

  return (
    <div style={{
      background:"#050505", color:"#EEE",
      minHeight:"100vh", fontFamily:"Syne, sans-serif",
    }}>
      <style>{FONTS}{`
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes riseUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:#1A1A1A}
        button{cursor:pointer}
      `}</style>

      {/* ── MASTHEAD ──────────────────────────────── */}
      <div style={{
        padding:"28px 40px 24px",
        background:"#030303",
        borderBottom:"1px solid #0F0F0F",
      }}>
        <div style={{
          display:"flex", alignItems:"flex-end",
          justifyContent:"space-between", marginBottom:16,
        }}>
          <div>
            <div style={{
              fontFamily:"Syne Mono", fontSize:9, letterSpacing:4,
              color:"#333", marginBottom:8,
            }}>NOIZY.ai · ARTIST INTELLIGENCE REPORT · {new Date().getFullYear()}</div>
            <div style={{
              fontFamily:"Libre Baskerville", fontSize:40,
              fontWeight:700, lineHeight:1.1, color:"#EEE",
            }}>
              The Artist-First<br/>
              <span style={{color:"#C9A84C", fontStyle:"italic"}}>AI Platform</span>
            </div>
          </div>
          <div style={{
            textAlign:"right", maxWidth:380,
            fontFamily:"Libre Baskerville", fontSize:13,
            fontStyle:"italic", color:"#444", lineHeight:1.7,
          }}>
            "Suno generates music and keeps the value. Moises analyzes your music and keeps the intelligence. Splice sells your samples and keeps the equity. NOIZY.ai inverts every single one of these decisions."
          </div>
        </div>

        {/* Sub-nav */}
        <div style={{
          display:"flex", gap:0, borderTop:"1px solid #111",
          paddingTop:0, marginTop:0,
        }}>
          {[
            {id:"reversals", label:"SYSTEM REVERSALS"},
            {id:"principles", label:"10 PRINCIPLES"},
            {id:"calculator", label:"ARTIST ECONOMICS"},
          ].map(t=>(
            <button key={t.id} onClick={()=>setView(t.id)} style={{
              padding:"12px 20px",
              background:view===t.id?"rgba(201,168,76,0.06)":"transparent",
              border:"none",
              borderBottom:`2px solid ${view===t.id?"#C9A84C":"transparent"}`,
              color:view===t.id?"#C9A84C":"#444",
              fontFamily:"Syne Mono", fontSize:9, letterSpacing:2,
              marginRight:2, transition:"all 0.15s",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* ── REVERSALS ─────────────────────────────── */}
      {view==="reversals" && (
        <div style={{padding:"28px 40px", maxWidth:1400, margin:"0 auto", animation:"riseUp 0.3s ease"}}>

          {/* Platform selector */}
          <div style={{
            display:"grid", gridTemplateColumns:"repeat(3,1fr)",
            gap:12, marginBottom:28,
          }}>
            {["suno","moises","splice"].map(p=>{
              const b=BRANDS[p];
              const active=platform===p;
              return (
                <button key={p} onClick={()=>setPlatform(p)} style={{
                  padding:"18px 20px",
                  background:active?`${b.dim}`:"#080808",
                  border:`1px solid ${active?b.accent:"#141414"}`,
                  borderTop:`3px solid ${active?b.accent:"#1A1A1A"}`,
                  borderRadius:2, textAlign:"left",
                  transition:"all 0.2s",
                }}>
                  <div style={{
                    fontFamily:"Syne", fontSize:18, fontWeight:800,
                    color:active?b.accent:"#444", letterSpacing:2, marginBottom:4,
                  }}>{b.name}</div>
                  <div style={{fontFamily:"Syne Mono", fontSize:9, color:"#444", letterSpacing:1}}>{b.tag}</div>
                  <div style={{fontFamily:"Syne Mono", fontSize:9, color:"#2A2A2A", marginTop:4}}>
                    {REVERSALS[p]?.length || 0} reversals documented
                  </div>
                </button>
              );
            })}
          </div>

          {/* Stats */}
          {PLATFORM_STATS[platform] && <StatGrid stats={PLATFORM_STATS[platform]} brand={brand}/>}

          {/* What they built — honest */}
          <div style={{
            padding:"16px 24px", marginBottom:20,
            background:`${brand.dim}`,
            border:`1px solid ${brand.border}`,
            borderRadius:2,
            display:"flex", gap:20, alignItems:"flex-start",
          }}>
            <div style={{fontFamily:"Syne", fontSize:32, fontWeight:900, color:brand.accent, flexShrink:0}}>!</div>
            <div>
              <div style={{fontFamily:"Syne", fontSize:10, fontWeight:800, letterSpacing:3, color:brand.accent, marginBottom:6}}>HONEST ACKNOWLEDGMENT</div>
              <div style={{fontFamily:"Libre Baskerville", fontSize:12, color:"#777", lineHeight:1.7}}>
                {platform==="suno" && "Suno is a technically extraordinary product. Their music generation quality is genuinely impressive. Tens of millions of people experience genuine joy using it. The problem is not the technology. The problem is who owns the value the technology creates — and the answer is: not the artists whose work trained it."}
                {platform==="moises" && "Moises/Music.AI built legitimate, useful tools that help musicians practice, learn, and create. The Moises app won Apple's iPad App of the Year 2024 for good reason. The problem is that 40 million users processing their personal music libraries created an extraordinary training corpus — and none of those artists participated in the value that corpus created."}
                {platform==="splice" && "Splice genuinely democratized sample-based production. They paid thousands of independent creators for sounds that would otherwise have gone unheard. The problem is the math: contributors received flat one-time fees for perpetual licenses, while Splice compounded those contributions into a $500M+ valuation. The contribution was real. The equity was not shared."}
              </div>
            </div>
          </div>

          {/* Reversals */}
          <div style={{fontFamily:"Syne Mono", fontSize:9, letterSpacing:3, color:"#333", marginBottom:12}}>
            {brand.name} → NOIZY.ai — {REVERSALS[platform]?.length} ARCHITECTURAL INVERSIONS
          </div>
          {(REVERSALS[platform]||[]).map((item,i)=>(
            <ReversalBlock key={item.id} item={item} brand={brand} idx={i}/>
          ))}
        </div>
      )}

      {/* ── PRINCIPLES ────────────────────────────── */}
      {view==="principles" && (
        <div style={{padding:"36px 40px", maxWidth:1000, margin:"0 auto", animation:"riseUp 0.3s ease"}}>
          <div style={{
            fontFamily:"Libre Baskerville", fontSize:36, fontWeight:700,
            fontStyle:"italic", color:"#EEE", marginBottom:8,
          }}>10 Principles of an<br/><span style={{color:"#C9A84C"}}>Artist-First Platform</span></div>
          <div style={{fontFamily:"Syne Mono", fontSize:9, color:"#444", letterSpacing:2, marginBottom:36}}>
            APPLIED ACROSS SUNO · MOISES · SPLICE · ELEVENLABS AND EVERY PLATFORM THAT COMES AFTER
          </div>

          <div style={{
            padding:"16px 24px", marginBottom:32,
            background:"rgba(201,168,76,0.04)",
            border:"1px solid rgba(201,168,76,0.1)", borderRadius:2,
            fontFamily:"Libre Baskerville", fontSize:14,
            fontStyle:"italic", color:"#666", lineHeight:1.8,
          }}>
            These are not aspirational values. They are design constraints. Every feature of NOIZY.ai is evaluated against each of these principles before it ships. If it fails one, it doesn't ship. That's the commitment.
          </div>

          {PRINCIPLES.map((p,i)=>(
            <div key={i} style={{
              display:"grid", gridTemplateColumns:"60px 1fr",
              gap:24, padding:"24px 0",
              borderBottom:"1px solid #0F0F0F",
              animation:`riseUp 0.4s ease ${i*0.05}s both`,
            }}>
              <div style={{
                fontFamily:"Syne", fontSize:36, fontWeight:900,
                color:"#111", letterSpacing:-1, lineHeight:1,
              }}>{p.n}</div>
              <div>
                <div style={{
                  fontFamily:"Syne", fontSize:16, fontWeight:800,
                  color:"#EEE", marginBottom:8, letterSpacing:0.3,
                }}>{p.title}</div>
                <div style={{
                  fontFamily:"Libre Baskerville", fontSize:13,
                  color:"#666", lineHeight:1.8,
                }}>{p.body}</div>
              </div>
            </div>
          ))}

          <div style={{
            marginTop:40, padding:"28px 32px",
            background:"rgba(201,168,76,0.04)",
            border:"1px solid rgba(201,168,76,0.12)",
            borderRadius:2, textAlign:"center",
          }}>
            <div style={{
              fontFamily:"Libre Baskerville", fontSize:24, fontWeight:700,
              fontStyle:"italic", color:"#EEE", lineHeight:1.5, marginBottom:16,
            }}>
              "The platforms above built companies worth hundreds of millions<br/>
              by extracting value from artists. NOIZY.ai is building a platform<br/>
              worth the same by returning value to artists.<br/>
              One of these compounds. The other collapses."
            </div>
            <div style={{fontFamily:"Syne Mono", fontSize:9, color:"#444", letterSpacing:3}}>
              ROB PLOWMAN · FOUNDER · NOIZYVOX · NOIZY.ai · OTTAWA, ONTARIO
            </div>
          </div>
        </div>
      )}

      {/* ── CALCULATOR ────────────────────────────── */}
      {view==="calculator" && (
        <div style={{padding:"36px 40px", maxWidth:900, margin:"0 auto", animation:"riseUp 0.3s ease"}}>
          <div style={{
            fontFamily:"Libre Baskerville", fontSize:36, fontWeight:700,
            fontStyle:"italic", color:"#EEE", marginBottom:8,
          }}>Artist Economics</div>
          <div style={{fontFamily:"Syne Mono", fontSize:9, color:"#444", letterSpacing:2, marginBottom:8}}>
            WHAT THE COMPETITOR STACK COSTS YOU VS WHAT NOIZY.ai PAYS YOU
          </div>
          <div style={{
            fontFamily:"Libre Baskerville", fontSize:13, color:"#555",
            lineHeight:1.7, marginBottom:28, maxWidth:660,
          }}>
            Suno + Splice + Moises + ElevenLabs is a subscription stack that costs $59/month minimum and returns approximately 15% of your commercial earnings — if you're lucky. NOIZY.ai costs $49/month and returns 75% of everything you earn commercially. Drag the slider to see your personal delta.
          </div>

          {/* Platform-by-platform breakdown */}
          <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:24}}>
            {[
              {name:"Suno",price:"$10-30/mo",back:"$0",tag:"No royalty structure",color:"#FF6B35"},
              {name:"Moises",price:"$8-16/mo",back:"$0",tag:"No creator economy",color:"#7C3AED"},
              {name:"Splice",price:"$11/mo",back:"~$2/sample",tag:"One-time flat fee",color:"#0EA5E9"},
              {name:"ElevenLabs",price:"$22-99/mo",back:"Credits only",tag:"In-platform scrip",color:"#888"},
            ].map((p,i)=>(
              <div key={i} style={{
                padding:"16px", background:"#080808",
                borderTop:`3px solid ${p.color}`, borderRadius:2,
              }}>
                <div style={{fontFamily:"Syne",fontSize:14,fontWeight:800,color:p.color,marginBottom:8}}>{p.name}</div>
                <div style={{fontFamily:"Syne Mono",fontSize:10,color:"#E74C3C",marginBottom:4}}>Costs you: {p.price}</div>
                <div style={{fontFamily:"Syne Mono",fontSize:10,color:"#555",marginBottom:8}}>Returns: {p.back}</div>
                <div style={{fontSize:9,color:"#333",fontFamily:"Syne Mono",fontStyle:"italic"}}>{p.tag}</div>
              </div>
            ))}
          </div>

          <CostCalc/>

          <div style={{
            marginTop:28, padding:"24px 28px",
            background:"#080808", border:"1px solid #141414",
            borderLeft:"4px solid #C9A84C", borderRadius:2,
          }}>
            <div style={{fontFamily:"Syne", fontSize:10, fontWeight:800, letterSpacing:3, color:"#C9A84C", marginBottom:12}}>THE STRUCTURAL ARGUMENT</div>
            <div style={{fontFamily:"Libre Baskerville", fontSize:13, color:"#666", lineHeight:1.8}}>
              Suno, Moises, Splice, and ElevenLabs each built a subscription business where the creator pays the platform. NOIZY.ai builds a royalty business where the platform pays the creator. At $0 in commercial earnings, NOIZY costs slightly less than the combined stack. At any level of commercial success, NOIZY is dramatically more artist-positive. This is not a feature comparison. It is a fundamentally different economic architecture. Every competitor reviewed here chose extraction. NOIZY chose distribution. One of these is a bet on creator success. The other is a bet on creator dependency.
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ────────────────────────────────── */}
      <div style={{
        marginTop:60, padding:"20px 40px",
        borderTop:"1px solid #0A0A0A",
        display:"flex", justifyContent:"space-between", alignItems:"center",
        background:"#030303",
      }}>
        <div>
          <div style={{fontFamily:"Syne",fontSize:14,fontWeight:800,letterSpacing:2,color:"#C9A84C"}}>NOIZY.ai</div>
          <div style={{fontFamily:"Syne Mono",fontSize:8,color:"#2A2A2A",letterSpacing:2,marginTop:2}}>ARTIST-FIRST AI PLATFORM</div>
        </div>
        <div style={{
          fontFamily:"Libre Baskerville",fontSize:12,
          fontStyle:"italic",color:"#1A1A1A",textAlign:"center",
        }}>
          Suno. Moises. Splice. ElevenLabs.<br/>
          Inverted. Artist-first. Always.
        </div>
        <div style={{fontFamily:"Syne Mono",fontSize:8,color:"#1A1A1A",letterSpacing:2,textAlign:"right"}}>
          noizyvox@noizy.ai<br/>noizy.ai
        </div>
      </div>
    </div>
  );
}
