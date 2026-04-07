-- HEAVEN HVS Schema — NOIZY Empire Consent Kernel
-- Author: RSP_001 / Claude Code
-- Applied to: agent-memory (D1)
-- Version: 17.0.0 — March 2026

-- ── Voice Actors ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hvs_actors (
  actor_id       TEXT PRIMARY KEY,
  display_name   TEXT NOT NULL,
  legal_name     TEXT,
  email          TEXT,
  country        TEXT DEFAULT 'CA',
  is_founding    INTEGER DEFAULT 0,
  union_member   INTEGER DEFAULT 0,
  union_name     TEXT,
  status         TEXT DEFAULT 'active',
  onboarded_at   TEXT DEFAULT (datetime('now'))
);

-- ── Never Clauses (immutable once set) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS hvs_never_clauses (
  clause_id    TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  actor_id     TEXT NOT NULL,
  category     TEXT NOT NULL,
  clause_code  TEXT NOT NULL,
  clause_text  TEXT NOT NULL,
  is_global    INTEGER DEFAULT 1,
  created_at   TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (actor_id) REFERENCES hvs_actors(actor_id)
);

-- ── Consent Tokens ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hvs_consent_tokens (
  token_id          TEXT PRIMARY KEY,
  actor_id          TEXT NOT NULL,
  descendant_id     TEXT,
  token_hash        TEXT,
  use_categories    TEXT NOT NULL DEFAULT '[]',
  territories       TEXT DEFAULT '["GLOBAL"]',
  languages         TEXT DEFAULT '["*"]',
  time_window_start TEXT,
  time_window_end   TEXT,
  licensee_id       TEXT,
  expires_at        TEXT,
  status            TEXT DEFAULT 'active',
  revoked_at        TEXT,
  revocation_reason TEXT,
  issued_at         TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (actor_id) REFERENCES hvs_actors(actor_id)
);

-- ── Voice Descendants (synthetic voice characters) ───────────────────────────
CREATE TABLE IF NOT EXISTS hvs_descendants (
  descendant_id      TEXT PRIMARY KEY,
  actor_id           TEXT NOT NULL,
  parent_dna_id      TEXT NOT NULL,
  name               TEXT NOT NULL,
  character_type     TEXT,
  emotional_tags     TEXT DEFAULT '[]',
  consent_scope      TEXT DEFAULT 'private',
  licensing_enabled  INTEGER DEFAULT 0,
  approval_required  INTEGER DEFAULT 1,
  synthesis_model    TEXT,
  royalty_floor_pct  REAL DEFAULT 75.0,
  created_at         TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (actor_id) REFERENCES hvs_actors(actor_id)
);

-- ── Synthesis Requests (Never Clause enforced) ───────────────────────────────
CREATE TABLE IF NOT EXISTS hvs_synth_requests (
  request_id        TEXT PRIMARY KEY,
  actor_id          TEXT NOT NULL,
  descendant_id     TEXT,
  consent_token_id  TEXT,
  licensee_id       TEXT,
  script_hash       TEXT,
  use_category      TEXT NOT NULL,
  emotional_profile TEXT,
  never_clause_check TEXT DEFAULT 'passed',
  blocked_clause_id TEXT,
  status            TEXT DEFAULT 'pending',
  c2pa_manifest     TEXT,
  created_at        TEXT DEFAULT (datetime('now'))
);

-- ── Voice DNA Records ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hvs_voice_dna (
  dna_id           TEXT PRIMARY KEY,
  actor_id         TEXT NOT NULL,
  version          INTEGER DEFAULT 1,
  recording_date   TEXT DEFAULT (datetime('now')),
  duration_sec     REAL,
  file_hash        TEXT,
  storage_uri      TEXT,
  synthesis_model  TEXT,
  sample_count     INTEGER DEFAULT 0,
  quality_score    REAL,
  notes            TEXT,
  registered_at    TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (actor_id) REFERENCES hvs_actors(actor_id)
);

-- ── Licensees (companies/individuals who license voices) ─────────────────────
CREATE TABLE IF NOT EXISTS hvs_licensees (
  licensee_id       TEXT PRIMARY KEY,
  display_name      TEXT NOT NULL,
  legal_name        TEXT,
  email             TEXT,
  country           TEXT DEFAULT 'CA',
  organization_type TEXT DEFAULT 'individual',
  status            TEXT DEFAULT 'active',
  onboarded_at      TEXT DEFAULT (datetime('now'))
);

