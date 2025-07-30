import { Router } from 'express';
import { getImageUrl } from '../../shared/supabase-storage';

const router = Router();

/**
 * Rota para servir imagens do Supabase Storage
 * GET /api/images/:category/:filename
 */
router.get('/:category/:filename', (req, res) => {
  try {
    const { category, filename } = req.params;
    
    // Construir caminho da imagem no Supabase
    const imagePath = `${category}/${filename}`;
    
    // Obter URL pública da imagem
    const imageUrl = getImageUrl(imagePath);
    
    // Redirecionar para a URL da imagem no Supabase
    res.redirect(imageUrl);
  } catch (error) {
    console.error('Erro ao servir imagem:', error);
    res.status(404).json({ error: 'Imagem não encontrada' });
  }
});

/**
 * Rota para obter metadados da imagem
 * GET /api/images/info/:category/:filename
 */
router.get('/info/:category/:filename', (req, res) => {
  try {
    const { category, filename } = req.params;
    const imagePath = `${category}/${filename}`;
    const imageUrl = getImageUrl(imagePath);
    
    res.json({
      path: imagePath,
      url: imageUrl,
      category,
      filename
    });
  } catch (error) {
    console.error('Erro ao obter info da imagem:', error);
    res.status(404).json({ error: 'Imagem não encontrada' });
  }
});

export { router as imageProxyRouter };