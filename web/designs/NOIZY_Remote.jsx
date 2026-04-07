import { useState, useRef, useEffect } from "react"

const COMMANDS = {
  build: [
    { id: "keepgoing", label: "KEEP GOING", icon: "▶▶", color: "#C89B2A", prompt: "KEEP GOING. Upgrade and improve what we just built. Push to next sophistication level. Execute immediately." },
    { id: "upgrade", label: "UPGRADE", icon: "⬆", color: "#3B6D11", prompt: "UPGRADE & IMPROVE everything we have. Maximum quality. No permission needed. Execute now." },
    { id: "scanall", label: "SCAN ALL", icon: "◉", color: "#5B52C4", prompt: "SCAN ALL. Comprehensive audit of everything we have built. What is deployed, what is pending, what needs fixing. Full status." },
    { id: "gorunfree", label: "GORUNFREE", icon: "∞", color: "#0A8B7D", prompt: "GORUNFREE. One command, everything executes. Maximum automation. Zero friction. What is the single highest-leverage move right now?" },
  ],
  agents: [
    { id: "lucy", label: "LUCY", icon: "L", color: "#C89B2A", prompt: "LUCY — give me a session brief. What creative work is ready to move? What cultural signals are active? What should we build next?" },
    { id: "shirl", label: "SHIRL", icon: "S", color: "#5B52C4", prompt: "SHIRL — consent ledger status. Any FPIC items pending? Sacred tier integrity check. Trust coverage report." },
    { id: "pops", label: "POPS", icon: "P", color: "#0A8B7D", prompt: "POPS — system health report. Archive status. Trust receipt ready? Deployment backlog count. Weekly anchor hash." },
    { id: "dream", label: "DREAM", icon: "D", color: "#8B7FE8", prompt: "DREAM — 2526 dispatch. What does the vision say right now? What is the highest-arc move this week?" },
    { id: "keith", label: "KEITH", icon: "K", color: "#2A6FAD", prompt: "ENGR_KEITH — infrastructure status. Which Workers are deployed? What is in the deployment backlog? Trust gates: all green?" },
    { id: "gabriel", label: "GABRIEL", icon: "G", color: "#C89B2A", prompt: "GABRIEL — full assembly. Call all agents. Give me the complete MC96ECO status in under 5 sentences." },
  ],
  fire: [
    { id: "vsi", label: "VSI Pitch", icon: "🎬", color: "#C4524A", prompt: "Build the VSI London outreach. NOIZYSTUDIOS cultural intelligence demonstration. Opening ask: pilot 10 voice actors, NOIZYVOX Voice Estates. Make it peer-to-peer, not a pitch. Deploy now." },
    { id: "trustreceipt", label: "Trust Receipt", icon: "🧾", color: "#3B6D11", prompt: "Generate this week's NOIZY Trust Receipt. All metrics. Merkle hash anchor. Format for Slack #trust-receipts draft. POPS runs it." },
    { id: "eu", label: "EU AI Act Brief", icon: "⚖", color: "#5B52C4", prompt: "Generate the NOIZY PROOF EU AI Act compliance brief. August 2 2026 deadline. NOIZY already compliant. Format for external publish. One page. Facts only." },
    { id: "dreamer", label: "First Dreamer", icon: "✦", color: "#C89B2A", prompt: "Build the NOIZYVOX onboarding flow for the first Dreamer. Voice Estate registration. SHIRL consent capture. GABRIEL issues the ID. Make it feel like the cathedral it is." },
    { id: "sprint", label: "Sprint Status", icon: "⚡", color: "#0A8B7D", prompt: "30-day sprint status. What is complete, what is deployed, what is pending. Honest assessment. No theater. Next three moves in priority order." },
    { id: "canada", label: "Canada Library", icon: "🍁", color: "#C4524A", prompt: "Great Canadian Sound Library status. FACTOR grant application. LAC partnership. Ādisōke launch target. What moves this week?" },
  ],
  voice: [
    { id: "assemble", label: "ASSEMBLE", icon: "◈", color: "#C89B2A", prompt: "Call the full MC96ECO assembly. All seven voices. DreamChamber. GABRIEL opens and closes. Give me the bash script to run on GOD right now." },
    { id: "hvs", label: "HVS Status", icon: "◉", color: "#8B7FE8", prompt: "Human Voice Signature status report. Voice Estates issued. Guild progress. Five Epoch position. What is the next civilizational move?" },
    { id: "museum", label: "The Line", icon: "∞", color: "#C89B2A", prompt: "Say the museum sentence. Then tell me the one thing we build next that makes it more true." },
  ]
}

const TABS = ["BUILD", "AGENTS", "FIRE", "VOICE"]

const speak = (text) => {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.rate = 0.88; u.pitch = 0.9
  window.speechSynthesis.speak(u)
}

