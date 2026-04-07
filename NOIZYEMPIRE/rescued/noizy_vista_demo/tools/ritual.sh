#!/bin/bash

# 🧿 CONFIG
VM_NAME="NOIZYWIN"
ISO_PATH="$HOME/Downloads/Win11_25H2_ARM64.iso"
LOG_DIR="$HOME/noizylog"
PLIST="$HOME/Library/LaunchAgents/com.noizy.voicekiller.plist"
mkdir -p "$LOG_DIR"

# 🧠 VALIDATE VM
if ! prlctl list --all | grep -q "$VM_NAME"; then
  echo "⚠️ Ritual aborted: $VM_NAME not found." | tee -a "$LOG_DIR/ritual.log"
  exit 1
fi

# 🔗 INJECT ISO
echo "$(date): Injecting ISO into $VM_NAME" >> "$LOG_DIR/ritual.log"
prlctl set "$VM_NAME" --device-add cdrom --image "$ISO_PATH"

# 🧼 SNAPSHOT HEALING STATE
SNAP_NAME="healing-$(date +%Y%m%d-%H%M%S)"
DESC="Mythic healing snapshot for $VM_NAME"
prlctl snapshot "$VM_NAME" --name "$SNAP_NAME" --description "$DESC"

# 🚀 START VM
prlctl start "$VM_NAME"

# 🔇 VOICE PURGE
echo "$(date): Voice purge initiated" >> "$LOG_DIR/voicekiller.log"
pkill -f "say"
pkill -f "VoiceOver"
pkill -f "speechsynth"
pgrep -fl "say|VoiceOver|speechsynth" >> "$LOG_DIR/voicekiller.log"

# 🛡️ SCHEDULE VOICE PURGE
cat <<EOF > "$PLIST"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.noizy.voicekiller</string>
    <key>ProgramArguments</key>
    <array>
        <string>$0</string>
    </array>
    <key>StartInterval</key>
    <integer>600</integer>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
EOF

launchctl unload "$PLIST" 2>/dev/null
launchctl load "$PLIST"

echo "✅ NOIZYWIN ritual complete. Healing, silence, and mythic injection enforced." | tee -a "$LOG_DIR/ritual.log"
