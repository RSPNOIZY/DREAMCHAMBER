# Second Brain AI

## Summary

Second Brain AI is the practical automation layer that turns the NOIZY archive into a living encyclopedia instead of a static folder tree.

It is not a chatbot with vague memory.

It is a local-first collaborator that helps:

- capture ideas
- route them into canon
- detect overlap and contradiction
- group work by project, date, and theme
- generate partner-facing narratives from one truth base

## Thesis

The NOIZY archive already contains the right raw ingredients:

- philosophy
- system design
- product specs
- research
- business logic
- pitch narratives

Second Brain AI is the layer that makes those ingredients behave like an operating system.

The target behavior is:

`capture -> classify -> link -> reconcile -> promote -> brief -> refresh`

The structural object model for that loop lives here:

- [living-encyclopedia-blueprint.md](./living-encyclopedia-blueprint.md)
- [idea-object-schema.json](./idea-object-schema.json)
- [noizy-master-encyclopedia-draft.md](./noizy-master-encyclopedia-draft.md)

## What It Is Not

- not a giant single note
- not a cloud-only dependency
- not a replacement for canonical docs
- not an excuse to let AI silently rewrite source-of-truth files

## Core Jobs

### 1. Intake

Take raw notes, chat fragments, transcripts, and brainstorms from:

- [capture.md](../07_INBOX/capture.md)
- local session notes
- voice or DreamChamber logs
- product and partner discussions

Then assign:

- date
- project
- theme
- likely destination doc

### 2. Canon Routing

Suggest where a note belongs:

- philosophy
- research
- product
- business
- pitch
- appendix

It should prefer updating an existing canonical file over creating another orphan document.

### 3. Contradiction Detection

Look for places where the archive says two different things about:

- product priority
- rights posture
- partner positioning
- core terminology
- next build steps

### 4. Narrative Generation

Generate audience-specific views from canon:

- Anthropic brief
- Apple brief
- Google brief
- school-facing brief
- investor or collaborator brief

The rule:

same truth base, different framing.

### 5. Archive Refresh

Keep the structural views current:

- [workspace-atlas.md](../06_APPENDIX/workspace-atlas.md)
- [project-date-fishnet.md](../06_APPENDIX/project-date-fishnet.md)
- [theme-index.md](../06_APPENDIX/theme-index.md)

## Stacked Intelligence Model

Second Brain AI is the active expression of stacked intelligence:

1. store
2. organize
3. connect
4. evolve
5. brief

This is how the system stops being a note pile and starts becoming founder infrastructure.

## Recommended Operating Stack

### Canon

Local markdown archive under `NOIZY_ARCHIVE`.

This stays the source of truth.

### Optional External Views

- Obsidian for graph and local browsing
- Notion for shareable database-style views
- Claude Projects for persistent high-context collaboration

These are views and work surfaces.

They should not become the canonical truth base.

### Active AI Collaborator

Claude should be used as the main high-context research and synthesis partner against the local canon.

## Claude Workflow

1. Read [00_INDEX.md](../00_INDEX.md)
2. Read [NOIZY_WORLD_MASTER_ARCHIVE.md](../NOIZY_WORLD_MASTER_ARCHIVE.md)
3. Read [theme-index.md](../06_APPENDIX/theme-index.md)
4. Read this file
5. Load only the files needed for the task
6. Write accepted changes back into canon
7. Refresh the atlas

## Prompt Patterns

### Canon Update

```text
Read 00_INDEX.md, NOIZY_WORLD_MASTER_ARCHIVE.md, theme-index.md, and second-brain-ai.md.
Then read only the files relevant to <topic>.
Identify overlap, contradictions, and the best canonical file to update.
Update canon instead of creating a duplicate note.
Refresh the workspace inventory after changes.
```

### Partner Brief

```text
Read 00_INDEX.md, NOIZY_WORLD_MASTER_ARCHIVE.md, theme-index.md, second-brain-ai.md, and the files under <theme>.
Then produce a partner-facing brief for <company> that preserves the archive's actual truth base.
Do not invent capabilities that are not in canon.
```

### Inbox Promotion

```text
Read capture.md, 00_INDEX.md, theme-index.md, and second-brain-ai.md.
Group the new notes by project, date, and theme.
Recommend which canonical files to update and what should remain in inbox.
```

## Build Path

### v0.1

- archive exists
- canonical docs exist
- workspace inventory exists
- project/date fishnet exists
- theme index exists

### v0.2

- inbox-to-canon promotion suggestions
- contradiction scanner
- partner-brief generator from canon

### v0.3

- machine-readable taxonomy for major systems
- note-level project/date extraction
- auto-link suggestions for related docs

## Success Condition

The system is working when a founder can:

- dump a raw idea fast
- have AI place it correctly
- update one truth base
- generate one clear brief for the right audience
- keep the whole system coherent over time

## Related Files

- [founder-intelligence-archive.md](./founder-intelligence-archive.md)
- [knowledge-engine.md](./knowledge-engine.md)
- [living-encyclopedia-blueprint.md](./living-encyclopedia-blueprint.md)
- [idea-object-schema.json](./idea-object-schema.json)
- [noizy-master-encyclopedia-draft.md](./noizy-master-encyclopedia-draft.md)
- [noizy-knowledge-grid.md](./noizy-knowledge-grid.md)
- [noizy-empire-claude-package.md](./noizy-empire-claude-package.md)
- [five-layer-knowledge-architecture.md](../06_APPENDIX/five-layer-knowledge-architecture.md)
