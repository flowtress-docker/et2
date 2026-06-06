# UI Context

## Project Type

This is a **CLI automation pipeline**, not a web application. There is no user interface rendered in a browser. Interaction happens via:

- **Terminal / Kimi Code chat** — Operator runs scripts and reviews output
- **File system artifacts** — Screenshots (`*.png`) and serial logs (`*.log`) are the primary visual outputs
- **Registry JSON** — Machine-readable and human-readable status summary

## Artifact Conventions

### Screenshots

- Format: PNG
- Resolution: Determined by wokwi-cli viewport (default 800×600 unless overridden)
- Naming: `artifacts/<variant-id>/screenshot.png`
- Purpose: Visual proof that the simulation rendered correctly

### Serial Logs

- Format: Plain text, UTF-8
- Naming: `artifacts/<variant-id>/serial.log`
- Content: All `Serial.print*` output from the firmware during scenario execution
- Purpose: Debugging, assertion verification, regression baselines

### Terminal Output

- Use colored prefixes for readability:
  - `[variant-id] ✅` — success
  - `[variant-id] ❌` — failure
  - `[variant-id] ⚠️` — warning / skipped

## Visual Demo (Separate Concern)

An HTML gallery of screenshots may be produced by the existing `visual-demo/` system on the main branch. That is **out of scope** for staging/v2. If a gallery is needed, consume `registry.json` and the `artifacts/` directory as inputs to the gallery generator.
