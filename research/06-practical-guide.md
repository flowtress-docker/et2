# Practical Guide: Automating Tinkercad Circuits & Alternatives

## Quick Verdict

- **Can you CLI-control Tinkercad?** No. Tinkercad Circuits has no public API, REST endpoint, or CLI. The only programmatic paths are brittle browser-automation hacks.
- **Easiest path:** **Wokwi CLI** — official CLI, token auth, YAML scenarios, works in CI.
- **Most robust path:** **PySpice + Ngspice/Xyce** — open-source SPICE with a clean Python OO API, batch sweeps, and Numpy output.

## Decision Tree

```
Need Arduino simulation with real hardware?
├─ Yes + need API → Wokwi CLI
├─ Yes + browser OK → Tinkercad + Chrome extension OR Puppeteer bridge
├─ Need analog SPICE → PySpice + Ngspice
└─ Need PCB design → KiCad pcbnew Python API
```

---

## Method 1: Tinkercad via Chrome Extension

Bridge Tinkercad's Serial Monitor I/O to HTTP GET requests using a content-script extension.

**Prerequisites**
- Google Chrome (desktop)
- Ability to load unpacked extensions (`chrome://extensions` → Developer mode)
- A local HTTP server to receive/response to the extension's GET requests

**Steps**
1. Clone `tinkercad-net-connector`:
   ```bash
   git clone https://github.com/joshuaellul/tinkercad-net-connector.git
   ```
2. Load the unpacked extension in Chrome (`chrome://extensions` → "Load unpacked" → select the repo folder).
3. Open a Tinkercad circuit, keep the Serial Monitor open, and configure the extension's base URL to point at your local HTTP server.

**How it works**
- A content script injects into `tinkercad.com/things/*`.
- It uses a `MutationObserver` to watch `[class*=code_panel__serial__text]`.
- On new lines, it forwards them via HTTP GET to your server.
- Server responses are injected back into `[class*=code_panel__serial__input]` and sent.

**Pros**
- Runs inside the authenticated browser tab (no separate auth needed).
- Two-way serial comms without writing browser-automation code.

**Cons**
- Tied to specific Tinkercad CSS class names — breaks on UI updates.
- Last updated 2021; may need patches for current Tinkercad.
- Requires keeping the Serial Monitor open and not clearing it.
- No control over simulation start/stop or code upload.

---

## Method 2: Tinkercad via Puppeteer/Playwright

Drive a headful Chrome instance to poll the Serial Monitor DOM and inject inputs.

**Prerequisites**
- Node.js
- `puppeteer` or `@playwright/test` installed
- Google Chrome installed
- An already-authenticated Tinkercad session (manual login on first run)

**Steps**
1. Install dependencies:
   ```bash
   npm install puppeteer mqtt
   ```
2. Launch a headful browser with stealth flags and navigate to your circuit URL:
   ```javascript
   const puppeteer = require("puppeteer");

   const browser = await puppeteer.launch({
     headless: false,
     args: ["--disable-blink-features=AutomationControlled"]
   });
   const page = await browser.newPage();
   await page.evaluateOnNewDocument(() => {
     Object.defineProperty(navigator, "webdriver", { get: () => undefined });
   });
   await page.goto("https://www.tinkercad.com/things/<YOUR_CIRCUIT_ID>", {
     waitUntil: "networkidle2"
   });
   ```
3. Poll serial output and inject inputs via the `/editel` iframe:
   ```javascript
   // Poll serial output
   const text = await page.evaluate(() =>
     (document.body && document.body.innerText) || ""
   );

   // Inject text into Serial Monitor
   const frames = await page.frames();
   const targetFrame = frames.find(f => f.url().includes("/editel"));
   const textInputs = await targetFrame.$("textarea, input[type='text']");
   if (textInputs.length > 0) {
     const serialInput = textInputs[textInputs.length - 1];
     await serialInput.click({ clickCount: 3 });
     await page.keyboard.press("Backspace");
     await serialInput.type(msg);
     await page.keyboard.press("Enter");
   }
   ```

**Pros**
- Full control over browser state (screenshots, navigation, input injection).
- Can be adapted to click "Start Simulation" or interact with other UI elements.

**Cons**
- Requires manual login (bot detection / CAPTCHA risk for headless auth).
- Brittle DOM selectors; Tinkercad iframe structure may change.
- WebGL canvas may not render correctly in pure headless mode.
- Windows-centric path assumptions in existing reference code.

---

## Method 3: Wokwi CLI (Official)

Wokwi provides an official CLI for CI-driven Arduino/ESP32/RP2040 simulation.

**Prerequisites**
- Node.js ≥ 16
- A Wokwi account and a project token

