import { Router } from 'express';
// Temporarily disabled Supabase image proxy since project migrated to local PostgreSQL
// import { getImageUrl } from '../../shared/supabase-storage';

const router = Router();

/**
 * Rota para servir imagens locais
 * GET /api/images/:category/:filename
 */
router.get('/:category/:filename', (req, res) => {
  try {
    const { category, filename } = req.params;
    
    // For local development, serve images from public/uploads directory
    const localImagePath = `/uploads/${category}/${filename}`;
    
    // Redirect to local static file path
    res.redirect(localImagePath);
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
    const imageUrl = `/uploads/${imagePath}`;
    
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