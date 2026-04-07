#!/bin/bash
# UAD Network Audio Quick Setup

echo "🎛️  Setting up UAD Network Audio Bridge"
echo "======================================"

# Check if running on source Mac (MacBook Pro)
read -p "Is this the MacBook Pro with UAD? (y/n): " is_source

if [ "$is_source" = "y" ]; then
    echo "📤 Configuring as SENDER (MacBook Pro)"
    
    # Create aggregate device via CoreAudio
    osascript <<EOF
    tell application "Audio MIDI Setup" to activate
    display dialog "1. Create Aggregate Device with UAD + Network Device
2. Name it 'UAD Network Send'
3. Enable drift correction" buttons {"Done"} default button 1
EOF
    
    # Set up BlackHole if installed
    if [ -d "/Library/Audio/Plug-Ins/HAL/BlackHole.driver" ]; then
        echo "✅ BlackHole detected - routing available"
    else
        echo "💡 Install BlackHole for virtual routing:"
        echo "   brew install blackhole-2ch"
    fi
    
else
    echo "📥 Configuring as RECEIVER (M2 Ultra)"
    
    osascript <<EOF
    tell application "Audio MIDI Setup" to activate
    display dialog "1. Open Network Device Browser
2. Connect to 'UAD Network Send'
3. Create Multi-Output with Network + your monitors" buttons {"Done"} default button 1
EOF

    # Create input monitoring script
    cat > ~/Desktop/monitor-uad-input.sh << 'SCRIPT'
#!/bin/bash
# Monitor UAD network input levels
echo "Monitoring network audio input..."
while true; do
    # Check if network device is active
    system_profiler SPAudioDataType | grep -A5 "Network"
    sleep 2
done
SCRIPT
    chmod +x ~/Desktop/monitor-uad-input.sh
    
    echo "✅ Monitor script created on Desktop"
fi

echo ""
echo "🎯 Next Steps:"
echo "- MacBook Pro: Route DAW output to Network Device"
echo "- M2 Ultra: Select Network Device as input in your DAW"
echo "- Both: Use same sample rate (48kHz recommended)"
echo "- Connect via Ethernet for best results"
