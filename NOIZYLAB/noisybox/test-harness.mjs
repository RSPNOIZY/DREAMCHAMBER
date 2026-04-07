#!/usr/bin/env node
// ============================================================
// NOISY BOX V0.1 — CLI Test Harness
// Validates: creators, consent, voices, characters, receipts,
//            royalty splits, sacred invariants, audit chain
// ============================================================

const BASE_URL = process.env.NOISYBOX_URL || 'http://localhost:8787';
const API_KEY = process.env.NOISYBOX_API_KEY || 'test_key_noisybox_v01_aaaaaaaaaaaaaaaaaaa';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
};

let passed = 0;
let failed = 0;

function assert(condition, name, detail) {
  if (condition) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.log(`  ❌ ${name}: ${detail || 'FAILED'}`);
    failed++;
  }
}

async function fetchJSON(path, opts = {}) {
  const res = await fetch(`${BASE_URL}${path}`, { headers, ...opts });
  const data = await res.json();
  return { status: res.status, data };
}

async function testHealth() {
  console.log('\n🏥 HEALTH CHECK');
  const { data } = await fetchJSON('/health');
  assert(data.status === 'alive', 'Platform is alive');
  assert(data.sacred_invariants.royalty_floor === '75%', 'Royalty floor = 75%');
  assert(data.sacred_invariants.gorunfree_tithe === '1%', 'GORUNFREE tithe = 1%');
  assert(data.sacred_invariants.kill_switch === 'absolute', 'Kill switch = absolute');
  assert(data.sacred_invariants.audit_append_only === true, 'Audit is append-only');
  assert(data.sacred_invariants.consent_immutable === true, 'Consent is immutable');
}

async function testCreatorOnboarding() {
  console.log('\n👤 CREATOR ONBOARDING');
  const { status, data } = await fetchJSON('/v1/creators', {
    method: 'POST',
    body: JSON.stringify({
      display_name: 'Test Creator',
      archetype: 'vocalist',
      bio: 'CLI test persona',
    }),
  });
  assert(status === 201, 'Creator created (201)');
  assert(data.data?.id, `Creator ID: ${data.data?.id}`);
  return data.data?.id;
}

async function testConsentGrant(creatorId) {
  console.log('\n🔐 CONSENT VAULT');
  const { status, data } = await fetchJSON('/v1/consent/grant', {
    method: 'POST',
    body: JSON.stringify({
      creator_id: creatorId,
      never_clauses: [
        { clause: 'no_political_ads', description: 'No political advertising', severity: 'absolute' },
        { clause: 'no_weapons', description: 'No weapons marketing', severity: 'absolute' },
      ],
    }),
  });
  assert(status === 201, 'Consent granted (201)');
  assert(data.data?.consent_hash, 'Consent hash generated');
  assert(data.data?.token_id, `Token ID: ${data.data?.token_id}`);

  // Check consent
  const check = await fetchJSON(`/v1/consent/check/${creatorId}`);
  assert(check.data.data?.authorized === true, 'Consent is authorized');

  return data.data;
}

async function testVoiceAsset(creatorId, consentProfileId) {
  console.log('\n🎙️ VOICE ASSET');
  const { status, data } = await fetchJSON('/v1/voice-assets', {
    method: 'POST',
    body: JSON.stringify({
      creator_id: creatorId,
      consent_profile_id: consentProfileId,
      capture_ref: 'r2://test/capture_01.wav',
      sample_rate: 48000,
      bit_depth: 24,
      duration_ms: 120000,
    }),
  });
  assert(status === 201, 'Voice asset registered (201)');
  assert(data.data?.id, `Asset ID: ${data.data?.id}`);
  return data.data?.id;
}

async function testCharacter(creatorId, consentProfileId) {
  console.log('\n🎭 CHARACTER CREATION');
  const { status, data } = await fetchJSON('/v1/characters', {
    method: 'POST',
    body: JSON.stringify({
      creator_id: creatorId,
      character_name: 'The Narrator',
      variant_label: 'warm',
      description: 'Warm storytelling voice',
      voice_parameters: { warmth: 0.8, speed: 0.95 },
      consent_profile_id: consentProfileId,
    }),
  });
  assert(status === 201, 'Character created (201)');
  assert(data.data?.character_name === 'The Narrator', 'Character name matches');
  return data.data?.id;
}

