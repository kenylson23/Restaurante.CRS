import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://raxywnipginzpgkmlblf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurada');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
  console.log('🚀 Configurando Storage do Supabase...');

  try {
    // 1. Criar bucket de imagens
    console.log('📦 Criando bucket "images"...');
    const { data: imagesBucket, error: imagesError } = await supabase.storage.createBucket('images', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    });

    if (imagesError) {
      if (imagesError.message.includes('already exists')) {
        console.log('✅ Bucket "images" já existe');
      } else {
        console.error('❌ Erro ao criar bucket images:', imagesError);
      }
    } else {
      console.log('✅ Bucket "images" criado com sucesso');
    }

    // 2. Criar bucket de uploads
    console.log('📦 Criando bucket "uploads"...');
    const { data: uploadsBucket, error: uploadsError } = await supabase.storage.createBucket('uploads', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
    });

    if (uploadsError) {
      if (uploadsError.message.includes('already exists')) {
        console.log('✅ Bucket "uploads" já existe');
      } else {
        console.error('❌ Erro ao criar bucket uploads:', uploadsError);
      }
    } else {
      console.log('✅ Bucket "uploads" criado com sucesso');
    }

    // 3. Criar bucket de documentos
    console.log('📦 Criando bucket "documents"...');
    const { data: documentsBucket, error: documentsError } = await supabase.storage.createBucket('documents', {
      public: false,
      fileSizeLimit: 20971520, // 20MB
      allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    });

    if (documentsError) {
      if (documentsError.message.includes('already exists')) {
        console.log('✅ Bucket "documents" já existe');
      } else {
        console.error('❌ Erro ao criar bucket documents:', documentsError);
      }
    } else {
      console.log('✅ Bucket "documents" criado com sucesso');
    }

    // 4. Listar buckets existentes
    console.log('📋 Listando buckets existentes...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError);
    } else {
      console.log('✅ Buckets encontrados:');
      buckets.forEach(bucket => {
        console.log(`  - ${bucket.name} (${bucket.public ? 'público' : 'privado'})`);
      });
    }

    console.log('🎉 Configuração do Storage concluída!');

  } catch (error) {
    console.error('❌ Erro na configuração do Storage:', error);
    process.exit(1);
  }
}

// Executar configuração
setupStorage(); 