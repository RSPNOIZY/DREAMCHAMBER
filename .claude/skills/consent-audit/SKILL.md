---
name: consent-audit
description: "9-point Never Clause audit — MANDATORY before any consent-related deploy. Checks all 9 Never Clauses against live data."
---

# CONSENT AUDIT — Never Clause Enforcement

Use this skill before ANY deploy, code review, or feature addition that touches consent logic, voice data, synthesis requests, or the HVS kernel. This is the security gate of the NOIZY Empire.

## Trigger Phrases

- "audit consent", "check never clauses", "consent review"
- "is this safe to ship?", "security check", "audit before deploy"
- Any PR or code change touching: `src/index.js`, `src/covenant.js`, `schema.sql`, `seed.sql`
- Any new endpoint that handles voice data, synthesis, or tokens

## The 9 Never Clauses (Immovable Law)

| # | Code | Prohibition | Type | Severity |
|---|------|-------------|------|----------|
| 1 | NC_POLITICAL | No political campaigns | Personal | BLOCK |
| 2 | NC_SEXUAL | No adult content | Personal | BLOCK |
| 3 | NC_WEAPONS | No weapons/violence promotion | Personal | BLOCK |
| 4 | NC_DECEPTION | No fraud/impersonation | Personal | BLOCK |
| 5 | NC_HATE | No hate speech | Personal | BLOCK |
| 6 | NC_TRANSFER | No unauthorized transfer | Personal | BLOCK |
| 7 | NC_SURVEILLANCE | No surveillance/biometric ID | Personal | BLOCK |
| 8 | NC_SYSTEM_INTEGRITY | Synthesis requires valid consent token | System | BLOCK |
| 9 | NC_SYSTEM_TRANSFER | DNA non-transferable outside kernel | System | BLOCK |

**ALL are BLOCK severity.** There is no "warn" tier. Violation = immediate rejection + ledger entry.

## 9-Point Covenant Audit Checklist

Run this checklist against any code that touches the consent pipeline:

### 1. Actor Validation
- [ ] Does the code verify the actor exists and `is_active = 1`?
- [ ] Is the actor_id sourced from the authenticated request, not user input?

### 2. Descendant Ownership
- [ ] Does the code verify the descendant belongs to the requesting actor?
- [ ] Is there a JOIN or WHERE clause enforcing `descendants.actor_id = ?`?

### 3. Token Validity
- [ ] Is the consent token checked for expiry (`expires_at > NOW()`)?
- [ ] Is the token checked for revocation status?
- [ ] Is the token scoped correctly (not a wildcard grant)?

### 4. Use Category Match
- [ ] Does the token's `use_category` match the requested operation?
- [ ] Is there a strict enum check (not a substring match)?

### 5. Territory Check
- [ ] Is the request territory validated against the token's territory scope?
- [ ] Does "worldwide" explicitly mean worldwide, not "default"?

### 6. Never Clause Enforcement
- [ ] Are ALL 9 Never Clauses checked BEFORE any synthesis proceeds?
- [ ] Is the check a hard block (not a warning)?
- [ ] Does a violation immediately return 403 with clause details?
- [ ] Is the violation logged to `noizy_ledger`?

### 7. Rate Table Verification
- [ ] Does a rate_table entry exist for the use category?
- [ ] Is the royalty split enforced (75% artist / 25% platform)?

### 8. License Validation
- [ ] If the operation requires a license, is the license checked?
- [ ] Is the licensee active and within their grant scope?

### 9. Ledger Append
- [ ] Is the event logged to `noizy_ledger` AFTER successful processing?
- [ ] Is the ledger insert append-only (no UPDATE, no DELETE)?
- [ ] Does the ledger entry include: actor_id, event_type, details, timestamp?

## Audit Output Format

After running the audit, produce this structured output:

```
CONSENT AUDIT REPORT
====================
Date: [timestamp]
Scope: [what was audited]
Auditor: [agent name]

CHECKLIST:
  [PASS/FAIL] 1. Actor Validation
  [PASS/FAIL] 2. Descendant Ownership
  [PASS/FAIL] 3. Token Validity
  [PASS/FAIL] 4. Use Category Match
  [PASS/FAIL] 5. Territory Check
  [PASS/FAIL] 6. Never Clause Enforcement
  [PASS/FAIL] 7. Rate Table Verification
  [PASS/FAIL] 8. License Validation
  [PASS/FAIL] 9. Ledger Append

FINDINGS:
  [List any failures with file:line references]

VERDICT: SHIP / BLOCK
  [If BLOCK: specific reasons and required fixes]
```

## Code Patterns to Flag

When auditing, grep for these anti-patterns:

```bash
# DANGEROUS: Bypassing Never Clause checks
grep -rn "skip.*never\|bypass.*clause\|disable.*consent" src/

# DANGEROUS: Modifying ledger
grep -rn "UPDATE.*noizy_ledger\|DELETE.*noizy_ledger" src/ schema.sql seed.sql

# DANGEROUS: Hardcoded keys
grep -rn "NOIZY_API_KEY\|sk-ant-\|sk-" src/ --include="*.js"

# DANGEROUS: Wildcard consent
grep -rn "territory.*\*\|use_category.*\*\|scope.*all" src/

# CHECK: All synth paths go through covenant
grep -rn "synth\|synthesis" src/ | grep -v "covenant\|never_clause"
```

## Live Verification Queries

```bash
# Verify all 9 Never Clauses are active
curl -s -H "X-NOIZY-Key: $NOIZY_API_KEY" \
  https://heaven.rsp-5f3.workers.dev/api/v1/never-clauses | \
  jq '[.data[] | select(.is_active == 1)] | length'
# MUST return: 9

# Check for any violations in ledger
curl -s -H "X-NOIZY-Key: $NOIZY_API_KEY" \
  https://heaven.rsp-5f3.workers.dev/api/v1/ledger?event_type=NEVER_CLAUSE_VIOLATION | jq .

# KPI trust score
curl -s -H "X-NOIZY-Key: $NOIZY_API_KEY" \
  https://heaven.rsp-5f3.workers.dev/api/v1/kpi/trust | jq .
```

## Rules

- NEVER approve code that bypasses Never Clause checks
- NEVER approve code that modifies the ledger (UPDATE/DELETE)
- NEVER approve wildcard consent grants
- ALWAYS require all 9 checks to pass before SHIP verdict
- A single FAIL on checks 6-9 = automatic BLOCK
- A single FAIL on checks 1-5 = BLOCK unless there's an explicit, documented reason
