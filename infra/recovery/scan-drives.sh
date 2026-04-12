#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# recovery/scan-drives.sh
# Scope-aware drive scanner for NOIZY Empire recovery architecture
# Scopes: /Users, /Volumes (+ NOIZY_APPROVED_PATHS)
# Bypasses macOS TCC permission pop-ups by avoiding system paths
# Output: ~/Recovered/manifests/hashes.txt + events.jsonl
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ─── CONFIG ───────────────────────────────────────────────────────────────────
MACHINE_NAME="${HOSTNAME:-$(hostname -s)}"
CURRENT_USER="$(whoami)"
DRY_RUN="${DRY_RUN:-false}"
OUTPUT_DIR="$HOME/Recovered/manifests"
HASH_FILE="$OUTPUT_DIR/hashes.txt"
EVENTS_FILE="$HOME/Recovered/events.jsonl"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
SCAN_ID="scan-$(date -u +"%Y%m%d-%H%M%S")"

# Scoped paths — intentionally avoids /System, /Library, /private to bypass TCC
SCAN_SCOPES=(
    "/Users"
    "/Volumes"
)

# Add explicitly approved paths from env (colon-separated)
if [ -n "${NOIZY_APPROVED_PATHS:-}" ]; then
  IFS=':' read -ra EXTRA_PATHS <<< "$NOIZY_APPROVED_PATHS"
  for p in "${EXTRA_PATHS[@]}"; do
    [ -d "$p" ] && SCAN_SCOPES+=("$p")
  done
fi

# File extensions to capture (code, config, audio metadata, docs)
EXTENSIONS=(
    "sh" "ts" "js" "jsx" "tsx" "py" "json" "toml" "yaml" "yml"
    "md" "txt" "sql" "html" "css" "swift" "rs"
    "aif" "aiff" "wav" "mp3" "flac" "mid" "midi"
    "logicx" "component" "vst" "vst3" "aaxplugin"
)

# ─── RECOVERY PREAMBLE ───────────────────────────────────────────────────────
mkdir -p "$OUTPUT_DIR"
echo "═══════════════════════════════════════════════════"
echo " host:        $MACHINE_NAME"
echo " user:        $CURRENT_USER"
echo " command:     scan-drives"
echo " source:      ${SCAN_SCOPES[*]}"
echo " destination: $OUTPUT_DIR"
echo " dry-run:     $DRY_RUN"
echo " scan-id:     $SCAN_ID"
echo "═══════════════════════════════════════════════════"

echo ">> [$TIMESTAMP] SCAN_ID=$SCAN_ID starting scope-aware scan..." | tee -a "$EVENTS_FILE"

# Log scan event as JSONL
echo "{\"event\":\"scan_start\",\"scan_id\":\"$SCAN_ID\",\"machine\":\"$MACHINE_NAME\",\"user\":\"$CURRENT_USER\",\"timestamp\":\"$TIMESTAMP\",\"dry_run\":$DRY_RUN,\"scopes\":$(printf '%s\n' "${SCAN_SCOPES[@]}" | jq -R . | jq -s . 2>/dev/null || echo '[]')}" >> "$EVENTS_FILE"

# ─── VOLUME INFO (disk stats) ────────────────────────────────────────────────
echo ""
echo "--- Volume Info ---"
for vol in / /Volumes/*; do
  [ -d "$vol" ] || continue
  df -h "$vol" 2>/dev/null | tail -1 | awk -v v="$vol" '{printf "  %-30s %s total, %s free (%s used)\n", v, $2, $4, $5}'
done

# ─── BUILD FIND EXPRESSION ────────────────────────────────────────────────────
EXT_EXPR=""
for ext in "${EXTENSIONS[@]}"; do
    if [ -z "$EXT_EXPR" ]; then
        EXT_EXPR="-name \"*.$ext\""
    else
        EXT_EXPR="$EXT_EXPR -o -name \"*.$ext\""
    fi
done

# ─── SCAN + HASH ─────────────────────────────────────────────────────────────
echo ""
echo ">> Scanning scopes: ${SCAN_SCOPES[*]}"

if [ "$DRY_RUN" = "true" ]; then
  echo ">> DRY RUN — counting files only, no hashing"
  TOTAL=0
  for SCOPE in "${SCAN_SCOPES[@]}"; do
    [ -d "$SCOPE" ] || continue
    count=$(eval "find \"$SCOPE\" \( $EXT_EXPR \) -type f -not -path '*/node_modules/*' -not -path '*/.git/objects/*' -not -path '*/.Trash/*' -not -path '*/Library/Caches/*' 2>/dev/null" | wc -l | tr -d ' ')
    echo "  $SCOPE: $count files"
    TOTAL=$((TOTAL + count))
  done
  echo ">> DRY RUN total: $TOTAL files would be hashed"
  echo "{\"event\":\"scan_dry_run\",\"scan_id\":\"$SCAN_ID\",\"timestamp\":\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",\"total_files\":$TOTAL}" >> "$EVENTS_FILE"
  exit 0
fi

> "$HASH_FILE"  # Reset hash file

TOTAL=0
ERRORS=0

for SCOPE in "${SCAN_SCOPES[@]}"; do
    if [ ! -d "$SCOPE" ]; then
        echo ">> [SKIP] Scope not found: $SCOPE"
        echo "{\"event\":\"scope_skip\",\"scope\":\"$SCOPE\",\"reason\":\"not_found\",\"timestamp\":\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}" >> "$EVENTS_FILE"
        continue
    fi

    echo ">> [SCAN] Entering scope: $SCOPE"

    while IFS= read -r -d '' FILE; do
        # Skip hidden dirs and node_modules
        case "$FILE" in
            */.git/objects/*|*/node_modules/*|*/.Trash/*|*/Library/Caches/*) continue ;;
        esac

        # Generate SHA256 hash
        HASH=$(shasum -a 256 "$FILE" 2>/dev/null | awk '{print $1}') || {
            ERRORS=$((ERRORS + 1))
            echo "{\"event\":\"hash_error\",\"file\":\"$FILE\",\"timestamp\":\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}" >> "$EVENTS_FILE"
            continue
        }

        echo "$HASH  $FILE" >> "$HASH_FILE"
        TOTAL=$((TOTAL + 1))

        # Log every 100 files
        if (( TOTAL % 100 == 0 )); then
            echo ">> [$TOTAL files hashed...]"
        fi

    done < <(eval "find \"$SCOPE\" \( $EXT_EXPR \) -type f -print0 2>/dev/null")
done

# ─── SUMMARY ──────────────────────────────────────────────────────────────────
END_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
echo "{\"event\":\"scan_complete\",\"scan_id\":\"$SCAN_ID\",\"machine\":\"$MACHINE_NAME\",\"timestamp\":\"$END_TIMESTAMP\",\"total_files\":$TOTAL,\"errors\":$ERRORS}" >> "$EVENTS_FILE"

echo ""
echo ">> ═══════════════════════════════════════════════════"
echo ">> SCAN COMPLETE — $SCAN_ID"
echo ">> Total files hashed : $TOTAL"
echo ">> Errors             : $ERRORS"
echo ">> Manifest           : $HASH_FILE"
echo ">> Events log         : $EVENTS_FILE"
echo ">> ═══════════════════════════════════════════════════"
echo ">> Next: run make verify to generate signature-ready manifest"
