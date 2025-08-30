# 🔧 CONFIGURAÇÃO COMPLETA PARA RENDER - LAS TORTILLAS

## 🚨 **PROBLEMAS IDENTIFICADOS E CORRIGIDOS:**

### **1. Arquivo server/index.ts Corrompido ✅**
**Problema**: Variáveis de ambiente misturadas com código TypeScript
**Solução**: Arquivo completamente limpo e corrigido

### **2. Dependência cross-env ✅**
**Problema**: `cross-env: not found` em ambiente Linux
**Solução**: Removido de todos os scripts

### **3. Configuração render.yaml ✅**
**Problema**: Comando de start incorreto
**Solução**: Comando direto para Linux

---

## 📋 **CONFIGURAÇÃO ATUAL DO RENDER:**

### **A. Arquivo: `render.yaml`**
```yaml
services:
  - type: web
    name: las-tortillas-backend
    runtime: node
    plan: starter
    buildCommand: cd server && npm install && npm run build
    startCommand: cd server && NODE_ENV=production node dist/index.js
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_ANON_KEY
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: CORS_ORIGIN
        sync: false
    healthCheckPath: /api/health
    autoDeploy: true
```

### **B. Arquivo: `server/package.json`**
```json
{
  "name": "las-tortillas-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "NODE_ENV=production node dist/index.js",
    "dev": "tsx index.ts"
  },
  "dependencies": {
    // ... dependências corretas
  }
}
```

### **C. Arquivo: `server/tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": false,
    "outDir": "dist",
    "rootDir": ".",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": false,
    "noEmit": false,
    "isolatedModules": true
  },
  "include": ["*.ts", "**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 🔑 **VARIÁVEIS DE AMBIENTE OBRIGATÓRIAS:**

### **Configure no Dashboard do Render:**

1. **DATABASE_URL** (OBRIGATÓRIO)
```
postgresql://neondb_owner:npg_EYcsdnj5DG8Z@ep-steep-pine-adqiu0t1-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

2. **JWT_SECRET** (OBRIGATÓRIO)
```
chave-super-secreta-local-production-123456789012
```

3. **NODE_ENV** (OBRIGATÓRIO)
```
production
```

4. **PORT** (OBRIGATÓRIO)
```
10000
```

### **Opcionais (se usar Supabase):**
```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service
```

### **Para CORS (após deploy do frontend):**
```
CORS_ORIGIN=https://seu-frontend.vercel.app
```

---

## 🚀 **PROCESSO DE DEPLOY:**

### **1. Build Process:**
```bash
cd server
npm install
npm run build  # TypeScript → JavaScript
```

### **2. Start Process:**
```bash
cd server
NODE_ENV=production node dist/index.js
```

### **3. Health Check:**
- **Endpoint**: `/api/health`
- **URL**: `https://las-tortillas-api.onrender.com/api/health`
- **Response esperada**:
```json
{
  "status": "healthy",
  "timestamp": "2024-08-30T22:30:00.000Z",
  "uptime": 120.45,
  "version": "v20.x.x",
  "environment": "production"
}
```

---

## 📱 **ARQUITETURA DO DEPLOYMENT:**

```
GitHub Repository
        ↓
    Render Auto-Deploy
        ↓
    Build: cd server && npm install && npm run build
        ↓
    Start: cd server && NODE_ENV=production node dist/index.js
        ↓
    Server: https://las-tortillas-api.onrender.com
```

---

## 🔍 **VERIFICAÇÃO FINAL:**

### **A. Arquivos Críticos Verificados:**
- ✅ `server/index.ts` - Limpo e funcional
- ✅ `server/package.json` - Scripts corretos
- ✅ `server/tsconfig.json` - Configuração válida
- ✅ `render.yaml` - Comandos corretos

### **B. Estrutura de Diretórios:**
```
Restaurante.CRS/
├── server/
│   ├── index.ts ✅ (corrigido)
│   ├── package.json ✅ (sem cross-env)
│   ├── tsconfig.json ✅ (configuração correta)
│   ├── routes.ts ✅
│   └── dist/ (gerado no build)
├── render.yaml ✅ (comando correto)
└── .env.local (apenas local)
```

### **C. Dependências Necessárias:**
- ✅ `express` - Servidor web
- ✅ `cors` - CORS policy
- ✅ `typescript` - Compilação
- ✅ `tsx` - Desenvolvimento
- ✅ Todas as outras dependências do projeto

---

## ⚡ **COMANDOS DE TESTE:**

### **Testar Localmente:**
```bash
cd server
npm install
npm run build
npm start
```

### **Testar no Render:**
```bash
curl https://las-tortillas-api.onrender.com/api/health
```

### **PowerShell Test:**
```powershell
Invoke-RestMethod -Uri "https://las-tortillas-api.onrender.com/api/health"
```

---

## 🎯 **STATUS ATUAL:**

- ✅ **Código corrigido** - server/index.ts limpo
- ✅ **Scripts corrigidos** - sem cross-env
- ✅ **Push realizado** - alterações no GitHub
- ⏳ **Deploy em progresso** - Render está processando
- 🕐 **Tempo estimado** - 3-5 minutos para completar

---

## 📞 **TROUBLESHOOTING:**

### **Se Build Falhar:**
1. Verificar logs no Render Dashboard
2. Confirmar que `server/index.ts` não tem erros de sintaxe
3. Verificar se `server/package.json` tem todas as dependências

### **Se Start Falhar:**
1. Verificar variáveis de ambiente no dashboard
2. Confirmar que `DATABASE_URL` está correto
3. Verificar se `JWT_SECRET` tem pelo menos 32 caracteres

### **Se Health Check Falhar:**
1. Aguardar alguns minutos após deploy
2. Verificar se a porta 10000 está configurada
3. Testar com curl ou navegador

---

**Última Atualização**: 2024-08-30 22:30
**Status**: Aguardando conclusão do deploy
**Próximo Step**: Testar health check em 2-3 minutos