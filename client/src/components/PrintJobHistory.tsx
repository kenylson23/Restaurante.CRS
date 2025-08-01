import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Printer, Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface PrintJob {
  id: number;
  order_id: number;
  printer_id: number;
  job_type: string;
  status: 'pending' | 'completed' | 'failed';
  retry_count: number;
  error_message?: string;
  printed_at?: string;
  created_at: string;
  customer_name?: string;
  printer_name?: string;
}

interface PrintJobHistoryProps {
  orderId?: number;
  className?: string;
}

export const PrintJobHistory: React.FC<PrintJobHistoryProps> = ({ 
  orderId, 
  className 
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const { data: printHistory = [], refetch, isLoading } = useQuery({
    queryKey: ['print-history', orderId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (orderId) params.append('orderId', orderId.toString());
      
      const response = await fetch(`/api/print-history?${params}`);
      if (!response.ok) throw new Error('Erro ao buscar histórico');
      return response.json() as Promise<PrintJob[]>;
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  const handleRetryFailedJobs = async () => {
    setIsRetrying(true);
    try {
      const response = await fetch('/api/print-jobs/retry', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Erro ao reprocessar jobs');

      console.log("Jobs reprocessados com sucesso");

      // Aguardar um pouco e atualizar
      setTimeout(() => {
        refetch();
        setIsRetrying(false);
      }, 2000);
    } catch (error) {
      console.error("Falha ao reprocessar jobs de impressão:", error);
      setIsRetrying(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-AO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const failedJobsCount = printHistory.filter(job => job.status === 'failed').length;

  if (isLoading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
        <div className="p-4 border-b border-gray-200">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Printer className="h-5 w-5" />
            Histórico de Impressão
          </h3>
        </div>
        <div className="p-4">
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Printer className="h-5 w-5" />
            Histórico de Impressão
            {printHistory.length > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                {printHistory.length}
              </span>
            )}
          </h3>
          
          {failedJobsCount > 0 && (
            <button
              onClick={handleRetryFailedJobs}
              disabled={isRetrying}
              className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 disabled:opacity-50"
            >
              <RotateCcw className={`h-4 w-4 mr-2 inline ${isRetrying ? 'animate-spin' : ''}`} />
              Reprocessar ({failedJobsCount})
            </button>
          )}
        </div>
      </div>
      
      <div className="p-4">
        {printHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Printer className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum histórico de impressão encontrado</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {printHistory.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(job.status)}
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        Pedido #{job.order_id}
                      </span>
                      {job.customer_name && (
                        <span className="text-sm text-gray-600">
                          - {job.customer_name}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{job.printer_name || 'Impressora padrão'}</span>
                      <span>•</span>
                      <span>{formatDateTime(job.created_at)}</span>
                      {job.retry_count > 0 && (
                        <>
                          <span>•</span>
                          <span>{job.retry_count} tentativa(s)</span>
                        </>
                      )}
                    </div>
                    
                    {job.error_message && (
                      <div className="text-xs text-red-600 mt-1">
                        {job.error_message}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded ${getStatusColor(job.status)}`}>
                    {job.status === 'completed' ? 'Concluído' : 
                     job.status === 'failed' ? 'Falhado' : 'Pendente'}
                  </span>
                  
                  {job.printed_at && (
                    <div className="text-xs text-gray-500">
                      {formatDateTime(job.printed_at)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};