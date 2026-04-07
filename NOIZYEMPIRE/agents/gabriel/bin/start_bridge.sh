#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# GABRIEL Bridge — Local ↔ Cloudflare Edge Connector
# ═══════════════════════════════════════════════════════════════
# Bridges the local device network (GOD/GABRIEL/DaFixer) with
# Cloudflare Workers infrastructure. Syncs device state, routes
# tasks between local machines and edge, and maintains portal
# consciousness for seamless cross-device context transfer.
#
# Usage: ./start_bridge.sh [--debug]
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

# ─── Config ───────────────────────────────────────────────────
GABRIEL_HOME="${GABRIEL_HOME:-/Users/m2ultra/NOIZYLAB/GABRIEL}"
LOG_DIR="$GABRIEL_HOME/logs"
PID_FILE="$GABRIEL_HOME/.bridge.pid"
DEBUG=0
SYNC_INTERVAL=15  # seconds between edge syncs

# Cloudflare
CF_WORKER_URL="${CF_WORKER_URL:-https://deploy.noizylab.workers.dev}"
CF_API_TOKEN="${CF_API_TOKEN:-}"

# Local network
DEVICES=(
    "GOD:10.90.90.10"
    "GABRIEL:10.90.90.20"
    "DaFixer:10.90.90.40"
)

# Parse args
while [[ $# -gt 0 ]]; do
    case $1 in
        --debug) DEBUG=1; shift ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

# ─── Logging ──────────────────────────────────────────────────
mkdir -p "$LOG_DIR"
BRIDGE_LOG="$LOG_DIR/bridge.log"
ERROR_LOG="$LOG_DIR/bridge.error.log"

log() {
    local level="$1"; shift
    local msg="[$(date '+%Y-%m-%d %H:%M:%S')] [BRIDGE] [$level] $*"
    echo "$msg" >> "$BRIDGE_LOG"
    [[ $DEBUG -eq 1 ]] && echo "$msg"
}

log_error() {
    local msg="[$(date '+%Y-%m-%d %H:%M:%S')] [BRIDGE] [ERROR] $*"
    echo "$msg" >> "$ERROR_LOG"
    echo "$msg" >> "$BRIDGE_LOG"
    [[ $DEBUG -eq 1 ]] && echo "$msg" >&2
}

# ─── Preflight ────────────────────────────────────────────────
if [[ -f "$PID_FILE" ]]; then
    OLD_PID=$(cat "$PID_FILE" 2>/dev/null || echo "")
    if [[ -n "$OLD_PID" ]] && kill -0 "$OLD_PID" 2>/dev/null; then
        echo "[GABRIEL Bridge] Already running (PID $OLD_PID)"
        exit 1
    fi
    rm -f "$PID_FILE"
fi

# Rotate bloated logs
for logfile in "$BRIDGE_LOG" "$ERROR_LOG"; do
    if [[ -f "$logfile" ]]; then
        local_lines=$(wc -l < "$logfile" 2>/dev/null || echo 0)
        if [[ $local_lines -gt 50000 ]]; then
            log "INFO" "Rotating log: $logfile ($local_lines lines)"
            mv "$logfile" "${logfile}.$(date +%Y%m%d)"
            touch "$logfile"
        fi
    fi
done

# ─── Device Discovery ────────────────────────────────────────
discover_devices() {
    local online=0
    local total=${#DEVICES[@]}

    for device in "${DEVICES[@]}"; do
        local name="${device%%:*}"
        local ip="${device##*:}"

        if ping -c 1 -W 1 "$ip" &>/dev/null; then
            log "INFO" "Device $name ($ip) — ONLINE"
            ((online++))
        else
            log "WARN" "Device $name ($ip) — OFFLINE"
        fi
    done

    log "INFO" "Network: $online/$total devices online"
    return 0
}

# ─── Edge Sync ────────────────────────────────────────────────
sync_to_edge() {
    # Collect local state
    local hostname
    hostname=$(hostname -s 2>/dev/null || echo "unknown")

    local uptime_val
    uptime_val=$(uptime | awk -F'up ' '{print $2}' | awk -F',' '{print $1}')

    local load
    load=$(sysctl -n vm.loadavg 2>/dev/null | awk '{print $2}' || uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | tr -d ',')

    local mem_used
    mem_used=$(vm_stat 2>/dev/null | awk '/Pages active/ {printf "%.0f", $3*4096/1048576}' || free -m 2>/dev/null | awk '/Mem:/ {print $3}' || echo "0")

    local disk_free
    disk_free=$(df -h / 2>/dev/null | awk 'NR==2 {print $4}' || echo "unknown")

    # Build payload
    local payload
    payload=$(cat <<-PAYLOAD
{
    "device": "$hostname",
    "timestamp": "$(date -u '+%Y-%m-%dT%H:%M:%SZ')",
    "uptime": "$uptime_val",
    "load": "$load",
    "memory_used_mb": $mem_used,
    "disk_free": "$disk_free",
    "bridge_pid": $$
}
PAYLOAD
)

    log "INFO" "Edge sync — load: $load, mem: ${mem_used}MB, disk: $disk_free"

    # Push to Cloudflare Worker (if URL is configured)
    if [[ -n "$CF_WORKER_URL" ]] && [[ "$CF_WORKER_URL" != "https://deploy.noizylab.workers.dev" ]]; then
        local response
        response=$(curl -s -w "\n%{http_code}" \
            --max-time 5 \
            -X POST \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${CF_API_TOKEN}" \
            -d "$payload" \
            "${CF_WORKER_URL}/api/bridge/sync" 2>/dev/null) || true

        local http_code
        http_code=$(echo "$response" | tail -1)

        if [[ "$http_code" == "200" ]]; then
            log "INFO" "Edge sync successful"
        else
            log_error "Edge sync failed (HTTP $http_code)"
        fi
    fi
}

pull_from_edge() {
    # Pull pending tasks from Cloudflare
    if [[ -n "$CF_WORKER_URL" ]] && [[ "$CF_WORKER_URL" != "https://deploy.noizylab.workers.dev" ]]; then
        local response
        response=$(curl -s --max-time 5 \
            -H "Authorization: Bearer ${CF_API_TOKEN}" \
            "${CF_WORKER_URL}/api/bridge/tasks" 2>/dev/null) || true

        if [[ -n "$response" ]] && echo "$response" | jq -e '.tasks' &>/dev/null; then
            local task_count
            task_count=$(echo "$response" | jq '.tasks | length')
            if [[ "$task_count" -gt 0 ]]; then
                log "INFO" "Received $task_count tasks from edge"
                # Route tasks to appropriate local device
                echo "$response" | jq -c '.tasks[]' | while read -r task; do
                    route_task "$task"
                done
            fi
        fi
    fi
}

route_task() {
    local task="$1"
    local target
    target=$(echo "$task" | jq -r '.target // "auto"')
    local command
    command=$(echo "$task" | jq -r '.command')

    log "INFO" "Routing task: $command → $target"

    case "$target" in
        god|GOD)
            # SSH to GOD
            ssh -o ConnectTimeout=3 -o BatchMode=yes m2ultra@10.90.90.10 "$command" &
            ;;
        dafixer|DaFixer)
            # SSH to DaFixer
            ssh -o ConnectTimeout=3 -o BatchMode=yes m2ultra@10.90.90.40 "$command" &
            ;;
        auto|local|*)
            # Execute locally
            eval "$command" &
            ;;
    esac
}

