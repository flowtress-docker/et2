#include <LiquidCrystal.h>

LiquidCrystal lcd(12, 11, 10, 9, 8, 7);

const int ldrPin = A0;

// Photoresistor constants (match diagram.json attrs)
const float GAMMA = 0.7;
const float RL10 = 50;

void setup() {
  Serial.begin(9600);
  lcd.begin(16, 2);
  lcd.print("Light Sensor");
  delay(500);
  lcd.clear();
}

void loop() {
  int raw = analogRead(ldrPin);

  // Convert ADC to voltage
  float voltage = raw / 1024.0 * 5.0;

  // Convert voltage to resistance
  float resistance = 2000.0 * voltage / (1.0 - voltage / 5.0);
  if (resistance <= 0) resistance = 1.0;

  // Convert resistance to lux
  float lux = pow(RL10 * 1e3 * pow(10, GAMMA) / resistance, (1.0 / GAMMA));

  // Display on LCD
  lcd.setCursor(0, 0);
  lcd.print("Lux:     ");
  lcd.setCursor(5, 0);
  lcd.print((int)lux);

  lcd.setCursor(0, 1);
  lcd.print("ADC:     ");
  lcd.setCursor(5, 1);
  lcd.print(raw);

  // Serial output for backend parsing
  Serial.print("LUX:");
  Serial.print((int)lux);
  Serial.print(" ADC:");
  Serial.println(raw);

  delay(500);
}
