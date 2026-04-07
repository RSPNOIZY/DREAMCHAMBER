#!/usr/bin/env node
// ============================================================
// NOISY FISH V0.1 — CLI Test Harness
// Validates: catalog search, licensing, royalties, attribution,
//            production notes, Lucy curation, sacred invariants
// ============================================================

const BASE_URL = process.env.NOIZYFISH_URL || 'http://localhost:8788';
const API_KEY = process.env.NOIZYFISH_API_KEY || 'test_key_noizyfish_v01_aaaaaaaaaaaaaaaaaa';

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
  assert(data.catalog_owner === 'Robert Stephen Plowman', 'Catalog owner confirmed');
  assert(data.sacred_invariants.royalty_floor === '75%', 'Royalty floor = 75%');
  assert(data.sacred_invariants.gorunfree_tithe === '1%', 'GORUNFREE tithe = 1%');
  assert(data.sacred_invariants.attribution_locked === true, 'Attribution is locked');
}

async function testPricingTiers() {
  console.log('\n💲 PRICING TIERS');
  const { data } = await fetchJSON('/pricing');
  assert(data.data?.educational, 'Educational tier exists');
  assert(data.data?.noizykidz, 'NOIZYKIDZ tier exists');
  assert(data.data?.noizykidz?.discount_pct === 20, 'NOIZYKIDZ 20% discount active');
  assert(data.data?.commercial, 'Commercial tier exists');
  assert(data.data?.enterprise, 'Enterprise tier exists');
}

async function testCatalogSearch() {
  console.log('\n🔍 CATALOG SEARCH');

  // Search by keyword
  const { data: searchResults } = await fetchJSON('/v1/catalog/search?q=determined');
  assert(searchResults.data?.length > 0, `Keyword "determined" found ${searchResults.data?.length} results`);

  // Search by era
  const { data: eraResults } = await fetchJSON('/v1/catalog/era/2000s');
  assert(eraResults.data?.length >= 10, `2000s era: ${eraResults.data?.length} titles`);

  // Search by project
  const { data: projectResults } = await fetchJSON('/v1/catalog/project/Ed Edd n Eddy');
  assert(projectResults.data?.length >= 3, `Ed Edd n Eddy: ${projectResults.data?.length} titles`);

  // Search by mood
  const { data: moodResults } = await fetchJSON('/v1/catalog/search?mood=epic');
  assert(moodResults.data?.length > 0, `Mood "epic": ${moodResults.data?.length} results`);

  // Search by instrument
  const { data: instrResults } = await fetchJSON('/v1/catalog/search?instrument=oboe');
  assert(instrResults.data?.length > 0, `Instrument "oboe": ${instrResults.data?.length} results`);
}

async function testCatalogDetail() {
  console.log('\n📖 CATALOG DETAIL');
  const { data } = await fetchJSON('/v1/catalog/ct_009'); // Sad Story
  assert(data.data?.title?.title === 'Sad Story', 'Title matches: Sad Story');
  assert(data.data?.title?.composer === 'Robert Stephen Plowman', 'Composer confirmed');
  assert(data.data?.production_notes?.length > 0, `${data.data?.production_notes?.length} production notes`);
}

async function testProductionNotes() {
  console.log('\n📝 PRODUCTION NOTES (The Wisdom Layer)');
  const { data } = await fetchJSON('/v1/notes/ct_016'); // Ed's Big Idea
  assert(data.data?.length > 0, 'Production notes found for Ed Edd n Eddy');

  // Check teachable notes
  const { data: teachable } = await fetchJSON('/v1/notes/teachable');
  assert(teachable.data?.length > 0, `${teachable.data?.length} teachable notes for NOIZYKIDZ`);
}

