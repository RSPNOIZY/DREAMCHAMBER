-- AUDIT ANCHORS TABLE
-- SQLite-compatible schema for D1
-- Run: npx wrangler d1 execute gabriel_db --remote --file migrations/003_audit_anchors.sql

-- ═══════════════════════════════════════════════════════════════════════════
-- AUDIT ANCHORS
-- Daily Merkle root hashes for external notarization
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS audit_anchors (
  id TEXT PRIMARY KEY,
  anchor_date TEXT NOT NULL UNIQUE,
  event_count INTEGER NOT NULL,
  root_hash TEXT NOT NULL,
  algorithm TEXT NOT NULL DEFAULT 'sha256-merkle',
  published_at TEXT NOT NULL,
  -- Blockchain anchoring (optional, added when anchored)
  eth_txid TEXT,
  eth_block INTEGER,
  btc_txid TEXT,
  btc_block INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_anchors_date ON audit_anchors(anchor_date);
CREATE INDEX IF NOT EXISTS idx_anchors_root ON audit_anchors(root_hash);

-- ═══════════════════════════════════════════════════════════════════════════
-- AUDIT INCIDENTS
-- Separate table for chain integrity incidents (can't trust main chain if broken)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS audit_incidents (
  id TEXT PRIMARY KEY,
  incident_type TEXT NOT NULL,
  details TEXT NOT NULL,
  resolved INTEGER NOT NULL DEFAULT 0,
  resolved_at TEXT,
  resolution_notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_incidents_type ON audit_incidents(incident_type);
CREATE INDEX IF NOT EXISTS idx_incidents_resolved ON audit_incidents(resolved);

-- ═══════════════════════════════════════════════════════════════════════════
-- ADD HASH CHAIN COLUMNS TO AUDIT_EVENTS (if not exists)
-- ═══════════════════════════════════════════════════════════════════════════

-- Note: SQLite doesn't support IF NOT EXISTS for ALTER TABLE
-- These will fail silently if columns already exist
-- Run only once, or wrap in application code

-- ALTER TABLE audit_events ADD COLUMN prev_hash TEXT;
-- ALTER TABLE audit_events ADD COLUMN event_hash TEXT;

-- Done
SELECT 'Audit anchors schema created successfully' as status;
