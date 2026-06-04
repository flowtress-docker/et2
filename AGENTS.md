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

## Cursor Cloud specific instructions

This repo is a **Wokwi CLI demo orchestration** project: firmware and scenarios live on isolated `origin/demo/*` branches, accessed via **git worktrees** under `.worktrees/` (gitignored). The `main` branch has Bash runners and docs only.

### One-time worktree setup

From repo root (idempotent if directories already exist):

```bash
mkdir -p .worktrees
for demo in smart-thermostat motion-alarm auto-blinds weather-station touch-ui; do
  git worktree add ".worktrees/demo-$demo" "origin/demo/$demo" 2>/dev/null || true
done
```

Worktrees may show **detached HEAD**; that is fine for `pio run` and `wokwi-cli`.

### Required secrets and tools

- **`WOKWI_CLI_TOKEN`** (required for `wokwi-cli` simulation/scenarios). Create at https://wokwi.com/dashboard/ci and `export WOKWI_CLI_TOKEN=...` before `./run-demo.sh` or `./run-all-demos.sh`.
- **PlatformIO**: `pip install --user platformio` (already on PATH as `pio` / `platformio` in Cloud VMs).
- **Wokwi CLI**: `curl -L https://wokwi.com/ci/install.sh | sh` or `npm install -g wokwi-cli`.

### Build firmware and align `build/` paths

Each demo’s `wokwi.toml` expects `build/firmware.{bin,hex,uf2}`, but PlatformIO 6.x in this repo **ignores** `build_dir = build` in `platformio.ini` (warning: unknown option) and outputs under `.pio/build/<env>/`. After `pio run`, copy artifacts:

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

### Run / test commands (see also `README.md`)

| Task | Command |
|------|---------|
| List demos | `./run-demo.sh` (no args) |
| Run one scenario | `./run-demo.sh smart-thermostat` (needs token + built firmware) |
| Run all scenarios | `./run-all-demos.sh` |
| Lint diagram only | `cd .worktrees/demo-<name> && wokwi-cli lint .` (no token) |
| Visual gallery | `cd visual-demo && python3 -m http.server 8765` then open http://127.0.0.1:8765/ |

There is **no** root `package.json`, Makefile, Docker, or committed CI workflow on `main`. Lint/pre-commit hooks are not configured.

### Wokwi simulation (verified in Cloud)

With `WOKWI_CLI_TOKEN` set, `./run-demo.sh smart-thermostat` completes successfully (~8s) after firmware is in `build/` and the diagram serial wires use **`TX0`/`RX0`** (not `TX`/`RX`) in `diagram.json`.

**Diagram fix (ESP32 demos):** In each worktree `diagram.json`, change serial monitor connections to:

```json
["esp:TX0", "$serialMonitor:RX", "", []],
["esp:RX0", "$serialMonitor:TX", "", []]
```

Without this, scenarios time out waiting for serial boot text.

**Scenario `expect-pin` (wokwi-cli 0.26.x):** Use pin name `D2` and field **`value`** (not `expected`), e.g. `expect-pin: { part-id: esp, pin: D2, value: 1 }`. Asserting `value: 0` can spuriously fail even when the pin reads 0; prefer ending with `wait-serial` for “cleared” states.

### Known demo build/sim caveats (as of setup)

- **smart-thermostat**: `pio run` + scenario E2E verified with token.
- **motion-alarm**, **touch-ui**: `pio run` succeeds; motion-alarm scenario may timeout on serial boot (LEDC init noise in log) until diagram/scenario are aligned on the demo branch.
- **auto-blinds**: build may fail (`Servo.h` not in `platformio.ini` lib_deps).
- **weather-station**: build may fail (`avishorp/TM1637` package not found in PlatformIO registry).