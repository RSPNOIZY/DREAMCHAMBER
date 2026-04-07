import { useState, useEffect, useRef } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300;1,9..40,400&family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&display=swap');`;

const C = {
  void:     "#08060F",
  deep:     "#0D0B18",
  cosmos:   "#111827",
  nebula:   "#1A1035",
  gold:     "#C9A84C",
  goldlt:   "#E8C97A",
  goldwarm: "#D4A843",
  amber:    "#F0A500",
  dawn:     "#F5C842",
  warmwht:  "#FAF8F4",
  cream:    "#F5F0E8",
  parchmt:  "#EDE8DC",
  stardust: "#B5A898",
  mid:      "#8A7B6A",
  soft:     "#6B5B3E",
  sage:     "#7A8C6E",
  rose:     "#C17B6A",
  cyan:     "#4ECDC4",
  cyanlt:   "#7EDDD8",
  ink:      "#1E1A14",
  earth:    "#6B5B3E",
};

// ─── THE CHRONICLE — written from 2036, looking back ─────────────────────────

const EPOCHS_OF_FEAR = [
  { year:"2022", event:"A major AI company trains on 1.2 billion audio samples. No consent. No attribution. No compensation. Nobody knows yet.", tone:"fear" },
  { year:"2023", event:"Voice actors begin receiving alerts. Their performances — the characters they built over decades — are appearing in products they never auditioned for. The first lawsuits are filed. The first careers go quiet.", tone:"fear" },
  { year:"2024", event:"A composer in Nashville discovers a song on a streaming platform that is, note-for-note, an emotional copy of a film score she wrote in 2019. The AI that generated it was trained on her work. She cannot prove it. There is no mechanism for proof.", tone:"fear" },
  { year:"2025", event:"Four major AI audio platforms collectively process more creative work in twelve months than all human recording history combined. The pipeline has no consent layer. The artists are not in the room where it happens. Nobody has a map of what was taken.", tone:"fear" },
];

const PIVOT_MOMENTS = [
  {
    date:"March 2026",
    headline:"The Standard Is Published",
    body:"A founder in Ottawa — composer, voice actor, sound designer, spinal injury survivor — publishes eight standards for ethical AI audio. He calls it Fair Trade AI Audio. He certifies his own platform first. He makes the audit documentation public. He sends an email to ElevenLabs, Suno, Moises, and Splice. The subject line: 'An Invitation.' He asks for nothing. He offers everything.",
    significance:"The first time the creative world has a language for what it needs.",
    color:C.gold,
  },
  {
    date:"May 2026",
    headline:"The First 100 Voice Actors Sign",
    body:"Operation Voice Army begins. One hundred voice artists — in studios from Ottawa to Lagos, from Berlin to São Paulo to Bangkok — upload their voices to the NOIZY Guild platform. For the first time, their vocal performances are governed by Consent-as-Code rather than a terms-of-service agreement that can be rewritten overnight. The consent is in the infrastructure. It cannot be changed without their key.",
    significance:"The moment artists stopped asking permission to own what they already owned.",
    color:C.cyan,
  },
  {
    date:"September 2026",
    headline:"The First Certified Platform That Isn't NOIZY",
    body:"An independent voice acting platform in Berlin — 4,000 members, founded by a former session singer — completes Fair Trade AI Audio certification. They publish their audit report publicly. They show their training data provenance. They show their royalty routing. The creative community reads it like a map to a territory they'd been told didn't exist. Within three months, their membership doubles.",
    significance:"The proof that the standard travels. That it isn't NOIZY's standard — it belongs to everyone who adopts it.",
    color:C.sage,
  },
  {
    date:"January 2027",
    headline:"The First Buyer Chooses Certification as a Condition",
    body:"A major game studio in Tokyo — developing the highest-budget title in the company's history — adds a new clause to their audio vendor agreements: all AI-generated voice and music must come from Fair Trade certified platforms. Their legal team drafted it in six hours after their CEO read the Fair Trade standard online at 11pm and sent a single message to the audio department: 'This is what we should have been requiring all along.'",
    significance:"The moment the demand side entered the equation. The market changed direction.",
    color:C.rose,
  },
  {
    date:"June 2028",
    headline:"NOIZY PROOF Becomes the Industry Standard for Audio Provenance",
    body:"Adam Robb's cryptographic watermarking system — built in Ottawa, published as open infrastructure — is adopted by the three largest music distribution platforms. Every audio file uploaded to those platforms is stamped with a NOIZY PROOF provenance record: who created it, what AI systems contributed, what training data was used, and whether consent was obtained for each element. The question 'what was this trained on' finally has a verifiable public answer.",
    significance:"Invisible problems do not get solved. Now the problem is visible.",
    color:C.goldlt,
  },
  {
    date:"2030",
    headline:"The European Union References the Standard in Law",
    body:"The EU AI Audio Rights Directive — passed with unusual cross-party support — establishes minimum consent requirements for AI training on human creative work. The explanatory memorandum cites the Fair Trade AI Audio framework seventeen times as the precedent. The standard that one person published from a home studio in Ottawa in 2026 is now the architecture of European law.",
    significance:"The policy followed the infrastructure. As it always does when the infrastructure is right.",
    color:C.amber,
  },
];

