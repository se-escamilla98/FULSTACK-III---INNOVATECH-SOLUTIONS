# Innovatech Solutions — Guía de Instalación y Despliegue

**Desarrollo FullStack III · DuocUC 2026**
**Stack:** Node.js v22 · TypeScript · Prisma 5.22.0 · PostgreSQL 15 · Docker · React · JWT · Circuit Breaker · Traefik

---

## Requisitos previos

```
node --version        → v22.x.x
npm --version         → v10.x.x
docker --version      → v4.x o superior
docker compose version → v2.x.x
git --version         → cualquier versión reciente
```

---

## Clonar el repositorio

```bash
git clone https://github.com/se-escamilla98/FULSTACK-III---INNOVATECH-SOLUTIONS.git
cd FULSTACK-III---INNOVATECH-SOLUTIONS
```

---

## Configuración inicial (primera vez)

### 1. Generar JWT_SECRET y crear el .env raíz

El sistema usa un JWT secret compartido entre todos los servicios.
Ejecutar en PowerShell desde la raíz del proyecto:

```powershell
$bytes = New-Object byte[] 64
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$secret = [System.BitConverter]::ToString($bytes) -replace '-', ''
"VITE_BFF_URL=http://localhost`nJWT_SECRET=$secret" | Out-File -FilePath ".env" -Encoding utf8 -NoNewline
Write-Host "✅ .env generado"
```

> **Importante:** Cada vez que ejecutas este comando se genera un nuevo secret.
> Todos los tokens anteriores quedarán inválidos y los usuarios deberán volver a iniciar sesión.
> Esto es intencional — es la demostración de resiliencia del sistema.

### 2. Crear los .env de cada microservicio (para migraciones locales)

```powershell
"DATABASE_URL=postgresql://user_teams:password_teams@localhost:5435/db_teams" | Out-File -FilePath "ms-teams/.env" -Encoding utf8 -NoNewline

"DATABASE_URL=postgresql://user_projects:password_projects@localhost:5434/db_projects" | Out-File -FilePath "ms-projects/.env" -Encoding utf8 -NoNewline

"DATABASE_URL=postgresql://johndoe:randompassword@localhost:5433/db_tasks" | Out-File -FilePath "ms-tasks/.env" -Encoding utf8 -NoNewline

"BFF_DATABASE_URL=postgresql://user_bff:password_bff@localhost:5436/db_bff" | Out-File -FilePath "bff-gateway/.env" -Encoding utf8 -NoNewline
```

### 3. Instalar dependencias de Prisma en el BFF (primera vez)

```powershell
cd bff-gateway
npm install
cd ..
```

---

## Levantar el sistema

### Paso 1 — Levantar solo las bases de datos

```powershell
docker compose up -d db-tasks db-projects db-teams db-bff
```

Esperar 10 segundos para que PostgreSQL inicialice.

### Paso 2 — Ejecutar migraciones

```powershell
cd ms-teams
npx prisma migrate dev --name "init"

cd ../ms-projects
npx prisma migrate dev --name "init"

cd ../ms-tasks
npx prisma migrate dev --name "init"

cd ../bff-gateway
npx prisma migrate dev --name "init_users"

cd ..
```

> Las migraciones crean las tablas en PostgreSQL.
> Solo es necesario ejecutarlas la primera vez o cuando se hace `docker compose down -v`.

### Paso 3 — Levantar todos los servicios

```powershell
docker compose up --build
```

---

## URLs disponibles

| Servicio | URL |
|----------|-----|
| Frontend React | http://localhost:5173 |
| API (via Traefik) | http://localhost |
| BFF Swagger | http://localhost/api-docs |
| Monitor | http://localhost:4000 |
| Traefik Dashboard | http://localhost:8080 |

---

## Usuarios del sistema

| Usuario | Contraseña | Rol | Acceso |
|---------|-----------|-----|--------|
| admin | admin123 | Admin | CRUD completo |
| lector | lector123 | Reader | Solo lectura |
| (RUT del empleado) | (clave asignada) | Developer | Sus proyectos y tareas |

Los usuarios developer se crean desde la vista admin → Gestionar Empleados.
El RUT del empleado se convierte en su username y el admin define la clave.

---

## Arquitectura del sistema

```
[Navegador :5173]
      │
      ▼ puerto 80
[Traefik v3.0] ── Load Balancer
      │
      ▼
[BFF Gateway :3000] ── JWT · Circuit Breaker · Swagger · BD Usuarios
      │
      ├──► [MS-Projects :3002] ──► [db-projects :5434]
      ├──► [MS-Tasks    :3001] ──► [db-tasks    :5433]
      └──► [MS-Teams    :3003] ──► [db-teams    :5435]

