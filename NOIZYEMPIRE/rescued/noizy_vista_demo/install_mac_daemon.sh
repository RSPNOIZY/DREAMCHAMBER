#!/bin/zsh
# Install LaunchAgent to autorun FastAPI server on macOS login
PLIST=~/Library/LaunchAgents/com.noizy.vista.demo.plist
cat <<EOF > $PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.noizy.vista.demo</string>
    <key>ProgramArguments</key>
    <array>
        <string>${HOME}/.pyenv/versions/noizy_vista_demo/bin/uvicorn</string>
        <string>main:app</string>
        <string>--reload</string>
        <string>--host</string>
        <string>127.0.0.1</string>
        <string>--port</string>
        <string>8000</string>
    </array>
    <key>WorkingDirectory</key>
    <string>${HOME}/noizy_vista_demo</string>
    <key>RunAtLoad</key>
    <true/>
    <key>StandardOutPath</key>
    <string>${HOME}/noizy_vista_demo/fastapi_stdout.log</string>
    <key>StandardErrorPath</key>
    <string>${HOME}/noizy_vista_demo/fastapi_stderr.log</string>
</dict>
</plist>
EOF
launchctl unload $PLIST 2>/dev/null
launchctl load $PLIST
