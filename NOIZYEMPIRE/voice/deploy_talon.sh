#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# NOIZYLAB Talon Deployment — GOD (M2 Ultra)
# ═══════════════════════════════════════════════════════════════
# Deploys all NOIZYLAB Talon voice files to ~/.talon/user/
# Run after installing Talon Voice from https://talonvoice.com
#
# Usage: bash deploy_talon.sh [--dry-run]
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TALON_USER_DIR="$HOME/.talon/user"
DRY_RUN=0

[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=1

# ─── Colors ───────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

log_ok()   { echo -e "${GREEN}[✓]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[!]${NC} $*"; }
log_err()  { echo -e "${RED}[✗]${NC} $*"; }
log_info() { echo -e "${CYAN}[→]${NC} $*"; }

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  NOIZYLAB — Talon Voice Deployment               ║"
echo "║  GOD (M2 Ultra)                                  ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ─── Preflight: Is Talon installed? ───────────────────────────
if [[ ! -d "$HOME/.talon" ]]; then
    log_err "Talon not installed — ~/.talon does not exist."
    echo ""
    echo "  Install Talon Voice from: https://talonvoice.com"
    echo "  Then re-run this script."
    echo ""
    exit 1
fi

if [[ ! -d "$TALON_USER_DIR" ]]; then
    log_info "Creating Talon user directory at $TALON_USER_DIR"
    [[ $DRY_RUN -eq 0 ]] && mkdir -p "$TALON_USER_DIR"
fi

log_ok "Talon found at $HOME/.talon"
echo ""

# ─── Detect local Mac IP ──────────────────────────────────────
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "")
log_info "Detected local IP: ${LOCAL_IP:-unknown}"

# ─── Files to deploy ──────────────────────────────────────────
declare -a TALON_FILES=(
    "noizylab_voice.py"
    "noizylab_voice.talon"
    "noizylab_system.py"
    "noizylab_system.talon"
    "claude_code.talon"
)

echo "Deploying NOIZYLAB Talon files:"
echo ""

DEPLOYED=0
SKIPPED=0
FAILED=0

for file in "${TALON_FILES[@]}"; do
    src="$SCRIPT_DIR/$file"
    dst="$TALON_USER_DIR/$file"

    if [[ ! -f "$src" ]]; then
        log_warn "$file — source not found, skipping"
        ((SKIPPED++))
        continue
    fi

    if [[ $DRY_RUN -eq 1 ]]; then
        log_info "[DRY RUN] Would copy: $file → $TALON_USER_DIR/"
        continue
    fi

    cp "$src" "$dst"
    log_ok "$file → $TALON_USER_DIR/"
    ((DEPLOYED++))
done

echo ""

# ─── Patch MAC_IP in voice engine ─────────────────────────────
# noizylab_voice.py SSHes to this Mac to run `say`. Update to local IP.
if [[ -n "$LOCAL_IP" && $DRY_RUN -eq 0 ]]; then
    VOICE_FILE="$TALON_USER_DIR/noizylab_voice.py"
    if [[ -f "$VOICE_FILE" ]]; then
        # Replace placeholder or old IP with current IP
        sed -i '' "s|MAC_IP = \"[0-9.]*\"|MAC_IP = \"$LOCAL_IP\"|g" "$VOICE_FILE"
        log_ok "Patched MAC_IP → $LOCAL_IP in noizylab_voice.py"
    fi
fi

# ─── Verify SSH key ───────────────────────────────────────────
echo ""
SSH_KEY="$HOME/.ssh/id_ed25519"
if [[ -f "$SSH_KEY" ]]; then
    log_ok "SSH key found at $SSH_KEY"
else
    log_warn "No SSH key at $SSH_KEY — voice engine needs it for local say commands"
    log_info "Generating SSH key..."
    if [[ $DRY_RUN -eq 0 ]]; then
        ssh-keygen -t ed25519 -f "$SSH_KEY" -N "" -C "noizylab-god-$(hostname -s)"
        log_ok "SSH key generated"
    fi
fi

# ─── Test voice synthesis ────────────────────────────────────
echo ""
log_info "Testing voice synthesis (local say command)..."
if command -v say &>/dev/null; then
    [[ $DRY_RUN -eq 0 ]] && say -v Jamie "NOIZYLAB Talon deployment complete" &
    log_ok "Voice test sent"
else
    log_warn "say command not found — install macOS voices in System Settings > Accessibility > Spoken Content"
fi

# ─── SonoBus + BlackHole routing info ─────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  SonoBus → BlackHole → Talon Setup               ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

if brew list blackhole-2ch &>/dev/null 2>/dev/null; then
    log_ok "BlackHole 2ch installed"
else
    log_warn "BlackHole 2ch NOT installed"
    echo "       Run: open 'https://existential.audio/blackhole/'"
    echo "       Then install the .pkg with your password"
fi

echo ""
echo "  To route iPhone (SonoBus) → Talon microphone:"
echo ""
echo "  1. Install SonoBus on M2 Ultra: https://sonobus.net"
echo "  2. Open Audio MIDI Setup → Create Multi-Output Device"
echo "     → Add: BlackHole 2ch + your speakers"
echo "  3. In SonoBus (Mac): set output → BlackHole 2ch"
echo "  4. In Talon Settings → Microphone → select: BlackHole 2ch"
echo "  5. Connect iPhone SonoBus to Mac SonoBus on same WiFi"
echo "  6. Speak on iPhone → Talon hears it → types into Claude Code"
echo ""

# ─── Summary ──────────────────────────────────────────────────
echo "╔══════════════════════════════════════════════════╗"
echo "║  Deployment Summary                              ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
if [[ $DRY_RUN -eq 1 ]]; then
    echo "  DRY RUN — no files were written"
else
    log_ok "$DEPLOYED files deployed to $TALON_USER_DIR"
    [[ $SKIPPED -gt 0 ]] && log_warn "$SKIPPED files skipped"
fi
echo ""
echo "  Next: Open Talon → it will auto-load from ~/.talon/user/"
echo "  Say: 'voice test'       → confirms Jamie voice"
echo "  Say: 'gabriel status'   → checks GABRIEL server"
echo "  Say: 'nerve map'        → maps selection to Nerve-to-Note"
echo "  Say: 'kill the noise'   → emergency stop"
echo ""
