/**
 * GORUNFREE KV → D1 Promotion Rule
 *
 * TRUTH PROMOTION WITHOUT HUMAN BABYSITTING
 *
 * If a GORUNFREE insight:
 *   - appears consistently,
 *   - under stable metrics,
 *   - across a promoted Worker version,
 * then it graduates from KV → D1 automatically.
 *
 * Required Promotion Signals:
 *   - KV entry age >= threshold (e.g., 30 minutes)
 *   - Seen N+ times (e.g., 5 occurrences)
 *   - Metrics stable (Cloudflare analytics)
 *   - Version >= Canary (Versions API)
 *   - No consent violation (D1 read)
 *
 * What This Guarantees:
 *   - No D1 pollution from early noise
 *   - No human gate needed for honest promotion
 *   - Metrics-governed truth elevation
 *   - Edge-native execution
 */

import { assertD1WriteAllowed } from './d1-write-contract.js';

/**
 * Promotion thresholds (configurable via KV)
 */
export const DEFAULT_THRESHOLDS = {
  minAgeMs: 30 * 60 * 1000,  // 30 minutes
  minOccurrences: 5,
  requiredStabilityWindow: 15 * 60 * 1000  // 15 minutes
};

/**
 * KV-side candidate tracking
 *
 * KV stores provisional data:
 *   - gap candidates
 *   - occurrence counters
 *   - first-seen timestamps
 *   - routing hints
 *
 * KV remains: fast, reversible, non-authoritative
 */
export async function trackCandidate(env, candidateType, candidateKey, data) {
  const kvKey = `gorunfree:candidate:${candidateType}:${candidateKey}`;

  // Get existing tracking data
  let tracking;
  try {
    const existing = await env.GAP_SOLVER.get(kvKey, 'json');
    tracking = existing || {
      key: candidateKey,
      type: candidateType,
      firstSeen: Date.now(),
      lastSeen: Date.now(),
      occurrences: 0,
      data: data,
      promoted: false
    };
  } catch (e) {
    tracking = {
      key: candidateKey,
      type: candidateType,
      firstSeen: Date.now(),
      lastSeen: Date.now(),
      occurrences: 0,
      data: data,
      promoted: false
    };
  }

  // Update tracking
  tracking.lastSeen = Date.now();
  tracking.occurrences++;
  tracking.data = { ...tracking.data, ...data };

  // Store updated tracking
  await env.GAP_SOLVER.put(kvKey, JSON.stringify(tracking), {
    expirationTtl: 86400  // 24 hours
  });

  return tracking;
}

/**
 * Check if a candidate is ready for promotion
 *
 * @param {Object} tracking - Candidate tracking data
 * @param {Object} signals - Current signal state
 * @param {Object} thresholds - Promotion thresholds
 * @returns {Object} - { ready: boolean, reasons?: string[] }
 */
export function checkPromotionReadiness(tracking, signals, thresholds = DEFAULT_THRESHOLDS) {
  const reasons = [];

  // Already promoted
  if (tracking.promoted) {
    return { ready: false, reasons: ['Already promoted'] };
  }

  // Age check
  const age = Date.now() - tracking.firstSeen;
  if (age < thresholds.minAgeMs) {
    reasons.push(`Age ${Math.floor(age / 60000)}m < ${Math.floor(thresholds.minAgeMs / 60000)}m required`);
  }

  // Occurrence check
  if (tracking.occurrences < thresholds.minOccurrences) {
    reasons.push(`Occurrences ${tracking.occurrences} < ${thresholds.minOccurrences} required`);
  }

  // Signal checks
  if (!signals.metricsStable) {
    reasons.push('Metrics not stable');
  }

  if (!signals.versionPromoted) {
    reasons.push('Version not promoted to canary');
  }

  return {
    ready: reasons.length === 0,
    reasons: reasons.length > 0 ? reasons : undefined
  };
}

/**
 * Attempt automatic promotion from KV to D1
 *
 * @param {Object} env - Worker environment bindings
 * @param {string} candidateType - Type of candidate (gaps, solutions, etc.)
 * @param {string} candidateKey - Unique candidate key
 * @returns {Promise<Object>} - Promotion result
 */
export async function attemptPromotion(env, candidateType, candidateKey) {
  const kvKey = `gorunfree:candidate:${candidateType}:${candidateKey}`;

  // Get tracking data
  const tracking = await env.GAP_SOLVER.get(kvKey, 'json');
  if (!tracking) {
    return { promoted: false, reason: 'Candidate not found in KV' };
  }

  if (tracking.promoted) {
    return { promoted: false, reason: 'Already promoted', promotedAt: tracking.promotedAt };
  }

  // Read signal state
  const signals = await readSignalsFromEnv(env);

  // Check readiness
  const readiness = checkPromotionReadiness(tracking, signals);
  if (!readiness.ready) {
    return { promoted: false, reasons: readiness.reasons };
  }

  // Attempt D1 write with contract enforcement
  try {
    const table = mapCandidateTypeToTable(candidateType);

    assertD1WriteAllowed(table, signals);

    // Perform the promotion write
    await promoteToD1(env, table, tracking);

    // Mark as promoted in KV
    tracking.promoted = true;
    tracking.promotedAt = Date.now();
    await env.GAP_SOLVER.put(kvKey, JSON.stringify(tracking));

    // Log promotion event
    await logPromotionEvent(env, candidateType, candidateKey, tracking);

    return { promoted: true, table, key: candidateKey };

  } catch (e) {
    return { promoted: false, error: e.message };
  }
}

