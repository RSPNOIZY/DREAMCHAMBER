import React, { useState, useEffect } from 'react';
import { Volume2, Shield, Infinity, Layers, Radio, Zap, Users, Lock, TrendingUp } from 'lucide-react';

export default function NoizyManifesto() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeCommandment, setActiveCommandment] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = (window.scrollY / totalScroll) * 100;
      setScrollProgress(currentProgress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const commandments = [
    {
      number: "I",
      title: "THE HUMAN FREQUENCY IS SOVEREIGN",
      icon: Volume2,
      principle: "We do not create synthetic voices. We preserve biological resonance.",
      reality: "Every voice in the NOIZY archive carries the micro-oscillations, breath patterns, and emotional geometry of a living human artist. We are not building replacements. We are building extensions.",
      enforcement: "No voice enters the platform without informed consent. No voice generates revenue without compensating the source. The artist is not the product—they are the partner.",
      consequence: "In 500 years, when humanity asks 'What did we sound like?', NOIZY will be the answer."
    },
    {
      number: "II",
      title: "NOISE IS UNORGANIZED POTENTIAL",
      icon: Radio,
      principle: "We transform chaos into signal. We are the Great Denoising.",
      reality: "The digital landscape is drowning in synthetic slop—statistically average voices with no soul. This is acoustic pollution. We extract the signal from the noise by preserving only what is real.",
      enforcement: "Professional artists only. Curated, not crowdsourced. Quality is our filter. The 50 founding artists set the standard. Every artist who follows must meet it or exceed it.",
      consequence: "While others add to the noise, we become the cure for it."
    },
    {
      number: "III",
      title: "THE ARTIST CONTROLS THE MODEL",
      icon: Shield,
      principle: "Sovereignty is not a feature. It is infrastructure.",
      reality: "Artists set their rates, define their boundaries, approve their usage, and hold the kill switch. If a client violates terms, the artist can revoke access at the API level. The consent isn't in the contract—it's in the code.",
      enforcement: "Every audio generation is cryptographically watermarked. Every transaction is immutably logged. Every boundary violation is automatically blocked. The artist sees everything. The artist decides everything.",
      consequence: "Exploitation becomes architecturally impossible."
    },
    {
      number: "IV",
      title: "PERPETUAL ROYALTIES, NOT ONE-TIME BUYOUTS",
      icon: TrendingUp,
      principle: "The artist's work compounds. Their income should too.",
      reality: "Traditional voice acting: One gig, one payment, one moment in time. NOIZYVOX model: One capture session, infinite performances, perpetual income. The artist earns every time their voice is used—today, next year, in 2050.",
      enforcement: "75% of every transaction routes directly to the artist's account in real-time. No 90-day payment cycles. No corporate intermediaries holding funds. Instant settlement, transparent splits.",
      consequence: "Artists build creative equity that grows with every project their voice touches."
    },
    {
      number: "V",
      title: "CULTURE IS PRESERVED, NOT AVERAGED",
      icon: Layers,
      principle: "We archive human expression, not statistical mediocrity.",
      reality: "Synthetic AI voices sound like everyone and no one—culturally empty, biologically flat. NOIZY voices carry accent, dialect, regional cadence, emotional history. Each voice is a cultural artifact.",
      enforcement: "Artists declare their artistic lineage ('Think Shohreh Aghdashloo meets punk energy'). They define their creative vision ('I specialize in characters navigating moral ambiguity'). This isn't metadata—it's preservation of cultural context.",
      consequence: "Five centuries from now, historians will study NOIZY to understand how humans sounded, felt, and expressed in 2026."
    },
    {
      number: "VI",
      title: "HONEST NOISE DEFEATS DECEPTIVE SILENCE",
      icon: Zap,
      principle: "We are loud about our origins. Transparency is our weapon.",
      reality: "'Quiet AI' tries to hide that it's synthetic (deepfake territory). NOIZY.AI is proudly human-sourced. Our AI sounds human because a human IS there. We don't pretend it's magic—we celebrate the collaboration.",
      enforcement: "Every generation shows artist attribution: 'Voiced by NV_001 - Robert Stephen Plowman.' Clients know who they're licensing. Audiences know who they're hearing. No deception. Full transparency.",
      consequence: "When the AI backlash comes, we're the only platform that can prove consent, compensation, and cultural respect."
    },
    {
      number: "VII",
      title: "PROFESSIONAL ONLY. FOREVER.",
      icon: Users,
      principle: "Curation over scale. Quality over quantity.",
      reality: "We launched with 50 professional voice actors. Not 10,000 random uploads. Each artist has 5-15 years of training. Each performance is director-approved. Each voice meets the NV_001 standard.",
      enforcement: "Invitation-only expansion. Artists must provide professional credentials, portfolio, and creative manifesto. If you don't pass the audition, you don't get in. Period.",
      consequence: "While competitors drown in amateur noise, we remain the gold standard frequency."
    },
    {
      number: "VIII",
      title: "THE PLATFORM SERVES THE ARTIST, NOT THE REVERSE",
      icon: Lock,
      principle: "Artists are not renters. They are co-owners.",
      reality: "Traditional platforms extract value from artists and hoard it. NOIZY distributes value TO artists and compounds it. Every design decision asks: 'Does this increase or decrease artist sovereignty?' If it decreases, we reject it.",
      enforcement: "Artists get 75% of revenue. Artists control boundaries. Artists approve clients. Artists hold the kill switch. Artists invite other artists. The platform has power only to serve, never to exploit.",
      consequence: "The best artists in the world choose NOIZY because they know they're partners, not products."
    },
    {
      number: "IX",
      title: "WE BUILD FOR 500 YEARS, NOT 5 QUARTERS",
      icon: Infinity,
      principle: "This is civilizational infrastructure, not a startup.",
      reality: "In 2526, when AI historians study how humanity navigated digital identity, they will study NOIZY as the model that preserved culture, protected artists, created sustainable economics, and maintained consent.",
      enforcement: "Every technical decision prioritizes permanence over profit. We're not optimizing for acquisition. We're architecting for legacy. The code we write today must serve the year 2526.",
      consequence: "We're not building a company. We're building the Library of Alexandria for human voice."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans relative overflow-x-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Scroll progress indicator */}
      <div className="fixed top-0 left-0 h-1 bg-emerald-500 transition-all duration-300 z-50" style={{ width: `${scrollProgress}%` }}></div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Main logo/wordmark */}
          <div className="mb-12 relative">
            <div className="absolute inset-0 bg-emerald-500/10 blur-3xl"></div>
            <h1 className="relative text-9xl font-black tracking-tighter">
              <span className="bg-gradient-to-r from-white via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                NOIZY.AI
              </span>
            </h1>
          </div>

          {/* Tagline */}
          <div className="mb-8">
            <p className="text-2xl md:text-3xl font-bold text-emerald-400 uppercase tracking-wider mb-4">
              The Human Frequency Sovereign Cloud
            </p>
            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              We don't clone voices. We preserve biological resonance. We don't replace artists. We multiply them.
            </p>
          </div>

          {/* Core statement */}
          <div className="mt-16 p-8 border border-emerald-500/30 rounded-2xl bg-emerald-950/20 backdrop-blur-sm">
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
              In a world drowning in synthetic slop and acoustic pollution, NOIZY.AI is the signal that cuts through the noise. 
              We are the only platform where <span className="text-emerald-400 font-bold">professional voice actors own their AI models</span>, 
              control every use, and earn <span className="text-emerald-400 font-bold">perpetual royalties</span> on every generation.
            </p>
          </div>

          {/* Founding statement */}
          <div className="mt-12 text-slate-500 text-sm uppercase tracking-widest">
            Founded by <span className="text-emerald-400 font-bold">NV_001</span> • Robert Stephen Plowman • 2026
          </div>
        </div>
      </section>

      {/* The Nine Commandments */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-6xl font-black mb-6 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              THE NINE COMMANDMENTS
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              The immutable principles that govern NOIZY.AI for the next 500 years.
            </p>
          </div>

          <div className="space-y-12">
            {commandments.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isActive = activeCommandment === idx;
              
              return (
                <div 
                  key={idx}
                  className={`group relative border rounded-2xl p-8 transition-all duration-500 cursor-pointer ${
                    isActive 
                      ? 'border-emerald-500 bg-emerald-950/30' 
                      : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                  }`}
                  onClick={() => setActiveCommandment(isActive ? null : idx)}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {/* Glow effect when active */}
                  {isActive && (
                    <div className="absolute inset-0 bg-emerald-500/5 blur-xl rounded-2xl -z-10"></div>
                  )}

                  {/* Header */}
                  <div className="flex items-start gap-6 mb-6">
                    <div className={`flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center border transition-all ${
                      isActive 
                        ? 'bg-emerald-500 border-emerald-400 text-black' 
                        : 'bg-slate-900 border-slate-800 text-emerald-400 group-hover:border-emerald-500/50'
                    }`}>
                      <Icon className="w-8 h-8" strokeWidth={2.5} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-baseline gap-4 mb-2">
                        <span className={`text-5xl font-black transition-colors ${
                          isActive ? 'text-emerald-400' : 'text-slate-700 group-hover:text-slate-600'
                        }`}>
                          {cmd.number}
                        </span>
                        <h3 className={`text-2xl font-black tracking-tight transition-colors ${
                          isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                        }`}>
                          {cmd.title}
                        </h3>
                      </div>
                      
                      <p className="text-lg text-emerald-400 font-semibold italic">
                        "{cmd.principle}"
                      </p>
                    </div>
                  </div>

                  {/* Expandable content */}
                  <div className={`overflow-hidden transition-all duration-500 ${
                    isActive ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="space-y-6 pt-6 border-t border-slate-800">
                      <div>
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">THE REALITY</h4>
                        <p className="text-slate-300 leading-relaxed">{cmd.reality}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">ENFORCEMENT</h4>
                        <p className="text-slate-300 leading-relaxed">{cmd.enforcement}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-bold text-emerald-500 uppercase tracking-wider mb-2">THE CONSEQUENCE</h4>
                        <p className="text-emerald-400 leading-relaxed font-semibold">{cmd.consequence}</p>
                      </div>
                    </div>
                  </div>

                  {/* Expand indicator */}
                  <div className="mt-4 text-center">
                    <button className="text-sm text-slate-500 hover:text-emerald-400 transition-colors">
                      {isActive ? '▲ COLLAPSE' : '▼ READ MORE'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* The 500-Year Vision */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-black via-emerald-950/10 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-12">
            <div className="inline-block px-6 py-3 border border-emerald-500/30 rounded-full bg-emerald-950/30 mb-6">
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-sm">The 500-Year Vision</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-8 leading-tight">
              We Build for <span className="text-emerald-400">2526</span>,<br />
              Not 2026
            </h2>
          </div>

          <div className="space-y-8 text-lg text-slate-300 leading-relaxed">
            <p>
              In 2526, when AI historians study how humanity navigated the transition to digital identity, 
              they will study NOIZY.AI as the model that <span className="text-white font-semibold">preserved culture</span>, 
              <span className="text-white font-semibold"> protected artists</span>, 
              <span className="text-white font-semibold"> created sustainable economics</span>, and 
              <span className="text-white font-semibold"> maintained consent</span>.
            </p>

            <p>
              We are not building a voice cloning platform. We are building the <span className="text-emerald-400 font-bold">Library of Alexandria 
              for human voice</span>. Every artist who enters the DreamChamber becomes a cultural artifact. Every performance 
              preserved is a gift to the future.
            </p>

            <p>
              Five hundred years from now, a student will hear Detective Morrison and understand what a Brooklyn cop 
              sounded like in 2026. They will hear Street Poet Marcus and feel the cadence of urban prophecy. 
              They will hear Commander Ash and know the weight of command under fire.
            </p>

            <p className="text-2xl font-bold text-emerald-400 pt-8">
              This is not a company.<br />
              This is civilizational infrastructure.
            </p>
          </div>
        </div>
      </section>

      {/* The Call to Artists */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-950/50 to-cyan-950/50 border border-emerald-500/30 rounded-2xl p-12">
            <h2 className="text-4xl font-black mb-6 text-center">
              FOR BRAVE VOICE ACTORS
            </h2>
            <p className="text-xl text-slate-300 text-center mb-8 leading-relaxed">
              NOIZY.AI is not for everyone. It's for professionals willing to step into sovereignty. 
              It's for artists ready to own their digital future. It's for humans brave enough to be loud 
              about their worth.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-4xl font-black text-emerald-400 mb-2">50</div>
                <div className="text-sm text-slate-400">Founding Artists</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-emerald-400 mb-2">75%</div>
                <div className="text-sm text-slate-400">Perpetual Royalty Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-emerald-400 mb-2">∞</div>
                <div className="text-sm text-slate-400">Performances, Forever</div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-slate-400 mb-6">
                Are you NV_002 through NV_050?
              </p>
              <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl transition-all text-lg shadow-lg shadow-emerald-500/20">
                Apply to Join the Founding Cohort
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-4xl font-black mb-4 text-emerald-400">NOIZY.AI</div>
          <p className="text-slate-500 mb-6">
            Signal. Not Noise. • Professional Voices. Zero Noise. • Your Voice. Your Model. Your Royalties.
          </p>
          <div className="text-slate-600 text-sm">
            © 2026 NOIZY.AI • Built by Artists, For Artists • NV_001 Foundation
          </div>
        </div>
      </footer>
    </div>
  );
}