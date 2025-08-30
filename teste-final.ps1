Write-Host "TESTANDO BACKEND APOS CORRECAO DOTENV" -ForegroundColor Blue
Write-Host "====================================" -ForegroundColor Blue

Write-Host "Aguardando 30 segundos para novo deploy..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host "Testando health check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://las-tortillas-api.onrender.com/api/health" -TimeoutSec 20
    Write-Host ""
    Write-Host "SUCESSO! BACKEND FUNCIONANDO!" -ForegroundColor Green
    Write-Host "=============================" -ForegroundColor Green
    Write-Host "Resposta do servidor:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 2
    Write-Host ""
    Write-Host "DEPLOY COMPLETO!" -ForegroundColor Green
} catch {
    Write-Host "Ainda deployando ou outro erro:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Continue testando manualmente:" -ForegroundColor Cyan
    Write-Host "https://las-tortillas-api.onrender.com/api/health" -ForegroundColor White
}