[MS-Monitor :4000] ── Dashboard de estado de servicios
[DB-BFF     :5436] ── BD de usuarios del BFF (auth dinámica)
```

---

## Microservicios y bases de datos

| Servicio | Puerto interno | Puerto BD | Descripción |
|----------|---------------|-----------|-------------|
| ms-projects | 3002 | 5434 | Gestión de proyectos |
| ms-tasks | 3001 | 5433 | Gestión de tareas y bitácora |
| ms-teams | 3003 | 5435 | Empleados, equipos y miembros |
| bff-gateway | 3000 | 5436 | Gateway · Auth · Circuit Breaker |

---

## Roles y permisos

### Admin
- CRUD completo de empleados, equipos, proyectos y tareas
- Gestión de usuarios (crea accounts para developers al registrar empleados)
- Acceso a bitácora de todas las tareas (leer y editar)
- Búsqueda de proyectos por nombre o ID

### Developer
- Ve solo los proyectos del equipo al que pertenece
- Crea tareas asignadas automáticamente a sí mismo (por employeeId)
- Solo puede cambiar el estado de sus propias tareas
- Puede leer la bitácora de todas las tareas del proyecto
- Solo puede agregar/eliminar entradas en la bitácora de sus propias tareas

### Reader (Lector)
- Resumen general con contadores
- Proyectos con estado
- Tareas agrupadas por proyecto con acceso a bitácora (solo lectura)
- Equipos con lista de integrantes
- Tabla de trabajadores con área, equipo, RUT e ID

---

## Resiliencia y seguridad

### JWT dinámico
- El JWT_SECRET se genera al levantar el sistema
- Al reiniciar con un nuevo secret, todos los tokens quedan inválidos
- El interceptor del frontend detecta el 401 y redirige al login automáticamente

### Circuit Breaker (Opossum)
- Timeout: 3 segundos por llamada
- Umbral de error: 50% de llamadas fallidas abre el circuito
- Reset: 10 segundos en estado OPEN antes de pasar a HALF-OPEN
- Fallback: retorna lista vacía `[]` para GETs y mensaje de error para mutaciones

### Zero Trust
- Cada microservicio valida el JWT independientemente
- El BFF no es el único punto de autenticación

---

## Comandos del día a día

```powershell
# Ver estado de todos los servicios
docker compose ps

# Logs en tiempo real
docker compose logs -f

# Logs de un servicio específico
docker compose logs ms-teams -f

# Reiniciar solo el BFF (resetea circuit breakers)
docker compose restart bff

# Detener todo conservando datos
docker compose down

# Detener todo y BORRAR bases de datos
docker compose down -v

# Reconstruir y levantar solo el frontend
docker compose up --build frontend

# Ver datos en Prisma Studio (BD de equipos)
docker compose exec ms-teams npx prisma studio
```

---

## Solución de problemas comunes

### Circuit breaker activo — employees no se crean
```powershell
docker compose restart bff
```

### Los datos desaparecieron al reiniciar
Los volúmenes de PostgreSQL persisten datos entre reinicios con `docker compose down`.
Si usaste `docker compose down -v`, las BDs se limpiaron — ejecutar migraciones nuevamente.

### 401 en todas las requests tras reiniciar
El JWT_SECRET cambió. Hacer logout y login nuevamente.

### El dropdown de empleados aparece vacío
Limpiar caché del navegador: `Ctrl+Shift+R`

### Error de CORS en `/api/projects`
El BFF tiene el circuit breaker abierto. Reiniciar:
```powershell
docker compose restart bff
```

### Error "relation does not exist"
Las migraciones no se ejecutaron. Ver Paso 2 de instalación.

---

## Estructura del proyecto

```
INNOVATECH-SOLUTIONS/
├── docker-compose.yml          ← orquestación completa
├── .env                        ← JWT_SECRET + VITE_BFF_URL (NO subir a git)
├── generate-env.ps1            ← script para generar JWT_SECRET
├── traefik/
│   └── dynamic.yml             ← configuración del load balancer
├── bff-gateway/
│   ├── prisma/schema.prisma    ← modelo User para auth dinámica
│   └── src/
│       ├── app.ts
│       ├── auth/auth.routes.ts ← login + CRUD usuarios
│       ├── config/jwt.config.ts
│       └── services/           ← circuit breakers por microservicio
├── ms-projects/
│   ├── prisma/schema.prisma    ← Project (id, name, status, teamId, area)
│   └── src/
├── ms-tasks/
│   ├── prisma/schema.prisma    ← Task + TaskLog (bitácora)
│   └── src/
├── ms-teams/
│   ├── prisma/schema.prisma    ← Employee + Team + Member
│   └── src/
├── frontend-web/
│   └── src/
│       ├── App.tsx             ← auth + tabs por rol
│       ├── api/bffClient.ts    ← interceptor 401/403
│       └── views/
│           ├── ProjectsView.tsx
│           ├── TasksView.tsx
│           ├── TeamsView.tsx
│           ├── DeveloperView.tsx
│           └── ReaderView.tsx
└── ms-monitor/                 ← dashboard de estado en :4000
```

---

*Innovatech Solutions · Desarrollo FullStack III · DuocUC 2026*
*Sebastián Escamilla · Livan Sepúlveda*
