import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

interface MigrationResult {
  success: boolean;
  error?: string;
  tablesCreated?: string[];
}

async function testDatabaseConnection(connectionString: string): Promise<boolean> {
  console.log('🔍 Testando conexão com o banco Neon...');
  
  const testClient = postgres(connectionString, {
    ssl: 'require',
    max: 1,
    timeout: 10,
  });
  
  try {
    await testClient`SELECT 1 as test`;
    await testClient.end();
    console.log('✅ Conexão com banco estabelecida!');
    return true;
  } catch (error) {
    console.error('❌ Falha na conexão:', error);
    await testClient.end();
    return false;
  }
}

async function createTables(db: any): Promise<string[]> {
  console.log('🏗️ Criando tabelas essenciais...');
  
  const tablesQueries = [
    // Users table
    `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'customer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `,
    
    // Menu categories table
    `
    CREATE TABLE IF NOT EXISTS menu_categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `,
    
    // Menu items table
    `
    CREATE TABLE IF NOT EXISTS menu_items (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      category_id INTEGER REFERENCES menu_categories(id),
      image_url VARCHAR(500),
      available BOOLEAN DEFAULT true,
      prep_time INTEGER DEFAULT 15,
      allergens TEXT[],
      spice_level INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `,
    
    // Restaurant locations table
    `
    CREATE TABLE IF NOT EXISTS restaurant_locations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address TEXT NOT NULL,
      phone VARCHAR(50),
      active BOOLEAN DEFAULT true,
      delivery_fee DECIMAL(10,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `,
    
    // Tables table
    `
    CREATE TABLE IF NOT EXISTS restaurant_tables (
      id SERIAL PRIMARY KEY,
      table_number VARCHAR(10) UNIQUE NOT NULL,
      capacity INTEGER NOT NULL,
      location_id INTEGER REFERENCES restaurant_locations(id),
      status VARCHAR(20) DEFAULT 'available',
      qr_code VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `,
    
    // Orders table
    `
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_number VARCHAR(20) UNIQUE NOT NULL,
      customer_name VARCHAR(255),
      customer_phone VARCHAR(50),
      customer_email VARCHAR(255),
      type VARCHAR(20) NOT NULL, -- 'delivery', 'takeaway', 'dine-in'
      status VARCHAR(20) DEFAULT 'pending',
      location_id INTEGER REFERENCES restaurant_locations(id),
      table_id INTEGER REFERENCES restaurant_tables(id),
      delivery_address TEXT,
      items JSONB NOT NULL,
      subtotal DECIMAL(10,2) NOT NULL,
      delivery_fee DECIMAL(10,2) DEFAULT 0,
      total DECIMAL(10,2) NOT NULL,
      payment_status VARCHAR(20) DEFAULT 'pending',
      special_instructions TEXT,
      estimated_prep_time INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `
  ];
  
  const createdTables: string[] = [];
  
  for (const query of tablesQueries) {
    try {
      const tableName = query.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1] || 'unknown';
      console.log(`📋 Criando tabela: ${tableName}`);
      await db.execute(query);
      createdTables.push(tableName);
      console.log(`✅ Tabela ${tableName} criada com sucesso`);
    } catch (error) {
      console.error(`❌ Erro ao criar tabela:`, error);
      throw error;
    }
  }
  
  return createdTables;
}

async function insertInitialData(db: any): Promise<void> {
  console.log('📊 Inserindo dados iniciais básicos...');
  
  try {
    // Insert categories
    await db.execute(`
      INSERT INTO menu_categories (name, description, display_order) VALUES
      ('Tacos', 'Deliciosos tacos mexicanos tradicionais', 1),
      ('Burritos', 'Burritos recheados com ingredientes frescos', 2),
      ('Quesadillas', 'Quesadillas grelhadas na perfeição', 3),
      ('Nachos', 'Nachos crocantes com molhos especiais', 4),
      ('Bebidas', 'Bebidas refrescantes e tradicionais', 5),
      ('Sobremesas', 'Doces tradicionais mexicanos', 6)
      ON CONFLICT DO NOTHING;
    `);
    
    // Insert locations
    await db.execute(`
      INSERT INTO restaurant_locations (name, address, phone, delivery_fee) VALUES
      ('Ilha de Luanda', 'Ilha de Luanda, Angola', '+244 949 639 932', 500.00),
      ('Talatona', 'Talatona, Luanda, Angola', '+244 949 639 932', 800.00),
      ('Unidade Móvel', 'Serviço móvel', '+244 949 639 932', 1000.00)
      ON CONFLICT DO NOTHING;
    `);
    
    // Insert default users (admin and kitchen)
    await db.execute(`
      INSERT INTO users (email, password_hash, name, role) VALUES
      ('admin@lastortilhas.ao', '$2b$10$defaulthash', 'Administrator', 'admin'),
      ('cozinha@lastortilhas.ao', '$2b$10$defaulthash', 'Cozinha', 'kitchen')
      ON CONFLICT (email) DO NOTHING;
    `);
    
    // Insert sample menu items
    await db.execute(`
      INSERT INTO menu_items (name, description, price, category_id, available) VALUES
      ('Taco Clássico', 'Taco tradicional com carne, alface e tomate', 12.00, 1, true),
      ('Burrito Especial', 'Burrito com frango, feijão e queijo', 18.00, 2, true),
      ('Quesadilla de Queijo', 'Quesadilla simples com queijo derretido', 15.00, 3, true),
      ('Nachos Supremos', 'Nachos com guacamole e molho', 20.00, 4, true),
      ('Coca-Cola', 'Refrigerante gelado', 5.00, 5, true),
      ('Churros', 'Churros doces com canela', 8.00, 6, true)
      ON CONFLICT DO NOTHING;
    `);
    
    console.log('✅ Dados iniciais inseridos com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inserir dados iniciais:', error);
    throw error;
  }
}

