#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# NOIZY.AI — MISSION-SEEDED PROMPT WRAPPER
# Wraps any prompt with the NOIZY mission header before sending to Ollama
#
# USAGE:
#   echo "Should we use CQRS for the ledger?" | ./prompt_seed.sh
#   ./prompt_seed.sh --prompt "Explain the risk of using KV for consent tokens"
#   ./prompt_seed.sh --model llama3.3:70b --prompt "Design the Voice DNA API"
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODEL="gemma:latest"
PROMPT_TEXT=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --model)  MODEL="$2"; shift 2 ;;
    --prompt) PROMPT_TEXT="$2"; shift 2 ;;
    *) echo "Unknown: $1"; exit 1 ;;
  esac
done

# Read from stdin if no --prompt
if [[ -z "$PROMPT_TEXT" ]]; then
  PROMPT_TEXT=$(cat)
fi

MISSION_HEADER="[MISSION: NOIZY.AI / MC96ECO · RSP_001 · Transform visionary concepts into tangible innovations that empower creators. INVARIANTS: 75/25 royalties (creator/platform), consent required, revocation sacred, compensation automatic. STACK: Heaven v18 · Cloudflare Workers + D1 + KV + R2 · GOD.local M2 Ultra · Ollama · 7-agent AI family.]"

FULL_PROMPT="${MISSION_HEADER}

---

${PROMPT_TEXT}"

echo "$FULL_PROMPT" | ollama run "$MODEL"
