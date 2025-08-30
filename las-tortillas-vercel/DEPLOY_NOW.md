# 🚀 DEPLOY AGORA - LAS TORTILLAS
## *Instruções para execução imediata*

---

## ✨ **O QUE JÁ ESTÁ PRONTO**

✅ **Scripts de migração robustos criados**  
✅ **Backend adaptado para Render**  
✅ **Frontend otimizado para Vercel**  
✅ **Configurações de ambiente completas**  
✅ **Sistema de health check implementado**  
✅ **API de integração frontend/backend criada**  

---

## 🎯 **EXECUTE AGORA - 3 PASSOS SIMPLES**

### **PASSO 1: CONFIGURE O AMBIENTE (5 minutos)**

```bash
# 1. Entre no diretório
cd las-tortillas-vercel

# 2. Copie o template
copy .env.template .env.local
# ou no Linux/Mac: cp .env.template .env.local

# 3. Edite o .env.local com suas credenciais
notepad .env.local
# ou no Linux/Mac: nano .env.local
```

**Configure estas variáveis no .env.local:**
```env
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb
SUPABASE_URL=https://seu-project.supabase.co
SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
VITE_API_URL=https://seu-backend.onrender.com
```

### **PASSO 2: EXECUTE O SETUP AUTOMÁTICO (10 minutos)**

```bash
# Entre no frontend
cd frontend

# Execute o setup (Windows)
powershell -ExecutionPolicy Bypass -File ../setup-production.ps1

# Execute o setup (Linux/Mac)
chmod +x ../setup-production.sh
../setup-production.sh
```

**O script fará automaticamente:**
- ✅ Instalar dependências
- ✅ Testar conexão com Neon
- ✅ Executar migração do banco
- ✅ Build do frontend

### **PASSO 3: DEPLOY EM PRODUÇÃO (15 minutos)**

#### **3A. Deploy Backend no Render**

1. **Acesse:** https://dashboard.render.com
2. **Clique:** "New +" → "Web Service"
3. **Configure:**
   ```
   Name: las-tortillas-backend
   Environment: Node
   Branch: main
   Root Directory: server
   Build Command: npm install && npm run build
   Start Command: npm start
   ```
4. **Adicione variáveis de ambiente:**
   ```
   DATABASE_URL=sua_url_neon
   NODE_ENV=production
   PORT=10000
   SUPABASE_URL=sua_url_supabase
   SUPABASE_ANON_KEY=sua_anon_key
   SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
   JWT_SECRET=uma_chave_secreta_min_32_chars
   ```
5. **Deploy** e aguarde

#### **3B. Deploy Frontend na Vercel**

1. **Acesse:** https://vercel.com/dashboard
2. **Clique:** "Import Project"
3. **Configure:**
   ```
   Project Name: las-tortillas-frontend
   Framework: Vite
   Root Directory: las-tortillas-vercel/frontend
   Build Command: npm run build
   Output Directory: dist
   ```
4. **Adicione variáveis de ambiente:**
   ```
   VITE_API_URL=https://seu-backend.onrender.com
   SUPABASE_URL=sua_url_supabase
   SUPABASE_ANON_KEY=sua_anon_key
   NODE_ENV=production
   ```
5. **Deploy** e aguarde

---

## 🔍 **TESTE FINAL (5 minutos)**

1. **Teste Backend:** https://seu-backend.onrender.com/api/health
2. **Teste Frontend:** https://seu-frontend.vercel.app
3. **Teste Login:** Use as credenciais do sistema
4. **Teste Funcionalidades:**
   - ✅ Login admin/cozinha
   - ✅ Criação de pedidos
   - ✅ Gestão de cardápio
   - ✅ Upload de imagens

---

## 🚨 **RESOLUÇÃO RÁPIDA DE PROBLEMAS**

### ❌ **Erro de conexão com Neon:**
```bash
npm run test-neon-connection
```
- Verifique URL no dashboard Neon
- Teste conectividade de rede

### ❌ **Build falha no Render:**
- Verifique logs no dashboard Render
- Confirme Node.js 18+ no package.json engines

### ❌ **CORS errors:**
- Adicione sua URL Vercel no CORS_ORIGIN do backend
- Verifique VITE_API_URL no frontend

### ❌ **Imagens não carregam:**
- Verifique configuração Supabase Storage
- Confirme permissões de bucket

---

## 📊 **MONITORAMENTO**

### **URLs Importantes:**
- 🖥️ **Backend Health:** https://seu-backend.onrender.com/api/health
- 🌐 **Frontend:** https://seu-frontend.vercel.app
- 📊 **Render Logs:** https://dashboard.render.com
- 📈 **Vercel Analytics:** https://vercel.com/dashboard
- 🗃️ **Neon Dashboard:** https://console.neon.tech

### **Credenciais de Teste:**
```
Admin: admin@lastortilhas.ao / admin123
Cozinha: cozinha@lastortilhas.ao / cozinha123
```

---

## 🎉 **DEPOIS DO DEPLOY**

### **Próximos Passos Opcionais:**
- [ ] Configurar domínio personalizado na Vercel
- [ ] Configurar SSL custom no Render
- [ ] Configurar alertas de monitoramento
- [ ] Configurar backup automático do Neon
- [ ] Configurar CI/CD automático

### **Melhorias Futuras:**
- [ ] Cache Redis para performance
- [ ] CDN para imagens
- [ ] Monitoring com Sentry
- [ ] Analytics avançados

---

## 📞 **SUPORTE IMEDIATO**

### **Recursos de Ajuda:**
- 📚 [Render Docs](https://render.com/docs)
- 📚 [Vercel Docs](https://vercel.com/docs)  
- 📚 [Neon Docs](https://neon.tech/docs)

### **Logs e Debug:**
- **Render:** Dashboard → Services → Logs
- **Vercel:** Dashboard → Deployments → Function Logs
- **Neon:** Console → Monitoring

---

## ✅ **CHECKLIST FINAL**

**Antes de considerar concluído:**
- [ ] Backend responde em /api/health
- [ ] Frontend carrega sem erros
- [ ] Login de admin funciona
- [ ] Login de cozinha funciona
- [ ] Criação de pedidos funciona
- [ ] Upload de imagens funciona
- [ ] Não há erros no console do navegador
- [ ] Logs do Render não mostram erros críticos

---

## 🚀 **RESULTADO ESPERADO**

Após seguir estes passos você terá:

✅ **Aplicação completa em produção**  
✅ **Frontend rápido e global (Vercel)**  
✅ **Backend escalável (Render)**  
✅ **Database confiável (Neon)**  
✅ **Monitoramento ativo**  
✅ **Deploy automatizado**  

**Sua aplicação estará 100% pronta para receber clientes reais!**

---

*⏰ Tempo total estimado: **30-45 minutos***