---
description: Hook and webhook architecture for automated quality, deployment, and event handling.
---

# HOOKS & WEBHOOKS — AUTOMATED EMPIRE

## Claude Code Hooks (Active)

Configured in `.claude/settings.json`. Fire automatically on every session.

### PostToolUse → Format & Lint

Every file Claude edits gets auto-formatted:
- **JS/TS/JSX/TSX**: Prettier + ESLint --fix
- **Python**: Black + isort
- **JSON/CSS/HTML/MD**: Prettier
- Script: `.claude/hooks/format-and-lint.sh`

### SessionStart → Environment Check

Every session start:
- Verifies node_modules exist
- Checks .env is present
- Logs session to audit trail
- Sets NOIZY_PROJECT_ROOT env var
- Script: `.claude/hooks/session-start.sh`

## Future Hooks (to build)

### PreToolUse — Security Gate
- Block any Bash command containing `rm -rf /`, `DROP TABLE`, or `.env` in output
- Block writes to files matching `*.key`, `*.pem`, `*.secret`

### Stop — Session Summary
- On session end, auto-append summary to DAZEFLOW log via Lucy MCP
- Update TASKS.md with completed items

### PostToolUse (Bash) — Deploy Verification
- After any `wrangler deploy`, auto-run smoke tests
- After any `npm start`, auto-check health endpoint

### Notification — Kill Switch Alert
- Webhook to Slack when any consent token is revoked
- Webhook to email (rsplowman@icloud.com) on Never Clause violation

## Heaven Webhooks (to build)

| Event | Webhook Target | Priority |
|-------|---------------|----------|
| Consent token revoked (Kill Switch) | Slack + Email | CRITICAL |
| Never Clause violation | Slack + Ledger | CRITICAL |
| New actor registered | Slack | Normal |
| New licensee onboarded | Slack + Email | Normal |
| Synthesis request completed | Ledger (already done) | Normal |
| Voice DNA uploaded | Slack | Normal |
| Estate event | Email | Normal |

## Heaven Webhook Implementation Pattern

```javascript
// In src/index.js — after any critical event:
async function fireWebhook(event, data) {
    const webhookUrl = env.WEBHOOK_URL; // Slack incoming webhook
    if (!webhookUrl) return;
    await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            event,
            data,
            timestamp: new Date().toISOString(),
            source: 'heaven'
        })
    });
}
```

## Hook Development Rules

- Hooks MUST exit 0 on success (non-zero blocks the action)
- Hooks MUST be fast (< 5 seconds for PostToolUse)
- Hooks MUST NOT expose secrets in stdout/stderr
- Hooks SHOULD be idempotent (safe to re-run)
- Format/lint hooks MUST NOT fail loudly — formatting failures should not block Claude
