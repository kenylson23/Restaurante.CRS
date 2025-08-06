import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../shared/db';
import { orders, orderItems, menuItems } from '../../../shared/schema';
import { eq, desc, and, gte, lte, inArray } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      status,
      locationId,
      orderType,
      paymentStatus,
      startDate,
      endDate,
      limit = '20',
      offset = '0'
    } = req.query;

    // Construir condições de filtro
    const conditions = [];

    if (status) {
      conditions.push(eq(orders.status, status as string));
    }

    if (locationId) {
      conditions.push(eq(orders.locationId, locationId as string));
    }

    if (orderType) {
      conditions.push(eq(orders.orderType, orderType as string));
    }

    if (paymentStatus) {
      conditions.push(eq(orders.paymentStatus, paymentStatus as string));
    }

    if (startDate) {
      conditions.push(gte(orders.createdAt, new Date(startDate as string)));
    }

    if (endDate) {
      conditions.push(lte(orders.createdAt, new Date(endDate as string)));
    }

    // Buscar pedidos
    const ordersQuery = db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    if (conditions.length > 0) {
      ordersQuery.where(and(...conditions));
    }

    const ordersList = await ordersQuery;

    // Buscar itens para cada pedido
    const ordersWithItems = await Promise.all(
      ordersList.map(async (order) => {
        const items = await db
          .select({
            id: orderItems.id,
            quantity: orderItems.quantity,
            unitPrice: orderItems.unitPrice,
            customizations: orderItems.customizations,
            menuItem: {
              id: menuItems.id,
              name: menuItems.name,
              description: menuItems.description,
              price: menuItems.price,
              category: menuItems.category
            }
          })
          .from(orderItems)
          .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
          .where(eq(orderItems.orderId, order.id));

        return {
          ...order,
          items
        };
      })
    );

    // Contar total de pedidos para paginação
    const countQuery = db
      .select({ count: orders.id })
      .from(orders);

    if (conditions.length > 0) {
      countQuery.where(and(...conditions));
    }

    const totalCount = await countQuery;

    return res.status(200).json({
      orders: ordersWithItems,
      pagination: {
        total: totalCount.length,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: ordersWithItems.length === Number(limit)
      }
    });

  } catch (error) {
    console.error('List orders API error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 