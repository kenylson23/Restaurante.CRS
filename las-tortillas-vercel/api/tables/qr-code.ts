import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../shared/db';
import { tables } from '../../../shared/schema';
import { eq } from 'drizzle-orm';
import QRCode from 'qrcode';
import { nanoid } from 'nanoid';

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

    // Gerar código único
    const qrCode = nanoid(10);
    
    // URL base (pode ser configurada via env)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   req.headers.origin || 
                   'https://lastortillas.vercel.app';

    // URL que o QR code vai apontar
    const qrCodeUrl = `${baseUrl}/menu?table=${table.id}&location=${table.locationId}&code=${qrCode}&t=${table.tableNumber}`;

    // Gerar QR Code como Data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#DC2626', // Vermelho da marca
        light: '#FFFFFF'
      },
      width: 300
    });

    // Atualizar a mesa com o QR code
    const [updatedTable] = await db
      .update(tables)
      .set({
        qrCode,
        qrCodeUrl
      })
      .where(eq(tables.id, tableId))
      .returning();

    return res.status(200).json({
      table: updatedTable,
      qrCodeUrl,
      qrCode,
      qrCodeDataUrl
    });

  } catch (error) {
    console.error('QR Code generation error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 