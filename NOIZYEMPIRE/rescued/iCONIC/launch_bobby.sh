#!/bin/bash
# 🚀 Bobby Quick Launcher - One-command Bobby activation

echo "🚀 Bobby Quick Launcher"
echo "======================"

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3."
    exit 1
fi

# Check if fileicon is available
if ! command -v fileicon &> /dev/null; then
    echo "⚠️ fileicon not found. Installing via Homebrew..."
    if command -v brew &> /dev/null; then
        brew install fileicon
    else
        echo "❌ Homebrew not found. Please install fileicon manually:"
        echo "   Visit: https://github.com/mklement0/fileicon"
        exit 1
    fi
fi

# Make scripts executable
chmod +x *.py

echo "✅ Dependencies checked"

# Show options
echo ""
echo "Bobby Launch Options:"
echo "1. 🎨 Dashboard Elite (GUI)"
echo "2. 💻 Commander (CLI)"
echo "3. 🧠 AI Insights"
echo "4. 🎪 Master Control"
echo "5. 🧪 Run Tests"
echo "6. ⚙️ Configuration"

read -p "Select option (1-6): " choice

case $choice in
    1)
        echo "🎨 Launching Bobby Dashboard Elite..."
        python3 bobby_dashboard_elite.py
        ;;
    2)
        echo "💻 Launching Bobby Commander..."
        python3 bobby_commander.py
        ;;
    3)
        echo "🧠 Showing AI Insights..."
        python3 bobby_ai.py
        ;;
    4)
        echo "🎪 Launching Master Control..."
        python3 bobby_master.py
        ;;
    5)
        echo "🧪 Running Test Suite..."
        python3 bobby_test_suite.py
        ;;
    6)
        echo "⚙️ Configuration Wizard..."
        python3 bobby_commander.py --config
        ;;
    *)
        echo "❌ Invalid option. Launching Master Control by default..."
        python3 bobby_master.py
        ;;
esac

echo "👋 Bobby session complete!"