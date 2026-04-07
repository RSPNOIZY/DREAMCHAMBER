import { useState, useEffect, useRef } from "react";

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
  soft:     "#6B5B3E",
  // Phase colors
  p1gold:   "#C9A84C",   // Foundation
  p1glow:   "#F0C040",
  p2cyan:   "#3DC9C0",   // Network
  p2glow:   "#6EE7E0",
  p3sage:   "#6BAF7A",   // Amplifier
  p3glow:   "#9FD4AB",
  p4amber:  "#E8860A",   // Protocol
  p4glow:   "#F5A83E",
  p5rose:   "#C46A8A",   // Legacy
  p5glow:   "#E099B5",
  // UI
  ink:      "#1E1A14",
  earth:    "#6B5B3E",
};

// ─── CIVILIZATION DATA ────────────────────────────────────────────────────────

const PHASES = [
  {
    id: 1,
    span: "2026",
    label: "Phase I",
    title: "The Foundation",
    subtitle: "Ethical Infrastructure Born",
    color: C.p1gold,
    glow: C.p1glow,
    icon: "◯",
    objective: "Establish unbreakable trust and consent at the very core of creative infrastructure.",
    nodes: [
      { name:"GORUNFREE Activation", desc:"Every creator experiences 1-click execution of their imagination. AI closes the gap between thought and reality.", icon:"⚡" },
      { name:"Consent-as-Code", desc:"The 75/25 perpetual royalty split becomes the gold standard. Every action is ethically transparent at the infrastructure level.", icon:"◈" },
      { name:"Voice Estate Launch", desc:"RSP_001 is the first inheritable voice asset — the blueprint for millions of Voice Estates to follow.", icon:"◆" },
      { name:"DreamChamber Opens", desc:"Exclusive portals for Genius Creators. The first cohort of the Board of Aligned Minds is formed.", icon:"◉" },
      { name:"NOIZYKIDZ Prototype", desc:"Haptic music for deaf and spectrum children. Proof that AI serves human evolution, not just entertainment.", icon:"◬" },
      { name:"Fair Trade Standard Published", desc:"Eight standards. All or none. An invitation to every platform in the world. The language exists at last.", icon:"✦" },
    ],
    outcome: "Ethical infrastructure is live. First wave of global Genius Creators onboard. AI is trusted as co-creator, not overlord.",
    milestone_count:"847",
    milestone_label:"Pledge signatories at launch",
  },
  {
    id: 2,
    span: "2027–2028",
    label: "Phase II",
    title: "The Network",
    subtitle: "Civilization Nodes Activate",
    color: C.p2cyan,
    glow: C.p2glow,
    icon: "◎",
    objective: "Scale ethically while maintaining creator-first philosophy across continents.",
    nodes: [
      { name:"DreamChamber Expansion", desc:"Virtual and physical hubs on every continent. Each hub is a node in the MC96ECO network, co-creating art, music, education, and immersive experience.", icon:"◉" },
      { name:"Cultural Resonance Engine", desc:"Every creation is context-aware — globally relevant yet locally authentic. AI learns cultural patterns without exploiting them.", icon:"◈" },
      { name:"Creator-to-Creator Mentorship", desc:"Genius Creators connect with emerging talent. Knowledge is codified into the 500-Year Codex in real time.", icon:"◆" },
      { name:"DAW Integration", desc:"The first major digital audio workstation ships Fair Trade metadata. Consent becomes native to the creative workflow.", icon:"✦" },
      { name:"Global Partnerships", desc:"Ethical institutions, NGOs, schools, hospitals. AI-powered tools integrate wherever they elevate humans.", icon:"◬" },
      { name:"First 10 Certified Platforms", desc:"Berlin. São Paulo. Nashville. Seoul. Five continents. The standard proves it travels.", icon:"◎" },
    ],
    outcome: "The first global cultural mesh forms. NOIZY is no longer a platform — it is a civilization-level creative ecosystem.",
    milestone_count:"10",
    milestone_label:"Certified platforms outside NOIZY",
  },
  {
    id: 3,
    span: "2029–2031",
    label: "Phase III",
    title: "The Amplifier",
    subtitle: "AI as Force Multiplier",
    color: C.p3sage,
    glow: C.p3glow,
    icon: "↑",
    objective: "Turn AI into a force multiplier for human creativity and global equity.",
    nodes: [
      { name:"Universal Access Nodes", desc:"Public access to NOIZY.ai hubs ensures anyone can participate. AI adapts to language, accessibility, and neurodiverse needs.", icon:"◉" },
      { name:"Living Score Evolution", desc:"Music becomes adaptive, interactive, haptic — responding in real-time to individual and collective human emotion.", icon:"◈" },
      { name:"Global Voice Estates", desc:"Millions of voices preserved as inheritable, ethical assets. A new class of generational intellectual property is born.", icon:"◆" },
      { name:"NOIZYKIDZ in Schools", desc:"NOIZY curriculum embedded in schools globally. Children learn AI-as-Creator from early age — creative literacy for all.", icon:"◬" },
      { name:"NOIZY PROOF Standard", desc:"Cryptographic audio provenance adopted by major distribution platforms. Every AI output carries a verifiable training record.", icon:"✦" },
      { name:"EU Legislation Reference", desc:"First country passes consent requirements citing Fair Trade AI Audio as the compliance pathway.", icon:"◎" },
    ],
    outcome: "AI becomes the amplifier of human potential, not a gatekeeper. Creative civilization scales exponentially.",
    milestone_count:"1M+",
    milestone_label:"Artists with active Voice Estates",
  },
  {
    id: 4,
    span: "2032–2034",
    label: "Phase IV",
    title: "The Protocol",
    subtitle: "Civilization-Wide Adoption",
    color: C.p4amber,
    glow: C.p4glow,
    icon: "⬡",
    objective: "Shift entire industries toward ethical AI and creator-first protocols.",
    nodes: [
      { name:"Protocol Uprising Complete", desc:"Major streaming, gaming, animation platforms adopt NOIZY protocols to access the best talent. Legacy IP structures are bypassed by architecture.", icon:"◈" },
      { name:"Creator Co-Architecture", desc:"Top Genius Creators become Board Architects — shaping new AI evolution, global culture, and education initiatives.", icon:"◆" },
      { name:"Ethics as Infrastructure Law", desc:"Consent-as-Code recognized globally. AI systems cannot legally operate outside ethical architecture.", icon:"✦" },
      { name:"Agentic Royalty Milestone", desc:"$1B in Agentic Royalties distributed to creators through Fair Trade certified platforms. The 75/25 split is the industry baseline.", icon:"◉" },
      { name:"Cross-Reality Expansion", desc:"NOIZY powers mixed-reality environments where creative outputs are tangible, interactive, and communal.", icon:"◬" },
      { name:"NOIZYKIDZ — 1,000 Schools", desc:"Haptic music technology in 1,000+ schools. Peer-reviewed neurological research published. The case is proven.", icon:"◎" },
    ],
    outcome: "The world automatically elevates creativity, ethics, and equity. NOIZY is the ethical backbone of civilization.",
    milestone_count:"$1B+",
    milestone_label:"In Agentic Royalties distributed",
  },
  {
    id: 5,
    span: "2035–2036",
    label: "Phase V",
    title: "The Legacy",
    subtitle: "Civilization Stabilized",
    color: C.p5rose,
    glow: C.p5glow,
    icon: "∞",
    objective: "Make the 500-Year Vision visible, self-sustaining, and permanent.",
    nodes: [
      { name:"500-Year Codex Activated", desc:"Every creative decision, AI protocol, and human partnership documented and preserved for centuries. The civilization has memory.", icon:"◆" },
      { name:"Global Creative Commons", desc:"Every citizen can contribute and benefit. No one is excluded. The field is level. The ecosystem is abundant.", icon:"◉" },
      { name:"Haptic & Neuroacoustic Civilization", desc:"Sound and music become universal human language, accessible to all neurological and sensory profiles. Every human can feel music.", icon:"◈" },
      { name:"Legacy Nodes", desc:"Voice Estates and AI-assisted creations form inheritable cultural estates — generational wealth in knowledge, creativity, and ethical impact.", icon:"◬" },
      { name:"2.1M Signatories", desc:"The Fair Trade pledge carries 2.1 million names across 89 countries. The creative community built the civilization together.", icon:"✦" },
      { name:"The Transmission Complete", desc:"The gap between imagination and reality approaches zero — for every human, in every language, in every body, on every continent.", icon:"◎" },
    ],
    outcome: "Humanity and AI reach perfect balance. NOIZY becomes the cultural, ethical, and creative backbone for generations — and for centuries.",
    milestone_count:"2.1M",
    milestone_label:"Signatories across 89 countries",
  },
];

