import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STAGING_DIR = path.resolve(__dirname, '..');
const BASE_DIR = path.join(STAGING_DIR, 'templates', 'base');
const VARIANTS_DIR = path.join(STAGING_DIR, 'variants');

// ── Variant Definitions ─────────────────────────────────────────

const VARIANTS = [
  {
    id: 'light-esp32',
    name: 'Light Sensor (ESP32)',
    board: {
      id: 'esp',
      type: 'wokwi-esp32-devkit-v1',
      platformioEnv: 'esp32dev',
      platformioPlatform: 'espressif32',
      platformioBoard: 'esp32dev',
      platformioFramework: 'arduino',
    },
    sensors: [
      {
        id: 'ldr',
        type: 'wokwi-photoresistor-sensor',
        attrs: { lux: '50' },
      },
    ],
    display: {
      id: 'lcd',
      type: 'wokwi-lcd1602',
    },
    connections: [
      ['esp:5V', 'ldr:VCC', 'red', ['v0']],
      ['esp:GND.1', 'ldr:GND', 'black', ['v0']],
      ['ldr:AO', 'esp:A0', 'orange', ['v0']],
      ['esp:5V', 'lcd:VDD', 'red', ['v0']],
      ['esp:GND.2', 'lcd:VSS', 'black', ['v0']],
      ['esp:D12', 'lcd:RS', 'blue', ['v0']],
      ['esp:D14', 'lcd:E', 'green', ['v0']],
      ['esp:D13', 'lcd:D4', 'yellow', ['v0']],
      ['esp:D27', 'lcd:D5', 'yellow', ['v0']],
      ['esp:D26', 'lcd:D6', 'yellow', ['v0']],
      ['esp:D25', 'lcd:D7', 'yellow', ['v0']],
      ['esp:TX', '$serialMonitor:RX', '', []],
      ['esp:RX', '$serialMonitor:TX', '', []],
    ],
    patchSketch(baseSketch) {
      return baseSketch
        .replace('#include <LiquidCrystal.h>', '#include <LiquidCrystal.h>\n#include <WiFi.h>')
        .replace('Serial.begin(9600)', 'Serial.begin(115200)');
    },
    platformioIni: `[platformio]
build_dir = build

[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
lib_deps = 
    arduino-libraries/LiquidCrystal @ ^1.0.7`,
    wokwiToml: `[wokwi]
version = 1
firmware = '.pio/build/esp32dev/firmware.bin'
elf = '.pio/build/esp32dev/firmware.elf'`,
    scenario: `name: 'Light Sensor ESP32 Scenario'
version: 1
author: 'Demo Bot'

steps:
  - wait-serial: 'LUX:'`,
    transforms: [
      { rule: 'board-swap', from: 'wokwi-arduino-uno', to: 'wokwi-esp32-devkit-v1' },
      { rule: 'pin-remap', board: 'wokwi-esp32-devkit-v1' },
      { rule: 'firmware-patch', target: 'Serial.begin', replace: '115200' },
      { rule: 'firmware-patch', target: 'include', add: 'WiFi.h' },
    ],
  },
  {
    id: 'temp-arduino',
    name: 'Temp Sensor (Arduino)',
    board: {
      id: 'uno',
      type: 'wokwi-arduino-uno',
      platformioEnv: 'uno',
      platformioPlatform: 'atmelavr',
      platformioBoard: 'uno',
      platformioFramework: 'arduino',
    },
    sensors: [
      {
        id: 'dht',
        type: 'wokwi-dht22',
        attrs: { temperature: '25', humidity: '50' },
      },
    ],
    display: {
      id: 'seg',
      type: 'wokwi-tm1637-7segment',
    },
    connections: [
      ['uno:5V', 'dht:VCC', 'red', ['v0']],
      ['uno:GND.1', 'dht:GND', 'black', ['v0']],
      ['dht:SDA', 'uno:A1', 'orange', ['v0']],
      ['uno:5V', 'seg:VCC', 'red', ['v0']],
      ['uno:GND.2', 'seg:GND', 'black', ['v0']],
      ['uno:3', 'seg:CLK', 'blue', ['v0']],
      ['uno:2', 'seg:DIO', 'green', ['v0']],
      ['uno:1', '$serialMonitor:RX', '', []],
      ['uno:0', '$serialMonitor:TX', '', []],
    ],
    patchSketch() {
      return `#include <DHT.h>
#include <TM1637Display.h>

TM1637Display display(3, 2);

const int dhtPin = 15;
#define DHTTYPE DHT22

DHT dht(dhtPin, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
  display.setBrightness(7);
  delay(500);
}

void loop() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  // Display temperature on 7-segment
  display.showNumberDec((int)temp);

  // Serial output for backend parsing
  Serial.print("TEMP:");
  Serial.print(temp);
  Serial.print(" HUM:");
  Serial.println(hum);

  delay(500);
}
`;
    },
    platformioIni: `[platformio]
build_dir = build

[env:uno]
platform = atmelavr
board = uno
framework = arduino
lib_deps = 
    adafruit/DHT sensor library @ ^1.4.6
    avishorp/TM1637 @ ^1.2.0`,
    wokwiToml: `[wokwi]
version = 1
firmware = '.pio/build/uno/firmware.hex'
elf = '.pio/build/uno/firmware.elf'`,
    scenario: `name: 'Temp Sensor Arduino Scenario'
version: 1
author: 'Demo Bot'

steps:
  - wait-serial: 'TEMP:'`,
    transforms: [
      { rule: 'sensor-swap', from: 'wokwi-photoresistor-sensor', to: 'wokwi-dht22' },
      { rule: 'display-swap', from: 'wokwi-lcd1602', to: 'wokwi-tm1637-7segment' },
      { rule: 'firmware-patch', target: 'sensor', replace: 'DHT22' },
      { rule: 'firmware-patch', target: 'display', replace: 'TM1637' },
    ],
  },
  {
    id: 'motion-pico',
    name: 'Motion Sensor (Pico)',
    board: {
      id: 'pico',
      type: 'wokwi-pi-pico',
      platformioEnv: 'pico',
      platformioPlatform: 'raspberrypi',
      platformioBoard: 'pico',
      platformioFramework: 'arduino',
    },
    sensors: [
      {
        id: 'mpu',
        type: 'wokwi-mpu6050',
        attrs: {},
      },
    ],
    display: {
      id: 'oled',
      type: 'wokwi-ssd1306',
    },
    connections: [
      ['pico:3V3', 'mpu:VCC', 'red', ['v0']],
      ['pico:GND', 'mpu:GND', 'black', ['v0']],
      ['pico:GP5', 'mpu:SCL', 'blue', ['v0']],
      ['pico:GP4', 'mpu:SDA', 'green', ['v0']],
      ['pico:3V3', 'oled:VCC', 'red', ['v0']],
      ['pico:GND', 'oled:GND', 'black', ['v0']],
      ['pico:GP5', 'oled:SCL', 'blue', ['v0']],
      ['pico:GP4', 'oled:SDA', 'green', ['v0']],
      ['pico:GP0', '$serialMonitor:RX', '', []],
      ['pico:GP1', '$serialMonitor:TX', '', []],
    ],
    patchSketch() {
      return `#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <MPU6050.h>

Adafruit_SSD1306 display(128, 64, &Wire, -1);

MPU6050 mpu;

void setup() {
  Serial.begin(9600);
  Wire.begin();
  mpu.initialize();

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 allocation failed"));
  }
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.println("Motion Sensor");
  display.display();
  delay(500);
  display.clearDisplay();
}

void loop() {
  int16_t ax, ay, az;
  mpu.getAcceleration(&ax, &ay, &az);

  display.clearDisplay();
  display.setCursor(0, 0);
  display.print("AX:");
  display.println(ax);
  display.print("AY:");
  display.println(ay);
  display.print("AZ:");
  display.println(az);
  display.display();

  // Serial output for backend parsing
  Serial.print("AX:");
  Serial.print(ax);
  Serial.print(" AY:");
  Serial.print(ay);
  Serial.print(" AZ:");
  Serial.println(az);

  delay(500);
}
`;
    },
    platformioIni: `[platformio]
build_dir = build

[env:pico]
platform = raspberrypi
board = pico
framework = arduino
lib_deps = 
    adafruit/Adafruit SSD1306 @ ^2.5.7
    adafruit/Adafruit GFX Library @ ^1.11.9
    electroniccats/MPU6050 @ ^1.0.1`,
    wokwiToml: `[wokwi]
version = 1
firmware = '.pio/build/pico/firmware.uf2'
elf = '.pio/build/pico/firmware.elf'`,
    scenario: `name: 'Motion Sensor Pico Scenario'
version: 1
author: 'Demo Bot'

steps:
  - wait-serial: 'AX:'`,
    transforms: [
      { rule: 'board-swap', from: 'wokwi-arduino-uno', to: 'wokwi-pi-pico' },
      { rule: 'pin-remap', board: 'wokwi-pi-pico' },
      { rule: 'sensor-swap', from: 'wokwi-photoresistor-sensor', to: 'wokwi-mpu6050' },
      { rule: 'display-swap', from: 'wokwi-lcd1602', to: 'wokwi-ssd1306' },
      { rule: 'firmware-patch', target: 'sensor', replace: 'MPU6050' },
      { rule: 'firmware-patch', target: 'display', replace: 'OLED' },
    ],
  },
  {
    id: 'smart-sprinkler',
    name: 'Smart Sprinkler (ESP32)',
    board: {
      id: 'esp',
      type: 'wokwi-esp32-devkit-v1',
      platformioEnv: 'esp32dev',
      platformioPlatform: 'espressif32',
      platformioBoard: 'esp32dev',
      platformioFramework: 'arduino',
    },
    sensors: [
      {
        id: 'soil',
        type: 'wokwi-soil-moisture',
        attrs: { moisture: '30' },
      },
      {
        id: 'dht',
        type: 'wokwi-dht22',
        attrs: { temperature: '28', humidity: '45' },
      },
    ],
    display: {
      id: 'oled',
      type: 'wokwi-ssd1306',
    },
    actuator: {
      id: 'relay',
      type: 'wokwi-relay-module',
      attrs: { state: 'open' },
    },
    connections: [
      ['esp:3V3', 'soil:VCC', 'red', ['v0']],
      ['esp:GND.1', 'soil:GND', 'black', ['v0']],
      ['esp:D34', 'soil:AO', 'orange', ['v0']],
      ['esp:3V3', 'dht:VCC', 'red', ['v0']],
      ['esp:GND.2', 'dht:GND', 'black', ['v0']],
      ['esp:D15', 'dht:SDA', 'green', ['v0']],
      ['esp:3V3', 'oled:VCC', 'red', ['v0']],
      ['esp:GND.2', 'oled:GND', 'black', ['v0']],
      ['esp:D21', 'oled:SDA', 'green', ['v0']],
      ['esp:D22', 'oled:SCL', 'blue', ['v0']],
      ['esp:3V3', 'relay:VCC', 'red', ['v0']],
      ['esp:GND.2', 'relay:GND', 'black', ['v0']],
      ['esp:D18', 'relay:IN', 'yellow', ['v0']],
      ['esp:TX', '$serialMonitor:RX', '', []],
      ['esp:RX', '$serialMonitor:TX', '', []],
    ],
    patchSketch() {
      return `#include <WiFi.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

#define DHTPIN 15
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

const int soilPin = 34;
const int relayPin = 18;

void setup() {
  Serial.begin(115200);
  Wire.begin();
  dht.begin();
  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, LOW);

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 allocation failed"));
  }
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.println("Smart Sprinkler ready");
  display.display();
  delay(500);
  display.clearDisplay();
}

void loop() {
  int moisture = analogRead(soilPin);
  float temp = dht.readTemperature();
  float humidity = dht.readHumidity();

  display.clearDisplay();
  display.setCursor(0, 0);

  if (moisture < 40 && temp > 25) {
    digitalWrite(relayPin, HIGH);
    display.println("SPRINKLER ON");
  } else {
    digitalWrite(relayPin, LOW);
    display.println("IDLE");
  }
  display.display();

  Serial.print("SOIL:");
  Serial.print(moisture);
  Serial.print(" TEMP:");
  Serial.print(temp);
  Serial.print(" HUM:");
  Serial.print(humidity);
  Serial.print(" STATE:");
  Serial.println((digitalRead(relayPin) == HIGH) ? "ON" : "OFF");

  delay(1000);
}
`;
    },
    platformioIni: `[platformio]
build_dir = build

[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
lib_deps = 
    adafruit/Adafruit SSD1306 @ ^2.5.7
    adafruit/Adafruit GFX Library @ ^1.11.9
    adafruit/DHT sensor library @ ^1.4.6`,
    wokwiToml: `[wokwi]
version = 1
firmware = '.pio/build/esp32dev/firmware.bin'
elf = '.pio/build/esp32dev/firmware.elf'`,
    scenario: `name: 'Smart Sprinkler Scenario'
version: 1
author: 'Demo Bot'

steps:
  - wait-serial: 'Smart Sprinkler ready'
  - set-control:
      part-id: soil
      control: moisture
      value: 20
  - set-control:
      part-id: dht
      control: temperature
      value: 30
  - delay: 2s
  - expect-pin:
      part-id: esp
      pin: 18
      expected: 1
  - wait-serial: 'STATE:ON'
  - set-control:
      part-id: soil
      control: moisture
      value: 60
  - delay: 2s
  - expect-pin:
      part-id: esp
      pin: 18
      expected: 0
  - wait-serial: 'STATE:OFF'`,
    transforms: [
      { rule: 'board-swap', from: 'wokwi-arduino-uno', to: 'wokwi-esp32-devkit-v1' },
      { rule: 'sensor-swap', from: 'wokwi-photoresistor-sensor', to: 'wokwi-soil-moisture' },
      { rule: 'sensor-add', type: 'wokwi-dht22' },
      { rule: 'display-swap', from: 'wokwi-lcd1602', to: 'wokwi-ssd1306' },
      { rule: 'actuator-add', type: 'wokwi-relay-module' },
      { rule: 'firmware-patch', target: 'sensor', replace: 'soil-moisture+DHT22' },
      { rule: 'firmware-patch', target: 'display', replace: 'OLED' },
    ],
  },
];

