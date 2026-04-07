# Global Music Genome Table

## Summary

This is the master developer-facing blueprint for DreamChamber world music buildout.

Use it when a team needs one practical layer that answers:

- which regions and lineages are in scope
- which instruments and styles anchor each world
- which rhythm and scale IDs should seed each biome
- which VR environments and gesture maps belong to each node
- which expansion nodes should be built after the current runtime seed set

This file does not replace the deeper atlas documents.

It compresses them into a single handoff surface for Unreal, Unity, FMOD, Wwise, OpenXR, curriculum design, and archive planning.

Companion docs:

- [global-music-genome.md](./global-music-genome.md)
- [dreamchamber-global-music-atlas.md](./dreamchamber-global-music-atlas.md)
- [dreamchamber-3d-world-mapping-table.md](./dreamchamber-3d-world-mapping-table.md)
- [dreamchamber-3d-world-mapping-table.json](./dreamchamber-3d-world-mapping-table.json)
- [dreamchamber-planetary-engine-architecture.md](./dreamchamber-planetary-engine-architecture.md)
- [dreamchamber-planetary-engine-architecture.json](./dreamchamber-planetary-engine-architecture.json)
- [dreamchamber-biome-matrix.json](./dreamchamber-biome-matrix.json)

Machine-readable companion:

- [global-music-genome-table.json](./global-music-genome-table.json)

## Reading Rule

This is a world-scale seed blueprint, not a claim that one file can finally catalog every instrument or every living musical lineage.

It is built to help DreamChamber hold:

- regional depth
- stylistic variety
- microtonal and modal difference
- timbral identity
- gesture-to-sound logic
- respectful expansion pathways

## Planetary Instrument Premise

The DreamChamber should start from one ancient truth:

music was not invented.
It was discovered.

Before formal instruments, the body already carried music:

- heartbeat
- breath
- voice
- footsteps

The world instrument families are extensions of those original human vibration systems.

## Core Interaction Grammar

| Input | Default DreamChamber Meaning | Typical Audio Effect |
|---|---|---|
| `step` | move through the room or cycle | density, route, pulse, ensemble focus |
| `approach` | move closer to a node | louder source, stronger detail, drier sound |
| `pinch` | isolate or pluck a source | trigger, mute others, spotlight detail |
| `spread` | widen the room | ensemble bloom, stereo spread, harmonic lift |
| `wrist_rotate` | inflect or bend | modal color, filter tilt, ornament depth |
| `lift` | raise energy upward | register lift, overtone emphasis, melodic height |
| `hold_still` | deepen listening | resonance, decay, drone clarity, silence framing |
| `gaze_lock` | choose a target | source selection, pitch cluster, soloist or corridor focus |
| `breath` | swell, thin, or stabilize | drone thickness, vibrato, noise bed, air detail |
| `voice_call` | invoke or answer | call-and-response, route shift, environment reply |
| `controller_fallback` | accessible direct control | select, place, confirm, reset |

## Acoustic Family Routing

| Family | Body Root | DreamChamber Translation |
|---|---|---|
| `membranophones` | pulse | rhythm wells, floor weight, entrainment, procession |
| `aerophones` | breath | phrase direction, airflow contour, line in space |
| `chordophones` | tension and release | harmonic filaments, bends, arcs, sustained pull |
| `idiophones` | impact into resonance | shimmer fields, crystal bodies, rippling overtones |
| `voice_and_body` | chant, speech, communal timing | invocation, memory, answer, social synchrony |
| `electronic_and_hybrid` | extension and recombination | mutable geometry, speculative timbre, adaptive topology |

## Current Runtime Nodes

