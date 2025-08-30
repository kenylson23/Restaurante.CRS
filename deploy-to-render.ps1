# =========================================================
# DEPLOY AUTOMÁTICO PARA RENDER - LAS TORTILLAS
# =========================================================

Write-Host "🚀 === DEPLOY PARA RENDER - LAS TORTILLAS ===" -ForegroundColor Blue
Write-Host "📋 Este script fará o deploy completo do backend" -ForegroundColor Blue
Write-Host ""

# Functions
function Write-Step {
    param([string]$Message)
    Write-Host "📋 $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# 1. Verificações pré-deploy
Write-Step "PASSO 1: Verificações pré-deploy..."

if (-not (Test-Path "server/dist")) {
    Write-Error "Build não encontrado. Execute .\prepare-render-deploy.ps1 primeiro"
    exit 1
}

if (-not (Test-Path ".git")) {
    Write-Error "Repositório Git não encontrado. Execute .\prepare-git-repo.ps1 primeiro"
    exit 1
}

Write-Success "Verificações iniciais OK"

# 2. Atualizar repositório
Write-Step "PASSO 2: Atualizando repositório Git..."

git add .
$gitStatus = git status --porcelain
if ($gitStatus) {
    git commit -m "Deploy to Render - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    Write-Success "Alterações commitadas"
} else {
    Write-Success "Repositório já atualizado"
}

# Verificar se há remote
$remoteUrl = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Error "Nenhum remote Git configurado"
    Write-Host "📋 Configure primeiro:" -ForegroundColor Yellow
    Write-Host "   git remote add origin URL_DO_SEU_REPO" -ForegroundColor White
    exit 1
}

Write-Success "Remote Git: $remoteUrl"

# 3. Push para repositório
Write-Step "PASSO 3: Fazendo push para repositório..."

git push
if ($LASTEXITCODE -eq 0) {
    Write-Success "Push realizado com sucesso"
} else {
    Write-Error "Falha no push. Verifique credenciais Git."
    exit 1
}

# 4. Instruções de deploy no Render
Write-Step "PASSO 4: Instruções para deploy no Render..."

Write-Host ""
Write-Host "🔧 === CONFIGURAÇÃO NO RENDER ===" -ForegroundColor Green
Write-Host ""

$deployChoice = Read-Host "Você já tem um serviço criado no Render? (y/N)"

if ($deployChoice -match "^[Yy]$") {
    # Serviço existente
    Write-Host "📋 ATUALIZAÇÃO DE SERVIÇO EXISTENTE:" -ForegroundColor Blue
    Write-Host "1. Acesse https://dashboard.render.com" -ForegroundColor White
    Write-Host "2. Selecione seu serviço 'las-tortillas-backend'" -ForegroundColor White
    Write-Host "3. O deploy automático será iniciado" -ForegroundColor White
    Write-Host "4. Aguarde o build completar (~3-5 minutos)" -ForegroundColor White
} else {
    # Novo serviço
    Write-Host "📋 CRIAÇÃO DE NOVO SERVIÇO:" -ForegroundColor Blue
    Write-Host ""
    Write-Host "1️⃣ CRIAR SERVIÇO:" -ForegroundColor Yellow
    Write-Host "   • Acesse: https://dashboard.render.com" -ForegroundColor White
    Write-Host "   • Clique: 'New +' → 'Web Service'" -ForegroundColor White
    Write-Host "   • Conecte: Seu repositório Git" -ForegroundColor White
    Write-Host ""
    Write-Host "2️⃣ CONFIGURAR SERVIÇO:" -ForegroundColor Yellow
    Write-Host "   • Name: las-tortillas-backend" -ForegroundColor White
    Write-Host "   • Environment: Node" -ForegroundColor White
    Write-Host "   • Region: Escolha mais próxima (Ex: Ohio)" -ForegroundColor White
    Write-Host "   • Branch: main (ou sua branch principal)" -ForegroundColor White
    Write-Host "   • Root Directory: server" -ForegroundColor White
    Write-Host "   • Build Command: npm install && npm run build" -ForegroundColor White
    Write-Host "   • Start Command: npm start" -ForegroundColor White
    Write-Host "   • Plan: Starter (grátis)" -ForegroundColor White
}

