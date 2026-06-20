# MS-Teams — Innovatech Solutions

Microservicio de gestion de equipos de trabajo. Cada equipo tiene un area, un lider y puede activarse o desactivarse.

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
npm run dev     # Desarrollo
npm start       # Produccion (requiere npm run build)
```

El servicio inicia en el puerto **3003**.

## Modelo de datos

```
Team {
  id          String     @id @default(uuid())
  name        String
  description String
  status      TeamStatus @default(ACTIVE)
  leaderId    String     @default(uuid())
  area        String
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

enum TeamStatus { ACTIVE, INACTIVE }
```

## Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | /teams | Crear equipo |
| GET | /teams | Listar todos |
| GET | /teams/:id | Obtener por ID |
| PATCH | /teams/:id | Actualizar datos |
| PATCH | /teams/:id/status | Cambiar estado |
| DELETE | /teams/:id | Eliminar |
| GET | /health | Health check |

## Validaciones (TeamFactory)

Campos obligatorios: name, description, area, leaderId. Todo equipo inicia con estado ACTIVE.

## Pruebas

```bash
npm test
npx jest --coverage --forceExit
```

18 tests: 6 factory + 12 service. Cobertura: 100% en todas las metricas.

## Variables de entorno

| Variable | Descripcion |
|----------|-------------|
| DATABASE_URL | postgresql://user:pass@host:5432/db |
| JWT_SECRET | Secreto compartido para verificar JWT |
