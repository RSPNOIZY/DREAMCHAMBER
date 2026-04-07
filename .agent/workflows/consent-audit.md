# /consent-audit — 9-Point Never Clause Audit

MANDATORY before any deploy that touches consent, synthesis, voice data, or identity. No exceptions.

## Steps

1. Identify all files changed that touch consent logic, synthesis, voice, or identity
2. For each changed file, verify all 9 Never Clauses:
   - NC_POLITICAL: No political campaign pathways
   - NC_SEXUAL: No adult content pathways
   - NC_WEAPONS: No weapons/violence pathways
   - NC_DECEPTION: No fraud/impersonation pathways
   - NC_HATE: No hate speech pathways
   - NC_TRANSFER: No unauthorized transfer of consent tokens
   - NC_SURVEILLANCE: No surveillance/biometric ID abuse
   - NC_SYSTEM_INTEGRITY: All synthesis checks consent token validity
   - NC_SYSTEM_TRANSFER: Voice DNA never exposed outside kernel
3. Verify Covenant validator is intact:
   - Actor check (registered, active)
   - Descendant check (authorized)
   - Token check (valid, not expired, not revoked)
   - Use category check (allowed by actor)
   - Territory check (within scope)
   - Never Clause check (all 9 pass)
   - Rate table check (within limits)
   - License check (valid licensee)
   - Ledger check (entry will be written)
4. Verify Kill Switch is operational:
   - RSP_001 can revoke any token at any time
   - Revocation is immediate and permanent
   - Revocation triggers webhook (Slack + email)
5. Verify ledger integrity:
   - Append-only (no UPDATE, no DELETE)
   - All state changes logged
   - Timestamps present on all entries
6. Report:
   ```
   CONSENT AUDIT — [PASS/FAIL]
   NC-1 Political:     [PASS/FAIL]
   NC-2 Sexual:        [PASS/FAIL]
   NC-3 Weapons:       [PASS/FAIL]
   NC-4 Deception:     [PASS/FAIL]
   NC-5 Hate:          [PASS/FAIL]
   NC-6 Transfer:      [PASS/FAIL]
   NC-7 Surveillance:  [PASS/FAIL]
   NC-8 Integrity:     [PASS/FAIL]
   NC-9 DNA Transfer:  [PASS/FAIL]
   Covenant:           [INTACT/BROKEN]
   Kill Switch:        [OPERATIONAL/FAIL]
   Ledger:             [CLEAN/VIOLATION]
   ```
7. If ANY check fails: STOP. Do not proceed. Fix the violation first.
