import { useState, useEffect, useRef } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300;1,9..40,400&family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&display=swap');`;

const C = {
  void:     "#07050E",
  deep:     "#0C0A18",
  cosmos:   "#100E1E",
  blood:    "#1A0808",
  scar:     "#2A0E0E",
  warmwht:  "#FAF8F4",
  cream:    "#F5F0E8",
  stardust: "#B5A898",
  mid:      "#8A7B6A",
  soft:     "#6B5B3E",
  // extraction colors — red, angry, honest
  raw:      "#C43A3A",
  rawlt:    "#E05050",
  rawdim:   "#7A2020",
  ember:    "#E8680A",
  // NOIZY colors — warmth, life, return
  gold:     "#C9A84C",
  goldlt:   "#E8C97A",
  cyan:     "#3DC9C0",
  sage:     "#6BAF7A",
  rose:     "#C46A8A",
  ink:      "#1E1A14",
};

// ─── THE WHAT-ACTUALLY-HAPPENS DATA ──────────────────────────────────────────

const EXTRACTION_CHAIN = [
  {
    step:"01",
    title:"The Harvest",
    what_they_say:"We train on publicly available data.",
    what_it_means:"They scrape every recording they can reach. Every podcast, every audiobook, every sample pack, every session recording uploaded anywhere. 'Publicly available' means 'we could reach it.' It does not mean 'permission was given.'",
    who_is_affected:"Every voice actor who ever uploaded a demo. Every composer who released music. Every sound designer who sold a sample pack. Every musician who posted anything, anywhere, ever.",
    color: C.raw,
  },
  {
    step:"02",
    title:"The Stripping",
    what_they_say:"Our model learns from diverse creative sources.",
    what_it_means:"The model extracts the pattern from the human. The emotional intelligence, the stylistic fingerprint, the years of craft — all of it is encoded into weights. The human who produced it is not encoded. They are discarded. The soul is taken. The person is not.",
    who_is_affected:"The voice actor whose 20 years of character work trained a synthesis model. They are now inside that model, powering it, unnamed, uncompensated, unacknowledged. Permanently.",
    color: C.rawlt,
  },
  {
    step:"03",
    title:"The Product",
    what_they_say:"Generate any voice, any emotion, any character — instantly.",
    what_it_means:"The extracted humanity is repackaged and sold. The same emotional registers that took a voice actor a career to develop are now available for $0.008 per generation. The artist's craft — the thing they built their life around — is now a commodity priced below a cent.",
    who_is_affected:"The composer who spent 15 years developing a signature sound. It now ships as a 'style preset.' The sound designer who built a library over a decade. It now ships as a 'pack.' The voice actor. The session musician. Everyone.",
    color: C.ember,
  },
  {
    step:"04",
    title:"The Competition",
    what_they_say:"AI tools help creators do more.",
    what_it_means:"The platform uses the artist's own work to train a model that then competes with the artist for the work the artist used to do. The audition the voice actor would have won goes to the $0.008 synthesis. The sync placement the composer would have received goes to the style-preset. The artist trained their own replacement — without knowing, without consenting, without compensation.",
    who_is_affected:"Everyone in the creative audio supply chain who is now competing against a distillation of their own craft.",
    color: C.raw,
  },
  {
    step:"05",
    title:"The Erasure",
    what_they_say:"Nothing. They say nothing about this. That is the point.",
    what_it_means:"The model carries no memory of where it came from. No attribution. No provenance. No record that a human being — with a name, a career, a family, a body of work — made the thing that trained the intelligence. The human disappears. The pattern survives. This is not an accident. Provenance creates liability. Erasure removes it.",
    who_is_affected:"Every artist whose work is now inside a model that will never say their name. Their contribution to human creative culture — permanent, unretrievable, invisible.",
    color: C.rawdim,
  },
];

