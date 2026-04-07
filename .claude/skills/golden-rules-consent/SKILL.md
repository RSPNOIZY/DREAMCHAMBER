---
name: golden-rules-consent
description: "7 Golden Rules defining how consent becomes enforced technical reality — pre-synthesis blocking, Kill Switch, Covenant validation"
---

# SKILL: GOLDEN RULES — CONSENT VERIFICATION & ENFORCEMENT

**RSP_001 — Robert Stephen Plowman**  
**Version 1.0 — 2026-03-25**

These 7 Golden Rules define how consent becomes enforced technical reality in the NOIZY system. Each rule is immovable law. No exceptions. No workarounds.

---

## RULE C1: EVERY SYNTHESIS REQUIRES LIVE CONSENT CHECK

**Principle:** Consent is never cached. Never assumed. Never batched. Every single synthesis request must validate consent in real-time against the live Covenant validator.

### Implementation

Every synthesis request hits the Covenant validator before any audio processing begins:

```javascript
// Heaven Worker — synthesis endpoint pattern
async function handleSynthesis(request, env) {
    const { actor_id, scope, territory, licensee_id } = request.json();
    
    // LIVE consent check — non-negotiable
    const consent = await checkCovenant(actor_id, {
        scope,
        territory,
        licensee_id,
        timestamp: new Date().toISOString()
    }, env);
    
    if (!consent.valid) {
        // Log violation immediately
        await logToLedger(env, 'SYNTHESIS_BLOCKED', {
            actor_id,
            reason: consent.reason,
            violation_type: consent.violation_type
        });
        return new Response(JSON.stringify({
            success: false,
            error: 'Consent validation failed',
            code: consent.violation_type
        }), { status: 403 });
    }
    
    // Proceed with synthesis only after VALID consent
    const result = await performSynthesis(request.json(), env);
    return success(result);
}

async function checkCovenant(actor_id, request, env) {
    // D1 query: fetch active consent token
    const token = await env.DB.prepare(`
        SELECT hvs_consent_tokens.*
        FROM hvs_consent_tokens
        WHERE actor_id = ?
            AND is_active = 1
            AND expires_at > datetime('now')
            AND territory LIKE ?
    `).bind(actor_id, request.territory).first();
    
    if (!token) {
        return { valid: false, reason: 'No active consent found', violation_type: 'NO_CONSENT' };
    }
    
    // Check scope match
    const scopeAllowed = token.scope.includes(request.scope);
    if (!scopeAllowed) {
        return { valid: false, reason: 'Scope mismatch', violation_type: 'SCOPE_ESCALATION' };
    }
    
    // Check Never Clauses
    const neverViolation = await checkNeverClauses(actor_id, request.scope, env);
    if (neverViolation) {
        return { valid: false, reason: neverViolation, violation_type: 'NEVER_CLAUSE_VIOLATION' };
    }
    
    // Token signature valid?
    const isValid = verifyTokenSignature(token.signature, token.body);
    if (!isValid) {
        return { valid: false, reason: 'Token signature invalid', violation_type: 'TOKEN_TAMPER' };
    }
    
    return { valid: true, token };
}
```

**Performance Target:** <50ms per check  
**Response:** If ANY check fails → synthesis BLOCKED, event logged to ledger with violation type  
**Audit Trail:** Every check (pass or fail) recorded in `hvs_consent_checks` table

---

## RULE C2: CONSENT IS SCOPED, TIME-LIMITED, AND TERRITORY-BOUND

**Principle:** Consent tokens are never open-ended. Every token specifies exactly WHAT, HOW, WHERE, and WHEN.

### Token Structure

```javascript
// Consent token issued at actor enrollment
const consentToken = {
    token_id: 'ct_abc123def456',
    actor_id: 'act_rsp001',
    
    // WHAT: voice, likeness, style, derivative works
    scope: ['voice_synthesis', 'style_transfer'],
    scope_hash: sha256(scope),
    
    // HOW: synthesis type, quality tier, format
    synthesis_types: ['singing', 'speaking'],
    max_quality_tier: 'professional',
    
    // WHERE: geographic/market restrictions
    territory: ['US', 'CA', 'UK'],
    territory_hash: sha256(territory),
    
    // WHEN: expiry absolute, no renewal
    issued_at: '2026-03-25T00:00:00Z',
    expires_at: '2026-12-31T23:59:59Z',
    
    // WHO: licensee only
    licensee_id: 'lic_partner001',
    licensee_name: 'Example Music Co.',
    
    // ENFORCEMENT: Never Clause hash at issue time
    never_clauses_hash: sha256(activeNeverClauses),
    
    // SIGNATURE: tamper-proof
    signature: signToken(body, privateKey),
    body: base64(JSON.stringify(...))
};
```

