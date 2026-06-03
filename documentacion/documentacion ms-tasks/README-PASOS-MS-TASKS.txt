==========================================================================
   GUÍA TÉCNICA DEFINITIVA: MICROSERVICIO DE TAREAS (MS-TASKS) - CRUD COMPLETO
==========================================================================
Este documento detalla los pasos exactos para replicar el microservicio funcional
con todas sus operaciones (Crear, Leer, Actualizar y Eliminar).

1. PREPARACIÓN DEL ENTORNO
--------------------------
- Crear carpeta: 'mkdir ms-tasks' y entrar en ella 'cd ms-tasks'.
- Inicializar Node: 'npm init -y'.
- Instalar Dependencias:
  > npm install express @prisma/client@5.10.2 dotenv
  > npm install -D typescript ts-node-dev @types/express @types/node prisma@5.10.2
- Inicializar TypeScript: 'npx tsc --init'.

2. CONFIGURACIÓN DE INFRAESTRUCTURA (Docker & .env)
---------------------------------------------------
- Crear 'docker-compose.yml' con Postgres en puerto 5433.
- Crear '.env' con:
  PORT=3001
  DATABASE_URL="postgresql://johndoe:randompassword@localhost:5433/mydb?schema=public"

3. MODELADO DE DATOS (Prisma)
-----------------------------
- Crear 'prisma/schema.prisma' con el modelo 'Task' (id, name, status, projectId, etc.).
- Comando de conexión: 'npx prisma generate'.
- Comando de creación de tablas: 'npx prisma migrate dev --name init'.

4. IMPLEMENTACIÓN DEL CÓDIGO (Orden sugerido)
---------------------------------------------
A. src/services/task.service.ts: Instanciar PrismaClient y crear métodos:
   - createTask, getTasksByProject, updateTask (PATCH), deleteTask (DELETE).
B. src/controllers/task.controller.ts: Manejar req/res y llamar al servicio.
C. src/app.ts: Configurar Express y registrar las 4 rutas principales.

5. COMANDOS DE EJECUCIÓN
------------------------
1. Levantar DB: 'docker-compose up -d'
2. Iniciar App: 'npm run dev'

6. PRUEBAS EN POSTMAN
---------------------
- POST /tasks (Crear)
- GET /tasks/project/:projectId (Listar)
- PATCH /tasks/:id (Actualizar parcial)
- DELETE /tasks/:id (Eliminar)
==========================================================================