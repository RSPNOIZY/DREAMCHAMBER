# DreamChamber 3D World Mapping Table

## Summary

This is the bridge between the world-atlas canon and the XR runtime.

It translates:

- instruments
- style lineages
- timbral fields
- `64` rhythm archetypes
- `128` scale structures
- regional origin logic

into spatial authoring rules for DreamChamber.

Use this file when you need one layer that can speak to:

- Unreal or Unity scene design
- FMOD or Wwise routing
- OpenXR interaction design
- DreamChamber biome expansion
- NOIZY School biome labs

## Reading Rule

This is a high-coverage seed map.

It does not claim to exhaust every named lineage or every living instrument tradition on Earth.

It does give DreamChamber a practical world-scale authoring grammar:

- every biome gets a spatial template
- every region gets culture-instrument seeds
- every region gets rhythm and scale address ranges
- every region gets timbral and style hooks
- every route can be rendered into runtime parameters

The detailed taxonomies remain canonical in:

- [world-instrument-atlas.md](../02_RESEARCH/world-instrument-atlas.md)
- [world-style-lineages-atlas.md](../02_RESEARCH/world-style-lineages-atlas.md)
- [noizy-64-rhythm-archetypes.md](../02_RESEARCH/noizy-64-rhythm-archetypes.md)
- [noizy-128-scale-structures.md](../02_RESEARCH/noizy-128-scale-structures.md)
- [world-timbre-atlas.md](../02_RESEARCH/world-timbre-atlas.md)
- [world-regional-origin-timeline.md](../06_APPENDIX/world-regional-origin-timeline.md)

The machine-readable companion is:

- [dreamchamber-3d-world-mapping-table.json](./dreamchamber-3d-world-mapping-table.json)

The higher-level developer blueprint is:

- [global-music-genome-table.md](./global-music-genome-table.md)
- [global-music-genome-table.json](./global-music-genome-table.json)

## Spatial Translation Primitives

| Axis | Meaning | Runtime Use |
|---|---|---|
| `distance` | wetness, environmental depth, ensemble proximity | reverb send, early reflections, node gain |
| `height` | register, overtone altitude, melodic lift | filter tilt, partial emphasis, voice elevation |
| `azimuth` | lineage corridor or sectional identity | panning, source grouping, routing zones |
| `orbit_speed` | cycle density and temporal energy | LFO rate, sequence density, event cadence |
| `cluster_radius` | ensemble spread or intimacy | width, decorrelation, multi-source placement |
| `floor_weight` | body impact and percussive gravity | low-mid emphasis, transient contour, haptic proxy |
| `ceiling_bloom` | drone, shimmer, and resonance halo | long-tail verb, harmonic bloom, spectral spread |
| `light_temperature` | tonal gravity and emotional contour | UI and VFX state, not sonic truth by itself |

## Rhythm Address Space

Use the public `8 x 8` frame as the first routing layer.

| Rhythm Family | Archetype IDs | Spatial Bias |
|---|---|---|
| Pulse Foundations | `R01-R08` | centered floor pulse, stable body relation, step-linked onset |
| Cycles And Return Points | `R09-R16` | orbital or ring layouts, visible return markers, loop memory |
| Additive And Aksak Motion | `R17-R24` | staggered lanes, asymmetric stepping paths, shifting anchor points |
| Cross-Rhythm And Polyrhythm | `R25-R32` | layered circles, crossing motion lines, offset light pulses |
| Interlock And Hocket | `R33-R40` | distributed node meshes, role-swapping emitters, ensemble relays |
| Pocket, Swing, And Microtiming | `R41-R48` | elastic groove lanes, social gravity pockets, transient sway |
| Elastic And Breath-Led Time | `R49-R56` | suspended grids, phrase clouds, breath-linked expansion |
| Ritual, Trance, And Procession | `R57-R64` | threshold gates, ascent corridors, procession arcs, release zones |

## Scale Address Space

Use the public `8 x 16` frame as the tonal routing layer.

