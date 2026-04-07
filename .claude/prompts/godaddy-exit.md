# GoDaddy Exit Plan

Migrate all services off GoDaddy M365 dependency. This is a CRITICAL infrastructure task.

## Current State

- Cloudflare login: `rsp@noizyfish.com` (GoDaddy M365 email)
- Target login: `rsplowman@icloud.com`
- If M365 is cancelled before migration → **TOTAL LOSS OF CLOUDFLARE ACCESS**

## Step 0: Change Cloudflare Login (BLOCKING)

**This must happen FIRST. Nothing else can proceed until this is done.**

1. Log into Cloudflare Dashboard at `dash.cloudflare.com`
2. Go to: Profile → Email Address
3. Change from `rsp@noizyfish.com` to `rsplowman@icloud.com`
4. Verify the email change (check rsplowman@icloud.com inbox)
5. Confirm you can log in with the new email
6. Enable 2FA if not already active

**STATUS**: Manual action required on GOD.local browser.

## Step 1: Domain Transfer

- Transfer `noizylab.ca` and any other domains from GoDaddy to Cloudflare Registrar
- Verify DNS records are preserved during transfer
- Test: `dig noizylab.ca` should return Cloudflare nameservers

## Step 2: Email Migration

- Set up email forwarding or new email service for any `@noizyfish.com` addresses in use
- Update all service registrations that use GoDaddy email
- Verify: all critical accounts use `rsplowman@icloud.com`

## Step 3: Cancel M365

Only after Steps 0-2 are complete and verified:
- Cancel GoDaddy M365 subscription
- Verify no remaining dependencies on `@noizyfish.com` email

## Step 4: Cancel GoDaddy

- Cancel remaining GoDaddy services
- Download any remaining data/backups
- Verify all domains transferred successfully

## Verification

After each step, run the empire-status skill to confirm nothing broke.

## Tracking

D1 database `dfe9343e` contains the GoDaddy escape tracker data.
