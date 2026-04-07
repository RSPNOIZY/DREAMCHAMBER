# DreamChamber Planetary Engine Architecture

## Summary

This is the engine-level handoff for the four DreamChamber core systems:

1. Global Music Genome
2. Neural Creativity Interface
3. Collective VR Studios
4. Planetary Music Archive

Use it when a team needs one document that connects:

- Unreal or Unity scene logic
- FMOD or Wwise audio behavior
- OpenXR input assumptions
- Nerve-to-Note intent processing
- rights-aware collaboration
- archive and session preservation

This is not a replacement for the deeper atlas or prototype docs.

It is the system-integration layer.

## Reading Rule

Read this after:

- [dreamchamber-prototype-spec.md](./dreamchamber-prototype-spec.md)
- [global-music-genome-table.md](./global-music-genome-table.md)
- [dreamchamber-3d-world-mapping-table.md](./dreamchamber-3d-world-mapping-table.md)

Then use the JSON companion when wiring engine data assets or runtime services:

- [dreamchamber-planetary-engine-architecture.json](./dreamchamber-planetary-engine-architecture.json)

## North Star

DreamChamber is not a VR DAW.

It is a planetary music engine where:

- world musical lineages become playable environments
- body and intention become first-class musical inputs
- collaboration remains human-governed
- every meaningful session can become a preserved artifact

The machine does not replace the artist.
The machine expands the artist's ability to enter, shape, and share the sound of human civilization.

## Runtime Stack

### XR Runtime

- OpenXR

### Devices

- Meta Quest 3 as the primary runtime target
- Quest Pro or later for eye-tracking experiments
- PC tether during development
- optional local sensors later:
  - breath mic
  - EMG
  - EEG
  - MIDI

### Engine Layer

- Unreal Engine 5.x recommended
- Unity XR acceptable if team capacity or existing code favors it

### Audio Middleware

- FMOD Studio recommended for first build
- Wwise acceptable if later game-audio parity matters more than speed

### Local Service Layer

- sensor adapters
- local Nerve-to-Note processing
- session manifest generation
- rights-aware session gating
- local export packaging

### Data Layer

- [dreamchamber-biome-matrix.json](./dreamchamber-biome-matrix.json)
- [global-music-genome-table.json](./global-music-genome-table.json)
- [dreamchamber-3d-world-mapping-table.json](./dreamchamber-3d-world-mapping-table.json)
- future lineage note records
- future scene state records

## System 1. Global Music Genome

### Purpose

Represent the sonic DNA of humanity as lineage-aware runtime data rather than a preset browser.

### What It Contains

- instrument families
- regional nodes and sound worlds
- rhythm archetype seeds
- scale and microtonal seeds
- style lineages
- timbre fields
- human-function routes such as:
  - `celebration`
  - `mourning`
  - `devotion`
  - `guidance`
  - `contemplation`
  - `transformation`

### Runtime Objects

- biome entry nodes
- overlay routes
- instrument clusters
- scale constellations
- rhythm wells
- lineage note hooks

### Engine Responsibility

The engine loads the world and interaction surfaces.
Middleware turns those choices into audible structure.

### Current Canon

- [global-music-genome.md](./global-music-genome.md)
- [global-music-genome-table.md](./global-music-genome-table.md)
- [dreamchamber-3d-world-mapping-table.md](./dreamchamber-3d-world-mapping-table.md)

### Next Required Artifact

- `lineage note schema v0.1`

## System 2. Neural Creativity Interface

### Purpose

Translate human intention into musical output without erasing expressive identity.

### Input Channels

- hand tracking
- head orientation
- gaze
- locomotion
- breath
- EMG or EEG later
- MIDI later
- controller fallback always

### Processing Chain

`raw input -> intent detection -> neural smoothing -> adaptive mapping -> world-aware musical event -> middleware`

### Key Rules

- map intent before smoothing
- preserve meaningful instability
- keep sensitive raw streams local
- let world lineage affect mapping targets

### Example

A tremor does not default to an error.
Inside a raga-biome it may become a grace contour.
Inside a drum-biome it may become ghost-note texture.
Inside a drone-biome it may become overtone shimmer.

### Engine Responsibility

The engine collects interaction signals and state context.
The local interface layer resolves intent.
Middleware receives stable but expressive musical parameters.

### Current Canon

- [nerve-to-note.md](./nerve-to-note.md)
- [dreamchamber-prototype-spec.md](./dreamchamber-prototype-spec.md)
- [biometric-governance.md](../02_RESEARCH/biometric-governance.md)

### Next Required Artifact

- `Flow-State Engine Control Schema v0.1`

