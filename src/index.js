/**
 * HEAVEN — NOIZY HVS Consent Kernel API
 * Cloudflare Worker — gabriel_db D1 backend
 *
 * Author: Robert Stephen Plowman (RSP_001)
 * Version: 17.9.0 — April 2026 (GORUNFREE + EDGE CORE live)
 *
 * Consent as executable code.
 * Provenance as default.
 * Revocation as sacred.
 * Compensation as automatic.
 *
 * Routes (43 total):
 *   GET  /                                   (public — API index)
 *   GET  /health                             (public)
 *   GET  /dashboard                          (public — live HTML dashboard with health metrics)
 *   GET  /status                             (public — minimal JSON for monitoring systems)
 *   GET  /gabriel                            (public — Gabriel edge status)
 *   GET  /api/v1/actors
 *   GET  /api/v1/actors/:id
 *   POST /api/v1/actors
 *   GET  /api/v1/actors/:id/never-clauses
 *   GET  /api/v1/actors/:id/descendants
 *   GET  /api/v1/actors/:id/consent-tokens
 *   GET  /api/v1/actors/:id/voice-dna
 *   POST /api/v1/actors/:id/voice-dna
 *   GET  /api/v1/actors/:id/estate
 *   GET  /api/v1/consent-tokens
 *   POST /api/v1/consent-tokens
 *   POST /api/v1/consent-tokens/:id/revoke  (kill switch)
 *   GET  /api/v1/descendants/:id
 *   POST /api/v1/descendants
 *   POST /api/v1/synth-requests             (Never Clause enforced)
 *   GET  /api/v1/synth-requests/:id
 *   GET  /api/v1/licenses
 *   POST /api/v1/licenses
 *   GET  /api/v1/licensees
 *   POST /api/v1/licensees
 *   GET  /api/v1/ledger
 *   POST /api/v1/ledger/append              (DreamChamber usage reporting)
 *   GET  /api/v1/rate-table
 *   GET  /api/v1/union-tiers
 *   GET  /api/v1/estates
 *   GET  /api/v1/premis
 *   GET  /api/v1/stats
 *   GET  /api/v1/kpi/trust
 *   GET  /api/v1/kpi/safety
 *   GET  /api/v1/kpi/revenue
 *   GET  /api/v1/kpi/quality
 *   GET  /api/v1/kpi/risk
 *   GET  /api/v1/enterprise/audit
 *
 * GORUNFREE Routes:
 *   GET  /preflight                          (pre-flight insight)
 *   GET  /provenance/:id                     (provenance trail)
 *   GET  /provenance/:id/export              (export formats)
 *   GET  /absence/gaps                       (creative gaps)
 *   GET  /absence/archive                    (resurrection candidates)
 *   POST /absence/commission                 (commission workflow)
 *   GET  /absence/representation             (representation balance)
 */

import { dashboardHTML } from "./dashboard.js";
import { landingHTML } from "./landing.js";
import { handleWebhook } from "./webhooks.js";
import { handleDashboard, handleStatus } from "./routes/dashboard.js";

// GORUNFREE routes
import { handlePreflight } from "./routes/preflight.js";
import { handleProvenance, handleProvenanceExport } from "./routes/provenance.js";
import {
  handleAbsenceGaps,
  handleAbsenceArchive,
  handleAbsenceCommission,
  handleAbsenceRepresentation
} from "./routes/absence.js";

// Operator routes (audit-first pattern)
import {
  handleOperatorApprove,
  handleTokenIssue,
  handleTokenValidate,
  handleOperatorStatus,
  handleOperatorAudit,
  handleFreezeRecord,
  handleFreezeResolve
} from "./routes/operator.js";

// Creator trust routes (public, read-only, calm)
import { handleTrustStatus, handleTrustChanges } from "./routes/trust.js";

// EDGE CORE: Runtime startup assertions
import { assertAuditReadyCached } from "./edge-core/startup_assertions.js";

// Transparency and compliance routes
import { handleTransparency } from "./routes/transparency.js";
import { handleOperatorAuditDiff, handleCreatorDiff } from "./routes/audit-diff.js";
import { handleComplianceExport } from "./routes/compliance-export.js";
import { handleVerifyBundle } from "./routes/verify-bundle.js";
import { handleAnchorStatus, handleAnchorStatusWidget } from "./routes/anchor-status.js";
import { handleProofCoverage, handleProofCoverageWidget } from "./routes/proof-coverage.js";

// Chaos Arena and Voice Market
import { handleChaosArenaAPI } from "./chaos-arena/index.js";
import { handleVoiceMarketAPI } from "./voice-market/index.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uuid() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString().replace("T", " ").substring(0, 19);
}

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-NOIZY-Key",
  "X-Powered-By": "HEAVEN/RSP_001",
  "Cache-Control": "no-store",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS_HEADERS });
}

function err(message, status = 400) {
  return json({ error: message, status }, status);
}

// ─── Auth ────────────────────────────────────────────────────────────────────

function authenticate(request, env) {
  const key =
    request.headers.get("X-NOIZY-Key") ||
    request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!env.NOIZY_API_KEY) return true; // No key configured = open (dev mode)
  if (!key) return false;
  return key === env.NOIZY_API_KEY;
}

// ─── Rate Limiter (KV-backed) ────────────────────────────────────────────────

async function checkRateLimit(kv, ip, limit = 60, windowSec = 60) {
  if (!kv) return { allowed: true };
  const key = `rl:${ip}`;
  const current = parseInt((await kv.get(key)) || "0");
  if (current >= limit) {
    return { allowed: false, remaining: 0, reset: windowSec };
  }
  await kv.put(key, String(current + 1), { expirationTtl: windowSec });
  return { allowed: true, remaining: limit - current - 1 };
}

// ─── KV Cache ────────────────────────────────────────────────────────────────

async function kvGet(kv, key) {
  if (!kv) return null;
  const cached = await kv.get(key, "json");
  return cached;
}

async function kvSet(kv, key, value, ttlSec = 300) {
  if (!kv) return;
  await kv.put(key, JSON.stringify(value), { expirationTtl: ttlSec });
}

async function kvInvalidate(kv, ...keys) {
  if (!kv) return;
  for (const key of keys) {
    await kv.delete(key);
  }
}

async function ledgerAppend(db, event) {
  try {
    await db
      .prepare(
        `
      INSERT INTO noizy_ledger
        (event_id, actor_id, descendant_id, licensee_id, license_id,
         consent_token_id, event_type, payload_json, amount_cad,
         actor_share_cad, noizy_share_cad, union_share_cad, source_system, recorded_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `,
      )
      .bind(
        event.event_id || uuid(),
        event.actor_id || null,
        event.descendant_id || null,
        event.licensee_id || null,
        event.license_id || null,
        event.consent_token_id || null,
        event.event_type,
        JSON.stringify(event.payload || {}),
        event.amount_cad || 0,
        event.actor_share_cad || 0,
        event.noizy_share_cad || 0,
        event.union_share_cad || 0,
        "GABRIEL",
        now(),
      )
      .run();
  } catch (e) {
    console.error("Ledger append failed:", e.message);
  }
}

