#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# extract-code.sh — Copy code-gold artifacts from a source to ~/Recovered/code-gold/
# No deletes. No installs. No cleanup. Copy only.
# Usage: ./extract-code.sh /Volumes/SOURCE_DRIVE
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

SOURCE="${1:?Usage: extract-code.sh /path/to/source}"
DEST="$HOME/Recovered/code-gold"
EVENTS_LOG="$HOME/Recovered/events.jsonl"
MACHINE_NAME="${HOSTNAME:-$(hostname -s)}"
CURRENT_USER="$(whoami)"
SCRIPT_NAME="extract-code"
DRY_RUN="${DRY_RUN:-false}"

if [ ! -d "$SOURCE" ]; then
  echo "ERROR: Source not found: $SOURCE"
  exit 1
fi

mkdir -p "$DEST"

# ── Recovery Preamble ────────────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════"
echo " host:        $MACHINE_NAME"
echo " user:        $CURRENT_USER"
echo " command:     $SCRIPT_NAME"
echo " source:      $SOURCE"
echo " destination: $DEST/$(basename "$SOURCE")"
echo " dry-run:     $DRY_RUN"
echo "═══════════════════════════════════════════════════"

log_event() {
  printf '{"ts":"%s","script":"%s","machine":"%s","user":"%s","action":"%s","detail":%s}\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$SCRIPT_NAME" "$MACHINE_NAME" "$CURRENT_USER" "$1" "$2" \
    >> "$EVENTS_LOG"
}

log_event "extract_started" "{\"source\":\"$SOURCE\",\"user\":\"$CURRENT_USER\",\"dry_run\":$DRY_RUN}"

# Code-gold file patterns
PATTERNS=(
  -name ".git"
  -o -name "package.json"
  -o -name "wrangler.toml"
  -o -name "wrangler.jsonc"
  -o -name "docker-compose.yml"
  -o -name "docker-compose.yaml"
  -o -name "*.xcodeproj"
  -o -name "*.xcworkspace"
  -o -name "*.swift"
  -o -name "*.ts"
  -o -name "*.tsx"
  -o -name "*.js"
  -o -name "*.jsx"
  -o -name "*.py"
  -o -name "*.md"
  -o -name "*.sh"
  -o -name "*.toml"
  -o -name "*.yaml"
  -o -name "*.yml"
  -o -name "Makefile"
  -o -name "Dockerfile"
  -o -name "*.prompt"
  -o -name "*.mjs"
  -o -name "*.cjs"
)

count=0

# Use rsync to preserve directory structure. Include only code-gold patterns.
# rsync --include patterns, then --exclude everything else.
rsync -av --progress \
  --include='*/' \
  --include='.git/***' \
  --include='package.json' \
  --include='package-lock.json' \
  --include='wrangler.toml' \
  --include='wrangler.jsonc' \
  --include='docker-compose.yml' \
  --include='docker-compose.yaml' \
  --include='*.xcodeproj/***' \
  --include='*.xcworkspace/***' \
  --include='*.swift' \
  --include='*.ts' \
  --include='*.tsx' \
  --include='*.js' \
  --include='*.jsx' \
  --include='*.py' \
  --include='*.md' \
  --include='*.sh' \
  --include='*.toml' \
  --include='*.yaml' \
  --include='*.yml' \
  --include='Makefile' \
  --include='Dockerfile' \
  --include='*.prompt' \
  --include='*.mjs' \
  --include='*.cjs' \
  --exclude='node_modules/***' \
  --exclude='.venv/***' \
  --exclude='__pycache__/***' \
  --exclude='*.pyc' \
  --exclude='dist/***' \
  --exclude='build/***' \
  --exclude='*' \
  "$SOURCE/" "$DEST/$(basename "$SOURCE")/" \
  2>&1 | tail -5

count=$(find "$DEST/$(basename "$SOURCE")" -type f 2>/dev/null | wc -l | tr -d ' ')

echo ""
echo "=== Extracted $count files to $DEST/$(basename "$SOURCE") ==="
log_event "extract_complete" "{\"source\":\"$SOURCE\",\"file_count\":$count}"
