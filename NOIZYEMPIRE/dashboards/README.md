# NOIZY Creator Workstation

Voice-first creative command center for `NOIZY.AI`.

## Purpose

Minimize hand strain by running a single choreography:

`Voice -> Idea Capture -> Markdown -> Slides -> Prototype`

## Components

- `workstation/cockpit.html`  
  Visual control panel for the workflow.
- `workstation/aquarium.html`  
  Living ecosystem view for ideas, AVAs, and composer guild state.
- `workstation/commands.json`  
  Allowlisted command phrases and actions.
- `tools/command_router.py`  
  Routes typed/voice phrases to safe local commands.
- `tools/dreamchamber_orchestrator.py`  
  DreamChamber and Aquarium automation actions.
- `ideas/inbox.md`  
  Timestamped raw idea capture.
- `slides/deck.md`  
  Presentation source of truth.

## Quick start

From repo root:

```bash
npm run workstation:open
npm run workstation:aquarium
npm run workstation:command -- "capture idea noizy creator workstation demo"
npm run workstation:command -- "export slides pptx"
```

## Command routing

The router matches phrases from `commands.json`.

Examples:

- `capture idea <text>`
- `export slides pptx`
- `export slides pdf`
- `export slides html`
- `watch slides`
- `open cockpit`
- `open aquarium`
- `seed idea <text>`
- `grow concept <text>`
- `retrieve idea <text>`
- `join as composer <name>`
- `promote to noizykidz teacher <name-or-id>`
- `list composer guild`
- `list noizykidz teachers`

## Safety

- Only allowlisted commands are executable.
- Unknown phrases do nothing and return suggestions.
- Add/edit phrases in `workstation/commands.json`.

## Optional voice hookup

Use any speech recognizer (Whisper/Talon/etc.) to pass transcript text to:

```bash
npm run workstation:command -- "<transcribed phrase>"
```
