#!/usr/bin/env bash
set -euo pipefail

PERCENT="${1:?Usage: rollout-traffic.sh <percent>}"

if [[ ! -f .version.json ]]; then
  echo "❌ No .version.json found. Run upload-version.sh first."
  exit 1
fi

VERSION_ID=$(jq -r '.id // .version_id // empty' .version.json)

if [[ -z "$VERSION_ID" ]]; then
  echo "❌ Could not extract version ID from .version.json"
  exit 1
fi

echo "🚦 Routing ${PERCENT}% traffic to version ${VERSION_ID}"

npx wrangler versions deploy "$VERSION_ID:$PERCENT"

echo "✅ Traffic split: ${PERCENT}% to new version"
