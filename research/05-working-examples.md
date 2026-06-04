# Working Examples

> **v2 path:** Prefer [staging/v2 templates and variants](../staging/v2/scripts/variants.js) per grill session. External **MQTT / Tinkercad bridges** below are **not** the v2 plugin path.

## Browser Automation

### Tinkercad ↔ MQTT Bridge (Puppeteer)
- **Source:** https://github.com/RahmadSadli/Tinkercad-mqtt-bridge
- **Verdict:** works (needs-auth-tokens)
- **Description:** Opens a Tinkercad circuit in a headful Chrome instance via Puppeteer, polls the Serial Monitor output from the DOM, publishes it to an MQTT topic, and subscribes to `sensor/command` to inject text back into the Serial Monitor input field.
- **Prerequisites:** Node.js, `mqtt` and `puppeteer` packages, Windows (paths hard-coded), Google Chrome installed, already-authenticated Tinkercad session (manual login required on first run).
- **Minimal snippet:**
```javascript
const mqtt = require("mqtt");
const puppeteer = require("puppeteer");

const client = mqtt.connect(`mqtt://${BROKER}:${PORT}`);
client.subscribe("sensor/command");

const browser = await puppeteer.launch({
  headless: false,
  args: ["--disable-blink-features=AutomationControlled"]
});
const page = await browser.newPage();
await page.evaluateOnNewDocument(() => {
  Object.defineProperty(navigator, "webdriver", { get: () => undefined });
});
await page.goto(URL, { waitUntil: "networkidle2" });

// Poll serial output
const text = await page.evaluate(() =>
  (document.body && document.body.innerText) || ""
);

// Inject MQTT message into Serial Monitor
const frames = await page.frames();
const targetFrame = frames.find(f =>
  f.url().includes("/editel")
);
const textInputs = await targetFrame.$$("textarea, input[type='text']");
if (textInputs.length > 0) {
  const serialInput = textInputs[textInputs.length - 1];
  await serialInput.click({ clickCount: 3 });
  await page.keyboard.press("Backspace");
  await serialInput.type(msg);
  await page.keyboard.press("Enter");
}
```

### Generic Playwright — Web App Control Pattern
- **Source:** https://www.browserstack.com/guide/playwright-tutorial
- **Verdict:** works
- **Description:** General Playwright pattern for navigating, filling forms, clicking buttons, and asserting state in a web app. Directly applicable to Tinkercad Circuits UI automation.
- **Prerequisites:** Node.js, `@playwright/test`.
- **Minimal snippet:**
```javascript
import { test, expect } from '@playwright/test';

test('homepage navigation test', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example Domain/);
});
```

### Generic Playwright — iFrame & Element Interaction
- **Source:** https://www.browserstack.com/guide/playwright-tutorial
- **Verdict:** works
- **Description:** Tinkercad Circuits embeds the editor in an iframe (`/editel`). These snippets show how to target frames, fill inputs, and scroll.
- **Prerequisites:** Node.js, `@playwright/test`.
- **Minimal snippet:**
```javascript
// iFrame locator
await page.frameLocator('#payment-iframe')
  .getByRole('button', { name: 'Pay' }).click();

// Direct input fill
await page.locator('input[name="dob"]').fill('1995-12-26');

// Scroll into view
await page.getByText('Load more').scrollIntoViewIfNeeded();
```

### Generic Playwright Python — Basic Scraper
- **Source:** https://testomat.io/blog/python-playwright-tutorial-for-web-automation-testing
- **Verdict:** works
- **Description:** Python equivalent for launching Chromium, extracting text, and taking screenshots. Useful for scraping Tinkercad circuit state or serial output.
- **Prerequisites:** Python, `playwright`, `pytest`.
- **Minimal snippet:**
```python
from playwright.sync_api import sync_playwright

def scrape_basic_info():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto("https://pycoin24.com")
        title = page.title()
        heading = page.locator("h1").text_content()
        page.screenshot(path="pycoin24.png")
        print(f"Page title: {title}")
        browser.close()
```

### Generic Puppeteer — PDF / Screenshot Generation
- **Source:** https://www.lambrospetrou.com/articles/enjoyable-browser-automation-puppeteer-playwright/
- **Verdict:** works
- **Description:** Basic Puppeteer pattern for opening a page and generating a PDF. Can be adapted to capture a Tinkercad circuit canvas or schematic view.
- **Prerequisites:** Node.js, `puppeteer`.
- **Minimal snippet:**
```javascript
const puppeteer = require('puppeteer');

