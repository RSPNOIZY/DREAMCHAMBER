# Living Encyclopedia Blueprint

## Summary

This is the top-level architecture for the NOIZY archive as a living encyclopedia.

It turns the archive from a set of linked markdown files into a structured knowledge system that can be:

- read by Claude
- browsed in Obsidian
- exported into Notion-like views
- extended into machine-readable archive services

## Core Principle

Ideas are not loose notes.

Ideas are living objects.

Each important NOIZY idea should have:

- identity
- date
- project context
- type
- detail
- impact
- lineage
- connections
- evolution over time

This is what lets the archive become a founder-level operating system instead of a static document pile.

## Idea Object Model

The canonical machine-readable schema lives here:

- [idea-object-schema.json](./idea-object-schema.json)

At minimum, each durable idea should resolve into:

- `idea_id`
- `captured_at`
- `updated_at`
- `project`
- `idea_type`
- `title`
- `summary`
- `detail`
- `impact`
- `use_cases[]`
- `themes[]`
- `connections[]`
- `source_files[]`
- `status`
- `promote_to`
- `next_action`

This should be treated as the object grammar for the entire archive.

## Object Lifecycle

The lifecycle is:

`capture -> classify -> connect -> reconcile -> promote -> version -> brief -> refresh`

This means:

1. raw note enters inbox
2. AI assigns project, theme, and likely destination
3. note is checked for duplicates or contradiction
4. durable parts get promoted into canon
5. important concepts gain version history
6. partner-facing narratives are generated from canon
7. atlas and fishnet views are refreshed

## Five-Layer Living Encyclopedia

### 1. Philosophy Layer

What NOIZY believes.

Primary references:

- [origin-story.md](../01_PHILOSOPHY/origin-story.md)
- [master-origin-story.md](../01_PHILOSOPHY/master-origin-story.md)
- [manifesto.md](../01_PHILOSOPHY/manifesto.md)
- [lifeluv.md](../01_PHILOSOPHY/lifeluv.md)

### 2. Systems Layer

How NOIZY works as a product and platform stack.

Primary references:

- [noizy-empire-systems-blueprint.md](./noizy-empire-systems-blueprint.md)
- [dreamchamber-prototype-spec.md](./dreamchamber-prototype-spec.md)
- [nerve-to-note.md](./nerve-to-note.md)
- [fiduciary-agent.md](./fiduciary-agent.md)
- [sovereign-voice-network.md](./sovereign-voice-network.md)

### 3. Content Layer

The world-knowledge layer: instruments, rhythms, scales, lineages, and sonic-state patterns.

Primary references:

- [global-music-genome.md](./global-music-genome.md)
- [world-instrument-atlas.md](../02_RESEARCH/world-instrument-atlas.md)
- [noizy-64-rhythm-archetypes.md](../02_RESEARCH/noizy-64-rhythm-archetypes.md)
- [world-rhythm-systems-atlas.md](../02_RESEARCH/world-rhythm-systems-atlas.md)
- [noizy-128-scale-structures.md](../02_RESEARCH/noizy-128-scale-structures.md)
- [world-scale-systems-atlas.md](../02_RESEARCH/world-scale-systems-atlas.md)
- [world-regional-origin-timeline.md](../06_APPENDIX/world-regional-origin-timeline.md)

### 4. Application Layer

Where NOIZY applies the content and systems to real use cases.

Primary references:

- [humanity-reconnection-blueprint.md](./humanity-reconnection-blueprint.md)
- [sound-mind-ritual-blueprint.md](./sound-mind-ritual-blueprint.md)
- [noizy-music-school-curriculum.md](../08_EDUCATION/noizy-music-school-curriculum.md)
- [creative-transmission-protocol.md](./creative-transmission-protocol.md)
- [sovereign-voice-local-direction-hub.md](./sovereign-voice-local-direction-hub.md)

Guardrail:

Application ideas involving PTSD, anxiety, autism, or other health-related states should remain framed as research, support, or experience design unless backed by real clinical evidence and proper compliance work.

### 5. Evolution Layer

How the system learns, versions, and stays coherent over time.

Primary references:

- [founder-intelligence-archive.md](./founder-intelligence-archive.md)
- [knowledge-engine.md](./knowledge-engine.md)
- [second-brain-ai.md](./second-brain-ai.md)
- [noizy-knowledge-grid.md](./noizy-knowledge-grid.md)
- [five-layer-knowledge-architecture.md](../06_APPENDIX/five-layer-knowledge-architecture.md)
- [research-timeline.md](../06_APPENDIX/research-timeline.md)

## Work Surfaces

The truth base is local markdown under `NOIZY_ARCHIVE`.

Optional work surfaces:

- Obsidian for graph and local browsing
- Notion for shareable database-style views
- Claude Projects for high-context collaboration

These should remain surfaces, not canonical truth.

## Claude Ingestion Pack

For the fastest meaningful NOIZY load-in, use:

1. [00_INDEX.md](../00_INDEX.md)
2. [NOIZY_WORLD_MASTER_ARCHIVE.md](../NOIZY_WORLD_MASTER_ARCHIVE.md)
3. [theme-index.md](../06_APPENDIX/theme-index.md)
4. [living-encyclopedia-blueprint.md](./living-encyclopedia-blueprint.md)
5. [second-brain-ai.md](./second-brain-ai.md)
6. then only the files needed for the current task

## Obsidian Graph Pack

If building a graph view, pin these as hub notes:

- [00_INDEX.md](../00_INDEX.md)
- [NOIZY_WORLD_MASTER_ARCHIVE.md](../NOIZY_WORLD_MASTER_ARCHIVE.md)
- [theme-index.md](../06_APPENDIX/theme-index.md)
- [project-date-fishnet.md](../06_APPENDIX/project-date-fishnet.md)
- [living-encyclopedia-blueprint.md](./living-encyclopedia-blueprint.md)
- [global-music-genome.md](./global-music-genome.md)
- [noizy-empire-systems-blueprint.md](./noizy-empire-systems-blueprint.md)

## Why This Matters

Without this layer:

- ideas pile up
- partner briefs drift
- archive truth fragments
- AI keeps re-summarizing instead of building

With this layer:

- ideas have stable object identity
- systems stay cross-linked
- music knowledge becomes queryable
- Claude can behave like a real research copilot

## Next Build Path

1. `idea-object-schema.json` as the object grammar
2. inbox-to-canon promoter
3. contradiction scanner
4. partner-brief generator from canon
5. machine-readable world music taxonomy for DreamChamber

## Related Files

- [founder-intelligence-archive.md](./founder-intelligence-archive.md)
- [knowledge-engine.md](./knowledge-engine.md)
- [second-brain-ai.md](./second-brain-ai.md)
- [noizy-master-encyclopedia-draft.md](./noizy-master-encyclopedia-draft.md)
- [noizy-knowledge-grid.md](./noizy-knowledge-grid.md)
- [noizy-empire-claude-package.md](./noizy-empire-claude-package.md)
