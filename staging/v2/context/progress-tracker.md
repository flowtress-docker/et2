# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

In progress

## Current Goal

Build the smart-sprinkler variant with `pio run` and run the full pipeline end-to-end.

## Completed

- [x] v2 design spec written (`docs/superpowers/specs/2026-05-09-wokwi-project-publisher-design.md`)
- [x] staging/v2 branch created
- [x] 6-file context method adapted from `sebest-design/6-files-context-method` for Kimi Code
- [x] Context files created:
  - `staging/v2/context/project-overview.md`
  - `staging/v2/context/architecture.md`
  - `staging/v2/context/ui-context.md`
  - `staging/v2/context/code-standards.md`
  - `staging/v2/context/ai-workflow-rules.md`
  - `staging/v2/context/progress-tracker.md`
- [x] `templates/base/` copied from `wokwi-project/` with `src/sketch.ino` layout
- [x] `scripts/variants.js` — variant generator with pinmaps, firmware patchers, board/sensor/display swaps
- [x] 3 base variants generated and validated:
  - `light-esp32/` — ESP32 + photoresistor + LCD1602
  - `temp-arduino/` — Uno + DHT22 + TM1637
  - `motion-pico/` — Pico + MPU6050 + SSD1306
- [x] 4th variant added via cavecrew swarm:
  - `smart-sprinkler/` — ESP32 + soil moisture + DHT22 + OLED + relay
- [x] `variants.js` enhanced with generic `actuator` support and dynamic layout math
- [x] `scripts/build-all.js` — orchestrator with wokwi-cli pre-flight, firmware path validation, retry logic
- [x] `scripts/validate.js` — serial-log assertion + registry stats
- [x] `scripts/screenshot.js` — screenshot collation + baseline comparison
- [x] Cavecrew swarm fixes applied:
  - sketch.ino moved to `src/` in all variants
  - `build_dir` moved to `[platformio]` section in all `platformio.ini`
  - `build-all.js` pre-flight + retry + firmware validation added
  - `screenshot.js` baseline comparison added

## In Progress

- smart-sprinkler variant generation (complete)
- Next: compile and simulate smart-sprinkler

## Next Up

1. Build smart-sprinkler firmware (`pio run`)
2. Run `node scripts/build-all.js` end-to-end
3. Fix any runtime issues discovered
4. Commit variants.js changes

## Open Questions

- Should variant builds be parallelized? PlatformIO can cache packages, but concurrent `pio run` may strain I/O.
- How should large `artifacts/` directories be handled? Currently planned as gitignored local storage.
- Should we add a JSON Schema for `variant.json` to catch config errors early?

## Architecture Decisions

- **CLI-native over Puppeteer**: Browser automation was abandoned due to DOM fragility, bot detection, and lack of publish API. All interaction is now subprocess-based.
- **File-system registry over database**: Simplicity. JSON is human-readable, diffable, and requires no infrastructure.
- **Kimi Code orchestration over CI-only**: Flexible for iterative development. CI integration can be added later by invoking the same scripts.
- **Single `.ino` per variant**: Keeps firmware patching simple (regex on one file). Multi-file support deferred.
- **Cavecrew swarms for implementation**: Parallel investigator/builder/reviewer agents used to write, verify, and fix code efficiently.

## Session Notes

- All 4 scripts pass `node --check` syntax validation.
- All 3 variants have correct structure: `src/sketch.ino`, valid `platformio.ini`, `diagram.json`, `wokwi.toml`, `variant.json`, `scenarios/base.yaml`.
- `templates/base/` compiles with `pio run` after moving sketch to `src/`.
