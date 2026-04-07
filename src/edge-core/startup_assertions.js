/**
 * EDGE CORE: Startup Assertions
 *
 * Runtime guards that enforce infrastructure invariants.
 * If any assertion fails, the Worker refuses to handle requests.
 *
 * Rule: Authority cannot exist without memory.
 *       If it can't be audited, it can't happen.
 */

/**
 * Assert audit infrastructure is ready
 * Called on every request before routing begins
 *
 * This protects against:
 * - Hotfix deploys that bypass CI
 * - Manual wrangler deploys
 * - Misconfigured environments
 *
 * HARDENING (locked 2026-04-07):
 * - Uses "SELECT 1" pattern — query success alone is not readiness
 * - Must return a row to prove table exists
 * - Fails closed if binding missing OR table missing OR query fails
 *
 * Core Law: If a trust-sensitive action cannot produce a committed
 *           audit row, it is not allowed to exist.
 *
 * @param {Object} env - Cloudflare Worker env bindings
 * @throws {Error} If audit_events table is missing or binding absent
 */
export async function assertAuditReady(env) {
  // Gate 1: Binding must exist
  if (!env.GABRIEL_DB) {
    throw new Error(
      "AUDIT_READINESS_GATE: GABRIEL_DB binding missing"
    );
  }

  try {
    // Gate 2: Assertive table existence check
    // SELECT 1 returns a row only if the table exists
    // A successful query with no row = table missing = fail
    const result = await env.GABRIEL_DB.prepare(
      "SELECT 1 FROM sqlite_master WHERE type='table' AND name='audit_events'"
    ).first();

    if (!result) {
      throw new Error(
        "AUDIT_READINESS_GATE: audit_events table missing. " +
        "Run: npx wrangler d1 execute gabriel_db --remote --file ops/migrations/001_audit_events.sql"
      );
    }
  } catch (err) {
    // Re-throw if it's our gate error
    if (err.message.includes("AUDIT_READINESS_GATE")) {
      throw err;
    }
    // D1 query failed — fail closed
    throw new Error(
      `AUDIT_READINESS_GATE: audit check failed (${err.message})`
    );
  }
}

/**
 * Cached audit readiness check
 * Avoids checking on every single request — caches result for 60 seconds
 *
 * @param {Object} env - Cloudflare Worker env bindings
 * @param {ExecutionContext} ctx - Cloudflare execution context
 */
let auditReadyCache = { ready: false, checkedAt: 0 };
const CACHE_TTL_MS = 60000; // 60 seconds

export async function assertAuditReadyCached(env, ctx) {
  const now = Date.now();

  // Cache hit
  if (auditReadyCache.ready && (now - auditReadyCache.checkedAt) < CACHE_TTL_MS) {
    return;
  }

  // Cache miss — do the check
  await assertAuditReady(env);

  // Update cache
  auditReadyCache = { ready: true, checkedAt: now };
}

export default {
  assertAuditReady,
  assertAuditReadyCached
};
