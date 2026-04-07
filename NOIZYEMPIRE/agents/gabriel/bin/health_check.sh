#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# NOIZYLAB System Health Diagnostic
# ═══════════════════════════════════════════════════════════════
# Comprehensive health check across all devices, services,
# and infrastructure. Outputs structured JSON for consumption
# by GABRIEL, Cloudflare Workers, or voice announcements.
#
# Usage: ./health_check.sh [--json] [--voice] [--fix]
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

NOIZYLAB_HOME="${NOIZYLAB_HOME:-/Users/m2ultra/NOIZYLAB}"
GABRIEL_HOME="$NOIZYLAB_HOME/GABRIEL"
CODEMASTER_HOME="$NOIZYLAB_HOME/CODEMASTER"
LOG_DIR="$NOIZYLAB_HOME/logs"

OUTPUT_JSON=0
VOICE_ANNOUNCE=0
AUTO_FIX=0
ISSUES=0
WARNINGS=0

while [[ $# -gt 0 ]]; do
    case $1 in
        --json) OUTPUT_JSON=1; shift ;;
        --voice) VOICE_ANNOUNCE=1; shift ;;
        --fix) AUTO_FIX=1; shift ;;
        *) shift ;;
    esac
done

# ─── Colors ───────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ─── Helpers ──────────────────────────────────────────────────
pass() { echo -e "  ${GREEN}✓${NC} $1"; }
fail() { echo -e "  ${RED}✗${NC} $1"; ((ISSUES++)); }
warn() { echo -e "  ${YELLOW}!${NC} $1"; ((WARNINGS++)); }
info() { echo -e "  ${CYAN}→${NC} $1"; }
header() { echo -e "\n${BOLD}═══ $1 ═══${NC}"; }

timestamp() { date -u '+%Y-%m-%dT%H:%M:%SZ'; }

