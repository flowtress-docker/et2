# Wokwi Project Publisher — Design Spec

## Context

Wokwi has no public API for creating `wokwi.com/projects/XXXX` URLs programmatically. Context7 MCP verification confirmed:
- No GitHub project loader URL exists (`wokwi.com/projects/github/...` is unsupported)
- No REST API for project creation
- `wokwi-cli mcp` is experimental and only exposes simulation tools, not project publishing
- The only way to get a permanent shareable project URL is through the Wokwi browser UI

## Objective

Build a Puppeteer-based automation system that creates Wokwi projects with permanent URLs and generates multiple hardware variants of the same base project.

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

### 2. Variant Generator (`publisher/variants.js`)

Transforms the base template into N variants by applying configurable rules:

| Rule Type | Example Transformations |
|-----------|------------------------|
| Board swap | `wokwi-esp32-devkit-v1` → `wokwi-arduino-uno` → `wokwi-pi-pico` |
| Sensor swap | DHT22 → photoresistor → MPU6050 |
| Display swap | LCD1602 → TM1637 → OLED |
| Firmware patch | Update pin mappings, library includes, serial output |

Each variant is written to `variants/<variant-id>/` as a self-contained Wokwi project.

### 3. Publisher (`publisher/publish.js`)

Puppeteer script that automates wokwi.com:

```javascript
// Pseudocode
const browser = await puppeteer.launch({ headless: false });
const page = await browser.newPage();

// 1. Navigate to Wokwi new project page for the target board
await page.goto(`https://wokwi.com/projects/new/${boardType}`);

// 2. Log in (user must already be authenticated or use saved cookies)
//    Wokwi session cookie is loaded from a local file

// 3. Paste diagram.json into diagram editor
//    - Click diagram editor area
//    - Open "{}" raw JSON view
//    - Clear existing content
//    - Paste diagram.json contents

// 4. Paste sketch.ino into code editor
//    - Focus code editor
//    - Select all
//    - Paste sketch.ino contents

// 5. Save project
//    - Click Save button
//    - Wait for URL redirect to /projects/<id>

// 6. Capture project URL
const url = page.url();
const projectId = url.match(/projects\/(\d+)/)[1];

// 7. Store in registry
registry[variantId] = { url, projectId, board, sensors, display };
```

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
