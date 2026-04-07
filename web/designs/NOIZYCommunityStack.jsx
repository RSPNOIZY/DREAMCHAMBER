import { useState } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300;1,9..40,400&family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&display=swap');`;

const C = {
  void:     "#07050E",
  deep:     "#0C0A18",
  cosmos:   "#100E1E",
  nebula:   "#16122A",
  warmwht:  "#FAF8F4",
  cream:    "#F5F0E8",
  stardust: "#B5A898",
  mid:      "#8A7B6A",
  // Brand colors
  gold:     "#C9A84C",
  goldlt:   "#E8C97A",
  cyan:     "#3DC9C0",
  cyanlt:   "#7EE8E4",
  sage:     "#6BAF7A",
  rose:     "#C46A8A",
  amber:    "#E8860A",
  amberlt:  "#F5A83E",
  // Platform colors
  discord:  "#5865F2",
  discordlt:"#8891F5",
  slack:    "#4A154B",
  slacklt:  "#E01E5A",
  eleven:   "#FF6B35",
  claudeai: "#CC785C",
};

// ─── COMPETITIVE LANDSCAPE ────────────────────────────────────────────────────

const COMPETITORS = [
  {
    name:"ElevenLabs", color:"#FF6B35", platform:["discord","slack"],
    owns:"Voice synthesis & SFX. Top Discord server for voice AI. Text-to-SFX. Royalty-free soundboards.",
    missing:"No consent architecture. No royalty routing. No provenance. Voices consumed, not owned.",
    threat:"HIGH — best UX, biggest community, deepest Discord integration",
  },
  {
    name:"Soundverse", color:"#7C4DFF", platform:["discord"],
    owns:"Dynamic AI music in Discord. Mood-responsive scores. Prompt-to-music in voice channels.",
    missing:"No creator compensation. No attribution. No Fair Trade. Music generated, not owned.",
    threat:"MEDIUM — strong Discord presence, weak IP infrastructure",
  },
  {
    name:"Voice.ai", color:"#00C4CC", platform:["discord"],
    owns:"Real-time voice changing in Discord voice channels. Community compute model. Live voice morphing.",
    missing:"No Voice Estate. No consent ledger. No perpetual royalty. Community gives compute, gets nothing.",
    threat:"MEDIUM — mass user base, no ethical architecture",
  },
  {
    name:"Fish Audio", color:"#4ECDC4", platform:["discord"],
    owns:"Emotional voice cloning. 'Voices with soul.' Growing developer Discord community.",
    missing:"No consent-as-code. No IP framework. Emotional authenticity without ethical infrastructure.",
    threat:"LOW-MEDIUM — strong positioning, no legal protection layer",
  },
  {
    name:"Claude / Anthropic", color:C.claudeai, platform:["discord","slack"],
    owns:"Text and code domination. Claude Code in Slack is transformative. Agentic coding workflows.",
    missing:"ZERO audio layer. No voice synthesis. No music generation. No SFX. The gap is wide open.",
    threat:"ALLY — Claude's reasoning + NOIZY's audio ethics = unstoppable combination",
  },
];

// ─── THE GAP MATRIX ──────────────────────────────────────────────────────────

const CAPABILITIES = [
  "Voice Synthesis",
  "Music Generation",
  "SFX Generation",
  "Consent Architecture",
  "Royalty Routing",
  "Voice Estate / IP",
  "Provenance / Watermarking",
  "Agentic Reasoning",
  "Fair Trade Certified",
  "500-Year Vision",
];

const GAP_DATA = {
  "ElevenLabs":  ["✓","✗","✓","✗","✗","✗","partial","✗","✗","✗"],
  "Soundverse":  ["✗","✓","✗","✗","✗","✗","✗","✗","✗","✗"],
  "Voice.ai":    ["✓","✗","✗","✗","✗","✗","✗","✗","✗","✗"],
  "Fish Audio":  ["✓","✗","✗","✗","✗","✗","✗","✗","✗","✗"],
  "Claude Only": ["✗","✗","✗","✗","✗","✗","✗","✓","✗","✗"],
  "NOIZY + Claude":["✓","✓","✓","✓","✓","✓","✓","✓","✓","✓"],
};

// ─── DISCORD ARCHITECTURE ────────────────────────────────────────────────────

