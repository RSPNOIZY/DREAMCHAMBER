// ============================================================
// NOISY FISH — Type Definitions
// Living Legacy Vault + Creative Services Hub
// ============================================================

export interface Env {
  DB: D1Database;
  PROOF: Fetcher;
  API_KEY?: string;
  NOISY_PROOF_API_URL: string;
  NOISY_BOX_API_URL: string;
  PLATFORM_NAME: string;
  PLATFORM_VERSION: string;
}

// --- Sacred Invariants (same discipline as NOISY BOX) ---
export const SACRED = {
  ROYALTY_FLOOR_BPS: 7500,
  GORUNFREE_TITHE_BPS: 100,
  GORUNFREE_RECIPIENT: 'NOIZYKIDZ',
  KILL_SWITCH: 'absolute',
  AUDIT_APPEND_ONLY: true,
  ATTRIBUTION_LOCKED: true,
} as const;

// --- Pricing Tiers ---
export const PRICING_TIERS = {
  educational: { min: 50, max: 200, discount_pct: 0, description: 'Students, educators, workshops' },
  noizykidz: { min: 40, max: 160, discount_pct: 20, description: 'NOIZYKIDZ curriculum — 20% strategic discount' },
  commercial: { min: 500, max: 2000, discount_pct: 0, description: 'Indie games, small film, podcasts' },
  enterprise: { min: 5000, max: 50000, discount_pct: 0, description: 'AAA studios, streaming platforms, major film' },
} as const;

// --- Catalog Title ---
export interface CatalogTitle {
  id: string;
  title: string;
  project?: string;
  composer: string;
  year?: number;
  era_tag?: string;
  duration_ms?: number;
  bpm?: number;
  musical_key?: string;
  scale?: string;
  time_signature: string;
  mood_tags?: string[];
  emotional_arc?: string;
  instrumentation?: string[];
  genre_tags?: string[];
  technical_difficulty?: string;
  rights_status: string;
  clearance_status: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// --- Catalog Asset ---
export interface CatalogAsset {
  id: string;
  title_id: string;
  asset_type: 'master' | 'stem' | 'mix' | 'sketch' | 'alternate' | 'demo';
  file_ref: string;
  stems_ref?: string;
  format: string;
  sample_rate?: number;
  bit_depth?: number;
  file_size_bytes?: number;
  checksum?: string;
  status: string;
  created_at: string;
}

// --- Production Note ---
export interface ProductionNote {
  id: string;
  title_id: string;
  note_type: 'creative_choice' | 'technical' | 'story' | 'lesson' | 'context';
  content: string;
  voice_ref?: string;
  author: string;
  tags?: string[];
  teachable: boolean;
  created_at: string;
}

// --- License ---
export interface License {
  id: string;
  title_id: string;
  tier: 'educational' | 'commercial' | 'enterprise' | 'noizykidz';
  customer_ref: string;
  customer_name?: string;
  customer_type?: string;
  fee: number;
  currency: string;
  term_start: string;
  term_end?: string;
  territory: string;
  usage_scope?: string;
  exclusivity: string;
  consent_required: boolean;
  status: string;
  created_at: string;
}

// --- Attribution Log ---
export interface AttributionEntry {
  id: string;
  license_id: string;
  title_id: string;
  attribution_text: string;
  manifest_ref?: string;
  context?: string;
  verified: boolean;
  created_at: string;
}

// --- Royalty Event ---
export interface RoyaltyEvent {
  id: string;
  license_id: string;
  title_id: string;
  event_type: 'license_fee' | 'performance' | 'streaming' | 'sync' | 'mechanical';
  payee_id: string;
  payee_type: 'composer' | 'platform' | 'gorunfree' | 'collaborator';
  gross_amount: number;
  creator_share: number;
  platform_share: number;
  gorunfree_tithe: number;
  gorunfree_recipient: string;
  net_amount: number;
  currency: string;
  routing?: string;
  status: string;
  created_at: string;
}

// --- Lucy Observation ---
export interface LucyObservation {
  id: string;
  observation_type: 'trend' | 'opportunity' | 'recommendation' | 'pattern' | 'gap';
  subject_type: 'title' | 'era' | 'style' | 'market' | 'creator';
  subject_id?: string;
  observation: string;
  confidence: number;
  data_points?: any;
  acted_on: boolean;
  created_at: string;
}
