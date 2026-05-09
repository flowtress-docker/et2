# Smart Thermostat Demo

A Wokwi CLI demo project for ESP32 featuring a DHT22 temperature sensor and a red LED alarm indicator.

## Behavior

1. The ESP32 reads temperature from the DHT22 every second.
2. If temperature exceeds **30°C**, the red LED turns ON and an alarm message is printed.
3. If temperature drops to **25°C** or below, the red LED turns OFF.
4. All readings are printed to Serial.

## Project Structure

| File | Description |
|------|-------------|
| `diagram.json` | Wokwi circuit diagram (parts & connections) |
| `wokwi.toml` | Wokwi CLI configuration |
| `src/smart-thermostat.ino` | Arduino/ESP32 firmware |
| `platformio.ini` | PlatformIO build configuration |
| `scenarios/demo.yaml` | Automation scenario (TDD test) |

## Running the Demo

### Build the firmware

```bash
pio run
```

### Run the Wokwi scenario

```bash
wokwi-cli --scenario scenarios/demo.yaml
```

Or open the project in the [Wokwi Web IDE](https://wokwi.com/).
