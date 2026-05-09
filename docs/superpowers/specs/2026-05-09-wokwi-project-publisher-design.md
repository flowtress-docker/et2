# Wokwi Project Publisher — Design Spec (v2)

> **Version:** 2.0 — CLI-native pipeline  
> **Based on:** [v1 spec](#) (Puppeteer-based browser automation, superseded)

## Context

Wokwi has no public API for creating `wokwi.com/projects/XXXX` URLs programmatically. Context7 MCP verification confirmed:
- No GitHub project loader URL exists (`wokwi.com/projects/github/...` is unsupported)
- No REST API for project creation
- `wokwi-cli mcp` is experimental and only exposes simulation tools, not project publishing
- The only way to get a permanent shareable project URL is through the Wokwi browser UI

**v2 pivot:** Instead of fragile browser automation (Puppeteer), Kimi Code orchestrates a **local build-and-simulate pipeline** using `wokwi-cli`. Projects are validated as real, working simulations before any manual web upload. The output is a collection of known-good project directories that can be imported into wokwi.com or shared as self-contained ZIPs.

## Objective

Build a Kimi Code + `wokwi-cli` pipeline that:
1. Generates multiple hardware variants from a base template
2. Compiles firmware for each variant via PlatformIO
3. Runs automated simulation scenarios via `wokwi-cli`
4. Captures screenshots and serial logs as proof-of-work
5. Produces a registry of validated, ready-to-publish projects

## Dependencies

| Package / Tool | Version | Purpose |
|----------------|---------|---------|
| `wokwi-cli` | `latest` | Local simulation, scenario execution, screenshot capture |
| `platformio` | `latest` | Firmware compilation (`pio run`) |
| `node` | `≥ 18` | Runtime for helper scripts |
| `fs-extra` | `^11.2.0` | Atomic JSON registry writes |
| `js-yaml` | `^4.1.0` | Parse / generate `scenarios/*.yaml` |
| `chalk` | `^5.3.0` | Colored CLI output (optional) |

Install:
```bash
# Wokwi CLI
curl -L https://wokwi.com/ci/install.sh | sh

# PlatformIO
pip install platformio

# Node deps (for Kimi Code helper scripts)
npm install fs-extra js-yaml chalk
```

## Architecture

```
et2/
├── docs/superpowers/specs/          ← This spec
├── staging/v2/
│   ├── scripts/
│   │   ├── build-all.js             # Kimi Code orchestrator entry point
│   │   ├── variants.js              # Variant generation rules & pinmaps
│   │   ├── validate.js              # Post-simulation assertion checker
│   │   └── screenshot.js            # Screenshot collation helper
│   ├── registry.json                # Build + simulation result registry
│   ├── artifacts/                   # Generated screenshots & logs
│   │   ├── light-esp32/
│   │   │   ├── screenshot.png
│   │   │   └── serial.log
│   │   └── ...
│   │
│   ├── templates/
│   │   └── base/                    # Base project template
│   │       ├── diagram.json
│   │       ├── sketch.ino
│   │       ├── wokwi.toml
│   │       ├── platformio.ini
│   │       └── scenarios/
│   │           └── base.yaml
│   │
│   └── variants/                    # Generated + validated variant projects
│       ├── light-esp32/
│       ├── temp-arduino/
│       └── motion-pico/
│
└── wokwi-project/                   # Canonical interactive demo (source of truth)
```

## Data Flow

```
Base Template (wokwi-project/)
    │
    ▼
Kimi Code + variants.js ──► Variant Projects (diagram.json + sketch.ino + wokwi.toml)
    │
    ├──► pio run ──► Compiled firmware (.hex / .bin / .elf)
    │
    └──► wokwi-cli . --scenario scenarios/base.yaml
            │
            ├──► Simulation passes → Screenshot + Serial log
            │
            └──► Simulation fails → Error log, skip registry entry
    │
    ▼
Registry (registry.json) + Artifacts (screenshots/)
    │
    ▼
Manual import → wokwi.com/projects/new → Permanent Project URL
```

## Components

### 1. Base Template (`templates/base/`)

A valid Wokwi project with:
- `diagram.json` — circuit definition
- `sketch.ino` — Arduino/ESP32 firmware
- `wokwi.toml` — simulator config (firmware path, ELF path)
- `platformio.ini` — build environment
- `scenarios/base.yaml` — automation scenario

**Cross-reference:** The canonical base project lives at `../../wokwi-project/` (repo root). Key files:
- [`wokwi-project/diagram.json`](../../wokwi-project/diagram.json) — Arduino Uno + photoresistor + LCD1602
- [`wokwi-project/src/light-sensor.ino`](../../wokwi-project/src/light-sensor.ino) — Lux/ADC display firmware
- [`wokwi-project/wokwi.toml`](../../wokwi-project/wokwi.toml) — Simulator config (firmware = `.pio/build/uno/firmware.hex`)
- [`wokwi-project/platformio.ini`](../../wokwi-project/platformio.ini) — PlatformIO env: `uno`, `atmelavr`, `arduino` framework, `LiquidCrystal` lib
- [`wokwi-project/scenarios/base.yaml`](../../wokwi-project/scenarios/base.yaml) — Validation scenario (`wait-serial: 'LUX:'`)

### 2. Variant Generator (`scripts/variants.js`)

Transforms the base template into N variants by applying configurable rules.

#### Concrete Variant Transformation Rules

| Rule | Field | Transformation | Example |
|------|-------|---------------|---------|
| **Board swap** | `parts[].type` (id = `mcu`) | Replace MCU part + update `wokwi.toml` firmware path + update `platformio.ini` env | `wokwi-arduino-uno` → `wokwi-esp32-devkit-v1` → `wokwi-pi-pico` |
| **Board swap** | `connections` (MCU pins) | Remap all connections from old board pin names to new board pin names using per-board pinmap tables | `uno:A0` → `esp:A0` (ESP32) or `pico:GP26` (Pico) |
| **Sensor swap** | `parts[].type` (sensor id) | Replace sensor part type, keep position if footprint-compatible, else nudge `{top,left}` | `wokwi-photoresistor-sensor` → `wokwi-dht22` → `wokwi-mpu6050` |
| **Sensor swap** | `parts[].attrs` | Inject sensor-specific default attributes | DHT22: `{temperature: "25", humidity: "50"}`; Photoresistor: `{lux: "50"}` |
| **Sensor swap** | `connections` (sensor pins) | Rewire sensor VCC/GND/signal to MCU using new sensor's pinout | Photoresistor `AO` → DHT22 `SDA`; MPU6050 `SCL`/`SDA` |
| **Display swap** | `parts[].type` (display id) | Replace display part type, reposition if needed | `wokwi-lcd1602` → `wokwi-tm1637-7segment` → `wokwi-ssd1306` |
| **Display swap** | `connections` (display pins) | Rewire display control/data pins to MCU | LCD RS/E/D4-D7 → TM1637 CLK/DIO → OLED SDA/SCL |
| **Firmware patch** | `sketch.ino` | Regex-driven replacements for: `#include`, `pinMode`, `analogRead`/`digitalRead`, `Serial.begin` baud, `Wire.begin` for I2C, LCD constructor pins, library names | See `PATCHERS` table below |
| **Firmware patch** | `platformio.ini` | Update `board`, `platform`, `framework`, `lib_deps` to match target MCU and peripherals | `uno`/`atmelavr`/`arduino` → `esp32dev`/`espressif32`/`arduino` |
| **Scenario patch** | `scenarios/*.yaml` | Update `part-id` references to match new diagram IDs, adjust `wait-serial` strings to match new firmware output | `wait-serial: 'LUX:'` → `wait-serial: 'Temp:'` |
| **wokwi.toml patch** | `wokwi.toml` | Update `firmware` and `elf` paths to match variant's PlatformIO `build_dir` output | `.pio/build/uno/firmware.hex` → `.pio/build/esp32dev/firmware.bin` |

**PATCHERS (Firmware Regex Rules)**

| Variant Trigger | Regex Pattern | Replacement |
|-----------------|---------------|-------------|
| Board = ESP32 | `#include <LiquidCrystal.h>` | `#include <LiquidCrystal.h>\n#include <WiFi.h>` |
| Board = ESP32 | `Serial.begin(9600)` | `Serial.begin(115200)` |
| Board = Pico | `#include <LiquidCrystal.h>` | `#include <LiquidCrystal.h>\n#include <Wire.h>` |
| Sensor = DHT22 | `#include <LiquidCrystal.h>` | `#include <LiquidCrystal.h>\n#include <DHT.h>` |
| Sensor = DHT22 | `const int ldrPin = A0;` | `const int dhtPin = 15;\n#define DHTTYPE DHT22` |
| Sensor = DHT22 | `int raw = analogRead(ldrPin);` | `float temp = dht.readTemperature();\n  float hum = dht.readHumidity();` |
| Sensor = Photoresistor | `float lux = pow(RL10 * 1e3 * pow(10, GAMMA) / resistance, (1.0 / GAMMA));` | (keep as-is) |
| Sensor = MPU6050 | `analogRead(ldrPin)` | `mpu.getAcceleration(&ax, &ay, &az)` (requires Wire + MPU6050 lib) |
| Display = TM1637 | `LiquidCrystal lcd(12, 11, 10, 9, 8, 7);` | `TM1637Display display(CLK, DIO);` |
| Display = OLED | `LiquidCrystal lcd(12, 11, 10, 9, 8, 7);` | `Adafruit_SSD1306 display(128, 64, &Wire, -1);` |

#### Pinmap Reference (excerpt)

| Function | Arduino Uno | ESP32 DevKit v1 | Raspberry Pi Pico |
|----------|-------------|-----------------|-------------------|
| Analog 0 | `A0` | `A0` | `GP26` |
| I2C SDA | `A4` (shared) | `D21` | `GP4` |
| I2C SCL | `A5` (shared) | `D22` | `GP5` |
| SPI MOSI | `D11` | `D23` | `GP19` |
| SPI MISO | `D12` | `D19` | `GP16` |
| UART TX | `D1` | `D1` / `TX` | `GP0` |
| UART RX | `D0` | `D3` / `RX` | `GP1` |
| Digital (generic) | `D2`–`D13` | `D2`–`D33` | `GP2`–`GP28` |

Each variant is written to `variants/<variant-id>/` as a self-contained Wokwi project.

### 3. Build Orchestrator (`scripts/build-all.js`)

Kimi Code (or a human operator running via Kimi Code) executes this Node.js script to drive the entire pipeline. It does **not** use Puppeteer; all interaction is via child-process invocation of `pio` and `wokwi-cli`.

```javascript
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import yaml from 'js-yaml';

const STAGING_DIR = path.resolve('staging/v2');
const VARIANTS_DIR = path.join(STAGING_DIR, 'variants');
const ARTIFACTS_DIR = path.join(STAGING_DIR, 'artifacts');
const REGISTRY_PATH = path.join(STAGING_DIR, 'registry.json');
const TEMPLATE_DIR = path.join(STAGING_DIR, 'templates', 'base');

async function buildVariant(variantId) {
  const variantDir = path.join(VARIANTS_DIR, variantId);
  const metaPath = path.join(variantDir, 'variant.json');
  if (!(await fs.pathExists(metaPath))) return null;

  const meta = await fs.readJson(metaPath);
  const artifactDir = path.join(ARTIFACTS_DIR, variantId);
  await fs.ensureDir(artifactDir);

  const result = {
    variantId,
    board: meta.board,
    sensors: meta.sensors,
    display: meta.display,
    build: { ok: false, stdout: '', stderr: '' },
    simulate: { ok: false, stdout: '', stderr: '', screenshot: null, serialLog: null },
    validatedAt: new Date().toISOString(),
  };

  // ── Step 1: Compile firmware ───────────────────────────────
  try {
    const stdout = execSync('pio run', {
      cwd: variantDir,
      encoding: 'utf-8',
      timeout: 120000,
    });
    result.build = { ok: true, stdout, stderr: '' };
  } catch (err) {
    result.build = { ok: false, stdout: err.stdout || '', stderr: err.stderr || '' };
    console.error(`[${variantId}] ❌ Build failed`);
    return result;
  }

  // ── Step 2: Run simulation with scenario ───────────────────
  const screenshotPath = path.join(artifactDir, 'screenshot.png');
  const serialLogPath = path.join(artifactDir, 'serial.log');
  const scenarioPath = path.join(variantDir, 'scenarios', 'base.yaml');

  try {
    const cmd = [
      'wokwi-cli',
      variantDir,
      '--scenario', scenarioPath,
      '--screenshot-part', meta.board.id || 'mcu',
      '--screenshot-time', '5000',
      '--screenshot-file', screenshotPath,
      '--serial-log-file', serialLogPath,
      '--timeout', '30000',
    ].join(' ');

    const stdout = execSync(cmd, {
      encoding: 'utf-8',
      timeout: 60000,
    });

    result.simulate = {
      ok: true,
      stdout,
      stderr: '',
      screenshot: screenshotPath,
      serialLog: serialLogPath,
    };
    console.log(`[${variantId}] ✅ Simulation passed`);
  } catch (err) {
    result.simulate = {
      ok: false,
      stdout: err.stdout || '',
      stderr: err.stderr || '',
      screenshot: null,
      serialLog: null,
    };
    console.error(`[${variantId}] ❌ Simulation failed`);
  }

  return result;
}

async function main() {
  // Generate variants first (invokes variants.js logic)
  await import('./variants.js'); // side-effect: writes to VARIANTS_DIR

  const variantIds = await fs.readdir(VARIANTS_DIR);
  const registry = {
    generatedAt: new Date().toISOString(),
    projects: [],
  };

  for (const variantId of variantIds) {
    const result = await buildVariant(variantId);
    if (result) registry.projects.push(result);
  }

  await fs.writeJson(REGISTRY_PATH, registry, { spaces: 2 });
  console.log(`\nRegistry written to ${REGISTRY_PATH}`);
}

main().catch(console.error);
```

**Key implementation details:**
- **No browser automation:** Everything is CLI/subprocess. No Puppeteer, no cookies, no DOM selectors.
- **PlatformIO build:** `pio run` compiles the `.ino` into the firmware binary/hex that `wokwi.toml` references.
- **wokwi-cli simulation:** Runs headlessly in CI or locally. The `--scenario` flag drives sensor state changes and assertions.
- **Artifact capture:** Screenshots and serial logs are written to `artifacts/<variant-id>/` for human verification.
- **Failure isolation:** A build failure skips simulation; a simulation failure still records the build success so you can inspect later.

### 4. Registry (`staging/v2/registry.json`)

JSON file tracking all generated and validated projects:

```json
{
  "generatedAt": "2026-05-09T12:00:00Z",
  "projects": [
    {
      "variantId": "light-esp32",
      "board": {
        "type": "wokwi-esp32-devkit-v1",
        "platformioEnv": "esp32dev"
      },
      "sensors": ["wokwi-photoresistor-sensor"],
      "display": "wokwi-lcd1602",
      "build": {
        "ok": true,
        "stdout": "...",
        "stderr": ""
      },
      "simulate": {
        "ok": true,
        "stdout": "...",
        "stderr": "",
        "screenshot": "staging/v2/artifacts/light-esp32/screenshot.png",
        "serialLog": "staging/v2/artifacts/light-esp32/serial.log"
      },
      "validatedAt": "2026-05-09T12:05:00Z"
    }
  ]
}
```

## Error Handling

| Scenario | Handling |
|----------|----------|
| PlatformIO build failure | Log stderr, skip simulation for this variant, continue with next |
| Missing `wokwi-cli` | Pre-flight check in `build-all.js`; exit early with install instructions |
| Missing `WOKWI_CLI_TOKEN` | Required for wokwi-cli; prompt user to set env var |
| Scenario assertion failure | `wokwi-cli` exits non-zero; capture stdout/stderr, mark `simulate.ok: false` |
| Invalid `diagram.json` | Caught during `wokwi-cli` startup; logged to stderr |
| Firmware path mismatch | Validate `wokwi.toml` `firmware` path exists post-`pio run` before launching sim |

## Testing

1. **Build first:** `pio run` on every variant before simulation
2. **Scenario-driven validation:** Each variant has a `scenarios/base.yaml` that asserts expected behavior
3. **Screenshot diff:** Capture baseline screenshots; future runs can pixel-compare for regression
4. **Serial log parsing:** Parse `serial.log` for expected output strings as a secondary assertion layer

## Security

- `WOKWI_CLI_TOKEN` is the only credential; stored as env var, never committed
- No browser cookies or session state to manage
- All execution is local; no external APIs except Wokwi's simulation runtime (authenticated via token)

## Success Criteria

- [ ] Base template compiles with `pio run` and simulates with `wokwi-cli`
- [ ] Variant generator produces 3+ distinct hardware configurations
- [ ] Each variant compiles successfully for its target board
- [ ] Each variant passes its automation scenario
- [ ] Screenshots and serial logs are captured for every passing variant
- [ ] `registry.json` contains build + simulation results for all variants
- [ ] Each variant directory is a self-contained project that can be zipped and imported into wokwi.com

## Out of Scope

- Automated upload to wokwi.com (still no API; manual import required)
- Private projects (requires Wokwi Pro plan)
- Custom parts/chips (requires manual chip definition upload)
- Multi-file projects with libraries (keep to single sketch.ino for now)
- Real-time collaboration features

## Risks

| Risk | Mitigation |
|------|------------|
| PlatformIO board package drift | Pin `platformio.ini` platform versions; lock `platform_packages` |
| `wokwi-cli` breaking changes | Pin CLI version in CI; test before upgrading |
| Simulation flakiness | Add retry logic (max 2) for `wokwi-cli` invocations |
| Long build times | Parallelize variant builds via `Promise.all` with concurrency limit |
| Large artifact storage | `.gitignore` `artifacts/`; store only in CI or local disk |

---

## Appendix A: File Structure (Exact Paths)

All paths are relative to the repository root (`et2/`).

```
et2/
├── docs/superpowers/specs/
│   └── 2026-05-09-wokwi-project-publisher-design.md   ← This spec
│
├── staging/v2/
│   ├── scripts/
│   │   ├── build-all.js                                # Kimi Code orchestrator (this spec §3)
│   │   ├── variants.js                                 # Variant generation rules (this spec §2)
│   │   ├── validate.js                                 # Serial-log / screenshot assertion helper
│   │   ├── screenshot.js                               # Baseline screenshot comparison
│   │   └── README.md                                   # Local usage instructions
│   │
│   ├── registry.json                                   # Build + simulation result registry (this spec §4)
│   │
│   ├── artifacts/                                      # Generated screenshots & logs (gitignored)
│   │   ├── light-esp32/
│   │   │   ├── screenshot.png
│   │   │   └── serial.log
│   │   ├── temp-arduino/
│   │   │   ├── screenshot.png
│   │   │   └── serial.log
│   │   └── motion-pico/
│   │       ├── screenshot.png
│   │       └── serial.log
│   │
│   ├── templates/
│   │   └── base/
│   │       ├── diagram.json                            # Copied from wokwi-project/diagram.json
│   │       ├── sketch.ino                              # Copied from wokwi-project/src/light-sensor.ino
│   │       ├── wokwi.toml                              # Copied from wokwi-project/wokwi.toml
│   │       ├── platformio.ini                          # Copied from wokwi-project/platformio.ini
│   │       └── scenarios/
│   │           └── base.yaml                           # Copied from wokwi-project/scenarios/base.yaml
│   │
│   └── variants/                                       # Generated by variants.js
│       ├── light-esp32/
│       │   ├── variant.json                            # Metadata: board, sensors, display
│       │   ├── diagram.json                            # Transformed circuit
│       │   ├── sketch.ino                              # Transformed firmware
│       │   ├── wokwi.toml                              # Transformed simulator config
│       │   ├── platformio.ini                          # Transformed build config
│       │   └── scenarios/
│       │       └── base.yaml                           # Transformed validation scenario
│       ├── temp-arduino/
│       │   └── (same layout)
│       └── motion-pico/
│           └── (same layout)
│
└── wokwi-project/                                      # Canonical interactive demo (source of truth)
    ├── diagram.json
    ├── platformio.ini
    ├── wokwi.toml
    ├── src/
    │   └── light-sensor.ino
    └── scenarios/
        └── base.yaml
```

## Appendix B: Existing Artifact Cross-Reference

| Artifact | Path | Role in Publisher |
|----------|------|-------------------|
| Base circuit definition | `wokwi-project/diagram.json` | Source template for `templates/base/diagram.json`; MCU, sensor, and display IDs are parsed and transformed by `variants.js` |
| Base firmware | `wokwi-project/src/light-sensor.ino` | Source template for `templates/base/sketch.ino`; `#include`, pin constants, and `setup()`/`loop()` bodies are regex-patched per variant |
| Build config | `wokwi-project/platformio.ini` | Source for `templates/base/platformio.ini`; `env`, `platform`, `board`, `framework`, and `lib_deps` are rewritten per target MCU |
| Simulator config | `wokwi-project/wokwi.toml` | Source for `templates/base/wokwi.toml`; `firmware` and `elf` paths are updated to match each variant's PlatformIO `build_dir` output |
| Validation scenario | `wokwi-project/scenarios/base.yaml` | Source for `templates/base/scenarios/base.yaml`; `part-id` references and `wait-serial` assertions are updated to match variant-specific IDs and output strings |

## Appendix C: Variant `variant.json` Schema

Each generated variant directory contains a `variant.json` metadata file:

```json
{
  "id": "light-esp32",
  "name": "Light Sensor (ESP32)",
  "base": "base",
  "board": {
    "type": "wokwi-esp32-devkit-v1",
    "platformioEnv": "esp32dev",
    "platformioPlatform": "espressif32",
    "platformioBoard": "esp32dev",
    "platformioFramework": "arduino"
  },
  "sensors": [
    {
      "id": "ldr",
      "type": "wokwi-photoresistor-sensor",
      "attrs": { "lux": "50" }
    }
  ],
  "display": {
    "id": "lcd",
    "type": "wokwi-lcd1602"
  },
  "transforms": [
    { "rule": "board-swap", "from": "wokwi-arduino-uno", "to": "wokwi-esp32-devkit-v1" },
    { "rule": "firmware-patch", "target": "Serial.begin", "replace": "115200" }
  ]
}
```

## Appendix D: Kimi Code Workflow

When a human (or agent) asks Kimi Code to "build the Wokwi simulations," the expected interaction is:

```
User: "Build all Wokwi variants"
Kimi Code:
  1. Read wokwi-project/ base artifacts
  2. Run: node staging/v2/scripts/variants.js
  3. For each variant in staging/v2/variants/:
     a. Run: pio run
     b. Run: wokwi-cli . --scenario scenarios/base.yaml --screenshot-file ... --serial-log-file ...
     c. Parse results
  4. Update registry.json
  5. Report: pass/fail per variant, artifact paths, next steps
```

Kimi Code may also be asked to:
- **Add a new variant:** Edit `variants.js` config, regenerate, rebuild
- **Debug a failing simulation:** Inspect `serial.log` and `screenshot.png`, suggest firmware fixes
- **Export for web:** Zip a variant directory and prompt the user to upload to `wokwi.com/projects/new`
