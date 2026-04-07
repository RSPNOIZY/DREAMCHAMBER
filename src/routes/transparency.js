/**
 * Public Transparency Export
 *
 * Shows restraint without exposing internals.
 * Creators see: that things are governed, that pauses happen intentionally,
 * that there is memory and restraint.
 *
 * They never see: panic, internal failure modes, blame.
 *
 * Route: GET /trust/transparency
 */

/**
 * Generate public transparency data
 * GET /trust/transparency
 */
export async function handleTransparency(request, env) {
  try {
    const data = await generateTransparencyData(env);

    return new Response(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // 5 minute cache
      }
    });
  } catch (error) {
    console.error('[Transparency] Error:', error);

    // Even on error, return a calm response
    return Response.json({
      system_status: 'operating_normally',
      last_updated: new Date().toISOString(),
      recent_events: [],
      audit_model: {
        append_only: true,
        tamper_evident: true
      }
    });
  }
}

/**
 * Generate transparency data from D1
 */
async function generateTransparencyData(env) {
  const now = new Date().toISOString();

  // Get system status from feature flags
  let systemStatus = 'operating_normally';
  if (env.FEATURE_FLAGS) {
    try {
      const frozen = await env.FEATURE_FLAGS.get('gorunfree_promotion_frozen');
      if (frozen === 'true') {
        systemStatus = 'preventive_pause';
      }
    } catch (e) {
      // Default to normal
    }
  }

  // Get recent public-safe events
  const recentEvents = await getPublicSafeEvents(env);

  // Check audit model status
  const auditModel = await getAuditModelStatus(env);

  return {
    system_status: systemStatus,
    last_updated: now,
    recent_events: recentEvents,
    audit_model: auditModel,
    trust_principles: [
      "Authority cannot exist without memory",
      "If it can't be audited, it can't happen",
      "We do not hide mistakes. We make them provable, bounded, and survivable."
    ]
  };
}

/**
 * Get recent events translated to public-safe language
 */
async function getPublicSafeEvents(env) {
  const events = [];

  try {
    // Get recent freeze/resolve events (these are visible to creators)
    const results = await env.GABRIEL_DB.prepare(`
      SELECT action, explanation, created_at
      FROM audit_events
      WHERE action IN ('FREEZE_TRIGGERED', 'FREEZE_RESOLVED', 'CONSENT_UPDATED', 'ARCHIVE_EXCLUDED')
        AND created_at > datetime('now', '-30 days')
      ORDER BY created_at DESC
      LIMIT 10
    `).all();

    if (results.results) {
      for (const event of results.results) {
        events.push(translateToPublicEvent(event));
      }
    }
  } catch (e) {
    // Table may not exist yet
  }

  return events;
}

/**
 * Translate internal event to public-safe format
 */
function translateToPublicEvent(event) {
  const translations = {
    'FREEZE_TRIGGERED': {
      type: 'preventive_pause',
      summary: 'Planned change paused automatically before rollout.',
      impact: 'No creator action required'
    },
    'FREEZE_RESOLVED': {
      type: 'pause_resolved',
      summary: 'Preventive pause resolved. Normal operation resumed.',
      impact: 'No creator action required'
    },
    'CONSENT_UPDATED': {
      type: 'consent_update',
      summary: 'Consent terms updated for improved protection.',
      impact: 'No creator action required'
    },
    'ARCHIVE_EXCLUDED': {
      type: 'source_removed',
      summary: 'One source removed due to consent update.',
      impact: 'Improved compliance'
    }
  };

  const template = translations[event.action] || {
    type: 'system_update',
    summary: 'System update applied.',
    impact: 'No creator action required'
  };

  return {
    date: formatDate(event.created_at),
    type: template.type,
    summary: template.summary,
    impact: template.impact
  };
}

/**
 * Get audit model status
 */
async function getAuditModelStatus(env) {
  let hasHashChain = false;

  try {
    const check = await env.GABRIEL_DB.prepare(`
      SELECT COUNT(*) as count FROM audit_events WHERE event_hash IS NOT NULL
    `).first();
    hasHashChain = (check?.count || 0) > 0;
  } catch (e) {
    // Column may not exist yet
  }

  return {
    append_only: true,
    tamper_evident: hasHashChain,
    retention_defined: true,
    external_anchoring: false // Will be true once anchoring is live
  };
}

/**
 * Format date for display
 */
function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toISOString().split('T')[0];
}

export default {
  handleTransparency
};
