---
name: godaddy-migration
description: "Complete GoDaddy to Cloudflare domain transfer and email routing plan for fishmusicinc.com, noizyfish.com, noizyfish.ca, and noizy.ai"
---

# SKILL: GoDaddy → Cloudflare Domain Migration

> **Purpose**: Complete migration of all NOIZY domains from GoDaddy to Cloudflare Registrar with email routing setup.
> **Owner**: Robert Stephen Plowman — RSP_001
> **Created**: 2026-03-25
> **Status**: ACTIVE — EXECUTION PHASE

---

## EMAIL ARCHITECTURE

**`rsp@noizyfish.com` is the UNIVERSAL NOIZY CONTACT EMAIL.** This address is the public face of the empire. It must survive the GoDaddy exit and work forever via Cloudflare Email Routing.

- **Public/business email**: `rsp@noizyfish.com` → forwarded to `rsplowman@icloud.com` (backend)
- **Cloudflare admin login**: `rsplowman@icloud.com` (CRITICAL: must be backend email, not public)
- **Personal/Apple ID**: `rsplowman@icloud.com`

All `rsp@` addresses on all domains forward to `rsplowman@icloud.com`. For sending, configure iCloud+ Custom Domain or Gmail "Send As" to send FROM `rsp@noizyfish.com`.

## DOMAIN INVENTORY

| # | Domain | TLD | Transfer Notes | Email Routing |
|---|--------|-----|----------------|---------------|
| 1 | `fishmusicinc.com` | .com | Standard ICANN transfer, +1 year | `rsp@` → rsplowman@icloud.com (legacy) |
| 2 | `noizyfish.com` | .com | **PRIMARY EMAIL DOMAIN** — Standard ICANN transfer, +1 year | `rsp@` → rsplowman@icloud.com (**UNIVERSAL NOIZY CONTACT**) |
| 3 | `noizyfish.ca` | .ca | CIRA-managed, registrant verification email after transfer | `rsp@` → rsplowman@icloud.com (Canadian alias) |
| 4 | `noizy.ai` | .ai | Minimum 2-year registration required for transfer | `rsp@` → rsplowman@icloud.com (brand alias) |

## CLOUDFLARE ACCOUNT

```
Account Name:  rsp@noizy.ai
Account ID:    5f36aa9795348ea681d0b21910dfc82a
Current Login: rsp@noizyfish.com ← BLOCKING ISSUE (public email, not backend)
Target Login:  rsplowman@icloud.com ← REQUIRED (backend email)
```

## INFRASTRUCTURE AT RISK

Everything below lives in this single Cloudflare account:

- **1 Worker**: deploy
- **10 D1 Databases**: gabriel_db, agent-memory, noizyanthropic, aquarium-archive, rsp-master-budget, tencc-pipeline, subscription-killer, mc96-command-central, godaddy-escape-tracker, noizylab-repairs
- **20+ KV Namespaces**: GABRIEL_KV, GABRIEL_VOICE, agent-state, session-cache, + 16 more
- **R2**: NOT YET ENABLED (requires Dashboard action)

**If rsp@noizyfish.com stops working before login email is changed → ALL OF THIS IS AT RISK.**

## CURRENT STATE (as of 2026-03-25)

- [x] Domain locks: OFF on all domains
- [x] Nameservers: Most already pointing to Cloudflare
- [ ] CF login email: Still rsp@noizyfish.com (MUST CHANGE TO rsplowman@icloud.com)
- [ ] Auth codes: Not yet obtained from GoDaddy
- [ ] Payment method: Verify on CF Registrar
- [ ] Domain transfers: Not initiated
- [ ] Email routing: Not configured

## ESCAPE TRACKER

D1 Database: `godaddy-escape-tracker` — `dfe9343e-c84c-49fd-8a02-052f37a7155b`

---

## EXECUTION SEQUENCE

### ⛔ STEP 0 — CHANGE CLOUDFLARE LOGIN EMAIL (BLOCKING)

**This is a HARD DEPENDENCY. Nothing else proceeds until this is done.**

**Why it's critical**: Your Cloudflare account login is currently `rsp@noizyfish.com` (a public-facing email). This creates a dependency loop: the email routing for `rsp@noizyfish.com` is managed IN Cloudflare, so if anything breaks during migration, you could lose access to the account that controls the email that logs into the account.

