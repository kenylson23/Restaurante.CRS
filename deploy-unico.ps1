Write-Host "DEPLOY UNICO - LAS TORTILLAS" -ForegroundColor Blue
Write-Host "============================" -ForegroundColor Blue

Write-Host "1. Fazendo commit..." -ForegroundColor Yellow
git add .
git commit -m "Fix cross-env for Render deployment"
git push

Write-Host "2. Aguardando deploy (60s)..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

Write-Host "3. Testando backend..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://las-tortillas-api.onrender.com/api/health" -TimeoutSec 15
    Write-Host "SUCESSO! Backend funcionando!" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "Ainda deployando: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "Aguarde mais alguns minutos e teste manualmente:" -ForegroundColor Cyan
    Write-Host "https://las-tortillas-api.onrender.com/api/health" -ForegroundColor White
}

Write-Host "Deploy concluido!" -ForegroundColor Green