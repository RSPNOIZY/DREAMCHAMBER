/**
 * TRUST ENGINE v1.1 — Custom Policy SDK
 *
 * Allows partners to define, register, and enforce custom policies
 * while maintaining compatibility with NOIZY governance infrastructure.
 *
 * "Your rules. Our enforcement."
 */

import crypto from 'crypto';
import { POLICIES, evaluatePolicy } from '../edge-core/policy_registry.js';

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM POLICY SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Policy schema validator
 */
const POLICY_SCHEMA = {
  required: ['id', 'version', 'scope', 'description', 'verification_mode', 'inputs', 'evaluate'],
  scopes: ['audit_event', 'consent_token', 'promotion', 'freeze', 'custom'],
  verification_modes: ['zk', 'reportable', 'hybrid', 'partner'],
  max_id_length: 64,
  max_description_length: 256,
  max_inputs: 20
};

/**
 * Validate custom policy definition
 */
export function validatePolicyDefinition(policy) {
  const errors = [];

  // Check required fields
  for (const field of POLICY_SCHEMA.required) {
    if (!policy[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate ID format
  if (policy.id) {
    if (policy.id.length > POLICY_SCHEMA.max_id_length) {
      errors.push(`Policy ID exceeds ${POLICY_SCHEMA.max_id_length} characters`);
    }
    if (!/^[A-Z][A-Z0-9_]*$/.test(policy.id)) {
      errors.push('Policy ID must be UPPER_SNAKE_CASE');
    }
    if (POLICIES[policy.id]) {
      errors.push(`Policy ID '${policy.id}' conflicts with built-in policy`);
    }
  }

  // Validate scope
  if (policy.scope && !POLICY_SCHEMA.scopes.includes(policy.scope)) {
    errors.push(`Invalid scope: ${policy.scope}. Must be one of: ${POLICY_SCHEMA.scopes.join(', ')}`);
  }

  // Validate verification mode
  if (policy.verification_mode && !POLICY_SCHEMA.verification_modes.includes(policy.verification_mode)) {
    errors.push(`Invalid verification_mode: ${policy.verification_mode}`);
  }

  // Validate inputs
  if (policy.inputs) {
    if (!Array.isArray(policy.inputs)) {
      errors.push('inputs must be an array');
    } else if (policy.inputs.length > POLICY_SCHEMA.max_inputs) {
      errors.push(`Too many inputs (max ${POLICY_SCHEMA.max_inputs})`);
    }
  }

  // Validate evaluate function
  if (policy.evaluate && typeof policy.evaluate !== 'function') {
    errors.push('evaluate must be a function');
  }

  // Check for ZK compatibility if claiming ZK
  if (policy.verification_mode === 'zk' && policy.evaluate) {
    const fnStr = policy.evaluate.toString();
    const zkProhibited = [/fetch\s*\(/, /Math\.random/, /Date\.now\s*\(/];
    for (const pattern of zkProhibited) {
      if (pattern.test(fnStr)) {
        errors.push(`ZK policy contains prohibited pattern: ${pattern.source}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM POLICY REGISTRY
// ═══════════════════════════════════════════════════════════════════════════

// Partner policy storage
const PARTNER_POLICIES = new Map();

/**
 * Register a custom policy
 */
export function registerCustomPolicy(partnerId, policy) {
  // Validate
  const validation = validatePolicyDefinition(policy);
  if (!validation.valid) {
    return {
      success: false,
      errors: validation.errors
    };
  }

  // Add partner namespace
  const namespacedId = `${partnerId.toUpperCase()}_${policy.id}`;
  const registeredPolicy = {
    ...policy,
    id: namespacedId,
    original_id: policy.id,
    partner_id: partnerId,
    registered_at: new Date().toISOString(),
    hash: crypto.createHash('sha256').update(JSON.stringify({
      id: policy.id,
      version: policy.version,
      inputs: policy.inputs,
      evaluate: policy.evaluate.toString()
    })).digest('hex').slice(0, 16)
  };

  // Store
  if (!PARTNER_POLICIES.has(partnerId)) {
    PARTNER_POLICIES.set(partnerId, new Map());
  }
  PARTNER_POLICIES.get(partnerId).set(namespacedId, registeredPolicy);

  return {
    success: true,
    policy_id: namespacedId,
    hash: registeredPolicy.hash,
    registered_at: registeredPolicy.registered_at
  };
}

/**
 * Get partner's registered policies
 */
export function getPartnerPolicies(partnerId) {
  const policies = PARTNER_POLICIES.get(partnerId);
  if (!policies) {
    return [];
  }
  return Array.from(policies.values()).map(p => ({
    id: p.id,
    original_id: p.original_id,
    version: p.version,
    scope: p.scope,
    description: p.description,
    verification_mode: p.verification_mode,
    inputs: p.inputs,
    registered_at: p.registered_at,
    hash: p.hash
  }));
}

/**
 * Evaluate a partner policy
 */
export function evaluatePartnerPolicy(partnerId, policyId, data, config = {}) {
  const policies = PARTNER_POLICIES.get(partnerId);
  if (!policies) {
    return { success: false, error: `Unknown partner: ${partnerId}` };
  }

  // Try namespaced ID first, then original
  let policy = policies.get(policyId);
  if (!policy) {
    const namespacedId = `${partnerId.toUpperCase()}_${policyId}`;
    policy = policies.get(namespacedId);
  }

  if (!policy) {
    return { success: false, error: `Unknown policy: ${policyId}` };
  }

  try {
    const result = policy.evaluate(data, config);
    return {
      success: true,
      policy_id: policy.id,
      policy_version: policy.version,
      partner_id: partnerId,
      result,
      verification_mode: policy.verification_mode,
      timestamp: new Date().toISOString()
    };
  } catch (e) {
    return {
      success: false,
      policy_id: policy.id,
      error: e.message
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// WHITE-LABEL CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * White-label configuration schema
 */
export const WHITE_LABEL_CONFIG = {
  // Branding
  branding: {
    name: null,           // Partner's product name
    logo_url: null,       // Partner's logo
    primary_color: null,  // Hex color
    domain: null          // Custom domain
  },

  // Features
  features: {
    custom_policies: true,
    c2pa_export: true,
    regulator_bundles: true,
    coverage_badges: true,
    chaos_tests: false    // Enterprise only
  },

  // Limits
  limits: {
    max_policies: 10,
    max_evaluations_per_day: 10000,
    max_bundle_exports_per_day: 100
  },

  // Endpoints
  endpoints: {
    verify_url_template: 'https://{domain}/trust/verify?proof={proof_id}',
    badge_url_template: 'https://{domain}/badge/coverage.svg',
    bundle_url_template: 'https://{domain}/trust/bundle/{bundle_id}'
  }
};

/**
 * Create white-label instance
 */
export function createWhiteLabelInstance(partnerId, config) {
  const instance = {
    partner_id: partnerId,
    created_at: new Date().toISOString(),
    config: {
      ...WHITE_LABEL_CONFIG,
      ...config,
      branding: { ...WHITE_LABEL_CONFIG.branding, ...config.branding },
      features: { ...WHITE_LABEL_CONFIG.features, ...config.features },
      limits: { ...WHITE_LABEL_CONFIG.limits, ...config.limits }
    },

    // Methods
    registerPolicy: (policy) => registerCustomPolicy(partnerId, policy),
    getPolicies: () => getPartnerPolicies(partnerId),
    evaluatePolicy: (policyId, data, cfg) => evaluatePartnerPolicy(partnerId, policyId, data, cfg),

    // Generate branded URLs
    getVerifyUrl: (proofId) => {
      const domain = instance.config.branding.domain || 'noizy.ai';
      return instance.config.endpoints.verify_url_template
        .replace('{domain}', domain)
        .replace('{proof_id}', proofId);
    },

    getBadgeUrl: () => {
      const domain = instance.config.branding.domain || 'noizy.ai';
      return instance.config.endpoints.badge_url_template
        .replace('{domain}', domain);
    }
  };

  return instance;
}

// ═══════════════════════════════════════════════════════════════════════════
// PARTNER INTEGRATION TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Splice integration template
 */
export const SPLICE_INTEGRATION = {
  partner_id: 'splice',
  policies: [
    {
      id: 'SAMPLE_ORIGIN_VERIFIED',
      version: '1.0.0',
      scope: 'custom',
      description: 'Sample origin is verified and licensed',
      verification_mode: 'zk',
      inputs: ['sample_id', 'origin_verified', 'license_valid'],
      evaluate: (data) => data.origin_verified === true && data.license_valid === true
    },
    {
      id: 'CREATOR_ROYALTY_SET',
      version: '1.0.0',
      scope: 'custom',
      description: 'Creator royalty percentage is set correctly',
      verification_mode: 'reportable',
      inputs: ['royalty_percentage', 'minimum_royalty'],
      evaluate: (data, config = { minimum_royalty: 50 }) => {
        return (data.royalty_percentage || 0) >= config.minimum_royalty;
      }
    }
  ]
};

/**
 * BandLab integration template
 */
export const BANDLAB_INTEGRATION = {
  partner_id: 'bandlab',
  policies: [
    {
      id: 'VOICE_CONSENT_ACTIVE',
      version: '1.0.0',
      scope: 'consent_token',
      description: 'Voice consent is active for collaboration',
      verification_mode: 'zk',
      inputs: ['consent_state', 'collaboration_id', 'expires_at'],
      evaluate: (data) => {
        if (data.consent_state !== 'ACTIVE') return false;
        if (data.expires_at && new Date(data.expires_at) < new Date()) return false;
        return true;
      }
    },
    {
      id: 'COLLAB_ATTRIBUTION_SET',
      version: '1.0.0',
      scope: 'custom',
      description: 'All collaborators are properly attributed',
      verification_mode: 'reportable',
      inputs: ['collaborators', 'attribution_complete'],
      evaluate: (data) => {
        return data.attribution_complete === true &&
               Array.isArray(data.collaborators) &&
               data.collaborators.length > 0;
      }
    }
  ]
};

/**
 * Output integration template
 */
export const OUTPUT_INTEGRATION = {
  partner_id: 'output',
  policies: [
    {
      id: 'REMIX_PROVENANCE_CHAIN',
      version: '1.0.0',
      scope: 'custom',
      description: 'Remix has complete provenance chain',
      verification_mode: 'zk',
      inputs: ['original_id', 'chain_complete', 'all_cleared'],
      evaluate: (data) => {
        return data.chain_complete === true && data.all_cleared === true;
      }
    },
    {
      id: 'STEMS_ORIGIN_TRACKED',
      version: '1.0.0',
      scope: 'custom',
      description: 'All stems have tracked origins',
      verification_mode: 'zk',
      inputs: ['stems', 'all_origins_known'],
      evaluate: (data) => {
        return data.all_origins_known === true &&
               Array.isArray(data.stems) &&
               data.stems.every(s => s.origin_id);
      }
    }
  ]
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default {
  validatePolicyDefinition,
  registerCustomPolicy,
  getPartnerPolicies,
  evaluatePartnerPolicy,
  createWhiteLabelInstance,
  WHITE_LABEL_CONFIG,
  SPLICE_INTEGRATION,
  BANDLAB_INTEGRATION,
  OUTPUT_INTEGRATION
};
