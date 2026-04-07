#!/usr/bin/env bash
set -euo pipefail

echo "NOIZY GORUNFREE BUILD — BEGIN"

run() {
  local label="$1"
  local file="$2"

  echo
  echo "=============================="
  echo "RUNNING: ${label}"
  echo "=============================="
  echo

  if [[ ! -f "$file" ]]; then
    echo "Missing prompt file: $file"
    exit 1
  fi

  cat "$file"
  echo
  echo "----------"
  echo "Paste the above into Claude Code, complete the stage, then commit."
  read -r -p "Press ENTER once checkpoint is complete..."
}

run "SUPERPROMPT" "claude/00_superprompt.md"
run "ROOT SCAFFOLD" "claude/01_scaffold.md"
run "SHARED CONTRACTS" "claude/02_shared_contracts.md"
run "ROUTE MAP" "claude/03_route_map.md"
run "NOIZYFISH DESIGN" "claude/04_noizyfish_design.md"
run "NOIZYVOX DESIGN" "claude/05_noizyvox_design.md"
run "NOIZYFISH MODELS" "claude/06_noizyfish_models.md"
run "NOIZYVOX MODELS" "claude/07_noizyvox_models.md"
run "NOIZYFISH PAGES" "claude/08_noizyfish_pages.md"
run "NOIZYVOX PAGES" "claude/09_noizyvox_pages.md"
run "MOBILE POLISH" "claude/10_mobile_polish.md"
run "CLOUDFLARE PREP" "claude/11_cloudflare_prep.md"
run "QA + LOCK" "claude/12_qa_and_lock.md"

echo
echo "NOIZY BUILD COMPLETE — GORUNFREE."
