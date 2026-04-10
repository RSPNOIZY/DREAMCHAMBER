-- ═══════════════════════════════════════════════════════════════════════════
-- NOIZY EMPIRE — D1 Voice Equity Registry Schema
-- Database: gabriel_db
-- Author: Robert Stephen Plowman (RSP_001)
-- Version: 1.0.0 — April 10, 2026
-- 
-- Consent as executable code.
-- Provenance as default.
-- Revocation as sacred.
-- Compensation as automatic.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Actors (Human voice owners) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS actors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'actor' CHECK (role IN ('founding_actor', 'actor', 'estate_executor')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked', 'deceased')),
  royalty_floor INTEGER NOT NULL DEFAULT 75 CHECK (royalty_floor >= 75 AND royalty_floor <= 100),
  union_tier TEXT DEFAULT 'indie' CHECK (union_tier IN ('indie', 'guild', 'master', 'founding')),
  country TEXT DEFAULT 'CA',
  enrolled_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  metadata TEXT -- JSON blob for extensible fields
);

-- ── Never Clauses (Immovable prohibitions per actor) ─────────────────────
CREATE TABLE IF NOT EXISTS never_clauses (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
  clause_type TEXT NOT NULL CHECK (clause_type IN (
    'no_hate_speech', 'no_political', 'no_adult', 'no_deepfake',
    'no_impersonation', 'no_military', 'no_surveillance',
    'no_tobacco', 'no_gambling', 'no_crypto', 'custom'
  )),
  description TEXT,
  immutable INTEGER NOT NULL DEFAULT 1, -- 1 = can NEVER be removed
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Voice DNA (Encrypted spectral fingerprints) ─────────────────────────
CREATE TABLE IF NOT EXISTS voice_dna (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
  fingerprint_hash TEXT NOT NULL, -- SHA-256 of spectral data
  r2_key TEXT, -- Pointer to R2 Voice Vault object
  sample_rate INTEGER DEFAULT 44100,
  bit_depth INTEGER DEFAULT 24,
  duration_ms INTEGER,
  c2pa_manifest TEXT, -- Content Credentials JSON
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT -- NULL = permanent
);

-- ── Descendants (Synthetic voice models derived from actors) ─────────────
CREATE TABLE IF NOT EXISTS descendants (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
  model_name TEXT NOT NULL,
  model_version TEXT DEFAULT '1.0.0',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked', 'training')),
  training_consent_token TEXT REFERENCES consent_tokens(id),
  spectral_drift REAL DEFAULT 0.0, -- How far from original voice
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  revoked_at TEXT
);

-- ── Consent Tokens (Explicit, enforceable permissions) ──────────────────
CREATE TABLE IF NOT EXISTS consent_tokens (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
  descendant_id TEXT REFERENCES descendants(id),
  licensee_id TEXT REFERENCES licensees(id),
  scope TEXT NOT NULL CHECK (scope IN (
    'synthesis', 'training', 'commercial', 'research',
    'broadcast', 'streaming', 'archive', 'estate'
  )),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired', 'pending')),
  granted_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT,
  revoked_at TEXT,
  revoked_by TEXT, -- RSP_001 kill switch or actor self-revoke
  revocation_reason TEXT,
  never_clause_check INTEGER NOT NULL DEFAULT 1, -- 1 = passed all checks
  metadata TEXT -- JSON: conditions, geographic restrictions, etc.
);

-- ── Licensees (Organizations licensed to use voice assets) ──────────────
CREATE TABLE IF NOT EXISTS licensees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_email TEXT,
  organization TEXT,
  tier TEXT DEFAULT 'standard' CHECK (tier IN ('standard', 'enterprise', 'research', 'educational')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  metadata TEXT
);

-- ── Licenses (Commercial agreements) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS licenses (
  id TEXT PRIMARY KEY,
  licensee_id TEXT NOT NULL REFERENCES licensees(id),
  actor_id TEXT NOT NULL REFERENCES actors(id),
  descendant_id TEXT REFERENCES descendants(id),
  license_type TEXT NOT NULL CHECK (license_type IN (
    'exclusive', 'non_exclusive', 'limited', 'research', 'educational'
  )),
  royalty_rate INTEGER NOT NULL DEFAULT 75 CHECK (royalty_rate >= 75),
  territory TEXT DEFAULT 'worldwide',
  start_date TEXT NOT NULL DEFAULT (datetime('now')),
  end_date TEXT,
  auto_renew INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated')),
  metadata TEXT
);

-- ── Synth Requests (Every synthesis attempt — auditable) ────────────────
CREATE TABLE IF NOT EXISTS synth_requests (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL REFERENCES actors(id),
  descendant_id TEXT REFERENCES descendants(id),
  consent_token_id TEXT NOT NULL REFERENCES consent_tokens(id),
  licensee_id TEXT REFERENCES licensees(id),
  request_type TEXT NOT NULL CHECK (request_type IN ('tts', 'voice_clone', 'style_transfer', 'enhancement')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'completed', 'failed')),
  never_clause_passed INTEGER NOT NULL DEFAULT 0,
  input_text TEXT,
  output_r2_key TEXT, -- Pointer to R2 output
  duration_ms INTEGER,
  c2pa_signed INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  denial_reason TEXT
);

