# ─── generate-env.ps1 ────────────────────────────────────────────────────────
# Genera un JWT_SECRET aleatorio y lo escribe en .env antes de levantar Docker.
# Ejecutar SIEMPRE antes de: docker compose up --build
#
# Uso:
#   .\generate-env.ps1
#   docker compose up --build
#
# Efecto: todos los contenedores comparten el mismo secret → JWT válido.
# Al correr el script de nuevo se genera un secret nuevo → sesiones anteriores
# quedan inválidas → los usuarios deben hacer login de nuevo.
# ─────────────────────────────────────────────────────────────────────────────

$bytes  = New-Object byte[] 64
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$secret = [System.BitConverter]::ToString($bytes) -replace '-', ''

$envContent = "JWT_SECRET=$secret"
$envContent | Out-File -FilePath ".env" -Encoding utf8 -NoNewline

Write-Host ""
Write-Host "✅ JWT_SECRET generado y guardado en .env" -ForegroundColor Green
Write-Host "🔑 Secret: $secret" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ahora ejecuta:" -ForegroundColor Yellow
Write-Host "  docker compose up --build" -ForegroundColor White
Write-Host ""
