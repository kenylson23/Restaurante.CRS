# 🚀 PLANO COMPLETO DE DEPLOY NO RENDER - LAS TORTILLAS

## 📊 **ANÁLISE COMPLETA DO PROJETO**

### **🏗️ Arquitetura Atual:**
- ✅ **Backend**: Express.js + TypeScript + Node.js
- ✅ **Database**: Neon PostgreSQL + Drizzle ORM
- ✅ **Storage**: Supabase para imagens
- ✅ **Auth**: JWT + Zod validation
- ✅ **Real-time**: SSE + WebSockets
- ✅ **Health Check**: Endpoint implementado

### **📁 Estrutura de Deploy:**
```
Las Tortillas/
├── server/                 # Backend (Deploy no Render)
│   ├── dist/              # Build TypeScript
│   ├── package.json       # Dependências
│   ├── index.ts           # Entry point
│   └── tsconfig.json      # Config TypeScript
├── render.yaml            # Config Render
└── scripts/               # Scripts de deploy
```

---

## 🎯 **PLANO DE EXECUÇÃO PASSO A PASSO**

### **⏱️ TEMPO TOTAL ESTIMADO: 2-3 HORAS**

---

## **FASE 1: PREPARAÇÃO (30 min)**

### **1.1 Executar Preparação Automática**
```powershell
# Execute na raiz do projeto
.\prepare-render-deploy.ps1
```

**O que este script faz:**
- ✅ Instala dependências do servidor
- ✅ Testa build TypeScript
- ✅ Valida inicialização do servidor
- ✅ Verifica configuração render.yaml
- ✅ Cria documentação de variáveis

### **1.2 Preparar Repositório Git**
```powershell
# Execute na raiz do projeto
.\prepare-git-repo.ps1
```

**O que este script faz:**
- ✅ Inicializa Git (se necessário)
- ✅ Configura .gitignore
- ✅ Faz commit das alterações
- ✅ Verifica remote origin

---

## **FASE 2: CONFIGURAÇÃO DE SERVIÇOS (45 min)**

### **2.1 Configurar Neon Database**

