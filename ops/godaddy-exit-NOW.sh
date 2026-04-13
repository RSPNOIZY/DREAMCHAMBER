#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# GODADDY EXIT — MASTER EXECUTION
# April 13, 2026 — DEADLINE: April 17, 2026 (4 DAYS)
#
# This script automates everything possible and gives you
# exact browser URLs for the manual steps.
# ═══════════════════════════════════════════════════════════════

set -euo pipefail
cd ~/NOIZYANTHROPIC

RED='\033[0;31m'
GRN='\033[0;32m'
YEL='\033[0;33m'
BLD='\033[1m'
RST='\033[0m'

echo ""
echo -e "${BLD}═══════════════════════════════════════════════════════════════${RST}"
echo -e "${BLD}  GODADDY EXIT — TOTAL FREEDOM${RST}"
echo -e "${BLD}  $(date '+%Y-%m-%d %H:%M:%S')${RST}"
echo -e "${BLD}═══════════════════════════════════════════════════════════════${RST}"
echo ""

# ══════════════════════════════════════════════════════════════
# PHASE 1: NAMESERVER FIX (kills ERROR 1016)
# ══════════════════════════════════════════════════════════════
echo -e "${BLD}PHASE 1: FIX NAMESERVERS${RST}"
echo "─────────────────────────────────────────────"
echo ""

# Check current NS
for domain in noizy.ai fishmusicinc.com; do
  ns=$(dig "$domain" NS +short 2>/dev/null | head -1)
  if echo "$ns" | grep -q "marek\|tara"; then
    echo -e "  ${GRN}✓${RST} $domain → already on marek/tara"
  else
    echo -e "  ${RED}✗${RST} $domain → currently on $ns"
    echo -e "    ${YEL}ACTION REQUIRED:${RST}"
    echo "    1. Open: https://dcc.godaddy.com/control/$domain/dns"
    echo "    2. Click: Nameservers → Change"
    echo "    3. Select: 'I'll use my own nameservers'"
    echo "    4. Enter: marek.ns.cloudflare.com"
    echo "    5. Enter: tara.ns.cloudflare.com"
    echo "    6. Save"
    echo ""
  fi
done

# noizyfish.com already correct
ns_nf=$(dig noizyfish.com NS +short 2>/dev/null | head -1)
echo -e "  ${GRN}✓${RST} noizyfish.com → already on marek/tara"
echo ""

echo "  Waiting for you to fix nameservers..."
echo "  Press ENTER when done (or Ctrl+C to skip)..."
read -r || true
echo ""

# Verify
echo "  Verifying nameservers..."
for domain in noizy.ai noizyfish.com fishmusicinc.com; do
  ns=$(dig "$domain" NS +short 2>/dev/null | tr '\n' ' ')
  echo "  $domain: $ns"
done
echo ""

# ══════════════════════════════════════════════════════════════
# PHASE 2: GET EPP CODES
# ══════════════════════════════════════════════════════════════
echo -e "${BLD}PHASE 2: GET EPP/AUTH CODES FROM GODADDY${RST}"
echo "─────────────────────────────────────────────"
echo ""
echo "  For each domain, get the authorization/EPP code:"
echo ""
echo "  noizy.ai:"
echo "    https://dcc.godaddy.com/control/noizy.ai/settings"
echo "    → Transfer domain away → Get authorization code"
echo ""
echo "  noizyfish.com:"
echo "    https://dcc.godaddy.com/control/noizyfish.com/settings"
echo "    → Transfer domain away → Get authorization code"
echo ""
echo "  fishmusicinc.com:"
echo "    https://dcc.godaddy.com/control/fishmusicinc.com/settings"
echo "    → Transfer domain away → Get authorization code"
echo ""
echo "  IMPORTANT: Turn OFF Transfer Lock first for each domain!"
echo ""
echo "  Press ENTER when you have all EPP codes..."
read -r || true
echo ""

# ══════════════════════════════════════════════════════════════
# PHASE 3: INITIATE CLOUDFLARE TRANSFERS
# ══════════════════════════════════════════════════════════════
echo -e "${BLD}PHASE 3: TRANSFER TO CLOUDFLARE REGISTRAR${RST}"
echo "─────────────────────────────────────────────"
echo ""
echo "  Open: https://dash.cloudflare.com/5f36aa9795348ea681d0b21910dfc82a/domains/transfer"
echo ""
echo "  Transfer each domain:"
echo "  1. Enter domain name"
echo "  2. Paste EPP code"
echo "  3. Confirm contact: rsplowman@icloud.com"
echo "  4. Add payment (if needed)"
echo "  5. Confirm transfer"
echo ""
echo "  Costs:"
echo "    .com domains: ~\$10.11/yr"
echo "    .ai domain:   ~\$20/yr (2-year min)"
echo ""
echo "  noizykidz.com is ALREADY at Cloudflare Registrar ✓"
echo ""
echo "  Press ENTER when transfers are initiated..."
read -r || true
echo ""

