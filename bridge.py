import serial
import requests
import time

# --- CONFIGURAÇÃO ---
# Altere para a porta serial correta do seu Arduino
# No Linux/Mac, pode ser algo como '/dev/ttyACM0' ou '/dev/tty.usbmodem14201'
# No Windows, pode ser 'COM3', 'COM4', etc.
ARDUINO_PORT = 'COM3' 

# A URL para a qual os dados do cartão serão enviados na sua aplicação Next.js
WEBAPP_URL = 'http://localhost:9002/api/scan'

BAUD_RATE = 115200
# --------------------

def is_potential_uid(text: str) -> bool:
    """Verifica se a string se parece com um UID (sem espaços e com um comprimento razoável)."""
    # UIDs geralmente não contêm espaços e têm um comprimento específico.
    # Esta é uma verificação simples; pode ser ajustada se os UIDs tiverem um formato diferente.
    return " " not in text and 4 <= len(text) <= 30

def main():
    """Função principal para rodar o script da ponte."""
    ser = None
    print(f"Tentando conectar na porta {ARDUINO_PORT} a {BAUD_RATE} bps...")

    try:
        # Tenta conectar na porta serial
        ser = serial.Serial(ARDUINO_PORT, BAUD_RATE, timeout=1)
        time.sleep(2) # Aguarda a conexão serial estabilizar
        print(f"Conectado com sucesso! Aguardando dados do RFID...")

        while True:
            # Lê uma linha da porta serial (o UID do cartão)
            if ser.in_waiting > 0:
                line = ser.readline().decode('utf-8', errors='ignore').strip()

                # Se a linha não estiver vazia e parecer um UID, processe-a
                if line and is_potential_uid(line):
                    print(f"UID recebido do Arduino: {line}")
                    
                    try:
                        # Envia o UID para a aplicação Next.js
                        payload = {'cardUID': line}
                        response = requests.post(WEBAPP_URL, json=payload)
                        # Lança um erro se a requisição falhar (status != 2xx)
                        response.raise_for_status() 

                        # Mostra o resultado da verificação de acesso
                        result = response.json()
                        status = "CONCEDIDO" if result.get('isAuthorized') else "NEGADO"
                        print(f"  -> Resposta da Aplicação: Acesso {status}. Motivo: {result.get('reason')}")

                    except requests.exceptions.RequestException as e:
                        print(f"  -> ERRO ao enviar para a aplicação: {e}")
                elif line:
                    # Ignora linhas que não parecem ser UIDs (provavelmente logs)
                    print(f"  (Ignorando linha de log do Arduino: '{line}')")

            time.sleep(0.1) # Pequena pausa para não sobrecarregar a CPU

    except serial.SerialException as e:
        print(f"ERRO: Não foi possível abrir a porta serial {ARDUINO_PORT}.")
        print(f"Detalhes: {e}")
        print("Verifique se a porta está correta e se o Arduino está conectado.")
        print("Portas seriais disponíveis:")
        try:
            from serial.tools import list_ports
            ports = list_ports.comports()
            for port in ports:
                print(f"  - {port.device}: {port.description}")
        except ImportError:
            print("  (Instale 'pyserial' para listar as portas automaticamente)")


    except KeyboardInterrupt:
        print("\nPrograma encerrado pelo usuário.")

    finally:
        if ser and ser.is_open:
            ser.close()
            print("Porta serial fechada.")

if __name__ == '__main__':
    main()
