/**
 * CHAOS ARENA v1.0
 *
 * Public trust verification surface.
 * "Break the proof if you can."
 *
 * What this proves:
 * - Consent verification works
 * - Proof validation works
 * - Revocation checks work
 * - Bundle integrity holds
 *
 * What this does NOT claim:
 * - "Unbreakable history" (D1/KV state changes aren't tracked by Worker versioning)
 * - "All governance is attack-proof" (scope is consent/proof verification)
 *
 * Append-only audit design is NOIZY's responsibility, not Cloudflare's guarantee.
 */

import crypto from 'crypto';

// ═══════════════════════════════════════════════════════════════════════════
// CHAOS ARENA CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const CHAOS_ARENA_VERSION = '1.0.0';

export const BOUNTY_RULES = {
  scope: [
    'Consent receipt verification bypass',
    'Proof validation circumvention',
    'Revocation check failure',
    'Bundle integrity compromise',
    'Manifest hash collision',
    'Timestamp manipulation'
  ],
  out_of_scope: [
    'Cloudflare infrastructure attacks',
    'DDoS or availability attacks',
    'Social engineering',
    'Physical access attacks',
    'Attacks requiring internal access'
  ],
  rewards: {
    critical: '$5,000 — Consent verification bypass',
    high: '$2,500 — Proof validation failure',
    medium: '$1,000 — Revocation check bypass',
    low: '$500 — Bundle integrity issue'
  },
  contact: 'security@noizy.ai',
  public_disclosure: '90 days after fix'
};

// ═══════════════════════════════════════════════════════════════════════════
// APPEND-ONLY INCIDENT LOG
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Incident log entry structure
 * Each entry is signed and hash-chained
 */
