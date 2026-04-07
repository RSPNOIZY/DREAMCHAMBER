// ═══════════════════════════════════════════════════════════════════════════
// NOIZY SHARED TYPES
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// NOIZYFISH TYPES — Archive System
// ─────────────────────────────────────────────────────────────────────────────

export interface ArchiveItem {
  id: string;
  slug: string;
  title: string;
  year: number;
  category: ArchiveCategory;
  medium: string;
  collaborators: Collaborator[];
  synopsis: string;
  credits: Credit[];
  tags: string[];
  rightsStatus: RightsStatus;
  provenanceStatus: ProvenanceStatus;
  featuredMedia: MediaAsset;
  legacySignificance: string;
  restorationNotes?: string;
  externalReferences?: ExternalReference[];
  depth?: number; // Ocean depth in meters
  location?: GeoLocation;
  recordedAt?: string;
  duration?: number; // seconds
  createdAt: string;
  updatedAt: string;
}

export type ArchiveCategory =
  | "ambient"
  | "bioacoustic"
  | "mechanical"
  | "weather"
  | "human"
  | "composition"
  | "field-recording"
  | "restoration";

export interface Collaborator {
  name: string;
  role: string;
  id?: string;
}

export interface Credit {
  role: string;
  name: string;
  organization?: string;
}

export type RightsStatus = "cleared" | "pending" | "restricted" | "public-domain";

export type ProvenanceStatus = "verified" | "pending" | "unverified";

export interface MediaAsset {
  type: "audio" | "video" | "image";
  url: string;
  thumbnail?: string;
  duration?: number;
  format?: string;
  waveformData?: number[];
}

export interface ExternalReference {
  label: string;
  url: string;
  type: "research" | "source" | "related" | "documentation";
}

export interface GeoLocation {
  name: string;
  lat: number;
  lng: number;
  depth?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// NOIZYVOX TYPES — Voice Platform
// ─────────────────────────────────────────────────────────────────────────────

export interface VoiceProfile {
  id: string;
  slug: string;
  performerName: string;
  voiceSummary: string;
  tonalDescriptors: string[];
  strengths: string[];
  languages: Language[];
  licensingReadiness: ReadinessStatus;
  consentReadiness: ReadinessStatus;
  sampleAvailable: boolean;
  sampleUrl?: string;
  ageRange?: string;
  styleCategories: VoiceStyle[];
  notes?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Language {
  code: string;
  name: string;
  fluency: "native" | "fluent" | "conversational" | "basic";
  accent?: string;
}

export type ReadinessStatus = "ready" | "pending" | "unavailable";

export type VoiceStyle =
  | "narration"
  | "commercial"
  | "character"
  | "documentary"
  | "audiobook"
  | "animation"
  | "podcast"
  | "corporate"
  | "dramatic"
  | "conversational";

// ─────────────────────────────────────────────────────────────────────────────
// CONSENT TYPES — Shared Infrastructure
// ─────────────────────────────────────────────────────────────────────────────

export interface ConsentState {
  recordingConsent: ConsentPermission;
  modelTrainingConsent: ConsentPermission;
  commercialUsage: CommercialPermission;
  revocationStatus: RevocationStatus;
  attributionRequired: boolean;
  approvalRequired: boolean;
  territoryScope: Territory[];
  duration: DurationScope;
  licensingStatus: LicensingStatus;
  readinessState: ReadinessStatus;
}

export interface ConsentPermission {
  granted: boolean;
  grantedAt?: string;
  scope?: string;
  restrictions?: string[];
}

export interface CommercialPermission {
  allowed: boolean;
  categories?: CommercialCategory[];
  excludedCategories?: CommercialCategory[];
  minimumFee?: number;
  currency?: string;
}

export type CommercialCategory =
  | "advertising"
  | "film"
  | "television"
  | "gaming"
  | "audiobook"
  | "podcast"
  | "corporate"
  | "education"
  | "non-profit";

export type RevocationStatus = "active" | "revoked" | "suspended";

export interface Territory {
  code: string;
  name: string;
}

export interface DurationScope {
  type: "perpetual" | "limited" | "project";
  expiresAt?: string;
  projectName?: string;
}

export type LicensingStatus = "available" | "exclusive" | "unavailable";

// ─────────────────────────────────────────────────────────────────────────────
// ONBOARDING TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface OnboardingState {
  currentStep: number;
  completedSteps: number[];
  creatorIdentity: CreatorIdentity;
  voiceGoals: VoiceGoals;
  recordingConsent: RecordingConsentStep;
  modelPermissions: ModelPermissions;
  downstreamUsage: DownstreamUsage;
  attributionPreferences: AttributionPreferences;
  territoryDuration: TerritoryDuration;
  reviewComplete: boolean;
}

export interface CreatorIdentity {
  legalName: string;
  performerName: string;
  email: string;
  country: string;
  verified: boolean;
}

export interface VoiceGoals {
  primaryUseCase: string;
  targetAudience: string;
  experienceLevel: string;
}

export interface RecordingConsentStep {
  understandsProcess: boolean;
  agreesToRecording: boolean;
  acknowledgesOwnership: boolean;
}

export interface ModelPermissions {
  allowsModelCreation: boolean;
  allowsFineTuning: boolean;
  retainsOwnership: boolean;
}

export interface DownstreamUsage {
  allowedCategories: CommercialCategory[];
  excludedCategories: CommercialCategory[];
  requiresApproval: boolean;
}

export interface AttributionPreferences {
  requiresAttribution: boolean;
  preferredCredit: string;
  allowsAnonymous: boolean;
}

export interface TerritoryDuration {
  territories: Territory[];
  durationType: DurationScope["type"];
  specificDuration?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// UI COMPONENT TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type StatusVariant = "success" | "warning" | "error" | "info" | "neutral";

export interface StatusChipProps {
  label: string;
  variant: StatusVariant;
  size?: "sm" | "md" | "lg";
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
  multiple?: boolean;
}