const DISCORD_CATEGORIES = [
  {
    name:"THE CIVILIZATION",
    color: C.gold,
    channels:[
      { name:"welcome-to-the-civilization", type:"text", desc:"First channel every creator sees. The Fair Trade pledge. The DreamChamber manifesto. One button: Sign.", pinned:["Fair Trade Pledge","Voice Estate Guide","How GABRIEL Works"] },
      { name:"announcements", type:"text", desc:"Certification milestones, signatory counts, platform news. GABRIEL auto-posts when pledge crosses 1K increments.", pinned:[] },
      { name:"the-500-year-codex", type:"text", desc:"Living documentation of the civilization. Every creative decision, protocol update, and human partnership. Permanent record.", pinned:[] },
    ],
  },
  {
    name:"DREAMCHAMBER — LIVE",
    color: C.cyan,
    channels:[
      { name:"dreamchamber-stage", type:"voice", desc:"Main stage. Rob speaks. GABRIEL + Claude listen and respond in real time. The community watches the transmission happen.", pinned:[] },
      { name:"gabriel-live-feed", type:"text", desc:"GABRIEL agent output posted here in real time during DreamChamber sessions. Memcell mutations, signal analysis, creative outputs.", pinned:[] },
      { name:"build-in-public", type:"text", desc:"Every NOIZY.ai component, every new section of the Fair Trade page, every code output — dropped here as it's built. The civilization visible mid-construction.", pinned:[] },
      { name:"dreamchamber-archive", type:"forum", desc:"Every past DreamChamber session archived with transcript, GABRIEL outputs, and key decisions made.", pinned:[] },
    ],
  },
  {
    name:"GENIUS CREATOR LOUNGE",
    color: C.amberlt,
    channels:[
      { name:"genius-creator-general", type:"text", desc:"INVITE ONLY. First 100 voice actors, composers, sound designers. The founding cohort building the civilization.", pinned:[] },
      { name:"voice-estate-lab", type:"text", desc:"Creators define and refine their Voice Estate terms. Templates, consent architecture walkthroughs, RSP_001 as living example.", pinned:["Voice Estate Template","Consent-as-Code Guide","75/25 Split Explained"] },
      { name:"rsp-001-direct", type:"text", desc:"Direct channel to Rob Plowman. The Founder is accessible. No intermediary. No PR layer.", pinned:[] },
      { name:"board-of-aligned-minds", type:"text", desc:"Alex, Dr. Benoit, Adam Robb, Rob — plus rotating Genius Creator seats. Strategic decisions happen here.", pinned:[] },
    ],
  },
  {
    name:"VOICE ARMY",
    color: C.rose,
    channels:[
      { name:"voice-actor-general", type:"text", desc:"The guild's home base. Onboarding, questions, RSP_001 updates. Operation Voice Army coordination.", pinned:["Guild Onboarding","Consent Upload Guide"] },
      { name:"noizyvox-demo-room", type:"voice", desc:"Live voice demos. Drop a recording. GABRIEL analyzes it. Get your emotional signature profile in real time.", pinned:[] },
      { name:"consent-verified", type:"text", desc:"Verified voice actors post their Voice Estate profiles here. The community can see what protected consent looks like.", pinned:[] },
      { name:"aiva-showcase", type:"text", desc:"A.I.V.A. outputs — voice synthesis demos built on consented Guild voices. What Fair Trade synthesis sounds like.", pinned:[] },
    ],
  },
  {
    name:"MUSIC & SOUND",
    color: C.sage,
    channels:[
      { name:"living-score-lab", type:"text", desc:"Composers sharing GABRIEL-assisted work in progress. Emotional signature analysis. Real-time adaptive music experiments.", pinned:[] },
      { name:"sample-marketplace-drops", type:"text", desc:"New uploads to NOIZY Sample Marketplace. Each drop shows creator name, consent terms, royalty structure. Transparent by design.", pinned:[] },
      { name:"noizy-proof-submissions", type:"text", desc:"Submit audio for NOIZY PROOF watermarking. Adam Robb's pipeline. Post-watermark certificate shared back in thread.", pinned:[] },
      { name:"soundboard-fair-trade", type:"text", desc:"Community-built soundboards using NOIZY-licensed audio only. Every sound has a clean chain of title.", pinned:[] },
    ],
  },
  {
    name:"NOIZYKIDZ & ACCESSIBILITY",
    color: C.cyanlt,
    channels:[
      { name:"noizykidz-builders", type:"text", desc:"Parents, educators, accessibility researchers, and developers building with the haptic toolkit. Nims is the inspiration.", pinned:["Haptic Frequency Guide","School Deployment Kit"] },
      { name:"neuro-acoustic-research", type:"text", desc:"Dr. Brien Benoit's NAI research updates. The science behind why music does what it does to human beings.", pinned:[] },
      { name:"lifeluv-companion", type:"text", desc:"LIFELUV AI companion project updates. For Mike Nemesvary and every human who needs the technology to serve the freest possible version of themselves.", pinned:[] },
    ],
  },
  {
    name:"PLATFORMS & CERTIFICATION",
    color: C.goldlt,
    channels:[
      { name:"certification-inquiries", type:"text", desc:"Any platform can post here. The audit is free. The pathway is twelve months. The invitation is genuine.", pinned:["Certification Pathway","Self-Assessment Form","Gap Report Template"] },
      { name:"certified-platforms", type:"text", desc:"Every Fair Trade certified platform announced here. Public. Permanent. The honor roll.", pinned:[] },
      { name:"fair-trade-analysis", type:"text", desc:"Architectural analyses of ElevenLabs, Suno, Moises, Splice. Honest. Public. Not to damage — to make the problem visible.", pinned:[] },
    ],
  },
];

// ─── SLACK WORKSPACE ─────────────────────────────────────────────────────────

