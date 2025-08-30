# =========================================================
# SCRIPT DE SETUP AUTOMÁTICO - LAS TORTILLAS (Windows)
# Deploy Frontend (Vercel) + Backend (Render) + DB (Neon)
# =========================================================

Write-Host "🚀 === SETUP AUTOMÁTICO LAS TORTILLAS ===" -ForegroundColor Blue
Write-Host "📋 Este script vai configurar todo o ambiente de produção" -ForegroundColor Blue
Write-Host ""

# Function to print colored output
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

# Function to check if command exists
function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# Check prerequisites
Write-Step "Verificando pré-requisitos..."

if (-not (Test-Command "node")) {
    Write-Error "Node.js não encontrado. Instale Node.js 18+ primeiro."
    exit 1
}

if (-not (Test-Command "npm")) {
    Write-Error "npm não encontrado. Instale npm primeiro."
    exit 1
}

Write-Success "Node.js e npm encontrados"

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Error "Execute este script no diretório las-tortillas-vercel\frontend\"
    exit 1
}

# Step 1: Install dependencies
Write-Step "PASSO 1: Instalando dependências..."
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Success "Dependências instaladas"
} else {
    Write-Error "Falha ao instalar dependências"
    exit 1
}

# Step 2: Environment configuration
Write-Step "PASSO 2: Configuração de ambiente..."

if (-not (Test-Path "../.env.local")) {
    Write-Warning "Arquivo .env.local não encontrado"
    Write-Step "Copiando template de configuração..."
    
    if (Test-Path "../.env.template") {
        Copy-Item "../.env.template" "../.env.local"
        Write-Success "Template copiado para .env.local"
        Write-Warning "IMPORTANTE: Edite o arquivo .env.local com suas credenciais!"
        Write-Warning "Configurações necessárias:"
        Write-Host "  - DATABASE_URL (Neon)" -ForegroundColor White
        Write-Host "  - SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor White
        Write-Host "  - VITE_API_URL (URL do backend no Render)" -ForegroundColor White
        Write-Host ""
        
        Read-Host "Pressione Enter depois de configurar o .env.local"
    } else {
        Write-Error "Template .env.template não encontrado"
        exit 1
    }
} else {
    Write-Success "Arquivo .env.local encontrado"
}

# Step 3: Test database connection
Write-Step "PASSO 3: Testando conexão com banco de dados..."
npm run test-neon-connection
if ($LASTEXITCODE -eq 0) {
    Write-Success "Conexão com banco estabelecida"
} else {
    Write-Error "Falha na conexão com banco"
    Write-Warning "Verifique as configurações no .env.local"
    
    $continue = Read-Host "Deseja continuar mesmo com falha na conexão? (y/N)"
    if ($continue -notmatch "^[Yy]$") {
        exit 1
    }
}

# Step 4: Run database migration
Write-Step "PASSO 4: Executando migração do banco..."
npm run migrate-neon
if ($LASTEXITCODE -eq 0) {
    Write-Success "Migração do banco concluída"
} else {
    Write-Error "Falha na migração do banco"
    exit 1
}

# Step 4.1: Migrate existing data
Write-Step "PASSO 4.1: Migrando dados existentes..."
npm run migrate-data
if ($LASTEXITCODE -eq 0) {
    Write-Success "Migração de dados concluída"
} else {
    Write-Warning "Falha na migração de dados (opcional)"
}

# Step 5: Build frontend
Write-Step "PASSO 5: Build do frontend..."
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Success "Build do frontend concluído"
} else {
    Write-Error "Falha no build do frontend"
    exit 1
}

# Step 6: Instructions for deployment
Write-Step "PASSO 6: Instruções para deploy..."

Write-Host ""
Write-Host "🎉 === SETUP CONCLUÍDO COM SUCESSO! ===" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS PARA DEPLOY:" -ForegroundColor Blue
Write-Host ""
Write-Host "1️⃣  BACKEND (Render):" -ForegroundColor Yellow
Write-Host "   • Execute: .\deploy-backend-render.ps1"
Write-Host "   • Ou acesse: https://render.com"
Write-Host "   • Crie um novo Web Service"
Write-Host "   • Conecte seu repositório GitHub"
Write-Host "   • Configure Build Command: cd server && npm install && npm run build"
Write-Host "   • Configure Start Command: cd server && npm start"
Write-Host "   • Adicione variáveis de ambiente:"
Write-Host "     - DATABASE_URL (sua URL do Neon)"
Write-Host "     - NODE_ENV=production"
Write-Host "     - PORT=10000"
Write-Host ""
Write-Host "2️⃣  FRONTEND (Vercel):" -ForegroundColor Yellow
Write-Host "   • Execute: .\deploy-frontend-vercel.ps1"
Write-Host "   • Ou acesse: https://vercel.com"
Write-Host "   • Importe seu repositório"
Write-Host "   • Configure Root Directory: las-tortillas-vercel/frontend"
Write-Host "   • Configure Build Command: npm run build"
Write-Host "   • Adicione variáveis de ambiente:"
Write-Host "     - VITE_API_URL (URL do seu backend no Render)"
Write-Host "     - SUPABASE_URL"
Write-Host "     - SUPABASE_ANON_KEY"
Write-Host ""
Write-Host "3️⃣  TESTE FINAL:" -ForegroundColor Yellow
Write-Host "   • Execute: .\test-end-to-end.ps1"
Write-Host "   • Acesse sua aplicação na Vercel"
Write-Host "   • Teste todas as funcionalidades"
Write-Host "   • Verifique logs no Render e Vercel"
Write-Host ""
Write-Host "📞 SUPORTE:" -ForegroundColor Cyan
Write-Host "   • Logs Render: https://dashboard.render.com"
Write-Host "   • Logs Vercel: https://vercel.com/dashboard"
Write-Host "   • DB Neon: https://console.neon.tech"
Write-Host ""

Write-Success "Setup automático concluído! 🚀"