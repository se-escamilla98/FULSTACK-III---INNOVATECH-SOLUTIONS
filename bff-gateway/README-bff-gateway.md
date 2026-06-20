# BFF Gateway — Innovatech Solutions

Punto de entrada unico del sistema. Orquesta la comunicacion entre el frontend y los microservicios, gestiona la autenticacion con bcrypt + JWT, y protege cada llamada con Circuit Breaker (Opossum).

## Tecnologias

- Node.js v22 + TypeScript v5
- Express v4.19.2
- jsonwebtoken v9 + bcryptjs (autenticacion)
- Opossum v9 (Circuit Breaker)
- Swagger (swagger-jsdoc + swagger-ui-express)
- Jest + Supertest (testing)

## Instalacion

```bash
npm install
```

## Ejecucion

```bash
# Desarrollo
npm run dev

# Produccion
npm run build
npm start
```

El servicio inicia en el puerto **3000**.

## Endpoints

| Metodo | Ruta | Descripcion | Auth |
|--------|------|-------------|------|
| POST | /auth/login | Login con username/password | No |
| GET | /health | Health check | No |
| GET | /whoami | Identificar instancia (balanceo) | No |
| GET | /api/projects | Listar proyectos | JWT |
| POST | /api/projects | Crear proyecto | JWT |
| PATCH | /api/projects/:id/status | Cambiar estado proyecto | JWT |
| GET | /api/projects/:id/tasks | Tareas de un proyecto | JWT |
| POST | /api/tasks | Crear tarea | JWT |
| PATCH | /api/tasks/:id | Actualizar tarea | JWT |
| DELETE | /api/tasks/:id | Eliminar tarea | JWT |
| GET | /api/teams | Listar equipos | JWT |
| POST | /api/teams | Crear equipo | JWT |

Swagger: `http://localhost:3000/api-docs`

## Usuarios

| Usuario | Password | Rol |
|---------|----------|-----|
| admin | admin123 | admin |
| sebastian | duoc2026 | developer |
| lector | lector123 | reader |

## Pruebas

```bash
npm test                           # Ejecutar tests
npx jest --coverage --forceExit    # Con cobertura
```

22 tests: 6 unitarios (middleware JWT) + 8 integracion (login) + 8 end-to-end (flujo completo).

## Variables de entorno

| Variable | Descripcion | Valor por defecto |
|----------|-------------|-------------------|
| JWT_SECRET | Secreto para firmar JWT | innovatech_secret_2026 |
| MS_PROJECTS_URL | URL de ms-projects | http://ms-projects:3002 |
| MS_TASKS_URL | URL de ms-tasks | http://ms-tasks:3001 |
| MS_TEAMS_URL | URL de ms-teams | http://ms-teams:3003 |
