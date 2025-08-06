import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../shared/db';
import { orders, reservations } from '../../../shared/schema';
import { eq, desc, and, gte } from 'drizzle-orm';

// Armazenar conexões ativas para notificações
const notificationConnections = new Set<NextApiResponse>();

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
  res.setHeader('X-Accel-Buffering', 'no');

  // Adicionar conexão ao set
  notificationConnections.add(res);

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
    const recentNotifications = await getRecentNotifications();
    
    sendData({
      type: 'initial',
      notifications: recentNotifications,
      timestamp: new Date().toISOString()
    }, 'notifications');

    // Enviar heartbeat a cada 30 segundos
    const heartbeatInterval = setInterval(() => {
      sendHeartbeat();
    }, 30000);

    // Verificar novas notificações a cada 15 segundos
    const checkInterval = setInterval(async () => {
      try {
        const newNotifications = await getNewNotifications();
        
        if (newNotifications.length > 0) {
          sendData({
            type: 'new_notifications',
            notifications: newNotifications,
            timestamp: new Date().toISOString()
          }, 'notifications');
        }

      } catch (error) {
        console.error('SSE notifications error:', error);
        sendData({
          type: 'error',
          message: 'Erro ao verificar notificações',
          timestamp: new Date().toISOString()
        }, 'error');
      }
    }, 15000);

    // Limpar quando a conexão for fechada
    req.on('close', () => {
      notificationConnections.delete(res);
      clearInterval(heartbeatInterval);
      clearInterval(checkInterval);
      console.log('SSE notifications connection closed. Active connections:', notificationConnections.size);
    });

    // Enviar confirmação de conexão
    sendData({
      type: 'connected',
      message: 'Conexão SSE de notificações estabelecida',
      timestamp: new Date().toISOString()
    }, 'connection');

  } catch (error) {
    console.error('SSE notifications setup error:', error);
    sendData({
      type: 'error',
      message: 'Erro ao configurar SSE de notificações',
      timestamp: new Date().toISOString()
    }, 'error');
    res.end();
  }
}

// Função para buscar notificações recentes
async function getRecentNotifications() {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  
  const recentOrders = await db
    .select()
    .from(orders)
    .where(gte(orders.createdAt, fifteenMinutesAgo))
    .orderBy(desc(orders.createdAt))
    .limit(10);

  const recentReservations = await db
    .select()
    .from(reservations)
    .where(gte(reservations.createdAt, fifteenMinutesAgo))
    .orderBy(desc(reservations.createdAt))
    .limit(5);

  return {
    orders: recentOrders,
    reservations: recentReservations
  };
}

// Função para buscar novas notificações
async function getNewNotifications() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  const newOrders = await db
    .select()
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, fiveMinutesAgo),
        orders.status.in(['received', 'preparing', 'ready'])
      )
    )
    .orderBy(desc(orders.createdAt));

  const newReservations = await db
    .select()
    .from(reservations)
    .where(gte(reservations.createdAt, fiveMinutesAgo))
    .orderBy(desc(reservations.createdAt));

  return {
    orders: newOrders,
    reservations: newReservations
  };
}

// Função para broadcast de notificações para todas as conexões
export const broadcastNotification = (data: any, event?: string) => {
  notificationConnections.forEach(connection => {
    try {
      if (event) {
        connection.write(`event: ${event}\n`);
      }
      connection.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      console.error('Notification broadcast error:', error);
      notificationConnections.delete(connection);
    }
  });
}; 