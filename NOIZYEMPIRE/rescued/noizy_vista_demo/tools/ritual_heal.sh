#!/bin/bash

# 🧿 CONFIG
VM_NAME="NOIZYWIN"
ISO_PATH="$HOME/Downloads/Win11_25H2_ARM64.iso"
LOG="$HOME/noizylog/ritual.log"
MAX_TRIES=5
TRY=1

mkdir -p "$(dirname "$LOG")"
touch "$LOG"

# 🧠 FUNCTION: Check VM health
check_vm_health() {
  prlctl list --all | grep "$VM_NAME" && prlctl status "$VM_NAME" | grep -q "running"
}

# 🔇 FUNCTION: Purge voice daemons
purge_voice() {
  echo "$(date): Voice purge initiated" >> "$LOG"
  pkill -f "say"
  pkill -f "VoiceOver"
  pkill -f "speechsynth"
  pgrep -fl "say|VoiceOver|speechsynth" >> "$LOG"
}

# 🔁 LOOP UNTIL PERFECT
while [[ $TRY -le $MAX_TRIES ]]; do
  echo "$(date): Ritual attempt $TRY" >> "$LOG"

  # 🔍 Check VM exists
  if ! prlctl list --all | grep -q "$VM_NAME"; then
    echo "$(date): VM $VM_NAME not found. Creating..." >> "$LOG"
    prlctl create "$VM_NAME" --distribution win-11 --vmtype vm
  fi

  # 🔗 Inject ISO
  prlctl set "$VM_NAME" --device-add cdrom --image "$ISO_PATH"

  # 🧼 Snapshot
  SNAP_NAME="healing-$(date +%Y%m%d-%H%M%S)"
  prlctl snapshot "$VM_NAME" --name "$SNAP_NAME" --description "Healing snapshot attempt $TRY"

  # 🚀 Start VM
  prlctl start "$VM_NAME"

  # 🔇 Purge voice
  purge_voice

  # ✅ Check health
  if check_vm_health; then
    echo "$(date): Ritual complete. VM is healthy and running." >> "$LOG"
    break
  else
    echo "$(date): VM not healthy. Retrying..." >> "$LOG"
    prlctl stop "$VM_NAME"
    ((TRY++))
    sleep 5
  fi

done

# 🧙‍♂️ Final verdict
if [[ $TRY -gt $MAX_TRIES ]]; then
  echo "$(date): Ritual failed after $MAX_TRIES attempts." >> "$LOG"
else
  echo "$(date): Ritual succeeded on attempt $TRY." >> "$LOG"
fi
