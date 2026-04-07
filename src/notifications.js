/**
 * NOIZY EMPIRE — Event Notification Helpers
 * High-level notification interface for Heaven worker events
 *
 * This module provides convenient helper functions for triggering
 * notifications from anywhere in the Heaven worker codebase.
 *
 * Usage:
 *   import { notifications } from './notifications.js';
 *   await notifications.onKillSwitch(env, { token_id, actor_id, reason });
 *
 * Author: Robert Stephen Plowman (RSP_001)
 * Version: 1.0.0 — April 2026
 */

import {
  dispatchNotification,
  notify,
  buildNotificationPayload,
  SEVERITY,
  EVENT_TYPES,
} from "./webhooks.js";

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION CONTEXT BUILDER
// Enrich notifications with contextual information
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get environment context for notifications
 * @param {Object} env - Environment bindings
 * @returns {Object} - Context object
 */
function getEnvironmentContext(env) {
  return {
    environment: env.NOIZY_ENV || "production",
    version: env.NOIZY_VERSION || "unknown",
    worker: "heaven",
    worker_url: "https://heaven.rsp-5f3.workers.dev",
  };
}

/**
 * Get actor context from database
 * @param {Object} db - GABRIEL_DB binding
 * @param {string} actorId - Actor ID
 * @returns {Promise<Object|null>} - Actor context
 */
async function getActorContext(db, actorId) {
  if (!db || !actorId) return null;

  try {
    const actor = await db
      .prepare(
        "SELECT actor_id, display_name, email, is_founding, status FROM hvs_actors WHERE actor_id = ?",
      )
      .bind(actorId)
      .first();

    if (!actor) return null;

    return {
      actor_id: actor.actor_id,
      display_name: actor.display_name,
      is_founding: !!actor.is_founding,
      status: actor.status,
    };
  } catch {
    return null;
  }
}

/**
 * Get consent token context from database
 * @param {Object} db - GABRIEL_DB binding
 * @param {string} tokenId - Token ID
 * @returns {Promise<Object|null>} - Token context
 */
