/**
 * CREATOR TRUST UI
 *
 * Policy proofs rendered in the creator dashboard.
 * Every creator sees their ZK verification status in real-time.
 *
 * "Creators don't trust NOIZY. They verify NOIZY."
 */

import { POLICIES, evaluatePolicy, evaluateAllPolicies } from '../edge-core/policy_registry.js';

// ═══════════════════════════════════════════════════════════════════════════
// CREATOR TRUST DASHBOARD DATA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get creator's personal trust dashboard data
 */
export async function getCreatorTrustDashboard(env, creatorId) {
  // Get creator's consent tokens
  const tokens = await env.GABRIEL_DB.prepare(`
    SELECT * FROM consent_tokens
    WHERE actor_id = ?
    ORDER BY created_at DESC
    LIMIT 100
  `).bind(creatorId).all();

  // Get creator's audit events
  const events = await env.GABRIEL_DB.prepare(`
    SELECT * FROM audit_events
    WHERE operator_email LIKE ? OR metadata LIKE ?
    ORDER BY created_at DESC
    LIMIT 50
  `).bind(`%${creatorId}%`, `%${creatorId}%`).all();

  // Evaluate policies for each token
  const tokenProofs = [];
  for (const token of (tokens.results || [])) {
    const policies = evaluateAllPolicies('consent_token', {
      ...token,
      revocation_timestamp: token.revoked_at,
      last_use_timestamp: token.last_used_at
    });

    tokenProofs.push({
      token_id: token.id,
      scope: token.scope,
      created_at: token.created_at,
      expires_at: token.expires_at,
      revoked: !!token.revoked_at,
      policies: policies.policies,
      all_passed: policies.all_passed,
      verification_status: policies.all_passed ? 'VERIFIED' : 'REVIEW_REQUIRED'
    });
  }

  // Calculate overall trust score
  const totalPolicies = tokenProofs.reduce((sum, t) => sum + Object.keys(t.policies).length, 0);
  const passedPolicies = tokenProofs.reduce((sum, t) => {
    return sum + Object.values(t.policies).filter(p => p.result).length;
  }, 0);
  const trustScore = totalPolicies > 0 ? Math.round((passedPolicies / totalPolicies) * 100) : 100;

  return {
    creator_id: creatorId,
    trust_score: trustScore,
    trust_status: trustScore === 100 ? 'FULLY_VERIFIED' : trustScore >= 90 ? 'HIGH' : 'REVIEW_REQUIRED',
    tokens: {
      total: tokenProofs.length,
      active: tokenProofs.filter(t => !t.revoked).length,
      revoked: tokenProofs.filter(t => t.revoked).length,
      proofs: tokenProofs
    },
    recent_events: (events.results || []).slice(0, 10).map(e => ({
      id: e.id,
      action: e.action,
      timestamp: e.created_at,
      verified: e.precondition_passed === 1
    })),
    verification: {
      zk_policies_active: Object.values(POLICIES).filter(p => p.verification_mode === 'zk').length,
      last_verified: new Date().toISOString(),
      public_badge_url: `/badge/creator/${creatorId}.svg`
    },
    generated_at: new Date().toISOString()
  };
}

/**
 * Get specific policy proof for a creator's token
 */
