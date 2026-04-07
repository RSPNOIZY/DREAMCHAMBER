#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# CODEMASTER — Anthropic API Status Checker
# ═══════════════════════════════════════════════════════════════
# Checks Anthropic API health and Claude model availability.
# Logs status for GABRIEL consumption.
#
# Usage: ./CHECK_ANTHROPIC_STATUS.sh [--voice]
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

LOG_DIR="/Users/m2ultra/NOIZYLAB/CODEMASTER/logs"
LOG_FILE="$LOG_DIR/anthropic_status.log"
VOICE=0
[[ "${1:-}" == "--voice" ]] && VOICE=1

mkdir -p "$LOG_DIR"

timestamp() { date '+%Y-%m-%d %H:%M:%S'; }

log() { echo "[$(timestamp)] $*" >> "$LOG_FILE"; }

# ─── Check Anthropic Status Page ─────────────────────────────
check_status_page() {
    local response
    response=$(curl -s --max-time 10 "https://status.anthropic.com/api/v2/status.json" 2>/dev/null) || {
        log "ERROR: Cannot reach status.anthropic.com"
        echo "unreachable"
        return
    }

    local indicator description
    indicator=$(echo "$response" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['status']['indicator'])" 2>/dev/null || echo "unknown")
    description=$(echo "$response" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['status']['description'])" 2>/dev/null || echo "unknown")

    log "Status: $indicator — $description"
    echo "$indicator"
}

# ─── Check API Endpoint ──────────────────────────────────────
check_api() {
    local api_key="${ANTHROPIC_API_KEY:-}"

    if [[ -z "$api_key" ]]; then
        # Try to load from common locations
        for keyfile in "$HOME/.anthropic_key" "$HOME/.config/anthropic/key" "$HOME/.env"; do
            if [[ -f "$keyfile" ]]; then
                api_key=$(grep -E "^ANTHROPIC_API_KEY=" "$keyfile" 2>/dev/null | cut -d= -f2 | tr -d '"' || cat "$keyfile" 2>/dev/null)
                [[ -n "$api_key" ]] && break
            fi
        done
    fi

    if [[ -z "$api_key" ]]; then
        log "WARN: No API key found — skipping live API check"
        echo "no_key"
        return
    fi

    # Quick health check — send minimal request
    local start_ms
    start_ms=$(python3 -c "import time; print(int(time.time()*1000))")

    local http_code
    http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 \
        -X POST "https://api.anthropic.com/v1/messages" \
        -H "Content-Type: application/json" \
        -H "x-api-key: $api_key" \
        -H "anthropic-version: 2023-06-01" \
        -d '{"model":"claude-sonnet-4-20250514","max_tokens":1,"messages":[{"role":"user","content":"ping"}]}' 2>/dev/null) || {
        log "ERROR: API request failed"
        echo "error"
        return
    }

    local end_ms
    end_ms=$(python3 -c "import time; print(int(time.time()*1000))")
    local latency=$((end_ms - start_ms))

    if [[ "$http_code" == "200" ]]; then
        log "API: OK (${latency}ms)"
        echo "ok:${latency}"
    elif [[ "$http_code" == "429" ]]; then
        log "API: Rate limited"
        echo "rate_limited"
    elif [[ "$http_code" == "529" ]]; then
        log "API: Overloaded"
        echo "overloaded"
    else
        log "API: HTTP $http_code (${latency}ms)"
        echo "http_${http_code}"
    fi
}

# ─── Main ─────────────────────────────────────────────────────
log "═══ Anthropic Status Check ═══"

status=$(check_status_page)
api=$(check_api)

log "Summary: status=$status api=$api"

# Voice report
if [[ $VOICE -eq 1 ]] && command -v say &>/dev/null; then
    case "$status" in
        none)
            say -v Jamie "Anthropic systems operational." &
            ;;
        minor)
            say -v Jamie "Anthropic has a minor issue. API may be slow." &
            ;;
        major)
            say -v Jamie "Warning. Anthropic is experiencing a major outage." &
            ;;
        *)
            say -v Jamie "Anthropic status unknown." &
            ;;
    esac
fi

# Output for piping
echo "status=$status api=$api"
