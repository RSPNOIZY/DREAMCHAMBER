#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INBOX="$ROOT_DIR/ideas/inbox.md"

mkdir -p "$(dirname "$INBOX")"
touch "$INBOX"

if [[ "${1:-}" == "" ]]; then
  echo "Usage: npm run idea:capture -- \"your idea text\""
  exit 1
fi

TIMESTAMP="$(date +"%Y-%m-%d %H:%M:%S %Z")"
{
  echo "## $TIMESTAMP"
  echo "$*"
  echo
} >> "$INBOX"

echo "Captured idea in $INBOX"
