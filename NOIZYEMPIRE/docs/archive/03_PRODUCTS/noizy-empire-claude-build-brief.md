# NOIZY Empire Claude Build Brief

## Summary

This is the single handoff document to use when Claude is helping build NOIZY.

It compresses the ecosystem into:

- what exists now
- what each major system does
- what each system depends on
- what artifact should be built next

Use this doc when you want fast alignment without re-reading the whole archive.

For the fully populated co-work layer, use:

- [noizy-empire-claude-cowork-system.md](./noizy-empire-claude-cowork-system.md)
- [noizy-empire-module-registry.json](./noizy-empire-module-registry.json)

## Start Here

Read in this order:

1. [00_INDEX.md](../00_INDEX.md)
2. [NOIZY_WORLD_MASTER_ARCHIVE.md](../NOIZY_WORLD_MASTER_ARCHIVE.md)
3. [noizy-empire-claude-build-brief.md](./noizy-empire-claude-build-brief.md)
4. the subsystem docs listed under the module you are touching

## North Star

NOIZY is building a living, global human creativity system:

- a world-scale instrument
- a lineage-aware music school
- a rights-safe creator platform
- a community of co-creation
- a long-term archive of the human sonic experiment

## The Major Modules

### 1. Global Sonic Map And Timeline

Purpose:

- represent the full world of human sonic lineages in a navigable form

Canonical docs:

- [dreamchamber-global-sonic-map.md](./dreamchamber-global-sonic-map.md)
- [dreamchamber-biome-matrix.json](./dreamchamber-biome-matrix.json)
- [global-sonic-consciousness-atlas.md](../02_RESEARCH/global-sonic-consciousness-atlas.md)
- [global-sonic-consciousness-timeline.md](../06_APPENDIX/global-sonic-consciousness-timeline.md)

Current status:

- narrative map exists
- prototype biome data exists
- source-lineage annotations are still thin

Next artifact:

- lineage note schema v0.1

### 2. DreamChamber XR Runtime

Purpose:

- spatial, embodied, participatory sound world

Canonical docs:

- [dreamchamber-prototype-spec.md](./dreamchamber-prototype-spec.md)
- [dreamchamber-biome-matrix.json](./dreamchamber-biome-matrix.json)
- [dreamchamber-ux-wireflow.md](./dreamchamber-ux-wireflow.md)
- [noizy-next-systems-roadmap.md](./noizy-next-systems-roadmap.md)

Current status:

- MVP spec exists
- room model exists
- UX wireflow exists
- six-biome prototype scope exists

Next artifact:

- DreamChamber scene state schema v0.1

### 3. Flow-State Engine And Adaptive AI Composer

Purpose:

- make sound respond to intention, motion, breath, and future local biosignals

Canonical docs:

- [sound-mind-ritual-blueprint.md](./sound-mind-ritual-blueprint.md)
- [nerve-to-note.md](./nerve-to-note.md)
- [biometric-governance.md](../02_RESEARCH/biometric-governance.md)

Current status:

- theory exists
- ethics boundary exists
- no control schema yet

Next artifact:

- Flow-State Engine Control Schema v0.1

### 4. Music School And Curriculum

Purpose:

- guide humans from wonder to stewardship

Canonical docs:

- [noizy-music-school.md](../08_EDUCATION/noizy-music-school.md)
- [noizy-music-school-curriculum.md](../08_EDUCATION/noizy-music-school-curriculum.md)
- [noizy-teaching-credo.md](../08_EDUCATION/noizy-teaching-credo.md)

Current status:

- philosophy exists
- pathways exist
- curriculum spine exists

Next artifact:

- Semester 1 Weekly Map v0.1

### 5. Human Sonic Legacy Vault

Purpose:

- preserve human-created sessions, releases, teaching artifacts, and lineage records

Canonical docs:

- [founder-intelligence-archive.md](./founder-intelligence-archive.md)
- [provenance-validator.md](./provenance-validator.md)
- [fiduciary-agent.md](./fiduciary-agent.md)

Current status:

- archive philosophy exists
- rights layer exists
- vault product is not yet specified

Next artifact:

- Human Sonic Legacy Vault Spec v0.1

### 6. Community Platform

