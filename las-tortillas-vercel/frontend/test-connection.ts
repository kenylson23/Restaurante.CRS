import postgres from 'postgres';

// Carregar variáveis manualmente
const DATABASE_URL = 'postgresql://postgres:Kenylson%23@db.raxywnipginzpgkmlblf.supabase.co:5432/postgres';

async function testConnection() {
  console.log('🧪 Testando conexão com Supabase...');

  try {
    console.log('📡 Conectando ao Supabase...');

    const sql = postgres(DATABASE_URL, {
      max: 1,
      prepare: false,
      ssl: 'require'
    });

    console.log('✅ Conectado ao Supabase');

    // Testar uma query simples
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Query de teste executada:', result[0].current_time);

    // Testar se as tabelas existem
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log('📋 Tabelas encontradas:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });

    console.log('🎉 Conexão testada com sucesso!');

  } catch (error) {
    console.error('❌ Erro na conexão:', error);
    process.exit(1);
  }
}

// Executar teste
testConnection(); 