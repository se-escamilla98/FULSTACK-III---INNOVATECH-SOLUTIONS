# deploy-swarm.ps1
# Despliega INNOVATECH en Docker Swarm con 3 replicas de BFF y auto-healing

param(
    [switch]$Rebuild,  # Fuerza rebuild de imagenes
    [switch]$Down      # Elimina el stack en lugar de desplegarlo
)

$STACK_NAME = "innovatech"

# ── Eliminar stack ──────────────────────────────────────────────────────────
if ($Down) {
    Write-Host "Eliminando stack '$STACK_NAME'..." -ForegroundColor Yellow
    docker stack rm $STACK_NAME
    Write-Host "Esperando que los contenedores se detengan..." -ForegroundColor Gray
    Start-Sleep -Seconds 8
    docker config rm traefik-dynamic 2>$null
    Write-Host "Stack eliminado." -ForegroundColor Green
    exit 0
}

# ── Verificar que Swarm este activo ────────────────────────────────────────
$swarmState = docker info --format "{{.Swarm.LocalNodeState}}" 2>$null
if ($swarmState -ne "active") {
    Write-Host "Inicializando Docker Swarm..." -ForegroundColor Cyan
    docker swarm init --advertise-addr 127.0.0.1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: No se pudo inicializar Swarm." -ForegroundColor Red
        exit 1
    }
}
Write-Host "Swarm activo." -ForegroundColor Green

# ── Build de imagenes ──────────────────────────────────────────────────────
if ($Rebuild -or -not (docker image inspect innovatech-bff:latest 2>$null)) {
    Write-Host "Construyendo imagenes..." -ForegroundColor Cyan
    docker compose build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Fallo el build." -ForegroundColor Red
        exit 1
    }
    Write-Host "Imagenes construidas." -ForegroundColor Green
} else {
    Write-Host "Imagenes existentes (usa -Rebuild para reconstruir)." -ForegroundColor Gray
}

# ── Docker Config para Traefik ─────────────────────────────────────────────
$configExists = docker config ls --filter name=traefik-dynamic --format "{{.Name}}" 2>$null
if ($configExists -eq "traefik-dynamic") {
    Write-Host "Actualizando config de Traefik..." -ForegroundColor Cyan
    docker config rm traefik-dynamic
}
docker config create traefik-dynamic ./traefik/dynamic.yml
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudo crear la config de Traefik." -ForegroundColor Red
    exit 1
}
Write-Host "Config de Traefik registrada." -ForegroundColor Green

# ── Desplegar stack ────────────────────────────────────────────────────────
Write-Host "Desplegando stack '$STACK_NAME'..." -ForegroundColor Cyan
docker stack deploy -c docker-stack.yml $STACK_NAME
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Fallo el deploy." -ForegroundColor Red
    exit 1
}

# ── Esperar y mostrar estado ───────────────────────────────────────────────
Write-Host ""
Write-Host "Esperando que los servicios arranquen (30s)..." -ForegroundColor Gray
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "=== ESTADO DEL STACK ===" -ForegroundColor Cyan
docker stack services $STACK_NAME

Write-Host ""
Write-Host "=== TAREAS EN EJECUCION ===" -ForegroundColor Cyan
docker stack ps $STACK_NAME --no-trunc

Write-Host ""
Write-Host "Sistema disponible en:" -ForegroundColor Green
Write-Host "  Frontend:         http://localhost:5173" -ForegroundColor White
Write-Host "  API (via Traefik):http://localhost" -ForegroundColor White
Write-Host "  Monitor:          http://localhost:4000" -ForegroundColor White
Write-Host "  Traefik dashboard:http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "Comandos utiles:" -ForegroundColor Yellow
Write-Host "  Ver servicios:    docker stack services $STACK_NAME"
Write-Host "  Ver replicas BFF: docker service ps ${STACK_NAME}_bff"
Write-Host "  Escalar BFF:      docker service scale ${STACK_NAME}_bff=5"
Write-Host "  Logs BFF:         docker service logs -f ${STACK_NAME}_bff"
Write-Host "  Eliminar stack:   .\deploy-swarm.ps1 -Down"