async function testLicensing() {
  console.log('\n📜 LICENSING');

  // Issue a commercial license
  const { status, data } = await fetchJSON('/v1/licenses', {
    method: 'POST',
    body: JSON.stringify({
      title_id: 'ct_037', // Driving At Night
      tier: 'commercial',
      customer_ref: 'test_studio_001',
      customer_name: 'Midnight Films LLC',
      customer_type: 'indie_dev',
      fee: 800.00,
      usage_scope: 'film',
    }),
  });
  assert(status === 201, 'License issued (201)');

  // SACRED INVARIANT CHECKS
  const rb = data.data?.royalty_breakdown;
  assert(rb, 'Royalty breakdown present');
  assert(rb?.gorunfree_tithe === 8.00, `GORUNFREE tithe = $${rb?.gorunfree_tithe} (1% of $800)`);
  assert(rb?.creator_amount === 594.00, `Creator = $${rb?.creator_amount} (75% of $792 net)`);
  assert(rb?.platform_amount === 198.00, `Platform = $${rb?.platform_amount} (25% of $792 net)`);

  // Math check
  const total = rb?.gorunfree_tithe + rb?.creator_amount + rb?.platform_amount;
  assert(Math.abs(total - 800) < 0.01, `Math: $${rb?.gorunfree_tithe} + $${rb?.creator_amount} + $${rb?.platform_amount} = $${total}`);

  // Attribution locked
  assert(data.data?.sacred?.attribution?.includes('Robert Stephen Plowman'), 'Attribution locked to RSP');
  assert(data.data?.sacred?.attribution?.includes('NOIZYFISH catalog'), 'NOIZYFISH catalog referenced');

  return data.data?.license_id;
}

async function testNOIZYKIDZLicensing() {
  console.log('\n🧒 NOIZYKIDZ TIER (Strategic 20% Discount)');
  const { status, data } = await fetchJSON('/v1/licenses', {
    method: 'POST',
    body: JSON.stringify({
      title_id: 'ct_021', // Wheezie's Garden
      tier: 'noizykidz',
      customer_ref: 'noizykidz_curriculum',
      customer_name: 'NOIZYKIDZ Music Lesson',
      customer_type: 'educator',
      fee: 100.00, // Will be discounted to $80
      usage_scope: 'education',
    }),
  });
  assert(status === 201, 'NOIZYKIDZ license issued (201)');

  const rb = data.data?.royalty_breakdown;
  // Fee should be $80 after 20% discount
  assert(rb?.gross === 80, `Discounted fee = $${rb?.gross} (20% off $100)`);
  assert(rb?.gorunfree_tithe === 0.80, `GORUNFREE = $${rb?.gorunfree_tithe}`);
}

async function testCatalogStats() {
  console.log('\n📊 CATALOG STATISTICS');
  const { data } = await fetchJSON('/v1/catalog/stats');
  assert(data.data?.total_titles >= 50, `Total titles: ${data.data?.total_titles}`);
  assert(data.data?.composer === 'Robert Stephen Plowman', 'Composer confirmed');
  assert(data.data?.span === '40 years', '40-year span confirmed');
  assert(data.data?.by_era?.length >= 4, `${data.data?.by_era?.length} distinct eras`);
}

async function testLucyCuration() {
  console.log('\n🧠 LUCY CURATION');
  const { data } = await fetchJSON('/v1/lucy/observations');
  assert(data.data?.length > 0, `${data.data?.length} unread observations`);

  // Trigger analysis
  const { data: analysis } = await fetchJSON('/v1/lucy/analyze', { method: 'POST' });
  assert(analysis.data?.length >= 0, `Lucy generated ${analysis.data?.length} new observations`);
}

async function testAuditChain() {
  console.log('\n📋 AUDIT CHAIN');
  const { data } = await fetchJSON('/v1/audit/verify');
  assert(data.data?.valid === true, 'Audit chain integrity verified');

  const { data: stats } = await fetchJSON('/v1/audit/stats');
  assert(stats.data?.total_entries > 0, `${stats.data?.total_entries} audit entries`);
}

async function testGorunfreeReport() {
  console.log('\n🌍 GORUNFREE REPORT');
  const { data } = await fetchJSON('/gorunfree/report');
  assert(data.data?.total_tithe >= 0, `Total GORUNFREE tithe: $${data.data?.total_tithe}`);
  assert(data.meta?.sacred?.includes('irremovable'), 'Sacred clause stated');
}

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  NOISY FISH V0.1 — FULL PIPELINE TEST HARNESS');
  console.log('  Living Legacy Vault + Creative Services Hub');
  console.log('═══════════════════════════════════════════════');
  console.log(`  Target: ${BASE_URL}`);

  try {
    await testHealth();
    await testPricingTiers();
    await testCatalogSearch();
    await testCatalogDetail();
    await testProductionNotes();
    await testLicensing();
    await testNOIZYKIDZLicensing();
    await testCatalogStats();
    await testLucyCuration();
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
