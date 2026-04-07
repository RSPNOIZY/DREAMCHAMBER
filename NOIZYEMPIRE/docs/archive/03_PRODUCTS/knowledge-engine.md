# Knowledge Engine

## Summary

The Knowledge Engine is the operating system for NOIZY thinking. It turns research, product ideas, and strategic narratives into a structured archive that AI collaborators can reason over reliably.

It should be treated as a Founder Intelligence Archive rather than a note dump.

It is also the archive's stacked-intelligence layer:

- store
- organize
- connect
- evolve

The active automation expression of that model lives here:

- [second-brain-ai.md](./second-brain-ai.md)
- [living-encyclopedia-blueprint.md](./living-encyclopedia-blueprint.md)

## Core Requirements

- Local-first files
- Small canonical docs instead of giant scrolls
- Clear index and link structure
- Versioned specs
- Partner-specific briefs generated from the same base
- A dedicated inbox for raw capture
- A semantic layer that links ideas across projects
- A repeatable way to version concepts over time
- Clear pathways for Claude to act like a second-brain collaborator rather than a note summarizer

## Operating Model

The archive runs on five layers:

1. Capture
2. Canon
3. Graph
4. Narrative
5. Automation

Primary reference:

- [five-layer-knowledge-architecture.md](../06_APPENDIX/five-layer-knowledge-architecture.md)
- [second-brain-ai.md](./second-brain-ai.md)
- [living-encyclopedia-blueprint.md](./living-encyclopedia-blueprint.md)

## Workflow

1. Capture in Inbox
2. Distill into canonical file
3. Link from Index
4. Connect it through themes and project views
5. Use AI to summarize and reconcile, not to invent a second source of truth
6. Refresh the Workspace Atlas to keep project and date grouping current
7. Version important concepts when they materially evolve

The point is to keep the archive from collapsing into idea fragmentation as the system grows.

Generated views:

- [workspace-atlas.md](../06_APPENDIX/workspace-atlas.md)
- [project-date-fishnet.md](../06_APPENDIX/project-date-fishnet.md)

## AI Collaboration Rules

- Load only the files needed for the task
- Ask the model to identify contradictions
- Write accepted changes back into the archive
- Prefer updating canonical docs over generating new orphan files

## Deployment Rule

Keep the local markdown archive as truth.

If Obsidian, Notion, or Claude Projects are used, treat them as work surfaces and views, not as the canonical source.

## Versioning Rule

Important ideas should evolve like lightweight research papers.

Use:

- [versioned-concept.md](../99_TEMPLATES/versioned-concept.md)

Examples of concepts that should be versioned:

- provenance schema
- fiduciary agent
- sovereign voice network
- Nerve-to-Note intent model
- partner strategy memos when the thesis changes

## Next Actions

- Keep this archive up to date
- Add decision logs when major concepts change
- Use `python3 NOIZY_ARCHIVE/scripts/build_workspace_inventory.py` after major file additions
- build a NOIZY-specific archive search and note-promotion service
