# Architecture Context

## Stack

| Layer       | Technology                | Role                                          |
| ----------- | ------------------------- | --------------------------------------------- |
| Orchestrator| Node.js (ESM)             | Drives generation, build, simulation, registry|
| Firmware    | Arduino C++ / PlatformIO  | Compiles .ino to board-specific binaries      |
| Simulation  | wokwi-cli                 | Headless MCU emulation with scenario automation|
| Circuit     | JSON (diagram.json)       | Part definitions and wiring                   |
| Scenarios   | YAML                      | Automation scripts (delays, set-control, asserts)|
| Registry    | JSON (registry.json)      | Build/simulation result tracking              |

## System Boundaries

- `scripts/` — Orchestration and transformation logic. Owns the build pipeline.
- `templates/base/` — Immutable base project copied from `wokwi-project/`. Never modified in place.
- `variants/<id>/` — Generated, self-contained Wokwi projects. Each has its own diagram.json, sketch.ino, wokwi.toml, platformio.ini, and scenarios/.
- `artifacts/<id>/` — Generated screenshots and serial logs. Ephemeral; gitignored.
- `registry.json` — Aggregated results. Rewritten after every full pipeline run.

## Storage Model

- **File system**: All variant projects, build outputs, artifacts, and the registry live on disk.
- **JSON**: `registry.json` is the only structured data store. No database.
- **Git**: `templates/base/` and `scripts/` are versioned. `variants/` and `artifacts/` are gitignored (generated outputs).

## Auth and Access Model

- **Local execution only**. No server, no auth layer.
- `WOKWI_CLI_TOKEN` environment variable is required for wokwi-cli. Must be set by the operator; never committed.
- No credentials in code. No cookie management. No session state.

## Invariants

1. `templates/base/` is never modified by scripts — it is read-only source of truth.
2. A variant is never simulated unless its firmware compiled successfully.
3. No browser automation is used in any script — all interaction is CLI/subprocess.
4. No credentials or tokens are hardcoded in any file under version control.
5. Each variant directory must be fully self-contained (no relative references outside its tree).
6. `registry.json` is always valid JSON and always contains an ISO-8601 `generatedAt` timestamp.
