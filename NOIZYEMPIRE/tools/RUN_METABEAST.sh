#!/bin/bash
# Quick Launcher for METABEAST

echo "🦁 METABEAST - QUICK LAUNCHER 🦁"
echo ""

# Find Python
if command -v python3 &> /dev/null; then
    PYTHON=python3
elif command -v python &> /dev/null; then
    PYTHON=python
else
    echo "❌ Python not found!"
    exit 1
fi

echo "✓ Using: $PYTHON"
echo ""

# Check for METABEAST
if [ -f "./METABEAST.py" ]; then
    SCRIPT="./METABEAST.py"
elif [ -f "/Volumes/RED DRAGON/METABEAST.py" ]; then
    SCRIPT="/Volumes/RED DRAGON/METABEAST.py"
else
    echo "❌ METABEAST.py not found!"
    exit 1
fi

echo "✓ Found script: $SCRIPT"
echo ""

# Default to 12TB if no args
if [ $# -eq 0 ]; then
    if [ -d "/Volumes/12TB 1" ]; then
        echo "📂 Scanning: /Volumes/12TB 1"
        exec $PYTHON "$SCRIPT" "/Volumes/12TB 1" -o "/Volumes/12TB 1/METABEAST_ANALYSIS.json"
    else
        echo "Specify directory to scan:"
        echo "Usage: $0 /path/to/scan"
        exit 1
    fi
else
    exec $PYTHON "$SCRIPT" "$@"
fi