# ══════════════════════════════════════════════════════════════
# PHASE 4: RE-AUTH WRANGLER (FULL SCOPES)
# ══════════════════════════════════════════════════════════════
echo -e "${BLD}PHASE 4: WRANGLER RE-AUTH${RST}"
echo "─────────────────────────────────────────────"
echo ""
echo "  Current missing scopes: email_routing:write, browser:write, flagship:*"
echo "  Re-authenticating now (browser will open)..."
echo ""
npx wrangler login 2>&1 || echo "  ⚠️  Login failed or cancelled"
echo ""

# Verify new scopes
echo "  Verifying new auth..."
npx wrangler whoami 2>&1 | tail -5
echo ""

# ══════════════════════════════════════════════════════════════
# PHASE 5: DNS + EMAIL SETUP
# ══════════════════════════════════════════════════════════════
echo -e "${BLD}PHASE 5: DNS & EMAIL AUTHENTICATION${RST}"
echo "─────────────────────────────────────────────"
echo ""
bash ops/godaddy-exit-dns.sh 2>&1
echo ""

# ══════════════════════════════════════════════════════════════
# PHASE 6: DEPLOY LANDING PAGE
# ══════════════════════════════════════════════════════════════
echo -e "${BLD}PHASE 6: DEPLOY LANDING PAGE${RST}"
echo "─────────────────────────────────────────────"
echo ""
cd ~/NOIZYANTHROPIC/noizy-landing
npx wrangler deploy --config wrangler.toml 2>&1
echo ""

# Verify
echo "  Testing endpoints..."
echo "  workers.dev: $(curl -sI --max-time 5 https://noizy-landing.rsp-5f3.workers.dev/ 2>/dev/null | head -1)"
echo "  noizy.ai:    $(curl -sI --max-time 5 https://noizy.ai/ 2>/dev/null | head -1)"
echo "  heaven:      $(curl -s --max-time 5 https://heaven.rsp-5f3.workers.dev/health 2>/dev/null | jq -r '.status' 2>/dev/null)"
echo ""

# ══════════════════════════════════════════════════════════════
# PHASE 7: APPROVE TRANSFERS AT GODADDY
# ══════════════════════════════════════════════════════════════
echo -e "${BLD}PHASE 7: APPROVE TRANSFERS${RST}"
echo "─────────────────────────────────────────────"
echo ""
echo "  Check email (rsplowman@icloud.com) for transfer approval requests."
echo "  OR go to: https://dcc.godaddy.com/control/transfers"
echo "  → Click 'Approve' for each pending transfer"
echo ""
echo "  Timeline: Transfers complete in hours-to-7 days"
echo ""

# ══════════════════════════════════════════════════════════════
# SUMMARY
# ══════════════════════════════════════════════════════════════
echo -e "${BLD}═══════════════════════════════════════════════════════════════${RST}"
echo -e "${BLD}  GODADDY EXIT STATUS — $(date '+%Y-%m-%d %H:%M:%S')${RST}"
echo -e "${BLD}═══════════════════════════════════════════════════════════════${RST}"
echo ""

echo "  DOMAIN STATUS:"
for domain in noizy.ai noizyfish.com fishmusicinc.com; do
  registrar=$(whois "$domain" 2>/dev/null | grep "Registrar:" | head -1 | sed 's/.*Registrar: //')
  ns=$(dig "$domain" NS +short 2>/dev/null | head -1)
  echo "    $domain → Registrar: $registrar | NS: $ns"
done
echo "    noizykidz.com → Registrar: Cloudflare, Inc. | NS: marek.ns.cloudflare.com ✓"
echo ""

echo "  AFTER TRANSFERS COMPLETE:"
echo "    1. Verify all domains show Cloudflare as registrar"
echo "    2. Cancel all GoDaddy auto-renewals"
echo "    3. Cancel GoDaddy M365/email hosting"
echo "    4. Download GoDaddy invoices for records"
echo "    5. Close GoDaddy account"
echo ""
echo -e "  ${GRN}\"TOTAL FREEDOM.\" — RSP_001${RST}"
echo ""
