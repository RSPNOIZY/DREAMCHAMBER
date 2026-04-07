# Community Feedback Architecture

## Summary

This document defines how NOIZY products should learn from communities without exploiting them.

It covers:

- caregiver feedback
- creator feedback
- buyer feedback
- moderation review
- research opt-in

## Purpose

The system should not guess blindly about safety, comfort, or misuse.

It should learn through explicit, bounded, human-readable feedback loops.

## Roles

### Caregiver Or Guardian

Can report:

- calmer
- same
- activated
- overload
- trigger tags
- notes

### Artist

Can review:

- usage receipts
- context matches
- safety flags against their voice
- revocation actions

### Buyer

Can report:

- quality issues
- license questions
- use-case mismatches

### Safety Reviewer

Can:

- triage incident clusters
- pause content
- require QA review
- escalate to advisory review

### Advisory Circle

Handles:

- pattern review
- governance updates
- high-sensitivity edge cases

## Feedback Objects

### Session Feedback

Fields:

- `product`
- `session_id`
- `outcome`
- `trigger_tags`
- `stopped_early`
- `notes`

### Voice Safety Flag

Fields:

- `voice_id`
- `report_type`
- `severity`
- `common_tags`
- `status`

### License Misuse Report

Fields:

- `voice_id`
- `buyer_id`
- `alleged_context`
- `evidence_notes`
- `status`

### Research Opt-In Record

Fields:

- `participant_role`
- `shared_signal_types`
- `joined_at`
- `withdrawn_at`

## Product Loops

### 1. Calm Studio Safety Loop

Session -> caregiver check-in -> pattern suppression or safer recommendation -> visible explanation.

### 2. Regulation Voice Quality Loop

Voice use -> feedback or flags -> QA review -> profile patch, restriction, or pause.

### 3. Governance Loop

Incident clusters -> reviewer decision -> decision log -> creator-visible rationale.

### 4. Research Loop

Optional anonymized outcome signals -> aggregate analysis -> safer defaults and public evidence updates.

## Data Boundaries

- no raw child audio shared by default
- no hidden research enrollment
- aggregated patterns only when explicitly opted in
- delete and export controls must be present

## Moderation Console Requirements

The console should support:

- incident intake
- triage queues
- flagged voice review
- clustered trigger views
- decisions log
- advisory escalation

Every moderation action should require a human-readable reason.

## Success Condition

Community learning is working when the system gets safer and clearer over time without turning participants into silent data exhaust.