Purpose:

- connect creators, teachers, mentors, and performers in real time

Canonical docs:

- [sovereign-voice-network.md](./sovereign-voice-network.md)
- [creative-transmission-protocol.md](./creative-transmission-protocol.md)
- [README.md](../../CODEMASTER/projects/dreamchamber-bridge/README.md)

Current status:

- principles exist
- bridge tooling exists
- NOIZY-native platform spec does not

Next artifact:

- NOIZY Community Platform Spec v0.1

### 7. Rights, Provenance, And Life Support

Purpose:

- keep the whole ecosystem artist-safe and economically real

Canonical docs:

- [provenance-research.md](../02_RESEARCH/provenance-research.md)
- [provenance-validator.md](./provenance-validator.md)
- [fiduciary-agent.md](./fiduciary-agent.md)
- [monetization-models.md](../04_BUSINESS/monetization-models.md)
- [lifeluv.md](../01_PHILOSOPHY/lifeluv.md)

Current status:

- canonical framing exists
- some prototype code exists
- runtime-to-release flow is not specified yet

Next artifact:

- session-to-release provenance flow v0.1

## Cross-Cutting Design Layers

These are not separate products.
They are design obligations across all modules.

### Ritual And Flow-State Design

- sober-first
- state-aware
- reflection built in
- no fake therapeutic claims

Primary docs:

- [sound-mind-ritual-blueprint.md](./sound-mind-ritual-blueprint.md)
- [global-sonic-consciousness-atlas.md](../02_RESEARCH/global-sonic-consciousness-atlas.md)

### Universal Instrument And Style Integration

- lineage-aware naming
- region, state, and method routes
- cultural context stays visible

Primary docs:

- [dreamchamber-global-sonic-map.md](./dreamchamber-global-sonic-map.md)
- [global-music-genome.md](./global-music-genome.md)
- [dreamchamber-biome-matrix.json](./dreamchamber-biome-matrix.json)

## Immediate Build Order

Do this next:

1. DreamChamber UX Wireflow v0.1
2. local session manifest schema
3. Flow-State Engine Control Schema v0.1
4. Semester 1 Weekly Map v0.1
5. session-to-release provenance flow v0.1

## Guardrails

Claude should not:

- invent unverified medical claims
- flatten living cultures into generic presets
- make rights assumptions without evidence
- replace canonical docs with chat-only drafts

Claude should:

- update canon
- link new artifacts into the archive
- keep prototypes sober-first and local-first
- keep human authorship visible

## Ready-To-Use Claude Prompts

### Prompt 1. DreamChamber UX

```text
Read 00_INDEX.md, NOIZY_WORLD_MASTER_ARCHIVE.md, noizy-empire-claude-build-brief.md, dreamchamber-prototype-spec.md, and dreamchamber-biome-matrix.json.
Draft DreamChamber UX Wireflow v0.1 with room-by-room transitions, route choices, and export flow.
```

### Prompt 2. Flow-State Engine

```text
Read 00_INDEX.md, noizy-empire-claude-build-brief.md, sound-mind-ritual-blueprint.md, nerve-to-note.md, and biometric-governance.md.
Draft Flow-State Engine Control Schema v0.1 with local-first input boundaries and sober-first state routes.
```

### Prompt 3. Semester Map

```text
Read 00_INDEX.md, noizy-empire-claude-build-brief.md, noizy-music-school.md, noizy-music-school-curriculum.md, and dreamchamber-global-sonic-map.md.
Draft Semester 1 Weekly Map v0.1 that connects school stages to DreamChamber routes and Listening Chamber practice.
```

## Companion Documents

- [noizy-empire-claude-cowork-system.md](./noizy-empire-claude-cowork-system.md)
- [noizy-empire-module-registry.json](./noizy-empire-module-registry.json)
- [noizy-empire-systems-blueprint.md](./noizy-empire-systems-blueprint.md)
- [noizy-empire-master-blueprint.md](./noizy-empire-master-blueprint.md)
- [dreamchamber-prototype-spec.md](./dreamchamber-prototype-spec.md)
- [noizy-music-school-curriculum.md](../08_EDUCATION/noizy-music-school-curriculum.md)
