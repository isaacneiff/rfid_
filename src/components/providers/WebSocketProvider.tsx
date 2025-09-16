'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

const WEBSOCKET_URL = 'ws://localhost:8765';
const RECONNECT_INTERVAL = 5000; // 5 segundos

interface WebSocketContextType {
  lastMessage: string | null;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
  lastMessage: null,
  isConnected: false,
});

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket(WEBSOCKET_URL);

    ws.onopen = () => {
      console.log('WebSocket conectado com sucesso.');
      setIsConnected(true);
      toast({
        title: 'Hardware Conectado',
        description: 'Leitor RFID pronto para uso.',
      });
    };

    ws.onmessage = (event) => {
      const message = event.data;
      console.log('Mensagem recebida do WebSocket:', message);
      setLastMessage(message);
    };

    ws.onclose = () => {
      console.log('WebSocket desconectado. Tentando reconectar...');
      setIsConnected(false);
      // Tenta reconectar após o intervalo
      setTimeout(connectWebSocket, RECONNECT_INTERVAL);
    };

    ws.onerror = (error) => {
      console.error('Erro no WebSocket:', error);
      // A chamada onclose será acionada, então a reconexão será tratada lá.
      ws.close();
    };

    // Função de limpeza para fechar a conexão ao desmontar o componente
    return () => {
      ws.onclose = null; // Evita a tentativa de reconexão ao desmontar
      ws.close();
    };
  }, [toast]);

  useEffect(() => {
    // Inicia a conexão WebSocket
    const cleanup = connectWebSocket();
    
    // Retorna a função de limpeza
    return cleanup;
  }, [connectWebSocket]);

  const value = {
    lastMessage,
    isConnected,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
