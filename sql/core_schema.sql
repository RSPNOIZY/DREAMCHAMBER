PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS creators (
  id TEXT PRIMARY KEY,
  legal_name TEXT NOT NULL,
  display_name TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  payout_destination TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hvs_records (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL,
  sovereignty_status TEXT NOT NULL DEFAULT 'claimed',
  estate_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (creator_id) REFERENCES creators(id)
);

CREATE TABLE IF NOT EXISTS voice_estates (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL,
  hvs_id TEXT NOT NULL,
  estate_status TEXT NOT NULL DEFAULT 'active',
  acoustic_fingerprint TEXT NOT NULL,
  governance_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (creator_id) REFERENCES creators(id),
  FOREIGN KEY (hvs_id) REFERENCES hvs_records(id)
);

CREATE TABLE IF NOT EXISTS consent_records (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL,
  hvs_id TEXT NOT NULL,
  claimant_id TEXT NOT NULL,
  consent_status TEXT NOT NULL,
  usage_types_json TEXT NOT NULL,
  authorized_tools_json TEXT NOT NULL,
  term_start TEXT NOT NULL,
  term_end TEXT,
  scope_json TEXT NOT NULL,
  payment_terms_json TEXT NOT NULL,
  provenance_required INTEGER NOT NULL DEFAULT 1,
  dispute_status TEXT NOT NULL DEFAULT 'none',
  revoked_at TEXT,
  signature_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (creator_id) REFERENCES creators(id),
  FOREIGN KEY (hvs_id) REFERENCES hvs_records(id)
);

CREATE TABLE IF NOT EXISTS revocation_events (
  id TEXT PRIMARY KEY,
  consent_record_id TEXT NOT NULL,
  creator_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  scope_json TEXT NOT NULL,
  effective_at TEXT NOT NULL,
  enforced_at TEXT,
  enforcement_status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  FOREIGN KEY (consent_record_id) REFERENCES consent_records(id),
  FOREIGN KEY (creator_id) REFERENCES creators(id)
);

CREATE TABLE IF NOT EXISTS usage_events (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL,
  consent_record_id TEXT NOT NULL,
  claimant_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  model_version TEXT,
  output_asset_id TEXT,
  provenance_status TEXT NOT NULL,
  requested_at TEXT NOT NULL,
  completed_at TEXT,
  decision TEXT NOT NULL,
  FOREIGN KEY (creator_id) REFERENCES creators(id),
  FOREIGN KEY (consent_record_id) REFERENCES consent_records(id)
);

CREATE TABLE IF NOT EXISTS royalty_events (
  id TEXT PRIMARY KEY,
  usage_event_id TEXT NOT NULL,
  creator_id TEXT NOT NULL,
  gross_amount REAL NOT NULL,
  creator_amount REAL NOT NULL,
  platform_amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payout_status TEXT NOT NULL DEFAULT 'pending',
  payout_due_at TEXT,
  paid_at TEXT,
  FOREIGN KEY (usage_event_id) REFERENCES usage_events(id),
  FOREIGN KEY (creator_id) REFERENCES creators(id)
);

CREATE TABLE IF NOT EXISTS provenance_records (
  id TEXT PRIMARY KEY,
  output_asset_id TEXT NOT NULL,
  creator_id TEXT NOT NULL,
  consent_record_id TEXT NOT NULL,
  manifest_ref TEXT,
  manifest_hash TEXT,
  provenance_status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (creator_id) REFERENCES creators(id),
  FOREIGN KEY (consent_record_id) REFERENCES consent_records(id)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  object_type TEXT NOT NULL,
  object_id TEXT NOT NULL,
  decision TEXT,
  reason TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_creators_status ON creators(status);
CREATE INDEX IF NOT EXISTS idx_hvs_creator ON hvs_records(creator_id);
CREATE INDEX IF NOT EXISTS idx_voice_estate_creator ON voice_estates(creator_id);
CREATE INDEX IF NOT EXISTS idx_consent_creator_claimant ON consent_records(creator_id, claimant_id, consent_status);
CREATE INDEX IF NOT EXISTS idx_consent_status ON consent_records(consent_status);
CREATE INDEX IF NOT EXISTS idx_revocations_consent ON revocation_events(consent_record_id);
CREATE INDEX IF NOT EXISTS idx_usage_creator ON usage_events(creator_id);
CREATE INDEX IF NOT EXISTS idx_usage_consent ON usage_events(consent_record_id);
CREATE INDEX IF NOT EXISTS idx_royalty_creator ON royalty_events(creator_id);
CREATE INDEX IF NOT EXISTS idx_provenance_asset ON provenance_records(output_asset_id);
CREATE INDEX IF NOT EXISTS idx_audit_object ON audit_log(object_type, object_id);

-- RSP_001 Founding Seed
INSERT OR IGNORE INTO creators (id,legal_name,display_name,status,payout_destination,created_at,updated_at)
VALUES ('CREATOR_RSP_001','Robert Stephen Plowman','RSP_001','active','wallet://rsp-001','2026-03-27T00:00:00Z','2026-03-27T00:00:00Z');

INSERT OR IGNORE INTO hvs_records (id,creator_id,sovereignty_status,estate_status,created_at,updated_at)
VALUES ('HVS_RSP_001','CREATOR_RSP_001','verified','active','2026-03-27T00:00:00Z','2026-03-27T00:00:00Z');

INSERT OR IGNORE INTO voice_estates (id,creator_id,hvs_id,estate_status,acoustic_fingerprint,governance_json,created_at,updated_at)
VALUES ('VOICE_ESTATE_RSP_001','CREATOR_RSP_001','HVS_RSP_001','active','fingerprint_rsp_001','{"creator_primary_control":true,"delegate_control_enabled":false,"estate_transfer_enabled":true}','2026-03-27T00:00:00Z','2026-03-27T00:00:00Z');

INSERT OR IGNORE INTO consent_records (id,creator_id,hvs_id,claimant_id,consent_status,usage_types_json,authorized_tools_json,term_start,term_end,scope_json,payment_terms_json,provenance_required,dispute_status,revoked_at,signature_json,created_at,updated_at)
VALUES (
  'CONSENT_RSP_001_FOUNDING','CREATOR_RSP_001','HVS_RSP_001','CLAIMANT_NOIZY_FOUNDING','active',
  '["synthesis","derivative"]','["XTTS_v2","RVC","Librosa"]',
  '2026-03-27T00:00:00Z',NULL,
  '{"media":["commercial","non-commercial"],"channels":["platform","api"],"geographic":["global"]}',
  '{"creator_pct":75,"platform_pct":25,"currency":"USD","payout_window_days":7}',
  1,'none',NULL,
  '{"creator_signature":"founding_signature","timestamp":"2026-03-27T00:00:00Z","nonce":"FOUNDING_NONCE"}',
  '2026-03-27T00:00:00Z','2026-03-27T00:00:00Z'
);
