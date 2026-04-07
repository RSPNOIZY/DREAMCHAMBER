/**
 * Live Audit Anchor Status Widget
 *
 * Shows anchoring health at a glance without exposing internals.
 * Safe for public display.
 *
 * Routes:
 *   GET /trust/anchor-status      - JSON status for widgets
 *   GET /trust/anchor-status.html - HTML widget for embedding
 */

/**
 * Get live anchor status
 * GET /trust/anchor-status
 */
export async function handleAnchorStatus(request, env) {
  try {
    // Get most recent anchor
    const latestAnchor = await env.GABRIEL_DB.prepare(`
      SELECT * FROM audit_anchors
      ORDER BY anchor_date DESC
      LIMIT 1
    `).first();

    if (!latestAnchor) {
      return Response.json({
        status: 'initializing',
        message: 'Anchoring system is initializing',
        last_anchor: null,
        anchors: [],
        root_hash: null
      });
    }

    // Determine anchor status
    const anchors = [];
    if (latestAnchor.eth_txid) {
      anchors.push({
        chain: 'ethereum',
        txid: latestAnchor.eth_txid,
        block: latestAnchor.eth_block,
        verified: true
      });
    }
    if (latestAnchor.btc_txid) {
      anchors.push({
        chain: 'bitcoin',
        txid: latestAnchor.btc_txid,
        block: latestAnchor.btc_block,
        verified: true
      });
    }
    if (anchors.length === 0) {
      anchors.push({
        chain: 'internal',
        status: 'published',
        verified: true
      });
    }

    // Get anchor health (last 7 days)
    const recentAnchors = await env.GABRIEL_DB.prepare(`
      SELECT COUNT(*) as count FROM audit_anchors
      WHERE anchor_date > DATE('now', '-7 days')
    `).first();

    const health = (recentAnchors?.count || 0) >= 6 ? 'healthy' : 'degraded';

    return Response.json({
      status: 'anchored',
      health,
      last_anchor: latestAnchor.published_at,
      last_anchor_date: latestAnchor.anchor_date,
      event_count: latestAnchor.event_count,
      anchors,
      root_hash: truncateHash(latestAnchor.root_hash),
      root_hash_full: latestAnchor.root_hash,
      verify_url: '/trust/verify-audit-anchor',
      updated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('[AnchorStatus] Error:', error);
    return Response.json({
      status: 'unknown',
      error: 'Unable to retrieve anchor status',
      updated_at: new Date().toISOString()
    });
  }
}

/**
 * HTML widget for embedding
 * GET /trust/anchor-status.html
 */
export async function handleAnchorStatusWidget(request, env) {
  const status = await handleAnchorStatus(request, env);
  const data = await status.json();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Audit Anchor Status</title>
  <style>
    :root {
      --bg: #0a0a0a;
      --fg: #e0e0e0;
      --accent: #7c3aed;
      --success: #22c55e;
      --warning: #eab308;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--fg);
      padding: 1rem;
    }
    .widget {
      background: #111;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 1rem;
      max-width: 300px;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: ${data.status === 'anchored' ? 'var(--success)' : 'var(--warning)'};
    }
    .title { font-weight: 600; }
    .row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #222;
    }
    .label { color: #888; }
    .value { font-family: monospace; }
    .chains {
      margin-top: 0.5rem;
      display: flex;
      gap: 0.5rem;
    }
    .chain {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.9rem;
    }
    .check { color: var(--success); }
    .hash {
      font-family: monospace;
      font-size: 0.85rem;
      color: var(--accent);
      cursor: pointer;
    }
    .link {
      display: block;
      margin-top: 1rem;
      color: var(--accent);
      text-decoration: none;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="widget">
    <div class="header">
      <div class="status-dot"></div>
      <span class="title">Audit Anchors</span>
    </div>

    <div class="row">
      <span class="label">Status</span>
      <span class="value">${data.status === 'anchored' ? 'Anchored' : data.status}</span>
    </div>

    <div class="row">
      <span class="label">Last Anchor</span>
      <span class="value">${data.last_anchor_date || 'N/A'}</span>
    </div>

    <div class="row">
      <span class="label">Networks</span>
      <div class="chains">
        ${data.anchors.map(a => `
          <span class="chain">
            <span class="check">${a.verified ? '✓' : '○'}</span>
            ${a.chain}
          </span>
        `).join('')}
      </div>
    </div>

    <div class="row">
      <span class="label">Root Hash</span>
      <span class="hash" title="${data.root_hash_full || ''}">${data.root_hash || 'N/A'}</span>
    </div>

    <a class="link" href="/trust/verify-audit-anchor">How to Verify →</a>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}

/**
 * Truncate hash for display
 */
function truncateHash(hash) {
  if (!hash || hash.length < 12) return hash;
  return hash.substring(0, 4) + '...' + hash.substring(hash.length - 4);
}

export default {
  handleAnchorStatus,
  handleAnchorStatusWidget
};
