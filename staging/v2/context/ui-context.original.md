# UI Context

## Project Type

**CLI pipeline**, not web app. No browser UI. Interaction:

- **Terminal / Kimi chat** — run scripts, read output
- **FS artifacts** — `*.png`, `*.log` = primary visuals
- **registry JSON** — machine + human status

## Artifact Conventions

### Screenshots

- PNG
- Resolution: wokwi-cli viewport (default 800×600 unless override)
- Path: `artifacts/<variant-id>/screenshot.png`
- Proof sim rendered OK

### Serial Logs

- Plain text UTF-8
- Path: `artifacts/<variant-id>/serial.log`
- Content: all `Serial.print*` during scenario
- Debug, assert verify, regression baseline

### Terminal Output

- Prefixes:
  - `[variant-id] ✅` — success
  - `[variant-id] ❌` — fail
  - `[variant-id] ⚠️` — warn / skipped

## Visual Demo (Separate Concern)

`visual-demo/` on `main` may gallery screenshots. **Out of scope** for staging/v2. Gallery → consume `registry.json` + `artifacts/`.
