#!/bin/bash

LOG="$HOME/noizylog/silence-grid.log"
mkdir -p "$(dirname "$LOG")"
touch "$LOG"

echo "$(date): 🔇 Silence grid ritual initiated" >> "$LOG"

# 🧿 Purge host voice daemons
pkill -f "say"
pkill -f "VoiceOver"
pkill -f "speechsynthesisd"
pgrep -fl "say|VoiceOver|speechsynthesisd" >> "$LOG"

# 🔍 Scan all running VMs
VM_LIST=$(prlctl list --all | awk '/running/ {print $2}')

for VM in $VM_LIST; do
  echo "$(date): Enforcing silence in $VM" >> "$LOG"

  # 🧬 Inject voice purge via Parallels Tools (if supported)
  prlctl exec "$VM" "taskkill /F /IM SpeechRuntime.exe" >> "$LOG" 2>&1
  prlctl exec "$VM" "taskkill /F /IM Narrator.exe" >> "$LOG" 2>&1
done

echo "$(date): ✅ Silence grid ritual complete" >> "$LOG"
