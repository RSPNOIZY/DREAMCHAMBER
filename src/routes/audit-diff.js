/**
 * Audit Diff Visualizer
 *
 * Two views, same truth, different audiences:
 * - Internal: Full diff tooling for operators/compliance
 * - Creator-safe: Calm, effect-centric diffs
 *
 * Routes:
 *   GET /operator/audit/diff      - Internal audit diff (authenticated)
 *   GET /trust/changes/diff       - Creator-safe diff (public)
 */

/**
 * Internal audit diff for operators
 * GET /operator/audit/diff?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
export async function handleOperatorAuditDiff(request, env) {
  const url = new URL(request.url);
  const from = url.searchParams.get('from') || getDateDaysAgo(7);
  const to = url.searchParams.get('to') || getTodayDate();
  const action = url.searchParams.get('action'); // Optional filter

  try {
    let sql = `
      SELECT
        id,
        operator_email,
        action,
        explanation,
        precondition_passed,
        signals_at_approval,
        metadata,
        created_at,
        prev_hash,
        event_hash
      FROM audit_events
      WHERE created_at >= ? AND created_at < datetime(?, '+1 day')
    `;
    const params = [from, to];

    if (action) {
      sql += ` AND action = ?`;
      params.push(action);
    }

    sql += ` ORDER BY created_at DESC LIMIT 500`;

    const results = await env.GABRIEL_DB.prepare(sql).bind(...params).all();

    // Group events by date and categorize as +/-/~
    const diff = buildDiff(results.results || []);

    return Response.json({
      success: true,
      range: { from, to },
      filter: action || 'all',
      events: diff,
      total: results.results?.length || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[AuditDiff] Error:', error);
    return Response.json({
      success: false,
      error: 'Diff generation failed: ' + error.message
    }, { status: 500 });
  }
}

/**
 * Creator-safe diff view
 * GET /trust/changes/diff?days=7
 */
export async function handleCreatorDiff(request, env) {
  const url = new URL(request.url);
  const days = Math.min(parseInt(url.searchParams.get('days') || '30'), 90);

  try {
    // Only get creator-relevant events
    const creatorRelevantActions = [
      'CONSENT_UPDATED',
      'ARCHIVE_EXCLUDED',
      'ARCHIVE_INCLUDED',
      'FREEZE_TRIGGERED',
      'FREEZE_RESOLVED',
      'PROVENANCE_EXPANDED'
    ];

    const results = await env.GABRIEL_DB.prepare(`
      SELECT action, explanation, created_at
      FROM audit_events
      WHERE action IN (${creatorRelevantActions.map(() => '?').join(',')})
        AND created_at > datetime('now', '-${days} days')
      ORDER BY created_at DESC
      LIMIT 20
    `).bind(...creatorRelevantActions).all();

    const changes = (results.results || []).map(event => ({
      date: formatDate(event.created_at),
      summary: translateToCreatorLanguage(event.action),
      impact: getImpactStatement(event.action)
    }));

    // If no changes, provide reassurance
    if (changes.length === 0) {
      changes.push({
        date: getTodayDate(),
        summary: 'System operating normally',
        impact: 'No action required'
      });
    }

    return Response.json({
      success: true,
      period_days: days,
      changes,
      last_updated: new Date().toISOString()
    });

  } catch (error) {
    console.error('[CreatorDiff] Error:', error);
    return Response.json({
      success: true,
      period_days: days,
      changes: [{
        date: getTodayDate(),
        summary: 'System operating normally',
        impact: 'No action required'
      }],
      last_updated: new Date().toISOString()
    });
  }
}

/**
 * Build diff structure from events
 */
function buildDiff(events) {
  return events.map(event => {
    const type = getDiffType(event.action);
    return {
      type, // '+' for additions, '-' for removals, '~' for changes
      timestamp: event.created_at,
      action: event.action,
      operator: event.operator_email,
      reason: event.explanation,
      preconditions_met: event.precondition_passed === 1,
      hash: event.event_hash?.substring(0, 12) || null
    };
  });
}

/**
 * Determine diff type based on action
 */
function getDiffType(action) {
  const additions = [
    'ARCHIVE_INCLUDED',
    'CONSENT_GRANTED',
    'TOKEN_ISSUED',
    'PROMOTION_APPROVED',
    'ANCHOR_PUBLISHED'
  ];

  const removals = [
    'ARCHIVE_EXCLUDED',
    'CONSENT_REVOKED',
    'TOKEN_USED',
    'FREEZE_TRIGGERED'
  ];

  if (additions.includes(action)) return '+';
  if (removals.includes(action)) return '-';
  return '~';
}

/**
 * Translate action to creator-friendly language
 */
function translateToCreatorLanguage(action) {
  const translations = {
    'CONSENT_UPDATED': 'Consent terms updated',
    'ARCHIVE_EXCLUDED': 'One source removed due to consent update',
    'ARCHIVE_INCLUDED': 'New licensed archive included',
    'FREEZE_TRIGGERED': 'A planned update was paused',
    'FREEZE_RESOLVED': 'Preventive pause resolved',
    'PROVENANCE_EXPANDED': 'Provenance explanations improved'
  };
  return translations[action] || 'System update applied';
}

/**
 * Get impact statement for action
 */
function getImpactStatement(action) {
  const impacts = {
    'CONSENT_UPDATED': 'No action required',
    'ARCHIVE_EXCLUDED': 'Improved compliance',
    'ARCHIVE_INCLUDED': 'Improved match accuracy',
    'FREEZE_TRIGGERED': 'No creator action required',
    'FREEZE_RESOLVED': 'Normal operation resumed',
    'PROVENANCE_EXPANDED': 'More detailed explanations available'
  };
  return impacts[action] || 'No action required';
}

/**
 * Format date for display
 */
function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
  handleOperatorAuditDiff,
  handleCreatorDiff
};
