# Wokwi CLI Demo Platform — Implementation Plan

## 1. Objective

Build a reproducible, scriptable demo system using the **Wokwi CLI** to simulate microprocessors, sensors, actuators, and displays. The output is a collection of ready-to-run project templates + automation scenarios that can be executed locally or in CI.

## 2. Why Wokwi CLI (Validated from Research)

| Criterion | Wokwi CLI | Tinkercad | PySpice |
|-----------|-----------|-----------|---------|
| Official CLI / API | ✅ Yes | ❌ No | ✅ Yes (Python) |
| Real MCU emulation | ✅ ESP32, RP2040, STM32, ATtiny | ⚠️ Arduino only | ❌ Analog only |
| Sensor simulation | ✅ DHT22, MPU6050, photoresistor, etc. | ⚠️ Basic set | ❌ N/A |
| Automation scenarios | ✅ YAML-driven | ❌ None | ✅ Python scripts |
| Screenshot capture | ✅ Built-in | ❌ None | ❌ None |
| CI / GitHub Actions | ✅ Native | ❌ None | ✅ Yes |
| GDB debugging | ✅ Yes | ❌ No | ❌ N/A |

**Verdict:** Wokwi CLI is the only tool in our landscape that combines real microcontroller emulation, sensor automation, screenshot capture, and CI integration.

## 3. Prerequisites

