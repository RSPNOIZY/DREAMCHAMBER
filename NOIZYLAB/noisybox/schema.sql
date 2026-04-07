-- ============================================================
-- NOISY BOX (A.I.V.A.) — V0.1 Schema
-- Consent-native digital voice talent agency
-- Sacred Invariants: 75/25 split, 1% GORUNFREE, kill switch absolute
-- ============================================================

-- 1. CREATORS — The guild members
CREATE TABLE IF NOT EXISTS creators (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  legal_name TEXT,
  archetype TEXT NOT NULL,          -- 'vocalist', 'narrator', 'character_actor', 'singer', 'voice_over'
  bio TEXT,
  contact_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending', 'active', 'suspended', 'estate'
  onboarded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_creators_status ON creators(status);
CREATE INDEX IF NOT EXISTS idx_creators_archetype ON creators(archetype);

-- 2. CONSENT PROFILES — The vault. Consent is architecture, not a checkbox.
CREATE TABLE IF NOT EXISTS consent_profiles (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES creators(id),
  consent_hash TEXT NOT NULL,           -- SHA-256 of full consent document
  never_clauses_hash TEXT NOT NULL,     -- SHA-256 of never-clause set
  never_clauses_json TEXT NOT NULL,     -- JSON array of explicit prohibitions
  token_id TEXT NOT NULL UNIQUE,        -- JWT/HSM-signed consent token reference
  terms_version TEXT NOT NULL DEFAULT '1.0',
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'revoked', 'expired'
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  revoked_at TIMESTAMP,
  revocation_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_consent_creator ON consent_profiles(creator_id);
CREATE INDEX IF NOT EXISTS idx_consent_status ON consent_profiles(status);
-- SACRED: No UPDATE or DELETE on consent_profiles after creation. Revocation creates new record.

-- 3. VOICE ASSETS — Captured, analyzed, provenance-bound
CREATE TABLE IF NOT EXISTS voice_assets (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES creators(id),
  consent_profile_id TEXT NOT NULL REFERENCES consent_profiles(id),
  capture_ref TEXT NOT NULL,            -- Storage path/URL for lossless capture
  sample_rate INTEGER NOT NULL,         -- e.g., 48000
  bit_depth INTEGER NOT NULL,           -- e.g., 24
  channels INTEGER NOT NULL DEFAULT 1,
  duration_ms INTEGER NOT NULL,
  format TEXT NOT NULL DEFAULT 'wav',   -- 'wav', 'flac'
  provenance_manifest_ref TEXT,         -- C2PA manifest reference from noisyproof
  fingerprint_id TEXT,                  -- Audio fingerprint from noisyproof
  quality_gate_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'passed', 'failed', 'review'
  quality_gate_notes TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'archived', 'revoked'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_voice_assets_creator ON voice_assets(creator_id);
CREATE INDEX IF NOT EXISTS idx_voice_assets_consent ON voice_assets(consent_profile_id);
CREATE INDEX IF NOT EXISTS idx_voice_assets_quality ON voice_assets(quality_gate_status);

-- 4. SESSIONS — Recording/creation sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES creators(id),
  session_type TEXT NOT NULL,           -- 'capture', 'character', 'review', 'calibration'
  director_notes TEXT,                  -- What the session aimed to achieve
  start_ts TIMESTAMP NOT NULL,
  end_ts TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'abandoned'
  notes_ref TEXT,                       -- External notes reference
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sessions_creator ON sessions(creator_id);
CREATE INDEX IF NOT EXISTS idx_sessions_type ON sessions(session_type);

-- 5. TAKES — Individual recordings within a session
CREATE TABLE IF NOT EXISTS takes (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  take_no INTEGER NOT NULL,
  voice_asset_id TEXT REFERENCES voice_assets(id),
  blessed INTEGER NOT NULL DEFAULT 0,   -- 1 = approved take, 0 = unused
  deviation_flags TEXT,                 -- JSON array of detected deviations
  manifest_ref TEXT,                    -- C2PA manifest for this take
  duration_ms INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_takes_session ON takes(session_id);
CREATE INDEX IF NOT EXISTS idx_takes_blessed ON takes(blessed);

-- 6. CHARACTERS — Variants/personas derived from a creator's voice
CREATE TABLE IF NOT EXISTS characters (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES creators(id),
  source_session_id TEXT REFERENCES sessions(id),
  character_name TEXT NOT NULL,
  variant_label TEXT NOT NULL,          -- 'warm', 'authoritative', 'playful', 'aged', etc.
  description TEXT,
  voice_parameters TEXT,                -- JSON: pitch_shift, speed, emotion_profile, etc.
  consent_profile_id TEXT NOT NULL REFERENCES consent_profiles(id),
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'retired', 'revoked'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_characters_creator ON characters(creator_id);
CREATE INDEX IF NOT EXISTS idx_characters_status ON characters(status);

-- 7. AUTH SCORES — Authenticity/quality scoring for takes
CREATE TABLE IF NOT EXISTS auth_scores (
  id TEXT PRIMARY KEY,
  take_id TEXT NOT NULL REFERENCES takes(id),
  scorer_model TEXT NOT NULL,           -- 'gemma4', 'resemblyzer', 'manual'
  similarity_score REAL NOT NULL,       -- 0.0-1.0
  naturalness_score REAL NOT NULL,      -- 0.0-1.0
  intelligibility_score REAL,           -- 0.0-1.0
  overall_score REAL NOT NULL,          -- Weighted composite
  notes TEXT,
  scored_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_auth_scores_take ON auth_scores(take_id);
CREATE INDEX IF NOT EXISTS idx_auth_scores_overall ON auth_scores(overall_score);

-- 8. USAGE RECEIPTS — Every use of a voice asset is logged
CREATE TABLE IF NOT EXISTS usage_receipts (
  id TEXT PRIMARY KEY,
  voice_asset_id TEXT REFERENCES voice_assets(id),
  character_id TEXT REFERENCES characters(id),
  project_id TEXT,                      -- External project reference
  project_name TEXT,
  requester_id TEXT NOT NULL,
  usage_type TEXT NOT NULL,             -- 'synthesis', 'license', 'sample', 'derivative', 'teaching'
  start_ts TIMESTAMP NOT NULL,
  end_ts TIMESTAMP,
  duration_ms INTEGER,
  text_content_hash TEXT,               -- SHA-256 of synthesized text (privacy)
  consent_hash TEXT NOT NULL,           -- Proving consent was valid at time of use
  gross_amount REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'disputed', 'refunded'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_receipts_creator ON usage_receipts(voice_asset_id);
CREATE INDEX IF NOT EXISTS idx_receipts_requester ON usage_receipts(requester_id);
CREATE INDEX IF NOT EXISTS idx_receipts_type ON usage_receipts(usage_type);
CREATE INDEX IF NOT EXISTS idx_receipts_created ON usage_receipts(created_at);

-- 9. ROYALTY SPLITS — The spine. 75/25 is sacred. GORUNFREE 1% is irremovable.
CREATE TABLE IF NOT EXISTS royalty_splits (
  id TEXT PRIMARY KEY,
  receipt_id TEXT NOT NULL REFERENCES usage_receipts(id),
  payee_id TEXT NOT NULL,               -- Creator ID or 'PLATFORM' or 'NOIZYKIDZ'
  payee_type TEXT NOT NULL,             -- 'creator', 'platform', 'gorunfree', 'collaborator'
  basis_points INTEGER NOT NULL,        -- 7500 = 75%, 100 = 1%
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  routing TEXT,                         -- Payment routing info (encrypted ref)
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processed', 'failed'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_splits_receipt ON royalty_splits(receipt_id);
CREATE INDEX IF NOT EXISTS idx_splits_payee ON royalty_splits(payee_id);

-- 10. LUCY OBSERVATIONS — Agent intelligence layer
CREATE TABLE IF NOT EXISTS lucy_observations (
  id TEXT PRIMARY KEY,
  observation_type TEXT NOT NULL,       -- 'trend', 'opportunity', 'risk', 'recommendation', 'pattern'
  subject_type TEXT NOT NULL,           -- 'creator', 'character', 'market', 'catalog'
  subject_id TEXT,
  observation TEXT NOT NULL,            -- Natural language observation
  confidence REAL NOT NULL DEFAULT 0.5, -- 0.0-1.0
  data_points TEXT,                     -- JSON supporting evidence
  acted_on INTEGER NOT NULL DEFAULT 0,  -- Has creator/admin seen this?
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_lucy_type ON lucy_observations(observation_type);
CREATE INDEX IF NOT EXISTS idx_lucy_subject ON lucy_observations(subject_type, subject_id);

-- 11. AUDIT LOG — Immutable. Append-only. Hash-chained. No UPDATE. No DELETE. Ever.
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,             -- 'consent.grant', 'voice.capture', 'synthesis.request', etc.
  actor_id TEXT NOT NULL,
  actor_type TEXT NOT NULL,             -- 'creator', 'system', 'admin', 'lucy', 'requester'
  resource_type TEXT NOT NULL,          -- 'creator', 'consent', 'voice_asset', 'character', 'receipt'
  resource_id TEXT NOT NULL,
  action TEXT NOT NULL,                 -- 'create', 'read', 'revoke', 'score', 'split'
  metadata TEXT,                        -- JSON context
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  block_hash TEXT NOT NULL,             -- SHA-256(id + event_type + actor_id + resource_id + action + previous_hash)
  previous_hash TEXT NOT NULL DEFAULT 'GENESIS'
);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_event ON audit_log(event_type);
