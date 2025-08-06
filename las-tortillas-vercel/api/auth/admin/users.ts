import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../shared/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        // Listar usuários (apenas admin)
        const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (listError) {
          console.error('List users error:', listError);
          return res.status(500).json({ 
            error: 'Erro ao listar usuários' 
          });
        }

        // Filtrar dados sensíveis
        const safeUsers = users.users.map(user => ({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || '',
          role: user.user_metadata?.role || 'user',
          emailConfirmed: user.email_confirmed_at ? true : false,
          createdAt: user.created_at,
          lastSignIn: user.last_sign_in_at
        }));

        return res.status(200).json({ users: safeUsers });

      case 'POST':
        // Criar usuário (apenas admin)
        const { email, password, name, role = 'user' } = req.body;

        if (!email || !password) {
          return res.status(400).json({ 
            error: 'Email e senha são obrigatórios' 
          });
        }

        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          user_metadata: { name, role },
          email_confirm: true // Confirmar email automaticamente
        });

        if (createError) {
          console.error('Create user error:', createError);
          return res.status(400).json({ 
            error: createError.message || 'Erro ao criar usuário' 
          });
        }

        const safeUser = {
          id: newUser.user?.id,
          email: newUser.user?.email,
          name: newUser.user?.user_metadata?.name || '',
          role: newUser.user?.user_metadata?.role || 'user',
          emailConfirmed: true,
          createdAt: newUser.user?.created_at
        };

        return res.status(201).json({ user: safeUser });

      case 'DELETE':
        // Deletar usuário (apenas admin)
        const { userId } = req.query;

        if (!userId || typeof userId !== 'string') {
          return res.status(400).json({ 
            error: 'ID do usuário é obrigatório' 
          });
        }

        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (deleteError) {
          console.error('Delete user error:', deleteError);
          return res.status(500).json({ 
            error: deleteError.message || 'Erro ao deletar usuário' 
          });
        }

        return res.status(200).json({ 
          message: 'Usuário deletado com sucesso' 
        });

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Admin users API error:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 