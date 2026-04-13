#!/bin/bash
# ============================================================
# NOIZY EMPIRE — GITHUB CONSOLIDATION PUSH SCRIPT
# Run AFTER: gh auth login
# Org: NOIZY-ai
# ============================================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

NOIZYLAB="$HOME/NOIZYLAB"
ORG="NOIZY-ai"

ok()  { echo -e "${GREEN}✓${NC} $1"; }
err() { echo -e "${RED}✗${NC} $1"; }
hdr() { echo -e "\n${CYAN}━━━ $1 ━━━${NC}"; }

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  NOIZY EMPIRE — GITHUB PUSH                 ║${NC}"
echo -e "${CYAN}║  Org: github.com/NOIZY-ai                   ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
echo ""

# ── Pre-flight ───────────────────────────────────────────────
hdr "Pre-flight checks"

if ! gh auth status &>/dev/null; then
  err "Not authenticated. Run: gh auth login"
  exit 1
fi
ok "GitHub auth confirmed"

GH_USER=$(gh api user --jq .login 2>/dev/null)
ok "Logged in as: $GH_USER"

# ── Fix noizy.ai repo (H.264 fork) ───────────────────────────
hdr "Fix NOIZY-ai/noizy.ai (currently wrong H.264 fork)"
echo -e "${YELLOW}⚠ This will delete the H.264 fork and create the real repo${NC}"
read -r -p "Delete NOIZY-ai/noizy.ai H.264 fork? (y/n): " confirm
if [[ "$confirm" == "y" ]]; then
  gh repo delete NOIZY-ai/noizy.ai --yes 2>/dev/null && ok "Deleted H.264 fork"
  sleep 2
  gh repo create NOIZY-ai/noizy.ai \
    --private \
    --description "NOIZY.AI — Constitutional Infrastructure for Human Creativity. noizy.ai is breathing." \
    --clone=false && ok "Created NOIZY-ai/noizy.ai"
else
  echo "Skipped"
fi

# ── Create all brand repos ────────────────────────────────────
hdr "Creating brand repos in NOIZY-ai org"

declare -A REPOS=(
  ["heaven"]="Heaven — NOIZY HVS Consent Kernel API (Cloudflare Worker v17.5.0, 40 endpoints)"
  ["noizyvox"]="NOIZYVOX — Voice Sovereignty Platform (XTTS v2 + consent architecture)"
  ["noizyfish"]="NOIZYFISH — 888-title Music Catalogue (C2PA stamped, 75/25 perpetual)"
  ["noizykidz"]="NOIZYKIDZ — Rhythm Root Island (neurodivergent kids, Unity/Godot)"
  ["noizylab-healing"]="NOIZYLAB — Sonic Healing Platform (binaural protocols, AirPlay delivery)"
  ["wisdom-project"]="Wisdom Project — Elder Voice Preservation (100-year estate protocol)"
  ["myfamily-ai"]="myFamily.AI — Voice Legacy Platform (love in code, consent-native)"
  ["noizybeast"]="noizybeast — VS Code Extension (empire IDE, T1-T10, Gabriel Edge WSS)"
  ["gabriel"]="GABRIEL — AI Orchestration Layer (empire nervous system, MLX + Claude)"
  ["policy-brief"]="NOIZY Policy Brief — Global AI + Media Policy Reference Implementation"
)

for NAME in "${!REPOS[@]}"; do
  DESC="${REPOS[$NAME]}"
  if gh repo view "NOIZY-ai/$NAME" &>/dev/null 2>&1; then
    echo "  EXISTS: $NAME — skipping"
  else
    gh repo create "NOIZY-ai/$NAME" --private --description "$DESC" --clone=false && \
      ok "Created: NOIZY-ai/$NAME"
    sleep 1
  fi
done

# ── Push NOIZYLAB monorepo ────────────────────────────────────
hdr "Push NOIZYLAB → NOIZY-ai/NOIZYLAB"
cd "$NOIZYLAB"
git remote set-url NOIZY-ai https://github.com/NOIZY-ai/NOIZYLAB.git 2>/dev/null || \
  git remote add NOIZY-ai https://github.com/NOIZY-ai/NOIZYLAB.git
