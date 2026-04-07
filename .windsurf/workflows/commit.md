---
description: Smart commit — stage all changes, generate a conventional commit message, and push
---

Review all pending changes, generate a precise conventional commit message, and commit them.

Steps:

1. Check git status to understand what changed
// turbo
Run: `git status --short` from `/Users/m2ultra/NOIZYLAB`

2. Show the full diff for context
// turbo
Run: `git diff --stat HEAD` from `/Users/m2ultra/NOIZYLAB`

3. Stage all changes
// turbo
Run: `git add -A` from `/Users/m2ultra/NOIZYLAB`

4. Generate and apply a commit message using the GitLens commit composer.
   Use the mcp0_gitlens_commit_composer tool with directory `/Users/m2ultra/NOIZYLAB` and instructions: "use conventional commits format: type(scope): description — types: feat, fix, audit, chore, docs, refactor, perf. Keep subject line under 72 chars. Add bullet-point body for multiple changes."

5. Report the commit hash and summary of what was committed.
   Ask the user if they want to push to origin.
