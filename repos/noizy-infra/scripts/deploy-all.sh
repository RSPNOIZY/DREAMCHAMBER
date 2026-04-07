#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# NOIZY.AI Master Deploy Script
# Deploys all infrastructure from GOD.local
#
# Usage: ./deploy-all.sh [component]
#   Components: heaven, gabriel, supersonic, all
#
# Author: Robert Stephen Plowman (RSP_001)
# NCP: 75/25 Plowman Standard. Consent is law.
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'

# ── Paths ─────────────────────────────────────────────────────────────────────
NOIZYLAB="/Users/m2ultra/NOIZYLAB"
HEAVEN_DIR="/Users/m2ultra/Desktop/HEAVEN"
REPOS_DIR="$NOIZYLAB/repos"

COMPONENT="${1:-all}"

echo -e "${PURPLE}"
echo "╔═══════════════════════════════════════════════════╗"
echo "║  NOIZY.AI — Master Deploy Script                  ║"
echo "║  $(date '+%Y-%m-%d %H:%M:%S')                            ║"
echo "║  Component: $COMPONENT                            "
echo "╚═══════════════════════════════════════════════════╝"
echo -e "${NC}"

# ── Pre-flight Checks ────────────────────────────────────────────────────────

preflight() {
  echo -e "${CYAN}[PREFLIGHT]${NC} Running checks..."

  # Check GABRIEL
  if curl -sf http://localhost:7777/health > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} GABRIEL online at :7777"
  else
    echo -e "  ${RED}✗${NC} GABRIEL offline — start with: bun run $REPOS_DIR/noizy-gabriel/src/daemon.ts"
  fi

  # Check wrangler
  if command -v npx &> /dev/null; then
    echo -e "  ${GREEN}✓${NC} npx available"
  else
    echo -e "  ${RED}✗${NC} npx not found — install Node.js"
    exit 1
  fi

  # Check gh auth
  if gh auth status &> /dev/null; then
    echo -e "  ${GREEN}✓${NC} GitHub authenticated"
  else
    echo -e "  ${YELLOW}⚠${NC} GitHub not authenticated — run: gh auth login"
  fi

  # Check Cloudflare auth
  if npx wrangler whoami &> /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} Cloudflare authenticated"
  else
    echo -e "  ${YELLOW}⚠${NC} Cloudflare not authenticated — run: npx wrangler login"
  fi

  echo ""
}

# ── Deploy HEAVEN ─────────────────────────────────────────────────────────────

deploy_heaven() {
  echo -e "${CYAN}[HEAVEN]${NC} Deploying API Gateway Worker..."

  # Sync repo → canonical HEAVEN dir
  cp "$REPOS_DIR/noizy-heaven/src/index.ts" "$HEAVEN_DIR/src/index.ts"
  cp -r "$REPOS_DIR/noizy-heaven/src/signaling" "$HEAVEN_DIR/src/" 2>/dev/null || true
  cp "$REPOS_DIR/noizy-heaven/wrangler.toml" "$HEAVEN_DIR/wrangler.toml"

  cd "$HEAVEN_DIR"

  # Verify wrangler.toml points to correct account
  if grep -q "2446d788cc4280f5ea22a9948410c355" wrangler.toml; then
    echo -e "  ${GREEN}✓${NC} Correct account ID (HEAVEN)"
  else
    echo -e "  ${RED}✗${NC} WRONG account ID in wrangler.toml!"
    exit 1
  fi

  # Verify no dead database references
  if grep -q "f75939d5\|gabriel_db\|fc0edd97" wrangler.toml; then
    echo -e "  ${RED}✗${NC} DEAD database reference found in wrangler.toml!"
    exit 1
  fi

  echo -e "  ${GREEN}✓${NC} wrangler.toml validated"

  # Deploy
  echo -e "  ${YELLOW}→${NC} Running: npx wrangler deploy"
  npx wrangler deploy

  echo -e "  ${GREEN}✓${NC} HEAVEN Worker deployed to noizy.ai/*"
  echo ""
}

# ── Deploy GABRIEL ────────────────────────────────────────────────────────────

deploy_gabriel() {
  echo -e "${CYAN}[GABRIEL]${NC} Restarting orchestration daemon..."

  # Check if already running
  if curl -sf http://localhost:7777/health > /dev/null 2>&1; then
    echo -e "  ${YELLOW}→${NC} GABRIEL already running, will restart..."
    # Kill existing
    pkill -f "bun.*daemon.ts" 2>/dev/null || true
    sleep 1
  fi

  # Start daemon
  cd "$REPOS_DIR/noizy-gabriel"
  nohup bun run src/daemon.ts > /tmp/gabriel.log 2>&1 &
  sleep 2

  if curl -sf http://localhost:7777/health > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} GABRIEL V3 online at :7777"
    curl -s http://localhost:7777/status | python3 -m json.tool 2>/dev/null || true
  else
    echo -e "  ${RED}✗${NC} GABRIEL failed to start — check /tmp/gabriel.log"
  fi

  echo ""
}

# ── Push Repos to GitHub ──────────────────────────────────────────────────────

push_repos() {
  echo -e "${CYAN}[GITHUB]${NC} Pushing repos to NOIZYFISH org..."

  if ! gh auth status &> /dev/null; then
    echo -e "  ${RED}✗${NC} Not authenticated. Run: gh auth login"
    return
  fi

  for repo in noizy-ai noizy-heaven noizy-gabriel noizy-supersonic noizy-consent noizy-voice noizy-lab noizy-fish noizy-kidz noizy-vox noizy-aquarium noizy-wisdom noizy-infra noizy-docs; do
    cd "$REPOS_DIR/$repo"

    # Create remote repo if it doesn't exist
    gh repo create "NOIZYFISH/$repo" --private --source=. --push 2>/dev/null || true

    # Push
    if git remote get-url origin &> /dev/null; then
      git push -u origin main 2>/dev/null && \
        echo -e "  ${GREEN}✓${NC} $repo pushed" || \
        echo -e "  ${YELLOW}⚠${NC} $repo — push failed or up to date"
    else
      git remote add origin "git@github.com:NOIZYFISH/$repo.git" 2>/dev/null || true
      git push -u origin main 2>/dev/null && \
        echo -e "  ${GREEN}✓${NC} $repo pushed" || \
        echo -e "  ${YELLOW}⚠${NC} $repo — push failed"
    fi
  done

  echo ""
}

# ── Main ──────────────────────────────────────────────────────────────────────

preflight

case "$COMPONENT" in
  heaven)
    deploy_heaven
    ;;
  gabriel)
    deploy_gabriel
    ;;
  repos|github)
    push_repos
    ;;
  all)
    deploy_heaven
    deploy_gabriel
    push_repos
    ;;
  *)
    echo "Usage: $0 [heaven|gabriel|repos|all]"
    exit 1
    ;;
esac

echo -e "${PURPLE}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Deploy complete.${NC} GORUNFREE."
echo -e "${PURPLE}═══════════════════════════════════════════════════${NC}"
