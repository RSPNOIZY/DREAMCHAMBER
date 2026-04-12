#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# NOIZY.AI — FUTURE-BACK REASONING ENGINE
# "Genius-level code review from the year 2036"
#
# Author:  RSP_001 (Robert Stephen Plowman) × Antigravity
# Version: 1.0.0 · April 2026
#
# USAGE:
#   ./future_back.sh --module <module_name> [--model <ollama_model>] [--cloud]
#
# EXAMPLES:
#   ./future_back.sh --module "NOIZYVOX Consent Kernel"
#   ./future_back.sh --module "Heaven Worker Route Design" --model llama3.3:70b
#   ./future_back.sh --module "Voice DNA Schema" --cloud   # uses Claude API
#
# WHAT IT DOES:
#   1. Loads the NOIZY Mission Header (your North Star)
#   2. Loads the 2036 Vision for the specified module
#   3. Sends to local Ollama (default) or Claude (--cloud flag)
#   4. Returns 3 technical debt MUST-AVOID decisions for TODAY
#   5. Logs the output to ~/NOIZYANTHROPIC/tools/future-back/logs/
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"
VISIONS_DIR="$SCRIPT_DIR/visions"
MISSION_FILE="$SCRIPT_DIR/MISSION_HEADER.md"
MODEL="gemma:latest"   # Default local model
USE_CLOUD=false
MODULE=""
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

mkdir -p "$LOG_DIR" "$VISIONS_DIR"

# ── Colors ────────────────────────────────────────────────────────────────────
GOLD='\033[0;33m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
RESET='\033[0m'
BOLD='\033[1m'

# ── Parse args ────────────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case $1 in
    --module) MODULE="$2"; shift 2 ;;
    --model)  MODEL="$2"; shift 2 ;;
    --cloud)  USE_CLOUD=true; shift ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

if [[ -z "$MODULE" ]]; then
  echo -e "${RED}Error: --module is required${RESET}"
  echo "Example: ./future_back.sh --module \"NOIZYVOX Consent Kernel\""
  exit 1
fi