# 5. Variáveis de ambiente
Write-Host ""
Write-Host "3️⃣ CONFIGURAR VARIÁVEIS DE AMBIENTE:" -ForegroundColor Yellow
Write-Host ""

# Ler o arquivo de variáveis
if (Test-Path "RENDER_ENV_VARS.md") {
    $envContent = Get-Content "RENDER_ENV_VARS.md" -Raw
    Write-Host "📋 VARIÁVEIS NECESSÁRIAS:" -ForegroundColor Blue
    Write-Host ""
    Write-Host "🗃️ DATABASE_URL (OBRIGATÓRIO):" -ForegroundColor Red
    Write-Host "   postgresql://user:pass@host:5432/db" -ForegroundColor White
    Write-Host "   → Obtenha em: https://console.neon.tech" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔐 SUPABASE (Para imagens):" -ForegroundColor Yellow
    Write-Host "   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor White
    Write-Host "   → Obtenha em: https://supabase.com" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔑 JWT_SECRET:" -ForegroundColor Yellow
    Write-Host "   Uma string aleatória com mínimo 32 caracteres" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 CORS_ORIGIN:" -ForegroundColor Yellow
    Write-Host "   https://seu-frontend.vercel.app" -ForegroundColor White
    Write-Host ""
    Write-Host "✅ NODE_ENV=production (automático)" -ForegroundColor Green
    Write-Host "✅ PORT=10000 (automático)" -ForegroundColor Green
}

Write-Host ""
$envConfigured = Read-Host "Configurou todas as variáveis de ambiente? (y/N)"

if ($envConfigured -notmatch "^[Yy]$") {
    Write-Warning "Configure as variáveis antes de continuar"
    Write-Host "📋 Leia o arquivo: RENDER_ENV_VARS.md" -ForegroundColor Yellow
    exit 1
}

# 6. Iniciar deploy
Write-Host ""
Write-Host "4️⃣ INICIAR DEPLOY:" -ForegroundColor Yellow

$startDeploy = Read-Host "Abrir dashboard do Render para iniciar deploy? (Y/n)"

if ($startDeploy -notmatch "^[Nn]$") {
    Write-Step "Abrindo dashboard do Render..."
    Start-Process "https://dashboard.render.com"
}

# 7. Informações pós-deploy
Write-Host ""
Write-Host "🎉 === DEPLOY INICIADO! ===" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Blue
Write-Host ""
Write-Host "1️⃣ AGUARDAR BUILD (~3-5 minutos)" -ForegroundColor Yellow
Write-Host "   • Acompanhe logs no dashboard" -ForegroundColor White
Write-Host "   • Procure por erros de build" -ForegroundColor White
Write-Host ""
Write-Host "2️⃣ TESTAR DEPLOY:" -ForegroundColor Yellow
Write-Host "   • Aguarde status 'Live'" -ForegroundColor White
Write-Host "   • Teste: https://seu-backend.onrender.com/api/health" -ForegroundColor White
Write-Host "   • Deve retornar: {'status': 'healthy'}" -ForegroundColor White
Write-Host ""
Write-Host "3️⃣ CONFIGURAR FRONTEND:" -ForegroundColor Yellow
Write-Host "   • Atualize VITE_API_URL no frontend" -ForegroundColor White
Write-Host "   • Deploy do frontend na Vercel" -ForegroundColor White
Write-Host ""
Write-Host "📞 SUPORTE EM CASO DE PROBLEMAS:" -ForegroundColor Cyan
Write-Host "   • Logs: Dashboard Render → Logs tab" -ForegroundColor White
Write-Host "   • Health check: /api/health endpoint" -ForegroundColor White
Write-Host "   • Variáveis: Environment tab" -ForegroundColor White
Write-Host ""

Write-Success "Deploy iniciado com sucesso! 🚀"
Write-Host ""
Write-Host "📱 URL do serviço será:" -ForegroundColor Cyan
Write-Host "https://las-tortillas-backend.onrender.com" -ForegroundColor White
Write-Host ""