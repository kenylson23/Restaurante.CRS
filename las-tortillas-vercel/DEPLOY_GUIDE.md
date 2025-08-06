# 🚀 Guia de Deploy - Las Tortillas para Vercel

## 📋 Pré-requisitos

1. **Conta no Vercel**: [vercel.com](https://vercel.com)
2. **Conta no Supabase**: [supabase.com](https://supabase.com)
3. **Node.js**: Versão 18+ instalada
4. **Git**: Para controle de versão

## 🔧 Configuração Inicial

### 1. Instalar Vercel CLI
```bash
npm install -g vercel
```

### 2. Login no Vercel
```bash
vercel login
```

### 3. Configurar Supabase

#### Criar projeto no Supabase:
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote as credenciais:
   - Project URL
   - Anon Key
   - Service Role Key

#### Configurar banco de dados:
```sql
-- Executar no SQL Editor do Supabase
-- As tabelas serão criadas automaticamente pelo Drizzle
```

## ⚙️ Configuração de Ambiente

### 1. Variáveis de Ambiente no Vercel

Acesse o dashboard do Vercel e configure as seguintes variáveis:

```env
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
DATABASE_URL=sua_url_do_banco
NODE_ENV=production
```

### 2. Configurar Domínio (Opcional)

No dashboard do Vercel:
1. Vá em Settings > Domains
2. Adicione seu domínio personalizado
3. Configure os registros DNS

## 🚀 Deploy Automatizado

### Opção 1: Deploy via CLI
```bash
# No diretório raiz do projeto
./deploy.sh  # Linux/Mac
# ou
.\deploy.ps1  # Windows
```

### Opção 4: Teste Local
```bash
# Testar localmente antes do deploy
.\test-local.ps1  # Windows
```

### Opção 2: Deploy Manual
```bash
# 1. Instalar dependências
cd frontend
npm install

# 2. Build do projeto
npm run build

# 3. Deploy
vercel --prod
```

### Opção 3: Deploy via GitHub

1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente
3. O deploy será automático a cada push

## 📁 Estrutura do Projeto

```
las-tortillas-vercel/
├── frontend/           # Aplicação React
│   ├── src/
│   ├── public/
│   └── package.json
├── api/               # APIs do backend
│   ├── auth/          # APIs de autenticação
│   │   ├── login.ts
│   │   ├── register.ts
│   │   ├── logout.ts
│   │   ├── user.ts
│   │   └── admin/
│   │       └── users.ts
│   ├── menu/
│   ├── orders/
│   └── upload/
├── shared/            # Código compartilhado
│   ├── schema.ts
│   ├── supabase.ts
│   ├── auth.ts
│   └── db.ts
└── vercel.json        # Configuração do Vercel
```

## 🔍 Verificação do Deploy

### 1. Testar APIs
```bash
# Testar endpoint de menu
curl https://seu-dominio.vercel.app/api/menu/items

# Testar endpoint de pedidos
curl -X POST https://seu-dominio.vercel.app/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Testar autenticação
curl -X POST https://seu-dominio.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","name":"Test User"}'

curl -X POST https://seu-dominio.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# Testar menu
curl https://seu-dominio.vercel.app/api/menu/items
curl https://seu-dominio.vercel.app/api/menu/categories
curl -X POST https://seu-dominio.vercel.app/api/menu/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Taco Mexicano","description":"Taco tradicional","price":"15.00","category":"Tacos"}'
```

### 2. Verificar Logs
```bash
vercel logs
```

### 3. Monitoramento
- Acesse o dashboard do Vercel
- Monitore Function Logs
- Verifique Analytics

## 🛠️ Troubleshooting

### Problema: Build falha
```bash
# Verificar dependências
npm install

# Limpar cache
npm run build -- --force

# Verificar TypeScript
npx tsc --noEmit
```

### Problema: APIs não funcionam
1. Verificar variáveis de ambiente
2. Testar conexão com Supabase
3. Verificar logs no Vercel

### Problema: Imagens não carregam
1. Verificar configuração do Supabase Storage
2. Verificar permissões de bucket
3. Testar upload manual

## 📊 Performance

### Otimizações Implementadas:
- ✅ Code splitting automático
- ✅ Lazy loading de imagens
- ✅ Preload de recursos críticos
- ✅ Minificação e compressão
- ✅ Cache otimizado

### Métricas Esperadas:
- **Lighthouse Score**: 90+
- **First Contentful Paint**: < 2s
- **Largest Contentful Paint**: < 3s
- **Time to Interactive**: < 4s

## 🔒 Segurança

### Configurações Implementadas:
- ✅ CORS configurado
- ✅ Headers de segurança
- ✅ Rate limiting (via Vercel)
- ✅ HTTPS obrigatório

## 📞 Suporte

Para problemas técnicos:
1. Verificar logs no Vercel
2. Testar localmente
3. Consultar documentação do Supabase
4. Abrir issue no GitHub

## 🎯 Próximos Passos

1. **Configurar Analytics**
2. **Implementar CDN**
3. **Configurar backups**
4. **Monitoramento avançado**
5. **Testes automatizados**

---

**Status**: ✅ Pronto para Deploy
**Última atualização**: $(date) 