#!/bin/zsh
# Master AutoRun script for fleet orchestration

# 1. Start cockpit backend and UI for OMEN & Inspiron
open -a Firefox http://192.168.0.12:8000
open -a Firefox http://192.168.0.15:8000

# 2. Run fleet sing & dance orchestrator with retry
for i in {1..5}; do
  python3 /Users/rsp_ms/noizy_vista_demo/tools/fleet_sing_and_dance.py && break
  echo "Retrying fleet sync ($i)..."
  sleep 10

done

# 3. Monitor fleet status and autosave
while true; do
  echo "Fleet status: $(date)"
  cat /Users/rsp_ms/noizy_vista_demo/state/fleet_autosave.json 2>/dev/null || echo "No autosave yet."
  sleep 60
  # Optionally add health checks or re-sync here
  # python3 /Users/rsp_ms/noizy_vista_demo/tools/fleet_broadcast.py
  # python3 /Users/rsp_ms/noizy_vista_demo/tools/fleet_handshake.py

done
