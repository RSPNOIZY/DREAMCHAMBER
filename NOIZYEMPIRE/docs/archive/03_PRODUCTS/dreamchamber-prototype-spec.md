# DreamChamber Prototype Spec v0.1

## Summary

This is the first executable DreamChamber specification.

It defines the smallest prototype that can prove the NOIZY thesis in motion:

- world-biome sound as a living environment
- spatial creation instead of timeline-only creation
- sober-first state shaping through sound, space, and ritual pacing
- human-led interaction with AI as an amplifier rather than a replacement

## Status

- stage: prototype spec
- priority: immediate
- owner: NOIZY / DreamChamber
- related data: [dreamchamber-biome-matrix.json](./dreamchamber-biome-matrix.json)
- world mapping bridge: [dreamchamber-3d-world-mapping-table.md](./dreamchamber-3d-world-mapping-table.md)
- world mapping registry: [dreamchamber-3d-world-mapping-table.json](./dreamchamber-3d-world-mapping-table.json)
- engine architecture: [dreamchamber-planetary-engine-architecture.md](./dreamchamber-planetary-engine-architecture.md)
- engine architecture registry: [dreamchamber-planetary-engine-architecture.json](./dreamchamber-planetary-engine-architecture.json)
- UX companion: [dreamchamber-ux-wireflow.md](./dreamchamber-ux-wireflow.md)

## Prototype Goal

Build one playable XR experience where a participant can:

1. enter a sound world
2. choose a geography-first or feeling-first route
3. modulate sound intentionally through movement and gesture
4. enter one guided Listening Chamber mode
5. save one coherent session artifact

## MVP Modes

### Mode 1. Listening Chamber

Purpose:

- deep listening
- breath and focus training
- sober-first state shaping
- group or solo reflective entry

Core routes:

- `focus`
- `reverence`
- `guidance`

### Mode 2. World Biome Entry

Purpose:

- enter a lineage-aware sound biome
- learn by exploration rather than preset browsing
- navigate by region, feeling, or practice type

Core entry paths:

- geography-first
- feeling-first
- method-first

### Mode 3. Spatial Composition Sketch

Purpose:

- place sound objects in 3D space
- modulate energy, density, and emphasis
- save a scene as a prototype artifact

Core output:

- one saved sound scene with route metadata

## Recommended Runtime Stack

### Hardware

- Meta Quest 3 for main target
- Quest Pro for eye-tracking experiments later
- PC tethered development mode allowed during early iteration

### XR Runtime

- OpenXR

### Engine

- Unreal Engine 5.x recommended for first prototype
- Unity XR is a fallback if team capacity or existing tooling makes it faster

### Audio Middleware

- FMOD Studio recommended for first prototype
- Wwise acceptable if the team needs parity with a later game-audio stack

### Data Inputs

- [dreamchamber-biome-matrix.json](./dreamchamber-biome-matrix.json)
- [dreamchamber-3d-world-mapping-table.json](./dreamchamber-3d-world-mapping-table.json)
- session templates defined in engine data assets or JSON
- local scene capture manifests for session export

### Local-First Rule

If any biometric or assistive input is later added, raw sensitive streams stay local.
The prototype baseline should not require cloud processing.

## Prototype Rooms

### 1. Threshold Room

Purpose:

- orient the participant
- select route type
- establish consent, pacing, and session tone

Required elements:

- route gates
- short instructions
- calm baseline ambience

### 2. Biome Chamber

Purpose:

- enter a lineage-aware sound world
- modulate sound through locomotion and gesture

Required elements:

- spatial sound objects
- room-specific visual identity
- simple interaction rules

### 3. Listening Chamber

Purpose:

- focused or reflective sonic state work
- controlled pacing and safe closure

Required elements:

- low input complexity
- explicit start, deepen, reflect, and exit phases
- intensity caps

### 4. Composition Deck

Purpose:

- move, place, mute, or emphasize sonic nodes
- sketch a world rather than a linear arrangement

Required elements:

- sound node placement
- scene save
- scene reset

### 5. Archive Gate

Purpose:

- review session summary
- export artifact
- enter notes without breaking flow

Required elements:

- route summary
- biome summary
- scene save confirmation

## MVP Biome Scope

The first prototype should use a small but contrasting set of biomes:

