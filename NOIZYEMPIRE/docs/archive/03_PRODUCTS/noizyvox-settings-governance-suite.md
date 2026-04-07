# NOIZYVOX Settings And Governance Suite

## Summary

This document defines the settings screens, moderation console, clinician export flow, research opt-in flow, and security baseline for the NOIZYVOX regulation branch.

It sits on top of:

- [calm-studio-product-spec.md](./calm-studio-product-spec.md)
- [regulation-voices-product-spec.md](./regulation-voices-product-spec.md)
- [community-feedback-architecture.md](./community-feedback-architecture.md)
- [neuroacoustic-safety-charter.md](./neuroacoustic-safety-charter.md)
- [noizyvox-sitecopy-pack.md](./noizyvox-sitecopy-pack.md)
- [noizyvox-legal-pack.md](./noizyvox-legal-pack.md)

## Scope

The suite covers four surfaces:

1. Calm Studio settings
2. Regulation Voices creator settings
3. Moderation and safety review console
4. Clinician export and research opt-in flows

## Calm Studio Settings

### CS-SET-0 Settings Home

Cards:

- Safety and Limits
- Sensory Profile
- Session Templates
- Data and Privacy
- Exports
- Account and Devices

Banner:

`Safety-first defaults active`

### CS-SET-1 Safety And Limits

Controls:

- max session length
- daily max sessions
- mandatory rest window
- volume ceiling
- mono only
- one-tap quiet fade-out
- auto-stop on overload

Required error state:

`Calm Studio does not allow disabling core safety protections.`

### CS-SET-2 Sensory Profile

Editable fields:

- sensitivity level
- startle response
- preferred voice feel
- trigger toggles for sibilance, pace, dynamics, whispers, mouth sounds, and stereo motion

Save toast:

`Updated. Future sessions will adapt.`

### CS-SET-3 Session Templates

Templates can save:

- goal
- length
- voice mode
- intensity
- sensory toggles

Required note:

`Templates never override safety caps.`

### CS-SET-4 Data And Privacy

Controls:

- local-only session history
- optional cross-device sync
- storage toggles for duration, outcome, trigger tags, and notes
- opt-in anonymized tolerance sharing

Required statement:

`No audio is shared. Only your check-in signals and tags.`

### CS-SET-5 Exports

Export modes:

- one-page summary
- detailed log

Consent checkbox:

`I confirm I have permission to share this information.`

Required note:

`Exports are not medical records. They reflect caregiver observations.`

## Regulation Voices Settings

### RV-SET-0 Dashboard

Tabs:

- My Voices
- Licensing
- Safety and QA
- Usage and Royalties
- Revocation
- Profile and Identity

Banner:

`Consent rules enforced at generation time.`

### RV-SET-1 My Voices

Each voice card should show:

- name
- status
- allowed contexts
- enabled modes

Quick actions:

- edit profile
- update license
- view usage
- pause voice

### RV-SET-2 Licensing

Controls:

- allowed contexts
- disallowed contexts
- indie, studio, enterprise pricing

Required note:

`Buyers must match your allowed contexts to generate audio.`

### RV-SET-3 Safety And QA

Controls:

- sibilance softening
- prosody bounds
- pace
- breath texture
- mono default
- no-whisper variant

Required outputs:

- calm mode preview
- sleep mode preview
- pass or needs-review badge

### RV-SET-4 Usage And Royalties

Display:

- usage by mode
- usage by tier
- receipts list

Required note:

`Receipts record usage and license conditions, not listener identity by default.`

### RV-SET-5 Revocation

Actions:

- pause globally
- pause by context
- pause by buyer account where supported

Required warning:

`Revocation prevents future generation. It does not retract audio already exported by a buyer.`

## Moderation And Safety Review Console

### MOD-0 Home

Tabs:

- Incidents
- Flagged Voices
- Flagged Scenes
- Community Trends
- Decisions Log
- Advisory Circle

Banner:

`We prioritize safety reports over growth metrics.`

### MOD-1 Incident Intake

Fields:

- product
- incident type
- content involved
- severity
- notes

Default rule:

attachments off unless clearly required.

Auto-response:

`Thank you. Safety reports are reviewed. If distress is ongoing, consult a clinician.`

### MOD-2 Triage

Queue patterns:

- overload cluster
- voice flagged by multiple caregivers
- license misuse allegation

Actions:

- pause content
- require QA re-check
- escalate to advisory circle
- close with explanation

Required note:

`Every action requires a reason. Reasons are visible to creators.`

### MOD-3 Flagged Voice Review

Show:

- voice profile settings
- report counts only
- common tags

Actions:

- patch profile
- restrict to lower stimulation modes
- pause until creator adjusts
- clear flag with rationale

### MOD-4 Decisions Log

Log entries must include:

- what changed
- why
- version
- date

Anchor note:

`Trust requires traceability.`

## Clinician Export And Research Opt-In

### Research-0 Opt-In Registry

Allow opt-in sharing of:

- anonymized session outcomes
- anonymized trigger tags
- template metadata without content

Locked statement:

`No raw child audio is collected by default.`

### Research-1 Consent And Ethics

Required checkboxes:

- I am a caregiver or legal guardian
- I understand this is not medical care
- I can withdraw at any time
- I understand aggregated insights may be published

Support immediate leave and withdrawal.

## Security Baseline

These rules are non-negotiable:

- privileged endpoints require strong authentication
- no wildcard CORS on privileged routes
- no arbitrary shell or exec endpoints
- privileged control services bind locally unless behind authenticated infrastructure
- launch-style functionality uses allow-listed targets, not arbitrary commands
- public docs use placeholders instead of internal addresses or usernames

## Care Metrics

Optimize for:

- tolerance rate
- overload rate
- caregiver-rated time-to-calm
- repeat-safe templates

Do not optimize for:

- raw minutes listened
- addictive retention
- stimulation volume
