// ============================================================
// NOISY BOX — Docker Entry Point
// Node.js server using @hono/node-server + better-sqlite3
// All sacred invariants preserved. Same Hono app, new runtime.
// ============================================================

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { D1Compat } from './db/d1-compat';
import { SACRED } from './types';
import { ImmutableAuditLedger } from './engines/audit';
import { ConsentVault, NeverClause } from './engines/consent-vault';
import { RoyaltyEngine } from './engines/royalty';
import { LucyEngine } from './engines/lucy';

// --- Configuration ---
const PORT = parseInt(process.env.PORT || '8787');
const API_KEY = process.env.NOISYBOX_API_KEY || 'test_key_noisybox_v01_aaaaaaaaaaaaaaaaaaa';
const DB_PATH = process.env.DB_PATH || '/data/noisybox.db';
const NOISY_FISH_URL = process.env.NOISY_FISH_API_URL || 'http://noizyfish:8788';
const NOISY_PROOF_URL = process.env.NOISY_PROOF_API_URL || 'http://noisyproof:8789';

// --- Ensure data directory exists ---
const dataDir = join(DB_PATH, '..');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// --- Initialize SQLite via D1 compat layer ---
const db = new D1Compat(DB_PATH);

// --- Schema + Seed on first run ---
function initDatabase() {
  const schemaPath = join(__dirname, '..', 'schema.sql');
  const seedPath = join(__dirname, '..', 'seed.sql');

  // Check if tables exist
  const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='creators'").first();

  if (!tableCheck) {
    console.log('🏗️  Initializing NOISY BOX database...');
    if (existsSync(schemaPath)) {
      const schema = readFileSync(schemaPath, 'utf-8');
      db.exec(schema);
      console.log('✅ Schema applied');
    }
    if (existsSync(seedPath)) {
      const seed = readFileSync(seedPath, 'utf-8');
      db.exec(seed);
      console.log('✅ Seed data loaded');
    }
  } else {
    console.log('📦 Database already initialized');
  }
}

initDatabase();

// ============================================================
// Hono App — Identical logic to Workers version
// ============================================================

const app = new Hono();

