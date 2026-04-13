#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# GODADDY EXIT — FULL EXECUTION SCRIPT
# Run this in Terminal.app (NOT Claude Code)
# Date: April 13, 2026 — 4 DAYS TO DEADLINE
# ═══════════════════════════════════════════════════════════════

set -e
cd ~/NOIZYANTHROPIC

echo "═══════════════════════════════════════════════════════════════"
echo "  GABRIEL — GODADDY EXIT SEQUENCE"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# ─── PHASE 0: Fix Claude Code session env files ───
echo "▸ Phase 0: Fixing Claude Code session env files..."
fixed=0
for f in ~/.claude/session-env/*/sessionstart-hook-0.sh; do
  if grep -q 'SESSION_START=[0-9]' "$f" 2>/dev/null; then
    sed -i '' 's/=\([0-9]\{4\}-[0-9][0-9]-[0-9][0-9]\) \([0-9][0-9]:[0-9][0-9]:[0-9][0-9]\)$/="\1T\2"/' "$f"
    sed -i '' 's/=\(\/[^ "]*\)$/="\1"/' "$f"
    fixed=$((fixed + 1))
  fi
done
echo "  ✅ Fixed $fixed session env files"
echo ""

# ─── PHASE 1: DNS Scan ───
echo "▸ Phase 1: Current DNS status..."
echo ""
echo "── noizy.ai ──"
echo "  NS:    $(dig noizy.ai NS +short 2>/dev/null | tr '\n' ' ')"
echo "  MX:    $(dig noizy.ai MX +short 2>/dev/null | tr '\n' ' ')"
echo "  SPF:   $(dig noizy.ai TXT +short 2>/dev/null | grep spf)"
echo "  DMARC: $(dig _dmarc.noizy.ai TXT +short 2>/dev/null || echo 'MISSING')"
echo ""
echo "── noizyfish.com ──"
echo "  NS:    $(dig noizyfish.com NS +short 2>/dev/null | tr '\n' ' ')"
echo "  MX:    $(dig noizyfish.com MX +short 2>/dev/null | tr '\n' ' ')"
echo "  SPF:   $(dig noizyfish.com TXT +short 2>/dev/null | grep spf)"
echo "  DMARC: $(dig _dmarc.noizyfish.com TXT +short 2>/dev/null || echo 'MISSING')"
echo ""
echo "── fishmusicinc.com ──"
echo "  NS:    $(dig fishmusicinc.com NS +short 2>/dev/null | tr '\n' ' ')"
echo "  MX:    $(dig fishmusicinc.com MX +short 2>/dev/null | tr '\n' ' ')"
echo "  SPF:   $(dig fishmusicinc.com TXT +short 2>/dev/null | grep spf)"
echo "  DMARC: $(dig _dmarc.fishmusicinc.com TXT +short 2>/dev/null || echo 'MISSING')"
echo ""
echo "── noizyfish.ca ──"
echo "  NS:    $(dig noizyfish.ca NS +short 2>/dev/null | tr '\n' ' ')"
echo "  MX:    $(dig noizyfish.ca MX +short 2>/dev/null | tr '\n' ' ')"
echo "  STATUS: $(dig noizyfish.ca SOA +short 2>/dev/null | head -1)"
echo ""
echo "── noizylab.ca ──"
echo "  NS:    $(dig noizylab.ca NS +short 2>/dev/null | tr '\n' ' ')"
echo "  MX:    $(dig noizylab.ca MX +short 2>/dev/null | tr '\n' ' ')"
echo ""

# ─── PHASE 2: Wrangler Identity ───
echo "▸ Phase 2: Cloudflare account..."
npx wrangler whoami 2>/dev/null || echo "  ⚠️  wrangler not authenticated"
echo ""

# ─── PHASE 3: Heaven Health ───
echo "▸ Phase 3: Heaven health check..."
HEALTH=$(curl -s --max-time 5 https://heaven.rsp-5f3.workers.dev/health 2>/dev/null)
if echo "$HEALTH" | grep -q '"success"'; then
  echo "  ✅ Heaven is LIVE"
else
  echo "  ⚠️  Heaven unreachable or unhealthy"
  echo "  Response: $HEALTH"
fi
echo ""

# ─── PHASE 4: WHOIS checks ───
echo "▸ Phase 4: Domain registrar verification..."
echo ""
echo "── noizy.ai registrar ──"
whois noizy.ai 2>/dev/null | grep -i "registrar\|expir\|status" | head -8
echo ""
echo "── noizyfish.com registrar ──"
whois noizyfish.com 2>/dev/null | grep -i "registrar\|expir\|status" | head -8
echo ""
echo "── fishmusicinc.com registrar ──"
whois fishmusicinc.com 2>/dev/null | grep -i "registrar\|expir\|status" | head -8
echo ""
echo "── noizyfish.ca registrar ──"
whois noizyfish.ca 2>/dev/null | grep -i "registrar\|expir\|status\|not found" | head -8
echo ""

# ─── PHASE 5: Landing page check ───
echo "▸ Phase 5: Landing page status..."
echo "  noizy.ai HTTP: $(curl -sI --max-time 5 https://noizy.ai/ 2>/dev/null | head -1)"
echo "  noizy-landing worker: $(curl -sI --max-time 5 https://noizy-landing.rsp-5f3.workers.dev/ 2>/dev/null | head -1)"
echo ""

# ─── SUMMARY ───
echo "═══════════════════════════════════════════════════════════════"
echo "  SCAN COMPLETE — $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "  NEXT STEPS (manual — do these in Cloudflare Dashboard):"
echo "  1. Change CF login: rsp@noizyfish.com → rsplowman@icloud.com"
echo "  2. Get EPP codes from GoDaddy for all 4 domains"
echo "  3. Initiate transfers at dash.cloudflare.com"
echo "  4. Run: bash ops/godaddy-exit-dns.sh (after transfers)"
echo "═══════════════════════════════════════════════════════════════"