**⚠️ BEFORE YOU START**: Verify you can log into Cloudflare with password-based auth. If you rely on magic links, ensure `rsp@noizyfish.com` is currently receiving email.

**Actions (10 minutes)**:

1. Go to https://dash.cloudflare.com — log in with current credentials
2. Click your profile icon (top right) → **My Profile**
3. Under **Communication** or **Account** section, find **Email Address**
4. Change from `rsp@noizyfish.com` to `rsplowman@icloud.com`
5. Cloudflare sends verification to `rsplowman@icloud.com` — check iCloud inbox, click verify
6. Log OUT completely
7. Log back in with `rsplowman@icloud.com` + your password
8. Confirm full Dashboard access — Workers, D1, KV all visible?
9. Enable 2FA (Authenticator app) if not already active
10. **CRITICAL**: `rsp@noizyfish.com` remains the PUBLIC contact. Only the Cloudflare LOGIN changes to backend.

**Verification**: `curl https://heaven.rsp-5f3.workers.dev/health` should still respond.

**DONE signal**: Tell me "Step 0 complete" and I will update the escape tracker.

---

### STEP 1 — GET AUTH CODES FROM GODADDY (15 minutes)

For each of the 4 domains, get an authorization/EPP code from GoDaddy:

1. Go to https://dcc.godaddy.com (Domain Control Center)
2. Select domain → **Transfer** tab (or "Transfer domain away from GoDaddy")
3. Copy the **Authorization Code** (also called EPP code or auth code)
4. Repeat for all 4 domains

| Domain | Auth Code | Got It? |
|--------|-----------|---------|
| fishmusicinc.com | _________ | [ ] |
| noizyfish.com | _________ | [ ] |
| noizyfish.ca | _________ | [ ] |
| noizy.ai | _________ | [ ] |

**Note on `.ca`**: CIRA-managed domains may have a slightly different auth code process. GoDaddy should still provide it. If not, you may need to get it from CIRA directly.

**Note on `.ai`**: Requires minimum 2-year registration remaining. If your registration is under 2 years, renew at GoDaddy first, then transfer.

---

### STEP 2 — ADD DOMAINS TO CLOUDFLARE (if not already zones)

Most of your domains likely already exist as zones in CF since nameservers are pointing there. For any that aren't:

1. Go to https://dash.cloudflare.com
2. Click **Add a Site**
3. Enter the domain name
4. Select **Free** plan
5. Cloudflare will scan existing DNS records — review and confirm
6. CF provides two nameservers — these should already be set at GoDaddy

**Verify all 4 are active zones**: Dashboard should show each domain with "Active" status.

---

### STEP 3 — INITIATE DOMAIN TRANSFERS (30 minutes)

1. Go to https://dash.cloudflare.com → **Domain Registration** → **Transfer Domains**
2. Enter each domain name — CF will show if eligible
3. Enter the auth code for each domain
4. Confirm contact information (use rsplowman@icloud.com)
5. Add payment method if not on file
6. Confirm transfer for each domain

**Transfer timeline**:
- `.com` domains: 5-7 days (GoDaddy may email asking you to approve — APPROVE IT)
- `.ca` domain: 5-7 days + CIRA registrant verification email afterward
- `.ai` domain: May take up to 10 days, requires 2-year minimum registration

**Cost** (at-cost pricing, no CF markup):
- `.com`: ~$10.11/year
- `.ca`: ~$11.50/year (verify current CF pricing)
- `.ai`: ~$20.00/year (verify current CF pricing, 2-year minimum)

---

### STEP 4 — CONFIGURE EMAIL ROUTING (15 minutes per domain)

Once domains are active zones in CF (which they should already be):

**For each domain**:

1. Go to https://dash.cloudflare.com → select domain
2. Go to **Email** → **Email Routing**
3. Click **Enable Email Routing** (CF adds MX + TXT records automatically)
4. **Add destination address**: `rsplowman@icloud.com` — verify it (check iCloud inbox)
5. **Create custom addresses**:
   - `rsp@[domain]` → Forward to `rsplowman@icloud.com`
   - `info@[domain]` → Forward to `rsplowman@icloud.com`
   - `rob@[domain]` → Forward to `rsplowman@icloud.com`
6. **Enable Catch-All**: Set action to "Forward to rsplowman@icloud.com"
   - This catches any email sent to any address at the domain

**Email addresses to create**:

