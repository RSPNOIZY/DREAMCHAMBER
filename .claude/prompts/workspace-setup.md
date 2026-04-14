# GOOGLE WORKSPACE SETUP — noizy.ai

**Target:** `rsp@noizy.ai` becomes the primary Google Workspace mailbox for `noizy.ai` domain. Current Cloudflare Email Routing for that address is replaced.

**Authority:** RSP_001 — Robert Stephen Plowman
**Drafted:** 2026-04-13 (4 days to April 17 deadline)

---

## WHY THIS RUNBOOK EXISTS

Workspace domain verification, DKIM key generation, and admin console clicks require a logged-in human. GABRIEL cannot execute these steps. Everything I *can* pre-compute is below — you execute the auth-gated clicks, paste the values I give you, and ping me when each phase is done.

---

## DECISIONS YOU NEED TO MAKE (3)

| # | Decision | My recommendation |
|---|----------|-------------------|
| 1 | **Workspace plan** | **Business Starter** ($7/user/mo CAD ~$10) — 30GB, video calls, custom email. Upgrade later if needed. |
| 2 | **Existing Workspace or fresh?** | If `rsp@noizy.ai` GCP project `noizy-ai-347463` uses a personal Gmail admin, DO NOT reuse it. **Fresh Workspace.** Primary admin = `rsp@noizy.ai`. |
| 3 | **What to do with existing `rsplowman@icloud.com` routing** | **Keep as recovery address** in Workspace. Don't delete the iCloud account. |

Answer these three, and we proceed.

---

## PHASE 0 — PRE-FLIGHT (you verify before starting)

- [ ] `noizy.ai` is at Cloudflare (✅ verified by GABRIEL 2026-04-13)
- [ ] Currently on Cloudflare Email Routing (✅ verified — MX: route1/2/3.mx.cloudflare.net)
- [ ] Current SPF: `v=spf1 include:_spf.mx.cloudflare.net ~all` (✅ will be replaced)
- [ ] No critical in-flight email expected in next 30 min (cutover window)
- [ ] You have access to Cloudflare dashboard for `noizy.ai` zone

---

## PHASE 1 — WORKSPACE SIGNUP (5 min, your hands)

1. Open: https://workspace.google.com/business/signup
2. Business name: **NOIZY Labs** (or **NOIZY Fish Inc.**)
3. Employees: **Just you**
4. Country: **Canada**
5. Current email: `rsplowman@icloud.com` (recovery)
6. "Does your business have a domain?" → **Yes** → enter `noizy.ai`
7. Create admin username: `rsp` → full email becomes `rsp@noizy.ai`
8. Complete signup, billing details

**Output:** Google prompts you to verify `noizy.ai`. Admin console URL: `admin.google.com`

---

## PHASE 2 — DOMAIN VERIFICATION (2 min)

Google gives you a TXT record like: `google-site-verification=AbCdEfGhIjKl...`

**Add to Cloudflare DNS (zone: noizy.ai):**

| Type | Name | Content | TTL | Proxy |
|------|------|---------|-----|-------|
| TXT | `@` (or `noizy.ai`) | `google-site-verification=<value-from-google>` | Auto | DNS only |

Click **Verify** in Google admin console.

---

## PHASE 3 — CREATE MAILBOX (1 min)

In admin.google.com → Users → you should already see `rsp@noizy.ai` as super admin. If not, Add User:

- Primary email: `rsp@noizy.ai`
- Secondary recovery: `rsplowman@icloud.com`
- Role: Super Admin

---

## PHASE 4 — EMAIL CUTOVER (CRITICAL — 10 min window)

**⚠️ Between step 4a and step 4d, any email to `rsp@noizy.ai` may bounce. Execute these in fast sequence.**

### 4a. Remove Cloudflare Email Routing rules for noizy.ai

Cloudflare Dashboard → `noizy.ai` zone → **Email** → **Routing Rules**

- Disable rule: `rsp@noizy.ai → rsplowman@icloud.com`
- Disable "catch-all" if enabled
- **Do NOT turn off Email Routing at the zone level yet** — we'll delete its MX records manually in 4b

### 4b. Delete existing MX records

Cloudflare Dashboard → `noizy.ai` → **DNS**

