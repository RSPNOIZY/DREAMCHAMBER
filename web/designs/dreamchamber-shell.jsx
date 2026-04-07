import { useState } from "react";

const MODES = ["Creator", "Studio", "Investor", "Operator"];

const NAV_ITEMS = ["Home", "Creator", "Studio", "Investor", "Operator", "Registry", "Audit", "Settings"];

const SYSTEM_ENGINES = [
  { name: "Consent Engine", status: "WORKING_BUT_INTERNAL", detail: "Heaven17 live, gateway spec" },
  { name: "Provenance Engine", status: "SPEC_ONLY", detail: "C2PA integration designed" },
  { name: "Royalty Engine", status: "SPEC_ONLY", detail: "75/25 split defined, router not built" },
  { name: "Revocation Engine", status: "WORKING_BUT_INTERNAL", detail: "Kill Switch designed" },
  { name: "Storage Layer", status: "BLOCKED", detail: "R2 bucket not created" },
  { name: "Domain Control", status: "STALLED", detail: "GoDaddy exit Step 0 pending" },
];

const STATUS_COLORS = {
  LIVE: "#22c55e",
  WORKING_BUT_INTERNAL: "#eab308",
  SPEC_ONLY: "#6b7280",
  BLOCKED: "#ef4444",
  STALLED: "#f97316",
  NEEDS_VERIFICATION: "#8b5cf6",
};

const QUICK_ACTIONS = ["Build", "Audit", "Debug", "Verify", "Open Claude Task", "Export Status"];

function StatusDot({ status }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: STATUS_COLORS[status] || "#6b7280",
        marginRight: 8,
      }}
    />
  );
}

export default function DreamChamberShell() {
  const [activeNav, setActiveNav] = useState("Home");
  const [activeMode, setActiveMode] = useState("Creator");

  const daysRemaining = Math.ceil((new Date("2026-04-17") - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", color: "#e5e5e5", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "16px 24px" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0, letterSpacing: "-0.02em" }}>DreamChamber</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "4px 0 0" }}>NOIZYBEAST v0.1 control shell</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", gap: 4 }}>
            {MODES.map((mode) => (
              <button
                key={mode}
                onClick={() => setActiveMode(mode)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: activeMode === mode ? "1px solid rgba(255,255,255,0.3)" : "1px solid rgba(255,255,255,0.08)",
                  background: activeMode === mode ? "rgba(255,255,255,0.08)" : "transparent",
                  color: activeMode === mode ? "#fff" : "rgba(255,255,255,0.5)",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {mode}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 13, color: "#eab308", fontWeight: 600 }}>
            {daysRemaining}d to April 17
          </div>
        </div>
      </header>

      {/* Body */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 300px", minHeight: "calc(100vh - 65px)" }}>
        {/* Left Nav */}
        <aside style={{ borderRight: "1px solid rgba(255,255,255,0.08)", padding: 16 }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {NAV_ITEMS.map((item) => (
              <button
                key={item}
                onClick={() => setActiveNav(item)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "none",
                  background: activeNav === item ? "rgba(255,255,255,0.06)" : "transparent",
                  color: activeNav === item ? "#fff" : "rgba(255,255,255,0.5)",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        {/* Center Canvas */}
        <main style={{ padding: 24, overflow: "auto" }}>
          {/* System Truth */}
          <section style={{ borderRadius: 24, border: "1px solid rgba(255,255,255,0.08)", padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 500, margin: "0 0 16px" }}>System Truth</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {SYSTEM_ENGINES.map((engine) => (
                <div key={engine.name} style={{ borderRadius: 16, backgroundColor: "rgba(255,255,255,0.03)", padding: 16 }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>{engine.name}</div>
                  <div style={{ display: "flex", alignItems: "center", fontSize: 14, fontWeight: 500 }}>
                    <StatusDot status={engine.status} />
                    {engine.status}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>{engine.detail}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Current Mission */}
          <section style={{ borderRadius: 24, border: "1px solid rgba(255,255,255,0.08)", padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 500, margin: "0 0 12px" }}>Current Mission</h2>
            <p style={{ color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.6 }}>
              Ship NOIZYBEAST v0.1 — consent-gateway, core schema, DreamChamber shell, Beast dashboard.
              If the system cannot prove consent, provenance, payout route, and revocation behavior,
              then it is not ready.
            </p>
          </section>

          {/* Quick Actions */}
          <section style={{ borderRadius: 24, border: "1px solid rgba(255,255,255,0.08)", padding: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 500, margin: "0 0 16px" }}>Quick Actions</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 20,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "transparent",
                    color: "#e5e5e5",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {action}
                </button>
              ))}
            </div>
          </section>
        </main>

        {/* Right Rail — Truth */}
        <aside style={{ borderLeft: "1px solid rgba(255,255,255,0.08)", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ borderRadius: 16, backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", padding: 16 }}>
            <div style={{ fontSize: 12, color: "#ef4444", fontWeight: 600, marginBottom: 6 }}>TOP BLOCKER</div>
            <div style={{ fontSize: 14 }}>ANTHROPIC_API_KEY empty on GOD.local</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>Blocks GABRIEL speak() and all Claude API calls</div>
          </div>

          <div style={{ borderRadius: 16, backgroundColor: "rgba(255,255,255,0.03)", padding: 16 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>CURRENT MODE</div>
            <div style={{ fontSize: 16, fontWeight: 500 }}>{activeMode}</div>
          </div>

          <div style={{ borderRadius: 16, backgroundColor: "rgba(255,255,255,0.03)", padding: 16 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>HEAVEN17</div>
            <div style={{ display: "flex", alignItems: "center", fontSize: 14 }}>
              <StatusDot status="LIVE" />
              LIVE — 55 endpoints
            </div>
          </div>

          <div style={{ borderRadius: 16, backgroundColor: "rgba(255,255,255,0.03)", padding: 16 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>DREAMCHAMBER</div>
            <div style={{ display: "flex", alignItems: "center", fontSize: 14 }}>
              <StatusDot status="WORKING_BUT_INTERNAL" />
              Port 7777 — 7 providers
            </div>
          </div>

          <div style={{ borderRadius: 16, backgroundColor: "rgba(255,255,255,0.03)", padding: 16 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>VOICE PIPELINE</div>
            <div style={{ display: "flex", alignItems: "center", fontSize: 14 }}>
              <StatusDot status="WORKING_BUT_INTERNAL" />
              Whisper + Audio Hijack
            </div>
          </div>

          <div style={{ borderRadius: 16, backgroundColor: "rgba(255,255,255,0.03)", padding: 16 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>AGENTS</div>
            <div style={{ fontSize: 13, lineHeight: 1.8 }}>
              GABRIEL — online<br />
              LUCY — online<br />
              SHIRLEY — Gemma 3 local<br />
              ENGR_KEITH — standby<br />
              CB01 — standby
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
