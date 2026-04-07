/**
 * NOIZY TRUST ENGINE™
 *
 * A productized governance substrate that other platforms can license, embed, or audit.
 * NOIZYFISH and NOIZYVOX are first-party reference implementations.
 *
 * "NOIZY doesn't just comply with trust standards.
 *  We build the systems that make trust enforceable."
 */

import { POLICIES, evaluatePolicy, evaluateAllPolicies, getPolicyCoverage, getAllPolicies } from '../edge-core/policy_registry.js';
import { generateC2PAManifest, generateNoizyProofAssertion } from '../edge-core/c2pa_proof_export.js';

// ═══════════════════════════════════════════════════════════════════════════
// TRUST ENGINE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const TRUST_ENGINE_VERSION = '1.0.0';
export const TRUST_ENGINE_NAME = 'NOIZY Trust Engine';

/**
 * Trust Engine capabilities (licensable modules)
 */
export const TRUST_ENGINE_MODULES = {
  POLICY_LANGUAGE: {
    id: 'policy-language',
    name: 'Policy Language Spec',
    description: 'Formal schema for ZK-verifiable governance policies',
    version: '1.0.0',
    docs_url: 'https://noizy.ai/trust-engine/docs/policy-language'
  },
  ZK_COMPILER: {
    id: 'zk-compiler',
    name: 'ZK Policy Compiler',
    description: 'Compile policies to verifiable circuits',
    version: '1.0.0',
    docs_url: 'https://noizy.ai/trust-engine/docs/zk-compiler'
  },
  AUDIT_GATE: {
    id: 'audit-gate',
    name: 'Audit Readiness Gate',
    description: 'Block deploys without audit infrastructure',
    version: '1.0.0',
    docs_url: 'https://noizy.ai/trust-engine/docs/audit-gate'
  },
  TIME_TRAVEL: {
    id: 'time-travel',
    name: 'Time-Travel Audit',
    description: 'Historical state verification with D1',
    version: '1.0.0',
    docs_url: 'https://noizy.ai/trust-engine/docs/time-travel'
  },
  REGULATOR_BUNDLE: {
    id: 'regulator-bundle',
    name: 'Regulator Bundle Generator',
    description: 'Compliance exports for EU/US regulators',
    version: '1.0.0',
    docs_url: 'https://noizy.ai/trust-engine/docs/regulator-bundle'
  },
  COVERAGE_BADGE: {
    id: 'coverage-badge',
    name: 'Policy Coverage Badge',
    description: 'Public verification badges',
    version: '1.0.0',
    docs_url: 'https://noizy.ai/trust-engine/docs/coverage-badge'
  },
  C2PA_EXPORT: {
    id: 'c2pa-export',
    name: 'C2PA Proof Export',
    description: 'Embed proofs in C2PA manifests',
    version: '1.0.0',
    docs_url: 'https://noizy.ai/trust-engine/docs/c2pa-export'
  },
  CHAOS_TEST: {
    id: 'chaos-test',
    name: 'Chaos Test Suite',
    description: 'Prove gates catch violations',
    version: '1.0.0',
    docs_url: 'https://noizy.ai/trust-engine/docs/chaos-test'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// TRUST ENGINE SDK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Trust Engine SDK - Licensable API
 */
export class TrustEngine {
  constructor(config = {}) {
    this.licensee = config.licensee || 'unlicensed';
    this.modules = config.modules || Object.keys(TRUST_ENGINE_MODULES);
    this.env = config.env || null;
    this.initialized = false;
  }

  /**
   * Initialize the Trust Engine
   */
  async initialize(env) {
    this.env = env;
    this.initialized = true;
    return {
      success: true,
      engine: TRUST_ENGINE_NAME,
      version: TRUST_ENGINE_VERSION,
      licensee: this.licensee,
      modules_enabled: this.modules.length
    };
  }

  /**
   * Get all available policies
   */
  getPolicies() {
    return getAllPolicies();
  }

  /**
   * Evaluate a policy against data
   */
  evaluatePolicy(policyId, data, config = {}) {
    return evaluatePolicy(policyId, data, config);
  }

  /**
   * Evaluate all policies for a scope
   */
  evaluateAllPolicies(scope, data) {
    return evaluateAllPolicies(scope, data);
  }

  /**
   * Get policy coverage metrics
   */
  async getCoverage(days = 30) {
    if (!this.env) {
      return { success: false, error: 'Engine not initialized with env' };
    }
    return getPolicyCoverage(this.env, days);
  }

  /**
   * Generate C2PA manifest with proofs
   */
  generateC2PAManifest(assetData, proofs) {
    return generateC2PAManifest(assetData, proofs);
  }

  /**
   * Generate proof assertion for C2PA
   */
  generateProofAssertion(proofData) {
    return generateNoizyProofAssertion(proofData);
  }

  /**
   * Get Trust Engine status
   */
  getStatus() {
    return {
      engine: TRUST_ENGINE_NAME,
      version: TRUST_ENGINE_VERSION,
      initialized: this.initialized,
      licensee: this.licensee,
      modules: this.modules.map(m => ({
        id: TRUST_ENGINE_MODULES[m]?.id || m,
        name: TRUST_ENGINE_MODULES[m]?.name || m,
        enabled: true
      })),
      policies: {
        total: Object.keys(POLICIES).length,
        zk_verifiable: Object.values(POLICIES).filter(p => p.verification_mode === 'zk').length
      },
      capabilities: {
        policy_evaluation: true,
        zk_proof_generation: true,
        c2pa_export: true,
        audit_verification: this.initialized,
        coverage_metrics: this.initialized
      }
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TRUST ENGINE API ROUTES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Handle Trust Engine API requests
 */
export async function handleTrustEngineAPI(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/trust-engine', '');

  // Initialize engine for this request
  const engine = new TrustEngine({ licensee: 'noizy-internal' });
  await engine.initialize(env);

  // Route handling
  switch (path) {
    case '/status':
    case '/':
      return new Response(JSON.stringify(engine.getStatus(), null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });

    case '/policies':
      return new Response(JSON.stringify({
        success: true,
        policies: engine.getPolicies()
      }, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });

    case '/modules':
      return new Response(JSON.stringify({
        success: true,
        modules: Object.values(TRUST_ENGINE_MODULES)
      }, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });

    case '/coverage':
      const coverage = await engine.getCoverage(30);
      return new Response(JSON.stringify({
        success: true,
        coverage
      }, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });

    case '/evaluate':
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'POST required' }), {
          status: 405,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      try {
        const body = await request.json();
        const { policy_id, data, config } = body;

        if (!policy_id || !data) {
          return new Response(JSON.stringify({
            error: 'policy_id and data required'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const result = engine.evaluatePolicy(policy_id, data, config);
        return new Response(JSON.stringify(result, null, 2), {
          headers: { 'Content-Type': 'application/json' }
        });

      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

    case '/license':
      return new Response(JSON.stringify({
        success: true,
        licensing: {
          model: 'Infrastructure SDK',
          tiers: [
            {
              name: 'Open Source',
              price: 'Free',
              modules: ['policy-language', 'coverage-badge'],
              support: 'Community'
            },
            {
              name: 'Professional',
              price: 'Contact',
              modules: ['All modules'],
              support: 'Email + Documentation'
            },
            {
              name: 'Enterprise',
              price: 'Contact',
              modules: ['All modules + Custom policies'],
              support: 'Dedicated + SLA'
            }
          ],
          contact: 'rsp@noizy.ai',
          terms_url: 'https://noizy.ai/trust-engine/license'
        }
      }, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });

    default:
      return new Response(JSON.stringify({
        error: 'Unknown endpoint',
        available: ['/status', '/policies', '/modules', '/coverage', '/evaluate', '/license']
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default {
  TrustEngine,
  TRUST_ENGINE_VERSION,
  TRUST_ENGINE_NAME,
  TRUST_ENGINE_MODULES,
  handleTrustEngineAPI
};
