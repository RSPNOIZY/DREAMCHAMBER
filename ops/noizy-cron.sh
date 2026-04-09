#!/bin/bash
# ═══════════════════════════════════════════════════════════
# NOIZY.AI — Cron Runner
# 
# Runs scheduled tasks for NOIZYLAB on GOD (M2 Ultra)
# 
# CRONTAB ENTRIES (install with: crontab ops/noizy-crontab):
#   0 3 * * * /Users/m2ultra/NOIZYLAB/ops/noizy-cron.sh lucy-nightly
#   0 7 * * * /Users/m2ultra/NOIZYLAB/ops/noizy-cron.sh standup
#   0 4 * * * /Users/m2ultra/NOIZYLAB/ops/noizy-cron.sh test-all
#
# Built for NOIZY.AI by Robert Stephen Plowman — The DreamChamber
# ═══════════════════════════════════════════════════════════

set -euo pipefail

NOIZYLAB="/Users/m2ultra/NOIZYLAB"
LOG_DIR="$NOIZYLAB/ops/logs"
mkdir -p "$LOG_DIR"

DATE=$(date +%Y-%m-%d)
TIMESTAMP=$(date +%Y-%m-%dT%H:%M:%S)

log() {
  echo "[$TIMESTAMP] $1" | tee -a "$LOG_DIR/cron-$DATE.log"
}

case "${1:-help}" in
  lucy-nightly)
    log "Starting Lucy nightly analysis..."
    cd "$NOIZYLAB/lucy"
    npx tsx src/engine/run-nightly.ts >> "$LOG_DIR/lucy-$DATE.log" 2>&1
    log "Lucy nightly complete. Report at: lucy/nightly-reports/$DATE.json"
    ;;

  standup)
    log "Generating daily standup..."
    cd "$NOIZYLAB/governance"
    npx tsx src/daily-standup.ts >> "$LOG_DIR/standup-$DATE.log" 2>&1
    log "Standup complete. Report at: governance/standups/$DATE.md"
    ;;

  test-all)
    log "Running full test suite..."
    TOTAL=0
    FAILED=0

    for suite in \
      "noizyvox/actor-protocol:src/fixtures/smoke-test.ts" \
      "governance:src/smoke-test.ts" \
      "lucy:src/smoke-test.ts" \
      "noizyvox/voice-capture:src/smoke-test.ts" \
      "noizyvox/voice-capture:src/bridge-smoke-test.ts" \
      "governance:src/revenue/royalty-ledger-test.ts"
    do
      PKG="${suite%%:*}"
      TEST="${suite##*:}"
      log "  Testing $PKG/$TEST..."
      
      if cd "$NOIZYLAB/$PKG" && npx tsx "$TEST" >> "$LOG_DIR/tests-$DATE.log" 2>&1; then
        COUNT=$(grep -o '[0-9]* passed' "$LOG_DIR/tests-$DATE.log" | tail -1 | grep -o '[0-9]*' || echo "0")
        TOTAL=$((TOTAL + COUNT))
      else
        FAILED=$((FAILED + 1))
        log "  FAILED: $PKG/$TEST"
      fi
    done

    log "Test suite complete: ~$TOTAL tests, $FAILED suite failures"
    ;;

  gabriel-watch)
    log "Gabriel watch sweep starting..."
    TURBO="$HOME/NOIZYANTHROPIC/NOIZYLAB/scripts/turbo"
    GABRIEL="$HOME/bin/gabriel"

    if [ -x "$TURBO/turbo_vitals.py" ]; then
      "$TURBO/turbo_vitals.py" >> "$LOG_DIR/gabriel-watch-$DATE.log" 2>&1
    fi
    if [ -x "$TURBO/turbo_net_check.py" ]; then
      "$TURBO/turbo_net_check.py" >> "$LOG_DIR/gabriel-watch-$DATE.log" 2>&1 || \
        log "  WARN: network degraded"
    fi
    if [ -x "$GABRIEL" ]; then
      "$GABRIEL" log cron_sweep gabriel-watch >> "$LOG_DIR/gabriel-watch-$DATE.log" 2>&1
    fi
    log "Gabriel watch sweep complete."
    ;;

  gabriel-sync)
    log "Gabriel git sync (all repos) starting..."
    TURBO="$HOME/NOIZYANTHROPIC/NOIZYLAB/scripts/turbo"
    if [ -x "$TURBO/turbo_git_sync.sh" ]; then
      zsh "$TURBO/turbo_git_sync.sh" >> "$LOG_DIR/gabriel-sync-$DATE.log" 2>&1
    fi
    log "Gabriel git sync complete."
    ;;

  help|*)
    echo "NOIZY.AI Cron Runner"
    echo ""
    echo "Usage: $0 {lucy-nightly|standup|test-all|gabriel-watch|gabriel-sync}"
    echo ""
    echo "  lucy-nightly   Run Lucy's nightly analysis engine"
    echo "  standup        Generate daily standup report"
    echo "  test-all       Run all smoke tests across all packages"
    echo "  gabriel-watch  Vitals + network sweep, log to MemCell"
    echo "  gabriel-sync   Parallel git sync of all NOIZY repos"
    ;;
esac
