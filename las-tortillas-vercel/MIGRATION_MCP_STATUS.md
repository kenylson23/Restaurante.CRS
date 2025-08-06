# 📊 Status da Migração via MCP

## ✅ **Verificações realizadas via MCP:**

1. **✅ Conexão confirmada** - MCP está conectado ao projeto `raxywnipginzpgkmlblf`
2. **✅ Extensões listadas** - 67 extensões disponíveis no banco
3. **✅ Query de teste executada** - `SELECT NOW()` funcionou
4. **✅ Banco vazio confirmado** - Nenhuma tabela na schema `public`
5. **❌ MCP em modo somente leitura** - Não pode criar tabelas

## 🔍 **Informações do projeto:**

- **URL do projeto**: `https://raxywnipginzpgkmlblf.supabase.co`
- **Status**: Ativo e funcionando
- **Tabelas existentes**: 0 (banco vazio)
- **Extensões**: 67 disponíveis (incluindo `uuid-ossp`, `pgcrypto`, etc.)

## ❌ **Problema identificado:**

O MCP está em **modo somente leitura**, o que impede a criação de tabelas. Isso é uma limitação de segurança do Supabase.

## 🔧 **Soluções alternativas:**

### **1. Usar Supabase CLI (Recomendado):**

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login no Supabase
supabase login

# Inicializar projeto
supabase init

# Aplicar migrações
supabase db push
```

### **2. Usar Dashboard do Supabase:**

1. Acesse o [dashboard do Supabase](https://supabase.com/dashboard)
2. Vá para **SQL Editor**
3. Execute as queries de criação de tabelas manualmente

### **3. Usar Connection String direta:**

O problema pode ser com o hostname. Tentar:
- `raxywnipginzpgkmlblf.supabase.co` (sem `db.`)
- Verificar se a senha está corretamente codificada

## 📋 **Scripts SQL prontos:**

### **Criar tabelas (para SQL Editor):**

```sql
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
```

### **Inserir dados de exemplo:**

```sql
-- Inserir itens do menu
INSERT INTO menu_items (name, description, price, category, available) VALUES
('Taco de Carne', 'Taco tradicional com carne moída, alface, tomate e queijo', 15.00, 'Tacos', true),
('Burrito de Frango', 'Burrito recheado com frango grelhado, arroz e feijão', 25.00, 'Burritos', true),
('Quesadilla de Queijo', 'Quesadilla com queijo derretido e guacamole', 20.00, 'Quesadillas', true),
('Nachos', 'Nachos com queijo, guacamole e sour cream', 18.00, 'Entradas', true),
('Guacamole', 'Guacamole fresco com chips de milho', 12.00, 'Entradas', true);

-- Inserir mesas
INSERT INTO tables (location_id, table_number, seats, status) VALUES
('ilha', 1, 4, 'available'),
('ilha', 2, 6, 'available'),
('ilha', 3, 2, 'available'),
('talatona', 1, 4, 'available'),
('talatona', 2, 8, 'available');
```

## 🎯 **Próximos passos:**

1. **Usar Supabase CLI** para aplicar migrações
2. **Ou usar SQL Editor** no dashboard para criar tabelas manualmente
3. **Verificar tabelas** criadas via MCP
4. **Testar APIs** com o banco configurado

---

**Status atual**: ✅ Banco confirmado e pronto para migração
**Problema**: MCP em modo somente leitura
**Solução**: Usar Supabase CLI ou SQL Editor 