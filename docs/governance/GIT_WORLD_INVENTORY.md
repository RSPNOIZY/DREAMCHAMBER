# Git World Inventory

This file classifies the major top-level folders currently present in `/home/runner/work/NOIZYANTHROPIC/NOIZYANTHROPIC`.

## Integration-owned now

| Path | Class | Decision |
| --- | --- | --- |
| `.claude` | Integration | Keep here for agent rules, prompts, and skills |
| `.github` | Integration | Keep here for shared CI, PR policy, and repo enforcement |
| `.gitkraken` | Local tooling | Keep tracked only if team-shared workspace metadata is intentional |
| `.opencode` | Integration tooling | Keep if it remains shared config without secrets |
| `.vscode` | Integration tooling | Keep shared editor automation only |
| `.windsurf` | Integration tooling | Keep shared rules only |
| `apps` | Integration / extraction staging | Keep only cross-system apps; extract product-owned apps over time |
| `cloudflare` | Integration infra | Keep |
| `cloudflare-workers` | Integration / extraction staging | Keep shared worker tooling; extract product-owned workers |
| `contracts` | Integration | Keep |
| `dashboard` | Integration | Keep |
| `dashboards` | Integration | Keep |
| `docs` | Integration | Keep |
| `dreamchamber` | Candidate standalone | Extract or formally retain; do not leave ambiguous |
| `dreamchamber-audio-mcp` | Candidate standalone | Extract with DreamChamber/MCP ownership decision |
| `GABRIEL` | Core platform | Transitional here; target standalone `NOIZY-ai/gabriel` |
| `governance` | Integration | Keep |
| `mcp` | Core platform / shared tooling | Keep only shared MCP here; extract product-owned servers as needed |
| `packages` | Integration | Keep shared packages only |
| `schemas` | Integration | Keep |
| `scripts` | Integration | Keep shared automation only |
| `sql` | Integration | Keep |
| `src` | Core platform | Transitional here; target standalone `NOIZY-ai/heaven` |
| `templates` | Integration | Keep |
| `tests` | Integration | Keep |
| `tools` | Integration / shared tooling | Keep shared tooling only |
| `voice-pipeline` | Candidate standalone | Extract with `noizyvox` or `gabriel` ownership decision |
| `web` | Integration / product staging | Extract if it becomes product-owned |
| `workers` | Core platform | Transitional here; target standalone `NOIZY-ai/heaven` or per-worker repos |
| `workflows` | Integration | Keep if these are local/shared automation assets |

## Candidate standalone repos

| Path | Target repo | Decision |
| --- | --- | --- |
| `mc96` | `NOIZY-ai/gabriel` | Extract |
| `mc96-docs` | `NOIZY-ai/gabriel` or docs repo | Extract with Gabriel ownership |
| `mc96-portal` | `NOIZY-ai/gabriel` | Extract or archive |
| `lucy` | future standalone or Gabriel family repo | Decide explicitly before more growth |
| `mcp-gemma3` | `NOIZY-ai/gabriel` or MCP repo | Extract |
| `noisyproof` | `NOIZY-ai/noizyfish` or proof repo | Decide and extract |
| `noizy-landing` | `NOIZY-ai/noizy.ai` | Extract |
| `noizybeast` | `NOIZY-ai/noizybeast` | Extract |
| `noizyfish` | `NOIZY-ai/noizyfish` | Extract |
| `noizyfish-landing` | `NOIZY-ai/noizyfish` or archive | Consolidate |
| `noizyvox` | `NOIZY-ai/noizyvox` | Extract |
| `noizyvox-landing` | `NOIZY-ai/noizyvox` or archive | Consolidate |
| `public` | product-dependent | Assign before expansion |

## Archive, mirror, import, or lab roots

| Path | Class | Decision |
| --- | --- | --- |
| `.agent` | Local-only | Keep local-only; do not treat as source code |
| `artifacts` | Generated output | Quarantine and keep generated only |
| `auv3-consent-hud` | Lab / product experiment | Archive or extract |
| `auv3-hvs-live-contour` | Lab / product experiment | Archive or extract |
| `auv3-shared-noizy-consent` | Lab / shared experiment | Archive or extract |
| `auv3-shared-noizy-receipts` | Lab / shared experiment | Archive or extract |
| `claude-projects` | Import / archive | Quarantine |
| `CODEMASTER` | Import / archive | Quarantine |
| `db` | Local/generated | Quarantine or regenerate |
| `dns-exports` | Generated infra export | Quarantine |
| `enterprise` | External integration | Quarantine unless promoted |
| `infra` | Shared infra / archive mix | Split shared infra from archived material |
| `logs` | Generated output | Quarantine |
| `migration-pack` | Migration artifact | Quarantine |
| `migrations` | Ambiguous staging area | Consolidate into owned schema locations |
| `modelfiles` | Model asset staging | Assign owner or quarantine |
| `n8n-docker` | External/runtime packaging | Extract or quarantine |
| `NOIZY-MONO` | Mirror / alternate monorepo | Quarantine |
| `NOIZYLAB` | Mirror / historical root | Quarantine |
| `noizyempire-claude` | Archive / tool snapshot | Quarantine |
| `ops` | Shared ops / archive mix | Keep only owned operational assets |
| `postman` | Tool export | Quarantine |
| `postmortems` | Governance / archive | Keep if active, otherwise archive |
| `power-automate-flows` | External integration export | Quarantine |
| `repos` | Nested repo staging | Quarantine |
| `rob_ava` | Import / archive | Quarantine |
| `RSP_001_VAULT` | Sensitive local archive | Quarantine |
| `rsp001_pipeline` | Archive / pipeline snapshot | Quarantine |
| `supersonic` | Lab / archive | Quarantine |
| `SystemGuardian` | Tooling / archive | Decide owner before keeping active |
| `turbo-scripts` | Shared tooling or `noizybeast` | Assign canonical owner |
| `universal-blocker` | Tooling / archive | Decide owner before expansion |

## Legacy gitlink cleanup

| Path | Previous state | Current rule |
| --- | --- | --- |
| `MC96ECO` | Tracked gitlink | Remove from index, keep local-only if needed |
| `turbo-console-log` | Tracked gitlink | Remove from index, keep local-only if needed |

## Hidden/local paths that must stay local-only

| Path | Rule |
| --- | --- |
| `.worktrees` | Ignored local worktrees only |
| `.claude/worktrees` | Ignored local worktrees only |

Use this inventory together with `GIT_WORLD.md` before moving, extracting, or archiving any top-level tree.
