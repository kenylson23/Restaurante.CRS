# 🎯 CONFIGURAÇÃO FINAL RENDER - LAS TORTILLAS

## 🔧 **CONFIGURAÇÃO CORRIGIDA:**

### **PRINCIPAIS MUDANÇAS:**

1. **✅ rootDir: server** - Render executa comandos apenas na pasta server
2. **✅ Nome correto: las-tortillas-api** - Coincide com URL atual
3. **✅ Comandos simplificados** - npm install && npm run build
4. **✅ Variáveis mínimas** - Apenas as essenciais

---

## 📋 **ARQUIVO: render.yaml**

```yaml
services:
  - type: web
    name: las-tortillas-api
    runtime: node
    plan: starter
    rootDir: server
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
    healthCheckPath: /api/health
    autoDeploy: true
```

---

## 🔑 **VARIÁVEIS DE AMBIENTE OBRIGATÓRIAS:**

### **Configure no Dashboard Render:**

1. **DATABASE_URL**
```
postgresql://neondb_owner:npg_EYcsdnj5DG8Z@ep-steep-pine-adqiu0t1-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

2. **JWT_SECRET**
```
chave-super-secreta-local-production-123456789012
```

**NODE_ENV** e **PORT** já estão configurados no YAML.

---

## 📁 **ESTRUTURA ESPERADA PELO RENDER:**

```
Repositório GitHub
│
└── server/                    ← rootDir
    ├── package.json          ← npm install aqui
    ├── tsconfig.json         ← tsc build aqui  
    ├── index.ts              ← arquivo principal
    ├── dist/                 ← saída do build
    │   └── index.js          ← npm start executa este
    └── node_modules/         ← dependências
```

---

## ⚡ **FLUXO DE DEPLOYMENT:**

### **1. Build Process:**
```bash
cd server                     # rootDir definido
npm install                   # instala dependências
npm run build                 # tsc compila TS → JS
```

### **2. Start Process:**
```bash
npm start                     # executa script start
# que roda: NODE_ENV=production node dist/index.js
```

### **3. Health Check:**
```
GET /api/health
```

---

## 🎯 **VANTAGENS DESTA CONFIGURAÇÃO:**

1. **✅ Simples** - Menos comandos, menos erros
2. **✅ Padrão** - Usa npm scripts nativos
3. **✅ Correto** - rootDir aponta para server/
4. **✅ Limpo** - Apenas variáveis essenciais
5. **✅ Compatível** - Nome coincide com URL atual

---

## 📞 **TROUBLESHOOTING:**

### **Se Build Falhar:**
- Verificar se `server/package.json` tem todas as dependências
- Confirmar que `typescript` está em devDependencies
- Verificar se `server/tsconfig.json` está correto

### **Se Start Falhar:**
- Verificar variáveis DATABASE_URL e JWT_SECRET no dashboard
- Confirmar que `dist/index.js` foi gerado no build
- Verificar logs para erros de conexão com banco

### **Se Health Check Falhar:**
- Aguardar 2-3 minutos após deploy completo
- Testar manualmente: https://las-tortillas-api.onrender.com/api/health
- Verificar se PORT=10000 está configurado

---

## 📱 **COMANDOS DE TESTE:**

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

---

**CONFIGURAÇÃO FINAL APLICADA - PRONTA PARA DEPLOY!**