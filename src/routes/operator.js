/**
 * Operator Approval Handler
 *
 * Pattern: Write audit FIRST, then flip state.
 * D1 is the durable truth layer. State changes are only valid after audit succeeds.
 *
 * EDGE CORE: All irreversible actions require audit writable assertion.
 * If audit can't write, the action is blocked.
 *
 * Endpoints:
 *   POST /operator/approve        - Approve an action (requires explanation)
 *   POST /operator/token/issue    - Issue time-bounded authorization token
 *   POST /operator/token/validate - Validate and consume a token
 *   GET  /operator/status         - Current operator control state
 *   GET  /operator/audit          - Recent audit events
 */

import { assertAuditWritable } from "../edge-core/assert_audit_writable.js";

/**
 * Handle operator approval action
 * POST /operator/approve
 */
export async function handleOperatorApprove(request, env) {
  try {
    const { action, explanation, metadata } = await request.json();

    // Validate required fields
    if (!action || !explanation) {
      return Response.json({
        success: false,
        error: 'action and explanation are required'
      }, { status: 400 });
    }

    // Get operator identity
    const operatorEmail = request.headers.get('X-Operator-Email') ||
                          env.OPERATOR_EMAIL ||
                          'rsp@noizy.ai';

    // Generate audit event ID in application code
    const auditId = crypto.randomUUID();

    // Check preconditions
    const preconditions = await checkPreconditions(env, action);

    // AUDIT FIRST — write before any state change
    await env.GABRIEL_DB.prepare(`
      INSERT INTO audit_events (
        id, operator_email, action, explanation,
        precondition_passed, signals_at_approval, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      auditId,
      operatorEmail,
      action,
      explanation,
      preconditions.passed ? 1 : 0,
      JSON.stringify(preconditions.signals),
      JSON.stringify(metadata || {})
    ).run();

    // Only after audit succeeds: flip state
    if (preconditions.passed) {
      await executeStateChange(env, action, metadata);
    }

    return Response.json({
      success: true,
      audit_event_id: auditId,
      preconditions: preconditions,
      state_changed: preconditions.passed,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Operator] Approval error:', error);
    return Response.json({
      success: false,
      error: 'Approval failed: ' + error.message
    }, { status: 500 });
  }
}

/**
 * Issue time-bounded authorization token
 * POST /operator/token/issue
 *
 * EDGE CORE: Token issuance is irreversible — requires audit writable assertion
 */
export async function handleTokenIssue(request, env) {
  try {
    const { action_type, domain, preconditions, expires_in_minutes } = await request.json();

    if (!action_type) {
      return Response.json({
        success: false,
        error: 'action_type is required'
      }, { status: 400 });
    }

    const operatorEmail = request.headers.get('X-Operator-Email') ||
                          env.OPERATOR_EMAIL ||
                          'rsp@noizy.ai';

    // EDGE CORE: Assert audit is writable before issuing token
    await assertAuditWritable(env, operatorEmail, `issue_token:${action_type}`);
    const tokenId = crypto.randomUUID();
    const ttlMinutes = expires_in_minutes || 15;
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();

    // Audit the token issuance first
    const auditId = crypto.randomUUID();
    await env.GABRIEL_DB.prepare(`
      INSERT INTO audit_events (
        id, operator_email, action, explanation,
        precondition_passed, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      auditId,
      operatorEmail,
      'TOKEN_ISSUED',
      `Issued ${action_type} token for ${domain || 'general'} (expires in ${ttlMinutes} minutes)`,
      1,
      JSON.stringify({
        token_id: tokenId,
        action_type,
        domain,
        expires_at: expiresAt,
        ttl_minutes: ttlMinutes
      })
    ).run();

    // Create the token
    await env.GABRIEL_DB.prepare(`
      INSERT INTO operator_tokens (
        id, operator_email, action_type, domain,
        preconditions_met, expires_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      tokenId,
      operatorEmail,
      action_type,
      domain || null,
      JSON.stringify(preconditions || []),
      expiresAt
    ).run();

    return Response.json({
      success: true,
      token_id: tokenId,
      expires_at: expiresAt,
      ttl_minutes: ttlMinutes,
      audit_event_id: auditId
    });

  } catch (error) {
    console.error('[Operator] Token issue error:', error);
    return Response.json({
      success: false,
      error: 'Token issuance failed: ' + error.message
    }, { status: 500 });
  }
}

/**
 * Validate a token before use (single-use, consumes the token)
 * POST /operator/token/validate
 */
export async function handleTokenValidate(request, env) {
  try {
    const { token_id } = await request.json();

    if (!token_id) {
      return Response.json({
        success: false,
        error: 'token_id is required'
      }, { status: 400 });
    }

    const token = await env.GABRIEL_DB.prepare(`
      SELECT * FROM operator_tokens WHERE id = ?
    `).bind(token_id).first();

    if (!token) {
      return Response.json({
        success: false,
        valid: false,
        reason: 'Token not found'
      }, { status: 404 });
    }

    // Check if already used
    if (token.used === 1) {
      return Response.json({
        success: true,
        valid: false,
        reason: 'Token already used',
        used_at: token.used_at
      });
    }

    // Check if expired
    if (new Date(token.expires_at) < new Date()) {
      return Response.json({
        success: true,
        valid: false,
        reason: 'Token expired',
        expired_at: token.expires_at
      });
    }

    // Mark as used (consume the token)
    await env.GABRIEL_DB.prepare(`
      UPDATE operator_tokens SET used = 1, used_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(token_id).run();

    // Audit the token usage
    const auditId = crypto.randomUUID();
    await env.GABRIEL_DB.prepare(`
      INSERT INTO audit_events (
        id, operator_email, action, explanation,
        precondition_passed, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      auditId,
      token.operator_email,
      'TOKEN_USED',
      `Used ${token.action_type} token for ${token.domain || 'general'}`,
      1,
      JSON.stringify({
        token_id,
        action_type: token.action_type,
        domain: token.domain,
        issued_at: token.created_at
      })
    ).run();

    return Response.json({
      success: true,
      valid: true,
      action_type: token.action_type,
      domain: token.domain,
      preconditions_met: JSON.parse(token.preconditions_met || '[]'),
      audit_event_id: auditId
    });

  } catch (error) {
    console.error('[Operator] Token validate error:', error);
    return Response.json({
      success: false,
      error: 'Token validation failed: ' + error.message
    }, { status: 500 });
  }
}

/**
 * Get current operator control state
 * GET /operator/status
 */
export async function handleOperatorStatus(request, env) {
  try {
    // Read current signals
    const signals = await readSignals(env);

    // Get pending tokens
    const pendingTokens = await env.GABRIEL_DB.prepare(`
      SELECT COUNT(*) as count FROM operator_tokens
      WHERE used = 0 AND expires_at > CURRENT_TIMESTAMP
    `).first();

    // Get recent freeze events
    const activeFreezes = await env.GABRIEL_DB.prepare(`
      SELECT * FROM freeze_events
      WHERE resolved = 0
      ORDER BY created_at DESC
      LIMIT 5
    `).all();

    // Get promotion queue status
    let promotionQueueSize = 0;
    if (env.GAP_SOLVER) {
      try {
        const list = await env.GAP_SOLVER.list({ prefix: 'gorunfree:candidate:' });
        promotionQueueSize = list.keys.length;
      } catch (e) {
        // KV may not exist yet
      }
    }

    return Response.json({
      success: true,
      status: {
        signals,
        pending_tokens: pendingTokens?.count || 0,
        active_freezes: activeFreezes?.results || [],
        promotion_queue_size: promotionQueueSize,
        promotion_state: signals.metricsStable && signals.canaryActive ? 'READY' : 'HOLD'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Operator] Status error:', error);
    return Response.json({
      success: false,
      error: 'Status check failed: ' + error.message
    }, { status: 500 });
  }
}

/**
 * Get recent audit events
 * GET /operator/audit
 */
export async function handleOperatorAudit(request, env) {
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
  const action = url.searchParams.get('action');

  try {
    let sql = `SELECT * FROM audit_events WHERE 1=1`;
    const params = [];

    if (action) {
      sql += ` AND action = ?`;
      params.push(action);
    }

    sql += ` ORDER BY created_at DESC LIMIT ?`;
    params.push(limit);

    const results = await env.GABRIEL_DB.prepare(sql).bind(...params).all();

    return Response.json({
      success: true,
      events: results.results || [],
      count: results.results?.length || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Operator] Audit error:', error);
    return Response.json({
      success: false,
      error: 'Audit query failed: ' + error.message
    }, { status: 500 });
  }
}

/**
 * Record a freeze event
 * POST /operator/freeze
 */
export async function handleFreezeRecord(request, env) {
  try {
    const { freeze_category, triggered_by, signal_state } = await request.json();

    if (!freeze_category || !triggered_by) {
      return Response.json({
        success: false,
        error: 'freeze_category and triggered_by are required'
      }, { status: 400 });
    }

    const freezeId = crypto.randomUUID();

    await env.GABRIEL_DB.prepare(`
      INSERT INTO freeze_events (
        id, freeze_category, triggered_by, signal_state, created_at
      ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      freezeId,
      freeze_category,
      triggered_by,
      JSON.stringify(signal_state || {})
    ).run();

    // Also record in audit trail
    const auditId = crypto.randomUUID();
    await env.GABRIEL_DB.prepare(`
      INSERT INTO audit_events (
        id, operator_email, action, explanation,
        precondition_passed, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      auditId,
      'SYSTEM',
      'FREEZE_TRIGGERED',
      `${freeze_category} freeze triggered by ${triggered_by}`,
      0,
      JSON.stringify({ freeze_id: freezeId, freeze_category, triggered_by })
    ).run();

    return Response.json({
      success: true,
      freeze_id: freezeId,
      audit_event_id: auditId
    });

  } catch (error) {
    console.error('[Operator] Freeze record error:', error);
    return Response.json({
      success: false,
      error: 'Freeze recording failed: ' + error.message
    }, { status: 500 });
  }
}

/**
 * Resolve a freeze event
 * POST /operator/freeze/resolve
 *
 * EDGE CORE: Freeze resolution is irreversible — requires audit writable assertion
 */
export async function handleFreezeResolve(request, env) {
  try {
    const { freeze_id, resolved_by, resolution_notes } = await request.json();

    if (!freeze_id || !resolution_notes) {
      return Response.json({
        success: false,
        error: 'freeze_id and resolution_notes are required'
      }, { status: 400 });
    }

    const operatorEmail = resolved_by ||
                          request.headers.get('X-Operator-Email') ||
                          env.OPERATOR_EMAIL ||
                          'rsp@noizy.ai';

    // EDGE CORE: Assert audit is writable before resolving freeze
    await assertAuditWritable(env, operatorEmail, `resolve_freeze:${freeze_id}`);

    // Update freeze event
    await env.GABRIEL_DB.prepare(`
      UPDATE freeze_events
      SET resolved = 1, resolved_at = CURRENT_TIMESTAMP, resolved_by = ?, resolution_notes = ?
      WHERE id = ?
    `).bind(operatorEmail, resolution_notes, freeze_id).run();

    // Audit the resolution
    const auditId = crypto.randomUUID();
    await env.GABRIEL_DB.prepare(`
      INSERT INTO audit_events (
        id, operator_email, action, explanation,
        precondition_passed, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      auditId,
      operatorEmail,
      'FREEZE_RESOLVED',
      resolution_notes,
      1,
      JSON.stringify({ freeze_id })
    ).run();

    return Response.json({
      success: true,
      freeze_id,
      audit_event_id: auditId
    });

  } catch (error) {
    console.error('[Operator] Freeze resolve error:', error);
    return Response.json({
      success: false,
      error: 'Freeze resolution failed: ' + error.message
    }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Read current signal state from KV
 */
async function readSignals(env) {
  const signals = {
    metricsStable: false,
    canaryActive: false,
    errorBudgetOk: true,
    consentIntact: true,
    latencyOk: true
  };

  if (env.FEATURE_FLAGS) {
    try {
      const metricsFlag = await env.FEATURE_FLAGS.get('gorunfree_metrics_stable');
      signals.metricsStable = metricsFlag === 'true' || metricsFlag === 'on';

      const canaryFlag = await env.FEATURE_FLAGS.get('gorunfree_canary_active');
      signals.canaryActive = canaryFlag === 'true' || canaryFlag === 'on';

      const errorFlag = await env.FEATURE_FLAGS.get('gorunfree_error_rate_ok');
      signals.errorBudgetOk = errorFlag !== 'false';

      const latencyFlag = await env.FEATURE_FLAGS.get('gorunfree_latency_ok');
      signals.latencyOk = latencyFlag !== 'false';

      const consentFlag = await env.FEATURE_FLAGS.get('gorunfree_consent_ok');
      signals.consentIntact = consentFlag !== 'false';
    } catch (e) {
      console.warn('[Operator] Signal read error:', e.message);
    }
  }

  return signals;
}

/**
 * Check preconditions for an action
 */
async function checkPreconditions(env, action) {
  const signals = await readSignals(env);

  // Action-specific preconditions
  const actionPreconditions = {
    'lift_promotion_freeze': ['metricsStable', 'errorBudgetOk'],
    'advance_rollout': ['metricsStable', 'canaryActive', 'errorBudgetOk'],
    'zone_migration': ['metricsStable', 'canaryActive'],
    'force_promotion': ['metricsStable'],
    'test': []  // Test action has no preconditions
  };

  const required = actionPreconditions[action] || [];
  const missing = required.filter(sig => !signals[sig]);

  return {
    passed: missing.length === 0,
    signals,
    required,
    missing
  };
}

/**
 * Execute state change after audit
 */
async function executeStateChange(env, action, metadata) {
  if (!env.FEATURE_FLAGS) return;

  switch (action) {
    case 'lift_promotion_freeze':
      await env.FEATURE_FLAGS.put('gorunfree_promotion_frozen', 'false');
      break;

    case 'force_promotion':
      await env.FEATURE_FLAGS.put('gorunfree_force_promotion', 'true');
      // Auto-expire after 1 hour
      await env.FEATURE_FLAGS.put('gorunfree_force_promotion', 'true', {
        expirationTtl: 3600
      });
      break;

    case 'advance_rollout':
      // Rollout advancement is handled via `wrangler versions deploy`
      // This audit just records the intent
      break;

    case 'test':
      // Test action - no state change
      break;

    default:
      // Unknown action - audit recorded, no state change
      break;
  }
}

export default {
  handleOperatorApprove,
  handleTokenIssue,
  handleTokenValidate,
  handleOperatorStatus,
  handleOperatorAudit,
  handleFreezeRecord,
  handleFreezeResolve
};