async function verifyMigration(db: any): Promise<void> {
  console.log('🔍 Verificando migração...');
  
  try {
    // Check if tables exist and have data
    const tablesCheck = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log('📋 Tabelas criadas:');
    for (const table of tablesCheck) {
      console.log(`   ✅ ${table.table_name}`);
    }
    
    // Check data counts
    const categoriesCount = await db.execute(`SELECT COUNT(*) as count FROM menu_categories`);
    const locationsCount = await db.execute(`SELECT COUNT(*) as count FROM restaurant_locations`);
    const usersCount = await db.execute(`SELECT COUNT(*) as count FROM users`);
    const itemsCount = await db.execute(`SELECT COUNT(*) as count FROM menu_items`);
    
    console.log('📊 Dados inseridos:');
    console.log(`   📂 Categorias: ${categoriesCount[0].count}`);
    console.log(`   📍 Localizações: ${locationsCount[0].count}`);
    console.log(`   👥 Usuários: ${usersCount[0].count}`);
    console.log(`   🍽️  Itens do menu: ${itemsCount[0].count}`);
    
    console.log('✅ Verificação concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
    throw error;
  }
}

async function runMigration(): Promise<MigrationResult> {
  const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  
  if (!connectionString) {
    return {
      success: false,
      error: 'DATABASE_URL não encontrada. Configure no arquivo .env.local'
    };
  }
  
  console.log('🚀 Iniciando migração LOCAL para Neon Database...\n');
  
  // Test connection first
  const isConnected = await testDatabaseConnection(connectionString);
  if (!isConnected) {
    return {
      success: false,
      error: 'Falha na conexão com o banco de dados'
    };
  }
  
  // Create database client
  const client = postgres(connectionString, {
    ssl: 'require',
    max: 10,
  });
  
  const db = drizzle(client);
  
  try {
    // Create tables
    const tablesCreated = await createTables(db);
    
    // Insert initial data
    await insertInitialData(db);
    
    // Verify migration
    await verifyMigration(db);
    
    await client.end();
    
    console.log('\n🎉 MIGRAÇÃO LOCAL CONCLUÍDA COM SUCESSO!');
    console.log('✅ Banco de dados Neon está pronto para testes locais');
    console.log('\n🔧 Para testar localmente:');
    console.log('1. Backend: cd ../server && npm run dev');
    console.log('2. Frontend: cd frontend && npm run dev');
    
    return {
      success: true,
      tablesCreated
    };
    
  } catch (error) {
    await client.end();
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Main execution
async function main() {
  console.log('🗃️ === MIGRAÇÃO LOCAL NEON DATABASE ===\n');
  
  const result = await runMigration();
  
  if (result.success) {
    console.log('\n🎯 PRÓXIMOS PASSOS PARA TESTE LOCAL:');
    console.log('1. ✅ Banco configurado e populado');
    console.log('2. 🖥️ Testar backend: cd ../server && npm run dev');
    console.log('3. 🌐 Testar frontend: cd frontend && npm run dev');
    console.log('4. 🧪 Acessar http://localhost:5173');
    console.log('5. 🚀 Se funcionar, fazer deploy em produção');
    process.exit(0);
  } else {
    console.error(`\n❌ FALHA NA MIGRAÇÃO: ${result.error}`);
    console.error('\n🔧 AÇÕES RECOMENDADAS:');
    console.error('1. Verificar DATABASE_URL no arquivo .env.local');
    console.error('2. Verificar conectividade com Neon');
    console.error('3. Verificar credenciais no dashboard Neon');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});