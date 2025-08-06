import postgres from 'postgres';

// URL correta do Supabase (sem o prefixo db.)
const DATABASE_URL = 'postgresql://postgres:Kenylson%23@raxywnipginzpgkmlblf.supabase.co:5432/postgres';

async function migrateSupabase() {
  console.log('🚀 Iniciando migração para Supabase...');

  try {
    console.log('📡 Conectando ao Supabase...');

    const sql = postgres(DATABASE_URL, {
      max: 1,
      prepare: false,
      ssl: 'require'
    });

    console.log('✅ Conectado ao Supabase');

    // Criar tabelas
    console.log('📋 Criando tabelas...');

    // Tabela de sessões
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      );
    `;

    // Índice para sessões
    await sql`
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);
    `;

    // Tabela de usuários
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY NOT NULL,
        email VARCHAR UNIQUE,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Tabela de reservas
    await sql`
      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        guests INTEGER NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    // Tabela de contatos
    await sql`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    // Tabela de itens do menu
    await sql`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price NUMERIC(10,2) NOT NULL,
        category TEXT NOT NULL,
        available BOOLEAN DEFAULT TRUE,
        preparation_time INTEGER DEFAULT 15,
        customizations TEXT[],
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Tabela de mesas
    await sql`
      CREATE TABLE IF NOT EXISTS tables (
        id SERIAL PRIMARY KEY,
        location_id TEXT NOT NULL,
        table_number INTEGER NOT NULL,
        seats INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'available',
        qr_code TEXT UNIQUE,
        qr_code_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Tabela de pedidos
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_email TEXT,
        delivery_address TEXT,
        order_type TEXT NOT NULL,
        location_id TEXT NOT NULL,
        table_id INTEGER REFERENCES tables(id),
        status TEXT NOT NULL DEFAULT 'received',
        total_amount NUMERIC(10,2) NOT NULL,
        payment_method TEXT NOT NULL,
        payment_status TEXT NOT NULL DEFAULT 'pending',
        notes TEXT,
        estimated_delivery_time TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Tabela de itens do pedido
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) NOT NULL,
        menu_item_id INTEGER REFERENCES menu_items(id) NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price NUMERIC(10,2) NOT NULL,
        customizations TEXT[],
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Tabela de impressoras
    await sql`
      CREATE TABLE IF NOT EXISTS printers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        ip_address TEXT,
        port INTEGER DEFAULT 9100,
        device_path TEXT,
        paper_width INTEGER DEFAULT 80,
        is_active BOOLEAN DEFAULT TRUE,
        autoprint BOOLEAN DEFAULT FALSE,
        location_id TEXT NOT NULL,
        printer_for TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    console.log('✅ Tabelas criadas com sucesso');

    // Inserir dados de exemplo
    console.log('📝 Inserindo dados de exemplo...');

    // Inserir itens do menu de exemplo
    await sql`
      INSERT INTO menu_items (name, description, price, category, available) VALUES
      ('Taco de Carne', 'Taco tradicional com carne moída, alface, tomate e queijo', 15.00, 'Tacos', true),
      ('Burrito de Frango', 'Burrito recheado com frango grelhado, arroz e feijão', 25.00, 'Burritos', true),
      ('Quesadilla de Queijo', 'Quesadilla com queijo derretido e guacamole', 20.00, 'Quesadillas', true),
      ('Nachos', 'Nachos com queijo, guacamole e sour cream', 18.00, 'Entradas', true),
      ('Guacamole', 'Guacamole fresco com chips de milho', 12.00, 'Entradas', true)
      ON CONFLICT DO NOTHING;
    `;

    // Inserir mesas de exemplo
    await sql`
      INSERT INTO tables (location_id, table_number, seats, status) VALUES
      ('ilha', 1, 4, 'available'),
      ('ilha', 2, 6, 'available'),
      ('ilha', 3, 2, 'available'),
      ('talatona', 1, 4, 'available'),
      ('talatona', 2, 8, 'available')
      ON CONFLICT DO NOTHING;
    `;

    console.log('✅ Dados de exemplo inseridos');

    // Configurar RLS (Row Level Security)
    console.log('🔒 Configurando Row Level Security...');

    // Habilitar RLS nas tabelas
    await sql`ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;`;
    await sql`ALTER TABLE orders ENABLE ROW LEVEL SECURITY;`;
    await sql`ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;`;
    await sql`ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;`;
    await sql`ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;`;
    await sql`ALTER TABLE tables ENABLE ROW LEVEL SECURITY;`;
    await sql`ALTER TABLE printers ENABLE ROW LEVEL SECURITY;`;

    // Políticas para menu_items (leitura pública)
    await sql`
      CREATE POLICY "Menu items are viewable by everyone" ON menu_items
      FOR SELECT USING (true);
    `;

    // Políticas para orders (leitura e escrita para usuários autenticados)
    await sql`
      CREATE POLICY "Users can view their own orders" ON orders
      FOR SELECT USING (auth.uid()::text = customer_email);
    `;

    await sql`
      CREATE POLICY "Users can insert orders" ON orders
      FOR INSERT WITH CHECK (true);
    `;

    // Políticas para reservations (leitura e escrita para usuários autenticados)
    await sql`
      CREATE POLICY "Users can view their own reservations" ON reservations
      FOR SELECT USING (auth.uid()::text = email);
    `;

    await sql`
      CREATE POLICY "Users can insert reservations" ON reservations
      FOR INSERT WITH CHECK (true);
    `;

    console.log('✅ RLS configurado com sucesso');

    console.log('🎉 Migração concluída com sucesso!');
    console.log('📊 Tabelas criadas:');
    console.log('  - sessions');
    console.log('  - users');
    console.log('  - reservations');
    console.log('  - contacts');
    console.log('  - menu_items');
    console.log('  - orders');
    console.log('  - order_items');
    console.log('  - tables');
    console.log('  - printers');

  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
}

// Executar migração
migrateSupabase(); 