import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../shared/db';
import { orders } from '../../../shared/schema';
import { eq, desc, and, gte } from 'drizzle-orm';

// Armazenar conexões ativas
const connections = new Set<NextApiResponse>();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Configurar headers para Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');
  res.setHeader('X-Accel-Buffering', 'no'); // Para nginx

  // Adicionar conexão ao set
  connections.add(res);

  // Função para enviar dados
  const sendData = (data: any, event?: string) => {
    if (event) {
      res.write(`event: ${event}\n`);
    }
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Função para enviar heartbeat
  const sendHeartbeat = () => {
    res.write(': heartbeat\n\n');
  };

  try {
    // Enviar dados iniciais
    const recentOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(20);

    sendData({
      type: 'initial',
      orders: recentOrders,
      timestamp: new Date().toISOString()
    }, 'orders');

    // Enviar heartbeat a cada 30 segundos
    const heartbeatInterval = setInterval(() => {
      sendHeartbeat();
    }, 30000);

    // Verificar novos pedidos a cada 10 segundos
    const checkInterval = setInterval(async () => {
      try {
        // Buscar pedidos dos últimos 10 segundos
        const tenSecondsAgo = new Date(Date.now() - 10000);
        
        const newOrders = await db
          .select()
          .from(orders)
          .where(
            and(
              gte(orders.createdAt, tenSecondsAgo),
              eq(orders.status, 'received')
            )
          )
          .orderBy(desc(orders.createdAt));

        if (newOrders.length > 0) {
          sendData({
            type: 'new_orders',
            orders: newOrders,
            timestamp: new Date().toISOString()
          }, 'orders');
        }

        // Verificar mudanças de status
        const statusUpdates = await db
          .select()
          .from(orders)
          .where(
            and(
              gte(orders.createdAt, tenSecondsAgo),
              orders.status.in(['preparing', 'ready', 'delivered'])
            )
          )
          .orderBy(desc(orders.createdAt));

        if (statusUpdates.length > 0) {
          sendData({
            type: 'status_updates',
            orders: statusUpdates,
            timestamp: new Date().toISOString()
          }, 'status');
        }

      } catch (error) {
        console.error('SSE check error:', error);
        sendData({
          type: 'error',
          message: 'Erro ao verificar pedidos',
          timestamp: new Date().toISOString()
        }, 'error');
      }
    }, 10000);

    // Limpar quando a conexão for fechada
    req.on('close', () => {
      connections.delete(res);
      clearInterval(heartbeatInterval);
      clearInterval(checkInterval);
      console.log('SSE connection closed. Active connections:', connections.size);
    });

    // Enviar confirmação de conexão
    sendData({
      type: 'connected',
      message: 'Conexão SSE estabelecida',
      timestamp: new Date().toISOString()
    }, 'connection');

  } catch (error) {
    console.error('SSE setup error:', error);
    sendData({
      type: 'error',
      message: 'Erro ao configurar SSE',
      timestamp: new Date().toISOString()
    }, 'error');
    res.end();
  }
}

// Função para broadcast para todas as conexões
export const broadcastToAll = (data: any, event?: string) => {
  connections.forEach(connection => {
    try {
      if (event) {
        connection.write(`event: ${event}\n`);
      }
      connection.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      console.error('Broadcast error:', error);
      connections.delete(connection);
    }
  });
}; 