| Custom Address | Destination | Domain |
|---------------|-------------|--------|
| rsp@fishmusicinc.com | rsplowman@icloud.com | fishmusicinc.com |
| rsp@noizyfish.com | rsplowman@icloud.com | noizyfish.com |
| rsp@noizyfish.ca | rsplowman@icloud.com | noizyfish.ca |
| rsp@noizy.ai | rsplowman@icloud.com | noizy.ai |
| info@noizy.ai | rsplowman@icloud.com | noizy.ai |
| hello@noizy.ai | rsplowman@icloud.com | noizy.ai |
| Catch-all on ALL domains | rsplowman@icloud.com | all |

**Important**: CF Email Routing is FREE, unlimited, and private. No storage of emails. Pure forwarding.

---

### STEP 5 — VERIFY EVERYTHING (15 minutes)

**Domain status checks**:
```bash
# Check nameservers for each domain
dig NS fishmusicinc.com +short
dig NS noizyfish.com +short
dig NS noizyfish.ca +short
dig NS noizy.ai +short
# All should return *.ns.cloudflare.com

# Check MX records (email routing)
dig MX fishmusicinc.com +short
dig MX noizyfish.com +short
dig MX noizyfish.ca +short
dig MX noizy.ai +short
# Should return route1.mx.cloudflare.net and route2.mx.cloudflare.net
```

**Email test**: Send a test email to `rsp@noizyfish.com` from a different account. Confirm it arrives at `rsplowman@icloud.com` (backend inbox).

**Worker test**: `curl https://heaven.rsp-5f3.workers.dev/health`

**Dashboard access test**: Log in with `rsplowman@icloud.com`, verify all zones visible. Public contact remains `rsp@noizyfish.com`.

---

### STEP 6 — CLOSE GODADDY (after transfers complete)

Only after ALL transfers show "Complete" in CF Dashboard:

1. Log into each GoDaddy account
2. Cancel any remaining services (auto-renew, privacy, etc.)
3. Download any invoices/records you want to keep
4. Close the accounts

**TOTAL FREEDOM.**

---

## CRITICAL WARNINGS

1. **NEVER cancel GoDaddy domains before CF transfer completes** — the domain goes to redemption/deletion
2. **NEVER let GoDaddy domains expire during transfer** — transfer will fail
3. **`.ai` minimum**: If noizy.ai has less than 2 years registration, renew at GoDaddy FIRST
4. **`.ca` verification**: After transfer, CIRA sends a registrant verification email — MUST complete it or domain gets suspended
5. **ICANN 60-day lock**: If you changed registrant info (name, org, email) in the last 60 days at GoDaddy, transfers will be blocked
6. **Payment**: CF Registrar requires a payment method on file before transfers

## DNS RECORDS TO PRESERVE

When CF scans your domains during zone setup, it auto-imports existing DNS records. Verify these are present after migration:

- **A/AAAA records**: Any pointing to hosting
- **CNAME records**: www redirects, verification records
- **TXT records**: SPF, DKIM, domain verification
- **MX records**: CF Email Routing will replace these

## ROLLBACK PLAN

If anything goes wrong mid-transfer:
- Transfers can be cancelled within the first 5 days
- Nameservers can be pointed back to GoDaddy at any time
- Email routing can be disabled per-domain in CF Dashboard

---

## ESCAPE TRACKER QUERIES

```sql
-- Update milestone after Step 0
UPDATE escape_milestones SET completed = 1, completed_at = datetime('now'),
  notes = 'COMPLETED — CF login changed to rsplowman@icloud.com'
  WHERE milestone LIKE '%Cloudflare%email%' OR id = 1;

-- Update after auth codes obtained
UPDATE escape_milestones SET completed = 1, completed_at = datetime('now'),
  notes = 'COMPLETED — Auth codes obtained for all 4 domains'
  WHERE id = 4;

-- Update after transfers initiated
UPDATE escape_milestones SET completed = 1, completed_at = datetime('now'),
  notes = 'COMPLETED — Transfers initiated for fishmusicinc.com, noizyfish.com, noizyfish.ca, noizy.ai'
  WHERE id = 6;

-- TOTAL FREEDOM
UPDATE escape_milestones SET completed = 1, completed_at = datetime('now'),
  notes = 'TOTAL FREEDOM — All domains on Cloudflare, GoDaddy closed'
  WHERE id = 13;
```

---

*"We are the new punk rockers: capitalist free thinkers who believe in peace, love, and understanding."*
*— Robert Stephen Plowman, RSP_001*