1. **Acesse [Neon Console](https://console.neon.tech)**
2. **Crie projeto ou use existente**
3. **Copie connection string:**
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb
   ```
4. **Salve para usar no Render**

### **2.2 Configurar Supabase (Opcional)**

1. **Acesse [Supabase](https://supabase.com)**
2. **Crie projeto ou use existente**
3. **Obtenha credenciais:**
   - Project URL
   - Anon Key
   - Service Role Key

---

## **FASE 3: DEPLOY NO RENDER (60 min)**

### **3.1 Executar Deploy Automático**
```powershell
# Execute na raiz do projeto
.\deploy-to-render.ps1
```

### **3.2 Configuração Manual no Render**

1. **Acesse [Render Dashboard](https://dashboard.render.com)**

2. **Criar Web Service:**
   - **New +** → **Web Service**
   - **Connect Repository** (GitHub/GitLab)
   - **Select Repository**: seu repositório

3. **Configurar Serviço:**
   ```
   Name: las-tortillas-backend
   Environment: Node
   Region: Ohio (US East)
   Branch: main
   Root Directory: server
   Build Command: npm install && npm run build
   Start Command: npm start
   Plan: Starter (Free)
   ```

4. **Configurar Variáveis de Ambiente:**
   ```env
   # OBRIGATÓRIAS
   DATABASE_URL=postgresql://user:pass@host:5432/db
   JWT_SECRET=sua-chave-secreta-minimo-32-chars
   
   # SUPABASE (Para imagens)
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_ANON_KEY=sua-anon-key
   SUPABASE_SERVICE_ROLE_KEY=sua-service-key
   
   # CORS (Será o URL do frontend)
   CORS_ORIGIN=https://seu-frontend.vercel.app
   
   # AUTOMÁTICAS (já configuradas)
   NODE_ENV=production
   PORT=10000
   ```

5. **Iniciar Deploy:**
   - **Create Web Service**
   - **Aguardar build** (~3-5 minutos)

---

## **FASE 4: VALIDAÇÃO (30 min)**

### **4.1 Testar Health Check**
```bash
# Substitua pela sua URL do Render
curl https://las-tortillas-backend.onrender.com/api/health
```

**Resposta esperada:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "version": "v20.x.x",
  "environment": "production"
}
```

### **4.2 Testar APIs Principais**
```bash
# Menu items
curl https://sua-url.onrender.com/api/menu-items

# Orders
curl https://sua-url.onrender.com/api/orders

# Tables
curl https://sua-url.onrender.com/api/tables
```

---

## **FASE 5: CONFIGURAÇÃO FRONTEND (15 min)**

### **5.1 Atualizar Variáveis do Frontend**
No seu projeto frontend, configure:
```env
VITE_API_URL=https://las-tortillas-backend.onrender.com
```

### **5.2 Deploy Frontend na Vercel**
Execute os scripts existentes no diretório `las-tortillas-vercel/`:
```powershell
cd las-tortillas-vercel
.\deploy-frontend-vercel.ps1
```

---

## 🛠️ **TROUBLESHOOTING**

### **❌ Problema: Build Falha**
**Sintomas:** Erro no build do TypeScript
**Soluções:**
1. Verificar `server/tsconfig.json`
2. Executar `npm run build` localmente
3. Verificar dependências em `server/package.json`

### **❌ Problema: Servidor Não Inicia**
**Sintomas:** Crash loop, não responde na porta
**Soluções:**
1. Verificar logs no dashboard Render
2. Testar variável `DATABASE_URL`
3. Verificar se `dotenv` está instalado

### **❌ Problema: Erro de Database**
**Sintomas:** `Missing DATABASE_URL` ou connection timeout
**Soluções:**
1. Verificar string de conexão no Neon
2. Testar conectividade: `telnet host 5432`
3. Verificar variáveis de ambiente no Render

### **❌ Problema: CORS Errors**
**Sintomas:** Frontend não consegue acessar API
**Soluções:**
1. Verificar `CORS_ORIGIN` no Render
2. Verificar `VITE_API_URL` no frontend
3. Testar ambas URLs manualmente

---

## 📋 **CHECKLIST FINAL**

### **✅ Pré-Deploy**
- [ ] Dependências instaladas (`npm install`)
- [ ] Build TypeScript funciona (`npm run build`)
- [ ] Servidor inicia localmente (`npm start`)
- [ ] Repositório Git configurado
- [ ] Commit e push realizados

### **✅ Configuração Render**
- [ ] Web Service criado
- [ ] Repositório conectado
- [ ] Build e Start commands corretos
- [ ] Root directory = `server`
- [ ] Todas variáveis de ambiente configuradas

### **✅ Variáveis de Ambiente**
- [ ] `DATABASE_URL` (Neon PostgreSQL)
- [ ] `JWT_SECRET` (mínimo 32 caracteres)
- [ ] `SUPABASE_URL` (se usar imagens)
- [ ] `SUPABASE_ANON_KEY` (se usar imagens)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (se usar imagens)
- [ ] `CORS_ORIGIN` (URL do frontend)
- [ ] `NODE_ENV=production` (automático)
- [ ] `PORT=10000` (automático)

### **✅ Testes Pós-Deploy**
- [ ] Health check responde: `/api/health`
- [ ] APIs funcionam: `/api/menu-items`, `/api/orders`
- [ ] Frontend consegue acessar backend
- [ ] Upload de imagens funciona (se configurado)
- [ ] Database queries funcionam

### **✅ Integração Frontend**
- [ ] `VITE_API_URL` atualizada
- [ ] Frontend deployed na Vercel
- [ ] CORS configurado corretamente
- [ ] Teste end-to-end funciona

---

## 📞 **SUPORTE E RECURSOS**

### **🔗 Links Úteis:**
- **Render Dashboard**: https://dashboard.render.com
- **Neon Console**: https://console.neon.tech
- **Supabase Dashboard**: https://supabase.com
- **Vercel Dashboard**: https://vercel.com

### **📊 Monitoramento:**
- **Logs**: Dashboard Render → Logs tab
- **Metrics**: Dashboard Render → Metrics tab
- **Health**: `https://sua-url.onrender.com/api/health`

### **🆘 Em Caso de Problemas:**
1. **Verificar logs** no dashboard Render
2. **Testar health check** endpoint
3. **Validar variáveis** de ambiente
4. **Testar conectividade** com database
5. **Executar scripts** de diagnóstico

---

## 🎉 **RESULTADO FINAL**

Após seguir este plano, você terá:

- ✅ **Backend funcionando** no Render
- ✅ **Database conectado** (Neon PostgreSQL)
- ✅ **APIs respondendo** corretamente
- ✅ **Health check** ativo para monitoramento
- ✅ **CORS configurado** para frontend
- ✅ **SSL automático** (HTTPS)
- ✅ **Deploy automático** em pushes Git
- ✅ **Logs e métricas** disponíveis

**URL do seu backend**: `https://las-tortillas-backend.onrender.com`

---

**🚀 Pronto para o deploy! Siga os scripts em ordem e seu Las Tortillas estará no ar!**