-- ── Issued Licenses ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hvs_licenses (
  license_id        TEXT PRIMARY KEY,
  licensee_id       TEXT NOT NULL,
  actor_id          TEXT NOT NULL,
  descendant_id     TEXT,
  consent_token_id  TEXT,
  use_category      TEXT NOT NULL,
  territory         TEXT DEFAULT 'GLOBAL',
  duration_type     TEXT DEFAULT 'perpetual',
  license_fee_cad   REAL DEFAULT 0,
  actor_share_pct   REAL DEFAULT 75.0,
  noizy_share_pct   REAL DEFAULT 25.0,
  status            TEXT DEFAULT 'active',
  issued_at         TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (actor_id) REFERENCES hvs_actors(actor_id),
  FOREIGN KEY (licensee_id) REFERENCES hvs_licensees(licensee_id)
);

-- ── Estates (voice IP estate per actor) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS hvs_estates (
  estate_id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  actor_id           TEXT NOT NULL UNIQUE,
  total_revenue_cad  REAL DEFAULT 0,
  total_licenses     INTEGER DEFAULT 0,
  total_descendants  INTEGER DEFAULT 0,
  is_inheritable     INTEGER DEFAULT 1,
  heir_designee      TEXT,
  estate_notes       TEXT,
  created_at         TEXT DEFAULT (datetime('now')),
  updated_at         TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (actor_id) REFERENCES hvs_actors(actor_id)
);

-- ── Rate Table (use_category → fee schedule) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS hvs_rate_table (
  rate_id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  use_category     TEXT NOT NULL UNIQUE,
  base_fee_cad     REAL NOT NULL DEFAULT 0,
  description      TEXT,
  requires_approval INTEGER DEFAULT 0,
  updated_at       TEXT DEFAULT (datetime('now'))
);

-- ── Union Tiers ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hvs_union_tiers (
  tier_id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  tier_name         TEXT NOT NULL,
  min_earnings_cad  REAL DEFAULT 0,
  max_earnings_cad  REAL,
  royalty_floor_pct REAL DEFAULT 75.0,
  union_name        TEXT,
  description       TEXT
);

-- ── PREMIS Events (digital preservation provenance) ──────────────────────────
CREATE TABLE IF NOT EXISTS hvs_premis_events (
  premis_id       TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  actor_id        TEXT,
  event_type      TEXT NOT NULL,
  event_datetime  TEXT DEFAULT (datetime('now')),
  agent_name      TEXT DEFAULT 'GABRIEL',
  object_id       TEXT,
  outcome         TEXT DEFAULT 'success',
  outcome_detail  TEXT,
  linked_objects  TEXT DEFAULT '[]'
);

-- ── Immutable Event Ledger ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS noizy_ledger (
  event_id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  actor_id          TEXT,
  descendant_id     TEXT,
  licensee_id       TEXT,
  license_id        TEXT,
  consent_token_id  TEXT,
  event_type        TEXT NOT NULL,
  payload_json      TEXT DEFAULT '{}',
  amount_cad        REAL DEFAULT 0,
  actor_share_cad   REAL DEFAULT 0,
  noizy_share_cad   REAL DEFAULT 0,
  union_share_cad   REAL DEFAULT 0,
  source_system     TEXT DEFAULT 'GABRIEL',
  recorded_at       TEXT DEFAULT (datetime('now'))
);

-- ── KPI Views ─────────────────────────────────────────────────────────────────
CREATE VIEW IF NOT EXISTS kpi_trust AS
  SELECT
    (SELECT COUNT(*) FROM hvs_consent_tokens WHERE status = 'active') AS active_tokens,
    (SELECT COUNT(*) FROM hvs_consent_tokens WHERE status = 'revoked') AS revoked_tokens,
    (SELECT COUNT(*) FROM hvs_never_clauses) AS never_clauses_on_file,
    (SELECT COUNT(*) FROM hvs_synth_requests WHERE never_clause_check = 'blocked') AS blocked_synth,
    (SELECT COUNT(*) FROM hvs_synth_requests WHERE status = 'approved') AS approved_synth,
    ROUND(
      CAST((SELECT COUNT(*) FROM hvs_synth_requests WHERE status = 'approved') AS REAL) /
      NULLIF((SELECT COUNT(*) FROM hvs_synth_requests), 0) * 100, 2
    ) AS consent_compliance_pct;

