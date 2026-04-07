-- ============================================================
-- NOISY FISH — V0.1 Schema
-- Living Legacy Vault + Creative Services Hub
-- The 40-year Aquarian catalog: alive, searchable, licensable, teachable
-- Sacred Invariants: 75/25 split, 1% GORUNFREE, attribution locked
-- ============================================================

-- 1. CATALOG TITLES — The master index. Every composition is a living asset.
CREATE TABLE IF NOT EXISTS catalog_titles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  project TEXT,                         -- 'Ed Edd n Eddy', 'Dragon Tales', 'Johnny Test', etc.
  composer TEXT NOT NULL DEFAULT 'Robert Stephen Plowman',
  year INTEGER,
  era_tag TEXT,                         -- '80s', '90s', '2000s', '2010s', '2020s'
  duration_ms INTEGER,
  bpm REAL,
  musical_key TEXT,                     -- 'C minor', 'G major', etc.
  scale TEXT,                           -- 'minor', 'major', 'pentatonic', 'chromatic', etc.
  time_signature TEXT DEFAULT '4/4',
  mood_tags TEXT,                       -- JSON array: ['determined', 'vulnerable', 'hopeful']
  emotional_arc TEXT,                   -- 'building', 'resolving', 'tension', 'release', 'static'
  instrumentation TEXT,                 -- JSON array: ['oboe', 'strings', 'piano', 'synth']
  genre_tags TEXT,                      -- JSON array: ['orchestral', 'electronic', 'hybrid']
  technical_difficulty TEXT,            -- 'beginner', 'intermediate', 'advanced', 'virtuoso'
  rights_status TEXT NOT NULL DEFAULT 'owned', -- 'owned', 'co-owned', 'licensed', 'disputed'
  clearance_status TEXT NOT NULL DEFAULT 'cleared', -- 'cleared', 'pending', 'restricted'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'archived', 'restricted'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_catalog_project ON catalog_titles(project);
CREATE INDEX IF NOT EXISTS idx_catalog_year ON catalog_titles(year);
CREATE INDEX IF NOT EXISTS idx_catalog_era ON catalog_titles(era_tag);
CREATE INDEX IF NOT EXISTS idx_catalog_composer ON catalog_titles(composer);
CREATE INDEX IF NOT EXISTS idx_catalog_status ON catalog_titles(status);

