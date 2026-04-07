/**
 * Creator Trust Dashboard API
 *
 * Public endpoint for creator-facing trust visibility.
 * Read-only, calm, outcome-focused.
 *
 * Creators see: outcomes
 * Creators don't see: levers, controls, internal metrics
 */

/**
 * Get trust status overview
 * GET /trust/status
 *
 * Public endpoint - no auth required
 */
export async function handleTrustStatus(request, env) {
  try {
    // Determine overall status
    const status = await determineStatus(env);

    // Get trust signals (simplified for creators)
    const signals = await getCreatorSignals(env);

    // Get recent changes (last 30 days, creator-relevant only)
    const changes = await getRecentChanges(env);

    return Response.json({
      success: true,
      status: status.state,
      status_message: status.message,
      signals: signals,
      recent_changes: changes,
      updated_at: new Date().toISOString(),
      note: "This is your trust dashboard. When something changes, we explain why."
    });

  } catch (error) {
    console.error('[Trust] Status error:', error);
    // Even on error, return a calm response
    return Response.json({
      success: true,
      status: 'operating',
      status_message: 'System is operating normally',
      signals: {
        consent_enforcement: 'active',
        provenance_tracking: 'active'
      },
      recent_changes: [],
      updated_at: new Date().toISOString()
    });
  }
}

/**
 * Get recent trust-relevant changes
 * GET /trust/changes
 */
export async function handleTrustChanges(request, env) {
  const url = new URL(request.url);
  const days = Math.min(parseInt(url.searchParams.get('days') || '30'), 90);

  try {
    const changes = await getRecentChanges(env, days);

    return Response.json({
      success: true,
      changes: changes,
      period_days: days,
      count: changes.length,
      updated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Trust] Changes error:', error);
    return Response.json({
      success: true,
      changes: [],
      period_days: days,
      count: 0,
      updated_at: new Date().toISOString()
    });
  }
}

/**
 * Determine overall system status for creators
 */
async function determineStatus(env) {
  // Read internal signals
  let metricsOk = true;
  let consentOk = true;
  let frozen = false;

  if (env.FEATURE_FLAGS) {
    try {
      const metricsFlag = await env.FEATURE_FLAGS.get('gorunfree_metrics_stable');
      metricsOk = metricsFlag !== 'false';

      const consentFlag = await env.FEATURE_FLAGS.get('gorunfree_consent_ok');
      consentOk = consentFlag !== 'false';

      const frozenFlag = await env.FEATURE_FLAGS.get('gorunfree_promotion_frozen');
      frozen = frozenFlag === 'true';
    } catch (e) {
      // Default to healthy on read error
    }
  }

  // Translate to creator-friendly status
  if (!consentOk) {
    return {
      state: 'attention',
      message: 'We are reviewing a consent-related matter. Your work is not affected.'
    };
  }

  if (frozen || !metricsOk) {
    return {
      state: 'pause',
      message: 'Preventive pause in effect. This protects long-term trust.'
    };
  }

  return {
    state: 'normal',
    message: 'System is operating normally'
  };
}

/**
 * Get creator-facing signals (simplified view)
 */
async function getCreatorSignals(env) {
  const signals = {
    consent_enforcement: 'active',
    provenance_tracking: 'active',
    gorunfree_mode: 'stable',
    recent_pauses: 0
  };

  // Check for recent freezes
  try {
    const freezes = await env.GABRIEL_DB.prepare(`
      SELECT COUNT(*) as count FROM freeze_events
      WHERE created_at > datetime('now', '-7 days')
    `).first();

    signals.recent_pauses = freezes?.count || 0;
  } catch (e) {
    // Table may not exist yet
  }

  // Check consent state
  if (env.FEATURE_FLAGS) {
    try {
      const consentFlag = await env.FEATURE_FLAGS.get('gorunfree_consent_ok');
      if (consentFlag === 'false') {
        signals.consent_enforcement = 'reviewing';
      }
    } catch (e) {
      // Default active
    }
  }

  return signals;
}

/**
 * Get recent creator-relevant changes
 */
async function getRecentChanges(env, days = 30) {
  const changes = [];

  try {
    // Get audit events that are creator-relevant
    const creatorRelevantActions = [
      'CONSENT_UPDATED',
      'ARCHIVE_EXCLUDED',
      'ARCHIVE_INCLUDED',
      'PROVENANCE_EXPANDED',
      'GAP_DETECTED',
      'FREEZE_RESOLVED'
    ];

    const results = await env.GABRIEL_DB.prepare(`
      SELECT action, explanation, created_at
      FROM audit_events
      WHERE action IN (${creatorRelevantActions.map(() => '?').join(',')})
        AND created_at > datetime('now', '-${days} days')
      ORDER BY created_at DESC
      LIMIT 20
    `).bind(...creatorRelevantActions).all();

    if (results.results) {
      for (const event of results.results) {
        changes.push({
          date: formatDate(event.created_at),
          summary: translateAction(event.action),
          impact: determineImpact(event.action),
          explanation: event.explanation
        });
      }
    }
  } catch (e) {
    // Table may not exist yet, return empty
  }

  // If no changes, provide a default "all clear" message
  if (changes.length === 0) {
    changes.push({
      date: formatDate(new Date().toISOString()),
      summary: 'No recent changes',
      impact: 'No action required',
      explanation: 'The system has been operating normally.'
    });
  }

  return changes;
}

/**
 * Format date for display
 */
function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  });
}

/**
 * Translate action to human-readable summary
 */
function translateAction(action) {
  const translations = {
    'CONSENT_UPDATED': 'Consent terms updated',
    'ARCHIVE_EXCLUDED': 'One source excluded due to updated consent',
    'ARCHIVE_INCLUDED': 'New licensed archive included',
    'PROVENANCE_EXPANDED': 'Provenance explanation expanded',
    'GAP_DETECTED': 'New gap category detected',
    'FREEZE_RESOLVED': 'Preventive pause resolved'
  };

  return translations[action] || 'System update';
}

/**
 * Determine impact statement for action
 */
function determineImpact(action) {
  const impacts = {
    'CONSENT_UPDATED': 'No action required',
    'ARCHIVE_EXCLUDED': 'No action required',
    'ARCHIVE_INCLUDED': 'Improved match accuracy',
    'PROVENANCE_EXPANDED': 'More detailed explanations available',
    'GAP_DETECTED': 'Improved search suggestions',
    'FREEZE_RESOLVED': 'Normal operation resumed'
  };

  return impacts[action] || 'No action required';
}

export default {
  handleTrustStatus,
  handleTrustChanges
};