CREATE VIEW IF NOT EXISTS kpi_safety AS
  SELECT
    (SELECT COUNT(*) FROM hvs_synth_requests WHERE never_clause_check = 'blocked') AS blocked_total,
    (SELECT COUNT(*) FROM hvs_synth_requests WHERE status = 'approved') AS approved_total,
    ROUND(
      CAST((SELECT COUNT(*) FROM hvs_synth_requests WHERE never_clause_check = 'blocked') AS REAL) /
      NULLIF((SELECT COUNT(*) FROM hvs_synth_requests), 0) * 100, 2
    ) AS block_rate_pct;

CREATE VIEW IF NOT EXISTS kpi_revenue AS
  SELECT
    COALESCE(SUM(amount_cad), 0) AS total_revenue_cad,
    COALESCE(SUM(actor_share_cad), 0) AS total_actor_earnings_cad,
    COALESCE(SUM(noizy_share_cad), 0) AS total_noizy_share_cad,
    COUNT(*) AS total_transactions
  FROM noizy_ledger
  WHERE event_type = 'license.issued';

-- ── Indexes for performance ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_consent_tokens_actor  ON hvs_consent_tokens(actor_id);
CREATE INDEX IF NOT EXISTS idx_consent_tokens_status ON hvs_consent_tokens(status);
CREATE INDEX IF NOT EXISTS idx_descendants_actor      ON hvs_descendants(actor_id);
CREATE INDEX IF NOT EXISTS idx_synth_actor            ON hvs_synth_requests(actor_id);
CREATE INDEX IF NOT EXISTS idx_synth_status           ON hvs_synth_requests(status);
CREATE INDEX IF NOT EXISTS idx_licenses_actor         ON hvs_licenses(actor_id);
CREATE INDEX IF NOT EXISTS idx_ledger_actor           ON noizy_ledger(actor_id);
CREATE INDEX IF NOT EXISTS idx_ledger_event_type      ON noizy_ledger(event_type);
CREATE INDEX IF NOT EXISTS idx_ledger_recorded        ON noizy_ledger(recorded_at);
CREATE INDEX IF NOT EXISTS idx_voice_dna_actor        ON hvs_voice_dna(actor_id);
CREATE INDEX IF NOT EXISTS idx_never_clauses_actor    ON hvs_never_clauses(actor_id);

-- ── Seed: Rate Table defaults ─────────────────────────────────────────────────
INSERT OR IGNORE INTO hvs_rate_table (use_category, base_fee_cad, description, requires_approval) VALUES
  ('commercial_ad',       500.0,  'Commercial advertising', 1),
  ('podcast',             150.0,  'Podcast narration', 0),
  ('audiobook',           300.0,  'Audiobook narration', 0),
  ('video_game',          750.0,  'Video game character', 1),
  ('film_dub',           1000.0,  'Film dubbing', 1),
  ('explainer_video',     100.0,  'Explainer/corporate video', 0),
  ('social_media',         75.0,  'Social media content', 0),
  ('e_learning',          200.0,  'E-learning module', 0),
  ('voice_assistant',    2000.0,  'Voice assistant persona', 1),
  ('broadcast_tv',       1500.0,  'Broadcast television', 1),
  ('internal_corporate',   50.0,  'Internal corporate use', 0);

-- ── Seed: Union Tiers ─────────────────────────────────────────────────────────
INSERT OR IGNORE INTO hvs_union_tiers (tier_id, tier_name, min_earnings_cad, max_earnings_cad, royalty_floor_pct, description) VALUES
  ('tier-founding', 'Founding Actor',  0,      NULL,    85.0, 'Charter members — 85% floor, perpetual'),
  ('tier-standard', 'Standard Actor',  0,      50000,   75.0, 'Standard creators — 75% floor'),
  ('tier-pro',      'Pro Creator',     50000,  200000,  77.5, 'High-volume creators — 77.5% floor'),
  ('tier-elite',    'Elite Creator',   200000, NULL,    80.0, 'Elite creators — 80% floor');
