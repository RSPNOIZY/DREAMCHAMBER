-- NOIZYFISH Append-Only Audit Schema
-- D1 Database Definition
-- All events are immutable: no UPDATE, no DELETE

-- ═══════════════════════════════════════════════════════════════════════════
-- AUDIT EVENTS TABLE
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS audit_events (
    id TEXT PRIMARY KEY,                              -- UUID
    event_type TEXT NOT NULL CHECK (
        event_type IN ('INGEST', 'TAG', 'PROOF', 'REVOKE', 'ACCESS', 'VERIFY')
    ),
    asset_id TEXT NOT NULL,                           -- Reference to audio asset
    policy TEXT NOT NULL DEFAULT 'REAL_HUMAN_ORIGIN', -- ZK policy applied
    event_payload TEXT NOT NULL,                      -- JSON payload
    previous_hash TEXT NOT NULL,                      -- Hash of previous event (or 'GENESIS')
    event_hash TEXT NOT NULL,                         -- SHA-256 hash of this event
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index for asset lookups
CREATE INDEX IF NOT EXISTS idx_audit_asset ON audit_events(asset_id);

-- Index for event type filtering
CREATE INDEX IF NOT EXISTS idx_audit_type ON audit_events(event_type);

-- Index for chronological ordering
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_events(created_at);

-- ═══════════════════════════════════════════════════════════════════════════
-- ASSETS METADATA TABLE
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    r2_key TEXT NOT NULL,                             -- R2 object key
    content_hash TEXT NOT NULL,                       -- SHA-256 of audio content
    duration_seconds REAL,
    sample_rate INTEGER,
    channels INTEGER,
    format TEXT,
    -- Cyanite analysis
    bpm REAL,
    key TEXT,
    mood TEXT,
    tags TEXT,                                        -- JSON array
    -- Provenance
    origin_verified INTEGER NOT NULL DEFAULT 0,
    c2pa_manifest TEXT,
    proof_id TEXT,                                    -- Reference to ZK proof
    proof_hash TEXT,
    -- Consent
    creator_id TEXT,
    consent_status TEXT CHECK (
        consent_status IN ('ACTIVE', 'REVOKED', 'PENDING')
    ),
    -- Timestamps
    ingested_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index for search
CREATE INDEX IF NOT EXISTS idx_assets_tags ON assets(tags);
CREATE INDEX IF NOT EXISTS idx_assets_bpm ON assets(bpm);
CREATE INDEX IF NOT EXISTS idx_assets_key ON assets(key);
CREATE INDEX IF NOT EXISTS idx_assets_mood ON assets(mood);
CREATE INDEX IF NOT EXISTS idx_assets_consent ON assets(consent_status);

-- ═══════════════════════════════════════════════════════════════════════════
-- PROOF RECEIPTS TABLE
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS proof_receipts (
    id TEXT PRIMARY KEY,
    asset_id TEXT NOT NULL,
    policy TEXT NOT NULL,
    result INTEGER NOT NULL,                          -- 1 = valid, 0 = invalid
    proof_data TEXT,                                  -- ZK proof blob
    verifier_signature TEXT,
    verified_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (asset_id) REFERENCES assets(id)
);

CREATE INDEX IF NOT EXISTS idx_proofs_asset ON proof_receipts(asset_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- APPEND-ONLY ENFORCEMENT TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════

-- Prevent DELETE on audit_events
CREATE TRIGGER IF NOT EXISTS audit_events_no_delete
    BEFORE DELETE ON audit_events
BEGIN
    SELECT RAISE(ABORT, 'GOVERNANCE VIOLATION: DELETE on append-only table audit_events');
END;

-- Prevent UPDATE on audit_events
CREATE TRIGGER IF NOT EXISTS audit_events_no_update
    BEFORE UPDATE ON audit_events
BEGIN
    SELECT RAISE(ABORT, 'GOVERNANCE VIOLATION: UPDATE on append-only table audit_events');
END;

-- Prevent DELETE on proof_receipts
CREATE TRIGGER IF NOT EXISTS proof_receipts_no_delete
    BEFORE DELETE ON proof_receipts
BEGIN
    SELECT RAISE(ABORT, 'GOVERNANCE VIOLATION: DELETE on append-only table proof_receipts');
END;

-- Prevent UPDATE on proof_receipts
CREATE TRIGGER IF NOT EXISTS proof_receipts_no_update
    BEFORE UPDATE ON proof_receipts
BEGIN
    SELECT RAISE(ABORT, 'GOVERNANCE VIOLATION: UPDATE on append-only table proof_receipts');
END;

-- ═══════════════════════════════════════════════════════════════════════════
-- GENESIS EVENT
-- ═══════════════════════════════════════════════════════════════════════════

INSERT OR IGNORE INTO audit_events (
    id, event_type, asset_id, policy, event_payload, previous_hash, event_hash
) VALUES (
    'GENESIS',
    'INGEST',
    'GENESIS',
    'REAL_HUMAN_ORIGIN',
    '{"message": "NOIZYFISH audit chain initialized", "version": "1.0.0"}',
    'GENESIS',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
);
