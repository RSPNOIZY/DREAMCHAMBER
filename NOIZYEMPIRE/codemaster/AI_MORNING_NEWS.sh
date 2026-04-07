#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# CODEMASTER — AI Morning News & Briefing
# ═══════════════════════════════════════════════════════════════
# Morning intelligence brief covering:
#   - System health
#   - AI service status (Anthropic, OpenAI, Ollama)
#   - NOIZYLAB business metrics
#   - Cloudflare infrastructure status
#   - Weather (optional)
#
# Usage: ./AI_MORNING_NEWS.sh [--voice] [--json]
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

NOIZYLAB_HOME="/Users/m2ultra/NOIZYLAB"
GABRIEL_HOME="$NOIZYLAB_HOME/GABRIEL"
LOG_DIR="$NOIZYLAB_HOME/CODEMASTER/news"
LOG_FILE="$LOG_DIR/morning_news.log"
VOICE=0
JSON=0

while [[ $# -gt 0 ]]; do
    case $1 in
        --voice) VOICE=1; shift ;;
        --json) JSON=1; shift ;;
        *) shift ;;
    esac
done

mkdir -p "$LOG_DIR"

timestamp() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "[$(timestamp)] $*" >> "$LOG_FILE"; }

speak() {
    [[ $VOICE -eq 1 ]] && command -v say &>/dev/null && say -v Jamie "$*"
}

# ═══════════════════════════════════════════════════════════════
# INTELLIGENCE GATHERING
# ═══════════════════════════════════════════════════════════════

gather_system() {
    local load disk uptime_val
    load=$(sysctl -n vm.loadavg 2>/dev/null | awk '{print $2}' || echo "unknown")
    disk=$(df -h / 2>/dev/null | awk 'NR==2 {print $4}' || echo "unknown")
    uptime_val=$(uptime | awk -F'up ' '{print $2}' | awk -F',' '{print $1}')

    echo "load=$load disk_free=$disk uptime=$uptime_val"
}

gather_ai_status() {
    local anthropic="unknown" ollama="unknown"

    # Anthropic
    local anthro_status
    anthro_status=$(curl -s --max-time 5 "https://status.anthropic.com/api/v2/status.json" 2>/dev/null)
    if [[ -n "$anthro_status" ]]; then
        anthropic=$(echo "$anthro_status" | python3 -c "import json,sys; print(json.load(sys.stdin)['status']['indicator'])" 2>/dev/null || echo "unknown")
    fi

    # Ollama (local)
    if curl -s --max-time 2 "http://127.0.0.1:11434/" &>/dev/null; then
        ollama="running"
    else
        ollama="offline"
    fi

    echo "anthropic=$anthropic ollama=$ollama"
}

gather_devices() {
    local online=0 total=3
    ping -c 1 -W 1 10.90.90.10 &>/dev/null && ((online++))
    ping -c 1 -W 1 10.90.90.20 &>/dev/null && ((online++))
    ping -c 1 -W 1 10.90.90.40 &>/dev/null && ((online++))
    echo "devices_online=$online devices_total=$total"
}

gather_gabriel() {
    local server="offline" bridge="offline"

    if [[ -f "$GABRIEL_HOME/.server.pid" ]]; then
        local pid=$(cat "$GABRIEL_HOME/.server.pid" 2>/dev/null)
        kill -0 "$pid" 2>/dev/null && server="running"
    fi

    if [[ -f "$GABRIEL_HOME/.bridge.pid" ]]; then
        local pid=$(cat "$GABRIEL_HOME/.bridge.pid" 2>/dev/null)
        kill -0 "$pid" 2>/dev/null && bridge="running"
    fi

    echo "gabriel_server=$server gabriel_bridge=$bridge"
}

# ═══════════════════════════════════════════════════════════════
# BRIEFING
# ═══════════════════════════════════════════════════════════════

generate_briefing() {
    local sys_data ai_data dev_data gab_data
    sys_data=$(gather_system)
    ai_data=$(gather_ai_status)
    dev_data=$(gather_devices)
    gab_data=$(gather_gabriel)

    # Parse
    eval "$sys_data"
    eval "$ai_data"
    eval "$dev_data"
    eval "$gab_data"

    local day_of_week
    day_of_week=$(date '+%A')
    local date_str
    date_str=$(date '+%B %d, %Y')

    log "═══ Morning News — $date_str ═══"
    log "System: $sys_data"
    log "AI: $ai_data"
    log "Devices: $dev_data"
    log "GABRIEL: $gab_data"

    # Build voice script
    local briefing="Good morning Rob. It's $day_of_week, $date_str. "

    # System
    briefing+="GOD is running with a load of $load and $disk_free disk free. "

    # Devices
    if [[ $devices_online -eq $devices_total ]]; then
        briefing+="All $devices_total devices are online. "
    else
        briefing+="$devices_online of $devices_total devices are online. "
    fi

    # GABRIEL
    if [[ "$gabriel_server" == "running" ]] && [[ "$gabriel_bridge" == "running" ]]; then
        briefing+="GABRIEL is fully operational. "
    elif [[ "$gabriel_server" == "running" ]]; then
        briefing+="GABRIEL server is running but the bridge is offline. "
    else
        briefing+="Warning. GABRIEL needs attention. "
    fi

    # AI services
    case "$anthropic" in
        none) briefing+="Anthropic is fully operational. " ;;
        minor) briefing+="Anthropic has a minor service issue. " ;;
        major) briefing+="Warning. Anthropic is experiencing an outage. " ;;
        *) briefing+="Anthropic status is unknown. " ;;
    esac

    if [[ "$ollama" == "running" ]]; then
        briefing+="Ollama is running locally. "
    else
        briefing+="Ollama is offline. "
    fi

    briefing+="End of morning brief. Go run free."

    echo "$briefing"

    if [[ $VOICE -eq 1 ]]; then
        speak "$briefing"
    fi

    log "Briefing delivered (voice=$VOICE)"
}

# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════

generate_briefing
