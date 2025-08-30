# =========================================================
# DEPLOY AUTOMATICO PARA RENDER - LAS TORTILLAS
# =========================================================

Write-Host "Iniciando deploy para Render - Las Tortillas" -ForegroundColor Blue
Write-Host "Este script fara o deploy completo do backend" -ForegroundColor Blue
Write-Host ""

# Functions
function Write-Step {
    param([string]$Message)
    Write-Host "PASSO: $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "OK: $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "AVISO: $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "ERRO: $Message" -ForegroundColor Red
}

# 1. Verificacoes pre-deploy
Write-Step "Verificacoes pre-deploy..."

if (-not (Test-Path "server/dist")) {
    Write-Error "Build nao encontrado. Execute primeiro o build do servidor"
    exit 1
}

if (-not (Test-Path ".git")) {
    Write-Error "Repositorio Git nao encontrado"
    exit 1
}

Write-Success "Verificacoes iniciais OK"

# 2. Atualizar repositorio
Write-Step "Atualizando repositorio Git..."

git add .
$gitStatus = git status --porcelain
if ($gitStatus) {
    git commit -m "Deploy to Render - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    Write-Success "Alteracoes commitadas"
} else {
    Write-Success "Repositorio ja atualizado"
}

# Verificar se ha remote
try {
    $remoteUrl = git remote get-url origin 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Nenhum remote Git configurado"
        Write-Host "Configure primeiro:" -ForegroundColor Yellow
        Write-Host "   git remote add origin URL_DO_SEU_REPO" -ForegroundColor White
        exit 1
    }
    Write-Success "Remote Git: $remoteUrl"
} catch {
    Write-Error "Erro ao verificar remote Git"
    exit 1
}

# 3. Push para repositorio
Write-Step "Fazendo push para repositorio..."

git push
if ($LASTEXITCODE -eq 0) {
    Write-Success "Push realizado com sucesso"
} else {
    Write-Error "Falha no push. Verifique credenciais Git."
    exit 1
}

# 4. Instrucoes de deploy no Render
Write-Step "Instrucoes para deploy no Render..."

Write-Host ""
Write-Host "CONFIGURACAO NO RENDER" -ForegroundColor Green
Write-Host ""

$deployChoice = Read-Host "Voce ja tem um servico criado no Render? (y/N)"

if ($deployChoice -match "^[Yy]$") {
    # Servico existente
    Write-Host "ATUALIZACAO DE SERVICO EXISTENTE:" -ForegroundColor Blue
    Write-Host "1. Acesse https://dashboard.render.com" -ForegroundColor White
    Write-Host "2. Selecione seu servico 'las-tortillas-backend'" -ForegroundColor White
    Write-Host "3. O deploy automatico sera iniciado" -ForegroundColor White
    Write-Host "4. Aguarde o build completar (3-5 minutos)" -ForegroundColor White
} else {
    # Novo servico
    Write-Host "CRIACAO DE NOVO SERVICO:" -ForegroundColor Blue
    Write-Host ""
    Write-Host "1. CRIAR SERVICO:" -ForegroundColor Yellow
    Write-Host "   - Acesse: https://dashboard.render.com" -ForegroundColor White
    Write-Host "   - Clique: 'New +' -> 'Web Service'" -ForegroundColor White
    Write-Host "   - Conecte: Seu repositorio Git" -ForegroundColor White
    Write-Host ""
    Write-Host "2. CONFIGURAR SERVICO:" -ForegroundColor Yellow
    Write-Host "   - Name: las-tortillas-backend" -ForegroundColor White
    Write-Host "   - Environment: Node" -ForegroundColor White
    Write-Host "   - Region: Escolha mais proxima (Ex: Ohio)" -ForegroundColor White
    Write-Host "   - Branch: main (ou sua branch principal)" -ForegroundColor White
    Write-Host "   - Root Directory: server" -ForegroundColor White
    Write-Host "   - Build Command: npm install && npm run build" -ForegroundColor White
    Write-Host "   - Start Command: npm start" -ForegroundColor White
    Write-Host "   - Plan: Starter (gratis)" -ForegroundColor White
}

# 5. Variaveis de ambiente
Write-Host ""
Write-Host "3. CONFIGURAR VARIAVEIS DE AMBIENTE:" -ForegroundColor Yellow
Write-Host ""
Write-Host "VARIAVEIS NECESSARIAS:" -ForegroundColor Blue
Write-Host ""
Write-Host "DATABASE_URL (OBRIGATORIO):" -ForegroundColor Red
Write-Host "   postgresql://user:pass@host:5432/db" -ForegroundColor White
Write-Host "   -> Obtenha em: https://console.neon.tech" -ForegroundColor Cyan
Write-Host ""
Write-Host "SUPABASE (Para imagens):" -ForegroundColor Yellow
Write-Host "   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor White
Write-Host "   -> Obtenha em: https://supabase.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "JWT_SECRET:" -ForegroundColor Yellow
Write-Host "   Uma string aleatoria com minimo 32 caracteres" -ForegroundColor White
Write-Host ""
Write-Host "CORS_ORIGIN:" -ForegroundColor Yellow
Write-Host "   https://seu-frontend.vercel.app" -ForegroundColor White
Write-Host ""
Write-Host "NODE_ENV=production (automatico)" -ForegroundColor Green
Write-Host "PORT=10000 (automatico)" -ForegroundColor Green

Write-Host ""
$envConfigured = Read-Host "Configurou todas as variaveis de ambiente? (y/N)"

if ($envConfigured -notmatch "^[Yy]$") {
    Write-Warning "Configure as variaveis antes de continuar"
    Write-Host "Leia o arquivo: RENDER_ENV_VARS.md" -ForegroundColor Yellow
    exit 1
}

# 6. Iniciar deploy
Write-Host ""
Write-Host "4. INICIAR DEPLOY:" -ForegroundColor Yellow

$startDeploy = Read-Host "Abrir dashboard do Render para iniciar deploy? (Y/n)"

if ($startDeploy -notmatch "^[Nn]$") {
    Write-Step "Abrindo dashboard do Render..."
    Start-Process "https://dashboard.render.com"
}

# 7. Informacoes pos-deploy
Write-Host ""
Write-Host "DEPLOY INICIADO!" -ForegroundColor Green
Write-Host ""
Write-Host "PROXIMOS PASSOS:" -ForegroundColor Blue
Write-Host ""
Write-Host "1. AGUARDAR BUILD (3-5 minutos)" -ForegroundColor Yellow
Write-Host "   - Acompanhe logs no dashboard" -ForegroundColor White
Write-Host "   - Procure por erros de build" -ForegroundColor White
Write-Host ""
Write-Host "2. TESTAR DEPLOY:" -ForegroundColor Yellow
Write-Host "   - Aguarde status 'Live'" -ForegroundColor White
Write-Host "   - Teste: https://seu-backend.onrender.com/api/health" -ForegroundColor White
Write-Host "   - Deve retornar: {'status': 'healthy'}" -ForegroundColor White
Write-Host ""
Write-Host "3. CONFIGURAR FRONTEND:" -ForegroundColor Yellow
Write-Host "   - Atualize VITE_API_URL no frontend" -ForegroundColor White
Write-Host "   - Deploy do frontend na Vercel" -ForegroundColor White
Write-Host ""

Write-Success "Deploy iniciado com sucesso!"
Write-Host ""
Write-Host "URL do servico sera:" -ForegroundColor Cyan
Write-Host "https://las-tortillas-backend.onrender.com" -ForegroundColor White
Write-Host ""