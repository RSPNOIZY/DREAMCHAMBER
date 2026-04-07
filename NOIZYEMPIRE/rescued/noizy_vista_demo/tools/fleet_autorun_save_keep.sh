#!/bin/zsh
# Fleet AutoRun, Save & Keep script for OMEN & Inspiron

# 1. Autorun cockpit backend and UI (example)
open -a Firefox http://192.168.0.12:8000
open -a Firefox http://192.168.0.15:8000

# 2. Run fleet sing & dance orchestrator
python3 /Users/rsp_ms/noizy_vista_demo/tools/fleet_sing_and_dance.py

# 3. Save fleet state (example)
python3 /Users/rsp_ms/noizy_vista_demo/main.py &
sleep 5
cat /Users/rsp_ms/noizy_vista_demo/state/fleet_autosave.json

# 4. Keep running (monitor)
while true; do
  echo "Fleet status: $(date)"
  sleep 60
  # Optionally add health checks or re-sync here
  # python3 /Users/rsp_ms/noizy_vista_demo/tools/fleet_broadcast.py
  # python3 /Users/rsp_ms/noizy_vista_demo/tools/fleet_handshake.py

done
