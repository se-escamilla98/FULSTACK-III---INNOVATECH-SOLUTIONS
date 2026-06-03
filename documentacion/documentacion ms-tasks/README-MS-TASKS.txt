==========================================================
GUÍA DE IMPLEMENTACIÓN: MICROSERVICIO DE TAREAS (MS-TASKS)
==========================================================

Este documento detalla los pasos exactos para levantar el microservicio desde cero,
utilizando la configuración estable (Prisma v5) y Docker.

1. ESTRUCTURA DE CARPETAS
-------------------------
Crea la siguiente jerarquía de directorios dentro de la carpeta 'ms-tasks':

ms-tasks/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── controllers/
│   │   └── task.controller.ts
│   ├── services/
│   │   └── task.service.ts
│   └── app.ts
├── .env
├── docker-compose.yml
├── package.json
└── tsconfig.json

2. CONFIGURACIÓN DE DEPENDENCIAS (package.json)
----------------------------------------------
Asegúrate de instalar estas versiones específicas para evitar errores de compatibilidad:

> npm install express @prisma/client@5.10.2 dotenv
> npm install -D typescript ts-node-dev @types/express @types/node prisma@5.10.2

3. ARCHIVO DE CONFIGURACIÓN: .env
---------------------------------
Crea un archivo llamado '.env' en la raíz con la URL de conexión (ajustada para Docker):

DATABASE_URL="postgresql://johndoe:randompassword@localhost:5433/mydb?schema=public"

4. CONFIGURACIÓN DE PRISMA (prisma/schema.prisma)
------------------------------------------------
Es CRÍTICO que el bloque datasource incluya la función env():

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Task {
  id          String   @id @default(uuid())
  name        String
  description String?
  status      String   @default("PENDING")
  area        String?
  assignedTo  String?
  teamId      String?
  projectId   String
  createdAt   DateTime @default(now())
}

5. INSTANCIACIÓN DEL CLIENTE (src/services/task.service.ts)
----------------------------------------------------------
Para la versión 5.10.2, usa la inicialización simple:

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

6. PASOS DE DESPLIEGUE (ORDEN ESTRICTO)
--------------------------------------
Sigue estos comandos en la terminal:

Paso A: Levantar Base de Datos (Docker)
   > docker-compose up -d

Paso B: Generar Cliente de Prisma
   > npx prisma generate

Paso C: Sincronizar Tablas (Migration)
   > npx prisma migrate dev --name init

Paso D: Iniciar Microservicio
   > npm run dev

7. VERIFICACIÓN
---------------
Si todo es correcto, verás el mensaje:
"🚀 Microservicio de Tareas corriendo en puerto 3001"

Prueba en el navegador: http://localhost:3001/tasks/project/any-id
Resultado esperado: []
==========================================================