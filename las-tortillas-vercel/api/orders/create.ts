import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../shared/db';
import { orders, orderItems } from '../../../shared/schema';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

// Schema de validação para pedidos
const createOrderSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  customerEmail: z.string().email().optional(),
  deliveryAddress: z.string().optional(),
  orderType: z.enum(['delivery', 'takeaway', 'dine-in']),
  locationId: z.enum(['ilha', 'talatona', 'movel']),
  tableId: z.number().optional(),
  totalAmount: z.number().positive(),
  paymentMethod: z.enum(['cash', 'card', 'transfer']),
  notes: z.string().optional(),
  items: z.array(z.object({
    menuItemId: z.number(),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
    customizations: z.array(z.string()).optional()
  })).min(1)
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Validar dados do pedido
    const validatedData = createOrderSchema.parse(req.body);
    
    // Criar o pedido
    const [newOrder] = await db
      .insert(orders)
      .values({
        customerName: validatedData.customerName,
        customerPhone: validatedData.customerPhone,
        customerEmail: validatedData.customerEmail,
        deliveryAddress: validatedData.deliveryAddress,
        orderType: validatedData.orderType,
        locationId: validatedData.locationId,
        tableId: validatedData.tableId,
        totalAmount: validatedData.totalAmount.toString(),
        paymentMethod: validatedData.paymentMethod,
        notes: validatedData.notes,
        status: 'received',
        paymentStatus: 'pending'
      })
      .returning();

    // Criar os itens do pedido
    const orderItemsData = validatedData.items.map(item => ({
      orderId: newOrder.id,
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toString(),
      customizations: item.customizations || []
    }));

    await db.insert(orderItems).values(orderItemsData);

    // Buscar o pedido completo com itens
    const completeOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, newOrder.id));

    const orderItemsList = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, newOrder.id));

    const result = {
      ...completeOrder[0],
      items: orderItemsList
    };

    return res.status(201).json(result);

  } catch (error) {
    console.error('Create order API error:', error);
    
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