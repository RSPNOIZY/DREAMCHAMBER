/**
 * LUCY — iPad Command Surface
 * Read-only observer. Visibility first. Power second.
 * Served from central-gateway :9696/dashboard
 */

module.exports.dashboardHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="LUCY">
<title>LUCY — NOIZY Command</title>
<style>
  :root {
    --bg: #0a0a0f;
    --surface: #14141f;
    --border: #1e1e30;
    --green: #00ff88;
    --red: #ff3355;
    --amber: #ffaa00;
    --text: #e0e0e8;
    --dim: #666680;
    --accent: #8855ff;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, 'SF Pro Display', system-ui, sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100dvh;
    padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
    -webkit-user-select: none;
    user-select: none;
  }

  /* ── Header ────────────────────────────────────── */
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
  }
  .logo {
    font-size: 24px;
    font-weight: 700;
    letter-spacing: 2px;
  }
  .logo span { color: var(--accent); }
  .master-led {
    width: 20px; height: 20px;
    border-radius: 50%;
    background: var(--dim);
    transition: background 0.3s, box-shadow 0.3s;
  }
  .master-led.green {
    background: var(--green);
    box-shadow: 0 0 12px var(--green);
  }
  .master-led.red {
    background: var(--red);
    box-shadow: 0 0 12px var(--red);
  }
  .master-led.amber {
    background: var(--amber);
    box-shadow: 0 0 12px var(--amber);
  }

  /* ── Status Bar ────────────────────────────────── */
  .status-bar {
    display: flex;
    gap: 16px;
    padding: 12px 20px;
    font-size: 13px;
    color: var(--dim);
    border-bottom: 1px solid var(--border);
    flex-wrap: wrap;
  }
  .status-bar .val { color: var(--text); font-weight: 600; }

  /* ── Agent Grid ────────────────────────────────── */
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
    padding: 16px 20px;
  }
  .agent-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: border-color 0.3s;
    -webkit-tap-highlight-color: transparent;
  }
  .agent-card.healthy { border-color: var(--green); }
  .agent-card.unhealthy { border-color: var(--red); }
  .agent-card .name {
    font-size: 18px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .agent-card .role {
    font-size: 13px;
    color: var(--dim);
  }
  .agent-card .led {
    width: 12px; height: 12px;
    border-radius: 50%;
    background: var(--dim);
    transition: background 0.3s;
  }
  .agent-card.healthy .led { background: var(--green); }
  .agent-card.unhealthy .led { background: var(--red); }
  .agent-card .uptime {
    font-size: 12px;
    color: var(--dim);
    margin-top: auto;
  }

  /* ── System Section ────────────────────────────── */
  .section-title {
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--dim);
    padding: 20px 20px 8px;
  }

  /* ── System Cards ──────────────────────────────── */
  .sys-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 12px;
    padding: 8px 20px 16px;
  }
  .sys-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    text-align: center;
  }
  .sys-card .label { font-size: 12px; color: var(--dim); }
  .sys-card .value { font-size: 22px; font-weight: 700; margin-top: 4px; }
  .sys-card .value.green { color: var(--green); }
  .sys-card .value.red { color: var(--red); }

  /* ── Last Command ──────────────────────────────── */
  .last-cmd {
    margin: 0 20px 16px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    font-family: 'SF Mono', 'Menlo', monospace;
    font-size: 13px;
    line-height: 1.6;
    max-height: 160px;
    overflow-y: auto;
  }
  .last-cmd .label { color: var(--dim); font-size: 11px; margin-bottom: 8px; }

  /* ── Action Buttons ────────────────────────────── */
  .actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 0 20px 20px;
  }
  .btn {
    font-size: 16px;
    font-weight: 700;
    padding: 20px;
    border: none;
    border-radius: 16px;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: transform 0.1s, opacity 0.2s;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .btn:active { transform: scale(0.97); }
  .btn-dispatch {
    background: var(--accent);
    color: white;
  }
  .btn-refresh {
    background: var(--surface);
    color: var(--text);
    border: 1px solid var(--border);
  }
  .btn-stop {
    grid-column: 1 / -1;
    background: var(--red);
    color: white;
    font-size: 20px;
    padding: 24px;
  }

  /* ── Toast ─────────────────────────────────────── */
  .toast {
    position: fixed;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%) translateY(80px);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 12px 24px;
    font-size: 14px;
    opacity: 0;
    transition: transform 0.3s, opacity 0.3s;
    z-index: 100;
  }
  .toast.show {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
</style>
</head>
<body>

<header>
  <div class="logo"><span>LUCY</span> COMMAND</div>
  <div class="master-led" id="masterLed"></div>
</header>

<div class="status-bar" id="statusBar">
  <span>Gateway: <span class="val" id="gwStatus">--</span></span>
  <span>Agents: <span class="val" id="agentCount">--</span></span>
  <span>Updated: <span class="val" id="lastUpdate">--</span></span>
  <span>Heaven: <span class="val" id="heavenStatus">--</span></span>
</div>

<div class="section-title">AGENT MESH</div>
<div class="grid" id="agentGrid"></div>

<div class="section-title">SYSTEM</div>
<div class="sys-grid" id="sysGrid">
  <div class="sys-card"><div class="label">LOGIC PRO</div><div class="value" id="sysLogic">--</div></div>
  <div class="sys-card"><div class="label">DISK FREE</div><div class="value" id="sysDisk">--</div></div>
  <div class="sys-card"><div class="label">MEMORY</div><div class="value" id="sysMem">--</div></div>
  <div class="sys-card"><div class="label">HEAVEN</div><div class="value" id="sysHeaven">--</div></div>
  <div class="sys-card"><div class="label">MESH</div><div class="value" id="sysMesh">--</div></div>
  <div class="sys-card"><div class="label">UPTIME</div><div class="value" id="sysUptime">--</div></div>
</div>

<div class="section-title">LAST COMMAND</div>
<div class="last-cmd" id="lastCmd">
  <div class="label">NO COMMANDS YET</div>
</div>

<div class="actions">
  <button class="btn btn-dispatch" onclick="sendPing()">PING GABRIEL</button>
  <button class="btn btn-refresh" onclick="refresh()">REFRESH</button>
  <button class="btn btn-stop" onclick="emergencyStop()">EMERGENCY STOP</button>
</div>

<div class="toast" id="toast"></div>

<script>
const GATEWAY = location.origin;
const POLL_MS = 4000;
let lastHealth = null;

function $(id) { return document.getElementById(id); }

function toast(msg, duration = 3000) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

function fmtUptime(s) {
  if (!s || s < 60) return Math.round(s) + 's';
  if (s < 3600) return Math.round(s / 60) + 'm';
  return Math.round(s / 3600) + 'h';
}

async function fetchHealth() {
  try {
    const r = await fetch(GATEWAY + '/health');
    const data = await r.json();
    lastHealth = data;
    renderHealth(data);
  } catch (err) {
    $('masterLed').className = 'master-led red';
    $('gwStatus').textContent = 'OFFLINE';
    toast('Gateway unreachable');
  }
}

function renderHealth(data) {
  const allHealthy = data.status === 'healthy';
  const led = $('masterLed');
  led.className = 'master-led ' + (allHealthy ? 'green' : 'red');

  $('gwStatus').textContent = data.status.toUpperCase();
  $('agentCount').textContent = data.agents.length + ' / ' + data.agents.length;
  $('lastUpdate').textContent = new Date().toLocaleTimeString();

  const healthyCount = data.agents.filter(a => a.status === 'healthy').length;
  $('sysMesh').textContent = healthyCount + '/' + data.agents.length;
  $('sysMesh').className = 'value ' + (healthyCount === data.agents.length ? 'green' : 'red');

  // System telemetry from GOD
  renderSystem(data.system);

  const grid = $('agentGrid');
  grid.innerHTML = data.agents.map(a => {
    const up = a.detail && a.detail.uptime ? fmtUptime(a.detail.uptime) : '--';
    const role = a.detail && a.detail.role ? a.detail.role : 'unknown';
    return '<div class="agent-card ' + a.status + '">' +
      '<div style="display:flex;align-items:center;gap:8px"><div class="led"></div><div class="name">' + a.agent + '</div></div>' +
      '<div class="role">' + role + '</div>' +
      '<div class="uptime">uptime: ' + up + '</div>' +
      '</div>';
  }).join('');
}

async function checkHeaven() {
  try {
    const r = await fetch('https://heaven.rsp-5f3.workers.dev/health', { mode: 'cors' });
    if (r.ok) {
      $('heavenStatus').textContent = 'LIVE';
      $('sysHeaven').textContent = 'LIVE';
      $('sysHeaven').className = 'value green';
    } else {
      throw new Error('not ok');
    }
  } catch {
    $('heavenStatus').textContent = 'DOWN';
    $('sysHeaven').textContent = 'DOWN';
    $('sysHeaven').className = 'value red';
  }
}

function renderSystem(sys) {
  if (!sys) return;

  // Logic Pro
  $('sysLogic').textContent = sys.logic_pro ? 'OPEN' : 'OFF';
  $('sysLogic').className = 'value ' + (sys.logic_pro ? 'green' : '');

  // Disk
  $('sysDisk').textContent = sys.disk_free_gb + 'GB';
  $('sysDisk').className = 'value ' + (sys.disk_free_gb > 50 ? 'green' : 'red');

  // Memory
  $('sysMem').textContent = sys.memory_used_pct + '%';
  $('sysMem').className = 'value ' + (sys.memory_used_pct < 85 ? 'green' : 'red');

  // Uptime
  $('sysUptime').textContent = sys.uptime_hours + 'h';
}

async function sendPing() {
  toast('Dispatching to Gabriel...');
  try {
    const r = await fetch(GATEWAY + '/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actor: 'RSP_001',
        device: 'ipad_lucy',
        intent: 'status',
        target: 'gabriel',
        context: { mode: 'ping' }
      })
    });
    const data = await r.json();
    $('lastCmd').innerHTML = '<div class="label">DISPATCH \u2192 GABRIEL (status/ping)</div>' +
      '<div style="color:var(--green)">' + JSON.stringify(data, null, 2) + '</div>';
    toast('Gabriel responded');
  } catch (err) {
    $('lastCmd').innerHTML = '<div class="label">DISPATCH FAILED</div>' +
      '<div style="color:var(--red)">' + err.message + '</div>';
    toast('Dispatch failed');
  }
}

function refresh() {
  toast('Refreshing...');
  fetchHealth();
  checkHeaven();
}

async function emergencyStop() {
  if (!confirm('EMERGENCY STOP\\n\\nThis will signal all agents to save state and halt.\\n\\nConfirm?')) return;
  toast('Emergency stop sent');
  // Send stop to all agents
  const agents = lastHealth ? lastHealth.agents.map(a => a.agent) : [];
  for (const agent of agents) {
    try {
      await fetch(GATEWAY + '/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor: 'RSP_001',
          device: 'ipad_lucy',
          intent: 'emergency_stop',
          target: agent,
          context: { reason: 'manual_stop' }
        })
      });
    } catch {}
  }
  $('lastCmd').innerHTML = '<div class="label" style="color:var(--red)">EMERGENCY STOP DISPATCHED</div>' +
    '<div>Sent to: ' + agents.join(', ') + '</div>';
}

// ── Init ─────────────────────────────────────────
fetchHealth();
checkHeaven();
setInterval(fetchHealth, POLL_MS);
setInterval(checkHeaven, 30000);
</script>
</body>
</html>`;
