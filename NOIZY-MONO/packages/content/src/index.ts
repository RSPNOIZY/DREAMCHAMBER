/**
 * @noizy/content
 * Shared content models and copy definitions for NOIZY Empire
 * "Shared primitives, separate souls"
 */

// ═══════════════════════════════════════════════════════════════════════════
// COPY CONTRACTS — Approved vocabulary
// ═══════════════════════════════════════════════════════════════════════════

/**
 * APPROVED TERMS — Use these freely
 */
export const APPROVED_COPY = {
  // Provenance language
  provenance: [
    "provenance-verified",
    "chain of custody",
    "origin-traced",
    "heritage preserved",
    "lineage documented",
    "museum-grade",
    "archival quality",
    "cryptographically verified",
  ],

  // Consent language
  consent: [
    "consent-native",
    "creator-first",
    "sovereign",
    "your terms",
    "explicit permission",
    "revocable",
    "granular control",
    "rights-aware",
  ],

  // Quality language
  quality: [
    "premium",
    "curated",
    "exceptional",
    "refined",
    "distinctive",
    "elevated",
    "thoughtful",
    "intentional",
  ],

  // Action language
  action: [
    "discover",
    "explore",
    "preserve",
    "protect",
    "honor",
    "enroll",
    "contribute",
  ],
} as const;

/**
 * FORBIDDEN TERMS — Never use these
 */
