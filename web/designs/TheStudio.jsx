import React, { useState, useEffect, useRef } from 'react';

// ============================================================
// THE STUDIO — PHYSICAL BUILD PLAN
// The GORUNFREE Protocol Made Real
// The Sound Vault · The DreamChamber Studio · The Policy Vault
// NOIZYFISH INC. · MC96ECO Universe · Ottawa, Canada · 2026
// ============================================================

const C = {
  void:    '#020208',
  deep:    '#05040e',
  panel:   '#090716',
  card:    '#0d0a1e',
  border:  '#15122e',
  dim:     '#1e1a38',

  gold:    '#D4A843',
  amber:   '#E8833A',
  steel:   '#7A9EBF',
  concrete:'#9E9E8E',
  warm:    '#C4A882',
  teal:    '#2ABFA0',
  cyan:    '#4BA8D4',
  violet:  '#7B4FD4',
  rise:    '#44CC88',

  cream:   '#F5F0E8',
  ghost:   'rgba(255,255,255,0.05)',
};

// ============================================================
// DATA
// ============================================================

const ROOMS = [
  {
    id: 'vault',
    number: '01',
    name: 'The Sound Vault',
    subtitle: 'Audio / Voice-Over Booth',
    icon: '🎙️',
    color: C.gold,
    purpose: 'The definitive capture environment for the RSP_001 proof-of-concept and all A.I.V.A. voice actor onboarding. Every sound that enters this room exits as a pristine, ownership-stamped asset.',
    gorunfree: 'Eliminates the Transmission Problem at source. Zero signal loss between Rob\'s voice and the Voice Estate record.',
    design: [
      {
        aspect: 'Wall Architecture',
        spec: 'Custom non-parallel (splayed) walls — eliminates standing waves at the source',
        why: 'Parallel walls create comb filtering and room resonances that corrupt recordings. Splayed walls are standard in world-class vocal booths.',
      },
      {
        aspect: 'Room-Within-a-Room',
        spec: 'True Mass-Spring-Mass isolation: two decoupled concrete slabs with resilient isolation material between them',
        why: 'The MC96ECO Universe\'s legal infrastructure enforces rights in code. The acoustic infrastructure enforces purity at capture. Both are foundational — non-negotiable.',
      },
      {
        aspect: 'HVAC System',
        spec: 'Dedicated silent HVAC — completely isolated from the main building\'s air handling system',
        why: 'A/C noise floors are the most common cause of re-takes and quality degradation. A silent HVAC is not a luxury — it is a technical requirement for commercial voice work.',
      },
      {
        aspect: 'Surface Materials',
        spec: 'High-mass/high-density drywall layers (minimum 3-layer assemblies), decoupled ceiling hangers, acoustic sealant on all penetrations',
        why: 'Mass stops low-frequency transmission. Decoupling stops structure-borne vibration. Together they achieve 50+ dB isolation.',
      },
    ],
    equipment: [
      'High-channel-count, ultra-low-latency audio interface (RME or custom Dante network)',
      'Reference microphone (large-diaphragm condenser + ribbon for voice texture capture)',
      'Acoustic panels: custom-tuned absorption + diffusion for flat frequency response',
      'Pop filter, shock mount, reflection filter (portable secondary isolation)',
      'Direct feed to GABRIEL_V3 pipeline: Librosa → XTTS v2 → RVC → pedalboard',
    ],
    output: 'Every session: RSP_001 voice model update + Voice Estate asset + NOIZY PROOF watermark',
  },
  {
    id: 'dreamchamber',
    name: 'The DreamChamber Studio',
    number: '02',
    subtitle: 'Control / Mix / Vision Room',
    icon: '🌌',
    color: C.cyan,
    purpose: 'The main creative hub and the physical DreamChamber ideation portal. Where GORUNFREE operates at full capacity — voice command to finished composition, zero friction. Also the client onboarding station for Genius Creator Direct-Channel.',
    gorunfree: '1-click execution environment. High-density monitor arrays + haptic controls + GABRIEL_V3 = the gap between imagination and reality approaches zero.',
    design: [
      {
        aspect: 'Acoustic Treatment',
        spec: 'Live-End, Dead-End (LEDE) or Reflection-Free Zone (RFZ) design — precise critical listening environment',
        why: 'Mix decisions made in an untreated room are wrong. Every hour of work done in this room must translate perfectly to every playback system in the world.',
      },
      {
        aspect: 'Bass Traps',
        spec: 'Custom-tuned floor-to-ceiling bass traps in all corners, targeting room modes at 40–200Hz',
        why: 'Low-frequency buildup in corners is the most destructive acoustic problem in studio design. Proper bass trapping is what separates professional from amateur monitoring.',
      },
      {
        aspect: 'Ceiling Cloud',
        spec: 'Floating acoustic cloud above the mix position — eliminates early reflections from ceiling to engineer\'s ears',
        why: 'Early reflections from the ceiling arrive 2–5ms after the direct sound, causing comb filtering at the mix position. The cloud removes the problem.',
      },
      {
        aspect: 'Rear Wall',
        spec: 'Diffusive rear wall treatment — scatters late reflections rather than absorbing them, maintaining a sense of space without flutter echo',
        why: 'An over-damped room sounds wrong and causes ear fatigue. The goal is a neutral, accurate room — not a dead room.',
      },
    ],
    equipment: [
      'Large-format integrated control surface (Avid S6 or custom modular desk) with haptic feedback integration',
      'Reference monitor system: Near-field (NS10-class) + Mid-field (Genelec or ATC) + subwoofer',
      'Color-calibrated 4K/8K reference monitors for animation, video, and color grading (Flander Scientific or EIZO)',
      'High-density multi-monitor array for GABRIEL_V3 agent interface + DAW + visual rendering',
      'GABRIEL_V3 terminal: voice command input → instant execution across all creative workflows',
      'DreamChamber client onboarding workstation: dedicated station for Voice Estate IP Framework setup',
    ],
    output: 'Every session: completed creative work + Genius Creator onboarding + GABRIEL memcell updates',
  },
  {
    id: 'policy',
    name: 'The Policy Vault',
    number: '03',
    subtitle: 'Server Infrastructure Room',
    icon: '🔐',
    color: C.teal,
    purpose: 'The physical home of the SUPERSONIC AI STACK v2.0, GABRIEL_V3, and the Cloudflare D1/KV interface. This is where "Infrastructure is Policy" becomes literal — the code that enforces creator rights lives in this room.',
    gorunfree: 'The physical Policy Vault is the hardware equivalent of the Consent-as-Code principle. Ethical commitments are not written on paper in this room — they run on dedicated silicon, 24/7, uninterrupted.',
    design: [
      {
        aspect: 'Climate Control',
        spec: 'CRAC unit (Computer Room Air Conditioning) — dedicated precision cooling for rack-mounted equipment',
        why: 'The SUPERSONIC AI STACK generates significant heat under load. Consumer A/C is insufficient — CRAC units are designed for data center heat loads and maintain precise temperature and humidity.',
      },
      {
        aspect: 'Power Infrastructure',
        spec: 'Dedicated power circuit (separate from studio audio circuits), UPS (Uninterruptible Power Supply) for 24/7 uptime',
        why: 'GABRIEL_V3 cannot go down. The consent ledger cannot have gaps. The UPS ensures continuous operation through power events, and the dedicated circuit eliminates noise contamination of the audio chain.',
      },
      {
        aspect: 'Physical Security',
        spec: 'Secure, access-controlled room. The physical infrastructure for Consent-as-Code is a target.',
        why: 'The infrastructure that holds creator IP, voice models, and the consent ledger is a high-value target. Physical security is part of the security architecture.',
      },
      {
        aspect: 'Network Architecture',
        spec: 'Redundant networking with the HEAVEN Worker (master Cloudflare router) as the central API hub connecting all studio systems',
        why: 'Every device in the studio — the DAW, the monitoring system, the client onboarding station — communicates through a single, controlled gateway. No data moves without logging.',
      },
    ],
    equipment: [
      'GABRIEL_V3 server — 10.90.90.20 — 315+ memcells, D1 × 11, KV × 20',
      'Multi-GPU render farm: 6x NVIDIA A100 or equivalent — SUPERSONIC AI STACK execution',
      'High-speed redundant NAS/SAN: 34TB+ for THE_AQUARIUM catalog (3-2-1 backup: local + offsite + cloud)',
      'Cloudflare D1/KV interface hub — consent ledger + royalty split mechanics',
      'NOIZY PROOF watermarking hardware acceleration module',
      'UPS: minimum 30-minute bridge capacity across all systems',
    ],
    output: 'Always on: consent ledger, royalty distribution, voice estate registry, GABRIEL_V3, NOIZY PROOF',
  },
  {
    id: 'haptics',
    name: 'The NOIZYKIDZ Lab',
    number: '04',
    subtitle: 'Haptic Research & Development Station',
    icon: '🎵',
    color: C.rise,
    purpose: 'The physical R&D station for NOIZYKIDZ haptic music development. Where frequency-to-haptic mapping is researched, prototyped, and tested with Dr. Benoit\'s NAI framework. Nims-inspired. Mission-critical.',
    gorunfree: 'GORUNFREE closes the gap between imagination and execution for creators. NOIZYKIDZ closes the gap between music and children who have never heard it. Both are the same principle applied to different problems.',
    design: [
      {
        aspect: 'Research Environment',
        spec: 'Acoustically isolated from the main studio chain — haptic research requires precise vibrotactile measurement uncorrupted by airborne sound',
        why: 'When studying how frequency translates to haptic sensation, the research environment must be clean. Sound vibrations in the room corrupt the haptic signal measurements.',
      },
      {
        aspect: 'Test Station',
        spec: 'Dedicated haptic feedback test surface: configurable for vests, floor panels, wrist devices, and custom contact points',
        why: 'Different children have different sensory profiles. The research must test multiple haptic delivery modalities to find what works best for each population.',
      },
      {
        aspect: 'NAI Integration',
        spec: 'Connected to Dr. Brien Benoit\'s Neuro-Acoustic Intelligence research framework — brain response measurement during haptic music exposure',
        why: 'The scientific backbone of NOIZYKIDZ is Dr. Benoit\'s neuroscience. The lab is the physical interface between acoustic engineering and neurology.',
      },
    ],
    equipment: [
      'Haptic feedback devices: wearable vests, floor panels, wrist actuators, chair transducers',
      'Vibration actuators: full-range frequency response (20Hz–2KHz haptic translation)',
      'Frequency-to-haptic mapping workstation: real-time signal processing (GABRIEL + custom DSP)',
      'Biometric measurement tools for research documentation (in coordination with Dr. Benoit)',
      'LIFELUV companion AI development terminal — Nims prototype interface',
    ],
    output: 'Haptic prototype (August 2026), NAI research data, LIFELUV alpha, NOIZYKIDZ curriculum materials',
  },
];

