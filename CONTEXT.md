# et2 — Domain Glossary

> **Canonical spec:** [`staging/v2/docs/grill-me_sesh/manifest.yaml`](staging/v2/docs/grill-me_sesh/manifest.yaml) — structured YAML/JSON in `grill-me_sesh/`, not one markdown dump.

Agentic layer for Wokwi sim. NL hardware intent instead of manual wiring in Wokwi editor.

## Terms

### Simulation substrate

Wokwi env: `diagram.json`, firmware, headless `wokwi-cli`, native sim UI. **Hardcoded v1** — no substrate abstraction. Alternatives deferred.

### Live simulation backend

Hybrid (Option D), Wokwi-specific:

1. **Primary:** Wokwi native embed — board interactions in Wokwi engine.
2. **Fallback:** Sim daemon — MCP holds persistent `wokwi-cli`; supplemental controls + serial via `set-control`.
3. **CI only:** per-action batch `wokwi-cli` — too slow live; kept for validation.

### Agentic layer (et2)

NL intent → runnable Wokwi projects (circuit, firmware, scenarios, build, validate). On top of Wokwi.

### Operator (current)

Dev in terminal + **coding agent** (Kimi, Cursor). Agent reads context, runs scripts. Needs IDE/agent; not standalone product.

### Operator (target)

User in **agent-capable CLI** (Kimi CLI, Claude Code, Cursor). Prompt in existing chat — no new app/web UI.

### Plugin

Distributable et2. Two parts:

1. **MCP + skill bundle** — MCP tools (create, build, simulate); skill = workflow + guardrails + Wokwi conventions.
2. **Visual canvas** — live panel via **local sim server** (`localhost` web UI). Any host with URL. Extends `app.py`; Cursor `.canvas.tsx` deferred.

**Install:** `install-plugin.sh` detects host (Cursor, Claude Code, Kimi), writes MCP config, copies skill. npm ships MCP server.

### Local sim server

`localhost` canvas UI. **Lifecycle:** start on first MCP sim call, up for session, stop on MCP disconnect. One persistent `wokwi-cli` per agent session (hybrid fallback).

### Simulation canvas

Live sim region from local sim server:

1. **Circuit board (primary)** — full Wokwi diagram; Operator clicks/drags parts.
2. **Generated controls (supplemental)** — sliders/buttons from `diagram.json` part types.
3. **Serial monitor** — live firmware output.

### Live simulation

Interactive run: Operator adjusts sensors/actuators, observes MCU via real Wokwi emulation. Real part wiring (MCU ↔ sensor ↔ actuator), not mocked widgets. Not batch screenshot pipeline.

### Prompt scope (v1)

NL hardware intent → **template variant recipes** — predefined board/sensor/display + wiring, firmware patch, scenarios (`staging/v2/scripts/variants.js`).

**v1:** recipes only. Agent maps "ESP32 weather + DHT22" → nearest recipe.

**No match:** nearest variant + present to Operator + **confirm** before generate. Never silent wrong hardware.

**Later:** open **parts catalog** — arbitrary combos from Wokwi library + agent wiring/firmware.

### Prerequisites (v1)

**Wokwi toolchain** before plugin works:

- `wokwi-cli` + `WOKWI_CLI_TOKEN`
- PlatformIO (`pio`)
- Node.js (MCP runtime)

Preflight on first use. Missing deps → clear errors + setup links. No bundling PIO/token setup.

### Deliverable (v1)

After create + validate:

1. **Local Wokwi project** — `diagram.json`, firmware, scenarios, build artifacts.
2. **ZIP export** — import to wokwi.com.
3. **Import instructions** — load wokwi.com + embed URL for circuit view (hybrid primary).

No auto wokwi.com publish — no public create API.

### Project storage (v1)

Generated projects at **`.et2/projects/<id>/`** in workspace. **Gitignored**. Browsable in IDE beside chat.

### Emulation fidelity (invariant)

All behavior from **real Wokwi** (`wokwi-cli` and/or native sim). Never approximate sensor/actuator/MCU output in client JS.

**Not OK:** `app.py` HTML LCD fake while only serial is real. Circuit + part responses must trace to Wokwi.

## Status

From [`staging/v2/docs/grill-me_sesh/status-matrix.yaml`](staging/v2/docs/grill-me_sesh/status-matrix.yaml):

| Aspect | Current | Target |
|--------|---------|--------|
| Who prompts | Developer + coding agent | Any agent-CLI user |
| Delivery | Repo context + scripts | MCP + skill + sim server via `install-plugin.sh` |
| Agent runtime | Kimi / Cursor | Any MCP host |
| Sim server | Manual `app.py` Flask | Session localhost server from MCP |
| Substrate | Wokwi hardcoded | Wokwi hardcoded v1 |
| Prompt scope | Repo scripts + staging/v2 context | Template variants; catalog later |
| Prerequisites | Manual setup | Preflight + setup links |
| Canvas | Terminal + PNG; visual-demo gallery | Interactive sim server |
| Output | staging/v2 variants, registry, artifacts | `.et2/projects/<id>/` + ZIP + import guide |
| Unmatched prompt | N/A (script variants) | Nearest match + confirm |

## Reference appendix

Six-file method deep-dive — **not** primary product spec. Landscape, APIs, Wokwi CLI syntax.

| # | File | Topic |
|---|------|-------|
| 1 | [research/01-landscape.md](research/01-landscape.md) | Platform compare (Wokwi, Tinkercad, SPICE, KiCad) |
| 2 | [research/02-tinkercad-apis.md](research/02-tinkercad-apis.md) | Browser-only platforms lack APIs |
| 3 | [research/03-repo-index.md](research/03-repo-index.md) | Curated GitHub repos |
| 4 | [research/04-context7-findings.md](research/04-context7-findings.md) | Context7 MCP excerpts |
| 5 | [research/05-working-examples.md](research/05-working-examples.md) | Runnable snippets |
| 6 | [research/06-practical-guide.md](research/06-practical-guide.md) | Decision tree + automation steps |

Method template: [method/README.md](method/README.md).