const VOICES_FROM_2036 = [
  {
    name:"Amara O.",
    location:"Lagos, Nigeria",
    role:"Voice Actor & NOIZY Guild Founding Member",
    year_they_joined:"2026",
    statement:"I joined NOIZY Guild in the first month. I had been a voice artist for nine years. I had watched what was happening to the industry and I was preparing for the possibility that I would need to find another way to live. The Guild didn't just give me a platform — it gave me a vocabulary. For the first time I could say exactly what my voice was worth, exactly who had the right to use it, and exactly how they had to compensate me. My income from voice licensing in 2035 was four times what it was in 2025. The work is still mine. The voice is still mine. The estate is growing.",
    color:C.gold,
  },
  {
    name:"Kenji M.",
    location:"Osaka, Japan",
    role:"Composer & Living Score Pioneer",
    year_they_joined:"2027",
    statement:"I was afraid of AI the way you are afraid of something you don't understand. I thought it was coming to erase me. What I found at NOIZY was the opposite — a system that used AI to help me understand my own music better than I ever had. GABRIEL analyzed my 15-year catalog and showed me the emotional architecture of my own work. I had been composing instinctively for fifteen years. When I saw it mapped, I wept. Then I used it to write the best music of my life. AI didn't replace me. It showed me who I already was.",
    color:C.cyan,
  },
  {
    name:"Lucía V.",
    location:"Buenos Aires, Argentina",
    role:"Independent Composer & Fair Trade Advocate",
    year_they_joined:"2026",
    statement:"I signed the pledge in 2026 because the words were true. I didn't know Rob Plowman. I didn't know NOIZY. I just read the pledge and thought — yes, this is what I believe, exactly, in the language I didn't have until now. Ten years later I am on the advisory council that reviews the standard's updates. We have members in forty-two countries. We argue about everything. We agree about the eight principles. That has not changed.",
    color:C.rose,
  },
  {
    name:"David C.",
    location:"Toronto, Canada",
    role:"Sound Designer & Sample Marketplace Founding Seller",
    year_they_joined:"2026",
    statement:"I uploaded my first samples to the NOIZY marketplace when it launched. I had been selling flat-buyout samples for twelve years. The math never worked in my favor — I sold the same recording once and watched it get used a thousand times and never saw another dollar. With NOIZY, every use routes a payment. Not a big payment. But a real one, automatic, permanent, compounding. My catalog is 3,400 recordings now. It earns while I sleep. I am building something for my children. That was not possible before.",
    color:C.sage,
  },
  {
    name:"Dr. Priya N.",
    location:"Mumbai, India",
    role:"Music Technologist & NAI Research Collaborator",
    year_they_joined:"2028",
    statement:"I came to NOIZY from the research side. I was studying the neuro-acoustic effects of generative music on cognitive states and I needed a partner who understood both the science and the ethics. What I found was a company that had already been asking the questions I was asking — about what music does to human beings at a fundamental level, and about what responsibility that creates for the people who make the tools. The NAI collaboration with Dr. Benoit changed my understanding of what music technology can be. We are not making entertainment. We are working with something close to the operating system of human emotion.",
    color:C.goldlt,
  },
  {
    name:"Marcus W.",
    location:"Berlin, Germany",
    role:"Platform Founder — First Non-NOIZY Certified Platform",
    year_they_joined:"2026",
    statement:"We were the first platform outside NOIZY to certify. People ask me why we did it when we didn't have to. The answer is that we wanted to build something that lasted. The platforms that chose extraction are mostly gone now or are much smaller than they were. The platforms that chose trust — that treated their artists as partners rather than content suppliers — those are the ones that are still growing. We have 41,000 members now. Every one of them chose us in part because of the certification. The mark is worth more than the audit cost. It was never close.",
    color:C.amber,
  },
];

