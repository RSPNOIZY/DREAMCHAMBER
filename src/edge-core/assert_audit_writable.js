/**
 * EDGE CORE: Audit Writable Assertion
 *
 * Ensures no irreversible operation can occur unless audit is writable RIGHT NOW.
 * This is stronger than checking table existence — it checks append viability.
 *
 * Use this before:
 * - Zone migrations
 * - Freeze lifts
 * - Forced promotions
 * - Token issuance
 * - Any operation that cannot be undone
 *
 * Rule: Authority cannot exist without memory.
 *       If it can't be audited, it can't happen.
 */

/**
 * Assert audit is writable by performing a preflight write
 *
 * @param {Object} env - Cloudflare Worker env bindings
 * @param {string} actor - Email of the operator performing the action
 * @param {string} action - Name of the action being attempted
 * @throws {Error} If audit write fails
 */
export async function assertAuditWritable(env, actor, action) {
  if (!env.GABRIEL_DB) {
    throw new Error(
      "EDGE CORE: GABRIEL_DB binding missing — irreversible action blocked"
    );
  }

  try {
    await env.GABRIEL_DB.prepare(`
      INSERT INTO audit_events
      (id, operator_email, action, explanation, precondition_passed)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(),
      actor,
      `preflight:${action}`,
      "audit preflight check — verifying audit is writable before irreversible action",
      1
    ).run();
  } catch (err) {
    throw new Error(
      `EDGE CORE: audit write failed (${err.message}) — irreversible action blocked. ` +
      `Action: ${action}, Actor: ${actor}`
    );
  }
}

/**
 * Wrap an irreversible action with audit assertion
 *
 * @param {Object} env - Cloudflare Worker env bindings
 * @param {string} actor - Email of the operator
 * @param {string} action - Name of the action
 * @param {Function} fn - The irreversible action to execute
 * @returns {Promise<any>} Result of the action
 */
export async function withAuditGuard(env, actor, action, fn) {
  // Assert audit is writable first
  await assertAuditWritable(env, actor, action);

  // Only execute if audit write succeeded
  return fn();
}

export default {
  assertAuditWritable,
  withAuditGuard
};
