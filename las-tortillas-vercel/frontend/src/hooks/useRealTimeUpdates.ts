import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface SSEEvent {
  type: string;
  message?: string;
  orderId?: number;
  status?: string;
  timestamp: string;
}

interface UseRealTimeUpdatesOptions {
  enabled?: boolean;
  enableSound?: boolean;
  onNewOrder?: () => void;
}

export function useRealTimeUpdates(options: UseRealTimeUpdatesOptions = {}) {
  const { enabled = true, enableSound = false, onNewOrder } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null);
  const queryClient = useQueryClient();

  // Function to play notification sound
  const playNotificationSound = () => {
    if (!enableSound) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Erro ao reproduzir som:', error);
    }
  };

  useEffect(() => {
    if (!enabled) return;

    const eventSource = new EventSource('/api/orders/stream');
    
    eventSource.onopen = () => {
      setIsConnected(true);
      console.log('🔗 Conexão em tempo real estabelecida');
    };

    eventSource.onmessage = (event) => {
      try {
        const data: SSEEvent = JSON.parse(event.data);
        setLastEvent(data);
        
        // Invalidar cache para buscar dados atualizados
        if (data.type === 'new_order' || data.type === 'order_updated') {
          queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
        }
        
        // Notificação sonora para novos pedidos
        if (data.type === 'new_order') {
          if (enableSound) {
            playNotificationSound();
          }
          if (onNewOrder) {
            onNewOrder();
          }
        }
        
        console.log('📡 Evento SSE recebido:', data.type);
      } catch (error) {
        console.error('Erro ao processar evento SSE:', error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      console.log('❌ Conexão em tempo real perdida, tentando reconectar...');
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [enabled, enableSound, onNewOrder, queryClient]);

  return {
    isConnected,
    lastEvent
  };
}