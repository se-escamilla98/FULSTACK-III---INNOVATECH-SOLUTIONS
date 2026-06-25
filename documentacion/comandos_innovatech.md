# Comandos Innovatech Solutions — Referencia Completa

---

## JWT SECRET — Generar y configurar

```powershell
# Generar nuevo JWT_SECRET y escribir .env completo
$bytes = New-Object byte[] 64
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$secret = [System.BitConverter]::ToString($bytes) -replace '-', ''
"VITE_BFF_URL=http://localhost`nJWT_SECRET=$secret" | Out-File -FilePath ".env" -Encoding utf8 -NoNewline
Write-Host "✅ .env generado"

# Ver el .env actual
cat .env
```

---

## ARCHIVOS .ENV — Crear en cada microservicio

```powershell
# ms-teams
"DATABASE_URL=postgresql://user_teams:password_teams@localhost:5435/db_teams" | Out-File -FilePath "ms-teams/.env" -Encoding utf8 -NoNewline

# ms-projects
"DATABASE_URL=postgresql://user_projects:password_projects@localhost:5434/db_projects" | Out-File -FilePath "ms-projects/.env" -Encoding utf8 -NoNewline

# ms-tasks
"DATABASE_URL=postgresql://johndoe:randompassword@localhost:5433/db_tasks" | Out-File -FilePath "ms-tasks/.env" -Encoding utf8 -NoNewline

# bff-gateway
"BFF_DATABASE_URL=postgresql://user_bff:password_bff@localhost:5436/db_bff" | Out-File -FilePath "bff-gateway/.env" -Encoding utf8 -NoNewline
```

---

## DOCKER COMPOSE — Ciclo de vida

```powershell
# Levantar todo (con rebuild)
docker compose up --build

# Levantar en segundo plano
docker compose up -d --build

# Levantar solo las bases de datos
docker compose up -d db-tasks db-projects db-teams db-bff

# Levantar solo el frontend (rebuild)
docker compose up --build frontend

# Levantar solo el BFF (rebuild)
docker compose up --build bff

# Levantar solo ms-teams (rebuild)
docker compose up --build ms-teams

# Detener todo (conserva datos)
docker compose down

# Detener todo y BORRAR bases de datos (datos perdidos)
docker compose down -v

# Reiniciar un servicio específico (resetea circuit breakers)
docker compose restart bff
docker compose restart ms-teams
docker compose restart traefik

# Ver estado de todos los contenedores
docker compose ps

# Logs en tiempo real (todos)
docker compose logs -f

# Logs de un servicio específico
docker compose logs bff -f
docker compose logs ms-teams -f
docker compose logs traefik -f

# Logs con límite de líneas
docker compose logs bff --tail=20

# Ejecutar comando dentro de un contenedor
docker compose exec ms-teams npx prisma studio
docker compose exec -it db-teams psql -U user_teams -d db_teams
```

---

## MIGRACIONES PRISMA

```powershell
# Primera vez o después de docker compose down -v
# (con las BDs corriendo)

cd ms-teams
npx prisma migrate dev --name "init"

cd ../ms-projects
npx prisma migrate dev --name "init"

cd ../ms-tasks
npx prisma migrate dev --name "init"

cd ../bff-gateway
npx prisma migrate dev --name "init_users"

cd ..

# Crear migración sin aplicar (para revisar el SQL primero)
npx prisma migrate dev --name "nombre" --create-only

# Aplicar migraciones existentes (producción/Docker)
npx prisma migrate deploy

# Ver datos en el navegador (Prisma Studio)
docker compose exec ms-teams npx prisma studio
docker compose exec ms-tasks npx prisma studio
docker compose exec ms-projects npx prisma studio

# Resetear BD completamente (borra todos los datos)
npx prisma migrate reset
```

---

## POSTGRESQL — Consultas directas

```powershell
# Entrar a psql interactivo
docker compose exec -it db-teams psql -U user_teams -d db_teams
docker compose exec -it db-tasks psql -U user_tasks -d db_tasks
docker compose exec -it db-projects psql -U user_projects -d db_projects
docker compose exec -it db-bff psql -U user_bff -d db_bff

# Dentro de psql:
# Ver todas las tablas
\dt

# Ver datos de una tabla
SELECT * FROM "Employee";
SELECT * FROM "Member";
SELECT * FROM "Team";
SELECT * FROM "Task";
SELECT * FROM "TaskLog";
SELECT * FROM "User";

# Salir de psql
\q
```

---

## GIT — Commits atómicos (Trunk-Based Development)

```bash
# Ver estado actual
git status
git branch

# Agregar archivo específico
git add nombre-archivo

# Hacer commit con mensaje convencional
git commit -m "feat(scope): descripción"
git commit -m "fix(scope): descripción"
git commit -m "chore: descripción"
git commit -m "docs: descripción"

# Subir cambios
git push origin main

# Ver historial de commits
git log --oneline

# Deshacer último commit (mantiene cambios)
git reset --soft HEAD~1

# Quitar archivo del tracking (sin borrarlo del disco)
git rm --cached nombre-archivo
git rm -r --cached carpeta/

# Agregar al .gitignore
echo "node_modules/" >> .gitignore
echo ".env" >> .gitignore
echo "bff-gateway/node_modules/" >> .gitignore
```

---

## DOCKER SWARM — Producción

```powershell
# Inicializar Swarm (solo primera vez)
docker swarm init --advertise-addr 127.0.0.1

# Desplegar con script automático
.\deploy-swarm.ps1
.\deploy-swarm.ps1 -Rebuild    # fuerza rebuild de imágenes
.\deploy-swarm.ps1 -Down       # elimina el stack

