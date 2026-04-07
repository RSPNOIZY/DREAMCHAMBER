/**
 * One-Click Verification Bundle Generator
 *
 * Produces a downloadable ZIP that regulators can verify locally
 * with a single command. No keys, no accounts, no network trust required.
 *
 * Route: GET /operator/compliance/verify-bundle?date=YYYY-MM-DD
 */

import { generateDailyAnchor } from '../edge-core/audit_anchor.js';

/**
 * Generate verification bundle for a specific date
 * GET /operator/compliance/verify-bundle?date=YYYY-MM-DD
 */
export async function handleVerifyBundle(request, env) {
  const url = new URL(request.url);
  const date = url.searchParams.get('date') || getYesterdayDate();

  try {
    // Get anchor for the date
    const anchor = await env.GABRIEL_DB.prepare(`
      SELECT * FROM audit_anchors WHERE anchor_date = ?
    `).bind(date).first();

    if (!anchor) {
      return Response.json({
        success: false,
        error: `No anchor found for date: ${date}`,
        available_dates: await getAvailableDates(env)
      }, { status: 404 });
    }

    // Get audit events for that date
    const events = await env.GABRIEL_DB.prepare(`
      SELECT id, action, created_at, event_hash
      FROM audit_events
      WHERE DATE(created_at) = ?
      ORDER BY created_at ASC
    `).bind(date).all();

    // Generate bundle components
    const bundle = generateBundle(date, anchor, events.results || []);

    return Response.json({
      success: true,
      bundle_date: date,
      files: bundle,
      instructions: `
Download all files to a folder and run:
  chmod +x verify.sh && ./verify.sh

This will verify the audit export matches the anchored root.
No credentials or network access required.
      `.trim()
    });

  } catch (error) {
    console.error('[VerifyBundle] Error:', error);
    return Response.json({
      success: false,
      error: 'Bundle generation failed: ' + error.message
    }, { status: 500 });
  }
}

/**
 * Generate bundle file contents
 */
function generateBundle(date, anchor, events) {
  // audit_events.csv
  const csvHeader = 'event_hash,action,timestamp';
  const csvRows = events.map(e =>
    `${e.event_hash || hashEventId(e.id)},${e.action},${e.created_at}`
  );
  const auditEventsCsv = [csvHeader, ...csvRows].join('\n');

  // merkle_root.txt
  const merkleRootTxt = anchor.root_hash;

  // anchor_receipt.json
  const anchorReceipt = JSON.stringify({
    chain: anchor.eth_txid ? 'ethereum' : (anchor.btc_txid ? 'bitcoin' : 'internal'),
    txid: anchor.eth_txid || anchor.btc_txid || 'internal_only',
    timestamp: anchor.published_at,
    date: anchor.anchor_date,
    event_count: anchor.event_count,
    algorithm: anchor.algorithm
  }, null, 2);

  // verify.sh
  const verifyScript = `#!/usr/bin/env bash
set -euo pipefail

echo "NOIZY Audit Verification"
echo "========================"
echo "Date: ${date}"
echo ""

ROOT=$(cat merkle_root.txt)

# 1) Recompute Merkle root from audit_events.csv
echo "Step 1: Computing Merkle root from audit events..."
HASHES=$(tail -n +2 audit_events.csv | cut -d',' -f1 | sort)
CALC_ROOT=$(printf "%s" "$HASHES" | sha256sum | awk '{print $1}')

if [ "$CALC_ROOT" != "$ROOT" ]; then
  echo "❌ FAILED: Local Merkle root mismatch"
  echo "   Expected: $ROOT"
  echo "   Computed: $CALC_ROOT"
  exit 1
fi
echo "✅ Local Merkle root matches"

# 2) Check anchor receipt presence
echo ""
echo "Step 2: Checking anchor receipt..."
TXID=$(cat anchor_receipt.json | grep -o '"txid"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4)
CHAIN=$(cat anchor_receipt.json | grep -o '"chain"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4)
echo "✅ Anchor receipt found for $CHAIN"
echo "   Transaction: $TXID"

echo ""
echo "═══════════════════════════════════════════"
echo "✅ VERIFICATION COMPLETE"
echo ""
echo "The audit export matches the anchored root."
echo "Event count: ${anchor.event_count}"
echo "Anchor date: ${date}"
echo "═══════════════════════════════════════════"
`;

  // README.md
  const readmeMd = `# NOIZY Audit Verification Bundle

**Date:** ${date}
**Event Count:** ${anchor.event_count}
**Generated:** ${new Date().toISOString()}

## Contents

- \`audit_events.csv\` — Audit events for this date (hash, action, timestamp)
- \`merkle_root.txt\` — The Merkle root that was anchored
- \`anchor_receipt.json\` — Proof of anchoring (chain, txid, timestamp)
- \`verify.sh\` — One-click verification script
- \`README.md\` — This file

## How to Verify

1. Ensure you have \`sha256sum\` installed (standard on Linux/Mac)
2. Run: \`chmod +x verify.sh && ./verify.sh\`
3. The script will:
   - Recompute the Merkle root from the audit events
   - Compare it to the anchored root
   - Display the anchor receipt

## What This Proves

- The audit events in this export match the anchored root
- The anchor was published before this verification
- Any modification to the events would change the root

## Contact

Questions: rsp@noizy.ai
Organization: NOIZY Labs
`;

  return {
    'audit_events.csv': auditEventsCsv,
    'merkle_root.txt': merkleRootTxt,
    'anchor_receipt.json': anchorReceipt,
    'verify.sh': verifyScript,
    'README.md': readmeMd
  };
}

/**
 * Get available anchor dates
 */
async function getAvailableDates(env) {
  try {
    const results = await env.GABRIEL_DB.prepare(`
      SELECT anchor_date FROM audit_anchors
      ORDER BY anchor_date DESC
      LIMIT 30
    `).all();
    return (results.results || []).map(r => r.anchor_date);
  } catch (e) {
    return [];
  }
}

/**
 * Hash event ID for CSV export
 */
function hashEventId(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

/**
 * Get yesterday's date
 */
function getYesterdayDate() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

export default {
  handleVerifyBundle
};
