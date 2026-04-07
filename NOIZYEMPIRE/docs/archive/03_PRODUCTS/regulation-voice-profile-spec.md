# Regulation Voice Profile Spec

## Summary

This spec defines the minimum profile structure for creator-owned voices intended for predictable, low-surprise delivery.

It is designed for Regulation Voices, Calm Studio, and related NOIZYVOX branches.

## Profile Purpose

A regulation voice profile is not just a clone.

It is a governed delivery envelope that constrains how a voice behaves in sensitive listening contexts.

## Required Fields

### Identity

- `voice_id`
- `artist_id`
- `voice_name`
- `status`
- `version`

### Context

- `allowed_contexts`
- `restricted_contexts`
- `disclosure_requirements`
- `intended_modes`

### Listening Behavior

- `default_mode`
- `speech_rate_band`
- `prosody_bounds`
- `dynamic_range_ceiling`
- `pause_spacing_profile`
- `sibilance_softening`
- `breath_texture`
- `stereo_behavior`
- `whisper_allowed`

### Safety Defaults

- `soft_start_ms`
- `soft_end_ms`
- `mono_recommended`
- `no_asmr_variant_available`
- `preview_required_before_publish`

### Governance

- `creator_notes`
- `revocation_rules`
- `qa_status`
- `last_reviewed_at`

## Recommended Mode Set

At minimum, support:

- calm
- story
- focus
- sleep

Each mode should define:

- target pacing
- prosody range
- loudness behavior
- acceptable breath presence

## QA Gates

A voice profile should not publish until it passes:

- stable loudness across preview lines
- no sharp transient spikes
- no sudden pitch jumps outside chosen bounds
- acceptable playback on speakers and headphones
- context restrictions configured

## Example Profile Object

```json
{
  "voice_id": "rv_001",
  "artist_id": "artist_001",
  "voice_name": "North Window",
  "status": "published",
  "version": "1.0",
  "allowed_contexts": ["education", "calm_narration", "accessibility"],
  "restricted_contexts": ["political", "adult", "medical_claims"],
  "intended_modes": ["calm", "story", "sleep"],
  "default_mode": "calm",
  "speech_rate_band": "slow",
  "prosody_bounds": "narrow",
  "dynamic_range_ceiling": "low",
  "pause_spacing_profile": "generous",
  "sibilance_softening": "mild",
  "breath_texture": "subtle",
  "stereo_behavior": "mono",
  "whisper_allowed": false,
  "soft_start_ms": 250,
  "soft_end_ms": 350,
  "mono_recommended": true,
  "no_asmr_variant_available": true,
  "preview_required_before_publish": true,
  "qa_status": "pass"
}
```

## Product Rules

- profile constraints must be visible to the artist
- allowed and restricted contexts must be enforced at generation time
- buyers should see plain-language summaries, not raw parameter dumps
- updates must preserve audit history

## Related Files

- [regulation-voices-product-spec.md](./regulation-voices-product-spec.md)
- [calm-studio-product-spec.md](./calm-studio-product-spec.md)
- [neuroacoustic-safety-charter.md](./neuroacoustic-safety-charter.md)
