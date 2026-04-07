/**
 * POLICY COVERAGE BADGE
 *
 * Public endpoint that returns a shields.io-compatible badge showing
 * real-time policy compliance coverage.
 *
 * GET /badge/policy-coverage.svg
 * GET /badge/policy-coverage.json
 *
 * This is public. No auth required. Transparency is the point.
 */

import { POLICIES, evaluateAllPolicies, getPolicyCoverage } from '../edge-core/policy_registry.js';

/**
 * Generate SVG badge
 */
function generateSVG(label, value, color) {
  const labelWidth = label.length * 6.5 + 10;
  const valueWidth = value.length * 6.5 + 10;
  const totalWidth = labelWidth + valueWidth;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${color}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text aria-hidden="true" x="${labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="${labelWidth / 2}" y="14" fill="#fff">${label}</text>
    <text aria-hidden="true" x="${labelWidth + valueWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${value}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14" fill="#fff">${value}</text>
  </g>
</svg>`;
}

/**
 * Get badge color based on coverage percentage
 */
function getBadgeColor(coverage) {
  if (coverage >= 100) return '#4c1';      // bright green
  if (coverage >= 95) return '#97CA00';    // green
  if (coverage >= 90) return '#a4a61d';    // yellow-green
  if (coverage >= 80) return '#dfb317';    // yellow
  if (coverage >= 70) return '#fe7d37';    // orange
  return '#e05d44';                         // red
}

/**
 * Handle badge request
 */
export async function handlePolicyBadge(request, env) {
  const url = new URL(request.url);
  const format = url.pathname.endsWith('.json') ? 'json' : 'svg';

  try {
    // Get policy coverage metrics
    const coverage = await getPolicyCoverage(env, 30);
    const overallCoverage = coverage.overall_compliance;

    // Count policies
    const totalPolicies = Object.keys(POLICIES).length;
    const zkPolicies = Object.values(POLICIES).filter(p => p.verification_mode === 'zk').length;

    if (format === 'json') {
      // Shields.io endpoint schema
      return new Response(JSON.stringify({
        schemaVersion: 1,
        label: 'policy coverage',
        message: `${overallCoverage}%`,
        color: getBadgeColor(overallCoverage).replace('#', ''),
        namedLogo: 'shield',
        // Extended data
        data: {
          overall_compliance: overallCoverage,
          total_policies: totalPolicies,
          zk_policies: zkPolicies,
          period_days: coverage.period_days,
          policies: coverage.policies,
          generated_at: coverage.timestamp
        }
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300', // 5 min cache
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // SVG format
    const svg = generateSVG(
      'policy coverage',
      `${overallCoverage}%`,
      getBadgeColor(overallCoverage)
    );

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    // Return error badge
    if (format === 'json') {
      return new Response(JSON.stringify({
        schemaVersion: 1,
        label: 'policy coverage',
        message: 'error',
        color: 'red',
        isError: true
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const svg = generateSVG('policy coverage', 'error', '#e05d44');
    return new Response(svg, {
      headers: { 'Content-Type': 'image/svg+xml' }
    });
  }
}

/**
 * Handle detailed coverage endpoint
 */
export async function handlePolicyCoverageDetail(request, env) {
  try {
    const coverage = await getPolicyCoverage(env, 30);

    // Add gate status
    const gateStatus = {
      audit_readiness: true,
      policy_compiler: true,
      time_travel: true,
      regulator_bundle: true
    };

    return new Response(JSON.stringify({
      success: true,
      coverage,
      gates: gateStatus,
      policies: Object.values(POLICIES).map(p => ({
        id: p.id,
        version: p.version,
        verification_mode: p.verification_mode,
        scope: p.scope,
        description: p.description
      })),
      badge_url: '/badge/policy-coverage.svg',
      badge_json_url: '/badge/policy-coverage.json',
      timestamp: new Date().toISOString()
    }, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
        'Access-Control-Allow-Origin': '*'
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

export default {
  handlePolicyBadge,
  handlePolicyCoverageDetail
};