**Steps**
1. Install the CLI:
   ```bash
   npm install -g wokwi-cli
   ```
2. Authenticate with your token:
   ```bash
   wokwi-cli login --token <YOUR_TOKEN>
   ```
3. Run a simulation scenario from a YAML file:
   ```bash
   wokwi-cli run --scenario scenario.yml
   ```

**Pros**
- Official, documented, maintained.
- Supports screenshots, serial capture, and GitHub Actions.
- Real MCU emulation (ESP32, RP2040) with GDB debugging.

**Cons**
- Proprietary platform (free tier available).
- Not Tinkercad — different UI and component library.
- Requires learning Wokwi's project/scenario format.

---

## Method 4: PySpice / Ngspice (SPICE)

Open-source analog/mixed-signal simulation with a Python OO API.

**Prerequisites**
- Python ≥ 3.8
- `PySpice` and Ngspice installed (`pip install PySpice`)

**Steps**
1. Define a circuit in Python:
   ```python
   from PySpice.Spice.Netlist import Circuit
   from PySpice.Unit import *

   circuit = Circuit('Simulation Setup Example')
   circuit.V('input', 'node1', circuit.gnd, 1@u_V)
   circuit.R(1, 'node1', circuit.gnd, 1@u_kOhm)
   ```
2. Run the simulator:
   ```python
   simulator = circuit.simulator(temperature=25, nominal_temperature=25)
   analysis = simulator.operating_point()
   ```
3. Inspect results:
   ```python
   print(f"Results: {analysis}")
   ```

**Pros**
- Fully programmatic: batch sweeps, parameter optimization, CI-friendly.
- Handles units (`@u_V`, `@u_kOhm`) and outputs Numpy arrays.
- Can switch backend between Ngspice and Xyce.

**Cons**
- No Arduino/embedded simulation — purely analog/mixed-signal SPICE.
- Steeper learning curve for SPICE netlist concepts.

---

## Method 5: KiCad pcbnew (PCB)

Programmatic PCB design and manipulation via Python.

**Prerequisites**
- KiCad installed (includes `pcbnew` Python module)
- Optional: `kigadgets` / `kicad-python` wrapper for a cleaner API

**Steps**
1. Load or create a PCB:
   ```python
   from kigadgets.board import Board

   pcb = Board.load("my_design.kicad_pcb")
   ```
2. Add tracks and elements:
   ```python
   seg = pcb.add_track_segment((10, 10), (20, 10), layer="F.Cu", width=0.25)
   pcb.add_track([(0, 0), (5, 0), (5, 5), (10, 5)], layer="B.Cu", width=0.2)
   ```
3. Save:
   ```python
   pcb.save()
   ```

**Pros**
- Native, stable API for PCB layout automation.
- Can generate DRC reports, BOMs, and manufacturing outputs.

**Cons**
- PCB-centric, not a circuit simulator.
- SWIG-based API can be verbose; wrappers add dependency risk.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Tinkercad Puppeteer script fails to find Serial Monitor input | The `/editel` iframe structure may have changed. Use `page.frames()` to dump current frame URLs and re-target. |
| `navigator.webdriver` detection blocks login | Ensure `evaluateOnNewDocument` override is set before `page.goto()`. Use `--disable-blink-features=AutomationControlled`. |
| Chrome extension stops forwarding serial data | Tinkercad CSS class names changed. Inspect the Serial Monitor DOM and update selectors in `content.js`. |
| PySpice throws "ngspice shared library not found" | Install Ngspice separately (`apt install ngspice`, `brew install ngspice`, etc.) and ensure `libngspice.so` / `.dylib` is on `LD_LIBRARY_PATH`. |
| Wokwi CLI "unauthorized" error | Regenerate your project token at https://wokwi.com and re-run `wokwi-cli login`. |
| KiCad `pcbnew` import error | Run the script from within KiCad's bundled Python environment, or set `PYTHONPATH` to KiCad's `lib/python3.x/site-packages`. |

---

## Further Reading

- [`01-landscape.md`](01-landscape.md) — Full platform comparison and recommendation matrix
- [`02-tinkercad-apis.md`](02-tinkercad-apis.md) — Deep dive on Tinkercad's lack of API, auth strategies, and reverse-engineered methods
- [`03-repo-index.md`](03-repo-index.md) — Curated list of relevant GitHub repos with freshness verdicts
- [`04-context7-findings.md`](04-context7-findings.md) — Verified code snippets from KiCad, PySpice, skidl, lcapy, ngspice, Xyce, LTspice, and spicelib
- [`05-working-examples.md`](05-working-examples.md) — Complete working snippets for Puppeteer bridge, Chrome extension, Playwright patterns, and export workflows
