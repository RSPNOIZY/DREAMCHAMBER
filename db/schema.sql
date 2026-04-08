-- HEAVEN / GABRIEL_DB Schema
-- HVS Consent Kernel Tables

CREATE TABLE IF NOT EXISTS hvs_actors (
  actor_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  legal_name TEXT,
  email TEXT,
  country TEXT DEFAULT 'CA',
  is_founding INTEGER DEFAULT 0,
  union_member INTEGER DEFAULT 0,
  union_name TEXT,
  status TEXT DEFAULT 'active',
  onboarded_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS hvs_never_clauses (
  clause_id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_id TEXT NOT NULL,
  clause_code TEXT NOT NULL,
  clause_text TEXT,
  category TEXT NOT NULL,
  is_global INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (actor_id) REFERENCES hvs_actors(actor_id)
);

CREATE TABLE IF NOT EXISTS hvs_descendants (
  descendant_id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL,
  parent_dna_id TEXT NOT NULL,
  name TEXT NOT NULL,
  character_type TEXT,
  emotional_tags TEXT DEFAULT '[]',
  consent_scope TEXT DEFAULT 'private',
  licensing_enabled INTEGER DEFAULT 0,
  approval_required INTEGER DEFAULT 1,
  synthesis_model TEXT,
  royalty_floor_pct REAL DEFAULT 75.0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (actor_id) REFERENCES hvs_actors(actor_id)
);

CREATE TABLE IF NOT EXISTS hvs_consent_tokens (
  token_id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL,
  descendant_id TEXT,
  token_hash TEXT NOT NULL,
  use_categories TEXT DEFAULT '[]',
  territories TEXT DEFAULT '["GLOBAL"]',
  languages TEXT DEFAULT '["*"]',
  time_window_start TEXT,
  time_window_end TEXT,
  licensee_id TEXT,
  expires_at TEXT,
  status TEXT DEFAULT 'active',
  revoked_at TEXT,
  revocation_reason TEXT,
  issued_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (actor_id) REFERENCES hvs_actors(actor_id)
);

CREATE TABLE IF NOT EXISTS hvs_synth_requests (
  request_id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL,
  descendant_id TEXT NOT NULL,
  consent_token_id TEXT NOT NULL,
  licensee_id TEXT,
  script_hash TEXT,
  use_category TEXT NOT NULL,
  emotional_profile TEXT,
  never_clause_check TEXT DEFAULT 'pending',
  blocked_clause_id INTEGER,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (actor_id) REFERENCES hvs_actors(actor_id)
);

CREATE TABLE IF NOT EXISTS hvs_licenses (
  license_id TEXT PRIMARY KEY,
  licensee_id TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  descendant_id TEXT NOT NULL,
  consent_token_id TEXT NOT NULL,
  use_category TEXT NOT NULL,
  territory TEXT DEFAULT 'GLOBAL',
  duration_type TEXT DEFAULT 'perpetual',
  license_fee_cad REAL DEFAULT 0,
  actor_share_pct REAL DEFAULT 75.0,
  noizy_share_pct REAL DEFAULT 25.0,
  status TEXT DEFAULT 'active',
  issued_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (actor_id) REFERENCES hvs_actors(actor_id)
);

CREATE TABLE IF NOT EXISTS noizy_ledger (
  event_id TEXT PRIMARY KEY,
  actor_id TEXT,
  descendant_id TEXT,
  licensee_id TEXT,
  license_id TEXT,
  consent_token_id TEXT,
  event_type TEXT NOT NULL,
  payload_json TEXT DEFAULT '{}',
  amount_cad REAL DEFAULT 0,
  actor_share_cad REAL DEFAULT 0,
  noizy_share_cad REAL DEFAULT 0,
  union_share_cad REAL DEFAULT 0,
  source_system TEXT DEFAULT 'GABRIEL',
  recorded_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS hvs_rate_table (
  rate_id INTEGER PRIMARY KEY AUTOINCREMENT,
  use_category TEXT NOT NULL,
  base_fee_cad REAL DEFAULT 0,
  per_minute_cad REAL DEFAULT 0,
  description TEXT
);

CREATE TABLE IF NOT EXISTS hvs_voice_dna (
  dna_id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  recording_date TEXT,
  duration_sec REAL,
  file_hash TEXT,
  storage_uri TEXT,
  synthesis_model TEXT,
  sample_count INTEGER DEFAULT 0,
  quality_score REAL,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (actor_id) REFERENCES hvs_actors(actor_id)
);

CREATE TABLE IF NOT EXISTS hvs_licensees (
  licensee_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  legal_name TEXT,
  email TEXT,
  country TEXT DEFAULT 'CA',
  organization_type TEXT DEFAULT 'individual',
  status TEXT DEFAULT 'active',
  onboarded_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS hvs_union_tiers (
  tier_id INTEGER PRIMARY KEY AUTOINCREMENT,
  tier_name TEXT NOT NULL UNIQUE,
  min_earnings_cad REAL DEFAULT 0,
  max_earnings_cad REAL,
  contribution_pct REAL NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS hvs_estates (
  estate_id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL UNIQUE,
  trustee_name TEXT,
  trustee_email TEXT,
  preservation_standard TEXT DEFAULT 'OAIS/PREMIS',
  retention_years INTEGER DEFAULT 100,
  archive_uri TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (actor_id) REFERENCES hvs_actors(actor_id)
);

CREATE TABLE IF NOT EXISTS hvs_premis_events (
  premis_id TEXT PRIMARY KEY,
  actor_id TEXT,
  object_identifier TEXT,
  event_type TEXT NOT NULL,
  event_datetime TEXT DEFAULT (datetime('now')),
  event_detail TEXT,
  agent_name TEXT DEFAULT 'HEAVEN',
  agent_type TEXT DEFAULT 'software',
  outcome TEXT DEFAULT 'success',
  outcome_detail TEXT
);

-- KPI Views
CREATE VIEW IF NOT EXISTS kpi_trust AS
SELECT
  (SELECT COUNT(*) FROM hvs_consent_tokens WHERE status = 'active') AS active_tokens,
  (SELECT COUNT(*) FROM hvs_consent_tokens WHERE status = 'revoked') AS revoked_tokens,
  (SELECT COUNT(*) FROM hvs_actors WHERE status = 'active') AS active_actors,
  (SELECT COUNT(*) FROM hvs_never_clauses) AS never_clauses_total;

CREATE VIEW IF NOT EXISTS kpi_safety AS
SELECT
  (SELECT COUNT(*) FROM hvs_synth_requests WHERE never_clause_check = 'blocked') AS blocked_requests,
  (SELECT COUNT(*) FROM hvs_synth_requests WHERE never_clause_check = 'passed') AS passed_requests,
  (SELECT COUNT(*) FROM hvs_synth_requests) AS total_requests;

CREATE VIEW IF NOT EXISTS kpi_revenue AS
SELECT
  actor_id,
  SUM(amount_cad) AS total_revenue_cad,
  SUM(actor_share_cad) AS total_actor_share_cad,
  SUM(noizy_share_cad) AS total_noizy_share_cad,
  COUNT(*) AS transaction_count
FROM noizy_ledger
WHERE event_type = 'license.issued'
GROUP BY actor_id;

CREATE VIEW IF NOT EXISTS kpi_quality AS
SELECT
  use_category,
  COUNT(*) AS request_count,
  SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved_count,
  SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) AS blocked_count
FROM hvs_synth_requests
GROUP BY use_category;

CREATE VIEW IF NOT EXISTS kpi_risk AS
SELECT
  event_type,
  COUNT(*) AS event_count,
  MAX(recorded_at) AS last_occurrence
FROM noizy_ledger
WHERE event_type IN ('kill_switch.activated', 'never_clause.blocked', 'synth.blocked', 'consent.expired')
GROUP BY event_type;

CREATE VIEW IF NOT EXISTS enterprise_audit AS
SELECT
  event_id,
  actor_id,
  event_type,
  payload_json,
  amount_cad,
  source_system,
  recorded_at
FROM noizy_ledger
ORDER BY recorded_at DESC
LIMIT 500;
