// HEAVEN Dashboard — served from the edge, zero cost
export function dashboardHTML(data) {
  const { health, actors, neverClauses, rateTable, stats } = data;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HEAVEN — NOIZY Command Center</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro', 'Segoe UI', sans-serif;
    background: #0a0a0f;
    color: #e0e0e0;
    min-height: 100vh;
  }
  .header {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    padding: 2rem;
    text-align: center;
    border-bottom: 2px solid #e94560;
  }
  .header h1 { font-size: 2.5rem; color: #fff; letter-spacing: 0.3em; }
  .header .subtitle { color: #e94560; font-size: 0.9rem; margin-top: 0.5rem; letter-spacing: 0.15em; }
  .header .mission { color: #888; font-size: 0.75rem; margin-top: 0.75rem; font-style: italic; }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  .card {
    background: #12121a;
    border: 1px solid #222;
    border-radius: 12px;
    padding: 1.5rem;
    transition: border-color 0.2s;
  }
  .card:hover { border-color: #e94560; }
  .card .label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: #666; }
  .card .value { font-size: 2rem; font-weight: 700; color: #fff; margin-top: 0.25rem; }
  .card .value.live { color: #00ff88; }
  .card .value.warning { color: #ffaa00; }
  .card .value.danger { color: #e94560; }
  .section {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem 2rem;
  }
  .section h2 {
    font-size: 1.1rem;
    color: #e94560;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #222;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
  }
  th { text-align: left; color: #666; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.75rem; border-bottom: 1px solid #222; }
  td { padding: 0.75rem; border-bottom: 1px solid #1a1a1a; }
  tr:hover td { background: #1a1a22; }
  .badge {
    display: inline-block;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
  }
  .badge-active { background: #00ff8822; color: #00ff88; }
  .badge-founding { background: #e9456022; color: #e94560; }
  .badge-blocked { background: #ff000022; color: #ff4444; }
  .footer {
    text-align: center;
    padding: 2rem;
    color: #333;
    font-size: 0.7rem;
    letter-spacing: 0.1em;
  }
  .footer a { color: #e94560; text-decoration: none; }
  @media (max-width: 768px) {
    .grid { grid-template-columns: 1fr 1fr; padding: 1rem; }
    .section { padding: 0 1rem 1rem; }
    .header h1 { font-size: 1.5rem; }
  }
</style>
</head>
<body>

<div class="header">
  <h1>HEAVEN</h1>
  <div class="subtitle">NOIZY HVS CONSENT KERNEL — COMMAND CENTER</div>
  <div class="mission">${health.mission || "Consent as executable code."}</div>
</div>

<div class="grid">
  <div class="card">
    <div class="label">System Status</div>
    <div class="value live">${health.status || "UNKNOWN"}</div>
  </div>
  <div class="card">
    <div class="label">Version</div>
    <div class="value">${health.version || "—"}</div>
  </div>
  <div class="card">
    <div class="label">Actors</div>
    <div class="value">${stats.stats?.actors || 0}</div>
  </div>
  <div class="card">
    <div class="label">Active Consent Tokens</div>
    <div class="value">${stats.stats?.consent_tokens?.active || 0}</div>
  </div>
  <div class="card">
    <div class="label">Descendants</div>
    <div class="value">${stats.stats?.descendants || 0}</div>
  </div>
  <div class="card">
    <div class="label">Synth Requests</div>
    <div class="value">${stats.stats?.synth_requests?.total || 0}</div>
  </div>
  <div class="card">
    <div class="label">Blocked Requests</div>
    <div class="value ${(stats.stats?.synth_requests?.blocked || 0) > 0 ? "danger" : ""}">${stats.stats?.synth_requests?.blocked || 0}</div>
  </div>
  <div class="card">
    <div class="label">Ledger Events</div>
    <div class="value">${stats.stats?.ledger_events || 0}</div>
  </div>
  <div class="card">
    <div class="label">Revenue (CAD)</div>
    <div class="value">$${(stats.stats?.total_revenue_cad || 0).toFixed(2)}</div>
  </div>
  <div class="card">
    <div class="label">GABRIEL</div>
    <div class="value live" style="font-size:1rem;letter-spacing:0.05em">AI ORCHESTRATION</div>
  </div>
</div>

<div class="section">
  <h2>Registered Actors</h2>
  <table>
    <tr><th>Actor ID</th><th>Name</th><th>Email</th><th>Country</th><th>Status</th><th>Type</th><th>Onboarded</th></tr>
    ${
      actors.actors
        ?.map(
          (a) => `
    <tr>
      <td><code>${a.actor_id}</code></td>
      <td><strong>${a.display_name}</strong></td>
      <td>${a.email || "—"}</td>
      <td>${a.country}</td>
      <td><span class="badge badge-active">${a.status}</span></td>
      <td>${a.is_founding ? '<span class="badge badge-founding">Founding</span>' : "Standard"}</td>
      <td>${a.onboarded_at}</td>
    </tr>`,
        )
        .join("") || '<tr><td colspan="7">No actors registered</td></tr>'
    }
  </table>
</div>

<div class="section">
  <h2>Never Clauses — Sacred Boundaries</h2>
  <table>
    <tr><th>Code</th><th>Category</th><th>Clause</th><th>Scope</th></tr>
    ${
      neverClauses.never_clauses
        ?.map(
          (nc) => `
    <tr>
      <td><code>${nc.clause_code}</code></td>
      <td><span class="badge badge-blocked">${nc.category}</span></td>
      <td>${nc.clause_text}</td>
      <td>${nc.is_global ? "Global" : "Specific"}</td>
    </tr>`,
        )
        .join("") || '<tr><td colspan="4">No never clauses defined</td></tr>'
    }
  </table>
</div>

<div class="section">
  <h2>Rate Table</h2>
  <table>
    <tr><th>Category</th><th>Base Fee (CAD)</th><th>Per Minute (CAD)</th><th>Description</th></tr>
    ${
      rateTable.rate_table
        ?.map(
          (r) => `
    <tr>
      <td><strong>${r.use_category}</strong></td>
      <td>$${r.base_fee_cad.toFixed(2)}</td>
      <td>$${r.per_minute_cad.toFixed(2)}</td>
      <td>${r.description}</td>
    </tr>`,
        )
        .join("") || '<tr><td colspan="4">No rates configured</td></tr>'
    }
  </table>
</div>

<div class="section">
  <h2>Empire Portals</h2>
  <table>
    <tr><th>Portal</th><th>Mission</th><th>Status</th></tr>
    <tr><td><strong>NOIZYVOX</strong></td><td>Voice sovereignty — consent capture — voice profiles</td><td><span class="badge badge-active">BUILDING</span></td></tr>
    <tr><td><strong>NOIZYFISH</strong></td><td>888-title catalogue — C2PA stamped — 75/25 perpetual</td><td><span class="badge badge-active">ACTIVE</span></td></tr>
    <tr><td><strong>NOIZYKIDZ</strong></td><td>Rhythm Root Island — neurodivergent kids — Unity/Godot</td><td><span class="badge badge-active">BUILDING</span></td></tr>
    <tr><td><strong>NOIZYLAB</strong></td><td>Sonic healing — binaural protocols — AirPlay delivery</td><td><span class="badge badge-active">LIVE</span></td></tr>
    <tr><td><strong>WISDOM</strong></td><td>Elder legacy — inheritable voice archive — 100-year estate</td><td><span class="badge badge-active">BUILDING</span></td></tr>
    <tr><td><strong>myFAMILY</strong></td><td>Love in code — consent-native — deployed when needed</td><td><span class="badge badge-active">LIVE</span></td></tr>
  </table>
</div>

<div class="footer">
  HEAVEN v${health.version || "17.4.0"} — NOIZY.AI — <span id="ts">${health.timestamp || ""}</span><br>
  <a href="/health">API Health</a> · <a href="/api/v1/stats">Stats JSON</a> · <a href="/gabriel">Gabriel Status</a> · <a href="/">Endpoints</a>
  <br><small id="ws-status" style="color:#888">Connecting to Gabriel Edge…</small>
</div>

<script>
// Live WebSocket pulse — Gabriel feeds the dashboard in real time
(function() {
  const wsUrl = 'wss://' + location.host + '/ws';
  let ws, retries = 0;

  function connect() {
    ws = new WebSocket(wsUrl);
    ws.onopen = () => {
      document.getElementById('ws-status').textContent = 'Gabriel Edge: LIVE';
      document.getElementById('ws-status').style.color = '#10b981';
      ws.send(JSON.stringify({type:'empire.status'}));
      setInterval(() => ws.readyState === 1 && ws.send(JSON.stringify({type:'empire.status'})), 15000);
      retries = 0;
    };
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.type === 'empire.status') {
        const t = document.getElementById('ts');
        if (t) t.textContent = d.ts;
        // Pulse cards with fresh data
        const cards = document.querySelectorAll('.value');
        cards.forEach(c => { c.style.transition = 'color 0.3s'; c.style.color = '#a78bfa'; });
        setTimeout(() => cards.forEach(c => c.style.color = ''), 400);
      }
    };
    ws.onclose = () => {
      document.getElementById('ws-status').textContent = 'Gabriel Edge: reconnecting…';
      document.getElementById('ws-status').style.color = '#f59e0b';
      setTimeout(connect, Math.min(30000, 2000 * ++retries));
    };
    ws.onerror = () => ws.close();
  }
  connect();
})();
</script>

</body>
</html>`;
}