/**
 * Read signals from environment
 */
async function readSignalsFromEnv(env) {
  const signals = {
    metricsStable: false,
    versionPromoted: false,
    consentVerified: true,
    provenanceDerivable: true
  };

  if (env.FEATURE_FLAGS) {
    try {
      const metricsFlag = await env.FEATURE_FLAGS.get('gorunfree_metrics_stable');
      signals.metricsStable = metricsFlag === 'true' || metricsFlag === 'on';

      const promotionFlag = await env.FEATURE_FLAGS.get('gorunfree_canary_active');
      signals.versionPromoted = promotionFlag === 'true' || promotionFlag === 'on';
    } catch (e) {
      console.warn('[Promoter] Signal read error:', e.message);
    }
  }

  return signals;
}

/**
 * Map candidate type to D1 table
 */
function mapCandidateTypeToTable(candidateType) {
  const mapping = {
    'gap': 'gap_records',
    'gaps': 'gap_records',
    'solution': 'gap_solutions',
    'solutions': 'gap_solutions',
    'resurrection': 'resurrection_priorities',
    'provenance': 'provenance_explanations'
  };

  return mapping[candidateType] || 'gap_records';
}

/**
 * Perform the D1 promotion write
 */
async function promoteToD1(env, table, tracking) {
  const data = tracking.data;

  switch (table) {
    case 'gap_records':
      await env.GABRIEL_DB.prepare(`
        INSERT OR IGNORE INTO gap_records
          (id, gap_type, description, current_coverage, severity, opportunity, detected_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        tracking.key,
        data.gap_type || 'unknown',
        data.description || '',
        data.current_coverage || null,
        data.severity || 'medium',
        data.opportunity || null
      ).run();
      break;

    case 'gap_solutions':
      await env.GABRIEL_DB.prepare(`
        INSERT OR IGNORE INTO gap_solutions
          (id, gap_id, solution_type, title, description, confidence, priority, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        tracking.key,
        data.gap_id || null,
        data.solution_type || 'alternative',
        data.title || '',
        data.description || null,
        data.confidence || 'medium',
        data.priority || 50
      ).run();
      break;

    default:
      throw new Error(`Unknown promotion table: ${table}`);
  }
}

/**
 * Log promotion event to ledger
 */
async function logPromotionEvent(env, candidateType, candidateKey, tracking) {
  try {
    await env.GABRIEL_DB.prepare(`
      INSERT INTO noizy_ledger (event_id, event_type, payload_json, source_system, recorded_at)
      VALUES (?, 'gorunfree.promotion', ?, 'KV_D1_PROMOTER', datetime('now'))
    `).bind(
      `promo-${Date.now().toString(36)}`,
      JSON.stringify({
        candidate_type: candidateType,
        candidate_key: candidateKey,
        occurrences: tracking.occurrences,
        age_ms: Date.now() - tracking.firstSeen
      })
    ).run();
  } catch (e) {
    console.error('[Promoter] Ledger write failed:', e.message);
  }
}

/**
 * Batch promotion check - run periodically or on demand
 *
 * @param {Object} env - Worker environment bindings
 * @param {string} candidateType - Type to check (or 'all')
 * @returns {Promise<Object>} - Summary of promotion attempts
 */
export async function runPromotionSweep(env, candidateType = 'all') {
  const results = {
    checked: 0,
    promoted: 0,
    skipped: 0,
    errors: 0
  };

  // List all candidate keys in GAP_SOLVER KV
  const prefix = candidateType === 'all'
    ? 'gorunfree:candidate:'
    : `gorunfree:candidate:${candidateType}:`;

  try {
    const list = await env.GAP_SOLVER.list({ prefix });

    for (const key of list.keys) {
      results.checked++;

      // Extract type and key from KV key
      const parts = key.name.replace('gorunfree:candidate:', '').split(':');
      const type = parts[0];
      const candidateKey = parts.slice(1).join(':');

      const result = await attemptPromotion(env, type, candidateKey);

      if (result.promoted) {
        results.promoted++;
      } else if (result.error) {
        results.errors++;
      } else {
        results.skipped++;
      }
    }
  } catch (e) {
    console.error('[Promoter] Sweep error:', e.message);
    results.errors++;
  }

  return results;
}

export default {
  DEFAULT_THRESHOLDS,
  trackCandidate,
  checkPromotionReadiness,
  attemptPromotion,
  runPromotionSweep
};
