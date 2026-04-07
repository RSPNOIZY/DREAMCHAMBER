#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Deploying Heaven Worker..."

# Run preflight
./scripts/token-scope-lint.sh

# Deploy and capture output
DEPLOY_OUTPUT=$(npx wrangler deploy 2>&1) || {
  echo "❌ Deploy failed"
  echo "$DEPLOY_OUTPUT"
  exit 1
}

echo "$DEPLOY_OUTPUT"

# Extract version if available
VERSION_ID=$(echo "$DEPLOY_OUTPUT" | grep -oE '[a-f0-9-]{36}' | head -1 || echo "")

echo "⏳ Waiting for propagation..."
sleep 5

echo "🧪 Running smoke test..."
if ! ./scripts/smoke-test.sh; then
  if [[ -n "$VERSION_ID" ]]; then
    echo "🧯 Smoke test failed — attempting rollback"
    npx wrangler rollback --message "Auto-rollback: smoke test failed" || true
  fi
  exit 1
fi

echo "✅ Deploy complete and verified"
