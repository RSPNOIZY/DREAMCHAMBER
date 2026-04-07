#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# setup-blocker-v2.sh — NOIZY Universal Content Blocker
# Updates /etc/hosts with blocklists for tracking/ads
# Runs daily via launchd (com.noizylab.universal-blocker)
# RSP_001 | NOIZY Empire | 2026
# ═══════════════════════════════════════════════════════════════

LOG="/tmp/universal-blocker.log"
HOSTS_BACKUP="/tmp/hosts.backup.$(date +%Y%m%d)"
BLOCKER_TAG="# NOIZY-BLOCKER-START"
BLOCKER_END="# NOIZY-BLOCKER-END"
GABRIEL="http://localhost:7777"

TS=$(date '+%Y-%m-%d %H:%M:%S')
log() { echo "[$TS] $1" | tee -a "$LOG"; }

# Skip on --update flag without network
if [ "${1}" = "--update" ]; then
    if ! curl -s --max-time 5 https://raw.githubusercontent.com > /dev/null 2>&1; then
        log "Network unavailable — skipping update"
        exit 0
    fi
fi

log "Universal Blocker v2 starting"

# Backup hosts
cp /etc/hosts "$HOSTS_BACKUP" 2>/dev/null && log "Hosts backed up → $HOSTS_BACKUP"

# Block lists (curated, privacy-respecting sources)
BLOCKLISTS=(
    "https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts"
)

# Fetch and extract blocked domains
TEMP_BLOCK=$(mktemp)
for url in "${BLOCKLISTS[@]}"; do
    log "Fetching: $url"
    curl -s --max-time 30 "$url" 2>/dev/null | \
        grep "^0\.0\.0\.0" | \
        grep -v "localhost\|local\|broadcasthost" | \
        head -5000 >> "$TEMP_BLOCK"
done

COUNT=$(wc -l < "$TEMP_BLOCK" | tr -d ' ')
log "Fetched $COUNT block entries"

if [ "$COUNT" -lt 100 ]; then
    log "⚠ Too few entries ($COUNT) — aborting to prevent hosts corruption"
    rm "$TEMP_BLOCK"
    exit 1
fi

# Remove old blocker section from /etc/hosts
CLEAN_HOSTS=$(mktemp)
awk "/$BLOCKER_TAG/{found=1} !found{print} /$BLOCKER_END/{found=0}" /etc/hosts > "$CLEAN_HOSTS"

# Append new blocker section
{
    echo ""
    echo "$BLOCKER_TAG — Updated $(date '+%Y-%m-%d') — $COUNT entries"
    cat "$TEMP_BLOCK"
    echo "$BLOCKER_END"
} >> "$CLEAN_HOSTS"

# Apply (requires sudo — launchd runs as root for this plist)
if cp "$CLEAN_HOSTS" /etc/hosts 2>/dev/null; then
    log "✅ Hosts updated with $COUNT entries"
    dscacheutil -flushcache 2>/dev/null
    killall -HUP mDNSResponder 2>/dev/null
else
    log "⚠ Cannot write /etc/hosts — may need elevated privileges"
fi

rm -f "$TEMP_BLOCK" "$CLEAN_HOSTS"

# Report to GABRIEL
curl -s -X POST "$GABRIEL/memcell/blocker:last_run" \
    -H "Content-Type: application/json" \
    -d "{\"value\": {\"ts\": \"$TS\", \"entries\": $COUNT, \"status\": \"ok\"}}" \
    > /dev/null 2>&1

log "Blocker update complete"
exit 0
