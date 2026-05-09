#include <DHT.h>
#include <TM1637Display.h>

#define DHT_PIN 15
#define DHT_TYPE DHT22

#define CLK 16
#define DIO 17

DHT dht(DHT_PIN, DHT_TYPE);
TM1637Display display(CLK, DIO);

void setup() {
  Serial.begin(115200);
  while (!Serial) {
    delay(10);
  }

  dht.begin();
  display.setBrightness(7);
  display.clear();

  Serial.println("Weather Station started");
}

void loop() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Failed to read from DHT sensor!");
    delay(2000);
    return;
  }

  Serial.print("Temp: ");
  Serial.print(temperature, 1);
  Serial.println(" C");

  // Display temperature on TM1637 (e.g. 22.5 shown as 22:5)
  int displayTemp = (int)(temperature * 10);
  display.showNumberDecEx(displayTemp, 0b01000000, false, 4, 0);

  delay(2000);

  Serial.print("Hum: ");
  Serial.print(humidity, 1);
  Serial.println(" %");

  // Display humidity as integer
  display.showNumberDec((int)humidity, false, 4, 0);

  delay(2000);
}