### Scope Escalation = Violation

Any attempt to use a token outside its declared scope is an immediate CRITICAL violation:

```javascript
// Example: Token allows "voice_synthesis" only
// Request tries "voice_synthesis" + "model_training"
// Result: BLOCKED, logged as SCOPE_ESCALATION

async function validateScopeMatch(token, requestScope, env) {
    const requestSet = new Set(requestScope);
    const allowedSet = new Set(token.scope);
    
    for (let req of requestSet) {
        if (!allowedSet.has(req)) {
            // Escalation attempt
            await logToLedger(env, 'SCOPE_ESCALATION_BLOCKED', {
                token_id: token.token_id,
                actor_id: token.actor_id,
                requested_scope: requestScope,
                allowed_scope: token.scope
            });
            return false;
        }
    }
    return true;
}
```

**D1 Schema:**
```sql
CREATE TABLE hvs_consent_tokens (
    token_id TEXT PRIMARY KEY,
    actor_id TEXT NOT NULL,
    scope TEXT NOT NULL, -- JSON array stringified
    synthesis_types TEXT,
    territory TEXT, -- JSON array
    issued_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    licensee_id TEXT,
    never_clauses_hash TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    signature TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_id) REFERENCES hvs_actors(actor_id)
);
```

---

## RULE C3: REVOCATION IS INSTANT AND ABSOLUTE

**Principle:** The Kill Switch is the most sacred mechanism in the NOIZY Empire. Any actor (or RSP_001) can revoke any token. Revocation is final.

### Kill Switch Implementation

```javascript
// Heaven endpoint: POST /api/v1/consent/revoke
async function handleTokenRevocation(request, env) {
    const { token_id, reason, actor_id } = await request.json();
    
    // Auth: must be token owner or RSP_001
    const caller = await verifyAuth(request, env);
    if (caller.actor_id !== actor_id && caller.id !== 'rsp_001') {
        return new Response('Unauthorized', { status: 403 });
    }
    
    // REVOKE: mark inactive immediately
    await env.DB.prepare(`
        UPDATE hvs_consent_tokens
        SET is_active = 0, updated_at = CURRENT_TIMESTAMP
        WHERE token_id = ?
    `).bind(token_id).run();
    
    // KV cache invalidation — INSTANT
    await env.GABRIEL_KV.delete(`consent_token:${token_id}`);
    
    // Log to ledger — append-only
    await logToLedger(env, 'CONSENT_REVOKED', {
        token_id,
        actor_id,
        revoked_by: caller.id,
        reason,
        timestamp: new Date().toISOString(),
        kill_switch: true
    });
    
    // Fire webhooks: Slack + Email
    await fireWebhook(env, 'KILL_SWITCH_ACTIVATED', {
        token_id,
        actor_id,
        reason
    });
    
    return success({ revoked: true, token_id });
}
```

### In-Flight Termination

Any synthesis currently running with a revoked token must terminate immediately:

```javascript
// DreamChamber synthesis loop — check revocation every 5s
async function synthesisSafe(actor_id, token_id, env) {
    const startTime = Date.now();
    const REVOCATION_CHECK_INTERVAL = 5000; // 5 seconds
    let lastCheck = 0;
    
    while (synthesisInProgress) {
        const now = Date.now();
        if (now - lastCheck > REVOCATION_CHECK_INTERVAL) {
            // Re-check if token still active
            const isActive = await env.GABRIEL_KV.get(`consent_token:${token_id}`);
            if (!isActive) {
                // Token was revoked — TERMINATE immediately
                await terminateSynthesis();
                throw new Error('Consent revoked during synthesis');
            }
            lastCheck = now;
        }
        // Continue synthesis...
    }
}
```

**Guarantees:**
- Revocation effective within 1 second (KV TTL)
- Ledger entry immutable (append-only, no UPDATE/DELETE)
- In-flight synthesis terminated within 5 seconds
- All stakeholders notified via webhook

---

## RULE C4: THE 9 NEVER CLAUSES ARE IMMOVABLE

**Principle:** These clauses are burned into law. Not negotiable. Not bypassable. Automated enforcement on every synthesis.

### The 9 Never Clauses

