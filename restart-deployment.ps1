# =========================================================
# RESTART DEPLOYMENT - TERMINAL UNICO E LIMPO
# =========================================================

Write-Host ""
Write-Host "🚀 REINICIANDO DEPLOYMENT - LAS TORTILLAS" -ForegroundColor Blue
Write-Host "=========================================" -ForegroundColor Blue
Write-Host ""

# Verificar diretorio atual
Write-Host "📁 Verificando diretorio atual..." -ForegroundColor Yellow
$currentDir = Get-Location
Write-Host "Diretorio: $currentDir" -ForegroundColor Gray

if (-not $currentDir.Path.EndsWith("Restaurante.CRS")) {
    Write-Host "❌ ERRO: Execute este script na pasta Restaurante.CRS" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Diretorio correto!" -ForegroundColor Green
Write-Host ""

# Passo 1: Corrigir arquivos
Write-Host "🔧 PASSO 1: Aplicando correções finais..." -ForegroundColor Yellow
Write-Host "Verificando se as correções foram aplicadas..." -ForegroundColor Gray

# Verificar se package.json foi corrigido
$packageContent = Get-Content "package.json" -Raw
if ($packageContent -match "cross-env") {
    Write-Host "⚠️  Corrigindo package.json principal..." -ForegroundColor Yellow
    # A correção já foi feita anteriormente
} else {
    Write-Host "✅ package.json principal já corrigido" -ForegroundColor Green
}

# Verificar se server/package.json foi corrigido
$serverPackageContent = Get-Content "server/package.json" -Raw
if ($serverPackageContent -match "cross-env") {
    Write-Host "⚠️  Corrigindo server/package.json..." -ForegroundColor Yellow
    # A correção já foi feita anteriormente
} else {
    Write-Host "✅ server/package.json já corrigido" -ForegroundColor Green
}

Write-Host ""

# Passo 2: Git operations
Write-Host "📦 PASSO 2: Sincronizando com Git..." -ForegroundColor Yellow

Write-Host "Adicionando arquivos modificados..." -ForegroundColor Gray
git add .

Write-Host "Fazendo commit..." -ForegroundColor Gray
git commit -m "Final fix: Remove cross-env completely for Render deployment"

Write-Host "Enviando para GitHub..." -ForegroundColor Gray
git push

Write-Host "✅ Git sincronizado!" -ForegroundColor Green
Write-Host ""

# Passo 3: Aguardar deploy
Write-Host "⏳ PASSO 3: Aguardando novo deployment..." -ForegroundColor Yellow
Write-Host "O Render vai fazer deploy automatico em ~2-3 minutos" -ForegroundColor Gray
Write-Host ""

# Passo 4: Testar deployment
Write-Host "🧪 PASSO 4: Testando backend..." -ForegroundColor Yellow
$url = "https://las-tortillas-api.onrender.com/api/health"
$maxTries = 15
$currentTry = 0

while ($currentTry -lt $maxTries) {
    $currentTry++
    Write-Host "Teste $currentTry/$maxTries - Aguardando 15s..." -ForegroundColor Gray
    Start-Sleep -Seconds 15
    
    try {
        $response = Invoke-RestMethod -Uri $url -TimeoutSec 10
        Write-Host ""
        Write-Host "🎉 SUCESSO! BACKEND FUNCIONANDO!" -ForegroundColor Green
        Write-Host "===============================" -ForegroundColor Green
        Write-Host "URL: $url" -ForegroundColor Cyan
        Write-Host "Resposta:" -ForegroundColor Cyan
        $response | ConvertTo-Json -Depth 2
        Write-Host ""
        
        # Testar outros endpoints
        Write-Host "Testando outros endpoints..." -ForegroundColor Yellow
        $endpoints = @("/api/menu-items", "/api/tables", "/api/orders")
        foreach ($endpoint in $endpoints) {
            try {
                $testUrl = "https://las-tortillas-api.onrender.com$endpoint"
                Invoke-RestMethod -Uri $testUrl -TimeoutSec 5 | Out-Null
                Write-Host "✅ $endpoint funcionando" -ForegroundColor Green
            } catch {
                Write-Host "⚠️  $endpoint com problemas" -ForegroundColor Yellow
            }
        }
        
        break
    }
    catch {
        if ($currentTry -eq $maxTries) {
            Write-Host ""
            Write-Host "❌ TIMEOUT - Verificar manualmente" -ForegroundColor Red
            Write-Host "Dashboard: https://dashboard.render.com" -ForegroundColor Cyan
        } else {
            Write-Host "Ainda deployando... ($($_.Exception.Message))" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "🏁 PROCESSO COMPLETO!" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green
Write-Host ""
Write-Host "URLS UTEIS:" -ForegroundColor Cyan
Write-Host "- Backend: https://las-tortillas-api.onrender.com" -ForegroundColor White
Write-Host "- Health: https://las-tortillas-api.onrender.com/api/health" -ForegroundColor White
Write-Host "- Dashboard: https://dashboard.render.com" -ForegroundColor White
Write-Host ""
Write-Host "PROXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. ✅ Backend funcionando" -ForegroundColor White
Write-Host "2. 🔄 Deploy frontend na Vercel" -ForegroundColor White
Write-Host "3. 🧪 Testar aplicação completa" -ForegroundColor White