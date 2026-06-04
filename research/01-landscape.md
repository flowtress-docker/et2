# Circuit Simulation Platform Landscape

> **v2 primary (grill session):** et2 v2 targets an **agentic Wokwi plugin** (MCP + skill + live sim canvas). Canonical spec: [staging/v2/docs/grill-me_sesh/manifest.yaml](../staging/v2/docs/grill-me_sesh/manifest.yaml).
>
> **This file:** Substrate comparison and background research. For v2 agents, **Wokwi-only** is the hardcoded substrate; **Tinkercad** and **SPICE-first** paths are de-prioritized (reference only). See [06-practical-guide.md](06-practical-guide.md) for legacy automation notes.

## Platforms with Official APIs

| Platform | API / Access Type | Language | License | URL |
|----------|-------------------|----------|---------|-----|
| **Ngspice** | CLI (netlist in, raw out); shared-library mode | C / shell | Open-source (BSD) | https://ngspice.sourceforge.io |
| **Xyce** | CLI (SPICE netlist); parallel/serial | C++ / shell | Open-source (GPLv3) | https://xyce.sandia.gov |
| **PySpice** | Python module (OO API + netlist parser) binds Ngspice/Xyce | Python | Open-source (GPLv3) | https://github.com/PySpice-org/PySpice |
| **KiCad (pcbnew)** | Built-in Python/SWIG API; Action Plugins | Python | Open-source (GPLv3+) | https://dev-docs.kicad.org/en/apis-and-binding/pcbnew |
| **LTspice** | Command-line batch mode (`.asc` → `.raw`); limited switches | — | Proprietary (free) | https://www.analog.com/en/design-center/design-tools-and-calculators/ltspice-simulator.html |
| **Wokwi** | Official CLI (`wokwi-cli`); WebSocket API token | JSON / shell / TS | Proprietary (free tier) | https://docs.wokwi.com/wokwi-ci/getting-started |
| **Qucsator** | CLI netlist simulator (Qucs backend) | C++ | Open-source (GPLv2+) | https://github.com/Qucs/qucsator |
| **Qucs-S** | GUI + CLI (`qucs-s -i`); switches between Ngspice/Xyce/Qucsator backends | — | Open-source (GPLv2+) | https://ra3xdh.github.io |

## Platforms with Unofficial/Community Wrappers

| Platform | Wrapper | What it does | License | URL |
|----------|---------|--------------|---------|-----|
| **LTspice** | PyLTSpice | Python toolchain: batch runner, raw-file reader, netlist editor, log parser | Open-source | https://pypi.org/project/PyLTSpice |
| **LTspice** | LTspice-cli (joskvi) | Python 2.7 CLI for parameter sweeps & batch sims | Open-source | https://github.com/joskvi/LTspice-cli |
| **KiCad** | kicad-python (la-gouach) | Pythonic wrapper over `pcbnew` SWIG API for batch / CI | Open-source | https://github.com/la-gouach/kicad-python |
| **KiCad** | kicad-action-scripts | Community scripts for DRC, BOM, placement | Open-source | https://github.com/search?q=kicad+python+script |
| **GeckoCIRCUITS** | PyGeckoCircuits2 | Python wrapper for power-electronics simulator | Open-source | https://github.com/upb-lea/PyGeckoCircuits2 |

## Browser-Only / No API

| Platform | Access | License | URL | Notes |
|----------|--------|---------|-----|-------|
| **Tinkercad Circuits** | Browser GUI only; no public API | Proprietary (free) | https://www.tinkercad.com/circuits | Arduino + basic electronics; export to EAGLE/Fusion 360 only |
| **Falstad Circuit Simulator** | Browser / Java applet; text-based circuit dump import/export | Open-source (custom) | https://falstad.com/circuit | Animated current flow; no scriptable API; community forks on GitHub |
| **CircuitLab** | Browser GUI only; simulations run client-side in JS | Proprietary (freemium) | https://www.circuitlab.com | No API or batch mode found |
| **SimulIDE** | Desktop GUI (Qt); load firmware HEX, serial port bridge | Open-source (GPLv3) | https://simulide.com | PIC/AVR/Arduino focus; no CLI/API for automation |

## Recommendation Matrix

| Need | Best Choice | Runner-up | Why |
|------|-------------|-----------|-----|
| **(a) Full programmatic API** | **PySpice + Ngspice/Xyce** | KiCad `pcbnew` Python API | PySpice gives an OO Python netlist API, handles units, outputs Numpy arrays, and can drive batch sweeps. KiCad is PCB-centric rather than pure simulation. |
| **(b) Browser automation / CI** | **Wokwi CLI** | None for Tinkercad | Wokwi has an official CLI with tokens, YAML scenarios, screenshot capture, and GitHub Actions support. Tinkercad and CircuitLab have no automation surface. |
| **(c) SPICE simulation (analog/mixed-signal)** | **Ngspice** or **Xyce** | LTspice + PyLTSpice | Ngspice is the open-source SPICE standard; Xyce adds massive parallel solve. LTspice is industry-de-facto but Windows-centric and lacks a rich API. |
| **(d) Education / Arduino learning** | **Tinkercad Circuits** | **Wokwi** or **SimulIDE** | Tinkercad has the simplest drag-drop + code block UI for beginners. Wokwi adds real MCU emulation (ESP32, RP2040) and GDB debugging. SimulIDE is offline/desktop alternative. |