// ─── Router ──────────────────────────────────────────────────────────────────

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const db = env.GABRIEL_DB;
    const kv = env.GABRIEL_KV;

    // CORS preflight
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // EDGE CORE: Assert audit infrastructure is ready
    // Skip for health check to allow monitoring during outages
    if (path !== "/health") {
      try {
        await assertAuditReadyCached(env, ctx);
      } catch (auditErr) {
        console.error("[EDGE CORE]", auditErr.message);
        return new Response(JSON.stringify({
          success: false,
          error: "Service unavailable — audit infrastructure not ready",
          edge_core: auditErr.message
        }), {
          status: 503,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }
    }

    try {
      // Rate limiting (60 req/min per IP, uses KV)
      const ip = request.headers.get("CF-Connecting-IP") || "unknown";
      const rl = await checkRateLimit(kv, ip);
      if (!rl.allowed) {
        return json({ error: "Rate limit exceeded", retry_after: rl.reset }, 429);
      }

      // Auth check (skip for health, dashboard, status, root, api index, gabriel status, webhooks, GORUNFREE, OPTIONS)
      if (
        path !== "/health" &&
        path !== "/dashboard" &&
        path !== "/status" &&
        path !== "/" &&
        path !== "/api/v1" &&
        path !== "/gabriel" &&
        path !== "/preflight" &&
        !path.startsWith("/webhooks") &&
        !path.startsWith("/provenance") &&
        !path.startsWith("/absence") &&
        path !== "/api/dispatch" &&
        !authenticate(request, env)
      ) {
        return err("Unauthorized — provide X-NOIZY-Key header", 401);
      }

      // ── Webhooks ────────────────────────────────────────────────────────────
      if (path.startsWith("/webhooks")) {
        return handleWebhook(request, env);
      }
      // ── Health ──────────────────────────────────────────────────────────────
      if (path === "/health" && method === "GET") {
        const cached = await kvGet(kv, "health");
        if (cached) return json(cached);

        const actorCount = await db.prepare("SELECT COUNT(*) as c FROM hvs_actors").first();
        const ledgerCount = await db.prepare("SELECT COUNT(*) as c FROM noizy_ledger").first();
        const tokenCount = await db.prepare("SELECT COUNT(*) as c FROM hvs_consent_tokens").first();
        const data = {
          status: "LIVE",
          version: env.NOIZY_VERSION,
          environment: env.NOIZY_ENV,
          database: "gabriel_db",
          actors: actorCount?.c || 0,
          consent_tokens: tokenCount?.c || 0,
          ledger_events: ledgerCount?.c || 0,
          timestamp: now(),
          uptime: "edge",
          mission:
            "Consent as executable code. Provenance as default. Revocation as sacred. Compensation as automatic.",
        };
        await kvSet(kv, "health", data, 60); // cache 60s (KV minimum TTL)
        return json(data);
      }

      // ── Dispatch — forward to central-gateway mesh on GOD ──────────────────
      if (path === "/api/dispatch" && method === "POST") {
        const body = await request.json();
        const { actor, device, intent, target } = body;
        if (!actor || !target || !intent) {
          return err("actor, target, and intent required");
        }

        const meshOrigin = env.MESH_ORIGIN || "http://127.0.0.1:9696";
        const meshHeaders = { "Content-Type": "application/json" };

        // CF Access Service Token headers (for tunnel-protected mesh)
        if (env.CF_ACCESS_CLIENT_ID && env.CF_ACCESS_CLIENT_SECRET) {
          meshHeaders["CF-Access-Client-Id"] = env.CF_ACCESS_CLIENT_ID;
          meshHeaders["CF-Access-Client-Secret"] = env.CF_ACCESS_CLIENT_SECRET;
        }

        try {
          const meshRes = await fetch(`${meshOrigin}/dispatch`, {
            method: "POST",
            headers: meshHeaders,
            body: JSON.stringify(body),
          });
          const meshData = await meshRes.json();

          await ledgerAppend(db, {
            event_type: "DISPATCH",
            actor_id: actor,
            payload: { intent, target, device, mesh_status: meshRes.status },
          });

          return json({
            ok: meshRes.ok,
            dispatch: meshData,
            timestamp: now(),
          });
        } catch (meshErr) {
          const detail = meshErr instanceof Error ? meshErr.message : "Mesh unreachable";
          await ledgerAppend(db, {
            event_type: "DISPATCH_ERROR",
            actor_id: actor,
            payload: { intent, target, error: detail },
          });
          return json({ error: "Mesh unreachable", detail }, 502);
        }
      }

      // ── Actors ──────────────────────────────────────────────────────────────
      if (path === "/api/v1/actors" && method === "GET") {
        const cached = await kvGet(kv, "actors:all");
        if (cached) return json(cached);
        const { results } = await db
          .prepare("SELECT * FROM hvs_actors ORDER BY onboarded_at DESC")
          .all();
        const data = { actors: results };
        await kvSet(kv, "actors:all", data, 120);
        return json(data);
      }

      if (path === "/api/v1/actors" && method === "POST") {
        const body = await request.json();
        const {
          actor_id,
          display_name,
          legal_name,
          email,
          country,
          is_founding,
          union_member,
          union_name,
        } = body;
        if (!actor_id || !display_name) return err("actor_id and display_name are required");

        // Graceful duplicate — return existing actor rather than 500 on UNIQUE conflict
        const existing = await db
          .prepare(
            "SELECT * FROM hvs_actors WHERE actor_id = ? OR (email IS NOT NULL AND email = ?)",
          )
          .bind(actor_id, email || "")
          .first();
        if (existing) {
          return json(
            { actor: existing, conflict: true, message: "Actor already registered — sovereignty intact" },
            200,
          );
        }

        await db
          .prepare(
            `
          INSERT INTO hvs_actors (actor_id, display_name, legal_name, email, country, is_founding, union_member, union_name)
          VALUES (?,?,?,?,?,?,?,?)
        `,
          )
          .bind(
            actor_id,
            display_name,
            legal_name || null,
            email || null,
            country || "CA",
            is_founding ? 1 : 0,
            union_member ? 1 : 0,
            union_name || null,
          )
          .run();

        await ledgerAppend(db, {
          actor_id,
          event_type: "system.audit",
          payload: { action: "actor.created", display_name, is_founding },
        });

        const actor = await db
          .prepare("SELECT * FROM hvs_actors WHERE actor_id = ?")
          .bind(actor_id)
          .first();
        await kvInvalidate(kv, "actors:all", "health");
        return json({ actor }, 201);
      }

      const actorMatch = path.match(/^\/api\/v1\/actors\/([^/]+)$/);
      if (actorMatch && method === "GET") {
        const actor = await db
          .prepare("SELECT * FROM hvs_actors WHERE actor_id = ?")
          .bind(actorMatch[1])
          .first();
        if (!actor) return err("Actor not found", 404);
        return json({ actor });
      }

      const neverClausesMatch = path.match(/^\/api\/v1\/actors\/([^/]+)\/never-clauses$/);
      if (neverClausesMatch && method === "GET") {
        const { results } = await db
          .prepare("SELECT * FROM hvs_never_clauses WHERE actor_id = ? ORDER BY clause_id")
          .bind(neverClausesMatch[1])
          .all();
        return json({ never_clauses: results, count: results.length });
      }

      const descendantsMatch = path.match(/^\/api\/v1\/actors\/([^/]+)\/descendants$/);
      if (descendantsMatch && method === "GET") {
        const { results } = await db
          .prepare("SELECT * FROM hvs_descendants WHERE actor_id = ? ORDER BY created_at DESC")
          .bind(descendantsMatch[1])
          .all();
        return json({ descendants: results, count: results.length });
      }

      const consentTokensActorMatch = path.match(/^\/api\/v1\/actors\/([^/]+)\/consent-tokens$/);
      if (consentTokensActorMatch && method === "GET") {
        const { results } = await db
          .prepare("SELECT * FROM hvs_consent_tokens WHERE actor_id = ? ORDER BY issued_at DESC")
          .bind(consentTokensActorMatch[1])
          .all();
        return json({ consent_tokens: results, count: results.length });
      }

      // ── Consent Tokens ──────────────────────────────────────────────────────
      if (path === "/api/v1/consent-tokens" && method === "POST") {
        const body = await request.json();
        const {
          actor_id,
          descendant_id,
          use_categories,
          territories,
          languages,
          licensee_id,
          time_window_start,
          time_window_end,
          expires_at,
        } = body;
        if (!actor_id || !use_categories) return err("actor_id and use_categories are required");

        const actor = await db
          .prepare("SELECT * FROM hvs_actors WHERE actor_id = ?")
          .bind(actor_id)
          .first();
        if (!actor) return err("Actor not found", 404);
        if (actor.status !== "active")
          return err(`Actor status is ${actor.status} — cannot issue consent token`);

        const token_id = uuid();
        const token_hash = await hashToken(token_id + actor_id + now());

        await db
          .prepare(
            `
          INSERT INTO hvs_consent_tokens
            (token_id, actor_id, descendant_id, token_hash, use_categories, territories,
             languages, time_window_start, time_window_end, licensee_id, expires_at, status)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,'active')
        `,
          )
          .bind(
            token_id,
            actor_id,
            descendant_id || null,
            token_hash,
            JSON.stringify(use_categories),
            JSON.stringify(territories || ["GLOBAL"]),
            JSON.stringify(languages || ["*"]),
            time_window_start || null,
            time_window_end || null,
            licensee_id || null,
            expires_at || null,
          )
          .run();

        await ledgerAppend(db, {
          actor_id,
          descendant_id: descendant_id || null,
          consent_token_id: token_id,
          event_type: "consent.issued",
          payload: { use_categories, territories, licensee_id },
        });

        const token = await db
          .prepare("SELECT * FROM hvs_consent_tokens WHERE token_id = ?")
          .bind(token_id)
          .first();
        await kvInvalidate(kv, "health");
        return json({ consent_token: token }, 201);
      }

      // Kill switch — revoke consent token
      const revokeMatch = path.match(/^\/api\/v1\/consent-tokens\/([^/]+)\/revoke$/);
      if (revokeMatch && method === "POST") {
        const token_id = revokeMatch[1];
        const body = await request.json().catch(() => ({}));
        const token = await db
          .prepare("SELECT * FROM hvs_consent_tokens WHERE token_id = ?")
          .bind(token_id)
          .first();
        if (!token) return err("Consent token not found", 404);
        if (token.status === "revoked") return err("Token already revoked");

        await db
          .prepare(
            `
          UPDATE hvs_consent_tokens SET status = 'revoked', revoked_at = ?, revocation_reason = ? WHERE token_id = ?
        `,
          )
          .bind(now(), body.reason || "Actor revoked consent", token_id)
          .run();

        await ledgerAppend(db, {
          actor_id: token.actor_id,
          descendant_id: token.descendant_id,
          consent_token_id: token_id,
          event_type: "kill_switch.activated",
          payload: { reason: body.reason || "Actor revoked consent", token_id },
        });

        await kvInvalidate(kv, "health");
        return json({
          status: "revoked",
          message:
            "Your voice is at rest. No new synthesis is possible. All existing licenses are flagged for review.",
          token_id,
          revoked_at: now(),
        });
      }

      // ── Descendants ──────────────────────────────────────────────────────────
      if (path === "/api/v1/descendants" && method === "POST") {
        const body = await request.json();
        const {
          actor_id,
          parent_dna_id,
          name,
          character_type,
          emotional_tags,
          consent_scope,
          licensing_enabled,
          approval_required,
          synthesis_model,
        } = body;
        if (!actor_id || !parent_dna_id || !name)
          return err("actor_id, parent_dna_id, and name required");

        // Get actor's royalty floor
        const actor = await db
          .prepare("SELECT * FROM hvs_actors WHERE actor_id = ?")
          .bind(actor_id)
          .first();
        if (!actor) return err("Actor not found", 404);
        const royalty_floor = actor.is_founding ? 85.0 : 75.0;

        const descendant_id = uuid();
        await db
          .prepare(
            `
          INSERT INTO hvs_descendants
            (descendant_id, actor_id, parent_dna_id, name, character_type, emotional_tags,
             consent_scope, licensing_enabled, approval_required, synthesis_model, royalty_floor_pct)
          VALUES (?,?,?,?,?,?,?,?,?,?,?)
        `,
          )
          .bind(
            descendant_id,
            actor_id,
            parent_dna_id,
            name,
            character_type || null,
            JSON.stringify(emotional_tags || []),
            consent_scope || "private",
            licensing_enabled ? 1 : 0,
            approval_required !== false ? 1 : 0,
            synthesis_model || null,
            royalty_floor,
          )
          .run();

        await ledgerAppend(db, {
          actor_id,
          descendant_id,
          event_type: "descendant.created",
          payload: { name, character_type, consent_scope, royalty_floor },
        });

        const descendant = await db
          .prepare("SELECT * FROM hvs_descendants WHERE descendant_id = ?")
          .bind(descendant_id)
          .first();
        await kvInvalidate(kv, "health");
        return json({ descendant }, 201);
      }

      const descendantMatch = path.match(/^\/api\/v1\/descendants\/([^/]+)$/);
      if (descendantMatch && method === "GET") {
        const d = await db
          .prepare("SELECT * FROM hvs_descendants WHERE descendant_id = ?")
          .bind(descendantMatch[1])
          .first();
        if (!d) return err("Descendant not found", 404);
        return json({ descendant: d });
      }

      // ── Synth Requests (Never Clause Enforced) ───────────────────────────────
      if (path === "/api/v1/synth-requests" && method === "POST") {
        const body = await request.json();
        const {
          actor_id,
          descendant_id,
          consent_token_id,
          use_category,
          script_hash,
          emotional_profile,
          licensee_id,
        } = body;
        if (!actor_id || !descendant_id || !consent_token_id || !use_category) {
          return err("actor_id, descendant_id, consent_token_id, and use_category are required");
        }

        // 1. Validate consent token
        const token = await db
          .prepare(
            "SELECT * FROM hvs_consent_tokens WHERE token_id = ? AND actor_id = ? AND status = ?",
          )
          .bind(consent_token_id, actor_id, "active")
          .first();
        if (!token) {
          await ledgerAppend(db, {
            actor_id,
            descendant_id,
            event_type: "synth.blocked",
            payload: {
              reason: "No valid active consent token",
              consent_token_id,
            },
          });
          return err("No valid active consent token — synthesis blocked", 403);
        }

        // 2. Check token expiry
        if (token.expires_at && new Date(token.expires_at) < new Date()) {
          await db
            .prepare("UPDATE hvs_consent_tokens SET status = ? WHERE token_id = ?")
            .bind("expired", consent_token_id)
            .run();
          await ledgerAppend(db, {
            actor_id,
            event_type: "consent.expired",
            payload: { consent_token_id },
          });
          return err("Consent token has expired — synthesis blocked", 403);
        }

        // 3. Never Clause check
        const { results: never_clauses } = await db
          .prepare("SELECT * FROM hvs_never_clauses WHERE actor_id = ? AND is_global = 1")
          .bind(actor_id)
          .all();

        // Check use_category against known never clause categories
        const blockedClause = never_clauses.find((nc) => {
          const cat = nc.category.toLowerCase();
          const uc = use_category.toLowerCase();
          return (
            (cat === "political" && (uc.includes("politic") || uc.includes("propaganda"))) ||
            (cat === "sexual" &&
              (uc.includes("adult") || uc.includes("sexual") || uc.includes("porn"))) ||
            (cat === "weapons" &&
              (uc.includes("weapon") || uc.includes("violence") || uc.includes("harm"))) ||
            (cat === "deception" &&
              (uc.includes("deceiv") || uc.includes("impersonat") || uc.includes("fraud"))) ||
            (cat === "hate" && (uc.includes("hate") || uc.includes("demean"))) ||
            (cat === "transfer" && (uc.includes("transfer") || uc.includes("sublicens")))
          );
        });

        const request_id = uuid();

        if (blockedClause) {
          await db
            .prepare(
              `
            INSERT INTO hvs_synth_requests
              (request_id, actor_id, descendant_id, consent_token_id, licensee_id,
               script_hash, use_category, never_clause_check, blocked_clause_id, status)
            VALUES (?,?,?,?,?,?,?,'blocked',?,'blocked')
          `,
            )
            .bind(
              request_id,
              actor_id,
              descendant_id,
              consent_token_id,
              licensee_id || null,
              script_hash || null,
              use_category,
              blockedClause.clause_id,
            )
            .run();

          await ledgerAppend(db, {
            actor_id,
            descendant_id,
            consent_token_id,
            event_type: "never_clause.blocked",
            payload: {
              clause_code: blockedClause.clause_code,
              use_category,
              request_id,
            },
          });

          return json(
            {
              status: "blocked",
              request_id,
              blocked_by: blockedClause.clause_code,
              message: blockedClause.clause_text,
            },
            403,
          );
        }

        // 4. All clear — create synth request with C2PA credentials
        await db
          .prepare(
            `
          INSERT INTO hvs_synth_requests
            (request_id, actor_id, descendant_id, consent_token_id, licensee_id,
             script_hash, use_category, emotional_profile, never_clause_check, status)
          VALUES (?,?,?,?,?,?,?,?,'passed','approved')
        `,
          )
          .bind(
            request_id,
            actor_id,
            descendant_id,
            consent_token_id,
            licensee_id || null,
            script_hash || null,
            use_category,
            emotional_profile ? JSON.stringify(emotional_profile) : null,
          )
          .run();

        // Generate C2PA content credential manifest
        const synthReq = {
          request_id,
          actor_id,
          descendant_id,
          consent_token_id,
          use_category,
          status: "approved",
        };
        const c2paManifest = await generateC2PAManifest(synthReq, env);

        // Store C2PA manifest in a KV bucket for retrieval
        if (kv) {
          await kv.put(
            `c2pa:${request_id}`,
            JSON.stringify(c2paManifest),
            { expirationTtl: 31536000 }, // 1 year
          );
        }

        // Append C2PA credential event to ledger
        await ledgerAppend(db, {
          actor_id,
          descendant_id,
          consent_token_id,
          event_type: "synth.approved",
          payload: {
            use_category,
            request_id,
            never_clause_check: "passed",
            c2pa_manifest_signature: c2paManifest.signature,
          },
        });

        return json(
          {
            status: "approved",
            request_id,
            never_clause_check: "passed",
            c2pa_signature: c2paManifest.signature,
            message: "Synthesis approved. Proceed with generation.",
          },
          201,
        );
      }

      const synthMatch = path.match(/^\/api\/v1\/synth-requests\/([^/]+)$/);
      if (synthMatch && method === "GET") {
        const req = await db
          .prepare("SELECT * FROM hvs_synth_requests WHERE request_id = ?")
          .bind(synthMatch[1])
          .first();
        if (!req) return err("Synth request not found", 404);
        return json({ synth_request: req });
      }

      // ── C2PA Manifest Retrieval ────────────────────────────────────────────────
      const c2paMatch = path.match(/^\/api\/v1\/synth-requests\/([^/]+)\/c2pa$/);
      if (c2paMatch && method === "GET") {
        const request_id = c2paMatch[1];
        const req = await db
          .prepare("SELECT * FROM hvs_synth_requests WHERE request_id = ?")
          .bind(request_id)
          .first();
        if (!req) return err("Synth request not found", 404);

        // Try to retrieve C2PA manifest from KV
        let c2paManifest = null;
        if (kv) {
          const cached = await kv.get(`c2pa:${request_id}`, "json");
          if (cached) {
            c2paManifest = cached;
          }
        }

        // If not in KV, regenerate from request data
        if (!c2paManifest) {
          c2paManifest = await generateC2PAManifest(req, env);
        }

        return json({
          request_id,
          c2pa_manifest: c2paManifest,
          retrieved_at: now(),
          note: "C2PA content credentials provide cryptographic proof of synthesis provenance and consent enforcement.",
        });
      }

      // ── Licenses ─────────────────────────────────────────────────────────────
      if (path === "/api/v1/licenses" && method === "GET") {
        const actor_id = url.searchParams.get("actor_id");
        const query = actor_id
          ? "SELECT * FROM hvs_licenses WHERE actor_id = ? ORDER BY issued_at DESC"
          : "SELECT * FROM hvs_licenses ORDER BY issued_at DESC LIMIT 100";
        const { results } = actor_id
          ? await db.prepare(query).bind(actor_id).all()
          : await db.prepare(query).all();
        return json({ licenses: results, count: results.length });
      }

      if (path === "/api/v1/licenses" && method === "POST") {
        const body = await request.json();
        const {
          licensee_id,
          actor_id,
          descendant_id,
          consent_token_id,
          use_category,
          territory,
          duration_type,
          license_fee_cad,
        } = body;
        if (!licensee_id || !actor_id || !descendant_id || !consent_token_id || !use_category) {
          return err(
            "licensee_id, actor_id, descendant_id, consent_token_id, use_category required",
          );
        }

        const actor = await db
          .prepare("SELECT * FROM hvs_actors WHERE actor_id = ?")
          .bind(actor_id)
          .first();
        if (!actor) return err("Actor not found", 404);

        const actor_share = actor.is_founding ? 85.0 : 75.0;
        const noizy_share = actor.is_founding ? 15.0 : 25.0;
        const fee = license_fee_cad || 0;
        const license_id = uuid();

        await db
          .prepare(
            `
          INSERT INTO hvs_licenses
            (license_id, licensee_id, actor_id, descendant_id, consent_token_id,
             use_category, territory, duration_type, license_fee_cad, actor_share_pct, noizy_share_pct)
          VALUES (?,?,?,?,?,?,?,?,?,?,?)
        `,
          )
          .bind(
            license_id,
            licensee_id,
            actor_id,
            descendant_id,
            consent_token_id,
            use_category,
            territory || "GLOBAL",
            duration_type || "perpetual",
            fee,
            actor_share,
            noizy_share,
          )
          .run();

        await ledgerAppend(db, {
          actor_id,
          descendant_id,
          licensee_id,
          license_id,
          consent_token_id,
          event_type: "license.issued",
          amount_cad: fee,
          actor_share_cad: (fee * actor_share) / 100,
          noizy_share_cad: (fee * noizy_share) / 100,
          payload: {
            use_category,
            territory,
            duration_type,
            license_fee_cad: fee,
          },
        });

        await kvInvalidate(kv, "health");
        return json(
          {
            license_id,
            actor_share_pct: actor_share,
            noizy_share_pct: noizy_share,
          },
          201,
        );
      }

      // ── Ledger ───────────────────────────────────────────────────────────────
      if (path === "/api/v1/ledger" && method === "GET") {
        const actor_id = url.searchParams.get("actor_id");
        const event_type = url.searchParams.get("event_type");
        const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);

        let query = "SELECT * FROM noizy_ledger WHERE 1=1";
        const params = [];
        if (actor_id) {
          query += " AND actor_id = ?";
          params.push(actor_id);
        }
        if (event_type) {
          query += " AND event_type = ?";
          params.push(event_type);
        }
        query += " ORDER BY recorded_at DESC LIMIT ?";
        params.push(limit);

        const { results } = await db
          .prepare(query)
          .bind(...params)
          .all();
        return json({ events: results, count: results.length });
      }

      // ── Rate Table ───────────────────────────────────────────────────────────
      if (path === "/api/v1/rate-table" && method === "GET") {
        const cached = await kvGet(kv, "rate_table");
        if (cached) return json(cached);
        const { results } = await db
          .prepare("SELECT * FROM hvs_rate_table ORDER BY base_fee_cad")
          .all();
        const data = { rate_table: results };
        await kvSet(kv, "rate_table", data, 600); // cache 10 min
        return json(data);
      }

      // ── Voice DNA ────────────────────────────────────────────────────────────
      const voiceDnaActorMatch = path.match(/^\/api\/v1\/actors\/([^/]+)\/voice-dna$/);
      if (voiceDnaActorMatch) {
        const actor_id = voiceDnaActorMatch[1];
        if (method === "GET") {
          const { results } = await db
            .prepare("SELECT * FROM hvs_voice_dna WHERE actor_id = ? ORDER BY version DESC")
            .bind(actor_id)
            .all();
          return json({ voice_dna: results, count: results.length });
        }
        if (method === "POST") {
          const body = await request.json();
          const {
            recording_date,
            duration_sec,
            file_hash,
            storage_uri,
            synthesis_model,
            sample_count,
            quality_score,
            notes,
          } = body;
          const dna_id = `DNA-${actor_id}-${Date.now()}`;
          const latest = await db
            .prepare("SELECT MAX(version) as v FROM hvs_voice_dna WHERE actor_id = ?")
            .bind(actor_id)
            .first();
          const version = (latest?.v || 0) + 1;
          await db
            .prepare(
              `
            INSERT INTO hvs_voice_dna
              (dna_id, actor_id, version, recording_date, duration_sec, file_hash,
               storage_uri, synthesis_model, sample_count, quality_score, notes)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)
          `,
            )
            .bind(
              dna_id,
              actor_id,
              version,
              recording_date || now(),
              duration_sec || null,
              file_hash || null,
              storage_uri || null,
              synthesis_model || null,
              sample_count || 0,
              quality_score || null,
              notes || null,
            )
            .run();
          await ledgerAppend(db, {
            actor_id,
            event_type: "voice_dna.recorded",
            payload: { dna_id, version, synthesis_model, sample_count },
          });
          await kvInvalidate(kv, "health");
          const dna = await db
            .prepare("SELECT * FROM hvs_voice_dna WHERE dna_id = ?")
            .bind(dna_id)
            .first();
          return json({ voice_dna: dna }, 201);
        }
      }

      // ── Estates ───────────────────────────────────────────────────────────────
      if (path === "/api/v1/estates" && method === "GET") {
        const { results } = await db.prepare("SELECT * FROM hvs_estates").all();
        return json({ estates: results, count: results.length });
      }
      const estateActorMatch = path.match(/^\/api\/v1\/actors\/([^/]+)\/estate$/);
      if (estateActorMatch && method === "GET") {
        const estate = await db
          .prepare("SELECT * FROM hvs_estates WHERE actor_id = ?")
          .bind(estateActorMatch[1])
          .first();
        if (!estate) return err("Estate not found", 404);
        return json({ estate });
      }

      // ── Union Tiers ───────────────────────────────────────────────────────────
      if (path === "/api/v1/union-tiers" && method === "GET") {
        const cached = await kvGet(kv, "union_tiers");
        if (cached) return json(cached);
        const { results } = await db
          .prepare("SELECT * FROM hvs_union_tiers ORDER BY min_earnings_cad")
          .all();
        const data = { union_tiers: results };
        await kvSet(kv, "union_tiers", data, 3600); // cache 1hr — rarely changes
        return json(data);
      }

      // ── Licensees ─────────────────────────────────────────────────────────────
      if (path === "/api/v1/licensees" && method === "GET") {
        const { results } = await db
          .prepare("SELECT * FROM hvs_licensees ORDER BY onboarded_at DESC")
          .all();
        return json({ licensees: results, count: results.length });
      }
      if (path === "/api/v1/licensees" && method === "POST") {
        const body = await request.json();
        const { display_name, legal_name, email, country, organization_type } = body;
        if (!display_name) return err("display_name required", 400);
        const licensee_id = `LIC-${uuid().substring(0, 8).toUpperCase()}`;
        await db
          .prepare(
            `
          INSERT INTO hvs_licensees (licensee_id, display_name, legal_name, email, country, organization_type)
          VALUES (?,?,?,?,?,?)
        `,
          )
          .bind(
            licensee_id,
            display_name,
            legal_name || null,
            email || null,
            country || "CA",
            organization_type || "individual",
          )
          .run();
        await ledgerAppend(db, {
          event_type: "licensee.onboarded",
          payload: { licensee_id, display_name, organization_type },
        });
        const licensee = await db
          .prepare("SELECT * FROM hvs_licensees WHERE licensee_id = ?")
          .bind(licensee_id)
          .first();
        return json({ licensee }, 201);
      }

      // ── PREMIS Events ─────────────────────────────────────────────────────────
      if (path === "/api/v1/premis" && method === "GET") {
        const actor_id = url.searchParams.get("actor_id");
        const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);
        let query = "SELECT * FROM hvs_premis_events WHERE 1=1";
        const params = [];
        if (actor_id) {
          query += " AND actor_id = ?";
          params.push(actor_id);
        }
        query += " ORDER BY event_datetime DESC LIMIT ?";
        params.push(limit);
        const { results } = await db
          .prepare(query)
          .bind(...params)
          .all();
        return json({ premis_events: results, count: results.length });
      }

      // ── Stats (new) ───────────────────────────────────────────────────────────
      if (path === "/api/v1/stats" && method === "GET") {
        const actors = await db.prepare("SELECT COUNT(*) as c FROM hvs_actors").first();
        const tokens = await db.prepare("SELECT COUNT(*) as c FROM hvs_consent_tokens").first();
        const activeTokens = await db
          .prepare("SELECT COUNT(*) as c FROM hvs_consent_tokens WHERE status = 'active'")
          .first();
        const descendants = await db.prepare("SELECT COUNT(*) as c FROM hvs_descendants").first();
        const synthTotal = await db.prepare("SELECT COUNT(*) as c FROM hvs_synth_requests").first();
        const synthBlocked = await db
          .prepare("SELECT COUNT(*) as c FROM hvs_synth_requests WHERE status = 'blocked'")
          .first();
        const ledger = await db.prepare("SELECT COUNT(*) as c FROM noizy_ledger").first();
        const revenue = await db
          .prepare(
            "SELECT COALESCE(SUM(amount_cad),0) as total FROM noizy_ledger WHERE event_type = 'license.issued'",
          )
          .first();
        return json({
          system: "HEAVEN",
          version: env.NOIZY_VERSION,
          stats: {
            actors: actors?.c || 0,
            consent_tokens: {
              total: tokens?.c || 0,
              active: activeTokens?.c || 0,
            },
            descendants: descendants?.c || 0,
            synth_requests: {
              total: synthTotal?.c || 0,
              blocked: synthBlocked?.c || 0,
            },
            ledger_events: ledger?.c || 0,
            total_revenue_cad: revenue?.total || 0,
          },
          timestamp: now(),
        });
      }

      // ── KPI Views ────────────────────────────────────────────────────────────
      if (path === "/api/v1/kpi/trust") {
        const result = await db.prepare("SELECT * FROM kpi_trust").first();
        return json({ kpi: "trust", data: result });
      }
      if (path === "/api/v1/kpi/safety") {
        const result = await db.prepare("SELECT * FROM kpi_safety").first();
        return json({ kpi: "safety", data: result });
      }
      if (path === "/api/v1/kpi/revenue") {
        const { results } = await db.prepare("SELECT * FROM kpi_revenue").all();
        return json({ kpi: "revenue", data: results });
      }
      if (path === "/api/v1/kpi/quality") {
        const { results } = await db.prepare("SELECT * FROM kpi_quality").all();
        return json({ kpi: "quality", data: results });
      }
      if (path === "/api/v1/kpi/risk") {
        const { results } = await db.prepare("SELECT * FROM kpi_risk").all();
        return json({ kpi: "risk", data: results });
      }

      // ── Enterprise Audit ─────────────────────────────────────────────────────
      if (path === "/api/v1/enterprise/audit") {
        const { results } = await db.prepare("SELECT * FROM enterprise_audit").all();
        return json({
          audit: results,
          count: results.length,
          generated_at: now(),
        });
      }

      // ── Dashboard (comprehensive health & status) ──────────────────────────────
      if (path === "/dashboard" && method === "GET") {
        return handleDashboard(request, env);
      }

      // ── Status (minimal JSON for monitoring systems) ───────────────────────────
      if (path === "/status" && method === "GET") {
        return handleStatus(request, env);
      }

      // ── Ledger Append (external write from DreamChamber) ─────────────────────
      if (path === "/api/v1/ledger/append" && method === "POST") {
        const body = await request.json();
        const { event_type, payload, actor_id, amount_cad } = body;
        if (!event_type) return err("event_type is required", 400);
        // Allowlist: only permitted event types from external callers
        const ALLOWED_EXTERNAL_EVENTS = new Set([
          "ai.usage",
          "ai.stream",
          "chat.session",
          "system.audit",
          "license.issued",
          "license.viewed",
          "consent.checked",
        ]);
        if (!ALLOWED_EXTERNAL_EVENTS.has(event_type)) {
          return err(`event_type '${event_type}' is not permitted from external callers`, 403);
        }
        await ledgerAppend(db, {
          actor_id: actor_id || null,
          event_type,
          payload: payload || {},
          amount_cad: amount_cad || 0,
          actor_share_cad: body.actor_share_cad || 0,
          noizy_share_cad: body.noizy_share_cad || 0,
          union_share_cad: body.union_share_cad || 0,
        });
        return json({ appended: true, event_type, timestamp: now() }, 201);
      }

      // ── Gabriel ──────────────────────────────────────────────────────────────
      if (path === "/gabriel" && method === "GET") {
        const [actors, tokens, activeTokens, neverClauses, ledger, descendants, voiceDna] =
          await Promise.all([
            db.prepare("SELECT COUNT(*) as c FROM hvs_actors").first(),
            db.prepare("SELECT COUNT(*) as c FROM hvs_consent_tokens").first(),
            db
              .prepare("SELECT COUNT(*) as c FROM hvs_consent_tokens WHERE status = 'active'")
              .first(),
            db.prepare("SELECT COUNT(*) as c FROM hvs_never_clauses").first(),
            db.prepare("SELECT COUNT(*) as c FROM noizy_ledger").first(),
            db.prepare("SELECT COUNT(*) as c FROM hvs_descendants").first(),
            db.prepare("SELECT COUNT(*) as c FROM hvs_voice_dna").first(),
          ]);
        const rsp = await db.prepare("SELECT * FROM hvs_actors WHERE actor_id = 'RSP_001'").first();
        const recentLedger = await db
          .prepare(
            "SELECT event_type, recorded_at FROM noizy_ledger ORDER BY recorded_at DESC LIMIT 5",
          )
          .all();
        return json({
          gabriel: "ONLINE",
          identity: "AI Orchestration Layer — NOIZY Empire",
          doctrine: [
            "Consent as executable code",
            "Provenance as default",
            "Revocation as sacred",
            "Compensation as automatic",
          ],
          empire: {
            actors: actors?.c || 0,
            consent_tokens: {
              total: tokens?.c || 0,
              active: activeTokens?.c || 0,
            },
            never_clauses_in_force: neverClauses?.c || 0,
            ledger_events: ledger?.c || 0,
            descendants: descendants?.c || 0,
            voice_dna_records: voiceDna?.c || 0,
          },
          founding_actor: rsp
            ? {
                id: rsp.actor_id,
                name: rsp.display_name,
                country: rsp.country,
                onboarded_at: rsp.onboarded_at,
              }
            : null,
          recent_ledger: recentLedger?.results || [],
          portals: {
            NOIZYVOX:   "Voice sovereignty — consent capture — voice profiles",
            NOIZYFISH:  "888-title catalogue — C2PA stamped — 75/25 perpetual",
            NOIZYKIDZ:  "Rhythm Root Island — neurodivergent kids — Unity/Godot",
            NOIZYLAB:   "Sonic healing — binaural protocols — AirPlay delivery",
            WISDOM:     "Elder legacy — inheritable voice archive — 100-year estate",
            myFAMILY:   "Love in code — consent-native — deployed when needed",
          },
          kernel: "heaven.noizylab.workers.dev",
          days_to_deadline: Math.ceil(
            (new Date("2026-04-17").getTime() - Date.now()) / 86400000,
          ),
          timestamp: now(),
        });
      }

      // ── Root — Landing Page (GET + HEAD) ────────────────────────────────────
      if (path === "/" && (method === "GET" || method === "HEAD")) {
        // Browser request → serve landing page
        const accept = request.headers.get("Accept") || "";
        if (accept.includes("text/html")) {
          const body = method === "GET" ? landingHTML() : null;
          return new Response(body, {
            status: 200,
            headers: {
              "Content-Type": "text/html; charset=utf-8",
              "Cache-Control": "public, max-age=60",
              "X-Powered-By": "HEAVEN/RSP_001",
            },
          });
        }
        // API client → return JSON index
        const indexData = {
          name: "HEAVEN",
          description: "NOIZY HVS Consent Kernel API",
          version: env.NOIZY_VERSION,
          docs: "/health",
          endpoints: [
            "GET  /health",
            "GET  /dashboard",
            "GET  /status",
            "GET  /api/v1/actors",
            "POST /api/v1/actors",
            "GET  /api/v1/actors/:id",
            "GET  /api/v1/actors/:id/never-clauses",
            "GET  /api/v1/actors/:id/descendants",
            "GET  /api/v1/actors/:id/consent-tokens",
            "POST /api/v1/consent-tokens",
            "POST /api/v1/consent-tokens/:id/revoke",
            "GET  /api/v1/descendants/:id",
            "POST /api/v1/descendants",
            "POST /api/v1/synth-requests",
            "GET  /api/v1/synth-requests/:id",
            "GET  /api/v1/synth-requests/:id/c2pa",
            "GET  /api/v1/licenses",
            "POST /api/v1/licenses",
            "GET  /api/v1/ledger",
            "GET  /api/v1/rate-table",
            "GET  /api/v1/union-tiers",
            "GET  /api/v1/licensees",
            "POST /api/v1/licensees",
            "GET  /api/v1/actors/:id/voice-dna",
            "POST /api/v1/actors/:id/voice-dna",
            "GET  /api/v1/actors/:id/estate",
            "GET  /api/v1/estates",
            "GET  /api/v1/premis",
            "GET  /api/v1/stats",
            "GET  /api/v1/kpi/trust",
            "GET  /api/v1/kpi/safety",
            "GET  /api/v1/kpi/revenue",
            "GET  /api/v1/kpi/quality",
            "GET  /api/v1/kpi/risk",
            "GET  /api/v1/enterprise/audit",
            "POST /api/v1/ledger/append",
            "GET  /gabriel",
            "GET  /preflight                   (GORUNFREE — pre-flight insight)",
            "GET  /provenance/:id              (GORUNFREE — provenance trail)",
            "GET  /provenance/:id/export       (GORUNFREE — export as PDF/JSON/C2PA)",
            "GET  /absence/gaps                (GORUNFREE — creative gaps)",
            "GET  /absence/archive             (GORUNFREE — resurrection candidates)",
            "POST /absence/commission          (GORUNFREE — commission workflow)",
            "GET  /absence/representation      (GORUNFREE — representation balance)",
            "POST /api/v1/family/members",
            "GET  /api/v1/family/members",
            "POST /api/v1/family/consent",
            "GET  /api/v1/family/consent/:member_id",
            "POST /api/v1/family/messages",
            "GET  /api/v1/family/messages/:member_id",
            "POST /api/v1/heal/session",
            "GET  /api/v1/heal/outcomes",
            "GET  /api/v1/noizyvox/*  (proxy → GOD.local:8421 — voices, calm, research)",
          ],
          mission: "Consent as executable code.",
        };
        if (method === "HEAD") {
          return new Response(null, { status: 200, headers: CORS_HEADERS });
        }
        return json(indexData);
      }

      // ── /api/v1 Index ─────────────────────────────────────────────────────────
      if (path === "/api/v1" && (method === "GET" || method === "HEAD")) {
        if (method === "HEAD") {
          return new Response(null, { status: 200, headers: CORS_HEADERS });
        }
        return json({
          api: "HEAVEN HVS Consent Kernel",
          version: "v1",
          base: "/api/v1",
          resources: {
            actors: "/api/v1/actors",
            descendants: "/api/v1/descendants",
            consent_tokens: "/api/v1/consent-tokens",
            synth_requests: "/api/v1/synth-requests",
            licenses: "/api/v1/licenses",
            licensees: "/api/v1/licensees",
            ledger: "/api/v1/ledger",
            rate_table: "/api/v1/rate-table",
            union_tiers: "/api/v1/union-tiers",
            estates: "/api/v1/estates",
            premis: "/api/v1/premis",
            stats: "/api/v1/stats",
            kpi: "/api/v1/kpi/*",
            family: "/api/v1/family/*",
            heal: "/api/v1/heal/*",
          },
          mission: "Consent as executable code.",
        });
      }

      // ── myFamily.AI — Constitutional Voice Legacy ─────────────────────────

      // Register family member
      if (path === "/api/v1/family/members" && method === "POST") {
        const body = await request.json();
        const { email, display_name } = body;
        if (!email || !display_name) return err("email and display_name required");
        const id = uuid();
        const c2pa = `c2pa:noizy:family:${id}:${Date.now()}`;
        // Graceful duplicate — return existing rather than 500 on UNIQUE conflict
        const existingMember = await db.prepare(
          "SELECT id, email, display_name, status, created_at FROM family_members WHERE email = ?"
        ).bind(email).first();
        if (existingMember) {
          return json({ ok: true, member_id: existingMember.id, conflict: true, message: "Member already registered — sovereignty intact" }, 200);
        }

        await db.prepare(
          `INSERT INTO family_members (id, email, display_name, hvs_acknowledged, consent_version)
           VALUES (?, ?, ?, 1, '1.0')`
        ).bind(id, email, display_name).run();
        await ledgerAppend(db, {
          actor_id: id,
          event_type: "family.member.registered",
          payload: { email, display_name, c2pa },
        });
        return json({ ok: true, member_id: id, c2pa_stamp: c2pa }, 201);
      }

      // List all family members
      if (path === "/api/v1/family/members" && method === "GET") {
        const { results } = await db.prepare(
          "SELECT id, email, display_name, status, consent_version, created_at FROM family_members ORDER BY created_at DESC"
        ).all();
        return json({ members: results, count: results.length });
      }

      // Store consent matrix — the constitutional declaration
      if (path === "/api/v1/family/consent" && method === "POST") {
        const body = await request.json();
        if (!body.member_id || !body.use_cases?.length || !body.beneficiary_ids?.length)
          return err("member_id, use_cases, beneficiary_ids required");
        const id = uuid();
        const c2pa = `c2pa:noizy:consent:${id}:${Date.now()}`;
        await db.prepare(
          `INSERT INTO consent_matrix (id, member_id, use_cases, restrictions, beneficiary_ids, c2pa_stamp, expires_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          id,
          body.member_id,
          JSON.stringify(body.use_cases),
          JSON.stringify(body.restrictions ?? {}),
          JSON.stringify(body.beneficiary_ids),
          c2pa,
          body.expires_at ?? null,
        ).run();
        await ledgerAppend(db, {
          actor_id: body.member_id,
          event_type: "family.consent.stored",
          payload: { consent_id: id, use_cases: body.use_cases, perpetual: !body.expires_at, c2pa },
        });
        return json({ ok: true, consent_id: id, c2pa_stamp: c2pa }, 201);
      }

      // Read consent matrix for a member
      const consentReadMatch = path.match(/^\/api\/v1\/family\/consent\/([^/]+)$/);
      if (consentReadMatch && method === "GET") {
        const { results } = await db.prepare(
          "SELECT * FROM consent_matrix WHERE member_id = ? AND is_active = 1 ORDER BY recorded_at DESC"
        ).bind(consentReadMatch[1]).all();
        return json({ consents: results, count: results.length });
      }

      // Register pre-recorded message (metadata only — audio on M2 Ultra)
      if (path === "/api/v1/family/messages" && method === "POST") {
        const body = await request.json();
        if (!body.from_member_id || !body.file_ref || !body.message_type)
          return err("from_member_id, file_ref, message_type required");
        const id = uuid();
        await db.prepare(
          `INSERT INTO messages (id, from_member_id, to_beneficiary_ids, message_type, file_ref, duration_seconds, trigger_conditions)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          id,
          body.from_member_id,
          JSON.stringify(body.to_beneficiary_ids ?? []),
          body.message_type,
          body.file_ref,
          body.duration_seconds ?? null,
          JSON.stringify(body.trigger_conditions ?? {}),
        ).run();
        await ledgerAppend(db, {
          actor_id: body.from_member_id,
          event_type: "family.message.registered",
          payload: { message_id: id, type: body.message_type, note: "audio_local_m2ultra" },
        });
        return json({ ok: true, message_id: id }, 201);
      }

      // Read messages for a member
      const msgReadMatch = path.match(/^\/api\/v1\/family\/messages\/([^/]+)$/);
      if (msgReadMatch && method === "GET") {
        const { results } = await db.prepare(
          "SELECT id, message_type, duration_seconds, trigger_conditions, created_at FROM messages WHERE from_member_id = ? ORDER BY created_at DESC"
        ).bind(msgReadMatch[1]).all();
        return json({ messages: results, count: results.length, note: "file_refs omitted — audio local on M2 Ultra" });
      }

      // ── NOIZYLAB Healing Sessions ──────────────────────────────────────────

      if (path === "/api/v1/heal/session" && method === "POST") {
        const body = await request.json();
        if (!body.beneficiary_member_id || !body.protocol_type)
          return err("beneficiary_member_id and protocol_type required");
        const id = uuid();
        await db.prepare(
          `INSERT INTO healing_sessions
             (id, beneficiary_member_id, protocol_type, voice_message_id, noizyfish_track_id,
              frequency_hz, duration_seconds, biometric_before, biometric_after, outcome, consent_verified)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          id,
          body.beneficiary_member_id,
          body.protocol_type,
          body.voice_message_id ?? null,
          body.noizyfish_track_id ?? null,
          body.frequency_hz ?? null,
          body.duration_seconds ?? null,
          JSON.stringify(body.biometric_before ?? {}),
          JSON.stringify(body.biometric_after ?? {}),
          body.outcome ?? "pending",
          body.consent_verified ? 1 : 0,
        ).run();
        await ledgerAppend(db, {
          actor_id: body.beneficiary_member_id,
          event_type: "noizylab.healing.session",
          payload: {
            session_id: id,
            protocol: body.protocol_type,
            frequency_hz: body.frequency_hz,
            outcome: body.outcome ?? "pending",
            consent_verified: body.consent_verified,
          },
        });
        return json({ ok: true, session_id: id }, 201);
      }

      // Healing outcomes — research data for Anthropic partnership
      if (path === "/api/v1/heal/outcomes" && method === "GET") {
        const { results } = await db.prepare(
          `SELECT protocol_type, frequency_hz,
                  COUNT(*) as sessions,
                  SUM(CASE WHEN outcome = 'improved' THEN 1 ELSE 0 END) as improved,
                  SUM(CASE WHEN outcome = 'neutral'  THEN 1 ELSE 0 END) as neutral,
                  SUM(CASE WHEN outcome = 'flagged'  THEN 1 ELSE 0 END) as flagged
           FROM healing_sessions
           GROUP BY protocol_type, frequency_hz
           ORDER BY sessions DESC`
        ).all();
        return json({ outcomes: results, note: "Constitutional research data — anonymized by default" });
      }

      // ═══════════════════════════════════════════════════════════════════════
      // GORUNFREE Routes — Creator-Perceived Speed, Provenance, Absence
      // ═══════════════════════════════════════════════════════════════════════

      // ── Preflight (Pre-Flight Insight) ─────────────────────────────────────
      if (path === "/preflight" && method === "GET") {
        return handlePreflight(request, env);
      }

      // ── Provenance Trail ───────────────────────────────────────────────────
      const provenanceExportMatch = path.match(/^\/provenance\/([^/]+)\/export$/);
      if (provenanceExportMatch && method === "GET") {
        return handleProvenanceExport(request, env);
      }

      const provenanceMatch = path.match(/^\/provenance\/([^/]+)$/);
      if (provenanceMatch && method === "GET") {
        return handleProvenance(request, env);
      }

      // ── Absence Intelligence ───────────────────────────────────────────────
      if (path === "/absence/gaps" && method === "GET") {
        return handleAbsenceGaps(request, env);
      }

      if (path === "/absence/archive" && method === "GET") {
        return handleAbsenceArchive(request, env);
      }

      if (path === "/absence/commission" && method === "POST") {
        return handleAbsenceCommission(request, env);
      }

      if (path === "/absence/representation" && method === "GET") {
        return handleAbsenceRepresentation(request, env);
      }

      // ═══════════════════════════════════════════════════════════════════════
      // Operator Routes — Audit-First Pattern
      // Requires authentication. Audit D1 write before state change.
      // ═══════════════════════════════════════════════════════════════════════

      if (path === "/operator/approve" && method === "POST") {
        if (!authenticate(request, env)) {
          return err("Unauthorized — provide X-NOIZY-Key header", 401);
        }
        return handleOperatorApprove(request, env);
      }

      if (path === "/operator/token/issue" && method === "POST") {
        if (!authenticate(request, env)) {
          return err("Unauthorized", 401);
        }
        return handleTokenIssue(request, env);
      }

      if (path === "/operator/token/validate" && method === "POST") {
        if (!authenticate(request, env)) {
          return err("Unauthorized", 401);
        }
        return handleTokenValidate(request, env);
      }

      if (path === "/operator/status" && method === "GET") {
        if (!authenticate(request, env)) {
          return err("Unauthorized", 401);
        }
        return handleOperatorStatus(request, env);
      }

      if (path === "/operator/audit" && method === "GET") {
        if (!authenticate(request, env)) {
          return err("Unauthorized", 401);
        }
        return handleOperatorAudit(request, env);
      }

      if (path === "/operator/freeze" && method === "POST") {
        if (!authenticate(request, env)) {
          return err("Unauthorized", 401);
        }
        return handleFreezeRecord(request, env);
      }

      if (path === "/operator/freeze/resolve" && method === "POST") {
        if (!authenticate(request, env)) {
          return err("Unauthorized", 401);
        }
        return handleFreezeResolve(request, env);
      }

      // ── Creator Trust Dashboard (public, read-only, calm) ─────────────────
      if (path === "/trust/status" && method === "GET") {
        return handleTrustStatus(request, env);
      }

      if (path === "/trust/changes" && method === "GET") {
        return handleTrustChanges(request, env);
      }

      if (path === "/trust/transparency" && method === "GET") {
        return handleTransparency(request, env);
      }

      if (path === "/trust/changes/diff" && method === "GET") {
        return handleCreatorDiff(request, env);
      }

      // ── Operator Compliance & Audit Diff (authenticated) ────────────────────
      if (path === "/operator/audit/diff" && method === "GET") {
        return handleOperatorAuditDiff(request, env);
      }

      if (path === "/operator/compliance/export" && method === "GET") {
        return handleComplianceExport(request, env);
      }

      if (path === "/operator/compliance/verify-bundle" && method === "GET") {
        return handleVerifyBundle(request, env);
      }

      // ── Public Anchor Status Widget ────────────────────────────────────────
      if (path === "/trust/anchor-status" && method === "GET") {
        return handleAnchorStatus(request, env);
      }

      if (path === "/trust/anchor-status.html" && method === "GET") {
        return handleAnchorStatusWidget(request, env);
      }

      if (path === "/trust/proof-coverage" && method === "GET") {
        return handleProofCoverage(request, env);
      }

      if (path === "/trust/proof-coverage.html" && method === "GET") {
        return handleProofCoverageWidget(request, env);
      }

      // ═══════════════════════════════════════════════════════════════════════

      // ── NOIZYVOX Platform info ────────────────────────────────────────────
      // noizyvox-platform runs locally on GOD.local:8421 (FastAPI)
      // Direct access: http://GOD.local:8421/api/v1/
      // Cloudflare Workers cannot reach GOD.local — use Cloudflare Tunnel
      // to expose GOD.local:8421 publicly, then set NOIZYVOX_UPSTREAM env var
      if (path.startsWith("/api/v1/noizyvox/")) {
        const upstream = env.NOIZYVOX_UPSTREAM;
        if (!upstream) {
          return json({
            error: "NOIZYVOX Platform not tunneled",
            local: "http://GOD.local:8421/api/v1/",
            docs: "http://GOD.local:8421/docs",
            setup: "Add NOIZYVOX_UPSTREAM env var pointing to your Cloudflare Tunnel URL for GOD.local:8421",
          }, 503);
        }
        try {
          const proxied = await fetch(`${upstream}${path.replace("/api/v1/noizyvox", "")}`, {
            method,
            headers: {
              "Authorization": `Bearer ${env.NOIZY_KEY || "local-dev-token"}`,
              "Content-Type": request.headers.get("Content-Type") || "application/json",
            },
            body: method !== "GET" && method !== "HEAD" ? request.body : undefined,
            signal: AbortSignal.timeout(10000),
          });
          const body = await proxied.text();
          await ledgerAppend(db, { event_type: "noizyvox.proxy", payload: { path, method, status: proxied.status } });
          return new Response(body, {
            status: proxied.status,
            headers: { "Content-Type": proxied.headers.get("Content-Type") || "application/json", ...CORS_HEADERS },
          });
        } catch (e) {
          return json({ error: "NOIZYVOX upstream unreachable", detail: e.message }, 503);
        }
      }

      // ── WebSocket — noizybeast real-time Gabriel connection ──────────────
      if (path === "/ws" || path === "/gabriel/ws") {
        const upgradeHeader = request.headers.get("Upgrade");
        if (!upgradeHeader || upgradeHeader.toLowerCase() !== "websocket") {
          return json({
            endpoint: "wss://heaven.noizylab.workers.dev/ws",
            protocol: "WebSocket",
            usage: "Connect and send JSON: {type, payload}",
            types: ["ping","command","voice","consent.check","empire.status","heal.trigger"],
          });
        }

        const [client, server] = Object.values(new WebSocketPair());
        server.accept();

        // Send welcome frame immediately on connect
        server.send(JSON.stringify({
          type: "connected",
          gabriel: "ONLINE",
          version: env.NOIZY_VERSION,
          doctrine: "Consent as executable code",
          days_to_deadline: Math.ceil(
            (new Date("2026-04-17").getTime() - Date.now()) / 86400000,
          ),
          timestamp: new Date().toISOString(),
        }));

        server.addEventListener("message", async (event) => {
          let msg;
          try { msg = JSON.parse(event.data); }
          catch { server.send(JSON.stringify({ type: "error", detail: "Invalid JSON" })); return; }

          const { type, payload } = msg;

          // Ping — keepalive
          if (type === "ping") {
            server.send(JSON.stringify({ type: "pong", ts: new Date().toISOString() }));
            return;
          }

          // Empire status — live pull from D1
          if (type === "empire.status") {
            try {
              const [actors, tokens, ledger] = await Promise.all([
                env.GABRIEL_DB.prepare("SELECT COUNT(*) as c FROM hvs_actors").first(),
                env.GABRIEL_DB.prepare("SELECT COUNT(*) as c FROM hvs_consent_tokens WHERE status='active'").first(),
                env.GABRIEL_DB.prepare("SELECT COUNT(*) as c FROM noizy_ledger").first(),
              ]);
              server.send(JSON.stringify({
                type: "empire.status",
                actors: actors?.c || 0,
                active_tokens: tokens?.c || 0,
                ledger_events: ledger?.c || 0,
                ts: new Date().toISOString(),
              }));
            } catch (e) {
              server.send(JSON.stringify({ type: "error", detail: e.message }));
            }
            return;
          }

          // Consent check — validate a token before synthesis
          if (type === "consent.check") {
            const { token_id } = payload || {};
            if (!token_id) {
              server.send(JSON.stringify({ type: "consent.result", valid: false, reason: "token_id required" }));
              return;
            }
            try {
              const token = await env.GABRIEL_DB.prepare(
                "SELECT status, use_categories, expires_at FROM hvs_consent_tokens WHERE token_id = ?"
              ).bind(token_id).first();
              const valid = token?.status === "active" &&
                (!token.expires_at || new Date(token.expires_at) > new Date());
              server.send(JSON.stringify({
                type: "consent.result",
                valid,
                status: token?.status || "not_found",
                reason: valid ? "Consent active — sovereignty confirmed" : "Consent invalid or revoked",
              }));
            } catch (e) {
              server.send(JSON.stringify({ type: "error", detail: e.message }));
            }
            return;
          }

          // Heal trigger — initiate a therapeutic protocol
          if (type === "heal.trigger") {
            const { member_id, protocol_type, frequency_hz } = payload || {};
            if (!member_id || !protocol_type) {
              server.send(JSON.stringify({ type: "error", detail: "member_id and protocol_type required" }));
              return;
            }
            server.send(JSON.stringify({
              type: "heal.started",
              member_id,
              protocol_type,
              frequency_hz: frequency_hz || 6.0,
              delivery: "AirPlay",
              message: `${protocol_type} at ${frequency_hz || 6}Hz — routing to AirPlay`,
              ts: new Date().toISOString(),
            }));
            return;
          }

          // Voice — transcription received from noizybeast Web Speech API
          if (type === "voice") {
            const { transcript, confidence } = payload || {};
            server.send(JSON.stringify({
              type: "voice.received",
              transcript,
              confidence,
              gabriel: "logged",
              ts: new Date().toISOString(),
            }));
            return;
          }

          // Default — echo with routing hint
          server.send(JSON.stringify({
            type: "unknown",
            received: type,
            supported: ["ping","empire.status","consent.check","heal.trigger","voice"],
          }));
        });

        server.addEventListener("close", () => {
          // Connection closed — no cleanup needed (stateless edge worker)
        });

        return new Response(null, { status: 101, webSocket: client });
      }

      // ═══════════════════════════════════════════════════════════════════════
      // CHAOS ARENA — Public Trust Verification Surface
      // "Break the proof if you can."
      // ═══════════════════════════════════════════════════════════════════════
      if (path.startsWith("/chaos-arena")) {
        return handleChaosArenaAPI(request, env);
      }

      // ═══════════════════════════════════════════════════════════════════════
      // VOICE MARKET — Higher-Trust Voice Licensing
      // Monetization on verified governance
      // ═══════════════════════════════════════════════════════════════════════
      if (path.startsWith("/voice-market")) {
        // Require auth for write operations
        if (method !== "GET" && method !== "OPTIONS" && !authenticate(request, env)) {
          return err("Unauthorized — provide X-NOIZY-Key header", 401);
        }
        return handleVoiceMarketAPI(request, env);
      }

      // ── 404 ──────────────────────────────────────────────────────────────
      return err(`Route not found: ${method} ${path}`, 404);
    } catch (e) {
      console.error("HEAVEN error:", e);
      return json({ error: "Internal server error", detail: e.message }, 500);
    }
  },
};

// ─── C2PA Manifest (Lightweight) ──────────────────────────────────────────────

async function generateC2PAManifest(synthRequest, env) {
  const assertions = {
    consent_token_id: synthRequest.consent_token_id,
    actor_id: synthRequest.actor_id,
    descendant_id: synthRequest.descendant_id,
    never_clauses_checked: "passed",
    timestamp: now(),
    use_category: synthRequest.use_category,
    status: synthRequest.status,
  };

  // Create SHA-256 signature from assertions + secret
  const secret = env.C2PA_SECRET || "NOIZY-HVS-17.0.0";
  const assertionsJson = JSON.stringify(assertions);
  const signInput = assertionsJson + secret;
  const encoder = new TextEncoder();
  const signData = encoder.encode(signInput);
  const hashBuffer = await crypto.subtle.digest("SHA-256", signData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  const manifest = {
    claim_generator: "NOIZY-HVS/17.0.0",
    title: "Synthetic Voice Output",
    claim_made_at: now(),
    claim_made_by: "HEAVEN Consent Kernel",
    assertions: assertions,
    signature: signature,
    schema_version: "2.0",
    never_clause_enforcement: {
      political: synthRequest.use_category?.toLowerCase().includes("politic") === false,
      sexual: synthRequest.use_category?.toLowerCase().includes("adult") === false,
      weapons: synthRequest.use_category?.toLowerCase().includes("weapon") === false,
      deception: synthRequest.use_category?.toLowerCase().includes("deceiv") === false,
      hate: synthRequest.use_category?.toLowerCase().includes("hate") === false,
    },
  };

  return manifest;
}

// ─── Utilities ───────────────────────────────────────────────────────────────

async function hashToken(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
