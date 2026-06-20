# GUÍA DE EJECUCIÓN DE PRUEBAS — VIDEO
## Innovatech Solutions | Parcial 3 | DuocUC 2026

---

## ANTES DE GRABAR

### Requisitos previos
1. Tener el proyecto clonado y las dependencias instaladas (npm install en cada servicio)
2. NO necesitas Docker corriendo — las pruebas usan mocks
3. Tener 4 terminales abiertas en VS Code (una por servicio)
4. Asegurarte de que `npm test` funciona en los 4 servicios

### Orden de ejecución recomendado para el video
1. BFF Gateway (tiene los 3 tipos de prueba)
2. ms-projects (la regla de negocio más importante)
3. ms-tasks (valida el Factory nuevo)
4. ms-teams (completa la cobertura)

---

## PASO 1 — BFF GATEWAY (22 tests)

### Comando
```bash
cd bff-gateway
npm test
```

### Resultado esperado
```
 PASS  src/__tests__/unit/auth.middleware.test.ts
  verifyToken middleware
    √ debe permitir acceso con token valido (Bearer)
    √ debe permitir acceso con token sin prefijo Bearer
    √ debe retornar 401 si no se envia token
    √ debe retornar 403 si el token es invalido
    √ debe retornar 403 si el token esta expirado
    √ debe ser tolerante a "bearer" en minusculas

 PASS  src/__tests__/e2e/flow.test.ts
  E2E: Flujo completo de negocio
    √ Paso 1: Login y obtener JWT
    √ Paso 2: Ruta protegida rechaza acceso sin token
    √ Paso 3: Crear proyecto via BFF
    √ Paso 4: Crear tarea asociada al proyecto
    √ Paso 5: Completar proyecto FALLA porque hay tarea pendiente
    √ Paso 6: Completar la tarea primero
    √ Paso 7: Ahora completar proyecto EXITOSO
    √ Paso 8: Circuit Breaker retorna fallback si MS cae

 PASS  src/__tests__/integration/auth.routes.test.ts
  POST /auth/login
    √ debe autenticar con credenciales validas y retornar JWT
    √ debe autenticar al usuario sebastian
    √ debe autenticar al usuario lector con rol reader
    √ debe rechazar password incorrecto con 401
    √ debe rechazar usuario inexistente con 401
    √ debe retornar 400 si falta username
    √ debe retornar 400 si falta password
    √ debe ser case-insensitive con el username

Test Suites: 4 passed, 4 total
Tests:       22 passed (+ 1 smoke), 22 total
```

### Qué explicar en el video

**Prueba unitaria del middleware (6 tests):**
"Estas pruebas validan el middleware JWT de forma aislada, sin levantar Express. Probamos que acepta tokens válidos con y sin prefijo Bearer, que rechaza peticiones sin token con 401, que rechaza tokens inválidos y expirados con 403, y que es tolerante a mayúsculas y minúsculas en el header."

**Prueba de integración del login (8 tests):**
"Estas pruebas levantan un Express real con Supertest y prueban el flujo completo de login. Verificamos que los tres usuarios (admin, sebastian, lector) se autentican correctamente con bcrypt, que las credenciales inválidas se rechazan con 401, y que los campos requeridos se validan con 400."

**Prueba E2E del flujo de negocio (8 tests):**
"Este es el test más importante. Simula el flujo completo paso a paso: login, verificación de que las rutas protegidas rechazan acceso sin token, creación de un proyecto a través del BFF, creación de una tarea asociada, intento de completar el proyecto que FALLA porque la tarea está pendiente — esta es nuestra regla de negocio crítica — luego completamos la tarea y volvemos a intentar completar el proyecto, que ahora SÍ funciona. El último paso verifica que el Circuit Breaker retorna un fallback cuando un microservicio no responde."

---

## PASO 2 — MS-PROJECTS (23 tests)

### Comando
```bash
cd ms-projects
npm test
```

