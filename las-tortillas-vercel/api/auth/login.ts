import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../shared/supabase';

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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email e senha são obrigatórios' 
      });
    }

    // Fazer login com Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Login error:', error);
      return res.status(401).json({ 
        error: error.message || 'Credenciais inválidas' 
      });
    }

    // Retornar dados do usuário (sem senha)
    const user = {
      id: data.user?.id,
      email: data.user?.email,
      name: data.user?.user_metadata?.name,
      role: data.user?.user_metadata?.role || 'user'
    };

    return res.status(200).json({
      user,
      session: data.session,
      message: 'Login realizado com sucesso'
    });

  } catch (error) {
    console.error('Login API error:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 