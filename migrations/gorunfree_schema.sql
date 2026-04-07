-- GORUNFREE D1 Schema
-- Required tables for creator-perceived speed, provenance, and absence intelligence
-- Run: npx wrangler d1 execute gabriel_db --remote --file migrations/gorunfree_schema.sql

-- ═══════════════════════════════════════════════════════════════════════════
-- PROVENANCE EXPLANATIONS
-- Stores the "why this worked" and "what you didn't copy" for each result
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS provenance_explanations (
  id TEXT PRIMARY KEY,
  result_id TEXT NOT NULL,
  voice_dna_actor_id TEXT,
  voice_dna_name TEXT,
  voice_dna_consent TEXT,
  voice_dna_royalty TEXT,
  style_model_id TEXT,
  style_model_name TEXT,
  style_model_genre TEXT,
  technique_version TEXT DEFAULT 'v3.2',
  technique_method TEXT DEFAULT 'Consented vocal synthesis',
  what_you_didnt_copy TEXT,  -- JSON array of non-copied items
  consent_chain TEXT,        -- JSON array of consent records
  proof_bundle_id TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (result_id) REFERENCES synthesis_results(id)
);

CREATE INDEX IF NOT EXISTS idx_provenance_result ON provenance_explanations(result_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- GAP RECORDS
-- Detected creative gaps (absence intelligence)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS gap_records (
  id TEXT PRIMARY KEY,
  gap_type TEXT NOT NULL,    -- voice_underrepresentation, era_gap, genre_gap, pioneer_territory
  description TEXT NOT NULL,
  current_coverage TEXT,
  expected_coverage TEXT,
  severity TEXT DEFAULT 'medium',  -- low, medium, high, opportunity
  opportunity TEXT,
  detected_at TEXT DEFAULT (datetime('now')),
  resolved_at TEXT,
  resolution_method TEXT,    -- commission, archive_rescue, synthetic, ignored
  is_active INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_gaps_active ON gap_records(is_active, severity);
CREATE INDEX IF NOT EXISTS idx_gaps_type ON gap_records(gap_type);

-- ═══════════════════════════════════════════════════════════════════════════
-- GAP SOLUTIONS
-- Proposed solutions for detected gaps
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS gap_solutions (
  id TEXT PRIMARY KEY,
  gap_id TEXT NOT NULL,
  solution_type TEXT NOT NULL,  -- alternative, archive_rescue, commission, synthetic
  title TEXT NOT NULL,
  description TEXT,
  confidence TEXT DEFAULT 'medium',  -- low, medium, high
  action TEXT,
  resource_id TEXT,          -- Reference to voice, archive, etc.
  priority INTEGER DEFAULT 50,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (gap_id) REFERENCES gap_records(id)
);

CREATE INDEX IF NOT EXISTS idx_solutions_gap ON gap_solutions(gap_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- RESURRECTION PRIORITIES
-- Archive materials available for resurrection
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS resurrection_priorities (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT,
  year INTEGER,
  category TEXT,             -- vocal, instrumental, session, outtake
  description TEXT,
  match_potential INTEGER DEFAULT 50,  -- 0-100
  consent_status TEXT DEFAULT 'unknown',  -- available, pending, unavailable, unknown
  consent_available INTEGER DEFAULT 0,
  rights_holder TEXT,
  contact_available INTEGER DEFAULT 0,
  contact_info TEXT,
  gaps_addressed TEXT,       -- JSON array of gap IDs this could solve
  resurrection_cost TEXT,
  priority_score INTEGER DEFAULT 50,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_resurrection_consent ON resurrection_priorities(consent_available, priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_resurrection_match ON resurrection_priorities(match_potential DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- CREATOR SPEED EVENTS
-- Telemetry for creator-perceived speed optimization
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS creator_speed_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,  -- preflight_start, preflight_complete, generation_start, result_delivered
  user_id TEXT,
  session_id TEXT,
  intent TEXT,
  duration_ms INTEGER,
  existing_count INTEGER,
  missing_count INTEGER,
  recommendations_count INTEGER,
  consent_clear INTEGER,     -- 1 = all paths consented, 0 = issues
  action_taken TEXT,         -- generate, refine, commission, abandon
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_speed_events_type ON creator_speed_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_speed_events_user ON creator_speed_events(user_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- COMMISSION REQUESTS
-- Creator-initiated commissions for detected gaps
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS commission_requests (
  id TEXT PRIMARY KEY,
  gap_id TEXT,
  description TEXT NOT NULL,
  budget_range TEXT,
  timeline TEXT,
  contact_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',  -- pending, reviewing, approved, in_progress, completed, declined
  assigned_to TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_commissions_status ON commission_requests(status, created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- ARCHIVE CANDIDATES
-- Discovered archive materials that could be resurrected
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS archive_candidates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT,
  year INTEGER,
  category TEXT,
  description TEXT,
  source TEXT,               -- Where discovered (label archive, estate, etc.)
  match_description TEXT,
  match_potential INTEGER DEFAULT 50,
  consent_status TEXT DEFAULT 'unknown',
  consent_available INTEGER DEFAULT 0,
  rights_holder TEXT,
  contact_available INTEGER DEFAULT 0,
  estimated_value TEXT,
  discovered_at TEXT DEFAULT (datetime('now')),
  last_checked TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_archive_consent ON archive_candidates(consent_available);
CREATE INDEX IF NOT EXISTS idx_archive_match ON archive_candidates(match_potential DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- SYNTHESIS RESULTS (if not exists)
-- Reference table for provenance
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS synthesis_results (
  id TEXT PRIMARY KEY,
  title TEXT,
  user_id TEXT,
  actor_id TEXT,
  style_model_id TEXT,
  technique_version TEXT,
  input_prompt TEXT,
  consent_token_id TEXT,
  output_path TEXT,
  duration_seconds REAL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_synthesis_user ON synthesis_results(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_synthesis_actor ON synthesis_results(actor_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- STYLE MODELS (if not exists)
-- Reference table for preflight and provenance
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS style_models (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  genre TEXT,
  era_range TEXT,
  description TEXT,
  samples_count INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_style_active ON style_models(is_active);
CREATE INDEX IF NOT EXISTS idx_style_genre ON style_models(genre);

-- ═══════════════════════════════════════════════════════════════════════════
-- GORUNFREE FLAGS VIEW
-- Consolidated view for launch state
-- ═══════════════════════════════════════════════════════════════════════════

CREATE VIEW IF NOT EXISTS gorunfree_status AS
SELECT
  (SELECT COUNT(*) FROM gap_records WHERE is_active = 1) as active_gaps,
  (SELECT COUNT(*) FROM resurrection_priorities WHERE consent_available = 1) as resurrection_ready,
  (SELECT COUNT(*) FROM commission_requests WHERE status = 'pending') as pending_commissions,
  (SELECT COUNT(*) FROM provenance_explanations) as total_provenances,
  (SELECT AVG(duration_ms) FROM creator_speed_events WHERE event_type = 'preflight_complete' AND created_at > datetime('now', '-1 hour')) as avg_preflight_ms;

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA
-- Initial gaps and archive candidates for testing
-- ═══════════════════════════════════════════════════════════════════════════

INSERT OR IGNORE INTO gap_records (id, gap_type, description, current_coverage, severity, opportunity)
VALUES
  ('gap-001', 'pioneer_territory', 'Breathy alto + trap hi-hats + gospel harmony', 'No existing combinations', 'opportunity', 'Pioneer territory - commission original'),
  ('gap-002', 'era_gap', '1970s era has limited coverage', '2 dedicated artists', 'medium', 'Archive resurrection from label vaults'),
  ('gap-003', 'genre_gap', 'Afrobeat genre has no style models', '0 models', 'high', 'Build style model from consented sources');

INSERT OR IGNORE INTO archive_candidates (id, title, artist, year, description, match_potential, consent_available)
VALUES
  ('arch-001', '1997 Elektra Sessions', 'Unreleased alto vocals', 1997, 'Studio outtakes with breathy alto character', 89, 1),
  ('arch-002', '2003 Gospel choir outtakes', 'Various artists', 2003, 'Harmony vocals from gospel recording sessions', 76, 0);

-- Done
SELECT 'GORUNFREE schema created successfully' as status;
