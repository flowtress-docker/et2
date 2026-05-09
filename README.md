# Auto-Blinds Demo

A Wokwi CLI demo for Arduino Uno that automatically opens or closes blinds based on ambient light.

## Behavior

- Reads light level from a photoresistor on analog pin A0.
- If lux < 30 (dark), closes blinds: servo moves to 0°.
- If lux > 70 (bright), opens blinds: servo moves to 90°.
- Prints status messages to Serial.

## Parts

- Arduino Uno
- Photoresistor (LDR)
- Servo motor

## Build & Run

```bash
# Build firmware with PlatformIO
pio run

# Run the Wokwi scenario
wokwi-cli --scenario scenarios/demo.yaml
```
