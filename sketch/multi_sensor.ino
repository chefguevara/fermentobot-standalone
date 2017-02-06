#include <Wire.h>
#include <DHT.h>

#define DEBUG_MODE 0
/*
 * Thermistors defaults
 */
#define THERM1 A0
//#define THERM2 A1
#define TEMPERATURENOMINAL 25
#define THERMISTORNOMINAL 10000
#define NUMSAMPLES 5
#define BCOEFFICIENT 3435
#define SERIESRESISTOR 10000

/*
 *   BEGIN DHT SETUP
 */

// DHT
#define DHTPIN 5
//#define DHTTYPE DHT11
//#define DHTTYPE DHT22
#define DHTTYPE DHT21


/*
 *   I2C Defaults
 */
#define I2C_DEFAULT_ADDRESS 0x0A
#define I2C_BUFFER_SIZE 8
//
// 0 H LSB
// 1 H MSB
// 2 T LSB
// 3 T MSB
//
byte buffer[I2C_BUFFER_SIZE];

int address = I2C_DEFAULT_ADDRESS;
int pin = 5;

int samples1[NUMSAMPLES];
//int samples2[NUMSAMPLES];

void resetState() {
  digitalWrite(pin, LOW);
  pinMode(pin, INPUT);
}

DHT dht(DHTPIN, DHTTYPE);


int getTemp(float average, String id) {
  average = 1023 / average - 1;
  average = SERIESRESISTOR / average;

  float steinhart;
  steinhart = average / THERMISTORNOMINAL;           // (R/Ro)
  steinhart = log(steinhart);                        // ln(R/Ro)
  steinhart /= BCOEFFICIENT;                         // 1/B * ln(R/Ro)
  steinhart += 1.0 / (TEMPERATURENOMINAL + 273.15);  // + (1/To)
  steinhart = 1.0 / steinhart;                       // Invert
  steinhart -= 273.15;                               // convert to C
  #if DEBUG_MODE
    Serial.print("Thermistor ");
    Serial.print(id);
    Serial.println(steinhart);
  #endif
  return steinhart * 100;
}

void setup() {

  int offset = 0;

  analogReference(EXTERNAL);

  #if DEBUG_MODE
    Serial.begin(9600);
  #endif

  resetState();

  dht.begin();

  Wire.begin(I2C_DEFAULT_ADDRESS);
  Wire.onRequest(onRequest);
}

void loop() {
  uint8_t i;
  float average1;
  //float average2;
  int temp1;
  //int temp2;
  int h = dht.readHumidity() * 100;
  int c = dht.readTemperature() * 100;

  for (i=0; i< NUMSAMPLES; i++) {
   samples1[i] = analogRead(THERM1);
   //samples2[i] = analogRead(THERM2);
   delay(10);
  }

  average1 = 0;
  //average2 = 0;
  for (i=0; i< NUMSAMPLES; i++) {
     average1 += samples1[i];
     //average2 += samples2[i];
  }
  average1 /= NUMSAMPLES;
 //average2 /= NUMSAMPLES;

  temp1 = getTemp(average1, "thermistor 1: ");
  //temp2 = getTemp(average2, "thermistor 2: ");

  buffer[0] = h >> 8;
  buffer[1] = h & 0xFF;
  buffer[2] = c >> 8;
  buffer[3] = c & 0xFF;
  buffer[4] = temp1 >> 8;
  buffer[5] = temp1 & 0xFF;
  //buffer[6] = temp2 >> 8;
  //buffer[7] = temp2 & 0xFF;

  #if DEBUG_MODE
    Serial.print("Ambient Temperature ");
    Serial.println((float)c/100);
    Serial.print("Ambient Humidity ");
    Serial.println((float)h/100);
  #endif

  delay(1000);
}

void onRequest() {
  Wire.write(buffer, I2C_BUFFER_SIZE);
}