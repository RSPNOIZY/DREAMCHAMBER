#!/bin/bash
# NOIZY Empire — Branch Protection Setup
# Run once after GitHub org/repo is confirmed.
# Requires: gh CLI authenticated as org admin
# Usage: GITHUB_ORG=yourorgnamehere bash branch-protection-setup.sh

set -e

ORG="${GITHUB_ORG:-noizy-ai}"
REPO="noizyanthropic"

echo "Setting branch protection on ${ORG}/${REPO}..."

# ── Main branch: constitutional fortress ────────────────────────────────────
gh api repos/${ORG}/${REPO}/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["Constitutional Audit","Security Scan","Gospel Deal Enforcement","Build & Test (Node) (GABRIEL/daemon)","Build & Test (Node) (NOIZYLAB/noisyvox)","Build & Test (Node) (NOIZYLAB/noisyproof)"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":2,"dismiss_stale_reviews":true,"require_code_owner_reviews":true}' \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false

echo "Main branch protection active."

# ── Staging branch: one reviewer required ───────────────────────────────────
gh api repos/${ORG}/${REPO}/branches/staging/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["Constitutional Audit","Build & Test (Node) (GABRIEL/daemon)"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false

echo "Staging branch protection active."

# ── Required secrets (set these in GitHub org secrets) ──────────────────────
echo ""
echo "Required GitHub secrets to configure at:"
echo "  https://github.com/organizations/${ORG}/settings/secrets/actions"
echo ""
echo "  CLOUDFLARE_API_TOKEN  — Wrangler deployments"
echo "  ANTHROPIC_API_KEY     — Claude API"
echo "  STRIPE_SECRET_KEY     — Payment processing"
echo "  N8N_WEBHOOK_URL       — N8N workflow triggers"
echo ""
echo "Branch protection setup complete. GORUNFREE."