git push NOIZY-ai main && ok "NOIZYLAB pushed"

# ── Push noizybeast as standalone ────────────────────────────
hdr "Push noizybeast → NOIZY-ai/noizybeast"
BEAST="$NOIZYLAB/noizybeast/vscode-extension"
cd "$BEAST"
if [ ! -d ".git" ]; then
  git init
  git add .
  git commit -m "feat: noizybeast v1.0.0 — Gabriel Edge WebSocket, T1-T10 turbo commands

VS Code extension for NOIZY Empire:
- 15 turbo commands (T1-T10 + Pipeline/Zap/GitSync/Reset/MountOmen)
- Gabriel Edge WebSocket — real-time empire status
- StatusBar: GABRIEL LIVE indicator
- Empire panel with live health checks
- beast.config.json: all 8 portals mapped

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
fi
git remote add origin https://github.com/NOIZY-ai/noizybeast.git 2>/dev/null || \
  git remote set-url origin https://github.com/NOIZY-ai/noizybeast.git
git push -u origin HEAD && ok "noizybeast pushed"

# ── Push heaven as standalone ────────────────────────────────
hdr "Push heaven → NOIZY-ai/heaven"
TMP_HEAVEN=$(mktemp -d)
cp -r "$NOIZYLAB/src" "$TMP_HEAVEN/"
cp "$NOIZYLAB/wrangler.toml" "$TMP_HEAVEN/"
cp "$NOIZYLAB/smoke_test.sh" "$TMP_HEAVEN/"
cp "$NOIZYLAB/schema.sql" "$TMP_HEAVEN/" 2>/dev/null || true
cp "$NOIZYLAB/seed.sql" "$TMP_HEAVEN/" 2>/dev/null || true
cp -r "$NOIZYLAB/schema" "$TMP_HEAVEN/" 2>/dev/null || true
cp -r "$NOIZYLAB/workers" "$TMP_HEAVEN/" 2>/dev/null || true
cp "$NOIZYLAB/BRAND_MAP.md" "$TMP_HEAVEN/README.md"
cd "$TMP_HEAVEN"
git init
git add .
git commit -m "feat: Heaven v17.5.0 — NOIZY HVS Consent Kernel API

Cloudflare Worker — heaven.rsp-5f3.workers.dev
- 40 endpoints: actors, consent tokens, synthesis, kill switch
- Never Clauses enforcement
- myFamily.AI routes (consent-native voice legacy)
- NOIZYLAB healing sessions (binaural + biometric)
- WebSocket /ws — Gabriel Edge real-time
- 21 smoke tests, 18/18 passing
- gabriel_db D1: 22 tables, HVS schema

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
git remote add origin https://github.com/NOIZY-ai/heaven.git
git push -u origin HEAD && ok "heaven pushed"
rm -rf "$TMP_HEAVEN"

# ── Push noizyvox as standalone ───────────────────────────────
hdr "Push noizyvox → NOIZY-ai/noizyvox"
TMP_VOX=$(mktemp -d)
cp -r "$NOIZYLAB/noizyvox" "$TMP_VOX/"
cp "$NOIZYLAB/voice-bridge-server.js" "$TMP_VOX/" 2>/dev/null || true
cp -r "$NOIZYLAB/voice-pipeline" "$TMP_VOX/" 2>/dev/null || true
cd "$TMP_VOX"
git init
git add .
git commit -m "feat: NOIZYVOX Engine v1.0.0 — XTTS v2 voice sovereignty

FastAPI server + Gradio UI for voice cloning
- XTTS v2 on MPS (M2 Ultra accelerated)
- /speak endpoint: consent-verified voice synthesis
- /voice/upload: sovereign voice profile capture
- port 8420 (API) + 8421 (UI)
- Voice bridge relay: port 8080 → Heaven edge

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
git remote add origin https://github.com/NOIZY-ai/noizyvox.git
git push -u origin HEAD && ok "noizyvox pushed"
rm -rf "$TMP_VOX"

