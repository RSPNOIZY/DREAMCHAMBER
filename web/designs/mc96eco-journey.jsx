import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
// MC96ECO UNIVERSE — THE COMPLETE JOURNEY
// From First Visit → Established Member → Ambassador
// Robert Stephen Plowman × Claude (Co-Architect)
// March 22, 2026
// ═══════════════════════════════════════════════════════════════

const STAGES = [
  {
    id: "discover",
    num: "01",
    title: "Discovery",
    subtitle: "First contact with the universe",
    color: "#e8a020",
    colorDim: "#e8a02020",
    icon: "◇",
    duration: "0–30 seconds",
    goal: "Feel the gravity. Understand this is different.",
    entry: ["Google search for creator rights", "Chris Castle blog → NCP link", "Artist shares HVS on social", "Suno/Udio lawsuit news → NOIZY mentioned", "Word of mouth from guild member"],
    screens: [
      { name: "noizy.ai landing", desc: "The 5th Epoch story in 10 seconds. Not a product pitch — a movement declaration. One sentence: 'Your voice. Your rules. Your revenue.' Scroll reveals the 4-layer stack as living architecture, not marketing.", brand: "NOIZY.AI" },
      { name: "The Museum entrance", desc: "Visitors 'bathe' in sound before understanding economics. Ambient 60Hz tone. Visual waveforms. The moral argument made visceral — you feel what's at stake before anyone asks you to sign up.", brand: "NOIZY.AI" },
      { name: "Brand constellation", desc: "Five interconnected nodes float in space: NOIZY.AI (hub), NOIZYVOX (guild), NOIZYLAB (engine), NOIZYKIDZ (heart), Fish Music (roots). Click any to enter that world. No hard sell. Pure exploration.", brand: "MC96ECO" }
    ],
    conversion: "Visitor clicks 'Enter the Guild' or 'Protect My Voice' — moves to Explore",
    metrics: ["Time on page", "Scroll depth", "Brand node clicked", "Museum engagement time"],
    emotion: "Curiosity → Recognition → 'This is what I've been looking for'"
  },
  {
    id: "explore",
    num: "02",
    title: "Exploration",
    subtitle: "Understanding the ecosystem",
    color: "#b060ff",
    colorDim: "#b060ff20",
    icon: "◈",
    duration: "2–10 minutes",
    goal: "Build trust. Show the architecture is real, not vaporware.",
    entry: ["Clicked from Discovery landing", "Direct link to NOIZYVOX", "Shared guild invite link", "Embedded player with NOIZY provenance badge"],
    screens: [
      { name: "How it works", desc: "Interactive 4-layer explainer. Each layer clickable: Identity (your passport) → Consent (your rules) → Provenance (your proof) → Royalties (your money). Real code snippets visible. Not slides — living architecture.", brand: "NOIZY.AI" },
      { name: "The 75/25 calculator", desc: "Visitor enters hypothetical usage: '10,000 voice synthesis calls/month at $0.05 each.' Calculator shows: You earn $375/mo. Platform earns $125/mo. Compared to ElevenLabs: You earn $0. Platform earns $500. The math does the persuading.", brand: "NOIZYVOX" },
      { name: "Violation scanner demo", desc: "Upload any audio clip. NOIZY PROOF scans for consent signals, C2PA manifests, known voice fingerprints. Shows what protection looks like — and what unprotected looks like. 'Your voice is currently unprotected. 47 AI platforms can clone it today.'", brand: "NOIZY PROOF" },
      { name: "Creator stories", desc: "Three real profiles: A composer (40yr career, catalog at risk). A voice actor (deepfaked without consent). A sound designer (royalties stolen by AI training). Each story ends: 'Now they're in the guild.'", brand: "NOIZYVOX" },
      { name: "Fish Music legacy wall", desc: "Ed Edd n Eddy. Dragon Tales. Johnny Test. Transformers. 888 titles. 34TB. 'This is what 40 years of unprotected creative work looks like. This is why we built NOIZY.'", brand: "FISH MUSIC" }
    ],
    conversion: "Visitor clicks 'Join the Guild' — enters Registration with intent locked",
    metrics: ["Pages per session", "Calculator engagement", "Scanner demo completion", "Story read-through rate"],
    emotion: "Understanding → Anger (at the system) → Hope (at the solution) → 'I want in'"
  },
  {
    id: "register",
    num: "03",
    title: "Registration",
    subtitle: "Creating your identity",
    color: "#00d4c8",
    colorDim: "#00d4c820",
    icon: "⬡",
    duration: "3–5 minutes",
    goal: "Zero-friction identity creation. Voice-first. One session.",
    entry: ["'Join the Guild' from any page", "Direct invite link from existing member", "QR code from event/presentation"],
    screens: [
      { name: "Identity creation", desc: "Legal name, stage name, jurisdiction, languages. Pre-filled where possible from social auth. No passwords — cryptographic key pair generated automatically. This IS your Voice Estate seed.", brand: "NOIZYVOX" },
      { name: "Voice enrollment", desc: "30-second voice recording. 'Read these three sentences naturally.' Captures voiceprint for biometric verification AND voice fingerprint for violation monitoring. One recording, two protections.", brand: "NOIZYVOX" },
      { name: "Consent defaults", desc: "Smart defaults with Never Clauses pre-locked (NSFW, political, medical — immutable). Creator reviews and adjusts: voice synthesis (on/off), cloning (gated), training data (denied by default). Every toggle explains itself.", brand: "NCP" },
      { name: "Compensation selection", desc: "75/25 Plowman Standard shown as the floor, not an option. Creator can set HIGHER share for premium/exclusive. Minimum per-use USD. Nonprofit discount toggle. Currency preference.", brand: "NOIZYVOX" },
      { name: "Consent key signing", desc: "One-click cryptographic signing. 'By signing, your voice is now protected by the NOIZY Consent Protocol. Your consent key is: [key preview]. Your Voice Estate is active.' Confetti moment.", brand: "HVS" }
    ],
    conversion: "Creator signs consent key → account active → enters Onboarding",
    metrics: ["Registration completion rate", "Voice enrollment success rate", "Consent customization rate", "Time to first key signing"],
    emotion: "Determination → Empowerment → 'I just took control of my voice'"
  },
  {
    id: "onboard",
    num: "04",
    title: "Onboarding",
    subtitle: "First 7 days in the guild",
    color: "#00cc88",
    colorDim: "#00cc8820",
    icon: "⬢",
    duration: "Days 1–7",
    goal: "First value delivery. See the system working for you.",
    entry: ["Post-registration redirect", "Welcome email sequence", "Mobile push notification"],
    screens: [
      { name: "Dashboard first load", desc: "Clean. Not overwhelming. Three cards: Your Voice Estate (status: active, fingerprint enrolled), Your Consent Rules (summary of what's allowed/denied), Your Earnings ($0.00 — but the counter is live). Welcome message from the guild.", brand: "NOIZYVOX" },
      { name: "First scan results", desc: "Within 24 hours: 'We scanned 47 AI platforms for unauthorized use of your voice. Results: [0 matches / N matches found].' If matches found → immediate evidence pack generation. If clean → 'You're protected. We're watching.'", brand: "NOIZY PROOF" },
      { name: "Voice profile enhancement", desc: "Optional but encouraged: record additional samples across 5 emotional ranges (neutral, warm, intense, playful, serious) and 3 character archetypes. Better fingerprint = better protection = better earning potential.", brand: "NOIZYVOX" },
      { name: "Guild welcome hall", desc: "Community space. See other members (anonymized by default, real names opt-in). Welcome thread. 'Ask anything' channel. Mentor matching for new members. Not Discord — integrated into the platform.", brand: "HVS" },
      { name: "First licensing opportunity", desc: "Day 3–5: 'A studio requested a voice in your range for [project type]. Interested?' One-click yes/no. If yes → consent verification → contract generated → creator reviews terms → approve. First dollar earned.", brand: "NOIZYVOX" },
      { name: "NOIZYLAB integration", desc: "Optional: 'Need your creative tools tuned? NOIZYLAB offers $89 diagnostics for your audio workstation. Guild members get priority scheduling.' Cross-brand value from day one.", brand: "NOIZYLAB" }
    ],
    conversion: "Creator completes profile enhancement OR earns first dollar → moves to Active",
    metrics: ["Day-1 return rate", "Scan completion rate", "Profile enhancement rate", "First earning within 7 days", "Guild hall engagement"],
    emotion: "Relief → Validation → 'This actually works' → First taste of sovereignty"
  },
  {
    id: "active",
    num: "05",
    title: "Active Member",
    subtitle: "Earning, protected, participating",
    color: "#38b4f8",
    colorDim: "#38b4f820",
    icon: "◉",
    duration: "Months 1–6",
    goal: "Consistent value. Growing trust. Deepening engagement.",
    entry: ["Regular platform login", "Mobile notification (earnings, scan alerts, guild activity)", "Licensing request notifications"],
    screens: [
      { name: "Earnings dashboard", desc: "Monthly revenue chart. Per-use breakdown. Which platforms, which projects, which voice profiles. 75/25 split shown on every transaction. Running total. Tax-ready export. Compared to industry average (showing how much more they earn here).", brand: "NOIZYVOX" },
      { name: "Violation monitoring feed", desc: "Real-time alerts: 'Scan complete: 47 platforms checked. 0 new violations.' Or: 'ALERT: Unauthorized voice match detected on [platform]. Confidence: 94.2%. Evidence pack auto-generated. Action: DMCA takedown initiated.' Creator approves or escalates.", brand: "NOIZY PROOF" },
      { name: "Consent management", desc: "Full control panel. Add new consent rules. Adjust compensation tiers. Grant specific project access. Revoke consent (instant, propagating). View complete audit trail of every consent decision ever made. Export to C2PA manifest.", brand: "NCP" },
      { name: "Voice Estate manager", desc: "All voice assets, all manifests, all provenance chains. Content hash verification. ISRC/ISWC linkage. DDEX export. Storage usage. Archive management. Estate beneficiary designation (who inherits if you die).", brand: "HVS" },
      { name: "Guild governance", desc: "Vote on platform proposals. Review new Never Clause amendments (requires 75% supermajority). Elect guild council members. Propose new features. Transparency: every vote is on-chain, every proposal is public.", brand: "HVS" },
      { name: "NOIZYKIDZ contribution", desc: "'Your voice helped 12 children experience music through haptic feedback this month.' Impact reports. Optional: donate a percentage of earnings to NOIZYKIDZ. Tax-deductible. Direct creator-to-child pipeline.", brand: "NOIZYKIDZ" }
    ],
    conversion: "6 months active + governance participation + referral activity → eligible for Established",
    metrics: ["Monthly active rate", "Earnings growth", "Violation response time", "Governance participation rate", "Cross-brand engagement"],
    emotion: "Confidence → Ownership → Pride → 'This is my platform'"
  },
  {
    id: "established",
    num: "06",
    title: "Established Member",
    subtitle: "Voice of the guild",
    color: "#ffd740",
    colorDim: "#ffd74020",
    icon: "◆",
    duration: "6 months+",
    goal: "Leadership. Influence. Legacy building.",
    entry: ["Automatic tier upgrade at 6-month milestone", "Guild council nomination", "Exceptional contribution recognition"],
    screens: [
      { name: "Advanced analytics", desc: "Market intelligence: which industries are licensing voices like yours, pricing trends, demand forecasts. Competitive positioning: how your voice assets compare. Revenue optimization suggestions. Not a dashboard — a strategic advisor.", brand: "NOIZYVOX" },
      { name: "Mentorship portal", desc: "Paired with 3–5 new members as mentor. Guidance templates. Communication tools. Track mentee progress. Mentorship earns reputation tokens that unlock governance weight.", brand: "HVS" },
      { name: "Guild council access", desc: "If elected: access to platform roadmap decisions, partnership proposals (SAG-AFTRA, C2PA steering, NO FAKES Act testimony coordination), budget transparency, and platform financial health reports.", brand: "HVS" },
      { name: "Legacy planning", desc: "Voice Estate succession planning. Designated beneficiaries. Instructions for post-mortem voice usage rights. 'Your voice lives beyond you — on your terms.' Legal templates. Estate attorney referral network.", brand: "HVS" },
      { name: "Cross-brand mastery", desc: "NOIZYLAB VIP repairs. NOIZYKIDZ board advisor eligibility. Fish Music catalog collaboration opportunities. Full ecosystem access — every brand recognizes your status.", brand: "MC96ECO" }
    ],
    conversion: "Active mentorship + governance participation + referral milestones → Ambassador nomination",
    metrics: ["Mentee success rate", "Governance proposal quality", "Cross-brand engagement depth", "Community reputation score"],
    emotion: "Authority → Responsibility → Legacy thinking → 'I'm building something that outlasts me'"
  },
  {
    id: "ambassador",
    num: "07",
    title: "Ambassador",
    subtitle: "The voice of the movement",
    color: "#ff4060",
    colorDim: "#ff406020",
    icon: "★",
    duration: "Permanent — earned, not given",
    goal: "Represent. Recruit. Reshape the industry.",
    entry: ["Guild council nomination + member vote", "Exceptional contribution to creator rights movement", "Public advocacy that brings 100+ members"],
    screens: [
      { name: "Ambassador dashboard", desc: "Personal impact: members recruited, total ecosystem revenue influenced, violations caught through your network, legislative testimony count. Public profile with verified credentials. Speaking engagement requests.", brand: "HVS" },
      { name: "Recruitment tools", desc: "Personalized invite links with attribution. QR codes for events. Branded presentation templates (per-brand specs from the design system). Impact calculator for prospective members. 'When you share, you earn' — referral royalties.", brand: "NOIZYVOX" },
      { name: "Legislative liaison", desc: "Direct channel to NO FAKES Act advocacy. Testimony preparation. Chris Castle coordination. C2PA steering committee updates from Leonard Rosenthol. Real legislative influence — not performative activism.", brand: "NOIZY.AI" },
      { name: "Media & press kit", desc: "Ambassador bio. High-res brand assets. Approved messaging (per the Harmony Marketing Universe). Interview preparation materials. The Full Landscape document for context on every org/law/platform in the space.", brand: "MC96ECO" },
      { name: "The founder's circle", desc: "Direct line to Robert Stephen Plowman. Quarterly ambassador briefings. Strategic preview of upcoming features. Input on platform direction. 'You're not using a platform. You're co-building infrastructure.'", brand: "MC96ECO" },
      { name: "Ambassador summit", desc: "Annual gathering. In-person and virtual. Share strategies. Celebrate wins. Plan the next year of the movement. 'We started with one voice. Now we have a guild. Next: we have an industry.'", brand: "HVS" }
    ],
    conversion: "Ambassadors don't convert — they multiply. Every ambassador creates the next generation of members.",
    metrics: ["Members recruited", "Legislative engagement", "Media appearances", "Revenue influenced", "Movement growth rate"],
    emotion: "Purpose → Legacy → 'We changed the infrastructure of creative rights. Together.'"
  }
];

