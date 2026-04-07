-- ═══════════════════════════════════════════════════════════════════════════════
-- HEAVEN D1 Schema — Constitutional Infrastructure
-- Target: agent-memory (7b813205-fd12-4a23-84a6-ce83bc49ec70)
-- Author: Robert Stephen Plowman (RSP_001)
-- Date: 2026-03-31
-- NCP: 75/25 Plowman Standard. Consent is law.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── Gabriel Audit Trail ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS gabriel_log (
  id              TEXT PRIMARY KEY,
  event_type      TEXT NOT NULL,
  actor_id        TEXT,
  target_id       TEXT,
  payload         TEXT,
  sovereignty_check TEXT,
  logged_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gabriel_log_actor ON gabriel_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_gabriel_log_event ON gabriel_log(event_type);
CREATE INDEX IF NOT EXISTS idx_gabriel_log_time  ON gabriel_log(logged_at DESC);

-- ── Family Members (myFamily.AI) ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS family_members (
  id               TEXT PRIMARY KEY,
  email            TEXT NOT NULL,
  display_name     TEXT NOT NULL,
  hvs_acknowledged INTEGER DEFAULT 0,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── Consent Matrix (NCP Core) ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS consent_matrix (
  id              TEXT PRIMARY KEY,
  member_id       TEXT NOT NULL,
  use_cases       TEXT,          -- JSON array
  restrictions    TEXT,          -- JSON object
  beneficiary_ids TEXT,          -- JSON array
  c2pa_stamp      TEXT,
  expires_at      TEXT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES family_members(id)
);

-- ── Beneficiaries ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS beneficiaries (
  id                    TEXT PRIMARY KEY,
  member_id             TEXT NOT NULL,
  beneficiary_member_id TEXT NOT NULL,
  access_rules          TEXT,    -- JSON object
  granted_by            TEXT,
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES family_members(id)
);

-- ── Voice Profiles (NOIZYVOX) ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS voice_profiles (
  id               TEXT PRIMARY KEY,
  member_id        TEXT NOT NULL,
  file_ref         TEXT NOT NULL,   -- Local path on M2 Ultra (audio never leaves GOD)
  sample_rate      INTEGER DEFAULT 48000,
  bit_depth        INTEGER DEFAULT 32,
  duration_seconds REAL,
  emotional_tags   TEXT DEFAULT '[]',
  c2pa_stamp       TEXT,
  model_version    TEXT DEFAULT 'xtts_v2',
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES family_members(id)
);

-- ── Messages (Pre-recorded comfort, grief, milestone) ────────────────────────

CREATE TABLE IF NOT EXISTS messages (
  id                  TEXT PRIMARY KEY,
  from_member_id      TEXT NOT NULL,
  to_beneficiary_ids  TEXT,      -- JSON array
  message_type        TEXT NOT NULL,
  file_ref            TEXT,
  duration_seconds    REAL,
  trigger_conditions  TEXT,      -- JSON object
  created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (from_member_id) REFERENCES family_members(id)
);

-- ── Healing Sessions (Biometric-triggered therapeutic protocol) ──────────────

CREATE TABLE IF NOT EXISTS healing_sessions (
  id                     TEXT PRIMARY KEY,
  beneficiary_member_id  TEXT NOT NULL,
  protocol_type          TEXT NOT NULL,
  voice_message_id       TEXT,
  noizyfish_track_id     TEXT,
  frequency_hz           REAL,
  duration_seconds       REAL,
  biometric_before       TEXT,    -- JSON object
  biometric_after        TEXT,    -- JSON object
  outcome                TEXT DEFAULT 'pending',
  consent_verified       INTEGER DEFAULT 0,
  created_at             DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── NOIZYSTREAM — Streaming Infrastructure ───────────────────────────────────

CREATE TABLE IF NOT EXISTS stream_rooms (
  id                TEXT PRIMARY KEY,
  title             TEXT NOT NULL,
  host_id           TEXT NOT NULL,
  state             TEXT NOT NULL DEFAULT 'waiting',
  brand             TEXT DEFAULT 'NOIZY.AI',
  stream_type       TEXT DEFAULT 'live-session',
  tags              TEXT DEFAULT '[]',
  description       TEXT DEFAULT '',
  max_participants  INTEGER DEFAULT 10,
  recording         INTEGER DEFAULT 1,
  consent_required  INTEGER DEFAULT 1,
  hvs_split         TEXT DEFAULT '75/25',
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  started_at        DATETIME,
  ended_at          DATETIME
);

CREATE INDEX IF NOT EXISTS idx_stream_rooms_state ON stream_rooms(state);

CREATE TABLE IF NOT EXISTS stream_participants (
  id                TEXT PRIMARY KEY,
  room_id           TEXT NOT NULL,
  display_name      TEXT NOT NULL,
  role              TEXT NOT NULL DEFAULT 'viewer',
  state             TEXT NOT NULL DEFAULT 'green_room',
  consent_given     INTEGER DEFAULT 0,
  consent_timestamp DATETIME,
  joined_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
  left_at           DATETIME,
  FOREIGN KEY (room_id) REFERENCES stream_rooms(id)
);

CREATE INDEX IF NOT EXISTS idx_stream_participants_room ON stream_participants(room_id);

CREATE TABLE IF NOT EXISTS stream_metadata_events (
  id              TEXT PRIMARY KEY,
  room_id         TEXT NOT NULL,
  participant_id  TEXT NOT NULL,
  event_type      TEXT NOT NULL,
  timestamp       DATETIME NOT NULL,
  duration_ms     INTEGER,
  data            TEXT DEFAULT '{}',
  FOREIGN KEY (room_id) REFERENCES stream_rooms(id)
);

CREATE INDEX IF NOT EXISTS idx_stream_metadata_room ON stream_metadata_events(room_id);
CREATE INDEX IF NOT EXISTS idx_stream_metadata_type ON stream_metadata_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stream_metadata_time ON stream_metadata_events(timestamp);

-- ═══════════════════════════════════════════════════════════════════════════════
-- END OF HEAVEN SCHEMA — Gabriel watches every row.
-- ═══════════════════════════════════════════════════════════════════════════════
