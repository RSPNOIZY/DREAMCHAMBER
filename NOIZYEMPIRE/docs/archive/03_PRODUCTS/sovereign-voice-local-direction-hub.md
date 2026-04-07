# Sovereign Voice Local Direction Hub

## Summary

This is the local-first session architecture for the Sovereign Voice Network.

It turns the M2 Ultra into a private direction hub where approved voice actors can perform live, route audio only to the director by default, and decide what becomes:

- a reviewed take
- a deliverable
- a twin-training candidate
- a protected archive asset

This is the system answer to:

- can we build our own private Sonobus-like relay
- can the session come through one local machine
- can the actor remain the source and gatekeeper of the AI twin

Companion docs:

- [sovereign-voice-network.md](./sovereign-voice-network.md)
- [sovereign-voice-blueprint.md](./sovereign-voice-blueprint.md)
- [creative-transmission-protocol.md](./creative-transmission-protocol.md)

## Core Promise

The Local Direction Hub is not a public streaming system.

It is a private source-to-director performance channel.

Default rule:

- actor audio routes to the director only

Optional listeners should exist only as explicit session roles:

- silent client monitor
- approved peer reviewer
- assistant engineer

The hub should make the premium promise credible:

- the human voice actor stays in control
- the local director controls the live session
- the platform never behaves like a faceless clone bucket

## Why This Matters

This architecture upgrades the voice library into a sovereign performance network.

It gives NOIZY four things at once:

- premium privacy for live direction
- local first-take capture
- traceable governance for every session
- a believable path to actor-owned recurring income

It also changes the talent story.

The system is not asking actors to upload a voice and disappear.
It is inviting them to run a small long-term creative business from their own studio.

## Core Roles

### Voice Actor

- performs live
- controls allowed uses
- controls training eligibility
- reviews takes and revisions
- keeps 75% of approved revenue

### Director

- receives live performance audio
- sends briefs, redirects, and notes
- decides when a take enters review
- controls the local session environment on the M2 Ultra

### Client Monitor

- can hear only the approved monitor mix
- does not receive raw archive access by default
- cannot trigger training or export decisions

### NOIZY Control Plane

- handles identity, invites, permissions, dashboards, and policy checks
- syncs metadata, not raw capture, unless a session explicitly allows it

## Session Modes

### 1. Director-Only Room

Default premium mode.

- one actor
- one director
- lowest-latency path
- first-take capture enabled
- no client audio return unless added explicitly

### 2. Director Plus Silent Monitor

For commercial reviews and approvals.

- actor and director remain the active creative pair
- client hears only the approved monitor mix
- notes can be captured without exposing raw archive paths

### 3. Community Review Room

For approved peer learning and interpretation feedback.

- actor can invite peers
- notes are timestamped
- room output never becomes client-deliverable automatically

### 4. Async Review Drop

For actors who prefer to upload takes from their own studio schedule.

- local file handoff
- review comments and approval loops
- no live direction dependency

## Signal Path

```text
actor mic chain
-> actor session client
-> secure low-latency transport
-> M2 Ultra local relay
-> CoreAudio routing
-> director headphones / monitors / DAW
-> local multitrack capture
-> take review and approval
-> metadata sync to control plane
-> approved delivery or opt-in twin update queue
```

The raw live path should stay simple.

The control plane should not sit in the audio path unless a relay mode actually needs it.

## Recommended Technical Shape

### Transport

- WebRTC for low-latency interactive sessions
- peer-to-peer for actor-director rooms when possible
- self-hosted SFU for multi-party rooms when monitors or peers are added

### Local Routing

- CoreAudio on macOS
- BlackHole or Loopback for virtual routing into a DAW or recorder
- separate buses for live monitoring, local capture, and client monitor mix

### Local Capture

- per-actor WAV or FLAC stems
- session-level proxy render for quick review
- first-take flag stored separately from later revisions

### Control Plane

- actor identity
- session invites
- role permissions
- use-case policy checks
- dashboard metrics
- request and payout records

### Review Surface

- web or desktop review view
- timestamped notes
- approval state
- take version history
- training eligibility toggle per take

## Privacy Boundary

Raw performance capture should remain local by default.

The cloud side should receive only:

- session metadata
- permissions and roles
- notes
- approval state
- payout events
- approved proxies or exports when allowed

The cloud side should not receive:

- raw actor stems by default
- training-ready files without explicit actor consent
- unrestricted session playback

## Governance Rules

### Human Approval First

NOIZY approves human voice actors, not detached voices.

That means:

- identity verification
- studio standards
- contract acceptance
- ethics profile
- approved public profile

### Actor Policy Matrix

Each actor can control:

- blocked categories
- allowed client classes
- language and accent offers
- live-only vs twin-eligible work
- pricing floors
- auto-approval thresholds

### Take-Level Consent

Every take should have separate states for:

- client delivery approval
- archive approval
- training eligibility
- showcase permission

## Economic Model Inside The Hub

The direction hub should make the upside visible, not abstract.

Default split:

- 75% actor
- 25% NOIZY

Actor dashboard should show:

- live revenue events
- projected monthly value
- lifetime value of the twin
- value by client category
- value by language or style
- blocked requests that were avoided because of actor policy

This matters because the product pitch is not just better tooling.

It is the chance for a voice actor to turn a home studio into a governed recurring income engine.

## Why Professionals Would Join

- they keep control of their digital twin
- they can veto categories they dislike
- they see clear recurring value instead of one-off licensing only
- they stay tied to the AI version of themselves
- they are joining a curated human network, not an anonymous asset farm

## MVP Build Sequence

### Phase 1. Private Relay

- actor-director room
- local monitoring
- local capture
- simple notes
- role-based session invites

### Phase 2. Review And Governance

- take ledger
- approval states
- client monitor mix
- actor veto routing
- dashboard events

### Phase 3. Twin Operations

- opt-in training queue
- twin update review
- governed API fulfillment
- request and quote flow

### Phase 4. Network Scale

- multilingual discovery
- actor status tiers
- peer review rooms
- beneficiary and estate routing

## Non-Negotiables

- private by default
- director-only routing by default
- actor owns the twin policy
- raw capture stays local unless explicitly released
- human approval comes before voice approval
- dashboard makes the business upside visible
- premium trust matters more than bulk scale

## Next Actions

- define the actor onboarding schema
- define the local session manifest schema
- define the quote and approval workflow
- define the actor dashboard metric set
- prototype the low-latency relay path on the M2 Ultra
