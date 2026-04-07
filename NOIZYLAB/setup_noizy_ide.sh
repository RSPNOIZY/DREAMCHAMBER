#!/usr/bin/env bash
# =============================================================================
# NOIZY SUPERSTACK — One-shot IDE setup
# =============================================================================
# Run once after cloning or on a fresh machine:
#   chmod +x setup_noizy_ide.sh && ./setup_noizy_ide.sh
#
# What this does:
#   1. Build + package the NOIZY Voice VSCode extension
#   2. Install it into VSCode Insiders
#   3. Sync all Talon voice command files to ~/.talon/user/
#   4. Print a status summary
# =============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXTENSION_DIR="$ROOT_DIR/noizy-voice"

# ─── Colours ──────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
RESET='\033[0m'

ok()   { echo -e "  ${GREEN}✓${RESET}  $*"; }
info() { echo -e "  ${CYAN}→${RESET}  $*"; }
warn() { echo -e "  ${YELLOW}!${RESET}  $*"; }
fail() { echo -e "  ${RED}✗${RESET}  $*"; }
hdr()  { echo -e "\n${BOLD}$*${RESET}"; }

# ─── Banner ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${CYAN}║        NOIZY SUPERSTACK — IDE SETUP          ║${RESET}"
echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════╝${RESET}"
echo ""

ERRORS=0

# =============================================================================
# STEP 1 — Detect VSCode Insiders
# =============================================================================
hdr "[ 1 / 4 ]  Detecting VSCode Insiders"

CODE=""
for candidate in "code-insiders" "code"; do
  if command -v "$candidate" &>/dev/null; then
    CODE="$candidate"
    ok "Found: $(command -v "$candidate")"
    break
  fi
done

if [[ -z "$CODE" ]]; then
  fail "VSCode CLI not found in PATH."
  warn "Make sure 'code-insiders' is on your PATH (Shell Command: Install from VSCode Insiders command palette)"
  ERRORS=$((ERRORS + 1))
fi

# =============================================================================
# STEP 2 — Build NOIZY Voice Extension
# =============================================================================
hdr "[ 2 / 4 ]  Building NOIZY Voice Extension"

if [[ ! -d "$EXTENSION_DIR" ]]; then
  fail "noizy-voice/ directory not found at $EXTENSION_DIR"
  ERRORS=$((ERRORS + 1))
else
  cd "$EXTENSION_DIR"

  # npm install
  info "npm install..."
  if npm install --silent 2>&1 | tail -3; then
    ok "Dependencies installed"
  else
    fail "npm install failed"
    ERRORS=$((ERRORS + 1))
  fi

  # TypeScript compile
  info "Compiling TypeScript..."
  if npm run compile 2>&1; then
    ok "Compiled → out/"
  else
    fail "TypeScript compilation failed"
    ERRORS=$((ERRORS + 1))
  fi

  # Package VSIX
  info "Packaging VSIX..."
  if npm run package 2>&1; then
    VSIX_FILE=$(ls "$EXTENSION_DIR"/*.vsix 2>/dev/null | tail -1)
    if [[ -n "$VSIX_FILE" ]]; then
      ok "Packaged: $(basename "$VSIX_FILE")"
    else
      fail "VSIX file not found after packaging"
      ERRORS=$((ERRORS + 1))
    fi
  else
    fail "VSIX packaging failed"
    ERRORS=$((ERRORS + 1))
  fi

  cd "$ROOT_DIR"
fi

# =============================================================================
# STEP 3 — Install Extension into VSCode Insiders
# =============================================================================
hdr "[ 3 / 4 ]  Installing Extension"

VSIX_FILE=$(ls "$EXTENSION_DIR"/*.vsix 2>/dev/null | tail -1)

if [[ -z "${VSIX_FILE:-}" ]]; then
  warn "No .vsix found — skipping install. Run 'Extension: Package NOIZY Voice' task first."
  ERRORS=$((ERRORS + 1))
elif [[ -z "$CODE" ]]; then
  warn "Skipping install — VSCode CLI not available"
else
  info "Installing $(basename "$VSIX_FILE") into $CODE..."
  if "$CODE" --install-extension "$VSIX_FILE" --force 2>&1; then
    ok "Extension installed — restart $CODE to activate"
  else
    fail "Extension install failed"
    ERRORS=$((ERRORS + 1))
  fi
fi

# =============================================================================
# STEP 4 — Sync Talon Voice Files
# =============================================================================
hdr "[ 4 / 4 ]  Syncing Talon Voice Commands"

TALON_DIR="$HOME/.talon/user"

if [[ ! -d "$TALON_DIR" ]]; then
  warn "Talon user directory not found at $TALON_DIR"
  warn "Install Talon Voice from https://talonvoice.com and try again"
  warn "Manual copy: cp *.talon ~/.talon/user/"
else
  TALON_FILES=(
    "noizylab_voice.talon"
    "noizylab_system.talon"
    "claude_code.talon"
  )

  for f in "${TALON_FILES[@]}"; do
    SRC="$ROOT_DIR/$f"
    DST="$TALON_DIR/$f"
    if [[ -f "$SRC" ]]; then
      cp "$SRC" "$DST"
      ok "Synced: $f → $TALON_DIR/"
    else
      warn "Not found: $f (skipped)"
    fi
  done
fi

# =============================================================================
# Summary
# =============================================================================
echo ""
echo -e "${BOLD}${CYAN}══════════════════════════════════════════════${RESET}"

if [[ $ERRORS -eq 0 ]]; then
  echo -e "${GREEN}${BOLD}  NOIZY SUPERSTACK READY${RESET}"
  echo ""
  echo -e "  ${CYAN}Next steps:${RESET}"
  echo "    1. Restart VSCode Insiders"
  echo "    2. Open NOIZYEMPIRE DREAMCHAMBER.code-workspace"
  echo "    3. Press Ctrl+Shift+Space to open the voice panel"
  echo "    4. Say 'noizy record' in Talon to toggle recording"
  echo ""
  echo -e "  ${CYAN}F5 dev mode:${RESET} Select 'NOIZY Voice Extension (Dev Host)' → press F5"
else
  echo -e "${YELLOW}${BOLD}  SETUP COMPLETE WITH $ERRORS WARNING(S)${RESET}"
  echo "  Review the output above and fix any issues."
fi

echo -e "${BOLD}${CYAN}══════════════════════════════════════════════${RESET}"
echo ""
