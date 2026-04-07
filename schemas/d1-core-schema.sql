-- NOIZY D1 Core Schema v2.0
-- 10 tables for consent-native infrastructure
-- Database: gabriel_db (f75939d5-5747-4a9c-8ac2-7710201fda09)
-- Author: RSP_001 | Date: 2026-03-25

-- ============================================
-- TABLE 1: creators
-- ============================================
CREATE TABLE IF NOT EXISTS creators (
    id TEXT PRIMARY KEY,
    legal_name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    email TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'suspended')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================
-- TABLE 2: hvs_records (Human Voice Sovereignty)
-- ============================================
CREATE TABLE IF NOT EXISTS hvs_records (
    id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL REFERENCES creators(id),
    sovereignty_status TEXT NOT NULL DEFAULT 'claimed' CHECK(sovereignty_status IN ('claimed', 'verified', 'contested', 'inactive')),
    estate_status TEXT NOT NULL DEFAULT 'active' CHECK(estate_status IN ('active', 'inactive', 'transferred', 'probate_pending')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_hvs_creator ON hvs_records(creator_id);

-- ============================================
-- TABLE 3: voice_estates
-- ============================================
CREATE TABLE IF NOT EXISTS voice_estates (
    id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL REFERENCES creators(id),
    hvs_id TEXT NOT NULL REFERENCES hvs_records(id),
    estate_status TEXT NOT NULL DEFAULT 'active' CHECK(estate_status IN ('active', 'inactive', 'transferred', 'probate_pending')),
    acoustic_fingerprint TEXT NOT NULL,
    governance_json TEXT NOT NULL DEFAULT '{"creator_primary_control": true, "delegate_control_enabled": false, "estate_transfer_enabled": true}',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_voice_estates_creator ON voice_estates(creator_id);
CREATE INDEX IF NOT EXISTS idx_voice_estates_hvs ON voice_estates(hvs_id);

-- ============================================
-- TABLE 4: consent_records (NCP v1.1)
-- ============================================
CREATE TABLE IF NOT EXISTS consent_records (
    id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL REFERENCES creators(id),
    hvs_id TEXT NOT NULL REFERENCES hvs_records(id),
    claimant_id TEXT NOT NULL,
    consent_status TEXT NOT NULL DEFAULT 'draft' CHECK(consent_status IN ('draft', 'pending_signature', 'active', 'expired', 'revoked', 'suspended', 'disputed')),
    usage_types_json TEXT NOT NULL DEFAULT '[]',
    authorized_tools_json TEXT NOT NULL DEFAULT '[]',
    term_start TEXT,
    term_end TEXT,
    scope_json TEXT NOT NULL DEFAULT '{}',
    payment_terms_json TEXT NOT NULL DEFAULT '{"default_model": true, "creator_pct": 75, "platform_pct": 25, "override_applies": false, "currency": "USD", "payout_window_days": 7}',
    provenance_required INTEGER NOT NULL DEFAULT 1,
    dispute_status TEXT NOT NULL DEFAULT 'none' CHECK(dispute_status IN ('none', 'filed', 'under_review', 'resolved_creator', 'resolved_claimant', 'resolved_split')),
    revoked_at TEXT,
    signature_json TEXT,
    last_verified_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_consent_creator ON consent_records(creator_id);
CREATE INDEX IF NOT EXISTS idx_consent_claimant ON consent_records(claimant_id);
CREATE INDEX IF NOT EXISTS idx_consent_status ON consent_records(consent_status);
CREATE INDEX IF NOT EXISTS idx_consent_hvs ON consent_records(hvs_id);

-- ============================================
-- TABLE 5: revocation_events
-- ============================================
CREATE TABLE IF NOT EXISTS revocation_events (
    id TEXT PRIMARY KEY,
    consent_record_id TEXT NOT NULL REFERENCES consent_records(id),
    creator_id TEXT NOT NULL REFERENCES creators(id),
    reason TEXT NOT NULL,
    scope_json TEXT NOT NULL DEFAULT '{"scope": "all"}',
    effective_at TEXT NOT NULL DEFAULT (datetime('now')),
    enforced_at TEXT,
    enforcement_status TEXT NOT NULL DEFAULT 'initiated' CHECK(enforcement_status IN ('initiated', 'in_progress', 'completed', 'failed', 'escalated')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_revocation_consent ON revocation_events(consent_record_id);
CREATE INDEX IF NOT EXISTS idx_revocation_creator ON revocation_events(creator_id);
CREATE INDEX IF NOT EXISTS idx_revocation_status ON revocation_events(enforcement_status);

-- ============================================
-- TABLE 6: usage_events
-- ============================================
CREATE TABLE IF NOT EXISTS usage_events (
    id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL REFERENCES creators(id),
    consent_record_id TEXT NOT NULL REFERENCES consent_records(id),
    claimant_id TEXT NOT NULL,
    action_type TEXT NOT NULL CHECK(action_type IN ('synthesis', 'derivative', 'training', 'analysis', 'distribution', 'broadcast', 'archive')),
    tool_name TEXT NOT NULL,
    model_version TEXT,
    output_asset_id TEXT,
    provenance_status TEXT NOT NULL DEFAULT 'missing' CHECK(provenance_status IN ('verified', 'missing', 'corrupted', 'mismatch', 'revoked_source', 'legacy_unverified')),
    decision TEXT NOT NULL CHECK(decision IN ('ALLOW', 'HOLD', 'DENY', 'ESCALATE')),
    requested_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_usage_creator ON usage_events(creator_id);
CREATE INDEX IF NOT EXISTS idx_usage_consent ON usage_events(consent_record_id);
CREATE INDEX IF NOT EXISTS idx_usage_decision ON usage_events(decision);

-- ============================================
-- TABLE 7: royalty_events
-- ============================================
CREATE TABLE IF NOT EXISTS royalty_events (
    id TEXT PRIMARY KEY,
    usage_event_id TEXT NOT NULL REFERENCES usage_events(id),
    creator_id TEXT NOT NULL REFERENCES creators(id),
    gross_amount REAL NOT NULL,
    creator_amount REAL NOT NULL,
    platform_amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    payout_status TEXT NOT NULL DEFAULT 'pending' CHECK(payout_status IN ('pending', 'scheduled', 'paid', 'failed', 'held')),
    payout_due_at TEXT,
    paid_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_royalty_creator ON royalty_events(creator_id);
CREATE INDEX IF NOT EXISTS idx_royalty_status ON royalty_events(payout_status);

-- ============================================
-- TABLE 8: provenance_records
-- ============================================
CREATE TABLE IF NOT EXISTS provenance_records (
    id TEXT PRIMARY KEY,
    output_asset_id TEXT NOT NULL,
    creator_id TEXT NOT NULL REFERENCES creators(id),
    consent_record_id TEXT NOT NULL REFERENCES consent_records(id),
    manifest_ref TEXT,
    manifest_hash TEXT,
    provenance_status TEXT NOT NULL DEFAULT 'missing' CHECK(provenance_status IN ('verified', 'missing', 'corrupted', 'mismatch', 'revoked_source', 'legacy_unverified')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_provenance_asset ON provenance_records(output_asset_id);
CREATE INDEX IF NOT EXISTS idx_provenance_creator ON provenance_records(creator_id);
CREATE INDEX IF NOT EXISTS idx_provenance_status ON provenance_records(provenance_status);

-- ============================================
-- TABLE 9: tool_clearance_registry
-- ============================================
CREATE TABLE IF NOT EXISTS tool_clearance_registry (
    id TEXT PRIMARY KEY,
    tool_name TEXT NOT NULL UNIQUE,
    clearance_status TEXT NOT NULL DEFAULT 'pending_review' CHECK(clearance_status IN ('approved', 'restricted', 'blocked', 'pending_review')),
    allowed_usage_types_json TEXT NOT NULL DEFAULT '[]',
    commercial_status TEXT NOT NULL DEFAULT 'blocked' CHECK(commercial_status IN ('commercial_ok', 'non_commercial_only', 'blocked')),
    review_owner TEXT,
    reviewed_at TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================
-- TABLE 10: audit_log
-- ============================================
CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    actor_type TEXT NOT NULL CHECK(actor_type IN ('creator', 'claimant', 'agent', 'system', 'admin')),
    actor_id TEXT NOT NULL,
    action TEXT NOT NULL,
    object_type TEXT NOT NULL,
    object_id TEXT NOT NULL,
    decision TEXT CHECK(decision IN ('ALLOW', 'HOLD', 'DENY', 'ESCALATE', NULL)),
    reason TEXT,
    metadata_json TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- audit_log is APPEND-ONLY. Never UPDATE. Never DELETE.
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_object ON audit_log(object_type, object_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);

-- ============================================
-- SEED: RSP_001 as founding creator
-- ============================================
INSERT OR IGNORE INTO creators (id, legal_name, display_name, email, status)
VALUES ('RSP_001', 'Robert Stephen Plowman', 'RSP', 'rsp@noizyfish.com', 'active');

INSERT OR IGNORE INTO hvs_records (id, creator_id, sovereignty_status, estate_status)
VALUES ('HVS_RSP_001', 'RSP_001', 'verified', 'active');

-- ============================================
-- SEED: Initial tool clearances
-- ============================================
INSERT OR IGNORE INTO tool_clearance_registry (id, tool_name, clearance_status, allowed_usage_types_json, commercial_status, review_owner, reviewed_at, notes)
VALUES
    ('TCR_001', 'XTTS_v2', 'approved', '["synthesis", "derivative"]', 'commercial_ok', 'RSP_001', '2026-03-25', 'Primary TTS engine'),
    ('TCR_002', 'RVC', 'approved', '["synthesis", "training"]', 'commercial_ok', 'RSP_001', '2026-03-25', 'Voice conversion'),
    ('TCR_003', 'Librosa', 'approved', '["analysis"]', 'commercial_ok', 'RSP_001', '2026-03-25', 'Audio analysis only'),
    ('TCR_004', 'Whisper', 'approved', '["analysis"]', 'commercial_ok', 'RSP_001', '2026-03-25', 'Transcription only');
