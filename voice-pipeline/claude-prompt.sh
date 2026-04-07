#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  Script 2 — claude-prompt.sh
#  NOIZY Voice Pipeline: Send transcript to Claude API
#  Usage: bash claude-prompt.sh /path/to/transcript.txt [tower]
#  Tower: max | code | work (default: max)
# ═══════════════════════════════════════════════════════════════

set -e

TRANSCRIPT_FILE="$1"
TOWER="${2:-max}"
RESPONSE_DIR="$HOME/NOIZYLAB/voice-pipeline/responses"
LOG_DIR="$HOME/NOIZYLAB/logs/voice-pipeline"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
ENV_FILE="$HOME/NOIZYLAB/.env"

mkdir -p "$RESPONSE_DIR" "$LOG_DIR"

# ── Load API key from .env ──────────────────────────────────────
if [ -z "$ANTHROPIC_API_KEY" ]; then
  if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' "$ENV_FILE" | grep ANTHROPIC_API_KEY | xargs)
  fi
  if [ -z "$ANTHROPIC_API_KEY" ]; then
    # Try other .env locations
    for envf in "$HOME/NOIZYLAB/dreamchamber/.env" "$HOME/NOIZYLAB/.env"; do
      [ -f "$envf" ] && export $(grep -v '^#' "$envf" | grep ANTHROPIC_API_KEY | xargs) 2>/dev/null || true
      [ -n "$ANTHROPIC_API_KEY" ] && break
    done
  fi
fi

if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "ERROR: ANTHROPIC_API_KEY not found in env or .env files" >&2; exit 1
fi

# ── Read transcript ─────────────────────────────────────────────
if [ ! -f "$TRANSCRIPT_FILE" ]; then
  echo "ERROR: Transcript not found: $TRANSCRIPT_FILE" >&2; exit 1
fi
TRANSCRIPT=$(cat "$TRANSCRIPT_FILE")

# ── Tower config ───────────────────────────────────────────────
case "$TOWER" in
  code)
    MODEL="claude-sonnet-4-5"
    SYSTEM="You are Claude Code, builder for NOIZY.AI. Robert is sending a voice prompt via iPhone Teams → M2 Ultra pipeline. Be direct and practical. Give code or commands." ;;
  work)
    MODEL="claude-sonnet-4-5"
    SYSTEM="You are Claude Coworker for NOIZY.AI Dream Chamber. Robert sent this via voice on his iPhone. Coordinate, delegate, summarize. Keep it moving." ;;
  *)
    MODEL="claude-opus-4-5"
    SYSTEM="You are Claude Max, strategic lead of NOIZY.AI Dream Chamber. Robert Stephen Plowman of Ottawa, Ontario, Canada is speaking to you via iPhone voice → Teams → M2 Ultra pipeline. This is transcribed speech — be conversational and direct. NOIZY.AI builds a premium voice library fighting for fair compensation for AI and human voice actors." ;;
esac

echo "[$TIMESTAMP] Sending to Claude $TOWER ($MODEL)..." | tee -a "$LOG_DIR/claude.log"

# ── Call Claude API ─────────────────────────────────────────────
RESPONSE_FILE="$RESPONSE_DIR/${TIMESTAMP}_${TOWER}_response.txt"

PAYLOAD=$(cat <<EOF
{
  "model": "$MODEL",
  "max_tokens": 1024,
  "system": "$SYSTEM",
  "messages": [{"role": "user", "content": $(echo "$TRANSCRIPT" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))")}]
}
EOF
)

HTTP_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d "$PAYLOAD")

HTTP_CODE=$(echo "$HTTP_RESPONSE" | tail -1)
BODY=$(echo "$HTTP_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" != "200" ]; then
  echo "ERROR: Claude API returned $HTTP_CODE: $BODY" | tee -a "$LOG_DIR/claude.log"; exit 1
fi

# Extract text from response
REPLY=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['content'][0]['text'])")

echo "$REPLY" > "$RESPONSE_FILE"
echo "[$TIMESTAMP] Response saved: $RESPONSE_FILE" | tee -a "$LOG_DIR/claude.log"
echo "$REPLY"
echo "$RESPONSE_FILE"   # last line = path for pipeline chaining
