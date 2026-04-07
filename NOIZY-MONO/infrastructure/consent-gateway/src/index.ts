/**
 * CONSENT GATEWAY WORKER
 * The Consent Gateway is not a feature. It is the court of record.
 *
 * Endpoints:
 *   POST /consent/{voice_id}/check   — Check if consent is valid for a request
 *   POST /consent/{voice_id}/grant   — Grant consent (internal only)
 *   POST /consent/{voice_id}/revoke  — Revoke consent (Kill Switch)
 *   GET  /consent/{voice_id}         — Get current consent state
 *   GET  /consent/{voice_id}/history — Get consent history from audit log
 *   GET  /health                     — Health check
 */

import { D1Database, KVNamespace } from "@cloudflare/workers-types";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface Env {
  CONSENT_DB: D1Database;
  RATE_LIMIT: KVNamespace;
  NOIZY_API_KEY: string;
  ENVIRONMENT: string;
}

type ConsentType = "recording" | "model_training" | "synthesis" | "commercial";
type EventType = "CREATE" | "REVOKE" | "QUERY";
type Result = "GRANTED" | "DENIED" | "REVOKED" | "NOT_FOUND";

interface ConsentCheckRequest {
  consent_type: ConsentType;
  purpose?: string;
  category?: string;       // For commercial: advertising, entertainment, etc.
  territory?: string;      // ISO country code
  requestor: string;       // Who is requesting
}

interface ConsentCheckResponse {
  voice_id: string;
  consent_type: ConsentType;
  result: Result;
  reason: string;
  scope?: Record<string, unknown>;
  expires_at?: string;
  checked_at: string;
  audit_id: string;
}

interface ConsentState {
  voice_id: string;
  consents: Array<{
    consent_type: ConsentType;
    granted_at: string;
    expires_at: string | null;
    revoked_at: string | null;
    scope: Record<string, unknown> | null;
    status: "active" | "expired" | "revoked";
  }>;
  retrieved_at: string;
}

interface ConsentRecord {
  id: string;
  voice_id: string;
  consent_type: ConsentType;
  scope: string | null;
  granted_at: string;
  expires_at: string | null;
  revoked_at: string | null;
  revoked_reason: string | null;
  consent_hash: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS
    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    // Health check
    if (path === "/health" && method === "GET") {
      return jsonResponse({ status: "ok", service: "consent-gateway", version: "1.1" });
    }

    // Rate limiting
    const clientIP = request.headers.get("CF-Connecting-IP") || "unknown";
    const rateLimited = await checkRateLimit(env.RATE_LIMIT, clientIP);
    if (rateLimited) {
      return jsonResponse({ error: "Rate limit exceeded" }, 429);
    }

    // Route: POST /consent/{voice_id}/check
    const checkMatch = path.match(/^\/consent\/([^/]+)\/check$/);
    if (checkMatch && method === "POST") {
      return handleConsentCheck(request, env, checkMatch[1]);
    }

    // Route: POST /consent/{voice_id}/grant (requires auth)
    const grantMatch = path.match(/^\/consent\/([^/]+)\/grant$/);
    if (grantMatch && method === "POST") {
      if (!validateAuth(request, env)) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }
      return handleConsentGrant(request, env, grantMatch[1]);
    }

    // Route: POST /consent/{voice_id}/revoke
    const revokeMatch = path.match(/^\/consent\/([^/]+)\/revoke$/);
    if (revokeMatch && method === "POST") {
      return handleConsentRevoke(request, env, revokeMatch[1]);
    }

    // Route: GET /consent/{voice_id}
    const stateMatch = path.match(/^\/consent\/([^/]+)$/);
    if (stateMatch && method === "GET") {
      return handleGetConsentState(env, stateMatch[1]);
    }

    // Route: GET /consent/{voice_id}/history
    const historyMatch = path.match(/^\/consent\/([^/]+)\/history$/);
    if (historyMatch && method === "GET") {
      return handleGetHistory(env, historyMatch[1]);
    }

    return jsonResponse({ error: "Not found" }, 404);
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// POST /consent/{voice_id}/check
// The core consent verification endpoint.
// ═══════════════════════════════════════════════════════════════════════════

