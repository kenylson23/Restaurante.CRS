# =========================================================
# TESTE DO BACKEND NO RENDER - URL CORRETO
# =========================================================

Write-Host "TESTANDO BACKEND LAS TORTILLAS - URL CORRETO" -ForegroundColor Blue
Write-Host "URL: https://las-tortillas-api.onrender.com" -ForegroundColor Cyan
Write-Host ""

# URL correto do backend
$renderUrl = "https://las-tortillas-api.onrender.com"
$healthEndpoint = "$renderUrl/api/health"

# Função para testar endpoint
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Description,
        [int]$Timeout = 30
    )
    
    Write-Host "Testando: $Description" -ForegroundColor Yellow
    Write-Host "URL: $Url" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method GET -TimeoutSec $Timeout
        Write-Host "✅ SUCESSO: $Description" -ForegroundColor Green
        Write-Host "Resposta: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Cyan
        return $true
    }
    catch {
        Write-Host "❌ FALHOU: $Description" -ForegroundColor Red
        Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    Write-Host ""
}

# Iniciar testes
Write-Host "TESTANDO ENDPOINTS DO BACKEND" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow
Write-Host ""

# Teste 1: Health Check
Write-Host "TESTE 1: Health Check" -ForegroundColor Cyan
$healthTest = Test-Endpoint -Url $healthEndpoint -Description "Health Check" -Timeout 60

# Teste 2: Menu Items
Write-Host "TESTE 2: Menu Items" -ForegroundColor Cyan
$menuTest = Test-Endpoint -Url "$renderUrl/api/menu-items" -Description "Menu Items" -Timeout 30

# Teste 3: Tables
Write-Host "TESTE 3: Tables" -ForegroundColor Cyan
$tablesTest = Test-Endpoint -Url "$renderUrl/api/tables" -Description "Tables" -Timeout 30

# Teste 4: Orders
Write-Host "TESTE 4: Orders" -ForegroundColor Cyan
$ordersTest = Test-Endpoint -Url "$renderUrl/api/orders" -Description "Orders" -Timeout 30

# Resumo dos testes
Write-Host "RESUMO DOS TESTES" -ForegroundColor Yellow
Write-Host "=================" -ForegroundColor Yellow
Write-Host ""

if ($healthTest) {
    Write-Host "✅ Health Check: PASSOU" -ForegroundColor Green
} else {
    Write-Host "❌ Health Check: FALHOU" -ForegroundColor Red
}

if ($menuTest) {
    Write-Host "✅ Menu Items: PASSOU" -ForegroundColor Green
} else {
    Write-Host "⚠️  Menu Items: FALHOU" -ForegroundColor Yellow
}

if ($tablesTest) {
    Write-Host "✅ Tables: PASSOU" -ForegroundColor Green
} else {
    Write-Host "⚠️  Tables: FALHOU" -ForegroundColor Yellow
}

if ($ordersTest) {
    Write-Host "✅ Orders: PASSOU" -ForegroundColor Green
} else {
    Write-Host "⚠️  Orders: FALHOU" -ForegroundColor Yellow
}

Write-Host ""

if ($healthTest) {
    Write-Host "🎉 BACKEND FUNCIONANDO!" -ForegroundColor Green
    Write-Host "URL do Backend: $renderUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "PRÓXIMOS PASSOS:" -ForegroundColor Yellow
    Write-Host "1. Atualizar VITE_API_URL no frontend para: $renderUrl" -ForegroundColor White
    Write-Host "2. Fazer deploy do frontend na Vercel" -ForegroundColor White
    Write-Host "3. Testar aplicação completa" -ForegroundColor White
} else {
    Write-Host "❌ PROBLEMAS DETECTADOS" -ForegroundColor Red
    Write-Host ""
    Write-Host "SOLUÇÕES:" -ForegroundColor Yellow
    Write-Host "1. Verificar logs no dashboard do Render" -ForegroundColor White
    Write-Host "2. Confirmar variáveis de ambiente" -ForegroundColor White
    Write-Host "3. Verificar se o build foi concluído" -ForegroundColor White
}

Write-Host ""
Write-Host "URLS UTEIS:" -ForegroundColor Cyan
Write-Host "- Backend Health: $healthEndpoint" -ForegroundColor White
Write-Host "- Backend API: $renderUrl/api/" -ForegroundColor White
Write-Host "- Dashboard Render: https://dashboard.render.com" -ForegroundColor White