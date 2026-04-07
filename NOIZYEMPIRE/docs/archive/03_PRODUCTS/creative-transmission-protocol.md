# Creative Transmission Protocol

## Summary

The Creative Transmission Protocol is the repeatable NOIZYVOX method for getting instinctive, high-coherence performances from human actors without flattening them through over-direction.

It turns direction into a structured transmission process:

`director vision -> AVA field translation -> performer intuition -> first-take capture -> NOIZYFISH coherence`

## Purpose

Most voice systems focus on capture, cloning, or automation.

This protocol focuses on the moment before the take:

- how intention is framed
- how emotion is transmitted
- how the actor receives the signal
- how the first take is protected
- how the same field can be transmitted across multiple actors without going generic

## Core Components

### 1. Director Vision

The raw creative intention.

This includes:

- scene purpose
- emotional stakes
- tonal boundaries
- visual or sensory imagery
- narrative pressure

### 2. AVA Field Translator

AVA should translate the director's raw brief into a cleaner performance field.

AVA's job is not to rewrite the performance.

AVA's job is to clarify:

- emotional temperature
- scene objective
- pacing pressure
- restraint or intensity
- image anchors
- forbidden readings

AVA should also be able to preserve:

- the shared field for the whole scene
- the role-specific pressure for each actor
- the world-level continuity that NOIZYFISH will later protect

### 3. Performer Intuition

The actor receives a field, not a list of rigid line instructions.

The actor should respond from:

- instinct
- craft
- breath
- character memory
- vocal body

If the field lands well, the actor should not need exhaustive explanation.
They should feel the moment quickly enough to trust the first read.

### 4. First-Take Capture

The system should privilege the first clean take rather than forcing optimization before instinct has landed.

This is a first-read bias, not a ban on later takes.
The rule is simply that refinement must not erase the original transmission.

### 5. NOIZYFISH Coherence Layer

NOIZYFISH should keep multiple performances inside the same aesthetic universe.

Its job is similar to sonic grading:

- preserve continuity
- maintain tonal identity
- keep voice performances belonging to the same world
- do it after capture rather than flattening the actor before capture

## Protocol Steps

### Step 1. Intention Lock

Before direction begins, define:

- what the moment is really about
- what must be felt
- what must not happen

If the intent is unclear, the field will be noisy.

### Step 2. Emotional Framing

Describe the emotional center in a small number of strong terms.

Example fields:

- intimate but guarded
- exhausted and holy
- playful with a hidden threat
- ceremonial and ancient
- broken but still dangerous

### Step 3. Narrative Container

Give the actor the immediate story pressure.

Not backstory overload.
Immediate stakes.

Examples:

- you are asking for forgiveness without admitting guilt
- you already know the room is lost, but no one else does
- this is the first time you trust someone enough to sound weak

### Step 4. Sensory Anchor

Use one or two images that organize the nervous system quickly.

Examples:

- speak like the air is cold and thin
- the words should land like a hand on glass
- it should feel like a storm staying polite

### Step 5. Boundary Definition

Tell the actor what to avoid.

Examples:

- do not make it theatrical
- do not push the sadness
- do not sound explanatory
- keep the power low but present

### Step 6. Immediate Performance

Once the field is set, perform quickly.

Do not over-discuss.
Do not intellectualize the moment to death.

The goal is to let instinct answer before analysis dominates.

If a clean first read lands, treat it as a likely keeper.

### Step 7. First-Take Preservation

Always retain the first take as a protected performance artifact.

Even if later takes are recorded, the first take should stay visible in the session record.

### Step 8. Minimal Redirect

If a second take is needed, redirect only one variable at a time.

Examples:

- same feeling, less explanation
- same pace, more restraint
- same intimacy, but with more danger underneath

Never redirect five variables at once.
That breaks the field and replaces resonance with correction.

### Step 9. Coherence Pass

After capture, NOIZYFISH can apply aesthetic continuity without overwriting the actor's core performance identity.

## Direction Packet Schema

Every session should produce a lightweight direction packet:

- `scene_id`
- `character_id`
- `objective`
- `emotional_temperature`
- `pace`
- `intensity`
- `restraint`
- `sensory_anchor`
- `forbidden_readings`
- `first_take_protected`
- `approved_take_ids`
- `director_notes`

Dedicated packet spec:

- [ava-direction-packet-spec.md](./ava-direction-packet-spec.md)
- [ava-direction-packet-schema.json](./ava-direction-packet-schema.json)
- [actor-facing-signal-card.md](./actor-facing-signal-card.md)

Visual ecosystem companion:

- [noizyvox-frequency-transmission-blueprint.md](./noizyvox-frequency-transmission-blueprint.md)

## First-Take Mode

NOIZYVOX should eventually support a dedicated first-take mode.

Features:

- a short field-brief composer
- AVA translation output
- actor-facing signal card
- one-tap first-take protection
- redirect notes limited to one variable per pass
- session metadata linked to the version ledger

## Why This Wins

- it protects intuition
- it makes direction scalable without becoming generic
- it scales a director's frequency without stripping out authenticity
- it keeps actors central to the creative process
- it gives remote sessions more coherence
- it turns NOIZYVOX into a system for transmitting vision, not just capturing sound

## Integration Points

This protocol should connect to:

- [sovereign-voice-network.md](./sovereign-voice-network.md)
- [sovereign-voice-blueprint.md](./sovereign-voice-blueprint.md)
- [resonance-principle.md](../01_PHILOSOPHY/resonance-principle.md)
- [ava-direction-packet-spec.md](./ava-direction-packet-spec.md)

## Next Actions

- add the protocol to the voice-network architecture
- bind the actor-facing signal card into the session flow
- bind the AVA direction packet schema into local session manifests
- define how NOIZYFISH performs continuity without flattening performance differences