-- ── Ledger (Append-only financial record — NEVER UPDATE/DELETE) ─────────
CREATE TABLE IF NOT EXISTS noizy_ledger (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'synthesis_fee', 'license_payment', 'royalty_distribution',
    'platform_fee', 'refund', 'adjustment', 'dreamchamber_usage'
  )),
  actor_id TEXT REFERENCES actors(id),
  licensee_id TEXT REFERENCES licensees(id),
  synth_request_id TEXT REFERENCES synth_requests(id),
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CAD',
  royalty_split_actor INTEGER, -- Percentage to actor (75+)
  royalty_split_platform INTEGER, -- Percentage to platform (25-)
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  -- IMMUTABLE: No updated_at column. Ledger is append-only.
  idempotency_key TEXT UNIQUE -- Prevents double-posting
);

-- ── Rate Table (Pricing per synthesis type) ─────────────────────────────
CREATE TABLE IF NOT EXISTS rate_table (
  id TEXT PRIMARY KEY,
  synthesis_type TEXT NOT NULL UNIQUE,
  base_rate_cents INTEGER NOT NULL,
  per_second_cents INTEGER DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'CAD',
  effective_from TEXT NOT NULL DEFAULT (datetime('now')),
  effective_until TEXT,
  metadata TEXT
);

-- ── Estates (Posthumous voice rights management) ────────────────────────
CREATE TABLE IF NOT EXISTS estates (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
  executor_actor_id TEXT REFERENCES actors(id),
  preservation_level TEXT DEFAULT 'standard' CHECK (preservation_level IN ('standard', 'enhanced', 'archival')),
  premis_metadata TEXT, -- OAIS/PREMIS preservation metadata
  oais_package_id TEXT,
  instructions TEXT, -- Actor's wishes for posthumous use
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  activated_at TEXT -- NULL until actor passes
);

-- ── Union Tiers (Artist classification for royalty floors) ──────────────
CREATE TABLE IF NOT EXISTS union_tiers (
  id TEXT PRIMARY KEY,
  tier_name TEXT NOT NULL UNIQUE,
  min_royalty INTEGER NOT NULL CHECK (min_royalty >= 75),
  description TEXT,
  requirements TEXT -- JSON: enrollment criteria
);

-- ── Audit Log (Every system action — append-only) ───────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  actor_id TEXT, -- Who initiated (NULL = system)
  action TEXT NOT NULL,
  details TEXT, -- JSON
  ip_address TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── GORUNFREE Gap Solver Cache (D1 durable truth layer) ─────────────────
