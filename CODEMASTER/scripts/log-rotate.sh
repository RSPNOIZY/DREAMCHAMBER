#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# log-rotate.sh
# Compresses logs older than 7 days, deletes archives older than 30 days
# RSP_001 | NOIZY Empire | 2026
# ═══════════════════════════════════════════════════════════════

LOG_DIR="$HOME/NOIZYLAB/CODEMASTER/logs"
TS=$(date '+%Y-%m-%d %H:%M:%S')

mkdir -p "$LOG_DIR/archive"

echo "[$TS] Log rotation started"

COMPRESSED=0
DELETED=0

# Compress .log files larger than 100KB or older than 7 days
for f in "$LOG_DIR"/*.log; do
    [ -f "$f" ] || continue
    BASENAME=$(basename "$f")

    # Skip if file is empty
    [ -s "$f" ] || continue

    SIZE=$(stat -f%z "$f" 2>/dev/null || stat -c%s "$f" 2>/dev/null)
    AGE_DAYS=$(( ($(date +%s) - $(stat -f%m "$f" 2>/dev/null || stat -c%Y "$f" 2>/dev/null)) / 86400 ))

    if [ "$SIZE" -gt 102400 ] || [ "$AGE_DAYS" -gt 7 ]; then
        ARCHIVE_NAME="${BASENAME%.log}_$(date +%Y%m%d).log.gz"
        gzip -c "$f" > "$LOG_DIR/archive/$ARCHIVE_NAME"
        : > "$f"  # Truncate (not delete) so launchd doesn't lose the handle
        COMPRESSED=$((COMPRESSED + 1))
        echo "  Compressed: $BASENAME → archive/$ARCHIVE_NAME"
    fi
done

# Delete archives older than 30 days
find "$LOG_DIR/archive" -name "*.gz" -mtime +30 -delete 2>/dev/null
DELETED=$(find "$LOG_DIR/archive" -name "*.gz" -mtime +30 2>/dev/null | wc -l | tr -d ' ')

echo "[$TS] Rotation complete: $COMPRESSED compressed, $DELETED old archives deleted"
