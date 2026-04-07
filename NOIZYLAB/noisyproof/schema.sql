-- Audio fingerprints and provenance metadata
CREATE TABLE IF NOT EXISTS audio_fingerprints (
  id TEXT PRIMARY KEY,
  fingerprint TEXT NOT NULL,
  algorithm TEXT NOT NULL DEFAULT 'chromaprint',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  file_hash TEXT NOT NULL,
  duration_ms INTEGER,
  sample_rate INTEGER,
  bit_depth INTEGER,
  channels INTEGER
);

-- C2PA manifest storage
CREATE TABLE IF NOT EXISTS c2pa_manifests (
  id TEXT PRIMARY KEY,
  audio_fingerprint_id TEXT NOT NULL,
  manifest_data TEXT NOT NULL, -- JSON blob of C2PA manifest
  signature TEXT NOT NULL,
  certificate_chain TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (audio_fingerprint_id) REFERENCES audio_fingerprints(id)
);

-- Creator consent records
CREATE TABLE IF NOT EXISTS consent_records (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL,
  consented_entity_id TEXT NOT NULL,
  consent_type TEXT NOT NULL, -- 'voice_clone', 'sample_use', 'derivative_work'
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  revoked_at TIMESTAMP,
  consent_hash TEXT NOT NULL,
  terms_version TEXT NOT NULL
);

-- Watermark metadata
CREATE TABLE IF NOT EXISTS watermarks (
  id TEXT PRIMARY KEY,
  audio_fingerprint_id TEXT NOT NULL,
  watermark_type TEXT NOT NULL DEFAULT 'psychoacoustic',
  payload TEXT NOT NULL,
  strength REAL DEFAULT 0.01,
  frequency_range TEXT, -- JSON array [min_hz, max_hz]
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (audio_fingerprint_id) REFERENCES audio_fingerprints(id)
);

-- Immutable audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  action TEXT NOT NULL,
  metadata TEXT, -- JSON blob
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  block_hash TEXT, -- For future blockchain integration
  previous_hash TEXT -- Chain entries together
);

-- Provenance chains
CREATE TABLE IF NOT EXISTS provenance_chains (
  id TEXT PRIMARY KEY,
  child_fingerprint_id TEXT NOT NULL,
  parent_fingerprint_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL, -- 'derived', 'sampled', 'cloned', 'mixed'
  transformation_metadata TEXT, -- JSON describing the transformation
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_fingerprint_id) REFERENCES audio_fingerprints(id),
  FOREIGN KEY (parent_fingerprint_id) REFERENCES audio_fingerprints(id)
);

-- Voice identity registry
CREATE TABLE IF NOT EXISTS voice_identities (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL,
  voice_fingerprint TEXT NOT NULL,
  verification_method TEXT NOT NULL, -- 'biometric', 'manual', 'ai_verified'
  verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT -- JSON with additional voice characteristics
);

-- Economic receipts (75/25 Gospel Deal + GORUNFREE 1% tithe)
CREATE TABLE IF NOT EXISTS receipts (
  id TEXT PRIMARY KEY,
  transaction_type TEXT NOT NULL, -- 'synthesis', 'license', 'royalty', 'derivative'
  creator_id TEXT NOT NULL,
  requester_id TEXT NOT NULL,
  audio_fingerprint_id TEXT,
  gross_amount REAL NOT NULL,
  -- Gospel Deal split (sacred invariant: creator >= 75%)
  creator_share REAL NOT NULL,       -- creator_id receives this
  platform_share REAL NOT NULL,      -- NOIZY platform receives this
  -- GORUNFREE Trust Clause (irremovable 1% of gross to NOIZYKIDZ)
  gorunfree_tithe REAL NOT NULL,     -- always gross * 0.01
  gorunfree_recipient TEXT NOT NULL DEFAULT 'NOIZYKIDZ',
  -- Net amounts after tithe
  creator_net REAL NOT NULL,         -- creator_share - (gorunfree_tithe * creator_share / gross)
  platform_net REAL NOT NULL,        -- platform_share - (gorunfree_tithe * platform_share / gross)
  -- Metadata
  currency TEXT NOT NULL DEFAULT 'USD',
  receipt_hash TEXT NOT NULL,        -- SHA-256 of receipt data for integrity
  consent_record_id TEXT,            -- links to consent that authorized this transaction
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (audio_fingerprint_id) REFERENCES audio_fingerprints(id)
);

-- Indexes for performance
CREATE INDEX idx_fingerprints_hash ON audio_fingerprints(file_hash);
CREATE INDEX idx_consent_creator ON consent_records(creator_id);
CREATE INDEX idx_consent_entity ON consent_records(consented_entity_id);
CREATE INDEX idx_audit_timestamp ON audit_log(timestamp);
CREATE INDEX idx_audit_actor ON audit_log(actor_id);
CREATE INDEX idx_provenance_child ON provenance_chains(child_fingerprint_id);
CREATE INDEX idx_provenance_parent ON provenance_chains(parent_fingerprint_id);
CREATE INDEX idx_receipts_creator ON receipts(creator_id);
CREATE INDEX idx_receipts_type ON receipts(transaction_type);
CREATE INDEX idx_receipts_created ON receipts(created_at);
