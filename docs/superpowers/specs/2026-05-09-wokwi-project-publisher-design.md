# Wokwi Project Publisher — Design Spec

## Context

Wokwi has no public API for creating `wokwi.com/projects/XXXX` URLs programmatically. Context7 MCP verification confirmed:
- No GitHub project loader URL exists (`wokwi.com/projects/github/...` is unsupported)
- No REST API for project creation
- `wokwi-cli mcp` is experimental and only exposes simulation tools, not project publishing
- The only way to get a permanent shareable project URL is through the Wokwi browser UI

## Objective

Build a Puppeteer-based automation system that creates Wokwi projects with permanent URLs and generates multiple hardware variants of the same base project.

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `puppeteer` | `^22.0.0` | Browser automation for wokwi.com project creation |
| `puppeteer-extra` | `^3.3.6` | Stealth plugin wrapper |
| `puppeteer-extra-plugin-stealth` | `^2.11.2` | Evade headless detection |
| `fs-extra` | `^11.2.0` | Atomic JSON registry writes |
| `yaml` | `^2.4.0` | Parse `scenarios/*.yaml` for metadata |
| `wokwi-cli` | `latest` | Lint validation (`wokwi-cli lint`) |

Install:
```bash
npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth fs-extra yaml
# wokwi-cli is installed globally via:
# curl -L https://wokwi.com/ci/install.sh | sh
```

## Architecture

```
et2/
├── docs/superpowers/specs/          ← This spec
├── staging/v1/
│   ├── publisher/
│   │   ├── publish.js               # Puppeteer automation script
│   │   ├── variants.js              # Variant generation configs
│   │   ├── registry.json            # Published URL registry
│   │   └── README.md
│   ├── templates/
│   │   └── base/                    # Base project template
│   │       ├── diagram.json
│   │       └── sketch.ino
│   └── variants/                    # Generated variant projects
│       ├── light-esp32/
│       ├── temp-arduino/
│       └── motion-pico/
```

## Components

### 1. Base Template (`templates/base/`)

A valid Wokwi project with:
- `diagram.json` — circuit definition
- `sketch.ino` — Arduino/ESP32 firmware

**Cross-reference:** The canonical base project lives at `../../wokwi-project/` (repo root). Key files:
- [`wokwi-project/diagram.json`](../../wokwi-project/diagram.json) — Arduino Uno + photoresistor + LCD1602
- [`wokwi-project/src/light-sensor.ino`](../../wokwi-project/src/light-sensor.ino) — Lux/ADC display firmware
- [`wokwi-project/wokwi.toml`](../../wokwi-project/wokwi.toml) — Simulator config (firmware = `.pio/build/uno/firmware.hex`)
- [`wokwi-project/platformio.ini`](../../wokwi-project/platformio.ini) — PlatformIO env: `uno`, `atmelavr`, `arduino` framework, `LiquidCrystal` lib
- [`wokwi-project/scenarios/base.yaml`](../../wokwi-project/scenarios/base.yaml) — Validation scenario (`wait-serial: 'LUX:'`)

### 2. Variant Generator (`publisher/variants.js`)

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

### 3. Publisher (`publisher/publish.js`)

Puppeteer script that automates wokwi.com. The implementation uses `puppeteer-extra` with stealth mode to minimize bot-detection risk, and interacts with the Wokwi editor via specific selectors derived from the live DOM.

```javascript
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs-extra';
import path from 'path';

puppeteer.use(StealthPlugin());

const WOKWI_NEW_PROJECT_URL = 'https://wokwi.com/projects/new';
const COOKIES_PATH = path.resolve('publisher/cookies.json');
const REGISTRY_PATH = path.resolve('publisher/registry.json');
const SCREENSHOT_DIR = path.resolve('publisher/screenshots');

async function loadCookies(page) {
  if (await fs.pathExists(COOKIES_PATH)) {
    const cookies = await fs.readJson(COOKIES_PATH);
    await page.setCookie(...cookies);
  }
}

async function saveCookies(page) {
  const cookies = await page.cookies('https://wokwi.com');
  await fs.writeJson(COOKIES_PATH, cookies, { spaces: 2 });
}

async function captureFailure(page, variantId, step) {
  const screenshotPath = path.join(SCREENSHOT_DIR, `${variantId}-${step}-${Date.now()}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.error(`[${variantId}] Failure at step "${step}". Screenshot: ${screenshotPath}`);
}

