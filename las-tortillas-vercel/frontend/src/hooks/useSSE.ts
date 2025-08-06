import { useEffect, useRef, useState, useCallback } from 'react';

interface SSEOptions {
  url: string;
  eventTypes?: string[];
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface SSEState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}

export function useSSE(options: SSEOptions) {
  const {
    url,
    eventTypes = [],
    onMessage,
    onError,
    onOpen,
    onClose,
    autoReconnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5
  } = options;

  const [state, setState] = useState<SSEState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  // Função para conectar
  const connect = useCallback(() => {
    if (state.isConnected || state.isConnecting) return;

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      // Evento de conexão aberta
      eventSource.onopen = () => {
        setState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
          reconnectAttempts: 0
        }));
        reconnectAttemptsRef.current = 0;
        onOpen?.();
      };

      // Evento de mensagem
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch (error) {
          console.error('SSE message parse error:', error);
        }
      };

      // Eventos específicos
      eventTypes.forEach(eventType => {
        eventSource.addEventListener(eventType, (event) => {
          try {
            const data = JSON.parse(event.data);
            onMessage?.({ type: eventType, ...data });
          } catch (error) {
            console.error(`SSE ${eventType} parse error:`, error);
          }
        });
      });

      // Evento de erro
      eventSource.onerror = (error) => {
        setState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: 'Erro na conexão SSE'
        }));
        onError?.(error);

        // Reconectar automaticamente
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          setState(prev => ({ ...prev, reconnectAttempts: reconnectAttemptsRef.current }));

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: 'Erro ao criar conexão SSE'
      }));
      console.error('SSE connection error:', error);
    }
  }, [url, eventTypes, onMessage, onError, onOpen, autoReconnect, reconnectInterval, maxReconnectAttempts, state.isConnected, state.isConnecting]);

  // Função para desconectar
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      reconnectAttempts: 0
    }));
    reconnectAttemptsRef.current = 0;
    onClose?.();
  }, [onClose]);

  // Função para reconectar manualmente
  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(connect, 1000);
  }, [connect, disconnect]);

  // Conectar automaticamente
  useEffect(() => {
    connect();

    // Cleanup na desmontagem
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    reconnect
  };
} 