const HUMAN_COST = [
  {
    name:"A voice actor",
    years:"22 years",
    what_built:"Characters. Hundreds of them. Each one a specific human being — their fear, their hope, their particular way of being in the world. 22 years of listening to real people and learning to transmit their humanity through a microphone.",
    what_happened:"Her voice was scraped from three audiobook platforms, two podcast networks, and a commercial reel she posted in 2018. She has no record of which model contains her. There is no mechanism to find out. There is no mechanism to be removed. There is no compensation. She discovered it when a casting director told her they were 'going a different direction' — and she heard her own voice in the product that replaced her.",
    color: C.rose,
  },
  {
    name:"A film composer",
    years:"18 years",
    what_built:"A signature. The specific way tension resolves in his scores — a harmonic fingerprint developed across 200 projects, refined through failure and discovery and the particular education of watching an audience react to music in real time for nearly two decades.",
    what_happened:"A music supervisor he had worked with for years told him a new brief had been filled by an AI-generated score. The brief had asked for 'something in the style of' his work. He asked to hear it. He recognized the harmonic language immediately. He asked the platform where the training data came from. They did not respond.",
    color: C.gold,
  },
  {
    name:"A sound designer",
    years:"15 years",
    what_built:"A catalog. 4,200 original recordings — field recordings, studio fabrications, acoustic experiments. The sound of specific spaces, specific objects, specific moments in the physical world that no one had recorded before. A life of paying attention.",
    what_happened:"He found several of his recordings inside a competitor's 'AI-generated SFX library' — recognizable by their acoustic signature. When he contacted the platform, they said the training data was 'legally sourced from licensed packs.' He had sold those packs for flat buyout fees in 2017. The license said 'royalty-free.' He did not know that meant 'AI training permitted.' He did not know that was something that needed to be in the license. Nobody told him.",
    color: C.cyan,
  },
  {
    name:"An emerging artist",
    years:"3 years",
    what_built:"A beginning. Three years of recordings. A developing voice. The specific uncertainty and searching quality of someone who is still finding out who they are as a creator — which is itself a form of creative signal that no experienced voice can replicate.",
    what_happened:"She uploaded her first serious recordings to a platform because she wanted feedback. The terms of service, in paragraph 14, clause 7, sub-clause b, stated that uploaded content could be used to improve the platform's AI systems. She did not read paragraph 14. Nobody does. The beginning of her creative voice is now inside a model. She did not consent. She was not paid. She was not told.",
    color: C.sage,
  },
];

const WHAT_MEMORY_MEANS = [
  {
    title:"Memory is attribution",
    body:"To remember where a creative work came from is to acknowledge that a human being made it. Erasure of provenance is erasure of personhood. When the model cannot say whose voice trained it, that voice has been used and discarded — not as a tool, but as a person treated like a tool.",
    icon:"◯",
  },
  {
    title:"Memory is continuity",
    body:"Creative work is not a transaction. It is a thread. A sound designer's 2009 recording connects to their 2024 catalog connects to the reputation that sustains their career. When a platform takes the 2009 recording and strips it of context, they sever the thread. The work exists. The life it was part of is made invisible.",
    icon:"◈",
  },
  {
    title:"Memory is compensation",
    body:"Royalties exist because someone remembered where the value came from. The mechanical royalty was created because someone asked: 'who made this, and what do we owe them?' AI platforms have built a system that makes that question structurally unanswerable. No memory, no royalty. That is not an accident. It is a design decision.",
    icon:"◆",
  },
  {
    title:"Memory is the creative process itself",
    body:"The creative process is the accumulation of memory — of influence, technique, failure, discovery, evolution. A voice actor's instrument is their memory of every character they've inhabited. A composer's signature is their memory of every score that moved them and every score they wrote that didn't. To strip that memory from the work is to strip the work of the human process that made it worth taking in the first place.",
    icon:"◉",
  },
];

// ─── THE ANSWER ───────────────────────────────────────────────────────────────
const THE_ANSWER = [
  { label:"Against Erasure", against:"Models that cannot account for their training data", with:"NOIZY PROOF — cryptographic provenance on every output. The question 'what was this trained on' has a permanent, verifiable, public answer.", color:C.gold },
  { label:"Against Stripping", against:"Platforms that extract creative pattern and discard the human", with:"Voice Estate Framework — every creator's contribution encoded in the model's lineage, attributed, compensated, permanent.", color:C.cyan },
  { label:"Against Harvesting", against:"Scraping without consent, 'publicly available' as cover", with:"Consent-as-Code — rights enforced at infrastructure level. If the consent isn't in the code, it isn't consent.", color:C.sage },
  { label:"Against Competition", against:"Platforms that train on your work then undercut your career", with:"75/25 Perpetual Royalty — the model's commercial success flows back to the creators who made it possible. Always.", color:C.rose },
  { label:"Against Amnesia", against:"A creative economy with no memory of where value came from", with:"The 500-Year Codex — every creative act documented, attributed, preserved. The civilization has memory. The humans do not disappear.", color:C.goldlt },
];

