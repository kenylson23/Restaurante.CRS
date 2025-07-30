import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, RefreshCw, Bell, BellOff, BarChart3, 
  Clock, CheckCircle, Users, MapPin, Phone, Timer, 
  AlertCircle, ChefHat, Package, TrendingUp, Star,
  Flame, Play, Pause
} from 'lucide-react';

interface OrderItem {
  id?: number;
  menuItemId: number;
  name?: string;
  quantity: number;
  unitPrice: string;
  customizations?: string[];
  preparationTime?: number;
}

interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  orderType: string;
  status: string;
  totalAmount: string;
  notes?: string;
  items?: OrderItem[];
  createdAt: string;
  estimatedDeliveryTime?: string;
  locationId: string;
  tableId?: number;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
  category: string;
  preparationTime?: number;
}

interface KitchenStats {
  total: number;
  active: number;
  ready: number;
  delivered: number;
  delayed: number;
}

type KitchenFiltersType = 'all' | 'pending' | 'preparing' | 'ready' | 'delivered';

export default function Kitchen() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading, userRole } = useAuth();
  const queryClient = useQueryClient();

  // Estados de controle
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [filter, setFilter] = useState<KitchenFiltersType>('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState<'time' | 'priority' | 'status'>('time');
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [preparationTimes, setPreparationTimes] = useState<{[key: number]: string}>({});
  const [isConnected, setIsConnected] = useState(false);

  // Sistema de som
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Verificação de autenticação
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (userRole !== 'kitchen' && userRole !== 'admin'))) {
      setLocation('/login');
    }
  }, [isAuthenticated, isLoading, userRole, setLocation]);

  // Configuração do tema
  useEffect(() => {
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.color = '#1f2937';
    
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    };
  }, []);

  // Inicializar AudioContext
  useEffect(() => {
    if (soundEnabled && !audioContext) {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(context);
    }
  }, [soundEnabled, audioContext]);

  // Função para reproduzir som
  const playNotificationSound = () => {
    if (!soundEnabled || !audioContext) return;

    try {
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

  // Queries para dados
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/orders'],
    refetchInterval: false, // Removido auto-refresh
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ['/api/menu-items'],
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Erro ao atualizar status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    },
  });

  const updatePreparationTimeMutation = useMutation({
    mutationFn: async ({ orderId, minutes }: { orderId: number; minutes: number }) => {
      const estimatedTime = new Date(Date.now() + minutes * 60 * 1000).toISOString();
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estimatedDeliveryTime: estimatedTime }),
      });
      if (!response.ok) throw new Error('Erro ao atualizar tempo de preparo');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    },
  });

  // Função para atualizar status do pedido
  const updateOrderStatus = (orderId: number, status: string) => {
    updateStatusMutation.mutate({ orderId, status });
  };

  // Função para definir tempo de preparo
  const setPreparationTime = (orderId: number) => {
    const minutes = parseInt(preparationTimes[orderId] || '0');
    if (minutes > 0) {
      updatePreparationTimeMutation.mutate({ orderId, minutes });
      setPreparationTimes(prev => ({ ...prev, [orderId]: '' }));
    }
  };

  // Real-time updates usando Server-Sent Events
  useEffect(() => {
    const eventSource = new EventSource('/api/orders/stream');
    
    eventSource.onopen = () => {
      setIsConnected(true);
      console.log('🔗 Conexão em tempo real estabelecida');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Invalidar cache para buscar dados atualizados
        queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
        
        // Notificação sonora para novos pedidos
        if (data.type === 'new_order' && soundEnabled) {
          playNotificationSound();
        }
      } catch (error) {
        console.error('Erro ao processar evento:', error);
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
  }, [queryClient, soundEnabled]);

  // Detectar novos pedidos para notificação sonora (backup)
  useEffect(() => {
    if (orders.length > lastOrderCount && lastOrderCount > 0) {
      playNotificationSound();
    }
    setLastOrderCount(orders.length);
  }, [orders.length, lastOrderCount]);

  // Filtrar e ordenar pedidos
  const filteredOrders = orders
    .filter((order: Order) => {
      if (filter !== 'all' && order.status !== filter) return false;
      if (selectedLocation !== 'all' && order.locationId !== selectedLocation) return false;
      return true;
    })
    .sort((a: Order, b: Order) => {
      if (sortBy === 'time') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'priority') {
        const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
        return (priorityOrder[a.priority || 'normal'] || 2) - (priorityOrder[b.priority || 'normal'] || 2);
      }
      return 0;
    });

  // Calcular estatísticas
  const stats: KitchenStats = {
    total: orders.length,
    active: orders.filter((o: Order) => ['received', 'preparing'].includes(o.status)).length,
    ready: orders.filter((o: Order) => o.status === 'ready').length,
    delivered: orders.filter((o: Order) => o.status === 'delivered').length,
    delayed: orders.filter((o: Order) => {
      if (!o.estimatedDeliveryTime) return false;
      return new Date() > new Date(o.estimatedDeliveryTime) && !['delivered', 'cancelled'].includes(o.status);
    }).length,
  };

  // Obter nome do item do menu
  const getMenuItemName = (menuItemId: number) => {
    const item = menuItems.find((item: MenuItem) => item.id === menuItemId);
    return item?.name || `Item ${menuItemId}`;
  };

  // Formatador de tempo
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-AO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calcular tempo decorrido
  const getElapsedTime = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}min`;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}min`;
  };

  // Determinar cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'delivered': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Determinar prioridade
  const getPriorityColor = (orderType: string) => {
    switch (orderType) {
      case 'dine-in': return 'border-l-red-500';
      case 'delivery': return 'border-l-orange-500';
      case 'takeaway': return 'border-l-blue-500';
      default: return 'border-l-gray-300';
    }
  };

  // Ícone do tipo de pedido
  const getOrderTypeIcon = (orderType: string) => {
    switch (orderType) {
      case 'dine-in': return '🍽️';
      case 'delivery': return '🚗';
      case 'takeaway': return '🥡';
      default: return '📦';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando painel da cozinha...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-4 border-red-600 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 sm:py-0 min-h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setLocation('/admin')}
                className="flex items-center text-red-600 hover:text-red-700 transition-colors"
              >
                <ArrowLeft size={20} className="mr-1 sm:mr-2" />
                <span className="font-medium text-sm sm:text-base">Voltar</span>
              </button>
              <div className="h-6 sm:h-8 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <ChefHat className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Painel da Cozinha</h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2 sm:mt-0">
              {/* Auto Refresh Toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors ${
                  autoRefresh 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {autoRefresh ? <Play size={14} className="mr-1" /> : <Pause size={14} className="mr-1" />}
                <span className="hidden sm:inline">Auto Refresh</span>
                <span className="sm:hidden">Auto</span>
              </button>

              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`flex items-center px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors ${
                  soundEnabled 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {soundEnabled ? <Bell size={14} className="mr-1" /> : <BellOff size={14} className="mr-1" />}
                Som
              </button>

              {/* Stats Toggle */}
              <button
                onClick={() => setShowStats(!showStats)}
                className={`flex items-center px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors ${
                  showStats 
                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <BarChart3 size={14} className="mr-1" />
                <span className="hidden sm:inline">Estatísticas</span>
                <span className="sm:hidden">Stats</span>
              </button>

              {/* Manual Refresh */}
              <button
                onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/orders'] })}
                className="flex items-center px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
              >
                <RefreshCw size={14} className="mr-1" />
                <span className="hidden sm:inline">Atualizar</span>
                <span className="sm:hidden">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Estatísticas */}
      {showStats && (
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
            <div className="bg-white rounded-lg p-2 sm:p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-2 sm:p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Ativos</p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.active}</p>
                </div>
                <Flame className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-2 sm:p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Prontos</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.ready}</p>
                </div>
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-2 sm:p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Entregues</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-600">{stats.delivered}</p>
                </div>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-2 sm:p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Atrasados</p>
                  <p className="text-lg sm:text-2xl font-bold text-red-600">{stats.delayed}</p>
                </div>
                <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-4">
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 items-start sm:items-center">
            {/* Filtros de Status */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <span className="text-xs sm:text-sm font-medium text-gray-700">Status:</span>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-2 sm:px-3 py-1 rounded-md text-xs transition-colors ${
                    filter === 'all' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilter('received')}
                  className={`px-2 sm:px-3 py-1 rounded-md text-xs transition-colors ${
                    filter === 'received' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Recebidos
                </button>
                <button
                  onClick={() => setFilter('preparing')}
                  className={`px-2 sm:px-3 py-1 rounded-md text-xs transition-colors ${
                    filter === 'preparing' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Preparando
                </button>
                <button
                  onClick={() => setFilter('ready')}
                  className={`px-2 sm:px-3 py-1 rounded-md text-xs transition-colors ${
                    filter === 'ready' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Prontos
                </button>
              </div>
            </div>

            {/* Ordenação */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
              <span className="text-xs sm:text-sm font-medium text-gray-700">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'time' | 'priority' | 'status')}
                className="px-2 sm:px-3 py-1 border border-gray-300 rounded-md text-xs w-full sm:w-auto"
              >
                <option value="time">Por Hora</option>
                <option value="priority">Por Prioridade</option>
                <option value="status">Por Status</option>
              </select>
            </div>

            {/* Localização */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
              <span className="text-xs sm:text-sm font-medium text-gray-700">Local:</span>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-2 sm:px-3 py-1 border border-gray-300 rounded-md text-xs w-full sm:w-auto"
              >
                <option value="all">Todos</option>
                <option value="talatona">Talatona</option>
                <option value="ilha">Ilha</option>
                <option value="mobile">Móvel</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 pb-4 sm:pb-8">
        {ordersLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando pedidos...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-600">
              {filter === 'all' ? 'Não há pedidos no momento.' : `Não há pedidos com status "${filter}".`}
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredOrders.map((order: Order) => (
              <div 
                key={order.id}
                className={`bg-white rounded-lg shadow-sm border-l-4 ${getPriorityColor(order.orderType)} border-r border-t border-b border-gray-200 overflow-hidden`}
              >
                <div className="p-3 sm:p-6">
                  {/* Header do Pedido */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="text-xl sm:text-2xl">{getOrderTypeIcon(order.orderType)}</div>
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                          Pedido #{order.id}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {formatTime(order.createdAt)} • {getElapsedTime(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="self-start sm:text-right">
                      <span className={`inline-flex px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {order.status === 'received' && 'Recebido'}
                        {order.status === 'preparing' && 'Preparando'}
                        {order.status === 'ready' && 'Pronto'}
                        {order.status === 'delivered' && 'Entregue'}
                        {order.status === 'cancelled' && 'Cancelado'}
                      </span>
                    </div>
                  </div>

                  {/* Informações do Cliente */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-600 truncate">{order.customerName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-600">{order.customerPhone}</span>
                    </div>
                    <div className="flex items-center space-x-2 sm:col-span-2 lg:col-span-1">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-600 capitalize">{order.locationId}</span>
                      {order.tableId && (
                        <span className="text-xs sm:text-sm text-gray-600">• Mesa {order.tableId}</span>
                      )}
                    </div>
                  </div>

                  {/* Items do Pedido */}
                  <div className="mb-3 sm:mb-4">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-2 flex items-center">
                      <ChefHat className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Itens do Pedido
                    </h4>
                    <div className="space-y-2">
                      {(order.items && order.items.length > 0) ? (
                        order.items.map((item, index) => (
                          <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 px-2 sm:px-3 bg-red-50 rounded-md space-y-1 sm:space-y-0">
                            <div className="flex-1">
                              <span className="text-xs sm:text-sm font-medium text-gray-900">
                                {item.quantity}x {item.name || getMenuItemName(item.menuItemId)}
                              </span>
                              {item.customizations && item.customizations.length > 0 && (
                                <p className="text-xs text-gray-600 mt-1">
                                  Obs: {item.customizations.join(', ')}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 self-end sm:self-auto">
                              {item.preparationTime && (
                                <span className="flex items-center text-xs text-gray-500">
                                  <Timer className="h-3 w-3 mr-1" />
                                  {item.preparationTime}min
                                </span>
                              )}
                              <span className="text-xs sm:text-sm font-medium text-gray-900">
                                {parseFloat(item.unitPrice).toFixed(0)} AOA
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-3 px-3 bg-gray-50 rounded-md text-center">
                          <p className="text-sm text-gray-500">Nenhum item encontrado para este pedido</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Total e Notas */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      {order.notes && (
                        <div className="mb-2">
                          <span className="text-xs font-medium text-gray-700">Observações:</span>
                          <p className="text-xs sm:text-sm text-gray-600 italic">{order.notes}</p>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                        <span className="text-sm sm:text-lg font-bold text-gray-900">
                          Total: {parseFloat(order.totalAmount).toFixed(0)} AOA
                        </span>
                      </div>
                    </div>

                    {/* Seção de Tempo de Preparo e Botões de Ação */}
                    <div className="flex flex-col space-y-3 sm:space-y-2 w-full sm:w-auto">
                      {/* Tempo de Preparo Estimado */}
                      {!order.estimatedDeliveryTime && ['received', 'preparing'].includes(order.status) && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 p-2 bg-blue-50 rounded-md border border-blue-200">
                          <div className="flex items-center space-x-2 flex-1">
                            <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            <span className="text-xs font-medium text-blue-800">Tempo estimado:</span>
                            <input
                              type="number"
                              min="1"
                              max="120"
                              placeholder="min"
                              value={preparationTimes[order.id] || ''}
                              onChange={(e) => setPreparationTimes(prev => ({ ...prev, [order.id]: e.target.value }))}
                              className="w-16 px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="text-xs text-blue-700">minutos</span>
                          </div>
                          <button
                            onClick={() => setPreparationTime(order.id)}
                            disabled={!preparationTimes[order.id] || updatePreparationTimeMutation.isPending}
                            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-xs font-medium transition-colors"
                          >
                            Definir
                          </button>
                        </div>
                      )}

                      {/* Exibir tempo estimado se já definido */}
                      {order.estimatedDeliveryTime && (
                        <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-md border border-green-200">
                          <Clock className="h-4 w-4 text-green-600" />
                          <span className="text-xs font-medium text-green-800">
                            Estimativa: {new Date(order.estimatedDeliveryTime).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      )}

                      {/* Botões de Ação do Pedido */}
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full">
                        {order.status === 'received' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'preparing')}
                            disabled={updateStatusMutation.isPending}
                            className="px-3 sm:px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 text-xs sm:text-sm font-medium transition-colors"
                          >
                            Iniciar Preparo
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'ready')}
                            disabled={updateStatusMutation.isPending}
                            className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-xs sm:text-sm font-medium transition-colors"
                          >
                            Marcar como Pronto
                          </button>
                        )}
                        {order.status === 'ready' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            disabled={updateStatusMutation.isPending}
                            className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-xs sm:text-sm font-medium transition-colors"
                          >
                            Marcar como Entregue
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}