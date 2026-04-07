#!/bin/bash

# 🧿 CONFIG
OLD_NAME="NoizyWin11"
NEW_NAME="NOIZYWIN"
ISO_PATH="$HOME/Downloads/Win11_25H2_ARM64.iso"
LOG="$HOME/noizylog/vm-sync.log"
PLIST_DIR="$HOME/Library/LaunchAgents"

mkdir -p "$(dirname "$LOG")"
touch "$LOG"

echo "$(date): 🔁 Starting VM sync ritual" >> "$LOG"

# 🔍 Check if OLD_NAME exists
if prlctl list --all | grep -q "$OLD_NAME"; then
  echo "$(date): Renaming $OLD_NAME to $NEW_NAME" >> "$LOG"
  prlctl set "$OLD_NAME" --name "$NEW_NAME"
else
  echo "$(date): $OLD_NAME not found. Skipping rename." >> "$LOG"
fi

# 🔗 Inject ISO
echo "$(date): Injecting ISO into $NEW_NAME" >> "$LOG"
prlctl set "$NEW_NAME" --device-add cdrom --image "$ISO_PATH"

# 🧼 Snapshot healing state
SNAP_NAME="sync-healing-$(date +%Y%m%d-%H%M%S)"
prlctl snapshot "$NEW_NAME" --name "$SNAP_NAME" --description "VM renamed and ISO injected"

# 🚀 Start VM
echo "$(date): Starting $NEW_NAME" >> "$LOG"
prlctl start "$NEW_NAME"

# 🔇 Silence enforcement daemon (LaunchAgent)
PLIST="$PLIST_DIR/com.noizy.voicekiller.plist"
cat <<EOF > "$PLIST"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.noizy.voicekiller</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/pkill</string>
        <string>-f</string>
        <string>say|VoiceOver|speechsynthesisd|com.apple.speech</string>
    </array>
    <key>StartInterval</key>
    <integer>60</integer>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
EOF

launchctl unload "$PLIST" 2>/dev/null
launchctl load "$PLIST"

echo "$(date): ✅ Sync ritual complete. $NEW_NAME is live, ISO injected, silence enforced." >> "$LOG"
