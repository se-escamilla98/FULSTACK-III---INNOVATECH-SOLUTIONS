# GUÍA DE EJECUCIÓN DE PRUEBAS — VIDEO
## Innovatech Solutions | Parcial 3 | DuocUC 2026

---

## ANTES DE GRABAR

### Requisitos previos
1. Tener el proyecto clonado y las dependencias instaladas (npm install en cada servicio)
2. Para pruebas Jest/Supertest: **NO necesitas Docker** — usan mocks
3. Para pruebas Cypress: **SÍ necesitas Docker corriendo** con todos los servicios healthy
4. Tener 4 terminales abiertas en VS Code (una por servicio) para Jest
5. Asegurarte de que `npm test` funciona en los 4 servicios antes de grabar

### Orden de ejecución recomendado para el video
1. BFF Gateway (tiene los 3 tipos de prueba Jest)
2. ms-projects (la regla de negocio más importante)
3. ms-tasks (valida el Factory)
4. ms-teams (completa la cobertura)
5. **Cypress E2E** — flujo completo del frontend (admin → developer → lector)

---

## PASO 1 — BFF GATEWAY (22 tests Jest)

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
Tests:       22 passed, 22 total
```

### Qué explicar en el video

**Prueba unitaria del middleware (6 tests):**
"Estas pruebas validan el middleware JWT de forma aislada, sin levantar Express. Probamos que acepta tokens válidos con y sin prefijo Bearer, que rechaza peticiones sin token con 401, que rechaza tokens inválidos y expirados con 403, y que es tolerante a mayúsculas y minúsculas en el header."

**Prueba de integración del login (8 tests):**
"Estas pruebas levantan un Express real con Supertest y prueban el flujo completo de login. Verificamos que los tres usuarios (admin, sebastian, lector) se autentican correctamente con bcrypt, que las credenciales inválidas se rechazan con 401, y que los campos requeridos se validan con 400."

**Prueba E2E del flujo de negocio (8 tests):**
"Este es el test más importante. Simula el flujo completo paso a paso: login, verificación de que las rutas protegidas rechazan acceso sin token, creación de un proyecto a través del BFF, creación de una tarea asociada, intento de completar el proyecto que FALLA porque la tarea está pendiente — esta es nuestra regla de negocio crítica — luego completamos la tarea y volvemos a intentar completar el proyecto, que ahora SÍ funciona. El último paso verifica que el Circuit Breaker retorna un fallback cuando un microservicio no responde."

---

## PASO 2 — MS-PROJECTS (23 tests Jest)

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

## PASO 3 — MS-TASKS (18 tests Jest)

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

## PASO 4 — MS-TEAMS (18 tests Jest)

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

## PASO 5 — CYPRESS E2E FRONTEND (29 tests)

### Prerequisito
El sistema Docker debe estar corriendo completo antes de ejecutar Cypress:
```powershell
# Desde la raíz del proyecto
docker compose up --build
# Esperar a que todos los servicios estén healthy
```

### Estructura de archivos Cypress
```
frontend-web/
├── cypress.config.ts
└── cypress/
    ├── support/
    │   ├── commands.ts    ← comandos personalizados (login, logout, goToTab)
    │   └── e2e.ts
    └── e2e/
        ├── 01_admin_flujo_completo.cy.ts   (10 tests)
        ├── 02_developer_flujo.cy.ts        (11 tests)
        └── 03_reader_flujo.cy.ts           (10 tests)
```

### Comandos de ejecución

```powershell
cd frontend-web

# Correr todas las suites (headless — genera screenshots)
npx cypress run --spec "cypress/e2e/*.cy.ts"

# Correr solo una suite
npx cypress run --spec "cypress/e2e/01_admin_flujo_completo.cy.ts"
npx cypress run --spec "cypress/e2e/02_developer_flujo.cy.ts" --env devRut="12.345.678-9",devPassword="dev123"
npx cypress run --spec "cypress/e2e/03_reader_flujo.cy.ts"