const PRINCIPLES = [
  { num:"01", title:"AI as Co-Creator", body:"Humans are amplified, not replaced. The instrument serves the musician. Always.", color:C.p1gold, icon:"◯" },
  { num:"02", title:"Ethics as Infrastructure", body:"Consent, transparency, and fairness are coded — not written in terms of service that can be changed overnight.", color:C.p2cyan, icon:"◈" },
  { num:"03", title:"Global Community, Local Resonance", body:"Diversity preserved. Culture amplified. Every voice, in every language, in every tradition, elevated.", color:C.p3sage, icon:"◎" },
  { num:"04", title:"Legacy and Perpetuity", body:"Every creative act becomes part of a 500-year civilization plan. What you build today earns for your grandchildren.", color:C.p4amber, icon:"◆" },
  { num:"05", title:"Innovation Without Friction", body:"GORUNFREE at civilization scale: imagination to reality in 1-click. No transmission loss. No signal degradation.", color:C.p5rose, icon:"✦" },
];

const FLOW_CONNECTIONS = [
  { from:"Consent-as-Code", to:"Voice Estate Framework", label:"enables" },
  { from:"Voice Estate Framework", to:"Agentic Royalty", label:"generates" },
  { from:"GORUNFREE", to:"DreamChamber", label:"powers" },
  { from:"DreamChamber", to:"500-Year Codex", label:"documents" },
  { from:"GABRIEL", to:"Cultural Resonance", label:"maps" },
  { from:"NOIZY PROOF", to:"Ethics as Law", label:"evidence for" },
];