async function getTokenContext(db, tokenId) {
  if (!db || !tokenId) return null;

  try {
    const token = await db
      .prepare(
        "SELECT token_id, actor_id, status, use_categories, expires_at FROM hvs_consent_tokens WHERE token_id = ?",
      )
      .bind(tokenId)
      .first();

    if (!token) return null;

    return {
      token_id: token.token_id,
      actor_id: token.actor_id,
      status: token.status,
      use_categories: token.use_categories,
      expires_at: token.expires_at,
    };
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENT NOTIFICATION HELPERS
// Semantic wrappers for common notification scenarios
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Main notifications interface
 * Import this object and call its methods to send notifications
 */
export const notifications = {
  /**
   * CRITICAL: Kill Switch activated
   * Called when an actor revokes all consent tokens
   *
   * @param {Object} env - Environment bindings
   * @param {Object} data - Event data
   * @param {string} data.token_id - Revoked token ID
   * @param {string} data.actor_id - Actor who activated kill switch
   * @param {string} data.reason - Revocation reason
   * @param {string} [data.revoked_by] - Who triggered the revocation
   * @returns {Promise<Object>} - Dispatch result
   */
  async onKillSwitch(env, data) {
    const context = getEnvironmentContext(env);
    const actorContext = await getActorContext(env.GABRIEL_DB, data.actor_id);
    const tokenContext = await getTokenContext(env.GABRIEL_DB, data.token_id);

    const enrichedData = {
      ...data,
      ...context,
      actor: actorContext,
      token: tokenContext,
      action: "KILL_SWITCH_ACTIVATED",
      message: `Kill switch activated by ${actorContext?.display_name || data.actor_id}. All synthesis immediately halted.`,
      impact: "All active consent tokens for this actor are now revoked.",
      next_steps: [
        "Review revocation reason",
        "Notify affected licensees",
        "Archive voice samples if requested",
      ],
    };

    return notify.killSwitch(env, enrichedData);
  },

  /**
   * CRITICAL: Never Clause violation attempted
   * Called when a synthesis request violates Never Clauses
   *
   * @param {Object} env - Environment bindings
   * @param {Object} data - Event data
   * @param {string} data.actor_id - Actor whose Never Clause was violated
   * @param {string} data.clause_code - The violated clause code (e.g., 'NC-001')
   * @param {string} data.clause_text - Human-readable clause text
   * @param {string} data.use_category - The attempted use category
   * @param {string} [data.licensee_id] - Licensee who attempted violation
   * @param {string} [data.request_id] - Synth request ID
   * @returns {Promise<Object>} - Dispatch result
   */
  async onNeverClauseViolation(env, data) {
    const context = getEnvironmentContext(env);
    const actorContext = await getActorContext(env.GABRIEL_DB, data.actor_id);

    const enrichedData = {
      ...data,
      ...context,
      actor: actorContext,
      action: "NEVER_CLAUSE_VIOLATION_BLOCKED",
      message: `Never Clause violation blocked: ${data.clause_code} - ${data.clause_text}`,
      attempted_use: data.use_category,
      enforcement: "Request blocked at consent kernel. No synthesis occurred.",
      severity_note: "Never Clauses are immutable. This violation was prevented.",
      review_required: !!data.licensee_id,
    };

    return notify.neverClauseViolation(env, enrichedData);
  },

  /**
   * HIGH: Consent token revoked
   * Called when a specific consent token is revoked (not full kill switch)
   *
   * @param {Object} env - Environment bindings
   * @param {Object} data - Event data
   * @param {string} data.token_id - Revoked token ID
   * @param {string} data.actor_id - Actor who owns the token
   * @param {string} [data.reason] - Revocation reason
   * @returns {Promise<Object>} - Dispatch result
   */
  async onConsentRevoked(env, data) {
    const context = getEnvironmentContext(env);
    const actorContext = await getActorContext(env.GABRIEL_DB, data.actor_id);
    const tokenContext = await getTokenContext(env.GABRIEL_DB, data.token_id);

    const enrichedData = {
      ...data,
      ...context,
      actor: actorContext,
      token: tokenContext,
      action: "CONSENT_TOKEN_REVOKED",
      message: `Consent token ${data.token_id} revoked for actor ${actorContext?.display_name || data.actor_id}`,
      impact: "Affected licenses should be reviewed.",
    };

    return notify.consentRevoked(env, enrichedData);
  },

  /**
   * HIGH: Error budget exhausted
   * Called when SLO error budget is depleted
   *
   * @param {Object} env - Environment bindings
   * @param {Object} data - Event data
   * @param {string} data.service - Service name (e.g., 'heaven_api', 'consent_kernel')
   * @param {number} data.slo - Target SLO (e.g., 0.999)
   * @param {number} data.current_success_rate - Current success rate
   * @param {number} data.failures_in_window - Number of failures
   * @param {string} data.window - Time window (e.g., '30d')
   * @returns {Promise<Object>} - Dispatch result
   */
  async onErrorBudgetExhausted(env, data) {
    const context = getEnvironmentContext(env);

    const enrichedData = {
      ...data,
      ...context,
      action: "ERROR_BUDGET_EXHAUSTED",
      message: `Error budget exhausted for ${data.service}. SLO: ${(data.slo * 100).toFixed(2)}%`,
      recommendation: "FREEZE: Prioritize reliability work over new features",
      impact: "Deployments should be paused until budget recovers",
      slo_target: `${(data.slo * 100).toFixed(2)}%`,
      current_rate: `${(data.current_success_rate * 100).toFixed(2)}%`,
    };

    return notify.errorBudgetExhausted(env, enrichedData);
  },

  /**
   * HIGH: Synthesis request blocked
   * Called when a synth request is blocked (not Never Clause, other reasons)
   *
   * @param {Object} env - Environment bindings
   * @param {Object} data - Event data
   * @param {string} data.actor_id - Actor ID
   * @param {string} data.reason - Block reason
   * @param {string} [data.request_id] - Request ID
   * @returns {Promise<Object>} - Dispatch result
   */
  async onSynthBlocked(env, data) {
    const context = getEnvironmentContext(env);
    const actorContext = await getActorContext(env.GABRIEL_DB, data.actor_id);

    const enrichedData = {
      ...data,
      ...context,
      actor: actorContext,
      action: "SYNTH_REQUEST_BLOCKED",
      message: `Synthesis blocked: ${data.reason}`,
      consent_enforced: true,
    };

    return notify.synthBlocked(env, enrichedData);
  },

  /**
   * NORMAL: New actor registered
   * Called when a new human actor joins the system
   *
   * @param {Object} env - Environment bindings
   * @param {Object} data - Event data
   * @param {string} data.actor_id - New actor ID
   * @param {string} data.display_name - Actor display name
   * @param {boolean} [data.is_founding] - Is founding actor
   * @param {string} [data.country] - Actor country
   * @returns {Promise<Object>} - Dispatch result
   */
  async onNewActor(env, data) {
    const context = getEnvironmentContext(env);

    const enrichedData = {
      ...data,
      ...context,
      action: "ACTOR_REGISTERED",
      message: `New actor registered: ${data.display_name} (${data.actor_id})`,
      tier: data.is_founding
        ? "Founding Actor (85% royalty floor)"
        : "Standard Actor (75% royalty floor)",
      welcome: "Consent sovereignty enabled. Voice is protected.",
    };

    return notify.newActor(env, enrichedData);
  },

  /**
   * NORMAL: Deployment completed
   * Called when a Heaven deployment succeeds
   *
   * @param {Object} env - Environment bindings
   * @param {Object} data - Event data
   * @param {string} data.version - Deployed version
   * @param {string} [data.deployment_id] - Cloudflare deployment ID
   * @param {string} [data.commit_sha] - Git commit SHA
   * @param {number} [data.smoke_tests_passed] - Number of smoke tests passed
   * @returns {Promise<Object>} - Dispatch result
   */
  async onDeployment(env, data) {
    const context = getEnvironmentContext(env);

    const enrichedData = {
      ...data,
      ...context,
      action: "DEPLOYMENT_COMPLETED",
      message: `Heaven deployed: v${data.version}`,
      url: "https://heaven.rsp-5f3.workers.dev",
      health_check: "https://heaven.rsp-5f3.workers.dev/health",
    };

    return notify.deploymentComplete(env, enrichedData);
  },

  /**
   * NORMAL: Voice DNA uploaded
   * Called when new voice DNA is recorded for an actor
   *
   * @param {Object} env - Environment bindings
   * @param {Object} data - Event data
   * @param {string} data.actor_id - Actor ID
   * @param {string} data.dna_id - Voice DNA ID
   * @param {number} [data.version] - DNA version
   * @param {string} [data.synthesis_model] - Synthesis model used
   * @returns {Promise<Object>} - Dispatch result
   */
  async onVoiceDna(env, data) {
    const context = getEnvironmentContext(env);
    const actorContext = await getActorContext(env.GABRIEL_DB, data.actor_id);

    const enrichedData = {
      ...data,
      ...context,
      actor: actorContext,
      action: "VOICE_DNA_RECORDED",
      message: `Voice DNA recorded for ${actorContext?.display_name || data.actor_id}`,
      protected: true,
      archival: "OAIS/PREMIS compliant — 100-year estate",
    };

    return notify.voiceDnaUploaded(env, enrichedData);
  },

  /**
   * NORMAL: License issued
   * Called when a new license is created
   *
   * @param {Object} env - Environment bindings
   * @param {Object} data - Event data
   * @param {string} data.license_id - License ID
   * @param {string} data.actor_id - Actor ID
   * @param {string} data.licensee_id - Licensee ID
   * @param {string} data.use_category - Use category
   * @param {number} [data.license_fee_cad] - License fee in CAD
   * @returns {Promise<Object>} - Dispatch result
   */
  async onLicense(env, data) {
    const context = getEnvironmentContext(env);
    const actorContext = await getActorContext(env.GABRIEL_DB, data.actor_id);

    const enrichedData = {
      ...data,
      ...context,
      actor: actorContext,
      action: "LICENSE_ISSUED",
      message: `License issued: ${data.use_category} for ${actorContext?.display_name || data.actor_id}`,
      royalty_split: actorContext?.is_founding ? "85/15 (Founding Actor)" : "75/25 (Standard)",
    };

    return notify.licenseIssued(env, enrichedData);
  },

  /**
   * NORMAL: Estate event
   * Called for estate-related events (inheritance, beneficiary changes)
   *
   * @param {Object} env - Environment bindings
   * @param {Object} data - Event data
   * @param {string} data.actor_id - Actor ID
   * @param {string} data.event - Estate event type
   * @param {Object} [data.details] - Event details
   * @returns {Promise<Object>} - Dispatch result
   */
  async onEstateEvent(env, data) {
    const context = getEnvironmentContext(env);
    const actorContext = await getActorContext(env.GABRIEL_DB, data.actor_id);

    const enrichedData = {
      ...data,
      ...context,
      actor: actorContext,
      action: "ESTATE_EVENT",
      message: `Estate event: ${data.event} for ${actorContext?.display_name || data.actor_id}`,
      preservation: "OAIS/PREMIS — 100-year archival guarantee",
    };

    return notify.estateEvent(env, enrichedData);
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// BATCH NOTIFICATION HELPERS
// For scenarios requiring multiple notifications
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Send notifications to multiple channels with fallback
 * If primary channel fails, attempts secondary channels
 *
 * @param {Object} env - Environment bindings
 * @param {string} eventType - Event type
 * @param {Object} data - Event data
 * @param {Array<string>} channels - Channels to try in order
 * @returns {Promise<Object>} - Results from all channels
 */
export async function notifyWithFallback(
  env,
  eventType,
  data,
  channels = ["slack", "email", "custom"],
) {
  const results = {};
  let anySuccess = false;

  for (const channel of channels) {
    if (anySuccess) break;

    const result = await dispatchNotification(env, eventType, data);
    results[channel] = result;

    if (result.results?.[channel]?.success) {
      anySuccess = true;
    }
  }

  return { anySuccess, results };
}

/**
 * Aggregate and batch notifications
 * Collects events and sends a summary notification
 *
 * @param {Object} env - Environment bindings
 * @param {Array<Object>} events - Array of { eventType, data } objects
 * @param {string} summaryTitle - Title for the summary
 * @returns {Promise<Object>} - Dispatch result
 */
export async function sendBatchNotification(env, events, summaryTitle = "NOIZY Event Summary") {
  if (!events.length) return { dispatched: false, reason: "No events to send" };

  // Determine highest severity
  const severities = events.map((e) => {
    const payload = buildNotificationPayload(e.eventType, e.data);
    return payload.severity;
  });

  const severityOrder = { CRITICAL: 4, HIGH: 3, NORMAL: 2, LOW: 1 };
  const maxSeverity = severities.reduce(
    (max, s) => (severityOrder[s] > severityOrder[max] ? s : max),
    SEVERITY.LOW,
  );

  const summaryData = {
    title: summaryTitle,
    event_count: events.length,
    events: events.map((e) => ({
      type: e.eventType,
      summary: e.data.message || e.data.summary || e.eventType,
    })),
    highest_severity: maxSeverity,
    timestamp: new Date().toISOString(),
  };

  return dispatchNotification(env, "batch.summary", summaryData);
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION HELPERS
// For managing notification configuration in KV
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Update notification configuration in KV
 *
 * @param {Object} kv - GABRIEL_KV binding
 * @param {Object} config - Configuration updates
 * @returns {Promise<Object>} - Updated configuration
 */
export async function updateNotificationConfig(kv, config) {
  if (!kv) throw new Error("GABRIEL_KV not available");

  const existing = (await kv.get("notify:config", "json")) || {};
  const updated = { ...existing, ...config };

  await kv.put("notify:config", JSON.stringify(updated));

  return updated;
}

/**
 * Get current notification configuration
 *
 * @param {Object} kv - GABRIEL_KV binding
 * @returns {Promise<Object>} - Current configuration
 */
export async function getNotificationConfig(kv) {
  if (!kv) return null;
  return await kv.get("notify:config", "json");
}

/**
 * Test notification delivery
 * Sends a test notification to verify configuration
 *
 * @param {Object} env - Environment bindings
 * @param {string} channel - Channel to test ('slack', 'email', 'custom')
 * @returns {Promise<Object>} - Test result
 */
export async function testNotification(env, channel = "slack") {
  const testData = {
    test: true,
    message: "This is a test notification from NOIZY Heaven",
    channel,
    timestamp: new Date().toISOString(),
  };

  return dispatchNotification(env, "test.notification", testData, "heaven");
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export { SEVERITY, EVENT_TYPES, dispatchNotification, buildNotificationPayload };

export default notifications;
