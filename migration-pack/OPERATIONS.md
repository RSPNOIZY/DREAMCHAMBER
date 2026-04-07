# NOIZY Operations Runbook

## Pre-Migration Checklist

- [ ] GitHub org created: github.com/noizy-ai
- [ ] GitHub token ready with repo + admin:org scopes
- [ ] SSH keys configured and tested
- [ ] /Volumes/FISH mounted and writable
- [ ] jq installed and working
- [ ] Git 2.20+ installed

## Migration Execution

### Step 1: Verify Manifest
```bash
cd ~/NOIZYLAB/migration-pack
cat projects-manifest.json | jq '.projects | length'
# Expected: 7
```

### Step 2: Create Target Repos
```bash
export GITHUB_TOKEN=ghp_xxxxx
node scripts/create-target-repos.js projects-manifest.json
```

Watch for: All 7 repos created or already exist (marked with ○)

### Step 3: Mirror and Push
```bash
bash scripts/mirror-and-push.sh projects-manifest.json
```

Watch for: All 7 projects pushed successfully
Archives created at: /Volumes/FISH/NOIZY_MIGRATION_20260329/

### Step 4: Verify
```bash
bash scripts/verify.sh projects-manifest.json
```

Watch for: All 7 projects show refs

## Post-Migration Tasks

Per each repo:
- [ ] Set branch protection on main (require reviews)
- [ ] Configure deploy keys (if CI needed)
- [ ] Add org secrets (API keys, tokens)
- [ ] Update CI/CD tokens
- [ ] Update webhooks to new URLs
- [ ] Run smoke tests
- [ ] Document in org README

## Troubleshooting

**SSH auth fails?**
```bash
ssh -T git@github.com
ssh-add ~/.ssh/id_ed25519
```

**Can't find local repo?**
Check paths in projects-manifest.json match actual locations.

**Push fails?**
Verify GitHub org permissions and repo exists.

**Need to rollback?**
```bash
mirror_dir=/Volumes/FISH/NOIZY_MIGRATION_20260329/mirrors/PROJECT.git
git --git-dir=$mirror_dir push --mirror git@github.com:noizy-ai/PROJECT.git
```

## Logs

All operations logged to:
`/Volumes/FISH/NOIZY_MIGRATION_20260329/logs/`

View real-time:
```bash
tail -f /Volumes/FISH/NOIZY_MIGRATION_20260329/logs/*.log
```

---
Maintained by: Rob & NOIZY ops team
