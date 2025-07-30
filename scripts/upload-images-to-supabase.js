#!/usr/bin/env node

/**
 * Script para fazer upload de todas as imagens para o Supabase Storage
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 Iniciando upload de imagens para Supabase Storage...\n');

// Função para fazer upload de uma imagem
async function uploadImage(filePath, bucketPath) {
  try {
    console.log(`📤 Fazendo upload: ${filePath} -> ${bucketPath}`);
    
    const fileBuffer = readFileSync(filePath);
    const fileName = basename(bucketPath);
    const fileExt = extname(fileName);
    
    // Determinar content type
    let contentType = 'image/jpeg';
    if (fileExt === '.png') contentType = 'image/png';
    else if (fileExt === '.webp') contentType = 'image/webp';
    else if (fileExt === '.gif') contentType = 'image/gif';
    else if (fileExt === '.svg') contentType = 'image/svg+xml';
    
    const { data, error } = await supabase.storage
      .from('images')
      .upload(bucketPath, fileBuffer, {
        contentType,
        upsert: true // Substitui se já existir
      });

    if (error) {
      console.error(`❌ Erro ao fazer upload de ${filePath}:`, error.message);
      return false;
    }

    console.log(`✅ Upload bem-sucedido: ${bucketPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    return false;
  }
}

// Função para escanear diretório recursivamente
function scanDirectory(dirPath, baseDir = '') {
  const items = [];
  
  try {
    const entries = readdirSync(dirPath);
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Recursão para subdiretórios
        const subItems = scanDirectory(fullPath, join(baseDir, entry));
        items.push(...subItems);
      } else if (stat.isFile()) {
        const ext = extname(entry).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext)) {
          items.push({
            localPath: fullPath,
            remotePath: join(baseDir, entry).replace(/\\/g, '/')
          });
        }
      }
    }
  } catch (error) {
    console.error(`❌ Erro ao escanear diretório ${dirPath}:`, error.message);
  }
  
  return items;
}

async function main() {
  try {
    // Criar bucket se não existir
    console.log('🪣 Verificando/criando bucket "images"...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Erro ao listar buckets:', bucketsError.message);
      return;
    }
    
    const imagesBucket = buckets.find(bucket => bucket.name === 'images');
    
    if (!imagesBucket) {
      console.log('📦 Criando bucket "images"...');
      const { error: createError } = await supabase.storage.createBucket('images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
      });
      
      if (createError) {
        console.error('❌ Erro ao criar bucket:', createError.message);
        return;
      }
      console.log('✅ Bucket "images" criado com sucesso');
    } else {
      console.log('✅ Bucket "images" já existe');
    }

    // Coletar todas as imagens
    const projectRoot = join(__dirname, '..');
    const imagePaths = [];
    
    // Escanear diretórios de imagens
    const dirsToScan = [
      { local: join(projectRoot, 'public/images'), remote: 'public' },
      { local: join(projectRoot, 'src/images'), remote: 'src' },
      { local: join(projectRoot, 'public/uploads'), remote: 'uploads' }
    ];
    
    for (const { local, remote } of dirsToScan) {
      try {
        const images = scanDirectory(local, remote);
        imagePaths.push(...images);
        console.log(`📁 Encontradas ${images.length} imagens em ${local}`);
      } catch (error) {
        console.log(`⚠️  Diretório ${local} não encontrado ou inacessível`);
      }
    }
    
    console.log(`\n📊 Total de imagens encontradas: ${imagePaths.length}\n`);
    
    if (imagePaths.length === 0) {
      console.log('ℹ️  Nenhuma imagem encontrada para upload');
      return;
    }
    
    // Fazer upload de todas as imagens
    let successCount = 0;
    let errorCount = 0;
    
    for (const { localPath, remotePath } of imagePaths) {
      const success = await uploadImage(localPath, remotePath);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
    }
    
    console.log('\n📈 Resumo do upload:');
    console.log(`✅ Sucessos: ${successCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`📊 Total: ${imagePaths.length}`);
    
    if (successCount > 0) {
      console.log('\n🎉 Upload concluído! As imagens estão agora disponíveis no Supabase Storage.');
      console.log(`🔗 URL base: ${supabaseUrl}/storage/v1/object/public/images/`);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

main();