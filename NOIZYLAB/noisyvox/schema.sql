-- Voice models registry
CREATE TABLE IF NOT EXISTS voice_models (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  creator_id TEXT NOT NULL,
  voice_identity_id TEXT NOT NULL, -- Links to Noisy Proof identity
  model_type TEXT NOT NULL, -- 'xtts', 'bark', 'custom'
  model_url TEXT NOT NULL,
  sample_audio_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'active' -- 'active', 'disabled', 'archived'
);

-- Voice model parameters
CREATE TABLE IF NOT EXISTS model_parameters (
  id TEXT PRIMARY KEY,
  voice_model_id TEXT NOT NULL,
  parameter_set TEXT NOT NULL, -- JSON of model-specific params
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (voice_model_id) REFERENCES voice_models(id)
);

-- Synthesis requests log
CREATE TABLE IF NOT EXISTS synthesis_requests (
  id TEXT PRIMARY KEY,
  voice_model_id TEXT NOT NULL,
  requester_id TEXT NOT NULL,
  text_hash TEXT NOT NULL,
  fingerprint_id TEXT, -- From Noisy Proof
  consent_record_id TEXT, -- From consent check
  status TEXT NOT NULL, -- 'pending', 'authorized', 'synthesized', 'rejected'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (voice_model_id) REFERENCES voice_models(id)
);

-- Voice model access control
CREATE TABLE IF NOT EXISTS model_access (
  id TEXT PRIMARY KEY,
  voice_model_id TEXT NOT NULL,
  granted_to_id TEXT NOT NULL, -- User/org with access
  access_type TEXT NOT NULL, -- 'public', 'private', 'paid'
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  FOREIGN KEY (voice_model_id) REFERENCES voice_models(id)
);

-- Indexes
CREATE INDEX idx_models_creator ON voice_models(creator_id);
CREATE INDEX idx_models_identity ON voice_models(voice_identity_id);
CREATE INDEX idx_requests_model ON synthesis_requests(voice_model_id);
CREATE INDEX idx_requests_requester ON synthesis_requests(requester_id);
CREATE INDEX idx_access_model ON model_access(voice_model_id);
CREATE INDEX idx_access_grantee ON model_access(granted_to_id);
