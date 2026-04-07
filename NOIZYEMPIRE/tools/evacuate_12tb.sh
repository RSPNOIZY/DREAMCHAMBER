#!/bin/bash
# ============================================================
# NOIZY EMPIRE — 12TB EVACUATION SCRIPT
# Copies all critical content off /Volumes/12TB before reformat
# Run with: ./evacuate_12tb.sh [--dry-run] [--section SECTION]
# ============================================================

DRY_RUN=false
SECTION="all"
LOG="$HOME/NOIZYLAB/logs/12tb_evacuation_$(date +%Y%m%d_%H%M%S).log"

mkdir -p "$HOME/NOIZYLAB/logs"

for arg in "$@"; do
  case $arg in
    --dry-run) DRY_RUN=true ;;
    --section) SECTION="$2"; shift ;;
  esac
done

RSYNC_FLAGS="-av --progress --stats"
if [ "$DRY_RUN" = true ]; then
  RSYNC_FLAGS="$RSYNC_FLAGS --dry-run"
  echo "DRY RUN MODE — no files will be copied"
fi

SRC="/Volumes/12TB"

# Verify source is mounted
if [ ! -d "$SRC" ]; then
  echo "ERROR: /Volumes/12TB not mounted!"
  exit 1
fi

echo "==============================" | tee -a "$LOG"
echo " 12TB EVACUATION" | tee -a "$LOG"
echo " $(date)" | tee -a "$LOG"
echo " DRY_RUN: $DRY_RUN" | tee -a "$LOG"
echo "==============================" | tee -a "$LOG"

copy_section() {
  local NAME="$1"
  local FROM="$2"
  local TO="$3"

  echo "" | tee -a "$LOG"
  echo "──────────────────────────────" | tee -a "$LOG"
  echo " $NAME" | tee -a "$LOG"
  echo " FROM: $FROM" | tee -a "$LOG"
  echo "   TO: $TO" | tee -a "$LOG"
  echo "──────────────────────────────" | tee -a "$LOG"

  if [ ! -d "$FROM" ]; then
    echo "  SKIP: source not found" | tee -a "$LOG"
    return
  fi

  # Check destination has enough free space (rough check)
  DEST_FREE=$(df -k "$TO" 2>/dev/null | awk 'NR==2 {print $4}')
  if [ -z "$DEST_FREE" ]; then
    echo "  WARNING: Could not check destination free space" | tee -a "$LOG"
  fi

  mkdir -p "$TO"
  rsync $RSYNC_FLAGS "$FROM/" "$TO/" 2>&1 | tee -a "$LOG"
  echo "  ✓ $NAME done" | tee -a "$LOG"
}

# ── SECTION 1: CODE & GITHUB ─────────────────────────────────
# Destination: RED DRAGON (3.4TB free)
if [[ "$SECTION" == "all" || "$SECTION" == "code" ]]; then
  copy_section "GitHub Repos" \
    "$SRC/GitHub" \
    "/Volumes/RED DRAGON/12TB_RESCUE/GitHub"

  copy_section "NOIZYLAB Code" \
    "$SRC/_NOIZYLAB" \
    "/Volumes/RED DRAGON/12TB_RESCUE/_NOIZYLAB"

  copy_section "CODEMASTER" \
    "$SRC/CODEMASTER" \
    "/Volumes/RED DRAGON/12TB_RESCUE/CODEMASTER"

  copy_section "MissionControl96" \
    "$SRC/MissionControl96" \
    "/Volumes/RED DRAGON/12TB_RESCUE/MissionControl96"

  copy_section "Scripts" \
    "$SRC/scripts" \
    "/Volumes/RED DRAGON/12TB_RESCUE/scripts"

  copy_section "NOIZYLAB_ARCHIVES" \
    "$SRC/NOIZYLAB_ARCHIVES" \
    "/Volumes/RED DRAGON/12TB_RESCUE/NOIZYLAB_ARCHIVES"

  copy_section "NOIZY.AI" \
    "$SRC/_NOIZY.AI" \
    "/Volumes/RED DRAGON/12TB_RESCUE/_NOIZY.AI"
fi

# ── SECTION 2: AUDIO ORIGINALS ───────────────────────────────
# _ORGANIZED = 2.4TB → 4TB Lacie (3.1TB free) — tight fit
# _01.AUDIO FROM ALL = 361GB → 4TBSG (2.2TB free) — overflow
if [[ "$SECTION" == "all" || "$SECTION" == "audio" ]]; then
  copy_section "Organized Audio (2.4TB)" \
    "$SRC/_ORGANIZED" \
    "/Volumes/4TB Lacie/12TB_RESCUE/_ORGANIZED"

  copy_section "Audio From All (361GB)" \
    "$SRC/_01.AUDIO FROM ALL" \
    "/Volumes/4TBSG/12TB_RESCUE/_01.AUDIO_FROM_ALL"

  copy_section "WAVE Files" \
    "$SRC/_WAVE" \
    "/Volumes/4TBSG/12TB_RESCUE/_WAVE"

  copy_section "2025 FISH WDC" \
    "$SRC/2025 FISH WDC" \
    "/Volumes/4TBSG/12TB_RESCUE/2025_FISH_WDC"
