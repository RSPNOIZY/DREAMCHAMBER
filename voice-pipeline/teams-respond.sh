#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  Script 4 — teams-respond.sh
#  NOIZY Voice Pipeline: Post Claude response back to Teams
#  Usage: bash teams-respond.sh /path/to/response.txt [tower] [prompt]
#  Uses existing power-automate-flows webhook endpoint
# ═══════════════════════════════════════════════════════════════

RESPONSE_FILE="$1"
TOWER="${2:-max}"
ORIGINAL_PROMPT="${3:-}"
LOG_DIR="$HOME/NOIZYLAB/logs/voice-pipeline"
ENV_FILE="$HOME/NOIZYLAB/.env"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p "$LOG_DIR"

# ── Load webhook URLs from .env ────────────────────────────────
if [ -f "$ENV_FILE" ]; then
  export $(grep -v '^#' "$ENV_FILE" | grep -E 'TEAMS_WEBHOOK|POWER_AUTOMATE' | xargs) 2>/dev/null || true
fi
# Fallback: load from NOIZYLAB .env
for envf in "$HOME/NOIZYLAB/.env" "$HOME/NOIZYLAB/dreamchamber/.env"; do
  [ -f "$envf" ] && export $(grep -v '^#' "$envf" | grep -E 'TEAMS_WEBHOOK|POWER_AUTOMATE' | xargs) 2>/dev/null || true
done

RESPONSE=$(cat "$RESPONSE_FILE" 2>/dev/null || echo "No response file found")
TOWER_EMOJI=""
case "$TOWER" in
  max)  TOWER_EMOJI="✦" ;;
  code) TOWER_EMOJI="⌨️" ;;
  work) TOWER_EMOJI="⚙️" ;;
  *)    TOWER_EMOJI="🤖" ;;
esac

# ── Option A: Existing Voice Bridge ───────────────────────────
# POST to voice-bridge-server.js /power-automate-webhook
BRIDGE_URL="${VOICE_BRIDGE_URL:-http://localhost:8080}"
echo "[$TIMESTAMP] Posting to Voice Bridge: $BRIDGE_URL" >> "$LOG_DIR/teams.log"

BRIDGE_RESULT=$(curl -s -X POST "$BRIDGE_URL/power-automate-webhook" \
  -H "Content-Type: application/json" \
  -d "{
    \"tower\": \"$TOWER\",
    \"response\": $(echo "$RESPONSE" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))"),
    \"prompt\": $(echo "$ORIGINAL_PROMPT" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))"),
    \"source\": \"voice-pipeline\",
    \"emoji\": \"$TOWER_EMOJI\",
    \"ts\": \"$TIMESTAMP\"
  }" 2>>"$LOG_DIR/teams.log")

echo "[$TIMESTAMP] Bridge response: $BRIDGE_RESULT" >> "$LOG_DIR/teams.log"

# ── Option B: Direct Teams Incoming Webhook ────────────────────
if [ -n "$TEAMS_WEBHOOK_URL" ]; then
  echo "[$TIMESTAMP] Posting direct to Teams webhook" >> "$LOG_DIR/teams.log"
  curl -s -X POST "$TEAMS_WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d "{
      \"@type\": \"MessageCard\",
      \"@context\": \"http://schema.org/extensions\",
      \"themeColor\": \"c084fc\",
      \"summary\": \"NOIZY Claude $TOWER Response\",
      \"sections\": [{
        \"activityTitle\": \"$TOWER_EMOJI Claude ${TOWER^} — NOIZY Dream Chamber\",
        \"activitySubtitle\": \"Voice pipeline response · $(date '+%H:%M')\",
        \"facts\": [
          {\"name\": \"Prompt\", \"value\": \"${ORIGINAL_PROMPT:0:200}\"},
          {\"name\": \"Tower\", \"value\": \"Claude $TOWER\"}
        ],
        \"text\": \"$RESPONSE\"
      }]
    }" >> "$LOG_DIR/teams.log" 2>&1
fi

echo "[$TIMESTAMP] Teams response posted ✓" >> "$LOG_DIR/teams.log"
echo "Done"
