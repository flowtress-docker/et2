# Tinkercad API & Automation Landscape

## Official API

- **No public REST API for Tinkercad Circuits.**
  - Tinkercad is a closed, browser-based Autodesk product. There is no developer portal, OpenAPI spec, or SDK for programmatic control of circuit designs, simulation, or code upload.
  - Source: https://www.tinkercad.com/blog/official-guide-to-tinkercad-circuits

- **Autodesk Forge Data Management API historically covered consumer products including Tinkercad.**
  - A 2017 Autodesk DevCon handout lists "Consumer products (e.g., Tinker CAD)" as supported by the Forge Data Management API (hubs, projects, folders, OSS).
  - This API is aimed at 3D design asset storage, not circuit simulation or real-time control.
  - Source: https://static.au-uw2-prd.autodesk.com/Class_Handout_FDC125679_Demystifying_the_BIM_360_and_Forge_APIs_Mikako_Harada.pdf

- **Shape Scripts API (3D Design only).**
  - Tinkercad 3D Designs support parametric "Shape Generators" written in JavaScript executed server-side against the Gen6 geometry kernel.
  - This is a 3D-modeling feature, not applicable to Circuits.
  - Sources:
    - https://keanw.com/2013/07/creating-a-grid-of-columns-inside-tinkercad-using-javascript.html
    - https://3dprintingindustry.com/news/tinkercad-excitedly-launches-shape-scripts-api-1974/
    - https://blog.adafruit.com/2012/10/12/shape-scripts-api-for-tinkercad/

- **Built-in manual exports (no API endpoint).**
  - Circuits can export `.brd` (Eagle/Fusion 360), `.png`, `.ino` (Arduino sketch), and BOM via the "Send to" UI button.
  - Source: https://www.tinkercad.com/blog/tinkertips-export-options

## Unofficial / Reverse-Engineered Methods

- **`tinkercad-net-connector` — Chrome Extension Serial Bridge.**
  - Injects a content script into `tinkercad.com/things/*` pages, reads the Arduino Serial Monitor DOM, and forwards output via HTTP GET to a user-supplied base URL.
  - Supports two-way comms: `?msg=output&out=...&device=...` and `?msg=allinputs`.
  - Requires the serial monitor to remain open and not be cleared.
  - Last commit: 2021-06-07.
  - Source: https://github.com/joshuaellul/tinkercad-net-connector

- **Browser automation (Playwright / Puppeteer / Selenium).**
  - The only viable path to programmatically interact with Tinkercad Circuits is driving a headless browser:
    - Log in via `accounts.autodesk.com`.
    - Navigate to a circuit URL (`https://tinkercad.com/things/<id>`).
    - Click UI elements (Start Simulation, Code editor, etc.).
    - Scrape Serial Monitor text from the DOM.
  - No published open-source implementations of this workflow were found.

- **No documented WebSocket API for Circuits.**
  - Tinkercad uses WebSockets internally for real-time collaboration and simulation, but no public reverse-engineering write-ups or stable protocol definitions exist.
  - General reverse-engineering approaches (MITM proxy, cookie replay) are discussed in the security community but not specifically for Tinkercad.
  - Source (general WebSocket rev-eng): https://reverseengineering.stackexchange.com/questions/20417/websocket-debugging-in-javascript-app-gives-401-unauthorized/20419

## Auth Strategies

- **Autodesk Account OAuth 2.0 / Session Cookies.**
  - Tinkercad delegates authentication to `accounts.autodesk.com`.
  - After login, session state is maintained via browser cookies (`tinkercad.com` + `accounts.autodesk.com`).
  - Programmatic access therefore requires either:
    - Cookie-based session replay (extract cookies from a logged-in browser profile).
    - Headless browser login (risky; may trigger bot detection / CAPTCHA).
  - No API keys, Personal Access Tokens, or 2-legged OAuth scopes are documented for Circuits.
  - Source (Forge OAuth overview): https://developer.autodesk.com/en/docs/oauth/v2/overview/

- **Extension-based auth (for `tinkercad-net-connector`).**
  - The Chrome extension runs inside the user's already-authenticated Tinkercad tab, inheriting the session cookie automatically. No separate auth flow is needed.

## Unofficial Methods from Browser Automation

Research into open-source projects and automation tutorials yielded two concrete, code-level approaches for interacting with Tinkercad Circuits without an official API.

### 1. Puppeteer-based Serial Monitor Bridge
- **Repo:** https://github.com/RahmadSadli/Tinkercad-mqtt-bridge
- **Technique:** Launch a headful Chrome instance via Puppeteer, navigate to `https://www.tinkercad.com/things/<id>`, and rely on the user to log in and start the simulation. The script then polls `document.body.innerText` to capture Serial Monitor output and injects incoming MQTT messages into the last `<textarea>` or `<input type='text'>` inside the Tinkercad editor iframe (`/editel`).
- **Key code patterns observed:**
  - Frame targeting: `page.frames().find(f => f.url().includes("/editel"))`
  - Input injection: `await serialInput.type(msg); await page.keyboard.press("Enter");`
  - Stealth flag: `"--disable-blink-features=AutomationControlled"`
- **Limitations:** Requires manual login, Windows-centric Chrome path detection, brittle DOM selectors, and the Serial Monitor must remain open.

### 2. Chrome Extension Content Script (DOM Observer)
- **Repo:** https://github.com/joshuaellul/tinkercad-net-connector
- **Technique:** A Manifest V2 extension injects `content.js` into `*://*.tinkercad.com/things/*`. It uses a `MutationObserver` to watch for DOM nodes matching `[class*=code_panel__serial__text]`. On text change, it forwards lines ending in `\n` to a background script, which relays them via HTTP GET to a configurable base URL. The extension can also receive text from the server and inject it into `[class*=code_panel__serial__input]` followed by a click on `[class*=js-code_panel__serial__send]`.
- **Key code patterns observed:**
  - Serial output detection: `document.querySelectorAll("[class*=code_panel__serial__text]")`
  - Serial input injection: `theInputField.value = input; theSendButton.click();`
  - Two-way messaging via `chrome.runtime.sendMessage`.
- **Limitations:** Tied to specific Tinkercad CSS class names (may break on UI updates), requires loading an unpacked extension, and the user must keep the serial monitor open and not clear it.

### 3. Generic Browser Automation Patterns (Applicable to Tinkercad)
- **Sources:**
  - https://www.browserstack.com/guide/playwright-tutorial
  - https://testomat.io/blog/python-playwright-tutorial-for-web-automation-testing
  - https://www.lambrospetrou.com/articles/enjoyable-browser-automation-puppeteer-playwright/
- **Relevant patterns for Tinkercad-like apps:**
  - **iFrame navigation:** Tinkercad's editor runs inside an iframe; use `page.frameLocator(...)` or `page.frames()` to scope interactions.
  - **Auto-wait & actionability:** Playwright's built-in waits (`locator.click()`, `expect(...).toBeVisible()`) reduce flakiness when waiting for the simulation canvas or code panel to load.
  - **Headless/headful toggle:** Running headful (`headless: false`) is often required for sites with bot detection or WebGL canvases (Tinkercad uses WebGL for the 3D circuit view).
  - **Stealth / `navigator.webdriver` override:** Both Puppeteer and Playwright can mask the `webdriver` property to evade basic automation detection.