| Scale Family | Structure IDs | Spatial Bias |
|---|---|---|
| Recitation And Narrow Fields | `S001-S016` | close-source intimacy, narrow pitch corridors, cadence portals |
| Pentatonic Structures | `S017-S032` | open navigable rooms, stable melodic ladders, low-friction entry |
| Hexatonic Structures | `S033-S048` | partial symmetry, six-point constellations, omission-aware motion |
| Heptatonic Structures | `S049-S064` | wide harmonic halls, mode switching, layered progression routes |
| Modal Segment And Jins Chains | `S065-S080` | corridor logic, junction turns, cadence doors, pitch-bend arches |
| Raga, Drone, And Pathway Structures | `S081-S096` | spirals, time-of-day lighting, drone anchors, ascent-descent arcs |
| Microtonal And Intonation-Sensitive Structures | `S097-S112` | flexible lanes, sliding centers, intonation-sensitive gesture maps |
| Symmetric, Hybrid, Electronic, And Future Structures | `S113-S128` | grids, spectral fields, modular morphing, adaptive pitch planes |

## Human Function Layer

DreamChamber should not only route by region, rhythm, and scale.

It should also remember why humans built these musical worlds in the first place.

| Human Function | Meaning In DreamChamber | Runtime Hint |
|---|---|---|
| `communication` | sound used to signal, answer, narrate, or call others into relation | responsive cue-and-answer logic, proximity triggers, phrase relays |
| `celebration` | collective lift, dance, feasting, release, and social joy | brighter spatial spread, wider groove lanes, higher ensemble density |
| `mourning` | grief, remembrance, lament, low-intensity witnessing | slower pacing, reduced transient density, longer tails and closer source intimacy |
| `memory` | epic narration, lineage, archive, and identity transmission | recurrence markers, phrase-return cues, stable cadential anchors |
| `invocation` | calling presence, opening ceremony, orienting attention | threshold cues, focused entry copy, sparse but charged event pacing |
| `devotion` | prayer, offering, disciplined attentiveness, reverence | drone stability, restrained gesture maps, harmonic bloom over pulse density |
| `movement` | processions, circle dances, work rhythms, foot-led entrainment | locomotion-linked modulation, floor pulse strength, route-based tempo shaping |
| `guidance` | direction through emotional or ceremonial passage | voice-following, route markers, environmental responses that steer attention |
| `contemplation` | stillness, breath, tonal sensitivity, spaciousness | silence framing, extended decay, low visual clutter, fine-grain control |
| `transformation` | threshold crossing, ecstatic rise, release, reinvention | intensity ramps, density waves, topology changes, explicit closure states |
| `exploration` | curiosity, world entry, speculative discovery, experimental play | topology reveals, discovery prompts, adaptive room branching |

## Regional 3D Mapping Table

These are DreamChamber authoring seeds, not exhaustive cultural summaries.

