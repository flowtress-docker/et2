# Progress Tracker

Update after every meaningful implementation change.

## Current Phase

In progress

## Current Goal

Build smart-sprinkler variant (`pio run`) + full pipeline E2E.

## Completed

- [x] v2 design spec (`docs/superpowers/specs/2026-05-09-wokwi-project-publisher-design.md`)
- [x] `staging/v2` branch
- [x] 6-file context method (from `sebest-design/6-files-context-method`) for Kimi
- [x] Context files under `staging/v2/context/` (6 files)
- [x] `templates/base/` from `wokwi-project/`, `src/sketch.ino` layout
- [x] `scripts/variants.js` — pinmaps, patchers, board/sensor/display swaps
- [x] 3 base variants validated: `light-esp32`, `temp-arduino`, `motion-pico`
- [x] 4th variant: `smart-sprinkler` (ESP32 + soil + DHT22 + OLED + relay)
- [x] `variants.js`: generic `actuator`, dynamic layout
- [x] `build-all.js` — preflight, firmware path check, retry
- [x] `validate.js` — serial assert + registry stats
- [x] `screenshot.js` — collation + baseline compare
- [x] Cavecrew fixes: `src/sketch.ino`, `build_dir` in `[platformio]`, build-all preflight/retry, screenshot baseline

## In Progress

- smart-sprinkler gen (done)
- Next: compile + simulate smart-sprinkler

## Next Up

1. `pio run` smart-sprinkler
2. `node scripts/build-all.js` E2E
3. Fix runtime issues
4. Commit `variants.js`

## Open Questions

- Parallel variant builds? PIO cache vs I/O strain.
- Large `artifacts/` handling? Gitignored local for now.
- JSON Schema for `variant.json` early validation?

## Architecture Decisions

- **CLI over Puppeteer**: DOM fragility, bot detection, no publish API → subprocess only.
- **FS registry over DB**: JSON human-readable, diffable, zero infra.
- **Kimi orchestration over CI-only**: iterative dev; same scripts in CI later.
- **Single `.ino` per variant**: simple regex patch; multi-file deferred.
- **Cavecrew swarms**: parallel investigator/builder/reviewer for implementation.

## Session Notes

- All 4 scripts pass `node --check`.
- 3 variants: `src/sketch.ino`, valid ini/diagram/toml/variant.json/scenarios.
- `templates/base/` compiles after sketch → `src/`.
