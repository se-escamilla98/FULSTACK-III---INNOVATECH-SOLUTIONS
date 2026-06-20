# MS-Tasks — Innovatech Solutions

Microservicio de gestion de tareas. Cada tarea esta asociada a un proyecto y un equipo. El TaskFactory valida 5 campos obligatorios antes de la creacion.

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

El servicio inicia en el puerto **3001**.

## Modelo de datos

```
Task {
  id          String     @id @default(uuid())
  name        String
  description String?
  area        String
  status      TaskStatus @default(PENDING)
  assignedTo  String
  teamId      String
  projectId   String
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

enum TaskStatus { PENDING, IN_PROGRESS, COMPLETED, BLOCKED }
```

## Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | /tasks | Crear tarea |
| GET | /tasks/:id | Obtener por ID |
| GET | /tasks/project/:projectId | Tareas de un proyecto |
| PATCH | /tasks/:id | Actualizar tarea |
| DELETE | /tasks/:id | Eliminar tarea |
| GET | /health | Health check |

## Validaciones (TaskFactory)

Campos obligatorios: name, projectId, area, assignedTo, teamId. El unico campo opcional es description. Toda tarea inicia con estado PENDING.

## Pruebas

```bash
npm test
npx jest --coverage --forceExit
```

18 tests: 7 factory + 11 service. Cobertura: 100% en todas las metricas.

## Variables de entorno

| Variable | Descripcion |
|----------|-------------|
| DATABASE_URL | postgresql://user:pass@host:5432/db |
| JWT_SECRET | Secreto compartido para verificar JWT |