const PHASES = [
  {
    phase: 'Phase I',
    name: 'Physical Infrastructure',
    timing: 'Month 1–3',
    color: C.gold,
    items: [
      'Site selection and acoustic survey',
      'Structural engineering assessment for room-within-a-room construction',
      'Sound Vault construction (decoupled slabs, splayed walls, silent HVAC)',
      'DreamChamber acoustic treatment installation (bass traps, ceiling cloud, rear diffusion)',
      'Policy Vault CRAC unit installation and dedicated power circuits',
      'NOIZYKIDZ Lab partition and isolation',
    ],
  },
  {
    phase: 'Phase II',
    name: 'Technology Stack',
    timing: 'Month 2–4',
    color: C.cyan,
    items: [
      'GABRIEL_V3 server rack installation at 10.90.90.20',
      'GPU render farm deployment (6x A100)',
      'NAS/SAN storage system: 34TB base + redundancy',
      'Audio interface + monitoring system calibration',
      'Reference monitor installation + acoustic measurement (REW)',
      'Color-calibrated 4K/8K visual monitors',
      'Multi-monitor GABRIEL command array',
      'UPS installation + power conditioning',
    ],
  },
  {
    phase: 'Phase III',
    name: 'GORUNFREE Integration',
    timing: 'Month 3–6',
    color: C.teal,
    items: [
      'GABRIEL_V3 voice command workflow calibration',
      'HEAVEN Worker API gateway commissioning',
      'Cloudflare D1/KV consent ledger → studio integration',
      'SUPERSONIC AI STACK v2.0 deployment and testing',
      'NOIZY PROOF watermarking pipeline live',
      'RSP_001 first Voice Estate recording session',
      'DreamChamber client onboarding workflow activated',
      'NOIZYKIDZ haptic test station operational',
    ],
  },
];