- Node.js ≥ 16
- Wokwi account + CI token (get at https://wokwi.com)
- PlatformIO Core (for compiling firmware) OR Arduino CLI
- `wokwi-cli` installed:
  ```bash
  curl -L https://wokwi.com/ci/install.sh | sh
  # or
  npm install -g wokwi-cli
  ```

## 4. Project Structure (Standard Template)

Every demo project follows this layout:

```
demos/<demo-name>/
├── diagram.json          # Circuit definition
├── wokwi.toml            # Simulator config
├── src/
│   └── main.ino          # Firmware (Arduino / ESP32 / etc.)
├── scenarios/
│   └── demo.yaml         # Automation script
├── screenshots/            # Generated artifacts
└── README.md
```

## 5. Core Files Explained

### 5.1 `diagram.json` — The Circuit

Defines parts, positions, and wiring. Example for an ESP32 + DHT22 + LED demo:

```json
{
  "version": 1,
  "author": "Demo Bot",
  "editor": "wokwi",
  "parts": [
    {
      "id": "esp",
      "type": "wokwi-esp32-devkit-v1",
      "left": 0,
      "top": 0
    },
    {
      "id": "dht",
      "type": "wokwi-dht22",
      "left": 120,
      "top": 20,
      "attrs": { "temperature": "25", "humidity": "50" }
    },
    {
      "id": "led1",
      "type": "wokwi-led",
      "left": 200,
      "top": 80,
      "attrs": { "color": "red" }
    },
    {
      "id": "r1",
      "type": "wokwi-resistor",
      "left": 180,
      "top": 80,
      "attrs": { "value": "220" }
    }
  ],
  "connections": [
    ["esp:TX", "$serialMonitor:RX", "", []],
    ["esp:RX", "$serialMonitor:TX", "", []],
    ["esp:GND.2", "dht:GND", "black", ["h0"]],
    ["esp:3V3", "dht:VCC", "red", ["h0"]],
    ["esp:D15", "dht:SDA", "green", ["h0"]],
    ["esp:D2", "r1:1", "green", ["h0"]],
    ["r1:2", "led1:A", "green", ["h0"]],
    ["led1:C", "esp:GND.2", "black", ["h0"]]
  ]
}
```

### 5.2 `wokwi.toml` — Simulator Configuration

```toml
[wokwi]
version = 1
firmware = 'build/main.ino.bin'
elf = 'build/main.ino.elf'
# Optional: enable GDB server for debugging
# gdbServerPort = 3333
```

### 5.3 `scenarios/demo.yaml` — Automation Script

The heart of the demo system. Steps are executed sequentially.

```yaml
name: 'Smart Thermostat Demo'
version: 1
author: 'Demo Bot'

steps:
  # Wait for system boot
  - wait-serial: 'WiFi connected'

  # Phase 1: Normal conditions
  - set-control:
      part-id: dht
      control: temperature
      value: 22
  - delay: 1s

  # Phase 2: Temperature spike → alarm triggers
  - set-control:
      part-id: dht
      control: temperature
      value: 35
  - delay: 1s

  # Assert alarm LED is ON
  - expect-pin:
      part-id: esp
      pin: 2
      expected: 1

  # Capture screenshot for presentation
  - take-screenshot:
      part-id: esp
      save-to: 'screenshots/alarm-state.png'

  # Phase 3: Return to normal
  - set-control:
      part-id: dht
      control: temperature
      value: 22
  - delay: 500ms

  # Interactive input
  - write-serial: 'READ\n'
  - wait-serial: 'Temp: 22.00 C'
```

## 6. Scenario Step Reference

| Step | Description | Example |
|------|-------------|---------|
| `delay` | Wait for duration | `delay: 500ms` |
| `set-control` | Change part state | `set-control: { part-id: dht, control: temperature, value: 35 }` |
| `wait-serial` | Block until text appears | `wait-serial: 'Ready'` |
| `write-serial` | Inject text/bytes | `write-serial: 'READ\n'` |
| `expect-pin` | Assert GPIO value | `expect-pin: { part-id: esp, pin: 2, expected: 1 }` |
| `take-screenshot` | Capture PNG | `take-screenshot: { part-id: esp, save-to: 'out.png' }` |
| `touch` | Simulate touchscreen tap | `touch: { part-id: esp32s3box, x: 120, y: 160 }` |
| `touch-press` / `touch-move` / `touch-release` | Low-level gestures | For drag simulations |

## 7. Parts with Automation Controls (Demos Ready)

These parts accept `set-control` commands:

| Part | Available Controls |
|------|-------------------|
| **Push Button** | `pressed` (0 or 1) |
| **Potentiometer** | `value` (0–100) |
| **DHT22** | `temperature`, `humidity` |
| **MPU6050** | `temperature`, `accelX`, `accelY`, `accelZ`, `gyroX`, `gyroY`, `gyroZ` |
| **Photoresistor** | `lux` |
| **Analog Joystick** | `direction`, `pressed` |
| **HX711 Load Cell** | `load` |

## 8. Demo Recipes (Ready to Build)

### Demo A: Smart Thermostat
**Board:** ESP32 DevKit v1  
**Parts:** DHT22, red LED, resistor  
**Scenario:** Ramp temp → LED alarm → screenshot → ramp down  
**Use case:** IoT climate control demo

### Demo B: Motion Alarm
**Board:** ESP32 DevKit v1  
**Parts:** MPU6050, buzzer, LED  
**Scenario:** Shake IMU → trigger alarm → capture frame  
**Use case:** Security / wearables demo

### Demo C: Auto-Blinds
**Board:** Arduino Uno  
**Parts:** Photoresistor, servo motor  
**Scenario:** Drop lux → servo closes → raise lux → servo opens  
**Use case:** Home automation demo

### Demo D: Weather Station
**Board:** Raspberry Pi Pico  
**Parts:** DHT22, TM1637 7-segment display  
**Scenario:** Cycle humidity values → assert display updates  
**Use case:** Sensor reading / display demo

### Demo E: Touch UI Navigation
**Board:** ESP32-S3-Box  
**Parts:** ILI9341 + FT6206 touch display  
**Scenario:** `touch-press` → `touch-move` → `touch-release` to swipe screens  
**Use case:** HMI / interface demo

## 9. Build & Run Commands

```bash
# 1. Navigate to a demo
cd demos/smart-thermostat

# 2. Compile firmware (PlatformIO)
pio run

# 3. Run interactive simulation
wokwi-cli .

# 4. Run automated demo scenario
wokwi-cli . --scenario scenarios/demo.yaml

# 5. Capture screenshot at specific time
wokwi-cli \
  --screenshot-part esp \
  --screenshot-time 4500 \
  --screenshot-frame screenshots/frame.png \
  .

# 6. Run with serial logging
wokwi-cli --serial-log-file serial.log --timeout 30000 .
```

## 10. CI / GitHub Actions Integration

```yaml
name: Wokwi Demos

on: [push, pull_request]

jobs:
  simulate:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        demo: [smart-thermostat, motion-alarm, auto-blinds]
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Wokwi CLI
        run: curl -L https://wokwi.com/ci/install.sh | sh

      - name: Setup PlatformIO
        run: |
          pip install platformio
          pio pkg install

      - name: Build firmware
        working-directory: demos/${{ matrix.demo }}
        run: pio run

      - name: Run scenario
        working-directory: demos/${{ matrix.demo }}
        env:
          WOKWI_CLI_TOKEN: ${{ secrets.WOKWI_CLI_TOKEN }}
        run: |
          wokwi-cli \
            --scenario scenarios/demo.yaml \
            --screenshot-part esp \
            --screenshot-time 5000 \
            --screenshot-file screenshots/demo.png \
            .

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: ${{ matrix.demo }}-screenshots
          path: demos/${{ matrix.demo }}/screenshots/
```

## 11. Debugging with GDB

Add to `wokwi.toml`:
```toml
[wokwi]
version = 1
firmware = 'build/main.ino.bin'
elf = 'build/main.ino.elf'
gdbServerPort = 3333
```

Then in VS Code, create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Wokwi GDB",
      "type": "cppdbg",
      "request": "launch",
      "program": "${workspaceFolder}/build/main.ino.elf",
      "cwd": "${workspaceFolder}",
      "MIMode": "gdb",
      "miDebuggerPath": "xtensa-esp32-elf-gdb",
      "miDebuggerServerAddress": "localhost:3333"
    }
  ]
}
```

Start simulator with: **F1** → `Wokwi: Start Simulator and Wait for Debugger`, then press **F5**.

## 12. Reference Links

| Resource | URL |
|----------|-----|
| Wokwi CLI Docs | https://docs.wokwi.com/wokwi-ci/getting-started |
| Automation Scenarios | https://docs.wokwi.com/wokwi-ci/automation-scenarios |
| Official Part Tests (examples) | https://github.com/wokwi/wokwi-part-tests |
| ESP-IDF + Wokwi Guide | https://docs.espressif.com/projects/esp-idf/en/latest/esp32c2/third-party-tools/wokwi.html |
| Supported Parts List | https://docs.wokwi.com/parts |
| Our Research | `research/01-landscape.md`, `research/06-practical-guide.md` |

## 13. Next Steps

1. **Create `demos/` directory** in this repo
2. **Implement Demo A (Smart Thermostat)** as the reference template
3. **Test `wokwi-cli` execution** with a Wokwi CI token
4. **Iterate** on scenario YAMLs for narrative flow (setup → action → assertion → screenshot)
5. **Add GitHub Actions workflow** for automated demo artifact generation
