# Touch UI Demo

A Wokwi CLI demo for ESP32-S3-BOX with built-in ILI9341 display and touch UI.

## Behavior

- Shows an "ON" and "OFF" button on the built-in display.
- Simulated touch via serial commands changes the external RGB LED color.
- Touching the ON area turns the LED green.
- Touching the OFF area turns the LED red.
- Prints touch coordinates and LED state to Serial.

## Why Serial Fallback?

The `board-esp32-s3-box` Wokwi part has a built-in ILI9341 display, but its capacitive touch controller is not currently exposed for Wokwi CLI `touch` automation. The firmware therefore accepts `TOUCH x y` commands over Serial as a fallback, while also attempting to read a real FT6206 controller if present.

## Parts

- `board-esp32-s3-box` (built-in ILI9341 display)
- `wokwi-rgb-led` (external RGB LED)
- 2× 220Ω resistors

## Pin Changes

The spec asked for LED anode → D4, but GPIO 4 on the ESP32-S3-BOX is used for the built-in display (TFT_DC). The LED is connected to GPIO 2 (RED) and GPIO 3 (GREEN) instead.

## Build & Run

```bash
# Build firmware with PlatformIO
pio run

# Copy binary to the path expected by wokwi.toml
cp .pio/build/esp32-s3-devkitc-1/firmware.bin build/touch-ui.ino.bin
cp .pio/build/esp32-s3-devkitc-1/firmware.elf build/touch-ui.ino.elf

# Run the Wokwi scenario
wokwi-cli --scenario scenarios/demo.yaml
```
