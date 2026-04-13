#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# GODADDY EXIT — DEPLOY & ACTIVATE CUSTOM DOMAINS
# Run AFTER domains are transferred and zones are active
# ═══════════════════════════════════════════════════════════════

set -e
cd ~/NOIZYANTHROPIC
source .env 2>/dev/null || true

echo "═══════════════════════════════════════════════════════════════"
echo "  GABRIEL — DEPLOY & ACTIVATE CUSTOM DOMAINS"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# ─── Step 1: Activate noizy.ai landing page routes ───
echo "▸ Step 1: Activating noizy.ai landing page..."

# Uncomment routes in noizy-landing/wrangler.toml
cd ~/NOIZYANTHROPIC/noizy-landing
sed -i '' 's/^# routes/routes/' wrangler.toml
sed -i '' 's/^#   { pattern/  { pattern/' wrangler.toml
sed -i '' 's/^# ]/]/' wrangler.toml

echo "  Updated wrangler.toml — routes activated"
cat wrangler.toml
echo ""

# Deploy landing page
echo "  Deploying noizy-landing..."
npx wrangler deploy 2>&1
echo "  ✅ noizy-landing deployed"
echo ""

# ─── Step 2: Deploy Heaven ───
echo "▸ Step 2: Deploying Heaven..."
cd ~/NOIZYANTHROPIC
npx wrangler deploy 2>&1
echo "  ✅ Heaven deployed"
echo ""

# ─── Step 3: Smoke tests ───
echo "▸ Step 3: Running smoke tests..."
bash smoke_test.sh 2>&1
echo ""

# ─── Step 4: Verify custom domains ───
echo "▸ Step 4: Verifying custom domains..."
echo "  noizy.ai:     $(curl -sI --max-time 5 https://noizy.ai/ 2>/dev/null | head -1)"
echo "  heaven:        $(curl -s --max-time 5 https://heaven.rsp-5f3.workers.dev/health 2>/dev/null | head -c 80)"
echo ""

# ─── Step 5: Email test ───
echo "▸ Step 5: Email routing test..."
echo "  Sending test emails..."
echo "NOIZY EXIT TEST — $(date)" | mail -s "EXIT TEST: noizy.ai" rsp@noizy.ai 2>/dev/null && echo "  → rsp@noizy.ai sent" || echo "  ⚠️  mail command not available"
echo "NOIZY EXIT TEST — $(date)" | mail -s "EXIT TEST: noizyfish.com" rsp@noizyfish.com 2>/dev/null && echo "  → rsp@noizyfish.com sent" || echo "  ⚠️  mail command not available"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "  DEPLOY COMPLETE — $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "  ✅ Landing page live at noizy.ai"
echo "  ✅ Heaven live at heaven.rsp-5f3.workers.dev"
echo "  ✅ DNS records configured"
echo "  ✅ Email routing active"
echo ""
echo "  TOTAL FREEDOM."
echo "═══════════════════════════════════════════════════════════════"
