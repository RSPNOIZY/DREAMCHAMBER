#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# NOIZY EMPIRE — AUTO FORMAT & LINT HOOK
# ═══════════════════════════════════════════════════════════════
# Fires after every Edit/Write tool use in Claude Code / Cowork.
# Runs Prettier + ESLint on changed files automatically.
# No code ships unformatted. No code ships unlinted.
# ═══════════════════════════════════════════════════════════════

# Extract file path from hook input (JSON on stdin)
FILE_PATH=$(cat | jq -r '.tool_input.file_path // .tool_input.filePath // empty')

# If no file path extracted, exit cleanly
if [ -z "$FILE_PATH" ] || [ ! -f "$FILE_PATH" ]; then
    exit 0
fi

# Only process JS/TS/JSX/TSX/JSON/CSS/HTML/MD files
case "$FILE_PATH" in
    *.js|*.jsx|*.ts|*.tsx|*.json|*.css|*.html|*.md|*.mjs|*.cjs)
        ;;
    *)
        exit 0
        ;;
esac

# Resolve project root
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Format with Prettier (if available)
if [ -f "$PROJECT_DIR/node_modules/.bin/prettier" ]; then
    "$PROJECT_DIR/node_modules/.bin/prettier" --write "$FILE_PATH" 2>/dev/null
elif command -v npx &>/dev/null; then
    npx prettier --write "$FILE_PATH" 2>/dev/null
fi

# Lint with ESLint (JS/TS files only, auto-fix)
case "$FILE_PATH" in
    *.js|*.jsx|*.ts|*.tsx|*.mjs|*.cjs)
        if [ -f "$PROJECT_DIR/node_modules/.bin/eslint" ]; then
            "$PROJECT_DIR/node_modules/.bin/eslint" --fix "$FILE_PATH" 2>/dev/null
        elif command -v npx &>/dev/null; then
            npx eslint --fix "$FILE_PATH" 2>/dev/null
        fi
        ;;
esac

# Python files — run Black + isort
case "$FILE_PATH" in
    *.py)
        if command -v black &>/dev/null; then
            black --quiet "$FILE_PATH" 2>/dev/null
        fi
        if command -v isort &>/dev/null; then
            isort --quiet "$FILE_PATH" 2>/dev/null
        fi
        ;;
esac

# Always succeed — formatting failures should not block Claude
exit 0
