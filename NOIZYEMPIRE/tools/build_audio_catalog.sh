#!/bin/bash
# ============================================================
# NOIZY EMPIRE — AUDIO CATALOG BUILDER
# Merges all drive scans into one master searchable catalog
# Separates ORIGINALS from LIBRARIES by filename pattern
# ============================================================

OUT="$HOME/NOIZYLAB/NOIZY_AUDIO_CATALOG"
mkdir -p "$OUT"

MASTER="$OUT/MASTER_CATALOG.txt"
ORIGINALS="$OUT/ORIGINALS.txt"
LIBRARIES="$OUT/LIBRARIES.txt"
VOICE="$OUT/VOICE.txt"
SFX="$OUT/SFX.txt"
CSV="$OUT/MASTER_CATALOG.csv"
DUPES="$OUT/DUPLICATES.txt"

echo "=============================="
echo " NOIZY AUDIO CATALOG BUILDER"
echo "=============================="

# ── 1. MERGE ALL SCAN FILES ───────────────────────────────────
echo ""
echo "[1/6] Merging all drive scans..."

> "$MASTER"
SOURCES=(
  "/tmp/aquarium_4tbsg_audio.txt"
  "/tmp/aquarium_mag_audio.txt"
  "/tmp/lacie_library_audio.txt"
  "/tmp/4tbsg_libraries_audio.txt"
  "/tmp/6tb_audio.txt"
  "/tmp/m2ultra_audio.txt"
)

TOTAL=0
for SRC in "${SOURCES[@]}"; do
  if [ -f "$SRC" ]; then
    COUNT=$(wc -l < "$SRC" | tr -d ' ')
    cat "$SRC" >> "$MASTER"
    echo "  ✓ $SRC ($COUNT files)"
    TOTAL=$((TOTAL + COUNT))
  else
    echo "  – $SRC (not ready yet)"
  fi
done

sort -u "$MASTER" -o "$MASTER"
UNIQUE=$(wc -l < "$MASTER" | tr -d ' ')
echo ""
echo "  Total raw: $TOTAL | After dedup: $UNIQUE unique paths"

# ── 2. BUILD CSV (path, filename, ext, drive, folder) ────────
echo ""
echo "[2/6] Building CSV catalog..."

echo "filename,extension,drive,folder,full_path" > "$CSV"
while IFS= read -r filepath; do
  filename=$(basename "$filepath")
  ext="${filename##*.}"
  ext=$(echo "$ext" | tr '[:upper:]' '[:lower:]')

  # Determine drive
  if [[ "$filepath" == *"4TBSG"* ]]; then drive="4TBSG"
  elif [[ "$filepath" == *"MAG 4TB"* ]]; then drive="MAG_4TB"
  elif [[ "$filepath" == *"4TB Lacie"* ]]; then drive="LACIE"
  elif [[ "$filepath" == *"/6TB/"* ]]; then drive="6TB"
  elif [[ "$filepath" == *"m2ultra"* ]] || [[ "$filepath" == "/Users/"* ]]; then drive="M2ULTRA"
  else drive="UNKNOWN"
  fi

  folder=$(dirname "$filepath" | xargs basename)

  # Escape commas in filename
  safe_name="${filename//,/;}"
  safe_path="${filepath//,/;}"
  safe_folder="${folder//,/;}"

  echo "$safe_name,$ext,$drive,$safe_folder,$safe_path" >> "$CSV"
done < "$MASTER"

echo "  ✓ CSV built: $CSV"

# ── 3. EXTRACT LIKELY ORIGINALS ──────────────────────────────
echo ""
echo "[3/6] Separating originals from libraries..."

# Library patterns — systematic naming, known vendors
LIBRARY_PATTERNS=(
  "EastWest" "EWQL" "Nexus" "Ivory" "Garritan" "Superior"
  "ROOM_TONE" "AMBIENCE" "AMB_" "SFX_" "FX_"
  "^[0-9][0-9]_[0-9][0-9]_"   # numbered SFX format
  "PERSPECTIVE_" "CLOSE_"
  "Kontakt" "NKS" "Battery"
  "sample" "Sample" "SAMPLE"
  "loop" "Loop" "LOOP"
  "one_shot" "oneshot"
)