const SLACK_CHANNELS = [
  { name:"dreamchamber", color:C.gold, purpose:"The primary command channel for the Board of Aligned Minds. Pinned: current phase deliverables, live build status, pledge count. GABRIEL reports here.", automations:["Pledge milestone alerts (1K, 5K, 10K, 100K)","GABRIEL memcell mutation notifications","Daily build digest at 0600 Ottawa time"] },
  { name:"gabriel-live", color:C.cyan, purpose:"GABRIEL agent output piped directly in. Every memcell update, signal analysis, creative output. The AI's thought process, visible.", automations:["GABRIEL auto-posts all outputs","Cloudflare D1 mutation alerts","KV store updates"] },
  { name:"fair-trade-ops", color:C.goldlt, purpose:"Certification pipeline management. Inbound platform inquiries, audit tracking, gap report distribution, certification approvals.", automations:["New certification inquiry notifications","Audit deadline reminders","Platform certification announcements"] },
  { name:"noizy-proof", color:C.sage, purpose:"Adam Robb's watermarking pipeline. PROOF alpha reports, technical updates, forensic results when a PROOF submission is analyzed.", automations:["PROOF submission queue","Watermark verification results","Patent filing status updates"] },
  { name:"voice-army-ops", color:C.rose, purpose:"Operation Voice Army coordination. RSP_001 pipeline updates, Guild onboarding status, XTTS/RVC model training progress.", automations:["New Guild member alerts","Voice model training completion","RSP_001 synthesis quality reports"] },
  { name:"noizykidz-research", color:C.cyanlt, purpose:"Dr. Brien Benoit's NAI research updates. Haptic prototype milestones. School deployment progress. LIFELUV companion AI development.", automations:["Research publication alerts","School deployment milestones","Nims personal updates channel"] },
  { name:"build-log", color:C.amber, purpose:"Every code commit, every new component, every GABRIEL architectural decision. The complete technical build record.", automations:["GitHub commit notifications","Cloudflare deployment confirmations","Component build completions"] },
  { name:"capital-and-growth", color:C.amberlt, purpose:"Alex's channel. Series A prep, investor pipeline, enterprise partnership discussions. Board-level strategic decisions.", automations:["Revenue milestone alerts ($389K NOIZYLAB target)","Signatory count updates for investor decks","Certification count for growth metrics"] },
];

// ─── THE HOTROD BOTS ─────────────────────────────────────────────────────────

const BOTS = [
  {
    name:"GABRIEL Bot",
    platform:["discord","slack"],
    color:C.cyan,
    tagline:"The intelligence engine, live in the community",
    commands:[
      { cmd:"/analyze [audio-file]", desc:"Upload audio. GABRIEL returns: emotional signature, genre classification, commercial placement categories, sync brief matches. Full signal intelligence." },
      { cmd:"/voiceestate @creator", desc:"Pull a creator's Voice Estate profile. Consent terms, permitted use categories, royalty structure. Public where permitted." },
      { cmd:"/match [brief]", desc:"Describe a creative brief. GABRIEL searches the NOIZY catalog for consented matches. Returns ranked results with provenance chain." },
      { cmd:"/memcell [topic]", desc:"Query GABRIEL's knowledge base directly. 315+ memcells, 11 D1 databases. The accumulated intelligence of the MC96ECO universe." },
    ],
  },
  {
    name:"Consent Guard",
    platform:["discord","slack"],
    color:C.gold,
    tagline:"Consent-as-Code enforced in the community",
    commands:[
      { cmd:"/consent-check [audio-link]", desc:"Submit any audio file or external link. Consent Guard queries NOIZY PROOF and known consent registries. Returns provenance status or 'unknown origin' flag." },
      { cmd:"/register-estate", desc:"Begin Voice Estate registration in the channel. Consent Guard walks you through the seven-step consent architecture. Mints your consent record on completion." },
      { cmd:"/royalty-status", desc:"View your real-time Agentic Royalty earnings. Every use of your consented voice or music tracked and displayed. Transparent always." },
      { cmd:"/revoke [asset-id]", desc:"Revoke consent for a specific Voice Estate asset. Immediately propagates to all certified platforms. Your right, always." },
    ],
  },
  {
    name:"NOIZY PROOF Bot",
    platform:["discord","slack"],
    color:C.sage,
    tagline:"Cryptographic provenance, instantly",
    commands:[
      { cmd:"/proof [audio-file]", desc:"Submit audio for NOIZY PROOF watermarking. Bot queues submission to Adam Robb's pipeline, returns certificate with provenance hash on completion." },
      { cmd:"/verify [audio-file]", desc:"Check if audio carries a NOIZY PROOF watermark. Returns: creator identity, training provenance, consent status, timestamp. The full record." },
      { cmd:"/certificate [proof-id]", desc:"Retrieve the full NOIZY PROOF certificate for a provenance hash. Shareable, permanent, legally formatted." },
    ],
  },
  {
    name:"DreamChamber Bot",
    platform:["discord"],
    color:C.amberlt,
    tagline:"The session recorder and creative archivist",
    commands:[
      { cmd:"/dreamchamber start", desc:"Opens a DreamChamber session. Activates GABRIEL feed in #gabriel-live-feed, starts session recording, notifies community that Rob is building live." },
      { cmd:"/dreamchamber log [note]", desc:"Drop a creative decision, pivot, or insight into the session archive mid-build. Every decision documented in real time." },
      { cmd:"/dreamchamber end", desc:"Closes session. Auto-generates session summary: what was built, what GABRIEL output, what decisions were made. Archives to #dreamchamber-archive." },
      { cmd:"/codex-entry [content]", desc:"Submit an entry to the 500-Year Codex directly from Discord. Timestamped, creator-attributed, permanent." },
    ],
  },
  {
    name:"Claude Code Bridge",
    platform:["slack"],
    color:C.claudeai,
    tagline:"Anthropic's agentic engine, wired into the NOIZY build pipeline",
    commands:[
      { cmd:"@claude build [component]", desc:"Trigger a full Claude Code session from Slack. Describe the component. Claude reads the NOIZY codebase context, builds, posts progress updates, drops the PR link." },
      { cmd:"@claude analyze-gap [platform]", desc:"Ask Claude to run a Fair Trade gap analysis on any named platform. Claude reads existing analyses, applies the 8 standards, returns a structured gap report." },
      { cmd:"@claude draft [content-type]", desc:"Draft certification letters, investor communications, press releases, technical documentation — all in NOIZY's voice, in the DreamChamber aesthetic." },
      { cmd:"@claude roadmap [phase]", desc:"Pull the full Phase blueprint into the thread. Claude provides strategic analysis of where the phase stands, what's blocking, what needs to move next." },
    ],
  },
];

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