async function waitForLoggedIn(page, timeout = 30000) {
  // The user avatar or "New Project" button indicates logged-in state
  await page.waitForSelector('button[title="New Project"], [data-testid="user-avatar"]', { timeout });
}

async function pasteIntoDiagramEditor(page, diagramJson) {
  // 1. Open the diagram tab (if not already active)
  const diagramTab = await page.$('button:text-matches("diagram", "i")');
  if (diagramTab) await diagramTab.click();

  // 2. Open the raw JSON editor via the "{}" toolbar button
  const rawJsonBtn = await page.waitForSelector('button[title="Edit diagram.json"]');
  await rawJsonBtn.click();

  // 3. The raw editor is a focused textarea or Monaco instance
  const editor = await page.waitForSelector('textarea[class*="json-editor"], .monaco-editor textarea');
  await editor.click({ clickCount: 3 }); // select all
  await editor.type(JSON.stringify(diagramJson, null, 2));

  // 4. Close the raw editor modal / panel (usually an "X" or "Close" button)
  const closeBtn = await page.$('button[title="Close"]');
  if (closeBtn) await closeBtn.click();
}

async function pasteIntoCodeEditor(page, sketchCode) {
  // The code editor is a Monaco instance; focus via click then replace
  const codeEditor = await page.waitForSelector('.monaco-editor');
  await codeEditor.click();

  // Ctrl+A then type replacement
  await page.keyboard.down('Control');
  await page.keyboard.down('a');
  await page.keyboard.up('a');
  await page.keyboard.up('Control');

  await page.keyboard.type(sketchCode);
}

async function saveProject(page) {
  // Trigger save: Ctrl+S or the Save button in the toolbar
  await page.keyboard.down('Control');
  await page.keyboard.down('s');
  await page.keyboard.up('s');
  await page.keyboard.up('Control');

  // Wait for URL transition from /new to /projects/<id>
  await page.waitForFunction(
    () => /\/projects\/\d+/.test(location.href),
    { timeout: 30000 }
  );
}

async function publishVariant(browser, variantPath, variantMeta) {
  const page = await browser.newPage();
  await loadCookies(page);

  const variantId = variantMeta.id;
  const diagramJson = await fs.readJson(path.join(variantPath, 'diagram.json'));
  const sketchCode = await fs.readFile(path.join(variantPath, 'sketch.ino'), 'utf-8');

  try {
    await page.goto(WOKWI_NEW_PROJECT_URL, { waitUntil: 'networkidle2' });
    await waitForLoggedIn(page);

    await pasteIntoDiagramEditor(page, diagramJson);
    await pasteIntoCodeEditor(page, sketchCode);
    await saveProject(page);

    const url = page.url();
    const match = url.match(/projects\/(\d+)/);
    if (!match) throw new Error(`Could not extract project ID from URL: ${url}`);
    const projectId = match[1];

    await saveCookies(page);
    await page.close();

    return {
      variantId,
      board: variantMeta.board,
      sensors: variantMeta.sensors,
      display: variantMeta.display,
      url,
      projectId,
      publishedAt: new Date().toISOString(),
    };
  } catch (err) {
    await captureFailure(page, variantId, err.step || 'unknown');
    await page.close();
    throw err;
  }
}

async function main() {
  const variantsDir = path.resolve('staging/v1/variants');
  const variants = await fs.readdir(variantsDir);

  const registry = await fs.pathExists(REGISTRY_PATH)
    ? await fs.readJson(REGISTRY_PATH)
    : { publishedAt: null, projects: [] };

  const browser = await puppeteer.launch({
    headless: false,           // Wokwi can detect headless; use headed mode
    args: ['--window-size=1366,768'],
    defaultViewport: { width: 1366, height: 768 },
  });

  for (const variantId of variants) {
    const variantPath = path.join(variantsDir, variantId);
    const metaPath = path.join(variantPath, 'variant.json');
    if (!(await fs.pathExists(metaPath))) continue;

    const variantMeta = await fs.readJson(metaPath);

    // Pre-flight lint
    try {
      const { execSync } = await import('child_process');
      execSync(`wokwi-cli lint "${variantPath}"`, { stdio: 'inherit' });
    } catch {
      console.error(`[${variantId}] Lint failed; skipping.`);
      continue;
    }

    const entry = await publishVariant(browser, variantPath, variantMeta);
    registry.projects.push(entry);
    await fs.writeJson(REGISTRY_PATH, registry, { spaces: 2 });

    // Rate-limiting delay between publishes
    await new Promise(r => setTimeout(r, 2500));
  }

  registry.publishedAt = new Date().toISOString();
  await fs.writeJson(REGISTRY_PATH, registry, { spaces: 2 });
  await browser.close();
}

