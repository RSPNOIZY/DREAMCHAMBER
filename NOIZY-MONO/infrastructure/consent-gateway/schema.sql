-- ═══════════════════════════════════════════════════════════════════════════
-- CONSENT GATEWAY SCHEMA v1.1
-- The Consent Gateway is not a feature. It is the court of record.
-- ═══════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────
-- VOICE PROFILES
-- ───────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS voice_profiles (
    id TEXT PRIMARY KEY,                          -- e.g., "rsp-001"
    creator_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    email TEXT,
    voice_dna_hash TEXT,                          -- Encrypted spectral fingerprint
    enrolled_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_voice_creator ON voice_profiles(creator_id);

-- ───────────────────────────────────────────────────────────────────────────
-- CONSENTS
-- Revocation is state (revoked_at), not a new row.
-- No "action" column. Grant = row exists. Revoke = revoked_at set.
-- ───────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS consents (
    id TEXT PRIMARY KEY,
    voice_id TEXT NOT NULL REFERENCES voice_profiles(id),
    consent_type TEXT NOT NULL CHECK(consent_type IN (
        'recording',           -- Permission to capture voice
        'model_training',      -- Permission to train models
        'synthesis',           -- Permission to synthesize
        'commercial'           -- Permission for commercial use
    )),
    scope TEXT,                                   -- JSON: categories, territories, etc.
    granted_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT,                              -- NULL = no expiry
    revoked_at TEXT,                              -- NULL = active, set = revoked
    revoked_reason TEXT,
    previous_hash TEXT,                           -- Chain integrity
    consent_hash TEXT NOT NULL,                   -- SHA-256 of consent record
    UNIQUE(voice_id, consent_type)                -- One active consent per type per voice
);

CREATE INDEX IF NOT EXISTS idx_consents_voice ON consents(voice_id);
CREATE INDEX IF NOT EXISTS idx_consents_type ON consents(consent_type);
CREATE INDEX IF NOT EXISTS idx_consents_active ON consents(voice_id, consent_type)
    WHERE revoked_at IS NULL;

-- ───────────────────────────────────────────────────────────────────────────
-- AUDIT LOG
-- Append-only. CREATE | REVOKE | QUERY only.
-- ───────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL CHECK(event_type IN ('CREATE', 'REVOKE', 'QUERY')),
    voice_id TEXT NOT NULL,
    consent_type TEXT,
    requestor TEXT,                               -- Who made the request
    request_context TEXT,                         -- JSON: IP, user-agent, purpose
    result TEXT NOT NULL CHECK(result IN ('GRANTED', 'DENIED', 'REVOKED', 'NOT_FOUND')),
    result_reason TEXT,
    previous_hash TEXT NOT NULL,                  -- Chain integrity
    event_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_voice ON audit_log(voice_id);
CREATE INDEX IF NOT EXISTS idx_audit_type ON audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);

-- Append-only enforcement
CREATE TRIGGER IF NOT EXISTS audit_log_no_delete
    BEFORE DELETE ON audit_log
BEGIN
    SELECT RAISE(ABORT, 'GOVERNANCE VIOLATION: DELETE on append-only table audit_log');
END;

CREATE TRIGGER IF NOT EXISTS audit_log_no_update
    BEFORE UPDATE ON audit_log
BEGIN
    SELECT RAISE(ABORT, 'GOVERNANCE VIOLATION: UPDATE on append-only table audit_log');
END;

-- ───────────────────────────────────────────────────────────────────────────
-- GENESIS EVENT
-- ───────────────────────────────────────────────────────────────────────────

INSERT OR IGNORE INTO audit_log (
    id, event_type, voice_id, consent_type, requestor, request_context,
    result, result_reason, previous_hash, event_hash
) VALUES (
    'GENESIS',
    'CREATE',
    'SYSTEM',
    NULL,
    'SYSTEM',
    '{"message": "Consent Gateway initialized", "version": "1.1"}',
    'GRANTED',
    'Genesis block',
    'GENESIS',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
);