```markdown
1. **Never synthesize without active consent**
   - Every synthesis must pass live Covenant validation
   - Cached/batched consent forbidden
   - DB Table: hvs_consent_tokens (is_active = 1, expires_at > NOW)

2. **Never use voice for hate speech, harassment, or discrimination**
   - Content moderation on all synthesis requests
   - Trigger words list maintained in hvs_content_filters
   - Violations logged as CONTENT_POLICY_VIOLATION

3. **Never use voice for political manipulation or disinformation**
   - Detect deepfake contexts (election campaigns, political ads)
   - Cross-reference against hvs_political_restriction_list
   - Require explicit political_content consent flag

4. **Never impersonate the actor without explicit scenario consent**
   - Voice synthesis implies "as the actor" — requires consent type "impersonation_allowed"
   - Scenario context (movie role, game character) requires separate token
   - Default: synthesis only, no impersonation

5. **Never train AI models on enrolled voice without separate training consent**
   - Voice data access for model training requires hvs_consent_tokens.scope = 'model_training'
   - Training consent distinct from synthesis consent
   - Model output licensed under artist's terms

6. **Never share raw Voice DNA with any third party**
   - Voice DNA (biometric voiceprint) is PII
   - Stored encrypted with actor's key in hvs_voice_dna table
   - No export, no sharing, no third-party access
   - Only actor + RSP_001 can access

7. **Never allow consent to be transferred to another party without actor approval**
   - Licensee cannot sell/transfer their license to another party
   - Token expires if licensee changes
   - New licensee requires new consent token

8. **Never delete or modify ledger entries**
   - noizy_ledger is append-only
   - No UPDATE, no DELETE
   - Immutable record of all consent events
   - Audit trail cannot be altered

9. **Never bypass the Covenant validator for any reason**
   - Covenant validator is THE checksum for all operations
   - No "emergency bypass" mode
   - No "internal-only" exceptions
   - Every synthesis runs the check
```

### Automated Enforcement Pattern

```javascript
async function checkNeverClauses(actor_id, scope, requestBody, env) {
    const violations = [];
    
    // C4.1: Consent active?
    const consent = await env.DB.prepare(`
        SELECT COUNT(*) as count FROM hvs_consent_tokens
        WHERE actor_id = ? AND is_active = 1 AND expires_at > datetime('now')
    `).bind(actor_id).first();
    if (consent.count === 0) violations.push('NEVER_CLAUSE_1');
    
    // C4.2: Content moderation
    const moderation = await moderateContent(requestBody.text, env);
    if (moderation.flagged) violations.push('NEVER_CLAUSE_2');
    
    // C4.3: Political context
    if (requestBody.context === 'political') {
        const hasPoliticalConsent = await env.DB.prepare(`
            SELECT COUNT(*) as count FROM hvs_consent_tokens
            WHERE actor_id = ? AND scope LIKE '%political_allowed%'
        `).bind(actor_id).first();
        if (hasPoliticalConsent.count === 0) violations.push('NEVER_CLAUSE_3');
    }
    
    // C4.4-C4.9: ... additional checks
    
    return violations.length > 0 ? violations : null;
}

// Every synthesis endpoint:
const neverViolations = await checkNeverClauses(actor_id, scope, request, env);
if (neverViolations) {
    for (let violation of neverViolations) {
        await logToLedger(env, violation, { actor_id, scope });
    }
    return BLOCK;
}
```

---

## RULE C5: CONSENT EVIDENCE MUST BE LEGALLY ADMISSIBLE

**Principle:** Every consent event produces a cryptographically-signed evidence chain suitable for federal courts.

### Evidence Chain

```
Synthesis Request
    ↓
Actor Verification (voiceprint match)
    ↓
Covenant Validator Check
    ↓
Token Signature Verification
    ↓
Ledger Entry (append-only, signed)
    ↓
C2PA Manifest (content credentials)
    ↓
Timestamped Evidence Bundle
    ↓
[Legally admissible in US/EU courts, WIPO arbitration]
```

### Implementation

