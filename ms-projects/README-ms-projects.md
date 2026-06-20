# MS-Projects — Innovatech Solutions

Microservicio de gestion de proyectos. Maneja el ciclo de vida completo de proyectos con la regla de negocio critica: no se puede completar un proyecto si tiene tareas pendientes en ms-tasks.

## Tecnologias

- Node.js v22 + TypeScript v5
- Express v4.19.2
- Prisma v5.22.0 (PostgreSQL 15)
- Jest + ts-jest (testing)

## Instalacion

```bash
npm install
npx prisma generate
npx prisma migrate dev
```

## Ejecucion

```bash
# Desarrollo
npm run dev

# Produccion
npm run build
npm start
```

El servicio inicia en el puerto **3002**.

## Modelo de datos

```
Project {
  id          String   @id @default(uuid())
  name        String
  description String
  status      String   @default("PLANNED")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

Estados: PLANNED → IN_PROGRESS → COMPLETED / ON_HOLD / CANCELLED

## Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | /projects | Crear proyecto |
| GET | /projects | Listar todos |
| GET | /projects/:id | Obtener por ID |
| PATCH | /projects/:id | Actualizar datos |
| PATCH | /projects/:id/status | Cambiar estado |
| DELETE | /projects/:id | Eliminar |
| GET | /health | Health check |

## Regla de negocio

Al cambiar estado a COMPLETED, el servicio consulta a ms-tasks para verificar que no existan tareas pendientes. Si ms-tasks no esta disponible, la operacion se bloquea por seguridad.

## Pruebas

```bash
npm test                           # Ejecutar tests
npx jest --coverage --forceExit    # Con cobertura
```

23 tests: 7 factory + 16 service. Cobertura: 100% Stmts, 96.15% Branch.

## Variables de entorno

| Variable | Descripcion |
|----------|-------------|
| DATABASE_URL | postgresql://user:pass@host:5432/db |
| JWT_SECRET | Secreto compartido para verificar JWT |
| MS_TASKS_URL | URL de ms-tasks (para verificar tareas) |
