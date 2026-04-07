/**
 * Regulator-Specific Compliance Export Profiles
 *
 * Each export is generated from the same audit core but filtered per regime.
 *
 * Profiles:
 *   EU - GDPR / AI Act aligned (pseudonymized, consent-emphasized)
 *   US - FDA / FTC / NIST style (role classification, timestamp precision)
 *
 * Route: GET /operator/compliance/export?profile=eu|us
 */

import { verifyAuditChain } from '../edge-core/audit_hash.js';

/**
 * EU Compliance Profile (GDPR / AI Act aligned)
 *
 * - Pseudonymized actor identifiers
 * - Explicit retention window metadata
 * - Consent-state changes emphasized
 * - No personal data unless strictly required
 */
export function generateEUProfile(auditEvents, chainStatus, anchors, metadata) {
  return {
    profile: 'EU',
    compliance_frameworks: ['GDPR', 'EU AI Act', 'eIDAS'],
    generated_at: metadata.generated_at,
    range: metadata.range,

    readme: `NOIZY COMPLIANCE EXPORT - EU PROFILE
=====================================

This export is structured for EU regulatory requirements.

GDPR Article 30 Compliance:
- All actor identifiers are pseudonymized
- Processing activities are documented
- Retention periods are explicitly stated

EU AI Act Alignment:
- Audit trail demonstrates human oversight
- Decision rationale is preserved
- Transparency requirements addressed

CONTENTS:
- audit_events_eu.csv (pseudonymized)
- audit_chain.json (integrity verification)
- retention_policy.md
- integrity_proof.json

VERIFICATION:
Verify checksums before review.
`,

    audit_events: {
      format: 'pseudonymized',
      total: auditEvents.length,
      events: auditEvents.map(e => ({
        event_id_pseudo: pseudonymize(e.event_id || e.id, 'event'),
        actor_pseudo: pseudonymize(e.operator || e.actor, 'actor'),
        event_type: e.action || e.event_type,
        timestamp: e.created_at || e.timestamp,
        category: categorizeForGDPR(e.action || e.event_type),
        lawful_basis: 'legitimate_interest',
        chain_index: e.chain_index
      }))
    },

    audit_chain: {
      algorithm: 'sha256',
      verified: chainStatus.valid,
      event_count: chainStatus.verified || 0,
      verification_timestamp: new Date().toISOString()
    },

    retention_policy: {
      legal_basis: 'GDPR Article 6(1)(f) - Legitimate Interest',
      retention_periods: {
        consent_events: '10 years (legal requirement)',
        governance_events: '10 years (accountability)',
        operational_events: '90 days (compressed)',
        health_checks: '7 days (deleted)'
      },
      data_subject_rights: {
        access: 'supported via audit export',
        rectification: 'not applicable (append-only)',
        erasure: 'not applicable (legal retention)',
        portability: 'supported via this export'
      }
    },

    integrity_proof: {
      chain_valid: chainStatus.valid,
      anchors: anchors.map(a => ({
        date: a.date,
        root_hash: a.root_hash,
        published_at: a.published_at
      }))
    },

    dpo_contact: 'rsp@noizy.ai'
  };
}

/**
 * US Compliance Profile (FDA / FTC / NIST style)
 *
 * - Clear actor role classification
 * - Timestamp precision preserved
 * - Strong linkage between action → justification
 */
