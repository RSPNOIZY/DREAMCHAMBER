# CODEMASTER — Copilot Instructions

## Architecture

CODEMASTER is the **ops & automation hub** for the NOIZY Empire (monorepo: `NOIZYANTHROPIC`). It runs on a Mac M2 Ultra and orchestrates:

- **GABRIEL** — local daemon at `http://localhost:7777` (health, `/speak`, `/memcell/*` endpoints). All alerts and briefings route through GABRIEL first, with macOS `say` as fallback.
- **HEAVEN** — Cloudflare Worker at `heaven.noizylab.workers.dev` (ledger, deploy target).
- **Turbo Scripts** — shell + Python tooling in `turbo-scripts/` for network, git sync, system vitals, and repo maintenance.
- **Scheduled monitors** — `CHECK_ANTHROPIC_STATUS.sh` (launchd, every 30min) and `AI_MORNING_NEWS.sh` (daily 10am briefing).

## Key Conventions

- **Operator identity**: All commits, memcells, and logs reference `RSP_001`.
- **Logging pattern**: Every script writes to `logs/` with format `[$TIMESTAMP] MESSAGE`. Use `date '+%Y-%m-%d %H:%M:%S'` for timestamps.
- **GABRIEL-first alerting**: Post to `$GABRIEL/speak` with JSON `{"text": "..."}`. On failure, fall back to `/usr/bin/say -v Daniel`.
- **MemCell storage**: Persist state via `POST $GABRIEL/memcell/<namespace>:<key>` with JSON `{"value": {...}}`.
- **Shell scripts**: Use `#!/bin/bash` or `#!/bin/zsh`. Always `mkdir -p` log dirs before writing. Exit 0 on success.
- **Keys**: `privatekey` and `publickey` are base64-encoded curve25519 keys (WireGuard). Never log or commit raw key values.

## Turbo Scripts Reference

| Script | Purpose | Run |
|--------|---------|-----|
| `turbo_pipeline.sh <path>` | Full repo optimization (format → dedupe → verify) | `./turbo-scripts/turbo_pipeline.sh .` |
| `turbo_git_sync.sh` | Commit + push all NOIZYLAB/GABRIEL/PROJECTS repos | `./turbo-scripts/turbo_git_sync.sh` |
| `turbo_zap.sh` | Network hard reset (DNS flush, interface cycle) | `sudo ./turbo-scripts/turbo_zap.sh` |
| `turbo_reset.sh` | System reset (vitals → DNS → caches) | `sudo ./turbo-scripts/turbo_reset.sh` |
| `turbo_mount_omen.sh` | SMB mount HP-OMEN (Gabriel hardware) | `./turbo-scripts/turbo_mount_omen.sh` |
| `turbo-python/turbo_vitals.py` | CPU/RAM/disk snapshot | `python3 turbo-scripts/turbo-python/turbo_vitals.py` |
| `turbo-python/turbo_net_check.py` | Advanced network diagnostics | `python3 turbo-scripts/turbo-python/turbo_net_check.py` |
| `turbo-python/turbo_speed.py` | Bandwidth speed test | `python3 turbo-scripts/turbo-python/turbo_speed.py` |

## Governance System

Policy-driven event system in `governance/`. Non-overlapping tool roles:

| Tool | Role | Hard Rule |
|------|------|-----------|
| **Postman** | API contract definition + test oracle | Never mutates state |
| **n8n** | Deterministic orchestrator (localhost:5678) | Owns all decisions |
| **Zapier** | SaaS glue (Slack, Notion, etc.) | No decisions, receives validated events only |

**Event flow**: Webhook → Set `execution_id` → Schema gate → Dispatch (GABRIEL + Slack)

- Execution IDs: `nf-YYYY-MM-DD-NNNNN` — assigned by n8n, passed everywhere
- Slack audit messages go to `#audit-noizylab` (machine-only, see `contracts/slack-audit-payload.json`)
- n8n Docker: `governance/docker-compose.yaml` (pinned image, basic auth, persistent volume)
- Postman collections: import from `governance/postman/`

## Service Endpoints

| Service | URL | Health Check |
|---------|-----|--------------|
| GABRIEL | `http://localhost:7777` | `GET /health` |
| HEAVEN | `https://heaven.noizylab.workers.dev` | `GET /health` |
| n8n | `http://localhost:5678` | Docker container |
| Anthropic Status | `https://status.anthropic.com/api/v2/status.json` | indicator = `none` means OK |

## File Structure

```
CODEMASTER/
├── AI_MORNING_NEWS.sh          # Daily spoken briefing via GABRIEL
├── CHECK_ANTHROPIC_STATUS.sh   # Anthropic API monitor (launchd)
├── turbo-scripts/              # Shell turbo tools
│   └── turbo-python/           # Python turbo tools (vitals, net, speed, media)
├── governance/                 # Policy-driven event system
│   ├── docker-compose.yaml     # n8n (pinned, auth-protected)
│   ├── n8n-workflows/          # Import into n8n
│   ├── postman/                # Import into Postman
│   └── contracts/              # Slack payload schemas + examples
├── logs/                       # All script output logs
├── privatekey / publickey      # WireGuard curve25519 keys — DO NOT LOG
├── NOIZY_TEMPLATE_LIBRARY/     # Index of all empire templates (see README.md)
└── .vscode/mcp.json            # MCP server config (Guru)
```

## When Writing New Scripts

1. Add a header block: script name, one-line purpose, `RSP_001 | NOIZY Empire | 2026`.
2. Log to `$HOME/NOIZYLAB/CODEMASTER/logs/<script_name>.log`.
3. Route alerts through GABRIEL (`/speak` + `/memcell`), fallback to `say`.
4. Parse JSON responses with `python3 -c "import sys,json; ..."` inline — no jq dependency.
5. Use `curl -s --max-time <N>` for all HTTP calls to avoid hangs.
