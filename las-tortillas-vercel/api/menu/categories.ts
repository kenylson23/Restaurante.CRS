import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../shared/db';
import { menuItems } from '../../../shared/schema';
import { sql } from 'drizzle-orm';

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
    // Buscar categorias únicas com contagem de itens
    const categories = await db
      .select({
        category: menuItems.category,
        itemCount: sql<number>`count(*)`.as('itemCount')
      })
      .from(menuItems)
      .groupBy(menuItems.category)
      .orderBy(menuItems.category);

    return res.status(200).json(categories);

  } catch (error) {
    console.error('Menu categories API error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 