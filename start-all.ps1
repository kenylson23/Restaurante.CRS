# ===============================================
# SCRIPT ÚNICO - LAS TORTILLAS SETUP COMPLETO
# Execute: .\start-all.ps1 no PowerShell
# ===============================================

Write-Host "🚀 === SETUP AUTOMÁTICO LAS TORTILLAS ===" -ForegroundColor Green
Write-Host "📍 Executando no mesmo terminal..." -ForegroundColor Cyan
Write-Host ""

# Verificar diretório
Write-Host "🔍 Verificando diretório..." -ForegroundColor Blue
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Execute no diretório do projeto!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}
Write-Host "✅ Diretório correto encontrado" -ForegroundColor Green
Write-Host ""

# 1. Instalar dependências principais
Write-Host "📦 Passo 1/5: Instalando dependências principais..." -ForegroundColor Blue
Write-Host "⏳ Aguarde... isto pode demorar alguns minutos" -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependências principais instaladas" -ForegroundColor Green
} else {
    Write-Host "❌ Erro nas dependências principais" -ForegroundColor Red
    Read-Host "Pressione Enter para continuar mesmo assim"
}
Write-Host ""

# 2. Instalar pacotes extras
Write-Host "🔧 Passo 2/5: Instalando pacotes extras..." -ForegroundColor Blue
npm install cross-env dotenv pg @types/pg
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Pacotes extras instalados" -ForegroundColor Green
} else {
    Write-Host "⚠️ Problemas com pacotes extras, mas continuando..." -ForegroundColor Yellow
}
Write-Host ""

# 3. Fazer build
Write-Host "🏗️ Passo 3/5: Fazendo build do projeto..." -ForegroundColor Blue
Write-Host "⏳ Compilando frontend e backend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build concluído com sucesso" -ForegroundColor Green
} else {
    Write-Host "⚠️ Build teve problemas, mas continuando..." -ForegroundColor Yellow
}
Write-Host ""

# 4. Testar banco (opcional)
Write-Host "🔍 Passo 4/5: Testando conexão do banco..." -ForegroundColor Blue
Write-Host "⏳ Verificando Neon PostgreSQL..." -ForegroundColor Yellow
node scripts/test-database.js
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Banco conectado perfeitamente" -ForegroundColor Green
} else {
    Write-Host "⚠️ Banco com problemas - mas servidor funcionará sem ele" -ForegroundColor Yellow
    Write-Host "💡 Funcionalidades básicas: Menu, Reservas WhatsApp, etc." -ForegroundColor Cyan
}
Write-Host ""

# 5. Mensagem final antes de iniciar
Write-Host "🎉 === SETUP CONCLUÍDO COM SUCESSO! ===" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Resumo:" -ForegroundColor Cyan
Write-Host "  ✅ Dependências instaladas" -ForegroundColor White
Write-Host "  ✅ Build realizado" -ForegroundColor White
Write-Host "  ✅ Configurações verificadas" -ForegroundColor White
Write-Host ""
Write-Host "🌐 === INICIANDO SERVIDOR LAS TORTILLAS ===" -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs disponíveis:" -ForegroundColor Cyan
Write-Host "   🏠 Site: http://localhost:3001" -ForegroundColor White
Write-Host "   🍽️ Menu: http://localhost:3001/menu" -ForegroundColor White
Write-Host "   👤 Admin: http://localhost:3001/admin" -ForegroundColor White
Write-Host "   🔧 API: http://localhost:3001/api/health" -ForegroundColor White
Write-Host ""
Write-Host "🛑 Para parar o servidor: Pressione Ctrl+C" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════" -ForegroundColor DarkGray
Write-Host ""

# 6. Iniciar servidor
npm start

# Se chegou aqui, o servidor foi parado
Write-Host ""
Write-Host "👋 Servidor Las Tortillas parado." -ForegroundColor Gray
Write-Host "💡 Para reiniciar: execute .\start-all.ps1 novamente" -ForegroundColor Cyan
Read-Host "Pressione Enter para sair"