export const FORBIDDEN_COPY = [
  // Generic AI/SaaS
  "leverage",
  "utilize",
  "streamline",
  "empower",
  "supercharge",
  "unlock",
  "unleash",
  "game-changing",
  "disruptive",
  "innovative", // unless truly novel
  "cutting-edge",
  "state-of-the-art",
  "next-generation",
  "revolutionary",

  // Buzzwords
  "synergy",
  "paradigm",
  "ecosystem" as 'ecosystem', // use sparingly, with care
  "holistic",
  "robust",
  "scalable", // technical contexts only
  "seamless",
  "frictionless",

  // Hyperbole
  "amazing",
  "incredible",
  "awesome",
  "mind-blowing",
  "game-changer",
  "best-in-class",
  "world-class",

  // Vague AI terms
  "AI-powered",
  "machine learning",
  "neural network",
  "deep learning",
  // Instead: describe what it actually does
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// BRAND TOKENS — Per-portal identity
// ═══════════════════════════════════════════════════════════════════════════

export interface BrandTokens {
  name: string;
  tagline: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  metaphor: string;
  tone: string[];
}

export const NOIZYFISH_BRAND: BrandTokens = {
  name: "NOIZYFISH",
  tagline: "Ocean archives. Provenance preserved.",
  description: "Museum-grade audio archive for ocean and environmental recordings. Every sample carries its full lineage.",
  primaryColor: "cyan",
  accentColor: "teal",
  metaphor: "The ocean remembers everything. We help it speak.",
  tone: ["reverent", "archival", "scientific", "poetic"],
};

export const NOIZYVOX_BRAND: BrandTokens = {
  name: "NOIZYVOX",
  tagline: "Your voice. Your terms.",
  description: "Sovereign voice identity platform. Consent-native infrastructure for human performers.",
  primaryColor: "amber",
  accentColor: "orange",
  metaphor: "Your voice is your signature. We keep it yours.",
  tone: ["empowering", "professional", "protective", "warm"],
};

// ═══════════════════════════════════════════════════════════════════════════
// CONTENT MODELS — Structured content
// ═══════════════════════════════════════════════════════════════════════════

export interface HeroContent {
  headline: string;
  subheadline: string;
  cta: {
    primary: { label: string; href: string };
    secondary?: { label: string; href: string };
  };
}

export interface FeatureContent {
  title: string;
  description: string;
  icon?: string;
}

export interface TestimonialContent {
  quote: string;
  author: string;
  role: string;
  organization?: string;
}

export interface FAQContent {
  question: string;
  answer: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// NOIZYFISH CONTENT
// ═══════════════════════════════════════════════════════════════════════════

export const NOIZYFISH_CONTENT = {
  hero: {
    headline: "Ocean archives. Provenance preserved.",
    subheadline: "Museum-grade audio recordings from the world's waters. Every sample carries its full lineage—origin-traced, heritage preserved.",
    cta: {
      primary: { label: "Explore Archive", href: "/archive" },
      secondary: { label: "Our Lineage", href: "/lineage" },
    },
  } satisfies HeroContent,

  features: [
    {
      title: "Verified Origins",
      description: "Every recording traced to its source. GPS coordinates, recording equipment, environmental conditions—all preserved.",
    },
    {
      title: "Chain of Custody",
      description: "Cryptographic verification from capture to catalog. Know exactly where your sample has been.",
    },
    {
      title: "Archival Quality",
      description: "Uncompressed, high-resolution audio preserved for future generations. The ocean's voice, faithfully recorded.",
    },
    {
      title: "Consent-Aware",
      description: "Recordings from protected species and sensitive locations handled with appropriate permissions and restrictions.",
    },
  ] satisfies FeatureContent[],

  philosophy: {
    quote: "The archive is not a warehouse. It is a living memory—an act of preservation that honors what came before while serving what comes next.",
    author: "NOIZYFISH",
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// NOIZYVOX CONTENT
// ═══════════════════════════════════════════════════════════════════════════

export const NOIZYVOX_CONTENT = {
  hero: {
    headline: "Your voice. Your terms.",
    subheadline: "Sovereign voice identity for the age of synthesis. Control who uses your voice, how they use it, and revoke permission at any time.",
    cta: {
      primary: { label: "Start Enrollment", href: "/onboarding" },
      secondary: { label: "How It Works", href: "/trust" },
    },
  } satisfies HeroContent,

  features: [
    {
      title: "Explicit Consent",
      description: "No assumptions. No defaults. Every use of your voice requires your explicit, granular permission.",
    },
    {
      title: "Instant Revocation",
      description: "Change your mind at any time. The Kill Switch immediately halts all synthetic use of your voice.",
    },
    {
      title: "Transparent Usage",
      description: "See exactly where and how your voice is being used. Every synthesis logged, every usage tracked.",
    },
    {
      title: "Fair Compensation",
      description: "75/25 split. You take 75% of every transaction involving your voice. Automatically distributed.",
    },
  ] satisfies FeatureContent[],

  philosophy: {
    quote: "Consent is not a checkbox. It is the foundation of every interaction between human creators and synthetic systems.",
    author: "NOIZYVOX",
  },

  trustPillars: [
    {
      title: "Never Clauses",
      description: "Immutable prohibitions that can never be overridden. No voice used without consent. No consent assumed. No data sold.",
    },
    {
      title: "Voice DNA",
      description: "Your unique vocal fingerprint, encrypted and protected. Used only to verify authenticity, never to synthesize without permission.",
    },
    {
      title: "Consent Kernel",
      description: "Every synthesis request checked against live consent before execution. Denied requests logged for transparency.",
    },
    {
      title: "Estate Rights",
      description: "Your voice rights extend beyond your lifetime. Designate successors, define posthumous permissions, preserve your legacy.",
    },
  ] satisfies FeatureContent[],
};

// ═══════════════════════════════════════════════════════════════════════════
// SHARED LEGAL COPY
// ═══════════════════════════════════════════════════════════════════════════

export const LEGAL_COPY = {
  consent_disclaimer: "All consent decisions are binding and recorded on an immutable ledger. You may revoke consent at any time, but previous authorized uses remain valid.",

  data_usage: "We collect only what we need to protect your rights. Your data is never sold, shared, or used for purposes other than consent verification.",

  third_party: "Third-party platforms accessing your voice through NOIZY are bound by the same consent rules. Violations result in immediate access termination.",

  jurisdiction: "NOIZY operates under Canadian law. All disputes resolved in Quebec, Canada.",
};