const GORUNFREE_WORKFLOW = [
  {
    step: '01',
    label: 'Voice Input',
    desc: 'Rob speaks a creative intention. "Give me a melancholic string arrangement in the key of D minor, 3/4 time, inspired by the Ed Edd n Eddy score from 2002."',
    system: 'Microphone → Audio Interface → GABRIEL_V3',
    color: C.amber,
    icon: '🎙️',
  },
  {
    step: '02',
    label: 'GABRIEL Processing',
    desc: 'GABRIEL_V3 receives the voice command, cross-references THE_AQUARIUM memcells for RSP_001 stylistic fingerprint, and activates the SUPERSONIC AI STACK.',
    system: 'GABRIEL → MusicGen + Gemma2 + Librosa',
    color: C.gold,
    icon: '⚡',
  },
  {
    step: '03',
    label: 'Composition Output',
    desc: 'A complete arrangement renders within seconds. Displayed on the DreamChamber monitor array. Rob can hear it, see the notation, edit stems, or approve for processing.',
    system: 'GPU Render Farm → DreamChamber monitors',
    color: C.cyan,
    icon: '🎼',
  },
  {
    step: '04',
    label: 'NOIZY PROOF Stamp',
    desc: 'Every approved output is automatically watermarked with cryptographic provenance via the NOIZY PROOF hardware module. Origin, timestamp, creator identity — permanent.',
    system: 'NOIZY PROOF → D1 Consent Ledger',
    color: C.teal,
    icon: '🔐',
  },
  {
    step: '05',
    label: 'Voice Estate Update',
    desc: 'The asset is added to the Voice Estate registry. Royalty terms are pre-coded (75/25). Any future commercial use triggers automatic payment — no human intervention required.',
    system: 'Voice Estate → KV Store → Royalty Engine',
    color: C.rise,
    icon: '∞',
  },
];

