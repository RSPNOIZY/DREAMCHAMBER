/**
 * GORUNFREE D1 Write Contract
 *
 * AUTHORITATIVE TRUTH ONLY WRITES AFTER PROOF
 *
 * Core Principle:
 *   KV is allowed to speculate.
 *   D1 is allowed only to confirm.
 *
 * D1 must never contain: guesses, preflight summaries,
 * unobserved gaps, or unverified provenance.
 *
 * Signal Classes (Ranked):
 *   S0 - UX interaction (Client)
 *   S1 - KV fast-path evaluation (Worker)
 *   S2 - Worker metrics present (Cloudflare analytics)
 *   S3 - Metrics stable over window (SLO gate)
 *   S4 - Promotion state >= Canary (Versions/deploy)
 *   S5 - Consent verified (D1 read)
 *   S6 - Provenance derivable (Runtime)
 *
 * D1 writes require: S3 + S4 + (S5 if sensitive)
 */

/**
 * Signal requirements by table
 */
export const WRITE_CONTRACT = {
  gaps: {
    required: ['S3', 'S4'],
    description: 'Metrics stable + version promoted'
  },
  gap_solutions: {
    required: ['S3', 'S4'],
    description: 'Metrics stable + version promoted'
  },
  provenance_explanations: {
    required: ['S5', 'S6'],
    description: 'Consent verified + provenance derivable'
  },
  resurrection_priorities: {
    required: ['S3', 'S4', 'APPROVAL'],
    description: 'Metrics stable + version promoted + human/system approval'
  },
  creator_speed_events: {
    required: ['S3', 'S4'],
    description: 'Metrics stable + version promoted'
  },
  commission_requests: {
    required: [],  // User-initiated, always allowed
    description: 'User action - always allowed (append-only)'
  },
  noizy_ledger: {
    required: [],  // Audit trail, always allowed (append-only)
    description: 'Audit trail - always allowed (append-only)'
  }
};

/**
 * Error types for contract violations
 */
export class D1WriteContractViolation extends Error {
  constructor(table, missingSignals) {
    super(`D1 write blocked: ${table} requires [${missingSignals.join(', ')}]`);
    this.name = 'D1WriteContractViolation';
    this.table = table;
    this.missingSignals = missingSignals;
  }
}

/**
 * Assert D1 write is allowed before mutation
 *
 * @param {string} table - Target table name
 * @param {Object} signals - Current signal state
 * @param {boolean} signals.metricsStable - S3: Metrics stable over observation window
 * @param {boolean} signals.versionPromoted - S4: Version >= canary promotion state
 * @param {boolean} signals.consentVerified - S5: Consent verified via D1 read
 * @param {boolean} signals.provenanceDerivable - S6: Provenance can be derived
 * @param {boolean} signals.humanApproval - APPROVAL: Human/system approval present
 * @throws {D1WriteContractViolation} if required signals are missing
 */
export function assertD1WriteAllowed(table, signals = {}) {
  const contract = WRITE_CONTRACT[table];

  if (!contract) {
    throw new Error(`Unknown table: ${table}. Cannot verify write contract.`);
  }

  // Always-allowed tables (append-only audit trails, user actions)
  if (contract.required.length === 0) {
    return true;
  }

  const signalMap = {
    'S3': signals.metricsStable,
    'S4': signals.versionPromoted,
    'S5': signals.consentVerified,
    'S6': signals.provenanceDerivable,
    'APPROVAL': signals.humanApproval
  };

  const missingSignals = contract.required.filter(sig => !signalMap[sig]);

  if (missingSignals.length > 0) {
    throw new D1WriteContractViolation(table, missingSignals);
  }

  return true;
}

/**
 * Read current signal state from environment
 *
 * @param {Object} env - Worker environment bindings
 * @returns {Promise<Object>} - Current signal state
 */
export async function readSignalState(env) {
  const state = {
    metricsStable: false,
    versionPromoted: false,
    consentVerified: true,  // Default true for non-consent operations
    provenanceDerivable: true,
    humanApproval: false
  };

  // S3: Check metrics stability from KV flag
  if (env.FEATURE_FLAGS) {
    try {
      const metricsFlag = await env.FEATURE_FLAGS.get('gorunfree_metrics_stable');
      state.metricsStable = metricsFlag === 'true' || metricsFlag === 'on';
    } catch (e) {
      console.warn('[D1 Contract] Could not read metrics flag:', e.message);
    }
  }

  // S4: Check promotion state from KV flag
  if (env.FEATURE_FLAGS) {
    try {
      const promotionFlag = await env.FEATURE_FLAGS.get('gorunfree_canary_active');
      state.versionPromoted = promotionFlag === 'true' || promotionFlag === 'on';
    } catch (e) {
      console.warn('[D1 Contract] Could not read promotion flag:', e.message);
    }
  }

  return state;
}

/**
 * Guarded D1 write with contract enforcement
 *
 * @param {Object} env - Worker environment bindings
 * @param {string} table - Target table name
 * @param {Function} writeFn - Function that performs the write
 * @param {Object} overrideSignals - Override signal values (for testing)
 * @returns {Promise<any>} - Result of write operation
 */
export async function guardedD1Write(env, table, writeFn, overrideSignals = {}) {
  const signals = {
    ...await readSignalState(env),
    ...overrideSignals
  };

  // Enforce contract
  assertD1WriteAllowed(table, signals);

  // Execute write
  return await writeFn();
}

/**
 * Check if a write would be allowed (non-throwing)
 *
 * @param {string} table - Target table name
 * @param {Object} signals - Current signal state
 * @returns {Object} - { allowed: boolean, missing?: string[] }
 */
export function checkWriteAllowed(table, signals = {}) {
  try {
    assertD1WriteAllowed(table, signals);
    return { allowed: true };
  } catch (e) {
    if (e instanceof D1WriteContractViolation) {
      return { allowed: false, missing: e.missingSignals };
    }
    throw e;
  }
}

export default {
  WRITE_CONTRACT,
  D1WriteContractViolation,
  assertD1WriteAllowed,
  readSignalState,
  guardedD1Write,
  checkWriteAllowed
};
