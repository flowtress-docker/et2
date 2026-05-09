#include "DHT.h"

#define DHT_PIN 15
#define DHT_TYPE DHT22
#define LED_PIN 2

#define TEMP_ALARM_ON 30.0
#define TEMP_ALARM_OFF 25.0

DHT dht(DHT_PIN, DHT_TYPE);

bool alarmActive = false;

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  dht.begin();

  Serial.println("Smart Thermostat started");
}

void loop() {
  float temperature = dht.readTemperature();

  if (isnan(temperature)) {
    Serial.println("Failed to read from DHT sensor!");
    delay(1000);
    return;
  }

  Serial.print("Temp: ");
  Serial.print(temperature, 2);
  Serial.println(" C");

  if (temperature > TEMP_ALARM_ON && !alarmActive) {
    alarmActive = true;
    digitalWrite(LED_PIN, HIGH);
    Serial.println("ALARM: High temperature!");
  } else if (temperature <= TEMP_ALARM_OFF && alarmActive) {
    alarmActive = false;
    digitalWrite(LED_PIN, LOW);
  }

  delay(1000);
}
