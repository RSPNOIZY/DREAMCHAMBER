#!/usr/bin/env zsh
# turbo_git_sync.sh
# Global Code Synchronization to GitHub.com

echo "🌍 INITIATING GLOBAL CODE SYNC..."
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

# 1. Define Targets
TARGETS=(
    "$HOME/NOIZYANTHROPIC/NOIZYLAB"
    "$HOME/Documents/GABRIEL"
    "$HOME/Documents/PROJECTS"
)

# 2. Check for HP-OMEN (Gabriel Volume)
if [ -d "/Volumes/HP-OMEN" ]; then
    echo "✅ FOUND EXTERNAL VOLUME: HP-OMEN"
    TARGETS+=("/Volumes/HP-OMEN/NOIZYLAB")
    TARGETS+=("/Volumes/HP-OMEN/GABRIEL")
else
    echo "⚠️  MISSING EXTERNAL VOLUME: HP-OMEN"
    echo "   -> Skipping sync for HP-OMEN codebases."
fi

# 3. Sync Function
sync_repo() {
    local dir="$1"
    
    if [[ ! -d "$dir" ]]; then
        echo "❌ Directory not found: $dir"
        return 1
    fi

    echo "🔄 Syncing: $(basename $dir)"
    
    # Check if inside git repo
    if git -C "$dir" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        # Check status
        if [[ -n "$(git -C "$dir" status --porcelain)" ]]; then
            git -C "$dir" add . 2>/dev/null
            git -C "$dir" commit -m "Turbo Sync: $TIMESTAMP" --quiet 2>/dev/null
        fi
        
        # Push (quiet for speed)
        if git -C "$dir" push --quiet 2>/dev/null; then
            echo "   ✅ $(basename $dir)"
        else
            echo "   ⚠️  $(basename $dir) PUSH FAILED"
        fi
    fi
}

# 4. Execute in parallel — all repos sync simultaneously
PIDS=()
for target in "${TARGETS[@]}"; do
    if [[ "$target" == *"/PROJECTS" ]]; then
        for proj in "$target"/*; do
            if [ -d "$proj" ]; then
                sync_repo "$proj" &
                PIDS+=($!)
            fi
        done
    else
        sync_repo "$target" &
        PIDS+=($!)
    fi
done

# Wait for all background syncs
for pid in "${PIDS[@]}"; do
    wait "$pid" 2>/dev/null
done

echo "🌍 GLOBAL SYNC COMPLETE."
