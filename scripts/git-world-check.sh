#!/usr/bin/env bash
#
# Optional override:
#   NOIZY_PROJECT_ROOT=/absolute/path/to/repo bash scripts/git-world-check.sh --strict

set -euo pipefail

ROOT="${NOIZY_PROJECT_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$ROOT"

STRICT=0
DIFF_BASE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --strict)
      STRICT=1
      shift
      ;;
    --diff-base)
      DIFF_BASE="${2:-}"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 2
      ;;
  esac
done

status=0

fail() {
  echo "::error::$1" >&2
  status=1
}

warn() {
  echo "::warning::$1"
}

escape_for_grep_pattern() {
  # Escape grep -E metacharacters so literal path names can be joined into one safe alternation.
  printf '%s\n' "$1" | sed 's/[][\\.*^$()+?{|]/\\&/g'
}

gitlinks="$(git ls-files -s | awk '$1 ~ /^160000$/ {print $4}')"
if [[ -n "$gitlinks" ]]; then
  fail "Tracked gitlinks/submodules are not allowed in the integration repo."
  printf '%s\n' "$gitlinks"
fi

if git ls-files --error-unmatch .gitmodules >/dev/null 2>&1 || [[ -f .gitmodules ]]; then
  fail ".gitmodules is not allowed in the integration repo."
fi

tracked_worktrees="$(git ls-files '.worktrees/*' '.claude/worktrees/*')"
if [[ -n "$tracked_worktrees" ]]; then
  fail "Tracked worktree paths are not allowed."
  printf '%s\n' "$tracked_worktrees"
fi

nested_git_dirs="$(find . -path './.git' -prune -o -type d -name .git -print | sed 's#^\./##' | sort)"
if [[ -n "$nested_git_dirs" ]]; then
  warn "Nested .git directories detected. Treat them as external or archive material, not owned repo content."
  printf '%s\n' "$nested_git_dirs"
fi

quarantine_roots=(
  "NOIZYLAB"
  "NOIZY-MONO"
  "repos"
  "OneDrive"
  "DUPES"
  "Recovered"
)

quarantine_pattern="$(for root in "${quarantine_roots[@]}"; do
  escape_for_grep_pattern "$root"
done | awk 'BEGIN { ORS=""; first=1 } { if (!first) printf "|" ; printf "%s", $0; first=0 }')"

present_quarantine_roots=()
for root in "${quarantine_roots[@]}"; do
  if [[ -e "$root" ]]; then
    present_quarantine_roots+=("$root")
  fi
done

if (( ${#present_quarantine_roots[@]} > 0 )); then
  warn "Quarantined mirror/archive roots are present locally. Do not treat them as canonical source trees."
  printf '%s\n' "${present_quarantine_roots[@]}"
fi

if [[ -n "$DIFF_BASE" ]]; then
  if ! git rev-parse --verify "$DIFF_BASE" >/dev/null 2>&1; then
    fail "Diff base '$DIFF_BASE' could not be resolved. Verify the ref exists or check the --diff-base argument."
  else
    changed_files="$(git diff --name-only "$DIFF_BASE...HEAD" --)"
    if [[ -n "$changed_files" ]]; then
      blocked_changes="$(printf '%s\n' "$changed_files" | grep -E "^(\.worktrees/|\.claude/worktrees/|(${quarantine_pattern})/|\.gitmodules$)" || true)"
      if [[ -n "$blocked_changes" ]]; then
        fail "The diff touches quarantined roots, worktree paths, or .gitmodules. Move or extract them instead."
        printf '%s\n' "$blocked_changes"
      fi
    fi
  fi
fi

if (( status != 0 )); then
  exit "$status"
fi

echo "Git World checks passed."
