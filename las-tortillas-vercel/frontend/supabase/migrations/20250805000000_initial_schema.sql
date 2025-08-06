-- Migração inicial para Las Tortillas
-- Criar todas as tabelas necessárias para o sistema

-- 1. Tabela de sessões
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

-- 2. Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY NOT NULL,
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Tabela de reservas
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

-- 4. Tabela de contatos
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 5. Tabela de itens do menu
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

-- 6. Tabela de mesas
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

-- 7. Tabela de pedidos
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

-- 8. Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) NOT NULL,
  menu_item_id INTEGER REFERENCES menu_items(id) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  customizations TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. Tabela de impressoras
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

-- Inserir dados de exemplo
INSERT INTO menu_items (name, description, price, category, available) VALUES
('Taco de Carne', 'Taco tradicional com carne moída, alface, tomate e queijo', 15.00, 'Tacos', true),
('Burrito de Frango', 'Burrito recheado com frango grelhado, arroz e feijão', 25.00, 'Burritos', true),
('Quesadilla de Queijo', 'Quesadilla com queijo derretido e guacamole', 20.00, 'Quesadillas', true),
('Nachos', 'Nachos com queijo, guacamole e sour cream', 18.00, 'Entradas', true),
('Guacamole', 'Guacamole fresco com chips de milho', 12.00, 'Entradas', true)
ON CONFLICT DO NOTHING;

INSERT INTO tables (location_id, table_number, seats, status) VALUES
('ilha', 1, 4, 'available'),
('ilha', 2, 6, 'available'),
('ilha', 3, 2, 'available'),
('talatona', 1, 4, 'available'),
('talatona', 2, 8, 'available')
ON CONFLICT DO NOTHING;

-- Configurar Row Level Security (RLS)
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE printers ENABLE ROW LEVEL SECURITY;

-- Políticas para menu_items (leitura pública)
CREATE POLICY "Menu items are viewable by everyone" ON menu_items
FOR SELECT USING (true);

-- Políticas para orders (leitura e escrita para usuários autenticados)
CREATE POLICY "Users can view their own orders" ON orders
FOR SELECT USING (auth.uid()::text = customer_email);

CREATE POLICY "Users can insert orders" ON orders
FOR INSERT WITH CHECK (true);

-- Políticas para reservations (leitura e escrita para usuários autenticados)
CREATE POLICY "Users can view their own reservations" ON reservations
FOR SELECT USING (auth.uid()::text = email);

CREATE POLICY "Users can insert reservations" ON reservations
FOR INSERT WITH CHECK (true); 