fi

# ── SECTION 3: SFX & SOUND DESIGN ────────────────────────────
# Destination: SOUND_DESIGN (1.0TB free)
if [[ "$SECTION" == "all" || "$SECTION" == "sfx" ]]; then
  copy_section "Audio SFX Library" \
    "$SRC/AUDIO_SFX_LIBRARY" \
    "/Volumes/SOUND_DESIGN/12TB_RESCUE/AUDIO_SFX_LIBRARY"
fi

# ── SECTION 4: INSTRUMENTS & SAMPLES ─────────────────────────
# _02.Instruments = 594GB → JOE (1.7TB free) ✓
# Samples To Sort 2022 + Spectrasonics → RED DRAGON overflow
if [[ "$SECTION" == "all" || "$SECTION" == "instruments" ]]; then
  copy_section "Instruments (594GB)" \
    "$SRC/_02.Instruments" \
    "/Volumes/JOE/12TB_RESCUE/_02.Instruments"

  copy_section "Samples To Sort 2022" \
    "$SRC/Samples To Sort 2022" \
    "/Volumes/RED DRAGON/12TB_RESCUE/Samples_To_Sort_2022"

  copy_section "Spectrasonics 3rd Party" \
    "$SRC/_Spectrasonics_3rd_Party" \
    "/Volumes/RED DRAGON/12TB_RESCUE/_Spectrasonics_3rd_Party"

  copy_section "WAVE Files" \
    "$SRC/_WAVE" \
    "/Volumes/RED DRAGON/12TB_RESCUE/_WAVE"
fi

# ── SECTION 5: PLUG-INS, UTILITIES & INSTALLERS ──────────────
# _03.Plug-Ins = 69GB, _04.Utilities = 23GB → RED DRAGON ✓
if [[ "$SECTION" == "all" || "$SECTION" == "plugins" ]]; then
  copy_section "Plug-Ins (69GB)" \
    "$SRC/_03.Plug-Ins" \
    "/Volumes/RED DRAGON/12TB_RESCUE/_03.Plug-Ins"

  copy_section "Utilities (23GB)" \
    "$SRC/_04.Utilities" \
    "/Volumes/RED DRAGON/12TB_RESCUE/_04.Utilities"

  copy_section "Installers" \
    "$SRC/Installers" \
    "/Volumes/RED DRAGON/12TB_RESCUE/Installers"

  copy_section "AUDIO SFX Library" \
    "$SRC/AUDIO_SFX_LIBRARY" \
    "/Volumes/SOUND_DESIGN/12TB_RESCUE/AUDIO_SFX_LIBRARY"

  copy_section "Fat Relocation M2Ultra" \
    "$SRC/Fat_Relocation_M2Ultra" \
    "/Volumes/RED DRAGON/12TB_RESCUE/Fat_Relocation_M2Ultra"

  copy_section "Audio Evacuation M2Ultra" \
    "$SRC/Audio_Evacuation_M2Ultra" \
    "/Volumes/RED DRAGON/12TB_RESCUE/Audio_Evacuation_M2Ultra"
fi

# ── SECTION 6: DOCS ──────────────────────────────────────────
# Destination: RED DRAGON
if [[ "$SECTION" == "all" || "$SECTION" == "docs" ]]; then
  copy_section "D0C MASTER" \
    "$SRC/_D0C MASTER" \
    "/Volumes/RED DRAGON/12TB_RESCUE/_D0C_MASTER"

  copy_section "Volume Inventory" \
    "$SRC/Volume_Inventory" \
    "/Volumes/RED DRAGON/12TB_RESCUE/Volume_Inventory"

  copy_section "Reports" \
    "$SRC/reports" \
    "/Volumes/RED DRAGON/12TB_RESCUE/reports"
fi

echo "" | tee -a "$LOG"
echo "==============================" | tee -a "$LOG"
echo " EVACUATION COMPLETE" | tee -a "$LOG"
echo " Log: $LOG" | tee -a "$LOG"
echo "==============================" | tee -a "$LOG"
echo ""
echo "NEXT STEPS:"
echo "  1. Verify files on destination drives"
echo "  2. Reformat 12TB as APFS or exFAT"
echo "  3. Restore organized structure back to 12TB"
