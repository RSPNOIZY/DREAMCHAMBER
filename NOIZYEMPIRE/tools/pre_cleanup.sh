#!/bin/bash
# ============================================================
# NOIZY EMPIRE — PRE-CLEANUP SCRIPT
# Removes Go caches, recursive nesting garbage, empty dirs
# Safe to run: deletes ONLY known cache/temp directories
# ============================================================

set -e

NOIZYLAB="$HOME/NOIZYLAB"
CODEMASTER="$NOIZYLAB/CODEMASTER/projects"

echo "=============================="
echo " NOIZY PRE-CLEANUP"
echo "=============================="

# ── 1. NUKE RECURSIVE GO MODULE CACHES (900MB) ──────────────
echo ""
echo "[1/5] Removing Go module caches..."

GO_CACHE_DIRS=(
  "$CODEMASTER/_ORGANIZED/05_TOOLS/go/pkg/mod"
  "$CODEMASTER/_ORGANIZED/go_packages/pkg/mod"
  "$CODEMASTER/GABRIEL/DREAMCHAMBER/_ORGANIZED/05_TOOLS/go/pkg/mod"
  "$CODEMASTER/GABRIEL/DREAMCHAMBER/_ORGANIZED/go_packages/pkg/mod"
  "$CODEMASTER/GABRIEL/DREAMCHAMBER/NOIZY.AI/NOIZYLAB/gabriel/CODEMASTER/_ORGANIZED/05_TOOLS/go/pkg/mod"
  "$CODEMASTER/GABRIEL/DREAMCHAMBER/NOIZY.AI/NOIZYLAB/gabriel/CODEMASTER/_ORGANIZED/go_packages/pkg/mod"
  "$CODEMASTER/NOIZY.AI/NOIZYLAB/gabriel/CODEMASTER/_ORGANIZED/05_TOOLS/go/pkg/mod"
  "$CODEMASTER/NOIZY.AI/NOIZYLAB/gabriel/CODEMASTER/_ORGANIZED/go_packages/pkg/mod"
)

for DIR in "${GO_CACHE_DIRS[@]}"; do
  if [ -d "$DIR" ]; then
    SIZE=$(du -sh "$DIR" 2>/dev/null | cut -f1)
    echo "  → Removing $DIR ($SIZE)"
    rm -rf "$DIR"
    echo "    ✓ Done"
  fi
done

# ── 2. REMOVE EMPTY GITHUB_HARVEST ──────────────────────────
echo ""
echo "[2/5] Removing empty GITHUB_HARVEST..."
if [ -d "$CODEMASTER/GITHUB_HARVEST" ]; then
  rm -rf "$CODEMASTER/GITHUB_HARVEST"
  echo "  ✓ Removed GITHUB_HARVEST"
fi

# ── 3. CLEAN node_modules FROM NON-JS PROJECTS ──────────────
echo ""
echo "[3/5] Cleaning stale node_modules..."
# Only clean node_modules that aren't in active JS projects
STALE_NM=(
  "$CODEMASTER/GABRIEL/DREAMCHAMBER/NOIZY.AI/NOIZYLAB/node_modules"
)
for DIR in "${STALE_NM[@]}"; do
  if [ -d "$DIR" ]; then
    SIZE=$(du -sh "$DIR" 2>/dev/null | cut -f1)
    echo "  → Removing $DIR ($SIZE)"
    rm -rf "$DIR"
    echo "    ✓ Done"
  fi
done

# ── 4. CLEAN uv PACKAGE CACHE ────────────────────────────────
echo ""
echo "[4/5] Cleaning uv package cache..."
if command -v uv &>/dev/null; then
  uv cache clean
  echo "  ✓ uv cache cleaned"
else
  echo "  SKIP: uv not in PATH"
fi

# ── 5. REMOVE EMPTY DIRS ─────────────────────────────────────
echo ""
echo "[5/5] Removing empty directories in NOIZYLAB..."
find "$NOIZYLAB" -type d -empty -not -path "*/.git/*" -delete 2>/dev/null && echo "  ✓ Empty dirs removed" || echo "  ✓ No empty dirs found"

echo ""
echo "=============================="
echo " PRE-CLEANUP COMPLETE"
echo " Run: bash ~/NOIZYLAB/tools/master_organize.sh"
echo "=============================="
