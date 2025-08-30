Write-Host "CORRIGINDO E DEPLOYANDO - TERMINAL UNICO" -ForegroundColor Blue
Write-Host "=======================================" -ForegroundColor Blue
Write-Host ""

Write-Host "PASSO 1: Fazendo commit das correções..." -ForegroundColor Yellow
git add package.json server/package.json
git commit -m "Fix: Remove cross-env from all scripts for Linux compatibility"

Write-Host ""
Write-Host "PASSO 2: Fazendo push para triggerar deploy..." -ForegroundColor Yellow
git push

Write-Host ""
Write-Host "PASSO 3: Aguardando 30 segundos para o deploy iniciar..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "PASSO 4: Testando se o backend está funcionando..." -ForegroundColor Yellow

$maxAttempts = 10
$attempt = 0

while ($attempt -lt $maxAttempts) {
    $attempt++
    Write-Host "Tentativa $attempt/$maxAttempts..." -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri "https://las-tortillas-api.onrender.com/api/health" -TimeoutSec 15
        Write-Host ""
        Write-Host "SUCESSO! BACKEND FUNCIONANDO!" -ForegroundColor Green
        Write-Host "Resposta:" -ForegroundColor Cyan
        $response | ConvertTo-Json
        break
    }
    catch {
        Write-Host "Aguardando... (Erro: $($_.Exception.Message))" -ForegroundColor Yellow
        Start-Sleep -Seconds 20
    }
}

Write-Host ""
Write-Host "DEPLOY COMPLETO!" -ForegroundColor Green
Write-Host "Backend URL: https://las-tortillas-api.onrender.com" -ForegroundColor Cyan