> "$LIBRARIES"
> "$ORIGINALS"

while IFS= read -r filepath; do
  filename=$(basename "$filepath")
  is_library=false

  for pattern in "${LIBRARY_PATTERNS[@]}"; do
    if echo "$filename" | grep -qiE "$pattern"; then
      is_library=true
      break
    fi
    if echo "$filepath" | grep -qiE "(EastWest|Nexus_library|Ivory|Garritan|Superior_Drummer|Sample_Lib|AIFF/[A-Z]|Kontakt)"; then
      is_library=true
      break
    fi
  done

  if [ "$is_library" = true ]; then
    echo "$filepath" >> "$LIBRARIES"
  else
    echo "$filepath" >> "$ORIGINALS"
  fi
done < "$MASTER"

ORIG_COUNT=$(wc -l < "$ORIGINALS" | tr -d ' ')
LIB_COUNT=$(wc -l < "$LIBRARIES" | tr -d ' ')
echo "  ✓ Originals: $ORIG_COUNT files → $ORIGINALS"
echo "  ✓ Libraries: $LIB_COUNT files → $LIBRARIES"

# ── 4. EXTRACT VOICE FILES ───────────────────────────────────
echo ""
echo "[4/6] Extracting voice recordings..."

grep -i -E "(RSP|Voice|Vox|VOX|voice|_rsp_|noizyvox|NOIZYVOX|AVA|GABRIEL|MC96|rvc|TTS|tts)" "$ORIGINALS" > "$VOICE" 2>/dev/null || true
VOICE_COUNT=$(wc -l < "$VOICE" | tr -d ' ')
echo "  ✓ Voice files: $VOICE_COUNT → $VOICE"

# ── 5. EXTRACT SFX ──────────────────────────────────────────
echo ""
echo "[5/6] Extracting SFX..."

grep -i -E "(SFX|sfx|sound.design|SOUND.DESIGN|AMB|amb|ROOM.TONE|foley|FOLEY)" "$MASTER" > "$SFX" 2>/dev/null || true
SFX_COUNT=$(wc -l < "$SFX" | tr -d ' ')
echo "  ✓ SFX files: $SFX_COUNT → $SFX"

# ── 6. FIND DUPLICATES (same filename, different paths) ──────
echo ""
echo "[6/6] Finding duplicate filenames across drives..."

awk -F'/' '{print $NF}' "$MASTER" | sort | uniq -d > /tmp/dupe_names.txt
DUPE_COUNT=$(wc -l < /tmp/dupe_names.txt | tr -d ' ')

> "$DUPES"
while IFS= read -r name; do
  matches=$(grep -F "/$name" "$MASTER" 2>/dev/null)
  if [ -n "$matches" ]; then
    echo "── $name" >> "$DUPES"
    echo "$matches" >> "$DUPES"
    echo "" >> "$DUPES"
  fi
done < /tmp/dupe_names.txt

echo "  ✓ Duplicate filenames: $DUPE_COUNT → $DUPES"

# ── SUMMARY ──────────────────────────────────────────────────
echo ""
echo "=============================="
echo " CATALOG COMPLETE"
echo "=============================="
echo ""
echo " Total unique audio files : $UNIQUE"
echo " Likely originals         : $ORIG_COUNT"
echo " Library/sample content   : $LIB_COUNT"
echo " Voice recordings         : $VOICE_COUNT"
echo " SFX files                : $SFX_COUNT"
echo " Duplicate filenames      : $DUPE_COUNT"
echo ""
echo " Output: $OUT/"
echo "   MASTER_CATALOG.txt   — all files"
echo "   MASTER_CATALOG.csv   — importable"
echo "   ORIGINALS.txt        — your work"
echo "   VOICE.txt            — voice recordings"
echo "   SFX.txt              — sound design"
echo "   LIBRARIES.txt        — sample libraries"
echo "   DUPLICATES.txt       — same name, multiple drives"
echo ""
echo " Search your catalog:"
echo "   grep -i 'song name' ~/NOIZYLAB/NOIZY_AUDIO_CATALOG/MASTER_CATALOG.txt"
echo "   grep -i 'song name' ~/NOIZYLAB/NOIZY_AUDIO_CATALOG/ORIGINALS.txt"
echo ""
