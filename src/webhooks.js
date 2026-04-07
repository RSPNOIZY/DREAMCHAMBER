/**
 * NOIZY EMPIRE — Webhook Infrastructure
 * Cloudflare Worker for receiving, routing, and dispatching webhooks
 *
 * Endpoints:
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
 * Author: Robert Stephen Plowman (RSP_001)
 * Version: 1.0.0
 */

// ═══ Webhook Signature Verification ═══

async function verifyGitHubSignature(payload, signature, secret) {
  if (!secret || !signature) return false;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const expected = 'sha256=' + Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  return signature === expected;
}

async function verifyStripeSignature(payload, sigHeader, secret) {
  if (!secret || !sigHeader) return false;
  const parts = sigHeader.split(',').reduce((acc, part) => {
    const [k, v] = part.split('=');
    acc[k] = v;
    return acc;
  }, {});
  const timestamp = parts.t;
  const sig = parts.v1;
  if (!timestamp || !sig) return false;
  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const expected = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
  const expectedHex = Array.from(new Uint8Array(expected))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  return sig === expectedHex;
}

// ═══ Webhook Handlers ═══

const handlers = {

  // ── GitHub Events ──
  async github(payload, headers, env) {
    const event = headers.get('x-github-event') || 'unknown';
    const delivery = headers.get('x-github-delivery') || crypto.randomUUID();

    const actions = {
      push: () => {
        const branch = payload.ref?.replace('refs/heads/', '') || 'unknown';
        const commits = payload.commits?.length || 0;
        const pusher = payload.pusher?.name || 'unknown';
        return {
          summary: `${pusher} pushed ${commits} commit(s) to ${branch}`,
          repo: payload.repository?.full_name,
          branch, commits, pusher,
          action: 'push'
        };
      },
      pull_request: () => ({
        summary: `PR #${payload.number} ${payload.action}: ${payload.pull_request?.title}`,
        pr_number: payload.number,
        action: payload.action,
        title: payload.pull_request?.title,
        author: payload.pull_request?.user?.login
      }),
      release: () => ({
        summary: `Release ${payload.action}: ${payload.release?.tag_name}`,
        tag: payload.release?.tag_name,
        action: payload.action,
        name: payload.release?.name
      }),
      workflow_run: () => ({
        summary: `Workflow "${payload.workflow_run?.name}" ${payload.action}`,
        workflow: payload.workflow_run?.name,
        status: payload.workflow_run?.conclusion || payload.action,
        action: payload.action
      }),
      issues: () => ({
        summary: `Issue #${payload.issue?.number} ${payload.action}: ${payload.issue?.title}`,
        issue_number: payload.issue?.number,
        action: payload.action,
        title: payload.issue?.title
      }),
      star: () => ({
        summary: `${payload.sender?.login} ${payload.action} ⭐ repo`,
        action: payload.action,
        user: payload.sender?.login
      })
    };

    const handler = actions[event] || (() => ({
      summary: `GitHub event: ${event}`,
      action: event,
      raw_action: payload.action
    }));

    return {
      source: 'github',
      event,
      delivery_id: delivery,
      ...handler(),
      timestamp: new Date().toISOString()
    };
  },

  // ── Stripe Events ──
  async stripe(payload, headers, env) {
    const eventType = payload.type || 'unknown';
    const data = payload.data?.object || {};

    const actions = {
      'payment_intent.succeeded': () => ({
        summary: `Payment received: $${(data.amount / 100).toFixed(2)} ${data.currency?.toUpperCase()}`,
        amount: data.amount / 100,
        currency: data.currency,
        customer: data.customer,
        action: 'payment_received'
      }),
      'invoice.paid': () => ({
        summary: `Invoice paid: $${(data.amount_paid / 100).toFixed(2)}`,
        amount: data.amount_paid / 100,
        subscription: data.subscription,
        action: 'invoice_paid'
      }),
      'customer.subscription.created': () => ({
        summary: `New subscription: ${data.plan?.nickname || data.id}`,
        subscription_id: data.id,
        plan: data.plan?.nickname,
        action: 'subscription_created'
      }),
      'customer.subscription.deleted': () => ({
        summary: `Subscription cancelled: ${data.id}`,
        subscription_id: data.id,
        action: 'subscription_cancelled'
      }),
      'checkout.session.completed': () => ({
        summary: `Checkout complete: $${(data.amount_total / 100).toFixed(2)}`,
        amount: data.amount_total / 100,
        customer_email: data.customer_email,
        action: 'checkout_complete'
      })
    };

    const handler = actions[eventType] || (() => ({
      summary: `Stripe event: ${eventType}`,
      action: eventType
    }));

    return {
      source: 'stripe',
      event: eventType,
      stripe_event_id: payload.id,
      livemode: payload.livemode,
      ...handler(),
      timestamp: new Date().toISOString()
    };
  },

  // ── Cloudflare Events ──
  async cloudflare(payload, headers, env) {
    const eventType = payload.event || payload.type || 'deploy';
    return {
      source: 'cloudflare',
      event: eventType,
      summary: `CF ${eventType}: ${payload.worker || payload.zone || 'unknown'}`,
      worker: payload.worker,
      zone: payload.zone,
      status: payload.status || 'completed',
      deployment_id: payload.deployment_id,
      timestamp: new Date().toISOString()
    };
  },

  // ── Consent Lifecycle Events ──
  async consent(payload, headers, env) {
    const eventType = payload.event_type || 'consent.update';
    return {
      source: 'consent',
      event: eventType,
      summary: `Consent ${eventType}: actor ${payload.actor_id || 'unknown'}`,
      actor_id: payload.actor_id,
      token_id: payload.token_id,
      action: payload.action || eventType,
      never_clause_check: payload.never_clause_check,
      timestamp: new Date().toISOString()
    };
  },

  // ── Voice Pipeline Events ──
  async voice(payload, headers, env) {
    const eventType = payload.event || 'recording.complete';
    return {
      source: 'voice',
      event: eventType,
      summary: `Voice ${eventType}: ${payload.filename || payload.session_id || 'session'}`,
      session_id: payload.session_id,
      filename: payload.filename,
      duration_seconds: payload.duration,
      format: payload.format,
      quality: payload.quality,
      transcription_status: payload.transcription_status,
      timestamp: new Date().toISOString()
    };
  },

  // ── DreamChamber Events ──
  async dreamchamber(payload, headers, env) {
    const eventType = payload.event || 'session.update';
    return {
      source: 'dreamchamber',
      event: eventType,
      summary: `DreamChamber ${eventType}: ${payload.model || payload.crew_member || 'GABRIEL'}`,
      model: payload.model,
      crew_member: payload.crew_member,
      session_id: payload.session_id,
      prompt_tokens: payload.prompt_tokens,
      completion_tokens: payload.completion_tokens,
      action: payload.action,
      timestamp: new Date().toISOString()
    };
  }
};