const HARDWARE_BUDGET = [
  { item: 'Sound Vault construction (room-within-a-room)', est: '$120,000 – $200,000', priority: 'CRITICAL' },
  { item: 'DreamChamber acoustic treatment', est: '$40,000 – $80,000', priority: 'CRITICAL' },
  { item: 'Policy Vault CRAC + power infrastructure', est: '$30,000 – $60,000', priority: 'CRITICAL' },
  { item: 'GPU Render Farm (6x NVIDIA A100-class)', est: '$60,000 – $150,000', priority: 'HIGH' },
  { item: 'Reference monitor system (near + mid + sub)', est: '$20,000 – $50,000', priority: 'HIGH' },
  { item: 'Control surface (Avid S6 or equivalent)', est: '$40,000 – $80,000', priority: 'HIGH' },
  { item: '4K/8K reference visual monitors', est: '$15,000 – $30,000', priority: 'MEDIUM' },
  { item: 'NAS/SAN storage system (34TB+ redundant)', est: '$10,000 – $25,000', priority: 'HIGH' },
  { item: 'Audio interface + microphone system', est: '$8,000 – $20,000', priority: 'HIGH' },
  { item: 'NOIZYKIDZ haptic research station', est: '$15,000 – $35,000', priority: 'MEDIUM' },
  { item: 'UPS + power conditioning', est: '$8,000 – $20,000', priority: 'CRITICAL' },
  { item: 'Networking (HEAVEN Worker gateway)', est: '$5,000 – $15,000', priority: 'CRITICAL' },
];

// ============================================================
// CANVAS: WAVEFORM ARCHITECTURE
// ============================================================