# ── Module slug for filenames ─────────────────────────────────────────────────
MODULE_SLUG=$(echo "$MODULE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g')
VISION_FILE="$VISIONS_DIR/${MODULE_SLUG}.md"
LOG_FILE="$LOG_DIR/${MODULE_SLUG}_${TIMESTAMP}.md"

# ── Mission Header (always prepended) ─────────────────────────────────────────
read -r -d '' MISSION_HEADER << 'MISSION'
[MISSION: Transform visionary concepts into tangible innovations that empower creators, protect their rights, and build a sovereign creative economy where consent is executable code, provenance is default, revocation is sacred, and compensation is automatic.]

[IDENTITY: NOIZY.AI / MC96ECO Universe — Built by Robert Stephen Plowman (RSP_001) on GOD.local (M2 Ultra). The platform inverts the creator economy: creators keep 75% of every dollar, always. The platform is built on Cloudflare Workers (Heaven v18), Cloudflare D1, KV, R2, and a 7-agent AI family (GABRIEL, LUCY, ENGR_KEITH, DREAM, CB01, SHIRL, POPS).]

[INVARIANTS — these CANNOT be violated by any technical decision:
  1. Royalty Split: creator 75% / platform 25% (always)
  2. Consent Required: explicit, recorded, revocable consent for all voice/biometric use
  3. Revocation is Sacred: one-click, propagates in minutes, no penalty
  4. Compensation is Automatic: no invoices, no minimums, no delays]
MISSION

# ── Load or prompt for 2036 vision ────────────────────────────────────────────
if [[ -f "$VISION_FILE" ]]; then
  VISION_CONTENT=$(cat "$VISION_FILE")
  echo -e "${CYAN}📄 Loaded vision: ${VISION_FILE}${RESET}"
else
  echo -e "${GOLD}⚡ No vision file found for \"$MODULE\"${RESET}"
  echo -e "${GOLD}   Creating one now. Describe the 2036 state of $MODULE:${RESET}"
  echo -e "${GOLD}   (Multi-line. Press Ctrl+D when done)${RESET}"
  echo ""
  VISION_CONTENT=$(cat)
  echo "$VISION_CONTENT" > "$VISION_FILE"
  echo -e "${GREEN}✅ Vision saved to: ${VISION_FILE}${RESET}"
fi

# ── Build the Future-Back Prompt ──────────────────────────────────────────────
read -r -d '' FB_PROMPT << PROMPT
${MISSION_HEADER}

---

## FUTURE-BACK REASONING REQUEST

You are analyzing the NOIZY.AI platform from the perspective of the year 2036.

**MODULE:** ${MODULE}

**THE 2036 VISION:**
${VISION_CONTENT}

---

## YOUR TASK

We are in April 2026. The module above is being designed and coded RIGHT NOW.

Answer ONLY this question:

*"Looking back from 2036 at the decisions made in April 2026 — what are the THREE specific technical debt decisions that, if made today, would have made it hardest or impossible to reach the 2036 state described above?"*

## RESPONSE FORMAT (strict):

### ❌ MUST-AVOID #1: [Decision Name]
**What it is:** One sentence describing the tempting short-term decision.
**Why it kills 2036:** Specific technical consequence at scale.
**The 2026 decision instead:** What to build or structure differently TODAY.

### ❌ MUST-AVOID #2: [Decision Name]
(same format)

### ❌ MUST-AVOID #3: [Decision Name]
(same format)

### ✅ ONE THING TO LOCK IN TODAY:
The single structural decision that, if made today, makes the most things easy in 2036.

---

Be specific to NOIZY.AI's actual stack (Cloudflare Workers, D1, KV, R2, Durable Objects, the 4 Invariants). Do not give generic advice.
PROMPT

# ── Banner ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GOLD}╔══════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${GOLD}║       NOIZY.AI — FUTURE-BACK REASONING ENGINE        ║${RESET}"
echo -e "${BOLD}${GOLD}║       Module: ${MODULE}$(printf '%*s' $((38 - ${#MODULE})) '')║${RESET}"
echo -e "${BOLD}${GOLD}║       Perspective: April 2036 → April 2026           ║${RESET}"
echo -e "${BOLD}${GOLD}╚══════════════════════════════════════════════════════╝${RESET}"
echo ""

# ── Run inference ─────────────────────────────────────────────────────────────
if [[ "$USE_CLOUD" == true ]]; then
  echo -e "${CYAN}☁️  Using Claude API (Extended Thinking)...${RESET}"
  echo ""

  # Check for API key
  if [[ -z "${ANTHROPIC_API_KEY:-}" ]]; then
    echo -e "${RED}Error: ANTHROPIC_API_KEY not set${RESET}"
    echo "Export it: export ANTHROPIC_API_KEY=your_key"
    exit 1
  fi

  RESPONSE=$(curl -s https://api.anthropic.com/v1/messages \
    -H "content-type: application/json" \
    -H "x-api-key: $ANTHROPIC_API_KEY" \
    -H "anthropic-version: 2023-06-01" \
    -H "anthropic-beta: interleaved-thinking-2025-05-14" \
    -d "{
      \"model\": \"claude-sonnet-4-5\",
      \"max_tokens\": 16000,
      \"thinking\": {\"type\": \"enabled\", \"budget_tokens\": 10000},
      \"messages\": [{
        \"role\": \"user\",
        \"content\": $(echo "$FB_PROMPT" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read()))')
      }]
    }" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for block in data.get('content', []):
    if block.get('type') == 'text':
        print(block['text'])
")

else
  echo -e "${GREEN}🧠 Using local Ollama (${MODEL}) — ZeroTrust mode${RESET}"
  echo -e "${GREEN}   Your data never leaves GOD.local${RESET}"
  echo ""

  # Check Ollama is running
  if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo -e "${RED}Error: Ollama is not running on localhost:11434${RESET}"
    echo "Start it: ollama serve"
    exit 1
  fi

  RESPONSE=$(echo "$FB_PROMPT" | ollama run "$MODEL" 2>/dev/null)
fi

# ── Output ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${BOLD}${CYAN}  FUTURE-BACK ANALYSIS: ${MODULE}${RESET}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo "$RESPONSE"
echo ""
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

# ── Save to log ───────────────────────────────────────────────────────────────
{
  echo "# Future-Back Analysis: ${MODULE}"
  echo "**Date:** ${TIMESTAMP}"
  echo "**Model:** $(if [[ "$USE_CLOUD" == true ]]; then echo "Claude (cloud)"; else echo "$MODEL (local)"; fi)"
  echo ""
  echo "## Vision File"
  echo '```'
  echo "$VISION_CONTENT"
  echo '```'
  echo ""
  echo "## Output"
  echo ""
  echo "$RESPONSE"
} > "$LOG_FILE"

echo -e "${GREEN}💾 Log saved: ${LOG_FILE}${RESET}"
echo ""
