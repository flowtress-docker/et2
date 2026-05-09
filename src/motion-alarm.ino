#include <Wire.h>

#define MPU_ADDR 0x68
#define LED_PIN 2
#define BUZZER_PIN 18

#define ACCEL_THRESHOLD 2.0

bool alarmActive = false;

void setup() {
  Serial.begin(115200);
  Wire.begin();

  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  noTone(BUZZER_PIN);

  // Wake up MPU6050
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B); // PWR_MGMT_1
  Wire.write(0x00);
  Wire.endTransmission(true);

  Serial.println("Motion Alarm armed");
}

void loop() {
  int16_t ax, ay, az;

  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B); // ACCEL_XOUT_H
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, 6, true);

  ax = (Wire.read() << 8) | Wire.read();
  ay = (Wire.read() << 8) | Wire.read();
  az = (Wire.read() << 8) | Wire.read();

  float accelX = ax / 16384.0;
  float accelY = ay / 16384.0;

  if ((abs(accelX) > ACCEL_THRESHOLD || abs(accelY) > ACCEL_THRESHOLD) && !alarmActive) {
    alarmActive = true;
    digitalWrite(LED_PIN, HIGH);
    tone(BUZZER_PIN, 1000);
    Serial.println("ALARM: Motion detected!");
  } else if (abs(accelX) <= ACCEL_THRESHOLD && abs(accelY) <= ACCEL_THRESHOLD && alarmActive) {
    alarmActive = false;
    digitalWrite(LED_PIN, LOW);
    noTone(BUZZER_PIN);
    Serial.println("Alarm cleared");
  }

  delay(100);
}
