import { supabase, supabaseAdmin } from './supabase';

export class SupabaseImageStorage {
  private bucketName = 'images';

  /**
   * Fazer upload de uma imagem para o Supabase Storage
   * @param file File object ou Buffer
   * @param path Caminho onde salvar (ex: "menu/taco-1.jpg")
   * @param isPublic Se a imagem deve ser pública
   */
  async uploadImage(
    file: File | Buffer, 
    path: string, 
    isPublic: boolean = true
  ): Promise<{ url: string | null; error: string | null }> {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(this.bucketName)
        .upload(path, file, {
          upsert: true, // Substitui se já existir
          contentType: this.getContentType(path)
        });

      if (error) {
        return { url: null, error: error.message };
      }

      // Obter URL pública
      if (isPublic) {
        const { data: publicData } = supabaseAdmin.storage
          .from(this.bucketName)
          .getPublicUrl(path);
        
        return { url: publicData.publicUrl, error: null };
      }

      return { url: data.path, error: null };
    } catch (error) {
      return { url: null, error: (error as Error).message };
    }
  }

  /**
   * Obter URL pública de uma imagem
   * @param path Caminho da imagem no storage
   */
  getPublicUrl(path: string): string {
    const { data } = supabaseAdmin.storage
      .from(this.bucketName)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  /**
   * Deletar uma imagem do storage
   * @param path Caminho da imagem
   */
  async deleteImage(path: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabaseAdmin.storage
        .from(this.bucketName)
        .remove([path]);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Listar todas as imagens em um diretório
   * @param folder Pasta (ex: "menu", "public")
   */
  async listImages(folder: string = ''): Promise<{ images: string[]; error: string | null }> {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(this.bucketName)
        .list(folder);

      if (error) {
        return { images: [], error: error.message };
      }

      const imageFiles = data
        ?.filter(file => this.isImageFile(file.name))
        .map(file => folder ? `${folder}/${file.name}` : file.name) || [];

      return { images: imageFiles, error: null };
    } catch (error) {
      return { images: [], error: (error as Error).message };
    }
  }

  /**
   * Verificar se um arquivo é uma imagem baseado na extensão
   */
  private isImageFile(filename: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return imageExtensions.includes(ext);
  }

  /**
   * Determinar content type baseado na extensão do arquivo
   */
  private getContentType(filename: string): string {
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.webp':
        return 'image/webp';
      case '.gif':
        return 'image/gif';
      case '.svg':
        return 'image/svg+xml';
      default:
        return 'image/jpeg';
    }
  }

  /**
   * Migrar imagem local para Supabase
   * @param localPath Caminho local da imagem
   * @param remotePath Caminho no Supabase Storage
   */
  async migrateLocalImage(localPath: string, remotePath: string): Promise<{ url: string | null; error: string | null }> {
    try {
      // Ler arquivo local (para uso em Node.js)
      const fs = await import('fs');
      const fileBuffer = fs.readFileSync(localPath);
      
      return await this.uploadImage(fileBuffer, remotePath);
    } catch (error) {
      return { url: null, error: (error as Error).message };
    }
  }
}

// Instância global do gerenciador de imagens
export const imageStorage = new SupabaseImageStorage();

// Função helper para obter URL da imagem
export function getImageUrl(path: string): string {
  return imageStorage.getPublicUrl(path);
}

// Função helper para upload direto
export async function uploadImage(file: File | Buffer, path: string): Promise<string | null> {
  const { url, error } = await imageStorage.uploadImage(file, path);
  
  if (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    return null;
  }
  
  return url;
}