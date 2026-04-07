# Sovereign Voice Network

## Summary

The Sovereign Voice Network is a premium voice-actor collective where each approved human voice actor owns, governs, and monetizes their own AI twin.

It combines:

- live directed performance
- creative transmission and first-take capture
- versioned voice assets and take history
- governed AI-twin licensing
- transparent recurring payouts
- community reputation and mentorship

Companion visual blueprint:

- [sovereign-voice-blueprint.md](./sovereign-voice-blueprint.md)
- [sovereign-voice-local-direction-hub.md](./sovereign-voice-local-direction-hub.md)

This is not a faceless voice library.

It is a source-managed voice ecosystem:

- the human is the entry point
- the actor controls the twin
- the platform curates trusted people, not anonymous output

## Core Thesis

The differentiator is not just better voice cloning.

The differentiator is that every licensed AI voice remains under the authority of the voice actor who created it.

The buyer is not buying access to a detached model.
They are buying access to a governed creative source.

## Positioning

### What It Is

- a curated collective of approved voice actors
- a creator-owned voice library
- a managed AI twin network
- a premium marketplace for voice licensing and directed performance

### What It Is Not

- a generic voice clone marketplace
- a platform that strips the performer from the model
- a bulk race-to-the-bottom asset catalog

## Product Pillars

### 1. Human Approval Layer

The platform approves human voice actors, not just uploaded voices.

This keeps the network premium and accountable.

### 2. Twin Governance Layer

Each actor controls:

- allowed use cases
- restricted categories
- pricing preferences
- approval rules
- training scope
- retirement or successor settings

### 3. Community Layer

A private workspace where actors can:

- upload takes
- review work
- give feedback
- receive live direction
- collaborate on interpretations
- leave timestamped notes on each other’s work
- earn recognition for mentorship and review quality

Community rooms should be separate from premium live direction rooms.
The actor-to-director path stays private by default.

### 4. Session And Version Layer

Every performance event should produce a durable record.

This layer handles:

- versioned takes
- timestamps
- actor identity linkage
- session metadata
- approval state
- training eligibility
- twin update queue status
- direction packet metadata
- first-take protection state

### 5. Local Direction Hub

The user's M2 Ultra can operate as the local performance hub for live sessions.

Desired capabilities:

- real-time voice direction
- private session routing
- director-only routing by default
- monitored intake to local storage
- isolated actor-to-director session paths
- optional silent client monitor mix
- optional record, review, and archive workflow
- local preprocessing before any cloud sync
- hybrid handoff into a secure control plane for dashboards and marketplace events
- first-take mode with minimal redirect workflow

This should behave like a private local-first audio relay rather than a public streaming platform.

Dedicated architecture:

- [sovereign-voice-local-direction-hub.md](./sovereign-voice-local-direction-hub.md)

### 6. Creative Transmission Layer

Direction should be treated as resonance, not micromanagement.

This layer should support:

- AVA field translation of briefs
- AVA direction packets that scale one field across multiple actors
- actor-facing signal cards
- first-take protection
- one-variable redirect notes
- NOIZYFISH sonic continuity after capture

The core rule is that direction should land as a field, not a line-by-line control script.
Actors should internalize the vision quickly enough that the first read remains valuable.

Companion protocol:

- [creative-transmission-protocol.md](./creative-transmission-protocol.md)
- [ava-direction-packet-spec.md](./ava-direction-packet-spec.md)

### 7. Rights And Payout Layer

Every usage event should tie back to:

- the actor
- the approved twin
- the allowed use case
- the payout route

### 8. API And Distribution Layer

The network should expose a governed integration surface for:

- indie creators
- agencies
- game teams
- animation studios
- dubbing workflows
- custom live direction requests

The API should enforce actor policy before any commercial delivery occurs.

## Default Economic Model

### Proposed Split

- 75% to the voice actor
- 25% to NOIZY / platform operations

### Why It Matters

- the actor sees real upside
- the platform becomes attractive to senior talent
- retirement-age or independent actors can treat their studio as a long-term income engine
- the actor is building a governed digital legacy business, not giving away a clone

## Key Upgrades

### Transparent Earnings Dashboard

Each actor should see:

- live revenue events
- use-case breakdown
- top clients
- projected monthly and annual value
- lifetime value of their twin

### Artist Status Tiers

Not for exclusion.
For recognition, trust, and premium market signaling.

Example tiers:

- Founding Voice
- Signature Voice
- Platinum Voice

Status should reflect more than sales.
It should also reward:

- reliability
- mentorship
- review quality
- client satisfaction
- governance completeness

### Ethical Veto Power

Each actor can define prohibited uses.

Examples:

- no gambling
- no political persuasion
- no adult content
- no audiobooks
- only indie creators
- only approved agencies

This is a core sovereignty feature, not an optional extra.

## System Design Direction

### Intake

- actor identity verification
- contract and consent setup
- recording standards
- metadata and voice profile creation

### Training

- opt-in only
- actor-specific training scope
- provenance record per twin

### Session Layer

- live direction room
- private upload review
- actor comment and revision loop
- versioned take ledger
- timestamped feedback
- approval state per take
- direction packet capture
- first-take preservation
- minimal redirect notes
- shared-field and role-delta packets for ensemble sessions

### Marketplace

- search by human actor and governed twin
- clear pricing and request flow
- human escalation path for custom jobs
- direct booking for live session direction
- API delivery for approved integrations

### Governance

- allowed use-case matrix
- audit logs
- revocation path
- beneficiary and estate controls

### Community And Reputation

- peer review history
- mentorship contributions
- actor reputation profile
- ethical trust badges
- showcase and spotlight surfaces

### Creative Transmission

- emotional field briefs
- AVA translation layer
- actor signal cards
- NOIZYFISH sonic DNA continuity
- session coherence across remote performers

## Why This Is Strong

- it aligns incentives with the human source
- it gives professionals more control than major aggregators
- it turns voice actors into ongoing creative businesses
- it makes trust and governance part of the premium value
- it scales direction as signal transmission instead of generic prompting

## Risks

- identity verification and fraud control
- clone misuse outside approved workflows
- moderation load if approvals are fully manual
- payout and tax complexity across countries

## Next Actions

- define the actor onboarding flow
- define the twin governance schema
- define the live direction hub architecture
- define the creative transmission packet
- define the session version record
- define the request, quote, and payout workflow
- define the client API contract
