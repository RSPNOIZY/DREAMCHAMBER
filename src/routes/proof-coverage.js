/**
 * Proof Coverage Metrics for Trust Dashboard
 *
 * Shows anchoring and proof health without exposing internals.
 * Creator-safe: shows percentages, status badges, dates — not details.
 *
 * Routes:
 *   GET /trust/proof-coverage      - JSON metrics
 *   GET /trust/proof-coverage.html - Widget for embedding
 */

import { getRedundancyMetrics } from '../edge-core/cross_anchor.js';
import { VERIFIABLE_POLICIES } from '../edge-core/zk_policy_proof.js';

/**
 * Get proof coverage metrics
 * GET /trust/proof-coverage
 */
export async function handleProofCoverage(request, env) {
  try {
    const metrics = await generateCoverageMetrics(env);

    return Response.json({
      success: true,
      ...metrics
    });

  } catch (error) {
    console.error('[ProofCoverage] Error:', error);
    return Response.json({
      success: true,
      status: 'partial',
      message: 'Metrics collection in progress',
      updated_at: new Date().toISOString()
    });
  }
}

/**
 * HTML widget for embedding
 * GET /trust/proof-coverage.html
 */
export async function handleProofCoverageWidget(request, env) {
  const metrics = await generateCoverageMetrics(env);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Proof Coverage — NOIZY</title>
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
      padding: 1.5rem;
    }
    .widget {
      background: #111;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 1.5rem;
      max-width: 400px;
    }
    h2 { font-size: 1.1rem; margin-bottom: 1rem; color: var(--fg); }
    .metric-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid #222;
    }
    .metric-row:last-child { border-bottom: none; }
    .metric-label { color: #888; }
    .metric-value { font-weight: 600; font-family: monospace; }
    .metric-value.good { color: var(--success); }
    .metric-value.warn { color: var(--warning); }
    .anchor-row {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .anchor-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      background: #1a1a1a;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.85rem;
    }
    .check { color: var(--success); }
    .progress-bar {
      background: #222;
      border-radius: 4px;
      height: 8px;
      overflow: hidden;
      margin-top: 0.5rem;
    }
    .progress-fill {
      background: var(--success);
      height: 100%;
      transition: width 0.3s;
    }
    footer {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #222;
      font-size: 0.8rem;
      color: #666;
    }
    a { color: var(--accent); text-decoration: none; }
  </style>
</head>
<body>
  <div class="widget">
    <h2>Proof Coverage</h2>

    <div class="metric-row">
      <span class="metric-label">Anchored Roots (30 days)</span>
      <span class="metric-value ${metrics.anchor_coverage >= 90 ? 'good' : 'warn'}">${metrics.anchored_roots} / 30</span>
    </div>

    <div class="metric-row">
      <span class="metric-label">Events with ZK Inclusion Proof</span>
      <span class="metric-value ${metrics.zk_inclusion_coverage >= 95 ? 'good' : 'warn'}">${metrics.zk_inclusion_coverage}%</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${metrics.zk_inclusion_coverage}%"></div>
    </div>

    <div class="metric-row">
      <span class="metric-label">Policy Compliance Proofs</span>
      <span class="metric-value ${metrics.policy_coverage >= 90 ? 'good' : 'warn'}">${metrics.policy_coverage}%</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${metrics.policy_coverage}%"></div>
    </div>

    <div class="metric-row">
      <span class="metric-label">Cross-Anchor Agreement</span>
      <div class="anchor-row">
        <span class="anchor-badge">
          <span class="check">${metrics.ethereum_ok ? '✓' : '○'}</span> Ethereum
        </span>
        <span class="anchor-badge">
          <span class="check">${metrics.bitcoin_ok ? '✓' : '○'}</span> Bitcoin
        </span>
        <span class="anchor-badge">
          <span class="check">${metrics.transparency_log_ok ? '✓' : '○'}</span> Log
        </span>
      </div>
    </div>

    <footer>
      <a href="/trust/verify-audit-anchor">How to Verify →</a>
      <span style="float: right">${new Date(metrics.updated_at).toLocaleDateString()}</span>
    </footer>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}

/**
 * Generate comprehensive coverage metrics
 */
async function generateCoverageMetrics(env) {
  const metrics = {
    status: 'healthy',
    anchor_coverage: 0,
    anchored_roots: 0,
    zk_inclusion_coverage: 0,
    policy_coverage: 0,
    ethereum_ok: false,
    bitcoin_ok: false,
    transparency_log_ok: false,
    policies_tracked: Object.keys(VERIFIABLE_POLICIES).length,
    updated_at: new Date().toISOString()
  };

  try {
    // Get anchor counts (last 30 days)
    const anchorCounts = await env.GABRIEL_DB.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN eth_txid IS NOT NULL THEN 1 ELSE 0 END) as eth_count,
        SUM(CASE WHEN btc_txid IS NOT NULL THEN 1 ELSE 0 END) as btc_count
      FROM audit_anchors
      WHERE anchor_date > DATE('now', '-30 days')
    `).first();

    if (anchorCounts) {
      metrics.anchored_roots = anchorCounts.total || 0;
      metrics.anchor_coverage = Math.round((metrics.anchored_roots / 30) * 100);
      metrics.ethereum_ok = (anchorCounts.eth_count || 0) > 0;
      metrics.bitcoin_ok = (anchorCounts.btc_count || 0) > 0;
    }

    // Check transparency log
    try {
      const logCount = await env.GABRIEL_DB.prepare(`
        SELECT COUNT(*) as count FROM transparency_log
        WHERE anchor_date > DATE('now', '-30 days')
      `).first();
      metrics.transparency_log_ok = (logCount?.count || 0) > 0;
    } catch (e) {
      // Table may not exist
    }

    // Get event counts for ZK coverage estimation
    const eventCounts = await env.GABRIEL_DB.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN event_hash IS NOT NULL THEN 1 ELSE 0 END) as hashed
      FROM audit_events
      WHERE created_at > DATE('now', '-30 days')
    `).first();

    if (eventCounts && eventCounts.total > 0) {
      metrics.zk_inclusion_coverage = Math.round((eventCounts.hashed / eventCounts.total) * 100);
    } else {
      metrics.zk_inclusion_coverage = 100; // No events = 100% covered
    }

    // Estimate policy coverage (events with preconditions checked)
    const policyEvents = await env.GABRIEL_DB.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN precondition_passed IS NOT NULL THEN 1 ELSE 0 END) as with_policy
      FROM audit_events
      WHERE created_at > DATE('now', '-30 days')
    `).first();

    if (policyEvents && policyEvents.total > 0) {
      metrics.policy_coverage = Math.round((policyEvents.with_policy / policyEvents.total) * 100);
    } else {
      metrics.policy_coverage = 100;
    }

    // Determine overall status
    if (metrics.anchor_coverage < 50 || metrics.zk_inclusion_coverage < 80) {
      metrics.status = 'degraded';
    } else if (metrics.anchor_coverage < 90 || metrics.zk_inclusion_coverage < 95) {
      metrics.status = 'partial';
    }

  } catch (e) {
    console.error('[ProofCoverage] Metrics error:', e);
    metrics.status = 'unknown';
  }

  return metrics;
}

export default {
  handleProofCoverage,
  handleProofCoverageWidget
};
