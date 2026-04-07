# Five-Layer Knowledge Architecture

## Summary

This is the operating model for the NOIZY archive as a founder intelligence system.

It is designed to prevent idea fragmentation and make the archive usable by:

- Claude
- future team members
- partners like Anthropic, Apple, and Google
- the founder during active research and product design

This is also the architecture that makes the archive behave like a practical second brain instead of a giant note pile.

## The Five Layers

### 1. Capture Layer

Purpose:
Get ideas out of the head fast without losing them.

Primary file:

- [capture.md](../07_INBOX/capture.md)

Rules:

- raw notes go here first
- do not over-edit during capture
- include date, project, and rough intent when possible

### 2. Canon Layer

Purpose:
Convert important ideas into stable source-of-truth documents.

Primary files:

- [00_INDEX.md](../00_INDEX.md)
- [NOIZY_WORLD_MASTER_ARCHIVE.md](../NOIZY_WORLD_MASTER_ARCHIVE.md)
- product, research, business, and pitch docs under the archive

Rules:

- one durable concept per file when possible
- update canonical docs instead of duplicating ideas
- separate facts, decisions, speculation, and open questions

### 3. Graph Layer

Purpose:
Connect ideas by meaning instead of folder location.

Primary files:

- [theme-index.md](./theme-index.md)
- [project-constellation.md](./project-constellation.md)
- [workspace-atlas.md](./workspace-atlas.md)

Rules:

- use themes to show semantic relationships
- use the atlas to show project and date groupings
- keep links intentional and curated

### 4. Narrative Layer

Purpose:
Translate the same core system into audience-specific stories.

Primary files:

- [anthropic.md](../05_PITCHES/anthropic.md)
- [apple.md](../05_PITCHES/apple.md)
- [google.md](../05_PITCHES/google.md)

Rules:

- do not invent a new strategy for each audience
- derive each brief from the same canonical system
- adapt the framing, not the truth

### 5. Automation Layer

Purpose:
Keep the archive alive without turning it into manual overhead.

Primary files:

- [knowledge-engine.md](../03_PRODUCTS/knowledge-engine.md)
- [second-brain-ai.md](../03_PRODUCTS/second-brain-ai.md)
- [claude-local-setup.md](./claude-local-setup.md)
- [workspace-manifest.json](./workspace-manifest.json)
- [build_workspace_inventory.py](../scripts/build_workspace_inventory.py)

Rules:

- automate navigation before automating interpretation
- prefer local-first workflows
- let AI summarize and reconcile, not silently rewrite canon

## How This Prevents Fragmentation

Without structure:

- ideas stay trapped in chats
- different files compete as truth
- partner briefs drift away from product reality
- founder memory becomes the only index

With this system:

- the inbox captures speed
- the canon captures truth
- the graph captures relationships
- the narrative layer captures relevance
- the automation layer captures scale

In other words:

- ideas can be captured quickly
- important concepts can harden into canon
- Claude can navigate the system without re-inventing the system
- partner-facing materials can be generated from the same truth base

## Recommended Claude Workflow

1. Read [00_INDEX.md](../00_INDEX.md)
2. Read [NOIZY_WORLD_MASTER_ARCHIVE.md](../NOIZY_WORLD_MASTER_ARCHIVE.md)
3. Read [theme-index.md](./theme-index.md)
4. Read only the specific files for the task
5. Write accepted changes back into the canonical file

## Next Upgrade

The next automation step should be a NOIZY-specific archive service that can:

- search canonical docs
- group by project and date
- suggest where new notes belong
- promote inbox notes into stable files

That service should be designed as the implementation path for:

- [second-brain-ai.md](../03_PRODUCTS/second-brain-ai.md)
