# Weather Station Demo

A Wokwi CLI demo for the Raspberry Pi Pico that reads temperature and humidity from a DHT22 sensor and displays the temperature on a TM1637 7-segment display.

## Hardware

- Raspberry Pi Pico
- DHT22 sensor (GP15)
- TM1637 7-segment display (CLK=GP16, DIO=GP17)

## Run

1. Build the firmware with PlatformIO:
   ```bash
   pio run
   ```
2. Run the Wokwi scenario:
   ```bash
   wokwi-cli --scenario scenarios/demo.yaml
   ```
