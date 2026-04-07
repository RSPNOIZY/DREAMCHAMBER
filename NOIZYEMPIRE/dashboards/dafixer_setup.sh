#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# DaFixer — Headless Logic Pro Audio Brain Setup
# ═══════════════════════════════════════════════════════════════
# MacBook Pro i7 / 2TB SSD / Logic Pro / UAD plugins
# Runs headless — no monitor or keyboard needed after setup.
# GOD (M2 Ultra) controls it via SSH.
#
# Run this ONCE on DaFixer (with a screen temporarily attached).
# After setup, it boots headless and GOD controls everything.
#
# Architecture:
#   GOD (M2 Ultra) ──SSH──▶ DaFixer (MacBook Pro)
#   DaFixer runs Logic Pro, UAD host, Izotope processing
#   Audio routes back to GOD via network audio (SonoBus or JackTrip)
#
# Usage (on DaFixer): bash dafixer_setup.sh
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

DAFIXER_IP="10.90.90.40"
GOD_IP="10.90.90.10"
GOD_USER="m2ultra"
NOIZYLAB_HOME="/Users/m2ultra/NOIZYLAB"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
log_ok()   { echo -e "${GREEN}[✓]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[!]${NC} $*"; }
log_info() { echo -e "${CYAN}[→]${NC} $*"; }

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  DaFixer — Headless Logic Pro Brain Setup            ║"
echo "║  MacBook Pro i7 / 2TB / Logic Pro / UAD              ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ─── Step 1: Enable SSH on DaFixer ────────────────────────────
log_info "Enabling Remote Login (SSH)..."
sudo systemsetup -setremotelogin on 2>/dev/null && log_ok "SSH enabled" || log_warn "Run manually: System Settings → Sharing → Remote Login"

# ─── Step 2: Auto-login on boot ───────────────────────────────
echo ""
log_warn "Auto-login: Set this manually in System Settings → General → Login Items & Extensions"
echo "  This lets DaFixer boot and be ready without a password prompt."
echo "  (Cannot be scripted safely — requires your password via GUI)"

# ─── Step 3: Disable sleep / screen saver ─────────────────────
echo ""
log_info "Disabling sleep and display sleep..."
sudo pmset -a sleep 0 displaysleep 0 disksleep 0 2>/dev/null && log_ok "Sleep disabled" || log_warn "pmset failed — set manually in System Settings → Battery"
sudo pmset -a womp 1 2>/dev/null && log_ok "Wake on network enabled" || true

# ─── Step 4: Disable screen saver ────────────────────────────
defaults write com.apple.screensaver idleTime 0 && log_ok "Screen saver disabled"
defaults -currentHost write com.apple.screensaver idleTime 0

# ─── Step 5: Set fixed IP (recommended) ───────────────────────
echo ""
log_info "Recommended: Set DaFixer to static IP $DAFIXER_IP on your router"
echo "  Or set in: System Settings → Network → Wi-Fi / Ethernet → Details → TCP/IP"
echo "  IPv4: Manual | Address: $DAFIXER_IP | Subnet: 255.255.255.0 | Router: 10.90.90.1"

# ─── Step 6: Install SSH key from GOD ─────────────────────────
echo ""
log_info "To allow GOD to SSH into DaFixer without password:"
echo "  Run this on GOD:"
echo "    ssh-copy-id ${GOD_USER}@${DAFIXER_IP}"
echo "  Or manually copy ~/.ssh/id_ed25519.pub into DaFixer's ~/.ssh/authorized_keys"

# ─── Step 7: Logic Pro headless bounce ───────────────────────
echo ""
log_info "Logic Pro headless control options:"
echo ""
echo "  Option A — AppleScript (simplest for bounces):"
echo "    GOD sends AppleScript commands to DaFixer via SSH:"
echo "    ssh m2ultra@$DAFIXER_IP 'osascript -e \"tell app \\\"Logic Pro\\\" to activate\"'"
echo ""
echo "  Option B — Logic Pro MIDI over network:"
echo "    Enable MIDI network session on DaFixer"
echo "    GOD sends MIDI transport commands"
echo ""
echo "  Option C — Audio Hijack or Loopback (paid):"
echo "    Route Logic Pro output → SonoBus → GOD"

# ─── Step 8: SonoBus audio bridge ────────────────────────────
echo ""
log_info "SonoBus network audio routing (DaFixer → GOD):"
echo ""
echo "  1. Install SonoBus on DaFixer: https://sonobus.net (free)"
echo "  2. DaFixer: SonoBus input = Logic Pro audio (via BlackHole)"
echo "  3. DaFixer: SonoBus connects to GOD on 10.90.90.10"
echo "  4. GOD receives Logic Pro audio over LAN — near-zero latency"
echo ""
echo "  This means: GOD triggers Logic Pro session on DaFixer,"
echo "  audio streams back to GOD, NOIZY Platform processes it."

# ─── Step 9: Verify UAD plugin compatibility ─────────────────
echo ""
log_info "UAD plugin notes:"
echo "  Old UAD hardware (UAD-2 PCIe / Thunderbolt) = NOT compatible with M2 Ultra"
echo "  BUT: DaFixer (old MacBook Pro) CAN still host UAD plugins locally"
echo "  UAD plugin processing happens on DaFixer, audio comes to GOD via SonoBus"
echo "  This is actually IDEAL — offload UAD to DaFixer, keep GOD clean"

# ─── NOIZYLAB device registration ────────────────────────────
echo ""
log_info "Adding DaFixer to GABRIEL device map..."
DEVICES_FILE="$HOME/.noizylab_devices.json"
cat > "$DEVICES_FILE" << 'JSON'
{
  "devices": {
    "GOD":     { "ip": "10.90.90.10", "type": "Mac Studio M2 Ultra", "role": "primary-compute", "talon": true },
    "GABRIEL": { "ip": "10.90.90.20", "type": "HP Omen",             "role": "ai-brain",        "talon": false },
    "DaFixer": { "ip": "10.90.90.40", "type": "MacBook Pro i7 2TB",  "role": "audio-brain",     "logic_pro": true, "uad": true, "talon": false }
  }
}
JSON
log_ok "Device map saved to $DEVICES_FILE"

# ─── Quick SSH test command ───────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  Setup Complete — Test Commands from GOD             ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "  ssh m2ultra@$DAFIXER_IP 'hostname && uptime'"
echo "  ssh m2ultra@$DAFIXER_IP 'ls /Applications/ | grep Logic'"
echo "  ssh m2ultra@$DAFIXER_IP 'osascript -e \"say \\\"DaFixer online\\\"\"'"
echo ""
echo "  Once SSH is working, GOD can:"
echo "  • Trigger Logic Pro bounces (AppleScript over SSH)"
echo "  • Copy rendered audio back to NOIZY Platform storage"
echo "  • Stream audio live via SonoBus"
echo "  • 'device check' in Talon shows DaFixer online"
echo ""
