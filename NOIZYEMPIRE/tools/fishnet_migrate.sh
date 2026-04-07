#!/usr/bin/env bash
# NOIZY FISHNET — M2 Ultra → OneDrive Migration
# ===============================================
# Usage:
#   --dry-run   Show what WILL move (nothing touches files)
#   --copy      Copy to OneDrive, originals stay on M2
#   --clean     REMOVE originals from M2 (run AFTER verifying OneDrive sync)
#
# Rules: NO audio, NO video. NOIZY.AI + DREAMCHAMBER stays.

set -euo pipefail

MODE="${1:---dry-run}"
OD="$HOME/Library/CloudStorage/OneDrive-Personal"
DEST="$OD/NOIZY_MIGRATION_DOCS"
LOG="$HOME/NOIZYLAB/logs/fishnet_$(date +%Y%m%d_%H%M%S).log"

mkdir -p "$HOME/NOIZYLAB/logs"

# ─── Colour output ────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; NC='\033[0m'; BOLD='\033[1m'

log() { echo -e "$1" | tee -a "$LOG"; }

# ─── Audio/Video exclusions ───────────────────────────────────────────────────
AV_EXCLUDE=(
  --exclude='*.wav' --exclude='*.aiff' --exclude='*.aif' --exclude='*.mp3'
  --exclude='*.flac' --exclude='*.ogg' --exclude='*.m4a' --exclude='*.caf'
  --exclude='*.au'  --exclude='*.wma'  --exclude='*.bwf'
  --exclude='*.mp4' --exclude='*.mov'  --exclude='*.avi' --exclude='*.mkv'
  --exclude='*.m4v' --exclude='*.wmv'  --exclude='*.flv' --exclude='*.webm'
  --exclude='*.mts' --exclude='*.mxf'
  --exclude='*.nkx' --exclude='*.nki'  --exclude='*.nkc' --exclude='*.nkm'
  --exclude='*.ptx' --exclude='*.ptf'
  --exclude='*.dmg' --exclude='*.pkg'  --exclude='*.iso'
  --exclude='.DS_Store'
)

# ─── rsync helper ─────────────────────────────────────────────────────────────
do_rsync() {
  local SRC="$1"
  local DST="$2"
  local FLAGS=(-avh --progress "${AV_EXCLUDE[@]}")
  if [[ "$MODE" == "--dry-run" ]]; then
    FLAGS+=(--dry-run)
    log "${CYAN}[DRY-RUN]${NC} $SRC → $DST"
  else
    log "${GREEN}[COPY]${NC} $SRC → $DST"
    mkdir -p "$DST"
  fi
  rsync "${FLAGS[@]}" "$SRC" "$DST/" 2>&1 | tee -a "$LOG" || true
}

# ─── Remove helper (--clean only) ─────────────────────────────────────────────
do_clean() {
  local PATH_TO_REMOVE="$1"
  if [[ "$MODE" == "--clean" ]]; then
    log "${RED}[REMOVE]${NC} $PATH_TO_REMOVE"
    rm -rf "$PATH_TO_REMOVE"
  fi
}

# ─── Safety check ─────────────────────────────────────────────────────────────
if [[ ! -d "$OD" ]]; then
  log "${RED}ERROR: OneDrive not found at $OD${NC}"
  log "Make sure OneDrive is signed in and syncing."
  exit 1
fi

log ""
log "${BOLD}╔══════════════════════════════════════════════════╗${NC}"
log "${BOLD}║      NOIZY FISHNET — M2 ULTRA MIGRATION          ║${NC}"
log "${BOLD}╚══════════════════════════════════════════════════╝${NC}"
log "Mode: ${BOLD}$MODE${NC}"
log "Target: $DEST"
log "Log: $LOG"
log ""

if [[ "$MODE" == "--clean" ]]; then
  log "${RED}${BOLD}⚠  CLEAN MODE: This will DELETE files from M2 Ultra.${NC}"
  log "${RED}Make sure OneDrive is fully synced before continuing!${NC}"
  read -r -p "Type FISHNET to confirm deletion: " CONFIRM
  if [[ "$CONFIRM" != "FISHNET" ]]; then
    log "Cancelled."
    exit 0
  fi
fi

# ─── DOCUMENTS ────────────────────────────────────────────────────────────────
log "\n${YELLOW}── DOCUMENTS ──${NC}"

do_rsync "$HOME/Documents/NOIZYLAB_TEXT_VAULT"    "$DEST/Claude_TextVault"
do_rsync "$HOME/Documents/Archives"               "$DEST/Archives"
do_rsync "$HOME/Documents/iZotope"                "$DEST/iZotope"

# Legacy machine docs
[[ -d "$HOME/Documents/Documents - M2Ultra's Mac Studio" ]] && \
  do_rsync "$HOME/Documents/Documents - M2Ultra's Mac Studio" "$DEST/Legacy_M2Ultra"
