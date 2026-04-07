/**
 * HEAVEN Health & Status Dashboard
 *
 * Comprehensive health monitoring endpoint for Heaven.
 * Serves HTML dashboard (Accept: text/html) or JSON (Accept: application/json)
 *
 * Routes:
 *   GET /dashboard — Full visual dashboard with real-time metrics
 *   GET /status    — Minimal JSON for monitoring systems
 *
 * Public endpoints — no auth required for transparency.
 */

import { calculateBudget, DEFAULT_SLOS } from "../error-budget.js";

// ─── Constants ────────────────────────────────────────────────────────────────

const HEAVEN_VERSION = "17.9.0";
const DEPLOY_TIMESTAMP = "2026-04-07T12:00:00Z"; // Updated on each deploy

// Health thresholds
const THRESHOLDS = {
  dbLatencyGreen: 50, // ms
  dbLatencyYellow: 200, // ms
  errorRateGreen: 0.1, // %
  errorRateYellow: 1.0, // %
  errorBudgetGreen: 50, // %
  errorBudgetYellow: 20, // %
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function now() {
  return new Date().toISOString().replace("T", " ").substring(0, 19);
}

function getHealthIndicator(value, greenThreshold, yellowThreshold, inverse = false) {
  if (inverse) {
    // Higher is better (e.g., error budget remaining)
    if (value >= greenThreshold) return "green";
    if (value >= yellowThreshold) return "yellow";
    return "red";
  }
  // Lower is better (e.g., latency, error rate)
  if (value <= greenThreshold) return "green";
  if (value <= yellowThreshold) return "yellow";
  return "red";
}

function formatUptime(deployTimestamp) {
  const deployed = new Date(deployTimestamp);
  const now = new Date();
  const diffMs = now - deployed;
  const days = Math.floor(diffMs / 86400000);
  const hours = Math.floor((diffMs % 86400000) / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  return `${days}d ${hours}h ${minutes}m`;
}

function getDaysToDeadline() {
  const deadline = new Date("2026-04-17T23:59:59Z");
  const now = new Date();
  return Math.ceil((deadline - now) / 86400000);
}

// ─── Data Collection ──────────────────────────────────────────────────────────

async function collectHealthMetrics(env) {
  const db = env.GABRIEL_DB;
  const kv = env.GABRIEL_KV;

  const metrics = {
    version: env.NOIZY_VERSION || HEAVEN_VERSION,
    environment: env.NOIZY_ENV || "production",
    deployTimestamp: DEPLOY_TIMESTAMP,
    uptime: formatUptime(DEPLOY_TIMESTAMP),
    daysToDeadline: getDaysToDeadline(),
    timestamp: now(),
    checks: {},
  };

  // D1 Database connectivity and latency
  const dbStart = Date.now();
  try {
    const actorCount = await db.prepare("SELECT COUNT(*) as c FROM hvs_actors").first();
    metrics.checks.database = {
      status: "connected",
      latencyMs: Date.now() - dbStart,
      health: getHealthIndicator(
        Date.now() - dbStart,
        THRESHOLDS.dbLatencyGreen,
        THRESHOLDS.dbLatencyYellow,
      ),
    };
    metrics.actors = actorCount?.c || 0;
  } catch (e) {
    metrics.checks.database = {
      status: "error",
      error: e.message,
      latencyMs: Date.now() - dbStart,
      health: "red",
    };
  }

  // KV connectivity
  const kvStart = Date.now();
  try {
    if (kv) {
      await kv.get("health_check_probe");
      metrics.checks.kv = {
        status: "connected",
        latencyMs: Date.now() - kvStart,
        health: getHealthIndicator(
          Date.now() - kvStart,
          THRESHOLDS.dbLatencyGreen,
          THRESHOLDS.dbLatencyYellow,
        ),
      };
    } else {
      metrics.checks.kv = {
        status: "not_bound",
        health: "yellow",
      };
    }
  } catch (e) {
    metrics.checks.kv = {
      status: "error",
      error: e.message,
      latencyMs: Date.now() - kvStart,
      health: "red",
    };
  }

  // Collect counts from database
  try {
    const [
      tokenCount,
      activeTokens,
      descendants,
      synthTotal,
      synthBlocked,
      ledgerCount,
      neverClauseViolations,
      recentErrors,
      totalRequests,
    ] = await Promise.all([
      db.prepare("SELECT COUNT(*) as c FROM hvs_consent_tokens").first(),
      db.prepare("SELECT COUNT(*) as c FROM hvs_consent_tokens WHERE status = 'active'").first(),
      db.prepare("SELECT COUNT(*) as c FROM hvs_descendants").first(),
      db.prepare("SELECT COUNT(*) as c FROM hvs_synth_requests").first(),
      db.prepare("SELECT COUNT(*) as c FROM hvs_synth_requests WHERE status = 'blocked'").first(),
      db.prepare("SELECT COUNT(*) as c FROM noizy_ledger").first(),
      db
        .prepare(
          "SELECT COUNT(*) as c FROM noizy_ledger WHERE event_type = 'never_clause.blocked'",
        )
        .first(),
      db
        .prepare(
          `SELECT COUNT(*) as c FROM noizy_ledger
           WHERE event_type LIKE '%error%'
           AND recorded_at > datetime('now', '-1 hour')`,
        )
        .first(),
      db
        .prepare(
          `SELECT COUNT(*) as c FROM noizy_ledger
           WHERE recorded_at > datetime('now', '-1 hour')`,
        )
        .first(),
    ]);

    metrics.consentTokens = {
      total: tokenCount?.c || 0,
      active: activeTokens?.c || 0,
    };
    metrics.descendants = descendants?.c || 0;
    metrics.synthRequests = {
      total: synthTotal?.c || 0,
      blocked: synthBlocked?.c || 0,
    };
    metrics.ledgerEvents = ledgerCount?.c || 0;
    metrics.neverClauseViolations = neverClauseViolations?.c || 0;

    // Calculate error rate (last hour)
    const totalReqs = totalRequests?.c || 0;
    const errorReqs = recentErrors?.c || 0;
    const errorRate = totalReqs > 0 ? (errorReqs / totalReqs) * 100 : 0;
    metrics.errorRate = {
      percent: errorRate.toFixed(2),
      health: getHealthIndicator(errorRate, THRESHOLDS.errorRateGreen, THRESHOLDS.errorRateYellow),
    };

    // Calculate error budget
    const budget = calculateBudget(totalReqs || 1000, errorReqs, DEFAULT_SLOS.heaven_api);
    const budgetRemaining = 100 - parseFloat(budget.consumedPercent);
    metrics.errorBudget = {
      slo: budget.sloPercent,
      consumed: budget.consumedPercent,
      remaining: budgetRemaining.toFixed(1) + "%",
      canDeploy: budget.canDeploy,
      health: getHealthIndicator(
        budgetRemaining,
        THRESHOLDS.errorBudgetGreen,
        THRESHOLDS.errorBudgetYellow,
        true,
      ),
    };
  } catch (e) {
    metrics.error = e.message;
  }

  // Never Clause check - should always be 0
  metrics.checks.neverClause = {
    violations: metrics.neverClauseViolations || 0,
    status: metrics.neverClauseViolations === 0 ? "SACRED" : "VIOLATED",
    health: metrics.neverClauseViolations === 0 ? "green" : "red",
  };

  // Overall health
  const healthChecks = Object.values(metrics.checks);
  const hasRed = healthChecks.some((c) => c.health === "red");
  const hasYellow = healthChecks.some((c) => c.health === "yellow");
  metrics.overallHealth = hasRed ? "red" : hasYellow ? "yellow" : "green";
  metrics.status = hasRed ? "DEGRADED" : hasYellow ? "WARNING" : "LIVE";

  return metrics;
}

// ─── JSON Response ────────────────────────────────────────────────────────────

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
      "X-Powered-By": "HEAVEN/RSP_001",
    },
  });
}