| Node | Region | Instruments | Styles | Rhythm Seeds | Scale / Microtonal Seeds | VR Environment | Gesture Focus |
|---|---|---|---|---|---|---|---|
| `west_africa_rhythm_plaza` | West Africa and Sahel | djembe, dunun, balafon, kora, ngoni, talking drum, shekere | Ewe drumming, Yoruba drum speech, griot praise, dance-circle activation | `R11 R13 R25 R35 R60` | `S017 S018 S027 S063` | circular drum village and response towers | step = density, pinch = solo drum, arm sweep = rotate lead role |
| `east_central_africa_resonance_village` | East and Central Africa | mbira, kalimba, ngoma, chorus voice, marimba-like timbila, rattles | cyclic chorus, trance repetition, interlock groove, lamellophone dialogue | `R09 R14 R33 R38 R57` | `S017 S018 S032 S064` | clustered village lattice with resonance courtyards | hand taps = interlock, hold still = overtone reveal, gaze = chorus layer |
| `north_africa_desert_gate` | North Africa, Maghreb, Nile thresholds | bendir, guembri, oud, qraqeb, rebab, mizmar | procession, devotional chant, trance threshold, courtyard ensemble | `R12 R57 R59 R62 R63` | `S065 S066 S071 S100` | dunes, courtyards, threshold gates | forward walk = open segments, rotate = modal turn, spread = courtyard bloom |
| `middle_east_modal_corridor` | Middle East, Anatolia, Persia | oud, qanun, ney, saz, darbuka, duduk-like reeds | maqam recitation, taqsim, lament, ecstatic ascent | `R15 R50 R51 R59 R62` | `S065 S067 S068 S079 S110` | modal corridor with mirage pitch arches | wrist rotate = pitch bend, gaze = cadence focus, breath = reed air |
| `northern_asia_overtone_cavern` | Northern Asia and Arctic | overtone voice, khomus, frame drum, breath drone | journey trance, invocation, threshold crossing | `R49 R53 R57 R63` | `S014 S016 S104 S111` | harmonic cavern with overtone pillars | hold still = bloom, breath = deepen cavern, gaze = harmonic pillar |
| `south_asia_raga_mandala` | South Asia | sitar, tabla, tanpura, sarangi, bansuri, vina, santoor | raga unfolding, tala cycle, alap, devotional immersion | `R11 R12 R44 R54 R56` | `S081 S083 S089 S094 S096` | spiral mandala with drone center | circular walk = tala progression, mudra-like hand shapes = ornament, breath = drone swell |
| `himalaya_bowl_vault` | Himalaya and Tibetan sphere | bowls, bells, horns, chant, ritual percussion | prayer procession, ceremonial offering, overtone chamber | `R49 R53 R58 R62` | `S014 S016 S095 S104 S112` | vaulted bowl chamber and hanging resonance bodies | hold still = harmonic bloom, lift = open vault, breath = bowl shimmer |
| `east_asia_cloud_garden` | East Asia | guzheng, koto, shakuhachi, erhu, pipa, gayageum, taiko | contemplative breath phrase, court refinement, pentatonic lyricism | `R49 R52 R54 R56` | `S023 S024 S028 S052 S064` | cloud terraces, drifting sound lines, silence spacing | slow movement = reveal tones, gaze = phrase target, breath = flute air |
| `southeast_asia_gong_constellation` | Southeast Asia | gamelan metallophones, gongs, bamboo percussion, interlocking ensembles | gong cycles, shimmer architecture, dance ritual, interlock mesh | `R11 R13 R36 R40 R60` | `S041 S105 S106 S107` | orbital gong field and constellation nodes | step timing = rotate cycles, approach = interlock emphasis, spread = metallophone bloom |
| `indigenous_north_america_circle_fire_ring` | Indigenous North America | powwow drum, cedar flute, vocables, hand rhythm, rattles | circle song, all-night song, witnessing, prayer gathering | `R14 R57 R59 R62` | `S017 S031 S032 S015` | fire ring with open night sky | collective proximity = pulse thickness, breath = flute line, gaze = circle response |
| `amazonia_canopy_corridor` | Amazonia and forest ceremonial lineages | icaros, seed rattles, bamboo flutes, drum support, environmental voice | guidance song, canopy ceremony, directional singing, nature relation | `R49 R58 R62 R63` | `S002 S012 S015 S032 S112` | living jungle corridor with layered canopy | voice call = route shift, forward movement = ecosystem response, hold still = insect shimmer |
| `mesoamerica_invocation_chamber` | Mesoamerica | shell horn, huehuetl, teponaztli, ceremonial chant, flute | invocation, stair-step procession, temple cadence, cosmic marking | `R12 R59 R60 R62 R63` | `S016 S017 S026 S058` | stepped stone chamber with solar lines | ascent = intensity rise, pause = ceremonial marker, gaze = horn target |
| `latin_caribbean_festival_bridge` | Latin America and Caribbean | clave, conga, cajon, marimba, charango, bandoneon, samba battery | carnival pulse, procession, maracatu, samba, lament-and-lift | `R13 R28 R43 R48 R60` | `S020 S026 S053 S109 S127` | parade bridge, dance lanes, moving street energy | foot rhythm = groove family, turn = crossfade sections, spread = brass lift |
| `celtic_nordic_knot_field` | Celtic and Nordic worlds | harp, uilleann pipes, fiddle, hardanger fiddle, bodhran, nyckelharpa | reel, lament, fireside song, mythic procession, drone memory | `R10 R18 R43 R52 R59` | `S025 S050 S054 S060` | braided field with knot paths and drone pillars | path choice = melody braid, hold = drone strength, wrist rotate = bow weight |
| `europe_constellation_hall` | Europe orchestral and choral | strings, brass, woodwinds, choir, piano, harp, organ, bells | requiem, procession, counterpoint, theater, orchestral narrative | `R03 R10 R39 R56 R59` | `S049 S052 S056 S117` | floating constellations and conductor hall | arm sweep = sectional rise, gaze = section target, spread = hall expansion |
| `oceania_earth_resonance_plain` | Oceania and Australia | didgeridoo, clapsticks, slit drums, nose flute, log drums, chant | drone ceremony, land-linked resonance, pathway memory, communal marking | `R54 R57 R59 R60` | `S010 S014 S089 S095` | earth plain, low horizon, resonance stones | breath = drone thickness, stance = floor vibration, step = pulse path |
| `black_atlantic_signal_cathedral` | Black Atlantic and electronic futures | drum machines, modular synths, dub bass, chopped voice, brass ghosts, algorithmic layers | sound-system ritual, club propulsion, future gospel, diasporic transformation | `R08 R41 R48 R61 R64` | `S020 S053 S109 S113 S123 S127` | bass cathedral and living signal architecture | spatial sculpting = bass field, hand cuts = gate layers, gaze = spectral slice |

