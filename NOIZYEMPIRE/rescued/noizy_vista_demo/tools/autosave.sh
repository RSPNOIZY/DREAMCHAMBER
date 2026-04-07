#!/bin/bash

LOG="$HOME/noizylog/autosave.log"
mkdir -p "$(dirname "$LOG")"
touch "$LOG"

echo "$(date): Fleet status: $(prlctl list --all)" >> "$LOG"
