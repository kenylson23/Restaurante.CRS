import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Printer, Plus, Edit, Trash2, Wifi, Usb, Bluetooth, TestTube2, Power } from 'lucide-react';

interface Printer {
  id: number;
  name: string;
  type: 'network' | 'usb' | 'bluetooth';
  ipAddress?: string;
  port?: number;
  devicePath?: string;
  paperWidth: number;
  isActive: boolean;
  autoprint: boolean;
  locationId: string;
  printerFor: 'kitchen' | 'bar' | 'expedite' | 'receipt';
  createdAt: string;
}

interface PrinterFormData {
  name: string;
  type: 'network' | 'usb' | 'bluetooth';
  ipAddress?: string;
  port: number;
  devicePath?: string;
  paperWidth: number;
  isActive: boolean;
  autoprint: boolean;
  locationId: string;
  printerFor: 'kitchen' | 'bar' | 'expedite' | 'receipt';
}

export default function PrinterManagement() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<Printer | null>(null);
  const [formData, setFormData] = useState<PrinterFormData>({
    name: '',
    type: 'network',
    ipAddress: '',
    port: 9100,
    devicePath: '',
    paperWidth: 80,
    isActive: true,
    autoprint: false,
    locationId: 'talatona',
    printerFor: 'kitchen'
  });

  // Query para buscar impressoras
  const { data: printers = [], isLoading } = useQuery<Printer[]>({
    queryKey: ['/api/printers'],
  });

  // Mutations
  const createPrinterMutation = useMutation({
    mutationFn: async (data: PrinterFormData) => {
      const response = await fetch('/api/printers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erro ao criar impressora');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/printers'] });
      resetForm();
    },
  });

  const updatePrinterMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PrinterFormData> }) => {
      const response = await fetch(`/api/printers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erro ao atualizar impressora');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/printers'] });
      resetForm();
    },
  });

  const deletePrinterMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/printers/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erro ao deletar impressora');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/printers'] });
    },
  });

  const testPrinterMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/printers/${id}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Erro ao testar impressora');
      return response.json();
    },
  });

  // Funções de controle
  const resetForm = () => {
    setFormData({
      name: '',
      type: 'network',
      ipAddress: '',
      port: 9100,
      devicePath: '',
      paperWidth: 80,
      isActive: true,
      autoprint: false,
      locationId: 'talatona',
      printerFor: 'kitchen'
    });
    setShowForm(false);
    setEditingPrinter(null);
  };

  const handleEdit = (printer: Printer) => {
    setEditingPrinter(printer);
    setFormData({
      name: printer.name,
      type: printer.type,
      ipAddress: printer.ipAddress || '',
      port: printer.port || 9100,
      devicePath: printer.devicePath || '',
      paperWidth: printer.paperWidth,
      isActive: printer.isActive,
      autoprint: printer.autoprint,
      locationId: printer.locationId,
      printerFor: printer.printerFor
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPrinter) {
      updatePrinterMutation.mutate({ id: editingPrinter.id, data: formData });
    } else {
      createPrinterMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja deletar esta impressora?')) {
      deletePrinterMutation.mutate(id);
    }
  };

  const toggleActive = (printer: Printer) => {
    updatePrinterMutation.mutate({ 
      id: printer.id, 
      data: { isActive: !printer.isActive }
    });
  };

  const testPrinter = (id: number) => {
    testPrinterMutation.mutate(id);
  };

  // Helpers
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'network': return <Wifi className="h-4 w-4" />;
      case 'usb': return <Usb className="h-4 w-4" />;
      case 'bluetooth': return <Bluetooth className="h-4 w-4" />;
      default: return <Printer className="h-4 w-4" />;
    }
  };

  const getLocationLabel = (locationId: string) => {
    const labels: Record<string, string> = {
      'talatona': 'Talatona',
      'ilha': 'Ilha de Luanda',
      'movel': 'Food Truck'
    };
    return labels[locationId] || locationId;
  };

  const getPrinterForLabel = (printerFor: string) => {
    const labels: Record<string, string> = {
      'kitchen': 'Cozinha',
      'bar': 'Bar',
      'expedite': 'Expedição',
      'receipt': 'Recibos'
    };
    return labels[printerFor] || printerFor;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Impressoras</h2>
          <p className="text-gray-600">Configure e gerencie impressoras para o sistema</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Impressora
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {editingPrinter ? 'Editar Impressora' : 'Nova Impressora'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Impressora
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Conexão
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="network">Rede (Ethernet/WiFi)</option>
                  <option value="usb">USB</option>
                  <option value="bluetooth">Bluetooth</option>
                </select>
              </div>

              {formData.type === 'network' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Endereço IP
                    </label>
                    <input
                      type="text"
                      value={formData.ipAddress}
                      onChange={(e) => setFormData(prev => ({ ...prev, ipAddress: e.target.value }))}
                      placeholder="192.168.1.100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Porta
                    </label>
                    <input
                      type="number"
                      value={formData.port}
                      onChange={(e) => setFormData(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </>
              )}

              {formData.type === 'usb' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Caminho do Dispositivo
                  </label>
                  <input
                    type="text"
                    value={formData.devicePath}
                    onChange={(e) => setFormData(prev => ({ ...prev, devicePath: e.target.value }))}
                    placeholder="/dev/usb/lp0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Largura do Papel
                </label>
                <select
                  value={formData.paperWidth}
                  onChange={(e) => setFormData(prev => ({ ...prev, paperWidth: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value={58}>58mm</option>
                  <option value={80}>80mm</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localização
                </label>
                <select
                  value={formData.locationId}
                  onChange={(e) => setFormData(prev => ({ ...prev, locationId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="talatona">Talatona</option>
                  <option value="ilha">Ilha de Luanda</option>
                  <option value="movel">Food Truck</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Finalidade
                </label>
                <select
                  value={formData.printerFor}
                  onChange={(e) => setFormData(prev => ({ ...prev, printerFor: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="kitchen">Cozinha</option>
                  <option value="bar">Bar</option>
                  <option value="expedite">Expedição</option>
                  <option value="receipt">Recibos</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="mr-2"
                />
                Impressora ativa
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.autoprint}
                  onChange={(e) => setFormData(prev => ({ ...prev, autoprint: e.target.checked }))}
                  className="mr-2"
                />
                Impressão automática
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createPrinterMutation.isPending || updatePrinterMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {editingPrinter ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Impressoras */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Impressoras Configuradas</h3>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : printers.length === 0 ? (
            <div className="text-center py-8">
              <Printer className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma impressora configurada</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-2 text-red-600 hover:text-red-700"
              >
                Adicionar primeira impressora
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {printers.map((printer) => (
                <div key={printer.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(printer.type)}
                        <div>
                          <h4 className="font-medium text-gray-900">{printer.name}</h4>
                          <p className="text-sm text-gray-600">
                            {getLocationLabel(printer.locationId)} • {getPrinterForLabel(printer.printerFor)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          printer.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          <Power className="h-3 w-3 mr-1" />
                          {printer.isActive ? 'Ativa' : 'Inativa'}
                        </span>
                        
                        {printer.autoprint && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Auto
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => testPrinter(printer.id)}
                        disabled={testPrinterMutation.isPending}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Testar impressora"
                      >
                        <TestTube2 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => toggleActive(printer)}
                        disabled={updatePrinterMutation.isPending}
                        className={`p-2 rounded-md transition-colors ${
                          printer.isActive 
                            ? 'text-red-600 hover:bg-red-50' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={printer.isActive ? 'Desativar' : 'Ativar'}
                      >
                        <Power className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleEdit(printer)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(printer.id)}
                        disabled={deletePrinterMutation.isPending}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Deletar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Detalhes da conexão */}
                  <div className="mt-3 text-sm text-gray-600">
                    {printer.type === 'network' && printer.ipAddress && (
                      <p>IP: {printer.ipAddress}:{printer.port}</p>
                    )}
                    {printer.type === 'usb' && printer.devicePath && (
                      <p>Dispositivo: {printer.devicePath}</p>
                    )}
                    <p>Papel: {printer.paperWidth}mm</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}