[[ -d "$HOME/Documents/Documents - RSP_MS" ]] && \
  do_rsync "$HOME/Documents/Documents - RSP_MS" "$DEST/Legacy_RSP_MS"
[[ -d "$HOME/Documents/Documents - Fish MacPro" ]] && \
  do_rsync "$HOME/Documents/Documents - Fish MacPro" "$DEST/Legacy_FishMacPro"
[[ -d "$HOME/Documents/Dadroit JSON Generator" ]] && \
  do_rsync "$HOME/Documents/Dadroit JSON Generator" "$DEST/Tools/Dadroit"

# Loose NOIZY docs (md, pptx, pages — NOT audio/video)
if [[ "$MODE" != "--dry-run" ]]; then
  mkdir -p "$DEST/Presentations" "$DEST/Research"
  find "$HOME/Documents" -maxdepth 1 \
    \( -name "*.pptx" -o -name "*.pages" -o -name "NOIZY*.md" -o -name "*.md" -o -name "*.docx" \) \
    -exec rsync -avh --progress {} "$DEST/Research/" \; 2>&1 | tee -a "$LOG"
else
  log "${CYAN}[DRY-RUN]${NC} ~/Documents/*.md, *.pptx, *.pages → $DEST/Research/ + Presentations/"
fi

# ─── DESKTOP ──────────────────────────────────────────────────────────────────
log "\n${YELLOW}── DESKTOP ──${NC}"

[[ -d "$HOME/Desktop/CLAUDE TODAY" ]] && \
  do_rsync "$HOME/Desktop/CLAUDE TODAY" "$DEST/Claude_Today"
[[ -d "$HOME/Desktop/Presentations" ]] && \
  do_rsync "$HOME/Desktop/Presentations" "$DEST/Presentations"
[[ -d "$HOME/Desktop/Web Exports" ]] && \
  do_rsync "$HOME/Desktop/Web Exports" "$DEST/Web_Exports"

# ─── DOWNLOADS (docs/images only — NOT 36GB Installers) ──────────────────────
log "\n${YELLOW}── DOWNLOADS (no installers) ──${NC}"

[[ -d "$HOME/Downloads/Archives" ]] && \
  do_rsync "$HOME/Downloads/Archives" "$DEST/DL_Archives"
[[ -d "$HOME/Downloads/Code" ]] && \
  do_rsync "$HOME/Downloads/Code" "$DEST/DL_Code"
[[ -d "$HOME/Downloads/Documents" ]] && \
  do_rsync "$HOME/Downloads/Documents" "$DEST/DL_Documents"
[[ -d "$HOME/Downloads/Images" ]] && \
  do_rsync "$HOME/Downloads/Images" "$DEST/DL_Images"

# ─── PROJECTS (logs, small code) ─────────────────────────────────────────────
log "\n${YELLOW}── PROJECTS ──${NC}"

[[ -d "$HOME/Projects" ]] && \
  do_rsync "$HOME/Projects" "$DEST/Projects"

# ─── WISDOM_001 ───────────────────────────────────────────────────────────────
[[ -d "$HOME/WISDOM_001" ]] && \
  do_rsync "$HOME/WISDOM_001" "$DEST/WISDOM_001"

# ─── CLEAN PHASE (--clean only) ───────────────────────────────────────────────
if [[ "$MODE" == "--clean" ]]; then
  log "\n${RED}── REMOVING FROM M2 ULTRA ──${NC}"
  do_clean "$HOME/Documents/NOIZYLAB_TEXT_VAULT"
  do_clean "$HOME/Documents/Archives"
  do_clean "$HOME/Documents/iZotope"
  do_clean "$HOME/Documents/Documents - M2Ultra's Mac Studio"
  do_clean "$HOME/Documents/Documents - RSP_MS"
  do_clean "$HOME/Documents/Documents - Fish MacPro"
  do_clean "$HOME/Desktop/CLAUDE TODAY"
  do_clean "$HOME/Desktop/Presentations"
  do_clean "$HOME/Desktop/Web Exports"
  do_clean "$HOME/Downloads/Archives"
  do_clean "$HOME/Downloads/Code"
  do_clean "$HOME/Downloads/Documents"
  do_clean "$HOME/Downloads/Images"
  do_clean "$HOME/Projects"
  do_clean "$HOME/WISDOM_001"
fi

# ─── Summary ──────────────────────────────────────────────────────────────────
log ""
log "${GREEN}${BOLD}✓ FISHNET COMPLETE — Mode: $MODE${NC}"
log "Log saved to: $LOG"

if [[ "$MODE" == "--dry-run" ]]; then
  log "\n${YELLOW}Nothing was moved. Review the log above.${NC}"
  log "When ready: ${BOLD}bash tools/fishnet_migrate.sh --copy${NC}"
fi
if [[ "$MODE" == "--copy" ]]; then
  log "\n${YELLOW}Files copied. Wait for OneDrive to sync, then:${NC}"
  log "${BOLD}bash tools/fishnet_migrate.sh --clean${NC}"
fi
