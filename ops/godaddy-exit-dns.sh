#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# GODADDY EXIT — DNS RECORDS SETUP
# Run AFTER domain transfers are initiated
# ═══════════════════════════════════════════════════════════════

set -e
cd ~/NOIZYANTHROPIC
source .env 2>/dev/null || true

echo "═══════════════════════════════════════════════════════════════"
echo "  GABRIEL — DNS & EMAIL AUTHENTICATION SETUP"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# ─── DMARC Records ───
echo "▸ Adding DMARC records..."

echo "  → noizy.ai"
npx wrangler dns record create noizy.ai \
  --type=TXT --name=_dmarc \
  --content='v=DMARC1; p=quarantine; rua=mailto:rsp@noizy.ai; pct=100' \
  2>/dev/null && echo "    ✅ DMARC added" || echo "    ⚠️  Failed or already exists"

echo "  → noizyfish.com"
npx wrangler dns record create noizyfish.com \
  --type=TXT --name=_dmarc \
  --content='v=DMARC1; p=quarantine; rua=mailto:rsp@noizy.ai; pct=100' \
  2>/dev/null && echo "    ✅ DMARC added" || echo "    ⚠️  Failed or already exists"

echo "  → fishmusicinc.com"
npx wrangler dns record create fishmusicinc.com \
  --type=TXT --name=_dmarc \
  --content='v=DMARC1; p=quarantine; rua=mailto:rsp@noizy.ai; pct=100' \
  2>/dev/null && echo "    ✅ DMARC added" || echo "    ⚠️  Failed or already exists"

echo "  → noizyfish.ca"
npx wrangler dns record create noizyfish.ca \
  --type=TXT --name=_dmarc \
  --content='v=DMARC1; p=quarantine; rua=mailto:rsp@noizy.ai; pct=100' \
  2>/dev/null && echo "    ✅ DMARC added" || echo "    ⚠️  Failed or already exists"

echo ""

# ─── Verify SPF Records ───
echo "▸ Checking SPF records..."
for domain in noizy.ai noizyfish.com fishmusicinc.com noizyfish.ca; do
  spf=$(dig "$domain" TXT +short 2>/dev/null | grep spf)
  if [ -n "$spf" ]; then
    echo "  ✅ $domain: $spf"
  else
    echo "  ⚠️  $domain: NO SPF RECORD"
    echo "     Adding SPF..."
    npx wrangler dns record create "$domain" \
      --type=TXT --name=@ \
      --content='v=spf1 include:_spf.mx.cloudflare.net ~all' \
      2>/dev/null && echo "     ✅ SPF added" || echo "     ⚠️  Failed"
  fi
done

echo ""

# ─── Verify MX Records ───
echo "▸ Checking MX records (email routing)..."
for domain in noizy.ai noizyfish.com fishmusicinc.com noizyfish.ca; do
  mx=$(dig "$domain" MX +short 2>/dev/null)
  if echo "$mx" | grep -q "cloudflare"; then
    echo "  ✅ $domain: Cloudflare Email Routing active"
  elif echo "$mx" | grep -q "google"; then
    echo "  ℹ️  $domain: Google Workspace MX (intentional?)"
  elif [ -z "$mx" ]; then
    echo "  ❌ $domain: NO MX RECORDS — enable Email Routing in CF Dashboard"
  else
    echo "  ⚠️  $domain: $mx"
  fi
done

echo ""

# ─── Final DNS Verification ───
echo "▸ Final DNS verification..."
for domain in noizy.ai noizyfish.com fishmusicinc.com noizyfish.ca; do
  ns=$(dig "$domain" NS +short 2>/dev/null | head -1)
  if echo "$ns" | grep -q "cloudflare"; then
    echo "  ✅ $domain: NS on Cloudflare"
  elif [ -z "$ns" ]; then
    echo "  ❌ $domain: NXDOMAIN or no NS"
  else
    echo "  ⚠️  $domain: NS = $ns (NOT Cloudflare)"
  fi
done

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  DNS SETUP COMPLETE — $(date '+%Y-%m-%d %H:%M:%S')"
echo "═══════════════════════════════════════════════════════════════"
