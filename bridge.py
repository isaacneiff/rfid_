import serial
import time
import asyncio
import websockets

# --- CONFIGURAÇÃO ---
ARDUINO_PORT = 'COM3' 
WEBSOCKET_PORT = 8765
BAUD_RATE = 115200
# --------------------

connected_clients = set()

async def handler(websocket, path):
    """Lida com novas conexões WebSocket."""
    print(f"Novo cliente conectado do path {path}")
    connected_clients.add(websocket)
    try:
        await websocket.wait_closed()
    finally:
        print("Cliente desconectado.")
        connected_clients.remove(websocket)

async def broadcast(message):
    """Envia uma mensagem para todos os clientes conectados."""
    if connected_clients:
        # Cria uma lista de tarefas para enviar a mensagem para todos
        tasks = [client.send(message) for client in connected_clients]
        await asyncio.gather(*tasks)

async def read_from_arduino():
    """Lê dados da porta serial e transmite via WebSocket."""
    ser = None
    print(f"Tentando conectar na porta {ARDUINO_PORT} a {BAUD_RATE} bps...")

    while True: # Tenta reconectar continuamente se a porta falhar
        try:
            ser = serial.Serial(ARDUINO_PORT, BAUD_RATE, timeout=1)
            print(f"Conectado com sucesso! Aguardando dados do RFID...")
            
            while True:
                if ser.in_waiting > 0:
                    line = ser.readline().decode('utf-8', errors='ignore').strip()
                    if line:
                        print(f"UID recebido do Arduino: {line}")
                        await broadcast(line)
                await asyncio.sleep(0.1)

        except serial.SerialException as e:
            print(f"ERRO: Não foi possível abrir a porta serial {ARDUINO_PORT}. Tentando novamente em 5 segundos...")
            print(f"Detalhes: {e}")
            if ser and ser.is_open:
                ser.close()
            await asyncio.sleep(5)
        
        except Exception as e:
            print(f"Um erro inesperado ocorreu: {e}")
            break

async def main():
    """Função principal para rodar o servidor WebSocket e o leitor serial."""
    print(f"Iniciando servidor WebSocket na porta {WEBSOCKET_PORT}...")
    
    server = await websockets.serve(handler, "localhost", WEBSOCKET_PORT)
    
    # Inicia a leitura do Arduino como uma tarefa de fundo
    asyncio.create_task(read_from_arduino())
    
    # Mantém o servidor WebSocket rodando para sempre
    await server.wait_closed()


if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nPrograma encerrado pelo usuário.")
