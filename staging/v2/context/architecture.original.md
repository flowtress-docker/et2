# Architecture Context

## Stack

| Layer       | Technology                | Role                                          |
| ----------- | ------------------------- | --------------------------------------------- |
| Orchestrator| Node.js (ESM)             | generation, build, sim, registry              |
| Firmware    | Arduino C++ / PlatformIO  | `.ino` → board binaries                       |
| Simulation  | wokwi-cli                 | headless MCU + scenario automation            |
| Circuit     | JSON (diagram.json)       | parts + wiring                                |
| Scenarios   | YAML                      | delays, set-control, asserts                  |
| Registry    | JSON (registry.json)      | build/sim tracking                            |

## System Boundaries

- `scripts/` — orchestration + transforms. Owns pipeline.
- `templates/base/` — immutable copy of `wokwi-project/`. Never edit in place.
- `variants/<id>/` — generated Wokwi project (diagram, sketch, toml, ini, scenarios).
- `artifacts/<id>/` — screenshots, serial logs. Ephemeral; gitignored.
- `registry.json` — aggregated results. Rewritten each full run.

## Storage Model

- **FS**: variants, builds, artifacts, registry on disk.
- **JSON**: `registry.json` only structured store. No DB.
- **Git**: version `templates/base/`, `scripts/`. Gitignore `variants/`, `artifacts/`.

## Auth and Access Model

- Local only. No server, no auth.
- `WOKWI_CLI_TOKEN` env required for wokwi-cli. Never commit.
- No creds in code. No cookies. No session state.

## Invariants

1. `templates/base/` read-only for scripts.
2. No sim unless firmware built OK.
3. No browser automation — CLI/subprocess only.
4. No hardcoded tokens in VCS.
5. Each variant dir self-contained (no refs outside tree).
6. `registry.json` valid JSON + ISO-8601 `generatedAt`.
