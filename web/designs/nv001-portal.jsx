import React, { useState, useEffect } from 'react';
import { Mic, DollarSign, Shield, Users, TrendingUp, AlertCircle, CheckCircle, XCircle, Clock, Eye, Play, Pause, Download, Send } from 'lucide-react';

export default function NV001Portal() {
  const [activeTab, setActiveTab] = useState('overview');
  const [earnings, setEarnings] = useState(12400);
  const [isLive, setIsLive] = useState(true);

  // Simulate real-time earnings increment
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setEarnings(prev => prev + (Math.random() * 0.5));
    }, 3000);
    return () => clearInterval(interval);
  }, [isLive]);

  const characters = [
    {
      id: 1,
      name: "Detective Morrison",
      tagline: "Burnt-Out Cop",
      description: "40s, Brooklyn accent, survivor's guilt, sardonic humor",
      generations: 847,
      earnings: 8200,
      rate: 0.15,
      enterpriseRate: 0.30,
      status: "active",
      projects: 5,
      genre: "Noir/Crime",
      emotionalModes: ["Weary Authority", "Dark Humor", "Confrontational", "Vulnerable"],
      recentUse: "2 hours ago"
    },
    {
      id: 2,
      name: "Street Poet Marcus",
      tagline: "Urban Prophet",
      description: "Ageless prophet, spoken word energy, raw truth-teller",
      generations: 243,
      earnings: 2100,
      rate: 0.12,
      enterpriseRate: 0.24,
      status: "active",
      projects: 3,
      genre: "Narrative/Artistic",
      emotionalModes: ["Prophetic Fury", "Rhythmic Flow", "Whispered Truth", "Revolutionary"],
      recentUse: "1 day ago"
    },
    {
      id: 3,
      name: "Commander Ash",
      tagline: "War-Worn Tactical",
      description: "Military command voice, battle-tested, clipped speech",
      generations: 157,
      earnings: 2100,
      rate: 0.18,
      enterpriseRate: 0.35,
      status: "active",
      projects: 3,
      genre: "Military/Action",
      emotionalModes: ["Command Authority", "Under Fire", "Strategic Calm", "Loss & Duty"],
      recentUse: "5 hours ago"
    }
  ];

  const boundaryLog = [
    { type: 'blocked', client: 'Anonymous Studio', reason: 'Hate speech detected', script: 'Character dialogue contained racial slurs', time: '2 hours ago', severity: 'high' },
    { type: 'blocked', client: 'Political Action Committee', reason: 'Political content excluded', script: 'Campaign advertisement', time: '1 day ago', severity: 'medium' },
    { type: 'pending', client: 'Indie Game Studio', reason: 'Character death scene', script: 'Emotional farewell monologue', time: '12 hours ago', severity: 'review' },
    { type: 'approved', client: 'Obsidian Games', reason: 'Auto-approved (trusted client)', script: 'Detective interrogation scene', time: '3 hours ago', severity: 'low' },
    { type: 'blocked', client: 'Marketing Agency X', reason: 'Commercial jingle (misaligned)', script: 'Upbeat product advertisement', time: '2 days ago', severity: 'medium' },
  ];

  const clientActivity = [
    { client: 'Obsidian Games', character: 'Detective Morrison', generations: 41, spend: 615, status: 'trusted', lastUse: '2 hours ago' },
    { client: 'Narrative Podcast Network', character: 'Street Poet Marcus', generations: 18, spend: 216, status: 'trusted', lastUse: '1 day ago' },
    { client: 'Indie Dev Collective', character: 'Commander Ash', generations: 12, spend: 210, status: 'new', lastUse: '5 hours ago' },
    { client: 'AudioFiction Studios', character: 'Detective Morrison', generations: 8, spend: 120, status: 'trusted', lastUse: '1 day ago' },
  ];

  const pendingInvites = [
    { name: 'Sarah Chen', specialization: 'Sci-fi & Fantasy', experience: '12 years', status: 'considering', daysLeft: 4 },
    { name: 'Marcus Williams', specialization: 'Documentary & Narration', experience: '18 years', status: 'interested', daysLeft: 7 },
    { name: 'Elena Vasquez', specialization: 'Animation & Games', experience: '9 years', status: 'reviewing', daysLeft: 2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans">
      {/* Grain texture overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay">
        <svg width="100%" height="100%">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      {/* Header */}
      <header className="relative border-b border-slate-800/50 backdrop-blur-sm bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-xl"></div>
                  <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 font-black text-2xl px-5 py-2 rounded-lg tracking-tight">
                    NV_001
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
                    Robert Stephen Plowman
                  </h1>
                  <p className="text-slate-400 text-sm font-medium tracking-wide uppercase mt-1">Founding Artist • NOIZYVOX</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsLive(!isLive)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  isLive 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {isLive ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {isLive ? 'LIVE' : 'PAUSED'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-slate-800/50 backdrop-blur-lg bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {[
              { id: 'overview', icon: TrendingUp, label: 'Overview' },
              { id: 'characters', icon: Mic, label: 'Characters' },
              { id: 'boundaries', icon: Shield, label: 'Boundary Log' },
              { id: 'clients', icon: Eye, label: 'Client Activity' },
              { id: 'invites', icon: Users, label: 'Invitations' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl"></div>
                <div className="relative">
                  <div className="text-slate-400 text-sm font-semibold uppercase tracking-wide mb-2">Total Earned</div>
                  <div className="text-4xl font-black text-emerald-400 tabular-nums">
                    ${earnings.toFixed(2)}
                  </div>
                  <div className="text-slate-500 text-xs mt-2">6 months • 75% royalty rate</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-6">
                <div className="text-slate-400 text-sm font-semibold uppercase tracking-wide mb-2">Generations</div>
                <div className="text-4xl font-black text-blue-400 tabular-nums">
                  {characters.reduce((sum, c) => sum + c.generations, 0)}
                </div>
                <div className="text-slate-500 text-xs mt-2">Across {characters.reduce((sum, c) => sum + c.projects, 0)} projects</div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-6">
                <div className="text-slate-400 text-sm font-semibold uppercase tracking-wide mb-2">Active Clients</div>
                <div className="text-4xl font-black text-violet-400 tabular-nums">8</div>
                <div className="text-slate-500 text-xs mt-2">4 trusted • 4 new</div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-6">
                <div className="text-slate-400 text-sm font-semibold uppercase tracking-wide mb-2">Avg Rating</div>
                <div className="text-4xl font-black text-amber-400 tabular-nums">4.9</div>
                <div className="text-slate-500 text-xs mt-2">From 8 client reviews</div>
              </div>
            </div>

            {/* Character Quick Stats */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
              <h2 className="text-xl font-black mb-4 text-slate-200">Character Performance</h2>
              <div className="space-y-3">
                {characters.map(char => (
                  <div key={char.id} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <div>
                        <div className="font-bold text-slate-200">{char.name}</div>
                        <div className="text-sm text-slate-400">{char.tagline} • {char.genre}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 text-sm">
                      <div>
                        <div className="text-slate-500">Generations</div>
                        <div className="font-bold text-slate-200 tabular-nums">{char.generations}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Earned</div>
                        <div className="font-bold text-emerald-400 tabular-nums">${char.earnings}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Last Used</div>
                        <div className="font-bold text-slate-400">{char.recentUse}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'characters' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-200">Your Character Portfolio</h2>
              <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg transition-colors">
                + Add New Character
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {characters.map((char, idx) => (
                <div 
                  key={char.id} 
                  className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl overflow-hidden hover:border-emerald-500/30 transition-all group"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-black text-slate-100 group-hover:text-emerald-400 transition-colors">
                          {char.name}
                        </h3>
                        <p className="text-emerald-400 font-semibold text-sm uppercase tracking-wide">{char.tagline}</p>
                      </div>
                      <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30">
                        {char.status.toUpperCase()}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-slate-400 text-sm leading-relaxed">{char.description}</p>

                    {/* Emotional Modes */}
                    <div>
                      <div className="text-xs text-slate-500 uppercase font-semibold mb-2">Emotional Modes</div>
                      <div className="flex flex-wrap gap-2">
                        {char.emotionalModes.map(mode => (
                          <span key={mode} className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700">
                            {mode}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700/50">
                      <div>
                        <div className="text-slate-500 text-xs uppercase mb-1">Generations</div>
                        <div className="text-xl font-black text-slate-200 tabular-nums">{char.generations}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs uppercase mb-1">Projects</div>
                        <div className="text-xl font-black text-blue-400 tabular-nums">{char.projects}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs uppercase mb-1">Earned</div>
                        <div className="text-xl font-black text-emerald-400 tabular-nums">${char.earnings}</div>
                      </div>
                    </div>

                    {/* Rates */}
                    <div className="pt-4 border-t border-slate-700/50">
                      <div className="text-xs text-slate-500 uppercase font-semibold mb-2">Your Rates</div>
                      <div className="flex gap-4">
                        <div className="flex-1 bg-slate-800/50 rounded-lg p-3">
                          <div className="text-slate-400 text-xs">Standard</div>
                          <div className="text-lg font-black text-slate-200">${char.rate}/gen</div>
                        </div>
                        <div className="flex-1 bg-slate-800/50 rounded-lg p-3">
                          <div className="text-slate-400 text-xs">Enterprise</div>
                          <div className="text-lg font-black text-emerald-400">${char.enterpriseRate}/gen</div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <button className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition-colors text-sm">
                        Edit Character
                      </button>
                      <button className="flex-1 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold rounded-lg border border-emerald-500/30 transition-colors text-sm">
                        View Samples
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'boundaries' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-200">Boundary Enforcement Log</h2>
              <div className="flex gap-2 text-sm">
                <div className="px-3 py-1 bg-red-500/10 text-red-400 rounded border border-red-500/30 font-semibold">
                  3 Blocked
                </div>
                <div className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded border border-amber-500/30 font-semibold">
                  1 Pending
                </div>
                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/30 font-semibold">
                  1 Approved
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {boundaryLog.map((log, idx) => (
                <div 
                  key={idx}
                  className={`p-5 rounded-xl border transition-all ${
                    log.type === 'blocked' 
                      ? 'bg-red-950/20 border-red-900/30' 
                      : log.type === 'pending'
                      ? 'bg-amber-950/20 border-amber-900/30'
                      : 'bg-emerald-950/20 border-emerald-900/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 ${
                        log.type === 'blocked' ? 'text-red-400' : log.type === 'pending' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {log.type === 'blocked' ? <XCircle className="w-5 h-5" /> : 
                         log.type === 'pending' ? <Clock className="w-5 h-5" /> : 
                         <CheckCircle className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`font-bold ${
                            log.type === 'blocked' ? 'text-red-400' : log.type === 'pending' ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {log.type.toUpperCase()}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-300 font-semibold">{log.client}</span>
                          <span className="text-slate-500 text-sm">{log.time}</span>
                        </div>
                        <div className="text-slate-400 text-sm mb-2">
                          <span className="font-semibold text-slate-300">Reason:</span> {log.reason}
                        </div>
                        <div className="text-slate-500 text-sm">
                          <span className="font-semibold text-slate-400">Script:</span> "{log.script}"
                        </div>
                      </div>
                    </div>
                    {log.type === 'pending' && (
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-lg transition-colors text-sm">
                          Approve
                        </button>
                        <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-lg border border-red-500/30 transition-colors text-sm">
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Boundary Settings */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 mt-8">
              <h3 className="text-lg font-black text-slate-200 mb-4">Your Boundary Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                  <div>
                    <div className="font-semibold text-slate-200">Hate Speech & Discrimination</div>
                    <div className="text-sm text-slate-400">Auto-reject any content containing slurs or bigotry</div>
                  </div>
                  <div className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded border border-red-500/30">
                    AUTO-BLOCK
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                  <div>
                    <div className="font-semibold text-slate-200">Political Content</div>
                    <div className="text-sm text-slate-400">Case-by-case approval required</div>
                  </div>
                  <div className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded border border-amber-500/30">
                    REVIEW
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                  <div>
                    <div className="font-semibold text-slate-200">Complex Villains</div>
                    <div className="text-sm text-slate-400">Morally ambiguous characters allowed</div>
                  </div>
                  <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded border border-emerald-500/30">
                    ALLOWED
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-200">Client Activity & Transparency</h2>
            
            <div className="space-y-3">
              {clientActivity.map((client, idx) => (
                <div key={idx} className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-200">{client.client}</h3>
                        <span className={`px-2 py-1 text-xs font-bold rounded ${
                          client.status === 'trusted' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {client.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400 mb-3">
                        Using: <span className="text-emerald-400 font-semibold">{client.character}</span> • Last active: {client.lastUse}
                      </div>
                      <div className="flex gap-6 text-sm">
                        <div>
                          <span className="text-slate-500">Generations:</span>
                          <span className="ml-2 font-bold text-slate-200 tabular-nums">{client.generations}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Total Spend:</span>
                          <span className="ml-2 font-bold text-emerald-400 tabular-nums">${client.spend}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Your Earnings (75%):</span>
                          <span className="ml-2 font-bold text-emerald-400 tabular-nums">${(client.spend * 0.75).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition-colors text-sm">
                        View Details
                      </button>
                      {client.status === 'new' && (
                        <button className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold rounded-lg border border-emerald-500/30 transition-colors text-sm">
                          Add to Trusted
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'invites' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-200">Invitation System</h2>
                <p className="text-slate-400 mt-1">Build the founding cohort: NV_002 - NV_010</p>
              </div>
              <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/30 font-bold">
                7 Invitations Remaining
              </div>
            </div>

            {/* Send New Invitation */}
            <div className="bg-gradient-to-br from-emerald-950/30 to-teal-950/30 border border-emerald-900/30 rounded-xl p-6">
              <h3 className="text-lg font-black text-emerald-400 mb-4">Invite a Professional Voice Actor</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input 
                  type="text" 
                  placeholder="Artist Name" 
                  className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <textarea 
                placeholder="Personal message (optional): Why you think they'd be perfect for NOIZYVOX..."
                rows="3"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none mb-4"
              />
              <button className="w-full px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                Send Invitation
              </button>
            </div>

            {/* Pending Invitations */}
            <div>
              <h3 className="text-lg font-black text-slate-200 mb-4">Pending Invitations</h3>
              <div className="space-y-3">
                {pendingInvites.map((invite, idx) => (
                  <div key={idx} className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-slate-200 mb-1">{invite.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span>Specialization: <span className="text-emerald-400 font-semibold">{invite.specialization}</span></span>
                          <span>•</span>
                          <span>Experience: <span className="text-slate-300 font-semibold">{invite.experience}</span></span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`text-sm font-bold mb-1 ${
                            invite.status === 'interested' ? 'text-emerald-400' : 
                            invite.status === 'considering' ? 'text-amber-400' : 
                            'text-slate-400'
                          }`}>
                            {invite.status.toUpperCase()}
                          </div>
                          <div className="text-xs text-slate-500">{invite.daysLeft} days to respond</div>
                        </div>
                        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition-colors text-sm">
                          Follow Up
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* The Vision */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl p-6 mt-8">
              <h3 className="text-xl font-black text-slate-200 mb-3">The Founding 10 Vision</h3>
              <p className="text-slate-400 leading-relaxed mb-4">
                You're not just building a roster—you're assembling the founding cohort of a movement. Each artist you invite becomes part of NOIZYVOX history. Together, NV_001 through NV_010 will prove that professional voice actors can own, control, and monetize their AI models with dignity and perpetual income.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-slate-500 text-xs uppercase mb-1">Your Referral Bonus</div>
                  <div className="text-2xl font-black text-emerald-400">2.5%</div>
                  <div className="text-slate-500 text-xs mt-1">of their first year earnings</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="text-slate-500 text-xs uppercase mb-1">Network Effect</div>
                  <div className="text-2xl font-black text-blue-400">10x</div>
                  <div className="text-slate-500 text-xs mt-1">Value multiplier at critical mass</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}