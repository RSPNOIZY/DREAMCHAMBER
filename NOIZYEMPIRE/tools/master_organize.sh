#!/bin/bash
# ============================================================
# NOIZY EMPIRE — MASTER ORGANIZE SCRIPT v2.0
# M2 Ultra Complete GitHub + Local Organization
# Updated: 2026-03-14
#
# USAGE:
#   --dry-run    Preview what will happen, no changes
#   --push       Init git + create repos + push (requires gh auth)
#   --gitignore  Just write .gitignore files for all projects
#   (no flag)    Runs full sequence
# ============================================================

set -euo pipefail

ORG="NOIZYLAB-io"
USER="Noizyfish"
NOIZYLAB="$HOME/NOIZYLAB"
CODEMASTER="$NOIZYLAB/CODEMASTER/projects"
DRY_RUN=false
GITIGNORE_ONLY=false

# ── Parse args ───────────────────────────────────────────────
for arg in "$@"; do
  case $arg in
    --dry-run)    DRY_RUN=true ;;
    --gitignore)  GITIGNORE_ONLY=true ;;
    --push)       DRY_RUN=false ;;
  esac
done

log()  { echo "  → $1"; }
ok()   { echo "  ✓ $1"; }
skip() { echo "  – $1"; }

echo "=============================="
echo " NOIZY EMPIRE — MASTER ORGANIZE v2.0"
[ "$DRY_RUN" = true ] && echo " MODE: DRY RUN (no changes)"
[ "$GITIGNORE_ONLY" = true ] && echo " MODE: GITIGNORE ONLY"
echo "=============================="

# ── Check gh auth ─────────────────────────────────────────────
if [ "$DRY_RUN" = false ] && [ "$GITIGNORE_ONLY" = false ]; then
  if ! gh auth status &>/dev/null; then
    echo ""
    echo "ERROR: Not authenticated with GitHub."
    echo "  Run: gh auth login"
    echo "  Then re-run this script."
    exit 1
  fi
  GH_USER=$(gh api user --jq '.login' 2>/dev/null || echo "unknown")
  echo " GitHub: authenticated as $GH_USER"
fi

# ── .gitignore templates ─────────────────────────────────────
write_python_gitignore() {
  local DIR="$1"
  cat > "$DIR/.gitignore" << 'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual environments
.env
.venv
env/
venv/
ENV/

# IDE
.vscode/
.idea/
*.swp
*.swo

# Logs & databases
*.log
*.sqlite
*.db
logs/

# Testing
.pytest_cache/
.coverage
htmlcov/
.tox/

# Type checking
.mypy_cache/
.dmypy.json

# uv
.python-version
uv.lock

# OS
.DS_Store
Thumbs.db

# Secrets
.env.local
.env.*.local
*.pem
*.key
secrets.json
EOF
}

write_node_gitignore() {
  local DIR="$1"
  cat > "$DIR/.gitignore" << 'EOF'
# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Build
dist/
build/
.next/
out/
.nuxt/
.output/

# Env
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/

# Logs
logs/
*.log

# Testing
coverage/
.nyc_output/

# OS
.DS_Store
Thumbs.db

# TypeScript
*.tsbuildinfo
EOF
}

write_swift_gitignore() {
  local DIR="$1"
  cat > "$DIR/.gitignore" << 'EOF'
# Swift
.build/
*.xcworkspace
*.xcodeproj
DerivedData/
.swiftpm/
Package.resolved

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
EOF
}

