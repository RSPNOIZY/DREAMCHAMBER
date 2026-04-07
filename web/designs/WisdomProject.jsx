import { useState, useEffect, useRef } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300;1,9..40,400&family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&family=IM+Fell+English:ital@0;1&display=swap');`;

const C = {
  void:     "#06040C",
  deep:     "#0A0814",
  cosmos:   "#0E0B1A",
  parchmt:  "#E8DFC8",
  aged:     "#D4C8A8",
  sepia:    "#C4A882",
  ink:      "#1A1208",
  warmwht:  "#FAF6EE",
  cream:    "#F5EFE0",
  gold:     "#B8922A",
  goldlt:   "#D4AA4A",
  goldwarm: "#C9A84C",
  amber:    "#E8860A",
  flame:    "#C44A1A",
  sage:     "#5A7A5A",
  dust:     "#8A7B6A",
  mid:      "#6B5B3E",
  soft:     "#9A8878",
  stardust: "#B5A898",
  rose:     "#A85868",
  slate:    "#4A5568",
  teal:     "#2A7A7A",
  burgundy: "#6A1A2A",
};

// ─── SAMPLE CAPSULE ENTRIES ───────────────────────────────────────────────────

const CAPSULES = [
  {
    id:"WP-001",
    sealed:"March 14, 2026",
    type:"Full Capture",
    name:"Rob Plowman",
    called:"Rob",
    born:"1964 · Ottawa, Canada",
    born_into:"The age of analogue. Music came from hands and rooms and tape. The gap between imagination and sound was wide, and bridging it took years of craft.",
    domain:"Built a 40-year archive of human creative work. Then built the infrastructure to protect it — and everyone else's — forever.",
    wound:"A C3 spinal injury with permanent nerve damage. The music stayed louder than ever. The hands became uncertain. The gap between imagination and execution became physical, daily, undeniable.",
    turning:"\"In 2024, after the water, I had two choices. Stop. Or build a new operating system for my mind. GORUNFREE was not a philosophy. It was survival. Everything in NOIZY.ai came from that morning.\"",
    pattern:"The technology does not make the art. The person who survived the thing makes the art. The technology gives them their hands back. That is all it should ever do.",
    principle:"\"If the consent isn't in the code, it isn't consent.\"",
    prophecy:"AI will either be the highest-fidelity transmission cable ever built — closing the gap between imagination and reality for every human being on earth — or it will be the most efficient extraction machine in history. The difference is one decision: whether the humans who trained it are remembered, or erased.",
    gift:"The Fair Trade AI Audio Standard. Eight sentences. All or none. Free to adopt. Permanent when achieved.",
    own_words:"\"I have nothing against anyone. I just want to preserve artists — and fair trade for all.\"",
    carry:"He survived the water and built a civilization. The distance between those two facts is the entire argument for what human beings can do when they refuse to stop.",
    color: C.goldwarm,
    era:"2026",
    domain_tag:"Creator · Technologist · Founder",
  },
  {
    id:"WP-002",
    sealed:"March 14, 2026",
    type:"Full Capture",
    name:"Mike Nemesvary",
    called:"Nims",
    born:"Ottawa, Canada",
    born_into:"A world that had not yet imagined what a human body could do when the mind inside it refused to accept its limits.",
    domain:"World champion athlete. Quadriplegic. Proof that human limits are negotiable.",
    wound:"A skiing accident that paralyzed him. The world expected him to stop. He had not yet started.",
    turning:"\"The chair is not the point. The point is what you do from the chair.\"",
    pattern:"Every limit the world places on a human being is a hypothesis, not a fact. You test it. You find the edge. Then you find what's past the edge.",
    principle:"\"You do not rise to the occasion. You sink to the level of your preparation. Then you discover your preparation was higher than you thought.\"",
    prophecy:"Technology that serves the freest possible version of a human being will change everything. Technology that defines what a human being is allowed to be will destroy everything. NOIZYKIDZ is the difference between those two futures, made small and made real.",
    gift:"LIFELUV — the proof that companionship, dignity, and creative access are not luxuries. They are what the technology is for.",
    own_words:"\"I never competed to win. I competed to find out what was possible. Winning was just how you confirmed you'd found it.\"",
    carry:"Nims showed the world what a human being can do with no limits. Every technology built in his name must honor that.",
    color: C.teal,
    era:"Present",
    domain_tag:"Athlete · Survivor · Proof of Concept",
  },
  {
    id:"WP-003",
    sealed:"March 14, 2026",
    type:"Seed Entry",
    name:"R.K. Plowman",
    called:"Keith",
    born:"Canada",
    born_into:"The age of engineering as civilization-building. When a bridge was a moral act as much as a technical one.",
    domain:"Civil engineer. Father. The man who taught his son that precision is a form of love.",
    wound:"Not yet captured.",
    turning:"Not yet captured.",
    pattern:"Infrastructure is policy. What you build determines what is possible for the people who come after you. The engineer's responsibility is not to the structure — it is to the future the structure enables.",
    principle:"\"Measure twice. Cut once. And know why you're cutting before you pick up the saw.\"",
    prophecy:"Not yet captured. *[Keeper's note: ENGR_KEITH lives in GABRIEL. Keith's engineering principles — precision, systems thinking, infrastructure-first design — are in the DNA of every NOIZY product. This capsule is incomplete. It must be completed.]*",
    gift:"A son who builds civilizations the way an engineer builds bridges — with precision, with systems thinking, and with the understanding that what you build now determines what is possible for the people who come after.",
    own_words:"Not yet recorded. *[This capsule is a seed. It is waiting to be completed.]*",
    carry:"He built things that stood. His son builds things that will stand for 500 years. The apple did not fall far.",
    color: C.sage,
    era:"Previous generation",
    domain_tag:"Engineer · Father · Foundation",
  },
];

