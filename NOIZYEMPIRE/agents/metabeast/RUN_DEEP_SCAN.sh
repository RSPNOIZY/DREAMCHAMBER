#!/bin/bash
################################################################################
#
#  🔍 GABRIEL DEEP METADATA SCANNER - LAUNCHER
#
#  Run this script to execute the full deep metadata scan
#  Estimated time: 10-15 minutes for 23,257 files
#
################################################################################

cd "/Volumes/12TB 1/GABRIEL_DEPLOY"

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║  🔍 GABRIEL DEEP METADATA SCANNER                                  ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Will scan: 23,257 media files"
echo "⏱️  Estimated time: 10-15 minutes"
echo "📁 Output: /Volumes/12TB 1/SMART_LIBRARIES/"
echo ""
echo "=" * 70
echo ""
read -p "Press ENTER to start..."

# Run the deep metadata scanner
python3 core/deep_metadata_scanner.py

echo ""
echo "✨ Scan complete! Check /Volumes/12TB 1/SMART_LIBRARIES/"
