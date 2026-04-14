#!/bin/zsh

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "DEPRECATED: the git.noizy.ai cutover script is retired."
echo "Canonical Git policy now lives in:"
echo "  ${ROOT}/docs/governance/GIT_WORLD.md"
echo ""
echo "Use the GitHub org model documented in:"
echo "  ${ROOT}/github-consolidation/GITHUB_PUSH_PLAN.md"
exit 1