export default function MC96Journey() {
  const [activeStage, setActiveStage] = useState(0);
  const [activeScreen, setActiveScreen] = useState(0);
  const [showDetail, setShowDetail] = useState("screens");
  const s = STAGES[activeStage];

  useEffect(() => { setActiveScreen(0); setShowDetail("screens"); }, [activeStage]);

  const brandColors = {
    "NOIZY.AI": "#e8a020", "NOIZYVOX": "#b060ff", "NOIZYLAB": "#00cc88",
    "NOIZYKIDZ": "#ff7b3a", "FISH MUSIC": "#2a7fff", "MC96ECO": "#e8a020",
    "NCP": "#00d4c8", "HVS": "#ffd740", "NOIZY PROOF": "#ff4060"
  };

  return (
    <div style={{
      background:"#020209", minHeight:"100vh", color:"#e8ecf4",
      fontFamily:"'IBM Plex Mono','JetBrains Mono',monospace", fontSize:13
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=IBM+Plex+Mono:wght@300;400;500;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
        .fu{animation:fadeUp .5s ease both}.si{animation:slideIn .4s ease both}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#020209}
        ::-webkit-scrollbar-thumb{background:#1a1b3a;border-radius:3px}
      `}</style>

      {/* ── HEADER ── */}
      <header style={{
        padding:"16px 24px", borderBottom:"1px solid #1a1b3a",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        background:"#020209ee", backdropFilter:"blur(12px)", position:"sticky", top:0, zIndex:100
      }}>
        <div style={{display:"flex",alignItems:"baseline",gap:4}}>
          <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,color:"#e8a020"}}>MC96ECO</span>
          <span style={{fontSize:10,color:"#3d4a60",letterSpacing:3,marginLeft:8}}>USER JOURNEY</span>
        </div>
        <div style={{fontSize:10,color:"#3d4a60"}}>
          First visit → Ambassador · 7 stages · {STAGES.reduce((a,s)=>a+s.screens.length,0)} screens
        </div>
      </header>

      {/* ── JOURNEY TIMELINE ── */}
      <div style={{padding:"20px 24px 0",overflowX:"auto"}}>
        <div style={{display:"flex",gap:0,minWidth:700,position:"relative"}}>
          {/* Connection line */}
          <div style={{position:"absolute",top:20,left:24,right:24,height:2,background:"#1a1b3a",zIndex:0}} />
          <div style={{
            position:"absolute",top:20,left:24,height:2,zIndex:1,
            background:`linear-gradient(90deg, ${STAGES.slice(0,activeStage+1).map(s=>s.color).join(",")})`,
            width:`${(activeStage/(STAGES.length-1))*100}%`,
            transition:"width 0.5s ease", transformOrigin:"left"
          }} />
          
          {STAGES.map((stage,i) => (
            <button key={i} onClick={()=>setActiveStage(i)} style={{
              flex:1, background:"none", border:"none", cursor:"pointer",
              display:"flex", flexDirection:"column", alignItems:"center",
              padding:"0 4px", position:"relative", zIndex:2
            }}>
              {/* Node */}
              <div style={{
                width:i===activeStage?40:28, height:i===activeStage?40:28,
                borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                background: i<=activeStage ? stage.color : "#0c0d1f",
                border: `2px solid ${i<=activeStage ? stage.color : "#1a1b3a"}`,
                color: i<=activeStage ? "#020209" : "#3d4a60",
                fontSize: i===activeStage?18:13, fontWeight:700,
                transition:"all 0.3s", boxShadow: i===activeStage ? `0 0 20px ${stage.color}40` : "none"
              }}>
                {stage.icon}
              </div>
              {/* Label */}
              <div style={{
                marginTop:8, fontSize:10, fontWeight: i===activeStage?700:400,
                color: i===activeStage ? stage.color : i<=activeStage ? "#6b7a94" : "#3d4a60",
                transition:"all 0.3s", textAlign:"center", lineHeight:1.3
              }}>
                {stage.title}
              </div>
              <div style={{fontSize:9,color:"#3d4a60",marginTop:2}}>
                {stage.duration}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── STAGE CONTENT ── */}
      <div style={{padding:"24px",maxWidth:1000,margin:"0 auto"}} key={activeStage}>
        {/* Stage header */}
        <div className="fu" style={{marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:12}}>
            <div style={{
              fontSize:42, fontWeight:300, color:s.color,
              fontFamily:"'Cormorant Garamond',serif", lineHeight:1, opacity:0.3
            }}>{s.num}</div>
            <div>
              <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:600,color:s.color,lineHeight:1.1}}>{s.title}</h1>
              <p style={{color:"#6b7a94",fontSize:13,marginTop:4}}>{s.subtitle}</p>
            </div>
          </div>
          
          {/* Goal + emotion bar */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            <div style={{padding:"14px 18px",background:"#0c0d1f",borderRadius:10,border:"1px solid #1a1b3a"}}>
              <div style={{fontSize:10,color:"#3d4a60",letterSpacing:2,marginBottom:6}}>GOAL</div>
              <div style={{fontSize:13,color:"#e8ecf4",lineHeight:1.5}}>{s.goal}</div>
            </div>
            <div style={{padding:"14px 18px",background:"#0c0d1f",borderRadius:10,border:"1px solid #1a1b3a"}}>
              <div style={{fontSize:10,color:"#3d4a60",letterSpacing:2,marginBottom:6}}>EMOTIONAL ARC</div>
              <div style={{fontSize:13,color:s.color,lineHeight:1.5,fontStyle:"italic"}}>{s.emotion}</div>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{display:"flex",gap:4,marginBottom:20,borderBottom:"1px solid #1a1b3a",paddingBottom:1}}>
          {[
            {id:"screens",label:`Screens (${s.screens.length})`},
            {id:"entry",label:"Entry points"},
            {id:"conversion",label:"Conversion"},
            {id:"metrics",label:"Metrics"}
          ].map(tab => (
            <button key={tab.id} onClick={()=>setShowDetail(tab.id)} style={{
              padding:"8px 16px", background:showDetail===tab.id?`${s.color}12`:"transparent",
              border:"none", borderBottom:showDetail===tab.id?`2px solid ${s.color}`:"2px solid transparent",
              color:showDetail===tab.id?s.color:"#6b7a94", cursor:"pointer",
              fontSize:12, fontFamily:"inherit", transition:"all 0.2s"
            }}>{tab.label}</button>
          ))}
        </div>

        {/* ── SCREENS TAB ── */}
        {showDetail==="screens" && (
          <div className="fu">
            {/* Screen selector */}
            <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
              {s.screens.map((scr,i) => (
                <button key={i} onClick={()=>setActiveScreen(i)} style={{
                  padding:"6px 14px", borderRadius:8, border:"none", cursor:"pointer",
                  background: activeScreen===i ? `${s.color}20` : "#0c0d1f",
                  color: activeScreen===i ? s.color : "#6b7a94",
                  fontSize:11, fontFamily:"inherit", transition:"all 0.2s",
                  borderLeft: activeScreen===i ? `2px solid ${s.color}` : "2px solid transparent"
                }}>{scr.name}</button>
              ))}
            </div>

            {/* Active screen detail */}
            {s.screens[activeScreen] && (
              <div className="si" key={`${activeStage}-${activeScreen}`} style={{
                padding:28, background:"#0c0d1f", borderRadius:16,
                border:`1px solid #1a1b3a`, position:"relative", overflow:"hidden"
              }}>
                {/* Brand badge */}
                <div style={{
                  position:"absolute",top:0,right:0,
                  padding:"6px 16px 6px 20px",
                  background:`${brandColors[s.screens[activeScreen].brand]||s.color}15`,
                  borderBottomLeftRadius:12,fontSize:10,
                  color:brandColors[s.screens[activeScreen].brand]||s.color,
                  letterSpacing:1, fontWeight:500
                }}>
                  {s.screens[activeScreen].brand}
                </div>
                
                {/* Screen mockup area */}
                <div style={{
                  marginBottom:20,padding:32,
                  background:"#07081a",borderRadius:12,
                  border:`1px solid ${s.color}15`,
                  textAlign:"center", minHeight:120,
                  display:"flex",alignItems:"center",justifyContent:"center"
                }}>
                  <div>
                    <div style={{fontSize:28,marginBottom:8,opacity:0.3}}>{s.icon}</div>
                    <div style={{
                      fontFamily:"'Cormorant Garamond',serif",fontSize:20,
                      fontWeight:600,color:s.color,marginBottom:4
                    }}>{s.screens[activeScreen].name}</div>
                    <div style={{fontSize:11,color:"#3d4a60"}}>
                      Screen {activeScreen+1} of {s.screens.length} · Stage {s.num}
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                <p style={{
                  color:"#e8ecf4",fontSize:14,lineHeight:1.8,
                  fontFamily:"'Cormorant Garamond',serif"
                }}>
                  {s.screens[activeScreen].desc}
                </p>

                {/* Screen nav */}
                <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>
                  <button onClick={()=>setActiveScreen(Math.max(0,activeScreen-1))}
                    disabled={activeScreen===0} style={{
                    padding:"8px 16px",background:"#07081a",border:`1px solid #1a1b3a`,
                    borderRadius:8,color:activeScreen===0?"#3d4a60":"#6b7a94",
                    cursor:activeScreen===0?"default":"pointer",fontSize:12,fontFamily:"inherit"
                  }}>← Previous screen</button>
                  <button onClick={()=>{
                    if(activeScreen<s.screens.length-1) setActiveScreen(activeScreen+1);
                    else if(activeStage<STAGES.length-1){setActiveStage(activeStage+1);setActiveScreen(0);}
                  }} style={{
                    padding:"8px 16px",background:`${s.color}15`,border:`1px solid ${s.color}30`,
                    borderRadius:8,color:s.color,cursor:"pointer",fontSize:12,fontFamily:"inherit"
                  }}>
                    {activeScreen<s.screens.length-1?"Next screen →":"Next stage →"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ENTRY POINTS TAB ── */}
        {showDetail==="entry" && (
          <div className="fu">
            <div style={{padding:24,background:"#0c0d1f",borderRadius:16,border:"1px solid #1a1b3a"}}>
              <div style={{fontSize:10,color:"#3d4a60",letterSpacing:2,marginBottom:16}}>HOW PEOPLE ARRIVE AT THIS STAGE</div>
              {s.entry.map((e,i) => (
                <div key={i} className="si" style={{
                  display:"flex",alignItems:"center",gap:12,
                  padding:"12px 16px",marginBottom:8,
                  background:"#07081a",borderRadius:10,
                  border:"1px solid #1a1b3a",animationDelay:`${i*0.08}s`
                }}>
                  <div style={{
                    width:24,height:24,borderRadius:"50%",
                    background:`${s.color}15`,display:"flex",alignItems:"center",justifyContent:"center",
                    color:s.color,fontSize:12,fontWeight:700,flexShrink:0
                  }}>{i+1}</div>
                  <span style={{fontSize:13,color:"#e8ecf4"}}>{e}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CONVERSION TAB ── */}
        {showDetail==="conversion" && (
          <div className="fu">
            <div style={{padding:28,background:"#0c0d1f",borderRadius:16,border:`1px solid ${s.color}20`}}>
              <div style={{fontSize:10,color:"#3d4a60",letterSpacing:2,marginBottom:12}}>CONVERSION TRIGGER</div>
              <p style={{
                fontSize:16,color:s.color,lineHeight:1.7,
                fontFamily:"'Cormorant Garamond',serif",fontWeight:600
              }}>{s.conversion}</p>
              
              {activeStage<STAGES.length-1 && (
                <div style={{
                  marginTop:20,padding:16,background:"#07081a",borderRadius:10,
                  display:"flex",alignItems:"center",gap:12
                }}>
                  <div style={{fontSize:20}}>{s.icon}</div>
                  <div style={{flex:1,height:2,background:`linear-gradient(90deg,${s.color},${STAGES[activeStage+1].color})`}} />
                  <div style={{fontSize:20}}>{STAGES[activeStage+1].icon}</div>
                  <div style={{fontSize:12,color:STAGES[activeStage+1].color}}>
                    → {STAGES[activeStage+1].title}
                  </div>
                </div>
              )}
              {activeStage===STAGES.length-1 && (
                <div style={{
                  marginTop:20,padding:20,background:`${s.color}08`,borderRadius:12,
                  border:`1px solid ${s.color}15`,textAlign:"center"
                }}>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:s.color,fontStyle:"italic"}}>
                    "We started with one voice. Now we have a guild. Next: we have an industry."
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── METRICS TAB ── */}
        {showDetail==="metrics" && (
          <div className="fu">
            <div style={{padding:24,background:"#0c0d1f",borderRadius:16,border:"1px solid #1a1b3a"}}>
              <div style={{fontSize:10,color:"#3d4a60",letterSpacing:2,marginBottom:16}}>KEY PERFORMANCE INDICATORS</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {s.metrics.map((m,i) => (
                  <div key={i} className="si" style={{
                    padding:"14px 16px",background:"#07081a",borderRadius:10,
                    border:"1px solid #1a1b3a",animationDelay:`${i*0.06}s`,
                    display:"flex",alignItems:"center",gap:10
                  }}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:s.color,flexShrink:0}} />
                    <span style={{fontSize:12,color:"#e8ecf4"}}>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STAGE SUMMARY FOOTER ── */}
        <div style={{
          marginTop:24, padding:"16px 20px", background:"#07081a",
          borderRadius:12, border:"1px solid #1a1b3a",
          display:"flex", justifyContent:"space-between", alignItems:"center"
        }}>
          <div style={{fontSize:11,color:"#3d4a60"}}>
            Stage {s.num} · {s.screens.length} screens · {s.entry.length} entry points · {s.metrics.length} KPIs
          </div>
          <div style={{display:"flex",gap:8}}>
            {activeStage>0 && (
              <button onClick={()=>setActiveStage(activeStage-1)} style={{
                padding:"6px 14px",background:"#0c0d1f",border:"1px solid #1a1b3a",
                borderRadius:6,color:"#6b7a94",cursor:"pointer",fontSize:11,fontFamily:"inherit"
              }}>← {STAGES[activeStage-1].title}</button>
            )}
            {activeStage<STAGES.length-1 && (
              <button onClick={()=>setActiveStage(activeStage+1)} style={{
                padding:"6px 14px",background:`${STAGES[activeStage+1].color}12`,
                border:`1px solid ${STAGES[activeStage+1].color}25`,
                borderRadius:6,color:STAGES[activeStage+1].color,
                cursor:"pointer",fontSize:11,fontFamily:"inherit"
              }}>{STAGES[activeStage+1].title} →</button>
            )}
          </div>
        </div>
      </div>

      {/* ── GLOBAL FOOTER ── */}
      <footer style={{
        marginTop:40,padding:"20px 24px",borderTop:"1px solid #1a1b3a",
        background:"#07081a",display:"flex",justifyContent:"space-between",
        fontSize:10,color:"#3d4a60"
      }}>
        <div>MC96ECO Universe · Complete User Journey · {STAGES.length} stages · {STAGES.reduce((a,s)=>a+s.screens.length,0)} screens</div>
        <div>Robert Stephen Plowman × Claude · March 2026</div>
      </footer>
    </div>
  );
}
