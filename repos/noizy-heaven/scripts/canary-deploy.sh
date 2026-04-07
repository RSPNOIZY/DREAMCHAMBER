#!/usr/bin/env bash
set -euo pipefail

echo "🐤 Canary Deploy Pipeline"
echo "========================="

# Step 1: Preflight
echo ""
echo "Step 1/5: Preflight check"
./scripts/token-scope-lint.sh

# Step 2: Upload new version
echo ""
echo "Step 2/5: Upload new version"
./scripts/upload-version.sh

# Step 3: Route 1% traffic (canary)
echo ""
echo "Step 3/5: Canary (1% traffic)"
./scripts/rollout-traffic.sh 1

# Step 4: Smoke test
echo ""
echo "Step 4/5: Smoke test"
sleep 5
if ! ./scripts/smoke-test.sh; then
  echo "❌ Canary failed smoke test — rolling back"
  npx wrangler rollback --message "Auto-rollback: canary smoke test failed"
  exit 1
fi

# Step 5: Full rollout
echo ""
echo "Step 5/5: Full rollout (100%)"
./scripts/rollout-traffic.sh 100

echo ""
echo "✅ Canary deploy complete"
