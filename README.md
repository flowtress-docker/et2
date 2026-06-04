# 🔧 Wokwi CLI Demo Platform

Automated, scriptable microcontroller simulations with real sensor emulation. Built with isolated git worktrees, TDD automation scenarios, CI-ready artifacts, and visual demos produced via Puppeteer MCP.

## Architecture

```
et2/                    ← container (parent of this directory)
├── .bare/              ← bare git store (local, gitignored)
├── main/               ← **this directory** — workflow, orchestration, docs
│   ├── run-demo.sh
│   └── scripts/setup-git-scaffold.sh
└── .worktrees/
    ├── demo-smart-thermostat/     ← branch demo/smart-thermostat
    ├── demo-motion-alarm/
    ├── demo-auto-blinds/
    ├── demo-weather-station/
    └── demo-touch-ui/
```

Setup: from container root, `./scripts/setup-git-scaffold.sh` then `cd main`. See `docs/GIT-SCAFFOLD.md`.

**Key principle:** Each demo lives in an isolated git branch accessed via a worktree. The main branch contains only workflow scripts and documentation — no demo code is merged or staged into main.

## Demos

| Demo | Board | Sensors/Actuators | Branch |
|------|-------|-------------------|--------|
| **Smart Thermostat** | ESP32 DevKit v1 | DHT22, LED | `demo/smart-thermostat` |
| **Motion Alarm** | ESP32 DevKit v1 | MPU6050, Buzzer, LED | `demo/motion-alarm` |
| **Auto-Blinds** | Arduino Uno | Photoresistor, Servo | `demo/auto-blinds` |
| **Weather Station** | Raspberry Pi Pico | DHT22, TM1637 7-seg | `demo/weather-station` |
| **Touch UI** | ESP32-S3-Box | ILI9341 Display, Touch, RGB LED | `demo/touch-ui` |

## Quick Start

### Prerequisites

```bash
# Install Wokwi CLI
curl -L https://wokwi.com/ci/install.sh | sh

# Install PlatformIO
pip install platformio

# Set your Wokwi token
export WOKWI_CLI_TOKEN=<your-token>
```

### Run a Single Demo

```bash
./run-demo.sh smart-thermostat
```

### Run All Demos

```bash
./run-all-demos.sh
```

### Capture a Screenshot

```bash
./screenshot-demo.sh smart-thermostat 3000 screenshots/alarm.png
```

## TDD Methodology

Every demo follows strict test-driven development:

1. **RED** — Write `scenarios/demo.yaml` first. It asserts serial output, pin states, and sensor behavior.
2. **GREEN** — Write minimal firmware (`src/*.ino`) to satisfy the scenario.
3. **REFACTOR** — Clean up only after the scenario passes.

No demo contains features not asserted by its scenario. YAGNI applied ruthlessly.

## Visual Demo

An HTML gallery with live screenshots captured via Puppeteer MCP is available at:

```bash
open visual-demo/index.html
```

Screenshots include:
- ESP32 project running in Wokwi browser simulator
- ESP32 with HC-SR04 sensor + MQTT IoT demo
- Official Wokwi CLI documentation

## Context7 MCP Validation

All scaffolds were validated against Wokwi documentation retrieved via Context7 MCP:

- `/wokwi/wokwi-docs` — Official Wokwi docs library
- Automation scenario syntax verified
- Part types and controls cross-checked
- Build path misalignments fixed post-scaffold

## Bug Fixes Applied

| Issue | Fix |
|-------|-----|
| Build path mismatch (PlatformIO `.pio/build/` vs `build/`) | Added `build_dir = build` to all `platformio.ini` files |
| Weather Station blocking `while (!Serial)` | Replaced with non-blocking `delay(500)` |
| Touch UI `write-serial` uncertainty | Verified via web docs that `write-serial` IS supported |

## Git scaffold (`.bare` + worktrees)

```bash
# From container root (parent of main/)
./scripts/setup-git-scaffold.sh
cd main
```

See [docs/GIT-SCAFFOLD.md](docs/GIT-SCAFFOLD.md).

```bash
git worktree list
git --git-dir=../.bare worktree add ../.worktrees/demo-new-feature -b demo/new-feature
git worktree remove ../.worktrees/demo-new-feature
```

**Preservation rule:** Component branches are never merged into main. They remain isolated for independent evolution.

## CI Integration

Each demo branch can be tested independently in CI:

```bash
cd .worktrees/demo-smart-thermostat
pio run
wokwi-cli . --scenario scenarios/demo.yaml
```

No integration staging is required — the workflow scripts reference worktrees directly.

## References

- [Wokwi CLI Docs](https://docs.wokwi.com/wokwi-ci/getting-started)
- [Automation Scenarios](https://docs.wokwi.com/wokwi-ci/automation-scenarios)
- [Wokwi Part Tests](https://github.com/wokwi/wokwi-part-tests)
- [Implementation Plan](07-wokwi-cli-demos.md)
