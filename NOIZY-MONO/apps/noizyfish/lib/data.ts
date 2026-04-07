import type { ArchiveItem } from "@noizy/types";

export const ARCHIVE_ITEMS: ArchiveItem[] = [
  {
    id: "humpback-sanctuary-001",
    slug: "humpback-sanctuary-tonga",
    title: "Humpback Sanctuary",
    year: 2019,
    category: "bioacoustic",
    medium: "Hydrophone Array Recording",
    collaborators: [
      { name: "Ocean Conservation Trust", role: "Research Partner" },
      { name: "Dr. Sarah Chen", role: "Marine Biologist" },
    ],
    synopsis:
      "A 47-minute continuous recording of humpback whale songs captured in the Vava'u archipelago of Tonga during the 2019 breeding season. This recording documents a rare vocal exchange between a mother-calf pair and a nearby male escort, revealing previously undocumented harmonic patterns.",
    credits: [
      { role: "Field Recording", name: "Robert Stephen Plowman" },
      { role: "Equipment", name: "DPA 8011 Hydrophone" },
      { role: "Location", name: "Kingdom of Tonga" },
    ],
    tags: ["whale", "humpback", "bioacoustic", "breeding", "tonga", "pacific"],
    rightsStatus: "cleared",
    provenanceStatus: "verified",
    featuredMedia: {
      type: "audio",
      url: "/audio/humpback-sanctuary.wav",
      duration: 2820,
      waveformData: Array.from({ length: 100 }, () => Math.random()),
    },
    legacySignificance:
      "First recording in the NOIZYFISH archive. Establishes the foundation for consent-native ocean sound preservation.",
    restorationNotes:
      "Original DAT tape digitized at 96kHz/24-bit. Minimal processing applied to preserve natural ambience.",
    depth: 15,
    location: { name: "Vava'u, Tonga", lat: -18.65, lng: -173.98, depth: 15 },
    recordedAt: "2019-08-14T06:30:00Z",
    duration: 2820,
    createdAt: "2019-08-20T00:00:00Z",
    updatedAt: "2026-03-01T00:00:00Z",
  },
  {
    id: "midnight-zone-002",
    slug: "midnight-zone-mariana",
    title: "Midnight Zone Ambience",
    year: 2021,
    category: "ambient",
    medium: "Deep-Sea Lander Recording",
    collaborators: [
      { name: "NOAA Ocean Exploration", role: "Research Vessel" },
      { name: "Woods Hole Oceanographic", role: "Technical Support" },
    ],
    synopsis:
      "Ambient soundscape recorded at 3,200 meters depth in the Mariana Trench vicinity. Captures the sparse, ethereal sounds of the bathypelagic zone including distant seismic activity, pressure changes, and unidentified biological sources.",
    credits: [
      { role: "Deployment", name: "RV Okeanos Explorer" },
      { role: "Equipment", name: "Custom Titanium Hydrophone Array" },
      { role: "Depth", name: "3,200m" },
    ],
    tags: ["deep-sea", "ambient", "mariana", "bathypelagic", "pressure"],
    rightsStatus: "cleared",
    provenanceStatus: "verified",
    featuredMedia: {
      type: "audio",
      url: "/audio/midnight-zone.wav",
      duration: 3600,
      waveformData: Array.from({ length: 100 }, () => Math.random() * 0.3),
    },
    legacySignificance:
      "Deepest recording in the archive. Documents sounds from a realm few humans will ever experience.",
    depth: 3200,
    location: {
      name: "Mariana Trench Vicinity",
      lat: 11.35,
      lng: 142.2,
      depth: 3200,
    },
    recordedAt: "2021-05-22T14:00:00Z",
    duration: 3600,
    createdAt: "2021-06-15T00:00:00Z",
    updatedAt: "2026-02-15T00:00:00Z",
  },
  {
    id: "ice-shelf-003",
    slug: "ross-ice-shelf-calving",
    title: "Ice Shelf Calving Event",
    year: 2022,
    category: "weather",
    medium: "Under-Ice Hydrophone",
    collaborators: [
      { name: "Antarctic Research Foundation", role: "Expedition Support" },
      { name: "Dr. James Morton", role: "Glaciologist" },
    ],
    synopsis:
      "Rare underwater recording of a major calving event at the Ross Ice Shelf, Antarctica. The recording captures the buildup of stress fractures, the moment of separation, and the subsequent underwater acoustic chaos as a 12km² section of ice breaks away.",
    credits: [
      { role: "Field Recording", name: "Antarctic Sound Project" },
      { role: "Location", name: "Ross Ice Shelf, Antarctica" },
      { role: "Duration", name: "8 hours (edited)" },
    ],
    tags: ["ice", "calving", "antarctica", "climate", "glacial", "rare"],
    rightsStatus: "cleared",
    provenanceStatus: "verified",
    featuredMedia: {
      type: "audio",
      url: "/audio/ice-shelf-calving.wav",
      duration: 1800,
      waveformData: Array.from({ length: 100 }, (_, i) =>
        i > 60 ? Math.random() * 0.9 + 0.1 : Math.random() * 0.2
      ),
    },
    legacySignificance:
      "Documents a climate event that may become more frequent. Historical evidence of polar change.",
    restorationNotes:
      "Compressed from 8-hour original to 30-minute edit preserving key acoustic events.",
    depth: 45,
    location: { name: "Ross Ice Shelf", lat: -78.5, lng: 175.0, depth: 45 },
    recordedAt: "2022-01-08T03:15:00Z",
    duration: 1800,
    createdAt: "2022-03-01T00:00:00Z",
    updatedAt: "2026-01-20T00:00:00Z",
  },
  {
    id: "reef-dawn-004",
    slug: "great-barrier-reef-dawn-chorus",
    title: "Reef Dawn Chorus",
    year: 2020,
    category: "bioacoustic",
    medium: "Multi-Channel Array",
    collaborators: [
      { name: "Australian Institute of Marine Science", role: "Research Access" },
      { name: "Coral Watch", role: "Site Selection" },
    ],
    synopsis:
      "The extraordinary dawn chorus of a healthy coral reef section near Cairns. Snapping shrimp, parrotfish grazing, damselfish communication, and the subtle crackling of coral polyps feeding create a symphony that indicates reef vitality.",
    credits: [
      { role: "Field Recording", name: "Robert Stephen Plowman" },
      { role: "Location", name: "Great Barrier Reef Marine Park" },
      { role: "Equipment", name: "8-Channel Hydrophone Array" },
    ],
    tags: ["reef", "coral", "dawn", "chorus", "australia", "biodiversity"],
    rightsStatus: "cleared",
    provenanceStatus: "verified",
    featuredMedia: {
      type: "audio",
      url: "/audio/reef-dawn-chorus.wav",
      duration: 2400,
      waveformData: Array.from({ length: 100 }, () => Math.random() * 0.6 + 0.2),
    },
    legacySignificance:
      "Baseline recording of reef health. Future recordings will measure against this acoustic benchmark.",
    depth: 8,
    location: {
      name: "Great Barrier Reef",
      lat: -16.5,
      lng: 145.77,
      depth: 8,
    },
    recordedAt: "2020-03-15T05:30:00Z",
    duration: 2400,
    createdAt: "2020-04-10T00:00:00Z",
    updatedAt: "2026-02-28T00:00:00Z",
  },
  {
    id: "sperm-whale-005",
    slug: "sperm-whale-codas-azores",
    title: "Sperm Whale Codas",
    year: 2023,
    category: "bioacoustic",
    medium: "Towed Array",
    collaborators: [
      { name: "Azores Whale Lab", role: "Research Partner" },
      { name: "Dr. Maria Santos", role: "Cetacean Acoustician" },
    ],
    synopsis:
      "Detailed recording of sperm whale coda exchanges between members of a resident clan in the Azores. These click patterns represent learned cultural behaviors passed between generations, making each clan's repertoire unique and identifiable.",
    credits: [
      { role: "Field Recording", name: "Azores Cetacean Project" },
      { role: "Equipment", name: "Towed Hydrophone Array" },
      { role: "Analysis", name: "Dr. Maria Santos" },
    ],
    tags: ["sperm-whale", "codas", "communication", "azores", "culture"],
    rightsStatus: "cleared",
    provenanceStatus: "verified",
    featuredMedia: {
      type: "audio",
      url: "/audio/sperm-whale-codas.wav",
      duration: 1500,
      waveformData: Array.from({ length: 100 }, (_, i) =>
        i % 10 < 3 ? Math.random() * 0.8 + 0.2 : Math.random() * 0.1
      ),
    },
    legacySignificance:
      "Documents clan-specific vocal culture. Evidence of non-human cultural transmission.",
    depth: 120,
    location: { name: "Azores, Portugal", lat: 38.72, lng: -27.22, depth: 120 },
    recordedAt: "2023-07-20T10:45:00Z",
    duration: 1500,
    createdAt: "2023-08-05T00:00:00Z",
    updatedAt: "2026-03-10T00:00:00Z",
  },
  {
    id: "kelp-forest-006",
    slug: "kelp-forest-california",
    title: "Kelp Forest Ecosystem",
    year: 2024,
    category: "ambient",
    medium: "Stationary Recorder",
    collaborators: [
      { name: "Monterey Bay Aquarium Research", role: "Site Access" },
    ],
    synopsis:
      "24-hour cycle recording within a giant kelp forest off the California coast. Captures the acoustic signature of a complex ecosystem: sea otters feeding, fish movements through kelp fronds, sea urchin activity, and the creaking of kelp stalks in the current.",
    credits: [
      { role: "Field Recording", name: "Pacific Coast Sound Archive" },
      { role: "Location", name: "Monterey Bay, California" },
      { role: "Duration", name: "24-hour cycle" },
    ],
    tags: ["kelp", "forest", "ecosystem", "california", "monterey", "otters"],
    rightsStatus: "cleared",
    provenanceStatus: "verified",
    featuredMedia: {
      type: "audio",
      url: "/audio/kelp-forest.wav",
      duration: 3000,
      waveformData: Array.from({ length: 100 }, () => Math.random() * 0.4 + 0.1),
    },
    legacySignificance:
      "Complete diel cycle of a temperate marine ecosystem. Reference for kelp forest health monitoring.",
    depth: 18,
    location: { name: "Monterey Bay", lat: 36.62, lng: -121.9, depth: 18 },
    recordedAt: "2024-09-01T00:00:00Z",
    duration: 3000,
    createdAt: "2024-09-15T00:00:00Z",
    updatedAt: "2026-03-15T00:00:00Z",
  },
];

export function getArchiveItem(slug: string): ArchiveItem | undefined {
  return ARCHIVE_ITEMS.find((item) => item.slug === slug);
}

export function getRelatedItems(
  currentSlug: string,
  limit = 3
): ArchiveItem[] {
  const current = getArchiveItem(currentSlug);
  if (!current) return [];

  return ARCHIVE_ITEMS.filter((item) => item.slug !== currentSlug)
    .sort((a, b) => {
      const aMatch = a.category === current.category ? 2 : 0;
      const bMatch = b.category === current.category ? 2 : 0;
      const aTagMatch = a.tags.filter((t) => current.tags.includes(t)).length;
      const bTagMatch = b.tags.filter((t) => current.tags.includes(t)).length;
      return bMatch + bTagMatch - (aMatch + aTagMatch);
    })
    .slice(0, limit);
}

export function formatDepthZone(depth?: number): string {
  if (!depth) return "Surface";
  if (depth < 200) return "Sunlight Zone";
  if (depth < 1000) return "Twilight Zone";
  if (depth < 4000) return "Midnight Zone";
  if (depth < 6000) return "Abyssal Zone";
  return "Hadal Zone";
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
