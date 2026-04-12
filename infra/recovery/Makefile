# ═══════════════════════════════════════════════════════════════════════════════
# NOIZY Recovery — Makefile (Enforced Ordering)
# Scan first. Copy second. Verify third. Operate fourth. Automate power last.
#
# Default target is SCAN. You cannot skip ahead accidentally.
# `make operate` enforces every gate in order.
# ═══════════════════════════════════════════════════════════════════════════════

.DEFAULT_GOAL := scan

SHELL := /bin/bash
SOURCE ?= /Volumes/MICKY-P
DEST := $(HOME)/Recovered
MIN_DISK_GB ?= 50
REMOTE_HOST ?= micky-p
WORKER ?= heaven

.PHONY: help init scan scan-dry extract quarantine verify seal health preflight operate all
.PHONY: scan-remote extract-remote tail-events count-events observe seal-only

# ── Help ─────────────────────────────────────────────────────────────────────

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

# ── Enforced Pipeline (each target depends on the previous) ─────────────────

init: ## Create intake tree at ~/Recovered/
	@mkdir -p $(DEST)/code-gold $(DEST)/media $(DEST)/plugins-quarantine $(DEST)/manifests
	@touch $(DEST)/events.jsonl
	@echo "Intake tree ready at $(DEST)"

scan: init ## 1. SCAN — first command, every time (DEFAULT)
	@echo ">> SAFE MODE: scan-drives"
	@bash scan-drives.sh

scan-dry: init ## 1. SCAN dry-run (no manifest written)
	@echo ">> SAFE MODE: scan-drives (DRY RUN)"
	@DRY_RUN=true bash scan-drives.sh

extract: scan ## 2. Extract code-gold from SOURCE (requires scan)
	@echo ">> extract-code (code-gold only)"
	@bash extract-code.sh $(SOURCE)

quarantine: extract ## 3. Quarantine plugins from SOURCE (requires extract)
	@echo ">> copy-plugins-to-quarantine"
	@bash copy-plugins-to-quarantine.sh $(SOURCE)

verify: quarantine ## 4. Verify recovered code-gold (requires quarantine)
	@echo ">> verify-manifests"
	@bash verify-manifests.sh $(SOURCE) $(DEST)/code-gold/$$(basename $(SOURCE))

seal: verify ## 5. Cryptographic seal of manifests (requires verify)
	@echo ">> seal-manifests (Ed25519 signature)"
	@bash seal-manifests.sh

health: seal ## 6. Studio health check (requires seal)
	@echo ">> studio health"
	@bash studio_health.sh

preflight: health ## 7. Recording preflight gate (requires health)
	@echo ">> record preflight"
	@bash record_preflight.sh $(HOME)/Music/Sessions $(MIN_DISK_GB)

operate: preflight ## 8. OPERATION UNLOCKED — safe to record / deploy (requires preflight)
	@echo ""
	@echo "=========================================="
	@echo " ALL GATES PASSED — OPERATION UNLOCKED"
	@echo " Safe to record, deploy, or automate."
	@echo "=========================================="

all: operate ## Full pipeline: scan → extract → quarantine → verify → health → preflight → operate
	@echo ""
	@echo "=== Full recovery pipeline complete ==="
	@echo "Events: $(DEST)/events.jsonl"

# ── Individual targets (bypass ordering — use with care) ────────────────────

scan-only: init ## Run scan without enforcing downstream
	@bash scan-drives.sh

extract-only: init ## Run extract without enforcing upstream
	@bash extract-code.sh $(SOURCE)

health-only: init ## Run health check standalone
	@bash studio_health.sh

preflight-only: ## Run preflight standalone
	@bash record_preflight.sh $(HOME)/Music/Sessions $(MIN_DISK_GB)

seal-only: init ## Seal manifests standalone (Ed25519)
	@bash seal-manifests.sh

deep-scan: init ## Forensic SHA-256 hash of every code + audio file (slow)
	@echo ">> DEEP SCAN (forensic-grade — may take minutes to hours)"
	@bash deep-scan.sh

observe: ## Tail Heaven worker logs (live)
	@bash cloud-observe.sh $(WORKER)

# ── Remote targets ───────────────────────────────────────────────────────────

scan-remote: init ## Run scan-drives.sh on remote machine via SSH
	@echo ">> Remote scan: $(REMOTE_HOST)"
	@ssh $(REMOTE_HOST) 'bash -s' < scan-drives.sh
	@scp $(REMOTE_HOST):~/Recovered/manifests/*.json $(DEST)/manifests/ 2>/dev/null || true
	@echo "Remote scan complete — manifests copied to $(DEST)/manifests/"

extract-remote: init ## Extract code-gold from remote machine via rsync
	@echo ">> Remote extract: $(REMOTE_HOST)"
	@bash extract-code.sh /Volumes/$(REMOTE_HOST)

# ── Utility ──────────────────────────────────────────────────────────────────

tail-events: ## Tail the events log (live)
	@tail -f $(DEST)/events.jsonl | while read line; do echo "$$line" | python3 -m json.tool 2>/dev/null || echo "$$line"; done

count-events: ## Count events by script
	@cat $(DEST)/events.jsonl 2>/dev/null | python3 -c "import sys,json,collections; c=collections.Counter(json.loads(l)['script'] for l in sys.stdin if l.strip()); [print(f'  {k}: {v}') for k,v in c.most_common()]" 2>/dev/null || echo "  (no events yet)"
