# Wokwi Project Publisher v2

## Overview

CLI pipeline: base template → N hardware variants → `pio run` → `wokwi-cli` scenarios → registry of import-ready Wokwi dirs. Replaces v1 Puppeteer publish (fragile: DOM drift, bot detection, no publish API).

## Goals

1. 3+ distinct variants from one base
2. PlatformIO build every variant, no manual steps
3. `wokwi-cli` pass/fail + evidence
4. Screenshots + serial logs
5. `registry.json`: variant id → build/sim paths + metadata

## Core Pipeline Flow

1. **Template Ingest** — `wokwi-project/` → `diagram.json`, `sketch.ino`, `wokwi.toml`, `platformio.ini`, `scenarios/base.yaml`
2. **Variant Generation** — board/sensor/display swap + firmware patch → N dirs
3. **Firmware Build** — `pio run` per variant
4. **Simulation Validation** — `wokwi-cli . --scenario scenarios/base.yaml` + screenshot + serial log
5. **Registry Update** — build/sim status, artifact paths, timestamps in `registry.json`

## Features

### Variant Generator

- Board: Uno ↔ ESP32 ↔ Pico
- Sensor: photoresistor ↔ DHT22 ↔ MPU6050
- Display: LCD1602 ↔ TM1637 ↔ SSD1306
- Pin remap via per-board pinmap tables
- Firmware regex patch: includes, pins, baud, lib ctors
- PlatformIO env rewrite (board, platform, framework, `lib_deps`)
- `wokwi.toml` firmware/elf path update

### Build Orchestrator

- Sequential or parallel builds
- Preflight: `wokwi-cli`, `WOKWI_CLI_TOKEN`
- Timeouts on `pio run`, `wokwi-cli`
- Build fail → skip sim; sim fail still records build OK

### Artifact Capture

- Screenshot at configurable sim time
- Serial log for assertion parse
- `artifacts/<variant-id>/screenshot.png`, `serial.log`

### Registry

- JSON: build + sim + paths + metadata
- Append per run; full rewrite on regen

## Scope

### In Scope

- Node scripts: `build-all.js`, `variants.js`, `validate.js`
- Regex firmware patch, PlatformIO, wokwi-cli, screenshots, serial, `registry.json`

### Out of Scope

- Auto upload wokwi.com (no public API)
- Private projects (Wokwi Pro)
- Custom chips (manual upload)
- Multi-file Arduino libs (single `sketch.ino` for now)
- Web UI / gallery (`visual-demo/` separate)
- CI/GitHub Actions (later)

## Success Criteria

1. Base template: `pio run` + `wokwi-cli` pass
2. Generator: 3+ distinct configs
3. Each variant compiles for its board
4. Each passes automation scenario
5. Screenshot + serial per passing variant
6. `registry.json` complete
7. Each variant dir zip-importable to wokwi.com