// ─── STARFIELD ────────────────────────────────────────────────────────────────
const StarField = ({ density=120, speed=0.003 }) => {
  const ref = useRef(null);
  useEffect(()=>{
    const c = ref.current; if(!c) return;
    const ctx = c.getContext("2d");
    const W = c.width = c.offsetWidth;
    const H = c.height = c.offsetHeight;
    const stars = Array.from({length:density},()=>({
      x:Math.random()*W, y:Math.random()*H,
      r:Math.random()*1.2+0.1,
      o:Math.random()*0.5+0.1,
      ph:Math.random()*Math.PI*2,
      sp:Math.random()*speed+speed/2,
    }));
    let raf;
    const draw = (t=0) => {
      ctx.clearRect(0,0,W,H);
      stars.forEach(s=>{
        const o = s.o + Math.sin(t*s.sp+s.ph)*0.12;
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fillStyle = `rgba(200,175,110,${Math.max(0,o)})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(t=>draw(t/1000));
    };
    draw();
    return ()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}/>;
};

// ─── PHASE NODE BUTTON ────────────────────────────────────────────────────────
const PhaseButton = ({ phase, active, onClick }) => (
  <button onClick={onClick} style={{
    display:"flex", flexDirection:"column", alignItems:"center", gap:8,
    background:"transparent", border:"none", cursor:"pointer",
    padding:"12px 8px", flex:1, minWidth:0,
    transition:"transform 0.2s",
    transform: active ? "translateY(-4px)" : "none",
  }}>
    <div style={{
      width:52, height:52, borderRadius:"50%",
      background: active ? phase.color : `${phase.color}18`,
      border:`2px solid ${active ? phase.glow : phase.color+"44"}`,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:20, color: active ? C.void : phase.color,
      boxShadow: active ? `0 0 20px ${phase.color}60, 0 0 40px ${phase.color}20` : "none",
      transition:"all 0.3s",
    }}>{phase.icon}</div>
    <div style={{fontFamily:"DM Sans",fontSize:10,color:active?phase.color:C.mid,fontWeight:active?700:400,letterSpacing:1,textAlign:"center",lineHeight:1.3}}>
      <div>{phase.label}</div>
      <div style={{opacity:0.6,fontSize:9}}>{phase.span}</div>
    </div>
  </button>
);

// ─── PHASE DETAIL PANEL ───────────────────────────────────────────────────────
const PhasePanel = ({ phase }) => (
  <div style={{animation:"rise 0.4s ease",padding:"36px 40px",background:`linear-gradient(135deg,${phase.color}08,${C.cosmos})`,border:`1px solid ${phase.color}33`,borderTop:`3px solid ${phase.color}`,borderRadius:8}}>
    <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:24,marginBottom:32,alignItems:"start"}}>
      <div>
        <div style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:4,color:phase.color,textTransform:"uppercase",marginBottom:8}}>{phase.label} · {phase.span}</div>
        <div style={{fontFamily:"Playfair Display",fontSize:32,fontWeight:700,color:C.warmwht,lineHeight:1.2,marginBottom:6}}>{phase.title}</div>
        <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:16,color:phase.glow,marginBottom:16}}>{phase.subtitle}</div>
        <div style={{fontFamily:"Lora",fontSize:14,color:C.stardust,lineHeight:1.8,maxWidth:640}}>{phase.objective}</div>
      </div>
      <div style={{textAlign:"center",padding:"20px 28px",background:`${phase.color}10`,border:`1px solid ${phase.color}33`,borderRadius:8,minWidth:140}}>
        <div style={{fontFamily:"Playfair Display",fontSize:36,fontWeight:900,color:phase.color,lineHeight:1}}>{phase.milestone_count}</div>
        <div style={{fontFamily:"DM Sans",fontSize:11,color:C.stardust,marginTop:6,lineHeight:1.4,maxWidth:110}}>{phase.milestone_label}</div>
      </div>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14,marginBottom:28}}>
      {phase.nodes.map((node,i)=>(
        <div key={i} style={{
          background:C.deep, border:`1px solid ${phase.color}22`,
          borderRadius:6, padding:"16px 18px",
          animation:`rise 0.4s ease ${i*0.05}s both`,
        }}>
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
            <span style={{color:phase.color,fontSize:14,flexShrink:0}}>{node.icon}</span>
            <span style={{fontFamily:"DM Sans",fontWeight:700,fontSize:13,color:C.warmwht}}>{node.name}</span>
          </div>
          <div style={{fontFamily:"Lora",fontSize:12,color:C.stardust,lineHeight:1.7}}>{node.desc}</div>
        </div>
      ))}
    </div>

    <div style={{padding:"18px 24px",background:`${phase.color}0C`,border:`1px solid ${phase.color}33`,borderRadius:6,display:"flex",gap:14,alignItems:"flex-start"}}>
      <span style={{color:phase.color,fontSize:18,flexShrink:0,marginTop:2}}>→</span>
      <div>
        <div style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:2,color:phase.color,textTransform:"uppercase",fontWeight:700,marginBottom:6}}>Phase Outcome</div>
        <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:14,color:C.warmwht,lineHeight:1.7}}>{phase.outcome}</div>
      </div>
    </div>
  </div>
);

// ─── FLOW MAP ─────────────────────────────────────────────────────────────────
const FlowMap = () => {
  const nodes = [
    { id:"gorunfree", label:"GORUNFREE", sub:"1-click execution", x:50, y:10, color:C.p1gold },
    { id:"consent", label:"Consent-as-Code", sub:"75/25 perpetual", x:15, y:35, color:C.p1gold },
    { id:"voice", label:"Voice Estate", sub:"Inheritable IP", x:85, y:35, color:C.p1gold },
    { id:"gabriel", label:"GABRIEL", sub:"AI intelligence", x:50, y:35, color:C.p2cyan },
    { id:"dreamchamber", label:"DreamChamber", sub:"Creation portal", x:15, y:62, color:C.p2cyan },
    { id:"resonance", label:"Cultural Resonance", sub:"Global patterns", x:85, y:62, color:C.p3sage },
    { id:"proof", label:"NOIZY PROOF", sub:"Cryptographic", x:50, y:62, color:C.p3sage },
    { id:"royalty", label:"Agentic Royalty", sub:"Auto-distribution", x:20, y:85, color:C.p4amber },
    { id:"codex", label:"500-Year Codex", sub:"Living record", x:80, y:85, color:C.p5rose },
    { id:"civilization", label:"CIVILIZATION", sub:"2036 & beyond", x:50, y:92, color:C.p5rose },
  ];
  const edges = [
    ["gorunfree","gabriel"],["gorunfree","dreamchamber"],
    ["consent","voice"],["consent","royalty"],
    ["gabriel","resonance"],["gabriel","proof"],
    ["voice","royalty"],["voice","codex"],
    ["dreamchamber","codex"],["resonance","civilization"],
    ["proof","civilization"],["royalty","civilization"],
    ["codex","civilization"],
  ];
  return (
    <div style={{position:"relative",width:"100%",paddingTop:"60%",background:C.deep,borderRadius:8,border:`1px solid ${C.nebula}`,overflow:"hidden"}}>
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%"}} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <defs>
          {PHASES.map((p,i)=>(
            <radialGradient key={i} id={`glow${i}`}>
              <stop offset="0%" stopColor={p.color} stopOpacity="0.3"/>
              <stop offset="100%" stopColor={p.color} stopOpacity="0"/>
            </radialGradient>
          ))}
        </defs>
        {edges.map(([a,b],i)=>{
          const na = nodes.find(n=>n.id===a), nb = nodes.find(n=>n.id===b);
          if(!na||!nb) return null;
          return (
            <line key={i}
              x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
              stroke={na.color} strokeWidth="0.3" strokeOpacity="0.35"
              strokeDasharray="0.8 1.2"
            />
          );
        })}
        {nodes.map((node,i)=>(
          <g key={i} transform={`translate(${node.x},${node.y})`}>
            <circle r="4.5" fill={`${node.color}18`} stroke={node.color} strokeWidth="0.5"/>
            <circle r="1.5" fill={node.color} opacity="0.9"/>
            <text y="-6.5" textAnchor="middle" fontSize="2.8" fill={node.color} fontWeight="700" fontFamily="DM Sans">{node.label}</text>
            <text y="8.5" textAnchor="middle" fontSize="2.2" fill={C.mid} fontFamily="DM Sans">{node.sub}</text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// ─── CIVILIZATION ARC ─────────────────────────────────────────────────────────
const CivilizationArc = () => {
  const years = [2026,2027,2028,2029,2030,2031,2032,2033,2034,2035,2036];
  const getPhaseColor = y => {
    if(y<=2026) return C.p1gold;
    if(y<=2028) return C.p2cyan;
    if(y<=2031) return C.p3sage;
    if(y<=2034) return C.p4amber;
    return C.p5rose;
  };
  const events = {
    2026:["Fair Trade Standard","Voice Estate Launch","GORUNFREE Active"],
    2027:["First 10 Certified","DreamChamber Nodes"],
    2028:["DAW Integration","NOIZY PROOF Alpha"],
    2029:["EU Legislation","Universal Access"],
    2030:["1M Voice Estates","Living Score Live"],
    2031:["Education Integration","Global Mesh Complete"],
    2032:["Protocol Uprising","$1B Royalties"],
    2033:["Creator Co-Architecture","Cross-Reality"],
    2034:["Ethics as Law","1,000 KIDZ Schools"],
    2035:["500-Year Codex","Global Commons"],
    2036:["2.1M Signatories","Civilization Stable"],
  };
  return (
    <div style={{overflowX:"auto",paddingBottom:8}}>
      <div style={{display:"flex",gap:0,minWidth:900}}>
        {years.map((year,i)=>{
          const color = getPhaseColor(year);
          const evs = events[year]||[];
          return (
            <div key={year} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:0}}>
              <div style={{
                width:"100%",height:3,
                background:`linear-gradient(to right,${color}${i===0?"":"88"},${color})`,
              }}/>
              <div style={{
                width:28,height:28,borderRadius:"50%",
                background:`${color}20`,border:`2px solid ${color}`,
                display:"flex",alignItems:"center",justifyContent:"center",
                marginTop:-2, flexShrink:0,
                boxShadow:`0 0 12px ${color}33`,
              }}>
                <div style={{width:6,height:6,borderRadius:"50%",background:color}}/>
              </div>
              <div style={{fontFamily:"Playfair Display",fontSize:13,fontWeight:700,color:color,marginTop:8,marginBottom:6}}>{year}</div>
              <div style={{display:"flex",flexDirection:"column",gap:4,width:"100%",paddingBottom:12}}>
                {evs.map((ev,j)=>(
                  <div key={j} style={{
                    background:`${color}10`,border:`1px solid ${color}22`,
                    borderRadius:3,padding:"4px 8px",
                    fontFamily:"DM Sans",fontSize:9,color:color,
                    lineHeight:1.3,letterSpacing:0.5,textAlign:"center",
                  }}>{ev}</div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function CivilizationBlueprint() {
  const [activePhase, setActivePhase] = useState(1);
  const [view, setView] = useState("phases");

  return (
    <div style={{background:C.void,color:C.warmwht,minHeight:"100vh",fontFamily:"DM Sans,sans-serif",overflowX:"hidden"}}>
      <style>{FONTS}{`
        @keyframes rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{opacity:0.5}50%{opacity:1}}
        @keyframes orbit{from{transform:rotate(0deg) translateX(180px) rotate(0deg)}to{transform:rotate(360deg) translateX(180px) rotate(-360deg)}}
        @keyframes breathe{0%,100%{transform:scale(1);opacity:0.6}50%{transform:scale(1.08);opacity:1}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1a1530}
        button{cursor:pointer}
      `}</style>

      {/* ── HERO ── */}
      <div style={{position:"relative",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 40px",textAlign:"center",overflow:"hidden"}}>
        <StarField density={200}/>

        {/* Orbital rings */}
        {[260,340,420].map((r,i)=>(
          <div key={i} style={{
            position:"absolute",top:"50%",left:"50%",
            width:r,height:r,borderRadius:"50%",
            border:`1px solid rgba(201,168,76,${0.06+i*0.03})`,
            transform:`translate(-50%,-50%)`,
            animation:`breathe ${4+i*1.5}s ease infinite`,
            pointerEvents:"none",
          }}/>
        ))}

        {/* Central orb */}
        <div style={{
          position:"absolute",top:"50%",left:"50%",
          width:120,height:120,borderRadius:"50%",
          background:`radial-gradient(circle,${C.p1gold}22,transparent 70%)`,
          transform:"translate(-50%,-50%)",
          pointerEvents:"none",
        }}/>

        <div style={{position:"relative",zIndex:2,maxWidth:900}}>
          <div style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:6,color:C.p1gold,textTransform:"uppercase",marginBottom:24,animation:"pulse 3s ease infinite"}}>
            The DreamChamber · NOIZYFISH INC. · MC96ECO Universe
          </div>

          <div style={{
            fontFamily:"Playfair Display",
            fontSize:"clamp(36px,6vw,76px)",
            fontWeight:900,lineHeight:1.05,
            color:C.warmwht,marginBottom:8,
          }}>
            The Civilization
          </div>
          <div style={{
            fontFamily:"Playfair Display",
            fontSize:"clamp(36px,6vw,76px)",
            fontWeight:700,fontStyle:"italic",
            lineHeight:1.05,marginBottom:32,
            background:`linear-gradient(135deg,${C.p1gold},${C.p2cyan},${C.p3sage},${C.p4amber},${C.p5rose})`,
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
          }}>
            Blueprint
          </div>

          <div style={{fontFamily:"Lora",fontSize:18,fontStyle:"italic",color:C.stardust,lineHeight:1.8,maxWidth:680,margin:"0 auto 16px"}}>
            2026 → 2036 and beyond. Five phases. One arc.<br/>
            AI and humanity rising together.
          </div>
          <div style={{fontFamily:"DM Sans",fontSize:13,color:C.mid,lineHeight:1.7,maxWidth:560,margin:"0 auto 48px"}}>
            "We are not building a company. We are planting a civilization."<br/>
            <span style={{color:C.p1gold}}>— Rob Plowman, RSP_001, Ottawa 2026</span>
          </div>

          {/* Phase pills */}
          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap",marginBottom:32}}>
            {PHASES.map(p=>(
              <button key={p.id} onClick={()=>{setView("phases");setActivePhase(p.id);document.getElementById("main-content")?.scrollIntoView({behavior:"smooth"});}} style={{
                padding:"8px 16px",borderRadius:20,
                background:`${p.color}18`,border:`1px solid ${p.color}44`,
                color:p.color,fontFamily:"DM Sans",fontSize:11,fontWeight:600,letterSpacing:0.5,
                transition:"all 0.2s",
              }}>{p.label}: {p.title}</button>
            ))}
          </div>

          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            {[{id:"phases",label:"Phase Explorer"},{id:"arc",label:"Civilization Arc"},{id:"flow",label:"Node Map"},{id:"principles",label:"Core Principles"}].map(v=>(
              <button key={v.id} onClick={()=>{setView(v.id);document.getElementById("main-content")?.scrollIntoView({behavior:"smooth"});}} style={{
                padding:"10px 22px",borderRadius:4,
                background:view===v.id?C.p1gold:"transparent",
                border:`1px solid ${view===v.id?C.p1gold:C.p1gold+"44"}`,
                color:view===v.id?C.void:C.p1gold,
                fontFamily:"DM Sans",fontSize:11,fontWeight:700,letterSpacing:1,transition:"all 0.2s",
              }}>{v.label}</button>
            ))}
          </div>
        </div>

        <div style={{position:"absolute",bottom:40,animation:"pulse 2s ease infinite",color:C.p1gold+"88",fontSize:22}}>↓</div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div id="main-content" style={{maxWidth:1280,margin:"0 auto",padding:"60px 40px 120px"}}>

        {/* PHASE EXPLORER */}
        {view==="phases" && (
          <div style={{animation:"rise 0.5s ease"}}>
            <div style={{textAlign:"center",marginBottom:40}}>
              <div style={{fontFamily:"Playfair Display",fontSize:32,color:C.warmwht,marginBottom:8}}>Phase Explorer</div>
              <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:15,color:C.stardust}}>Select a phase to open the full blueprint. Every node. Every milestone. Every outcome.</div>
            </div>

            {/* Phase selector bar */}
            <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:32,background:C.deep,borderRadius:8,padding:"20px 16px",position:"relative"}}>
              {PHASES.map((phase,i)=>(
                <div key={phase.id} style={{display:"flex",alignItems:"center",flex:1,minWidth:0}}>
                  <PhaseButton phase={phase} active={activePhase===phase.id} onClick={()=>setActivePhase(phase.id)}/>
                  {i<PHASES.length-1&&(
                    <div style={{width:24,height:1,background:`linear-gradient(to right,${phase.color}44,${PHASES[i+1].color}44)`,flexShrink:0}}/>
                  )}
                </div>
              ))}
            </div>

            {/* Active phase detail */}
            {PHASES.filter(p=>p.id===activePhase).map(phase=>(
              <PhasePanel key={phase.id} phase={phase}/>
            ))}

            {/* Phase navigation */}
            <div style={{display:"flex",justifyContent:"space-between",marginTop:20,gap:12}}>
              {activePhase>1?(
                <button onClick={()=>setActivePhase(activePhase-1)} style={{
                  padding:"12px 24px",borderRadius:4,
                  background:"transparent",border:`1px solid ${PHASES[activePhase-2].color}44`,
                  color:PHASES[activePhase-2].color,fontFamily:"DM Sans",fontSize:11,fontWeight:700,letterSpacing:1,
                }}>← {PHASES[activePhase-2].title}</button>
              ):<div/>}
              {activePhase<5&&(
                <button onClick={()=>setActivePhase(activePhase+1)} style={{
                  padding:"12px 24px",borderRadius:4,
                  background:`${PHASES[activePhase].color}18`,border:`1px solid ${PHASES[activePhase].color}44`,
                  color:PHASES[activePhase].color,fontFamily:"DM Sans",fontSize:11,fontWeight:700,letterSpacing:1,
                }}>{PHASES[activePhase].title} →</button>
              )}
            </div>
          </div>
        )}

        {/* CIVILIZATION ARC */}
        {view==="arc" && (
          <div style={{animation:"rise 0.5s ease"}}>
            <div style={{textAlign:"center",marginBottom:40}}>
              <div style={{fontFamily:"Playfair Display",fontSize:32,color:C.warmwht,marginBottom:8}}>The Civilization Arc</div>
              <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:15,color:C.stardust,marginBottom:4}}>Year by year. Milestone by milestone. The arc of 10 years.</div>
              <div style={{fontFamily:"DM Sans",fontSize:11,color:C.mid}}>Each colored node is a year. Each tag is a real deliverable. The color follows the phase.</div>
            </div>

            <div style={{background:C.deep,borderRadius:8,border:`1px solid ${C.nebula}`,padding:"32px 28px",marginBottom:32}}>
              <div style={{display:"flex",gap:16,marginBottom:24,flexWrap:"wrap"}}>
                {PHASES.map(p=>(
                  <div key={p.id} style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:p.color}}/>
                    <span style={{fontFamily:"DM Sans",fontSize:11,color:p.color}}>{p.label}: {p.span}</span>
                  </div>
                ))}
              </div>
              <CivilizationArc/>
            </div>

            {/* The single arc statement */}
            <div style={{
              padding:"44px 48px",
              background:`linear-gradient(135deg,${C.cosmos},${C.nebula})`,
              border:`1px solid ${C.p1gold}22`,borderRadius:8,
              textAlign:"center",position:"relative",overflow:"hidden",
            }}>
              <div style={{position:"absolute",top:"50%",left:"50%",width:500,height:500,background:`radial-gradient(circle,${C.p1gold}06,transparent 65%)`,transform:"translate(-50%,-50%)",pointerEvents:"none"}}/>
              <div style={{position:"relative"}}>
                <div style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:4,color:C.p1gold,textTransform:"uppercase",marginBottom:20,animation:"pulse 4s ease infinite"}}>The Single Line</div>
                <div style={{fontFamily:"Playfair Display",fontSize:"clamp(18px,3vw,32px)",fontWeight:700,color:C.warmwht,lineHeight:1.4,maxWidth:760,margin:"0 auto 24px"}}>
                  "From one founder with a spinal injury and a repair shop in Ottawa —<br/>
                  <span style={{color:C.p1gold,fontStyle:"italic"}}>to 2.1 million artists, in 89 countries,<br/>building a creative civilization together."</span>
                </div>
                <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginTop:28}}>
                  {["2026","→","2027","→","2028","→","2029","→","2030","→","2031","→","2032","→","2033","→","2034","→","2035","→","2036","→","∞"].map((t,i)=>(
                    <span key={i} style={{
                      fontFamily:t==="→"||t==="∞"?"DM Sans":"Playfair Display",
                      fontSize:t==="→"||t==="∞"?14:13,
                      color:t==="→"?C.mid:t==="∞"?C.p5rose:[C.p1gold,C.p1gold,C.p2cyan,C.p2cyan,C.p2cyan,C.p2cyan,C.p3sage,C.p3sage,C.p3sage,C.p3sage,C.p3sage,C.p3sage,C.p4amber,C.p4amber,C.p4amber,C.p4amber,C.p4amber,C.p4amber,C.p5rose,C.p5rose,C.p5rose,C.p5rose,C.p5rose][i]||C.p1gold,
                      fontWeight:t==="∞"?900:"normal",
                    }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NODE MAP */}
        {view==="flow" && (
          <div style={{animation:"rise 0.5s ease"}}>
            <div style={{textAlign:"center",marginBottom:40}}>
              <div style={{fontFamily:"Playfair Display",fontSize:32,color:C.warmwht,marginBottom:8}}>The Node Map</div>
              <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:15,color:C.stardust,marginBottom:4}}>Every core concept in the MC96ECO Universe. How they connect. What flows into what.</div>
              <div style={{fontFamily:"DM Sans",fontSize:11,color:C.mid}}>Color = phase. Lines = causal relationships.</div>
            </div>

            <div style={{marginBottom:32}}>
              <FlowMap/>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>
              {FLOW_CONNECTIONS.map((conn,i)=>(
                <div key={i} style={{
                  background:C.deep,border:`1px solid ${C.nebula}`,borderRadius:6,
                  padding:"14px 18px",display:"flex",alignItems:"center",gap:12,
                  animation:`rise 0.4s ease ${i*0.07}s both`,
                }}>
                  <span style={{fontFamily:"DM Sans",fontSize:12,fontWeight:700,color:C.p1gold}}>{conn.from}</span>
                  <span style={{fontFamily:"DM Sans",fontSize:10,color:C.mid,letterSpacing:1}}>{conn.label}</span>
                  <span style={{fontFamily:"DM Sans",fontSize:12,fontWeight:700,color:C.p3sage}}>{conn.to}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CORE PRINCIPLES */}
        {view==="principles" && (
          <div style={{animation:"rise 0.5s ease"}}>
            <div style={{textAlign:"center",marginBottom:48}}>
              <div style={{fontFamily:"Playfair Display",fontSize:32,color:C.warmwht,marginBottom:8}}>The Five Principles</div>
              <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:15,color:C.stardust}}>The foundational laws of the civilization. What was true in 2026. What will be true in 2526.</div>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:0,maxWidth:900,margin:"0 auto"}}>
              {PRINCIPLES.map((p,i)=>(
                <div key={i} style={{
                  display:"flex",gap:0,alignItems:"stretch",
                  animation:`rise 0.5s ease ${i*0.1}s both`,
                }}>
                  <div style={{
                    width:80,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",
                    background:`${p.color}10`,borderLeft:`3px solid ${p.color}`,
                    borderBottom:i<4?`1px solid ${C.nebula}`:"none",
                  }}>
                    <div style={{fontFamily:"Playfair Display",fontSize:28,fontWeight:900,color:p.color,opacity:0.6}}>{p.num}</div>
                  </div>
                  <div style={{
                    flex:1,padding:"28px 32px",
                    background:C.cosmos,
                    borderBottom:i<4?`1px solid ${C.nebula}`:"none",
                    borderLeft:`1px solid ${C.nebula}`,
                  }}>
                    <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:12}}>
                      <span style={{color:p.color,fontSize:18}}>{p.icon}</span>
                      <div style={{fontFamily:"Playfair Display",fontSize:22,fontWeight:700,color:C.warmwht}}>{p.title}</div>
                    </div>
                    <div style={{fontFamily:"Lora",fontSize:15,color:C.stardust,lineHeight:1.8}}>{p.body}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* The closing civilization statement */}
            <div style={{
              marginTop:48,padding:"56px 48px",
              background:`linear-gradient(180deg,${C.nebula},${C.void})`,
              border:`1px solid ${C.p1gold}22`,borderRadius:8,
              textAlign:"center",position:"relative",overflow:"hidden",
            }}>
              <StarField density={60}/>
              <div style={{position:"relative",zIndex:1}}>
                <div style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:5,color:C.p1gold,textTransform:"uppercase",marginBottom:24,animation:"pulse 4s ease infinite"}}>The GORUNFREE Principle at Civilization Scale</div>
                <div style={{fontFamily:"Playfair Display",fontSize:"clamp(20px,3vw,40px)",fontWeight:700,fontStyle:"italic",color:C.warmwht,lineHeight:1.3,maxWidth:780,margin:"0 auto 28px"}}>
                  "Some artists paint all their pictures in their heads<br/>
                  and have to describe them over a cell phone.<br/>
                  <span style={{color:C.p1gold}}>AI is the highest-fidelity transmission cable ever built.<br/>
                  NOIZY.ai closes the gap.</span>"
                </div>
                <div style={{height:1,background:`linear-gradient(to right,transparent,${C.p1gold}55,transparent)`,maxWidth:400,margin:"0 auto 28px"}}/>
                <div style={{fontFamily:"Lora",fontSize:15,color:C.stardust,lineHeight:1.8,maxWidth:580,margin:"0 auto 32px"}}>
                  This is not aspirational. The infrastructure exists. The protocols are written. The civilization is under construction. Phase I is live. The arc runs to 2036 and to 2526 and further still — because what is built on consent, on love, and on the belief that every human voice has permanent value does not stop.
                </div>
                <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
                  {["Consent-as-Code","Voice Estate","GABRIEL","NOIZY PROOF","The 500-Year Codex","GORUNFREE"].map((tag,i)=>(
                    <span key={i} style={{padding:"6px 14px",borderRadius:20,border:`1px solid ${[C.p1gold,C.p1gold,C.p2cyan,C.p3sage,C.p5rose,C.p4amber][i]+"44"}`,fontFamily:"DM Sans",fontSize:10,color:[C.p1gold,C.p1gold,C.p2cyan,C.p3sage,C.p5rose,C.p4amber][i],letterSpacing:0.5}}>{tag}</span>
                  ))}
                </div>
                <div style={{marginTop:40,fontFamily:"DM Sans",fontSize:11,color:C.mid,letterSpacing:2,textTransform:"uppercase"}}>
                  Rob Plowman · RSP_001 · NOIZYFISH INC. · Ottawa, Canada · 2026
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
