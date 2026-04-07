-- GORUNFREE CORE SCHEMA
-- D1 is authoritative truth. No speculative writes allowed.
-- Run: npx wrangler d1 execute gabriel_db --remote --file db/schema/gorunfree_core.sql

-- ═══════════════════════════════════════════════════════════════════════════
-- GAP RECORDS (absence intelligence)
-- Detected creative gaps - only written after S3 + S4 signals confirmed
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS gaps (
  gap_id TEXT PRIMARY KEY,
  query_signature TEXT NOT NULL,
  gap_type TEXT CHECK(gap_type IN (
    'SOFT_GAP',      -- Missing but could be synthesized
    'HARD_GAP',      -- Missing and blocked by consent
    'BLOCKED_GAP',   -- Never Clause blocks this entirely
    'CULTURAL_GAP'   -- Underrepresentation opportunity
  )) NOT NULL,
  confidence REAL CHECK(confidence BETWEEN 0 AND 1),
  detected_version TEXT NOT NULL,
  first_detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  promoted_at DATETIME,
  status TEXT DEFAULT 'ACTIVE'
);

CREATE INDEX IF NOT EXISTS idx_gaps_signature
  ON gaps(query_signature);

CREATE INDEX IF NOT EXISTS idx_gaps_type_status
  ON gaps(gap_type, status);


-- ═══════════════════════════════════════════════════════════════════════════
-- SOLUTION CANDIDATES
-- Proposed solutions for detected gaps - written after S3 + S4 confirmed
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS solutions (
  solution_id TEXT PRIMARY KEY,
  gap_id TEXT NOT NULL,
  solution_type TEXT CHECK(solution_type IN (
    'ARCHIVE_MATCH',       -- Found in archive with consent available
    'ADJACENT_MATCH',      -- Similar consented source exists
    'COMMISSION_SUGGESTED', -- Recommend commissioning original
    'DIFFERENTIATE'         -- This is pioneer territory
  )) NOT NULL,
  rank INTEGER,
  rationale TEXT,
  resource_id TEXT,        -- Reference to voice, archive, etc.
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gap_id) REFERENCES gaps(gap_id)
);

CREATE INDEX IF NOT EXISTS idx_solutions_gap
  ON solutions(gap_id);

CREATE INDEX IF NOT EXISTS idx_solutions_type
  ON solutions(solution_type);


-- ═══════════════════════════════════════════════════════════════════════════
-- PROVENANCE EXPLANATIONS
-- "Why this worked" + "What you didn't copy" - requires S5 + S6
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS provenance_explanations (
  provenance_id TEXT PRIMARY KEY,
  output_id TEXT NOT NULL,
  explanation TEXT NOT NULL,
  excluded_sources TEXT,    -- JSON array of what was NOT copied
  consent_state TEXT CHECK(consent_state IN (
    'CLEARED',   -- All consent verified
    'LIMITED',   -- Some restrictions apply
    'BLOCKED'    -- Consent issue detected
  )) NOT NULL,
  voice_dna_actor_id TEXT,
  voice_dna_name TEXT,
  style_model_id TEXT,
  style_model_name TEXT,
  technique_version TEXT DEFAULT 'v3.2',
  consent_chain TEXT,      -- JSON array of consent records
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_provenance_output
  ON provenance_explanations(output_id);


-- ═══════════════════════════════════════════════════════════════════════════
-- ARCHIVE RESURRECTION PRIORITIES
-- Materials available for resurrection - requires S3 + S4 + APPROVAL
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS resurrection_priorities (
  archive_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT,
  year INTEGER,
  category TEXT,             -- vocal, instrumental, session, outtake
  reason TEXT NOT NULL,      -- Why this should be resurrected
  signal_strength REAL,      -- How strongly this matches gaps
  gaps_addressed TEXT,       -- JSON array of gap IDs this solves
  consent_status TEXT DEFAULT 'unknown',
  rights_holder TEXT,
  contact_available INTEGER DEFAULT 0,
  approved INTEGER DEFAULT 0,
  approved_by TEXT,
  approved_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resurrection_approved
  ON resurrection_priorities(approved, signal_strength DESC);


-- ═══════════════════════════════════════════════════════════════════════════
-- CREATOR SPEED EVENTS
-- Telemetry for creator-perceived speed - requires S3 + S4
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS creator_speed_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,   -- preflight_start, preflight_complete, generation_start, result_delivered
  user_id TEXT,
  session_id TEXT,
  intent TEXT,
  duration_ms INTEGER,
  existing_count INTEGER,
  missing_count INTEGER,
  recommendations_count INTEGER,
  consent_clear INTEGER,      -- 1 = all paths consented, 0 = issues
  action_taken TEXT,          -- generate, refine, commission, abandon
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_speed_events_type
  ON creator_speed_events(event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_speed_events_user
  ON creator_speed_events(user_id, created_at DESC);


-- ═══════════════════════════════════════════════════════════════════════════
-- COMMISSION REQUESTS
-- User-initiated commissions - always allowed (append-only)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS commission_requests (
  commission_id TEXT PRIMARY KEY,
  gap_id TEXT,
  description TEXT NOT NULL,
  budget_range TEXT,
  timeline TEXT,
  contact_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',  -- pending, reviewing, approved, in_progress, completed, declined
  assigned_to TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_commissions_status
  ON commission_requests(status, created_at DESC);


-- ═══════════════════════════════════════════════════════════════════════════
-- AUDIT EVENTS (append-only)
-- All significant system events - always allowed
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS audit_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  actor TEXT,                 -- Who/what caused this event
  details TEXT,               -- JSON payload
  source_system TEXT DEFAULT 'GORUNFREE',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_type_time
  ON audit_events(event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_actor
  ON audit_events(actor);


-- ═══════════════════════════════════════════════════════════════════════════
-- GORUNFREE STATUS VIEW
-- Consolidated view for dashboard and monitoring
-- ═══════════════════════════════════════════════════════════════════════════
CREATE VIEW IF NOT EXISTS gorunfree_status AS
SELECT
  (SELECT COUNT(*) FROM gaps WHERE status = 'ACTIVE') as active_gaps,
  (SELECT COUNT(*) FROM solutions) as total_solutions,
  (SELECT COUNT(*) FROM resurrection_priorities WHERE approved = 1) as resurrection_ready,
  (SELECT COUNT(*) FROM commission_requests WHERE status = 'pending') as pending_commissions,
  (SELECT COUNT(*) FROM provenance_explanations) as total_provenances,
  (SELECT AVG(duration_ms) FROM creator_speed_events
   WHERE event_type = 'preflight_complete'
   AND created_at > datetime('now', '-1 hour')) as avg_preflight_ms;


-- ═══════════════════════════════════════════════════════════════════════════
-- DONE
-- ═══════════════════════════════════════════════════════════════════════════
SELECT 'GORUNFREE core schema created successfully' as status;