Delete all three current MX records:
- `16 route2.mx.cloudflare.net`
- `59 route1.mx.cloudflare.net`
- `63 route3.mx.cloudflare.net`

### 4c. Add Google MX records

| Type | Name | Priority | Content | TTL | Proxy |
|------|------|----------|---------|-----|-------|
| MX | `@` | 1 | `ASPMX.L.GOOGLE.COM` | Auto | DNS only |
| MX | `@` | 5 | `ALT1.ASPMX.L.GOOGLE.COM` | Auto | DNS only |
| MX | `@` | 5 | `ALT2.ASPMX.L.GOOGLE.COM` | Auto | DNS only |
| MX | `@` | 10 | `ALT3.ASPMX.L.GOOGLE.COM` | Auto | DNS only |
| MX | `@` | 10 | `ALT4.ASPMX.L.GOOGLE.COM` | Auto | DNS only |

### 4d. Replace SPF record

Find the existing TXT record: `v=spf1 include:_spf.mx.cloudflare.net ~all`

**Replace with:**
```
v=spf1 include:_spf.google.com ~all
```

---

## PHASE 5 — DELIVERABILITY ARMOR (5 min)

### 5a. Enable DKIM in Workspace

admin.google.com → Apps → Google Workspace → Gmail → **Authenticate email**

- Select domain: `noizy.ai`
- Click **Generate new record**
- Key bit length: **2048**
- Prefix: `google`

Google gives you a TXT record. Add to Cloudflare:

| Type | Name | Content | TTL | Proxy |
|------|------|---------|-----|-------|
| TXT | `google._domainkey` | `v=DKIM1; k=rsa; p=<long-key-from-google>` | Auto | DNS only |

Wait 5 min for DNS propagation, then click **Start authentication** in Google.

### 5b. Add DMARC record

| Type | Name | Content | TTL | Proxy |
|------|------|---------|-----|-------|
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:rsp@noizy.ai; pct=100; adkim=s; aspf=s` | Auto | DNS only |

**Why quarantine, not reject:** start gentle, monitor rua reports for 2 weeks, then tighten to `p=reject` once clean.

---

## PHASE 6 — SMOKE TESTS (5 min)

From an external email (personal Gmail, iCloud, etc.):

- [ ] Send to `rsp@noizy.ai` → arrives in Gmail inbox
- [ ] Reply from `rsp@noizy.ai` → lands in external inbox (not spam)
- [ ] Check `https://mxtoolbox.com/SuperTool.aspx?action=mx%3anoizy.ai` → Google MX records showing
- [ ] Check SPF, DKIM, DMARC at `https://mxtoolbox.com/EmailHealth/noizy.ai`

---

## PHASE 7 — DOCTRINE SYNC (GABRIEL executes)

Once Phase 6 passes, GABRIEL updates:

1. `.claude/rules/contact.md` — Email routing section: Cloudflare Routing → Google Workspace
2. `CLAUDE.md` — Contact references
3. `RELEASE.md` — Infrastructure inventory
4. Close out BLOCK 0 email-routing sub-item for `noizy.ai`

---

## ROLLBACK (if something breaks)

- **Bouncing email?** Re-enable Cloudflare Email Routing rule, restore old MX records. Cloudflare DNS propagation is 30–60s.
- **Can't verify domain?** Most common cause: existing CAA or conflicting TXT. Check DNS Settings → CAA records.
- **DKIM failing?** Wait 24 hours. DNS caches at relay hops can be stubborn.

---

## OPEN QUESTION: Other domains

This runbook covers `noizy.ai` only. Parallel plans needed for:

- **noizyfish.com** — currently on Cloudflare Email Routing, also needs Workspace? (separate Workspace tenant, OR secondary domain under same tenant)
- **noizyvox.com** — currently no MX. Workspace candidate.
- **noizyfish.ca** — still at GoDaddy per BLOCK 0. Transfer first.

**Recommendation:** Add `noizyfish.com` and `noizyvox.com` as **secondary domains** under the same Workspace tenant (Business Starter supports multiple domains). Saves cost, unified admin. One tenant, three mailboxes:
- `rsp@noizy.ai` (primary)
- `rsp@noizyfish.com` (secondary)
- `rsp@noizyvox.com` (secondary, once zone is on correct CF account)

---

_Standing by. Ping GABRIEL when Phase 1 is done, we go phase-by-phase._