// ═══ Webhook Dispatcher ═══

async function dispatchToGabriel(event, env) {
  // Forward to local GABRIEL instance
  try {
    const gabrielUrl = env.GABRIEL_URL || 'http://localhost:7777';
    await fetch(`${gabrielUrl}/api/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
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
    { expirationTtl: 86400 * 7 } // 7 days
  );

  // Maintain recent events list (last 100)
  const recentKey = 'webhook:recent';
  const recent = await kv.get(recentKey, 'json') || [];
  recent.unshift({ id: eventId, source: event.source, event: event.event, summary: event.summary, ts: event.timestamp });
  if (recent.length > 100) recent.length = 100;
  await kv.put(recentKey, JSON.stringify(recent), { expirationTtl: 86400 * 7 });

  // Increment counter
  const countKey = `webhook:count:${event.source}`;
  const count = parseInt(await kv.get(countKey) || '0') + 1;
  await kv.put(countKey, String(count), { expirationTtl: 86400 * 30 });
}

// ═══ Main Router ═══

async function handleWebhook(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  const kv = env.GABRIEL_KV;

  const CORS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-NOIZY-Key, X-Hub-Signature-256, Stripe-Signature',
    'X-Powered-By': 'HEAVEN/WEBHOOKS'
  };

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  // GET /webhooks/status
  if (path === '/webhooks/status' && method === 'GET') {
    const sources = ['github', 'stripe', 'cloudflare', 'consent', 'voice', 'dreamchamber'];
    const counts = {};
    for (const src of sources) {
      counts[src] = parseInt(await kv?.get(`webhook:count:${src}`) || '0');
    }
    return new Response(JSON.stringify({
      status: 'operational',
      version: '1.0.0',
      endpoints: sources.map(s => `/webhooks/${s}`),
      event_counts: counts,
      total_events: Object.values(counts).reduce((a, b) => a + b, 0),
      retention: '7 days',
      timestamp: new Date().toISOString()
    }), { headers: CORS });
  }

  // GET /webhooks/log
  if (path === '/webhooks/log' && method === 'GET') {
    const recent = await kv?.get('webhook:recent', 'json') || [];
    const source = url.searchParams.get('source');
    const filtered = source ? recent.filter(e => e.source === source) : recent;
    return new Response(JSON.stringify({
      events: filtered,
      count: filtered.length,
      timestamp: new Date().toISOString()
    }), { headers: CORS });
  }

  // POST /webhooks/:source
  if (method === 'POST') {
    const sourceMatch = path.match(/^\/webhooks\/([a-z]+)$/);
    const customMatch = path.match(/^\/webhooks\/custom\/([a-z0-9_-]+)$/);
    const source = sourceMatch?.[1] || (customMatch ? 'custom' : null);

    if (!source) {
      return new Response(JSON.stringify({ error: 'Unknown webhook endpoint' }), { status: 404, headers: CORS });
    }

    const rawBody = await request.text();
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), { status: 400, headers: CORS });
    }

    // Signature verification
    if (source === 'github' && env.GITHUB_WEBHOOK_SECRET) {
      const sig = request.headers.get('x-hub-signature-256');
      const valid = await verifyGitHubSignature(rawBody, sig, env.GITHUB_WEBHOOK_SECRET);
      if (!valid) {
        return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401, headers: CORS });
      }
    }

    if (source === 'stripe' && env.STRIPE_WEBHOOK_SECRET) {
      const sig = request.headers.get('stripe-signature');
      const valid = await verifyStripeSignature(rawBody, sig, env.STRIPE_WEBHOOK_SECRET);
      if (!valid) {
        return new Response(JSON.stringify({ error: 'Invalid Stripe signature' }), { status: 401, headers: CORS });
      }
    }

    // Process webhook
    const handler = handlers[source];
    let event;
    if (handler) {
      event = await handler(payload, request.headers, env);
    } else {
      // Custom webhook
      const customName = customMatch?.[1] || 'unknown';
      event = {
        source: 'custom',
        event: customName,
        summary: `Custom webhook: ${customName}`,
        payload,
        timestamp: new Date().toISOString()
      };
    }

    // Log to KV
    await logWebhookEvent(kv, event);

    // Dispatch to GABRIEL
    dispatchToGabriel(event, env);

    // Append to HEAVEN ledger
    if (env.GABRIEL_DB) {
      try {
        await env.GABRIEL_DB.prepare(`
          INSERT INTO noizy_ledger
            (event_id, event_type, payload_json, source_system, recorded_at)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          crypto.randomUUID(),
          `webhook.${event.source}.${event.event}`,
          JSON.stringify(event),
          'WEBHOOK',
          new Date().toISOString().replace('T', ' ').substring(0, 19)
        ).run();
      } catch (e) {
        // Non-critical — don't fail the webhook
      }
    }

    return new Response(JSON.stringify({
      received: true,
      source: event.source,
      event: event.event,
      summary: event.summary,
      timestamp: event.timestamp
    }), { status: 200, headers: CORS });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: CORS });
}

export { handleWebhook, handlers };
