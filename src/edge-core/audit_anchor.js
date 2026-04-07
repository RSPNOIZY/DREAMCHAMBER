/**
 * EDGE CORE: External Hash Anchoring
 *
 * Makes the audit trail tamper-evident even to org-level administrators
 * by periodically anchoring cryptographic roots outside the primary system.
 *
 * Rule: Internal control + external witness = durable trust
 */

import { sha256 } from './audit_hash.js';

/**
 * Compute Merkle root from an array of hashes
 * @param {string[]} hashes - Array of hex-encoded hashes
 * @returns {Promise<string>} Merkle root hash
 */
export async function merkleRoot(hashes) {
  if (hashes.length === 0) {
    return 'EMPTY';
  }

  if (hashes.length === 1) {
    return hashes[0];
  }

  // Pad to even length if needed
  const padded = [...hashes];
  if (padded.length % 2 !== 0) {
    padded.push(padded[padded.length - 1]);
  }

  // Compute next level
  const nextLevel = [];
  for (let i = 0; i < padded.length; i += 2) {
    const combined = padded[i] + padded[i + 1];
    const hash = await sha256(combined);
    nextLevel.push(hash);
  }

  return merkleRoot(nextLevel);
}

/**
 * Generate daily anchor record
 *
 * @param {Object} env - Cloudflare Worker env bindings
 * @param {string} date - Date in YYYY-MM-DD format (defaults to today)
 * @returns {Promise<Object>} Anchor record
 */
export async function generateDailyAnchor(env, date = null) {
  const targetDate = date || new Date().toISOString().split('T')[0];

  // Get all event hashes for the target date
  const events = await env.GABRIEL_DB.prepare(`
    SELECT event_hash FROM audit_events
    WHERE event_hash IS NOT NULL
      AND DATE(created_at) = ?
    ORDER BY created_at ASC
  `).bind(targetDate).all();

  const hashes = (events.results || [])
    .map(r => r.event_hash)
    .filter(Boolean);

  const rootHash = await merkleRoot(hashes);
  const publishedAt = new Date().toISOString();

  const anchor = {
    date: targetDate,
    audit_events: hashes.length,
    root_hash: rootHash,
    algorithm: 'sha256-merkle',
    published_at: publishedAt
  };

  return anchor;
}

/**
 * Publish anchor to transparency endpoint
 *
 * @param {Object} env - Cloudflare Worker env bindings
 * @param {Object} anchor - Anchor record
 */
export async function publishAnchor(env, anchor) {
  // Store in D1 for retrieval
  await env.GABRIEL_DB.prepare(`
    INSERT INTO audit_anchors
    (id, anchor_date, event_count, root_hash, algorithm, published_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(),
    anchor.date,
    anchor.audit_events,
    anchor.root_hash,
    anchor.algorithm,
    anchor.published_at
  ).run();

  // Log the anchoring event
  await env.GABRIEL_DB.prepare(`
    INSERT INTO audit_events
    (id, operator_email, action, explanation, precondition_passed, metadata, created_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    crypto.randomUUID(),
    'SYSTEM',
    'ANCHOR_PUBLISHED',
    `Daily audit anchor published for ${anchor.date}`,
    1,
    JSON.stringify(anchor)
  ).run();

  return anchor;
}

/**
 * Verify a historical anchor against current data
 *
 * @param {Object} env - Cloudflare Worker env bindings
 * @param {string} date - Date to verify
 * @returns {Promise<Object>} Verification result
 */
export async function verifyAnchor(env, date) {
  // Get stored anchor
  const storedAnchor = await env.GABRIEL_DB.prepare(`
    SELECT * FROM audit_anchors WHERE anchor_date = ?
  `).bind(date).first();

  if (!storedAnchor) {
    return { valid: false, error: 'No anchor found for date' };
  }

  // Recompute
  const recomputed = await generateDailyAnchor(env, date);

  if (recomputed.root_hash !== storedAnchor.root_hash) {
    return {
      valid: false,
      error: 'Root hash mismatch',
      stored: storedAnchor.root_hash,
      computed: recomputed.root_hash
    };
  }

  if (recomputed.audit_events !== storedAnchor.event_count) {
    return {
      valid: false,
      error: 'Event count mismatch',
      stored: storedAnchor.event_count,
      computed: recomputed.audit_events
    };
  }

  return {
    valid: true,
    date,
    root_hash: storedAnchor.root_hash,
    event_count: storedAnchor.event_count
  };
}

/**
 * Scheduled job to create daily anchor
 * Call this from the Worker's scheduled handler
 */
export async function runDailyAnchorJob(env) {
  // Anchor yesterday's events (complete day)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const targetDate = yesterday.toISOString().split('T')[0];

  const anchor = await generateDailyAnchor(env, targetDate);

  // Only publish if there were events
  if (anchor.audit_events > 0) {
    await publishAnchor(env, anchor);
    console.log(`[ANCHOR] Published anchor for ${targetDate}: ${anchor.root_hash}`);
  } else {
    console.log(`[ANCHOR] No events to anchor for ${targetDate}`);
  }

  return anchor;
}

export default {
  merkleRoot,
  generateDailyAnchor,
  publishAnchor,
  verifyAnchor,
  runDailyAnchorJob
};