### Resultado esperado
```
 PASS  src/__tests__/unit/project.factory.test.ts
  ProjectFactory.create
    √ debe crear un proyecto con estado PLANNED por defecto
    √ debe lanzar error si el nombre esta vacio
    √ debe lanzar error si el nombre es solo espacios
    √ debe lanzar error si la descripcion esta vacia
    √ debe lanzar error si la descripcion es solo espacios
    √ debe lanzar error si el nombre es null/undefined
    √ debe lanzar error si la descripcion es null/undefined

 PASS  src/__tests__/unit/project.service.test.ts
  ProjectService
    createProject
      √ debe crear un proyecto con estado PLANNED
      √ debe lanzar error si el nombre esta vacio (via Factory)
    getAllProjects
      √ debe retornar la lista de proyectos
      √ debe retornar array vacio si no hay proyectos
    getProjectById
      √ debe retornar el proyecto si existe
      √ debe retornar null si no existe
    updateProject
      √ debe actualizar nombre y descripcion
      √ debe lanzar error si el nombre queda vacio
      √ debe lanzar error si la descripcion queda vacia
      √ debe lanzar error si el proyecto no existe
    updateStatus
      √ debe cambiar estado a IN_PROGRESS sin validar tareas
      √ debe permitir COMPLETED si no hay tareas pendientes
      √ debe rechazar COMPLETED si hay tareas pendientes
      √ debe rechazar COMPLETED si ms-tasks no esta disponible
    deleteProject
      √ debe eliminar el proyecto
      √ debe lanzar error si el proyecto no existe

Test Suites: 2 passed, 2 total
Tests:       23 passed, 23 total
```

### Qué explicar en el video

**Factory (7 tests):**
"El ProjectFactory valida que el nombre y la descripción sean obligatorios, y asigna el estado inicial PLANNED automáticamente. Probamos strings vacíos, solo espacios, null y undefined."

**Service (16 tests):**
"El ProjectService tiene 16 pruebas que cubren todas las operaciones CRUD con Prisma mockeado. Los 4 tests más importantes están en updateStatus: verificamos que cambiar a IN_PROGRESS no consulta tareas, que COMPLETED se permite cuando todas las tareas están completas, que COMPLETED se RECHAZA cuando hay tareas pendientes, y que si ms-tasks no está disponible también se bloquea por seguridad."

---

## PASO 3 — MS-TASKS (18 tests)

### Comando
```bash
cd ms-tasks
npm test
```

### Resultado esperado
```
 PASS  src/__tests__/unit/task.factoy.test.ts
  TaskFactory.create
    √ debe crear una tarea con estado PENDING por defecto
    √ debe lanzar error si el nombre esta vacio
    √ debe lanzar error si falta el projectId
    √ debe lanzar error si falta el area
    √ debe lanzar error si falta el assignedTo
    √ debe lanzar error si falta el teamId
    √ debe aceptar description vacia (campo opcional)

 PASS  src/__tests__/unit/task.service.test.ts
  TaskService
    createTask
      √ debe crear una tarea con estado PENDING
      √ debe lanzar error si falta el nombre (via Factory)
      √ debe lanzar error si falta el projectId (via Factory)
    getTasksByProject
      √ debe retornar las tareas de un proyecto
      √ debe retornar array vacio si no hay tareas
    getTaskById
      √ debe retornar la tarea si existe
      √ debe retornar null si no existe
    updateTask
      √ debe actualizar la tarea
      √ debe lanzar error si la tarea no existe
    deleteTask
      √ debe eliminar la tarea
      √ debe lanzar error si la tarea no existe

Test Suites: 2 passed, 2 total
Tests:       18 passed, 18 total
```

### Qué explicar en el video

**Factory (7 tests):**
"El TaskFactory es el más estricto: valida 5 campos obligatorios — name, projectId, area, assignedTo y teamId. El único campo opcional es description. Toda tarea inicia con estado PENDING."

**Service (11 tests):**
"El TaskService cubre el CRUD completo. Destacar que createTask pasa por el Factory antes de llegar a Prisma, garantizando que nunca se cree una tarea sin los campos obligatorios."

---

## PASO 4 — MS-TEAMS (18 tests)

### Comando
```bash
cd ms-teams
npm test
```

