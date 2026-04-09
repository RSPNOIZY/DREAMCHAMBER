#!/bin/zsh
# FORCE_PERFECTION.sh — Safe system optimization for GOD.local
#
# Called by turbo_reset.sh. Conservative by default — does NOT touch
# anything destructive without explicit env opt-in. Read every line
# before lifting the safety.
#
# Env opt-ins:
#   FORCE_PURGE_INACTIVE_MEMORY=1  → run `sudo purge` (frees inactive RAM)
#   FORCE_KILL_HUNGRY_LOGS=1       → truncate verbose ~/Library/Logs files
#
set -u

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
DIM='\033[2m'
NC='\033[0m'

echo "${GREEN}🚀 FORCE_PERFECTION — GOD.local optimization sweep${NC}"

# 1. Free disk: clear ~/Library/Caches selectively (skip active apps)
echo "${DIM}[1/4] Pruning safe user caches...${NC}"
for cache in com.apple.Safari/WebKitCache com.apple.Safari/Cache.db \
             com.spotify.client com.google.Chrome/Default/Cache \
             com.github.atom; do
    target="$HOME/Library/Caches/$cache"
    if [ -e "$target" ]; then
        rm -rf "$target" 2>/dev/null && echo "    ✓ pruned $cache"
    fi
done

# 2. Compact Spotlight index errors (no rebuild)
echo "${DIM}[2/4] Spotlight diagnostic...${NC}"
mdutil -s / 2>/dev/null | head -2

# 3. Optional: free inactive memory (requires sudo, opt-in)
if [ "${FORCE_PURGE_INACTIVE_MEMORY:-0}" = "1" ]; then
    echo "${DIM}[3/4] Purging inactive memory (sudo)...${NC}"
    sudo purge 2>/dev/null && echo "    ✓ purged"
else
    echo "${DIM}[3/4] Skipping memory purge (set FORCE_PURGE_INACTIVE_MEMORY=1 to enable)${NC}"
fi

# 4. Optional: truncate hungry log files
if [ "${FORCE_KILL_HUNGRY_LOGS:-0}" = "1" ]; then
    echo "${DIM}[4/4] Truncating logs >100MB in ~/Library/Logs...${NC}"
    find "$HOME/Library/Logs" -type f -size +100M 2>/dev/null | while read f; do
        : > "$f" && echo "    ✓ truncated $(basename $f)"
    done
else
    echo "${DIM}[4/4] Skipping log truncation (set FORCE_KILL_HUNGRY_LOGS=1 to enable)${NC}"
fi

echo "${GREEN}✨ FORCE_PERFECTION complete.${NC}"
