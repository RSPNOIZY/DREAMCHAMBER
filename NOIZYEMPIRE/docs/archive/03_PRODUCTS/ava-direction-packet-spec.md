# AVA Direction Packet Spec

## Summary

This spec turns direction-as-resonance into a repeatable NOIZYVOX artifact.

AVA should not replace the director.
AVA should compress and transmit the director's field clearly enough that an actor can inhabit it quickly and truthfully.

Every live or asynchronous NOIZYVOX session should be able to produce:

- one actor-facing signal card
- one structured direction packet
- one NOIZYFISH continuity handoff

Machine-readable companion:

- [ava-direction-packet-schema.json](./ava-direction-packet-schema.json)

Human-facing companion:

- [actor-facing-signal-card.md](./actor-facing-signal-card.md)

## Purpose

The direction packet exists to help a performance land at a nervous-system level before analysis starts over-correcting the actor's instinct.

Its job is to carry:

- vision
- pressure
- emotional temperature
- sensory anchors
- boundaries
- world continuity

without collapsing into line-by-line micromanagement.

## Core Rule

AVA is a field translator, not a performance author.

It should:

- clarify the brief
- scale the brief across multiple actors when needed
- keep the shared world coherent
- preserve role-specific nuance

It should not:

- write the actor's performance for them
- flatten ambiguity into generic notes
- turn direction into overexplained script analysis

## Packet Outputs

### 1. Actor-Facing Signal Card

This is the shortest usable brief.

Recommended fields:

- `scene_objective`
- `what_must_be_felt`
- `hidden_pressure`
- `emotional_temperature`
- `sensory_anchor`
- `forbidden_readings`
- `first_take_bias`

Target length:

- readable in under 20 seconds

Dedicated signal-card doc:

- [actor-facing-signal-card.md](./actor-facing-signal-card.md)

### 2. Structured Direction Packet

This is the fuller machine-readable session object.

Recommended fields:

- `session_id`
- `scene_id`
- `character_id`
- `actor_id`
- `director_id`
- `world_id`
- `objective`
- `subtext_pressure`
- `emotional_temperature`
- `pace`
- `intimacy_distance`
- `intensity`
- `restraint`
- `danger_level`
- `energy_curve`
- `sensory_anchor`
- `forbidden_readings`
- `reference_images`
- `counterpoint_note`
- `first_take_protected`
- `redirect_rule`
- `role_delta`
- `shared_field_id`
- `director_notes`

Machine-readable schema:

- [ava-direction-packet-schema.json](./ava-direction-packet-schema.json)

### 3. NOIZYFISH Continuity Handoff

This is the post-capture continuity layer.

Recommended fields:

- `world_tone`
- `environmental_signature`
- `coherence_targets`
- `allowed_variance`
- `must_preserve`
- `adjacent_scene_notes`

## Input Sources

AVA should be able to form the packet from:

- spoken director brief
- typed scene brief
- image references
- prior scene continuity
- world or project bible
- approved actor constraints

## Translation Rules

### Compress, Do Not Dilute

The packet should become clearer than the raw brief, not flatter.

### Preserve Contradictions

If a moment is meant to feel:

- tender but dangerous
- exhausted but holy
- intimate but withheld

the packet should preserve that tension.

### Use One Or Two Strong Images

Good direction lands quickly when it uses precise sensory anchors.

Examples:

- like a storm staying polite
- like the room is colder than your words
- like you are trying not to wake the grief

### Avoid Line Reading

AVA should never over-specify exact delivery unless the director explicitly wants a technical correction.

### Protect The First Read

The first clean take should be marked as protected by default.

## Multi-Actor Mode

When AVA briefs multiple actors, it should split the packet into:

### Shared Field

- scene objective
- world tone
- pace corridor
- emotional weather
- forbidden broad mistakes

### Role-Specific Delta

- hidden pressure per character
- relationship asymmetry
- power differential
- private sensory anchor
- redirect variable

This lets multiple actors step into the same field without becoming tonally identical.

## First-Take Bias

The system should assume the keeper may arrive in the first read.

Default rule:

- protect `take_01` if it is technically usable
- only redirect one variable at a time
- keep all later redirects relative to the original field

Example redirects:

- same ache, less explanation
- same pace, more danger underneath
- same restraint, but let the breath break once

## Conceptual Parallel

A useful design parallel is any guidance model where the container matters more than mechanical control.

The lesson for NOIZYVOX is simple:

- shape the field
- let the performer navigate
- capture the first truthful response

## Session Flow

`director brief -> AVA packet draft -> actor-facing signal card -> first read -> protected take -> minimal redirect if needed -> NOIZYFISH coherence handoff`

## Integration Points

This packet should connect to:

- [creative-transmission-protocol.md](./creative-transmission-protocol.md)
- [sovereign-voice-network.md](./sovereign-voice-network.md)
- [sovereign-voice-local-direction-hub.md](./sovereign-voice-local-direction-hub.md)
- [noizyvox-frequency-transmission-blueprint.md](./noizyvox-frequency-transmission-blueprint.md)
- future local session manifests

## Non-Negotiables

- the actor remains the performer
- the director remains the source of vision
- AVA clarifies, it does not replace
- NOIZYFISH preserves world coherence after capture, not by flattening before capture
- redirects should minimize analytical drift

## Next Actions

- bind the packet to local session manifests
- bind the packet to NOIZYFISH continuity rules
