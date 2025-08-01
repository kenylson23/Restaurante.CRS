import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { useRealTimeUpdates } from '../hooks/useRealTimeUpdates';
import OrderManagement from '../components/OrderManagement';
import MenuManagement from '../components/MenuManagement';
import OrderStats from '../components/OrderStats';
import TableManagement from '../components/TableManagement';
import PrinterManagement from '../components/PrinterManagement';
import RealTimeStatus from '../components/RealTimeStatus';

export default function Admin() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('orders');
  const { isAuthenticated, isLoading, userRole, logout } = useAuth();
  
  // Enable real-time updates for the admin panel
  useRealTimeUpdates({ enabled: true });

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || userRole !== 'admin')) {
      setLocation('/login');
    }
  }, [isAuthenticated, isLoading, userRole, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Painel Admin</h1>
                <RealTimeStatus enabled={true} showLabel={true} />
              </div>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Gestão Las Tortillas • Dados em tempo real</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-end">
              {/* Banner de acesso à cozinha - DESTAQUE */}
              <button
                onClick={() => setLocation('/cozinha')}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all text-sm sm:text-base flex items-center gap-2 shadow-lg font-bold border-2 border-orange-300"
                title="Acessar Painel da Cozinha"
              >
                <span className="text-lg">👨‍🍳</span>
                <span className="hidden sm:inline">PAINEL COZINHA</span>
                <span className="sm:hidden">COZINHA</span>
              </button>
              
              {/* Acesso rápido ao sistema de pedidos */}
              <button
                onClick={() => setLocation('/menu')}
                className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base flex items-center gap-2 shadow-md"
              >
                <span className="text-lg">🛒</span>
                <span className="hidden sm:inline">Fazer Pedido</span>
                <span className="sm:hidden">Pedido</span>
              </button>
              <button
                onClick={() => setLocation('/')}
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Voltar ao Site</span>
                <span className="sm:hidden">Site</span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b overflow-x-auto">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <nav className="flex space-x-4 sm:space-x-8 min-w-max">
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pedidos
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'menu'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Menu
            </button>
            <button
              onClick={() => setActiveTab('tables')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'tables'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mesas
            </button>
            <button
              onClick={() => setActiveTab('printers')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'printers'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Impressoras
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Relatórios
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {activeTab === 'orders' && <OrderManagement />}
        {activeTab === 'menu' && <MenuManagement />}
        {activeTab === 'tables' && <TableManagement />}
        {activeTab === 'printers' && <PrinterManagement />}
        {activeTab === 'analytics' && <OrderStats />}
      </div>
    </div>
  );
}