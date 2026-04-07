import type { VoiceProfile, ConsentState, OnboardingState } from "@noizy/types";

export const VOICE_PROFILES: VoiceProfile[] = [
  {
    id: "vp-001",
    slug: "elena-vasiliev",
    performerName: "Elena Vasiliev",
    voiceSummary: "Rich mezzo-soprano with natural warmth and European character. Excels in documentary narration and audiobook performance.",
    tonalDescriptors: ["warm", "authoritative", "measured", "intimate"],
    strengths: ["long-form narration", "technical clarity", "emotional depth", "multiple accents"],
    languages: [
      { code: "en", name: "English", fluency: "native", accent: "Mid-Atlantic" },
      { code: "ru", name: "Russian", fluency: "native" },
      { code: "fr", name: "French", fluency: "fluent" },
    ],
    licensingReadiness: "ready",
    consentReadiness: "ready",
    sampleAvailable: true,
    sampleUrl: "/samples/elena-vasiliev.mp3",
    ageRange: "35-50",
    styleCategories: ["narration", "documentary", "audiobook", "corporate"],
    avatarUrl: "/avatars/elena.jpg",
    createdAt: "2025-08-15T00:00:00Z",
    updatedAt: "2026-03-01T00:00:00Z",
  },
  {
    id: "vp-002",
    slug: "marcus-chen",
    performerName: "Marcus Chen",
    voiceSummary: "Deep baritone with exceptional range. Known for character work and dramatic delivery in gaming and animation.",
    tonalDescriptors: ["deep", "versatile", "commanding", "dynamic"],
    strengths: ["character voices", "dramatic range", "gaming", "action sequences"],
    languages: [
      { code: "en", name: "English", fluency: "native", accent: "California" },
      { code: "zh", name: "Mandarin", fluency: "conversational" },
    ],
    licensingReadiness: "ready",
    consentReadiness: "ready",
    sampleAvailable: true,
    sampleUrl: "/samples/marcus-chen.mp3",
    ageRange: "30-45",
    styleCategories: ["character", "animation", "dramatic", "commercial"],
    avatarUrl: "/avatars/marcus.jpg",
    createdAt: "2025-09-20T00:00:00Z",
    updatedAt: "2026-02-15T00:00:00Z",
  },
  {
    id: "vp-003",
    slug: "sarah-okonkwo",
    performerName: "Sarah Okonkwo",
    voiceSummary: "Bright, energetic alto with natural enthusiasm. Perfect for commercial work, podcasts, and lifestyle content.",
    tonalDescriptors: ["bright", "energetic", "approachable", "youthful"],
    strengths: ["commercial", "lifestyle", "podcast hosting", "explainer content"],
    languages: [
      { code: "en", name: "English", fluency: "native", accent: "British RP" },
      { code: "yo", name: "Yoruba", fluency: "fluent" },
    ],
    licensingReadiness: "ready",
    consentReadiness: "pending",
    sampleAvailable: true,
    sampleUrl: "/samples/sarah-okonkwo.mp3",
    ageRange: "25-35",
    styleCategories: ["commercial", "podcast", "conversational", "corporate"],
    avatarUrl: "/avatars/sarah.jpg",
    createdAt: "2025-11-01T00:00:00Z",
    updatedAt: "2026-03-10T00:00:00Z",
  },
  {
    id: "vp-004",
    slug: "james-morrison",
    performerName: "James Morrison",
    voiceSummary: "Gravelly tenor with cinematic presence. Ideal for trailers, promos, and high-impact commercial spots.",
    tonalDescriptors: ["gravelly", "cinematic", "intense", "memorable"],
    strengths: ["trailers", "promos", "dramatic impact", "brand voice"],
    languages: [
      { code: "en", name: "English", fluency: "native", accent: "American Standard" },
    ],
    licensingReadiness: "pending",
    consentReadiness: "ready",
    sampleAvailable: true,
    sampleUrl: "/samples/james-morrison.mp3",
    ageRange: "40-55",
    styleCategories: ["commercial", "dramatic", "narration"],
    avatarUrl: "/avatars/james.jpg",
    createdAt: "2026-01-05T00:00:00Z",
    updatedAt: "2026-03-05T00:00:00Z",
  },
  {
    id: "vp-005",
    slug: "rsp-001",
    performerName: "Robert Stephen Plowman",
    voiceSummary: "Founding voice of NOIZYVOX. Natural baritone with technical precision and genuine warmth. The first consent-native enrolled performer.",
    tonalDescriptors: ["natural", "technical", "warm", "trustworthy"],
    strengths: ["technical narration", "documentary", "founder voice", "authentic delivery"],
    languages: [
      { code: "en", name: "English", fluency: "native", accent: "Canadian" },
    ],
    licensingReadiness: "ready",
    consentReadiness: "ready",
    sampleAvailable: true,
    sampleUrl: "/samples/rsp-001.mp3",
    ageRange: "45-55",
    styleCategories: ["narration", "documentary", "corporate", "podcast"],
    notes: "Founder enrollment — first voice in the NOIZYVOX consent system.",
    avatarUrl: "/avatars/rsp.jpg",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2026-04-01T00:00:00Z",
  },
];

export const DEFAULT_CONSENT_STATE: ConsentState = {
  recordingConsent: { granted: false },
  modelTrainingConsent: { granted: false },
  commercialUsage: { allowed: false },
  revocationStatus: "active",
  attributionRequired: true,
  approvalRequired: true,
  territoryScope: [],
  duration: { type: "limited" },
  licensingStatus: "unavailable",
  readinessState: "pending",
};

export const INITIAL_ONBOARDING_STATE: OnboardingState = {
  currentStep: 0,
  completedSteps: [],
  creatorIdentity: {
    legalName: "",
    performerName: "",
    email: "",
    country: "",
    verified: false,
  },
  voiceGoals: {
    primaryUseCase: "",
    targetAudience: "",
    experienceLevel: "",
  },
  recordingConsent: {
    understandsProcess: false,
    agreesToRecording: false,
    acknowledgesOwnership: false,
  },
  modelPermissions: {
    allowsModelCreation: false,
    allowsFineTuning: false,
    retainsOwnership: true,
  },
  downstreamUsage: {
    allowedCategories: [],
    excludedCategories: [],
    requiresApproval: true,
  },
  attributionPreferences: {
    requiresAttribution: true,
    preferredCredit: "",
    allowsAnonymous: false,
  },
  territoryDuration: {
    territories: [],
    durationType: "limited",
  },
  reviewComplete: false,
};

export function getVoiceProfile(slug: string): VoiceProfile | undefined {
  return VOICE_PROFILES.find((v) => v.slug === slug);
}

export function getReadyVoices(): VoiceProfile[] {
  return VOICE_PROFILES.filter(
    (v) => v.consentReadiness === "ready" && v.licensingReadiness === "ready"
  );
}

export function filterVoices(filters: {
  style?: string;
  language?: string;
  readiness?: string;
}): VoiceProfile[] {
  return VOICE_PROFILES.filter((voice) => {
    if (filters.style && !voice.styleCategories.includes(filters.style as any)) {
      return false;
    }
    if (filters.language && !voice.languages.some((l) => l.code === filters.language)) {
      return false;
    }
    if (filters.readiness === "ready") {
      return voice.consentReadiness === "ready" && voice.licensingReadiness === "ready";
    }
    return true;
  });
}