## System 3. Collective VR Studios

### Purpose

Make collaboration spatial, ethical, and source-governed instead of anonymous and flattening.

### Core Capabilities

- shared sound rooms
- participant roles:
  - host
  - performer
  - listener
  - guide
  - engineer
- shared tempo and harmony anchors
- controlled scene authority
- local-first capture where needed
- voice-twin governance for source-managed vocal work

### Room Logic

Each participant enters a shared scene state.
The room can synchronize:

- route
- tempo anchor
- harmonic field
- gesture emphasis
- solo focus
- capture state

The system should align to the strongest human-led musical intention, not a generic auto-quantized average.

### Rights Layer

If a voice twin, artist model, or governed source is involved:

- allowed use cases must be checked first
- session capture must retain source identity
- export must retain policy metadata

### Current Canon

- [sovereign-voice-network.md](./sovereign-voice-network.md)
- [sovereign-voice-local-direction-hub.md](./sovereign-voice-local-direction-hub.md)
- [creative-transmission-protocol.md](./creative-transmission-protocol.md)

### Next Required Artifact

- `multi-user scene sync schema v0.1`

## System 4. Planetary Music Archive

### Purpose

Preserve each meaningful session as part of a living human sonic archive.

### What It Stores

- session manifest
- selected route
- biome and overlay path
- scene state summary
- capture metadata
- source lineage references
- rights and contributor links
- notes and reflection

### Archive Modes

- private sketch
- teaching artifact
- collaboration artifact
- release candidate
- lineage study snapshot

### Archive Rule

The archive should preserve human action, route, and context.
It should not reduce the result to a bare exported audio file with no story.

### Current Canon

- [founder-intelligence-archive.md](./founder-intelligence-archive.md)
- [provenance-validator.md](./provenance-validator.md)
- [fiduciary-agent.md](./fiduciary-agent.md)

### Next Required Artifact

- `local session manifest schema v0.1`

## How The Four Systems Connect

### Flow 1. World To Room

`Global Music Genome -> biome selection -> scene state -> middleware routing`

### Flow 2. Body To Sound

`Neural Creativity Interface -> intent vector -> adaptive mapping -> musical event`

### Flow 3. Human To Human

`Collective VR Studios -> shared scene authority -> sync cues -> governed collaboration`

### Flow 4. Session To Memory

`Planetary Music Archive -> manifest -> artifact package -> future retrieval`

## Engine And Middleware Responsibilities

### Unreal Or Unity

Own:

- room geometry
- navigation
- interaction capture
- scene state
- participant presence
- multiplayer authority
- archive gate UI

### FMOD Or Wwise

Own:

- spatialization
- RTPC or game parameter responses
- event triggering
- transitions and snapshots
- rhythmic density layers
- harmonic state layers
- drone and silence framing

### Local Service Layer

Own:

- sensitive sensor handling
- intent translation
- policy checks
- manifest assembly
- local export and sync handoff

## Build Order Inside The Engine

1. Load world data from genome and biome tables.
2. Author the Threshold Room and one Biome Chamber.
3. Bind locomotion, hand tracking, and controller fallback.
4. Route gesture state into FMOD or Wwise parameters.
5. Save one local session manifest and one session artifact.
6. Add shared-room authority and participant sync.
7. Add optional advanced sensors later.

## Non-Negotiables

- human co-creation remains central
- sober-first defaults
- local-first sensitive input handling
- lineage-aware naming
- accessible fallback controls
- no flattening of living cultures into generic presets
- no fake clinical or therapeutic claims
- governed sources stay governed in multiplayer and export flows

## Immediate Next Artifacts

1. `local session manifest schema v0.1`
2. `DreamChamber scene state schema v0.1`
3. `Flow-State Engine Control Schema v0.1`
4. `multi-user scene sync schema v0.1`
5. `lineage note schema v0.1`

## Companion Documents

- [dreamchamber-prototype-spec.md](./dreamchamber-prototype-spec.md)
- [dreamchamber-ux-wireflow.md](./dreamchamber-ux-wireflow.md)
- [global-music-genome-table.md](./global-music-genome-table.md)
- [global-music-genome-table.json](./global-music-genome-table.json)
- [dreamchamber-3d-world-mapping-table.md](./dreamchamber-3d-world-mapping-table.md)
- [dreamchamber-3d-world-mapping-table.json](./dreamchamber-3d-world-mapping-table.json)
- [nerve-to-note.md](./nerve-to-note.md)
- [sovereign-voice-network.md](./sovereign-voice-network.md)
- [sovereign-voice-local-direction-hub.md](./sovereign-voice-local-direction-hub.md)
