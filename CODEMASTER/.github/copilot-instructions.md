# CODEMASTER — Copilot Instructions

## Architecture

CODEMASTER is the **ops & automation hub** for the NOIZY Empire (monorepo: `NOIZYANTHROPIC`). It runs on a Mac M2 Ultra and orchestrates:

- **GABRIEL** — local daemon at `http://localhost:7777` (health, `/speak`, `/memcell/*` endpoints). All alerts route through GABRIEL first, with macOS `say` as fallback.
- **HEAVEN** — Cloudflare Worker at `heaven.noizylab.workers.dev` (ledger, deploy target).
- **Turbo Scripts** — shell + Python tooling in `turbo-scripts/` for network, git sync, system vitals, and repo maintenance.
- **Governance** — policy-driven event system in `governance/` using Postman + n8n + Zapier.
- **Scheduled monitors** — `CHECK_ANTHROPIC_STATUS.sh` (launchd, every 30min) and `AI_MORNING_NEWS.sh` (daily 10am briefing).

## Key Conventions

- **Operator identity**: All commits, memcells, and logs reference `RSP_001`.
- **Logging**: Every script writes to `logs/` with format `[$TIMESTAMP] MESSAGE`. Use `date '+%Y-%m-%d %H:%M:%S'`.
- **GABRIEL-first alerting**: `POST $GABRIEL/speak` with `{"text": "..."}`. Fallback: `/usr/bin/say -v Daniel`.
- **MemCell storage**: `POST $GABRIEL/memcell/<namespace>:<key>` with `{"value": {...}}`.
- **Shell scripts**: `#/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
` or `#/bin/zsh -c '/bin/ls /Users/m2ultra/Library/CloudStorage/'`. Always `mkdir -p` log dirs. Exit 0 on success.
- **JSON safety**: Wrap all parsing in `try/except`. Build payloads with `python3 -c "import json; print(json.dumps(...))"` — never string-interpolate JSON.
- **HTTP safety**: Use `curl -sL --max-time <N>` — always follow redirects, always set timeout.
- **Stateful monitors**: Track last state in `logs/.<name>_last_state` to avoid repeat alerts.
- **Keys**: `privatekey`/`publickey` are WireGuard curve25519. Never log or commit.

## Quick Commands

```bash
make status         # Full empire health check
make lint           # Validate all shell + JSON files
make morning        # Run morning briefing now
make check-url      # Verify Anthropic status URL
make sync           # Git sync all repos to GitHub
make pipeline       # Optimize repo (format, dedupe, verify)
make n8n-up         # Start n8n governance orchestrator
make log-rotate     # Compress old logs, clean 30d+ archives
make help           # Show all available commands
```

## Turbo Scripts Reference

| Script | Purpose | Run |
|--------|---------|-----|
| `turbo_pipeline.sh <path>` | Full repo optimization (format, dedupe, verify) | `make pipeline` |
| `turbo_git_sync.sh` | Commit + push NOIZYLAB/GABRIEL/PROJECTS | `make sync` |
| `turbo_zap.sh` | Network hard reset (DNS, DHCP, interfaces) | `make zap` |
| `turbo_reset.sh` | System reset (vitals, DNS, caches) | `make reset` |
| `turbo_mount_omen.sh` | SMB mount HP-OMEN (Gabriel hardware) | `make mount` |
| `turbo-python/turbo_vitals.py` | CPU/RAM/disk snapshot | `make vitals` |
| `turbo-python/turbo_net_check.py` | Advanced network diagnostics | `make net` |
| `turbo-python/turbo_speed.py` | Bandwidth speed test | `make speed` |

## Governance System

Policy-driven event system in `governance/`. Non-overlapping tool roles:

| Tool | Role | Hard Rule |
|------|------|-----------|
| **Postman** | API contract definition + test oracle | Never mutates state |
| **n8n** | Deterministic orchestrator (localhost:5678) | Owns all decisions |
| **Zapier** | SaaS glue (Slack, Notion, etc.) | No decisions, receives validated events only |

**Event flow**: Webhook → Set `execution_id` → Schema gate → Dispatch (GABRIEL + Slack)

- Execution IDs: `nf-YYYY-MM-DD-NNNNN` — assigned by n8n, passed everywhere
- Slack audit: `#audit-noizylab` (machine-only, schema in `contracts/slack-audit-payload.json`)
- n8n Docker: `governance/docker-compose.yaml` (pinned `n8nio/n8n:1.34.2`, basic auth)

## Service Endpoints

| Service | URL | Health Check |
|---------|-----|--------------|
| GABRIEL | `http://localhost:7777` | `GET /health` |
| HEAVEN | `https://heaven.noizylab.workers.dev` | `GET /health` |
| n8n | `http://localhost:5678` | Docker container |
| Anthropic | `https://status.claude.com/api/v2/status.json` | indicator = `none` means OK |

> **URL migration**: Anthropic moved `status.anthropic.com` → `status.claude.com` (302 redirect). CI checks for stale URLs.

## File Structure

```
CODEMASTER/
├── Makefile                     # `make help` for all commands
├── empire-status.sh             # Health check all services
├── AI_MORNING_NEWS.sh           # Daily spoken briefing via GABRIEL
├── CHECK_ANTHROPIC_STATUS.sh    # Anthropic API monitor (launchd, 30min)
├── turbo-scripts/               # Shell turbo tools
│   └── turbo-python/            # Python: vitals, net, speed, media, bridge, ears
├── governance/                  # Policy-driven event system
│   ├── docker-compose.yaml      # n8n (pinned, auth-protected)
│   ├── n8n-workflows/           # Import into n8n
│   ├── postman/                 # Import into Postman
│   └── contracts/               # Slack payload schemas + examples
├── scripts/                     # Utilities
│   ├── log-rotate.sh            # Compress old logs, delete 30d+ archives
│   └── pre-commit               # Git hook: lint + secret detection
├── config/.env.example          # All API keys template
├── logs/                        # Script output (gitignored)
├── .github/
│   ├── copilot-instructions.md  # This file
│   └── workflows/ci.yaml        # CI: lint, secret scan, URL check
├── .gitignore                   # Protects keys, logs, n8n data, .env
├── NOIZY_TEMPLATE_LIBRARY/      # Index of all empire templates
└── .vscode/mcp.json             # MCP server config (Guru)
```

## CI & Safety

- **Pre-commit hook**: validates shell syntax, JSON, secret leaks, blocks `privatekey`/`publickey` commits, warns on stale Anthropic URLs. Install: `cp scripts/pre-commit .git/hooks/pre-commit`
- **GitHub Actions** (`.github/workflows/ci.yaml`): runs on push/PR to main — shell lint, JSON validation, secret scan, .gitignore checks, URL migration check.
- **Log rotation**: `make log-rotate` compresses logs >100KB or >7 days old, deletes archives >30 days.

## When Writing New Scripts

1. Header block: script name, one-line purpose, `RSP_001 | NOIZY Empire | 2026`.
2. Log to `$HOME/NOIZYLAB/CODEMASTER/logs/<script_name>.log`.
3. Route alerts through GABRIEL (`/speak` + `/memcell`), fallback to `say`.
4. Wrap all JSON parsing in `try/except` — never assume valid input.
5. Use `curl -sL --max-time <N>` — always follow redirects, always timeout.
6. For monitors, track state in `logs/.<name>_last_state` to suppress repeat alerts.
7. Build JSON with `python3 -c "import json; print(json.dumps(...))"` — never s- **GitHub Actions** (`.github/workflows/c$LOG"` after curl output to prevent log corruption.
9. Add a corresponding `make` target in the Makefile.
