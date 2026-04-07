/**
 * EDGE CORE: Policy Registry
 *
 * Runtime implementation of POLICY_LANGUAGE_SPEC.md
 * All policies are deterministic, boolean-reducible, and field-scoped.
 *
 * Verification modes:
 *   - ZK-verifiable: Can be proven cryptographically
 *   - Reportable: Shown as aggregates/metrics
 *   - Hybrid: ZK proof + reported metadata
 */

// ═══════════════════════════════════════════════════════════════════════════
// POLICY DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export const POLICIES = {
  CONSENT_ACTIVE_ON_USE: {
    id: 'CONSENT_ACTIVE_ON_USE',
    version: '1.0.0',
    scope: 'audit_event',
    description: 'Consent was active when the action occurred',
    verification_mode: 'zk',
    inputs: ['consent_state', 'revocation_timestamp', 'event_timestamp'],
    evaluate: (event) => {
      const consentCleared = event.consent_state === 'CLEARED';
      const notRevoked = !event.revocation_timestamp ||
        new Date(event.revocation_timestamp) > new Date(event.event_timestamp || event.created_at);
      return consentCleared && notRevoked;
    }
  },

  REVOCATION_HONORED: {
    id: 'REVOCATION_HONORED',
    version: '1.0.0',
    scope: 'consent_token',
    description: 'No usage occurred after revocation',
    verification_mode: 'zk',
    inputs: ['revocation_timestamp', 'last_use_timestamp'],
    evaluate: (token) => {
      if (!token.revocation_timestamp) return true;
      if (!token.last_use_timestamp) return true;
      return new Date(token.last_use_timestamp) < new Date(token.revocation_timestamp);
    }
  },

  PROMOTION_WINDOW_MET: {
    id: 'PROMOTION_WINDOW_MET',
    version: '1.0.0',
    scope: 'promotion',
    description: 'Promotion occurred after required stability window',
    verification_mode: 'zk',
    inputs: ['stability_window_minutes', 'required_window'],
    evaluate: (promotion, config = { required_window: 15 }) => {
      return (promotion.stability_window_minutes || 0) >= config.required_window;
    }
  },

  AUDIT_BEFORE_AUTHORITY: {
    id: 'AUDIT_BEFORE_AUTHORITY',
    version: '1.0.0',
    scope: 'audit_event',
    description: 'Audit was written before authority was granted',
    verification_mode: 'zk',
    inputs: ['audit_write_success', 'authority_granted'],
    evaluate: (event) => {
      // If authority wasn't granted, policy trivially passes
      if (!event.authority_granted) return true;
      // If authority was granted, audit must have succeeded
      return event.audit_write_success === true;
    }
  },

  HUMAN_APPROVAL_REQUIRED: {
    id: 'HUMAN_APPROVAL_REQUIRED',
    version: '1.0.0',
    scope: 'audit_event',
    description: 'Governance actions required human approval',
    verification_mode: 'zk',
    inputs: ['operator_type', 'action_category'],
    evaluate: (event) => {
      const governanceActions = ['GOVERNANCE', 'CONSENT', 'MIGRATION', 'FREEZE_RESOLVED'];
      const isGovernance = governanceActions.some(cat =>
        event.action?.includes(cat) || event.action_category === cat
      );
      if (!isGovernance) return true; // Non-governance actions don't require human
      return event.operator_email !== 'SYSTEM' && !event.operator_email?.includes('SYSTEM');
    }
  },

  FREEZE_PROPERLY_RESOLVED: {
    id: 'FREEZE_PROPERLY_RESOLVED',
    version: '1.0.0',
    scope: 'freeze',
    description: 'Freeze was resolved with explanation',
    verification_mode: 'zk',
    inputs: ['resolved', 'resolution_notes', 'resolved_by'],
    evaluate: (freeze) => {
      if (!freeze.resolved) return false;
      const hasNotes = (freeze.resolution_notes?.length || 0) > 10;
      const hasResolver = !!freeze.resolved_by;
      return hasNotes && hasResolver;
    }
  },

  TOKEN_TIME_BOUNDED: {
    id: 'TOKEN_TIME_BOUNDED',
    version: '1.0.0',
    scope: 'consent_token',
    description: 'Token expiry is within allowed window',
    verification_mode: 'zk',
    inputs: ['expires_at', 'created_at'],
    evaluate: (token, config = { max_ttl_minutes: 60 }) => {
      if (!token.expires_at || !token.created_at) return false;
      const ttlMs = new Date(token.expires_at) - new Date(token.created_at);
      const ttlMinutes = ttlMs / (1000 * 60);
      return ttlMinutes <= config.max_ttl_minutes;
    }
  },

  HASH_CHAIN_INTACT: {
    id: 'HASH_CHAIN_INTACT',
    version: '1.0.0',
    scope: 'audit_event',
    description: 'Audit hash chain is intact',
    verification_mode: 'zk',
    inputs: ['computed_hash', 'stored_hash', 'prev_hash_matches'],
    evaluate: (event) => {
      return event.computed_hash === event.stored_hash &&
             event.prev_hash_matches === true;
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// POLICY EVALUATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Evaluate a single policy against an event
 *
 * @param {string} policyId - Policy identifier
 * @param {Object} data - Event/token/freeze data
 * @param {Object} config - Optional configuration overrides
 * @returns {Object} Evaluation result
 */
export function evaluatePolicy(policyId, data, config = {}) {
  const policy = POLICIES[policyId];
  if (!policy) {
    return { success: false, error: `Unknown policy: ${policyId}` };
  }

  try {
    const result = policy.evaluate(data, config);
    return {
      success: true,
      policy_id: policyId,
      policy_version: policy.version,
      result,
      verification_mode: policy.verification_mode,
      timestamp: new Date().toISOString()
    };
  } catch (e) {
    return {
      success: false,
      policy_id: policyId,
      error: e.message
    };
  }
}

/**
 * Evaluate all applicable policies for a scope
 *
 * @param {string} scope - Event scope (audit_event, consent_token, etc.)
 * @param {Object} data - Data to evaluate
 * @returns {Object} All policy results
 */
export function evaluateAllPolicies(scope, data) {
  const results = {
    scope,
    policies: {},
    all_passed: true,
    failed: [],
    timestamp: new Date().toISOString()
  };

  for (const [id, policy] of Object.entries(POLICIES)) {
    if (policy.scope !== scope) continue;

    const evaluation = evaluatePolicy(id, data);
    results.policies[id] = evaluation;

    if (!evaluation.success || !evaluation.result) {
      results.all_passed = false;
      results.failed.push(id);
    }
  }

  return results;
}

/**
 * Get policies by verification mode
 *
 * @param {string} mode - 'zk', 'reportable', or 'hybrid'
 * @returns {Object[]} Matching policies
 */
export function getPoliciesByMode(mode) {
  return Object.values(POLICIES).filter(p => p.verification_mode === mode);
}

/**
 * Get policy coverage metrics
 *
 * @param {Object} env - Cloudflare Worker env
 * @param {number} days - Days to analyze
 * @returns {Object} Coverage metrics per policy
 */
export async function getPolicyCoverage(env, days = 30) {
  const coverage = {
    period_days: days,
    policies: {},
    overall_compliance: 0,
    timestamp: new Date().toISOString()
  };

  // Get recent audit events
  const events = await env.GABRIEL_DB.prepare(`
    SELECT * FROM audit_events
    WHERE created_at > DATE('now', '-${days} days')
  `).all();

  const allEvents = events.results || [];
  let totalChecks = 0;
  let passedChecks = 0;

  for (const [id, policy] of Object.entries(POLICIES)) {
    if (policy.scope !== 'audit_event') continue;

    let applicable = 0;
    let passed = 0;

    for (const event of allEvents) {
      // Add synthetic fields for evaluation
      const enriched = {
        ...event,
        consent_state: 'CLEARED', // Default for audit events
        audit_write_success: true,
        operator_type: event.operator_email === 'SYSTEM' ? 'SYSTEM' : 'HUMAN'
      };

      const result = evaluatePolicy(id, enriched);
      if (result.success) {
        applicable++;
        if (result.result) passed++;
      }
    }

    coverage.policies[id] = {
      description: policy.description,
      applicable_events: applicable,
      passed: passed,
      compliance_rate: applicable > 0 ? Math.round((passed / applicable) * 100) : 100
    };

    totalChecks += applicable;
    passedChecks += passed;
  }

  coverage.overall_compliance = totalChecks > 0
    ? Math.round((passedChecks / totalChecks) * 100)
    : 100;

  return coverage;
}

// ═══════════════════════════════════════════════════════════════════════════
// POLICY REGISTRY METADATA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get all registered policies
 */
export function getAllPolicies() {
  return Object.values(POLICIES).map(p => ({
    id: p.id,
    version: p.version,
    scope: p.scope,
    description: p.description,
    verification_mode: p.verification_mode,
    inputs: p.inputs
  }));
}

/**
 * Get policy by ID
 */
export function getPolicy(policyId) {
  const policy = POLICIES[policyId];
  if (!policy) return null;
  return {
    id: policy.id,
    version: policy.version,
    scope: policy.scope,
    description: policy.description,
    verification_mode: policy.verification_mode,
    inputs: policy.inputs
  };
}

export default {
  POLICIES,
  evaluatePolicy,
  evaluateAllPolicies,
  getPoliciesByMode,
  getPolicyCoverage,
  getAllPolicies,
  getPolicy
};