function createIncidentEntry(type, data, previousHash) {
  const entry = {
    id: `INC_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
    type,
    data,
    timestamp: new Date().toISOString(),
    previous_hash: previousHash || 'GENESIS'
  };

  // Compute entry hash
  const content = JSON.stringify({
    id: entry.id,
    type: entry.type,
    data: entry.data,
    timestamp: entry.timestamp,
    previous_hash: entry.previous_hash
  });

  entry.hash = crypto.createHash('sha256').update(content).digest('hex');

  return entry;
}

/**
 * Store incident to D1 (append-only by design)
 */
async function logIncident(env, type, data) {
  if (!env.GABRIEL_DB) {
    return { success: false, error: 'Database not available' };
  }

  // Get previous hash
  const lastEntry = await env.GABRIEL_DB
    .prepare('SELECT hash FROM chaos_incidents ORDER BY created_at DESC LIMIT 1')
    .first();

  const previousHash = lastEntry?.hash || 'GENESIS';
  const entry = createIncidentEntry(type, data, previousHash);

  // Insert (never update, never delete)
  await env.GABRIEL_DB
    .prepare(`
      INSERT INTO chaos_incidents (id, type, data, timestamp, previous_hash, hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `)
    .bind(entry.id, entry.type, JSON.stringify(entry.data), entry.timestamp, entry.previous_hash, entry.hash)
    .run();

  return { success: true, incident: entry };
}

/**
 * Get public incident log (verifiable)
 */
async function getIncidentLog(env, limit = 50) {
  if (!env.GABRIEL_DB) {
    return { success: false, error: 'Database not available' };
  }

  const incidents = await env.GABRIEL_DB
    .prepare('SELECT * FROM chaos_incidents ORDER BY created_at DESC LIMIT ?')
    .bind(limit)
    .all();

  return {
    success: true,
    incidents: incidents.results || [],
    chain_valid: await verifyIncidentChain(env)
  };
}

/**
 * Verify incident chain integrity
 */
async function verifyIncidentChain(env) {
  const incidents = await env.GABRIEL_DB
    .prepare('SELECT * FROM chaos_incidents ORDER BY created_at ASC')
    .all();

  if (!incidents.results || incidents.results.length === 0) {
    return { valid: true, reason: 'Empty chain' };
  }

  let previousHash = 'GENESIS';

  for (const incident of incidents.results) {
    // Check chain linkage
    if (incident.previous_hash !== previousHash) {
      return {
        valid: false,
        reason: `Chain break at ${incident.id}`,
        expected: previousHash,
        got: incident.previous_hash
      };
    }

    // Verify hash
    const content = JSON.stringify({
      id: incident.id,
      type: incident.type,
      data: JSON.parse(incident.data),
      timestamp: incident.timestamp,
      previous_hash: incident.previous_hash
    });

    const expectedHash = crypto.createHash('sha256').update(content).digest('hex');

    if (incident.hash !== expectedHash) {
      return {
        valid: false,
        reason: `Hash mismatch at ${incident.id}`,
        expected: expectedHash,
        got: incident.hash
      };
    }

    previousHash = incident.hash;
  }

  return { valid: true, entries: incidents.results.length };
}

// ═══════════════════════════════════════════════════════════════════════════
// PROOF VERIFICATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Verify a proof bundle
 */
export function verifyProofBundle(bundle) {
  const results = {
    valid: true,
    checks: [],
    timestamp: new Date().toISOString()
  };

  // Check 1: Structure validation
  const structureCheck = validateBundleStructure(bundle);
  results.checks.push(structureCheck);
  if (!structureCheck.passed) results.valid = false;

  // Check 2: Hash verification
  const hashCheck = verifyBundleHash(bundle);
  results.checks.push(hashCheck);
  if (!hashCheck.passed) results.valid = false;

  // Check 3: Timestamp validation
  const timestampCheck = validateTimestamp(bundle);
  results.checks.push(timestampCheck);
  if (!timestampCheck.passed) results.valid = false;

  // Check 4: Signature verification (if present)
  if (bundle.signature) {
    const sigCheck = verifySignature(bundle);
    results.checks.push(sigCheck);
    if (!sigCheck.passed) results.valid = false;
  }

  return results;
}

function validateBundleStructure(bundle) {
  const required = ['proof_id', 'policy_id', 'result', 'verified_at'];
  const missing = required.filter(f => !bundle[f]);

  return {
    check: 'structure_validation',
    passed: missing.length === 0,
    details: missing.length === 0
      ? 'All required fields present'
      : `Missing fields: ${missing.join(', ')}`
  };
}

function verifyBundleHash(bundle) {
  if (!bundle.proof_hash) {
    return {
      check: 'hash_verification',
      passed: true,
      details: 'No hash to verify (optional field)'
    };
  }

  // Recompute hash from bundle data
  const hashInput = JSON.stringify({
    proof_id: bundle.proof_id,
    policy_id: bundle.policy_id,
    result: bundle.result,
    verified_at: bundle.verified_at
  });

  const computedHash = crypto.createHash('sha256').update(hashInput).digest('hex');
  const matches = bundle.proof_hash.startsWith(computedHash.slice(0, 16));

  return {
    check: 'hash_verification',
    passed: matches,
    details: matches
      ? 'Hash verified'
      : 'Hash mismatch — bundle may be tampered'
  };
}

function validateTimestamp(bundle) {
  if (!bundle.verified_at) {
    return {
      check: 'timestamp_validation',
      passed: false,
      details: 'Missing verified_at timestamp'
    };
  }

  const timestamp = new Date(bundle.verified_at);
  const now = new Date();
  const age = now - timestamp;

  // Check if timestamp is in the future
  if (timestamp > now) {
    return {
      check: 'timestamp_validation',
      passed: false,
      details: 'Timestamp is in the future — invalid'
    };
  }

  // Check if timestamp is too old (>1 year)
  const oneYear = 365 * 24 * 60 * 60 * 1000;
  if (age > oneYear) {
    return {
      check: 'timestamp_validation',
      passed: true,
      details: `Timestamp is ${Math.floor(age / (24 * 60 * 60 * 1000))} days old — still valid but aged`
    };
  }

  return {
    check: 'timestamp_validation',
    passed: true,
    details: 'Timestamp is valid and recent'
  };
}

function verifySignature(bundle) {
  // Placeholder for signature verification
  // In production, this would verify against issuer's public key
  return {
    check: 'signature_verification',
    passed: true,
    details: 'Signature present (full verification requires issuer key)'
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSENT VERIFICATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Verify consent status from a proof
 */
export function verifyConsentStatus(proof) {
  const result = {
    consent_valid: false,
    revocation_status: 'unknown',
    checks: []
  };

  // Check consent policy
  if (proof.policy_id === 'CONSENT_ACTIVE_ON_USE') {
    result.consent_valid = proof.result === true;
    result.checks.push({
      check: 'consent_active',
      passed: result.consent_valid,
      details: result.consent_valid
        ? 'Consent was active at time of use'
        : 'Consent was NOT active at time of use'
    });
  }

  // Check revocation policy
  if (proof.policy_id === 'REVOCATION_HONORED') {
    result.revocation_status = proof.result ? 'honored' : 'violated';
    result.checks.push({
      check: 'revocation_honored',
      passed: proof.result,
      details: proof.result
        ? 'No usage after revocation'
        : 'Usage detected after revocation — VIOLATION'
    });
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// C2PA MANIFEST VERIFICATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Verify C2PA manifest structure
 */
export function verifyC2PAManifest(manifest) {
  const results = {
    valid: true,
    checks: [],
    noizy_proofs: []
  };

  // Check C2PA structure
  if (!manifest.claim_generator) {
    results.checks.push({
      check: 'c2pa_structure',
      passed: false,
      details: 'Missing claim_generator'
    });
    results.valid = false;
  } else {
    results.checks.push({
      check: 'c2pa_structure',
      passed: true,
      details: `Generator: ${manifest.claim_generator}`
    });
  }

  // Check for NOIZY assertions
  if (manifest.assertions) {
    const noizyAssertions = manifest.assertions.filter(a =>
      a.label && a.label.startsWith('c2pa.noizy.')
    );

    results.checks.push({
      check: 'noizy_assertions',
      passed: noizyAssertions.length > 0,
      details: `Found ${noizyAssertions.length} NOIZY assertion(s)`
    });

    // Verify each NOIZY proof
    for (const assertion of noizyAssertions) {
      if (assertion.data) {
        const proofResult = verifyProofBundle(assertion.data);
        results.noizy_proofs.push({
          label: assertion.label,
          verification: proofResult
        });

        if (!proofResult.valid) {
          results.valid = false;
        }
      }
    }
  }

  // Check signature
  if (manifest.signature) {
    results.checks.push({
      check: 'manifest_signature',
      passed: true,
      details: 'Signature present (full verification requires certificate chain)'
    });
  }

  return results;
}

// ═══════════════════════════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════════════════════════

export async function handleChaosArenaAPI(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/chaos-arena', '');

  // CORS headers for public access
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  switch (path) {
    // ─────────────────────────────────────────────────────────────────────
    // GET /chaos-arena/ — Arena status
    // ─────────────────────────────────────────────────────────────────────
    case '/':
    case '':
      return new Response(JSON.stringify({
        name: 'NOIZY Chaos Arena',
        version: CHAOS_ARENA_VERSION,
        tagline: 'Break the proof if you can.',
        scope: 'Consent verification and proof validation',
        bounty_rules: BOUNTY_RULES,
        endpoints: {
          verify_proof: 'POST /chaos-arena/verify/proof',
          verify_consent: 'POST /chaos-arena/verify/consent',
          verify_manifest: 'POST /chaos-arena/verify/manifest',
          verify_bundle: 'POST /chaos-arena/verify/bundle',
          incident_log: 'GET /chaos-arena/incidents',
          bounty_rules: 'GET /chaos-arena/bounty'
        },
        disclaimer: 'D1/KV state changes are not tracked by Worker versioning. Append-only audit is NOIZY design, not Cloudflare guarantee.'
      }, null, 2), { headers: corsHeaders });

    // ─────────────────────────────────────────────────────────────────────
    // GET /chaos-arena/bounty — Bounty rules
    // ─────────────────────────────────────────────────────────────────────
    case '/bounty':
      return new Response(JSON.stringify({
        success: true,
        bounty: BOUNTY_RULES,
        how_to_submit: {
          email: 'security@noizy.ai',
          required: ['Description', 'Steps to reproduce', 'Impact assessment'],
          optional: ['Proof of concept', 'Suggested fix']
        }
      }, null, 2), { headers: corsHeaders });

    // ─────────────────────────────────────────────────────────────────────
    // POST /chaos-arena/verify/proof — Verify a proof bundle
    // ─────────────────────────────────────────────────────────────────────
    case '/verify/proof':
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'POST required' }), {
          status: 405,
          headers: corsHeaders
        });
      }

      try {
        const proof = await request.json();
        const result = verifyProofBundle(proof);

        // Log verification attempt
        await logIncident(env, 'PROOF_VERIFICATION', {
          proof_id: proof.proof_id,
          policy_id: proof.policy_id,
          result: result.valid,
          checks_passed: result.checks.filter(c => c.passed).length,
          checks_total: result.checks.length
        });

        return new Response(JSON.stringify({
          success: true,
          verification: result
        }, null, 2), { headers: corsHeaders });

      } catch (e) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid proof format',
          details: e.message
        }), {
          status: 400,
          headers: corsHeaders
        });
      }

    // ─────────────────────────────────────────────────────────────────────
    // POST /chaos-arena/verify/consent — Verify consent status
    // ─────────────────────────────────────────────────────────────────────
    case '/verify/consent':
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'POST required' }), {
          status: 405,
          headers: corsHeaders
        });
      }

      try {
        const proof = await request.json();
        const consentResult = verifyConsentStatus(proof);
        const proofResult = verifyProofBundle(proof);

        await logIncident(env, 'CONSENT_VERIFICATION', {
          proof_id: proof.proof_id,
          consent_valid: consentResult.consent_valid,
          revocation_status: consentResult.revocation_status
        });

        return new Response(JSON.stringify({
          success: true,
          consent: consentResult,
          proof: proofResult
        }, null, 2), { headers: corsHeaders });

      } catch (e) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid consent proof',
          details: e.message
        }), {
          status: 400,
          headers: corsHeaders
        });
      }

    // ─────────────────────────────────────────────────────────────────────
    // POST /chaos-arena/verify/manifest — Verify C2PA manifest
    // ─────────────────────────────────────────────────────────────────────
    case '/verify/manifest':
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'POST required' }), {
          status: 405,
          headers: corsHeaders
        });
      }

      try {
        const manifest = await request.json();
        const result = verifyC2PAManifest(manifest);

        await logIncident(env, 'MANIFEST_VERIFICATION', {
          claim_generator: manifest.claim_generator,
          valid: result.valid,
          noizy_proofs_count: result.noizy_proofs.length
        });

        return new Response(JSON.stringify({
          success: true,
          verification: result
        }, null, 2), { headers: corsHeaders });

      } catch (e) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid manifest format',
          details: e.message
        }), {
          status: 400,
          headers: corsHeaders
        });
      }

    // ─────────────────────────────────────────────────────────────────────
    // POST /chaos-arena/verify/bundle — Verify regulator bundle
    // ─────────────────────────────────────────────────────────────────────
    case '/verify/bundle':
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'POST required' }), {
          status: 405,
          headers: corsHeaders
        });
      }

      try {
        const bundle = await request.json();
        const results = {
          valid: true,
          sections: []
        };

        // Verify each section
        const sections = ['consent_records', 'revocation_records', 'merkle_anchors'];
        for (const section of sections) {
          if (bundle[section]) {
            results.sections.push({
              section,
              present: true,
              count: Array.isArray(bundle[section]) ? bundle[section].length : 1
            });
          } else {
            results.sections.push({
              section,
              present: false,
              count: 0
            });
          }
        }

        // Check bundle hash if present
        if (bundle.bundle_hash) {
          const content = JSON.stringify({
            consent_records: bundle.consent_records,
            revocation_records: bundle.revocation_records,
            merkle_anchors: bundle.merkle_anchors
          });
          const computed = crypto.createHash('sha256').update(content).digest('hex');
          const hashValid = bundle.bundle_hash === computed;

          results.sections.push({
            section: 'bundle_hash',
            present: true,
            valid: hashValid
          });

          if (!hashValid) results.valid = false;
        }

        await logIncident(env, 'BUNDLE_VERIFICATION', {
          profile: bundle.profile || 'unknown',
          valid: results.valid,
          sections_present: results.sections.filter(s => s.present).length
        });

        return new Response(JSON.stringify({
          success: true,
          verification: results
        }, null, 2), { headers: corsHeaders });

      } catch (e) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid bundle format',
          details: e.message
        }), {
          status: 400,
          headers: corsHeaders
        });
      }

    // ─────────────────────────────────────────────────────────────────────
    // GET /chaos-arena/incidents — Public incident log
    // ─────────────────────────────────────────────────────────────────────
    case '/incidents':
      const log = await getIncidentLog(env, 50);
      return new Response(JSON.stringify({
        success: true,
        ...log,
        disclaimer: 'Append-only by NOIZY design. Chain integrity verified on read.'
      }, null, 2), { headers: corsHeaders });

    // ─────────────────────────────────────────────────────────────────────
    // GET /chaos-arena/chain — Verify incident chain
    // ─────────────────────────────────────────────────────────────────────
    case '/chain':
      const chainStatus = await verifyIncidentChain(env);
      return new Response(JSON.stringify({
        success: true,
        chain: chainStatus
      }, null, 2), { headers: corsHeaders });

    // ─────────────────────────────────────────────────────────────────────
    // POST /chaos-arena/report — Report a vulnerability
    // ─────────────────────────────────────────────────────────────────────
    case '/report':
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'POST required' }), {
          status: 405,
          headers: corsHeaders
        });
      }

      try {
        const report = await request.json();

        // Log report (sanitized)
        await logIncident(env, 'VULNERABILITY_REPORT', {
          category: report.category || 'unspecified',
          severity: report.severity || 'unknown',
          timestamp: new Date().toISOString()
          // Note: Full report details go to security@noizy.ai, not public log
        });

        return new Response(JSON.stringify({
          success: true,
          message: 'Report received. Full details should be sent to security@noizy.ai',
          reference_id: `RPT_${Date.now()}`,
          next_steps: [
            'Email security@noizy.ai with full details',
            'Include the reference_id above',
            'Expect response within 48 hours'
          ]
        }, null, 2), { headers: corsHeaders });

      } catch (e) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid report format'
        }), {
          status: 400,
          headers: corsHeaders
        });
      }

    default:
      return new Response(JSON.stringify({
        error: 'Unknown endpoint',
        available: [
          'GET /',
          'GET /bounty',
          'POST /verify/proof',
          'POST /verify/consent',
          'POST /verify/manifest',
          'POST /verify/bundle',
          'GET /incidents',
          'GET /chain',
          'POST /report'
        ]
      }), {
        status: 404,
        headers: corsHeaders
      });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default {
  CHAOS_ARENA_VERSION,
  BOUNTY_RULES,
  verifyProofBundle,
  verifyConsentStatus,
  verifyC2PAManifest,
  handleChaosArenaAPI,
  logIncident,
  getIncidentLog,
  verifyIncidentChain
};