## Planned Expansion Nodes

| Node | Region / Frame | Instruments | Styles | Rhythm Seeds | Scale / Microtonal Seeds | VR Environment | Gesture Focus |
|---|---|---|---|---|---|---|---|
| `andes_wind_terraces` | Andes and highland South America | quena, siku, zampana, charango, ronroco, bombo leguero | huayno, mountain procession winds, terrace song, pentatonic air | `R10 R21 R54 R59` | `S026 S032 S050 S064` | mountain terraces, thin air, wind channels | breath = flute contour, step = terrace pulse, gaze = paired panpipe routes |
| `jazz_blues_improv_hall` | North and South American contemporary improvisation | saxophone, trumpet, piano, upright bass, guitar, harmonica, drum kit | swing, modal jazz, blues call-and-response, second-line lift | `R41 R43 R44 R46 R48` | `S020 S050 S053 S109 S114 S115` | smoky club hall and open improv street | pinch = solo spotlight, wrist rotate = blue-note inflection, step = swing pocket |
| `experimental_microtonal_liquid_laboratory` | Experimental / microtonal / synthetic | theremin, glass harmonica, modular synth, singing bowls, overtone voice, granular engines, AI voice layers | spectral textures, microtonal drift, synthetic ritual, unknown-world exploration | `R31 R49 R53 R63` | `S097 S103 S104 S121 S123 S128` | liquid geometry lab and shifting pitch planes | rotate = intonation drift, gaze = pitch plane lock, breath = spectral swell |

## Cultural Sound Worlds

These are high-level world-entry examples for DreamChamber onboarding and curriculum paths.

| World | Core Materials | DreamChamber Entry |
|---|---|---|
| `west_african_village` | drums, bells, kora, response voice | enter through rhythm circles and social timing |
| `tibetan_monastery` | bowls, horns, chant, reverent decay | enter through stillness, resonance, and harmonic bloom |
| `brazilian_carnival` | samba battery, brass lift, street propulsion | enter through movement, procession, and celebration |
| `japanese_garden` | shakuhachi, bells, koto, silence | enter through breath, spacing, and tonal refinement |
| `mongolian_steppe` | overtone voice, horsehair strings, horizon drone | enter through open air, line, and overtone pillars |
| `andean_mountains` | panpipes, charango, bombo, wind terraces | enter through altitude, breath contour, and paired melody routes |

## Cross-Regional Overlays

| Overlay | Regions / Nodes | Instruments | Primary Use | Runtime Hint |
|---|---|---|---|---|
| `ritual_resonance_overlay` | Himalaya, Amazonia, Indigenous North America, Oceania, North Africa | bowls, flutes, rattles, horns, frame drums, chant | contemplation, invocation, guidance, reverence | slower pacing, explicit thresholds, longer decay, breath-led entry |
| `microtonal_pathways_overlay` | Middle East, South Asia, East Asia, experimental lab | oud-family strings, ney, sitar, sarangi, theremin, synthetic pitch planes | pitch sensitivity, ornament, sliding centers | gaze and wrist rotation become first-class tuning controls |
| `improvisation_and_call_overlay` | West Africa, Middle East, jazz/blues hall, Black Atlantic | talking drum, voice, reeds, trumpet, guitar, chopped voice | answer, solo, dialogue, social timing | cue-response events, soloist focus, dynamic ensemble ducking |

## Build Rules

- use the runtime nodes table for current room authoring
- use the planned nodes table for the next expansion wave
- keep overlays as optional routing layers, not replacements for lineage-aware rooms
- every node should map to real source-lineage notes before production asset work
- every node should be able to route by `region`, `state`, `human_function`, and `method`
- microtonal and ceremonial material should never be collapsed into generic flavor tags

## Developer Handoff

Use this file with:

- [dreamchamber-3d-world-mapping-table.md](./dreamchamber-3d-world-mapping-table.md) for spatial and middleware detail
- [dreamchamber-biome-matrix.json](./dreamchamber-biome-matrix.json) for current prototype seeds
- [global-music-genome-table.json](./global-music-genome-table.json) for machine-readable node and gesture data
- [dreamchamber-planetary-engine-architecture.md](./dreamchamber-planetary-engine-architecture.md) for the four-system runtime integration layer

## Next Actions

1. bind each node to `lineage note schema v0.1`
2. bind each node to `DreamChamber scene state schema v0.1`
3. promote the planned nodes into future biome matrix entries
4. add provenance hooks for source assets, advisors, and consent boundaries