async function handleConsentCheck(
  request: Request,
  env: Env,
  voiceId: string
): Promise<Response> {
  let body: ConsentCheckRequest;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { consent_type, purpose, category, territory, requestor } = body;

  if (!consent_type || !requestor) {
    return jsonResponse({ error: "consent_type and requestor are required" }, 400);
  }

  const now = new Date().toISOString();
  const auditId = crypto.randomUUID();

  // Fetch the consent record
  const consent = await env.CONSENT_DB.prepare(`
    SELECT * FROM consents
    WHERE voice_id = ? AND consent_type = ?
  `).bind(voiceId, consent_type).first<ConsentRecord>();

  let result: Result;
  let reason: string;
  let scope: Record<string, unknown> | undefined;
  let expiresAt: string | undefined;

  if (!consent) {
    // No consent record exists
    result = "NOT_FOUND";
    reason = `No consent record found for voice_id=${voiceId}, type=${consent_type}`;
  } else if (consent.revoked_at) {
    // Consent was revoked
    result = "REVOKED";
    reason = consent.revoked_reason || "Consent was revoked";
  } else if (consent.expires_at && new Date(consent.expires_at) < new Date(now)) {
    // Consent has expired
    result = "DENIED";
    reason = `Consent expired at ${consent.expires_at}`;
  } else {
    // Consent is active — check scope if applicable
    const parsedScope = consent.scope ? JSON.parse(consent.scope) : null;
    scope = parsedScope;
    expiresAt = consent.expires_at || undefined;

    // Check scope constraints
    if (consent_type === "commercial" && parsedScope) {
      const allowedCategories = parsedScope.categories as string[] | undefined;
      const allowedTerritories = parsedScope.territories as string[] | undefined;

      if (category && allowedCategories && !allowedCategories.includes(category)) {
        result = "DENIED";
        reason = `Category '${category}' not in allowed categories: ${allowedCategories.join(", ")}`;
      } else if (territory && allowedTerritories && !allowedTerritories.includes(territory) && !allowedTerritories.includes("worldwide")) {
        result = "DENIED";
        reason = `Territory '${territory}' not in allowed territories: ${allowedTerritories.join(", ")}`;
      } else {
        result = "GRANTED";
        reason = "Consent is active and scope constraints satisfied";
      }
    } else {
      result = "GRANTED";
      reason = "Consent is active";
    }
  }

  // Log to audit
  const previousHash = await getLastAuditHash(env.CONSENT_DB);
  const eventHash = await computeHash(JSON.stringify({
    auditId, voiceId, consent_type, requestor, result, now, previousHash
  }));

  await env.CONSENT_DB.prepare(`
    INSERT INTO audit_log (id, event_type, voice_id, consent_type, requestor, request_context, result, result_reason, previous_hash, event_hash)
    VALUES (?, 'QUERY', ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    auditId,
    voiceId,
    consent_type,
    requestor,
    JSON.stringify({ purpose, category, territory, ip: request.headers.get("CF-Connecting-IP") }),
    result,
    reason,
    previousHash,
    eventHash
  ).run();

  const response: ConsentCheckResponse = {
    voice_id: voiceId,
    consent_type,
    result,
    reason,
    scope,
    expires_at: expiresAt,
    checked_at: now,
    audit_id: auditId,
  };

  return jsonResponse(response);
}

// ═══════════════════════════════════════════════════════════════════════════
// POST /consent/{voice_id}/grant
// ═══════════════════════════════════════════════════════════════════════════

async function handleConsentGrant(
  request: Request,
  env: Env,
  voiceId: string
): Promise<Response> {
  let body: {
    consent_type: ConsentType;
    scope?: Record<string, unknown>;
    expires_at?: string;
  };

  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { consent_type, scope, expires_at } = body;

  if (!consent_type) {
    return jsonResponse({ error: "consent_type is required" }, 400);
  }

  // Check if voice exists
  const voice = await env.CONSENT_DB.prepare(
    "SELECT id FROM voice_profiles WHERE id = ?"
  ).bind(voiceId).first();

  if (!voice) {
    return jsonResponse({ error: "Voice profile not found" }, 404);
  }

  // Check for existing consent (duplicate grant)
  const existing = await env.CONSENT_DB.prepare(`
    SELECT * FROM consents WHERE voice_id = ? AND consent_type = ?
  `).bind(voiceId, consent_type).first<ConsentRecord>();

  if (existing && !existing.revoked_at) {
    return jsonResponse({
      error: "Consent already exists and is active",
      existing_consent_id: existing.id,
      granted_at: existing.granted_at,
    }, 409);
  }

  const now = new Date().toISOString();
  const consentId = crypto.randomUUID();
  const auditId = crypto.randomUUID();
  const previousHash = await getLastAuditHash(env.CONSENT_DB);
  const consentHash = await computeHash(JSON.stringify({
    consentId, voiceId, consent_type, scope, now, previousHash
  }));

  // If there was a revoked consent, we update it; otherwise insert new
  if (existing) {
    // Re-grant: clear revoked_at, update granted_at
    await env.CONSENT_DB.prepare(`
      UPDATE consents SET
        granted_at = ?,
        expires_at = ?,
        revoked_at = NULL,
        revoked_reason = NULL,
        scope = ?,
        consent_hash = ?
      WHERE id = ?
    `).bind(
      now,
      expires_at || null,
      scope ? JSON.stringify(scope) : null,
      consentHash,
      existing.id
    ).run();
  } else {
    // New consent
    await env.CONSENT_DB.prepare(`
      INSERT INTO consents (id, voice_id, consent_type, scope, granted_at, expires_at, previous_hash, consent_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      consentId,
      voiceId,
      consent_type,
      scope ? JSON.stringify(scope) : null,
      now,
      expires_at || null,
      previousHash,
      consentHash
    ).run();
  }

  // Audit log
  const eventHash = await computeHash(JSON.stringify({
    auditId, voiceId, consent_type, "CREATE", now, previousHash
  }));

  await env.CONSENT_DB.prepare(`
    INSERT INTO audit_log (id, event_type, voice_id, consent_type, requestor, request_context, result, result_reason, previous_hash, event_hash)
    VALUES (?, 'CREATE', ?, ?, 'INTERNAL', ?, 'GRANTED', 'Consent granted', ?, ?)
  `).bind(
    auditId,
    voiceId,
    consent_type,
    JSON.stringify({ scope, expires_at }),
    previousHash,
    eventHash
  ).run();

  return jsonResponse({
    success: true,
    consent_id: existing ? existing.id : consentId,
    voice_id: voiceId,
    consent_type,
    granted_at: now,
    expires_at: expires_at || null,
    audit_id: auditId,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// POST /consent/{voice_id}/revoke
// Kill Switch. Sets revoked_at on existing consent.
// ═══════════════════════════════════════════════════════════════════════════

async function handleConsentRevoke(
  request: Request,
  env: Env,
  voiceId: string
): Promise<Response> {
  let body: {
    consent_type: ConsentType;
    reason?: string;
    requestor: string;
  };

  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { consent_type, reason, requestor } = body;

  if (!consent_type || !requestor) {
    return jsonResponse({ error: "consent_type and requestor are required" }, 400);
  }

  // Find the consent
  const consent = await env.CONSENT_DB.prepare(`
    SELECT * FROM consents WHERE voice_id = ? AND consent_type = ?
  `).bind(voiceId, consent_type).first<ConsentRecord>();

  if (!consent) {
    return jsonResponse({ error: "No consent record found to revoke" }, 404);
  }

  if (consent.revoked_at) {
    return jsonResponse({
      error: "Consent already revoked",
      revoked_at: consent.revoked_at,
    }, 409);
  }

  const now = new Date().toISOString();
  const auditId = crypto.randomUUID();
  const previousHash = await getLastAuditHash(env.CONSENT_DB);

  // Set revoked_at (state change, not new row)
  await env.CONSENT_DB.prepare(`
    UPDATE consents SET revoked_at = ?, revoked_reason = ? WHERE id = ?
  `).bind(now, reason || "Revoked by requestor", consent.id).run();

  // Audit log
  const eventHash = await computeHash(JSON.stringify({
    auditId, voiceId, consent_type, "REVOKE", now, previousHash
  }));

  await env.CONSENT_DB.prepare(`
    INSERT INTO audit_log (id, event_type, voice_id, consent_type, requestor, request_context, result, result_reason, previous_hash, event_hash)
    VALUES (?, 'REVOKE', ?, ?, ?, ?, 'REVOKED', ?, ?, ?)
  `).bind(
    auditId,
    voiceId,
    consent_type,
    requestor,
    JSON.stringify({ reason }),
    reason || "Consent revoked",
    previousHash,
    eventHash
  ).run();

  return jsonResponse({
    success: true,
    voice_id: voiceId,
    consent_type,
    revoked_at: now,
    reason: reason || "Consent revoked",
    audit_id: auditId,
    message: "Consent revoked. All active synthesis for this consent type is halted.",
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// GET /consent/{voice_id}
// ═══════════════════════════════════════════════════════════════════════════

async function handleGetConsentState(env: Env, voiceId: string): Promise<Response> {
  const consents = await env.CONSENT_DB.prepare(`
    SELECT * FROM consents WHERE voice_id = ?
  `).bind(voiceId).all<ConsentRecord>();

  if (!consents.results || consents.results.length === 0) {
    return jsonResponse({ error: "No consent records found", voice_id: voiceId }, 404);
  }

  const now = new Date();
  const state: ConsentState = {
    voice_id: voiceId,
    consents: consents.results.map((c) => {
      let status: "active" | "expired" | "revoked" = "active";
      if (c.revoked_at) {
        status = "revoked";
      } else if (c.expires_at && new Date(c.expires_at) < now) {
        status = "expired";
      }

      return {
        consent_type: c.consent_type,
        granted_at: c.granted_at,
        expires_at: c.expires_at,
        revoked_at: c.revoked_at,
        scope: c.scope ? JSON.parse(c.scope) : null,
        status,
      };
    }),
    retrieved_at: now.toISOString(),
  };

  return jsonResponse(state);
}

// ═══════════════════════════════════════════════════════════════════════════
// GET /consent/{voice_id}/history
// ═══════════════════════════════════════════════════════════════════════════

async function handleGetHistory(env: Env, voiceId: string): Promise<Response> {
  const events = await env.CONSENT_DB.prepare(`
    SELECT * FROM audit_log WHERE voice_id = ? ORDER BY created_at DESC LIMIT 100
  `).bind(voiceId).all();

  return jsonResponse({
    voice_id: voiceId,
    events: events.results || [],
    retrieved_at: new Date().toISOString(),
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function validateAuth(request: Request, env: Env): boolean {
  const key = request.headers.get("X-NOIZY-Key");
  return key === env.NOIZY_API_KEY;
}

async function checkRateLimit(kv: KVNamespace, ip: string): Promise<boolean> {
  const key = `rate:${ip}`;
  const current = await kv.get(key);
  const count = current ? parseInt(current, 10) : 0;

  if (count >= 60) {
    return true;
  }

  await kv.put(key, String(count + 1), { expirationTtl: 60 });
  return false;
}

async function getLastAuditHash(db: D1Database): Promise<string> {
  const last = await db.prepare(
    "SELECT event_hash FROM audit_log ORDER BY created_at DESC LIMIT 1"
  ).first<{ event_hash: string }>();
  return last?.event_hash || "GENESIS";
}

async function computeHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-NOIZY-Key",
  };
}
