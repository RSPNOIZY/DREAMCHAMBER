#!/bin/bash
# AirPlay session started — notify GABRIEL
TS=$(date '+%Y-%m-%d %H:%M:%S')
GABRIEL="http://localhost:7777"
DEVICE="${DEVICE_NAME:-Unknown Device}"
TITLE="${TITLE:-Unknown}"

echo "[$TS] AirPlay START: $DEVICE — $TITLE" >> /tmp/noizy-airplay.log

curl -s -X POST "$GABRIEL/memcell/airplay:session" \
  -H "Content-Type: application/json" \
  -d "{\"value\": {\"status\": \"playing\", \"device\": \"$DEVICE\", \"title\": \"$TITLE\", \"ts\": \"$TS\"}}" \
  > /dev/null 2>&1

# macOS notification
osascript -e "display notification \"$DEVICE streaming to NOIZY GOD\" with title \"AirPlay Connected\" subtitle \"$TITLE\"" 2>/dev/null &