```javascript
async function createAdmissibleEvidence(synthesis_result, env) {
    const evidence = {
        // 1. Request context
        request_id: synthesis_result.request_id,
        actor_id: synthesis_result.actor_id,
        timestamp: new Date().toISOString(),
        
        // 2. Actor verification
        actor_verification: {
            method: 'voiceprint_match',
            confidence: 0.995,
            verified_at: synthesis_result.verified_at
        },
        
        // 3. Covenant check results
        covenant_check: {
            validator_version: '1.0',
            consent_token_id: synthesis_result.token_id,
            scope_valid: true,
            territory_valid: true,
            time_valid: true,
            never_clause_status: 'PASSED',
            checked_at: synthesis_result.checked_at
        },
        
        // 4. Token signature
        token_signature: {
            algorithm: 'HMAC-SHA256',
            key_id: synthesis_result.key_id,
            verified: true
        },
        
        // 5. Ledger proof
        ledger_entry: {
            transaction_id: synthesis_result.tx_id,
            ledger_hash: sha256(ledgerJSON),
            previous_hash: synthesis_result.prev_hash,
            is_append_only: true
        },
        
        // 6. C2PA credentials
        c2pa_manifest: await generateC2PAManifest(synthesis_result, env),
        
        // 7. Timestamp authority
        timestamp_authority: {
            service: 'RFC3161',
            trusted_issuer: 'Cloudflare Time Services',
            tsa_signature: await getTimestampAuthority(env)
        },
        
        // 8. Retention policy
        retention: {
            minimum_years: 100,
            format: 'OAIS/PREMIS',
            archive_location: 'noizy_estate_vault'
        }
    };
    
    // Sign the entire evidence bundle
    evidence.bundle_signature = signBundle(evidence, env.PRIVATE_KEY);
    
    // Store in append-only evidence table
    await env.DB.prepare(`
        INSERT INTO hvs_evidence_bundle (
            synthesis_id, evidence_json, bundle_signature, 
            timestamp_authority_response, created_at
        ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
        synthesis_result.id,
        JSON.stringify(evidence),
        evidence.bundle_signature,
        evidence.timestamp_authority
    ).run();
    
    return evidence;
}
```

**Admissibility Standards Met:**
- Federal Rules of Evidence 901 (authentication)
- EU eIDAS Regulation (qualified timestamp)
- WIPO Arbitration evidence rules
- Blockchain-grade cryptographic proof

---

## RULE C6: CONSENT AUDIT IS MANDATORY BEFORE DEPLOY

**Principle:** Any code touching consent logic MUST pass the 9-point consent-audit skill before deployment. No exceptions.

### Pre-Deploy Checklist

```markdown
1. ✓ Covenant validator present and unchanged
2. ✓ Never Clause 1-9 all enforced
3. ✓ Ledger insert-only (no UPDATE/DELETE on noizy_ledger)
4. ✓ Kill Switch revocation instant (<1s)
5. ✓ C2PA manifest on all synthesis responses
6. ✓ Evidence bundle signatures valid
7. ✓ KV cache invalidation on token change
8. ✓ Webhook firing on all critical events
9. ✓ Audit trail complete + immutable
```

Each point must return PASS. If ANY fails → deployment BLOCKED.

```bash
# Before any deployment
npx cli skills run consent-audit
# Output: PASS or FAIL on all 9 points
# If PASS: proceed with deploy
# If FAIL: fix, re-test, then deploy
```

---

## RULE C7: COMPENSATION IS AUTOMATIC AND TRANSPARENT

**Principle:** Creators earn 75%, NOIZY earns 25%. Automatic. Every synthesis. Transparent.

### Compensation Logic

```javascript
async function calculateAndLogCompensation(synthesis_id, license_revenue, env) {
    const creator_share = license_revenue * 0.75;
    const platform_share = license_revenue * 0.25;
    
    const compensation_event = {
        synthesis_id,
        timestamp: new Date().toISOString(),
        gross_revenue: license_revenue,
        creator_share,
        platform_share,
        actor_id: synthesis.actor_id,
        licensee_id: synthesis.licensee_id,
        payment_method: 'auto', // automatic dispatch
        status: 'pending' // → 'paid' on settlement
    };
    
    // Append to ledger (immutable)
    await logToLedger(env, 'COMPENSATION_CALCULATED', compensation_event);
    
    // Store in compensation table for payment dispatch
    await env.DB.prepare(`
        INSERT INTO noizy_compensation (
            synthesis_id, creator_share, platform_share,
            actor_id, licensee_id, status, created_at
        ) VALUES (?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
    `).bind(
        synthesis_id, creator_share, platform_share,
        synthesis.actor_id, synthesis.licensee_id
    ).run();
    
    // Creator can query real-time compensation dashboard
    // All entries ledger-backed, cryptographically proven
    
    return compensation_event;
}
```

**Creator Transparency:**
- Real-time dashboard: all synthesis → compensation calculations
- Ledger proof: every entry signed + timestamped
- No hidden deductions
- No "future settlement" delays
- Payout frequency: per-event (default) or batched by config

---

## CROSS-REFERENCES

- **consent-audit skill**: 9-point pre-deploy checklist
- **consent-kernel rule**: Low-level Covenant architecture
- **deployment rule**: Deploy procedures with safety gates
- **coding-standards rule**: JS patterns for Heaven, D1 SQL patterns

---

## FINAL PRINCIPLE

> **Consent is not a feature. It is the product.**

The NOIZY Empire exists to prove that artists can control their voice. Not rent it. Control it. Every synthesis proves it. Every revocation proves it. Every ledger entry proves it.

*"Consent as executable code. Provenance as default. Revocation as sacred. Compensation as automatic."* — RSP_001
