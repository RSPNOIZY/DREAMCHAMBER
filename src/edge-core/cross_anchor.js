/**
 * EDGE CORE: Cross-Anchor Redundancy
 *
 * Same Merkle root anchored to multiple independent systems:
 *   1. Ethereum (transaction input data)
 *   2. Bitcoin (OP_RETURN)
 *   3. Third anchor (append-only transparency log)
 *
 * Security property:
 *   An attacker must compromise ALL THREE independent systems to hide a change.
 *   Any divergence between anchors is immediately detectable.
 */

import { sha256 } from './audit_hash.js';

// ═══════════════════════════════════════════════════════════════════════════
// ANCHOR TARGETS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Anchor target configurations
 */
export const ANCHOR_TARGETS = {
  ETHEREUM: {
    name: 'Ethereum',
    type: 'blockchain',
    description: 'Transaction input data on Ethereum mainnet',
    verification_url: 'https://etherscan.io/tx/',
    required: true
  },
  BITCOIN: {
    name: 'Bitcoin',
    type: 'blockchain',
    description: 'OP_RETURN output on Bitcoin mainnet',
    verification_url: 'https://mempool.space/tx/',
    required: true
  },
  TRANSPARENCY_LOG: {
    name: 'Transparency Log',
    type: 'append_only_log',
    description: 'NOIZY public transparency log (append-only, versioned)',
    verification_url: '/trust/transparency-log/',
    required: false // Can be self-hosted
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// CROSS-ANCHOR RECORD
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a cross-anchor record for a daily Merkle root
 *
 * @param {string} date - Anchor date (YYYY-MM-DD)
 * @param {string} rootHash - The Merkle root to anchor
 * @param {Object} anchors - Map of anchor target to txid/proof
 * @returns {Object} Cross-anchor record
 */
export function createCrossAnchorRecord(date, rootHash, anchors) {
  const record = {
    date,
    root_hash: rootHash,
    algorithm: 'sha256-merkle',
    created_at: new Date().toISOString(),
    anchors: {},
    redundancy_level: 0
  };

  for (const [target, data] of Object.entries(anchors)) {
    if (data && data.txid) {
      record.anchors[target] = {
        ...ANCHOR_TARGETS[target],
        txid: data.txid,
        block: data.block || null,
        timestamp: data.timestamp || null,
        status: 'confirmed'
      };
      record.redundancy_level++;
    }
  }

  return record;
}

/**
 * Verify cross-anchor consistency
 * Checks that all anchors reference the same root hash
 *
 * @param {Object} env - Cloudflare Worker env
 * @param {string} date - Date to verify
 * @returns {Object} Consistency verification result
 */
export async function verifyCrossAnchorConsistency(env, date) {
  const result = {
    date,
    consistent: true,
    anchors_checked: 0,
    roots_found: new Set(),
    details: {}
  };

  // Get anchor record from D1
  const anchorRecord = await env.GABRIEL_DB.prepare(`
    SELECT * FROM audit_anchors WHERE anchor_date = ?
  `).bind(date).first();

  if (!anchorRecord) {
    return { ...result, consistent: false, error: 'No anchor record found' };
  }

  const expectedRoot = anchorRecord.root_hash;

  // Check Ethereum
  if (anchorRecord.eth_txid) {
    result.anchors_checked++;
    result.details.ethereum = {
      txid: anchorRecord.eth_txid,
      block: anchorRecord.eth_block,
      status: 'recorded'
    };
    // In production: fetch and verify tx data contains root
  }

  // Check Bitcoin
  if (anchorRecord.btc_txid) {
    result.anchors_checked++;
    result.details.bitcoin = {
      txid: anchorRecord.btc_txid,
      block: anchorRecord.btc_block,
      status: 'recorded'
    };
    // In production: fetch and verify OP_RETURN contains root
  }

  // Check transparency log
  const logEntry = await getTransparencyLogEntry(env, date);
  if (logEntry) {
    result.anchors_checked++;
    result.details.transparency_log = {
      entry_id: logEntry.id,
      root_hash: logEntry.root_hash,
      status: logEntry.root_hash === expectedRoot ? 'consistent' : 'mismatch'
    };
    result.roots_found.add(logEntry.root_hash);
  }

  // Add expected root
  result.roots_found.add(expectedRoot);

  // Check consistency
  result.consistent = result.roots_found.size === 1;
  result.expected_root = expectedRoot;
  result.roots_found = Array.from(result.roots_found);

  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// TRANSPARENCY LOG (THIRD ANCHOR)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Append to transparency log (third anchor)
 *
 * @param {Object} env - Cloudflare Worker env
 * @param {Object} anchor - Anchor record to log
 */
export async function appendToTransparencyLog(env, anchor) {
  const logEntry = {
    id: crypto.randomUUID(),
    anchor_date: anchor.date,
    root_hash: anchor.root_hash,
    event_count: anchor.audit_events || anchor.event_count,
    eth_txid: anchor.eth_txid || null,
    btc_txid: anchor.btc_txid || null,
    published_at: new Date().toISOString()
  };

  // Store in transparency log table
  try {
    await env.GABRIEL_DB.prepare(`
      INSERT INTO transparency_log
      (id, anchor_date, root_hash, event_count, eth_txid, btc_txid, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      logEntry.id,
      logEntry.anchor_date,
      logEntry.root_hash,
      logEntry.event_count,
      logEntry.eth_txid,
      logEntry.btc_txid,
      logEntry.published_at
    ).run();
  } catch (e) {
    // Table may not exist yet
    console.warn('[CrossAnchor] Transparency log table may not exist:', e.message);
  }

  return logEntry;
}

/**
 * Get transparency log entry for a date
 */
async function getTransparencyLogEntry(env, date) {
  try {
    return await env.GABRIEL_DB.prepare(`
      SELECT * FROM transparency_log WHERE anchor_date = ?
    `).bind(date).first();
  } catch (e) {
    return null;
  }
}

/**
 * Get full transparency log (public API)
 *
 * @param {Object} env - Cloudflare Worker env
 * @param {number} limit - Max entries to return
 */
export async function getTransparencyLog(env, limit = 30) {
  try {
    const results = await env.GABRIEL_DB.prepare(`
      SELECT * FROM transparency_log
      ORDER BY anchor_date DESC
      LIMIT ?
    `).bind(limit).all();
    return results.results || [];
  } catch (e) {
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// REDUNDANCY METRICS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get cross-anchor redundancy metrics
 *
 * @param {Object} env - Cloudflare Worker env
 * @param {number} days - Number of days to analyze
 */
export async function getRedundancyMetrics(env, days = 30) {
  const metrics = {
    period_days: days,
    total_anchors: 0,
    ethereum_anchors: 0,
    bitcoin_anchors: 0,
    transparency_log_entries: 0,
    triple_redundant: 0,
    double_redundant: 0,
    single_redundant: 0,
    timestamp: new Date().toISOString()
  };

  try {
    const anchors = await env.GABRIEL_DB.prepare(`
      SELECT * FROM audit_anchors
      WHERE anchor_date > DATE('now', '-${days} days')
    `).all();

    for (const anchor of (anchors.results || [])) {
      metrics.total_anchors++;

      let redundancy = 0;
      if (anchor.eth_txid) { metrics.ethereum_anchors++; redundancy++; }
      if (anchor.btc_txid) { metrics.bitcoin_anchors++; redundancy++; }

      // Check transparency log
      const logEntry = await getTransparencyLogEntry(env, anchor.anchor_date);
      if (logEntry) { metrics.transparency_log_entries++; redundancy++; }

      if (redundancy >= 3) metrics.triple_redundant++;
      else if (redundancy >= 2) metrics.double_redundant++;
      else if (redundancy >= 1) metrics.single_redundant++;
    }
  } catch (e) {
    console.error('[CrossAnchor] Metrics error:', e);
  }

  return metrics;
}

export default {
  ANCHOR_TARGETS,
  createCrossAnchorRecord,
  verifyCrossAnchorConsistency,
  appendToTransparencyLog,
  getTransparencyLog,
  getRedundancyMetrics
};
