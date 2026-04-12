/**
 * NOIZY EMPIRE — Webhook Infrastructure
 * Cloudflare Worker for receiving, routing, and dispatching webhooks
 *
 * INBOUND Endpoints:
 *   POST /webhooks/github         — GitHub push/PR/release events
 *   POST /webhooks/stripe         — Stripe payment/subscription events
 *   POST /webhooks/cloudflare     — Cloudflare deploy/DNS events
 *   POST /webhooks/consent        — Consent token lifecycle events
 *   POST /webhooks/voice          — Voice pipeline events
 *   POST /webhooks/dreamchamber   — DreamChamber session events
 *   POST /webhooks/custom/:name   — Custom webhook endpoints
 *   GET  /webhooks/status         — Webhook system status
 *   GET  /webhooks/log            — Recent webhook events
 *
 * OUTBOUND Dispatching:
 *   - Slack webhooks for critical events
 *   - Email via Cloudflare Email Workers
 *   - Custom webhook URLs from KV/env
 *   - Rate limiting to prevent spam
 *   - Ledger logging for all attempts
 *
 * Author: Robert Stephen Plowman (RSP_001)
 * Version: 2.0.0 — April 2026 (outbound notifications live)
 */

// ═══ Webhook Signature Verification ═══

async function verifyGitHubSignature(payload, signature, secret) {
  if (!secret || !signature) return false;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const expected =
    "sha256=" +
    Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  return signature === expected;
}

async function verifyStripeSignature(payload, sigHeader, secret) {
  if (!secret || !sigHeader) return false;
  const parts = sigHeader.split(",").reduce((acc, part) => {
    const [k, v] = part.split("=");
    acc[k] = v;
    return acc;
  }, {});
  const timestamp = parts.t;
  const sig = parts.v1;
  if (!timestamp || !sig) return false;
  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const expected = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
  const expectedHex = Array.from(new Uint8Array(expected))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return sig === expectedHex;
}

// ═══ Webhook Handlers ═══

