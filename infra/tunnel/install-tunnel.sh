#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# install-tunnel.sh — Setup Cloudflare Zero Trust tunnel for GOD.local
# Prerequisites: cloudflared tunnel login (browser auth)
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

TUNNEL_NAME="noizy-god"
CONFIG_DIR="$(dirname "$0")"
CF_DIR="$HOME/.cloudflared"

echo "═══════════════════════════════════════════════════"
echo " Cloudflare Zero Trust Tunnel Installer"
echo " Machine: $(hostname -s)"
echo " Tunnel:  $TUNNEL_NAME"
echo "═══════════════════════════════════════════════════"

# Check auth
if [ ! -f "$CF_DIR/cert.pem" ]; then
  echo ""
  echo "ERROR: No cert.pem found. Run first:"
  echo "  cloudflared tunnel login"
  echo ""
  echo "This opens a browser. Pick the noizy.ai zone."
  exit 1
fi

# Create tunnel
echo ""
echo ">> Creating tunnel: $TUNNEL_NAME"
TUNNEL_ID=$(cloudflared tunnel create "$TUNNEL_NAME" 2>&1 | grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' | head -1)

if [ -z "$TUNNEL_ID" ]; then
  echo "Tunnel may already exist. Checking..."
  TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
fi

if [ -z "$TUNNEL_ID" ]; then
  echo "ERROR: Could not create or find tunnel"
  exit 1
fi

echo "  Tunnel ID: $TUNNEL_ID"

# Write config with real tunnel ID
echo ""
echo ">> Writing config..."
sed "s/TUNNEL_UUID_HERE/$TUNNEL_ID/g" "$CONFIG_DIR/config.yml" > "$CF_DIR/config.yml"
echo "  Config: $CF_DIR/config.yml"

# Create DNS routes
echo ""
echo ">> Creating DNS routes..."
for hostname in gabriel.noizy.ai n8n.noizy.ai ollama.noizy.ai dream.noizy.ai; do
  echo "  $hostname → $TUNNEL_NAME"
  cloudflared tunnel route dns "$TUNNEL_NAME" "$hostname" 2>&1 || echo "  (may already exist)"
done

# Install as LaunchAgent
echo ""
echo ">> Installing LaunchAgent..."
PLIST="$HOME/Library/LaunchAgents/com.cloudflare.noizy-god.plist"
cat > "$PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.cloudflare.noizy-god</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/cloudflared</string>
        <string>tunnel</string>
        <string>run</string>
    </array>
    <key>StandardOutPath</key>
    <string>/Users/m2ultra/NOIZYANTHROPIC/GABRIEL/logs/tunnel.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/m2ultra/NOIZYANTHROPIC/GABRIEL/logs/tunnel.err</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>ThrottleInterval</key>
    <integer>5</integer>
</dict>
</plist>
PLIST

launchctl unload "$PLIST" 2>/dev/null || true
launchctl load "$PLIST"
echo "  LaunchAgent installed and loaded"

# Verify
echo ""
echo ">> Verifying tunnel..."
sleep 3
cloudflared tunnel info "$TUNNEL_NAME" 2>&1 | head -10

echo ""
echo "═══════════════════════════════════════════════════"
echo " TUNNEL LIVE"
echo " gabriel.noizy.ai → localhost:9777"
echo " n8n.noizy.ai     → localhost:5678"
echo " ollama.noizy.ai  → localhost:11434"
echo " dream.noizy.ai   → localhost:7777"
echo "═══════════════════════════════════════════════════"
echo ""
echo " Next: Configure Access policies at:"
echo "   dash.cloudflare.com > Zero Trust > Access > Applications"
echo "   Add app → Self-hosted → *.noizy.ai"
echo "   Policy: Allow emails = rsp@noizy.ai"
