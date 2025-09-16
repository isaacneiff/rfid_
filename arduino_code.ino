/*
 * --------------------------------------------------------------------------------------------------------------------
 * Este código é para ser usado com um leitor RFID-RC522.
 * 
 * Funcionalidade:
 * 1. Inicializa a comunicação com o leitor RFID.
 * 2. Aguarda um cartão ser aproximado.
 * 3. Quando um cartão é detectado, lê o seu UID (Identificador Único).
 * 4. Envia o UID como uma string de texto hexadecimal pela porta serial.
 * 
 * Importante:
 * - Apenas o UID é enviado, sem textos extras ou mensagens de debug, para garantir
 *   a compatibilidade com a aplicação que irá receber esses dados.
 * 
 * Conexões (Padrão para Arduino Uno/Nano):
 * - SDA/SS: Pino 10
 * - SCK:    Pino 13
 * - MOSI:   Pino 11
 * - MISO:   Pino 12
 * - RST:    Pino 9
 * - GND:    GND
 * - 3.3V:   3.3V
 * --------------------------------------------------------------------------------------------------------------------
 */

#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN 10
#define RST_PIN 9

// Cria uma instância do leitor MFRC522.
MFRC522 mfrc522(SS_PIN, RST_PIN);

void setup() {
  // Inicia a comunicação serial a 115200 bps.
  // Certifique-se de que a taxa (baud rate) é a mesma configurada no seu script Python (bridge.py).
  Serial.begin(115200);
  
  // Inicia a comunicação SPI.
  SPI.begin();
  
  // Inicia o leitor MFRC522.
  mfrc522.PCD_Init();
  
  // Pequena espera para estabilização.
  delay(4);
}

void loop() {
  // Procura por novos cartões. Se nenhum cartão for encontrado, o loop reinicia.
  if ( ! mfrc522.PICC_IsNewCardPresent()) {
    return;
  }

  // Seleciona um dos cartões encontrados. Se a leitura falhar, o loop reinicia.
  if ( ! mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  // Variável para armazenar o UID lido.
  String uidString = "";
  
  // Constrói a string do UID a partir dos bytes lidos.
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    // Adiciona um zero à esquerda se o byte for menor que 16 (0x10), para manter o formato.
    if (mfrc522.uid.uidByte[i] < 0x10) {
      uidString.concat("0");
    }
    // Concatena o byte do UID em formato hexadecimal e maiúsculo.
    uidString.concat(String(mfrc522.uid.uidByte[i], HEX));
  }
  
  // Converte toda a string para maiúsculas.
  uidString.toUpperCase();

  // Envia a string do UID pela porta serial, seguida por uma nova linha.
  // Esta é a única informação que será enviada.
  Serial.println(uidString);

  // Aguarda um curto período antes de tentar ler o próximo cartão.
  // Isso evita que o mesmo cartão seja lido múltiplas vezes em uma única aproximação.
  delay(1000); 
  
  // Para a comunicação com o cartão atual para permitir a leitura de um novo.
  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
}
