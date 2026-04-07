#!/bin/zsh
# GitHub push automation script for noizy_vista_demo
# Usage: ./github_push.sh "commit message" [branch_name]

set -e

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_DIR"

BRANCH="${2:-main}"
COMMIT_MSG="${1:-"Update project"}"

git checkout "$BRANCH" || git checkout -b "$BRANCH"
git add .
git commit -m "$COMMIT_MSG"
git push origin "$BRANCH"

echo "Pushed to GitHub branch: $BRANCH with commit: $COMMIT_MSG"