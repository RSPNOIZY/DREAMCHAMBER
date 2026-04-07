/**
 * Regulator-Ready Compliance Export
 *
 * Produces a portable, auditable, third-party-verifiable package
 * demonstrating governance, restraint, and traceability.
 *
 * This is not a one-off report — it is queryable, regenerable evidence.
 *
 * Route: GET /operator/compliance/export
 */

import { verifyAuditChain } from '../edge-core/audit_hash.js';

/**
 * Generate compliance export package
 * GET /operator/compliance/export?from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * Returns a JSON representation of the compliance package
 * In production, this could generate a downloadable ZIP
 */
export async function handleComplianceExport(request, env) {
  const url = new URL(request.url);
  const from = url.searchParams.get('from') || getDateDaysAgo(30);
  const to = url.searchParams.get('to') || getTodayDate();
  const format = url.searchParams.get('format') || 'json';

  try {
    // Generate all package components
    const [auditEvents, chainStatus, anchors, policies] = await Promise.all([
      getAuditEventsForExport(env, from, to),
      verifyAuditChain(env, { limit: 10000 }),
      getAnchorProofs(env, from, to),
      getPolicies()
    ]);

    const exportPackage = {
      metadata: {
        export_id: crypto.randomUUID(),
        generated_at: new Date().toISOString(),
        range: { from, to },
        format: 'NOIZY Compliance Export v1.0'
      },

      readme: generateReadme(from, to),

      audit_events: {
        total: auditEvents.length,
        events: auditEvents
      },

      audit_chain: {
        hash_algorithm: 'sha256',
        total_events: chainStatus.verified || 0,
        chain_valid: chainStatus.valid,
        verification_timestamp: new Date().toISOString()
      },

      anchor_proofs: anchors,

      policies: policies,

      checksums: await generateChecksums(auditEvents, chainStatus, anchors)
    };

    // Log the export
    await logExportEvent(env, exportPackage.metadata);

    if (format === 'csv') {
      return generateCSVResponse(auditEvents);
    }

    return Response.json(exportPackage, {
      headers: {
        'Content-Disposition': `attachment; filename="compliance_export_${from}_${to}.json"`,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('[ComplianceExport] Error:', error);
    return Response.json({
      success: false,
      error: 'Export generation failed: ' + error.message
    }, { status: 500 });
  }
}

/**
 * Get audit events formatted for export (no PII by default)
 */
async function getAuditEventsForExport(env, from, to) {
  const results = await env.GABRIEL_DB.prepare(`
    SELECT
      id,
      action,
      precondition_passed,
      created_at,
      event_hash
    FROM audit_events
    WHERE created_at >= ? AND created_at < datetime(?, '+1 day')
    ORDER BY created_at ASC
  `).bind(from, to).all();

  return (results.results || []).map((event, index) => ({
    event_id_hash: hashEventId(event.id),
    event_type: event.action,
    timestamp: event.created_at,
    system_area: categorizeAction(event.action),
    outcome: event.precondition_passed === 1 ? 'approved' : 'blocked',
    chain_index: index
  }));
}

/**
 * Get anchor proofs for date range
 */
async function getAnchorProofs(env, from, to) {
  try {
    const results = await env.GABRIEL_DB.prepare(`
      SELECT anchor_date, event_count, root_hash, algorithm, published_at
      FROM audit_anchors
      WHERE anchor_date >= ? AND anchor_date <= ?
      ORDER BY anchor_date ASC
    `).bind(from, to).all();

    return (results.results || []).map(anchor => ({
      date: anchor.anchor_date,
      root_hash: anchor.root_hash,
      event_count: anchor.event_count,
      algorithm: anchor.algorithm,
      published_at: anchor.published_at,
      verification_url: `https://heaven.rsp-5f3.workers.dev/trust/transparency?date=${anchor.anchor_date}`
    }));
  } catch (e) {
    // Table may not exist yet
    return [];
  }
}

/**
 * Get policy documents as structured data
 */
function getPolicies() {
  return {
    retention_policy: {
      irreversible_actions: 'permanent',
      governance_decisions: '10 years',
      automated_promotions: '5 years',
      routine_operations: '90 days',
      health_pings: '7 days'
    },
    promotion_policy: {
      minimum_stability_window: '15 minutes',
      required_signals: ['S3 (metrics stable)', 'S4 (version promoted)', 'S5 (consent verified)'],
      human_approval_required: true
    },
    audit_model: {
      append_only: true,
      tamper_evident: true,
      hash_algorithm: 'sha256',
      chain_verification: 'continuous'
    }
  };
}

/**
 * Generate README content
 */
function generateReadme(from, to) {
  return `NOIZY COMPLIANCE EXPORT
========================

Export Range: ${from} to ${to}
Generated: ${new Date().toISOString()}

CONTENTS:
- audit_events: Event log with hashed identifiers (no PII)
- audit_chain: Hash chain verification status
- anchor_proofs: External notarization records
- policies: Retention and governance policies
- checksums: Package integrity verification

VERIFICATION:
1. Verify checksums match package contents
2. Verify audit_chain.chain_valid is true
3. Verify anchor_proofs match published records
4. Review policies against stated compliance requirements

CONTACT:
- Email: rsp@noizy.ai
- Organization: NOIZY Labs
- Jurisdiction: Canada

This export is read-only and immutable once generated.
`;
}

/**
 * Generate checksums for package integrity
 */
async function generateChecksums(events, chain, anchors) {
  const encoder = new TextEncoder();

  const eventsHash = await crypto.subtle.digest(
    'SHA-256',
    encoder.encode(JSON.stringify(events))
  );
  const chainHash = await crypto.subtle.digest(
    'SHA-256',
    encoder.encode(JSON.stringify(chain))
  );
  const anchorsHash = await crypto.subtle.digest(
    'SHA-256',
    encoder.encode(JSON.stringify(anchors))
  );

  return {
    audit_events: arrayBufferToHex(eventsHash),
    audit_chain: arrayBufferToHex(chainHash),
    anchor_proofs: arrayBufferToHex(anchorsHash)
  };
}

/**
 * Log the export event
 */
async function logExportEvent(env, metadata) {
  try {
    await env.GABRIEL_DB.prepare(`
      INSERT INTO audit_events
      (id, operator_email, action, explanation, precondition_passed, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      crypto.randomUUID(),
      'SYSTEM',
      'COMPLIANCE_EXPORT',
      `Compliance export generated for ${metadata.range.from} to ${metadata.range.to}`,
      1,
      JSON.stringify(metadata)
    ).run();
  } catch (e) {
    console.error('[ComplianceExport] Failed to log export event:', e);
  }
}

/**
 * Generate CSV response for audit events
 */
function generateCSVResponse(events) {
  const headers = ['event_id_hash', 'event_type', 'timestamp', 'system_area', 'outcome', 'chain_index'];
  const rows = events.map(e =>
    headers.map(h => JSON.stringify(e[h])).join(',')
  );

  const csv = [headers.join(','), ...rows].join('\n');

  return new Response(csv, {
    headers: {
      'Content-Disposition': 'attachment; filename="audit_events.csv"',
      'Content-Type': 'text/csv'
    }
  });
}

/**
 * Hash event ID for export (no raw IDs exposed)
 */
function hashEventId(id) {
  // Simple hash for display - not cryptographically strong but sufficient for anonymization
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Categorize action into system area
 */
function categorizeAction(action) {
  const categories = {
    'CONSENT': ['CONSENT_UPDATED', 'CONSENT_GRANTED', 'CONSENT_REVOKED'],
    'ARCHIVE': ['ARCHIVE_INCLUDED', 'ARCHIVE_EXCLUDED'],
    'GOVERNANCE': ['FREEZE_TRIGGERED', 'FREEZE_RESOLVED', 'PROMOTION_APPROVED'],
    'TOKENS': ['TOKEN_ISSUED', 'TOKEN_USED'],
    'SYSTEM': ['ANCHOR_PUBLISHED', 'COMPLIANCE_EXPORT', 'WINDOW_RESET']
  };

  for (const [area, actions] of Object.entries(categories)) {
    if (actions.includes(action)) return area;
  }
  return 'OTHER';
}

/**
 * Convert ArrayBuffer to hex string
 */
function arrayBufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get date N days ago in YYYY-MM-DD format
 */
function getDateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

export default {
  handleComplianceExport
};
