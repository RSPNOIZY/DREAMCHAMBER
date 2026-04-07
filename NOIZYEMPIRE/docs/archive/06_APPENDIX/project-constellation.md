# Project Constellation

## Summary

This file explains what the main project clusters in the workspace actually are and how they connect.

Use this when the atlas answers `where`, but you still need `why`.

## Primary Constellation

### `NOIZY_ARCHIVE`

Purpose:
the canonical knowledge base for philosophy, research, product specs, business logic, and partner briefs.

Role in ecosystem:
the source of truth for Claude and future collaborators.

Key files:

- [00_INDEX.md](../00_INDEX.md)
- [NOIZY_WORLD_MASTER_ARCHIVE.md](../NOIZY_WORLD_MASTER_ARCHIVE.md)
- [knowledge-engine.md](../03_PRODUCTS/knowledge-engine.md)

### `CODEMASTER/projects/NOIZY.AI`

Purpose:
prototype code for the provenance and fiduciary protection layer.

Role in ecosystem:
the closest current bridge between the archive philosophy and enforceable technical systems.

Key files:

- [fiduciary_agent.py](../../CODEMASTER/projects/NOIZY.AI/fiduciary/fiduciary_agent.py)
- [c2pa_schema.py](../../CODEMASTER/projects/NOIZY.AI/fiduciary/c2pa_schema.py)

### `CODEMASTER/projects/dreamchamber-bridge`

Purpose:
an active integration bridge between communication platforms.

Role in ecosystem:
early evidence that the wider NOIZY system already thinks in bridges, workflows, and connected environments rather than isolated apps.

Key files:

- [README.md](../../CODEMASTER/projects/dreamchamber-bridge/README.md)
- [src/index.ts](../../CODEMASTER/projects/dreamchamber-bridge/src/index.ts)

### `CODEMASTER/projects/gabriel-core`

Purpose:
integration maps, MCP setup, orchestration notes, and system intelligence around the Gabriel environment.

Role in ecosystem:
the operational backbone and environment-discovery layer.

Key files:

- [MASTER_INTEGRATION.md](../../CODEMASTER/projects/gabriel-core/MASTER_INTEGRATION.md)
- [MAGIC_DISCOVERED.md](../../CODEMASTER/projects/gabriel-core/MAGIC_DISCOVERED.md)
- [SETUP_GUIDE.md](../../CODEMASTER/projects/gabriel-core/mcp/SETUP_GUIDE.md)

### `CODEMASTER/projects/q4git`

Purpose:
a Git and research helper package.

Role in ecosystem:
useful supporting tooling for codebase analysis and report generation.

Key files:

- [pyproject.toml](../../CODEMASTER/projects/q4git/pyproject.toml)
- [cli.py](../../CODEMASTER/projects/q4git/src/q4git/cli.py)

### `GABRIEL`

Purpose:
shell entrypoints, launch scripts, and operational service wrappers.

Role in ecosystem:
execution and system operations support.

Key files:

- [start_server.sh](../../GABRIEL/bin/start_server.sh)
- [start_bridge.sh](../../GABRIEL/bin/start_bridge.sh)

### `ROOT`

Purpose:
top-level entrypoints, ecosystem docs, voice tooling, and the active WhatsApp Cohere bot.

Role in ecosystem:
the front door of the workspace and the easiest place to find active operational files.

Key files:

- [whatsapp-cohere-bot.js](../../whatsapp-cohere-bot.js)
- [NOIZYLAB_ECOSYSTEM.html](../../NOIZYLAB_ECOSYSTEM.html)
- [NOIZYLAB_GOOGLE_BUSINESS_SETUP.html](../../NOIZYLAB_GOOGLE_BUSINESS_SETUP.html)

## How The Constellation Connects

- `NOIZY_ARCHIVE` defines the ideas
- `CODEMASTER/projects/NOIZY.AI` prototypes the protection logic
- `dreamchamber-bridge` and `GABRIEL` show the integration mindset
- `gabriel-core` provides environment and orchestration context
- `ROOT` contains practical entrypoints and active experiments

## Priority Clusters

### Highest Strategic Value

- `NOIZY_ARCHIVE`
- `CODEMASTER/projects/NOIZY.AI`
- `ROOT`

### Supporting Infrastructure

- `CODEMASTER/projects/gabriel-core`
- `GABRIEL`
- `CODEMASTER/projects/dreamchamber-bridge`

### Auxiliary Tooling

- `CODEMASTER/projects/q4git`

## Next Actions

- keep this file aligned with the Workspace Atlas
- expand the NOIZY.AI project area as new code appears
- use this file to brief any AI collaborator before asking it to search the whole workspace

