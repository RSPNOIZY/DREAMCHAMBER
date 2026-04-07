# Platform Policies

## Summary

This file tracks platform-level AI disclosure, provenance, and monetization policy differences.

## Platforms To Track

### Apple

- AI disclosure metadata
- Provider-side reporting requirements
- Artwork, track, composition, and video transparency fields

### Spotify

- DDEX-aligned credits and disclosures
- Impersonation restrictions
- Spam and fraud handling

### Deezer

- Detection and labeling of fully AI-generated tracks
- Recommendation and editorial treatment

### YouTube

- Synthetic content disclosure
- Monetization policy impact

### SoundCloud

- Fan-powered royalties
- Opt-in boundaries for model training

## Design Implication

NOIZY needs a Platform Policy Adapter instead of a single global AI flag.

## Next Actions

- Add a matrix of fields required by each platform.
- Define export logic from one canonical provenance schema.

