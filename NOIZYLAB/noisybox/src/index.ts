// ============================================================
// NOISY BOX (A.I.V.A.) — V0.1
// Consent-native digital voice talent agency
// "We don't ship AI outputs. We ship consent-native,
//  provenance-bound, revenue-bearing human legacy."
// ============================================================

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env, SACRED, Creator, VoiceAsset, Session, Take, Character, AuthScore, UsageReceipt } from './types';
import { ImmutableAuditLedger } from './engines/audit';
import { ConsentVault, NeverClause } from './engines/consent-vault';
import { RoyaltyEngine } from './engines/royalty';
import { LucyEngine } from './engines/lucy';

const app = new Hono<{ Bindings: Env }>();

// --- CORS ---
app.use('*', cors({
  origin: ['https://noizy.ai', 'https://box.noisy.io', 'https://proof.noisy.io', 'https://fish.noisy.io'],
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

// Protected routes
app.use('/v1/*', authGuard);

// --- Engine factories ---
function getAudit(db: D1Database) { return new ImmutableAuditLedger(db); }
function getConsent(db: D1Database) { return new ConsentVault(db, getAudit(db)); }
function getRoyalty(db: D1Database) { return new RoyaltyEngine(db, getAudit(db)); }
function getLucy(db: D1Database) { return new LucyEngine(db, getAudit(db)); }

// ============================================================
// PUBLIC ENDPOINTS
// ============================================================

app.get('/health', (c) => c.json({
  status: 'alive',
  platform: 'NOISY BOX',
  version: '0.1.0',
  tagline: 'Consent-native digital voice talent agency',
  sacred_invariants: {
    royalty_floor: `${SACRED.ROYALTY_FLOOR_BPS / 100}%`,
    gorunfree_tithe: `${SACRED.GORUNFREE_TITHE_BPS / 100}%`,
    gorunfree_recipient: SACRED.GORUNFREE_RECIPIENT,
    kill_switch: SACRED.KILL_SWITCH,
    audit_append_only: SACRED.AUDIT_APPEND_ONLY,
    consent_immutable: SACRED.CONSENT_IMMUTABLE,
  },
  timestamp: new Date().toISOString(),
}));

app.get('/readiness', async (c) => {
  try {
    await c.env.DB.prepare('SELECT 1').first();
    const audit = getAudit(c.env.DB);
    const stats = await audit.getStats();
    return c.json({
      status: 'ready',
      db: 'connected',
      audit: stats,
    });
  } catch (e: any) {
    return c.json({ status: 'not_ready', error: e.message }, 503);
  }
});

app.get('/gorunfree/report', async (c) => {
  const royalty = getRoyalty(c.env.DB);
  const report = await royalty.getGorunfreeReport();
  return c.json({
    success: true,
    data: report,
    meta: { sacred: 'GORUNFREE Trust Clause — 1% of all royalties to NOIZYKIDZ — irremovable' },
  });
});

// ============================================================
// CREATOR ROUTES
// ============================================================

// List all creators
app.get('/v1/creators', async (c) => {
  const status = c.req.query('status') || 'active';
  const result = await c.env.DB
    .prepare('SELECT * FROM creators WHERE status = ? ORDER BY created_at DESC')
    .bind(status)
    .all<Creator>();
  return c.json({ success: true, data: result.results, count: result.results?.length || 0 });
});

// Get creator by ID
app.get('/v1/creators/:id', async (c) => {
  const creator = await c.env.DB
    .prepare('SELECT * FROM creators WHERE id = ?')
    .bind(c.req.param('id'))
    .first<Creator>();
  if (!creator) return c.json({ success: false, error: 'Creator not found' }, 404);
  return c.json({ success: true, data: creator });
});

// Onboard a new creator
app.post('/v1/creators', async (c) => {
  const body = await c.req.json<{
    display_name: string;
    legal_name?: string;
    archetype: string;
    bio?: string;
    contact_email?: string;
  }>();

  if (!body.display_name || !body.archetype) {
    return c.json({ success: false, error: 'display_name and archetype are required' }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO creators (id, display_name, legal_name, archetype, bio, contact_email, status, onboarded_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
  `).bind(id, body.display_name, body.legal_name || null, body.archetype, body.bio || null, body.contact_email || null, now, now, now).run();

  const audit = getAudit(c.env.DB);
  await audit.append({
    event_type: 'creator.onboard',
    actor_id: id,
    actor_type: 'creator',
    resource_type: 'creator',
    resource_id: id,
    action: 'create',
    metadata: { display_name: body.display_name, archetype: body.archetype },
  });

  return c.json({ success: true, data: { id, display_name: body.display_name, archetype: body.archetype, status: 'active' } }, 201);
});

// ============================================================
// CONSENT ROUTES
// ============================================================

// Grant consent
app.post('/v1/consent/grant', async (c) => {
  const body = await c.req.json<{
    creator_id: string;
    never_clauses: NeverClause[];
    terms_version?: string;
    expires_at?: string;
  }>();

  if (!body.creator_id || !body.never_clauses) {
    return c.json({ success: false, error: 'creator_id and never_clauses are required' }, 400);
  }

  const consent = getConsent(c.env.DB);
  const profile = await consent.grantConsent(body);
  return c.json({ success: true, data: profile }, 201);
});

// Check consent
app.get('/v1/consent/check/:creatorId', async (c) => {
  const usageContext = c.req.query('context');
  const consent = getConsent(c.env.DB);
  const result = await consent.checkConsent(c.req.param('creatorId'), usageContext);
  return c.json({ success: true, data: result });
});

// Revoke consent
app.post('/v1/consent/revoke', async (c) => {
  const body = await c.req.json<{ consent_id: string; creator_id: string; reason: string }>();
  const consent = getConsent(c.env.DB);
  try {
    const revoked = await consent.revokeConsent(body.consent_id, body.creator_id, body.reason);
    return c.json({ success: true, data: revoked });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 400);
  }
});

// List active consents for creator
app.get('/v1/consent/active/:creatorId', async (c) => {
  const consent = getConsent(c.env.DB);
  const profiles = await consent.getActiveForCreator(c.req.param('creatorId'));
  return c.json({ success: true, data: profiles });
});

// ============================================================
// VOICE ASSET ROUTES
// ============================================================

// Register a voice asset
app.post('/v1/voice-assets', async (c) => {
  const body = await c.req.json<{
    creator_id: string;
    consent_profile_id: string;
    capture_ref: string;
    sample_rate: number;
    bit_depth: number;
    channels?: number;
    duration_ms: number;
    format?: string;
  }>();

  // Verify consent is active
  const consent = getConsent(c.env.DB);
  const check = await consent.checkConsent(body.creator_id);
  if (!check.authorized) {
    return c.json({ success: false, error: `Consent check failed: ${check.reason}` }, 403);
  }

  const id = crypto.randomUUID();
  await c.env.DB.prepare(`
    INSERT INTO voice_assets (id, creator_id, consent_profile_id, capture_ref, sample_rate, bit_depth, channels, duration_ms, format, quality_gate_status, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'active')
  `).bind(id, body.creator_id, body.consent_profile_id, body.capture_ref, body.sample_rate, body.bit_depth, body.channels || 1, body.duration_ms, body.format || 'wav').run();

  const audit = getAudit(c.env.DB);
  await audit.append({
    event_type: 'voice.capture',
    actor_id: body.creator_id,
    actor_type: 'creator',
    resource_type: 'voice_asset',
    resource_id: id,
    action: 'create',
    metadata: { sample_rate: body.sample_rate, bit_depth: body.bit_depth, duration_ms: body.duration_ms },
  });

  return c.json({ success: true, data: { id, quality_gate_status: 'pending' } }, 201);
});

// List voice assets for creator
app.get('/v1/voice-assets/:creatorId', async (c) => {
  const result = await c.env.DB
    .prepare("SELECT * FROM voice_assets WHERE creator_id = ? AND status = 'active' ORDER BY created_at DESC")
    .bind(c.req.param('creatorId'))
    .all<VoiceAsset>();
  return c.json({ success: true, data: result.results });
});

// ============================================================
// SESSION + TAKE ROUTES
// ============================================================

// Start a session
app.post('/v1/sessions', async (c) => {
  const body = await c.req.json<{ creator_id: string; session_type: string; director_notes?: string }>();
  const id = crypto.randomUUID();

  await c.env.DB.prepare(`
    INSERT INTO sessions (id, creator_id, session_type, director_notes, start_ts, status)
    VALUES (?, ?, ?, ?, ?, 'active')
  `).bind(id, body.creator_id, body.session_type, body.director_notes || null, new Date().toISOString()).run();

  const audit = getAudit(c.env.DB);
  await audit.append({
    event_type: 'session.start',
    actor_id: body.creator_id,
    actor_type: 'creator',
    resource_type: 'session',
    resource_id: id,
    action: 'create',
    metadata: { session_type: body.session_type },
  });

  return c.json({ success: true, data: { id, session_type: body.session_type, status: 'active' } }, 201);
});

// Record a take
app.post('/v1/takes', async (c) => {
  const body = await c.req.json<{
    session_id: string;
    take_no: number;
    voice_asset_id?: string;
    blessed?: boolean;
    deviation_flags?: string[];
    duration_ms?: number;
    notes?: string;
  }>();

  const id = crypto.randomUUID();
  await c.env.DB.prepare(`
    INSERT INTO takes (id, session_id, take_no, voice_asset_id, blessed, deviation_flags, duration_ms, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, body.session_id, body.take_no, body.voice_asset_id || null,
    body.blessed ? 1 : 0, body.deviation_flags ? JSON.stringify(body.deviation_flags) : null,
    body.duration_ms || null, body.notes || null
  ).run();

  return c.json({ success: true, data: { id, take_no: body.take_no, blessed: body.blessed || false } }, 201);
});

// ============================================================
// CHARACTER ROUTES
// ============================================================

// Create a character variant
app.post('/v1/characters', async (c) => {
  const body = await c.req.json<{
    creator_id: string;
    source_session_id?: string;
    character_name: string;
    variant_label: string;
    description?: string;
    voice_parameters?: any;
    consent_profile_id: string;
  }>();

  // Verify consent
  const consent = getConsent(c.env.DB);
  const check = await consent.checkConsent(body.creator_id);
  if (!check.authorized) {
    return c.json({ success: false, error: `Consent check failed: ${check.reason}` }, 403);
  }

  const id = crypto.randomUUID();
  await c.env.DB.prepare(`
    INSERT INTO characters (id, creator_id, source_session_id, character_name, variant_label, description, voice_parameters, consent_profile_id, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
  `).bind(
    id, body.creator_id, body.source_session_id || null, body.character_name,
    body.variant_label, body.description || null,
    body.voice_parameters ? JSON.stringify(body.voice_parameters) : null,
    body.consent_profile_id
  ).run();

  const audit = getAudit(c.env.DB);
  await audit.append({
    event_type: 'character.create',
    actor_id: body.creator_id,
    actor_type: 'creator',
    resource_type: 'character',
    resource_id: id,
    action: 'create',
    metadata: { character_name: body.character_name, variant_label: body.variant_label },
  });

  return c.json({ success: true, data: { id, character_name: body.character_name, variant_label: body.variant_label } }, 201);
});

// List characters for creator
app.get('/v1/characters/:creatorId', async (c) => {
  const result = await c.env.DB
    .prepare("SELECT * FROM characters WHERE creator_id = ? AND status = 'active' ORDER BY created_at DESC")
    .bind(c.req.param('creatorId'))
    .all<Character>();
  return c.json({ success: true, data: result.results });
});

// ============================================================
// AUTH SCORE ROUTES
// ============================================================

app.post('/v1/auth-scores', async (c) => {
  const body = await c.req.json<{
    take_id: string;
    scorer_model: string;
    similarity_score: number;
    naturalness_score: number;
    intelligibility_score?: number;
    notes?: string;
  }>();

  const overall = (body.similarity_score * 0.4 + body.naturalness_score * 0.4 + (body.intelligibility_score || 0.8) * 0.2);
  const id = crypto.randomUUID();

  await c.env.DB.prepare(`
    INSERT INTO auth_scores (id, take_id, scorer_model, similarity_score, naturalness_score, intelligibility_score, overall_score, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, body.take_id, body.scorer_model, body.similarity_score, body.naturalness_score, body.intelligibility_score || null, overall, body.notes || null).run();

  return c.json({ success: true, data: { id, overall_score: overall } }, 201);
});

// ============================================================
// USAGE RECEIPT + ROYALTY ROUTES
// ============================================================

// Generate a usage receipt with automatic royalty splits
app.post('/v1/receipts', async (c) => {
  const body = await c.req.json<{
    voice_asset_id?: string;
    character_id?: string;
    project_id?: string;
    project_name?: string;
    requester_id: string;
    usage_type: string;
    duration_ms?: number;
    gross_amount: number;
    currency?: string;
    collaborators?: { payee_id: string; bps: number }[];
  }>();

  // Determine creator from voice asset or character
  let creatorId: string | null = null;
  let consentHash: string = '';

  if (body.voice_asset_id) {
    const asset = await c.env.DB.prepare('SELECT * FROM voice_assets WHERE id = ?').bind(body.voice_asset_id).first<VoiceAsset>();
    if (!asset) return c.json({ success: false, error: 'Voice asset not found' }, 404);
    creatorId = asset.creator_id;

    const consentProfile = await c.env.DB.prepare('SELECT consent_hash FROM consent_profiles WHERE id = ?').bind(asset.consent_profile_id).first<{ consent_hash: string }>();
    consentHash = consentProfile?.consent_hash || '';
  } else if (body.character_id) {
    const char = await c.env.DB.prepare('SELECT * FROM characters WHERE id = ?').bind(body.character_id).first<Character>();
    if (!char) return c.json({ success: false, error: 'Character not found' }, 404);
    creatorId = char.creator_id;

    const consentProfile = await c.env.DB.prepare('SELECT consent_hash FROM consent_profiles WHERE id = ?').bind(char.consent_profile_id).first<{ consent_hash: string }>();
    consentHash = consentProfile?.consent_hash || '';
  }

  if (!creatorId) return c.json({ success: false, error: 'Must provide voice_asset_id or character_id' }, 400);

  // Verify consent
  const consent = getConsent(c.env.DB);
  const check = await consent.checkConsent(creatorId, body.usage_type);
  if (!check.authorized) {
    return c.json({ success: false, error: `Consent denied: ${check.reason}` }, 403);
  }

  // Create receipt
  const receiptId = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO usage_receipts (id, voice_asset_id, character_id, project_id, project_name, requester_id, usage_type, start_ts, duration_ms, text_content_hash, consent_hash, gross_amount, currency, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed')
  `).bind(
    receiptId, body.voice_asset_id || null, body.character_id || null,
    body.project_id || null, body.project_name || null, body.requester_id,
    body.usage_type, now, body.duration_ms || null, null,
    consentHash, body.gross_amount, body.currency || 'USD'
  ).run();

  // Calculate and write royalty splits
  const royalty = getRoyalty(c.env.DB);
  const calculation = royalty.calculate(body.gross_amount, creatorId, body.collaborators, body.currency);
  const splits = await royalty.writeSplits(receiptId, calculation);

  // Audit
  const audit = getAudit(c.env.DB);
  await audit.append({
    event_type: 'receipt.generate',
    actor_id: body.requester_id,
    actor_type: 'requester',
    resource_type: 'usage_receipt',
    resource_id: receiptId,
    action: 'create',
    metadata: {
      gross: body.gross_amount,
      creator_amount: calculation.creator_amount,
      gorunfree_tithe: calculation.gorunfree_tithe,
      usage_type: body.usage_type,
    },
  });

  return c.json({
    success: true,
    data: {
      receipt_id: receiptId,
      calculation,
      splits,
      sacred: {
        creator_share_pct: `${SACRED.ROYALTY_FLOOR_BPS / 100}%`,
        gorunfree_tithe_pct: `${SACRED.GORUNFREE_TITHE_BPS / 100}%`,
        gorunfree_amount: calculation.gorunfree_tithe,
      },
    },
  }, 201);
});

// Get receipt details
app.get('/v1/receipts/:id', async (c) => {
  const receipt = await c.env.DB.prepare('SELECT * FROM usage_receipts WHERE id = ?').bind(c.req.param('id')).first<UsageReceipt>();
  if (!receipt) return c.json({ success: false, error: 'Receipt not found' }, 404);

  const royalty = getRoyalty(c.env.DB);
  const splits = await royalty.getSplitsForReceipt(c.req.param('id'));

  return c.json({ success: true, data: { receipt, splits } });
});

// Creator earnings summary
app.get('/v1/earnings/:creatorId', async (c) => {
  const creatorId = c.req.param('creatorId');

  const totals = await c.env.DB.prepare(`
    SELECT
      SUM(amount) as total_earned,
      COUNT(*) as total_splits,
      payee_type
    FROM royalty_splits
    WHERE payee_id = ?
    GROUP BY payee_type
  `).bind(creatorId).all<{ total_earned: number; total_splits: number; payee_type: string }>();

  const recentReceipts = await c.env.DB.prepare(`
    SELECT u.*, r.amount as creator_amount
    FROM usage_receipts u
    JOIN royalty_splits r ON r.receipt_id = u.id
    WHERE r.payee_id = ? AND r.payee_type = 'creator'
    ORDER BY u.created_at DESC LIMIT 20
  `).bind(creatorId).all();

  return c.json({
    success: true,
    data: {
      earnings_by_type: totals.results,
      recent_receipts: recentReceipts.results,
    },
  });
});

// ============================================================
// LUCY ROUTES
// ============================================================

// Get Lucy's observations
app.get('/v1/lucy/observations', async (c) => {
  const subjectType = c.req.query('subject_type');
  const subjectId = c.req.query('subject_id');
  const lucy = getLucy(c.env.DB);
  const observations = await lucy.getUnread(subjectType, subjectId);
  return c.json({ success: true, data: observations });
});

// Trigger Lucy analysis for a creator
app.post('/v1/lucy/analyze/:creatorId', async (c) => {
  const lucy = getLucy(c.env.DB);
  const observations = await lucy.analyzeCreator(c.req.param('creatorId'));
  return c.json({ success: true, data: observations });
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

app.get('/v1/audit/resource/:type/:id', async (c) => {
  const audit = getAudit(c.env.DB);
  const entries = await audit.getByResource(c.req.param('type'), c.req.param('id'));
  return c.json({ success: true, data: entries });
});

// ============================================================
// DASHBOARD DATA (CLI + JSON)
// ============================================================

app.get('/v1/dashboard/:creatorId', async (c) => {
  const creatorId = c.req.param('creatorId');

  const [creator, assets, characters, sessions, earnings, lucy] = await Promise.all([
    c.env.DB.prepare('SELECT * FROM creators WHERE id = ?').bind(creatorId).first<Creator>(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM voice_assets WHERE creator_id = ? AND status = 'active'").bind(creatorId).first<{ count: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM characters WHERE creator_id = ? AND status = 'active'").bind(creatorId).first<{ count: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM sessions WHERE creator_id = ?").bind(creatorId).first<{ count: number }>(),
    c.env.DB.prepare("SELECT SUM(amount) as total FROM royalty_splits WHERE payee_id = ? AND payee_type = 'creator'").bind(creatorId).first<{ total: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM lucy_observations WHERE subject_id = ? AND acted_on = 0").bind(creatorId).first<{ count: number }>(),
  ]);

  return c.json({
    success: true,
    data: {
      creator,
      summary: {
        voice_assets: assets?.count || 0,
        characters: characters?.count || 0,
        sessions: sessions?.count || 0,
        total_earnings: earnings?.total || 0,
        unread_observations: lucy?.count || 0,
      },
      sacred_invariants: SACRED,
    },
  });
});

export default app;
