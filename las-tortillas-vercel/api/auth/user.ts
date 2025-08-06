import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../shared/supabase';

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
    // Obter usuário atual do Supabase
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Get user error:', error);
      return res.status(401).json({ 
        error: 'Usuário não autenticado',
        authenticated: false
      });
    }

    if (!user) {
      return res.status(401).json({ 
        error: 'Usuário não autenticado',
        authenticated: false
      });
    }

    // Retornar dados do usuário (sem informações sensíveis)
    const userData = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || '',
      role: user.user_metadata?.role || 'user',
      emailConfirmed: user.email_confirmed_at ? true : false,
      createdAt: user.created_at
    };

    return res.status(200).json({
      user: userData,
      authenticated: true
    });

  } catch (error) {
    console.error('Get user API error:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 