# ── Core function: init + push ─────────────────────────────────
init_and_push() {
  local DIR="$1"
  local REPO="$2"
  local ORG_OR_USER="$3"
  local PRIVATE="${4:-true}"
  local LANG="${5:-python}"

  echo ""
  echo "── $REPO ──────────────────────────────"

  if [ ! -d "$DIR" ]; then
    skip "SKIP: $DIR not found"
    return
  fi

  # Write .gitignore
  if [ "$LANG" = "python" ]; then
    write_python_gitignore "$DIR"
    ok ".gitignore (Python)"
  elif [ "$LANG" = "node" ]; then
    write_node_gitignore "$DIR"
    ok ".gitignore (Node)"
  elif [ "$LANG" = "swift" ]; then
    write_swift_gitignore "$DIR"
    ok ".gitignore (Swift)"
  fi

  if [ "$DRY_RUN" = true ]; then
    log "DRY RUN: would init git + push to github.com/$ORG_OR_USER/$REPO"
    return
  fi

  if [ "$GITIGNORE_ONLY" = true ]; then
    return
  fi

  cd "$DIR"

  # Init git
  if [ ! -d ".git" ]; then
    git init -b main
    git add .
    git commit -m "Initial commit: $REPO — NOIZY Empire organized 2026-03-14

Part of NOIZY Empire master organization.
Project: $REPO | Org: $ORG_OR_USER"
    ok "git init + initial commit"
  else
    ok "git already initialized"
  fi

  # Create + push to GitHub
  if ! gh repo view "$ORG_OR_USER/$REPO" &>/dev/null 2>&1; then
    if [ "$PRIVATE" = "true" ]; then
      gh repo create "$ORG_OR_USER/$REPO" --private --source=. --push
    else
      gh repo create "$ORG_OR_USER/$REPO" --public --source=. --push
    fi
    ok "Created + pushed: github.com/$ORG_OR_USER/$REPO"
  else
    if ! git remote get-url origin &>/dev/null 2>&1; then
      git remote add origin "https://github.com/$ORG_OR_USER/$REPO.git"
    fi
    git push -u origin main 2>/dev/null || skip "Push skipped — check for conflicts"
    ok "Linked: github.com/$ORG_OR_USER/$REPO"
  fi

  cd - > /dev/null
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " PHASE 1 — CORE PLATFORM (NOIZYLAB-io)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
init_and_push "$NOIZYLAB/noizy_platform"              "noizy-platform"        $ORG  true  python
init_and_push "$NOIZYLAB/rob_ava"                     "rob-ava"               $ORG  true  python
init_and_push "$NOIZYLAB/rsp001_pipeline"             "rsp001-pipeline"       $ORG  true  python
init_and_push "$CODEMASTER/noizyvox-platform"         "noizyvox-platform"     $ORG  true  python
init_and_push "$CODEMASTER/gabriel-core"              "gabriel-core"          $ORG  true  python
init_and_push "$CODEMASTER/NOIZY.AI"                  "noizy-ai-core"         $ORG  true  python
init_and_push "$CODEMASTER/q4git"                     "q4git"                 $ORG  true  python

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " PHASE 2 — DREAMCHAMBER SUITE (NOIZYLAB-io)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
init_and_push "$NOIZYLAB/dreamchamber"                "dreamchamber"          $ORG  true  node
init_and_push "$NOIZYLAB/dreamchamber-extension"      "dreamchamber-extension" $ORG true  node
init_and_push "$CODEMASTER/dreamchamber-bridge"       "dreamchamber-bridge"   $ORG  true  node

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " PHASE 3 — VOICE & EXTENSIONS (NOIZYLAB-io)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
init_and_push "$NOIZYLAB/noizy-voice"                 "noizy-voice"           $ORG  true  node
init_and_push "$NOIZYLAB/dreamchamber/python"         "dreamchamber-python"   $ORG  true  python
init_and_push "$CODEMASTER/hybrid-monsta"             "hybrid-monsta"         $ORG  true  python

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " PHASE 4 — EXTERNAL DRIVES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
init_and_push "/Volumes/4TBSG/_2026_DOCS/NOIZYLAB_WORKSPACES/claude-agent-sdk" "claude-agent-sdk" $ORG true python

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " PHASE 5 — NOIZYFISH PERSONAL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
init_and_push "$HOME/swift-library"                   "swift-library"         $USER true  swift

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " PHASE 6 — RESCUED PROJECTS (if rescue was run)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
init_and_push "$NOIZYLAB/rescued/NoizyCockPit"        "noizy-cockpit"         $ORG  true  python
init_and_push "$NOIZYLAB/rescued/noizy_vista_demo"    "noizy-vista"           $ORG  true  python
init_and_push "$NOIZYLAB/rescued/noizy_genie_ms"      "noizy-genie"           $ORG  true  python

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " PHASE 7 — ONEDRIVE MIGRATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$DRY_RUN" = false ] && [ "$GITIGNORE_ONLY" = false ]; then
  echo ""
  read -p "  Run OneDrive migration now? (dry-run first) [y/N]: " CONFIRM
  if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
    bash "$NOIZYLAB/tools/fishnet_migrate.sh" --dry-run
    echo ""
    read -p "  Execute migration? [y/N]: " CONFIRM2
    if [[ "$CONFIRM2" =~ ^[Yy]$ ]]; then
      bash "$NOIZYLAB/tools/fishnet_migrate.sh" --copy
    fi
  fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " DONE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo " GitHub orgs:"
echo "   https://github.com/$ORG"
echo "   https://github.com/$USER"
echo ""
echo " NEXT STEPS:"
echo "   1. Mount SOUND_DESIGN drive for more repos"
echo "   2. Review ~/NOIZYLAB/rescued/ for autosave projects"
echo "   3. Run fishnet_migrate.sh for OneDrive cleanup"
echo ""