// --- CORS ---
app.use('*', cors({
  origin: [
    'https://noizy.ai', 'https://box.noisy.io', 'https://proof.noisy.io', 'https://fish.noisy.io',
    'http://localhost:3000', 'http://localhost:8787', 'http://localhost:8788',
  ],
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
  if (API_KEY && token !== API_KEY) {
    return c.json({ success: false, error: 'Invalid API key' }, 401);
  }
  await next();
};

app.use('/v1/*', authGuard);

// --- Engine factories (using D1 compat layer — same interface) ---
function getAudit() { return new ImmutableAuditLedger(db as any); }
function getConsent() { return new ConsentVault(db as any, getAudit()); }
function getRoyalty() { return new RoyaltyEngine(db as any, getAudit()); }
function getLucy() { return new LucyEngine(db as any, getAudit()); }

// ============================================================
// PUBLIC ENDPOINTS
// ============================================================

app.get('/health', (c) => c.json({
  status: 'alive',
  platform: 'NOISY BOX',
  version: '0.1.0-docker',
  runtime: 'node',
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
    db.prepare('SELECT 1').first();
    const audit = getAudit();
    const stats = await audit.getStats();
    return c.json({ status: 'ready', db: 'connected', audit: stats });
  } catch (e: any) {
    return c.json({ status: 'not_ready', error: e.message }, 503);
  }
});

app.get('/gorunfree/report', async (c) => {
  const royalty = getRoyalty();
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

app.get('/v1/creators', async (c) => {
  const status = c.req.query('status') || 'active';
  const result = db.prepare('SELECT * FROM creators WHERE status = ? ORDER BY created_at DESC').bind(status).all();
  return c.json({ success: true, data: result.results, count: result.results?.length || 0 });
});

app.get('/v1/creators/:id', async (c) => {
  const creator = db.prepare('SELECT * FROM creators WHERE id = ?').bind(c.req.param('id')).first();
  if (!creator) return c.json({ success: false, error: 'Creator not found' }, 404);
  return c.json({ success: true, data: creator });
});

app.post('/v1/creators', async (c) => {
  const body = await c.req.json<{
    display_name: string; legal_name?: string; archetype: string; bio?: string; contact_email?: string;
  }>();
  if (!body.display_name || !body.archetype) {
    return c.json({ success: false, error: 'display_name and archetype are required' }, 400);
  }
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO creators (id, display_name, legal_name, archetype, bio, contact_email, status, onboarded_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
  `).bind(id, body.display_name, body.legal_name || null, body.archetype, body.bio || null, body.contact_email || null, now, now, now).run();

  const audit = getAudit();
  await audit.append({
    event_type: 'creator.onboard', actor_id: id, actor_type: 'creator',
    resource_type: 'creator', resource_id: id, action: 'create',
    metadata: { display_name: body.display_name, archetype: body.archetype },
  });

  return c.json({ success: true, data: { id, display_name: body.display_name, archetype: body.archetype, status: 'active' } }, 201);
});

// ============================================================
// CONSENT ROUTES
// ============================================================

app.post('/v1/consent/grant', async (c) => {
  const body = await c.req.json<{
    creator_id: string; never_clauses: NeverClause[]; terms_version?: string; expires_at?: string;
  }>();
  if (!body.creator_id || !body.never_clauses) {
    return c.json({ success: false, error: 'creator_id and never_clauses are required' }, 400);
  }
  const consent = getConsent();
  const profile = await consent.grantConsent({
    creatorId: body.creator_id,
    neverClauses: body.never_clauses,
    termsVersion: body.terms_version,
    expiresAt: body.expires_at,
  });
  return c.json({ success: true, data: profile }, 201);
});

app.get('/v1/consent/check/:creatorId', async (c) => {
  const usageContext = c.req.query('context');
  const consent = getConsent();
  const result = await consent.checkConsent(c.req.param('creatorId'), usageContext);
  return c.json({ success: true, data: result });
});

app.post('/v1/consent/revoke', async (c) => {
  const body = await c.req.json<{ consent_id: string; creator_id: string; reason: string }>();
  const consent = getConsent();
  try {
    const revoked = await consent.revokeConsent(body.consent_id, body.creator_id, body.reason);
    return c.json({ success: true, data: revoked });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 400);
  }
});

app.get('/v1/consent/active/:creatorId', async (c) => {
  const consent = getConsent();
  const profiles = await consent.getActiveForCreator(c.req.param('creatorId'));
  return c.json({ success: true, data: profiles });
});

// ============================================================
// VOICE ASSET ROUTES
// ============================================================

app.post('/v1/voice-assets', async (c) => {
  const body = await c.req.json<{
    creator_id: string; consent_profile_id: string; capture_ref: string;
    sample_rate: number; bit_depth: number; channels?: number; duration_ms: number; format?: string;
  }>();
  const consent = getConsent();
  const check = await consent.checkConsent(body.creator_id);
  if (!check.authorized) {
    return c.json({ success: false, error: `Consent check failed: ${check.reason}` }, 403);
  }
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO voice_assets (id, creator_id, consent_profile_id, capture_ref, sample_rate, bit_depth, channels, duration_ms, format, quality_gate_status, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'active')
  `).bind(id, body.creator_id, body.consent_profile_id, body.capture_ref, body.sample_rate, body.bit_depth, body.channels || 1, body.duration_ms, body.format || 'wav').run();

  const audit = getAudit();
  await audit.append({
    event_type: 'voice.capture', actor_id: body.creator_id, actor_type: 'creator',
    resource_type: 'voice_asset', resource_id: id, action: 'create',
    metadata: { sample_rate: body.sample_rate, bit_depth: body.bit_depth, duration_ms: body.duration_ms },
  });

  return c.json({ success: true, data: { id, quality_gate_status: 'pending' } }, 201);
});

app.get('/v1/voice-assets/:creatorId', async (c) => {
  const result = db.prepare("SELECT * FROM voice_assets WHERE creator_id = ? AND status = 'active' ORDER BY created_at DESC")
    .bind(c.req.param('creatorId')).all();
  return c.json({ success: true, data: result.results });
});

// ============================================================
// SESSION + TAKE ROUTES
// ============================================================

app.post('/v1/sessions', async (c) => {
  const body = await c.req.json<{ creator_id: string; session_type: string; director_notes?: string }>();
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO sessions (id, creator_id, session_type, director_notes, start_ts, status) VALUES (?, ?, ?, ?, ?, 'active')
  `).bind(id, body.creator_id, body.session_type, body.director_notes || null, new Date().toISOString()).run();

  const audit = getAudit();
  await audit.append({
    event_type: 'session.start', actor_id: body.creator_id, actor_type: 'creator',
    resource_type: 'session', resource_id: id, action: 'create',
    metadata: { session_type: body.session_type },
  });

  return c.json({ success: true, data: { id, session_type: body.session_type, status: 'active' } }, 201);
});

app.post('/v1/takes', async (c) => {
  const body = await c.req.json<{
    session_id: string; take_no: number; voice_asset_id?: string;
    blessed?: boolean; deviation_flags?: string[]; duration_ms?: number; notes?: string;
  }>();
  const id = crypto.randomUUID();
  db.prepare(`
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

app.post('/v1/characters', async (c) => {
  const body = await c.req.json<{
    creator_id: string; source_session_id?: string; character_name: string;
    variant_label: string; description?: string; voice_parameters?: any; consent_profile_id: string;
  }>();
  const consent = getConsent();
  const check = await consent.checkConsent(body.creator_id);
  if (!check.authorized) {
    return c.json({ success: false, error: `Consent check failed: ${check.reason}` }, 403);
  }
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO characters (id, creator_id, source_session_id, character_name, variant_label, description, voice_parameters, consent_profile_id, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
  `).bind(
    id, body.creator_id, body.source_session_id || null, body.character_name,
    body.variant_label, body.description || null,
    body.voice_parameters ? JSON.stringify(body.voice_parameters) : null,
    body.consent_profile_id
  ).run();

  const audit = getAudit();
  await audit.append({
    event_type: 'character.create', actor_id: body.creator_id, actor_type: 'creator',
    resource_type: 'character', resource_id: id, action: 'create',
    metadata: { character_name: body.character_name, variant_label: body.variant_label },
  });

  return c.json({ success: true, data: { id, character_name: body.character_name, variant_label: body.variant_label } }, 201);
});

app.get('/v1/characters/:creatorId', async (c) => {
  const result = db.prepare("SELECT * FROM characters WHERE creator_id = ? AND status = 'active' ORDER BY created_at DESC")
    .bind(c.req.param('creatorId')).all();
  return c.json({ success: true, data: result.results });
});

// ============================================================
// AUTH SCORE ROUTES
// ============================================================

app.post('/v1/auth-scores', async (c) => {
  const body = await c.req.json<{
    take_id: string; scorer_model: string; similarity_score: number;
    naturalness_score: number; intelligibility_score?: number; notes?: string;
  }>();
  const overall = (body.similarity_score * 0.4 + body.naturalness_score * 0.4 + (body.intelligibility_score || 0.8) * 0.2);
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO auth_scores (id, take_id, scorer_model, similarity_score, naturalness_score, intelligibility_score, overall_score, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(id, body.take_id, body.scorer_model, body.similarity_score, body.naturalness_score, body.intelligibility_score || null, overall, body.notes || null).run();
  return c.json({ success: true, data: { id, overall_score: overall } }, 201);
});

// ============================================================
// USAGE RECEIPT + ROYALTY ROUTES
// ============================================================

app.post('/v1/receipts', async (c) => {
  const body = await c.req.json<{
    voice_asset_id?: string; character_id?: string; project_id?: string;
    project_name?: string; requester_id: string; usage_type: string;
    duration_ms?: number; gross_amount: number; currency?: string;
    collaborators?: { payee_id: string; bps: number }[];
  }>();

  let creatorId: string | null = null;
  let consentHash = '';

  if (body.voice_asset_id) {
    const asset = db.prepare('SELECT * FROM voice_assets WHERE id = ?').bind(body.voice_asset_id).first<any>();
    if (!asset) return c.json({ success: false, error: 'Voice asset not found' }, 404);
    creatorId = asset.creator_id;
    const cp = db.prepare('SELECT consent_hash FROM consent_profiles WHERE id = ?').bind(asset.consent_profile_id).first<any>();
    consentHash = cp?.consent_hash || '';
  } else if (body.character_id) {
    const char = db.prepare('SELECT * FROM characters WHERE id = ?').bind(body.character_id).first<any>();
    if (!char) return c.json({ success: false, error: 'Character not found' }, 404);
    creatorId = char.creator_id;
    const cp = db.prepare('SELECT consent_hash FROM consent_profiles WHERE id = ?').bind(char.consent_profile_id).first<any>();
    consentHash = cp?.consent_hash || '';
  }

  if (!creatorId) return c.json({ success: false, error: 'Must provide voice_asset_id or character_id' }, 400);

  const consent = getConsent();
  const check = await consent.checkConsent(creatorId, body.usage_type);
  if (!check.authorized) {
    return c.json({ success: false, error: `Consent denied: ${check.reason}` }, 403);
  }

  const receiptId = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO usage_receipts (id, voice_asset_id, character_id, project_id, project_name, requester_id, usage_type, start_ts, duration_ms, text_content_hash, consent_hash, gross_amount, currency, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed')
  `).bind(
    receiptId, body.voice_asset_id || null, body.character_id || null,
    body.project_id || null, body.project_name || null, body.requester_id,
    body.usage_type, now, body.duration_ms || null, null,
    consentHash, body.gross_amount, body.currency || 'USD'
  ).run();

  const royalty = getRoyalty();
  const calculation = royalty.calculate(body.gross_amount, creatorId, body.collaborators, body.currency);
  const splits = await royalty.writeSplits(receiptId, calculation);

  const audit = getAudit();
  await audit.append({
    event_type: 'receipt.generate', actor_id: body.requester_id, actor_type: 'requester',
    resource_type: 'usage_receipt', resource_id: receiptId, action: 'create',
    metadata: { gross: body.gross_amount, creator_amount: calculation.creator_amount, gorunfree_tithe: calculation.gorunfree_tithe, usage_type: body.usage_type },
  });

  return c.json({
    success: true,
    data: {
      receipt_id: receiptId, calculation, splits,
      sacred: {
        creator_share_pct: `${SACRED.ROYALTY_FLOOR_BPS / 100}%`,
        gorunfree_tithe_pct: `${SACRED.GORUNFREE_TITHE_BPS / 100}%`,
        gorunfree_amount: calculation.gorunfree_tithe,
      },
    },
  }, 201);
});

app.get('/v1/receipts/:id', async (c) => {
  const receipt = db.prepare('SELECT * FROM usage_receipts WHERE id = ?').bind(c.req.param('id')).first();
  if (!receipt) return c.json({ success: false, error: 'Receipt not found' }, 404);
  const royalty = getRoyalty();
  const splits = await royalty.getSplitsForReceipt(c.req.param('id'));
  return c.json({ success: true, data: { receipt, splits } });
});

app.get('/v1/earnings/:creatorId', async (c) => {
  const creatorId = c.req.param('creatorId');
  const totals = db.prepare(`
    SELECT SUM(amount) as total_earned, COUNT(*) as total_splits, payee_type
    FROM royalty_splits WHERE payee_id = ? GROUP BY payee_type
  `).bind(creatorId).all();
  const recentReceipts = db.prepare(`
    SELECT u.*, r.amount as creator_amount FROM usage_receipts u
    JOIN royalty_splits r ON r.receipt_id = u.id
    WHERE r.payee_id = ? AND r.payee_type = 'creator' ORDER BY u.created_at DESC LIMIT 20
  `).bind(creatorId).all();
  return c.json({ success: true, data: { earnings_by_type: totals.results, recent_receipts: recentReceipts.results } });
});

// ============================================================
// LUCY ROUTES
// ============================================================

app.get('/v1/lucy/observations', async (c) => {
  const subjectType = c.req.query('subject_type');
  const subjectId = c.req.query('subject_id');
  const lucy = getLucy();
  const observations = await lucy.getUnread(subjectType, subjectId);
  return c.json({ success: true, data: observations });
});

app.post('/v1/lucy/analyze/:creatorId', async (c) => {
  const lucy = getLucy();
  const observations = await lucy.analyzeCreator(c.req.param('creatorId'));
  return c.json({ success: true, data: observations });
});

// ============================================================
// AUDIT ROUTES
// ============================================================

app.get('/v1/audit/verify', async (c) => {
  const audit = getAudit();
  const result = await audit.verifyChain();
  return c.json({ success: true, data: result });
});

app.get('/v1/audit/stats', async (c) => {
  const audit = getAudit();
  const stats = await audit.getStats();
  return c.json({ success: true, data: stats });
});

app.get('/v1/audit/resource/:type/:id', async (c) => {
  const audit = getAudit();
  const entries = await audit.getByResource(c.req.param('type'), c.req.param('id'));
  return c.json({ success: true, data: entries });
});

// ============================================================
// DASHBOARD DATA
// ============================================================

app.get('/v1/dashboard/:creatorId', async (c) => {
  const creatorId = c.req.param('creatorId');
  const creator = db.prepare('SELECT * FROM creators WHERE id = ?').bind(creatorId).first();
  const assets = db.prepare("SELECT COUNT(*) as count FROM voice_assets WHERE creator_id = ? AND status = 'active'").bind(creatorId).first<any>();
  const characters = db.prepare("SELECT COUNT(*) as count FROM characters WHERE creator_id = ? AND status = 'active'").bind(creatorId).first<any>();
  const sessions = db.prepare("SELECT COUNT(*) as count FROM sessions WHERE creator_id = ?").bind(creatorId).first<any>();
  const earnings = db.prepare("SELECT SUM(amount) as total FROM royalty_splits WHERE payee_id = ? AND payee_type = 'creator'").bind(creatorId).first<any>();
  const lucy = db.prepare("SELECT COUNT(*) as count FROM lucy_observations WHERE subject_id = ? AND acted_on = 0").bind(creatorId).first<any>();

  return c.json({
    success: true,
    data: {
      creator,
      summary: {
        voice_assets: assets?.count || 0, characters: characters?.count || 0,
        sessions: sessions?.count || 0, total_earnings: earnings?.total || 0,
        unread_observations: lucy?.count || 0,
      },
      sacred_invariants: SACRED,
    },
  });
});

// ============================================================
// LAUNCH
// ============================================================

console.log('═══════════════════════════════════════════════');
console.log('  NOISY BOX V0.1 — Docker Runtime');
console.log('  Consent-native digital voice talent agency');
console.log('  Sacred Invariants: ENFORCED');
console.log(`  Port: ${PORT}`);
console.log(`  DB: ${DB_PATH}`);
console.log('═══════════════════════════════════════════════');

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`🎙️  NOISY BOX listening on http://0.0.0.0:${info.port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 NOISY BOX shutting down...');
  db.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 NOISY BOX shutting down...');
  db.close();
  process.exit(0);
});
