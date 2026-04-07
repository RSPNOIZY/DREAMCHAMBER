# NOIZY Knowledge Grid

## Summary

The NOIZY Knowledge Grid is the working schema for the archive.

It turns raw ideas into a structured system where every important thought can be grouped by:

- project
- date
- theme
- impact
- related systems

## Purpose

The archive already has canonical docs and project maps.

The Knowledge Grid adds the missing layer:

- idea-level structure
- shared note fields
- consistent tags
- a stable crosswalk between the founder's mental model and the current archive

## Core Model

Every idea should eventually resolve into this shape:

```text
IDEA_ID
CAPTURED_AT
UPDATED_AT
PROJECT
IDEA_TYPE
TITLE
SUMMARY
DETAIL
IMPACT
USE_CASES
THEMES
CONNECTIONS
SOURCE_FILES
STATUS
PROMOTE_TO
NEXT_ACTION
```

This is the smallest useful unit of the NOIZY encyclopedia.

Machine-readable schema:

- [idea-object-schema.json](./idea-object-schema.json)

## Current Archive Crosswalk

The founder mental model can be mapped cleanly onto the existing archive.

| Founder Volume | Current Archive Home |
|---|---|
| `00_ORIGIN` | `01_PHILOSOPHY/origin-story.md` |
| `01_PHILOSOPHY` | `01_PHILOSOPHY/*` |
| `02_NOIZY_WORLD` | `NOIZY_WORLD_MASTER_ARCHIVE.md` |
| `03_DREAMCHAMBER` | `project-constellation.md` plus `CODEMASTER/docs` and `dreamchamber-bridge` |
| `04_AI_TECH` | `03_PRODUCTS/*` and `CODEMASTER/projects/NOIZY.AI` |
| `05_CREATOR_ECONOMY` | `04_BUSINESS/*` and `lifeluv.md` |
| `06_EDUCATION / NOIZYKIDZ` | `08_EDUCATION/noizy-music-school.md` |
| `07_BUSINESS_MODELS` | `04_BUSINESS/*` |
| `08_RESEARCH_LOG` | `02_RESEARCH/*`, `research-timeline.md`, `capture.md` |
| `09_EXPERIMENTS` | active code and bridge projects under `CODEMASTER` and `ROOT` |
| `10_FUTURE_VISION` | `manifesto.md`, `crown-jewels-protocol.md`, experimental sections in canon |

This means the archive does not need to be rebuilt from scratch.
It needs a stronger shared schema.

## Tag Taxonomy

Use a controlled tag set so themes stay consistent.

### Core Tags

- `ai`
- `music`
- `global-music`
- `voice`
- `creator-economy`
- `provenance`
- `rights`
- `monetization`
- `dreamchamber`
- `noizy`
- `philosophy`
- `technology`
- `research`

### Extended Tags

- `biometric`
- `assistive`
- `education`
- `partner`
- `anthropic`
- `apple`
- `google`
- `community`
- `archive`
- `knowledge-engine`
- `lifeluv`
- `fiduciary`
- `scale-system`
- `rhythm-system`
- `timbre`

## Timeline Rule

There are two valid dates in the system:

- `note date`: when the idea was captured
- `file activity date`: when the canonical file changed

The current fishnet uses file activity dates.

The next upgrade should also parse note dates from inbox and structured notes.

## Philosophy Layer

The grid should preserve one core NOIZY belief:

AI is most valuable when it reduces friction between inner vision and shared artifact.

Some artists already see the finished world in their heads.
The system exists to help them translate that world into sound, language, image, and durable creative infrastructure.

## Working Rules

- capture fast
- promote deliberately
- reuse canon
- connect by theme
- track by date
- version high-value concepts
- treat durable ideas as living objects, not loose paragraphs

## Best Entry Points

- [origin-story.md](../01_PHILOSOPHY/origin-story.md)
- [NOIZY_WORLD_MASTER_ARCHIVE.md](../NOIZY_WORLD_MASTER_ARCHIVE.md)
- [founder-intelligence-archive.md](./founder-intelligence-archive.md)
- [project-date-fishnet.md](../06_APPENDIX/project-date-fishnet.md)

## Next Actions

- use this schema in the inbox and note templates
- parse note-level dates and projects from captured research
- build a NOIZY archive service that can search and regroup ideas using this model
