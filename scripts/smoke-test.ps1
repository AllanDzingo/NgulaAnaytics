# Smoke test for Ngula Analytics (Windows PowerShell).
# 1) builds the backend, 2) checks /health, 3) logs in, 4) hits client-data endpoints.
# Usage: powershell -File scripts/smoke-test.ps1  [-BaseUrl http://localhost:5000]
param(
    [string]$BaseUrl = "http://localhost:5000",
    [string]$Email = "exec@ngula.demo",
    [string]$Password = "Demo@2025"
)

$ErrorActionPreference = "Stop"

Write-Host "==> [1/4] Building backend"
dotnet build src/NgulAnalytics.Api/NgulAnalytics.Api.csproj -c Release --nologo

Write-Host "==> [2/4] Health check: $BaseUrl/health"
$health = Invoke-WebRequest -Uri "$BaseUrl/health" -UseBasicParsing
if ($health.StatusCode -ne 200) { throw "FAIL: /health returned $($health.StatusCode)" }
Write-Host "OK: /health = 200"

Write-Host "==> [3/4] Login as $Email"
$body = @{ email = $Email; password = $Password } | ConvertTo-Json
$login = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body $body
if (-not $login.token) { throw "FAIL: no JWT returned from login" }
Write-Host "OK: received JWT ($($login.token.Length) chars)"

$headers = @{ Authorization = "Bearer $($login.token)" }

Write-Host "==> [4/4] Client-data endpoints"
Invoke-RestMethod -Uri "$BaseUrl/api/plant-data/production/summary" -Headers $headers | Out-Null
Write-Host "OK: /api/plant-data/production/summary"
Invoke-RestMethod -Uri "$BaseUrl/api/plant-data/engineering/summary" -Headers $headers | Out-Null
Write-Host "OK: /api/plant-data/engineering/summary"

Write-Host "ALL SMOKE TESTS PASSED"
