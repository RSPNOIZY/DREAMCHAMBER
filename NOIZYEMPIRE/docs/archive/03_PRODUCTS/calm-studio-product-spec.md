# Calm Studio Product Spec

## Summary

Calm Studio is a caregiver-guided listening environment designed to support calm, sensory predictability, and nervous-system regulation.

It is explicitly non-clinical.

It is not a medical device and does not diagnose, treat, cure, or prevent any condition.

## Product Position

Calm Studio exists because many audio products optimize for engagement when sensitive listeners need predictability, bounded intensity, and fast exit paths.

The product should optimize for tolerance, not stimulation.

## Landing Thesis

Calm Studio should feel like:

- a low-surprise listening space
- a caregiver-guided tool
- a safety-first companion
- a reflection loop, not a content treadmill

## Claims Boundary

Use language like:

- supportive listening
- regulation-oriented environment
- caregiver-guided calm sessions
- sensory predictability

Do not use language like:

- treatment
- cure
- diagnosis
- autism healing

## Core Flow

### CS-0 Welcome

Title:

`Calm Studio`

Subtitle:

`A caregiver-guided listening space designed for predictability and comfort.`

Required disclaimer:

`This is a supportive listening tool. It is not a medical device and does not diagnose, treat, cure, or prevent any condition.`

### CS-1 Role Selection

Roles:

- caregiver or parent
- therapist or educator
- self-use adult

### CS-2 Safety Setup

Required controls:

- max session length
- daily max sessions
- mandatory rest window
- volume ceiling
- soft start and soft end locked on
- mono-only option
- no whisper option
- no ASMR-triggers option

Rule:

core safety protections cannot be fully disabled inside Calm Studio.

### CS-3 Sensory Profile

Collect:

- sound sensitivity
- startle response
- preferred voice feel
- known triggers

Examples:

- sharp sibilance
- fast speech
- sudden loudness changes
- stereo movement
- breath or mouth sounds

### CS-4 Goal Selection

Primary goals:

- calm
- focus
- wind-down
- sleep support

### CS-5 Session Builder

Session controls:

- low stimulation
- balanced
- gentle expressive
- voice mode or no voice
- 10-second preview through safety caps

### CS-6 Live Session

Always visible:

- countdown timer
- stop now button
- pause button
- quiet fade-out button
- badge showing safety caps active

### CS-7 Post-Session Check-In

Outcomes:

- calmer
- same
- more activated
- overload or shutdown signs

Optional tags:

- too bright
- too fast
- too dynamic
- voice comforting
- voice irritating

### CS-8 Recommendations

The system should:

- suppress patterns associated with overload
- suggest only adjacent safe variants
- explain what changed in plain language

## Settings Layer

### Safety And Limits

- max session length
- daily max
- mandatory rest window
- volume cap
- mono-only default
- one-tap quiet fade-out
- auto-stop on overload

### Sensory Profile

Editable at any time with a visible statement that future sessions will adapt.

### Templates

Support reusable safe routines, but never let templates override safety caps.

### Data And Privacy

Defaults:

- store minimal session data
- local-first where possible
- cloud sync only by choice
- anonymized learning off by default

### Exports

Allow:

- one-page summary for clinician, school, or caregiver use
- detailed logs if explicitly enabled

Exports are observational, not medical records.

## Launch Requirements

### Safety

- time-boxed sessions
- no autoplay loops
- explicit stop controls
- soft attack and decay on transitions
- volume ceilings
- visible cooldown logic

### Feedback

- caregiver check-in after each session
- do-not-repeat logic
- trigger tagging
- next-safe recommendation engine

### Privacy

- no raw child audio collection by default
- opt-in only for anonymized improvement pools
- delete and export controls

### Engineering

- no privileged unauthenticated endpoints
- no wildcard CORS on sensitive actions
- no arbitrary exec patterns
- privileged services bound locally unless behind authenticated infrastructure

## Success Metric Doctrine

Track:

- tolerance rate
- overload rate
- repeat-safe templates
- caregiver-rated time-to-calm

Do not optimize for:

- endless listening minutes
- compulsive retention
- stimulation for its own sake
