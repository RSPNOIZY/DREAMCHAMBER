# Actor-Facing Signal Card

## Summary

This is the shortest usable NOIZYVOX brief.

Its job is to let an actor enter the field quickly enough that the first read can stay alive.

The signal card is not a script breakdown.
It is not a page of notes.

It is a fast nervous-system prompt.

## Purpose

Use the signal card when a performer needs:

- immediate emotional orientation
- one clear sensory image
- the scene's hidden pressure
- a short warning about what would break the read

The card should be readable in under 20 seconds.

## Signal Card Template

```text
SCENE OBJECTIVE:
<what the moment wants>

WHAT MUST BE FELT:
<core emotional truth>

HIDDEN PRESSURE:
<what is under the line>

EMOTIONAL TEMPERATURE:
<short contradiction or emotional weather>

SENSORY ANCHOR:
<one image that organizes the body quickly>

FORBIDDEN READINGS:
<1-3 things that break the field>

FIRST-TAKE BIAS:
<high / medium / low>
```

## Generation Rules

### 1. One Breath, Not A Paragraph

Each field should be short enough to scan instantly.

### 2. Preserve Contradiction

Good performances often come from tension, not simplification.

Examples:

- tender but dangerous
- intimate but withheld
- exhausted but holy

### 3. Use One Strong Image

The sensory anchor should act like a tuning fork.

Examples:

- like a storm staying polite
- like the room is colder than your words
- like you are trying not to wake the grief

### 4. Do Not Over-Explain

If the card starts sounding like script analysis, it is too long.

### 5. Preserve Actor Freedom

The card should aim the field without scripting the performance.

## Example Signal Card

```text
SCENE OBJECTIVE:
Ask for trust without sounding needy.

WHAT MUST BE FELT:
You need this person, but you hate that they can see it.

HIDDEN PRESSURE:
If they hear too much fear, you lose the room.

EMOTIONAL TEMPERATURE:
Intimate but defended.

SENSORY ANCHOR:
Like your hand is resting on cold glass.

FORBIDDEN READINGS:
Do not plead.
Do not explain the pain.
Do not become theatrical.

FIRST-TAKE BIAS:
High
```

## Multi-Actor Use

In ensemble sessions, every actor should receive:

- one shared field
- one private role delta

Shared field gives scene weather.
Role delta gives individual tension.

## Relationship To AVA

AVA should generate the signal card from the fuller direction packet.

The signal card is the human-facing compression layer.

## Relationship To NOIZYFISH

NOIZYFISH does not change the card.
It uses the continuity handoff after capture to keep performances inside the same world.

## Integration Points

- [ava-direction-packet-spec.md](./ava-direction-packet-spec.md)
- [ava-direction-packet-schema.json](./ava-direction-packet-schema.json)
- [creative-transmission-protocol.md](./creative-transmission-protocol.md)
- [noizyvox-frequency-transmission-blueprint.md](./noizyvox-frequency-transmission-blueprint.md)

## Next Actions

- bind the card to local session manifests
- add a first-take UI state to the local direction hub
- define role-delta cards for ensemble sessions
