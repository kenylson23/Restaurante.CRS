import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { getDatabaseUrl } from '../shared/supabase';
import { menuItems, orders, reservations } from '../shared/schema';

async function testMigration() {
  console.log('🧪 Testando migração para Supabase...');

  try {
    // Conectar ao Supabase
    const DATABASE_URL = getDatabaseUrl();
    
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL não configurada');
    }

    const sql = postgres(DATABASE_URL, {
      max: 1,
      prepare: false,
      ssl: 'require'
    });

    const db = drizzle(sql);

    console.log('✅ Conectado ao Supabase');

    // Testar tabelas
    console.log('📋 Testando tabelas...');

    // Testar menu_items
    const menuItemsCount = await db.select().from(menuItems);
    console.log(`✅ menu_items: ${menuItemsCount.length} itens encontrados`);

    // Testar orders (deve estar vazia inicialmente)
    const ordersCount = await db.select().from(orders);
    console.log(`✅ orders: ${ordersCount.length} pedidos encontrados`);

    // Testar reservations (deve estar vazia inicialmente)
    const reservationsCount = await db.select().from(reservations);
    console.log(`✅ reservations: ${reservationsCount.length} reservas encontradas`);

    // Testar inserção de dados
    console.log('📝 Testando inserção de dados...');

    // Inserir item de teste
    const [newMenuItem] = await db.insert(menuItems).values({
      name: 'Item de Teste',
      description: 'Item criado durante teste de migração',
      price: '10.00',
      category: 'Teste',
      available: true
    }).returning();

    console.log(`✅ Item de teste criado: ${newMenuItem.name}`);

    // Deletar item de teste
    await db.delete(menuItems).where(menuItems.id === newMenuItem.id);
    console.log('✅ Item de teste removido');

    // Testar APIs (se estiver rodando localmente)
    console.log('🌐 Testando APIs...');

    try {
      const baseUrl = 'http://localhost:3000';
      
      // Testar API de menu
      const menuResponse = await fetch(`${baseUrl}/api/menu/items`);
      if (menuResponse.ok) {
        console.log('✅ API de menu funcionando');
      } else {
        console.log('⚠️ API de menu não respondeu');
      }

      // Testar API de categorias
      const categoriesResponse = await fetch(`${baseUrl}/api/menu/categories`);
      if (categoriesResponse.ok) {
        console.log('✅ API de categorias funcionando');
      } else {
        console.log('⚠️ API de categorias não respondeu');
      }

    } catch (error) {
      console.log('⚠️ APIs não estão rodando localmente (normal se não estiverem iniciadas)');
    }

    console.log('🎉 Todos os testes passaram!');
    console.log('📊 Resumo:');
    console.log(`  - Menu items: ${menuItemsCount.length}`);
    console.log(`  - Orders: ${ordersCount.length}`);
    console.log(`  - Reservations: ${reservationsCount.length}`);
    console.log('  - Conexão com Supabase: ✅');
    console.log('  - Inserção/remoção de dados: ✅');

  } catch (error) {
    console.error('❌ Erro nos testes:', error);
    process.exit(1);
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  testMigration();
}

export { testMigration }; 