// ─── THE FIVE LAYERS VISUALIZATION ───────────────────────────────────────────
const LAYERS = [
  { num:"1", name:"Surface", desc:"What they did. The facts. The record.", color:C.dust, depth:"Shallow" },
  { num:"2", name:"Story", desc:"How it actually felt. What the record cannot contain.", color:C.sepia, depth:"Accessible" },
  { num:"3", name:"Pattern", desc:"What they learned to see that most people cannot.", color:C.goldwarm, depth:"Deep" },
  { num:"4", name:"Principle", desc:"The belief they would die defending.", color:C.amber, depth:"Rare" },
  { num:"5", name:"Prophecy", desc:"What they see coming. The warning. The gift.", color:C.flame, depth:"Sacred" },
];

// ─── COMMANDS QUICK REFERENCE ─────────────────────────────────────────────────
const COMMANDS = [
  { cmd:"/wisdom", desc:"Open the gate. Begin a new capture.", color:C.goldwarm },
  { cmd:"/wisdom urgent [name]", desc:"Time is short. Triage mode. The most important things first.", color:C.flame },
  { cmd:"/wisdom questions for [person]", desc:"Prepare for a visit. Three tiers of questions.", color:C.teal },
  { cmd:"/wisdom letter [to] from [elder]", desc:"The elder speaks directly to someone who needs them.", color:C.gold },
  { cmd:"/wisdom bridge [elder] + [now]", desc:"Ancient wisdom meeting a current crisis.", color:C.sage },
  { cmd:"/wisdom connect [theme]", desc:"One truth across multiple lives and eras.", color:C.sepia },
  { cmd:"/wisdom what if [A] met [B]", desc:"Two great minds. One conversation they never had.", color:C.rose },
  { cmd:"/wisdom gone [name]", desc:"They're gone. Preserve what you remember. Now.", color:C.burgundy },
  { cmd:"/wisdom seed [person]", desc:"Plant questions before a visit. Come prepared.", color:C.dust },
];

