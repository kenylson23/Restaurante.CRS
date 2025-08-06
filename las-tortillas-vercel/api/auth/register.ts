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
    const { email, password, name, role = 'user' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email e senha são obrigatórios' 
      });
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Email inválido' 
      });
    }

    // Validar senha (mínimo 6 caracteres)
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Senha deve ter pelo menos 6 caracteres' 
      });
    }

    // Registrar usuário com Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || '',
          role: role
        }
      }
    });

    if (error) {
      console.error('Register error:', error);
      return res.status(400).json({ 
        error: error.message || 'Erro ao registrar usuário' 
      });
    }

    // Retornar dados do usuário criado
    const user = {
      id: data.user?.id,
      email: data.user?.email,
      name: data.user?.user_metadata?.name,
      role: data.user?.user_metadata?.role || 'user'
    };

    return res.status(201).json({
      user,
      message: 'Usuário registrado com sucesso',
      requiresEmailConfirmation: data.user && !data.session
    });

  } catch (error) {
    console.error('Register API error:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 