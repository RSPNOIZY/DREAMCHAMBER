# DreamChamber UX Wireflow v0.1

## Summary

This is the first room-by-room interaction wireflow for DreamChamber.

It translates the prototype thesis into a participant journey that can be implemented in Unreal, Unity, FMOD, or Wwise without losing the NOIZY rules:

- lineage-aware entry
- embodied sound interaction
- sober-first pacing
- explicit reflection and exit
- local artifact capture

## Purpose

The prototype spec defines what DreamChamber is.

This wireflow defines how a first-time participant actually moves through it.

It answers:

- what the participant sees first
- how a route is chosen
- how a biome is entered
- how listening and composition modes relate
- how the session resolves into a saved artifact

## Status

- stage: first UX wireflow
- priority: immediate runtime companion
- related spec: [dreamchamber-prototype-spec.md](./dreamchamber-prototype-spec.md)
- related data: [dreamchamber-biome-matrix.json](./dreamchamber-biome-matrix.json)

## Dependencies

- [dreamchamber-prototype-spec.md](./dreamchamber-prototype-spec.md)
- [dreamchamber-biome-matrix.json](./dreamchamber-biome-matrix.json)
- [dreamchamber-global-sonic-map.md](./dreamchamber-global-sonic-map.md)
- [dreamchamber-global-music-atlas.md](./dreamchamber-global-music-atlas.md)
- [sound-mind-ritual-blueprint.md](./sound-mind-ritual-blueprint.md)

## Primary Entry Modes

The first prototype should support three entry logics:

1. `geography_first`
2. `feeling_first`
3. `method_first`

Each one should land in the same runtime state machine, but the participant should feel a real difference in how the world opens.

## Core Session Loop

```text
boot
-> threshold
-> route selection
-> biome preview
-> biome chamber
-> optional listening chamber deepen
-> composition deck
-> reflection gate
-> local export
```

## Global Wireflow

| Step | Room | Participant Action | System Response | Output |
|---|---|---|---|---|
| 1 | Boot Veil | Put on headset, confirm start | Load baseline ambience and local session ID | session starts in `orient` |
| 2 | Threshold Room | Look, breathe, choose to continue | Calm orientation copy and route gates appear | participant enters `enter` |
| 3 | Route Constellation | Choose geography, feeling, or method | Highlight matching route clusters | route type is locked |
| 4 | Biome Preview Ring | Inspect 3-6 available biomes | Load visual metaphor, sonic anchors, and entry invocation | one biome is selected |
| 5 | Biome Chamber | Walk, gesture, listen | Biome sound world responds to movement and focus | participant enters `explore` |
| 6 | Listening Chamber Overlay | Choose deepen route or skip | Intensity narrows, pacing slows, reflection structure appears | participant enters `deepen` |
| 7 | Composition Deck | Place, mute, emphasize, or move sonic nodes | Scene graph updates and spatial sketch is saved | participant enters `compose` |
| 8 | Reflection Gate | Review session and add notes | Show route, biome, and scene summary | participant enters `reflect` |
| 9 | Archive Gate | Confirm local save | Write local manifest and scene reference | participant may `export` |

## Room Logic

### 1. Boot Veil

Purpose:

- hide system loading
- avoid dropping the participant straight into dense audio
- establish a calm baseline

Required UX:

- soft ambient field
- no heavy text
- one visible continue affordance

### 2. Threshold Room

Purpose:

- orient the participant
- establish consent and pacing
- make the system feel welcoming rather than technical

What the participant sees:

- a calm central chamber
- three route gates
- one short instruction line

What the participant hears:

- low-density neutral ambience
- subtle hints of multiple worlds beyond the threshold

Rules:

- no forced lore dump
- no more than one sentence of instruction at a time
- exit option visible immediately

### 3. Route Constellation

Purpose:

- let the participant decide how the world opens

Routes:

- `geography_first`: enter by world region
- `feeling_first`: enter by activation, focus, reverence, guidance, lament, or immersion
- `method_first`: enter by drum trance, chant, overtone, drone, procession, or nature immersion

UX pattern:

- route choice should be a spatial act, not a menu list
- hovering or facing a route should preview its sound color
- selection should narrow the next room, not start playback instantly

### 4. Biome Preview Ring

Purpose:

- preview the available sound worlds before commitment

Each biome preview should pull from the matrix:

- `display_name`
- `visual_metaphor`
- `sonic_anchors`
- `entry_invocation`
- `embodiment_prompt`

Preview rules:

- one short invocation line
- one clear visual metaphor
- one visible sonic anchor cluster
- no overloaded metadata in-headset

