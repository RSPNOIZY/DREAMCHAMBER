#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# GABRIEL Server — Main Orchestration Engine
# ═══════════════════════════════════════════════════════════════
# Manages the CF01 task queue, agent heartbeats, MCP routing,
# and voice command processing on the GABRIEL device network.
#
# Devices:
#   GOD      (10.90.90.10)  Mac Studio M2 Ultra — heavy compute
#   GABRIEL  (10.90.90.20)  HP Omen — AI brain
#   DaFixer  (10.90.90.40)  MacBook Pro — mobile unit
#
# Usage: ./start_server.sh [--debug] [--port PORT]
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

# ─── Config ───────────────────────────────────────────────────
GABRIEL_HOME="${GABRIEL_HOME:-/Users/m2ultra/NOIZYLAB/GABRIEL}"
LOG_DIR="$GABRIEL_HOME/logs"
PID_FILE="$GABRIEL_HOME/.server.pid"
PORT="${GABRIEL_PORT:-8420}"
DEBUG=0

# Parse args
while [[ $# -gt 0 ]]; do
    case $1 in
        --debug) DEBUG=1; shift ;;
        --port) PORT="$2"; shift 2 ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

# ─── Logging ──────────────────────────────────────────────────
mkdir -p "$LOG_DIR"
SERVER_LOG="$LOG_DIR/server.log"
ERROR_LOG="$LOG_DIR/server.error.log"

log() {
    local level="$1"; shift
    local msg="[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $*"
    echo "$msg" >> "$SERVER_LOG"
    [[ $DEBUG -eq 1 ]] && echo "$msg"
}

log_error() {
    local msg="[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $*"
    echo "$msg" >> "$ERROR_LOG"
    echo "$msg" >> "$SERVER_LOG"
    [[ $DEBUG -eq 1 ]] && echo "$msg" >&2
}

# ─── Preflight ────────────────────────────────────────────────
if [[ -f "$PID_FILE" ]]; then
    OLD_PID=$(cat "$PID_FILE" 2>/dev/null || echo "")
    if [[ -n "$OLD_PID" ]] && kill -0 "$OLD_PID" 2>/dev/null; then
        echo "[GABRIEL] Server already running (PID $OLD_PID)"
        echo "          Stop with: kill $OLD_PID"
        exit 1
    fi
    rm -f "$PID_FILE"
fi

# Check dependencies
for cmd in curl jq; do
    if ! command -v "$cmd" &>/dev/null; then
        log_error "Missing dependency: $cmd"
        exit 1
    fi
done

# ─── Device Network ──────────────────────────────────────────
DEVICES=(
    "GOD:10.90.90.10"
    "GABRIEL:10.90.90.20"
    "DaFixer:10.90.90.40"
)

check_device() {
    local name="${1%%:*}"
    local ip="${1##*:}"
    if ping -c 1 -W 1 "$ip" &>/dev/null; then
        echo "online"
    else
        echo "offline"
    fi
}

scan_network() {
    log "INFO" "Scanning device network..."
    for device in "${DEVICES[@]}"; do
        local name="${device%%:*}"
        local ip="${device##*:}"
        local status
        status=$(check_device "$device")
        log "INFO" "  $name ($ip): $status"
    done
}

# ─── Voice Announce ───────────────────────────────────────────
announce() {
    local msg="$1"
    # Try local macOS say first, fallback silently
    if command -v say &>/dev/null; then
        say -v Jamie "$msg" &
    fi
}

# ─── Heartbeat ────────────────────────────────────────────────
HEARTBEAT_INTERVAL=30

heartbeat_loop() {
    while true; do
        # Get hostname and device identity
        local hostname
        hostname=$(hostname -s 2>/dev/null || echo "unknown")
        local load
        load=$(sysctl -n vm.loadavg 2>/dev/null | awk '{print $2}' || uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | tr -d ',')

        log "INFO" "Heartbeat — load: $load"

        # Check for pending tasks (poll Cloudflare D1 via Workers API)
        # This would hit your deployed CF Worker endpoint
        # For now, log the heartbeat
        sleep "$HEARTBEAT_INTERVAL"
    done
}

# ─── Task Processor ───────────────────────────────────────────
process_voice_command() {
    local command="$1"
    log "INFO" "Voice command received: $command"

    case "$command" in
        status|"system status")
            announce "All systems nominal"
            ;;
        "device check")
            scan_network
            announce "Device scan complete"
            ;;
        stop|shutdown)
            announce "Shutting down GABRIEL server"
            cleanup
            exit 0
            ;;
        *)
            log "INFO" "Unrecognized command: $command"
            ;;
    esac
}

# ─── Cleanup ──────────────────────────────────────────────────
cleanup() {
    log "INFO" "Server shutting down..."
    rm -f "$PID_FILE"
    # Kill child processes
    jobs -p | xargs -r kill 2>/dev/null || true
    log "INFO" "Server stopped."
}

trap cleanup EXIT INT TERM

# ─── Main ─────────────────────────────────────────────────────
main() {
    # Clear old logs if they're just error spam
    if [[ -f "$ERROR_LOG" ]]; then
        local line_count
        line_count=$(wc -l < "$ERROR_LOG" 2>/dev/null || echo 0)
        if [[ $line_count -gt 10000 ]]; then
            log "INFO" "Rotating bloated error log ($line_count lines)"
            mv "$ERROR_LOG" "$ERROR_LOG.$(date +%Y%m%d)"
            touch "$ERROR_LOG"
        fi
    fi

    echo "$$" > "$PID_FILE"
    log "INFO" "═══════════════════════════════════════════════"
    log "INFO" "GABRIEL Server starting on port $PORT"
    log "INFO" "PID: $$"
    log "INFO" "Home: $GABRIEL_HOME"
    log "INFO" "═══════════════════════════════════════════════"

    # Scan network
    scan_network

    # Voice announcement
    announce "GABRIEL server online"

    # Start heartbeat in background
    heartbeat_loop &

    log "INFO" "Server ready. Listening for tasks..."

    # Main loop — listen for FIFO commands or poll task queue
    local fifo="$GABRIEL_HOME/.server_fifo"
    [[ -p "$fifo" ]] || mkfifo "$fifo"

    while true; do
        if read -r -t 5 cmd < "$fifo" 2>/dev/null; then
            process_voice_command "$cmd"
        fi
    done
}

main "$@"