const handlers = {
  // ── GitHub Events ──
  async github(payload, headers, env) {
    const event = headers.get("x-github-event") || "unknown";
    const delivery = headers.get("x-github-delivery") || crypto.randomUUID();

    const actions = {
      push: () => {
        const branch = payload.ref?.replace("refs/heads/", "") || "unknown";
        const commits = payload.commits?.length || 0;
        const pusher = payload.pusher?.name || "unknown";
        return {
          summary: `${pusher} pushed ${commits} commit(s) to ${branch}`,
          repo: payload.repository?.full_name,
          branch,
          commits,
          pusher,
          action: "push",
        };
      },
      pull_request: () => ({
        summary: `PR #${payload.number} ${payload.action}: ${payload.pull_request?.title}`,
        pr_number: payload.number,
        action: payload.action,
        title: payload.pull_request?.title,
        author: payload.pull_request?.user?.login,
      }),
      release: () => ({
        summary: `Release ${payload.action}: ${payload.release?.tag_name}`,
        tag: payload.release?.tag_name,
        action: payload.action,
        name: payload.release?.name,
      }),
      workflow_run: () => ({
        summary: `Workflow "${payload.workflow_run?.name}" ${payload.action}`,
        workflow: payload.workflow_run?.name,
        status: payload.workflow_run?.conclusion || payload.action,
        action: payload.action,
      }),
      issues: () => ({
        summary: `Issue #${payload.issue?.number} ${payload.action}: ${payload.issue?.title}`,
        issue_number: payload.issue?.number,
        action: payload.action,
        title: payload.issue?.title,
      }),
      star: () => ({
        summary: `${payload.sender?.login} ${payload.action} ⭐ repo`,
        action: payload.action,
        user: payload.sender?.login,
      }),
    };

    const handler =
      actions[event] ||
      (() => ({
        summary: `GitHub event: ${event}`,
        action: event,
        raw_action: payload.action,
      }));

    return {
      source: "github",
      event,
      delivery_id: delivery,
      ...handler(),
      timestamp: new Date().toISOString(),
    };
  },

  // ── Stripe Events ──
  async stripe(payload, headers, env) {
    const eventType = payload.type || "unknown";
    const data = payload.data?.object || {};

    const actions = {
      "payment_intent.succeeded": () => ({
        summary: `Payment received: $${(data.amount / 100).toFixed(2)} ${data.currency?.toUpperCase()}`,
        amount: data.amount / 100,
        currency: data.currency,
        customer: data.customer,
        action: "payment_received",
      }),
      "invoice.paid": () => ({
        summary: `Invoice paid: $${(data.amount_paid / 100).toFixed(2)}`,
        amount: data.amount_paid / 100,
        subscription: data.subscription,
        action: "invoice_paid",
      }),
      "customer.subscription.created": () => ({
        summary: `New subscription: ${data.plan?.nickname || data.id}`,
        subscription_id: data.id,
        plan: data.plan?.nickname,
        action: "subscription_created",
      }),
      "customer.subscription.deleted": () => ({
        summary: `Subscription cancelled: ${data.id}`,
        subscription_id: data.id,
        action: "subscription_cancelled",
      }),
      "checkout.session.completed": () => ({
        summary: `Checkout complete: $${(data.amount_total / 100).toFixed(2)}`,
        amount: data.amount_total / 100,
        customer_email: data.customer_email,
        action: "checkout_complete",
      }),
    };

    const handler =
      actions[eventType] ||
      (() => ({
        summary: `Stripe event: ${eventType}`,
        action: eventType,
      }));

    return {
      source: "stripe",
      event: eventType,
      stripe_event_id: payload.id,
      livemode: payload.livemode,
      ...handler(),
      timestamp: new Date().toISOString(),
    };
  },

  // ── Cloudflare Events ──
  async cloudflare(payload, headers, env) {
    const eventType = payload.event || payload.type || "deploy";
    return {
      source: "cloudflare",
      event: eventType,
      summary: `CF ${eventType}: ${payload.worker || payload.zone || "unknown"}`,
      worker: payload.worker,
      zone: payload.zone,
      status: payload.status || "completed",
      deployment_id: payload.deployment_id,
      timestamp: new Date().toISOString(),
    };
  },

  // ── Consent Lifecycle Events ──
  async consent(payload, headers, env) {
    const eventType = payload.event_type || "consent.update";
    return {
      source: "consent",
      event: eventType,
      summary: `Consent ${eventType}: actor ${payload.actor_id || "unknown"}`,
      actor_id: payload.actor_id,
      token_id: payload.token_id,
      action: payload.action || eventType,
      never_clause_check: payload.never_clause_check,
      timestamp: new Date().toISOString(),
    };
  },

  // ── Voice Pipeline Events ──
  async voice(payload, headers, env) {
    const eventType = payload.event || "recording.complete";
    return {
      source: "voice",
      event: eventType,
      summary: `Voice ${eventType}: ${payload.filename || payload.session_id || "session"}`,
      session_id: payload.session_id,
      filename: payload.filename,
      duration_seconds: payload.duration,
      format: payload.format,
      quality: payload.quality,
      transcription_status: payload.transcription_status,
      timestamp: new Date().toISOString(),
    };
  },

  // ── DreamChamber Events ──
  async dreamchamber(payload, headers, env) {
    const eventType = payload.event || "session.update";
    return {
      source: "dreamchamber",
      event: eventType,
      summary: `DreamChamber ${eventType}: ${payload.model || payload.crew_member || "GABRIEL"}`,
      model: payload.model,
      crew_member: payload.crew_member,
      session_id: payload.session_id,
      prompt_tokens: payload.prompt_tokens,
      completion_tokens: payload.completion_tokens,
      action: payload.action,
      timestamp: new Date().toISOString(),
    };
  },
};

// ═══ Webhook Dispatcher ═══

