---
name: deployment-critical-path
description: "Binding March 25 to April 17 2026 timeline with daily milestones, blocking prerequisites, and hour-by-hour April 17 session plan"
---

# DEPLOYMENT CRITICAL PATH — March 25 to April 17, 2026

The binding timeline for making NOIZY fully operational. No deviations. No delays. Every item has a deadline, a dependency, and a verification step.

## Trigger Phrases

- "critical path", "April 17 timeline", "what's blocking?", "deployment schedule"
- "what needs to happen next?", "are we on track?", "deadline check"
- Any question about readiness for the April 17 DreamChamber session

## BLOCKING PREREQUISITES (Must clear first)

### Block 0: Cloudflare Login Migration
- **Action**: Change CF login from `rsp@noizyfish.com` to `rsplowman@icloud.com`
- **Where**: Cloudflare Dashboard → Profile → Email Address
- **Why**: If GoDaddy M365 is cancelled before this, ALL Cloudflare access is lost
- **Verification**: Log in with new email, confirm 2FA active
- **Status**: MANUAL ACTION REQUIRED ON GOD.local
- **Blocks**: Everything. This is Step 0.

### Block 1: Heaven Production Deploy
- **Action**: Replace Hello World stub with full 55-endpoint consent kernel
- **Commands**: `npx wrangler deploy` then `bash smoke_test.sh`
- **Verification**: All 14 smoke tests pass, Never Clauses return 9, RSP_001 actor exists
- **Depends on**: Block 0 (CF login must be secure first)

### Block 2: R2 Storage Enablement
- **Action**: Enable Cloudflare R2 in Dashboard
- **Where**: Cloudflare Dashboard → R2 → Enable
- **Why**: Voice DNA storage requires R2 buckets
- **Verification**: `r2_buckets_list` returns success (not 403)
- **Status**: MANUAL ACTION REQUIRED

## WEEK 1: March 25–31 — Foundation

| Day | Task | Skill | Verification |
|-----|------|-------|-------------|
| Mar 25 | Clear Block 0 (CF login) | — | Login with rsplowman@icloud.com |
| Mar 25 | Clear Block 1 (deploy Heaven) | `noizy-deploy` | 14 smoke tests pass |
| Mar 26 | Clear Block 2 (enable R2) | — | R2 API returns 200 |
| Mar 26 | Install MCP server dependencies | `empire-status` | All 9 servers READY |
| Mar 27 | Record first Voice DNA session | `dreamchamber-multimodal` | WAV file in R2 bucket |
| Mar 28 | Wire Kill Switch webhooks | `heaven-dev` | Slack + email on revocation |
| Mar 29 | Run security audit | `consent-audit` | 9/9 PASS, SHIP verdict |
| Mar 30 | Run full empire status check | `empire-status` | All systems GREEN |
| Mar 31 | CHECKPOINT: Foundation complete | — | All blocks cleared |

## WEEK 2: April 1–8 — Creator Onboarding

| Day | Task | Skill | Verification |
|-----|------|-------|-------------|
| Apr 1 | Deploy noizy.ai landing page | `noizy-deploy` | `curl https://noizy.ai` returns 200 |
| Apr 2 | Onboard first test actor (non-RSP) | `onboard-actor` prompt | Actor exists, Never Clauses active |
| Apr 3 | First licensee registration | `heaven-dev` | Licensee in `hvs_licensees` |
| Apr 4 | First synthesis request (test) | `consent-audit` | Covenant passes, C2PA attached |
| Apr 5 | Verify compensation flow | `empire-status` | Ledger entry with rate + royalty |
| Apr 6 | Scale test: 10 actors | `gabriel-ops` | 10 actors, all with Never Clauses |
| Apr 7 | Scale test: 50 actors | `gabriel-ops` | 50 actors, rate limiting holds |
| Apr 8 | CHECKPOINT: Onboarding proven | — | 50 creators registered |

## WEEK 3: April 9–16 — DreamChamber Preparation

| Day | Task | Skill | Verification |
|-----|------|-------|-------------|
| Apr 9 | Audio pipeline end-to-end test | `dreamchamber-multimodal` | 9-channel multitrack records |
| Apr 10 | Agent personality voice tests | `dreamchamber-agent-personalities` | All 9 voices distinct |
| Apr 11 | Sensory environment setup | `dreamchamber-sensory` | 396 Hz confirmed, spatial audio verified |
| Apr 12 | C2PA + watermark pipeline test | `dreamchamber-proof` | Manifest verifiable, watermark detectable |
| Apr 13 | Full dress rehearsal (30 min) | All DreamChamber skills | Complete session, all layers functional |
| Apr 14 | Review rehearsal recording | `dreamchamber-proof` | Verify provenance chain end-to-end |
| Apr 15 | Fix any issues from rehearsal | `consent-audit` + `noizy-deploy` | All fixes deployed and verified |
| Apr 16 | Final security audit | `consent-audit` | SHIP verdict, zero findings |

## APRIL 17, 2026 — THE DAY

```
Timeline (UTC):

13:00  Final systems check (empire-status)
13:30  Audio pipeline warm-up (dreamchamber-multimodal)
13:45  Sensory environment activation (dreamchamber-sensory)
14:00  Three opening breaths — grounding ritual
14:05  Gabriel dispatch: all 9 agents online
14:10  SESSION BEGINS — Robert enters as NV_001
14:10  Opening: The Gathering (history whispers, vortex opens)
14:15  Recognition: 9 agents respond, governance ensemble activates
14:25  Possibility: Consent architecture demonstrated live
14:35  Flow: Multi-agent collaboration at full power
14:40  Elevation: The cathedral moment
14:45  SESSION ENDS — Recording completes
14:50  Watermarks applied (3 layers)
14:55  C2PA manifest generated and signed
15:00  Ledger entry anchored
15:05  Recording published (R2 + backup locations)
15:10  Verification test: external party downloads and verifies
15:15  DONE. NOIZY is operational proof that consent-as-code works.
```

## Success Criteria for April 17

- [ ] All 9 agents respond in distinct voices during session
- [ ] Multitrack recording captures all channels at 48000/32-bit
- [ ] C2PA manifest is cryptographically valid and verifiable
- [ ] Spectral watermark is detectable in the audio
- [ ] Ledger hash anchoring is complete and tamper-proof
- [ ] The recording can be downloaded and verified by a third party
- [ ] RSP_001's consent token covers the session
- [ ] Never Clauses confirmed active (9/9) before, during, and after
- [ ] OAIS/PREMIS archival metadata attached
- [ ] The recording enters the 100-year estate

## Escalation Protocol

- If Block 0 is not cleared by March 27 → ESCALATE (risk of losing CF access)
- If smoke tests fail after deploy → ROLLBACK, do not proceed
- If R2 is not enabled by March 28 → Use local storage as fallback
- If rehearsal on April 13 reveals critical issues → April 14–16 are fix days
- If April 16 audit returns BLOCK → POSTPONE session (integrity over schedule)

## Rules

- NEVER skip the security audit before the April 17 session
- NEVER proceed with a BLOCK verdict from consent-audit
- NEVER compress the timeline by removing verification steps
- The rehearsal on April 13 is NON-NEGOTIABLE
- Every day's task must be verified before marking complete
- Use DAZEFLOW via Lucy to log progress daily
