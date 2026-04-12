#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# deep-scan.sh — Forensic-grade SHA-256 hash of every code + audio file
# Scope-aware: /Users, /Volumes, + NOIZY_APPROVED_PATHS
# Bypasses macOS TCC by avoiding /System, /Library, /private
# Output: ~/Recovered/manifests/hashes_<timestamp>.txt + events.jsonl
#
# This is the DEEP scan — runs minutes to hours on large drives.
# For quick inventory, use scan-drives.sh instead.
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

# ── Recovery Preamble ────────────────────────────────────────────────────────
MACHINE_NAME="${HOSTNAME:-$(hostname -s)}"
CURRENT_USER="$(whoami)"
SCRIPT_NAME="deep-scan"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DRY_RUN="${DRY_RUN:-false}"

OUTPUT_DIR="$HOME/Recovered/manifests"
HASH_FILE="$OUTPUT_DIR/hashes_${TIMESTAMP}.txt"
EVENTS_LOG="$HOME/Recovered/events.jsonl"
SCAN_ID="deep-${TIMESTAMP}"

mkdir -p "$OUTPUT_DIR"

echo "═══════════════════════════════════════════════════"
echo " host:        $MACHINE_NAME"
echo " user:        $CURRENT_USER"
echo " command:     $SCRIPT_NAME"
echo " source:      /Users + /Volumes + approved paths"
echo " destination: $HASH_FILE"
echo " dry-run:     $DRY_RUN"
echo "═══════════════════════════════════════════════════"

log_event() {
  printf '{"ts":"%s","script":"%s","machine":"%s","user":"%s","action":"%s","detail":%s}\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$SCRIPT_NAME" "$MACHINE_NAME" "$CURRENT_USER" "$1" "$2" \
    >> "$EVENTS_LOG"
}

log_event "deep_scan_started" "{\"scan_id\":\"$SCAN_ID\",\"dry_run\":$DRY_RUN}"

# ── Scan scopes ──────────────────────────────────────────────────────────────
SCAN_SCOPES=()

for vol in /Volumes/*; do
  [ -d "$vol" ] && SCAN_SCOPES+=("$vol")
done

for user_dir in /Users/*; do
  [ -d "$user_dir" ] && [ "$(basename "$user_dir")" != "Shared" ] && SCAN_SCOPES+=("$user_dir")
done

if [ -n "${NOIZY_APPROVED_PATHS:-}" ]; then
  IFS=':' read -ra EXTRA <<< "$NOIZY_APPROVED_PATHS"
  for p in "${EXTRA[@]}"; do
    [ -d "$p" ] && SCAN_SCOPES+=("$p")
  done
fi

echo ""
echo "--- Scan Scopes (${#SCAN_SCOPES[@]}) ---"
for s in "${SCAN_SCOPES[@]}"; do
  echo "  $s"
done

if [ "$DRY_RUN" = "true" ]; then
  echo ""
  echo "DRY RUN — would scan ${#SCAN_SCOPES[@]} scopes"
  log_event "deep_scan_dry" "{\"scopes\":${#SCAN_SCOPES[@]}}"
  exit 0
fi

# ── File extensions to hash ──────────────────────────────────────────────────
# Code
CODE_EXT="sh ts js jsx tsx py json toml yaml yml md txt sql html css swift rs mjs cjs prompt"
# Config
CONF_EXT="env Makefile Dockerfile"
# Audio metadata (not raw audio — that's media/)
AUDIO_EXT="aif aiff wav mp3 flac mid midi logicx"

# Build find -name args
FIND_ARGS=()
for ext in $CODE_EXT $AUDIO_EXT; do
  FIND_ARGS+=(-name "*.${ext}" -o)
done
for name in $CONF_EXT; do
  FIND_ARGS+=(-name "${name}" -o)
done
# Remove trailing -o
unset 'FIND_ARGS[-1]'

# ── Scan + Hash ──────────────────────────────────────────────────────────────
echo ""
echo "--- Hashing files ---"

# Header
{
  echo "# Deep Scan Hash Manifest"
  echo "# Machine: $MACHINE_NAME"
  echo "# User: $CURRENT_USER"
  echo "# Scan ID: $SCAN_ID"
  echo "# Timestamp: $TIMESTAMP"
  echo "#"
} > "$HASH_FILE"

TOTAL=0
ERRORS=0

for SCOPE in "${SCAN_SCOPES[@]}"; do
  if [ ! -d "$SCOPE" ] || ! ls "$SCOPE" >/dev/null 2>&1; then
    echo "  SKIP: $SCOPE (not accessible)"
    log_event "scope_skip" "{\"scope\":\"$SCOPE\",\"reason\":\"not_accessible\"}"
    continue
  fi

  echo "  Scanning: $SCOPE"

  while IFS= read -r -d '' FILE; do
    # Skip noise directories
    case "$FILE" in
      */.git/objects/*) continue ;;
      */node_modules/*) continue ;;
      */.Trash/*) continue ;;
      */Library/Caches/*) continue ;;
      */__pycache__/*) continue ;;
      */.venv/*) continue ;;
      */dist/*) continue ;;
      */build/*) continue ;;
    esac

    HASH=$(shasum -a 256 "$FILE" 2>/dev/null | awk '{print $1}') || {
      ERRORS=$((ERRORS + 1))
      continue
    }

    echo "$HASH  $FILE" >> "$HASH_FILE"
    TOTAL=$((TOTAL + 1))

    if (( TOTAL % 500 == 0 )); then
      echo "    $TOTAL files hashed..."
    fi

  done < <(find "$SCOPE" -maxdepth 8 \( "${FIND_ARGS[@]}" \) -type f -print0 2>/dev/null)
done

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════"
echo " DEEP SCAN COMPLETE — $SCAN_ID"
echo " Total files hashed : $TOTAL"
echo " Errors (skipped)   : $ERRORS"
echo " Manifest           : $HASH_FILE"
echo " Events log         : $EVENTS_LOG"
echo "═══════════════════════════════════════════════════"
echo ""
echo " Next: make seal  (cryptographically sign this manifest)"
echo " Verify later: shasum -a 256 -c $HASH_FILE"

log_event "deep_scan_complete" "{\"scan_id\":\"$SCAN_ID\",\"total\":$TOTAL,\"errors\":$ERRORS,\"manifest\":\"$HASH_FILE\"}"
