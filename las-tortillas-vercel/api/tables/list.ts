import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../shared/db';
import { tables } from '../../../shared/schema';
import { eq, desc } from 'drizzle-orm';

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
    const { locationId, status } = req.query;

    // Construir condições de filtro
    const conditions = [];

    if (locationId) {
      conditions.push(eq(tables.locationId, locationId as string));
    }

    if (status) {
      conditions.push(eq(tables.status, status as string));
    }

    // Buscar mesas
    const tablesQuery = db
      .select()
      .from(tables)
      .orderBy(desc(tables.createdAt));

    if (conditions.length > 0) {
      tablesQuery.where(conditions[0]); // Simplificado para uma condição
    }

    const tablesList = await tablesQuery;

    return res.status(200).json({
      tables: tablesList,
      total: tablesList.length
    });

  } catch (error) {
    console.error('List tables API error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 