export async function getTokenPolicyProof(env, tokenId) {
  const token = await env.GABRIEL_DB.prepare(`
    SELECT * FROM consent_tokens WHERE id = ?
  `).bind(tokenId).first();

  if (!token) {
    return { success: false, error: 'Token not found' };
  }

  // Evaluate all applicable policies
  const tokenData = {
    ...token,
    revocation_timestamp: token.revoked_at,
    last_use_timestamp: token.last_used_at,
    created_at: token.created_at,
    expires_at: token.expires_at
  };

  const results = {};
  for (const [policyId, policy] of Object.entries(POLICIES)) {
    if (policy.scope === 'consent_token') {
      const evaluation = evaluatePolicy(policyId, tokenData);
      results[policyId] = {
        description: policy.description,
        verification_mode: policy.verification_mode,
        inputs_used: policy.inputs,
        result: evaluation.result,
        provable: policy.verification_mode === 'zk',
        proof_available: policy.verification_mode === 'zk' && evaluation.result
      };
    }
  }

  return {
    success: true,
    token_id: tokenId,
    actor_id: token.actor_id,
    scope: token.scope,
    policies: results,
    overall_status: Object.values(results).every(r => r.result) ? 'ALL_VERIFIED' : 'REVIEW_REQUIRED',
    generated_at: new Date().toISOString()
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// CREATOR TRUST UI HTML COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate embeddable trust widget HTML
 */
export function generateTrustWidget(dashboard) {
  const statusColor = dashboard.trust_status === 'FULLY_VERIFIED' ? '#4c1' :
                      dashboard.trust_status === 'HIGH' ? '#97CA00' : '#fe7d37';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Creator Trust Dashboard</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #fff; }
    .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
    .header { text-align: center; margin-bottom: 2rem; }
    .trust-score { font-size: 4rem; font-weight: bold; color: ${statusColor}; }
    .trust-label { font-size: 1.2rem; color: #888; margin-top: 0.5rem; }
    .status-badge { display: inline-block; padding: 0.5rem 1rem; border-radius: 4px; background: ${statusColor}; color: #000; font-weight: bold; margin-top: 1rem; }
    .section { background: #111; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; }
    .section-title { font-size: 1.1rem; font-weight: bold; margin-bottom: 1rem; color: #fff; }
    .policy-grid { display: grid; gap: 0.75rem; }
    .policy-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: #1a1a1a; border-radius: 4px; }
    .policy-name { font-size: 0.9rem; }
    .policy-status { font-size: 0.8rem; padding: 0.25rem 0.5rem; border-radius: 3px; }
    .policy-verified { background: #4c1; color: #000; }
    .policy-zk { background: #9333ea; color: #fff; }
    .policy-failed { background: #e05d44; color: #fff; }
    .token-list { display: grid; gap: 0.5rem; }
    .token-item { display: flex; justify-content: space-between; padding: 0.5rem; background: #1a1a1a; border-radius: 4px; font-size: 0.85rem; }
    .footer { text-align: center; margin-top: 2rem; color: #666; font-size: 0.8rem; }
    .verify-link { color: #9333ea; text-decoration: none; }
    .verify-link:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="trust-score">${dashboard.trust_score}%</div>
      <div class="trust-label">Policy Coverage</div>
      <div class="status-badge">${dashboard.trust_status.replace('_', ' ')}</div>
    </div>

    <div class="section">
      <div class="section-title">ZK Policy Verification</div>
      <div class="policy-grid">
        ${Object.entries(POLICIES).filter(([_, p]) => p.verification_mode === 'zk').map(([id, policy]) => `
          <div class="policy-item">
            <span class="policy-name">${policy.description}</span>
            <span class="policy-status policy-zk">ZK PROVABLE</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="section">
      <div class="section-title">Active Consent Tokens (${dashboard.tokens.active})</div>
      <div class="token-list">
        ${dashboard.tokens.proofs.filter(t => !t.revoked).slice(0, 5).map(token => `
          <div class="token-item">
            <span>${token.scope || 'general'}</span>
            <span class="policy-status ${token.all_passed ? 'policy-verified' : 'policy-failed'}">
              ${token.all_passed ? '✓ VERIFIED' : '⚠ REVIEW'}
            </span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="section">
      <div class="section-title">Recent Activity</div>
      <div class="token-list">
        ${dashboard.recent_events.map(event => `
          <div class="token-item">
            <span>${event.action}</span>
            <span>${new Date(event.timestamp).toLocaleDateString()}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="footer">
      <p>Verification data generated at ${new Date(dashboard.generated_at).toISOString()}</p>
      <p><a class="verify-link" href="/trust/verify/${dashboard.creator_id}">Independently verify this data →</a></p>
      <p style="margin-top: 1rem;">Creators don't trust NOIZY. They verify NOIZY.</p>
    </div>
  </div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// ROUTE HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Handle creator trust dashboard request
 */
export async function handleCreatorTrustDashboard(request, env) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const creatorId = pathParts[pathParts.length - 1];

  if (!creatorId || creatorId === 'dashboard') {
    return new Response(JSON.stringify({
      success: false,
      error: 'Creator ID required'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const dashboard = await getCreatorTrustDashboard(env, creatorId);

    // Check if HTML requested
    const acceptHeader = request.headers.get('Accept') || '';
    if (acceptHeader.includes('text/html')) {
      return new Response(generateTrustWidget(dashboard), {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    return new Response(JSON.stringify(dashboard, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=60'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Handle token policy proof request
 */
export async function handleTokenProof(request, env) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const tokenId = pathParts[pathParts.length - 1];

  if (!tokenId) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Token ID required'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const proof = await getTokenPolicyProof(env, tokenId);
    return new Response(JSON.stringify(proof, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=30'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Handle creator badge SVG
 */
export async function handleCreatorBadge(request, env) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const creatorIdWithExt = pathParts[pathParts.length - 1];
  const creatorId = creatorIdWithExt.replace('.svg', '').replace('.json', '');

  try {
    const dashboard = await getCreatorTrustDashboard(env, creatorId);
    const score = dashboard.trust_score;
    const color = score === 100 ? '#4c1' : score >= 90 ? '#97CA00' : '#fe7d37';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="20">
      <linearGradient id="s" x2="0" y2="100%">
        <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
        <stop offset="1" stop-opacity=".1"/>
      </linearGradient>
      <clipPath id="r"><rect width="120" height="20" rx="3" fill="#fff"/></clipPath>
      <g clip-path="url(#r)">
        <rect width="70" height="20" fill="#555"/>
        <rect x="70" width="50" height="20" fill="${color}"/>
        <rect width="120" height="20" fill="url(#s)"/>
      </g>
      <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,sans-serif" font-size="11">
        <text x="35" y="15" fill="#010101" fill-opacity=".3">verified</text>
        <text x="35" y="14" fill="#fff">verified</text>
        <text x="95" y="15" fill="#010101" fill-opacity=".3">${score}%</text>
        <text x="95" y="14" fill="#fff">${score}%</text>
      </g>
    </svg>`;

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300'
      }
    });

  } catch (error) {
    const errorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="20">
      <rect width="80" height="20" fill="#e05d44" rx="3"/>
      <text x="40" y="14" fill="#fff" text-anchor="middle" font-family="Verdana" font-size="11">error</text>
    </svg>`;
    return new Response(errorSvg, {
      headers: { 'Content-Type': 'image/svg+xml' }
    });
  }
}

export default {
  getCreatorTrustDashboard,
  getTokenPolicyProof,
  generateTrustWidget,
  handleCreatorTrustDashboard,
  handleTokenProof,
  handleCreatorBadge
};
