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
 * @param {Object} env - Cloudflare Worker env bindings
 * @throws {Error} If audit_events table is missing
 */
export async function assertAuditReady(env) {
  // Check if D1 binding exists
  if (!env.GABRIEL_DB) {
    throw new Error(
      "EDGE CORE: GABRIEL_DB binding missing — runtime halted"
    );
  }

  try {
    const check = await env.GABRIEL_DB.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='audit_events'"
    ).first();

    if (!check) {
      throw new Error(
        "EDGE CORE: audit_events table missing — runtime halted. " +
        "Run: npx wrangler d1 execute gabriel_db --remote --file migrations/002_audit_events.sql"
      );
    }
  } catch (err) {
    // Re-throw if it's our error
    if (err.message.includes("EDGE CORE")) {
      throw err;
    }
    // D1 query failed — also halt
    throw new Error(
      `EDGE CORE: audit_events check failed (${err.message}) — runtime halted`
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
