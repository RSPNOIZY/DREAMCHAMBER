#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# cloud-observe.sh — Tail Cloudflare Worker logs from the terminal
# Connects GOD.local to the Heaven cloud control plane without leaving the shell.
# Uses wrangler tail for real-time Workers observability.
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

MACHINE_NAME="${HOSTNAME:-$(hostname -s)}"
CURRENT_USER="$(whoami)"
SCRIPT_NAME="cloud-observe"
DRY_RUN="${DRY_RUN:-false}"
EVENTS_LOG="$HOME/Recovered/events.jsonl"

# Which worker to tail (default: heaven)
WORKER="${1:-heaven}"

# ── Recovery Preamble ────────────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════"
echo " host:        $MACHINE_NAME"
echo " user:        $CURRENT_USER"
echo " command:     $SCRIPT_NAME"
echo " source:      Cloudflare Workers ($WORKER)"
echo " destination: stdout (live tail)"
echo " dry-run:     $DRY_RUN"
echo "═══════════════════════════════════════════════════"

mkdir -p "$(dirname "$EVENTS_LOG")"

log_event() {
  printf '{"ts":"%s","script":"%s","machine":"%s","user":"%s","action":"%s","detail":%s}\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$SCRIPT_NAME" "$MACHINE_NAME" "$CURRENT_USER" "$1" "$2" \
    >> "$EVENTS_LOG"
}

# ── Pre-flight checks ───────────────────────────────────────────────────────
if ! command -v npx >/dev/null 2>&1; then
  echo "ERROR: npx not found. Install Node.js."
  exit 1
fi

# Quick health check before tailing
echo ""
echo "--- Heaven Health Check ---"
HEAVEN_URL="https://heaven.rsp-5f3.workers.dev"
if health=$(curl -fsS --max-time 5 "$HEAVEN_URL/health" 2>/dev/null); then
  echo "  Heaven: LIVE"
  echo "  $health" | python3 -m json.tool 2>/dev/null || echo "  $health"
else
  echo "  Heaven: UNREACHABLE (may still have logs)"
fi

# ── Tail logs ────────────────────────────────────────────────────────────────
echo ""
echo "--- Tailing $WORKER logs (Ctrl+C to stop) ---"
echo ""

log_event "observe_started" "{\"worker\":\"$WORKER\"}"

if [ "$DRY_RUN" = "true" ]; then
  echo "  DRY RUN — would run: npx wrangler tail $WORKER"
  exit 0
fi

# Use wrangler tail with JSON format for machine-readable output
# Add --format json for structured logs, or pretty for human reading
npx wrangler tail "$WORKER" --format pretty 2>&1 || {
  echo ""
  echo "Tail disconnected. Common fixes:"
  echo "  1. Run: npx wrangler login  (if auth expired)"
  echo "  2. Check worker name: npx wrangler whoami"
  echo "  3. Try: npx wrangler tail heaven --format json"
  log_event "observe_error" "{\"worker\":\"$WORKER\",\"error\":\"tail_disconnected\"}"
}