# Ver estado del stack
docker stack services innovatech
docker stack ps innovatech

# Ver réplicas de un servicio
docker service ps innovatech_bff

# Logs de un servicio en Swarm
docker service logs -f innovatech_bff

# Escalar un servicio
docker service scale innovatech_bff=5
docker service scale innovatech_bff=3

# Actualizar imagen sin downtime (rolling update)
docker compose build bff
docker service update --image innovatech-bff:latest innovatech_bff

# Eliminar el stack
docker stack rm innovatech

# Eliminar volúmenes de Swarm
docker volume rm innovatech_db-tasks-data innovatech_db-projects-data innovatech_db-teams-data
```

---

## NPM — Instalación y builds

```powershell
# Instalar dependencias
npm install

# Instalar Prisma en bff-gateway (primera vez)
cd bff-gateway
npm install @prisma/client@5.22.0 prisma@5.22.0 --save

# Compilar TypeScript
npm run build

# Modo desarrollo (hot reload)
npm run dev

# Ejecutar pruebas
npm test

# Ejecutar pruebas con cobertura
npm test -- --coverage

# Generar cliente Prisma
npx prisma generate
```

---

## VERIFICACIÓN DEL SISTEMA

```powershell
# Verificar que el BFF responde
curl http://localhost/health

# Verificar load balancing (ejecutar varias veces)
curl http://localhost/whoami

# Probar Zero Trust (debe retornar 401)
curl http://localhost/api/projects

# Ver estado del monitor
curl http://localhost:4000/status

# Buscar texto en archivos (PowerShell)
Select-String -Path "bff-gateway/src/app.ts" -Pattern "etag|employeeId"

# Ver contenido de archivo
Get-Content bff-gateway/src/app.ts | Select-Object -Skip 10 -First 20
```

---

## BÚSQUEDA EN ARCHIVOS

```powershell
# PowerShell (equivalente a grep)
Select-String -Path "archivo.ts" -Pattern "patron"
Select-String -Path "carpeta/*.ts" -Pattern "patron" -Recurse

# Ver primeras/últimas líneas
Get-Content archivo.ts | Select-Object -First 20
Get-Content archivo.ts | Select-Object -Last 20
Get-Content archivo.ts | Select-Object -Skip 50 -First 30
```

---

## URLS DEL SISTEMA

| URL | Descripción |
|-----|-------------|
| http://localhost:5173 | Frontend React |
| http://localhost | API via Traefik |
| http://localhost/api-docs | Swagger unificado del BFF |
| http://localhost:4000 | Dashboard ms-monitor |
| http://localhost:8080 | Dashboard Traefik |
| http://localhost:3001/api-docs | Swagger ms-tasks |
| http://localhost:3002/api-docs | Swagger ms-projects |
| http://localhost:3003/api-docs | Swagger ms-teams |

---

## FLUJO COMPLETO — Primera instalación

```powershell
# 1. Clonar
git clone https://github.com/se-escamilla98/FULSTACK-III---INNOVATECH-SOLUTIONS.git
cd FULSTACK-III---INNOVATECH-SOLUTIONS

# 2. Generar JWT_SECRET
$bytes = New-Object byte[] 64
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$secret = [System.BitConverter]::ToString($bytes) -replace '-', ''
"VITE_BFF_URL=http://localhost`nJWT_SECRET=$secret" | Out-File -FilePath ".env" -Encoding utf8 -NoNewline

# 3. Crear .env de microservicios
"DATABASE_URL=postgresql://user_teams:password_teams@localhost:5435/db_teams" | Out-File -FilePath "ms-teams/.env" -Encoding utf8 -NoNewline
"DATABASE_URL=postgresql://user_projects:password_projects@localhost:5434/db_projects" | Out-File -FilePath "ms-projects/.env" -Encoding utf8 -NoNewline
"DATABASE_URL=postgresql://johndoe:randompassword@localhost:5433/db_tasks" | Out-File -FilePath "ms-tasks/.env" -Encoding utf8 -NoNewline
"BFF_DATABASE_URL=postgresql://user_bff:password_bff@localhost:5436/db_bff" | Out-File -FilePath "bff-gateway/.env" -Encoding utf8 -NoNewline

# 4. Instalar dependencias del BFF
cd bff-gateway && npm install && cd ..

# 5. Levantar BDs
docker compose up -d db-tasks db-projects db-teams db-bff

# 6. Esperar 10 segundos y migrar
cd ms-teams && npx prisma migrate dev --name "init"
cd ../ms-projects && npx prisma migrate dev --name "init"
cd ../ms-tasks && npx prisma migrate dev --name "init"
cd ../bff-gateway && npx prisma migrate dev --name "init_users"
cd ..

# 7. Levantar todo
docker compose up --build
```

---

## DEMO DE RESILIENCIA — Para la defensa

```powershell
# Demo 1: JWT dinámico invalida sesiones
# (estar logueado primero, luego ejecutar)
$bytes = New-Object byte[] 64
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$secret = [System.BitConverter]::ToString($bytes) -replace '-', ''
"VITE_BFF_URL=http://localhost`nJWT_SECRET=$secret" | Out-File -FilePath ".env" -Encoding utf8 -NoNewline
docker compose up --build bff
# → el frontend detecta 401 y redirige al login automáticamente

# Demo 2: Circuit Breaker
docker compose stop ms-tasks
# → llamadas a tareas retornan fallback inmediato
docker compose start ms-tasks
# → sistema se recupera solo

# Demo 3: Load balancing
# (ejecutar varias veces y observar hostname distinto)
curl http://localhost/whoami
```