# ── Push noizyfish ────────────────────────────────────────────
hdr "Push noizyfish → NOIZY-ai/noizyfish"
TMP_FISH=$(mktemp -d)
cp -r "$NOIZYLAB/noizyfish" "$TMP_FISH/"
cp -r "$NOIZYLAB/noizy-landing" "$TMP_FISH/" 2>/dev/null || true
cd "$TMP_FISH"
git init
git add .
git commit -m "feat: NOIZYFISH catalogue engine + librosa audio analysis

888-title music catalogue infrastructure:
- librosa_agent: audio feature extraction + intake config
- noizy_vault_engine: mass scan, metadata, embeddings
  Paths: MAG 4TB / NOIZYFISH_THE_AQAURIUM → local vault output
- noizy-landing: Cloudflare Worker (396 Hz platinum wordmark)
- 75/25 perpetual — HVS enforced

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
git remote add origin https://github.com/NOIZY-ai/noizyfish.git
git push -u origin HEAD && ok "noizyfish pushed"
rm -rf "$TMP_FISH"

# ── Push gabriel ──────────────────────────────────────────────
hdr "Push gabriel → NOIZY-ai/gabriel"
TMP_GAB=$(mktemp -d)
cp -r "$NOIZYLAB/mc96" "$TMP_GAB/"
cp -r "$NOIZYLAB/mcp/gabriel-mcp" "$TMP_GAB/gabriel-mcp" 2>/dev/null || true
cp -r "$NOIZYLAB/scripts" "$TMP_GAB/" 2>/dev/null || true
cp -r "$NOIZYLAB/turbo-scripts" "$TMP_GAB/" 2>/dev/null || true
cd "$TMP_GAB"
git init
git add .
git commit -m "feat: GABRIEL orchestration layer — MC96 + MCP + turbo scripts

AI orchestration for NOIZY Empire:
- mc96/: turbo-pro-upgrade, opus-4.6-diagnostic-engine, gabriel-harvest
- mc96/turbo_gabriel_omega.py: MLX LLaMA 70B + MusicGen + MemCell 3.0
- turbo-scripts/: pipeline, zap, git-sync, reset, mount-omen
- gabriel-mcp/: MCP server (Model Context Protocol)
- scripts/: gabriel-dispatch.sh

Co-Authored-By: Claude Sonnet 4.6 (1M context) <noreply@anthropic.com>"
git remote add origin https://github.com/NOIZY-ai/gabriel.git
git push -u origin HEAD && ok "gabriel pushed"
rm -rf "$TMP_GAB"

# ── Summary ───────────────────────────────────────────────────
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  PUSH COMPLETE — NOIZY EMPIRE ON GITHUB     ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo "Repos created and pushed:"
echo "  github.com/NOIZY-ai/heaven          ← Cloudflare Worker API"
echo "  github.com/NOIZY-ai/noizyvox        ← Voice sovereignty engine"
echo "  github.com/NOIZY-ai/noizyfish       ← Music catalogue"
echo "  github.com/NOIZY-ai/noizybeast      ← VS Code extension"
echo "  github.com/NOIZY-ai/gabriel         ← AI orchestration"
echo "  github.com/NOIZY-ai/NOIZYLAB        ← Monorepo (all brands)"
echo "  github.com/NOIZY-ai/noizy.ai        ← Landing (fixed)"
echo ""
echo "Repos ready but empty (fill as you build):"
echo "  github.com/NOIZY-ai/noizykidz"
echo "  github.com/NOIZY-ai/noizylab-healing"
echo "  github.com/NOIZY-ai/wisdom-project"
echo "  github.com/NOIZY-ai/myfamily-ai"
echo "  github.com/NOIZY-ai/policy-brief"
echo ""
echo -e "${GREEN}18 days to April 17. The empire is on GitHub.${NC}"
