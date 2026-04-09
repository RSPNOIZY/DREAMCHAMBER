# ═══════════════════════════════════════════════════════════════
# CODEMASTER Makefile
# One-command operations for the NOIZY Empire
# RSP_001 | NOIZY Empire | 2026
# ═══════════════════════════════════════════════════════════════

SHELL := /bin/bash
.DEFAULT_GOAL := status

# ── Empire Health ──────────────────────────────────────────────

.PHONY: status
status: ## Full empire health check
	@./empire-status.sh

.PHONY: vitals
vitals: ## System CPU/RAM/disk vitals
	@python3 turbo-scripts/turbo-python/turbo_vitals.py

.PHONY: net
net: ## Network diagnostics
	@python3 turbo-scripts/turbo-python/turbo_net_check.py

.PHONY: speed
speed: ## Bandwidth speed test
	@python3 turbo-scripts/turbo-python/turbo_speed.py

# ── Turbo Operations ──────────────────────────────────────────

.PHONY: sync
sync: ## Git sync all repos to GitHub
	@./turbo-scripts/turbo_git_sync.sh

.PHONY: pipeline
pipeline: ## Full repo optimization (format, dedupe, verify)
	@./turbo-scripts/turbo_pipeline.sh .

.PHONY: zap
zap: ## Network hard reset (requires sudo)
	@sudo ./turbo-scripts/turbo_zap.sh

.PHONY: reset
reset: ## System reset — vitals, DNS, caches (requires sudo)
	@sudo ./turbo-scripts/turbo_reset.sh

.PHONY: mount
mount: ## Mount HP-OMEN (Gabriel hardware)
	@./turbo-scripts/turbo_mount_omen.sh

# ── Governance ─────────────────────────────────────────────────

.PHONY: n8n-up
n8n-up: ## Start n8n governance orchestrator
	@cd governance && docker compose up -d
	@echo "✅ n8n running at http://localhost:5678"

.PHONY: n8n-down
n8n-down: ## Stop n8n
	@cd governance && docker compose down

.PHONY: n8n-logs
n8n-logs: ## Tail n8n container logs
	@cd governance && docker compose logs -f --tail=50

# ── Monitoring ─────────────────────────────────────────────────

.PHONY: morning
morning: ## Run the morning briefing now
	@./AI_MORNING_NEWS.sh

.PHONY: check-anthropic
check-anthropic: ## Check Anthropic API status now
	@./CHECK_ANTHROPIC_STATUS.sh

.PHONY: check-url
check-url: ## Verify Anthropic status URL is reachable
	@curl -sL --max-time 5 "https://status.claude.com/api/v2/status.json" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'{d[\"status\"][\"indicator\"]} — {d[\"status\"][\"description\"]}')" 2>/dev/null || echo "❌ Unreachable"

# ── Logs ───────────────────────────────────────────────────────

.PHONY: logs
logs: ## Show recent log activity
	@echo "═══ Recent Anthropic Status ═══"
	@tail -10 logs/anthropic_status.log 2>/dev/null || echo "(no logs)"
	@echo ""
	@echo "═══ Recent Morning News ═══"
	@tail -10 logs/morning_news.log 2>/dev/null || echo "(no logs)"

.PHONY: log-rotate
log-rotate: ## Rotate logs (compress old, keep 30 days)
	@./scripts/log-rotate.sh

.PHONY: log-clean
log-clean: ## Delete all logs
	@rm -f logs/*.log
	@echo "✅ Logs cleared"

# ── Validation ─────────────────────────────────────────────────

.PHONY: lint
lint: ## Validate all shell scripts and JSON files
	@echo "Checking shell scripts..."
	@for f in $$(find . -name "*.sh" -not -path "./.git/*"); do \
		bash -n "$$f" 2>/dev/null && echo "  ✅ $$f" || echo "  ❌ $$f"; \
	done
	@echo ""
	@echo "Checking JSON files..."
	@for f in $$(find . -name "*.json" -not -path "./.git/*" -not -path "*/node_modules/*"); do \
		python3 -m json.tool "$$f" > /dev/null 2>&1 && echo "  ✅ $$f" || echo "  ❌ $$f"; \
	done

.PHONY: validate
validate: lint ## Alias for lint

# ── Help ───────────────────────────────────────────────────────

.PHONY: help
help: ## Show this help
	@echo ""
	@echo "CODEMASTER — NOIZY Empire Operations"
	@echo "═══════════════════════════════════════"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'
	@echo ""
