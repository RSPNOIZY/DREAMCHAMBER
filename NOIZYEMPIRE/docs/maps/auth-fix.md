# Cloudflare Auth Fix

## Problem
Multiple accounts trying to access Cloudflare:
- rsp@noisyfish.com (Google)
- rsplowman@icloud.com (iCloud)

## Solution

### Option 1: Clear All Auth & Login Fresh
```bash
# Clear all Cloudflare credentials
rm -rf ~/.wrangler
rm -rf ~/Library/Preferences/.wrangler

# Login with the account that has D1 access
wrangler login
```

### Option 2: Use API Token (Recommended)
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Create token with permissions:
   - D1:Edit
   - Workers Scripts:Edit
   - Workers KV Storage:Edit
3. Set environment variable:
```bash
export CLOUDFLARE_API_TOKEN="your-token-here"
```

### Option 3: Local Development First
```bash
# Test everything locally without auth
cd /Users/m2ultra/NOIZYANTHROPIC/NOIZYLAB/noisy-proof
chmod +x local-deploy.sh
./local-deploy.sh
```

## Which Account to Use?
Check which account has:
- D1 database access
- Workers subscription
- Custom domains (proof.noisy.io)

That's the one to authenticate with.