// ── Helpers ─────────────────────────────────────────────────────

function buildDiagram(baseDiagram, variant) {
  return {
    version: baseDiagram.version,
    author: baseDiagram.author,
    editor: baseDiagram.editor,
    parts: [
      {
        id: variant.board.id,
        type: variant.board.type,
        top: 0,
        left: 0,
      },
      ...variant.sensors.map((s, i) => ({
        id: s.id,
        type: s.type,
        top: -100,
        left: -80 + i * 260,
        ...(Object.keys(s.attrs).length ? { attrs: s.attrs } : {}),
      })),
      {
        id: variant.display.id,
        type: variant.display.type,
        top: -60,
        left: -80 + variant.sensors.length * 260,
      },
      ...(variant.actuator
        ? [
            {
              id: variant.actuator.id,
              type: variant.actuator.type,
              top: -100,
              left: -80 + (variant.sensors.length + 1) * 260,
              ...(Object.keys(variant.actuator.attrs || {}).length
                ? { attrs: variant.actuator.attrs }
                : {}),
            },
          ]
        : []),
    ],
    connections: variant.connections,
  };
}

function buildVariantJson(variant) {
  return {
    id: variant.id,
    name: variant.name,
    base: 'base',
    board: variant.board,
    sensors: variant.sensors,
    display: variant.display,
    ...(variant.actuator ? { actuator: variant.actuator } : {}),
    transforms: variant.transforms,
  };
}

