#!/usr/bin/env zsh
# Heaven Live — go-offline trigger for Noizy.AI
# Usage: HEAVEN_API_KEY=xxx ./go-offline.sh

HEAVEN_WORKER_URL="${HEAVEN_WORKER_URL:-https://heaven-live.noizy.workers.dev}"
HEAVEN_API_KEY="${HEAVEN_API_KEY:?HEAVEN_API_KEY must be set}"

echo "📴 Going OFFLINE..."

response=$(curl -s -w "\n%{http_code}" \
  -X POST "${HEAVEN_WORKER_URL}/go-offline" \
  -H "Content-Type: application/json" \
  -H "X-Heaven-Key: ${HEAVEN_API_KEY}")

http_code=$(echo "${response}" | tail -n1)
body=$(echo "${response}" | head -n-1)

if [[ "${http_code}" == "200" ]]; then
  echo "✅ OFFLINE — Discord notified. Heaven is down."
else
  echo "❌ Failed (HTTP ${http_code}): ${body}"
  exit 1
fi
