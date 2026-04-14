#!/bin/zsh

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "DEPRECATED: enterprise mirror automation is retired."
echo "Use the GitHub consolidation plan and the Git World policy instead:"
echo "  ${ROOT}/github-consolidation/GITHUB_PUSH_PLAN.md"
echo "  ${ROOT}/docs/governance/GIT_WORLD.md"
exit 1
