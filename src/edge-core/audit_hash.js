/**
 * EDGE CORE: Audit Hash Chain
 *
 * Cryptographic tamper-evidence for audit events.
 * Each event stores a hash of its contents plus the previous event's hash.
 *
 * Rule: We do not hide mistakes. We make them provable, bounded, and survivable.
 */

/**
 * Compute SHA-256 hash of a message
 * @param {string} message - The string to hash
 * @returns {Promise<string>} Hex-encoded hash
 */
export async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Get the hash of the most recent audit event
 * @param {Object} env - Cloudflare Worker env bindings
 * @returns {Promise<string>} Hash of last event, or 'GENESIS' if no events
 */
export async function getLastEventHash(env) {
  try {
    const last = await env.GABRIEL_DB.prepare(`
      SELECT event_hash FROM audit_events
      WHERE event_hash IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 1
    `).first();

    return last?.event_hash || 'GENESIS';
  } catch (e) {
    // Table might not have event_hash column yet
    return 'GENESIS';
  }
}

/**
 * Create a hash-chained audit event
 *
 * @param {Object} env - Cloudflare Worker env bindings
 * @param {Object} params - Event parameters
 * @param {string} params.id - Event ID (UUID)
 * @param {string} params.operator - Operator email
 * @param {string} params.action - Action name
 * @param {string} params.explanation - Human explanation
 * @param {boolean} params.precondition_passed - Whether preconditions were met
 * @param {Object} params.metadata - Additional metadata
 * @returns {Promise<Object>} { id, eventHash, prevHash }
 */
export async function writeHashedAuditEvent(env, {
  id,
  operator,
  action,
  explanation,
  precondition_passed = true,
  metadata = {}
}) {
  const prevHash = await getLastEventHash(env);
  const timestamp = new Date().toISOString();

  // Canonical form for hashing - order matters!
  const canonical = `${operator}|${action}|${explanation}|${timestamp}|${prevHash}`;
  const eventHash = await sha256(canonical);

  await env.GABRIEL_DB.prepare(`
    INSERT INTO audit_events
    (id, operator_email, action, explanation, precondition_passed, metadata, prev_hash, event_hash, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    operator,
    action,
    explanation,
    precondition_passed ? 1 : 0,
    JSON.stringify(metadata),
    prevHash,
    eventHash,
    timestamp
  ).run();

  return { id, eventHash, prevHash, timestamp };
}

/**
 * Verify the integrity of the audit hash chain
 *
 * @param {Object} env - Cloudflare Worker env bindings
 * @param {Object} options - Verification options
 * @param {number} options.limit - Max events to verify (default 1000)
 * @returns {Promise<Object>} { valid: boolean, verified?: number, brokenAt?: string, error?: string }
 */
export async function verifyAuditChain(env, { limit = 1000 } = {}) {
  try {
    const events = await env.GABRIEL_DB.prepare(`
      SELECT id, operator_email, action, explanation, created_at, prev_hash, event_hash
      FROM audit_events
      WHERE event_hash IS NOT NULL
      ORDER BY created_at ASC
      LIMIT ?
    `).bind(limit).all();

    if (!events.results || events.results.length === 0) {
      return { valid: true, message: 'No hashed events to verify', verified: 0 };
    }

    let expectedPrevHash = 'GENESIS';

    for (const event of events.results) {
      // Check prev_hash matches expected
      if (event.prev_hash !== expectedPrevHash) {
        return {
          valid: false,
          brokenAt: event.id,
          error: `Chain broken: expected prev_hash ${expectedPrevHash}, got ${event.prev_hash}`
        };
      }

      // Recompute hash
      const canonical = `${event.operator_email}|${event.action}|${event.explanation}|${event.created_at}|${event.prev_hash}`;
      const computed = await sha256(canonical);

      if (computed !== event.event_hash) {
        return {
          valid: false,
          brokenAt: event.id,
          error: `Hash mismatch: computed ${computed}, stored ${event.event_hash}`
        };
      }

      expectedPrevHash = event.event_hash;
    }

    return { valid: true, verified: events.results.length };
  } catch (e) {
    return {
      valid: false,
      error: `Verification failed: ${e.message}`
    };
  }
}

export default {
  sha256,
  getLastEventHash,
  writeHashedAuditEvent,
  verifyAuditChain
};
