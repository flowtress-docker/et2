#include <Servo.h>

Servo servo;

const int ldrPin = A0;
const int servoPin = 9;

const int LUX_DARK = 30;
const int LUX_BRIGHT = 70;

enum State { CLOSED, OPEN };
State currentState = OPEN;

void setup() {
  Serial.begin(9600);
  servo.attach(servoPin);
  servo.write(90); // default open
  Serial.println("Auto-Blinds started");
}

void loop() {
  int raw = analogRead(ldrPin);
  // Map 0-1023 to 0-100 lux (approximate)
  int lux = map(raw, 0, 1023, 0, 100);

  if (lux < LUX_DARK && currentState != CLOSED) {
    servo.write(0);
    currentState = CLOSED;
    Serial.println("Blinds CLOSED");
  } else if (lux > LUX_BRIGHT && currentState != OPEN) {
    servo.write(90);
    currentState = OPEN;
    Serial.println("Blinds OPEN");
  }

  delay(100);
}
