# Slides Workflow (VS Code + Marp)

This workspace uses Markdown as the single source of truth for decks.

## Files
- `slides/deck.md` -> edit this in VS Code
- `slides/vsi_partnership_deck.md` -> VSI partnership + localization paradox deck
- `slides/noizyvox_prompt_pack_17_slide.md` -> full PowerPoint Copilot prompt pack
- `slides/noizyvox_prompt_pack_10_slide_investor.md` -> investor prompt pack
- `slides/noizyvox_prompt_pack_5_slide_exec.md` -> Hollywood executive prompt pack
- `slides/noizyvox_prompt_pack_3min_demo.md` -> 3-minute demo prompt pack
- `slides/dist/` -> exported outputs (`.pptx`, `.pdf`, `.html`)

## Build commands
From repo root:

```bash
npm run slides:pptx
npm run slides:pdf
npm run slides:html
npm run slides:watch
npm run slides:vsi:pptx
npm run slides:vsi:pdf
npm run slides:vsi:html
npm run slides:vsi:watch
npm run demo:vsi
npm run demo:vsi:json
npm run demo:vsi:workflow
```

## VS Code tasks
Use `Cmd+Shift+P` -> `Tasks: Run Task`:
- `Slides: Export PPTX`
- `Slides: Export PDF`
- `Slides: Export HTML`
- `Slides: Watch HTML`

## Notes
- Uses `npx @marp-team/marp-cli` so no global install is required.
- Keep images in `slides/assets/` and reference with relative paths.