### Resultado esperado
```
 PASS  src/__tests__/unit/team.factory.test.ts
  TeamFactory.create
    √ debe crear un equipo con estado ACTIVE por defecto
    √ debe lanzar error si el nombre esta vacio
    √ debe lanzar error si la descripcion esta vacia
    √ debe lanzar error si el area esta vacia
    √ debe lanzar error si el leaderId esta vacio
    √ debe lanzar error si el nombre es solo espacios

 PASS  src/__tests__/unit/team.service.test.ts
  TeamService
    createTeam
      √ debe crear un equipo con estado ACTIVE
      √ debe lanzar error si falta el nombre (via Factory)
    getAll
      √ debe retornar la lista de equipos
      √ debe retornar array vacio si no hay equipos
    getTeamById
      √ debe retornar el equipo si existe
      √ debe retornar null si no existe
    updateStatus
      √ debe cambiar el estado del equipo
      √ debe lanzar error si el equipo no existe
    updateTeam
      √ debe actualizar datos del equipo
      √ debe lanzar error si el equipo no existe
    deleteTeam
      √ debe eliminar el equipo
      √ debe lanzar error si el equipo no existe

Test Suites: 2 passed, 2 total
Tests:       18 passed, 18 total
```

### Qué explicar en el video

**Factory (6 tests):**
"El TeamFactory valida 4 campos obligatorios — name, description, area y leaderId — y asigna el estado ACTIVE por defecto."

**Service (12 tests):**
"El TeamService cubre CRUD completo incluyendo updateStatus y updateTeam como operaciones separadas. Verificamos que las actualizaciones de equipo inexistente retornan error descriptivo."

---

## RESUMEN FINAL PARA EL VIDEO

### Tabla resumen (mostrar al final)

| Servicio | Unitarias | Integración | E2E | Total |
|----------|-----------|-------------|-----|-------|
| BFF Gateway | 6 | 8 | 8 | 22 |
| ms-projects | 23 | — | — | 23 |
| ms-tasks | 18 | — | — | 18 |
| ms-teams | 18 | — | — | 18 |
| **Total** | **65** | **8** | **8** | **82** |

### Frase de cierre para el video
"En total tenemos 82 pruebas automatizadas que cubren los tres tipos solicitados: unitarias para las capas internas de cada microservicio, de integración para el flujo de autenticación, y end-to-end para el flujo completo de negocio incluyendo la regla crítica de tareas pendientes y el Circuit Breaker. Todas se ejecutan sin Docker ni base de datos, usando mocks de Prisma y axios, y corren en menos de 5 segundos."

---

## TIPS PARA LA GRABACIÓN

1. **Tamaño de fuente**: Aumentar la fuente del terminal a 16px para que se lea bien en el video
2. **Limpiar terminal**: Ejecutar `cls` o `clear` antes de cada `npm test`
3. **Pausar**: Después de cada resultado, pausar 3-4 segundos para que el espectador lea
4. **No correr**: Mejor mostrar 2 servicios bien explicados que los 4 corriendo sin explicación
5. **Si falla algo**: Tener el video pregrabado como respaldo. Los tests deben estar todos en verde ANTES de grabar






Ese mensaje que se ve en la consola es el log interno del ProjectService cuando detecta que ms-tasks no está disponible. Aparece porque estamos testeando exactamente ese escenario: ¿qué pasa si alguien intenta completar un proyecto pero el microservicio de tareas está caído?
Nuestro servicio tiene un principio de seguridad conservador: si no puede verificar si hay tareas pendientes porque ms-tasks no responde, bloquea la operación. Prefiere decir 'no puedo completar esto' a dejar pasar un proyecto con tareas sin terminar.
El console.error es el log que el servicio escribe cuando detecta esa situación. En producción ese log serviría para que el equipo de operaciones sepa que ms-tasks tuvo un problema. En el test, simplemente confirma que el código pasó por esa rama del catch.
El test en sí pasa en verde porque verifica que efectivamente se lanzó el error 'tareas pendientes' — que es exactamente lo que queremos que pase cuando ms-tasks no está disponible
