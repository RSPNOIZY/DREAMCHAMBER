#!/usr/bin/env bash
set -euo pipefail

echo "📜 Exporting deployment history"

npx wrangler deployments list --json > deployments.json 2>/dev/null || {
  echo "⚠️ Could not fetch deployments (may need auth)"
  exit 1
}

jq '[.[] | {
  id: .id,
  created_on: .created_on,
  message: .annotations.["workers/message"] // "no message",
  source: .source,
  author: .author_email
}]' deployments.json > deployments_audit.json

echo "✅ Audit log written to deployments_audit.json"
echo "   $(jq length deployments_audit.json) deployments exported"
