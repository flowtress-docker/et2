# Code Standards

## General

- Keep modules small and single-purpose: `variants.js` generates, `build-all.js` orchestrates, `validate.js` asserts.
- Fix root causes, do not layer workarounds. If a variant fails to compile, fix the firmware patch or pinmap — do not special-case in the orchestrator.
- Do not mix unrelated concerns in one script. Generation logic does not invoke `pio run`.

## Node.js / TypeScript

- Use ESM (`"type": "module"` in package.json or `.js` with `import`).
- Prefer `async/await` over callbacks.
- Use `execSync` from `child_process` for CLI invocations, but always wrap in `try/catch` and set `timeout`.
- Validate external input at system boundaries: check `variant.json` schema before trusting it, catch YAML parse errors, validate JSON structure.
- Use `fs-extra` for atomic writes and directory creation.

## Arduino / C++ Firmware

- One `.ino` file per variant. No multi-file libraries in variants (base may use PlatformIO `lib_deps`).
- Scenario-driven: write the firmware to satisfy the assertions in `scenarios/base.yaml`.
- Keep `setup()` minimal and non-blocking. No `while (!Serial)` loops.
- Use `#define` for pin numbers and constants — easier to regex-patch.
- Prefix serial output with structured tags when possible: `LUX:`, `TEMP:`, `MOTION:` — makes log parsing reliable.

## JSON / YAML

- `diagram.json`: Must validate against Wokwi's implied schema (version, author, editor, parts[], connections[]).
- `variant.json`: Strict schema (id, name, base, board, sensors, display, transforms). Add a JSON Schema file if the team grows.
- `scenarios/*.yaml`: Validate step types against known wokwi-cli scenario syntax before writing.
- `registry.json`: Always write with `spaces: 2` for human readability in diffs.

## PlatformIO Configuration

- Pin `platform` versions when possible to avoid upstream breakage: `platform = espressif32@6.5.0` instead of bare `espressif32`.
- Use `build_dir` explicitly so `wokwi.toml` paths are predictable.
- Keep `lib_deps` minimal. Only add libraries required by the variant's sensor/display combo.

## File Organization

- `scripts/` — Node.js orchestration and transformation logic
- `templates/base/` — Read-only base project (copied from `wokwi-project/`)
- `variants/<id>/` — Generated self-contained Wokwi projects
- `artifacts/<id>/` — Generated screenshots and serial logs (gitignored)
- `registry.json` — Pipeline result summary