| Biome | Culture-Instrument Seeds | Style Lineages | Rhythm Seeds | Scale Seeds | Timbral Field | Spatial Template | Interaction Model | Middleware Focus |
|---|---|---|---|---|---|---|---|---|
| `west_africa_rhythm_plaza` | Mande-kora, Yoruba-talking drum, Wolof-sabar, Ewe bell-and-drum, balafon ensembles | praise song, drum conversation, dance-circle activation, griot memory | `R11 R13 R25 R35 R60` | `S017 S018 S027 S063` | skin depth, metal rattle, buzzing string edge, wood attack | circular plaza with response towers | walking changes density, palms cue responses, arm sweep rotates lead role | pulse density, call-and-response, ensemble width |
| `east_central_africa_resonance_village` | Shona-mbira, Congolese ngoma, Swahili chorus, lamellophone clusters, village percussion | cyclical chorus, trance repetition, layered communal groove | `R09 R14 R33 R38 R57` | `S017 S018 S032 S064` | tine shimmer, wood resonance, chorus grain, drum heart | clustered village lattice | repeated hand taps add interlock layers, stillness reveals overtones | interlock density, chorus bloom, low-mid warmth |
| `north_africa_desert_gate` | Amazigh bendir, Gnawa guembri, Arab-Andalusian oud, qraqeb, rebab | procession, devotional chant, trance threshold, courtyard ensemble | `R12 R57 R59 R62 R63` | `S065 S066 S071 S100` | frame-drum sand, guembri bass pull, reed edge, metal clatter | threshold gate opening into dunes and courtyards | forward motion opens segments, turns reveal alternate cadence routes | procession drive, modal lift, resonance tail |
| `middle_east_modal_corridor` | oud, qanun, ney, saz, darbuka, duduk-adjacent reed voice | maqam recitation, lament, ecstatic ascent, frame-drum devotion | `R15 R50 R51 R59 R62` | `S065 S067 S068 S079 S110` | reed lament, plucked wood, skin articulation, chest resonance | corridor with pitch arches and mirage bends | wrist motion bends pitch, gaze holds cadential gravity | pitch-bend depth, cadence pull, reed presence |
| `northern_asia_overtone_cavern` | Tuvan overtone voice, Sakha khomus, frame drum, breath-led drone | journey trance, overtone invocation, threshold crossing | `R49 R53 R57 R63` | `S014 S016 S104 S111` | overtone halo, jaw-harp buzz, low drum earth, cold air | cavern shaft with harmonic pillars | sustained tone narrows light, breath length deepens cavern | drone bloom, overtone emphasis, cavern size |
| `south_asia_raga_mandala` | sitar, sarangi, bansuri, tabla, tanpura, vina | raga unfolding, tala cycle, devotional immersion, alap expansion | `R11 R12 R44 R54 R56` | `S081 S083 S089 S094 S096` | tanpura halo, tabla skin snap, reed breath, ornament shimmer | spiral mandala with drone center | circular travel advances cycle, mudra-like gestures shape ornament | tala phase, drone lock, ornament density |
| `himalaya_bowl_vault` | bowls, bells, long horns, overtone chant, ritual percussion | ceremonial chamber, prayer procession, sonic offering | `R49 R53 R58 R62` | `S014 S016 S095 S104 S112` | bronze shimmer, horn bloom, overtone cloud, long decay | vaulted chamber with hanging resonance bodies | stillness increases bloom, slow arm lift opens harmonic vault | decay time, shimmer spread, harmonic bloom |
| `east_asia_cloud_garden` | guzheng, koto, shakuhachi, erhu, pipa, gayageum | breath phrase, court refinement, silence-framed lyricism, contemplative motion | `R49 R52 R54 R56` | `S023 S024 S028 S052 S064` | bamboo breath, silk string, bow grain, negative space | terraced cloud garden with drifting source lines | slower motion reveals tone and silence, held gaze thins texture | air noise, note bloom, silence framing |
| `southeast_asia_gong_constellation` | gamelan metallophones, gongs, bamboo percussion, interlocking ensemble | gong cycle, interlock, dance ritual, shimmer architecture | `R11 R13 R36 R40 R60` | `S041 S105 S106 S107` | bronze shimmer, bamboo click, bell cluster haze | orbital constellation with node clusters | proximity changes interlocking emphasis, step timing rotates cycles | cycle phase, metallophone brightness, ensemble mesh |
| `indigenous_north_america_circle_fire_ring` | powwow drum, cedar flute, vocables, hand rhythm, rattle | circle song, all-night song, witnessing, prayer gathering | `R14 R57 R59 R62` | `S017 S031 S032 S015` | drum heart, flute air, chorus cry, rattle edge | fire ring with circle seating and sky-open center | collective presence thickens pulse, breath controls flute line | group synchrony, drum depth, flute proximity |
| `amazonia_canopy_corridor` | icaros, seed rattles, bamboo flutes, drum support, environmental voice | guidance song, canopy ceremony, directional singing, forest relation | `R49 R58 R62 R63` | `S002 S012 S015 S032 S112` | seed shimmer, canopy insects, breath flute, whispered voice grain | living corridor through layered canopy | voice input shifts pathway, forward travel changes ecosystem response | vocal follower, environmental density, route guidance |
| `mesoamerica_invocation_chamber` | shell horn, huehuetl, teponaztli, ceremonial chant, flute | invocation, stair-step procession, temple cadence, cosmic marking | `R12 R59 R60 R62 R63` | `S016 S017 S026 S058` | carved wood strike, shell bloom, chant edge, stone reflections | stepped chamber with solar sight lines | ascending steps raise density, pauses trigger ceremonial markers | threshold intensity, horn bloom, cadence markers |
| `latin_caribbean_festival_bridge` | clave, conga, cajon, marimba, charango, bandoneon, samba battery | carnival pulse, procession, lament-and-lift, social dance propulsion | `R13 R28 R43 R48 R60` | `S020 S026 S053 S109 S127` | hand percussion sparkle, brass lift, reeds, bass sway | bridge-street hybrid with parade lanes | foot rhythm shifts groove family, turns crossfade sections | swing depth, percussion width, brass rise |
| `celtic_nordic_knot_field` | harp, fiddle, uilleann pipes, hardanger fiddle, frame drum | reel, lament, fireside song, mythic procession, drone memory | `R10 R18 R43 R52 R59` | `S025 S050 S054 S060` | bowed resin, pipe air, harp shimmer, drum skin | braided field with knot paths | stepping paths braid melody lines, held stance strengthens drone | drone hold, bow sheen, melodic braid |
| `europe_constellation_hall` | orchestra strings, winds, brass, choir, piano, organ, bells | requiem, theater, procession, counterpoint, massed ensemble | `R03 R10 R39 R56 R59` | `S049 S052 S056 S117` | string halo, brass bloom, choral body, organ air | constellation hall with sectional stars | arm gestures conduct rises and collapses, selection revoices sections | sectional balance, harmonic tension, hall size |
| `oceania_earth_resonance_plain` | didgeridoo, clapsticks, slit drums, nose flute, chant, water rhythm | land-linked resonance, drone ceremony, pathway memory, communal marking | `R54 R57 R59 R60` | `S010 S014 S089 S095` | drone ground, wood click, breath resonance, earth hum | wide plain with low horizon and resonance stones | breathing thickens drone, stance changes floor vibration | drone body, click pulse, environmental resonance |
| `black_atlantic_signal_cathedral` | dub bass, drum machines, chopped voice, modular synth, brass ghosts, jazz residue | sound-system ritual, club propulsion, future gospel, diasporic transformation | `R08 R41 R48 R61 R64` | `S020 S053 S109 S113 S123 S127` | sub-bass pressure, tape saturation, chopped air, spectral smear | cathedral nave built from bass architecture | spatial sculpting reshapes bass field, hand cuts gate layers | bass pressure, transient gate, saturation depth |
| `xr_speculative_unknown_world` | sensor choir, biometric strings, light drums, gesture reeds, impossible bells | future ritual, adaptive ensemble, unknown-world invocation | `R31 R40 R63 R64` | `S119 S123 S125 S126 S128` | spectral glass, synthetic grain, biometric shimmer, impossible bloom | morphing geometry field | gestures rewrite topology, system adapts pitch field to session state | adaptive scale, topology morph, speculative resonance |

