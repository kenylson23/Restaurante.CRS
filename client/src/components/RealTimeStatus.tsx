import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useRealTimeUpdates } from '../hooks/useRealTimeUpdates';

interface RealTimeStatusProps {
  enabled?: boolean;
  showLabel?: boolean;
  className?: string;
}

export default function RealTimeStatus({ 
  enabled = true, 
  showLabel = true, 
  className = "" 
}: RealTimeStatusProps) {
  const { isConnected } = useRealTimeUpdates(enabled);

  if (!enabled) return null;

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
      isConnected 
        ? 'bg-green-100 text-green-700' 
        : 'bg-red-100 text-red-700'
    } ${className}`}>
      {isConnected ? (
        <>
          <RefreshCw className="w-3 h-3 animate-spin" />
          <Wifi className="w-3 h-3" />
        </>
      ) : (
        <WifiOff className="w-3 h-3" />
      )}
      {showLabel && (
        <span className="hidden sm:inline">
          {isConnected ? 'Tempo real ativo' : 'Conectando...'}
        </span>
      )}
      <span className="sm:hidden">
        {isConnected ? 'Live' : 'Off'}
      </span>
    </div>
  );
}