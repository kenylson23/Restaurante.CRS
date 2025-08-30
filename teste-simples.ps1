Write-Host "Testando backend Las Tortillas..." -ForegroundColor Blue
Write-Host "URL: https://las-tortillas-api.onrender.com" -ForegroundColor Cyan
Write-Host ""

$url = "https://las-tortillas-api.onrender.com/api/health"

try {
    Write-Host "Testando health check..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri $url -Method GET -TimeoutSec 30
    Write-Host "SUCESSO! Backend funcionando!" -ForegroundColor Green
    Write-Host "Resposta:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 2
} catch {
    Write-Host "Erro ao conectar:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "Testando outros endpoints..." -ForegroundColor Yellow

$endpoints = @(
    "/api/menu-items",
    "/api/tables", 
    "/api/orders"
)

foreach ($endpoint in $endpoints) {
    try {
        $fullUrl = "https://las-tortillas-api.onrender.com$endpoint"
        Write-Host "Testando: $fullUrl" -ForegroundColor Gray
        $response = Invoke-RestMethod -Uri $fullUrl -Method GET -TimeoutSec 15
        Write-Host "OK: $endpoint" -ForegroundColor Green
    } catch {
        Write-Host "Falhou: $endpoint - $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Teste concluído!" -ForegroundColor Blue