#!/bin/bash
# ============================================================
# NOIZY EMPIRE — AUTOSAVE RESCUE SCRIPT
# Rescues real projects from OneDrive autosave_snapshot
# before the snapshot gets wiped during migration
# ============================================================

set -e

SNAPSHOT="/Users/m2ultra/Library/CloudStorage/OneDrive-Personal(2)/Documents/MissionControl96/noizylab_2026/.autosave_snapshot"
RESCUE_DIR="$HOME/NOIZYLAB/rescued"

echo "=============================="
echo " NOIZY AUTOSAVE RESCUE"
echo "=============================="

mkdir -p "$RESCUE_DIR"

rescue() {
  local SRC="$1"
  local DEST="$RESCUE_DIR/$2"
  if [ -d "$SRC" ]; then
    if [ ! -d "$DEST" ]; then
      cp -r "$SRC" "$DEST"
      echo "  ✓ Rescued: $2"
    else
      echo "  SKIP: $2 already rescued"
    fi
  else
    echo "  MISS: $SRC not found"
  fi
}

echo ""
echo "[1/4] Rescuing NoizyCockPit..."
rescue "$SNAPSHOT/🐍 Python_Projects/NoizyCockPit" "NoizyCockPit"

echo ""
echo "[2/4] Rescuing noizy_vista_demo..."
rescue "$SNAPSHOT/WS_2026/ACTION_ITEMS/noizy_vista_demo" "noizy_vista_demo"

echo ""
echo "[3/4] Rescuing noizy_genie_ms..."
rescue "$SNAPSHOT/noizy_genie_ms" "noizy_genie_ms"

echo ""
echo "[4/4] Rescuing iCONIC..."
rescue "$SNAPSHOT/WS_2026/ACTION_ITEMS/iCONIC" "iCONIC"

echo ""
echo "=============================="
echo " RESCUED TO: $RESCUE_DIR"
echo " Review contents, then add to master_organize.sh"
echo "=============================="
ls "$RESCUE_DIR"
