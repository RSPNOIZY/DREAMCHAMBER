-- TRANSPARENCY LOG TABLE (THIRD ANCHOR)
-- SQLite-compatible schema for D1
-- Run: npx wrangler d1 execute gabriel_db --remote --file migrations/004_transparency_log.sql

-- ═══════════════════════════════════════════════════════════════════════════
-- TRANSPARENCY LOG
-- Public, append-only log of all anchor publications
-- Third anchor in cross-anchor redundancy system
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS transparency_log (
  id TEXT PRIMARY KEY,
  anchor_date TEXT NOT NULL,
  root_hash TEXT NOT NULL,
  event_count INTEGER NOT NULL,
  eth_txid TEXT,
  btc_txid TEXT,
  algorithm TEXT NOT NULL DEFAULT 'sha256-merkle',
  published_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_transparency_date ON transparency_log(anchor_date);
CREATE INDEX IF NOT EXISTS idx_transparency_root ON transparency_log(root_hash);
CREATE INDEX IF NOT EXISTS idx_transparency_published ON transparency_log(published_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- Add hash chain columns to audit_events if not already present
-- Note: These may fail if columns already exist - that's OK
-- ═══════════════════════════════════════════════════════════════════════════

-- SQLite doesn't have IF NOT EXISTS for ALTER TABLE
-- Run these manually if needed:
-- ALTER TABLE audit_events ADD COLUMN prev_hash TEXT;
-- ALTER TABLE audit_events ADD COLUMN event_hash TEXT;

-- Done
SELECT 'Transparency log schema created successfully' as status;