async function testReceiptAndRoyalties(voiceAssetId, characterId) {
  console.log('\n💰 RECEIPT + ROYALTY ENGINE');
  const { status, data } = await fetchJSON('/v1/receipts', {
    method: 'POST',
    body: JSON.stringify({
      voice_asset_id: voiceAssetId,
      character_id: characterId,
      project_name: 'Test Project Alpha',
      requester_id: 'test_client_001',
      usage_type: 'synthesis',
      gross_amount: 1000.00,
      duration_ms: 60000,
    }),
  });
  assert(status === 201, 'Receipt generated (201)');

  const calc = data.data?.calculation;
  assert(calc, 'Calculation present');

  // SACRED INVARIANT CHECKS
  const gross = calc?.gross;
  const gorunfree = calc?.gorunfree_tithe;
  const creatorAmt = calc?.creator_amount;
  const platformAmt = calc?.platform_amount;

  assert(gross === 1000, `Gross = $${gross}`);
  assert(gorunfree === 10, `GORUNFREE tithe = $${gorunfree} (1% of $1000)`);
  assert(creatorAmt === 742.5, `Creator amount = $${creatorAmt} (75% of $990 net)`);
  assert(platformAmt === 247.5, `Platform amount = $${platformAmt} (25% of $990 net)`);

  // Verify the math: gross - gorunfree - creator - platform = 0
  const remainder = gross - gorunfree - creatorAmt - platformAmt;
  assert(Math.abs(remainder) < 0.01, `Math checks: $${gross} - $${gorunfree} - $${creatorAmt} - $${platformAmt} = $${remainder.toFixed(2)}`);

  // Verify splits
  const splits = data.data?.splits;
  assert(splits?.length >= 3, `${splits?.length} royalty splits written`);

  const gorunfreeSplit = splits?.find(s => s.payee_type === 'gorunfree');
  assert(gorunfreeSplit?.payee_id === 'NOIZYKIDZ', 'GORUNFREE goes to NOIZYKIDZ');
  assert(gorunfreeSplit?.basis_points === 100, 'GORUNFREE = 100 bps (1%)');

  return data.data?.receipt_id;
}

async function testAuditChain() {
  console.log('\n📋 AUDIT CHAIN VERIFICATION');
  const { data } = await fetchJSON('/v1/audit/verify');
  assert(data.data?.valid === true, 'Audit chain is valid');
  assert(data.data?.entries > 0, `${data.data?.entries} audit entries in chain`);

  const stats = await fetchJSON('/v1/audit/stats');
  assert(stats.data.data?.chain_valid === true, 'Chain integrity confirmed');
}

async function testGorunfreeReport() {
  console.log('\n🌍 GORUNFREE REPORT');
  const { data } = await fetchJSON('/gorunfree/report');
  assert(data.data?.total_tithe >= 0, `Total GORUNFREE tithe: $${data.data?.total_tithe}`);
  assert(data.meta?.sacred?.includes('irremovable'), 'Sacred clause stated');
}

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  NOISY BOX V0.1 — FULL PIPELINE TEST HARNESS');
  console.log('  Consent-native digital voice talent agency');
  console.log('═══════════════════════════════════════════════');
  console.log(`  Target: ${BASE_URL}`);

  try {
    await testHealth();
    const creatorId = await testCreatorOnboarding();
    const consent = await testConsentGrant(creatorId);
    const voiceAssetId = await testVoiceAsset(creatorId, consent?.id);
    const characterId = await testCharacter(creatorId, consent?.id);
    await testReceiptAndRoyalties(voiceAssetId, characterId);
    await testAuditChain();
    await testGorunfreeReport();
  } catch (e) {
    console.error('\n💥 Test harness error:', e.message);
    failed++;
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
  console.log('═══════════════════════════════════════════════');
  process.exit(failed > 0 ? 1 : 0);
}

main();