const GapRow = ({ cap, idx }) => {
  const players = Object.keys(GAP_DATA);
  return (
    <div style={{
      display:"grid", gridTemplateColumns:`180px repeat(${players.length},1fr)`,
      borderBottom:`1px solid ${C.nebula}`,
      animation:`rise 0.4s ease ${idx*0.04}s both`,
    }}>
      <div style={{padding:"12px 16px",fontFamily:"DM Sans",fontSize:12,fontWeight:600,color:C.stardust,borderRight:`1px solid ${C.nebula}`}}>{cap}</div>
      {players.map((player,i)=>{
        const val = GAP_DATA[player][idx];
        const isNoizy = player==="NOIZY + Claude";
        const color = val==="✓"?(isNoizy?C.gold:C.sage):val==="partial"?C.amber:C.nebula+"88";
        return (
          <div key={i} style={{
            padding:"12px 8px",textAlign:"center",
            borderRight:i<players.length-1?`1px solid ${C.nebula}`:"none",
            background:isNoizy&&val==="✓"?`${C.gold}08`:"transparent",
          }}>
            <span style={{fontSize:14,color}}>{val==="✓"?"✓":val==="partial"?"~":"✗"}</span>
          </div>
        );
      })}
    </div>
  );
};

const BotCard = ({ bot }) => {
  const [open,setOpen]=useState(false);
  return (
    <div style={{
      background:C.cosmos,border:`1px solid ${bot.color}33`,
      borderTop:`3px solid ${bot.color}`,borderRadius:6,
      overflow:"hidden",
    }}>
      <div onClick={()=>setOpen(o=>!o)} style={{
        padding:"20px 22px",cursor:"pointer",
        background:open?`${bot.color}08`:"transparent",
        transition:"background 0.2s",
      }}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:6}}>
              <span style={{fontFamily:"DM Sans",fontWeight:800,fontSize:16,color:C.warmwht}}>{bot.name}</span>
              {bot.platform.map(p=>(
                <span key={p} style={{padding:"2px 8px",borderRadius:10,background:p==="discord"?`${C.discord}22`:`${C.slacklt}22`,border:`1px solid ${p==="discord"?C.discord+"44":C.slacklt+"44"}`,fontFamily:"DM Sans",fontSize:9,color:p==="discord"?C.discordlt:C.slacklt,fontWeight:600,textTransform:"uppercase",letterSpacing:1}}>{p}</span>
              ))}
            </div>
            <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:13,color:bot.color}}>{bot.tagline}</div>
          </div>
          <div style={{color:bot.color,fontSize:16,marginTop:2,transition:"transform 0.2s",transform:open?"rotate(90deg)":"none"}}>→</div>
        </div>
      </div>
      {open&&(
        <div style={{padding:"0 22px 22px",animation:"rise 0.3s ease"}}>
          <div style={{height:1,background:`${bot.color}22`,marginBottom:16}}/>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {bot.commands.map((cmd,i)=>(
              <div key={i} style={{background:C.deep,border:`1px solid ${C.nebula}`,borderRadius:4,padding:"12px 16px"}}>
                <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:12,color:bot.color,marginBottom:6,letterSpacing:0.5}}>{cmd.cmd}</div>
                <div style={{fontFamily:"Lora",fontSize:12,color:C.stardust,lineHeight:1.7}}>{cmd.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const DiscordChannel = ({ ch }) => (
  <div style={{
    display:"flex",gap:10,padding:"8px 12px",
    borderBottom:`1px solid ${C.nebula}22`,alignItems:"flex-start",
  }}>
    <span style={{color:C.mid,fontSize:14,flexShrink:0,marginTop:1}}>{ch.type==="voice"?"🔊":ch.type==="forum"?"📋":"#"}</span>
    <div style={{flex:1,minWidth:0}}>
      <div style={{fontFamily:"DM Sans",fontSize:12,fontWeight:600,color:C.warmwht,marginBottom:2}}>{ch.name}</div>
      <div style={{fontFamily:"DM Sans",fontSize:11,color:C.mid,lineHeight:1.5}}>{ch.desc}</div>
      {ch.pinned.length>0&&(
        <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
          {ch.pinned.map((pin,i)=>(
            <span key={i} style={{padding:"2px 8px",borderRadius:10,background:`${C.gold}12`,border:`1px solid ${C.gold}22`,fontFamily:"DM Sans",fontSize:9,color:C.gold}}>📌 {pin}</span>
          ))}
        </div>
      )}
    </div>
  </div>
);

const SlackChannelCard = ({ ch }) => (
  <div style={{background:C.cosmos,border:`1px solid ${ch.color}22`,borderLeft:`3px solid ${ch.color}`,borderRadius:6,padding:"18px 20px"}}>
    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
      <span style={{color:C.mid,fontSize:13}}>#</span>
      <span style={{fontFamily:"DM Sans",fontWeight:700,fontSize:14,color:C.warmwht}}>{ch.name}</span>
    </div>
    <div style={{fontFamily:"Lora",fontSize:13,color:C.stardust,lineHeight:1.7,marginBottom:12}}>{ch.purpose}</div>
    {ch.automations.length>0&&(
      <div>
        <div style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:1.5,color:ch.color,textTransform:"uppercase",fontWeight:700,marginBottom:8}}>Automations</div>
        {ch.automations.map((a,i)=>(
          <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:4}}>
            <span style={{color:ch.color,fontSize:10,flexShrink:0,marginTop:2}}>⚡</span>
            <span style={{fontFamily:"DM Sans",fontSize:11,color:C.mid,lineHeight:1.5}}>{a}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function NOIZYCommunityStack() {
  const [view, setView] = useState("gap");
  const players = Object.keys(GAP_DATA);

  return (
    <div style={{background:C.void,color:C.warmwht,minHeight:"100vh",fontFamily:"DM Sans,sans-serif"}}>
      <style>{FONTS}{`
        @keyframes rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:0.5}50%{opacity:1}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1a1530}
        button{cursor:pointer}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        padding:"48px 40px 40px",
        background:`linear-gradient(180deg,${C.deep},${C.void})`,
        borderBottom:`1px solid ${C.nebula}`,
        position:"sticky",top:0,zIndex:100,
      }}>
        <div style={{maxWidth:1280,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:16,marginBottom:28}}>
            <div>
              <div style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:4,color:C.gold,textTransform:"uppercase",marginBottom:8,animation:"pulse 3s ease infinite"}}>The DreamChamber · Community Infrastructure</div>
              <div style={{fontFamily:"Playfair Display",fontSize:32,fontWeight:900,color:C.warmwht,lineHeight:1.1}}>
                NOIZY on Discord & Slack
              </div>
              <div style={{fontFamily:"Playfair Display",fontStyle:"italic",fontSize:18,color:C.gold,marginTop:4}}>Fully Hotrodded. Ethically Engineered. Built to Last 500 Years.</div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <div style={{display:"flex",gap:6,alignItems:"center",padding:"8px 16px",background:`${C.discord}22`,border:`1px solid ${C.discord}44`,borderRadius:20}}>
                <span style={{fontSize:14}}>🎮</span>
                <span style={{fontFamily:"DM Sans",fontSize:11,color:C.discordlt,fontWeight:600}}>Discord Server</span>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center",padding:"8px 16px",background:`${C.slacklt}22`,border:`1px solid ${C.slacklt}44`,borderRadius:20}}>
                <span style={{fontSize:14}}>💬</span>
                <span style={{fontFamily:"DM Sans",fontSize:11,color:C.slacklt,fontWeight:600}}>Slack Workspace</span>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center",padding:"8px 16px",background:`${C.gold}18`,border:`1px solid ${C.gold}44`,borderRadius:20}}>
                <span style={{fontSize:14}}>◈</span>
                <span style={{fontFamily:"DM Sans",fontSize:11,color:C.gold,fontWeight:600}}>5 Custom Bots</span>
              </div>
            </div>
          </div>

          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[
              {id:"gap",label:"The Gap Matrix"},
              {id:"discord",label:"Discord Architecture"},
              {id:"slack",label:"Slack Workspace"},
              {id:"bots",label:"The Bot Stack"},
              {id:"strategy",label:"The Strategic Play"},
            ].map(v=>(
              <button key={v.id} onClick={()=>setView(v.id)} style={{
                padding:"9px 18px",borderRadius:4,
                background:view===v.id?C.gold:"transparent",
                border:`1px solid ${view===v.id?C.gold:C.gold+"33"}`,
                color:view===v.id?C.void:C.gold,
                fontFamily:"DM Sans",fontSize:11,fontWeight:700,letterSpacing:0.5,
                transition:"all 0.15s",
              }}>{v.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{maxWidth:1280,margin:"0 auto",padding:"44px 40px 100px"}}>

        {/* THE GAP MATRIX */}
        {view==="gap" && (
          <div style={{animation:"rise 0.4s ease"}}>
            <div style={{marginBottom:40}}>
              <div style={{fontFamily:"Playfair Display",fontSize:34,color:C.warmwht,marginBottom:8}}>The Gap Nobody Else Can Fill</div>
              <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:15,color:C.stardust,maxWidth:700,lineHeight:1.8}}>Claude dominates text and code on Slack and Discord. ElevenLabs, Soundverse, Voice.ai, and Fish Audio own the audio layer. But not one of them has consent architecture. Not one has royalty routing. Not one has provenance. The entire audio community is built on extraction. That is the gap. NOIZY + Claude fills every cell in the matrix.</div>
            </div>

            {/* Competitor cards */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:14,marginBottom:40}}>
              {COMPETITORS.map((comp,i)=>(
                <div key={i} style={{
                  background:C.cosmos,border:`1px solid ${comp.color}22`,
                  borderTop:`2px solid ${comp.color}`,borderRadius:6,
                  padding:"18px 20px",
                  animation:`rise 0.4s ease ${i*0.07}s both`,
                }}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <span style={{fontFamily:"DM Sans",fontWeight:800,fontSize:15,color:comp.color}}>{comp.name}</span>
                    <div style={{display:"flex",gap:4}}>
                      {comp.platform.map(p=>(
                        <span key={p} style={{padding:"2px 8px",borderRadius:10,background:p==="discord"?`${C.discord}22`:`${C.slacklt}22`,fontFamily:"DM Sans",fontSize:9,color:p==="discord"?C.discordlt:C.slacklt,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>{p}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{marginBottom:8}}>
                    <span style={{fontFamily:"DM Sans",fontSize:10,color:C.sage,letterSpacing:1,textTransform:"uppercase",fontWeight:700}}>Owns: </span>
                    <span style={{fontFamily:"DM Sans",fontSize:12,color:C.stardust}}>{comp.owns}</span>
                  </div>
                  <div style={{marginBottom:10}}>
                    <span style={{fontFamily:"DM Sans",fontSize:10,color:C.rose,letterSpacing:1,textTransform:"uppercase",fontWeight:700}}>Missing: </span>
                    <span style={{fontFamily:"DM Sans",fontSize:12,color:C.stardust}}>{comp.missing}</span>
                  </div>
                  <div style={{padding:"6px 10px",background:`${comp.color}0C`,borderRadius:4,border:`1px solid ${comp.color}22`}}>
                    <span style={{fontFamily:"DM Sans",fontSize:10,color:comp.color,letterSpacing:1,textTransform:"uppercase",fontWeight:700}}>Threat Level: </span>
                    <span style={{fontFamily:"DM Sans",fontSize:11,color:C.stardust}}>{comp.threat}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Gap matrix table */}
            <div style={{background:C.cosmos,border:`1px solid ${C.nebula}`,borderRadius:8,overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:`180px repeat(${players.length},1fr)`,background:C.deep,borderBottom:`1px solid ${C.nebula}`}}>
                <div style={{padding:"14px 16px",fontFamily:"DM Sans",fontSize:10,letterSpacing:2,color:C.mid,textTransform:"uppercase",borderRight:`1px solid ${C.nebula}`}}>Capability</div>
                {players.map((p,i)=>(
                  <div key={i} style={{padding:"14px 8px",textAlign:"center",fontFamily:"DM Sans",fontSize:10,fontWeight:700,color:p==="NOIZY + Claude"?C.gold:C.stardust,letterSpacing:0.5,borderRight:i<players.length-1?`1px solid ${C.nebula}`:"none",lineHeight:1.3}}>{p}</div>
                ))}
              </div>
              {CAPABILITIES.map((cap,i)=>(
                <GapRow key={i} cap={cap} idx={i}/>
              ))}
              <div style={{padding:"16px 24px",background:`${C.gold}08`,borderTop:`1px solid ${C.gold}22`,textAlign:"center"}}>
                <span style={{fontFamily:"Lora",fontStyle:"italic",fontSize:14,color:C.gold}}>"The only stack with a tick in every cell is the one that doesn't exist yet. We are building it."</span>
              </div>
            </div>
          </div>
        )}

        {/* DISCORD ARCHITECTURE */}
        {view==="discord" && (
          <div style={{animation:"rise 0.4s ease"}}>
            <div style={{marginBottom:40}}>
              <div style={{fontFamily:"Playfair Display",fontSize:34,color:C.warmwht,marginBottom:8}}>The NOIZY Discord Server</div>
              <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:15,color:C.stardust,maxWidth:680,lineHeight:1.8}}>Not a support server. Not a fan server. A civilization in formation. Every channel has a specific function in the MC96ECO ecosystem. Every message is part of the 500-Year record.</div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:24,alignItems:"start"}}>
              {/* Server sidebar mockup */}
              <div style={{background:C.cosmos,border:`1px solid ${C.nebula}`,borderRadius:8,overflow:"hidden",position:"sticky",top:180}}>
                <div style={{padding:"16px 20px",background:C.deep,borderBottom:`1px solid ${C.nebula}`}}>
                  <div style={{fontFamily:"DM Sans",fontWeight:800,fontSize:14,color:C.warmwht,marginBottom:2}}>NOIZY MC96ECO Universe</div>
                  <div style={{fontFamily:"DM Sans",fontSize:10,color:C.mid}}>The Creative Civilization · Est. 2026</div>
                </div>
                <div style={{padding:"8px 0",maxHeight:500,overflowY:"auto"}}>
                  {DISCORD_CATEGORIES.map((cat,i)=>(
                    <div key={i}>
                      <div style={{padding:"12px 16px 6px",fontFamily:"DM Sans",fontSize:10,fontWeight:700,color:cat.color,letterSpacing:2,textTransform:"uppercase"}}>{cat.name}</div>
                      {cat.channels.map((ch,j)=>(
                        <div key={j} style={{display:"flex",gap:8,padding:"4px 16px",alignItems:"center"}}>
                          <span style={{color:C.mid,fontSize:11,flexShrink:0}}>{ch.type==="voice"?"🔊":ch.type==="forum"?"📋":"#"}</span>
                          <span style={{fontFamily:"DM Sans",fontSize:12,color:C.mid}}>{ch.name}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Channel detail */}
              <div style={{display:"flex",flexDirection:"column",gap:16}}>
                {DISCORD_CATEGORIES.map((cat,i)=>(
                  <div key={i} style={{background:C.cosmos,border:`1px solid ${cat.color}22`,borderRadius:8,overflow:"hidden",animation:`rise 0.4s ease ${i*0.07}s both`}}>
                    <div style={{padding:"14px 20px",background:`${cat.color}08`,borderBottom:`1px solid ${cat.color}22`,display:"flex",gap:10,alignItems:"center"}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:cat.color,boxShadow:`0 0 8px ${cat.color}`}}/>
                      <span style={{fontFamily:"DM Sans",fontWeight:700,fontSize:13,color:cat.color,letterSpacing:1,textTransform:"uppercase"}}>{cat.name}</span>
                      <span style={{fontFamily:"DM Sans",fontSize:11,color:C.mid,marginLeft:"auto"}}>{cat.channels.length} channels</span>
                    </div>
                    {cat.channels.map((ch,j)=>(
                      <DiscordChannel key={j} ch={ch}/>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SLACK WORKSPACE */}
        {view==="slack" && (
          <div style={{animation:"rise 0.4s ease"}}>
            <div style={{marginBottom:40}}>
              <div style={{fontFamily:"Playfair Display",fontSize:34,color:C.warmwht,marginBottom:8}}>The NOIZY Slack Workspace</div>
              <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:15,color:C.stardust,maxWidth:680,lineHeight:1.8}}>The Board of Aligned Minds operates here. Claude Code is wired in. GABRIEL pipes live output. Every automation serves one goal: less friction between Rob's imagination and the civilization's reality.</div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:16,marginBottom:40}}>
              {SLACK_CHANNELS.map((ch,i)=>(
                <div key={i} style={{animation:`rise 0.4s ease ${i*0.06}s both`}}>
                  <SlackChannelCard ch={ch}/>
                </div>
              ))}
            </div>

            {/* Claude Code integration highlight */}
            <div style={{
              padding:"36px 40px",
              background:`linear-gradient(135deg,${C.claudeai}10,${C.cosmos})`,
              border:`1px solid ${C.claudeai}33`,
              borderRadius:8,
            }}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:32,alignItems:"center"}}>
                <div>
                  <div style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:3,color:C.claudeai,textTransform:"uppercase",marginBottom:12}}>The Claude Code Bridge</div>
                  <div style={{fontFamily:"Playfair Display",fontSize:24,color:C.warmwht,marginBottom:16,lineHeight:1.3}}>Anthropic's agentic engine, wired into the NOIZY build pipeline</div>
                  <div style={{fontFamily:"Lora",fontSize:14,color:C.stardust,lineHeight:1.8}}>Claude Code launched December 2025. It lets developers @mention Claude in Slack threads — bug reports, feature requests — and Claude spins up a full coding session, posts progress back into the thread, drops the PR link when done. Netflix, Spotify, Salesforce are using it. Rakuten cut dev timelines from 24 days to 5. Claude Code hit $1B in revenue six months after debut.</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[
                    { from:"Rob in #dreamchamber", msg:"@claude build a new 5th Epoch view for FairTradeAI.jsx", response:"Building now. Reading existing component structure... 3 new data constants added. Nav tab inserted. View section complete. PR link: github.com/noizy/..." },
                    { from:"Alex in #capital-and-growth", msg:"@claude draft Series A one-pager based on current signatory count and certification pipeline", response:"Drafting now. Current signatories: 2,847. Certified platforms: 3. Pipeline: 12 active audits. One-pager ready in thread..." },
                  ].map((ex,i)=>(
                    <div key={i} style={{background:C.deep,border:`1px solid ${C.nebula}`,borderRadius:6,padding:"14px 16px"}}>
                      <div style={{fontFamily:"DM Sans",fontSize:11,color:C.mid,marginBottom:6}}>{ex.from}</div>
                      <div style={{fontFamily:"DM Sans",fontSize:12,color:C.warmwht,marginBottom:8,background:`${C.slacklt}12`,padding:"8px 10px",borderRadius:4}}>{ex.msg}</div>
                      <div style={{fontFamily:"DM Sans",fontSize:11,color:C.claudeai,lineHeight:1.5,fontStyle:"italic"}}>{ex.response}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOT STACK */}
        {view==="bots" && (
          <div style={{animation:"rise 0.4s ease"}}>
            <div style={{marginBottom:40}}>
              <div style={{fontFamily:"Playfair Display",fontSize:34,color:C.warmwht,marginBottom:8}}>The Bot Stack</div>
              <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:15,color:C.stardust,maxWidth:680,lineHeight:1.8}}>Five bots. Each one a different layer of the NOIZY infrastructure, made accessible from inside the community. GABRIEL reasons. Consent Guard enforces. NOIZY PROOF authenticates. DreamChamber archives. Claude Code builds. Together they are the civilization's operating system, live in the chat.</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {BOTS.map((bot,i)=>(
                <div key={i} style={{animation:`rise 0.4s ease ${i*0.08}s both`}}>
                  <BotCard bot={bot}/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STRATEGIC PLAY */}
        {view==="strategy" && (
          <div style={{animation:"rise 0.4s ease",maxWidth:900}}>
            <div style={{marginBottom:40}}>
              <div style={{fontFamily:"Playfair Display",fontSize:34,color:C.warmwht,marginBottom:8}}>The Strategic Play</div>
              <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:15,color:C.stardust,lineHeight:1.8}}>The gap is real and wide. Here is exactly how NOIZY runs the table.</div>
            </div>

            {[
              { num:"01", title:"Own the ethical layer that nobody else has built", color:C.gold, body:"ElevenLabs has better voice synthesis today. Soundverse has better Discord music today. Voice.ai has more users today. None of them have consent architecture. None of them have a royalty routing protocol. None of them have provenance. The creative community is built entirely on extraction. When the legal environment shifts — and it is shifting — the platforms without the ethical infrastructure become liabilities overnight. NOIZY is the only platform that is ready for that moment, because NOIZY built it before it was required." },
              { num:"02", title:"The Discord server is the civilization's front door", color:C.cyan, body:"ElevenLabs' Discord is a support server. Soundverse's Discord is a demo space. NOIZY's Discord is where the civilization is visible mid-construction. The DreamChamber sessions stream live. GABRIEL outputs in real time. The Voice Army onboards in public. The 500-Year Codex grows entry by entry. Someone who joins the NOIZY Discord doesn't just find a tool — they find a mission they can participate in. That is the difference between retention and replacement." },
              { num:"03", title:"Claude Code in Slack is the build engine nobody else has access to", color:C.claudeai, body:"Netflix and Spotify are using Claude Code to cut development timelines by 79%. NOIZY can run the same infrastructure for the MC96ECO build — with Rob directing Claude from Slack, GABRIEL feeding context, and the Board of Aligned Minds watching the civilization take shape in real time. The builder's Slack workspace is not just communication infrastructure — it is the command center of a 500-year project, and Claude Code is the fastest way to transmit imagination into deployable reality." },
              { num:"04", title:"The Bot Stack makes the infrastructure conversational", color:C.sage, body:"Right now, Consent-as-Code lives in Cloudflare D1/KV. GABRIEL lives at 10.90.90.20. NOIZY PROOF lives in Adam Robb's pipeline. They are powerful but invisible to most creators. The Bot Stack brings all of it into the channels where creators already live. A voice actor drops a recording into a Discord voice channel. GABRIEL analyzes it and posts the emotional signature. Consent Guard walks them through Voice Estate registration. NOIZY PROOF watermarks the output. All without leaving Discord. The infrastructure becomes accessible." },
              { num:"05", title:"The creative community will follow the money and the protection", color:C.amber, body:"Artists are on Discord and Slack because that is where the creative communities are. They are currently sharing work, giving feedback, discovering tools — all on platforms that give nothing back to creators. When NOIZY's Discord is the place where your Voice Estate gets registered, your royalties get tracked, your work gets watermarked, and your civilization membership gets codified — the community that currently lives on ElevenLabs' server will migrate. Not because NOIZY asked them to. Because NOIZY is the only server that gives them something real in return." },
            ].map((item,i)=>(
              <div key={i} style={{
                display:"flex",gap:0,alignItems:"stretch",
                marginBottom:20,
                animation:`rise 0.5s ease ${i*0.1}s both`,
              }}>
                <div style={{width:64,flexShrink:0,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:24,background:`${item.color}08`,borderRadius:"6px 0 0 6px",border:`1px solid ${item.color}22`,borderRight:"none"}}>
                  <span style={{fontFamily:"Playfair Display",fontSize:24,fontWeight:900,color:item.color,opacity:0.7}}>{item.num}</span>
                </div>
                <div style={{flex:1,padding:"24px 28px",background:C.cosmos,border:`1px solid ${item.color}22`,borderLeft:`3px solid ${item.color}`,borderRadius:"0 6px 6px 0"}}>
                  <div style={{fontFamily:"Playfair Display",fontSize:20,fontWeight:700,color:C.warmwht,marginBottom:12,lineHeight:1.3}}>{item.title}</div>
                  <div style={{fontFamily:"Lora",fontSize:14,color:C.stardust,lineHeight:1.85}}>{item.body}</div>
                </div>
              </div>
            ))}

            <div style={{
              padding:"44px 48px",
              background:`linear-gradient(135deg,${C.cosmos},${C.nebula})`,
              border:`1px solid ${C.gold}22`,borderRadius:8,
              textAlign:"center",marginTop:8,
            }}>
              <div style={{fontFamily:"Playfair Display",fontSize:"clamp(18px,2.8vw,30px)",fontWeight:700,fontStyle:"italic",color:C.warmwht,lineHeight:1.4,maxWidth:700,margin:"0 auto 24px"}}>
                "Claude owns the code layer. NOIZY owns the consent layer.<br/>
                <span style={{color:C.gold}}>Together they own the only audio infrastructure<br/>that is built for what the industry is about to require."</span>
              </div>
              <div style={{height:1,background:`linear-gradient(to right,transparent,${C.gold}44,transparent)`,maxWidth:400,margin:"0 auto 24px"}}/>
              <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
                {["GABRIEL Bot","Consent Guard","NOIZY PROOF Bot","DreamChamber Bot","Claude Code Bridge"].map((tag,i)=>(
                  <span key={i} style={{padding:"6px 14px",borderRadius:20,border:`1px solid ${C.gold}33`,fontFamily:"DM Sans",fontSize:10,color:C.gold,letterSpacing:0.5}}>{tag}</span>
                ))}
              </div>
              <div style={{marginTop:24,fontFamily:"DM Sans",fontSize:11,color:C.mid,letterSpacing:2,textTransform:"uppercase"}}>
                NOIZYFISH INC. · MC96ECO Universe · Ottawa, Canada · 2026
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