async function generatePdfPuppeteer() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://127.0.0.1:12345', {waitUntil: 'networkidle2'});
    await page.pdf({
        path: 'cv.pdf',
        format: 'A4',
        margin: {
            top: '0.39in',
            left: '0.39in',
            right: '0.38in',
            bottom: '0.38in'
        }
    });
    await browser.close();
}
```

## API Wrappers

### Tinkercad Net Connector — Chrome Extension Serial Bridge
- **Source:** https://github.com/joshuaellul/tinkercad-net-connector
- **Verdict:** works (needs-auth-tokens)
- **Description:** A Chrome extension that injects a content script into `tinkercad.com/things/*` pages. It uses a `MutationObserver` to watch the Serial Monitor DOM, forwards output via HTTP GET to a user-defined base URL, and can inject server responses back into the Serial Monitor input field.
- **Prerequisites:** Google Chrome, ability to load unpacked extensions, a local HTTP server to receive/response to the extension's GET requests.
- **Minimal snippet (content.js):**
```javascript
var monitoringTabs = {};
var theDiv = null;
var lastText = "";

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

async function getTabId() {
  let tabid = await new Promise(resolve =>
    chrome.runtime.sendMessage({msg: "get-tabid" }, (response) => {
      resolve(response);
    })
  );
  return tabid;
}

var documentObserver = new MutationObserver(async function(mutations, observer) {
  let tabid = await getTabId();

  if (monitoringTabs[tabid] == true) {
    return;
  }
  monitoringTabs[tabid] = true;

  elements = document.querySelectorAll("[class*=code_panel__serial__text]");
  if (elements != null && elements.length > 0) {
    theDiv = elements[0];
    theDiv.addEventListener('DOMSubtreeModified', function(ev) {
      chrome.storage.local.get(['urlbase'], function(result) {
        var urlbase = result.urlbase;
        if (urlbase == null || urlbase.length == 0) {
          return;
        }
        var latestPos = lastText.length;
        var latestDiff = theDiv.innerHTML.substring(latestPos + lastText.length);
        if (latestDiff.includes('\\n')) {
          const line = latestDiff.substring(0, latestDiff.indexOf('\\n') + 1);
          lastText = theDiv.innerHTML.substring(0, latestPos + line.length);
          chrome.runtime.sendMessage({msg: "send-output", output: line}, response => {
            if (response != null) {
              sendInputToDevice(response);
            }
          });
        }
      });
    }, false);
  }
});

async function sendInputToDevice(input) {
  elements = document.querySelectorAll("[class*=code_panel__serial__input]");
  if (elements != null && elements.length > 0) {
    theInputField = elements[0];
    theInputField.value = input;
    elements = document.querySelectorAll("[class*=js-code_panel__serial__send]");
    if (elements != null && elements.length > 0) {
      theSendButton = elements[0];
      theSendButton.click();
    }
  }
}

documentObserver.observe(document, {
  subtree: true,
  attributes: true
});
```

### CSDN — Claimed Tinkercad REST API (Python)
- **Source:** https://blog.csdn.net/weixin_35794316/article/details/157045099
- **Verdict:** unverified
- **Description:** A Chinese-language blog post claims Tinkercad exposes a RESTful endpoint at `https://www.tinkercad.com/api/projects` that accepts a JSON circuit definition and returns a shareable project URL. No official Autodesk documentation confirms this endpoint.
- **Prerequisites:** Python `requests`, a `Bearer` token of unspecified origin.
- **Minimal snippet:**
```python
import requests
import json

headers = {
    "Authorization": "Bearer YOUR_API_TOKEN",
    "Content-Type": "application/json"
}

circuit_data = {
    "name": "RC_Charging_Circuit",
    "description": "Capacitor charging through 1kΩ resistor",
    "components": [
        {"type": "voltage", "value": 5.0, "label": "Vcc"},
        {"type": "resistor", "value": 1000, "label": "R1"},
        {"type": "capacitor", "value": 1e-6, "label": "C1"}
    ],
    "connections": [
        ["Vcc+", "R1_1"],
        ["R1_2", "C1+"],
        ["C1-", "Vcc-"]
    ]
}

response = requests.post(
    "https://www.tinkercad.com/api/projects",
    headers=headers,
    data=json.dumps(circuit_data)
)

if response.status_code == 201:
    print("项目创建成功！")
    print(f"访问地址: {response.json()['url']}")
else:
    print(f"创建失败: {response.text}")
```

## Export/Import Hacks

### Tinkercad Circuits — Manual Export to Eagle / PNG / INO
- **Source:** https://www.tinkercad.com/blog/tinkertips-export-options
- **Verdict:** works
- **Description:** Tinkercad Circuits provides built-in UI exports: `.brd` (Autodesk EAGLE / Fusion 360), `.png` (circuit image), `.ino` (Arduino sketch), and BOM. There is no public API for these exports; they require clicking the "Send to" button in the browser.
- **Prerequisites:** Active Autodesk account, circuit editor access.
- **Minimal snippet:** N/A (UI-only workflow).

### Bread2Board — Tinkercad BRD → DIY PCB Workflow
- **Source:** https://www.instructables.com/Create-a-DIY-PCB-Directly-From-Your-TinkerCad-Circ/
- **Verdict:** works
- **Description:** Describes a manual pipeline: export Tinkercad `.BRD` and `.PNG`, import into Bread2Board's web tool, generate a configuration PDF, print onto vinyl for a custom stencil, and reflow onto a blank PCB template.
- **Prerequisites:** Bread2Board accessories (stencil kit, hot plate, blank templates), Kapton tape, solder paste.
- **Minimal snippet:** N/A (physical workflow).
