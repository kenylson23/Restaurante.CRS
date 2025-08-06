import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

async function testMigration() {
  console.log('🧪 Testando migração para Supabase...');

  try {
    // Conectar ao Supabase
    const DATABASE_URL = process.env.DATABASE_URL;
    
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL não configurada');
    }

    console.log('📡 Conectando ao Supabase...');

    const sql = postgres(DATABASE_URL, {
      max: 1,
      prepare: false,
      ssl: 'require'
    });

    console.log('✅ Conectado ao Supabase');

    // Testar tabelas
    console.log('📋 Testando tabelas...');

    // Testar menu_items
    const menuItemsCount = await sql`SELECT COUNT(*) as count FROM menu_items`;
    console.log(`✅ menu_items: ${menuItemsCount[0].count} itens encontrados`);

    // Testar orders (deve estar vazia inicialmente)
    const ordersCount = await sql`SELECT COUNT(*) as count FROM orders`;
    console.log(`✅ orders: ${ordersCount[0].count} pedidos encontrados`);

    // Testar reservations (deve estar vazia inicialmente)
    const reservationsCount = await sql`SELECT COUNT(*) as count FROM reservations`;
    console.log(`✅ reservations: ${reservationsCount[0].count} reservas encontradas`);

    // Testar tables
    const tablesCount = await sql`SELECT COUNT(*) as count FROM tables`;
    console.log(`✅ tables: ${tablesCount[0].count} mesas encontradas`);

    // Testar inserção de dados
    console.log('📝 Testando inserção de dados...');

    // Inserir item de teste
    const testItem = await sql`
      INSERT INTO menu_items (name, description, price, category, available) 
      VALUES ('Item de Teste', 'Item criado durante teste de migração', 10.00, 'Teste', true)
      RETURNING id, name
    `;

    console.log(`✅ Item de teste criado: ${testItem[0].name} (ID: ${testItem[0].id})`);

    // Deletar item de teste
    await sql`DELETE FROM menu_items WHERE id = ${testItem[0].id}`;
    console.log('✅ Item de teste removido');

    console.log('🎉 Todos os testes passaram!');
    console.log('📊 Resumo:');
    console.log(`  - Menu items: ${menuItemsCount[0].count}`);
    console.log(`  - Orders: ${ordersCount[0].count}`);
    console.log(`  - Reservations: ${reservationsCount[0].count}`);
    console.log(`  - Tables: ${tablesCount[0].count}`);
    console.log('  - Conexão com Supabase: ✅');
    console.log('  - Inserção/remoção de dados: ✅');

  } catch (error) {
    console.error('❌ Erro nos testes:', error);
    process.exit(1);
  }
}

// Executar testes
testMigration(); 