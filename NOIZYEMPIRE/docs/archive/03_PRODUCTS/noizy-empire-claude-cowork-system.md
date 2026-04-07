# NOIZY Empire Claude Co-Work System

## Summary

This is the operating system for building NOIZY with Claude.

It turns the full empire into:

- a finite set of modules
- a clear read path
- a current sprint
- a repeatable artifact workflow

Use this when the goal is not just to think about NOIZY, but to ship the next artifact inside the archive.

For the shortest front door, use [noizy-empire-claude-package.md](./noizy-empire-claude-package.md).

## Primary Inputs

- [noizy-empire-claude-build-brief.md](./noizy-empire-claude-build-brief.md)
- [noizy-empire-module-registry.json](./noizy-empire-module-registry.json)
- [noizy-empire-systems-blueprint.md](./noizy-empire-systems-blueprint.md)

## Read Path

Claude should start here:

1. [00_INDEX.md](../00_INDEX.md)
2. [NOIZY_WORLD_MASTER_ARCHIVE.md](../NOIZY_WORLD_MASTER_ARCHIVE.md)
3. [noizy-empire-claude-build-brief.md](./noizy-empire-claude-build-brief.md)
4. [noizy-empire-claude-cowork-system.md](./noizy-empire-claude-cowork-system.md)
5. [noizy-empire-module-registry.json](./noizy-empire-module-registry.json)
6. the module-specific docs for the chosen task

## Core Loop

Every Claude work cycle should follow this loop:

1. orient
2. load only the relevant canon
3. create or update one artifact
4. link the artifact into the archive spine
5. refresh workspace maps
6. report the outcome and the next tight dependency

## Co-Work Rules

- update canonical docs instead of generating orphan notes
- keep one artifact per task whenever possible
- treat JSON and data files as first-class build outputs
- keep prototypes sober-first and local-first
- do not invent medical, legal, or cultural claims not supported by canon
- keep human authorship, lineage, and rights visible

## Module Board

| Module | Status | Role | Next Artifact |
|---|---|---|---|
| `foundation_knowledge_engine` | active | keeps the whole system coherent | archive search service v0.1 |
| `global_sonic_map_timeline` | active | world sonic lineage, state routes, historical map | lineage note schema v0.1 |
| `dreamchamber_xr_runtime` | immediate | buildable immersive runtime | DreamChamber scene state schema v0.1 |
| `flow_state_engine_adaptive_composer` | design-ready | intention and state-responsive audio logic | Flow-State Engine Control Schema v0.1 |
| `global_music_school` | active | education and apprenticeship layer | Semester 1 Weekly Map v0.1 |
| `human_sonic_legacy_vault` | pending | preserve releases, sessions, and teaching artifacts | Legacy Vault Spec v0.1 |
| `community_platform` | pending | collaboration, circles, mentorship, live co-creation | Community Platform Spec v0.1 |
| `ritual_flow_state_design` | active | sober-first state shaping and reflective pacing | Listening Chamber Route Templates v0.1 |
| `universal_instrument_style_integration` | active | instrument, method, and style coverage across lineages | source-lineage annotation set v0.1 |
| `technical_infrastructure` | active | engine, middleware, input, export architecture | local session manifest schema v0.1 |
| `rights_provenance_lifeluv` | active | protection, release, continuity, creator value | session-to-release provenance flow v0.1 |

## Current Sprint

The current empire sprint should be:

1. `technical_infrastructure` -> local session manifest schema v0.1
2. `dreamchamber_xr_runtime` -> DreamChamber scene state schema v0.1
3. `flow_state_engine_adaptive_composer` -> Flow-State Engine Control Schema v0.1
4. `global_music_school` -> Semester 1 Weekly Map v0.1
5. `rights_provenance_lifeluv` -> session-to-release provenance flow v0.1

## Work Packet Format

Every module task should be expressed as:

```text
MODULE
GOAL
READ SET
NON-NEGOTIABLES
TARGET ARTIFACT
DONE CONDITION
```

Example:

```text
MODULE: dreamchamber_xr_runtime
GOAL: formalize runtime scene states, room transitions, and export handoff
READ SET: prototype spec, wireflow, biome matrix, build brief
NON-NEGOTIABLES: sober-first, lineage-aware, local-first
TARGET ARTIFACT: DreamChamber scene state schema v0.1
DONE CONDITION: every room, route state, and export handoff is explicit in structured form
```

## Artifact Standards

Artifacts should be one of these:

- `spec`
- `schema`
- `wireflow`
- `registry`
- `curriculum map`
- `route template`
- `release flow`

Every artifact should include:

- summary
- purpose
- current status
- dependencies
- non-negotiables
- next actions

## Machine-Readable Rule

If a concept will drive runtime behavior, curriculum logic, or archive automation, it should not live only in prose.

Create a machine-readable companion when appropriate:

- JSON
- schema-like markdown
- structured registry

## Refresh Rule

After major additions:

```text
python3 NOIZY_ARCHIVE/scripts/build_workspace_inventory.py
```

Also validate structured data when relevant.

## Prompt Pattern

When using Claude for a specific module:

```text
Read 00_INDEX.md, NOIZY_WORLD_MASTER_ARCHIVE.md, noizy-empire-claude-build-brief.md, noizy-empire-claude-cowork-system.md, and noizy-empire-module-registry.json.
Then load only the docs for <module_id>.
Create the next artifact listed for that module and update canon instead of creating side drafts.
```

## Handoff Expectation

A good Claude turn should end with:

- one completed artifact
- archive links updated
- generated maps refreshed
- one clear next dependency

## Companion Documents

- [noizy-empire-claude-package.md](./noizy-empire-claude-package.md)
- [noizy-empire-claude-build-brief.md](./noizy-empire-claude-build-brief.md)
- [noizy-empire-module-registry.json](./noizy-empire-module-registry.json)
- [noizy-empire-systems-blueprint.md](./noizy-empire-systems-blueprint.md)
