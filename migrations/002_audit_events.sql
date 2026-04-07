-- AUDIT EVENTS TABLE
-- SQLite-compatible schema for D1
-- Run: npx wrangler d1 execute gabriel_db --remote --file migrations/002_audit_events.sql

-- ═══════════════════════════════════════════════════════════════════════════
-- AUDIT EVENTS
-- Append-only record of all operator actions
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  operator_email TEXT NOT NULL,
  action TEXT NOT NULL,
  explanation TEXT NOT NULL,
  precondition_passed INTEGER NOT NULL DEFAULT 1,
  signals_at_approval TEXT,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_events(action);
CREATE INDEX IF NOT EXISTS idx_audit_operator ON audit_events(operator_email);
CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_events(created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- OPERATOR TOKENS
-- Time-bounded authorization tokens for high-risk operations
-- Single-use, expires after 15 minutes by default
-- ═══════════════════════════════════════════════════════════════════════════

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

-- ═══════════════════════════════════════════════════════════════════════════
-- FREEZE EVENTS
-- Record of all promotion freezes and resolutions
-- ═══════════════════════════════════════════════════════════════════════════

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

-- Done
SELECT 'Audit events schema created successfully' as status;
