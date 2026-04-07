#!/bin/bash

# GABRIEL METABEAST LAUNCHER
# Double-click this file to run the deep metadata scanner

cd "$(dirname "$0")"

echo "🔥 GABRIEL METABEAST STARTING..."
echo "========================================"
echo ""
echo "Scanning: /Volumes/12TB 1/MEDIA_LIBRARY/"
echo "Output: /Volumes/12TB 1/SMART_LIBRARIES/"
echo ""
echo "This will take 10-15 minutes..."
echo "========================================"
echo ""

python3 core/deep_metadata_scanner.py

echo ""
echo ""
echo "✅ METABEAST COMPLETE!"
echo ""
echo "Press any key to close..."
read -n 1
