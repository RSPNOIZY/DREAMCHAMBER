-- ═══════════════════════════════════════════════════════════════════════════
-- AUDIT EVENTS TABLE (CANONICAL)
-- SQLite-compatible schema for Cloudflare D1
--
-- Run: npx wrangler d1 execute CONSENT_D1 --remote --file ops/migrations/001_audit_events.sql
--
-- Core Law: If a user can see authority, the system must already be able
--           to remember it.
-- ═══════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────
-- AUDIT EVENTS
-- Append-only record of all operator actions
-- ───────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  operator_email TEXT NOT NULL,
  action TEXT NOT NULL,
  explanation TEXT NOT NULL,
  precondition_passed INTEGER NOT NULL DEFAULT 1,
  signals_at_approval TEXT,
  metadata TEXT,
  prev_hash TEXT,
  event_hash TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_events(action);
CREATE INDEX IF NOT EXISTS idx_audit_operator ON audit_events(operator_email);
CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_hash ON audit_events(event_hash);

-- ───────────────────────────────────────────────────────────────────────────
-- OPERATOR TOKENS
-- Time-bounded authorization tokens for high-risk operations
-- ───────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS operator_tokens (
  id TEXT PRIMARY KEY,
  operator_email TEXT NOT NULL,
  action_type TEXT NOT NULL,
  domain TEXT,
  preconditions_met TEXT,
  expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tokens_action ON operator_tokens(action_type);
CREATE INDEX IF NOT EXISTS idx_tokens_expires ON operator_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_tokens_used ON operator_tokens(used);

-- ───────────────────────────────────────────────────────────────────────────
-- FREEZE EVENTS
-- Record of all promotion freezes and resolutions
-- ───────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS freeze_events (
  id TEXT PRIMARY KEY,
  freeze_category TEXT NOT NULL,
  triggered_by TEXT NOT NULL,
  signal_state TEXT,
  resolved INTEGER NOT NULL DEFAULT 0,
  resolved_at TEXT,
  resolved_by TEXT,
  resolution_notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_freeze_category ON freeze_events(freeze_category);
CREATE INDEX IF NOT EXISTS idx_freeze_resolved ON freeze_events(resolved);
CREATE INDEX IF NOT EXISTS idx_freeze_time ON freeze_events(created_at DESC);

-- ───────────────────────────────────────────────────────────────────────────
-- AUDIT ANCHORS
-- Daily Merkle root hashes for external notarization
-- ───────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_anchors (
  id TEXT PRIMARY KEY,
  anchor_date TEXT NOT NULL UNIQUE,
  event_count INTEGER NOT NULL,
  root_hash TEXT NOT NULL,
  algorithm TEXT NOT NULL DEFAULT 'sha256-merkle',
  published_at TEXT NOT NULL,
  eth_txid TEXT,
  eth_block INTEGER,
  btc_txid TEXT,
  btc_block INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_anchors_date ON audit_anchors(anchor_date);
CREATE INDEX IF NOT EXISTS idx_anchors_root ON audit_anchors(root_hash);

-- ───────────────────────────────────────────────────────────────────────────
-- TRANSPARENCY LOG
-- Public append-only log (third anchor in redundancy system)
-- ───────────────────────────────────────────────────────────────────────────

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

-- ───────────────────────────────────────────────────────────────────────────
-- AUDIT INCIDENTS
-- Separate table for chain integrity incidents
-- ───────────────────────────────────────────────────────────────────────────

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

-- Done
SELECT 'Audit infrastructure schema created successfully' as status;