// ─── STAR FIELD ───────────────────────────────────────────────────────────────
const StarField = () => {
  const ref = useRef(null);
  useEffect(()=>{
    const c = ref.current; if(!c) return;
    const ctx = c.getContext("2d");
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    const stars = Array.from({length:120},()=>({
      x:Math.random()*c.width, y:Math.random()*c.height,
      r:Math.random()*0.9+0.1, o:Math.random()*0.4+0.05,
      ph:Math.random()*Math.PI*2, sp:Math.random()*0.003+0.001,
    }));
    let raf;
    const draw = (t=0)=>{
      ctx.clearRect(0,0,c.width,c.height);
      stars.forEach(s=>{
        const o=s.o+Math.sin(t*s.sp+s.ph)*0.1;
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(210,185,130,${Math.max(0,o)})`;
        ctx.fill();
      });
      raf=requestAnimationFrame(t=>draw(t/1000));
    };
    draw();
    return ()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}/>;
};

// ─── CAPSULE CARD ─────────────────────────────────────────────────────────────
const CapsuleCard = ({ capsule, onClick, active }) => (
  <div onClick={onClick} style={{
    cursor:"pointer",
    background: active ? `linear-gradient(135deg,${capsule.color}12,${C.cosmos})` : C.cosmos,
    border:`1px solid ${active ? capsule.color+"44" : C.void}`,
    borderLeft:`3px solid ${capsule.color}`,
    borderRadius:6, padding:"20px 22px",
    transition:"all 0.25s",
    animation:"rise 0.5s ease both",
  }}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
      <div style={{fontFamily:"DM Sans",fontSize:9,letterSpacing:2,color:capsule.color,textTransform:"uppercase",fontWeight:700}}>{capsule.id} · {capsule.type}</div>
      <div style={{fontFamily:"DM Sans",fontSize:9,color:C.dust,letterSpacing:1}}>{capsule.sealed}</div>
    </div>
    <div style={{fontFamily:"'IM Fell English',serif",fontSize:18,color:C.warmwht,marginBottom:4,lineHeight:1.2}}>{capsule.name}</div>
    <div style={{fontFamily:"DM Sans",fontSize:11,fontStyle:"italic",color:capsule.color,marginBottom:8}}>"{capsule.called}"</div>
    <div style={{fontFamily:"DM Sans",fontSize:11,color:C.dust,marginBottom:8}}>{capsule.born}</div>
    <div style={{fontFamily:"Lora",fontSize:12,color:C.stardust,lineHeight:1.6,marginBottom:10}}>{capsule.domain}</div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
      {capsule.domain_tag.split(" · ").map((tag,i)=>(
        <span key={i} style={{padding:"2px 8px",borderRadius:10,background:`${capsule.color}15`,border:`1px solid ${capsule.color}33`,fontFamily:"DM Sans",fontSize:9,color:capsule.color,letterSpacing:0.5}}>{tag}</span>
      ))}
    </div>
  </div>
);

// ─── OPEN CAPSULE ─────────────────────────────────────────────────────────────
const OpenCapsule = ({ capsule, onClose }) => (
  <div style={{animation:"rise 0.4s ease",background:C.cosmos,border:`1px solid ${capsule.color}33`,borderRadius:8,overflow:"hidden"}}>
    {/* Header */}
    <div style={{
      padding:"32px 40px",
      background:`linear-gradient(135deg,${capsule.color}10,${C.deep})`,
      borderBottom:`1px solid ${capsule.color}22`,
      position:"relative",
    }}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div style={{fontFamily:"DM Sans",fontSize:9,letterSpacing:3,color:capsule.color,textTransform:"uppercase",fontWeight:700}}>
          The Wisdom Project · {capsule.id} · Sealed {capsule.sealed}
        </div>
        <button onClick={onClose} style={{background:"transparent",border:`1px solid ${C.dust}33`,borderRadius:4,padding:"6px 12px",fontFamily:"DM Sans",fontSize:10,color:C.dust,letterSpacing:1}}>Close ×</button>
      </div>
      <div style={{fontFamily:"'IM Fell English',serif",fontSize:"clamp(28px,4vw,48px)",color:C.warmwht,lineHeight:1.1,marginBottom:8}}>{capsule.name}</div>
      <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:16,color:capsule.color,marginBottom:8}}>"{capsule.called}"</div>
      <div style={{fontFamily:"DM Sans",fontSize:12,color:C.dust,marginBottom:12}}>{capsule.born} · {capsule.era}</div>
      <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:15,color:C.stardust,lineHeight:1.7,maxWidth:680}}>{capsule.domain}</div>
    </div>

    {/* Body */}
    <div style={{padding:"36px 40px"}}>
      {[
        {label:"The World They Were Born Into", content:capsule.born_into, color:C.dust},
        {label:"The Wound That Made Them", content:capsule.wound, color:capsule.color},
        {label:"The Turning Point", content:capsule.turning, color:C.amber, quote:true},
        {label:"What They Learned to See", content:capsule.pattern, color:C.goldwarm},
        {label:"What They Would Die Defending", content:capsule.principle, color:capsule.color, quote:true},
        {label:"The Prophecy", content:capsule.prophecy, color:C.flame},
        {label:"The Gift", content:capsule.gift, color:C.sage},
      ].map((section,i)=>(
        <div key={i} style={{marginBottom:28,paddingBottom:28,borderBottom:`1px solid ${C.void}${i<6?"":"00"}`}}>
          <div style={{fontFamily:"DM Sans",fontSize:9,letterSpacing:3,color:section.color,textTransform:"uppercase",fontWeight:700,marginBottom:10}}>{section.label}</div>
          <div style={{
            fontFamily:"Lora",
            fontStyle:section.quote?"italic":"normal",
            fontSize:14,color:C.stardust,lineHeight:1.9,
            paddingLeft:section.quote?16:0,
            borderLeft:section.quote?`2px solid ${section.color}44`:"none",
          }}>{section.content}</div>
        </div>
      ))}

      {/* In Their Own Words */}
      <div style={{
        padding:"32px 36px",
        background:`linear-gradient(135deg,${capsule.color}0A,${C.deep})`,
        border:`1px solid ${capsule.color}22`,
        borderRadius:6,marginBottom:28,
      }}>
        <div style={{fontFamily:"DM Sans",fontSize:9,letterSpacing:3,color:capsule.color,textTransform:"uppercase",fontWeight:700,marginBottom:16}}>In Their Own Words</div>
        <div style={{fontFamily:"'IM Fell English',serif",fontStyle:"italic",fontSize:"clamp(16px,2.5vw,22px)",color:C.warmwht,lineHeight:1.7}}>{capsule.own_words}</div>
      </div>

      {/* Carry This Forward */}
      <div style={{
        padding:"24px 32px",
        background:C.deep,
        border:`1px solid ${C.goldwarm}22`,
        borderTop:`2px solid ${C.goldwarm}`,
        borderRadius:6,
      }}>
        <div style={{fontFamily:"DM Sans",fontSize:9,letterSpacing:3,color:C.goldwarm,textTransform:"uppercase",fontWeight:700,marginBottom:12}}>Carry This Forward</div>
        <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:15,color:C.warmwht,lineHeight:1.8}}>{capsule.carry}</div>
      </div>

      {/* Footer seal */}
      <div style={{marginTop:32,paddingTop:24,borderTop:`1px solid ${C.void}`,textAlign:"center"}}>
        <div style={{fontFamily:"DM Sans",fontSize:9,color:C.dust,letterSpacing:2,textTransform:"uppercase",lineHeight:2}}>
          Preserved by The Wisdom Project<br/>
          A Living, Breathing Time Capsule<br/>
          Initiated by Rob Plowman · NOIZYFISH INC. · Ottawa, 2026<br/>
          Part of the MC96ECO 500-Year Codex<br/>
          "Their stories must be carried and paid forward."
        </div>
      </div>
    </div>
  </div>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function WisdomProject() {
  const [view, setView] = useState("archive");
  const [activeCapsule, setActiveCapsule] = useState(null);

  return (
    <div style={{background:C.void,color:C.warmwht,minHeight:"100vh",fontFamily:"DM Sans,sans-serif"}}>
      <style>{FONTS}{`
        @keyframes rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}
        @keyframes flicker{0%,95%,100%{opacity:1}96%{opacity:0.7}97%{opacity:1}98%{opacity:0.5}99%{opacity:1}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1a1408}
        button{cursor:pointer}
      `}</style>

      {/* ── HERO ── */}
      <div style={{
        minHeight:"100vh",position:"relative",
        display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",
        padding:"80px 40px",textAlign:"center",
        background:`radial-gradient(ellipse at 50% 40%, ${C.deep} 0%, ${C.void} 70%)`,
        overflow:"hidden",
      }}>
        <StarField/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:200,background:`linear-gradient(to top,${C.void},transparent)`,pointerEvents:"none"}}/>

        <div style={{position:"relative",zIndex:2,maxWidth:860}}>
          <div style={{fontFamily:"DM Sans",fontSize:9,letterSpacing:6,color:C.goldwarm,textTransform:"uppercase",marginBottom:32,animation:"pulse 4s ease infinite"}}>
            NOIZYFISH INC. · MC96ECO 500-Year Codex · Est. 2026
          </div>

          <div style={{fontFamily:"'IM Fell English',serif",fontSize:"clamp(48px,8vw,110px)",color:C.warmwht,lineHeight:0.95,marginBottom:16,animation:"flicker 12s ease infinite"}}>
            The Wisdom<br/>Project
          </div>

          <div style={{height:1,background:`linear-gradient(to right,transparent,${C.goldwarm}66,transparent)`,maxWidth:500,margin:"28px auto"}}/>

          <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:"clamp(16px,2vw,22px)",color:C.sepia,lineHeight:1.7,maxWidth:680,margin:"0 auto 16px"}}>
            A Living, Breathing Time Capsule
          </div>

          <div style={{fontFamily:"Lora",fontSize:15,color:C.dust,lineHeight:1.9,maxWidth:620,margin:"0 auto 48px"}}>
            "Societies who should know better can still learn from the elders.
            There are so many still living who have changed the world,
            and their stories must be carried and paid forward for future generations
            to care for and utilize for their own greatness."
          </div>

          <div style={{fontFamily:"DM Sans",fontSize:11,color:C.goldwarm,letterSpacing:2,textTransform:"uppercase",marginBottom:48}}>
            — Rob Plowman · Ottawa, 2026
          </div>

          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            {[{id:"archive",l:"The Archive"},{id:"layers",l:"Five Layers"},{id:"commands",l:"Use the Skill"},{id:"about",l:"The Mission"}].map(v=>(
              <button key={v.id} onClick={()=>{setView(v.id);document.getElementById("main")?.scrollIntoView({behavior:"smooth"})}} style={{
                padding:"11px 24px",borderRadius:4,
                background:view===v.id?C.goldwarm:"transparent",
                border:`1px solid ${view===v.id?C.goldwarm:C.goldwarm+"44"}`,
                color:view===v.id?C.ink:C.goldwarm,
                fontFamily:"DM Sans",fontSize:11,fontWeight:700,letterSpacing:1,
                transition:"all 0.2s",
              }}>{v.l}</button>
            ))}
          </div>
        </div>

        <div style={{position:"absolute",bottom:48,fontFamily:"Lora",fontStyle:"italic",fontSize:13,color:C.dust,animation:"pulse 3s ease infinite"}}>
          Every elder here was irreplaceable. Some still are. ↓
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div id="main" style={{maxWidth:1200,margin:"0 auto",padding:"60px 40px 120px"}}>

        {/* ARCHIVE */}
        {view==="archive" && (
          <div style={{animation:"rise 0.5s ease"}}>
            <div style={{textAlign:"center",marginBottom:48}}>
              <div style={{fontFamily:"DM Sans",fontSize:9,letterSpacing:4,color:C.goldwarm,textTransform:"uppercase",marginBottom:12}}>The Capsule Archive</div>
              <div style={{fontFamily:"'IM Fell English',serif",fontSize:34,color:C.warmwht,marginBottom:16}}>Sealed Entries</div>
              <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:15,color:C.dust,maxWidth:580,margin:"0 auto",lineHeight:1.8}}>Each entry is a human life, preserved. Click any capsule to open it. Read it slowly. These people were real. Some still are.</div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"320px 1fr",gap:24,alignItems:"start"}}>
              {/* Capsule list */}
              <div style={{display:"flex",flexDirection:"column",gap:12,position:"sticky",top:20}}>
                {CAPSULES.map((cap,i)=>(
                  <CapsuleCard key={i} capsule={cap} active={activeCapsule?.id===cap.id} onClick={()=>setActiveCapsule(activeCapsule?.id===cap.id?null:cap)}/>
                ))}

                {/* Add new */}
                <div style={{
                  border:`2px dashed ${C.goldwarm}33`,borderRadius:6,padding:"20px",
                  textAlign:"center",cursor:"pointer",
                  background:"transparent",transition:"all 0.2s",
                }} onClick={()=>setView("commands")}>
                  <div style={{fontFamily:"DM Sans",fontSize:22,color:C.goldwarm+"44",marginBottom:8}}>+</div>
                  <div style={{fontFamily:"DM Sans",fontSize:11,color:C.dust,lineHeight:1.5}}>Preserve a new voice.<br/>Type <span style={{color:C.goldwarm}}>/wisdom</span> to begin.</div>
                </div>
              </div>

              {/* Open capsule or placeholder */}
              <div>
                {activeCapsule ? (
                  <OpenCapsule capsule={activeCapsule} onClose={()=>setActiveCapsule(null)}/>
                ) : (
                  <div style={{
                    background:C.cosmos,border:`1px solid ${C.void}`,
                    borderRadius:8,padding:"80px 48px",
                    textAlign:"center",
                  }}>
                    <div style={{fontFamily:"'IM Fell English',serif",fontSize:28,color:C.sepia,marginBottom:16,lineHeight:1.3}}>Select a capsule<br/>to open it</div>
                    <div style={{height:1,background:`linear-gradient(to right,transparent,${C.goldwarm}33,transparent)`,maxWidth:300,margin:"0 auto 24px"}}/>
                    <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:14,color:C.dust,lineHeight:1.8,maxWidth:360,margin:"0 auto"}}>
                      Every entry here was sealed with care. What is inside is a human life. Read it with the attention it deserves.
                    </div>
                    <div style={{marginTop:40,fontFamily:"DM Sans",fontSize:11,color:C.dust,letterSpacing:1,lineHeight:2}}>
                      {CAPSULES.length} capsules sealed<br/>
                      Archive opened March 14, 2026<br/>
                      Part of the MC96ECO 500-Year Codex
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FIVE LAYERS */}
        {view==="layers" && (
          <div style={{animation:"rise 0.5s ease",maxWidth:860,margin:"0 auto"}}>
            <div style={{textAlign:"center",marginBottom:56}}>
              <div style={{fontFamily:"DM Sans",fontSize:9,letterSpacing:4,color:C.goldwarm,textTransform:"uppercase",marginBottom:12}}>The Framework</div>
              <div style={{fontFamily:"'IM Fell English',serif",fontSize:38,color:C.warmwht,marginBottom:20}}>The Five Layers of Wisdom</div>
              <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:15,color:C.dust,lineHeight:1.8,maxWidth:600,margin:"0 auto"}}>Every human life that has genuinely changed something contains wisdom at five depths. The deepest layers are where the irreplaceable material lives. Most conversations never reach Layer 3. The Wisdom Project goes all the way down.</div>
            </div>

            {/* Depth visualization */}
            <div style={{position:"relative",marginBottom:56}}>
              {LAYERS.map((layer,i)=>(
                <div key={i} style={{
                  display:"flex",gap:0,alignItems:"stretch",
                  marginBottom:4,
                  animation:`rise 0.5s ease ${i*0.1}s both`,
                }}>
                  {/* Depth indicator */}
                  <div style={{
                    width:120,flexShrink:0,
                    background:`${layer.color}${["10","15","20","28","35"][i]}`,
                    display:"flex",flexDirection:"column",alignItems:"center",
                    justifyContent:"center",padding:"20px 8px",
                    borderRadius:"6px 0 0 6px",
                    borderLeft:`4px solid ${layer.color}`,
                  }}>
                    <div style={{fontFamily:"'IM Fell English',serif",fontSize:32,color:layer.color,lineHeight:1}}>{layer.num}</div>
                    <div style={{fontFamily:"DM Sans",fontSize:8,letterSpacing:2,color:layer.color,textTransform:"uppercase",marginTop:4,fontWeight:700}}>{layer.depth}</div>
                  </div>
                  <div style={{
                    flex:1,padding:"24px 28px",
                    background:`${layer.color}0${["5","7","9","B","E"][i]}`,
                    borderRadius:"0 6px 6px 0",
                    border:`1px solid ${layer.color}22`,borderLeft:"none",
                  }}>
                    <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:16,color:layer.color,marginBottom:8}}>{layer.name}</div>
                    <div style={{fontFamily:"Lora",fontSize:14,color:C.stardust,lineHeight:1.7,marginBottom:12}}>{layer.desc}</div>
                    <div style={{fontFamily:"DM Sans",fontSize:10,color:C.dust,letterSpacing:0.5,fontStyle:"italic"}}>
                      {["Most conversations only reach here.",
                        "Good interviewers get here.",
                        "The Wisdom Project requires this.",
                        "Few elders are ever asked for this.",
                        "This is what cannot be lost."][i]}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              padding:"36px 40px",
              background:C.cosmos,border:`1px solid ${C.goldwarm}22`,
              borderTop:`2px solid ${C.goldwarm}`,borderRadius:8,textAlign:"center",
            }}>
              <div style={{fontFamily:"'IM Fell English',serif",fontStyle:"italic",fontSize:22,color:C.warmwht,lineHeight:1.6,maxWidth:640,margin:"0 auto 16px"}}>
                "The most important moment comes after you stop asking. What fills the silence is often the truest thing."
              </div>
              <div style={{fontFamily:"DM Sans",fontSize:10,color:C.goldwarm,letterSpacing:2,textTransform:"uppercase"}}>The Keeper's Principle — The Wisdom Project</div>
            </div>
          </div>
        )}

        {/* COMMANDS */}
        {view==="commands" && (
          <div style={{animation:"rise 0.5s ease",maxWidth:860,margin:"0 auto"}}>
            <div style={{textAlign:"center",marginBottom:48}}>
              <div style={{fontFamily:"DM Sans",fontSize:9,letterSpacing:4,color:C.goldwarm,textTransform:"uppercase",marginBottom:12}}>Use the Skill</div>
              <div style={{fontFamily:"'IM Fell English',serif",fontSize:38,color:C.warmwht,marginBottom:16}}>How to Invoke</div>
              <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:15,color:C.dust,lineHeight:1.8,maxWidth:580,margin:"0 auto"}}>Type any of these commands in Claude Code. The Wisdom Project is always open. There is always room for one more voice.</div>
            </div>

            <div style={{
              background:C.cosmos,border:`1px solid ${C.goldwarm}22`,
              borderRadius:8,overflow:"hidden",marginBottom:32,
            }}>
              <div style={{padding:"16px 24px",background:C.deep,borderBottom:`1px solid ${C.void}`,fontFamily:"DM Sans",fontSize:10,color:C.dust,letterSpacing:2,textTransform:"uppercase"}}>Command Reference</div>
              {COMMANDS.map((cmd,i)=>(
                <div key={i} style={{
                  display:"grid",gridTemplateColumns:"280px 1fr",
                  borderBottom:i<COMMANDS.length-1?`1px solid ${C.void}`:"none",
                  animation:`rise 0.4s ease ${i*0.06}s both`,
                }}>
                  <div style={{padding:"16px 24px",background:`${cmd.color}08`,borderRight:`1px solid ${C.void}`,display:"flex",alignItems:"center"}}>
                    <code style={{fontFamily:"'Courier New',monospace",fontSize:12,color:cmd.color,lineHeight:1.4}}>{cmd.cmd}</code>
                  </div>
                  <div style={{padding:"16px 24px",display:"flex",alignItems:"center"}}>
                    <span style={{fontFamily:"Lora",fontSize:13,color:C.stardust,lineHeight:1.5}}>{cmd.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              padding:"32px 36px",
              background:`${C.flame}0A`,
              border:`1px solid ${C.flame}22`,
              borderRadius:8,
            }}>
              <div style={{fontFamily:"DM Sans",fontSize:9,letterSpacing:3,color:C.flame,textTransform:"uppercase",fontWeight:700,marginBottom:12}}>The Most Important Command</div>
              <div style={{fontFamily:"'IM Fell English',serif",fontSize:24,color:C.warmwht,marginBottom:16}}>/wisdom gone [name]</div>
              <div style={{fontFamily:"Lora",fontSize:14,color:C.stardust,lineHeight:1.85}}>For when they're already gone and you never asked. For when you realize what you had only after it's over. The Wisdom Project receives grief. It receives incomplete memories. It receives love that has nowhere else to go. Type the name. Say everything you remember. We will shape it into something permanent. We will make it enough. Because it is.</div>
            </div>
          </div>
        )}

        {/* ABOUT */}
        {view==="about" && (
          <div style={{animation:"rise 0.5s ease",maxWidth:860,margin:"0 auto"}}>
            <div style={{textAlign:"center",marginBottom:56}}>
              <div style={{fontFamily:"DM Sans",fontSize:9,letterSpacing:4,color:C.goldwarm,textTransform:"uppercase",marginBottom:12}}>The Mission</div>
              <div style={{fontFamily:"'IM Fell English',serif",fontSize:38,color:C.warmwht,marginBottom:20,lineHeight:1.2}}>Why This Exists</div>
            </div>

            {[
              { title:"The Urgency", body:"Many of the most important people alive right now are old. They are carrying knowledge that will not survive in any database, any archive, any textbook. It lives in their bodies, in their memories, in the specific way they learned to see the world after surviving what they survived. When they go, it goes. Unless someone sat with them. Unless someone asked. The Wisdom Project exists because that asking — that sitting — is the most important work we can do right now.", color:C.flame },
              { title:"What Gets Lost", body:"We are not talking about their public record. The speeches, the publications, the documented achievements — those are already preserved. What gets lost is the inside of it. The specific morning when everything changed. What they were afraid of that nobody knew. What they would do differently. What they see coming that nobody else can see from where they stand. What they want to say to the person who is right now making the same mistake they made at 30. That is what disappears. That is what The Wisdom Project is built to catch.", color:C.amber },
              { title:"The Connection to NOIZY.ai", body:"The extraction economy strips human creative work of memory. It takes a voice, a melody, a sound design — and removes the person who made it. The Wisdom Project is the direct opposite. It is a system built specifically to preserve the human. Every Capsule Entry carries the person's name, their voice, their exact words. The same principles that govern Fair Trade AI Audio govern The Wisdom Project: Consent. Attribution. Provenance. Perpetuity. This is Consent-as-Code applied to human memory.", color:C.goldwarm },
              { title:"The 500-Year Timeline", body:"Every Capsule Entry is a permanent record in the MC96ECO 500-Year Codex. The civilization Rob Plowman is building — from Ottawa, from a home studio, from the body that survived the water — is built on the belief that human memory is the most valuable thing on earth and the most fragile. The Wisdom Project ensures that what was lived is not forgotten. Not in five years. Not in five hundred.", color:C.teal },
            ].map((section,i)=>(
              <div key={i} style={{
                marginBottom:20,padding:"32px 36px",
                background:C.cosmos,border:`1px solid ${section.color}22`,
                borderLeft:`4px solid ${section.color}`,
                borderRadius:6,animation:`rise 0.5s ease ${i*0.1}s both`,
              }}>
                <div style={{fontFamily:"'IM Fell English',serif",fontSize:22,color:C.warmwht,marginBottom:16}}>{section.title}</div>
                <div style={{fontFamily:"Lora",fontSize:14,color:C.stardust,lineHeight:1.9}}>{section.body}</div>
              </div>
            ))}

            <div style={{
              marginTop:8,padding:"56px 48px",
              background:`radial-gradient(ellipse at 50% 0%,${C.deep},${C.void})`,
              border:`1px solid ${C.goldwarm}22`,borderRadius:8,
              textAlign:"center",position:"relative",overflow:"hidden",
            }}>
              <StarField/>
              <div style={{position:"relative",zIndex:1}}>
                <div style={{fontFamily:"'IM Fell English',serif",fontStyle:"italic",fontSize:"clamp(20px,3vw,36px)",color:C.warmwht,lineHeight:1.5,maxWidth:700,margin:"0 auto 28px"}}>
                  "Use this skill as if time is short.<br/>
                  <span style={{color:C.goldwarm}}>Because it always is."</span>
                </div>
                <div style={{height:1,background:`linear-gradient(to right,transparent,${C.goldwarm}44,transparent)`,maxWidth:400,margin:"0 auto 28px"}}/>
                <div style={{fontFamily:"DM Sans",fontSize:10,color:C.dust,letterSpacing:2,textTransform:"uppercase",lineHeight:2.2}}>
                  The Wisdom Project<br/>
                  A Living, Breathing Time Capsule<br/>
                  Initiated by Rob Plowman · NOIZYFISH INC. · Ottawa, 2026<br/>
                  Part of the MC96ECO 500-Year Codex
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