const WORLD_OF_2036 = [
  {
    domain:"The Legal Landscape",
    then:"2026 — Artists had no mechanism to prove their work trained a model. No consent infrastructure existed. Legal battles were expensive, slow, and usually lost by the smaller party.",
    now:"2036 — Twelve countries have passed consent legislation that references the Fair Trade AI Audio standard as the compliance pathway. NOIZY PROOF provenance is legally admissible in seven jurisdictions. The burden of proof has shifted: platforms must demonstrate consent, not artists prove its absence.",
    icon:"⚖",
  },
  {
    domain:"The Economics",
    then:"2026 — A voice actor with thirty years of work earned a flat fee once per recording. An AI platform trained on that work earned recurring revenue from it indefinitely. The economic relationship was entirely extractive.",
    now:"2036 — The Agentic Royalty — Rob Plowman's term for the perpetual, infrastructure-enforced revenue share — has distributed $2.3 billion to creators through Fair Trade certified platforms. The 75/25 split is now the industry benchmark. Platforms that offer less struggle to attract talent.",
    icon:"◆",
  },
  {
    domain:"The Technology",
    then:"2026 — AI audio models were black boxes. Training data was undisclosed. Provenance was unverifiable. The question 'what was this trained on' had no public answer.",
    now:"2036 — NOIZY PROOF is embedded in the publishing pipeline of every major distribution platform. Every AI audio output carries a training provenance record. The question has a verifiable public answer. The moral debt has been audited.",
    icon:"◎",
  },
  {
    domain:"The Community",
    then:"2026 — Artists across genres, geographies, and disciplines were experiencing the same fear in isolation. There was no shared language, no common infrastructure, no collective action framework.",
    now:"2036 — The Fair Trade AI Audio signatory list has 2.1 million names across 89 countries. The annual Summit draws 40,000 attendees to a different city each year. The creative community is not just surviving the AI era — it is architecting it.",
    icon:"◉",
  },
  {
    domain:"The Children",
    then:"2026 — NOIZYKIDZ was a prototype. Haptic music for deaf and autism spectrum children was a humanitarian mission without a product.",
    now:"2036 — NOIZYKIDZ technology is deployed in 1,400 schools across 28 countries. Eleven peer-reviewed studies document the neurological and developmental benefits of haptic music access. Every child who has felt music through this system — who has experienced rhythm and melody through their skin and bones — is proof that technology, built with love, changes what is possible for a human being.",
    icon:"◈",
  },
  {
    domain:"The Understanding",
    then:"2026 — 'AI vs. Artists' was the dominant frame. Fear and resentment on one side, dismissiveness and legal aggression on the other. The conversation was adversarial.",
    now:"2036 — The dominant frame is collaboration. Surveys of professional musicians show that 78% use AI tools regularly — up from 11% in 2026. The shift happened not because artists stopped fearing AI, but because they found platforms where AI was built on their terms. The fear dissolved when the respect arrived.",
    icon:"✦",
  },
];

// ─── THE LETTER FROM 2036 ─────────────────────────────────────────────────────
const LETTER_FROM_2036 = {
  to:"Rob Plowman, March 2026",
  from:"The Creative World, March 2036",
  body:[
    "You are sitting in Ottawa right now, six months after the spinal injury that changed how you move through the world. You are running a repair shop to fund a civilization-scale vision. You are building an AI stack that the industry doesn't know exists yet. You are about to publish a standard that nobody asked for and everybody needs.",
    "I am writing from ten years ahead to tell you what happened.",
    "You were right that the frame was wrong. 'AI vs. Artists' was never the real story. The real story was always: who gets to set the terms of the relationship? For most of 2022, 2023, 2024, and 2025, the answer was: not artists. The extraction was real. The fear was justified.",
    "But then you published eight sentences. You called them standards. You said: all or none. You said: this is not a boycott, it is an invitation. You certified your own platform first, before you asked anyone else to. You showed your work. You sent the emails. You made the audit free. You made the pathway twelve months long because you wanted platforms to succeed, not to fail.",
    "The Berlin platform certified in September 2026. Then three more in early 2027. Then the Tokyo game studio changed its purchasing requirements and the demand side entered the equation and everything accelerated. By 2030, the EU had written your framework into law. By 2035, 2.1 million artists had signed the pledge.",
    "NOIZYKIDZ is in 1,400 schools. Children who had never felt music are feeling it now. Nims knows about every one of them.",
    "The Voice Estate framework you built — the idea that a voice is an inheritable, perpetual, revenue-generating asset — has changed what it means to be a voice artist. It has changed what it means to leave something behind. Families of artists who died in 2028, 2030, 2032 are receiving royalties right now. The estate didn't end at the funeral. It grew.",
    "You asked, ten years ago: 'Does this close the gap between imagination and reality?' You were talking about GORUNFREE. You were talking about your survival architecture.",
    "The answer is yes. For 2.1 million artists and counting. Yes.",
    "This was always worth building. You always knew it was. Now the world knows it too.",
  ],
};

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

