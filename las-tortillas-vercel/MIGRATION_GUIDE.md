# 🚀 Guia de Migração para Supabase

Este guia completa a migração do projeto para o Supabase, incluindo todas as APIs, autenticação, storage e banco de dados.

## 📋 Pré-requisitos

1. **Conta Supabase** criada
2. **Projeto Supabase** configurado
3. **Variáveis de ambiente** configuradas
4. **Node.js** e **npm** instalados

## 🔧 Configuração Inicial

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# Supabase
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role

# Database
DATABASE_URL=sua_url_do_banco_supabase

# Ambiente
NODE_ENV=development

# Google Analytics (opcional)
NEXT_PUBLIC_GA_ID=seu_ga_id
```

### 2. Configurar Supabase Storage

No dashboard do Supabase, crie um bucket chamado `images`:

```sql
-- No SQL Editor do Supabase
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true);
```

### 3. Configurar Políticas de Storage

```sql
-- Permitir upload público para imagens
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');
```

## 🗄️ Migração do Banco de Dados

### 1. Executar Script de Migração

```bash
cd las-tortillas-vercel/frontend
npm run migrate
```

Este script irá:
- ✅ Criar todas as tabelas necessárias
- ✅ Configurar índices e constraints
- ✅ Inserir dados de exemplo
- ✅ Configurar Row Level Security (RLS)
- ✅ Configurar políticas de acesso

### 2. Verificar Tabelas Criadas

No dashboard do Supabase, verifique se as seguintes tabelas foram criadas:

- `sessions` - Sessões de usuário
- `users` - Usuários do sistema
- `reservations` - Reservas de mesa
- `contacts` - Mensagens de contato
- `menu_items` - Itens do menu
- `orders` - Pedidos
- `order_items` - Itens dos pedidos
- `tables` - Mesas do restaurante
- `printers` - Impressoras

## 🔐 APIs Implementadas

### Autenticação (`/api/auth/`)

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/auth/login` | POST | Login de usuário |
| `/api/auth/register` | POST | Registro de usuário |
| `/api/auth/logout` | POST | Logout de usuário |
| `/api/auth/user` | GET | Dados do usuário atual |
| `/api/auth/admin/users` | GET/POST/DELETE | Gerenciamento de usuários |

### Menu (`/api/menu/`)

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/menu/items` | GET/POST/PUT/DELETE | CRUD de itens do menu |
| `/api/menu/categories` | GET | Listar categorias |

### Pedidos (`/api/orders/`)

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/orders/create` | POST | Criar novo pedido |
| `/api/orders/list` | GET | Listar pedidos com filtros |
| `/api/orders/update` | PUT/PATCH | Atualizar status do pedido |

### Reservas (`/api/reservations/`)

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/reservations/create` | POST | Criar nova reserva |

### Upload (`/api/upload/`)

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/upload/image` | POST | Upload de imagens |

### SSE (`/api/sse/`)

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/sse/orders` | GET | Eventos de pedidos em tempo real |
| `/api/sse/notifications` | GET | Notificações gerais |

## 🧪 Testando as APIs

### 1. Testar Autenticação

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# Registro
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"new@example.com","password":"123456","name":"Test User"}'
```

### 2. Testar Menu

```bash
# Listar itens
curl http://localhost:3000/api/menu/items

# Criar item
curl -X POST http://localhost:3000/api/menu/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Taco Teste","description":"Taco de teste","price":15.00,"category":"Tacos"}'
```

### 3. Testar Pedidos

```bash
# Criar pedido
curl -X POST http://localhost:3000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "customerName":"João Silva",
    "customerPhone":"123456789",
    "orderType":"delivery",
    "locationId":"ilha",
    "totalAmount":30.00,
    "paymentMethod":"cash",
    "items":[{"menuItemId":1,"quantity":2,"unitPrice":15.00}]
  }'

# Listar pedidos
curl http://localhost:3000/api/orders/list
```

### 4. Testar SSE

```bash
# Testar eventos de pedidos
curl -N http://localhost:3000/api/sse/orders

# Testar notificações
curl -N http://localhost:3000/api/sse/notifications
```

## 🔄 Hook React para SSE

O hook `useSSE` está disponível em `frontend/src/hooks/useSSE.ts`:

```typescript
import { useSSE } from '../hooks/useSSE';

function KitchenDashboard() {
  const { isConnected, error } = useSSE({
    url: '/api/sse/orders',
    eventTypes: ['orders', 'status'],
    onMessage: (data) => {
      console.log('Novo evento:', data);
    }
  });

  return (
    <div>
      Status: {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
      {error && <p>Erro: {error}</p>}
    </div>
  );
}
```

## 🚀 Deploy para Vercel

### 1. Configurar Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login no Vercel
vercel login

# Configurar variáveis de ambiente
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add DATABASE_URL
```

### 2. Deploy

```bash
# Deploy para produção
vercel --prod
```

## 📊 Monitoramento

### 1. Logs do Supabase

Acesse o dashboard do Supabase para monitorar:
- **Database**: Queries, performance, erros
- **Storage**: Uploads, downloads, uso
- **Auth**: Logins, registros, sessões
- **Edge Functions**: Execução de funções

### 2. Logs do Vercel

No dashboard do Vercel, monitore:
- **Functions**: Execução das APIs
- **Builds**: Status dos builds
- **Analytics**: Performance e uso

## 🔧 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com Supabase**
   - Verificar variáveis de ambiente
   - Verificar URL e chaves do Supabase

2. **Erro de RLS (Row Level Security)**
   - Verificar políticas de acesso
   - Verificar autenticação do usuário

3. **Erro de upload de imagens**
   - Verificar bucket do Storage
   - Verificar políticas de Storage

4. **SSE não funcionando**
   - Verificar headers CORS
   - Verificar conexão com banco

### Comandos Úteis

```bash
# Verificar conexão com Supabase
npm run migrate

# Testar localmente
npm run dev

# Verificar logs
vercel logs

# Verificar variáveis de ambiente
vercel env ls
```

## ✅ Checklist de Migração

- [ ] Configurar variáveis de ambiente
- [ ] Criar bucket de Storage
- [ ] Executar script de migração
- [ ] Testar APIs de autenticação
- [ ] Testar APIs de menu
- [ ] Testar APIs de pedidos
- [ ] Testar APIs de reservas
- [ ] Testar upload de imagens
- [ ] Testar SSE
- [ ] Configurar Vercel
- [ ] Deploy para produção
- [ ] Testar em produção

## 🎉 Conclusão

A migração para Supabase está completa! O projeto agora utiliza:

- ✅ **Supabase Auth** para autenticação
- ✅ **Supabase Database** para dados
- ✅ **Supabase Storage** para imagens
- ✅ **Vercel Functions** para APIs
- ✅ **SSE** para tempo real
- ✅ **RLS** para segurança

O sistema está pronto para produção! 🚀 