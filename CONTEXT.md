# et2 — Domain Glossary

> **Canonical spec:** [`staging/v2/docs/grill-me_sesh/manifest.yaml`](staging/v2/docs/grill-me_sesh/manifest.yaml) — structured YAML/JSON in `grill-me_sesh/`, not a single markdown dump.

Agentic layer for Wokwi hardware simulation. Users describe hardware setups in natural language instead of manually wiring circuits in the Wokwi visual editor.

## Terms

### Simulation substrate

The Wokwi environment: visual circuit editor (`diagram.json`), firmware, headless execution via `wokwi-cli`, native sim UI. **Hardcoded for v1** — no substrate abstraction layer. Alternatives deferred to avoid complexity.

### Live simulation backend

Hybrid architecture (Option D), Wokwi-specific:

1. **Primary:** Wokwi native embed — circuit board interactions run in Wokwi's sim engine.
2. **Fallback:** Sim daemon — MCP server holds persistent `wokwi-cli` session; supplemental controls + serial via `set-control`.
3. **CI only:** Per-action batch `wokwi-cli` spawn — too slow for live interaction; kept for validation.

### Agentic layer (et2)

Software that accepts natural-language intent and produces runnable Wokwi projects — circuit definition, firmware, automation scenarios, build, and validation. Sits on top of Wokwi.

### Operator (current)

A developer working in a terminal with a **coding agent** (Kimi Code, Cursor, etc.). The agent reads project context files and orchestrates scripts to generate and validate simulations. Requires IDE/agent tooling; not a standalone product surface.

### Operator (target)

A user already working in an **agent-capable CLI** (Kimi CLI, Claude Code, Cursor, etc.). They prompt in their existing chat — no new app, no separate web UI. et2 meets them where they are.

### Plugin

The distributable form of et2. Two parts:

1. **MCP + skill bundle** — MCP server exposes deterministic tools (create, build, simulate); skill teaches the agent workflow, guardrails, and Wokwi conventions.
2. **Visual canvas** — Live interactive panel via a **local sim server** (lightweight web UI at `localhost`). Works across Cursor, Kimi CLI, Claude Code — any host that can open a URL. Extends the `app.py` pattern; Cursor-native `.canvas.tsx` deferred.

**Install:** Host-aware install script (`install-plugin.sh`) detects agent host (Cursor, Claude Code, Kimi CLI), writes MCP config, copies skill file. npm package ships the MCP server; script wires config per host.

### Local sim server

Lightweight web UI at `localhost` serving the simulation canvas. **Lifecycle:** starts when the agent session begins (first MCP sim call), stays up for the whole session, stops when MCP disconnects. One persistent `wokwi-cli` session per agent session (hybrid fallback backend).

### Simulation canvas

The canvas region dedicated to live simulation, served by the local sim server. Combines pipeline progress with an interactive sim surface:

1. **Circuit board view (primary)** — Full Wokwi diagram; Operator clicks/drags parts on the board.
2. **Generated controls (supplemental)** — Sliders, buttons, etc. auto-derived from `diagram.json` part types.
3. **Serial monitor** — Live firmware output.

### Live simulation

An interactive hardware run where the Operator adjusts sensors, actuators, and inputs and observes processor behavior through real Wokwi emulation. Must reflect actual part connections (MCU ↔ sensor ↔ actuator), not mocked UI widgets. Distinct from batch screenshot capture in the v2 pipeline.

### Prompt scope (v1)

Operator describes hardware intent in natural language. Plugin maps intent to **template variant recipes** — predefined board/sensor/display combos with known wiring, firmware patches, and scenarios (see `staging/v2/scripts/variants.js`).

**v1:** Variant recipes only. Agent resolves "ESP32 weather station with DHT22" → nearest matching recipe.

**No match:** Agent picks **nearest variant**, presents match to Operator, waits for **confirmation** before generating. Never silently guess wrong hardware.

**Later:** Expand to open **parts catalog** — arbitrary combos from the Wokwi parts library with agent-driven wiring and firmware.

### Prerequisites (v1)

Operator must have the **Wokwi toolchain** installed before the plugin works:

- `wokwi-cli` + `WOKWI_CLI_TOKEN`
- PlatformIO (`pio`)
- Node.js (MCP server runtime)

Plugin runs **preflight checks** on first use. Missing deps → clear errors + setup links — not silent failure. No bundling of PlatformIO or token setup; those require operator action.

### Deliverable (v1)

After create + validate, Operator receives:

1. **Local Wokwi project directory** — `diagram.json`, firmware, scenarios, build artifacts.
2. **ZIP export** — self-contained archive for manual import.
3. **Import instructions** — steps to load into wokwi.com and obtain an embed URL for the circuit board view (hybrid backend primary).

No automated wokwi.com publish — platform has no public create API.

### Project storage (v1)

Generated Wokwi projects live at **`.et2/projects/<id>/`** inside the Operator's workspace. Directory is **gitignored**. Keeps artifacts out of version control while remaining browsable in the IDE beside agent chat.

### Emulation fidelity (invariant)

All hardware behavior must come from **real Wokwi emulation** (`wokwi-cli` and/or Wokwi native sim UI). et2 must never approximate sensor readings, actuator states, or processor output in client-side JavaScript.

**Not acceptable:** The `app.py` pattern of mimicking an LCD in HTML while only the serial path is real. Circuit view and part responses must trace to Wokwi.

## Status

From [`staging/v2/docs/grill-me_sesh/status-matrix.yaml`](staging/v2/docs/grill-me_sesh/status-matrix.yaml):

| Aspect | Current | Target |
|--------|---------|--------|
| Who prompts | Developer + coding agent | Any agent-CLI user |
| Delivery | Repo context files + scripts | MCP + skill + sim server via install-plugin.sh |
| Agent runtime | Kimi Code / Cursor | Any MCP-capable host (Kimi, Claude Code, Cursor) |
| Sim server | Manual `app.py` Flask server | Session-scoped localhost server started by MCP |
| Substrate | Wokwi hardcoded | Wokwi hardcoded v1 |
| Prompt scope | Repo scripts + staging/v2 context files | Template variants; parts catalog later |
| Prerequisites | Manual operator setup | Preflight + guided setup links |
| Canvas | Terminal + PNG artifacts; visual-demo static gallery | Interactive local sim server (circuit + controls + serial) |
| Output | staging/v2/variants, registry.json, artifacts/ | `.et2/projects/<id>/` + ZIP + wokwi.com import guide |
| Unmatched prompt | N/A (script-defined variants) | Nearest match + operator confirm |

## Reference appendix

Optional deep-dive from the six-file context method — **not** the primary product spec. Use for landscape, APIs, and Wokwi CLI syntax when implementing or comparing tools.

| # | File | Topic |
|---|------|-------|
| 1 | [research/01-landscape.md](research/01-landscape.md) | Platform comparison (Wokwi, Tinkercad, SPICE, KiCad, etc.) |
| 2 | [research/02-tinkercad-apis.md](research/02-tinkercad-apis.md) | Why browser-only platforms lack APIs |
| 3 | [research/03-repo-index.md](research/03-repo-index.md) | Curated GitHub repos with verdicts |
| 4 | [research/04-context7-findings.md](research/04-context7-findings.md) | Context7 MCP excerpts (Wokwi + EDA) |
| 5 | [research/05-working-examples.md](research/05-working-examples.md) | Runnable snippets and integration patterns |
| 6 | [research/06-practical-guide.md](research/06-practical-guide.md) | Decision tree and step-by-step automation |

Method template (reusable layout): [method/README.md](method/README.md).