async function dispatchToGabriel(event, env) {
  // Forward to local GABRIEL instance
  try {
    const gabrielUrl = env.GABRIEL_URL || "http://localhost:7777";
    await fetch(`${gabrielUrl}/api/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
  } catch (e) {
    // GABRIEL may not be reachable from edge — that's expected
  }
}

async function logWebhookEvent(kv, event) {
  if (!kv) return;

  // Store event in KV with TTL
  const eventId = crypto.randomUUID();
  await kv.put(
    `webhook:event:${eventId}`,
    JSON.stringify(event),
    { expirationTtl: 86400 * 7 }, // 7 days
  );

  // Maintain recent events list (last 100)
  const recentKey = "webhook:recent";
  const recent = (await kv.get(recentKey, "json")) || [];
  recent.unshift({
    id: eventId,
    source: event.source,
    event: event.event,
    summary: event.summary,
    ts: event.timestamp,
  });
  if (recent.length > 100) recent.length = 100;
  await kv.put(recentKey, JSON.stringify(recent), { expirationTtl: 86400 * 7 });

  // Increment counter
  const countKey = `webhook:count:${event.source}`;
  const count = parseInt((await kv.get(countKey)) || "0") + 1;
  await kv.put(countKey, String(count), { expirationTtl: 86400 * 30 });
}

// ═══ Main Router ═══

async function handleWebhook(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  const kv = env.GABRIEL_KV;

  const CORS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-NOIZY-Key, X-Hub-Signature-256, Stripe-Signature",
    "X-Powered-By": "HEAVEN/WEBHOOKS",
  };

  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  // GET /webhooks/status
  if (path === "/webhooks/status" && method === "GET") {
    const sources = ["github", "stripe", "cloudflare", "consent", "voice", "dreamchamber"];
    const counts = {};
    for (const src of sources) {
      counts[src] = parseInt((await kv?.get(`webhook:count:${src}`)) || "0");
    }
    return new Response(
      JSON.stringify({
        status: "operational",
        version: "1.0.0",
        endpoints: sources.map((s) => `/webhooks/${s}`),
        event_counts: counts,
        total_events: Object.values(counts).reduce((a, b) => a + b, 0),
        retention: "7 days",
        timestamp: new Date().toISOString(),
      }),
      { headers: CORS },
    );
  }

  // GET /webhooks/log
  if (path === "/webhooks/log" && method === "GET") {
    const recent = (await kv?.get("webhook:recent", "json")) || [];
    const source = url.searchParams.get("source");
    const filtered = source ? recent.filter((e) => e.source === source) : recent;
    return new Response(
      JSON.stringify({
        events: filtered,
        count: filtered.length,
        timestamp: new Date().toISOString(),
      }),
      { headers: CORS },
    );
  }

  // POST /webhooks/:source
  if (method === "POST") {
    const sourceMatch = path.match(/^\/webhooks\/([a-z]+)$/);
    const customMatch = path.match(/^\/webhooks\/custom\/([a-z0-9_-]+)$/);
    const source = sourceMatch?.[1] || (customMatch ? "custom" : null);

    if (!source) {
      return new Response(JSON.stringify({ error: "Unknown webhook endpoint" }), {
        status: 404,
        headers: CORS,
      });
    }

    const rawBody = await request.text();
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
        status: 400,
        headers: CORS,
      });
    }

    // Signature verification
    if (source === "github" && env.GITHUB_WEBHOOK_SECRET) {
      const sig = request.headers.get("x-hub-signature-256");
      const valid = await verifyGitHubSignature(rawBody, sig, env.GITHUB_WEBHOOK_SECRET);
      if (!valid) {
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: CORS,
        });
      }
    }

    if (source === "stripe" && env.STRIPE_WEBHOOK_SECRET) {
      const sig = request.headers.get("stripe-signature");
      const valid = await verifyStripeSignature(rawBody, sig, env.STRIPE_WEBHOOK_SECRET);
      if (!valid) {
        return new Response(JSON.stringify({ error: "Invalid Stripe signature" }), {
          status: 401,
          headers: CORS,
        });
      }
    }

    // Process webhook
    const handler = handlers[source];
    let event;
    if (handler) {
      event = await handler(payload, request.headers, env);
    } else {
      // Custom webhook
      const customName = customMatch?.[1] || "unknown";
      event = {
        source: "custom",
        event: customName,
        summary: `Custom webhook: ${customName}`,
        payload,
        timestamp: new Date().toISOString(),
      };
    }

    // Log to KV
    await logWebhookEvent(kv, event);

    // Dispatch to GABRIEL
    dispatchToGabriel(event, env);

    // Append to HEAVEN ledger
    if (env.GABRIEL_DB) {
      try {
        await env.GABRIEL_DB.prepare(
          `
          INSERT INTO noizy_ledger
            (event_id, event_type, payload_json, source_system, recorded_at)
          VALUES (?, ?, ?, ?, ?)
        `,
        )
          .bind(
            crypto.randomUUID(),
            `webhook.${event.source}.${event.event}`,
            JSON.stringify(event),
            "WEBHOOK",
            new Date().toISOString().replace("T", " ").substring(0, 19),
          )
          .run();
      } catch (e) {
        // Non-critical — don't fail the webhook
      }
    }

    return new Response(
      JSON.stringify({
        received: true,
        source: event.source,
        event: event.event,
        summary: event.summary,
        timestamp: event.timestamp,
      }),
      { status: 200, headers: CORS },
    );
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: CORS,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// OUTBOUND NOTIFICATION DISPATCHER
// Fire webhooks on critical events (Kill Switch, Never Clause, etc.)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Severity levels for notifications
 */
export const SEVERITY = {
  CRITICAL: "CRITICAL", // Kill Switch, Never Clause violation
  HIGH: "HIGH", // Consent revoked, Error budget exhausted
  NORMAL: "NORMAL", // New actor, deployment complete
  LOW: "LOW", // Informational
};

/**
 * Event types that trigger outbound notifications
 */
export const EVENT_TYPES = {
  KILL_SWITCH_ACTIVATED: "kill_switch.activated",
  NEVER_CLAUSE_VIOLATION: "never_clause.blocked",
  CONSENT_TOKEN_REVOKED: "consent.revoked",
  NEW_ACTOR_REGISTERED: "actor.created",
  DEPLOYMENT_COMPLETED: "deployment.completed",
  ERROR_BUDGET_EXHAUSTED: "error_budget.exhausted",
  VOICE_DNA_UPLOADED: "voice_dna.recorded",
  SYNTH_REQUEST_BLOCKED: "synth.blocked",
  LICENSE_ISSUED: "license.issued",
  ESTATE_EVENT: "estate.event",
};

/**
 * Map event types to severity levels
 */
const EVENT_SEVERITY = {
  [EVENT_TYPES.KILL_SWITCH_ACTIVATED]: SEVERITY.CRITICAL,
  [EVENT_TYPES.NEVER_CLAUSE_VIOLATION]: SEVERITY.CRITICAL,
  [EVENT_TYPES.CONSENT_TOKEN_REVOKED]: SEVERITY.HIGH,
  [EVENT_TYPES.ERROR_BUDGET_EXHAUSTED]: SEVERITY.HIGH,
  [EVENT_TYPES.SYNTH_REQUEST_BLOCKED]: SEVERITY.HIGH,
  [EVENT_TYPES.NEW_ACTOR_REGISTERED]: SEVERITY.NORMAL,
  [EVENT_TYPES.DEPLOYMENT_COMPLETED]: SEVERITY.NORMAL,
  [EVENT_TYPES.VOICE_DNA_UPLOADED]: SEVERITY.NORMAL,
  [EVENT_TYPES.LICENSE_ISSUED]: SEVERITY.NORMAL,
  [EVENT_TYPES.ESTATE_EVENT]: SEVERITY.NORMAL,
};

/**
 * Rate limiting configuration (per event type)
 */
const RATE_LIMITS = {
  [SEVERITY.CRITICAL]: { max: 100, windowSec: 60 }, // 100/min for critical
  [SEVERITY.HIGH]: { max: 30, windowSec: 60 }, // 30/min for high
  [SEVERITY.NORMAL]: { max: 10, windowSec: 60 }, // 10/min for normal
  [SEVERITY.LOW]: { max: 5, windowSec: 60 }, // 5/min for low
};

/**
 * Build structured notification payload
 * @param {string} eventType - Event type from EVENT_TYPES
 * @param {Object} data - Event-specific data
 * @param {string} source - Source system (e.g., 'heaven', 'gabriel')
 * @returns {Object} - Structured payload
 */
export function buildNotificationPayload(eventType, data, source = "heaven") {
  const severity = EVENT_SEVERITY[eventType] || SEVERITY.NORMAL;
  const timestamp = new Date().toISOString();

  return {
    event_type: eventType,
    severity,
    timestamp,
    source,
    data: {
      ...data,
      event_id: crypto.randomUUID(),
    },
    meta: {
      version: "2.0.0",
      schema: "noizy/notification/v1",
      environment: "production",
    },
  };
}

/**
 * Format Slack message blocks for rich notifications
 * @param {Object} payload - Notification payload
 * @returns {Object} - Slack message format
 */
function formatSlackMessage(payload) {
  const severityEmoji = {
    [SEVERITY.CRITICAL]: ":rotating_light:",
    [SEVERITY.HIGH]: ":warning:",
    [SEVERITY.NORMAL]: ":information_source:",
    [SEVERITY.LOW]: ":speech_balloon:",
  };

  const severityColor = {
    [SEVERITY.CRITICAL]: "#FF0000",
    [SEVERITY.HIGH]: "#FF8C00",
    [SEVERITY.NORMAL]: "#36A64F",
    [SEVERITY.LOW]: "#808080",
  };

  const emoji = severityEmoji[payload.severity] || ":bell:";
  const color = severityColor[payload.severity] || "#808080";

  // Build title based on event type
  const titles = {
    [EVENT_TYPES.KILL_SWITCH_ACTIVATED]: "KILL SWITCH ACTIVATED",
    [EVENT_TYPES.NEVER_CLAUSE_VIOLATION]: "NEVER CLAUSE VIOLATION",
    [EVENT_TYPES.CONSENT_TOKEN_REVOKED]: "Consent Token Revoked",
    [EVENT_TYPES.ERROR_BUDGET_EXHAUSTED]: "Error Budget Exhausted",
    [EVENT_TYPES.NEW_ACTOR_REGISTERED]: "New Actor Registered",
    [EVENT_TYPES.DEPLOYMENT_COMPLETED]: "Deployment Completed",
    [EVENT_TYPES.VOICE_DNA_UPLOADED]: "Voice DNA Uploaded",
    [EVENT_TYPES.SYNTH_REQUEST_BLOCKED]: "Synthesis Request Blocked",
    [EVENT_TYPES.LICENSE_ISSUED]: "License Issued",
    [EVENT_TYPES.ESTATE_EVENT]: "Estate Event",
  };

  const title = titles[payload.event_type] || payload.event_type;

  // Build fields from data
  const fields = Object.entries(payload.data || {})
    .filter(([key]) => key !== "event_id")
    .slice(0, 10) // Max 10 fields
    .map(([key, value]) => ({
      type: "mrkdwn",
      text: `*${key}:*\n${typeof value === "object" ? JSON.stringify(value, null, 2) : value}`,
    }));

  return {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `${emoji} ${title}`,
          emoji: true,
        },
      },
      {
        type: "section",
        fields:
          fields.length > 0
            ? fields.slice(0, 2)
            : [{ type: "mrkdwn", text: "_No additional data_" }],
      },
      ...(fields.length > 2
        ? [
            {
              type: "section",
              fields: fields.slice(2, 4),
            },
          ]
        : []),
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `*Source:* ${payload.source} | *Severity:* ${payload.severity} | *Time:* ${payload.timestamp}`,
          },
        ],
      },
      {
        type: "divider",
      },
    ],
    attachments: [
      {
        color,
        fallback: `${title}: ${payload.event_type}`,
      },
    ],
  };
}

/**
 * Format email HTML for Cloudflare Email Workers
 * @param {Object} payload - Notification payload
 * @returns {Object} - Email format { subject, html, text }
 */
function formatEmailMessage(payload) {
  const titles = {
    [EVENT_TYPES.KILL_SWITCH_ACTIVATED]: "CRITICAL: Kill Switch Activated",
    [EVENT_TYPES.NEVER_CLAUSE_VIOLATION]: "CRITICAL: Never Clause Violation",
    [EVENT_TYPES.CONSENT_TOKEN_REVOKED]: "HIGH: Consent Token Revoked",
    [EVENT_TYPES.ERROR_BUDGET_EXHAUSTED]: "HIGH: Error Budget Exhausted",
    [EVENT_TYPES.NEW_ACTOR_REGISTERED]: "New Actor Registered",
    [EVENT_TYPES.DEPLOYMENT_COMPLETED]: "Deployment Completed",
    [EVENT_TYPES.VOICE_DNA_UPLOADED]: "Voice DNA Uploaded",
    [EVENT_TYPES.SYNTH_REQUEST_BLOCKED]: "Synthesis Request Blocked",
    [EVENT_TYPES.LICENSE_ISSUED]: "License Issued",
    [EVENT_TYPES.ESTATE_EVENT]: "Estate Event",
  };

  const subject = `[NOIZY ${payload.severity}] ${titles[payload.event_type] || payload.event_type}`;

  const dataRows = Object.entries(payload.data || {})
    .map(
      ([key, value]) =>
        `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">${key}</td><td style="padding:8px;border:1px solid #ddd;">${typeof value === "object" ? JSON.stringify(value, null, 2) : value}</td></tr>`,
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: ${payload.severity === SEVERITY.CRITICAL ? "#FF0000" : payload.severity === SEVERITY.HIGH ? "#FF8C00" : "#36A64F"}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 20px; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    .footer { background: #333; color: #999; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${titles[payload.event_type] || payload.event_type}</h1>
    </div>
    <div class="content">
      <p><strong>Event Type:</strong> ${payload.event_type}</p>
      <p><strong>Severity:</strong> ${payload.severity}</p>
      <p><strong>Source:</strong> ${payload.source}</p>
      <p><strong>Timestamp:</strong> ${payload.timestamp}</p>
      ${dataRows ? `<table>${dataRows}</table>` : ""}
    </div>
    <div class="footer">
      NOIZY Empire &mdash; Consent as executable code. | <a href="https://heaven.rsp-5f3.workers.dev" style="color:#999;">heaven.rsp-5f3.workers.dev</a>
    </div>
  </div>
</body>
</html>`;

  const text = `
[NOIZY ${payload.severity}] ${titles[payload.event_type] || payload.event_type}

Event Type: ${payload.event_type}
Severity: ${payload.severity}
Source: ${payload.source}
Timestamp: ${payload.timestamp}

Data:
${Object.entries(payload.data || {})
  .map(([k, v]) => `  ${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
  .join("\n")}

---
NOIZY Empire — Consent as executable code.
https://heaven.rsp-5f3.workers.dev
`;

  return { subject, html, text };
}

/**
 * Check rate limit for outbound notifications
 * @param {Object} kv - GABRIEL_KV binding
 * @param {string} eventType - Event type
 * @param {string} severity - Severity level
 * @returns {Promise<{allowed: boolean, remaining: number}>}
 */
async function checkNotificationRateLimit(kv, eventType, severity) {
  if (!kv) return { allowed: true, remaining: 999 };

  const config = RATE_LIMITS[severity] || RATE_LIMITS[SEVERITY.NORMAL];
  const key = `notify:rl:${eventType}`;
  const current = parseInt((await kv.get(key)) || "0");

  if (current >= config.max) {
    return { allowed: false, remaining: 0, reset: config.windowSec };
  }

  await kv.put(key, String(current + 1), { expirationTtl: config.windowSec });
  return { allowed: true, remaining: config.max - current - 1 };
}

/**
 * Get webhook configuration from KV or env
 * @param {Object} kv - GABRIEL_KV binding
 * @param {Object} env - Environment variables
 * @returns {Promise<Object>} - Webhook URLs and configuration
 */
async function getWebhookConfig(kv, env) {
  // Try KV first for dynamic configuration
  let config = null;
  if (kv) {
    config = await kv.get("notify:config", "json");
  }

  // Fall back to env vars
  return {
    slack: {
      url: config?.slack_url || env.SLACK_WEBHOOK_URL || null,
      channel: config?.slack_channel || env.SLACK_CHANNEL || "#noizy-alerts",
      enabled: !!(config?.slack_url || env.SLACK_WEBHOOK_URL),
    },
    email: {
      to: config?.email_to || env.NOTIFICATION_EMAIL || "rsp@noizy.ai",
      from: config?.email_from || env.EMAIL_FROM || "alerts@noizy.ai",
      enabled: !!(config?.email_enabled || env.EMAIL_WORKER_URL),
      workerUrl: config?.email_worker_url || env.EMAIL_WORKER_URL || null,
    },
    custom: {
      urls: config?.custom_urls || [],
      enabled: !!config?.custom_urls?.length,
    },
    // Severity filter: only send notifications at or above this level
    minSeverity: config?.min_severity || env.MIN_NOTIFICATION_SEVERITY || SEVERITY.NORMAL,
  };
}

/**
 * Log notification attempt to ledger
 * @param {Object} db - GABRIEL_DB binding
 * @param {Object} payload - Notification payload
 * @param {string} channel - Channel (slack, email, custom)
 * @param {string} status - Delivery status (sent, failed, rate_limited)
 * @param {string} error - Error message if failed
 */
async function logNotificationToLedger(db, payload, channel, status, error = null) {
  if (!db) return;

  try {
    await db
      .prepare(
        `
      INSERT INTO noizy_ledger
        (event_id, event_type, payload_json, source_system, recorded_at)
      VALUES (?, ?, ?, ?, ?)
    `,
      )
      .bind(
        crypto.randomUUID(),
        `notification.${channel}.${status}`,
        JSON.stringify({
          original_event: payload.event_type,
          severity: payload.severity,
          channel,
          status,
          error,
          event_data: payload.data,
        }),
        "NOTIFICATION",
        new Date().toISOString().replace("T", " ").substring(0, 19),
      )
      .run();
  } catch (e) {
    console.error("Failed to log notification to ledger:", e.message);
  }
}

/**
 * Send Slack webhook
 * @param {string} url - Slack webhook URL
 * @param {Object} payload - Notification payload
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function sendSlackNotification(url, payload) {
  if (!url) return { success: false, error: "No Slack webhook URL configured" };

  try {
    const message = formatSlackMessage(payload);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      return { success: false, error: `Slack returned ${response.status}` };
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Send email notification via Cloudflare Email Workers
 * @param {Object} config - Email configuration
 * @param {Object} payload - Notification payload
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function sendEmailNotification(config, payload) {
  if (!config.workerUrl) {
    return { success: false, error: "No email worker URL configured" };
  }

  try {
    const email = formatEmailMessage(payload);
    const response = await fetch(config.workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: config.to,
        from: config.from,
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
    });

    if (!response.ok) {
      return { success: false, error: `Email worker returned ${response.status}` };
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Send to custom webhook URL
 * @param {string} url - Custom webhook URL
 * @param {Object} payload - Notification payload
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function sendCustomWebhook(url, payload) {
  if (!url) return { success: false, error: "No URL provided" };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-NOIZY-Event": payload.event_type,
        "X-NOIZY-Severity": payload.severity,
        "X-NOIZY-Source": payload.source,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { success: false, error: `Custom webhook returned ${response.status}` };
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Severity level comparison
 * @param {string} a - Severity level a
 * @param {string} b - Severity level b
 * @returns {number} - Comparison result
 */
function compareSeverity(a, b) {
  const order = {
    [SEVERITY.CRITICAL]: 4,
    [SEVERITY.HIGH]: 3,
    [SEVERITY.NORMAL]: 2,
    [SEVERITY.LOW]: 1,
  };
  return (order[a] || 0) - (order[b] || 0);
}

/**
 * Main notification dispatcher
 * Fire notifications to all configured channels
 *
 * @param {Object} env - Environment bindings (GABRIEL_KV, GABRIEL_DB, etc.)
 * @param {string} eventType - Event type from EVENT_TYPES
 * @param {Object} data - Event-specific data
 * @param {string} source - Source system (default: 'heaven')
 * @returns {Promise<Object>} - Dispatch results
 */
export async function dispatchNotification(env, eventType, data, source = "heaven") {
  const kv = env.GABRIEL_KV;
  const db = env.GABRIEL_DB;

  // Build structured payload
  const payload = buildNotificationPayload(eventType, data, source);

  // Get configuration
  const config = await getWebhookConfig(kv, env);

  // Check if severity meets minimum threshold
  if (compareSeverity(payload.severity, config.minSeverity) < 0) {
    return {
      dispatched: false,
      reason: `Severity ${payload.severity} below minimum ${config.minSeverity}`,
      payload,
    };
  }

  // Check rate limit
  const rateLimit = await checkNotificationRateLimit(kv, eventType, payload.severity);
  if (!rateLimit.allowed) {
    await logNotificationToLedger(db, payload, "all", "rate_limited", "Rate limit exceeded");
    return {
      dispatched: false,
      reason: "Rate limit exceeded",
      reset: rateLimit.reset,
      payload,
    };
  }

  const results = {
    slack: { attempted: false, success: false },
    email: { attempted: false, success: false },
    custom: { attempted: false, success: false, urls: [] },
  };

  // Dispatch to Slack
  if (config.slack.enabled) {
    results.slack.attempted = true;
    const slackResult = await sendSlackNotification(config.slack.url, payload);
    results.slack.success = slackResult.success;
    results.slack.error = slackResult.error;
    await logNotificationToLedger(
      db,
      payload,
      "slack",
      slackResult.success ? "sent" : "failed",
      slackResult.error,
    );
  }

  // Dispatch to Email (only for HIGH and CRITICAL)
  if (config.email.enabled && compareSeverity(payload.severity, SEVERITY.HIGH) >= 0) {
    results.email.attempted = true;
    const emailResult = await sendEmailNotification(config.email, payload);
    results.email.success = emailResult.success;
    results.email.error = emailResult.error;
    await logNotificationToLedger(
      db,
      payload,
      "email",
      emailResult.success ? "sent" : "failed",
      emailResult.error,
    );
  }

  // Dispatch to custom webhooks
  if (config.custom.enabled) {
    results.custom.attempted = true;
    for (const url of config.custom.urls) {
      const customResult = await sendCustomWebhook(url, payload);
      results.custom.urls.push({ url, success: customResult.success, error: customResult.error });
      await logNotificationToLedger(
        db,
        payload,
        "custom",
        customResult.success ? "sent" : "failed",
        customResult.error,
      );
    }
    results.custom.success = results.custom.urls.some((r) => r.success);
  }

  return {
    dispatched: true,
    payload,
    results,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Convenience functions for common critical events
 */
export const notify = {
  /**
   * Kill Switch activated — CRITICAL
   */
  killSwitch: async (env, data) =>
    dispatchNotification(env, EVENT_TYPES.KILL_SWITCH_ACTIVATED, data, "heaven"),

  /**
   * Never Clause violation — CRITICAL
   */
  neverClauseViolation: async (env, data) =>
    dispatchNotification(env, EVENT_TYPES.NEVER_CLAUSE_VIOLATION, data, "heaven"),

  /**
   * Consent token revoked — HIGH
   */
  consentRevoked: async (env, data) =>
    dispatchNotification(env, EVENT_TYPES.CONSENT_TOKEN_REVOKED, data, "heaven"),

  /**
   * New actor registered — NORMAL
   */
  newActor: async (env, data) =>
    dispatchNotification(env, EVENT_TYPES.NEW_ACTOR_REGISTERED, data, "heaven"),

  /**
   * Deployment completed — NORMAL
   */
  deploymentComplete: async (env, data) =>
    dispatchNotification(env, EVENT_TYPES.DEPLOYMENT_COMPLETED, data, "heaven"),

  /**
   * Error budget exhausted — HIGH
   */
  errorBudgetExhausted: async (env, data) =>
    dispatchNotification(env, EVENT_TYPES.ERROR_BUDGET_EXHAUSTED, data, "heaven"),

  /**
   * Synthesis request blocked — HIGH
   */
  synthBlocked: async (env, data) =>
    dispatchNotification(env, EVENT_TYPES.SYNTH_REQUEST_BLOCKED, data, "heaven"),

  /**
   * Voice DNA uploaded — NORMAL
   */
  voiceDnaUploaded: async (env, data) =>
    dispatchNotification(env, EVENT_TYPES.VOICE_DNA_UPLOADED, data, "heaven"),

  /**
   * License issued — NORMAL
   */
  licenseIssued: async (env, data) =>
    dispatchNotification(env, EVENT_TYPES.LICENSE_ISSUED, data, "heaven"),

  /**
   * Estate event — NORMAL
   */
  estateEvent: async (env, data) =>
    dispatchNotification(env, EVENT_TYPES.ESTATE_EVENT, data, "heaven"),
};

export { handleWebhook, handlers };
