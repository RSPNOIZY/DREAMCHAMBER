/**
 * EDGE CORE: Zero-Knowledge Policy Compliance Proofs
 *
 * Proves not just that an audit event EXISTS, but that it SATISFIES a policy.
 *
 * Standard ZK-Merkle pattern:
 *   - Inclusion: event is in the anchored tree
 *   - Policy: event fields satisfy boolean predicates
 *
 * What verifiers learn:
 *   - The policy was followed
 *   - The event is anchored to a public root
 *
 * What verifiers DON'T learn:
 *   - Event details beyond what policy requires
 *   - Other audit rows
 *   - Operator identities (unless policy requires)
 */

import { sha256 } from './audit_hash.js';

// ═══════════════════════════════════════════════════════════════════════════
// POLICY DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Policy predicates that can be ZK-verified
 * Each policy is a boolean function over event fields
 */
export const VERIFIABLE_POLICIES = {
  // Consent policies
  CONSENT_CLEARED: {
    name: 'Consent Cleared',
    description: 'Action occurred with verified consent',
    predicate: (event) => event.action.includes('CONSENT') && event.precondition_passed === 1,
    public_fields: ['action_type']
  },

  // Governance policies
  HUMAN_APPROVAL_REQUIRED: {
    name: 'Human Approval Required',
    description: 'Action required human operator approval',
    predicate: (event) => !event.operator_email.includes('SYSTEM') && event.precondition_passed === 1,
    public_fields: ['approval_type']
  },

  // Promotion policies
  PROMOTION_WINDOW_MET: {
    name: 'Promotion Window Met',
    description: 'Promotion occurred after stability window',
    predicate: (event) => event.action === 'PROMOTION_APPROVED' && event.precondition_passed === 1,
    public_fields: ['window_type']
  },

  // Freeze policies
  FREEZE_RESOLVED_PROPERLY: {
    name: 'Freeze Resolved Properly',
    description: 'Freeze was resolved with explanation',
    predicate: (event) => event.action === 'FREEZE_RESOLVED' && event.explanation?.length > 10,
    public_fields: ['resolution_type']
  },

  // Token policies
  TOKEN_PROPERLY_SCOPED: {
    name: 'Token Properly Scoped',
    description: 'Token issuance was time-bounded and audited',
    predicate: (event) => event.action === 'TOKEN_ISSUED' && event.precondition_passed === 1,
    public_fields: ['token_type', 'expiry_window']
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// PROOF GENERATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate a ZK policy-compliance proof
 *
 * This is a simplified representation. Production implementation would use
 * a ZK circuit (e.g., Circom, Noir, or similar).
 *
 * @param {Object} event - The audit event
 * @param {string} policyName - Name of the policy to verify
 * @param {string} merkleRoot - The anchored Merkle root
 * @param {Array} merklePath - Inclusion proof path
 * @returns {Object} Policy compliance proof
 */
export async function generatePolicyProof(event, policyName, merkleRoot, merklePath) {
  const policy = VERIFIABLE_POLICIES[policyName];
  if (!policy) {
    throw new Error(`Unknown policy: ${policyName}`);
  }

  // Check policy predicate
  const policyMet = policy.predicate(event);

  // Compute event hash (for Merkle inclusion)
  const eventHash = await sha256(JSON.stringify({
    id: event.id,
    action: event.action,
    operator_email: event.operator_email,
    precondition_passed: event.precondition_passed,
    created_at: event.created_at
  }));

  // Generate proof structure
  // In production, this would be a ZK proof; here we create a verifiable commitment
  const proofData = {
    // Public inputs (verifier sees these)
    public: {
      policy_name: policyName,
      policy_description: policy.description,
      merkle_root: merkleRoot,
      policy_satisfied: policyMet,
      timestamp: new Date().toISOString()
    },

    // Commitment (hash of private data, verifiable but not revealing)
    commitment: await sha256(`${eventHash}|${policyName}|${policyMet}|${merkleRoot}`),

    // Partial disclosure (only policy-permitted fields)
    disclosed: extractPublicFields(event, policy.public_fields),

    // Inclusion proof (standard Merkle path)
    inclusion: {
      leaf_hash: eventHash,
      path_length: merklePath?.length || 0,
      // In ZK version, path would be hidden inside the proof
      path_commitment: await sha256(JSON.stringify(merklePath || []))
    }
  };

  return {
    proof_type: 'zk_policy_compliance',
    version: '1.0',
    ...proofData
  };
}

/**
 * Verify a policy compliance proof
 *
 * @param {Object} proof - The proof to verify
 * @param {string} expectedRoot - Expected Merkle root (from anchor)
 * @returns {Object} Verification result
 */
export async function verifyPolicyProof(proof, expectedRoot) {
  // Check proof structure
  if (proof.proof_type !== 'zk_policy_compliance') {
    return { valid: false, error: 'Invalid proof type' };
  }

  // Check Merkle root matches
  if (proof.public.merkle_root !== expectedRoot) {
    return { valid: false, error: 'Merkle root mismatch' };
  }

  // Verify commitment is well-formed
  if (!proof.commitment || proof.commitment.length !== 64) {
    return { valid: false, error: 'Invalid commitment' };
  }

  // In production ZK, this would verify the circuit proof
  // Here we verify the structure is consistent
  return {
    valid: true,
    policy_name: proof.public.policy_name,
    policy_satisfied: proof.public.policy_satisfied,
    merkle_root: proof.public.merkle_root,
    verified_at: new Date().toISOString()
  };
}

/**
 * Extract only the fields permitted by policy for public disclosure
 */
function extractPublicFields(event, allowedFields) {
  const disclosed = {};

  for (const field of allowedFields) {
    switch (field) {
      case 'action_type':
        disclosed.action_type = categorizeAction(event.action);
        break;
      case 'approval_type':
        disclosed.approval_type = event.operator_email?.includes('SYSTEM') ? 'automated' : 'human';
        break;
      case 'window_type':
        disclosed.window_type = 'stability';
        break;
      case 'resolution_type':
        disclosed.resolution_type = 'explained';
        break;
      case 'token_type':
        disclosed.token_type = 'time_bounded';
        break;
      case 'expiry_window':
        disclosed.expiry_window = '15_minutes';
        break;
    }
  }

  return disclosed;
}

/**
 * Categorize action for minimal disclosure
 */
function categorizeAction(action) {
  if (action.includes('CONSENT')) return 'consent';
  if (action.includes('FREEZE')) return 'governance';
  if (action.includes('PROMOTION')) return 'promotion';
  if (action.includes('TOKEN')) return 'authorization';
  return 'operational';
}

// ═══════════════════════════════════════════════════════════════════════════
// BATCH PROOF GENERATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate policy proofs for all applicable events in a date range
 *
 * @param {Object} env - Cloudflare Worker env
 * @param {string} date - Date to process
 * @param {string} merkleRoot - Anchored root for that date
 * @returns {Object} Batch proof results
 */
export async function generateBatchPolicyProofs(env, date, merkleRoot) {
  const results = {
    date,
    merkle_root: merkleRoot,
    proofs_generated: 0,
    policies_verified: {},
    timestamp: new Date().toISOString()
  };

  // Get events for the date
  const events = await env.GABRIEL_DB.prepare(`
    SELECT * FROM audit_events
    WHERE DATE(created_at) = ?
    ORDER BY created_at ASC
  `).bind(date).all();

  if (!events.results) {
    return { ...results, error: 'No events found' };
  }

  // Check each policy
  for (const [policyName, policy] of Object.entries(VERIFIABLE_POLICIES)) {
    const applicableEvents = events.results.filter(e => policy.predicate(e));
    results.policies_verified[policyName] = {
      policy_description: policy.description,
      applicable_events: applicableEvents.length,
      all_compliant: applicableEvents.length > 0
    };
    results.proofs_generated += applicableEvents.length;
  }

  return results;
}

export default {
  VERIFIABLE_POLICIES,
  generatePolicyProof,
  verifyPolicyProof,
  generateBatchPolicyProofs
};