main().catch(console.error);
```

**Key implementation details:**
- **Stealth mode:** `puppeteer-extra-plugin-stealth` patches the headless user agent, `navigator.webdriver`, and WebGL fingerprints.
- **Cookie persistence:** Session cookies are saved to `publisher/cookies.json` after each successful login so subsequent runs do not require re-authentication.
- **Editor targeting:** Wokwi uses Monaco editors for both code and raw JSON. The script targets `.monaco-editor` and `textarea[class*="json-editor"]`; if these selectors drift, the dry-run mode (see Testing) will surface the mismatch before any project is created.
- **Save detection:** Instead of waiting for a button state, the script waits for the URL to match `/projects/\d+/`, which is the canonical redirect after a successful save.
- **Failure capture:** Every caught exception triggers a full-page screenshot into `publisher/screenshots/` with a timestamped filename.

### 4. Registry (`publisher/registry.json`)

JSON file tracking all published projects:

```json
{
  "publishedAt": "2026-05-09T12:00:00Z",
  "projects": [
    {
      "variantId": "light-esp32",
      "board": "wokwi-esp32-devkit-v1",
      "sensors": ["wokwi-photoresistor-sensor"],
      "display": "wokwi-lcd1602",
      "url": "https://wokwi.com/projects/415876684817699841",
      "projectId": "415876684817699841"
    }
  ]
}
```

## Data Flow

```
Base Template
    │
    ▼
Variant Generator ──► Variant Projects (diagram.json + sketch.ino)
    │
    ▼
Publisher (Puppeteer) ──► wokwi.com ──► Project URL
    │
    ▼
Registry (registry.json)
```

## Error Handling

| Scenario | Handling |
|----------|----------|
| Wokwi UI changes | Puppeteer selectors break → log error, stop batch |
| Bot detection / CAPTCHA | Pause, prompt user to complete manually |
| Login expired | Save/load cookies, prompt re-auth if needed |
| Network timeout | Retry with exponential backoff (max 3) |
| Invalid diagram.json | Run `wokwi-cli lint` before publishing |

## Testing

1. **Lint first:** Run `wokwi-cli lint` on every variant before attempting publish
2. **Dry run mode:** Publisher can run without saving to verify selectors work
3. **Screenshot on failure:** Capture page screenshot if any step fails

## Security

- Wokwi session cookies stored in `publisher/cookies.json` (gitignored)
- `WOKWI_CLI_TOKEN` used for lint validation only
- No credentials hardcoded in scripts

## Success Criteria

- [ ] Base template can be published to wokwi.com manually
- [ ] Variant generator produces 3+ distinct hardware configurations
- [ ] Publisher script successfully creates a project and captures URL
- [ ] Registry.json contains all published project metadata
- [ ] Each URL loads a working, interactive simulation on wokwi.com

## Out of Scope

- Private projects (requires Wokwi Pro plan, not automatable)
- Custom parts/chips (requires manual chip definition upload)
- Multi-file projects with libraries (keep to single sketch.ino)
- Real-time collaboration features

## Risks

| Risk | Mitigation |
|------|------------|
| Wokwi UI changes | Keep selectors minimal, use data attributes when possible |
| Rate limiting | Add delays between publishes (2-3s) |
| Login/session expiry | Save cookies, handle re-auth gracefully |
| Headless detection | Use `headless: false` or stealth mode |

---

## Appendix A: File Structure (Exact Paths)

All paths are relative to the repository root (`et2/`).

```
et2/
├── docs/superpowers/specs/
│   └── 2026-05-09-wokwi-project-publisher-design.md   ← This spec
│
├── staging/v1/
│   ├── publisher/
│   │   ├── publish.js                                  # Puppeteer automation (this spec §3)
│   │   ├── variants.js                                 # Variant generation rules (this spec §2)
│   │   ├── registry.json                               # Published URL registry (this spec §4)
│   │   ├── cookies.json                                # Session cookies (gitignored)
│   │   ├── screenshots/                                # Failure screenshots (gitignored)
│   │   └── README.md                                   # Local usage instructions
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
