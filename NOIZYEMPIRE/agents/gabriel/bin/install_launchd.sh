#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# NOIZYLAB LaunchD Installer
# ═══════════════════════════════════════════════════════════════
# Installs all NOIZYLAB launch agents for auto-start on boot.
# Run once on the Mac M2 Ultra (GOD).
#
# Usage: ./install_launchd.sh [--uninstall]
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

LAUNCH_DIR="$HOME/Library/LaunchAgents"
NOIZYLAB_HOME="/Users/m2ultra/NOIZYLAB"
GABRIEL_HOME="$NOIZYLAB_HOME/GABRIEL"

UNINSTALL=0
[[ "${1:-}" == "--uninstall" ]] && UNINSTALL=1

mkdir -p "$LAUNCH_DIR"

install_plist() {
    local name="$1"
    local file="$LAUNCH_DIR/${name}.plist"

    if [[ $UNINSTALL -eq 1 ]]; then
        launchctl bootout "gui/$(id -u)/$name" 2>/dev/null || true
        rm -f "$file"
        echo "[✓] Removed $name"
        return
    fi

    # Write the plist
    cat > "$file" <<PLIST_CONTENT
$(cat)
PLIST_CONTENT

    # Load it
    launchctl bootout "gui/$(id -u)/$name" 2>/dev/null || true
    launchctl bootstrap "gui/$(id -u)" "$file"
    echo "[✓] Installed and loaded $name"
}

echo "╔══════════════════════════════════════════════╗"
if [[ $UNINSTALL -eq 1 ]]; then
    echo "║  NOIZYLAB LaunchD — UNINSTALL                ║"
else
    echo "║  NOIZYLAB LaunchD — INSTALL                  ║"
fi
echo "╚══════════════════════════════════════════════╝"
echo ""

# ─── 1. GABRIEL Server ────────────────────────────────────────
install_plist "com.gabriel.server" <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.gabriel.server</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/Users/m2ultra/NOIZYLAB/GABRIEL/bin/start_server.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <dict>
        <key>SuccessfulExit</key>
        <false/>
    </dict>
    <key>ThrottleInterval</key>
    <integer>30</integer>
    <key>StandardOutPath</key>
    <string>/Users/m2ultra/NOIZYLAB/GABRIEL/logs/server.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/m2ultra/NOIZYLAB/GABRIEL/logs/server.error.log</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>GABRIEL_HOME</key>
        <string>/Users/m2ultra/NOIZYLAB/GABRIEL</string>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin</string>
    </dict>
</dict>
</plist>
EOF

# ─── 2. GABRIEL Bridge ───────────────────────────────────────
install_plist "com.gabriel.bridge" <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.gabriel.bridge</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/Users/m2ultra/NOIZYLAB/GABRIEL/bin/start_bridge.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <dict>
        <key>SuccessfulExit</key>
        <false/>
    </dict>
    <key>ThrottleInterval</key>
    <integer>30</integer>
    <key>StandardOutPath</key>
    <string>/Users/m2ultra/NOIZYLAB/GABRIEL/logs/bridge.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/m2ultra/NOIZYLAB/GABRIEL/logs/bridge.error.log</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>GABRIEL_HOME</key>
        <string>/Users/m2ultra/NOIZYLAB/GABRIEL</string>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin</string>
    </dict>
</dict>
</plist>
EOF

# ─── 3. Health Check (7am daily + every 15 min) ──────────────
install_plist "com.noizylab.health" <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.noizylab.health</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/Users/m2ultra/NOIZYLAB/GABRIEL/bin/health_check.sh</string>
        <string>--fix</string>
    </array>
    <key>StartInterval</key>
    <integer>900</integer>
    <key>StandardOutPath</key>
    <string>/Users/m2ultra/NOIZYLAB/logs/health_check.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/m2ultra/NOIZYLAB/logs/health_check_error.log</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>NOIZYLAB_HOME</key>
        <string>/Users/m2ultra/NOIZYLAB</string>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin</string>
    </dict>
</dict>
</plist>
EOF

# ─── 4. Morning Report (7am daily with voice) ────────────────
install_plist "com.noizylab.morning" <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.noizylab.morning</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/Users/m2ultra/NOIZYLAB/GABRIEL/bin/health_check.sh</string>
        <string>--voice</string>
        <string>--fix</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>7</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/Users/m2ultra/NOIZYLAB/logs/morning_report.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/m2ultra/NOIZYLAB/logs/morning_report_error.log</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>NOIZYLAB_HOME</key>
        <string>/Users/m2ultra/NOIZYLAB</string>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin</string>
    </dict>
</dict>
</plist>
EOF

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  DONE                                        ║"
echo "╠══════════════════════════════════════════════╣"
echo "║  com.gabriel.server    — auto-start + revive ║"
echo "║  com.gabriel.bridge    — auto-start + revive ║"
echo "║  com.noizylab.health   — every 15 min + fix  ║"
echo "║  com.noizylab.morning  — 7am daily + voice   ║"
echo "╚══════════════════════════════════════════════╝"