# ─── Portal Consciousness ────────────────────────────────────
save_portal_state() {
    # Save current context to portal_consciousness via edge
    local session_id
    session_id="bridge-$(date +%s)"

    log "INFO" "Portal state saved: $session_id"
}

# ─── Cleanup ──────────────────────────────────────────────────
cleanup() {
    log "INFO" "Bridge shutting down..."
    rm -f "$PID_FILE"
    jobs -p | xargs -r kill 2>/dev/null || true
    log "INFO" "Bridge stopped."
}

trap cleanup EXIT INT TERM

# ─── Main ─────────────────────────────────────────────────────
main() {
    echo "$$" > "$PID_FILE"
    log "INFO" "═══════════════════════════════════════════════"
    log "INFO" "GABRIEL Bridge starting"
    log "INFO" "PID: $$"
    log "INFO" "Edge: $CF_WORKER_URL"
    log "INFO" "Sync interval: ${SYNC_INTERVAL}s"
    log "INFO" "═══════════════════════════════════════════════"

    # Initial device scan
    discover_devices

    # Voice announcement
    if command -v say &>/dev/null; then
        say -v Jamie "GABRIEL bridge connected" &
    fi

    log "INFO" "Bridge ready. Starting sync loop..."

    # Main sync loop
    while true; do
        sync_to_edge
        pull_from_edge
        sleep "$SYNC_INTERVAL"
    done
}

main "$@"
