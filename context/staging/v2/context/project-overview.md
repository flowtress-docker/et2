# Wokwi Project Publisher v2

## Overview

CLI-native pipeline that generates multiple hardware variants of base microcontroller simulation, compiles firmware for each variant, and validates them through automated wokwi-cli scenarios. output is registry of known-good project directories — each ready to be zipped and imported into wokwi.com.

This is successor to v1 Puppeteer-based browser automation approach, which was abandoned due to fragility (DOM selector drift, bot detection, no public publish API).

## Goals

1. Generate 3+ distinct hardware variants from single base template
2. Compile firmware for every variant via PlatformIO without manual intervention
3. Run automated simulation scenarios via wokwi-cli and capture pass/fail evidence
4. Produce screenshots and serial logs as proof-of-work artifacts
5. Maintain JSON registry mapping variant IDs to build results, artifact paths, and metadata

## Core Pipeline Flow

1. **Template Ingest** — Read base project from `wokwi-project/` (diagram.json, sketch.ino, wokwi.toml, platformio.ini, scenarios/base.yaml)
2. **Variant Generation** — Apply transformation rules (board swap, sensor swap, display swap, firmware patch) to produce N variant directories
3. **Firmware Build** — Run `pio run` in each variant directory to compile the target binary/hex
4. **Simulation Validation** — Run `wokwi-cli . --scenario scenarios/base.yaml` with screenshot and serial-log capture
5. **Registry Update** — Record build status, simulation status, artifact paths, and timestamps in `registry.json`

## Features

### Variant Generator

- Board swap: Arduino Uno ↔ ESP32 DevKit v1 ↔ Raspberry Pi Pico
- Sensor swap: photoresistor ↔ DHT22 ↔ MPU6050
- Display swap: LCD1602 ↔ TM1637 ↔ SSD1306
- Automatic pin remapping via per-board pinmap tables
- Firmware regex patching for includes, pin constants, baud rates, library constructors
- PlatformIO environment rewriting (board, platform, framework, lib_deps)
- wokwi.toml firmware/elf path updating

### Build Orchestrator

- Sequential or parallel variant builds
- Pre-flight checks for `wokwi-cli` and `WOKWI_CLI_TOKEN`
- Timeout-guarded `pio run` and `wokwi-cli` invocations
- Failure isolation: build failure skips simulation; simulation failure still records build success

### Artifact Capture

- Screenshot per variant at configurable simulation time
- Serial log capture for post-run assertion parsing
- Artifact directory structure: `artifacts/<variant-id>/screenshot.png` + `serial.log`

### Registry

- JSON file tracking build results, simulation results, artifact paths, and metadata
- Append-only per run; full rewrite on regeneration

## Scope

### In Scope

- Node.js orchestration scripts (`build-all.js`, `variants.js`, `validate.js`)
- Variant generation with regex-based firmware patching
- PlatformIO firmware compilation
- wokwi-cli scenario execution
- Screenshot and serial-log capture
- JSON registry generation

### Out of Scope

- Automated upload to wokwi.com (still no public API)
- Private projects (requires Wokwi Pro plan)
- Custom parts/chips (requires manual chip definition upload)
- Multi-file Arduino libraries (keep to single sketch.ino for now)
- Web UI or gallery generation (separate `visual-demo/` concern)
- CI/GitHub Actions integration (future work)

## Success Criteria

1. Base template compiles with `pio run` and simulates with `wokwi-cli`
2. Variant generator produces 3+ distinct hardware configurations
3. Each variant compiles successfully for its target board
4. Each variant passes its automation scenario
5. Screenshots and serial logs are captured for every passing variant
6. `registry.json` contains build + simulation results for all variants
7. Each variant directory is self-contained project that can be zipped and imported into wokwi.com