## Pairing Templates

These pairings show how DreamChamber can produce new languages without pretending that fusion erases source lineages.

| Template | Inputs | Output Behavior |
|---|---|---|
| `cross_rhythm_maqam_andes_bass` | `R25` + `S066` + Andean flute timbre + Black Atlantic bass architecture | offset pulse room with bent melodic arches and deep moving floor weight |
| `raga_gong_spiral` | `R12` + `S096` + Southeast Asian bronze shimmer | slow orbital chamber with tala-like return points and metallic harmonic bloom |
| `overtone_guidance_canopy` | `R58` + `S104` + Amazonian directional song | canopy route where harmonic pillars respond to voice and rattle entrainment |
| `celtic_modal_cathedral` | `R52` + `S050` + orchestral string halo | drifting lament hall with braided melody paths and large reflective tails |
| `desert_procession_sound_system` | `R59` + `S067` + dub saturation | corridor-to-nave transition where procession rhythm becomes sub-bass ceremony |
| `pentatonic_circle_fire` | `R57` + `S017` + flute-and-drum intimacy | centered fire-ring meditation built from heartbeat pulse and open melodic steps |

## Build Rules

- geography-first, feeling-first, and method-first entry should all land in the same address space
- every biome should expose `seed_rhythm_ids` and `seed_scale_ids`
- every biome should surface `culture_instrument_pairs` before generic sound labels
- every biome should expose `human_functions`
- timbre is a first-class authoring layer, not post-processing trivia
- one DreamChamber room can combine lineages, but it must still show where the parts came from
- prototype UX should prefer six to sixteen highly legible biomes over one fake "all world music" browser

## Guardrails

- no source lineage should be reduced to a mood tag alone
- no "healing" or therapy claim should appear in runtime copy without real evidence and compliance review
- no catalytic or altered-state route should be the default entry
- indigenous, ceremonial, and devotional material should keep explicit lineage notes and consent context
- the unknown-world biome stays clearly marked as speculative

## Immediate Uses

Use this layer to:

- expand [dreamchamber-biome-matrix.json](./dreamchamber-biome-matrix.json)
- define DreamChamber scene-state schemas
- author Unreal data assets or Unity ScriptableObjects
- map FMOD or Wwise parameters to lineage-aware rooms
- create school labs by region, state, or method

## Next Actions

1. add source-lineage annotation blocks for each regional node
2. emit `lineage note schema v0.1`
3. connect these nodes to session manifests and provenance tags
4. expand prototype biomes toward the full sixteen-room world map