export default function Remote() {
  const [tab, setTab] = useState(0)
  const [last, setLast] = useState(null)
  const [fired, setFired] = useState(null)
  const [listening, setListening] = useState(false)
  const [voiceText, setVoiceText] = useState("")
  const recRef = useRef(null)

  const fire = (cmd) => {
    setFired(cmd.id)
    setLast(cmd)
    sendPrompt(cmd.prompt)
    speak(cmd.label)
    setTimeout(() => setFired(null), 1200)
  }

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setVoiceText("Voice not supported in this browser"); return }
    const rec = new SR()
    rec.continuous = false
    rec.interimResults = true
    rec.lang = "en-CA"
    rec.onstart = () => setListening(true)
    rec.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join("")
      setVoiceText(t)
      if (e.results[e.results.length-1].isFinal) {
        setListening(false)
        sendPrompt(t)
      }
    }
    rec.onerror = () => setListening(false)
    rec.onend = () => setListening(false)
    recRef.current = rec
    rec.start()
  }

  const stopVoice = () => {
    recRef.current?.stop()
    setListening(false)
  }

  const currentCmds = COMMANDS[Object.keys(COMMANDS)[tab]]

  return (
    <div style={{ fontFamily: "var(--font-sans)", maxWidth: 480, padding: "0.5rem 0" }}>
      <style>{`
        @keyframes pressanim { 0%{transform:scale(1)} 50%{transform:scale(0.94)} 100%{transform:scale(1)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, paddingBottom: 10, borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "var(--color-text-tertiary)", marginBottom: 2 }}>
            MC96ECO · GABRIEL · CLAUDE MAX
          </div>
          <div style={{ fontSize: 17, fontWeight: 500, color: "var(--color-text-primary)" }}>
            NOIZY Dispatch Remote
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#3B6D11" }} />
          <div style={{ fontSize: 10, color: "#3B6D11", fontFamily: "var(--font-mono)" }}>LIVE</div>
        </div>
      </div>

      {/* Voice button — BIG — iPhone first */}
      <button
        onClick={listening ? stopVoice : startVoice}
        style={{
          width: "100%", padding: "16px",
          borderRadius: 14, marginBottom: 12,
          border: `2px solid ${listening ? "#C4524A" : "#C89B2A"}`,
          background: listening ? "#FCEBEB" : "#faeeda",
          color: listening ? "#A32D2D" : "#633806",
          fontSize: 15, fontWeight: 600, cursor: "pointer",
          letterSpacing: 0.5,
          animation: listening ? "pulse 1s infinite" : "none",
        }}
      >
        {listening ? "● LISTENING — tap to send" : "🎤  SPEAK TO GABRIEL"}
      </button>

      {voiceText && (
        <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "8px 12px", marginBottom: 10, fontSize: 12, color: "var(--color-text-secondary)", fontStyle: "italic", lineHeight: 1.5 }}>
          "{voiceText}"
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{
            flex: 1, padding: "7px 4px", fontSize: 10, fontWeight: 600,
            letterSpacing: 1, borderRadius: 8, cursor: "pointer",
            border: `0.5px solid ${tab === i ? "#C89B2A" : "var(--color-border-secondary)"}`,
            background: tab === i ? "#faeeda" : "transparent",
            color: tab === i ? "#633806" : "var(--color-text-tertiary)",
          }}>{t}</button>
        ))}
      </div>

      {/* Command grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 12 }}>
        {currentCmds.map(cmd => (
          <button
            key={cmd.id}
            onClick={() => fire(cmd)}
            style={{
              padding: "14px 12px", borderRadius: 12, cursor: "pointer",
              border: `1.5px solid ${fired === cmd.id ? cmd.color : cmd.color + "55"}`,
              background: fired === cmd.id ? cmd.color + "22" : "var(--color-background-primary)",
              display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 5,
              animation: fired === cmd.id ? "pressanim 0.3s ease" : "none",
              transition: "border-color 0.15s, background 0.15s",
              textAlign: "left",
            }}
          >
            <div style={{ fontSize: 20, lineHeight: 1 }}>{cmd.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: cmd.color, letterSpacing: 0.3 }}>{cmd.label}</div>
          </button>
        ))}
      </div>

      {/* Last fired */}
      {last && (
        <div style={{
          background: "var(--color-background-secondary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderLeft: `3px solid ${last.color}`,
          borderRadius: 8, padding: "8px 12px",
          fontSize: 11, color: "var(--color-text-tertiary)",
          fontFamily: "var(--font-mono)",
        }}>
          Last: {last.label} → dispatched to GABRIEL ↗
        </div>
      )}

      {/* Quick text input */}
      <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
        <input
          id="quick-input"
          placeholder="Type any command → GABRIEL"
          style={{
            flex: 1, padding: "10px 12px", fontSize: 12, borderRadius: 8,
            border: "0.5px solid var(--color-border-secondary)",
            background: "var(--color-background-secondary)",
            color: "var(--color-text-primary)", fontFamily: "var(--font-sans)",
          }}
          onKeyDown={e => {
            if (e.key === "Enter" && e.target.value.trim()) {
              sendPrompt(e.target.value.trim())
              speak(e.target.value.trim())
              setLast({ label: e.target.value.trim(), color: "#C89B2A" })
              e.target.value = ""
            }
          }}
        />
        <button
          onClick={() => {
            const el = document.getElementById("quick-input")
            if (el?.value.trim()) {
              sendPrompt(el.value.trim())
              speak(el.value.trim())
              setLast({ label: el.value.trim(), color: "#C89B2A" })
              el.value = ""
            }
          }}
          style={{
            padding: "10px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
            border: "1px solid #C89B2A", background: "#faeeda", color: "#633806", cursor: "pointer",
          }}
        >↗</button>
      </div>

      <div style={{ marginTop: 10, fontSize: 9, color: "var(--color-text-tertiary)", textAlign: "center", letterSpacing: 1 }}>
        GORUNFREE · FISH MUSIC INC. · OTTAWA · RSP_001
      </div>
    </div>
  )
}
