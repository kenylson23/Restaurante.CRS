# 🚀 GUIA COMPLETO DE DEPLOY - LAS TORTILLAS

## 📋 Visão Geral da Arquitetura

```
🌐 FRONTEND (Vercel)          🖥️ BACKEND (Render)          🗃️ DATABASE (Neon)
├── React + TypeScript        ├── Node.js + Express        ├── PostgreSQL
├── Vite Build               ├── API Routes               ├── Drizzle ORM
├── Tailwind CSS             ├── Authentication           ├── Connection Pool
└── Static Assets            └── Image Upload             └── SSL Required
```

---

## 🎯 RESUMO DO QUE FOI CRIADO

### ✅ **Scripts de Migração Robustos**
- `test-neon-connection.ts` - Testa conectividade com múltiplas variações
- `migrate-neon-robust.ts` - Migração completa com error handling
- `setup-production.ps1/sh` - Setup automático completo

### ✅ **Configurações de Deploy**
- Backend adaptado para Render com TypeScript build
- Frontend otimizado para Vercel
- Health check endpoint para monitoramento
- CORS configurado para produção

### ✅ **Templates de Ambiente**
- `.env.template` com todas as variáveis necessárias
- Documentação completa de configuração

---

## 🚀 PLANO DE EXECUÇÃO PASSO A PASSO

### **PASSO 1: PREPARAÇÃO DO AMBIENTE**

1. **Configure o arquivo de ambiente:**
   ```bash
   cd las-tortillas-vercel
   cp .env.template .env.local
   # Edite .env.local com suas credenciais
   ```

2. **Execute o setup automático:**
   ```bash
   # Windows
   cd frontend
   .\setup-production.ps1

   # Linux/Mac
   cd frontend
   ./setup-production.sh
   ```

### **PASSO 2: CONFIGURAÇÃO DO NEON DATABASE**

1. **Acesse [Neon Console](https://console.neon.tech)**
2. **Crie um novo projeto** ou use existente
3. **Copie a connection string:**
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb
   ```
4. **Cole no .env.local:**
   ```env
   DATABASE_URL=sua_connection_string_aqui
   ```

### **PASSO 3: DEPLOY DO BACKEND NO RENDER**

1. **Acesse [Render Dashboard](https://dashboard.render.com)**

2. **Crie um novo Web Service:**
   - Connect Git Repository
   - Selecione seu repositório
   - Configure:
     ```
     Name: las-tortillas-backend
     Environment: Node
     Branch: main (ou sua branch)
     Root Directory: server
     Build Command: npm install && npm run build
     Start Command: npm start
     ```

3. **Configure variáveis de ambiente no Render:**
   ```env
   DATABASE_URL=sua_url_neon_aqui
   NODE_ENV=production
   PORT=10000
   SUPABASE_URL=sua_url_supabase
   SUPABASE_ANON_KEY=sua_anon_key
   SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
   JWT_SECRET=sua_chave_secreta_min_32_chars
   CORS_ORIGIN=https://seu-frontend.vercel.app
   ```

4. **Deploy e teste:**
   - Aguarde o build completar
   - Teste: `https://seu-backend.onrender.com/api/health`

### **PASSO 4: DEPLOY DO FRONTEND NA VERCEL**

1. **Acesse [Vercel Dashboard](https://vercel.com/dashboard)**

2. **Importe repositório:**
   - Import Git Repository
   - Selecione seu repositório
   - Configure:
     ```
     Project Name: las-tortillas-frontend
     Framework Preset: Vite
     Root Directory: las-tortillas-vercel/frontend
     Build Command: npm run build
     Output Directory: dist
     Install Command: npm install
     ```

3. **Configure variáveis de ambiente na Vercel:**
   ```env
   VITE_API_URL=https://seu-backend.onrender.com
   SUPABASE_URL=sua_url_supabase
   SUPABASE_ANON_KEY=sua_anon_key
   NODE_ENV=production
   ```

4. **Deploy e teste:**
   - Deploy automático será executado
   - Teste: `https://seu-frontend.vercel.app`

### **PASSO 5: CONFIGURAÇÃO FINAL**

1. **Atualize CORS no backend:**
   - No Render, adicione a variável:
   ```env
   CORS_ORIGIN=https://seu-frontend.vercel.app
   ```

2. **Teste todas as funcionalidades:**
   - Acesso à aplicação
   - Login de admin/cozinha
   - Criação de pedidos
   - Gestão de cardápio
   - Upload de imagens

---

## 🔧 TROUBLESHOOTING

### ❌ **Problema: Erro de conexão com Neon**
```bash
# Execute o teste de conexão
npm run test-neon-connection
```
**Soluções:**
- Verificar URL do banco no dashboard Neon
- Testar conectividade de rede
- Verificar credenciais

### ❌ **Problema: Build falha no Render**
**Soluções:**
- Verificar logs no dashboard Render
- Verificar Node.js version (use 18+)
- Verificar package.json scripts

### ❌ **Problema: CORS errors**
**Soluções:**
- Verificar CORS_ORIGIN no backend
- Verificar VITE_API_URL no frontend
- Verificar URLs nos dashboards

### ❌ **Problema: Imagens não carregam**
**Soluções:**
- Verificar configuração Supabase Storage
- Verificar permissões de bucket
- Verificar URLs das imagens

---

## 📊 MONITORAMENTO E LOGS

### **Render Backend:**
- Logs: https://dashboard.render.com/web/[service-id]/logs
- Metrics: https://dashboard.render.com/web/[service-id]/metrics
- Health: https://seu-backend.onrender.com/api/health

### **Vercel Frontend:**
- Logs: https://vercel.com/dashboard/deployments
- Analytics: https://vercel.com/analytics
- Performance: Vercel Speed Insights

### **Neon Database:**
- Dashboard: https://console.neon.tech
- Monitoring: Built-in monitoring no dashboard
- Queries: Query history no dashboard

---

## 🎯 CHECKLIST DE DEPLOY

### **Pré-Deploy:**
- [ ] Neon database criado e configurado
- [ ] Arquivo .env.local preenchido
- [ ] Scripts de migração executados com sucesso
- [ ] Repositório GitHub atualizado

### **Backend (Render):**
- [ ] Web Service criado
- [ ] Build command configurado
- [ ] Start command configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Health check retorna 200
- [ ] Logs não mostram erros críticos

### **Frontend (Vercel):**
- [ ] Projeto importado
- [ ] Root directory configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Build executa com sucesso
- [ ] Site carrega corretamente

### **Testes Finais:**
- [ ] Login de administrador funciona
- [ ] Login da cozinha funciona
- [ ] Criação de pedidos funciona
- [ ] Upload de imagens funciona
- [ ] Todas as APIs respondem
- [ ] Não há erros no console

---

## 📞 SUPORTE E RECURSOS

### **Documentação:**
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Neon Docs](https://neon.tech/docs)

### **Dashboards:**
- [Render](https://dashboard.render.com)
- [Vercel](https://vercel.com/dashboard)
- [Neon](https://console.neon.tech)

### **Monitoring:**
- Backend Health: `/api/health`
- Frontend Performance: Vercel Analytics
- Database: Neon Monitoring

---

## 🎉 CONCLUSÃO

Após seguir este guia, você terá:

1. ✅ **Frontend na Vercel** - Rápido e global
2. ✅ **Backend no Render** - Escalável e confiável
3. ✅ **Database no Neon** - PostgreSQL serverless
4. ✅ **Monitoramento completo** - Logs e métricas
5. ✅ **Deploy automatizado** - CI/CD configurado

**Sua aplicação estará pronta para produção!** 🚀