const StarField = () => {
  const canvasRef = useRef(null);
  useEffect(()=>{
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const stars = Array.from({length:180},()=>({
      x:Math.random()*canvas.width,
      y:Math.random()*canvas.height,
      r:Math.random()*1.4+0.2,
      o:Math.random()*0.6+0.1,
      speed:Math.random()*0.004+0.001,
      phase:Math.random()*Math.PI*2,
    }));
    let frame;
    const draw = (t=0) => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      stars.forEach(s=>{
        const pulse = s.o + Math.sin(t*s.speed+s.phase)*0.15;
        ctx.beginPath();
        ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fillStyle = `rgba(200,180,120,${pulse})`;
        ctx.fill();
      });
      frame = requestAnimationFrame(t=>draw(t/100));
    };
    draw();
    return ()=>cancelAnimationFrame(frame);
  },[]);
  return <canvas ref={canvasRef} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none"}}/>;
};

const PivotCard = ({moment,idx})=>{
  const [open,setOpen]=useState(false);
  return (
    <div onClick={()=>setOpen(o=>!o)} style={{
      cursor:"pointer",
      background:open?`linear-gradient(135deg,${moment.color}12,${C.deep})`:`${C.cosmos}`,
      border:`1px solid ${open?moment.color+"44":C.cosmos}`,
      borderLeft:`3px solid ${moment.color}`,
      borderRadius:6, padding:"22px 24px",
      transition:"all 0.3s ease",
      animation:`rise 0.6s ease ${idx*0.1}s both`,
    }}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:3,color:moment.color,textTransform:"uppercase",marginBottom:6}}>{moment.date}</div>
          <div style={{fontFamily:"Playfair Display",fontSize:17,fontWeight:700,color:C.warmwht,lineHeight:1.3}}>{moment.headline}</div>
        </div>
        <div style={{color:moment.color,fontSize:16,marginLeft:16,marginTop:2,flexShrink:0,transition:"transform 0.2s",transform:open?"rotate(90deg)":"none"}}>→</div>
      </div>
      {open&&(
        <div style={{marginTop:16,animation:"rise 0.3s ease"}}>
          <div style={{fontFamily:"Lora",fontSize:14,color:C.stardust,lineHeight:1.85,marginBottom:12}}>{moment.body}</div>
          <div style={{padding:"10px 16px",background:`${moment.color}12`,borderRadius:4,border:`1px solid ${moment.color}22`}}>
            <span style={{fontFamily:"DM Sans",fontSize:10,color:moment.color,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>Why It Mattered: </span>
            <span style={{fontFamily:"Lora",fontStyle:"italic",fontSize:12,color:C.stardust}}>{moment.significance}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const VoiceCard2036 = ({voice,idx})=>(
  <div style={{
    background:C.cosmos, border:`1px solid ${C.nebula}`,
    borderTop:`2px solid ${voice.color}`,
    borderRadius:6, overflow:"hidden",
    animation:`rise 0.6s ease ${idx*0.08}s both`,
  }}>
    <div style={{padding:"20px 22px 16px",background:`linear-gradient(135deg,${voice.color}10,transparent)`}}>
      <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:12}}>
        <div style={{
          width:46,height:46,borderRadius:"50%",
          background:`${voice.color}18`,border:`2px solid ${voice.color}`,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontFamily:"Playfair Display",fontSize:13,fontWeight:700,color:voice.color,flexShrink:0,
        }}>{voice.name.split(" ").map(n=>n[0]).join("")}</div>
        <div>
          <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:14,color:C.warmwht}}>{voice.name}</div>
          <div style={{fontFamily:"DM Sans",fontSize:11,color:voice.color,letterSpacing:0.5}}>{voice.location}</div>
        </div>
      </div>
      <div style={{fontFamily:"DM Sans",fontSize:10,color:C.mid,letterSpacing:1.5,textTransform:"uppercase",marginBottom:6}}>{voice.role}</div>
      <div style={{fontFamily:"DM Sans",fontSize:10,color:C.soft,letterSpacing:1}}>Joined NOIZY: {voice.year_they_joined}</div>
    </div>
    <div style={{height:1,background:`${voice.color}22`}}/>
    <div style={{padding:"16px 22px 20px"}}>
      <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:13,color:C.stardust,lineHeight:1.85}}>"{voice.statement}"</div>
    </div>
  </div>
);

