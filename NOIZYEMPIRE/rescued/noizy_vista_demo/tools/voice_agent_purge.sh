#!/bin/bash

LOG="$HOME/noizylog/voice-agent-purge.log"
mkdir -p "$(dirname "$LOG")"
touch "$LOG"

echo "$(date): 🔇 Voice agent purge initiated" >> "$LOG"

# 🧿 Define known voice-related agents
AGENTS=(
  "com.apple.speech.speechsynthesisd"
  "com.apple.VoiceOver"
  "com.apple.speech.recognition"
  "com.apple.speech.synthesis"
)

# 🔍 Find and purge matching agents
for AGENT in "${AGENTS[@]}"; do
  if launchctl list | grep -q "$AGENT"; then
    echo "$(date): Unloading $AGENT" >> "$LOG"
    launchctl bootout gui/$(id -u) "$AGENT" 2>>"$LOG"
  else
    echo "$(date): $AGENT not loaded" >> "$LOG"
  fi
done

# 🔍 Scan for unknown voice agents
launchctl list | grep -i "voice\|speech" >> "$LOG"

echo "$(date): ✅ Voice agent purge complete" >> "$LOG"
