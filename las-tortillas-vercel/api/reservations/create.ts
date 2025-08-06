import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../shared/db';
import { reservations } from '../../../shared/schema';
import { z } from 'zod';

// Schema de validação para reservas
const createReservationSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().email('Email inválido').optional(),
  date: z.string().min(1, 'Data é obrigatória'),
  time: z.string().min(1, 'Horário é obrigatório'),
  guests: z.number().min(1, 'Número de convidados deve ser pelo menos 1'),
  notes: z.string().optional()
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
    // Validar dados da reserva
    const validatedData = createReservationSchema.parse(req.body);
    
    // Verificar se a data é futura
    const reservationDate = new Date(`${validatedData.date}T${validatedData.time}`);
    const now = new Date();
    
    if (reservationDate <= now) {
      return res.status(400).json({ 
        message: 'A data e horário da reserva devem ser futuros' 
      });
    }

    // Verificar disponibilidade (implementação básica)
    const existingReservations = await db
      .select()
      .from(reservations)
      .where(
        reservations.date === validatedData.date &&
        reservations.time === validatedData.time
      );

    if (existingReservations.length >= 10) { // Limite de 10 reservas por horário
      return res.status(409).json({ 
        message: 'Horário não disponível para reserva' 
      });
    }

    // Criar a reserva
    const [newReservation] = await db
      .insert(reservations)
      .values({
        name: validatedData.name,
        phone: validatedData.phone,
        email: validatedData.email,
        date: validatedData.date,
        time: validatedData.time,
        guests: validatedData.guests,
        notes: validatedData.notes
      })
      .returning();

    // Broadcast para SSE
    try {
      const { broadcastNotification } = await import('../sse/notifications');
      broadcastNotification({
        type: 'new_reservation',
        reservation: newReservation,
        timestamp: new Date().toISOString()
      }, 'notifications');
    } catch (error) {
      console.error('SSE broadcast error:', error);
    }

    return res.status(201).json({
      message: 'Reserva criada com sucesso',
      reservation: newReservation
    });

  } catch (error) {
    console.error('Create reservation API error:', error);
    
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