// ─── PULSE LINE ANIMATION ─────────────────────────────────────────────────────
const PulseLine = ({ color }) => {
  const ref = useRef(null);
  useEffect(()=>{
    const el = ref.current; if(!el) return;
    let frame, t=0;
    const animate = () => {
      t += 0.02;
      const points = Array.from({length:60},(_,i)=>{
        const x = (i/59)*100;
        const y = 50 + Math.sin(i*0.4+t)*12 + Math.sin(i*0.8-t*1.3)*5;
        return `${x},${y}`;
      }).join(" ");
      el.setAttribute("points",points);
      frame = requestAnimationFrame(animate);
    };
    animate();
    return ()=>cancelAnimationFrame(frame);
  },[]);
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{width:"100%",height:"100%",position:"absolute",inset:0}}>
      <polyline ref={ref} points="0,50 100,50" fill="none" stroke={color} strokeWidth="0.8" strokeOpacity="0.6"/>
    </svg>
  );
};

// ─── FLATLINE ANIMATION ───────────────────────────────────────────────────────
const Flatline = () => (
  <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{width:"100%",height:"100%",position:"absolute",inset:0}}>
    <line x1="0" y1="50" x2="100" y2="50" stroke={C.rawdim} strokeWidth="0.5" strokeOpacity="0.5"/>
  </svg>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function TheExtraction() {
  const [view, setView] = useState("chain");

  return (
    <div style={{background:C.void,color:C.warmwht,minHeight:"100vh",fontFamily:"DM Sans,sans-serif"}}>
      <style>{FONTS}{`
        @keyframes rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}
        @keyframes flicker{0%,100%{opacity:1}92%{opacity:1}93%{opacity:0.3}94%{opacity:1}97%{opacity:0.6}98%{opacity:1}}
        @keyframes scanline{from{transform:translateY(-100%)}to{transform:translateY(100vh)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#2a0a0a}
        button{cursor:pointer}
      `}</style>

      {/* ── HERO — the wound ── */}
      <div style={{
        minHeight:"100vh",
        background:`radial-gradient(ellipse at 50% 40%, ${C.blood} 0%, ${C.void} 65%)`,
        display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",
        padding:"80px 40px",textAlign:"center",
        position:"relative",overflow:"hidden",
      }}>
        {/* Scan line */}
        <div style={{
          position:"absolute",top:0,left:0,right:0,
          height:2,background:`linear-gradient(to right,transparent,${C.raw}44,transparent)`,
          animation:"scanline 8s linear infinite",
          pointerEvents:"none",
        }}/>

        {/* ECG lines — alive on left, dead on right */}
        <div style={{position:"absolute",top:"30%",left:0,right:0,height:80,opacity:0.15,pointerEvents:"none"}}>
          <PulseLine color={C.raw}/>
        </div>

        <div style={{position:"relative",zIndex:2,maxWidth:900}}>
          <div style={{
            fontFamily:"DM Sans",fontSize:10,letterSpacing:6,
            color:C.rawlt,textTransform:"uppercase",marginBottom:24,
            animation:"pulse 2s ease infinite",
          }}>
            A Precise Description of What Is Actually Happening
          </div>

          <div style={{
            fontFamily:"Playfair Display",
            fontSize:"clamp(40px,7vw,96px)",
            fontWeight:900,
            lineHeight:1.0,
            color:C.warmwht,
            marginBottom:16,
            animation:"flicker 8s ease infinite",
          }}>
            The
          </div>
          <div style={{
            fontFamily:"Playfair Display",
            fontSize:"clamp(40px,7vw,96px)",
            fontWeight:900,
            fontStyle:"italic",
            lineHeight:1.0,
            color:C.raw,
            marginBottom:40,
          }}>
            Extraction
          </div>

          <div style={{
            fontFamily:"Lora",fontSize:20,fontStyle:"italic",
            color:C.stardust,lineHeight:1.8,maxWidth:680,margin:"0 auto 20px",
          }}>
            "It is not disruption. It is not innovation. It is not the inevitable march of progress."
          </div>
          <div style={{
            fontFamily:"Lora",fontSize:20,fontStyle:"italic",
            color:C.rawlt,lineHeight:1.8,maxWidth:680,margin:"0 auto 48px",
          }}>
            "It is eating someone and then wearing their skin to their job interview."
          </div>

          <div style={{
            fontFamily:"DM Sans",fontSize:13,color:C.mid,
            lineHeight:1.8,maxWidth:600,margin:"0 auto 48px",
          }}>
            This page does not argue for stopping AI.<br/>
            It argues for remembering that the humans who made AI possible<br/>
            are still here, still working, still watching their careers<br/>
            be dismantled by a process that never asked their permission.
          </div>

          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            {[
              {id:"chain",label:"The Five Steps"},
              {id:"cost",label:"The Human Cost"},
              {id:"memory",label:"Why Memory Matters"},
              {id:"answer",label:"The Answer"},
            ].map(v=>(
              <button key={v.id} onClick={()=>setView(v.id)} style={{
                padding:"11px 22px",borderRadius:4,
                background:view===v.id?C.raw:"transparent",
                border:`1px solid ${view===v.id?C.raw:C.raw+"44"}`,
                color:view===v.id?C.warmwht:C.rawlt,
                fontFamily:"DM Sans",fontSize:11,fontWeight:700,letterSpacing:1,
                transition:"all 0.2s",
              }}>{v.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{maxWidth:1100,margin:"0 auto",padding:"60px 40px 120px"}}>

        {/* THE FIVE STEPS */}
        {view==="chain" && (
          <div style={{animation:"rise 0.5s ease"}}>
            <div style={{textAlign:"center",marginBottom:56}}>
              <div style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:4,color:C.raw,textTransform:"uppercase",marginBottom:12}}>How It Actually Works</div>
              <div style={{fontFamily:"Playfair Display",fontSize:34,color:C.warmwht,marginBottom:16,lineHeight:1.2}}>The Extraction Chain</div>
              <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:15,color:C.stardust,maxWidth:640,margin:"0 auto",lineHeight:1.8}}>Five steps. Each one presented as neutral, technical, inevitable. Each one, looked at directly, a decision to treat human creative work as raw material with no memory of where it came from.</div>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:0}}>
              {EXTRACTION_CHAIN.map((step,i)=>(
                <div key={i} style={{
                  display:"grid",gridTemplateColumns:"72px 1fr",
                  borderBottom:i<4?`1px solid ${C.scar}`:"none",
                  animation:`rise 0.5s ease ${i*0.1}s both`,
                }}>
                  {/* Step number */}
                  <div style={{
                    display:"flex",flexDirection:"column",alignItems:"center",
                    justifyContent:"flex-start",paddingTop:32,paddingBottom:32,
                    background:`${step.color}08`,
                    borderRight:`2px solid ${step.color}`,
                  }}>
                    <div style={{fontFamily:"Playfair Display",fontSize:28,fontWeight:900,color:step.color,opacity:0.6,lineHeight:1}}>{step.step}</div>
                    <div style={{position:"relative",width:40,height:40,marginTop:16,flexShrink:0}}>
                      <PulseLine color={step.color}/>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{padding:"32px 36px"}}>
                    <div style={{fontFamily:"Playfair Display",fontSize:24,fontWeight:700,color:C.warmwht,marginBottom:20}}>{step.title}</div>

                    <div style={{marginBottom:16}}>
                      <div style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:2,color:C.mid,textTransform:"uppercase",fontWeight:700,marginBottom:8}}>What They Say</div>
                      <div style={{
                        fontFamily:"Lora",fontStyle:"italic",fontSize:14,
                        color:C.mid,lineHeight:1.7,
                        padding:"12px 16px",
                        background:`${C.cosmos}`,
                        border:`1px solid ${C.nebula}`,
                        borderLeft:`2px solid ${C.mid}`,
                        borderRadius:"0 4px 4px 0",
                      }}>"{step.what_they_say}"</div>
                    </div>

                    <div style={{marginBottom:16}}>
                      <div style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:2,color:step.color,textTransform:"uppercase",fontWeight:700,marginBottom:8}}>What It Means</div>
                      <div style={{fontFamily:"Lora",fontSize:14,color:C.stardust,lineHeight:1.85}}>{step.what_it_means}</div>
                    </div>

                    <div style={{padding:"14px 18px",background:`${step.color}0C`,border:`1px solid ${step.color}22`,borderRadius:4}}>
                      <div style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:2,color:step.color,textTransform:"uppercase",fontWeight:700,marginBottom:6}}>Who Is Affected</div>
                      <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:13,color:C.stardust,lineHeight:1.7}}>{step.who_is_affected}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* The flatline */}
            <div style={{
              marginTop:8,padding:"40px 48px",
              background:C.blood,border:`1px solid ${C.rawdim}`,
              borderRadius:6,textAlign:"center",position:"relative",overflow:"hidden",
            }}>
              <div style={{position:"absolute",inset:0,opacity:0.2,pointerEvents:"none"}}>
                <Flatline/>
              </div>
              <div style={{position:"relative"}}>
                <div style={{fontFamily:"Playfair Display",fontSize:22,fontWeight:700,fontStyle:"italic",color:C.warmwht,lineHeight:1.5,maxWidth:700,margin:"0 auto 16px"}}>
                  "The model learns. The human disappears.<br/>
                  That is not a side effect. That is the architecture."
                </div>
                <div style={{fontFamily:"DM Sans",fontSize:11,color:C.rawlt,letterSpacing:2,textTransform:"uppercase"}}>The Extraction Chain — End State</div>
              </div>
            </div>
          </div>
        )}

        {/* THE HUMAN COST */}
        {view==="cost" && (
          <div style={{animation:"rise 0.5s ease"}}>
            <div style={{textAlign:"center",marginBottom:56}}>
              <div style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:4,color:C.raw,textTransform:"uppercase",marginBottom:12}}>Not Hypothetical</div>
              <div style={{fontFamily:"Playfair Display",fontSize:34,color:C.warmwht,marginBottom:16,lineHeight:1.2}}>The Human Cost</div>
              <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:15,color:C.stardust,maxWidth:640,margin:"0 auto",lineHeight:1.8}}>These are not statistics. They are people. Each one represents thousands of people in the same position. The names are changed. The careers are real. The damage is ongoing.</div>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:24}}>
              {HUMAN_COST.map((person,i)=>(
                <div key={i} style={{
                  background:C.cosmos,border:`1px solid ${C.scar}`,
                  borderRadius:8,overflow:"hidden",
                  animation:`rise 0.5s ease ${i*0.1}s both`,
                }}>
                  <div style={{
                    padding:"24px 32px",
                    background:`linear-gradient(135deg,${C.blood},${C.cosmos})`,
                    borderBottom:`1px solid ${C.scar}`,
                    display:"grid",gridTemplateColumns:"1fr auto",gap:16,alignItems:"center",
                  }}>
                    <div>
                      <div style={{fontFamily:"Playfair Display",fontSize:20,fontWeight:700,color:C.warmwht,marginBottom:4}}>{person.name}</div>
                      <div style={{fontFamily:"DM Sans",fontSize:12,color:person.color}}>{person.years} of professional work</div>
                    </div>
                    <div style={{position:"relative",width:80,height:40}}>
                      <PulseLine color={person.color}/>
                    </div>
                  </div>

                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
                    <div style={{padding:"24px 28px",borderRight:`1px solid ${C.scar}`}}>
                      <div style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:2,color:person.color,textTransform:"uppercase",fontWeight:700,marginBottom:10}}>What They Built</div>
                      <div style={{fontFamily:"Lora",fontSize:13,color:C.stardust,lineHeight:1.85}}>{person.what_built}</div>
                    </div>
                    <div style={{padding:"24px 28px",background:`${C.blood}88`}}>
                      <div style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:2,color:C.raw,textTransform:"uppercase",fontWeight:700,marginBottom:10}}>What Happened</div>
                      <div style={{fontFamily:"Lora",fontSize:13,color:C.stardust,lineHeight:1.85}}>{person.what_happened}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop:32,padding:"36px 40px",
              border:`1px solid ${C.raw}33`,borderRadius:6,
              textAlign:"center",
            }}>
              <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:18,color:C.warmwht,lineHeight:1.7,maxWidth:680,margin:"0 auto 16px"}}>
                "These people did not choose to be part of the AI story. They were conscripted into it without being asked. That is not progress. That is not inevitable. It is a choice — made by platforms that decided their growth mattered more than the humans whose creativity made their growth possible."
              </div>
              <div style={{fontFamily:"DM Sans",fontSize:11,color:C.raw,letterSpacing:2,textTransform:"uppercase"}}>Rob Plowman — NOIZY.ai — Ottawa, 2026</div>
            </div>
          </div>
        )}

        {/* WHY MEMORY MATTERS */}
        {view==="memory" && (
          <div style={{animation:"rise 0.5s ease"}}>
            <div style={{textAlign:"center",marginBottom:56}}>
              <div style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:4,color:C.raw,textTransform:"uppercase",marginBottom:12}}>The Thing That Was Taken</div>
              <div style={{fontFamily:"Playfair Display",fontSize:34,color:C.warmwht,marginBottom:16,lineHeight:1.2}}>Why Memory<br/><span style={{fontStyle:"italic",color:C.rawlt}}>Is Everything</span></div>
              <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:15,color:C.stardust,maxWidth:640,margin:"0 auto",lineHeight:1.8}}>The most damaging thing the extraction economy did was not the taking. It was the forgetting. Provenance erasure is not a technical detail. It is the destruction of the relationship between human beings and the things they create.</div>
            </div>

            {/* The creative process visualization */}
            <div style={{
              marginBottom:48,padding:"40px 48px",
              background:C.cosmos,border:`1px solid ${C.nebula}`,
              borderRadius:8,
            }}>
              <div style={{fontFamily:"Playfair Display",fontSize:22,color:C.warmwht,marginBottom:32,textAlign:"center"}}>The Creative Process Is Made of Memory</div>
              <div style={{display:"flex",gap:0,alignItems:"center",flexWrap:"wrap",justifyContent:"center"}}>
                {[
                  {label:"First attempt",sub:"uncertain, searching",color:C.mid},
                  {label:"→",sub:"",color:C.mid},
                  {label:"Failure",sub:"the education",color:C.raw},
                  {label:"→",sub:"",color:C.mid},
                  {label:"Discovery",sub:"something new",color:C.gold},
                  {label:"→",sub:"",color:C.mid},
                  {label:"Mastery",sub:"the signature",color:C.cyan},
                  {label:"→",sub:"",color:C.mid},
                  {label:"Evolution",sub:"never finished",color:C.sage},
                ].map((node,i)=>(
                  <div key={i} style={{textAlign:"center",padding:"8px 12px"}}>
                    {node.sub?(
                      <>
                        <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:12,color:node.color}}>{node.label}</div>
                        <div style={{fontFamily:"DM Sans",fontSize:10,color:C.mid,marginTop:2}}>{node.sub}</div>
                      </>
                    ):(
                      <div style={{fontFamily:"DM Sans",fontSize:18,color:node.color}}>{node.label}</div>
                    )}
                  </div>
                ))}
              </div>
              <div style={{height:1,background:`linear-gradient(to right,transparent,${C.nebula},transparent)`,margin:"28px 0"}}/>
              <div style={{display:"flex",gap:0,alignItems:"center",justifyContent:"center",flexWrap:"wrap"}}>
                {[
                  {label:"Model ingests",sub:"no context",color:C.rawdim},
                  {label:"→",sub:"",color:C.rawdim},
                  {label:"Pattern extracted",sub:"human removed",color:C.raw},
                  {label:"→",sub:"",color:C.rawdim},
                  {label:"Weights updated",sub:"no attribution",color:C.rawlt},
                  {label:"→",sub:"",color:C.rawdim},
                  {label:"Output generated",sub:"no memory",color:C.ember},
                  {label:"→",sub:"",color:C.rawdim},
                  {label:"Artist erased",sub:"permanently",color:C.rawdim},
                ].map((node,i)=>(
                  <div key={i} style={{textAlign:"center",padding:"8px 12px"}}>
                    {node.sub?(
                      <>
                        <div style={{fontFamily:"DM Sans",fontWeight:700,fontSize:12,color:node.color}}>{node.label}</div>
                        <div style={{fontFamily:"DM Sans",fontSize:10,color:C.mid,marginTop:2}}>{node.sub}</div>
                      </>
                    ):(
                      <div style={{fontFamily:"DM Sans",fontSize:18,color:node.color}}>{node.label}</div>
                    )}
                  </div>
                ))}
              </div>
              <div style={{marginTop:24,textAlign:"center"}}>
                <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:14,color:C.rawlt}}>The top row is a career. The bottom row is what the extraction economy does with it.</div>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:40}}>
              {WHAT_MEMORY_MEANS.map((item,i)=>(
                <div key={i} style={{
                  background:C.cosmos,border:`1px solid ${C.scar}`,
                  borderRadius:6,padding:"28px 24px",
                  animation:`rise 0.5s ease ${i*0.08}s both`,
                }}>
                  <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:12}}>
                    <span style={{color:C.gold,fontSize:18}}>{item.icon}</span>
                    <span style={{fontFamily:"Playfair Display",fontSize:18,fontWeight:700,color:C.warmwht}}>{item.title}</span>
                  </div>
                  <div style={{fontFamily:"Lora",fontSize:13,color:C.stardust,lineHeight:1.85}}>{item.body}</div>
                </div>
              ))}
            </div>

            <div style={{
              padding:"44px 48px",
              background:`radial-gradient(ellipse at 50% 0%, ${C.blood} 0%, ${C.cosmos} 70%)`,
              border:`1px solid ${C.raw}22`,borderRadius:8,textAlign:"center",
            }}>
              <div style={{fontFamily:"Playfair Display",fontSize:"clamp(18px,3vw,32px)",fontWeight:700,fontStyle:"italic",color:C.warmwht,lineHeight:1.5,maxWidth:740,margin:"0 auto 20px"}}>
                "To strip memory from creative work is to strip the humanity from it.<br/>
                <span style={{color:C.rawlt}}>What remains is not art. It is the echo of art,<br/>
                produced by a system that ate the artist<br/>
                and forgot to feel anything about it."</span>
              </div>
              <div style={{fontFamily:"DM Sans",fontSize:11,color:C.raw,letterSpacing:2,textTransform:"uppercase"}}>Rob Plowman — NOIZY.ai — The Extraction · 2026</div>
            </div>
          </div>
        )}

        {/* THE ANSWER */}
        {view==="answer" && (
          <div style={{animation:"rise 0.5s ease"}}>
            <div style={{textAlign:"center",marginBottom:56}}>
              <div style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:4,color:C.gold,textTransform:"uppercase",marginBottom:12}}>Not a Fight. An Architecture.</div>
              <div style={{fontFamily:"Playfair Display",fontSize:34,color:C.warmwht,marginBottom:16,lineHeight:1.2}}>The Answer to<br/><span style={{fontStyle:"italic",color:C.gold}}>Every Step of the Extraction</span></div>
              <div style={{fontFamily:"Lora",fontStyle:"italic",fontSize:15,color:C.stardust,maxWidth:640,margin:"0 auto",lineHeight:1.8}}>NOIZY.ai was not built in anger at the extraction economy. It was built as the precise architectural opposite of it. Every component of the extraction chain has a direct, coded counterpart in the NOIZY infrastructure.</div>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:0,borderRadius:8,overflow:"hidden",border:`1px solid ${C.nebula}`,marginBottom:40}}>
              <div style={{display:"grid",gridTemplateColumns:"160px 1fr 1fr",background:C.deep,borderBottom:`1px solid ${C.nebula}`}}>
                <div style={{padding:"14px 16px",borderRight:`1px solid ${C.nebula}`}}/>
                <div style={{padding:"14px 20px",borderRight:`1px solid ${C.nebula}`}}>
                  <span style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:2,color:C.raw,textTransform:"uppercase",fontWeight:700}}>The Extraction (Without NOIZY)</span>
                </div>
                <div style={{padding:"14px 20px"}}>
                  <span style={{fontFamily:"DM Sans",fontSize:10,letterSpacing:2,color:C.gold,textTransform:"uppercase",fontWeight:700}}>The Answer (With NOIZY)</span>
                </div>
              </div>
              {THE_ANSWER.map((row,i)=>(
                <div key={i} style={{
                  display:"grid",gridTemplateColumns:"160px 1fr 1fr",
                  borderBottom:i<THE_ANSWER.length-1?`1px solid ${C.nebula}`:"none",
                  animation:`rise 0.4s ease ${i*0.08}s both`,
                }}>
                  <div style={{
                    padding:"20px 16px",
                    borderRight:`1px solid ${C.nebula}`,
                    display:"flex",alignItems:"center",
                    background:`${row.color}06`,
                  }}>
                    <span style={{fontFamily:"DM Sans",fontWeight:700,fontSize:11,color:row.color,letterSpacing:1,lineHeight:1.4}}>{row.label}</span>
                  </div>
                  <div style={{padding:"20px 20px",borderRight:`1px solid ${C.nebula}`,background:`${C.blood}44`}}>
                    <div style={{fontFamily:"Lora",fontSize:13,color:C.mid,lineHeight:1.7}}>{row.against}</div>
                  </div>
                  <div style={{padding:"20px 20px",background:`${row.color}05`}}>
                    <div style={{fontFamily:"Lora",fontSize:13,color:C.stardust,lineHeight:1.7}}>{row.with}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* The turn — from blood red to gold */}
            <div style={{
              padding:"64px 48px",
              background:`linear-gradient(135deg,${C.blood},${C.cosmos},${C.deep})`,
              borderRadius:8,
              border:`1px solid ${C.gold}22`,
              textAlign:"center",
              position:"relative",overflow:"hidden",
            }}>
              {/* Color transition overlay */}
              <div style={{
                position:"absolute",inset:0,
                background:`radial-gradient(ellipse at 50% 100%,${C.gold}0A,transparent 60%)`,
                pointerEvents:"none",
              }}/>
              <div style={{position:"relative"}}>
                <div style={{display:"flex",gap:0,justifyContent:"center",alignItems:"center",marginBottom:32,flexWrap:"wrap"}}>
                  <div style={{position:"relative",width:100,height:50}}>
                    <PulseLine color={C.raw}/>
                  </div>
                  <div style={{padding:"0 24px",fontFamily:"Playfair Display",fontSize:24,color:C.mid}}>→</div>
                  <div style={{position:"relative",width:100,height:50}}>
                    <PulseLine color={C.gold}/>
                  </div>
                </div>

                <div style={{fontFamily:"Playfair Display",fontSize:"clamp(20px,3vw,38px)",fontWeight:700,color:C.warmwht,lineHeight:1.3,maxWidth:760,margin:"0 auto 24px"}}>
                  "This is not anti-AI.<br/>
                  <span style={{color:C.gold,fontStyle:"italic"}}>It is pro-human.<br/>
                  And both things can be true at exactly the same time.<br/>
                  They must be.</span>"
                </div>

                <div style={{height:1,background:`linear-gradient(to right,transparent,${C.gold}44,transparent)`,maxWidth:400,margin:"0 auto 28px"}}/>

                <div style={{fontFamily:"Lora",fontSize:15,color:C.stardust,lineHeight:1.8,maxWidth:640,margin:"0 auto 32px"}}>
                  Every Fair Trade AI Audio certification is a platform choosing to remember where value comes from. Every Voice Estate is an artist choosing not to disappear. Every NOIZY PROOF watermark is a declaration: a human being made this, their name is attached to it, and the record is permanent.
                  <br/><br/>
                  The extraction economy has no memory. NOIZY is the memory.
                </div>

                <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
                  {["Fair Trade AI Audio","Voice Estate Framework","NOIZY PROOF","Consent-as-Code","75/25 Perpetual Royalty","The 500-Year Codex"].map((tag,i)=>(
                    <span key={i} style={{padding:"7px 16px",borderRadius:20,border:`1px solid ${C.gold}33`,fontFamily:"DM Sans",fontSize:10,color:C.gold,letterSpacing:0.5}}>{tag}</span>
                  ))}
                </div>

                <div style={{marginTop:36,fontFamily:"DM Sans",fontSize:11,color:C.mid,letterSpacing:2,textTransform:"uppercase"}}>
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
