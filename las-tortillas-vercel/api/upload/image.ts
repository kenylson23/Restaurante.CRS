import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../shared/supabase';
import { z } from 'zod';

// Schema de validação para upload
const uploadSchema = z.object({
  image: z.string().min(1, 'Imagem é obrigatória'),
  fileName: z.string().min(1, 'Nome do arquivo é obrigatório'),
  folder: z.string().default('uploads'),
  contentType: z.string().default('image/jpeg')
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
    // Validar dados do upload
    const validatedData = uploadSchema.parse(req.body);
    
    const { image, fileName, folder, contentType } = validatedData;

    // Decodificar base64
    const buffer = Buffer.from(image, 'base64');

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${fileName}`;
    const filePath = `${folder}/${uniqueFileName}`;

    // Upload para Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('images')
      .upload(filePath, buffer, {
        contentType,
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ 
        message: 'Erro ao fazer upload da imagem',
        error: error.message 
      });
    }

    // Gerar URL pública
    const { data: urlData } = supabaseAdmin.storage
      .from('images')
      .getPublicUrl(filePath);

    return res.status(200).json({
      message: 'Upload realizado com sucesso',
      file: {
        path: filePath,
        url: urlData.publicUrl,
        fileName: uniqueFileName,
        size: buffer.length
      }
    });

  } catch (error) {
    console.error('Upload API error:', error);
    
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