CREATE TABLE IF NOT EXISTS gap_solver_entries (
  id TEXT PRIMARY KEY,
  absence_type TEXT NOT NULL CHECK (absence_type IN ('voice', 'consent', 'descendant', 'license', 'estate')),
  entity_id TEXT NOT NULL,
  hypothesis TEXT, -- What the system thinks is missing
  resolution TEXT, -- What was actually needed
  confidence REAL DEFAULT 0.0,
  resolved INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT
);

-- ═══════════════════════════════════════════════════════════════════════════
-- INDEXES — Performance for consent lookups at the edge
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_actors_email ON actors(email);
CREATE INDEX IF NOT EXISTS idx_actors_status ON actors(status);
CREATE INDEX IF NOT EXISTS idx_never_clauses_actor ON never_clauses(actor_id);
CREATE INDEX IF NOT EXISTS idx_voice_dna_actor ON voice_dna(actor_id);
CREATE INDEX IF NOT EXISTS idx_descendants_actor ON descendants(actor_id);
CREATE INDEX IF NOT EXISTS idx_descendants_status ON descendants(status);
CREATE INDEX IF NOT EXISTS idx_consent_tokens_actor ON consent_tokens(actor_id);
CREATE INDEX IF NOT EXISTS idx_consent_tokens_status ON consent_tokens(status);
CREATE INDEX IF NOT EXISTS idx_consent_tokens_licensee ON consent_tokens(licensee_id);
CREATE INDEX IF NOT EXISTS idx_licenses_licensee ON licenses(licensee_id);
CREATE INDEX IF NOT EXISTS idx_licenses_actor ON licenses(actor_id);
CREATE INDEX IF NOT EXISTS idx_synth_requests_actor ON synth_requests(actor_id);
CREATE INDEX IF NOT EXISTS idx_synth_requests_consent ON synth_requests(consent_token_id);
CREATE INDEX IF NOT EXISTS idx_synth_requests_status ON synth_requests(status);
CREATE INDEX IF NOT EXISTS idx_ledger_actor ON noizy_ledger(actor_id);
CREATE INDEX IF NOT EXISTS idx_ledger_event ON noizy_ledger(event_type);
CREATE INDEX IF NOT EXISTS idx_ledger_created ON noizy_ledger(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_gap_solver_type ON gap_solver_entries(absence_type);

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA — Founding Actor + Default Tiers
-- ═══════════════════════════════════════════════════════════════════════════

-- RSP_001 — Founding Actor
INSERT OR IGNORE INTO actors (id, name, email, role, royalty_floor, union_tier, country)
VALUES ('RSP_001', 'Robert Stephen Plowman', 'rsp@noizy.ai', 'founding_actor', 85, 'founding', 'CA');

-- Default Never Clauses for RSP_001
INSERT OR IGNORE INTO never_clauses (id, actor_id, clause_type, description)
VALUES 
  ('NC_001', 'RSP_001', 'no_hate_speech', 'Voice shall never be used to promote hatred or discrimination'),
  ('NC_002', 'RSP_001', 'no_deepfake', 'Voice shall never be used for unauthorized impersonation'),
  ('NC_003', 'RSP_001', 'no_military', 'Voice shall never be used for military or weapons applications'),
  ('NC_004', 'RSP_001', 'no_surveillance', 'Voice shall never be used for mass surveillance');

-- Union Tiers
INSERT OR IGNORE INTO union_tiers (id, tier_name, min_royalty, description)
VALUES 
  ('UT_INDIE', 'indie', 75, 'Independent artist — standard 75/25 split'),
  ('UT_GUILD', 'guild', 78, 'Guild member — collective bargaining rate'),
  ('UT_MASTER', 'master', 82, 'Master artist — premium rate for established voices'),
  ('UT_FOUNDING', 'founding', 85, 'Founding actor — highest protection tier');

-- Default Rate Table
INSERT OR IGNORE INTO rate_table (id, synthesis_type, base_rate_cents, per_second_cents)
VALUES
  ('RT_TTS', 'tts', 50, 5),
  ('RT_CLONE', 'voice_clone', 500, 25),
  ('RT_STYLE', 'style_transfer', 200, 10),
  ('RT_ENHANCE', 'enhancement', 100, 8);
