## Six-File Context Pack

**Primary spec:** [`staging/v2/docs/grill-me_sesh/`](staging/v2/docs/grill-me_sesh/) (manifest, glossary, invariants, status matrix) + root [`CONTEXT.md`](CONTEXT.md).

**v1 invariants (non-negotiable):**

- Real Wokwi emulation only — no client-side hardware fakes ([`invariants.yaml`](staging/v2/docs/grill-me_sesh/invariants.yaml))
- Unmatched prompts → nearest variant + operator confirm before generate
- Generated projects under `.et2/projects/<id>/` (gitignored)

**Research appendix:** [`research/01-landscape.md`](research/01-landscape.md) … [`research/06-practical-guide.md`](research/06-practical-guide.md) — landscape + Wokwi CLI ref; not product spec.

**Active impl (on `staging/v2` branch, not this branch):** `staging/v2/scripts/variants.js` — template variant recipes.

**Legacy `main`:** `demo/*` + `./run-demo.sh` worktrees = historical Wokwi CLI demos; not north star for agentic plugin on `staging/v2`.

## OpenFlowKit — architecture diagrams (this branch)

**Visual index:** [`architecture/README.md`](architecture/README.md) — use **Open in editor** links for interactive pan/zoom on [openflowkit.com](https://openflowkit.com).

**Canonical spec:** [`staging/v2/docs/grill-me_sesh/architecture.yaml`](staging/v2/docs/grill-me_sesh/architecture.yaml). **Derived DSL:** `architecture/*.ofk`. When YAML changes, update the matching `.ofk` and run:

```bash
cd scripts && npm install && node encode-openflow-viewer-url.mjs ../architecture
```

**Optional MCP** ([`architecture/openflowkit.md`](architecture/openflowkit.md)) — when `@openflowkit/mcp-server` is published or built from [flowtress-docker/openflowkit](https://github.com/flowtress-docker/openflowkit/tree/main/mcp-server):

```json
{
  "mcpServers": {
    "openflowkit": {
      "command": "npx",
      "args": ["-y", "@openflowkit/mcp-server"]
    }
  }
}
```

Tools: `validate_openflow_dsl`, `create_viewer_url`, `find_icon`, `get_starter_template`. Read `openflowkit://docs/dsl-cheatsheet` before editing DSL.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **et2** (282 symbols, 320 relationships, 7 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/et2/context` | Codebase overview, check index freshness |
| `gitnexus://repo/et2/clusters` | All functional areas |
| `gitnexus://repo/et2/processes` | All execution flows |
| `gitnexus://repo/et2/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->

## Cursor Cloud (legacy demos on `main`)

This branch is **docs-only**. The following applies when working on **`main`** with `origin/demo/*` worktrees — not when editing files on `context`.

### One-time worktree setup

From repo root on `main` (idempotent):

```bash
mkdir -p .worktrees
for demo in smart-thermostat motion-alarm auto-blinds weather-station touch-ui; do
  git worktree add ".worktrees/demo-$demo" "origin/demo/$demo" 2>/dev/null || true
done
```

Worktrees may show **detached HEAD**; that is fine for `pio run` and `wokwi-cli`.

### Required secrets and tools

- **`WOKWI_CLI_TOKEN`** — https://wokwi.com/dashboard/ci — required for `wokwi-cli` simulation/scenarios.
- **PlatformIO:** `pip install --user platformio`
- **Wokwi CLI:** `curl -L https://wokwi.com/ci/install.sh | sh` or `npm install -g wokwi-cli`

### Build firmware and align `build/` paths

PlatformIO 6.x may ignore `build_dir = build` in `platformio.ini` and output under `.pio/build/<env>/`. After `pio run`, copy artifacts into `build/`:

```bash
cd .worktrees/demo-<name>
pio run
ENV_DIR=$(ls .pio/build | head -1)
mkdir -p build
cp ".pio/build/$ENV_DIR/firmware.bin" build/ 2>/dev/null || true
cp ".pio/build/$ENV_DIR/firmware.hex" build/ 2>/dev/null || true
cp ".pio/build/$ENV_DIR/firmware.uf2" build/ 2>/dev/null || true
cp ".pio/build/$ENV_DIR/firmware.elf" build/ 2>/dev/null || true
```

### Run / test (on `main`)

| Task | Command |
|------|---------|
| List demos | `./run-demo.sh` (no args) |
| Run one scenario | `./run-demo.sh smart-thermostat` |
| Run all scenarios | `./run-all-demos.sh` |
| Lint diagram only | `cd .worktrees/demo-<name> && wokwi-cli lint .` |
| Visual gallery | `cd visual-demo && python3 -m http.server 8765` |

### Wokwi simulation (verified in Cloud)

With `WOKWI_CLI_TOKEN` set, `./run-demo.sh smart-thermostat` succeeds after firmware is in `build/` and serial wires use **`TX0`/`RX0`** (not `TX`/`RX`) in `diagram.json`.

**Diagram fix (ESP32 demos):**

```json
["esp:TX0", "$serialMonitor:RX", "", []],
["esp:RX0", "$serialMonitor:TX", "", []]
```

**Scenario `expect-pin` (wokwi-cli 0.26.x):** Use pin `D2` and field **`value`** (not `expected`). Prefer `wait-serial` for “cleared” states.

### Known demo caveats

- **smart-thermostat:** E2E verified with token.
- **motion-alarm**, **touch-ui:** build OK; motion-alarm may timeout on serial boot until diagram/scenario aligned.
- **auto-blinds:** may fail (`Servo.h` missing from `lib_deps`).
- **weather-station:** may fail (`avishorp/TM1637` not in PlatformIO registry).
