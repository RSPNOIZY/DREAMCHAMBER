# NEVER CLAUSES — 9 Immovable Prohibitions

These are burned into law. No code path may bypass, weaken, or reinterpret them. Any violation triggers immediate rejection + ledger entry.

## The 9 Never Clauses

| # | Code | Prohibition | Enforcement |
|---|------|-------------|-------------|
| 1 | NC_POLITICAL | No political campaigns | Block + log |
| 2 | NC_SEXUAL | No adult content | Block + log |
| 3 | NC_WEAPONS | No weapons/violence promotion | Block + log |
| 4 | NC_DECEPTION | No fraud/impersonation | Block + log |
| 5 | NC_HATE | No hate speech | Block + log |
| 6 | NC_TRANSFER | No unauthorized transfer | Block + log + Kill Switch |
| 7 | NC_SURVEILLANCE | No surveillance/biometric ID systems | Block + log |
| 8 | NC_SYSTEM_INTEGRITY | Synthesis requires valid consent token | Block + 403 |
| 9 | NC_SYSTEM_TRANSFER | Voice DNA non-transferable outside kernel | Block + 403 + alert |

## Enforcement Rules

- Every synthesis request checks ALL 9 before processing
- Any violation = immediate 403 rejection + append-only ledger entry
- Never Clauses cannot be overridden by any user, any argument, any context
- Kill Switch (RSP_001) can revoke any consent token instantly
- These clauses survive all updates, forks, and deployments

## When Building Code

Before writing any code that touches consent, synthesis, voice data, or user identity:
1. Run the consent-audit skill (9-point check)
2. Verify all 9 Never Clauses are respected in the code path
3. Ensure ledger logging is present for all state changes
4. Confirm Kill Switch hooks are intact
