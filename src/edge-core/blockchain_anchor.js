/**
 * EDGE CORE: Blockchain Anchoring
 *
 * Anchors daily Merkle roots to public blockchains (Ethereum, Bitcoin)
 * for independent, tamper-evident verification.
 *
 * Rule: Internal control + external witness = durable trust
 *
 * IMPORTANT: This module requires external wallet/RPC configuration.
 * Set these environment variables:
 *   - ETH_RPC_URL: Ethereum RPC endpoint (e.g., Infura, Alchemy)
 *   - ETH_PRIVATE_KEY: Private key for signing (use Cloudflare Secrets)
 *   - BTC_API_URL: Bitcoin API endpoint for OP_RETURN transactions
 *   - BTC_API_KEY: API key for Bitcoin service
 */

import { sha256 } from './audit_hash.js';

/**
 * Create Ethereum anchor transaction data
 *
 * @param {string} rootHash - Merkle root hash
 * @param {string} date - Anchor date (YYYY-MM-DD)
 * @returns {Promise<string>} Hex-encoded transaction input data
 */
export async function createEthAnchorData(rootHash, date) {
  // Keccak256 of (root_hash | date) - note: using sha256 as approximation
  // In production, use proper keccak256 for Ethereum compatibility
  const combined = `${rootHash}|${date}`;
  const hash = await sha256(combined);

  // Prefix with 'NOIZY:' for identification
  const encoder = new TextEncoder();
  const prefix = encoder.encode('NOIZY:');
  const hashBytes = new Uint8Array(hash.match(/.{2}/g).map(byte => parseInt(byte, 16)));

  const data = new Uint8Array(prefix.length + hashBytes.length);
  data.set(prefix, 0);
  data.set(hashBytes, prefix.length);

  return '0x' + Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Create Bitcoin OP_RETURN script
 *
 * @param {string} rootHash - Merkle root hash
 * @param {string} date - Anchor date (YYYY-MM-DD)
 * @returns {string} Hex-encoded OP_RETURN script
 */
export function createBtcOpReturn(rootHash, date) {
  // OP_RETURN (0x6a) followed by data length and data
  // Max 80 bytes for OP_RETURN
  const prefix = 'NOIZY:';
  const payload = prefix + date + ':' + rootHash.substring(0, 32);

  const encoder = new TextEncoder();
  const bytes = encoder.encode(payload);

  // OP_RETURN + OP_PUSHDATA1 + length + data
  const script = new Uint8Array(bytes.length + 2);
  script[0] = 0x6a; // OP_RETURN
  script[1] = bytes.length;
  script.set(bytes, 2);

  return Array.from(script).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Submit Ethereum anchor transaction
 *
 * @param {Object} env - Cloudflare Worker env bindings
 * @param {Object} anchor - Anchor record with root_hash and date
 * @returns {Promise<Object>} Transaction result
 */
export async function submitEthAnchor(env, anchor) {
  if (!env.ETH_RPC_URL || !env.ETH_PRIVATE_KEY) {
    return { success: false, error: 'Ethereum anchoring not configured' };
  }

  const inputData = await createEthAnchorData(anchor.root_hash, anchor.date);

  // Note: This is a simplified example. Production code should:
  // 1. Use proper Ethereum transaction signing
  // 2. Handle gas estimation and nonce management
  // 3. Use a proper web3 library or signing service

  try {
    // For MVP: Log the intended transaction, don't actually submit
    // until wallet infrastructure is properly configured
    console.log('[ETH ANCHOR] Would submit:', {
      to: '0x0000000000000000000000000000000000000000', // Zero address for pure data tx
      data: inputData,
      value: '0x0'
    });

    return {
      success: true,
      pending: true,
      message: 'Ethereum anchoring prepared (requires wallet configuration)',
      data: inputData
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Submit Bitcoin anchor via OP_RETURN
 *
 * @param {Object} env - Cloudflare Worker env bindings
 * @param {Object} anchor - Anchor record with root_hash and date
 * @returns {Promise<Object>} Transaction result
 */
export async function submitBtcAnchor(env, anchor) {
  if (!env.BTC_API_URL) {
    return { success: false, error: 'Bitcoin anchoring not configured' };
  }

  const opReturn = createBtcOpReturn(anchor.root_hash, anchor.date);

  try {
    // For MVP: Log the intended transaction
    console.log('[BTC ANCHOR] Would submit OP_RETURN:', opReturn);

    return {
      success: true,
      pending: true,
      message: 'Bitcoin anchoring prepared (requires API configuration)',
      opReturn
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Verify an Ethereum anchor
 *
 * @param {string} txHash - Ethereum transaction hash
 * @param {string} rootHash - Expected Merkle root
 * @param {string} date - Expected date
 * @returns {Promise<Object>} Verification result
 */
export async function verifyEthAnchor(env, txHash, rootHash, date) {
  if (!env.ETH_RPC_URL) {
    return { valid: false, error: 'Ethereum verification not configured' };
  }

  try {
    // Fetch transaction from RPC
    const response = await fetch(env.ETH_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionByHash',
        params: [txHash],
        id: 1
      })
    });

    const result = await response.json();
    if (!result.result) {
      return { valid: false, error: 'Transaction not found' };
    }

    // Verify input data matches expected anchor
    const expectedData = await createEthAnchorData(rootHash, date);
    if (result.result.input !== expectedData) {
      return { valid: false, error: 'Data mismatch' };
    }

    return {
      valid: true,
      txHash,
      blockNumber: parseInt(result.result.blockNumber, 16),
      timestamp: new Date().toISOString()
    };
  } catch (e) {
    return { valid: false, error: e.message };
  }
}

/**
 * Full blockchain anchor flow
 * Anchors to both Ethereum and Bitcoin if configured
 *
 * @param {Object} env - Cloudflare Worker env bindings
 * @param {Object} anchor - Anchor record from generateDailyAnchor()
 * @returns {Promise<Object>} Results from both chains
 */
export async function anchorToBlockchains(env, anchor) {
  const [ethResult, btcResult] = await Promise.all([
    submitEthAnchor(env, anchor),
    submitBtcAnchor(env, anchor)
  ]);

  // Update anchor record with blockchain references
  if (ethResult.success && ethResult.txHash) {
    await env.GABRIEL_DB.prepare(`
      UPDATE audit_anchors SET eth_txid = ?, eth_block = ? WHERE anchor_date = ?
    `).bind(ethResult.txHash, ethResult.blockNumber || null, anchor.date).run();
  }

  if (btcResult.success && btcResult.txHash) {
    await env.GABRIEL_DB.prepare(`
      UPDATE audit_anchors SET btc_txid = ?, btc_block = ? WHERE anchor_date = ?
    `).bind(btcResult.txHash, btcResult.blockNumber || null, anchor.date).run();
  }

  return {
    ethereum: ethResult,
    bitcoin: btcResult,
    anchor_date: anchor.date,
    root_hash: anchor.root_hash
  };
}

export default {
  createEthAnchorData,
  createBtcOpReturn,
  submitEthAnchor,
  submitBtcAnchor,
  verifyEthAnchor,
  anchorToBlockchains
};
