#!/bin/zsh
# Master Automation: AutoFix, Build, Save & Keep for Complete Fleet Setup

set -euo pipefail

# 1. AutoFix: Network, notifications, and voice prompts
# Disable system voice prompts and notifications
if [[ "$(uname)" == "Darwin" ]]; then
  defaults write com.apple.notificationcenterui dndMode -bool true
  launchctl bootout gui/$(id -u) /System/Library/LaunchAgents/com.apple.VoiceOver.plist || true
  killall NotificationCenter VoiceOver Siri 2>/dev/null || true
  echo "✅ macOS notifications and voice prompts disabled."
fi

# 2. Build: Run installer and orchestration scripts
python3 /Users/rsp_ms/noizy_vista_demo/tools/build_inspiron_repair_usb.py || echo "Repair USB build skipped or already done."

# 3. Save: Run fleet autosave and log status
python3 /Users/rsp_ms/noizy_vista_demo/main.py &
sleep 5
cat /Users/rsp_ms/noizy_vista_demo/state/fleet_autosave.json 2>/dev/null || echo "No autosave yet."

# 4. Keep: Orchestrate fleet sync and monitor
for i in {1..5}; do
  python3 /Users/rsp_ms/noizy_vista_demo/tools/fleet_sing_and_dance.py && break
  echo "Retrying fleet sync ($i)..."
  sleep 10
done

while true; do
  echo "Fleet status: $(date)"
  cat /Users/rsp_ms/noizy_vista_demo/state/fleet_autosave.json 2>/dev/null || echo "No autosave yet."
  sleep 60
  # Optionally add health checks or re-sync here
  # python3 /Users/rsp_ms/noizy_vista_demo/tools/fleet_broadcast.py
  # python3 /Users/rsp_ms/noizy_vista_demo/tools/fleet_handshake.py
done