- `west_africa_rhythm_plaza`
- `south_asia_raga_mandala`
- `east_asia_cloud_garden`
- `middle_east_modal_corridor`
- `amazonia_canopy_corridor`
- `black_atlantic_signal_cathedral`

These six biomes are enough to prove:

- rhythm-led activation
- drone and focus states
- tone and silence-based refinement
- modal emotional precision
- guidance and environmental sound
- future-facing bass and electronic ritual

## Input Model

### Required Inputs

- hand tracking
- head orientation
- locomotion
- controller fallback

### Optional Later Inputs

- breath microphone
- local Nerve-to-Note gesture hooks
- eye-tracking

### Input Principles

- simple gestures beat dense menus
- body motion should map to musical meaning
- accessibility fallback must always exist
- no prototype feature should require perfect dexterity

## Interaction System

### Locomotion

Controls:

- route selection
- intensity gradient
- spatial mixing

### Hand Gesture

Controls:

- call and response triggers
- layer emphasis
- sonic object placement
- route confirmation

### Head Orientation

Controls:

- focus bias
- instrument emphasis
- room attention anchor

### Controller Fallback

Controls:

- select
- place
- confirm
- reset

## Session States

All modes should use a shared state model:

1. `orient`
2. `enter`
3. `explore`
4. `deepen`
5. `compose`
6. `reflect`
7. `export`

Rules:

- every session begins in `orient`
- Listening Chamber must always pass through `reflect`
- export is optional but should be friction-light

## Audio Behavior

### Route-Driven Audio

The session route should change:

- density
- dynamics
- layer emphasis
- reverb and spatial width
- transition pacing

### Biome-Driven Audio

Each biome should define:

- sonic anchors
- center of gravity
- response rules
- composition constraints

### Composition Rules

Spatial sketch mode should allow:

- place node
- move node
- mute node
- emphasize node
- save scene

It should not attempt full DAW parity in v0.1.

## Session Capture And Export

The prototype should export a local session manifest with:

- `session_id`
- `timestamp`
- `route_type`
- `route_id`
- `biome_ids`
- `interaction_events_summary`
- `scene_save_id`
- `participant_notes`
- `sober_default`

Nice-to-have later:

- audio snapshot references
- instructor or mentor notes
- provenance hook fields

## UX Rules

- no dense text walls in-headset
- no hidden mode switching
- no fake sacred aesthetics without context
- no therapeutic claims
- exit path always visible

## Success Criteria

### Experiential

- a first-time participant can enter and complete a session without external help
- the participant can tell the difference between at least three route types
- the participant can intentionally alter sound through motion and gesture

### Technical

- stable playback on Quest target hardware
- deterministic route switching
- scene save and export works locally
- no required network dependency for core experience

### Cultural

- biome naming remains lineage-aware
- no genericized "tribal" or flattened world-music language
- every biome has context hooks in the data model

## Build Phases

### Phase 0. Data And Audio Prep

- biome matrix v0.1
- route definitions
- six biome audio seed sets

### Phase 1. Scene Shell

- threshold room
- one biome chamber
- one Listening Chamber route

### Phase 2. Spatial Interaction

- gesture mapping
- locomotion effects
- scene save

### Phase 3. Six-Biome MVP

- geography-first entry
- feeling-first entry
- three stable state routes

### Phase 4. Archive Hook

- export manifest
- notes
- teaching use

## Non-Negotiables

- sober-first
- local-first for sensitive inputs
- lineage-aware naming
- no clinical promises
- human co-creation remains primary

## Companion Documents

- [noizy-next-systems-roadmap.md](./noizy-next-systems-roadmap.md)
- [dreamchamber-global-sonic-map.md](./dreamchamber-global-sonic-map.md)
- [dreamchamber-biome-matrix.json](./dreamchamber-biome-matrix.json)
- [dreamchamber-ux-wireflow.md](./dreamchamber-ux-wireflow.md)
- [sound-mind-ritual-blueprint.md](./sound-mind-ritual-blueprint.md)
- [noizy-music-school-curriculum.md](../08_EDUCATION/noizy-music-school-curriculum.md)

## Next Actions

- define the DreamChamber scene state schema
- define the six biome seed sets
- define the Listening Chamber route templates
- define the local session manifest schema
