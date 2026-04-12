#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# verify-manifests.sh — Compare source vs recovered: counts, sizes, hashes
# Emits pass/fail summary. Never deletes anything.
# Usage: ./verify-manifests.sh /Volumes/SOURCE ~/Recovered/code-gold/SOURCE_NAME
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

SOURCE="${1:?Usage: verify-manifests.sh /path/to/source /path/to/recovered}"
RECOVERED="${2:?Usage: verify-manifests.sh /path/to/source /path/to/recovered}"
EVENTS_LOG="$HOME/Recovered/events.jsonl"
MACHINE_NAME="${HOSTNAME:-$(hostname -s)}"
CURRENT_USER="$(whoami)"
SCRIPT_NAME="verify-manifests"
DRY_RUN="${DRY_RUN:-false}"

if [ ! -d "$SOURCE" ]; then echo "ERROR: Source not found: $SOURCE"; exit 1; fi
if [ ! -d "$RECOVERED" ]; then echo "ERROR: Recovered not found: $RECOVERED"; exit 1; fi

# ── Recovery Preamble ────────────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════"
echo " host:        $MACHINE_NAME"
echo " user:        $CURRENT_USER"
echo " command:     $SCRIPT_NAME"
echo " source:      $SOURCE"
echo " destination: $RECOVERED"
echo " dry-run:     $DRY_RUN"
echo "═══════════════════════════════════════════════════"

log_event() {
  printf '{"ts":"%s","script":"%s","machine":"%s","user":"%s","action":"%s","detail":%s}\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$SCRIPT_NAME" "$MACHINE_NAME" "$CURRENT_USER" "$1" "$2" \
    >> "$EVENTS_LOG"
}

log_event "verify_started" "{\"source\":\"$SOURCE\",\"recovered\":\"$RECOVERED\",\"user\":\"$CURRENT_USER\",\"dry_run\":$DRY_RUN}"

pass=0
fail=0

# ── File count comparison ────────────────────────────────────────────────────
echo "--- File Count ---"
src_count=$(find "$SOURCE" -type f \
  \( -name "*.ts" -o -name "*.js" -o -name "*.py" -o -name "*.swift" \
     -o -name "*.md" -o -name "*.sh" -o -name "*.toml" -o -name "*.yaml" \
     -o -name "*.yml" -o -name "package.json" -o -name "Dockerfile" \
     -o -name "Makefile" \) \
  ! -path "*/node_modules/*" ! -path "*/.venv/*" ! -path "*/__pycache__/*" \
  2>/dev/null | wc -l | tr -d ' ')

rec_count=$(find "$RECOVERED" -type f 2>/dev/null | wc -l | tr -d ' ')

echo "  Source files:    $src_count"
echo "  Recovered files: $rec_count"

if [ "$rec_count" -ge "$src_count" ]; then
  echo "  PASS: file count"
  ((pass++))
else
  echo "  FAIL: file count (missing $((src_count - rec_count)) files)"
  ((fail++))
fi

# ── Total size comparison ────────────────────────────────────────────────────
echo ""
echo "--- Total Size ---"
src_size=$(du -sk "$SOURCE" 2>/dev/null | awk '{print $1}')
rec_size=$(du -sk "$RECOVERED" 2>/dev/null | awk '{print $1}')

echo "  Source:    ${src_size}K"
echo "  Recovered: ${rec_size}K"

# Recovered should be smaller (we excluded node_modules etc) — just flag if zero
if [ "${rec_size:-0}" -gt 0 ]; then
  echo "  PASS: non-zero recovered size"
  ((pass++))
else
  echo "  FAIL: recovered directory is empty"
  ((fail++))
fi

# ── Spot-check hashes on key files ──────────────────────────────────────────
echo ""
echo "--- Hash Spot-Check (package.json, wrangler.toml) ---"
for pattern in "package.json" "wrangler.toml"; do
  while IFS= read -r src_file; do
    rel_path="${src_file#$SOURCE/}"
    rec_file="$RECOVERED/$rel_path"
    if [ -f "$rec_file" ]; then
      src_hash=$(shasum -a 256 "$src_file" 2>/dev/null | awk '{print $1}')
      rec_hash=$(shasum -a 256 "$rec_file" 2>/dev/null | awk '{print $1}')
      if [ "$src_hash" = "$rec_hash" ]; then
        echo "  PASS: $rel_path"
        ((pass++))
      else
        echo "  FAIL: $rel_path (hash mismatch)"
        ((fail++))
      fi
    fi
  done < <(find "$SOURCE" -maxdepth 4 -name "$pattern" ! -path "*/node_modules/*" 2>/dev/null | head -10)
done

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo "=== RESULTS: $pass passed, $fail failed ==="

if [ "$fail" -eq 0 ]; then
  echo "=== ALL CHECKS PASSED ==="
  log_event "verify_pass" "{\"source\":\"$SOURCE\",\"pass\":$pass,\"fail\":$fail}"
else
  echo "=== FAILURES DETECTED — review above ==="
  log_event "verify_fail" "{\"source\":\"$SOURCE\",\"pass\":$pass,\"fail\":$fail}"
  exit 1
fi
