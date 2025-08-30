# =========================================================
# SCRIPT DE INICIALIZAÇÃO - LAS TORTILLAS LOCAL PRODUCTION
# =========================================================

Write-Host "🚀 === INICIANDO LOCAL PRODUCTION - LAS TORTILLAS ===" -ForegroundColor Blue
Write-Host "📋 Iniciando ambiente de produção local" -ForegroundColor Blue
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

# Check prerequisites
Write-Step "Verificando pré-requisitos..."

if (-not (Test-Path "package.json")) {
    Write-Error "Execute este script no diretório raiz do projeto"
    exit 1
}

if (-not (Test-Path ".env.local")) {
    Write-Error "Arquivo .env.local não encontrado"
    Write-Warning "Execute .\setup-local-production.ps1 primeiro"
    exit 1
}

if (-not (Test-Path "dist")) {
    Write-Warning "Diretório dist não encontrado. Fazendo build..."
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Falha no build. Execute .\setup-local-production.ps1 primeiro"
        exit 1
    }
}

Write-Success "Pré-requisitos OK"

# Step 1: Load environment variables
Write-Step "PASSO 1: Carregando variáveis de ambiente..."
Write-Success "Usando NODE_ENV=production e PORT=3001"

# Step 2: Check port availability
Write-Step "PASSO 2: Verificando disponibilidade da porta 3001..."
$portInUse = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Warning "Porta 3001 já está em uso"
    $killProcess = Read-Host "Deseja matar o processo existente? (y/N)"
    if ($killProcess -match "^[Yy]$") {
        $processId = $portInUse.OwningProcess
        Stop-Process -Id $processId -Force
        Write-Success "Processo anterior terminado"
        Start-Sleep -Seconds 2
    } else {
        Write-Error "Não é possível iniciar com porta ocupada"
        exit 1
    }
}

Write-Success "Porta 3001 disponível"

# Step 3: Display startup information
Write-Host ""
Write-Host "🌐 === INFORMAÇÕES DO SERVIDOR ===" -ForegroundColor Cyan
Write-Host "📍 URL Principal: http://localhost:3001" -ForegroundColor White
Write-Host "🏠 Página Inicial: http://localhost:3001/" -ForegroundColor White
Write-Host "🍽️  Menu: http://localhost:3001/menu" -ForegroundColor White
Write-Host "👤 Admin: http://localhost:3001/admin" -ForegroundColor White
Write-Host "🔧 API Health: http://localhost:3001/api/health" -ForegroundColor White
Write-Host ""

# Step 4: Start the production server
Write-Step "PASSO 3: Iniciando servidor de produção..."
Write-Host ""
Write-Host "🚀 SERVIDOR INICIANDO..." -ForegroundColor Green
Write-Host "⏹️  Pressione Ctrl+C para parar o servidor" -ForegroundColor Yellow
Write-Host "📊 Monitore os logs abaixo para verificar o status" -ForegroundColor Gray
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor DarkGray

# Start the server
try {
    npm start
} catch {
    Write-Error "Falha ao iniciar o servidor"
    Write-Host ""
    Write-Host "🔧 SOLUÇÕES POSSÍVEIS:" -ForegroundColor Yellow
    Write-Host "1. Verificar se o build foi feito: npm run build" -ForegroundColor White
    Write-Host "2. Verificar .env.local: DATABASE_URL deve estar correto" -ForegroundColor White
    Write-Host "3. Executar setup novamente: .\setup-local-production.ps1" -ForegroundColor White
    Write-Host "4. Tentar modo development: npm run dev" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "👋 Servidor finalizado." -ForegroundColor Gray