// ── I/O ─────────────────────────────────────────────────────────

async function readBase() {
  const [diagramRaw, sketch, wokwi, platformio, scenario] = await Promise.all([
    fs.readFile(path.join(BASE_DIR, 'diagram.json'), 'utf-8'),
    fs.readFile(path.join(BASE_DIR, 'src', 'sketch.ino'), 'utf-8'),
    fs.readFile(path.join(BASE_DIR, 'wokwi.toml'), 'utf-8'),
    fs.readFile(path.join(BASE_DIR, 'platformio.ini'), 'utf-8'),
    fs.readFile(path.join(BASE_DIR, 'scenarios', 'base.yaml'), 'utf-8'),
  ]);
  return {
    diagram: JSON.parse(diagramRaw),
    sketch,
    wokwi,
    platformio,
    scenario,
  };
}

async function generateVariant(base, variant) {
  const dir = path.join(VARIANTS_DIR, variant.id);
  await fs.mkdir(dir, { recursive: true });
  await fs.mkdir(path.join(dir, 'scenarios'), { recursive: true });

  const diagram = buildDiagram(base.diagram, variant);
  await fs.writeFile(
    path.join(dir, 'diagram.json'),
    JSON.stringify(diagram, null, 2)
  );

  const sketch = variant.patchSketch(base.sketch);
  await fs.mkdir(path.join(dir, 'src'), { recursive: true });
  await fs.writeFile(path.join(dir, 'src', 'sketch.ino'), sketch);

  await fs.writeFile(path.join(dir, 'platformio.ini'), variant.platformioIni);
  await fs.writeFile(path.join(dir, 'wokwi.toml'), variant.wokwiToml);
  await fs.writeFile(path.join(dir, 'scenarios', 'base.yaml'), variant.scenario);

  const meta = buildVariantJson(variant);
  await fs.writeFile(
    path.join(dir, 'variant.json'),
    JSON.stringify(meta, null, 2)
  );

  console.log(`Generated variant: ${variant.id}`);
}

// ── Main ────────────────────────────────────────────────────────

async function main() {
  const base = await readBase();

  for (const variant of VARIANTS) {
    await generateVariant(base, variant);
  }

  console.log(`\nAll variants written to ${VARIANTS_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
