# 🔧 Configuração para Migração Supabase

## 📋 Pré-requisitos

Para executar a migração, você precisa configurar as seguintes variáveis de ambiente:

### 1. Criar arquivo `.env`

Crie um arquivo `.env` na raiz do projeto (`las-tortillas-vercel/.env`) com o seguinte conteúdo:

```bash
# Supabase Configuration
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role

# Database URL (formato: postgresql://user:password@host:port/database)
DATABASE_URL=postgresql://postgres:sua_senha@db.sua_projeto.supabase.co:5432/postgres

# Environment
NODE_ENV=development

# Base URL for QR codes
NEXT_PUBLIC_BASE_URL=https://lastortillas.vercel.app
```

### 2. Obter as credenciais do Supabase

1. Acesse o [dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **Settings** > **API**
4. Copie as seguintes informações:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Obter a URL do banco de dados

1. No dashboard do Supabase, vá para **Settings** > **Database**
2. Copie a **Connection string** (formato: `postgresql://postgres:[password]@[host]:5432/postgres`)
3. Substitua `[password]` pela senha do seu banco
4. Use como `DATABASE_URL`

## 🚀 Executar Migração

Após configurar as variáveis, execute:

```bash
cd las-tortillas-vercel/frontend
npx tsx ../scripts/migrate-simple.ts
```

## ✅ Verificar Migração

Para verificar se a migração foi bem-sucedida:

```bash
npm run test-migration
```

## 🔧 Troubleshooting

### Erro: "DATABASE_URL não configurada"
- Verifique se o arquivo `.env` existe
- Verifique se a variável `DATABASE_URL` está configurada corretamente

### Erro: "Connection failed"
- Verifique se as credenciais do Supabase estão corretas
- Verifique se o projeto Supabase está ativo

### Erro: "Permission denied"
- Verifique se está usando a `service_role` key (não a `anon` key)
- Verifique se o banco de dados está acessível

## 📊 Estrutura Criada

A migração criará as seguintes tabelas:

- `sessions` - Sessões de usuário
- `users` - Usuários do sistema
- `reservations` - Reservas de mesa
- `contacts` - Mensagens de contato
- `menu_items` - Itens do menu
- `orders` - Pedidos
- `order_items` - Itens dos pedidos
- `tables` - Mesas do restaurante
- `printers` - Impressoras

## 🎯 Próximos Passos

1. Configure as variáveis de ambiente
2. Execute a migração
3. Teste as APIs
4. Deploy para Vercel 