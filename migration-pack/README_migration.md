# NOIZY 7-Project Migration Runbook

**Target:** `github.com/noizy-ai` (multi-repo migration)

The 7 projects:
1. dreamchamber-audio-mcp
2. mcp-gemma3
3. mcp-framework
4. dreamchamber
5. noizybeast
6. swift-library
7. noizyempire-claude

## Quick Migration

```bash
export GITHUB_TOKEN=ghp_your_token
node scripts/create-target-repos.js projects-manifest.json
bash scripts/mirror-and-push.sh projects-manifest.json
bash scripts/verify.sh projects-manifest.json
```

## Rollback

All mirrors archived at `/Volumes/FISH/NOIZY_MIGRATION_20260329/mirrors/` for instant restore.

