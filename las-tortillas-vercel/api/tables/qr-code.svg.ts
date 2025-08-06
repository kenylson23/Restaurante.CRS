import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../shared/db';
import { tables } from '../../../shared/schema';
import { eq } from 'drizzle-orm';
import QRCode from 'qrcode';

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
    const { id } = req.query;
    const tableId = parseInt(id as string);

    if (!tableId) {
      return res.status(400).json({ message: 'ID da mesa é obrigatório' });
    }

    // Buscar a mesa
    const tableList = await db
      .select()
      .from(tables)
      .where(eq(tables.id, tableId))
      .limit(1);

    if (tableList.length === 0) {
      return res.status(404).json({ message: 'Mesa não encontrada' });
    }

    const table = tableList[0];

    // URL base
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   req.headers.origin || 
                   'https://lastortillas.vercel.app';

    // URL que o QR code vai apontar
    const qrCodeUrl = `${baseUrl}/menu?table=${table.id}&location=${table.locationId}&code=${table.qrCode || 'default'}&t=${table.tableNumber}`;

    // Gerar QR Code como SVG
    const svgQR = await QRCode.toString(qrCodeUrl, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 1,
      color: {
        dark: '#DC2626', // Vermelho da marca
        light: '#FFFFFF'
      },
      width: 300
    });

    // Configurar headers para SVG
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache por 1 hora

    return res.status(200).send(svgQR);

  } catch (error) {
    console.error('QR Code SVG generation error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 