# =========================================================
# SCRIPT DE SETUP - LAS TORTILLAS LOCAL PRODUCTION
# =========================================================

Write-Host "🚀 === SETUP LOCAL PRODUCTION - LAS TORTILLAS ===" -ForegroundColor Blue
Write-Host "📋 Configurando ambiente de produção local" -ForegroundColor Blue
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

$nodeVersion = node --version
Write-Success "Node.js encontrado: $nodeVersion"

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Error "Execute este script no diretório raiz do projeto (Restaurante.CRS)"
    exit 1
}

Write-Success "Diretório do projeto encontrado"

# Step 1: Install main dependencies
Write-Step "PASSO 1: Instalando dependências principais..."
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Success "Dependências principais instaladas"
} else {
    Write-Error "Falha ao instalar dependências principais"
    exit 1
}

# Step 2: Install client dependencies if exists
if (Test-Path "client/package.json") {
    Write-Step "PASSO 2: Instalando dependências do client..."
    Set-Location client
    npm install
    Set-Location ..
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Dependências do client instaladas"
    } else {
        Write-Error "Falha ao instalar dependências do client"
        exit 1
    }
} else {
    Write-Success "Diretório client não encontrado (OK)"
}

# Step 3: Install server dependencies if exists
if (Test-Path "server/package.json") {
    Write-Step "PASSO 3: Instalando dependências do server..."
    Set-Location server
    npm install
    Set-Location ..
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Dependências do server instaladas"
    } else {
        Write-Error "Falha ao instalar dependências do server"
        exit 1
    }
} else {
    Write-Success "Server usa dependências do projeto principal"
}

# Step 4: Environment configuration
Write-Step "PASSO 4: Verificando configuração de ambiente..."

if (-not (Test-Path ".env.local")) {
    Write-Error "Arquivo .env.local não encontrado"
    Write-Warning "Execute este comando novamente após criar o .env.local"
    exit 1
} else {
    Write-Success "Arquivo .env.local encontrado"
}

# Step 5: Build the project
Write-Step "PASSO 5: Fazendo build do projeto..."
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Success "Build concluído com sucesso"
} else {
    Write-Error "Falha no build"
    Write-Warning "Verifique se todas as dependências estão instaladas"
    exit 1
}

# Step 6: Check database connection (if available)
Write-Step "PASSO 6: Verificando conexão com banco de dados..."
if (Test-Path "scripts/test-database.js") {
    node scripts/test-database.js
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Conexão com banco de dados OK"
    } else {
        Write-Warning "Falha na conexão com banco (verifique DATABASE_URL no .env.local)"
    }
} else {
    Write-Warning "Script de teste de banco não encontrado (OK)"
}

Write-Host ""
Write-Host "🎉 === SETUP LOCAL PRODUCTION CONCLUÍDO! ===" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Blue
Write-Host ""
Write-Host "1️⃣  Para iniciar o servidor local de produção:" -ForegroundColor Yellow
Write-Host "   .\start-local-production.ps1" -ForegroundColor White
Write-Host ""
Write-Host "2️⃣  Para testar manualmente:" -ForegroundColor Yellow
Write-Host "   npm start" -ForegroundColor White
Write-Host "   # O servidor estará disponível em http://localhost:3001" -ForegroundColor Gray
Write-Host ""
Write-Host "3️⃣  Para desenvolvimento:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor White
Write-Host "   # Servidor de desenvolvimento com hot-reload" -ForegroundColor Gray
Write-Host ""
Write-Host "📞 PROBLEMAS COMUNS:" -ForegroundColor Cyan
Write-Host "   • Se DATABASE_URL não funcionar, verifique no .env.local" -ForegroundColor Gray
Write-Host "   • Para logs detalhados: npm run dev (modo desenvolvimento)" -ForegroundColor Gray
Write-Host "   • Porta ocupada: altere PORT no .env.local" -ForegroundColor Gray
Write-Host ""

Write-Success "Setup concluído! Use .\start-local-production.ps1 para iniciar. 🚀"