### 5. Biome Chamber

Purpose:

- let the participant inhabit a lineage-aware sound world

Shared rules:

- body motion changes musical meaning
- sound objects feel spatial, not abstract
- the room must teach interaction through response, not tutorial walls

Biome chamber states:

1. `enter`: threshold crossing and sonic arrival
2. `explore`: discover how the world responds
3. `deepen`: narrow into a more intentional state
4. `compose`: carry the biome logic into spatial sketch mode

### 6. Listening Chamber Overlay

Purpose:

- provide the sober-first deepen phase
- narrow the interaction field
- build reflection into the experience

When available:

- always for `focus`
- always for `reverence`
- always for `guidance`
- optional for other routes

Phases:

1. settle
2. deepen
3. hold
4. reflect
5. return

Rules:

- lower interaction complexity
- visible exit at all times
- no false therapeutic framing
- reflection cannot be skipped entirely

### 7. Composition Deck

Purpose:

- turn the biome into a spatial composition surface

Allowed actions:

- place node
- move node
- mute node
- emphasize node
- save scene
- reset scene

Not allowed in v0.1:

- deep timeline editing
- dense parameter menus
- DAW parity expectations

### 8. Reflection Gate

Purpose:

- resolve the session without breaking the mood

Required summary:

- selected route
- selected biome
- time in chamber
- scene save status
- optional note prompt

Required behavior:

- short note entry only
- visible save state
- visible return to threshold or end session

### 9. Archive Gate

Purpose:

- produce the first durable artifact

Local export should write:

- session ID
- route type
- route ID
- biome ID list
- scene save ID
- short interaction summary
- participant notes
- sober-default flag

## MVP Biome Wireflows

### West Africa -> Rhythm Plaza

```text
threshold
-> geography_first
-> West Africa
-> preview ring: drum circle + kora shimmer
-> rhythm plaza
-> move around circle to thicken pulse
-> gesture to trigger response layers
-> composition deck: place drum and kora nodes
-> reflection gate
```

### South Asia -> Raga Mandala

```text
threshold
-> geography_first or feeling_first: focus
-> South Asia
-> preview ring: drone columns + melodic ribbons
-> raga mandala
-> circular movement advances tala and color
-> listening chamber deepen
-> composition deck: place drone, melody, and pulse anchors
-> reflection gate
```

### East Asia -> Cloud Garden

```text
threshold
-> geography_first or feeling_first: focus
-> East Asia
-> preview ring: floating phrase ribbons + quiet spacing
-> cloud garden
-> slower motion reveals tone and silence
-> listening chamber deepen
-> composition deck: sparse spatial phrases
-> reflection gate
```

### Middle East -> Modal Corridor

```text
threshold
-> geography_first or feeling_first: lament
-> Middle East
-> preview ring: reed light + modal corridors
-> modal corridor
-> pitch-bend gestures open alternate paths
-> optional listening chamber deepen
-> composition deck: route by interval color
-> reflection gate
```

### Amazonia -> Canopy Corridor

```text
threshold
-> geography_first or feeling_first: guidance
-> Amazonia
-> preview ring: forest path + directional song
-> canopy corridor
-> movement changes canopy depth
-> voice or head focus shifts path guidance
-> listening chamber deepen
-> composition deck: environmental and voice layers
-> reflection gate
```

### Black Atlantic -> Signal Cathedral

```text
threshold
-> geography_first or feeling_first: activation
-> Black Atlantic and electronic futures
-> preview ring: bass towers + signal grids
-> signal cathedral
-> movement reshapes bass architecture
-> gestures place and strip rhythm layers
-> composition deck: sculpt pressure and release
-> reflection gate
```

## Runtime Data Requirements

The biome matrix should expose enough data for the preview ring and biome chamber to run without hard-coded level logic.

Minimum runtime fields:

- `visual_metaphor`
- `visual_motifs`
- `entry_invocation`
- `embodiment_prompt`
- `room_behavior`
- `interaction_mode`
- `input_mappings`
- `safety_profile`

## Accessibility Rules

- controller fallback always available
- no single gesture should gate progress
- slower movement must still be musically meaningful
- visual intensity should scale down cleanly
- note entry must have non-typing fallback later

## Non-Negotiables

- sober-first pacing
- lineage-aware naming
- no genericized world-music UI language
- no therapeutic promises
- reflection phase is explicit
- local export is first-class

## Next Actions

- define `DreamChamber scene state schema v0.1`
- define `Listening Chamber Route Templates v0.1`
- define `local session manifest schema v0.1`
- connect biome preview cards directly to engine data assets
