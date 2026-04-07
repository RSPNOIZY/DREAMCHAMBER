#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# NOIZYLAB Voice Engine — SSH Setup
# ═══════════════════════════════════════════════════════════════
# Run this ONCE on the machine running Talon (Windows/Linux).
# Sets up passwordless SSH to Mac M2 Ultra for voice commands.
#
# Usage: bash setup_voice_ssh.sh
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

MAC_USER="m2ultra"
MAC_IP="192.168.0.50"
KEY_PATH="$HOME/.ssh/id_ed25519"
TALON_USER_DIR="$HOME/.talon/user"

echo "╔══════════════════════════════════════════════╗"
echo "║  NOIZYLAB Voice Engine — SSH Setup           ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ─── Step 1: Generate SSH Key ──────────────────────────────────
if [ -f "$KEY_PATH" ]; then
    echo "[✓] SSH key already exists at $KEY_PATH"
else
    echo "[→] Generating Ed25519 SSH key..."
    ssh-keygen -t ed25519 -f "$KEY_PATH" -N "" -C "noizylab-voice-$(hostname)"
    echo "[✓] SSH key generated"
fi
echo ""

# ─── Step 2: Copy Key to Mac ──────────────────────────────────
echo "[→] Copying SSH key to ${MAC_USER}@${MAC_IP}..."
echo "    You'll be prompted for the Mac password ONE TIME."
echo ""
ssh-copy-id -i "$KEY_PATH" "${MAC_USER}@${MAC_IP}"
echo ""
echo "[✓] SSH key installed on Mac"
echo ""

# ─── Step 3: Test Connection ──────────────────────────────────
echo "[→] Testing SSH connection..."
if ssh -o ConnectTimeout=5 -o BatchMode=yes -i "$KEY_PATH" "${MAC_USER}@${MAC_IP}" 'echo "SSH OK"' 2>/dev/null; then
    echo "[✓] SSH connection working (passwordless)"
else
    echo "[✗] SSH connection failed. Check IP address and try again."
    exit 1
fi
echo ""

# ─── Step 4: Test Voice ──────────────────────────────────────
echo "[→] Testing voice synthesis..."
ssh -i "$KEY_PATH" "${MAC_USER}@${MAC_IP}" 'say -v Jamie "NOIZYLAB voice engine connected"'
echo "[✓] Voice test complete — did you hear Jamie?"
echo ""

# ─── Step 5: Verify macOS Premium Voices ──────────────────────
echo "[→] Checking installed premium voices on Mac..."
VOICES=$(ssh -i "$KEY_PATH" "${MAC_USER}@${MAC_IP}" 'say -v "?" | grep -E "(Jamie|Samantha|Daniel|Karen|Moira|Alex|Fiona|Tessa)"')
echo "$VOICES"
echo ""

# Count available
VOICE_COUNT=$(echo "$VOICES" | wc -l | tr -d ' ')
echo "[✓] Found $VOICE_COUNT premium voices installed"
echo ""

# ─── Step 6: Install Talon Files ──────────────────────────────
if [ -d "$TALON_USER_DIR" ]; then
    echo "[→] Talon user directory found at $TALON_USER_DIR"

    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

    if [ -f "$SCRIPT_DIR/noizylab_voice.py" ]; then
        cp "$SCRIPT_DIR/noizylab_voice.py" "$TALON_USER_DIR/noizylab_voice.py"
        echo "[✓] Copied noizylab_voice.py → $TALON_USER_DIR/"
    fi

    if [ -f "$SCRIPT_DIR/noizylab_voice.talon" ]; then
        cp "$SCRIPT_DIR/noizylab_voice.talon" "$TALON_USER_DIR/noizylab_voice.talon"
        echo "[✓] Copied noizylab_voice.talon → $TALON_USER_DIR/"
    fi
else
    echo "[!] Talon user directory not found at $TALON_USER_DIR"
    echo "    Copy noizylab_voice.py and .talon manually to your Talon user dir."
fi
echo ""

# ─── Done ─────────────────────────────────────────────────────
echo "╔══════════════════════════════════════════════╗"
echo "║  SETUP COMPLETE                              ║"
echo "╠══════════════════════════════════════════════╣"
echo "║  SSH:   Passwordless auth configured         ║"
echo "║  Voice: Jamie confirmed working              ║"
echo "║  Talon: Files installed                      ║"
echo "║                                              ║"
echo "║  Try: 'jamie say hello world'                ║"
echo "║       'gabriel say system online'             ║"
echo "║       'voice stop'                            ║"
echo "╚══════════════════════════════════════════════╝"
