import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../shared/db';
import { menuItems } from '../../../shared/schema';
import { eq, desc } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Validation schema
const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
  createdAt: true,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        const { category, id } = req.query;
        
        if (id) {
          // Buscar item específico por ID
          const item = await db
            .select()
            .from(menuItems)
            .where(eq(menuItems.id, Number(id)))
            .limit(1);
          
          if (item.length === 0) {
            return res.status(404).json({ error: 'Item não encontrado' });
          }
          
          return res.status(200).json(item[0]);
        }
        
        if (category) {
          // Buscar por categoria
          const items = await db
            .select()
            .from(menuItems)
            .where(eq(menuItems.category, category as string))
            .orderBy(desc(menuItems.createdAt));
          
          return res.status(200).json(items);
        } else {
          // Buscar todos os itens
          const items = await db
            .select()
            .from(menuItems)
            .orderBy(desc(menuItems.createdAt));
          
          return res.status(200).json(items);
        }

      case 'POST':
        // Criar novo item
        const validation = insertMenuItemSchema.safeParse(req.body);
        if (!validation.success) {
          return res.status(400).json({ 
            error: 'Dados inválidos', 
            details: validation.error.errors 
          });
        }

        const newItem = await db
          .insert(menuItems)
          .values(validation.data)
          .returning();
        
        return res.status(201).json(newItem[0]);

      case 'PUT':
        // Atualizar item existente
        const { id: updateId, ...updateData } = req.body;
        
        if (!updateId) {
          return res.status(400).json({ error: 'ID é obrigatório' });
        }

        const updateValidation = insertMenuItemSchema.partial().safeParse(updateData);
        if (!updateValidation.success) {
          return res.status(400).json({ 
            error: 'Dados inválidos', 
            details: updateValidation.error.errors 
          });
        }

        const updatedItem = await db
          .update(menuItems)
          .set(updateValidation.data)
          .where(eq(menuItems.id, Number(updateId)))
          .returning();

        if (updatedItem.length === 0) {
          return res.status(404).json({ error: 'Item não encontrado' });
        }

        return res.status(200).json(updatedItem[0]);

      case 'DELETE':
        // Deletar item
        const deleteId = req.query.id || req.body.id;
        
        if (!deleteId) {
          return res.status(400).json({ error: 'ID é obrigatório' });
        }

        const deletedItem = await db
          .delete(menuItems)
          .where(eq(menuItems.id, Number(deleteId)))
          .returning();

        if (deletedItem.length === 0) {
          return res.status(404).json({ error: 'Item não encontrado' });
        }

        return res.status(200).json({ 
          message: 'Item deletado com sucesso',
          deletedItem: deletedItem[0]
        });

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Menu items API error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 