# Modo visual (abre navegador — ideal para demo)
npx cypress open
```

### Resultado esperado

```
  Suite 1 — Administrador: flujo completo
    √ 1.1 Login como admin y verificar badge de rol
    √ 1.2 Crear empleado 1 (Carlos Mendoza) con clave de usuario
    √ 1.3 Crear empleado 2 (Ana Torres) con clave de usuario
    √ 1.4 Crear equipo con líder e integrantes desde el modal
    √ 1.5 Verificar que el líder se agrega automáticamente como Tech Lead
    √ 1.6 Crear proyecto y asignar equipo desde Proyectos
    √ 1.7 Buscar proyecto por nombre en la barra de búsqueda
    √ 1.8 Crear tarea asignada a un miembro del equipo
    √ 1.9 Cambiar estado de tarea a IN_PROGRESS
    √ 1.10 Agregar entrada a la bitácora de la tarea

  Suite 2 — Developer: proyectos, tareas y bitácora
    √ 2.1 Login como developer con RUT y ver badge Developer
    √ 2.2 Developer ve solo los proyectos de su equipo
    √ 2.3 Developer no ve tab de Proyectos ni Tareas del admin
    √ 2.4 Entrar a un proyecto asignado y ver kanban de tareas
    √ 2.5 Crear tarea — se asigna automáticamente al developer
    √ 2.6 Tarea propia muestra badge "Mi tarea" y borde verde
    √ 2.7 Developer puede cambiar estado de su propia tarea
    √ 2.8 Developer NO puede cambiar estado de tarea ajena (Solo lectura)
    √ 2.9 Developer puede agregar entrada en bitácora de su tarea
    √ 2.10 Developer puede VER bitácora de tarea ajena pero NO agregar
    √ 2.11 Volver a lista de proyectos con botón Volver

  Suite 3 — Lector: módulo de reportes completo
    √ 3.1 Login como lector y ver badge Lector
    √ 3.2 Lector NO ve tabs de Proyectos, Tareas, Equipos ni Mi Trabajo
    √ 3.3 Ver resumen general con contadores
    √ 3.4 Ver listado de proyectos con estado
    √ 3.5 Ver tareas agrupadas por proyecto
    √ 3.6 Leer bitácora de una tarea — no puede agregar entradas
    √ 3.7 Ver equipos con lista de integrantes y roles
    √ 3.8 Ver tabla completa de trabajadores con área y equipo
    √ 3.9 Verificar que no existen botones de creación o edición
    √ 3.10 Botón Actualizar recarga los datos correctamente

  3 suites, 31 tests passed
```

### Screenshots generados

Los screenshots se guardan automáticamente en `frontend-web/cypress/screenshots/`:
```
cypress/screenshots/
  01_admin_flujo_completo.cy.ts/
    01-login-admin-formulario.png
    01-login-admin-exitoso.png
    02-panel-empleados-abierto.png
    02-formulario-empleado-1-completo.png
    02-empleado-1-creado.png
    03-empleado-2-creado.png
    04-modal-nuevo-equipo-abierto.png
    04-modal-equipo-con-integrante.png
    04-equipo-creado-con-integrantes.png
    05-lider-como-tech-lead.png
    06-modal-nuevo-proyecto.png
    06-formulario-proyecto-completo.png
    06-proyecto-creado-con-equipo.png
    07-busqueda-proyecto-por-nombre.png
    08-tareas-proyecto-seleccionado.png
    08-formulario-tarea-completo.png
    08-tarea-creada-exitosamente.png
    09-tarea-estado-en-progreso.png
    10-bitacora-abierta-admin.png
    10-bitacora-entrada-agregada-admin.png
  02_developer_flujo.cy.ts/
    11-login-developer-formulario.png
    11-login-developer-exitoso.png
    12-developer-mis-proyectos.png
    12-developer-sin-tabs-admin.png
    13-developer-kanban-tareas.png
    14-developer-modal-nueva-tarea.png
    14-developer-formulario-tarea-completo.png
    14-developer-tarea-creada.png
    15-developer-tarea-propia-marcada.png
    15-developer-estado-cambiado.png
    16-developer-tarea-ajena-solo-lectura.png
    17-developer-bitacora-propia-abierta.png
    17-developer-bitacora-entrada-agregada.png
    18-developer-bitacora-ajena-solo-lectura.png
    19-developer-volver-proyectos.png
  03_reader_flujo.cy.ts/
    20-login-lector-formulario.png
    20-login-lector-exitoso.png
    21-lector-sin-tabs-admin.png
    22-lector-resumen-contadores.png
    23-lector-lista-proyectos.png
    24-lector-tareas-por-proyecto.png
    25-lector-bitacora-abierta.png
    25-lector-bitacora-solo-lectura.png
    26-lector-lista-equipos.png
    26-lector-equipos-con-integrantes.png
    27-lector-tabla-trabajadores.png
    27-lector-trabajadores-columnas-completas.png
    28-lector-sin-botones-accion.png
    29-lector-datos-actualizados.png
