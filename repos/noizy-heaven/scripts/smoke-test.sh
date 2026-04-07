#!/usr/bin/env bash
set -euo pipefail

URL="${SMOKE_TEST_URL:-https://noizy.ai/health}"

echo "🧪 Smoke test: $URL"

STATUS=$(curl -sf -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null || echo "000")

if [[ "$STATUS" != "200" ]]; then
  echo "❌ Smoke test failed: HTTP $STATUS"
  exit 1
fi

echo "✅ Smoke test passed: HTTP $STATUS"
