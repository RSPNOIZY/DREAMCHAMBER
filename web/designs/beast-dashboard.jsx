import { useState } from "react";

const STATUS_COLORS = {
  LIVE: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)", text: "#22c55e" },
  WORKING_BUT_INTERNAL: { bg: "rgba(234,179,8,0.1)", border: "rgba(234,179,8,0.3)", text: "#eab308" },
  SPEC_ONLY: { bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.3)", text: "#9ca3af" },
  BLOCKED: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", text: "#ef4444" },
  STALLED: { bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.3)", text: "#f97316" },
  NEEDS_VERIFICATION: { bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.3)", text: "#8b5cf6" },
};

const RUNTIME_SYSTEMS = [
  { name: "consent-gateway", status: "SPEC_ONLY", next: "Deploy worker with D1 binding" },
  { name: "core_schema.sql", status: "LIVE", next: "Seed founding records to D1" },
  { name: "Heaven17 API", status: "LIVE", next: "Verify consent kernel parity" },
  { name: "DreamChamber", status: "WORKING_BUT_INTERNAL", next: "Wire mode switcher" },
  { name: "royalty-router", status: "SPEC_ONLY", next: "Scaffold worker" },
  { name: "proof-manifest", status: "SPEC_ONLY", next: "Scaffold C2PA integration" },
  { name: "R2 Storage", status: "BLOCKED", next: "Create R2 bucket on Cloudflare" },
  { name: "Domain Control", status: "STALLED", next: "GoDaddy Step 0: CF email change" },
];

const PROJECTS = [
  { name: "NOIZY.ai", status: "WORKING_BUT_INTERNAL", blocker: "Domain transfer", next: "Deploy landing page" },
  { name: "DreamChamber", status: "WORKING_BUT_INTERNAL", blocker: "API key", next: "Wire shell + mode switcher" },
  { name: "NOIZYVOX", status: "SPEC_ONLY", blocker: "consent-gateway", next: "Scaffold creator portal" },
  { name: "NOIZYLAB", status: "LIVE", blocker: null, next: "Consolidate under NOIZYBEAST" },
  { name: "NOIZYKIDZ", status: "SPEC_ONLY", blocker: "Core consent", next: "Define safe-mode consent" },
  { name: "LIFELUV", status: "SPEC_ONLY", blocker: "Core consent", next: "Define legacy consent" },
  { name: "FISH MUSIC", status: "SPEC_ONLY", blocker: "Royalty router", next: "Define music licensing" },
  { name: "Operator", status: "SPEC_ONLY", blocker: null, next: "Build this dashboard" },
];

const ALERTS = [
  { severity: "critical", message: "ANTHROPIC_API_KEY empty on GOD.local", action: "Set key at console.anthropic.com" },
  { severity: "critical", message: "GoDaddy exit Step 0 not started", action: "Change CF login email first" },
  { severity: "high", message: "R2 bucket not created for voice storage", action: "Create via Cloudflare dashboard" },
  { severity: "medium", message: "consent-gateway not deployed", action: "Run: beast build consent-gateway" },
];

const BEAST_COMMANDS = [
  { label: "Build", cmd: "beast build" },
  { label: "Audit", cmd: "beast audit runtime-truth" },
  { label: "Debug", cmd: "beast debug" },
  { label: "Verify", cmd: "beast verify all" },
  { label: "Scaffold Worker", cmd: "beast scaffold" },
  { label: "Scaffold App", cmd: "beast scaffold" },
];

function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.SPEC_ONLY;
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 12,
      backgroundColor: colors.bg,
      border: `1px solid ${colors.border}`,
      color: colors.text,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.02em",
    }}>
      {status}
    </span>
  );
}

function SeverityDot({ severity }) {
  const color = severity === "critical" ? "#ef4444" : severity === "high" ? "#f97316" : "#eab308";
  return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: color, marginRight: 8 }} />;
}

export default function BeastDashboard() {
  const daysRemaining = Math.ceil((new Date("2026-04-17") - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#050505", color: "#d4d4d4", fontFamily: "system-ui, -apple-system, sans-serif", padding: 24 }}>
      {/* Mission Band */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", padding: 20 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 8 }}>MISSION</div>
          <div style={{ fontSize: 15, fontWeight: 500, color: "#fff" }}>Ship NOIZYBEAST v0.1</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Consent-gateway + schema + shell + dashboard</div>
        </div>
        <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", padding: 20 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 8 }}>OWNER</div>
          <div style={{ fontSize: 15, fontWeight: 500, color: "#fff" }}>RSP_001</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Robert Stephen Plowman</div>
        </div>
        <div style={{ borderRadius: 16, border: "1px solid rgba(234,179,8,0.2)", padding: 20 }}>
          <div style={{ fontSize: 11, color: "#eab308", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 8 }}>DEADLINE</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#eab308" }}>{daysRemaining}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>days to April 17, 2026</div>
        </div>
        <div style={{ borderRadius: 16, border: "1px solid rgba(239,68,68,0.2)", padding: 20 }}>
          <div style={{ fontSize: 11, color: "#ef4444", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 8 }}>TOP BLOCKER</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#ef4444" }}>API Key Empty</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>ANTHROPIC_API_KEY on GOD.local</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Runtime Truth */}
        <section style={{ borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)", padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 16px", color: "#fff" }}>Runtime Truth</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {RUNTIME_SYSTEMS.map((sys) => (
              <div key={sys.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 12, backgroundColor: "rgba(255,255,255,0.02)" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{sys.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{sys.next}</div>
                </div>
                <StatusBadge status={sys.status} />
              </div>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section style={{ borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)", padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 16px", color: "#fff" }}>Projects</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PROJECTS.map((proj) => (
              <div key={proj.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 12, backgroundColor: "rgba(255,255,255,0.02)" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{proj.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                    {proj.blocker ? `Blocked: ${proj.blocker}` : proj.next}
                  </div>
                </div>
                <StatusBadge status={proj.status} />
              </div>
            ))}
          </div>
        </section>

        {/* Alerts */}
        <section style={{ borderRadius: 20, border: "1px solid rgba(239,68,68,0.15)", padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 16px", color: "#fff" }}>Alerts</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ALERTS.map((alert, i) => (
              <div key={i} style={{ padding: "12px 14px", borderRadius: 12, backgroundColor: "rgba(255,255,255,0.02)" }}>
                <div style={{ display: "flex", alignItems: "center", fontSize: 14 }}>
                  <SeverityDot severity={alert.severity} />
                  {alert.message}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4, paddingLeft: 16 }}>
                  Action: {alert.action}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Beast Command Launcher */}
        <section style={{ borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)", padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 16px", color: "#fff" }}>Beast Commands</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {BEAST_COMMANDS.map((bc) => (
              <button
                key={bc.label}
                style={{
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.03)",
                  color: "#e5e5e5",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div>{bc.label}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4, fontFamily: "monospace" }}>{bc.cmd}</div>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 20, padding: 16, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 8 }}>RECOMMENDED NEXT</div>
            <div style={{ fontSize: 14, fontFamily: "monospace" }}>beast build consent-gateway</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
              Deploy the policy enforcement worker — nothing moves without it
            </div>
          </div>
        </section>
      </div>

      {/* Operating Law */}
      <div style={{ marginTop: 24, padding: 20, borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", margin: 0, fontStyle: "italic" }}>
          If the system cannot prove consent, provenance, payout route, and revocation behavior, then it is not ready — no matter how beautiful the interface looks.
        </p>
      </div>
    </div>
  );
}
