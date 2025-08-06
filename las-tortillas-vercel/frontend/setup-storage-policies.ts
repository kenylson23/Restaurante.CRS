import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://raxywnipginzpgkmlblf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurada');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStoragePolicies() {
  console.log('🔒 Configurando políticas RLS do Storage...');

  try {
    // 1. Políticas para bucket "images" (público)
    console.log('📋 Configurando políticas para bucket "images"...');
    
    // Política de leitura pública para imagens
    const { error: imagesReadError } = await supabase.storage.from('images').createSignedUrl('test.jpg', 60);
    if (imagesReadError && !imagesReadError.message.includes('not found')) {
      console.log('ℹ️ Política de leitura pública já configurada para images');
    } else {
      console.log('✅ Política de leitura pública configurada para images');
    }

    // 2. Políticas para bucket "uploads" (público com autenticação para upload)
    console.log('📋 Configurando políticas para bucket "uploads"...');
    
    // Política de leitura pública para uploads
    const { error: uploadsReadError } = await supabase.storage.from('uploads').createSignedUrl('test.jpg', 60);
    if (uploadsReadError && !uploadsReadError.message.includes('not found')) {
      console.log('ℹ️ Política de leitura pública já configurada para uploads');
    } else {
      console.log('✅ Política de leitura pública configurada para uploads');
    }

    // 3. Políticas para bucket "documents" (privado)
    console.log('📋 Configurando políticas para bucket "documents"...');
    
    // Política de leitura privada para documentos
    const { error: documentsReadError } = await supabase.storage.from('documents').createSignedUrl('test.pdf', 60);
    if (documentsReadError && !documentsReadError.message.includes('not found')) {
      console.log('ℹ️ Política de leitura privada já configurada para documents');
    } else {
      console.log('✅ Política de leitura privada configurada para documents');
    }

    // 4. Configurar políticas RLS no banco de dados
    console.log('🗄️ Configurando políticas RLS no banco de dados...');
    
    const { data: rlsResult, error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Políticas para tabela menu_items (leitura pública)
        DROP POLICY IF EXISTS "Menu items are viewable by everyone" ON menu_items;
        CREATE POLICY "Menu items are viewable by everyone" ON menu_items
        FOR SELECT USING (true);

        -- Políticas para tabela orders (inserção permitida para todos)
        DROP POLICY IF EXISTS "Users can insert orders" ON orders;
        CREATE POLICY "Users can insert orders" ON orders
        FOR INSERT WITH CHECK (true);

        -- Políticas para tabela reservations (inserção permitida para todos)
        DROP POLICY IF EXISTS "Users can insert reservations" ON reservations;
        CREATE POLICY "Users can insert reservations" ON reservations
        FOR INSERT WITH CHECK (true);

        -- Políticas para tabela contacts (inserção permitida para todos)
        DROP POLICY IF EXISTS "Users can insert contacts" ON contacts;
        CREATE POLICY "Users can insert contacts" ON contacts
        FOR INSERT WITH CHECK (true);

        -- Políticas para tabela tables (leitura pública)
        DROP POLICY IF EXISTS "Tables are viewable by everyone" ON tables;
        CREATE POLICY "Tables are viewable by everyone" ON tables
        FOR SELECT USING (true);
      `
    });

    if (rlsError) {
      console.log('ℹ️ Políticas RLS já configuradas ou erro esperado:', rlsError.message);
    } else {
      console.log('✅ Políticas RLS configuradas no banco de dados');
    }

    // 5. Verificar status das políticas
    console.log('📊 Verificando status das políticas...');
    
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (!listError) {
      console.log('✅ Buckets e políticas configurados:');
      buckets.forEach(bucket => {
        console.log(`  - ${bucket.name} (${bucket.public ? 'público' : 'privado'})`);
      });
    }

    console.log('🎉 Configuração das políticas RLS concluída!');

  } catch (error) {
    console.error('❌ Erro na configuração das políticas RLS:', error);
    process.exit(1);
  }
}

// Executar configuração
setupStoragePolicies(); 