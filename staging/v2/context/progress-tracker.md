# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

In progress

## Current Goal

Bootstrap the staging/v2 directory structure and context files. Next: implement `variants.js` and `build-all.js`.

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

## In Progress

- Context file setup (this session)

## Next Up

1. Create `scripts/variants.js` — variant generation logic with pinmaps and firmware patchers
2. Create `scripts/build-all.js` — orchestrator entry point
3. Create `templates/base/` — copy from `wokwi-project/`
4. Run first variant generation and validate output structure
5. Run `pio run` on first variant to verify build pipeline
6. Run `wokwi-cli` on first variant to verify simulation pipeline

## Open Questions

- Should variant builds be parallelized? PlatformIO can cache packages, but concurrent `pio run` may strain I/O.
- How should large `artifacts/` directories be handled? Currently planned as gitignored local storage.
- Should we add a JSON Schema for `variant.json` to catch config errors early?

## Architecture Decisions

- **CLI-native over Puppeteer**: Browser automation was abandoned due to DOM fragility, bot detection, and lack of publish API. All interaction is now subprocess-based.
- **File-system registry over database**: Simplicity. JSON is human-readable, diffable, and requires no infrastructure.
- **Kimi Code orchestration over CI-only**: Flexible for iterative development. CI integration can be added later by invoking the same scripts.
- **Single `.ino` per variant**: Keeps firmware patching simple (regex on one file). Multi-file support deferred.

## Session Notes

- Context files adapted from `sebest-design/6-files-context-method` private repo, modified for Kimi Code and the et2 Wokwi CLI pipeline.
- Next session should start by reading all 6 context files in order, then implement `variants.js`.
