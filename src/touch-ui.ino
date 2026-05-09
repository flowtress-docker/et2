#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ILI9341.h>
#include <Wire.h>
#include <Adafruit_FT6206.h>

// ESP32-S3-BOX built-in display pins
#define TFT_DC    4
#define TFT_CS    5
#define TFT_MOSI  6
#define TFT_CLK   7
#define TFT_CTRL 45
#define TFT_RST  48

// External RGB LED pins (GPIO 4 is TFT_DC, so we use GPIO 2 & 3)
#define LED_R_PIN 2
#define LED_G_PIN 3

// Button areas on 240x320 display
#define BTN_ON_X   70
#define BTN_ON_Y   80
#define BTN_ON_W  180
#define BTN_ON_H   60

#define BTN_OFF_X   70
#define BTN_OFF_Y  160
#define BTN_OFF_W 180
#define BTN_OFF_H   60

Adafruit_ILI9341 tft = Adafruit_ILI9341(TFT_CS, TFT_DC, TFT_MOSI, TFT_CLK, TFT_RST);
Adafruit_FT6206 ctp = Adafruit_FT6206();

void setup() {
  Serial.begin(115200);

  pinMode(LED_R_PIN, OUTPUT);
  pinMode(LED_G_PIN, OUTPUT);
  digitalWrite(LED_R_PIN, LOW);
  digitalWrite(LED_G_PIN, LOW);

  pinMode(TFT_CTRL, OUTPUT);
  digitalWrite(TFT_CTRL, HIGH);

  tft.begin();

  // Display orientation matching ESP32-S3-BOX examples
  const uint8_t mode = 0xc8;
  tft.sendCommand(ILI9341_MADCTL, &mode, 1);

  tft.fillScreen(ILI9341_BLACK);
  drawButtons();

  // Attempt to init FT6206 touch on default I2C pins
  Wire.begin(8, 9); // SDA=8, SCL=9
  if (!ctp.begin(40)) {
    Serial.println("Touch controller not found, using serial fallback");
  } else {
    Serial.println("Touch controller started");
  }

  Serial.println("Touch UI ready");
}

void drawButtons() {
  // ON button
  tft.fillRoundRect(BTN_ON_X, BTN_ON_Y, BTN_ON_W, BTN_ON_H, 8, ILI9341_GREEN);
  tft.setCursor(BTN_ON_X + 60, BTN_ON_Y + 20);
  tft.setTextColor(ILI9341_BLACK);
  tft.setTextSize(3);
  tft.println("ON");

  // OFF button
  tft.fillRoundRect(BTN_OFF_X, BTN_OFF_Y, BTN_OFF_W, BTN_OFF_H, 8, ILI9341_RED);
  tft.setCursor(BTN_OFF_X + 50, BTN_OFF_Y + 20);
  tft.setTextColor(ILI9341_WHITE);
  tft.setTextSize(3);
  tft.println("OFF");
}

void setLED(bool green) {
  if (green) {
    digitalWrite(LED_R_PIN, LOW);
    digitalWrite(LED_G_PIN, HIGH);
    Serial.println("LED: GREEN");
  } else {
    digitalWrite(LED_R_PIN, HIGH);
    digitalWrite(LED_G_PIN, LOW);
    Serial.println("LED: RED");
  }
}

void handleTouch(int x, int y) {
  Serial.print("Touch: ");
  Serial.print(x);
  Serial.print(", ");
  Serial.println(y);

  if (x >= BTN_ON_X && x <= BTN_ON_X + BTN_ON_W &&
      y >= BTN_ON_Y && y <= BTN_ON_Y + BTN_ON_H) {
    setLED(true);
  } else if (x >= BTN_OFF_X && x <= BTN_OFF_X + BTN_OFF_W &&
             y >= BTN_OFF_Y && y <= BTN_OFF_Y + BTN_OFF_H) {
    setLED(false);
  }
}

void loop() {
  // Serial fallback: commands like "TOUCH 120 100"
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    if (cmd.startsWith("TOUCH ")) {
      int firstSpace = cmd.indexOf(' ');
      int secondSpace = cmd.indexOf(' ', firstSpace + 1);
      if (secondSpace > 0) {
        int x = cmd.substring(firstSpace + 1, secondSpace).toInt();
        int y = cmd.substring(secondSpace + 1).toInt();
        handleTouch(x, y);
      }
    }
  }

  // Real touch controller (if present and working in simulation)
  if (ctp.touched()) {
    TS_Point p = ctp.getPoint();
    p.x = map(p.x, 0, 240, 240, 0);
    p.y = map(p.y, 0, 320, 320, 0);
    handleTouch(p.x, p.y);
    delay(200);
  }

  delay(50);
}
