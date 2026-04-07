#!/bin/bash
LOG="$HOME/noizylog/fleet.log"
mkdir -p "$(dirname "$LOG")"
touch "$LOG"

echo "🧭 $(date): Logging Parallels VM fleet status..." >> "$LOG"
prlctl list --all >> "$LOG"
echo "— — — — — — — — — —" >> "$LOG"