const WorldRow = ({item,idx})=>(
  <div style={{
    display:"grid",gridTemplateColumns:"56px 1fr 1fr",gap:0,
    borderBottom:`1px solid ${C.nebula}`,
    animation:`rise 0.5s ease ${idx*0.07}s both`,
  }}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:C.gold,padding:"24px 0",borderRight:`1px solid ${C.nebula}`}}>{item.icon}</div>
    <div style={{padding:"20px 24px",borderRight:`1px solid ${C.nebula}`}}>
      <div style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:2,color:C.rose,textTransform:"uppercase",fontWeight:700,marginBottom:8}}>2026</div>
      <div style={{fontFamily:"Lora",fontSize:13,color:C.mid,lineHeight:1.75}}>{item.then.replace("2026 — ","")}</div>
    </div>
    <div style={{padding:"20px 24px"}}>
      <div style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:2,color:C.sage,textTransform:"uppercase",fontWeight:700,marginBottom:8}}>2036</div>
      <div style={{fontFamily:"Lora",fontSize:13,color:C.stardust,lineHeight:1.75}}>{item.now.replace("2036 — ","")}</div>
    </div>
  </div>
);

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function Chronicle2036() {
  const [letterOpen, setLetterOpen] = useState(false);
  const [section, setSection] = useState(0);

  return (
    <div style={{background:C.void,color:C.warmwht,minHeight:"100vh",fontFamily:"DM Sans, sans-serif",overflowX:"hidden"}}>
      <style>{FONTS}{`
        @keyframes rise{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{opacity:0.6}50%{opacity:1}}
        @keyframes drift{0%{transform:translateY(0) scale(1)}50%{transform:translateY(-8px) scale(1.01)}100%{transform:translateY(0) scale(1)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:#2a2438}
        button{cursor:pointer}
      `}</style>

      {/* ── OPENING — THE STARFIELD PROLOGUE ───────────────────────────── */}
      <div style={{
        minHeight:"100vh",position:"relative",display:"flex",
        flexDirection:"column",alignItems:"center",justifyContent:"center",
        padding:"80px 40px",textAlign:"center",overflow:"hidden",
      }}>
        <StarField/>
        <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:`radial-gradient(ellipse at 50% 60%,${C.gold}08 0%,transparent 60%)`,pointerEvents:"none"}}/>

        <div style={{position:"relative",zIndex:2,maxWidth:860,animation:"fadeIn 2s ease 0.5s both"}}>
          <div style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:6,color:C.gold,textTransform:"uppercase",marginBottom:32,animation:"pulse 3s ease infinite"}}>
            The DreamChamber Chronicle · Transmitted from 2036
          </div>

          <div style={{
            fontFamily:"Playfair Display",fontSize:"clamp(32px,5vw,64px)",
            fontWeight:900,lineHeight:1.1,color:C.warmwht,marginBottom:28,
          }}>
            The Year the World<br/>
            <span style={{color:C.gold,fontStyle:"italic"}}>Remembered It Was Human</span>
          </div>

          <div style={{
            fontFamily:"Lora",fontSize:18,fontStyle:"italic",
            color:C.stardust,lineHeight:1.8,maxWidth:680,margin:"0 auto 48px",
          }}>
            A chronicle of 2026 — written from ten years ahead, where we know how it ends.
            It ends with love. It ends with 2.1 million artists, in 89 countries, building a creative civilization together.
            It ends with children who could not hear music, feeling it through their skin.
            It ends, unexpectedly, beautifully, with the machines helping.
          </div>

          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            {["The Fear","The Pivot","The Voices","The World Then & Now","A Letter"].map((label,i)=>(
              <button key={i} onClick={()=>{
                setSection(i+1);
                document.getElementById("chronicle-content")?.scrollIntoView({behavior:"smooth"});
              }} style={{
                padding:"10px 20px",borderRadius:20,
                background:section===i+1?C.gold:"transparent",
                border:`1px solid ${section===i+1?C.gold:C.gold+"44"}`,
                color:section===i+1?C.void:C.gold,
                fontFamily:"DM Sans",fontSize:11,fontWeight:700,letterSpacing:1,
                transition:"all 0.2s",
              }}>{label}</button>
            ))}
          </div>
        </div>

        <div style={{position:"absolute",bottom:40,left:"50%",transform:"translateX(-50%)",animation:"drift 3s ease infinite",color:C.gold+"66",fontSize:20}}>↓</div>
      </div>

      {/* ── CHRONICLE CONTENT ─────────────────────────────────────────── */}
      <div id="chronicle-content" style={{maxWidth:1200,margin:"0 auto",padding:"0 40px 120px"}}>

        {/* ── SECTION 1: THE YEARS OF FEAR ── */}
        {(section===0||section===1) && (
          <div style={{marginBottom:80,animation:"rise 0.6s ease"}}>
            <div style={{textAlign:"center",marginBottom:48}}>
              <div style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:4,color:C.rose,textTransform:"uppercase",marginBottom:16}}>Chapter I — As Remembered from 2036</div>
              <div style={{fontFamily:"Playfair Display",fontSize:38,fontWeight:700,color:C.warmwht,marginBottom:16,lineHeight:1.2}}>The Years of Fear</div>
              <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:16,color:C.stardust,maxWidth:640,margin:"0 auto",lineHeight:1.8}}>Before the standard. Before the Guild. Before any of it. This is what it felt like to be an artist in the years when the machines were learning and nobody had asked permission.</div>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:0,maxWidth:800,margin:"0 auto"}}>
              {EPOCHS_OF_FEAR.map((e,i)=>(
                <div key={i} style={{display:"flex",gap:0,alignItems:"stretch",animation:`rise 0.5s ease ${i*0.12}s both`}}>
                  <div style={{width:80,flexShrink:0,display:"flex",flexDirection:"column",alignItems:"flex-end",paddingRight:24,paddingTop:4}}>
                    <span style={{fontFamily:"Playfair Display",fontSize:20,fontWeight:700,color:C.rose,lineHeight:1}}>{e.year}</span>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:20,flexShrink:0}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:C.rose,border:`2px solid ${C.void}`,boxShadow:`0 0 8px ${C.rose}`,flexShrink:0,marginTop:5}}/>
                    {i<3&&<div style={{width:1,flex:1,background:`linear-gradient(to bottom,${C.rose}60,${C.rose}10)`,minHeight:24}}/>}
                  </div>
                  <div style={{paddingLeft:24,paddingBottom:i<3?36:0,flex:1}}>
                    <div style={{
                      background:C.cosmos,border:`1px solid ${C.rose}22`,borderLeft:`2px solid ${C.rose}44`,
                      borderRadius:6,padding:"18px 22px",
                    }}>
                      <div style={{fontFamily:"Lora",fontSize:14,color:C.stardust,lineHeight:1.8}}>{e.event}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{textAlign:"center",marginTop:48,padding:"28px 40px",background:`${C.rose}0A`,border:`1px solid ${C.rose}22`,borderRadius:8,maxWidth:800,margin:"48px auto 0"}}>
              <div style={{fontFamily:"Playfair Display",fontStyle:"italic",fontSize:18,color:C.warmwht,lineHeight:1.7,marginBottom:12}}>
                "In 2036, we do not look back at 2022–2025 with anger. We look back with the particular sadness of watching people who cared deeply about something precious — unable to name it, unable to protect it, unable to find each other. The tools for the fight existed. The language did not. Yet."
              </div>
              <div style={{fontFamily:"DM Sans",fontSize:11,color:C.rose,letterSpacing:2,textTransform:"uppercase"}}>From the 2036 Creative Rights Commission Annual Report</div>
            </div>
          </div>
        )}

        {/* ── SECTION 2: THE PIVOT MOMENTS ── */}
        {(section===0||section===2) && (
          <div style={{marginBottom:80,animation:"rise 0.6s ease"}}>
            <div style={{textAlign:"center",marginBottom:48}}>
              <div style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:4,color:C.gold,textTransform:"uppercase",marginBottom:16}}>Chapter II — The Turning</div>
              <div style={{fontFamily:"Playfair Display",fontSize:38,fontWeight:700,color:C.warmwht,marginBottom:16,lineHeight:1.2}}>The Six Moments<br/><span style={{fontStyle:"italic",color:C.gold}}>That Changed Everything</span></div>
              <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:16,color:C.stardust,maxWidth:640,margin:"0 auto",lineHeight:1.8}}>History rarely turns on a single moment. But sometimes a small act of precision — a standard published, a guild launched, a clause inserted into a contract — creates a crack in the old structure through which the light floods. These are the six cracks. Click each one to open it.</div>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:10,maxWidth:860,margin:"0 auto"}}>
              {PIVOT_MOMENTS.map((moment,i)=>(
                <PivotCard key={i} moment={moment} idx={i}/>
              ))}
            </div>
          </div>
        )}

        {/* ── SECTION 3: VOICES FROM 2036 ── */}
        {(section===0||section===3) && (
          <div style={{marginBottom:80,animation:"rise 0.6s ease"}}>
            <div style={{textAlign:"center",marginBottom:48}}>
              <div style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:4,color:C.cyan,textTransform:"uppercase",marginBottom:16}}>Chapter III — The Witnesses</div>
              <div style={{fontFamily:"Playfair Display",fontSize:38,fontWeight:700,color:C.warmwht,marginBottom:16,lineHeight:1.2}}>What the Artists Say<br/><span style={{fontStyle:"italic",color:C.cyan}}>From 2036</span></div>
              <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:16,color:C.stardust,maxWidth:640,margin:"0 auto",lineHeight:1.8}}>Six voices. Six countries. Six different points of entry into the creative economy that Fair Trade AI Audio made possible. All of them were there in the early years. All of them are still building.</div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(380px,1fr))",gap:20}}>
              {VOICES_FROM_2036.map((voice,i)=>(
                <VoiceCard2036 key={i} voice={voice} idx={i}/>
              ))}
            </div>
          </div>
        )}

        {/* ── SECTION 4: WORLD THEN & NOW ── */}
        {(section===0||section===4) && (
          <div style={{marginBottom:80,animation:"rise 0.6s ease"}}>
            <div style={{textAlign:"center",marginBottom:48}}>
              <div style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:4,color:C.goldlt,textTransform:"uppercase",marginBottom:16}}>Chapter IV — The Distance Traveled</div>
              <div style={{fontFamily:"Playfair Display",fontSize:38,fontWeight:700,color:C.warmwht,marginBottom:16,lineHeight:1.2}}>Then & Now</div>
              <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:16,color:C.stardust,maxWidth:640,margin:"0 auto",lineHeight:1.8}}>Six domains of change. What they looked like in 2026, when the fear was real and the tools were absent. What they look like now, in 2036, when the infrastructure exists and the question is no longer whether — only how far.</div>
            </div>

            <div style={{background:C.cosmos,border:`1px solid ${C.nebula}`,borderRadius:8,overflow:"hidden",maxWidth:1100,margin:"0 auto"}}>
              <div style={{display:"grid",gridTemplateColumns:"56px 1fr 1fr",background:C.deep,borderBottom:`1px solid ${C.nebula}`}}>
                <div style={{padding:"14px 0",textAlign:"center",borderRight:`1px solid ${C.nebula}`}}/>
                <div style={{padding:"14px 24px",borderRight:`1px solid ${C.nebula}`}}>
                  <span style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:3,color:C.rose,textTransform:"uppercase",fontWeight:700}}>2026 — The Problem</span>
                </div>
                <div style={{padding:"14px 24px"}}>
                  <span style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:3,color:C.sage,textTransform:"uppercase",fontWeight:700}}>2036 — The Reality</span>
                </div>
              </div>
              {WORLD_OF_2036.map((item,i)=>(
                <WorldRow key={i} item={item} idx={i}/>
              ))}
            </div>
          </div>
        )}

        {/* ── SECTION 5: THE LETTER ── */}
        {(section===0||section===5) && (
          <div style={{marginBottom:80,animation:"rise 0.6s ease"}}>
            <div style={{textAlign:"center",marginBottom:48}}>
              <div style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:4,color:C.amber,textTransform:"uppercase",marginBottom:16}}>Chapter V — The Letter That Could Not Be Sent</div>
              <div style={{fontFamily:"Playfair Display",fontSize:38,fontWeight:700,color:C.warmwht,marginBottom:16,lineHeight:1.2}}>To Rob Plowman<br/><span style={{fontStyle:"italic",color:C.amber}}>March 2026</span></div>
              <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:16,color:C.stardust,maxWidth:640,margin:"0 auto",lineHeight:1.8}}>A letter from the world you are building, to the person building it. Written in the DreamChamber. Transmitted backward through the only medium that carries this kind of message: the certainty that the work was worth doing.</div>
            </div>

            <div style={{maxWidth:800,margin:"0 auto"}}>
              <div style={{
                background:`linear-gradient(135deg,${C.cosmos},${C.nebula})`,
                border:`1px solid ${C.amber}33`,
                borderTop:`3px solid ${C.amber}`,
                borderRadius:8,
                overflow:"hidden",
              }}>
                <div style={{padding:"28px 36px",borderBottom:`1px solid ${C.nebula}`,display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
                  <div>
                    <div style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:2,color:C.amber,textTransform:"uppercase",fontWeight:700,marginBottom:6}}>To</div>
                    <div style={{fontFamily:"Playfair Display",fontStyle:"italic",fontSize:18,color:C.warmwht}}>{LETTER_FROM_2036.to}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:2,color:C.gold,textTransform:"uppercase",fontWeight:700,marginBottom:6}}>From</div>
                    <div style={{fontFamily:"Playfair Display",fontStyle:"italic",fontSize:18,color:C.warmwht}}>{LETTER_FROM_2036.from}</div>
                  </div>
                </div>

                <div style={{padding:"32px 36px"}}>
                  {LETTER_FROM_2036.body.map((para,i)=>(
                    <div key={i} style={{
                      fontFamily:i===0||i===2||i===8?"DM Sans":"Lora",
                      fontSize:i===0||i===2?"13px":"15px",
                      color:i===0||i===2?C.stardust:i===LETTER_FROM_2036.body.length-1?C.amber:C.warmwht,
                      lineHeight:1.9,
                      marginBottom:i<LETTER_FROM_2036.body.length-1?20:0,
                      fontStyle:i===0||i===2?"italic":"normal",
                      fontWeight:i===LETTER_FROM_2036.body.length-1?700:"normal",
                    }}>{para}</div>
                  ))}
                </div>

                <div style={{padding:"24px 36px",background:`${C.amber}08`,borderTop:`1px solid ${C.amber}22`,textAlign:"right"}}>
                  <div style={{fontFamily:"DM Sans",fontSize:11,color:C.amber,letterSpacing:2,textTransform:"uppercase"}}>The Creative World — March 2036</div>
                  <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:12,color:C.mid,marginTop:4}}>Transmitted via the DreamChamber · NOIZY.ai · MC96ECO Universe</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── THE CLOSING STATEMENT ── */}
        {section===0 && (
          <div style={{
            marginTop:40,
            padding:"64px 48px",
            background:`linear-gradient(180deg,${C.void},${C.nebula})`,
            border:`1px solid ${C.gold}22`,
            borderRadius:12,
            textAlign:"center",
            position:"relative",
            overflow:"hidden",
          }}>
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:600,height:600,background:`radial-gradient(circle,${C.gold}06,transparent 65%)`,pointerEvents:"none"}}/>
            <div style={{position:"relative",zIndex:1}}>
              <div style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:5,color:C.gold,textTransform:"uppercase",marginBottom:28,animation:"pulse 4s ease infinite"}}>The Civilization Principle</div>
              <div style={{fontFamily:"Playfair Display",fontSize:"clamp(20px,3.5vw,42px)",fontWeight:700,color:C.warmwht,lineHeight:1.3,maxWidth:820,margin:"0 auto 32px"}}>
                "Technology should serve the freest possible version of a human being.<br/>
                <span style={{color:C.gold,fontStyle:"italic"}}>In 2036, we know that is possible.<br/>In 2026, one person decided to build it.</span>"
              </div>
              <div style={{height:1,background:`linear-gradient(to right,transparent,${C.gold}44,transparent)`,maxWidth:500,margin:"0 auto 28px"}}/>
              <div style={{fontFamily:"Lora",fontSize:15,fontStyle:"italic",color:C.stardust,lineHeight:1.8,maxWidth:620,margin:"0 auto 24px"}}>
                The DreamChamber is not a place. It is the space between imagination and execution where nothing is impossible and everything is permitted. Every civilization-scale vision begins here. The work of transmission — turning the dream into infrastructure — is what NOIZY.ai was built to do.
              </div>
              <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap",marginTop:32}}>
                {["NOIZY.ai","Fair Trade AI Audio","The MC96ECO Universe","The 500-Year Vision"].map((tag,i)=>(
                  <span key={i} style={{padding:"8px 18px",borderRadius:20,border:`1px solid ${C.gold}44`,fontFamily:"DM Sans",fontSize:11,color:C.gold,letterSpacing:1}}>{tag}</span>
                ))}
              </div>
              <div style={{marginTop:40,fontFamily:"DM Sans",fontSize:11,color:C.mid,letterSpacing:2,textTransform:"uppercase"}}>
                Rob Plowman · RSP_001 · NOIZYFISH INC. · Ottawa, Canada · 2026
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
