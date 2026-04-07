// ============================================================
// NOISY BOX — Type Definitions
// ============================================================

export interface Env {
  DB: D1Database;
  PROOF: Fetcher;
  API_KEY?: string;
  NOISY_PROOF_API_URL: string;
  NOISY_FISH_API_URL: string;
  PLATFORM_NAME: string;
  PLATFORM_VERSION: string;
}

// --- Sacred Invariants (NEVER modify) ---
export const SACRED = {
  ROYALTY_FLOOR_BPS: 7500,        // 75% to creator — NEVER lower
  GORUNFREE_TITHE_BPS: 100,      // 1% to NOIZYKIDZ — irremovable
  GORUNFREE_RECIPIENT: 'NOIZYKIDZ',
  KILL_SWITCH: 'absolute',        // No override, no lawyer required
  AUDIT_APPEND_ONLY: true,        // No UPDATE, no DELETE on audit_log
  CONSENT_IMMUTABLE: true,        // consent_profiles: no UPDATE after creation
} as const;

// --- Creator ---
export interface Creator {
  id: string;
  display_name: string;
  legal_name?: string;
  archetype: CreatorArchetype;
  bio?: string;
  contact_email?: string;
  status: 'pending' | 'active' | 'suspended' | 'estate';
  onboarded_at?: string;
  created_at: string;
  updated_at: string;
}

export type CreatorArchetype = 'vocalist' | 'narrator' | 'character_actor' | 'singer' | 'voice_over';

// --- Consent Profile ---
export interface ConsentProfile {
  id: string;
  creator_id: string;
  consent_hash: string;
  never_clauses_hash: string;
  never_clauses_json: string;
  token_id: string;
  terms_version: string;
  status: 'active' | 'revoked' | 'expired';
  granted_at: string;
  expires_at?: string;
  revoked_at?: string;
  revocation_reason?: string;
  created_at: string;
}

// --- Voice Asset ---
export interface VoiceAsset {
  id: string;
  creator_id: string;
  consent_profile_id: string;
  capture_ref: string;
  sample_rate: number;
  bit_depth: number;
  channels: number;
  duration_ms: number;
  format: 'wav' | 'flac';
  provenance_manifest_ref?: string;
  fingerprint_id?: string;
  quality_gate_status: 'pending' | 'passed' | 'failed' | 'review';
  quality_gate_notes?: string;
  status: 'active' | 'archived' | 'revoked';
  created_at: string;
}

// --- Session ---
export interface Session {
  id: string;
  creator_id: string;
  session_type: 'capture' | 'character' | 'review' | 'calibration';
  director_notes?: string;
  start_ts: string;
  end_ts?: string;
  status: 'active' | 'completed' | 'abandoned';
  notes_ref?: string;
  created_at: string;
}

// --- Take ---
export interface Take {
  id: string;
  session_id: string;
  take_no: number;
  voice_asset_id?: string;
  blessed: boolean;
  deviation_flags?: string[];
  manifest_ref?: string;
  duration_ms?: number;
  notes?: string;
  created_at: string;
}

// --- Character ---
export interface Character {
  id: string;
  creator_id: string;
  source_session_id?: string;
  character_name: string;
  variant_label: string;
  description?: string;
  voice_parameters?: VoiceParameters;
  consent_profile_id: string;
  status: 'active' | 'retired' | 'revoked';
  created_at: string;
}

export interface VoiceParameters {
  pitch_shift?: number;
  speed?: number;
  emotion_profile?: string;
  warmth?: number;
  breathiness?: number;
  resonance?: string;
}

// --- Auth Score ---
export interface AuthScore {
  id: string;
  take_id: string;
  scorer_model: 'gemma4' | 'resemblyzer' | 'manual';
  similarity_score: number;
  naturalness_score: number;
  intelligibility_score?: number;
  overall_score: number;
  notes?: string;
  scored_at: string;
}

// --- Usage Receipt ---
export interface UsageReceipt {
  id: string;
  voice_asset_id?: string;
  character_id?: string;
  project_id?: string;
  project_name?: string;
  requester_id: string;
  usage_type: 'synthesis' | 'license' | 'sample' | 'derivative' | 'teaching';
  start_ts: string;
  end_ts?: string;
  duration_ms?: number;
  text_content_hash?: string;
  consent_hash: string;
  gross_amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'disputed' | 'refunded';
  created_at: string;
}

// --- Royalty Split ---
export interface RoyaltySplit {
  id: string;
  receipt_id: string;
  payee_id: string;
  payee_type: 'creator' | 'platform' | 'gorunfree' | 'collaborator';
  basis_points: number;
  amount: number;
  currency: string;
  routing?: string;
  status: 'pending' | 'processed' | 'failed';
  created_at: string;
}

// --- Lucy Observation ---
export interface LucyObservation {
  id: string;
  observation_type: 'trend' | 'opportunity' | 'risk' | 'recommendation' | 'pattern';
  subject_type: 'creator' | 'character' | 'market' | 'catalog';
  subject_id?: string;
  observation: string;
  confidence: number;
  data_points?: any;
  acted_on: boolean;
  created_at: string;
}

// --- Audit Log Entry ---
export interface AuditLogEntry {
  id: string;
  event_type: string;
  actor_id: string;
  actor_type: 'creator' | 'system' | 'admin' | 'lucy' | 'requester';
  resource_type: string;
  resource_id: string;
  action: string;
  metadata?: any;
  timestamp: string;
  block_hash: string;
  previous_hash: string;
}

// --- API Responses ---
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    sacred_invariants: typeof SACRED;
    platform: string;
    version: string;
    timestamp: string;
  };
}
