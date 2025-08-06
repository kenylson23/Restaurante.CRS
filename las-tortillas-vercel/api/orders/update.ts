import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../shared/db';
import { orders } from '../../../shared/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Schema de validação para atualização de pedidos
const updateOrderSchema = z.object({
  id: z.number().positive(),
  status: z.enum(['received', 'preparing', 'ready', 'delivered', 'cancelled']).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed']).optional(),
  estimatedDeliveryTime: z.string().optional(),
  notes: z.string().optional()
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Validar dados da atualização
    const validatedData = updateOrderSchema.parse(req.body);
    
    const { id, ...updateData } = validatedData;

    // Verificar se o pedido existe
    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (existingOrder.length === 0) {
      return res.status(404).json({ 
        message: 'Pedido não encontrado' 
      });
    }

    // Atualizar o pedido
    const [updatedOrder] = await db
      .update(orders)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(orders.id, id))
      .returning();

    // Broadcast para SSE se houver mudança de status
    if (updateData.status && updateData.status !== existingOrder[0].status) {
      try {
        const { broadcastToAll } = await import('../sse/orders');
        broadcastToAll({
          type: 'status_update',
          order: updatedOrder,
          previousStatus: existingOrder[0].status,
          newStatus: updateData.status,
          timestamp: new Date().toISOString()
        }, 'status');
      } catch (error) {
        console.error('SSE broadcast error:', error);
      }
    }

    return res.status(200).json({
      message: 'Pedido atualizado com sucesso',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Update order API error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: error.errors 
      });
    }

    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 