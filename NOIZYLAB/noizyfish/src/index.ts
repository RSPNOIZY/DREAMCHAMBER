// ============================================================
// NOISY FISH — V0.1
// Living Legacy Vault + Creative Services Hub
// "The archive that proves the vision is earned."
// 40 years of mastery. Alive, not stored.
// ============================================================

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env, SACRED, PRICING_TIERS, CatalogTitle, CatalogAsset, ProductionNote, License, RoyaltyEvent, LucyObservation } from './types';
import { ImmutableAuditLedger } from './engines/audit';

const app = new Hono<{ Bindings: Env }>();

// --- CORS ---
app.use('*', cors({
  origin: ['https://noizy.ai', 'https://fish.noisy.io', 'https://box.noisy.io', 'https://heaven.rsp-5f3.workers.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// --- Auth Guard ---
const authGuard = async (c: any, next: any) => {
  const auth = c.req.header('Authorization');
  if (!auth || !auth.startsWith('Bearer ') || auth.length < 47) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  const token = auth.slice(7);
  if (c.env.API_KEY && token !== c.env.API_KEY) {
    return c.json({ success: false, error: 'Invalid API key' }, 401);
  }
  await next();
};

app.use('/v1/*', authGuard);

function getAudit(db: D1Database) { return new ImmutableAuditLedger(db); }

// ============================================================
// PUBLIC ENDPOINTS
// ============================================================

app.get('/health', (c) => c.json({
  status: 'alive',
  platform: 'NOISY FISH',
  version: '0.1.0',
  tagline: 'Living Legacy Vault — 40 years of mastery, alive and searchable',
  catalog_owner: 'Robert Stephen Plowman',
  sacred_invariants: {
    royalty_floor: `${SACRED.ROYALTY_FLOOR_BPS / 100}%`,
    gorunfree_tithe: `${SACRED.GORUNFREE_TITHE_BPS / 100}%`,
    gorunfree_recipient: SACRED.GORUNFREE_RECIPIENT,
    kill_switch: SACRED.KILL_SWITCH,
    attribution_locked: SACRED.ATTRIBUTION_LOCKED,
    audit_append_only: SACRED.AUDIT_APPEND_ONLY,
  },
  timestamp: new Date().toISOString(),
}));

app.get('/readiness', async (c) => {
  try {
    await c.env.DB.prepare('SELECT 1').first();
    const audit = getAudit(c.env.DB);
    const stats = await audit.getStats();
    return c.json({ status: 'ready', db: 'connected', audit: stats });
  } catch (e: any) {
    return c.json({ status: 'not_ready', error: e.message }, 503);
  }
});

app.get('/pricing', (c) => c.json({
  success: true,
  data: PRICING_TIERS,
  note: 'NOIZYKIDZ receives 20% strategic discount. All licensing generates 1% GORUNFREE tithe.',
}));

app.get('/gorunfree/report', async (c) => {
  const totals = await c.env.DB
    .prepare("SELECT SUM(gorunfree_tithe) as total, COUNT(*) as count FROM royalty_events WHERE gorunfree_recipient = 'NOIZYKIDZ'")
    .first<{ total: number; count: number }>();
  return c.json({
    success: true,
    data: { total_tithe: totals?.total || 0, total_events: totals?.count || 0 },
    meta: { sacred: 'GORUNFREE Trust Clause — 1% of all royalties to NOIZYKIDZ — irremovable' },
  });
});

// ============================================================
// CATALOG ROUTES — The master index
// ============================================================

// Search catalog — the discovery engine
app.get('/v1/catalog/search', async (c) => {
  const query = c.req.query('q') || '';
  const era = c.req.query('era');
  const project = c.req.query('project');
  const mood = c.req.query('mood');
  const instrument = c.req.query('instrument');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = parseInt(c.req.query('offset') || '0');

  let sql = "SELECT t.* FROM catalog_titles t WHERE t.status = 'active'";
  const params: any[] = [];

  // Full-text search via search_index
  if (query) {
    sql = `SELECT t.* FROM catalog_titles t
           LEFT JOIN search_index s ON t.id = s.title_id
           WHERE t.status = 'active' AND (
             t.title LIKE ? OR t.project LIKE ? OR t.composer LIKE ?
             OR s.searchable_text LIKE ?
           )`;
    const like = `%${query}%`;
    params.push(like, like, like, like);
  }

  if (era) {
    sql += ' AND t.era_tag = ?';
    params.push(era);
  }
  if (project) {
    sql += ' AND t.project LIKE ?';
    params.push(`%${project}%`);
  }
  if (mood) {
    sql += ' AND t.mood_tags LIKE ?';
    params.push(`%${mood}%`);
  }
  if (instrument) {
    sql += ' AND t.instrumentation LIKE ?';
    params.push(`%${instrument}%`);
  }

  sql += ' ORDER BY t.year DESC, t.title ASC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const result = await c.env.DB.prepare(sql).bind(...params).all<CatalogTitle>();

  // Count total
  let countSql = "SELECT COUNT(*) as total FROM catalog_titles WHERE status = 'active'";
  const countResult = await c.env.DB.prepare(countSql).first<{ total: number }>();

  return c.json({
    success: true,
    data: result.results,
    pagination: { limit, offset, total: countResult?.total || 0 },
  });
});

// Get single catalog title with full details
app.get('/v1/catalog/:id', async (c) => {
  const titleId = c.req.param('id');

  const [title, assets, notes, licenses] = await Promise.all([
    c.env.DB.prepare('SELECT * FROM catalog_titles WHERE id = ?').bind(titleId).first<CatalogTitle>(),
    c.env.DB.prepare('SELECT * FROM catalog_assets WHERE title_id = ? ORDER BY asset_type').bind(titleId).all<CatalogAsset>(),
    c.env.DB.prepare('SELECT * FROM production_notes WHERE title_id = ? ORDER BY created_at DESC').bind(titleId).all<ProductionNote>(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM licenses WHERE title_id = ? AND status = 'active'").bind(titleId).first<{ count: number }>(),
  ]);

  if (!title) return c.json({ success: false, error: 'Title not found' }, 404);

  return c.json({
    success: true,
    data: {
      title,
      assets: assets.results,
      production_notes: notes.results,
      active_licenses: licenses?.count || 0,
    },
  });
});

// Browse by era
app.get('/v1/catalog/era/:era', async (c) => {
  const result = await c.env.DB
    .prepare("SELECT * FROM catalog_titles WHERE era_tag = ? AND status = 'active' ORDER BY year ASC, title ASC")
    .bind(c.req.param('era'))
    .all<CatalogTitle>();
  return c.json({ success: true, data: result.results, era: c.req.param('era') });
});

// Browse by project
app.get('/v1/catalog/project/:project', async (c) => {
  const result = await c.env.DB
    .prepare("SELECT * FROM catalog_titles WHERE project = ? AND status = 'active' ORDER BY year ASC")
    .bind(c.req.param('project'))
    .all<CatalogTitle>();
  return c.json({ success: true, data: result.results, project: c.req.param('project') });
});

// Catalog statistics
app.get('/v1/catalog/stats', async (c) => {
  const [total, byEra, byProject, topMoods] = await Promise.all([
    c.env.DB.prepare("SELECT COUNT(*) as count FROM catalog_titles WHERE status = 'active'").first<{ count: number }>(),
    c.env.DB.prepare("SELECT era_tag, COUNT(*) as count FROM catalog_titles WHERE status = 'active' GROUP BY era_tag ORDER BY era_tag").all(),
    c.env.DB.prepare("SELECT project, COUNT(*) as count FROM catalog_titles WHERE status = 'active' AND project IS NOT NULL GROUP BY project ORDER BY count DESC LIMIT 10").all(),
    c.env.DB.prepare("SELECT COUNT(*) as notes_count FROM production_notes").first<{ notes_count: number }>(),
  ]);

  return c.json({
    success: true,
    data: {
      total_titles: total?.count || 0,
      by_era: byEra.results,
      top_projects: byProject.results,
      production_notes: topMoods?.notes_count || 0,
      composer: 'Robert Stephen Plowman',
      span: '40 years',
    },
  });
});

// ============================================================
// PRODUCTION NOTES ROUTES — The wisdom layer
// ============================================================

// Add a production note
app.post('/v1/notes', async (c) => {
  const body = await c.req.json<{
    title_id: string;
    note_type: string;
    content: string;
    voice_ref?: string;
    author?: string;
    tags?: string[];
    teachable?: boolean;
  }>();

  const id = crypto.randomUUID();
  await c.env.DB.prepare(`
    INSERT INTO production_notes (id, title_id, note_type, content, voice_ref, author, tags, teachable)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, body.title_id, body.note_type, body.content, body.voice_ref || null, body.author || 'Robert Stephen Plowman', body.tags ? JSON.stringify(body.tags) : null, body.teachable !== false ? 1 : 0).run();

  const audit = getAudit(c.env.DB);
  await audit.append({
    event_type: 'note.create',
    actor_id: body.author || 'RSP_001',
    actor_type: 'composer',
    resource_type: 'production_note',
    resource_id: id,
    action: 'create',
    metadata: { title_id: body.title_id, note_type: body.note_type, teachable: body.teachable !== false },
  });

  return c.json({ success: true, data: { id, note_type: body.note_type } }, 201);
});

// Get notes for a title
app.get('/v1/notes/:titleId', async (c) => {
  const result = await c.env.DB
    .prepare('SELECT * FROM production_notes WHERE title_id = ? ORDER BY created_at DESC')
    .bind(c.req.param('titleId'))
    .all<ProductionNote>();
  return c.json({ success: true, data: result.results });
});

// Get teachable notes (for NOIZYKIDZ)
app.get('/v1/notes/teachable', async (c) => {
  const result = await c.env.DB
    .prepare('SELECT p.*, t.title, t.project FROM production_notes p JOIN catalog_titles t ON p.title_id = t.id WHERE p.teachable = 1 ORDER BY p.created_at DESC LIMIT 50')
    .all();
  return c.json({ success: true, data: result.results });
});

// ============================================================
// LICENSING ROUTES — Every use tracked, every dollar traced
// ============================================================

// Issue a license
app.post('/v1/licenses', async (c) => {
  const body = await c.req.json<{
    title_id: string;
    tier: string;
    customer_ref: string;
    customer_name?: string;
    customer_type?: string;
    fee: number;
    currency?: string;
    term_end?: string;
    territory?: string;
    usage_scope?: string;
    exclusivity?: string;
  }>();

  // Validate tier
  const tierConfig = PRICING_TIERS[body.tier as keyof typeof PRICING_TIERS];
  if (!tierConfig) return c.json({ success: false, error: `Invalid tier: ${body.tier}. Valid: ${Object.keys(PRICING_TIERS).join(', ')}` }, 400);

  // Apply NOIZYKIDZ discount
  let fee = body.fee;
  if (body.tier === 'noizykidz') {
    fee = fee * (1 - tierConfig.discount_pct / 100);
  }

  // Validate fee range
  if (fee < tierConfig.min || fee > tierConfig.max) {
    return c.json({ success: false, error: `Fee $${fee} outside ${body.tier} range ($${tierConfig.min}-$${tierConfig.max})` }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO licenses (id, title_id, tier, customer_ref, customer_name, customer_type, fee, currency, term_start, term_end, territory, usage_scope, exclusivity, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
  `).bind(id, body.title_id, body.tier, body.customer_ref, body.customer_name || null, body.customer_type || null, fee, body.currency || 'USD', now, body.term_end || null, body.territory || 'worldwide', body.usage_scope || null, body.exclusivity || 'non-exclusive').run();

  // Create attribution record — LOCKED
  const attrId = crypto.randomUUID();
  const attrText = `Music by Robert Stephen Plowman, from the NOIZYFISH catalog. Licensed under ${body.tier} tier.`;
  await c.env.DB.prepare(`
    INSERT INTO attribution_log (id, license_id, title_id, attribution_text, context, verified)
    VALUES (?, ?, ?, ?, ?, 0)
  `).bind(attrId, id, body.title_id, attrText, body.usage_scope || 'general').run();

  // Calculate royalty events — Gospel Deal enforcement
  const gross = fee;
  const gorunfreeTithe = Math.round(gross * (SACRED.GORUNFREE_TITHE_BPS / 10000) * 100) / 100;
  const netAfterTithe = gross - gorunfreeTithe;
  const creatorShare = Math.round(netAfterTithe * (SACRED.ROYALTY_FLOOR_BPS / 10000) * 100) / 100;
  const platformShare = Math.round((netAfterTithe - creatorShare) * 100) / 100;

  // Write royalty events
  const royaltyIds: string[] = [];
  for (const split of [
    { payee_id: 'RSP_001', payee_type: 'composer', net_amount: creatorShare, creator_share: creatorShare, platform_share: platformShare },
    { payee_id: 'PLATFORM', payee_type: 'platform', net_amount: platformShare, creator_share: creatorShare, platform_share: platformShare },
    { payee_id: SACRED.GORUNFREE_RECIPIENT, payee_type: 'gorunfree', net_amount: gorunfreeTithe, creator_share: creatorShare, platform_share: platformShare },
  ]) {
    const royaltyId = crypto.randomUUID();
    royaltyIds.push(royaltyId);
    await c.env.DB.prepare(`
      INSERT INTO royalty_events (id, license_id, title_id, event_type, payee_id, payee_type, gross_amount, creator_share, platform_share, gorunfree_tithe, gorunfree_recipient, net_amount, currency, status)
      VALUES (?, ?, ?, 'license_fee', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `).bind(royaltyId, id, body.title_id, split.payee_id, split.payee_type, gross, split.creator_share, split.platform_share, gorunfreeTithe, SACRED.GORUNFREE_RECIPIENT, split.net_amount, body.currency || 'USD').run();
  }

  // Audit
  const audit = getAudit(c.env.DB);
  await audit.append({
    event_type: 'license.issue',
    actor_id: body.customer_ref,
    actor_type: 'licensee',
    resource_type: 'license',
    resource_id: id,
    action: 'create',
    metadata: { tier: body.tier, fee, title_id: body.title_id, gorunfree_tithe: gorunfreeTithe },
  });

  return c.json({
    success: true,
    data: {
      license_id: id,
      attribution_id: attrId,
      fee,
      royalty_breakdown: {
        gross,
        gorunfree_tithe: gorunfreeTithe,
        net_after_tithe: netAfterTithe,
        creator_amount: creatorShare,
        platform_amount: platformShare,
      },
      sacred: {
        attribution: attrText,
        creator_share_pct: `${SACRED.ROYALTY_FLOOR_BPS / 100}%`,
        gorunfree_tithe_pct: `${SACRED.GORUNFREE_TITHE_BPS / 100}%`,
      },
    },
  }, 201);
});

// Get license details
app.get('/v1/licenses/:id', async (c) => {
  const license = await c.env.DB.prepare('SELECT * FROM licenses WHERE id = ?').bind(c.req.param('id')).first<License>();
  if (!license) return c.json({ success: false, error: 'License not found' }, 404);

  const attribution = await c.env.DB.prepare('SELECT * FROM attribution_log WHERE license_id = ?').bind(c.req.param('id')).all();
  const royalties = await c.env.DB.prepare('SELECT * FROM royalty_events WHERE license_id = ?').bind(c.req.param('id')).all();

  return c.json({ success: true, data: { license, attribution: attribution.results, royalties: royalties.results } });
});

// Licensing history for a title
app.get('/v1/licenses/title/:titleId', async (c) => {
  const result = await c.env.DB
    .prepare('SELECT * FROM licenses WHERE title_id = ? ORDER BY created_at DESC')
    .bind(c.req.param('titleId'))
    .all<License>();
  return c.json({ success: true, data: result.results });
});

// ============================================================
// EARNINGS + ROYALTY ROUTES
// ============================================================

app.get('/v1/earnings', async (c) => {
  const [totals, byType, recent] = await Promise.all([
    c.env.DB.prepare("SELECT SUM(net_amount) as total, payee_type FROM royalty_events GROUP BY payee_type").all(),
    c.env.DB.prepare("SELECT SUM(gross_amount) as total, event_type, COUNT(*) as count FROM royalty_events GROUP BY event_type").all(),
    c.env.DB.prepare("SELECT r.*, l.tier, t.title FROM royalty_events r JOIN licenses l ON r.license_id = l.id JOIN catalog_titles t ON r.title_id = t.id WHERE r.payee_type = 'composer' ORDER BY r.created_at DESC LIMIT 20").all(),
  ]);

  return c.json({
    success: true,
    data: {
      by_payee_type: totals.results,
      by_event_type: byType.results,
      recent_composer_earnings: recent.results,
    },
  });
});

// ============================================================
// LUCY CURATION ROUTES
// ============================================================

// Get Lucy's observations
app.get('/v1/lucy/observations', async (c) => {
  const type = c.req.query('type');
  let sql = 'SELECT * FROM lucy_observations WHERE acted_on = 0';
  const params: any[] = [];
  if (type) { sql += ' AND observation_type = ?'; params.push(type); }
  sql += ' ORDER BY confidence DESC, created_at DESC LIMIT 50';

  const result = await c.env.DB.prepare(sql).bind(...params).all<LucyObservation>();
  return c.json({ success: true, data: result.results });
});

// Trigger Lucy's catalog analysis
app.post('/v1/lucy/analyze', async (c) => {
  const observations: any[] = [];

  // Analyze era distribution
  const eras = await c.env.DB
    .prepare("SELECT era_tag, COUNT(*) as count FROM catalog_titles WHERE status = 'active' GROUP BY era_tag ORDER BY count DESC")
    .all<{ era_tag: string; count: number }>();

  if (eras.results && eras.results.length > 0) {
    const underserved = eras.results.filter(e => e.count < 5);
    if (underserved.length > 0) {
      const obs = await recordLucyObservation(c.env.DB, {
        type: 'gap',
        subjectType: 'era',
        observation: `Underrepresented eras in catalog: ${underserved.map(e => `${e.era_tag} (${e.count} titles)`).join(', ')}. Consider adding more from these periods.`,
        confidence: 0.7,
        dataPoints: { underserved_eras: underserved },
      });
      observations.push(obs);
    }
  }

  // Analyze licensing patterns
  const licensing = await c.env.DB
    .prepare("SELECT t.title, t.id, COUNT(l.id) as license_count FROM catalog_titles t LEFT JOIN licenses l ON t.id = l.title_id WHERE t.status = 'active' GROUP BY t.id ORDER BY license_count DESC LIMIT 5")
    .all<{ title: string; id: string; license_count: number }>();

  if (licensing.results && licensing.results.length > 0) {
    const topLicensed = licensing.results.filter(l => l.license_count > 0);
    if (topLicensed.length > 0) {
      const obs = await recordLucyObservation(c.env.DB, {
        type: 'trend',
        subjectType: 'market',
        observation: `Most licensed titles: ${topLicensed.map(t => `"${t.title}" (${t.license_count} licenses)`).join(', ')}. Consider creating similar works.`,
        confidence: 0.8,
        dataPoints: { top_licensed: topLicensed },
      });
      observations.push(obs);
    }
  }

  // Analyze production notes coverage
  const noteCoverage = await c.env.DB.prepare(`
    SELECT
      (SELECT COUNT(*) FROM catalog_titles WHERE status = 'active') as total_titles,
      (SELECT COUNT(DISTINCT title_id) FROM production_notes) as titles_with_notes
  `).first<{ total_titles: number; titles_with_notes: number }>();

  if (noteCoverage && noteCoverage.total_titles > 0) {
    const coverage = noteCoverage.titles_with_notes / noteCoverage.total_titles;
    if (coverage < 0.5) {
      const obs = await recordLucyObservation(c.env.DB, {
        type: 'recommendation',
        subjectType: 'creator',
        subjectId: 'RSP_001',
        observation: `Only ${(coverage * 100).toFixed(0)}% of catalog titles have production notes. Adding notes to more titles increases educational value and NOIZYKIDZ curriculum potential.`,
        confidence: 0.85,
        dataPoints: { total: noteCoverage.total_titles, with_notes: noteCoverage.titles_with_notes },
      });
      observations.push(obs);
    }
  }

  return c.json({ success: true, data: observations });
});

// ============================================================
// DASHBOARD DATA (CLI + JSON)
// ============================================================

app.get('/v1/dashboard', async (c) => {
  const [catalog, licensing, revenue, notes, lucy] = await Promise.all([
    c.env.DB.prepare("SELECT COUNT(*) as count FROM catalog_titles WHERE status = 'active'").first<{ count: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) as active FROM licenses WHERE status = 'active'").first<{ active: number }>(),
    c.env.DB.prepare("SELECT SUM(net_amount) as total FROM royalty_events WHERE payee_type = 'composer'").first<{ total: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM production_notes").first<{ count: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM lucy_observations WHERE acted_on = 0").first<{ count: number }>(),
  ]);

  return c.json({
    success: true,
    data: {
      catalog_owner: 'Robert Stephen Plowman',
      summary: {
        catalog_titles: catalog?.count || 0,
        active_licenses: licensing?.active || 0,
        total_composer_earnings: revenue?.total || 0,
        production_notes: notes?.count || 0,
        unread_observations: lucy?.count || 0,
      },
      sacred_invariants: SACRED,
      pricing_tiers: PRICING_TIERS,
    },
  });
});

// ============================================================
// AUDIT ROUTES
// ============================================================

app.get('/v1/audit/verify', async (c) => {
  const audit = getAudit(c.env.DB);
  const result = await audit.verifyChain();
  return c.json({ success: true, data: result });
});

app.get('/v1/audit/stats', async (c) => {
  const audit = getAudit(c.env.DB);
  const stats = await audit.getStats();
  return c.json({ success: true, data: stats });
});

// ============================================================
// HELPER: Record Lucy observation
// ============================================================

async function recordLucyObservation(db: D1Database, params: {
  type: string; subjectType: string; subjectId?: string;
  observation: string; confidence: number; dataPoints?: any;
}): Promise<LucyObservation> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.prepare(`
    INSERT INTO lucy_observations (id, observation_type, subject_type, subject_id, observation, confidence, data_points, acted_on, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
  `).bind(id, params.type, params.subjectType, params.subjectId || null, params.observation, params.confidence, params.dataPoints ? JSON.stringify(params.dataPoints) : null, now).run();

  const audit = new ImmutableAuditLedger(db);
  await audit.append({
    event_type: 'lucy.observation',
    actor_id: 'LUCY',
    actor_type: 'lucy',
    resource_type: params.subjectType,
    resource_id: params.subjectId || 'global',
    action: 'observe',
    metadata: { observation_type: params.type, confidence: params.confidence },
  });

  return {
    id, observation_type: params.type as any, subject_type: params.subjectType as any,
    subject_id: params.subjectId, observation: params.observation,
    confidence: params.confidence, data_points: params.dataPoints,
    acted_on: false, created_at: now,
  };
}

export default app;