export function generateUSProfile(auditEvents, chainStatus, anchors, metadata) {
  return {
    profile: 'US',
    compliance_frameworks: ['NIST CSF', 'FTC Act Section 5', 'SOC 2 Type II'],
    generated_at: metadata.generated_at,
    range: metadata.range,

    readme: `NOIZY COMPLIANCE EXPORT - US PROFILE
=====================================

This export is structured for US regulatory requirements.

NIST Cybersecurity Framework Alignment:
- Audit controls (PR.PT-1)
- Monitoring activities (DE.CM)
- Recovery planning (RC.RP)

FTC Section 5 Compliance:
- Fair information practices documented
- Consumer protection measures evidenced

SOC 2 Type II Controls:
- CC6.1 Logical access controls
- CC7.1 System operations
- CC7.2 Change management

CONTENTS:
- audit_events.csv
- audit_chain.json
- anchor_proofs.json
- checksums.sha256

VERIFICATION:
1. Verify checksums match package contents
2. Verify audit_chain.verified is true
3. Cross-reference anchor_proofs with public records
`,

    audit_events: {
      format: 'full_detail',
      total: auditEvents.length,
      events: auditEvents.map(e => ({
        event_id: e.event_id || e.id,
        timestamp_utc: e.created_at || e.timestamp,
        timestamp_precision: 'millisecond',
        actor_role: classifyActorRole(e.operator || e.actor),
        action_code: e.action || e.event_type,
        action_category: categorizeForNIST(e.action || e.event_type),
        justification: e.explanation || e.reason,
        preconditions_met: e.precondition_passed,
        control_reference: mapToSOC2Control(e.action || e.event_type),
        chain_index: e.chain_index
      }))
    },

    audit_chain: {
      algorithm: 'sha256',
      chain_type: 'hash_linked',
      verified: chainStatus.valid,
      event_count: chainStatus.verified || 0,
      verification_method: 'sequential_recomputation',
      verification_timestamp: new Date().toISOString()
    },

    anchor_proofs: anchors.map(a => ({
      date: a.date,
      root_hash: a.root_hash,
      event_count: a.event_count,
      algorithm: a.algorithm,
      published_at: a.published_at,
      verification_url: a.verification_url,
      eth_txid: a.eth_txid || null,
      btc_txid: a.btc_txid || null
    })),

    control_mapping: {
      nist_csf: ['PR.PT-1', 'DE.CM-1', 'DE.CM-7', 'RS.AN-1'],
      soc2: ['CC6.1', 'CC7.1', 'CC7.2', 'CC7.3'],
      cis: ['8.2', '8.5', '8.11']
    },

    contact: {
      organization: 'NOIZY Labs',
      email: 'rsp@noizy.ai',
      jurisdiction: 'Canada (Federal)'
    }
  };
}

/**
 * Get compliance profile by name
 */
export function getComplianceProfile(profileName, auditEvents, chainStatus, anchors, metadata) {
  switch (profileName?.toLowerCase()) {
    case 'eu':
    case 'gdpr':
    case 'europe':
      return generateEUProfile(auditEvents, chainStatus, anchors, metadata);

    case 'us':
    case 'usa':
    case 'nist':
    case 'soc2':
      return generateUSProfile(auditEvents, chainStatus, anchors, metadata);

    default:
      // Default to US profile as baseline
      return generateUSProfile(auditEvents, chainStatus, anchors, metadata);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Pseudonymize an identifier (EU profile)
 */
function pseudonymize(value, type) {
  if (!value) return `${type}_unknown`;
  // Simple hash-based pseudonymization
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash = hash & hash;
  }
  return `${type}_${Math.abs(hash).toString(16).padStart(8, '0')}`;
}

/**
 * Categorize action for GDPR purposes
 */
function categorizeForGDPR(action) {
  const categories = {
    consent: ['CONSENT_UPDATED', 'CONSENT_GRANTED', 'CONSENT_REVOKED'],
    governance: ['FREEZE_TRIGGERED', 'FREEZE_RESOLVED', 'PROMOTION_APPROVED'],
    technical: ['ANCHOR_PUBLISHED', 'WINDOW_RESET', 'TOKEN_ISSUED']
  };

  for (const [category, actions] of Object.entries(categories)) {
    if (actions.includes(action)) return category;
  }
  return 'operational';
}

/**
 * Classify actor role (US profile)
 */
function classifyActorRole(actor) {
  if (!actor || actor === 'SYSTEM') return 'SYSTEM_AUTOMATED';
  if (actor.includes('@noizy.ai')) return 'OPERATOR_ADMIN';
  return 'OPERATOR_STANDARD';
}

/**
 * Categorize action for NIST CSF
 */
function categorizeForNIST(action) {
  const mapping = {
    'CONSENT_UPDATED': 'PROTECT',
    'CONSENT_REVOKED': 'PROTECT',
    'FREEZE_TRIGGERED': 'RESPOND',
    'FREEZE_RESOLVED': 'RECOVER',
    'PROMOTION_APPROVED': 'PROTECT',
    'TOKEN_ISSUED': 'PROTECT',
    'ANCHOR_PUBLISHED': 'IDENTIFY'
  };
  return mapping[action] || 'DETECT';
}

/**
 * Map action to SOC 2 control
 */
function mapToSOC2Control(action) {
  const mapping = {
    'CONSENT_UPDATED': 'CC6.1',
    'FREEZE_TRIGGERED': 'CC7.2',
    'FREEZE_RESOLVED': 'CC7.2',
    'PROMOTION_APPROVED': 'CC7.2',
    'TOKEN_ISSUED': 'CC6.1',
    'ANCHOR_PUBLISHED': 'CC7.1'
  };
  return mapping[action] || 'CC7.1';
}

export default {
  generateEUProfile,
  generateUSProfile,
  getComplianceProfile
};
