#!/bin/bash
LOG="$HOME/noizylog/voicekiller.log"
mkdir -p "$(dirname "$LOG")"
touch "$LOG"

echo "$(date): Aggressive voice daemon purge initiated" >> "$LOG"

# Kill common voice/speech processes
pkill -f "say"
pkill -f "VoiceOver"
pkill -f "speechsynth"
pkill -f "speechsynthesisd"
pkill -f "com.apple.speech"
pkill -f "Dictation"
pkill -f "Siri"
pkill -f "Accessibility"

# Log survivors
pgrep -fl "say|VoiceOver|speechsynth|speechsynthesisd|com.apple.speech|Dictation|Siri|Accessibility" >> "$LOG"

# Log all voice/speech processes for diagnosis
ps aux | grep -i "voice\|speech\|dictation\|siri\|access" | grep -v grep >> "$LOG"

echo "$(date): Voice daemon purge complete" >> "$LOG"