```

### Qué explicar en el video

**Suite 1 — Admin:**
"La Suite 1 cubre el flujo completo del administrador. Primero creamos dos empleados con sus respectivas claves de acceso — al registrar el empleado, el sistema crea automáticamente su usuario con el RUT como username. Luego creamos un equipo y verificamos que el líder aparece automáticamente como miembro con rol Tech Lead. Creamos el proyecto y lo asignamos al equipo. Finalmente creamos una tarea desde la vista de tareas del admin, la asignamos a un miembro del equipo y agregamos una entrada a su bitácora."

**Suite 2 — Developer:**
"La Suite 2 valida las restricciones del rol developer. Iniciamos sesión con el RUT del empleado — el campo formatea automáticamente el RUT mientras se escribe. El developer solo ve los proyectos del equipo al que pertenece y no tiene acceso a las tabs de admin. Al crear una tarea, se asigna automáticamente a su cuenta sin campo manual. Verificamos que puede cambiar el estado de sus propias tareas pero las tareas ajenas muestran 'Solo lectura'. En la bitácora puede escribir en sus propias tareas pero solo leer en las ajenas."

**Suite 3 — Lector:**
"La Suite 3 verifica que el lector tiene acceso completo de solo lectura. Ve el resumen con contadores, la lista de proyectos, las tareas agrupadas por proyecto con acceso a bitácoras en modo lectura, los equipos con sus integrantes, y la tabla de trabajadores que cruza datos de empleados con equipos para mostrar el área de trabajo de cada persona. En ningún momento aparecen botones de creación, edición o eliminación."

### Orden correcto de ejecución
```
Suite 1 (admin) crea datos → Suite 2 (developer) usa esos datos → Suite 3 (lector) lee esos datos
```

> **Importante:** La Suite 2 necesita el RUT y contraseña del developer creado en la Suite 1.
> Actualizar en `02_developer_flujo.cy.ts` o pasar como variables de entorno:
> ```powershell
> npx cypress run --env devRut="XX.XXX.XXX-X",devPassword="dev123"
> ```

---

## RESUMEN FINAL PARA EL VIDEO

### Tabla resumen completa (mostrar al final)

| Tipo | Herramienta | Servicio | Tests | Descripción |
|------|-------------|----------|-------|-------------|
| Unitaria | Jest | BFF | 6 | Middleware JWT |
| Integración | Jest/Supertest | BFF | 8 | Flujo de login |
| E2E backend | Jest | BFF | 8 | Flujo negocio completo |
| Unitaria | Jest | ms-projects | 23 | Factory + Service |
| Unitaria | Jest | ms-tasks | 18 | Factory + Service |
| Unitaria | Jest | ms-teams | 18 | Factory + Service |
| E2E frontend | Cypress | Frontend | 31 | Flujo admin+dev+lector |
| **Total** | | | **112** | |

### Frase de cierre para el video
"En total tenemos 112 pruebas automatizadas que cubren dos capas del sistema: 81 pruebas Jest que validan los microservicios del backend sin necesidad de Docker ni base de datos, usando mocks de Prisma y axios; y 31 pruebas Cypress que validan el flujo completo del frontend interactuando con el sistema real. Las pruebas Cypress verifican los tres roles — admin, developer y lector — incluyendo las restricciones de negocio como que el developer no puede modificar tareas ajenas y que el lector no tiene acceso a ninguna operación de escritura."

---

## TIPS PARA LA GRABACIÓN

### Para pruebas Jest
1. **Tamaño de fuente**: Aumentar la fuente del terminal a 16px
2. **Limpiar terminal**: Ejecutar `cls` antes de cada `npm test`
3. **Pausar**: Después de cada resultado, pausar 3-4 segundos
4. **Si falla algo**: Tener el video pregrabado como respaldo

### Para pruebas Cypress
1. **Usar modo visual** (`npx cypress open`) para la grabación — se ve mejor
2. **Velocidad**: En `cypress.config.ts` agregar `defaultCommandTimeout: 12000` si el sistema está lento
3. **BD limpia**: Correr con BD limpia para que los datos de la Suite 1 sean predecibles
4. **RUT del developer**: Anotar el RUT y contraseña del empleado creado en Suite 1 antes de correr Suite 2

---

## NOTA SOBRE EL CONSOLE.ERROR EN TESTS

Ese mensaje que se ve en la consola es el log interno del ProjectService cuando detecta que ms-tasks no está disponible. Aparece porque estamos testeando exactamente ese escenario: ¿qué pasa si alguien intenta completar un proyecto pero el microservicio de tareas está caído?

Nuestro servicio tiene un principio de seguridad conservador: si no puede verificar si hay tareas pendientes porque ms-tasks no responde, bloquea la operación. Prefiere decir 'no puedo completar esto' a dejar pasar un proyecto con tareas sin terminar.

El console.error es el log que el servicio escribe cuando detecta esa situación. En producción ese log serviría para que el equipo de operaciones sepa que ms-tasks tuvo un problema. En el test, simplemente confirma que el código pasó por esa rama del catch. El test en sí pasa en verde porque verifica que efectivamente se lanzó el error correcto.