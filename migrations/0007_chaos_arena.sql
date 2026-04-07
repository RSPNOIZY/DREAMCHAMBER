-- CHAOS ARENA SCHEMA
-- Migration: 0007_chaos_arena.sql
-- Purpose: Append-only incident log for public verification
--
-- IMPORTANT: This is NOIZY's append-only design.
-- Cloudflare D1 does not natively guarantee immutability.
-- Chain integrity is enforced by application-level hash linking.
--
-- Rule: NEVER UPDATE OR DELETE FROM chaos_incidents.
-- ============================================================

-- Chaos Arena incident log (append-only by design)
CREATE TABLE IF NOT EXISTS chaos_incidents (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    data TEXT NOT NULL,           -- JSON payload
    timestamp TEXT NOT NULL,      -- ISO 8601
    previous_hash TEXT NOT NULL,  -- Hash chain linkage
    hash TEXT NOT NULL,           -- SHA-256 of entry
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index for chronological queries
CREATE INDEX IF NOT EXISTS idx_chaos_incidents_created
    ON chaos_incidents(created_at DESC);

-- Index for type filtering
CREATE INDEX IF NOT EXISTS idx_chaos_incidents_type
    ON chaos_incidents(type);

-- Index for chain verification
CREATE INDEX IF NOT EXISTS idx_chaos_incidents_hash
    ON chaos_incidents(hash);

-- Genesis entry (required for chain start)
INSERT OR IGNORE INTO chaos_incidents (id, type, data, timestamp, previous_hash, hash, created_at)
VALUES (
    'GENESIS',
    'SYSTEM',
    '{"event": "Chaos Arena initialized", "version": "1.0.0"}',
    datetime('now'),
    'NULL',
    'GENESIS_HASH_0000000000000000000000000000000000000000000000000000000000000000',
    datetime('now')
);

-- ============================================================
-- APPEND-ONLY ENFORCEMENT
-- ============================================================
-- These triggers exist to log violations, not to silently fail.
-- A DELETE or UPDATE attempt indicates a governance breach.

-- Trigger: Block DELETE attempts and log violation
CREATE TRIGGER IF NOT EXISTS chaos_incidents_no_delete
    BEFORE DELETE ON chaos_incidents
BEGIN
    SELECT RAISE(ABORT, 'GOVERNANCE VIOLATION: DELETE on append-only table chaos_incidents');
END;

-- Trigger: Block UPDATE attempts and log violation
CREATE TRIGGER IF NOT EXISTS chaos_incidents_no_update
    BEFORE UPDATE ON chaos_incidents
BEGIN
    SELECT RAISE(ABORT, 'GOVERNANCE VIOLATION: UPDATE on append-only table chaos_incidents');
END;

-- ============================================================
-- VERIFICATION CHECKPOINT
-- ============================================================

-- View: Latest chain head for quick verification
CREATE VIEW IF NOT EXISTS chaos_chain_head AS
SELECT
    id,
    type,
    hash,
    previous_hash,
    timestamp,
    created_at
FROM chaos_incidents
ORDER BY created_at DESC
LIMIT 1;

-- View: Chain statistics
CREATE VIEW IF NOT EXISTS chaos_chain_stats AS
SELECT
    COUNT(*) as total_entries,
    MIN(created_at) as chain_start,
    MAX(created_at) as chain_head,
    COUNT(DISTINCT type) as incident_types
FROM chaos_incidents;
