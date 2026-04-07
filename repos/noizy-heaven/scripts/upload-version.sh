#!/usr/bin/env bash
set -euo pipefail

echo "📦 Uploading new Worker version (no traffic yet)"

# Get git commit for message
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "local")

VERSION_JSON=$(npx wrangler versions upload \
  --message "canary deploy $COMMIT" \
  --json 2>/dev/null || npx wrangler deploy --dry-run --json 2>/dev/null)

echo "$VERSION_JSON" > .version.json
echo "✅ Version uploaded (see .version.json)"