-- 2. CATALOG ASSETS — Physical file references (THE AQUARIUM)
CREATE TABLE IF NOT EXISTS catalog_assets (
  id TEXT PRIMARY KEY,
  title_id TEXT NOT NULL REFERENCES catalog_titles(id),
  asset_type TEXT NOT NULL,             -- 'master', 'stem', 'mix', 'sketch', 'alternate', 'demo'
  file_ref TEXT NOT NULL,               -- Path in THE AQUARIUM (e.g., /Volumes/4TB Lacie/LIBRARY/...)
  stems_ref TEXT,                       -- Path to stems folder if available
  format TEXT NOT NULL,                 -- 'wav', 'flac', 'mp3', 'aif', 'm4a'
  sample_rate INTEGER,
  bit_depth INTEGER,
  file_size_bytes INTEGER,
  checksum TEXT,                        -- SHA-256 for integrity verification
  status TEXT NOT NULL DEFAULT 'available', -- 'available', 'missing', 'damaged', 'restored'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_assets_title ON catalog_assets(title_id);
CREATE INDEX IF NOT EXISTS idx_assets_type ON catalog_assets(asset_type);

-- 3. PRODUCTION NOTES — The wisdom layer. WHY decisions were made.
CREATE TABLE IF NOT EXISTS production_notes (
  id TEXT PRIMARY KEY,
  title_id TEXT NOT NULL REFERENCES catalog_titles(id),
  note_type TEXT NOT NULL,              -- 'creative_choice', 'technical', 'story', 'lesson', 'context'
  content TEXT NOT NULL,                -- The actual note/wisdom
  voice_ref TEXT,                       -- Path to voice recording of this note (if recorded)
  author TEXT NOT NULL DEFAULT 'Robert Stephen Plowman',
  tags TEXT,                            -- JSON array for categorization
  teachable INTEGER NOT NULL DEFAULT 1, -- Can NOIZYKIDZ use this as teaching material?
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notes_title ON production_notes(title_id);
CREATE INDEX IF NOT EXISTS idx_notes_type ON production_notes(note_type);
CREATE INDEX IF NOT EXISTS idx_notes_teachable ON production_notes(teachable);

-- 4. LICENSES — Every use of catalog music is tracked
CREATE TABLE IF NOT EXISTS licenses (
  id TEXT PRIMARY KEY,
  title_id TEXT NOT NULL REFERENCES catalog_titles(id),
  tier TEXT NOT NULL,                   -- 'educational', 'commercial', 'enterprise', 'noizykidz'
  customer_ref TEXT NOT NULL,           -- Customer/licensee identifier
  customer_name TEXT,
  customer_type TEXT,                   -- 'student', 'indie_dev', 'studio', 'streaming', 'educator'
  fee REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  term_start TIMESTAMP NOT NULL,
  term_end TIMESTAMP,                   -- NULL = perpetual
  territory TEXT DEFAULT 'worldwide',
  usage_scope TEXT,                     -- 'game', 'film', 'streaming', 'education', 'sampling'
  exclusivity TEXT DEFAULT 'non-exclusive', -- 'exclusive', 'non-exclusive'
  consent_required INTEGER DEFAULT 0,   -- Does this use require additional consent gates?
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'expired', 'revoked', 'pending'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_licenses_title ON licenses(title_id);
CREATE INDEX IF NOT EXISTS idx_licenses_tier ON licenses(tier);
CREATE INDEX IF NOT EXISTS idx_licenses_customer ON licenses(customer_ref);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses(status);

-- 5. ATTRIBUTION LOG — Every use is attributed. Locked. Immutable.
CREATE TABLE IF NOT EXISTS attribution_log (
  id TEXT PRIMARY KEY,
  license_id TEXT NOT NULL REFERENCES licenses(id),
  title_id TEXT NOT NULL REFERENCES catalog_titles(id),
  attribution_text TEXT NOT NULL,       -- 'Music by Robert Stephen Plowman, from the NOIZYFISH catalog'
  manifest_ref TEXT,                    -- C2PA/provenance manifest if applicable
  context TEXT,                         -- Where/how was it attributed
  verified INTEGER NOT NULL DEFAULT 0,  -- Has attribution been verified in the wild?
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_attribution_license ON attribution_log(license_id);

-- 6. ROYALTY EVENTS — Every dollar traced
CREATE TABLE IF NOT EXISTS royalty_events (
  id TEXT PRIMARY KEY,
  license_id TEXT NOT NULL REFERENCES licenses(id),
  title_id TEXT NOT NULL REFERENCES catalog_titles(id),
  event_type TEXT NOT NULL,             -- 'license_fee', 'performance', 'streaming', 'sync', 'mechanical'
  payee_id TEXT NOT NULL,               -- 'RSP_001', 'PLATFORM', 'NOIZYKIDZ', collaborator ID
  payee_type TEXT NOT NULL,             -- 'composer', 'platform', 'gorunfree', 'collaborator'
  gross_amount REAL NOT NULL,
  -- Gospel Deal enforcement
  creator_share REAL NOT NULL,          -- Must be >= 75% of net
  platform_share REAL NOT NULL,
  gorunfree_tithe REAL NOT NULL,        -- 1% of gross, always, irremovable
  gorunfree_recipient TEXT NOT NULL DEFAULT 'NOIZYKIDZ',
  net_amount REAL NOT NULL,             -- What payee actually receives
  currency TEXT NOT NULL DEFAULT 'USD',
  routing TEXT,                         -- Payment routing reference
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processed', 'failed', 'disputed'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_royalty_license ON royalty_events(license_id);
CREATE INDEX IF NOT EXISTS idx_royalty_payee ON royalty_events(payee_id);
CREATE INDEX IF NOT EXISTS idx_royalty_type ON royalty_events(event_type);
CREATE INDEX IF NOT EXISTS idx_royalty_created ON royalty_events(created_at);

-- 7. SEARCH INDEX — Full-text + metadata for discovery
CREATE TABLE IF NOT EXISTS search_index (
  id TEXT PRIMARY KEY,
  title_id TEXT NOT NULL REFERENCES catalog_titles(id),
  searchable_text TEXT NOT NULL,        -- Concatenated: title + project + mood + instrumentation + notes
  embedding_ref TEXT,                   -- Future: vector embedding reference for semantic search
  last_indexed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_search_title ON search_index(title_id);

-- 8. PRICING TIERS — Configurable licensing economics
CREATE TABLE IF NOT EXISTS pricing_tiers (
  id TEXT PRIMARY KEY,
  tier_name TEXT NOT NULL UNIQUE,       -- 'educational', 'commercial', 'enterprise', 'noizykidz'
  description TEXT,
  base_price_min REAL NOT NULL,
  base_price_max REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  discount_pct REAL DEFAULT 0,          -- e.g., 20 for NOIZYKIDZ 20% discount
  requires_approval INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. LUCY OBSERVATIONS — Curation intelligence
CREATE TABLE IF NOT EXISTS lucy_observations (
  id TEXT PRIMARY KEY,
  observation_type TEXT NOT NULL,       -- 'trend', 'opportunity', 'recommendation', 'pattern', 'gap'
  subject_type TEXT NOT NULL,           -- 'title', 'era', 'style', 'market', 'creator'
  subject_id TEXT,
  observation TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 0.5,
  data_points TEXT,                     -- JSON supporting evidence
  acted_on INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_lucy_type ON lucy_observations(observation_type);
CREATE INDEX IF NOT EXISTS idx_lucy_subject ON lucy_observations(subject_type, subject_id);

-- 10. AUDIT LOG — Same discipline as NOISY BOX. Append-only. Hash-chained.
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  actor_type TEXT NOT NULL,             -- 'composer', 'system', 'admin', 'lucy', 'licensee'
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  action TEXT NOT NULL,
  metadata TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  block_hash TEXT NOT NULL,
  previous_hash TEXT NOT NULL DEFAULT 'GENESIS'
);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_event ON audit_log(event_type);
