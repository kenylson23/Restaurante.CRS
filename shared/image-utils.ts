import { getImageUrl } from './supabase-storage';

/**
 * Utilitários para gerenciar imagens no frontend
 */

// URLs base para diferentes categorias de imagens
export const IMAGE_CATEGORIES = {
  PUBLIC: 'public',
  UPLOADS: 'uploads', 
  SRC: 'src',
  MENU: 'menu'
} as const;

// Mapear imagens locais para URLs do Supabase
export const IMAGE_MAPPINGS = {
  // Imagens hero
  'hero-desktop.jpg': 'public/hero-desktop.jpg',
  'hero-desktop.webp': 'public/hero-desktop.webp',
  'hero-mobile.jpg': 'public/hero-mobile.jpg',
  'hero-mobile.webp': 'public/hero-mobile.webp',
  
  // Imagens do restaurante
  'restaurant-ambiente.jpg': 'public/restaurant-ambiente.jpg'
} as const;

/**
 * Obter URL de uma imagem específica
 * @param imageName Nome da imagem (ex: 'hero-desktop.jpg')
 * @param category Categoria opcional (padrão: 'public')
 */
export function getSupabaseImageUrl(imageName: string, category: string = IMAGE_CATEGORIES.PUBLIC): string {
  // Verificar se há mapeamento específico
  if (imageName in IMAGE_MAPPINGS) {
    return getImageUrl(IMAGE_MAPPINGS[imageName as keyof typeof IMAGE_MAPPINGS]);
  }
  
  // Construir caminho padrão
  const imagePath = `${category}/${imageName}`;
  return getImageUrl(imagePath);
}

/**
 * Obter URLs para imagens responsivas (desktop e mobile)
 */
export function getResponsiveImageUrls(baseName: string) {
  return {
    desktop: {
      jpg: getSupabaseImageUrl(`${baseName}-desktop.jpg`),
      webp: getSupabaseImageUrl(`${baseName}-desktop.webp`)
    },
    mobile: {
      jpg: getSupabaseImageUrl(`${baseName}-mobile.jpg`),
      webp: getSupabaseImageUrl(`${baseName}-mobile.webp`)
    }
  };
}

/**
 * Obter URL de imagem de upload específica
 */
export function getUploadImageUrl(filename: string): string {
  return getSupabaseImageUrl(filename, IMAGE_CATEGORIES.UPLOADS);
}

/**
 * Componente de imagem com fallback
 */
export interface ImageWithFallbackProps {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  onError?: () => void;
}

/**
 * Hook para verificar se uma imagem existe
 */
export function useImageExists(url: string): boolean {
  const [exists, setExists] = useState(false);
  
  useEffect(() => {
    const img = new Image();
    img.onload = () => setExists(true);
    img.onerror = () => setExists(false);
    img.src = url;
  }, [url]);
  
  return exists;
}

/**
 * Lista de todas as imagens hero disponíveis
 */
export function getHeroImages() {
  return getResponsiveImageUrls('hero');
}

/**
 * Obter URL da imagem de ambiente do restaurante
 */
export function getRestaurantAmbienteUrl(): string {
  return getSupabaseImageUrl('restaurant-ambiente.jpg');
}

// Importações React para o hook
import { useState, useEffect } from 'react';