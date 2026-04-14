# Git World Policy

This file is the canonical Git operating policy for the NOIZY Empire.

## 1. Canonical model

- This repository is the **integration monorepo**.
- The integration monorepo owns orchestration, shared standards, cross-repo CI, governance, and extraction policy.
- Product and platform code that can stand on its own must move to a standalone GitHub repo under **`github.com/NOIZY-ai`**.
- Until the integration repo itself is transferred, `RSPNOIZY/NOIZYANTHROPIC` remains the active coordination repo, not the long-term home for every product tree.

## 2. Repo classes

| Class | Purpose | Examples |
| --- | --- | --- |
| Integration | Cross-system orchestration, governance, CI, extraction manifests, shared docs | `RSPNOIZY/NOIZYANTHROPIC` |
| Core platform | Deployable platform and shared infrastructure | `NOIZY-ai/heaven`, `NOIZY-ai/gabriel` |
| Product | Standalone brand/product repos | `NOIZY-ai/noizyvox`, `NOIZY-ai/noizyfish`, `NOIZY-ai/noizybeast`, `NOIZY-ai/noizy.ai`, `NOIZY-ai/noizykidz`, `NOIZY-ai/myfamily-ai` |
| Archive / lab | Experiments, imports, mirrors, historical snapshots, heavy local-only material | archive repos, mirrors, lab snapshots |

## 3. Source of truth

| Domain | Canonical repo | Notes |
| --- | --- | --- |
| Integration and governance | `RSPNOIZY/NOIZYANTHROPIC` | Cross-repo policy, CI, migration manifests |
| Heaven consent kernel | `NOIZY-ai/heaven` | Deployable worker and schema |
| Gabriel orchestration | `NOIZY-ai/gabriel` | Runtime, orchestration, related tooling |
| NOIZYVOX | `NOIZY-ai/noizyvox` | Voice product ownership |
| NOIZYFISH | `NOIZY-ai/noizyfish` | Music/catalog product ownership |
| NOIZYBEAST | `NOIZY-ai/noizybeast` | IDE/extension ownership |
| noizy.ai | `NOIZY-ai/noizy.ai` | Brand/landing ownership |
| Archive docs and historical snapshots | archive repo or quarantined archive path | Never the deployable source of truth |

## 4. Naming and org rules

- Standalone repos use `github.com/NOIZY-ai/<repo>`.
- The integration repo keeps the `NOIZYANTHROPIC` name until it is intentionally transferred or renamed.
- Do not introduce alternate canonical hosts, alternate orgs, or shadow remotes for active source-of-truth repos.
- Record the authoritative repo in docs, PRs, and migration manifests before extraction work begins.

## 5. Branching rules

- Default branch: `main`.
- Feature branches: `feature/<scope>-<topic>`.
- Fix branches: `fix/<scope>-<topic>`.
- Release and hotfix branches are allowed only for deployable standalone repos.
- Protected branches must reject force-push and direct pushes except explicit admin recovery.

## 6. Worktree rules

- Git worktrees are allowed only as **local-only** execution aids.
- Worktrees must live under ignored paths only: `.worktrees/` or `.claude/worktrees/`.
- Worktree paths must never be committed, referenced as gitlinks, or treated as permanent repo content.
- One mission stream = one worktree branch namespace.

## 7. Submodule and gitlink policy

- No git submodules in the integration repo.
- No tracked gitlinks in the integration repo.
- No nested repos may be committed inside tracked paths.
- Imported repos must be extracted, archived, or quarantined — not embedded as submodules.

## 8. Archive and mirror policy

- Large mirrors, archive copies, imported repos, and experiment dumps are not active source code.
- They must live in an archive repo, an ignored local path, or a clearly quarantined area documented in `docs/governance/GIT_WORLD_INVENTORY.md`.
- Changes to quarantined mirror roots should be blocked in CI unless part of an explicit migration.

## 9. Extraction policy

Each candidate tree must be declared as one of:

1. **Extract now** — standalone repo is the new source of truth.
2. **Mirror temporarily** — allowed only with a documented migration owner and end state.
3. **Keep in integration repo** — only when the tree is truly cross-system and not a product repo.

Ad hoc temp-copy export flows are deprecated. Extraction must follow a documented manifest and repo ownership decision.

## 10. Ownership rules inside this repo

- Keep only integration-owned material as permanent residents here.
- Product trees still present here are transitional until extracted or explicitly retained.
- Archive, lab, and mirror roots must be marked clearly as non-canonical.

## 11. Enforcement

- CI must block:
  - `.gitmodules`
  - tracked gitlinks
  - tracked worktree paths
  - PRs that modify quarantined mirror roots without explicit migration intent
  - secrets in diff
- Preflight checks should warn on nested `.git` directories and known mirror/archive roots.
- PRs must declare the system of record.

## 12. Operational references

- GitHub consolidation bootstrap: `github-consolidation/GITHUB_PUSH_PLAN.md`
- Repo inventory and classifications: `docs/governance/GIT_WORLD_INVENTORY.md`