function WaveformArchitecture({ activeRoom }) {
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

    const roomColors = {
      vault: C.gold,
      dreamchamber: C.cyan,
      policy: C.teal,
      haptics: C.rise,
    };
    const activeColor = activeRoom ? roomColors[activeRoom] : C.gold;

    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Reflection simulation
      const reflections = activeRoom === 'vault' ? 0 : activeRoom === 'dreamchamber' ? 2 : 4;
      for (let r = 0; r <= reflections; r++) {
        const amp = (30 - r * 6) * (activeRoom === 'vault' ? 0.3 : 1);
        const alpha = 0.15 - r * 0.03;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 2) {
          const y = H / 2 + Math.sin(x * 0.02 + t * 0.025 - r * 0.8) * amp +
                    Math.sin(x * 0.05 + t * 0.015 + r * 0.5) * (amp * 0.4);
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = activeColor + Math.round(Math.max(0, alpha) * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 1.5 - r * 0.2;
        ctx.stroke();
      }

      // Primary waveform
      ctx.beginPath();
      for (let x = 0; x <= W; x += 2) {
        const y = H / 2 + Math.sin(x * 0.02 + t * 0.025) * 30 +
                  Math.sin(x * 0.05 + t * 0.015) * 12;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = activeColor + 'cc';
      ctx.lineWidth = 2;
      ctx.stroke();

      t++;
      animRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [activeRoom]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

// ============================================================
// ROOM CARD
// ============================================================

function RoomDetail({ room }) {
  const [activeDesign, setActiveDesign] = useState(null);

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, ${room.color}15 0%, ${room.color}05 100%)`,
        border: `1.5px solid ${room.color}50`,
        borderRadius: 16,
        padding: '32px 36px',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 200, opacity: 0.3 }}>
          <WaveformArchitecture activeRoom={room.id} />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <span style={{ fontSize: 36 }}>{room.icon}</span>
            <div>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: room.color + '99', letterSpacing: 2, textTransform: 'uppercase' }}>Room {room.number}</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, color: room.color, fontWeight: 700 }}>{room.name}</div>
              <div style={{ fontFamily: 'IM Fell English, serif', fontSize: 15, color: C.cream + 'aa', fontStyle: 'italic' }}>{room.subtitle}</div>
            </div>
          </div>
          <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + 'cc', lineHeight: 1.8, marginBottom: 14, maxWidth: 600 }}>{room.purpose}</div>
          <div style={{ background: room.color + '12', border: `1px solid ${room.color}30`, borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ color: room.color, fontSize: 13, flexShrink: 0, marginTop: 2 }}>⚡</span>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: room.color, lineHeight: 1.5 }}><strong>GORUNFREE:</strong> {room.gorunfree}</div>
          </div>
        </div>
      </div>

      {/* Design specs */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, color: room.color, marginBottom: 16 }}>Acoustic & Structural Design</div>
        {room.design.map((d, i) => (
          <div
            key={i}
            onClick={() => setActiveDesign(activeDesign === i ? null : i)}
            style={{
              background: activeDesign === i ? room.color + '10' : C.ghost,
              border: `1px solid ${activeDesign === i ? room.color + '50' : 'transparent'}`,
              borderRadius: 8,
              padding: '12px 16px',
              marginBottom: 8,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: room.color, fontWeight: 600 }}>{d.aspect}</div>
                <div style={{ fontSize: 12, color: C.cream + '80', fontFamily: 'DM Sans, sans-serif', marginTop: 2 }}>{d.spec}</div>
              </div>
              <span style={{ color: room.color + '80', fontSize: 16, flexShrink: 0, marginLeft: 12 }}>{activeDesign === i ? '−' : '+'}</span>
            </div>
            {activeDesign === i && (
              <div style={{ marginTop: 10, fontFamily: 'Lora, serif', fontSize: 13, color: C.cream + 'aa', lineHeight: 1.7, fontStyle: 'italic', paddingLeft: 4, borderLeft: `2px solid ${room.color}40` }}>
                Why: {d.why}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Equipment */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 22px' }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 14, color: room.color, marginBottom: 12 }}>Equipment</div>
          {room.equipment.map((e, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 7 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: room.color, marginTop: 6, flexShrink: 0 }} />
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.cream + 'cc', lineHeight: 1.5 }}>{e}</div>
            </div>
          ))}
        </div>
        <div style={{ background: `${room.color}0c`, border: `1px solid ${room.color}30`, borderRadius: 12, padding: '18px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 14, color: room.color, marginBottom: 12 }}>Output</div>
            <div style={{ fontFamily: 'Lora, serif', fontSize: 13, color: C.cream + 'cc', lineHeight: 1.7, fontStyle: 'italic' }}>{room.output}</div>
          </div>
          <div style={{ marginTop: 16, borderTop: `1px solid ${room.color}20`, paddingTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.rise, boxShadow: `0 0 6px ${C.rise}` }} />
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.rise }}>Always Active</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function TheStudio() {
  const [view, setView] = useState('rooms');
  const [activeRoom, setActiveRoom] = useState('vault');
  const [activePhase, setActivePhase] = useState(null);

  const NAV = [
    { id: 'rooms',    label: 'The Four Rooms' },
    { id: 'workflow', label: 'GORUNFREE Workflow' },
    { id: 'build',    label: 'Build Plan' },
    { id: 'budget',   label: 'Hardware Budget' },
  ];

  const room = ROOMS.find(r => r.id === activeRoom);

  return (
    <div style={{ minHeight: '100vh', background: C.void, fontFamily: 'DM Sans, sans-serif', color: C.cream }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;600&family=IM+Fell+English:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #1e1a38; border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: '50px 40px 36px',
        borderBottom: `1px solid ${C.border}`,
        background: `linear-gradient(180deg, ${C.deep} 0%, ${C.void} 100%)`,
      }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: C.gold + '99', textTransform: 'uppercase', marginBottom: 10 }}>
          NOIZYFISH INC. · Physical Infrastructure · The Studio
        </div>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 48, color: C.cream, fontWeight: 700, marginBottom: 8, lineHeight: 1.0 }}>
          The Studio
        </div>
        <div style={{ fontFamily: 'IM Fell English, serif', fontSize: 20, color: C.gold, fontStyle: 'italic', marginBottom: 16 }}>
          The GORUNFREE Protocol Made Real.
        </div>
        <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + '80', lineHeight: 1.8, maxWidth: 680 }}>
          The infrastructure that enforces creator rights lives in code. But code runs on hardware. Hardware lives in rooms. These are the rooms where the 5th Epoch is built — one session at a time.
        </div>

        <div style={{ display: 'flex', gap: 14, marginTop: 24 }}>
          {[
            { n: '4', label: 'Rooms' },
            { n: '3', label: 'Build Phases' },
            { n: '5', label: 'GORUNFREE Steps' },
            { n: '1', label: 'Question: Does this close the gap?' },
          ].map((s, i) => (
            <div key={i} style={{ background: C.ghost, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 16px' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: C.gold, fontWeight: 700 }}>{s.n}</div>
              <div style={{ fontSize: 11, color: C.cream + '60', fontFamily: 'DM Sans, sans-serif', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Nav */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: C.void + 'f2',
        borderBottom: `1px solid ${C.border}`,
        padding: '0 40px',
        display: 'flex',
        backdropFilter: 'blur(16px)',
      }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setView(n.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '13px 18px', fontFamily: 'DM Sans, sans-serif', fontSize: 13,
            color: view === n.id ? C.gold : C.cream + '60',
            borderBottom: view === n.id ? `2px solid ${C.gold}` : '2px solid transparent',
            marginBottom: -1, transition: 'color 0.15s', letterSpacing: 0.4,
          }}>{n.label}</button>
        ))}
      </div>

      {/* Main */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '44px 40px 80px' }}>

        {/* ROOMS VIEW */}
        {view === 'rooms' && (
          <div>
            {/* Room tabs */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
              {ROOMS.map(r => (
                <button
                  key={r.id}
                  onClick={() => setActiveRoom(r.id)}
                  style={{
                    background: activeRoom === r.id ? r.color + '20' : C.card,
                    border: `1.5px solid ${activeRoom === r.id ? r.color : C.border}`,
                    borderRadius: 10,
                    padding: '12px 20px',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 10,
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: 20 }}>{r.icon}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: activeRoom === r.id ? r.color : C.cream + '80', fontWeight: 600 }}>Room {r.number}</div>
                    <div style={{ fontSize: 11, color: C.cream + '50', fontFamily: 'DM Sans, sans-serif' }}>{r.name}</div>
                  </div>
                </button>
              ))}
            </div>

            {room && <RoomDetail room={room} />}
          </div>
        )}

        {/* WORKFLOW VIEW */}
        {view === 'workflow' && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: C.cream, marginBottom: 6 }}>The GORUNFREE Workflow</div>
              <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + '70', fontStyle: 'italic' }}>
                35% voice. 65% AI. 1-click execution. From imagination to owned, watermarked, royalty-generating asset — in seconds.
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              {/* Connecting line */}
              <div style={{ position: 'absolute', left: 26, top: 44, bottom: 44, width: 2, background: `linear-gradient(180deg, ${C.amber}, ${C.gold}, ${C.cyan}, ${C.teal}, ${C.rise})`, zIndex: 0 }} />

              {GORUNFREE_WORKFLOW.map((step, i) => (
                <div key={step.step} style={{ display: 'flex', gap: 20, marginBottom: 20, position: 'relative', zIndex: 1 }}>
                  {/* Node */}
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                    background: step.color + '20',
                    border: `2px solid ${step.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22,
                    boxShadow: `0 0 12px ${step.color}30`,
                  }}>
                    {step.icon}
                  </div>

                  {/* Card */}
                  <div style={{
                    flex: 1,
                    background: C.card,
                    border: `1px solid ${step.color}30`,
                    borderRadius: 12,
                    padding: '18px 22px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: step.color + '80', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>Step {step.step}</div>
                        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: step.color, fontWeight: 600 }}>{step.label}</div>
                      </div>
                      <div style={{ background: step.color + '10', border: `1px solid ${step.color}30`, borderRadius: 6, padding: '4px 10px', fontSize: 11, color: step.color + '99', fontFamily: 'DM Sans, sans-serif' }}>
                        {step.system}
                      </div>
                    </div>
                    <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + 'cc', lineHeight: 1.7 }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* The output */}
            <div style={{
              background: `linear-gradient(135deg, ${C.gold}12 0%, transparent 100%)`,
              border: `1.5px solid ${C.gold}40`,
              borderRadius: 14,
              padding: '28px 32px',
              marginTop: 8,
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: C.gold, marginBottom: 12 }}>The Result</div>
              <div style={{ fontFamily: 'Lora, serif', fontSize: 15, color: C.cream, lineHeight: 1.8, maxWidth: 620, margin: '0 auto' }}>
                A complete, provenance-stamped, royalty-generating creative asset — produced from a single voice command. The gap between imagination and reality: zero. This is GORUNFREE made physical.
              </div>
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 24 }}>
                {[['Voice Command', '< 5 seconds'], ['GABRIEL Processing', '< 30 seconds'], ['NOIZY PROOF Stamp', '< 1 second'], ['Voice Estate Update', 'Instant']].map((s, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, color: C.gold, fontWeight: 600 }}>{s[1]}</div>
                    <div style={{ fontSize: 10, color: C.cream + '60', fontFamily: 'DM Sans, sans-serif', marginTop: 2 }}>{s[0]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BUILD PLAN VIEW */}
        {view === 'build' && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: C.cream, marginBottom: 6 }}>Three-Phase Build Plan</div>
              <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + '70', fontStyle: 'italic' }}>
                Physical infrastructure first. Technology stack second. GORUNFREE integration third. In that order.
              </div>
            </div>

            {PHASES.map((phase, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                <div
                  onClick={() => setActivePhase(activePhase === i ? null : i)}
                  style={{
                    background: activePhase === i ? phase.color + '12' : C.card,
                    border: `1.5px solid ${activePhase === i ? phase.color + '60' : C.border}`,
                    borderRadius: 12,
                    padding: '18px 24px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 8,
                        background: phase.color + '20',
                        border: `1.5px solid ${phase.color}60`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: phase.color,
                      }}>{phase.phase}</div>
                      <div>
                        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, color: phase.color, fontWeight: 600 }}>{phase.name}</div>
                        <div style={{ fontSize: 11, color: C.cream + '60', fontFamily: 'DM Sans, sans-serif' }}>{phase.timing}</div>
                      </div>
                    </div>
                    <span style={{ color: phase.color + '80', fontSize: 16 }}>{activePhase === i ? '−' : '+'}</span>
                  </div>

                  {activePhase === i && (
                    <div style={{ marginTop: 16 }}>
                      {phase.items.map((item, j) => (
                        <div key={j} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: phase.color, marginTop: 6, flexShrink: 0 }} />
                          <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.cream + 'cc', lineHeight: 1.5 }}>{item}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* GORUNFREE test */}
            <div style={{ background: C.ghost, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 24px', textAlign: 'center', marginTop: 8 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: C.gold, marginBottom: 10 }}>The GORUNFREE Test</div>
              <div style={{ fontFamily: 'Lora, serif', fontSize: 15, color: C.cream, lineHeight: 1.7, fontStyle: 'italic', maxWidth: 560, margin: '0 auto' }}>
                "Every tool in the NOIZY universe is tested against one question: does this close the gap between imagination and reality?"
              </div>
              <div style={{ marginTop: 14, fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.cream + '60' }}>
                Every build decision in these three phases answers yes — or it doesn't ship.
              </div>
            </div>
          </div>
        )}

        {/* BUDGET VIEW */}
        {view === 'budget' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: C.cream, marginBottom: 6 }}>Hardware & Construction Budget</div>
              <div style={{ fontFamily: 'Lora, serif', fontSize: 14, color: C.cream + '70', fontStyle: 'italic' }}>
                Ranges reflect world-class quality at each line item. The bottom of the range is "professional." The top is "permanent infrastructure."
              </div>
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px 100px', background: C.dim, padding: '12px 20px' }}>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.cream + '60', letterSpacing: 1, textTransform: 'uppercase' }}>Item</div>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.cream + '60', letterSpacing: 1, textTransform: 'uppercase', textAlign: 'right' }}>Estimate (CAD)</div>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.cream + '60', letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center' }}>Priority</div>
              </div>
              {HARDWARE_BUDGET.map((row, i) => (
                <div key={i} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 200px 100px',
                  padding: '12px 20px',
                  borderTop: `1px solid ${C.border}`,
                  background: i % 2 === 0 ? 'transparent' : C.ghost,
                  alignItems: 'center',
                }}>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.cream + 'cc' }}>{row.item}</div>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.gold, textAlign: 'right', fontWeight: 600 }}>{row.est}</div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{
                      fontSize: 9, fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
                      letterSpacing: 1, textTransform: 'uppercase',
                      color: row.priority === 'CRITICAL' ? '#E84444' : row.priority === 'HIGH' ? C.amber : C.teal,
                      background: (row.priority === 'CRITICAL' ? '#E84444' : row.priority === 'HIGH' ? C.amber : C.teal) + '18',
                      padding: '2px 7px', borderRadius: 3,
                    }}>{row.priority}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total range */}
            <div style={{
              background: `linear-gradient(135deg, ${C.gold}12 0%, transparent 100%)`,
              border: `1.5px solid ${C.gold}50`,
              borderRadius: 14,
              padding: '24px 28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.gold + '80', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Total Range (CAD)</div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: C.gold, fontWeight: 700 }}>$371,000 – $765,000</div>
                <div style={{ fontSize: 12, color: C.cream + '60', fontFamily: 'DM Sans, sans-serif', marginTop: 4 }}>Phase I (construction) is the largest single cost. Technology depreciates. Acoustic infrastructure does not.</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.teal, marginBottom: 6 }}>Potential Funding Sources</div>
                {['NRC IRAP (research lab)', 'FACTOR Canada', 'SR&ED Tax Credits', 'Series A Bridge'].map((f, i) => (
                  <div key={i} style={{ fontSize: 12, color: C.cream + '70', fontFamily: 'DM Sans, sans-serif', marginBottom: 3 }}>{f}</div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: '24px 40px', textAlign: 'center', background: C.deep }}>
        <div style={{ fontFamily: 'IM Fell English, serif', fontSize: 15, color: C.gold, fontStyle: 'italic', marginBottom: 6 }}>
          "Does this close the gap between imagination and reality?"
        </div>
        <div style={{ fontSize: 11, color: C.cream + '40', fontFamily: 'DM Sans, sans-serif', letterSpacing: 1 }}>
          THE STUDIO · NOIZYFISH INC. · MC96ECO UNIVERSE · OTTAWA · MARCH 2026
        </div>
      </div>
    </div>
  );
}
