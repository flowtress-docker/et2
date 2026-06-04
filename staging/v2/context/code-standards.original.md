# Code Standards

## General

- Small single-purpose modules: `variants.js` generate, `build-all.js` orchestrate, `validate.js` assert.
- Fix root cause, no orchestrator workarounds. Compile fail → fix patch/pinmap.
- Generation logic must not call `pio run`.

## Node.js / TypeScript

- ESM (`"type": "module"` or `.js` + `import`).
- Prefer `async/await`.
- `execSync` for CLI: always `try/catch` + `timeout`.
- Validate at boundaries: `variant.json` schema, YAML parse, JSON shape.
- `fs-extra` for atomic writes + mkdir.

## Arduino / C++ Firmware

- One `.ino` per variant. No multi-file libs in variants (base may use `lib_deps`).
- Scenario-driven: firmware satisfies `scenarios/base.yaml`.
- Minimal non-blocking `setup()`. No `while (!Serial)`.
- `#define` pins/constants — regex-patch friendly.
- Structured serial tags: `LUX:`, `TEMP:`, `MOTION:` — reliable log parse.

## JSON / YAML

- `diagram.json`: Wokwi schema (version, author, editor, parts[], connections[]).
- `variant.json`: strict schema (id, name, base, board, sensors, display, transforms). Add JSON Schema if team grows.
- `scenarios/*.yaml`: validate step types vs wokwi-cli syntax.
- `registry.json`: `spaces: 2` for readable diffs.

## PlatformIO Configuration

- Pin platforms when possible: `platform = espressif32@6.5.0` not bare `espressif32`.
- Explicit `build_dir` for predictable `wokwi.toml` paths.
- Minimal `lib_deps` — only what variant needs.

## File Organization

- `scripts/` — Node orchestration + transforms
- `templates/base/` — read-only base (`wokwi-project/`)
- `variants/<id>/` — generated projects
- `artifacts/<id>/` — screenshots, logs (gitignored)
- `registry.json` — pipeline summary
