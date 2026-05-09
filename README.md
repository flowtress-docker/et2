# Motion Alarm Demo

A Wokwi CLI demo project for ESP32 featuring an MPU6050 IMU, a passive buzzer, and a red LED alarm indicator.

## Behavior

1. The ESP32 reads accelerometer data from the MPU6050 via I2C.
2. If **accelX** or **accelY** magnitude exceeds **2.0 g** (simulating a shake), the alarm triggers.
3. Alarm state: red LED turns ON and the buzzer emits a 1 kHz tone.
4. When motion subsides, the alarm clears: LED turns OFF and buzzer stops.
5. All status messages are printed to Serial.

## Project Structure

| File | Description |
|------|-------------|
| `diagram.json` | Wokwi circuit diagram (parts & connections) |
| `wokwi.toml` | Wokwi CLI configuration |
| `src/motion-alarm.ino` | Arduino/ESP32 firmware |
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
