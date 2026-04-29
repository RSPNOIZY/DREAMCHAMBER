#!/usr/bin/env zsh
# Heaven Live — go-live trigger for Noizy.AI
# Usage: HEAVEN_API_KEY=xxx [SHOW_NAME="..."] [STREAM_URL="https://..."] ./go-live.sh

HEAVEN_WORKER_URL="${HEAVEN_WORKER_URL:-https://heaven-live.noizy.workers.dev}"
HEAVEN_API_KEY="${HEAVEN_API_KEY:?HEAVEN_API_KEY must be set}"
SHOW_NAME="${SHOW_NAME:-Noizy.AI — Heavenly Setup}"
STREAM_URL="${STREAM_URL:-}"
PLATFORM="${PLATFORM:-Cloudflare Stream}"

PAYLOAD=$(cat <<EOF
{
  "showName": "${SHOW_NAME}",
  "platform": "${PLATFORM}",
  "streamUrl": "${STREAM_URL}"
}
EOF
)

echo "🚀 Going LIVE: ${SHOW_NAME}"

response=$(curl -s -w "\n%{http_code}" \
  -X POST "${HEAVEN_WORKER_URL}/go-live" \
  -H "Content-Type: application/json" \
  -H "X-Heaven-Key: ${HEAVEN_API_KEY}" \
  -d "${PAYLOAD}")

http_code=$(echo "${response}" | tail -n1)
body=$(echo "${response}" | head -n-1)

if [[ "${http_code}" == "200" ]]; then
  echo "✅ LIVE — Discord notified. Heaven is up."
else
  echo "❌ Failed (HTTP ${http_code}): ${body}"
  exit 1
fi