// ─── HTML Dashboard ───────────────────────────────────────────────────────────

function generateDashboardHTML(metrics) {
  const healthColors = {
    green: "#00ff88",
    yellow: "#ffaa00",
    red: "#e94560",
  };

  const statusIcon = {
    green: "&#10004;", // checkmark
    yellow: "&#9888;", // warning
    red: "&#10006;", // X
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="30">
  <title>HEAVEN Status Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
      background: linear-gradient(135deg, #0a0a0f 0%, #0d0d14 50%, #0a0f1a 100%);
      color: #e0e0e0;
      min-height: 100vh;
      overflow-x: hidden;
    }

    /* Animated background grid */
    body::before {
      content: '';
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image:
        linear-gradient(rgba(233, 69, 96, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(233, 69, 96, 0.03) 1px, transparent 1px);
      background-size: 50px 50px;
      pointer-events: none;
      z-index: -1;
    }

    .header {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      padding: 2rem;
      text-align: center;
      border-bottom: 2px solid #e94560;
      position: relative;
      overflow: hidden;
    }

    .header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #e94560, #00ff88, #e94560, transparent);
      animation: pulse-line 3s ease-in-out infinite;
    }

    @keyframes pulse-line {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }

    .header h1 {
      font-size: 2.5rem;
      color: #fff;
      letter-spacing: 0.4em;
      text-shadow: 0 0 20px rgba(233, 69, 96, 0.5);
    }

    .header .subtitle {
      color: #e94560;
      font-size: 0.8rem;
      margin-top: 0.5rem;
      letter-spacing: 0.2em;
    }

    .status-banner {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 8px;
      display: inline-flex;
    }

    .status-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      animation: pulse 2s ease-in-out infinite;
    }

    .status-indicator.green { background: #00ff88; box-shadow: 0 0 10px #00ff88; }
    .status-indicator.yellow { background: #ffaa00; box-shadow: 0 0 10px #ffaa00; }
    .status-indicator.red { background: #e94560; box-shadow: 0 0 10px #e94560; }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.2); opacity: 0.7; }
    }

    .status-text {
      font-size: 1.2rem;
      font-weight: 700;
      color: ${healthColors[metrics.overallHealth]};
    }

    .countdown {
      background: rgba(233, 69, 96, 0.1);
      border: 1px solid #e94560;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      margin-top: 1rem;
      display: inline-block;
    }

    .countdown span {
      color: #e94560;
      font-weight: 700;
      font-size: 1.2rem;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .card {
      background: rgba(18, 18, 26, 0.8);
      border: 1px solid #222;
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, transparent, var(--card-accent, #e94560), transparent);
      opacity: 0;
      transition: opacity 0.3s;
    }

    .card:hover {
      border-color: var(--card-accent, #e94560);
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .card:hover::before {
      opacity: 1;
    }

    .card.green { --card-accent: #00ff88; }
    .card.yellow { --card-accent: #ffaa00; }
    .card.red { --card-accent: #e94560; }

    .card .label {
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #666;
      margin-bottom: 0.5rem;
    }

    .card .value {
      font-size: 2rem;
      font-weight: 700;
      color: #fff;
    }

    .card .value.green { color: #00ff88; }
    .card .value.yellow { color: #ffaa00; }
    .card .value.red { color: #e94560; }

    .card .sub {
      font-size: 0.75rem;
      color: #666;
      margin-top: 0.25rem;
    }

    .card .health-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
    }

    .health-badge.green { background: rgba(0, 255, 136, 0.2); color: #00ff88; }
    .health-badge.yellow { background: rgba(255, 170, 0, 0.2); color: #ffaa00; }
    .health-badge.red { background: rgba(233, 69, 96, 0.2); color: #e94560; }

    .section {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem 2rem;
    }

    .section h2 {
      font-size: 0.9rem;
      color: #e94560;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #222;
    }

    .checks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .check-item {
      background: rgba(18, 18, 26, 0.6);
      border: 1px solid #1a1a1a;
      border-radius: 8px;
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .check-item .icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }

    .check-item .icon.green { background: rgba(0, 255, 136, 0.15); color: #00ff88; }
    .check-item .icon.yellow { background: rgba(255, 170, 0, 0.15); color: #ffaa00; }
    .check-item .icon.red { background: rgba(233, 69, 96, 0.15); color: #e94560; }

    .check-item .details {
      flex: 1;
    }

    .check-item .name {
      font-weight: 600;
      font-size: 0.85rem;
    }

    .check-item .status {
      font-size: 0.7rem;
      color: #666;
    }

    .footer {
      text-align: center;
      padding: 2rem;
      color: #333;
      font-size: 0.7rem;
      letter-spacing: 0.1em;
      border-top: 1px solid #1a1a1a;
      margin-top: 2rem;
    }

    .footer a {
      color: #e94560;
      text-decoration: none;
      transition: color 0.2s;
    }

    .footer a:hover {
      color: #00ff88;
    }

    .auto-refresh {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
      color: #444;
    }

    .auto-refresh .dot {
      width: 6px;
      height: 6px;
      background: #00ff88;
      border-radius: 50%;
      animation: blink 1s infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .header h1 { font-size: 1.5rem; letter-spacing: 0.2em; }
      .grid { grid-template-columns: 1fr; padding: 1rem; }
      .section { padding: 0 1rem 1rem; }
      .card .value { font-size: 1.5rem; }
    }
  </style>
</head>
<body>

<div class="header">
  <h1>HEAVEN</h1>
  <div class="subtitle">HEALTH &amp; STATUS DASHBOARD</div>

  <div class="status-banner">
    <div class="status-indicator ${metrics.overallHealth}"></div>
    <div class="status-text">${metrics.status}</div>
  </div>

  <div class="countdown">
    <span>${metrics.daysToDeadline}</span> days to April 17, 2026
  </div>
</div>

<div class="grid">
  <div class="card ${metrics.checks.database?.health || "red"}">
    <div class="label">Worker Version</div>
    <div class="value">${metrics.version}</div>
    <div class="sub">Environment: ${metrics.environment}</div>
    <div class="health-badge ${metrics.checks.database?.health || "red"}">${statusIcon[metrics.checks.database?.health || "red"]}</div>
  </div>

  <div class="card ${metrics.checks.database?.health || "red"}">
    <div class="label">D1 Database Latency</div>
    <div class="value ${metrics.checks.database?.health || "red"}">${metrics.checks.database?.latencyMs || "N/A"}ms</div>
    <div class="sub">Status: ${metrics.checks.database?.status || "unknown"}</div>
    <div class="health-badge ${metrics.checks.database?.health || "red"}">${statusIcon[metrics.checks.database?.health || "red"]}</div>
  </div>

  <div class="card ${metrics.checks.kv?.health || "yellow"}">
    <div class="label">KV Namespace</div>
    <div class="value ${metrics.checks.kv?.health || "yellow"}">${metrics.checks.kv?.latencyMs ? metrics.checks.kv.latencyMs + "ms" : metrics.checks.kv?.status || "N/A"}</div>
    <div class="sub">GABRIEL_KV binding</div>
    <div class="health-badge ${metrics.checks.kv?.health || "yellow"}">${statusIcon[metrics.checks.kv?.health || "yellow"]}</div>
  </div>

  <div class="card ${metrics.errorBudget?.health || "green"}">
    <div class="label">Error Budget Remaining</div>
    <div class="value ${metrics.errorBudget?.health || "green"}">${metrics.errorBudget?.remaining || "100%"}</div>
    <div class="sub">SLO: ${metrics.errorBudget?.slo || "99.9%"} | Can Deploy: ${metrics.errorBudget?.canDeploy ? "YES" : "NO"}</div>
    <div class="health-badge ${metrics.errorBudget?.health || "green"}">${statusIcon[metrics.errorBudget?.health || "green"]}</div>
  </div>

  <div class="card ${metrics.errorRate?.health || "green"}">
    <div class="label">Error Rate (1h)</div>
    <div class="value ${metrics.errorRate?.health || "green"}">${metrics.errorRate?.percent || "0.00"}%</div>
    <div class="sub">Last hour request errors</div>
    <div class="health-badge ${metrics.errorRate?.health || "green"}">${statusIcon[metrics.errorRate?.health || "green"]}</div>
  </div>

  <div class="card green">
    <div class="label">Active Consent Tokens</div>
    <div class="value">${metrics.consentTokens?.active || 0}</div>
    <div class="sub">Total issued: ${metrics.consentTokens?.total || 0}</div>
    <div class="health-badge green">${statusIcon.green}</div>
  </div>

  <div class="card ${metrics.checks.neverClause?.health || "green"}">
    <div class="label">Never Clause Violations</div>
    <div class="value ${metrics.checks.neverClause?.health || "green"}">${metrics.neverClauseViolations || 0}</div>
    <div class="sub">Status: ${metrics.checks.neverClause?.status || "SACRED"}</div>
    <div class="health-badge ${metrics.checks.neverClause?.health || "green"}">${statusIcon[metrics.checks.neverClause?.health || "green"]}</div>
  </div>

  <div class="card green">
    <div class="label">Uptime</div>
    <div class="value" style="font-size: 1.5rem;">${metrics.uptime}</div>
    <div class="sub">Since: ${metrics.deployTimestamp}</div>
    <div class="health-badge green">${statusIcon.green}</div>
  </div>

  <div class="card green">
    <div class="label">Ledger Events</div>
    <div class="value">${metrics.ledgerEvents || 0}</div>
    <div class="sub">Append-only audit trail</div>
    <div class="health-badge green">${statusIcon.green}</div>
  </div>

  <div class="card green">
    <div class="label">Actors</div>
    <div class="value">${metrics.actors || 0}</div>
    <div class="sub">Registered voice actors</div>
    <div class="health-badge green">${statusIcon.green}</div>
  </div>

  <div class="card green">
    <div class="label">Descendants</div>
    <div class="value">${metrics.descendants || 0}</div>
    <div class="sub">Synthetic voice models</div>
    <div class="health-badge green">${statusIcon.green}</div>
  </div>

  <div class="card ${(metrics.synthRequests?.blocked || 0) > 0 ? "yellow" : "green"}">
    <div class="label">Synth Requests</div>
    <div class="value">${metrics.synthRequests?.total || 0}</div>
    <div class="sub">Blocked: ${metrics.synthRequests?.blocked || 0}</div>
    <div class="health-badge ${(metrics.synthRequests?.blocked || 0) > 0 ? "yellow" : "green"}">${statusIcon[(metrics.synthRequests?.blocked || 0) > 0 ? "yellow" : "green"]}</div>
  </div>
</div>

<div class="section">
  <h2>System Checks</h2>
  <div class="checks-grid">
    <div class="check-item">
      <div class="icon ${metrics.checks.database?.health || "red"}">${statusIcon[metrics.checks.database?.health || "red"]}</div>
      <div class="details">
        <div class="name">D1 Database (gabriel_db)</div>
        <div class="status">${metrics.checks.database?.status || "unknown"} - ${metrics.checks.database?.latencyMs || 0}ms</div>
      </div>
    </div>

    <div class="check-item">
      <div class="icon ${metrics.checks.kv?.health || "yellow"}">${statusIcon[metrics.checks.kv?.health || "yellow"]}</div>
      <div class="details">
        <div class="name">KV Namespace (GABRIEL_KV)</div>
        <div class="status">${metrics.checks.kv?.status || "unknown"}</div>
      </div>
    </div>

    <div class="check-item">
      <div class="icon ${metrics.checks.neverClause?.health || "green"}">${statusIcon[metrics.checks.neverClause?.health || "green"]}</div>
      <div class="details">
        <div class="name">Never Clause Enforcement</div>
        <div class="status">${metrics.checks.neverClause?.status || "SACRED"} - ${metrics.neverClauseViolations || 0} violations</div>
      </div>
    </div>

    <div class="check-item">
      <div class="icon ${metrics.errorBudget?.canDeploy ? "green" : "red"}">${statusIcon[metrics.errorBudget?.canDeploy ? "green" : "red"]}</div>
      <div class="details">
        <div class="name">Deployment Status</div>
        <div class="status">${metrics.errorBudget?.canDeploy ? "Deployments Allowed" : "FROZEN - Budget Exhausted"}</div>
      </div>
    </div>
  </div>
</div>

<div class="section">
  <h2>Mission</h2>
  <div style="background: rgba(233, 69, 96, 0.05); border: 1px solid rgba(233, 69, 96, 0.2); border-radius: 8px; padding: 1.5rem; text-align: center;">
    <p style="color: #888; font-style: italic; font-size: 0.9rem; line-height: 1.6;">
      "Consent as executable code. Provenance as default. Revocation as sacred. Compensation as automatic."
    </p>
  </div>
</div>

<div class="footer">
  HEAVEN v${metrics.version} | RSP_001 | ${metrics.timestamp}
  <br><br>
  <a href="/health">API Health</a> &middot;
  <a href="/status">JSON Status</a> &middot;
  <a href="/gabriel">Gabriel</a> &middot;
  <a href="/api/v1/stats">Stats</a> &middot;
  <a href="/">API Index</a>
  <div class="auto-refresh">
    <div class="dot"></div>
    Auto-refresh every 30 seconds
  </div>
</div>

<script>
// Real-time WebSocket connection for live updates
(function() {
  const wsUrl = 'wss://' + location.host + '/ws';
  let ws;
  let retries = 0;

  function connect() {
    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('Gabriel Edge: CONNECTED');
        retries = 0;
        // Request status every 15 seconds
        ws.send(JSON.stringify({ type: 'empire.status' }));
        setInterval(() => {
          if (ws.readyState === 1) {
            ws.send(JSON.stringify({ type: 'empire.status' }));
          }
        }, 15000);
      };

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'empire.status') {
            // Pulse animation on data update
            document.querySelectorAll('.value').forEach(el => {
              el.style.textShadow = '0 0 20px currentColor';
              setTimeout(() => el.style.textShadow = '', 500);
            });
          }
        } catch (err) {
          console.error('WebSocket message error:', err);
        }
      };

      ws.onclose = () => {
        console.log('Gabriel Edge: Disconnected, reconnecting...');
        setTimeout(connect, Math.min(30000, 2000 * ++retries));
      };

      ws.onerror = () => ws.close();
    } catch (err) {
      console.error('WebSocket error:', err);
    }
  }

  connect();
})();
</script>

</body>
</html>`;
}

// ─── Route Handlers ───────────────────────────────────────────────────────────

/**
 * Handle GET /dashboard
 * Returns HTML dashboard or JSON based on Accept header
 */
export async function handleDashboard(request, env) {
  const accept = request.headers.get("Accept") || "";
  const metrics = await collectHealthMetrics(env);

  // JSON response if requested
  if (accept.includes("application/json") && !accept.includes("text/html")) {
    return jsonResponse({
      system: "HEAVEN",
      dashboard: metrics,
      endpoints: {
        status: "/status",
        health: "/health",
        gabriel: "/gabriel",
        stats: "/api/v1/stats",
      },
    });
  }

  // HTML dashboard (default)
  return new Response(generateDashboardHTML(metrics), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Powered-By": "HEAVEN/RSP_001",
    },
  });
}

/**
 * Handle GET /status
 * Returns minimal JSON for monitoring systems (Datadog, Pingdom, UptimeRobot, etc.)
 */
export async function handleStatus(request, env) {
  const db = env.GABRIEL_DB;

  // Fast health check
  const startTime = Date.now();
  let dbOk = false;
  let dbLatency = 0;

  try {
    await db.prepare("SELECT 1").first();
    dbOk = true;
    dbLatency = Date.now() - startTime;
  } catch (e) {
    dbLatency = Date.now() - startTime;
  }

  // Get Never Clause violations (critical metric)
  let neverClauseViolations = 0;
  try {
    const result = await db
      .prepare("SELECT COUNT(*) as c FROM noizy_ledger WHERE event_type = 'never_clause.blocked'")
      .first();
    neverClauseViolations = result?.c || 0;
  } catch (e) {
    // Continue even if this fails
  }

  const healthy = dbOk && neverClauseViolations === 0;

  return jsonResponse(
    {
      status: healthy ? "healthy" : "unhealthy",
      version: env.NOIZY_VERSION || HEAVEN_VERSION,
      timestamp: new Date().toISOString(),
      checks: {
        database: dbOk ? "ok" : "error",
        database_latency_ms: dbLatency,
        never_clause_violations: neverClauseViolations,
      },
      // Standard monitoring fields
      ok: healthy,
      message: healthy ? "All systems operational" : "System degraded",
    },
    healthy ? 200 : 503,
  );
}

export default {
  handleDashboard,
  handleStatus,
};
