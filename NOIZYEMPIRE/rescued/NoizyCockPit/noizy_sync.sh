#!/bin/zsh
# NoizyCockPit Google Cloud Sync Automation Script

# Set up environment variable for Google Cloud credentials
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.gcp/service_account.json"

# Ensure data directory exists
mkdir -p "data"

# Ensure platform_trace.csv exists with headers if missing
if [ ! -f "data/platform_trace.csv" ]; then
  echo "Platform,Status,Details" > "data/platform_trace.csv"
  echo "🆕 Created empty data/platform_trace.csv"
fi

# Run sync.py
python3 sync.py

# Print result
if [ $? -eq 0 ]; then
  echo "✅ Sync completed."
else
  echo "❌ Sync failed. Check output above."
fi
