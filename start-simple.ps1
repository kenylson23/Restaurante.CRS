# =========================================================
# SCRIPT SIMPLES - INICIO RÁPIDO LOCAL PRODUCTION
# =========================================================

Write-Host "🚀 INICIO RAPIDO - Las Tortillas Local Production" -ForegroundColor Green
Write-Host ""

# Basic checks
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Execute no diretório raiz do projeto" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path ".env.local")) {
    Write-Host "❌ .env.local não encontrado" -ForegroundColor Red
    Write-Host "💡 Execute: .\setup-local-production.ps1" -ForegroundColor Yellow
    exit 1
}

# Quick info
Write-Host "🌐 URL: http://localhost:3001" -ForegroundColor Cyan
Write-Host "🔧 Modo: LOCAL PRODUCTION" -ForegroundColor Yellow  
Write-Host "⏹️  Ctrl+C para parar" -ForegroundColor Gray
Write-Host ""

# Start server
npm start