# ─── JSON accumulator ────────────────────────────────────────
JSON_RESULTS="[]"
add_result() {
    local category="$1" check="$2" status="$3" detail="$4"
    JSON_RESULTS=$(echo "$JSON_RESULTS" | python3 -c "
import json, sys
r = json.load(sys.stdin)
r.append({'category':'$category','check':'$check','status':'$status','detail':'$detail'})
print(json.dumps(r))
" 2>/dev/null || echo "$JSON_RESULTS")
}

# ═══════════════════════════════════════════════════════════════
# NETWORK
# ═══════════════════════════════════════════════════════════════
check_network() {
    header "DEVICE NETWORK"

    declare -A DEVICES
    DEVICES=(
        ["GOD"]="10.90.90.10"
        ["GABRIEL"]="10.90.90.20"
        ["DaFixer"]="10.90.90.40"
    )

    local online=0
    for name in "${!DEVICES[@]}"; do
        local ip="${DEVICES[$name]}"
        if ping -c 1 -W 1 "$ip" &>/dev/null; then
            pass "$name ($ip) — online"
            add_result "network" "$name" "ok" "online"
            ((online++))
        else
            fail "$name ($ip) — OFFLINE"
            add_result "network" "$name" "fail" "offline"
        fi
    done

    info "$online/${#DEVICES[@]} devices online"

    # Internet
    if ping -c 1 -W 2 8.8.8.8 &>/dev/null; then
        pass "Internet — connected"
    else
        fail "Internet — NO CONNECTION"
    fi
}

# ═══════════════════════════════════════════════════════════════
# SYSTEM RESOURCES
# ═══════════════════════════════════════════════════════════════
check_system() {
    header "SYSTEM RESOURCES ($(hostname -s))"

    # CPU load
    local load
    load=$(sysctl -n vm.loadavg 2>/dev/null | awk '{print $2}' || uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | tr -d ',')
    local cores
    cores=$(sysctl -n hw.ncpu 2>/dev/null || nproc 2>/dev/null || echo 1)

    local load_int=${load%.*}
    if [[ $load_int -lt $cores ]]; then
        pass "CPU load: $load (${cores} cores)"
    elif [[ $load_int -lt $((cores * 2)) ]]; then
        warn "CPU load: $load (${cores} cores) — elevated"
    else
        fail "CPU load: $load (${cores} cores) — OVERLOADED"
    fi

    # Memory
    local mem_pressure
    mem_pressure=$(memory_pressure 2>/dev/null | head -1 || echo "unknown")
    if echo "$mem_pressure" | grep -qi "normal"; then
        pass "Memory: $mem_pressure"
    elif echo "$mem_pressure" | grep -qi "warn"; then
        warn "Memory: $mem_pressure"
    else
        info "Memory: $mem_pressure"
    fi

    # Disk
    local disk_usage disk_pct
    disk_usage=$(df -h / | awk 'NR==2 {print $4 " free (" $5 " used)"}')
    disk_pct=$(df / | awk 'NR==2 {gsub(/%/,""); print $5}')
    if [[ $disk_pct -lt 80 ]]; then
        pass "Disk: $disk_usage"
    elif [[ $disk_pct -lt 90 ]]; then
        warn "Disk: $disk_usage — getting full"
    else
        fail "Disk: $disk_usage — CRITICALLY LOW"
    fi

    # Uptime
    local up
    up=$(uptime | awk -F'up ' '{print $2}' | awk -F',' '{print $1}')
    info "Uptime: $up"
}

# ═══════════════════════════════════════════════════════════════
# GABRIEL SERVICES
# ═══════════════════════════════════════════════════════════════
check_gabriel() {
    header "GABRIEL ORCHESTRATION"

    # Server
    if [[ -f "$GABRIEL_HOME/.server.pid" ]]; then
        local pid
        pid=$(cat "$GABRIEL_HOME/.server.pid")
        if kill -0 "$pid" 2>/dev/null; then
            pass "GABRIEL Server — running (PID $pid)"
            add_result "gabriel" "server" "ok" "running"
        else
            fail "GABRIEL Server — stale PID ($pid)"
            add_result "gabriel" "server" "fail" "stale_pid"
            if [[ $AUTO_FIX -eq 1 ]]; then
                info "Auto-fixing: restarting GABRIEL server..."
                rm -f "$GABRIEL_HOME/.server.pid"
                nohup "$GABRIEL_HOME/bin/start_server.sh" >/dev/null 2>&1 &
                sleep 2
                pass "Server restarted"
            fi
        fi
    else
        fail "GABRIEL Server — NOT RUNNING"
        add_result "gabriel" "server" "fail" "not_running"
        if [[ $AUTO_FIX -eq 1 ]]; then
            info "Auto-fixing: starting GABRIEL server..."
            nohup "$GABRIEL_HOME/bin/start_server.sh" >/dev/null 2>&1 &
            sleep 2
            pass "Server started"
        fi
    fi

    # Bridge
    if [[ -f "$GABRIEL_HOME/.bridge.pid" ]]; then
        local pid
        pid=$(cat "$GABRIEL_HOME/.bridge.pid")
        if kill -0 "$pid" 2>/dev/null; then
            pass "GABRIEL Bridge — connected (PID $pid)"
            add_result "gabriel" "bridge" "ok" "connected"
        else
            fail "GABRIEL Bridge — stale PID ($pid)"
            add_result "gabriel" "bridge" "fail" "stale_pid"
            if [[ $AUTO_FIX -eq 1 ]]; then
                info "Auto-fixing: restarting bridge..."
                rm -f "$GABRIEL_HOME/.bridge.pid"
                nohup "$GABRIEL_HOME/bin/start_bridge.sh" >/dev/null 2>&1 &
                sleep 2
                pass "Bridge restarted"
            fi
        fi
    else
        fail "GABRIEL Bridge — NOT RUNNING"
        add_result "gabriel" "bridge" "fail" "not_running"
        if [[ $AUTO_FIX -eq 1 ]]; then
            info "Auto-fixing: starting bridge..."
            nohup "$GABRIEL_HOME/bin/start_bridge.sh" >/dev/null 2>&1 &
            sleep 2
            pass "Bridge started"
        fi
    fi

    # Script existence check
    for script in start_server.sh start_bridge.sh health_check.sh; do
        if [[ -x "$GABRIEL_HOME/bin/$script" ]]; then
            pass "Script: $script exists and executable"
        else
            fail "Script: $script MISSING or not executable"
        fi
    done
}

# ═══════════════════════════════════════════════════════════════
# KEY SERVICES
# ═══════════════════════════════════════════════════════════════
check_services() {
    header "KEY SERVICES"

    # Ollama (AI model server)
    if curl -s --max-time 2 http://127.0.0.1:11434/api/tags &>/dev/null; then
        local models
        models=$(curl -s http://127.0.0.1:11434/api/tags | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('models',[])))" 2>/dev/null || echo "?")
        pass "Ollama — running ($models models loaded)"
    else
        warn "Ollama — not running"
    fi

    # SSH daemon
    if pgrep -q sshd 2>/dev/null || launchctl list | grep -q ssh 2>/dev/null; then
        pass "SSH — active"
    else
        warn "SSH — not detected"
    fi

    # Docker
    if command -v docker &>/dev/null && docker info &>/dev/null 2>&1; then
        local containers
        containers=$(docker ps -q 2>/dev/null | wc -l | tr -d ' ')
        pass "Docker — running ($containers containers)"
    else
        info "Docker — not running"
    fi
}

# ═══════════════════════════════════════════════════════════════
# LAUNCHD SERVICES
# ═══════════════════════════════════════════════════════════════
check_launchd() {
    header "LAUNCHD AGENTS"

    local plist_dir="$HOME/Library/LaunchAgents"
    local noizy_services=("com.gabriel.server" "com.gabriel.bridge" "com.noizylab.health" "com.noizylab.morning")

    for svc in "${noizy_services[@]}"; do
        local plist="$plist_dir/${svc}.plist"
        if [[ -f "$plist" ]]; then
            local status
            status=$(launchctl list "$svc" 2>/dev/null && echo "loaded" || echo "not_loaded")
            if echo "$status" | grep -q "loaded"; then
                pass "$svc — loaded"
            else
                warn "$svc — plist exists but not loaded"
            fi
        else
            warn "$svc — no plist found"
        fi
    done
}

# ═══════════════════════════════════════════════════════════════
# LOG HEALTH
# ═══════════════════════════════════════════════════════════════
check_logs() {
    header "LOG HEALTH"

    local log_dirs=("$GABRIEL_HOME/logs" "$CODEMASTER_HOME/logs" "$NOIZYLAB_HOME/logs")

    for dir in "${log_dirs[@]}"; do
        if [[ -d "$dir" ]]; then
            local total_size
            total_size=$(du -sh "$dir" 2>/dev/null | awk '{print $1}')

            # Check for bloated error logs
            for logfile in "$dir"/*.error.log; do
                if [[ -f "$logfile" ]]; then
                    local lines
                    lines=$(wc -l < "$logfile" 2>/dev/null || echo 0)
                    local basename
                    basename=$(basename "$logfile")
                    if [[ $lines -gt 100000 ]]; then
                        fail "$basename — $lines lines (BLOATED)"
                        if [[ $AUTO_FIX -eq 1 ]]; then
                            info "Auto-fixing: rotating $basename"
                            mv "$logfile" "${logfile}.$(date +%Y%m%d)"
                            touch "$logfile"
                            pass "Rotated $basename"
                        fi
                    elif [[ $lines -gt 10000 ]]; then
                        warn "$basename — $lines lines"
                    elif [[ $lines -gt 0 ]]; then
                        info "$basename — $lines lines"
                    fi
                fi
            done

            info "$(basename "$dir")/ — $total_size total"
        fi
    done
}

# ═══════════════════════════════════════════════════════════════
# DIRECTORY STRUCTURE
# ═══════════════════════════════════════════════════════════════
check_structure() {
    header "DIRECTORY STRUCTURE"

    local required_dirs=(
        "$NOIZYLAB_HOME"
        "$GABRIEL_HOME"
        "$GABRIEL_HOME/bin"
        "$GABRIEL_HOME/logs"
        "$CODEMASTER_HOME"
        "$CODEMASTER_HOME/logs"
        "$NOIZYLAB_HOME/logs"
    )

    for dir in "${required_dirs[@]}"; do
        if [[ -d "$dir" ]]; then
            pass "$(echo "$dir" | sed "s|$NOIZYLAB_HOME|~NOIZYLAB|")"
        else
            fail "MISSING: $(echo "$dir" | sed "s|$NOIZYLAB_HOME|~NOIZYLAB|")"
            if [[ $AUTO_FIX -eq 1 ]]; then
                mkdir -p "$dir"
                pass "Created: $dir"
            fi
        fi
    done
}

# ═══════════════════════════════════════════════════════════════
# REPORT
# ═══════════════════════════════════════════════════════════════
generate_report() {
    header "HEALTH REPORT"

    local ts
    ts=$(timestamp)

    if [[ $ISSUES -eq 0 ]] && [[ $WARNINGS -eq 0 ]]; then
        echo -e "\n  ${GREEN}${BOLD}ALL SYSTEMS NOMINAL${NC}"
        echo -e "  $ts | 0 issues | 0 warnings\n"
    elif [[ $ISSUES -eq 0 ]]; then
        echo -e "\n  ${YELLOW}${BOLD}SYSTEMS OK WITH WARNINGS${NC}"
        echo -e "  $ts | 0 issues | $WARNINGS warnings\n"
    else
        echo -e "\n  ${RED}${BOLD}ISSUES DETECTED${NC}"
        echo -e "  $ts | $ISSUES issues | $WARNINGS warnings\n"
    fi

    # Voice announcement
    if [[ $VOICE_ANNOUNCE -eq 1 ]] && command -v say &>/dev/null; then
        if [[ $ISSUES -eq 0 ]]; then
            say -v Jamie "Health check complete. All systems nominal. $WARNINGS warnings." &
        else
            say -v Jamie "Health check complete. $ISSUES issues found and $WARNINGS warnings." &
        fi
    fi

    # JSON output
    if [[ $OUTPUT_JSON -eq 1 ]]; then
        echo "$JSON_RESULTS" | python3 -m json.tool 2>/dev/null || echo "$JSON_RESULTS"
    fi
}

# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════

echo -e "\n${BOLD}╔══════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║  NOIZYLAB System Health Diagnostic            ║${NC}"
echo -e "${BOLD}║  $(timestamp)                    ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════╝${NC}"

check_network
check_system
check_gabriel
check_services
check_launchd
check_logs
check_structure
generate_report

exit $ISSUES
