# GUÍA DE DEFENSA — CHECKLIST EVALUACIÓN
## Innovatech Solutions | Parcial 3 | DuocUC 2026
## Cómo responder cada ítem del checklist

---

## VIDEO DE ARQUITECTURA

### I. ARQUITECTURA DE COMPONENTES Y DISEÑO GLOBAL

**1. ¿Explica la problemática (caso seleccionado)?**
> "El caso de Innovatech Solutions plantea una empresa de desarrollo de software que necesita gestionar proyectos, equipos y tareas de forma eficiente. El problema con un monolito es que si el módulo de tareas necesita escalar, hay que escalar todo el sistema. Si el módulo de equipos falla, falla todo. Y dos desarrolladores trabajando en módulos distintos generan conflictos de código. La solución es descomponer el sistema en tres dominios independientes."

---

**2. ¿Explica la descomposición del sistema basándose en capacidades de negocio (DDD)?**
> "Aplicamos Domain-Driven Design identificando tres bounded contexts: Proyectos (ciclo de vida del proyecto, estados, asignación de equipo), Tareas (creación, estados, bitácora de seguimiento) y Equipos/Empleados (RRHH, membresías, roles). Cada dominio tiene su propio microservicio y base de datos. Esto resuelve el acoplamiento porque un cambio en el modelo de Proyecto no afecta al modelo de Tarea."

---

**3. ¿Describe cada componente de la arquitectura con justificación?**

| Componente | Justificación |
|------------|---------------|
| BFF Gateway | Punto único de entrada para el frontend. Centraliza auth, Circuit Breaker y enrutamiento |
| ms-projects | Dominio de proyectos. Regla de negocio: no se completa con tareas pendientes |
| ms-tasks | Dominio de tareas y bitácora. Gestiona el ciclo de vida de trabajo |
| ms-teams | Dominio de RRHH. Empleados, equipos, membresías y roles |
| Traefik | Load balancer. Distribuye tráfico entre réplicas del BFF |
| db-bff | BD exclusiva de auth. Usuarios dinámicos separados del dominio de RRHH |
| ms-monitor | Monitoreo activo. Consulta /health de cada servicio cada 15 segundos |

---

**4. ¿Explica cada componente en el diagrama?**
> Mostrar el diagrama de arquitectura y recorrerlo de izquierda a derecha: Frontend → Traefik → BFF → microservicios → BDs. Explicar los puertos: 5173 (frontend), 80 (Traefik), 3000 (BFF), 3001/3002/3003 (ms), 5433-5436 (BDs).

---

### SERVICE DISCOVERY

**5-11. Service Discovery (Preguntas 5 al 11)**
> "En lugar de Eureka o Consul, usamos Docker DNS como mecanismo de service discovery. Docker asigna automáticamente un nombre DNS a cada contenedor — ms-tasks, ms-projects, ms-teams — que resuelve a la IP interna del contenedor. El BFF llama a `http://ms-tasks:3001` y Docker resuelve esa URL internamente.

> **Por qué no Eureka:** para 4 servicios con comunicación punto a punto, Eureka sería overengineering. Agrega complejidad operacional sin beneficio real a esta escala.

> **Lo bueno:** zero-configuration, funciona con Docker Compose y Swarm sin cambios. **Lo malo:** no tiene health checking avanzado ni pesos de balanceo — para eso usamos Traefik.

> **Traefik complementa:** hace service discovery via labels de Docker y registra automáticamente nuevas réplicas del BFF cuando escalan."

---

### MICROSERVICIOS

**12. ¿Explica el dominio de cada microservicio?**
> "ms-projects gestiona el ciclo de vida de los proyectos de desarrollo de software — creación, estados (PLANNED→IN_PROGRESS→COMPLETED), asignación de equipo. ms-tasks gestiona las tareas y su bitácora — creación, estados (PENDING→IN_PROGRESS→COMPLETED/BLOCKED), logs de seguimiento. ms-teams gestiona los recursos humanos — empleados con sus datos personales y RUT, equipos con sus áreas, membresías con roles."

---

**13. ¿Explica las reglas de negocio?**
> "La regla más importante está en ms-projects: un proyecto NO puede marcarse como COMPLETED si tiene tareas en estado PENDING o IN_PROGRESS. Para verificarlo, ms-projects llama a ms-tasks via HTTP. Si ms-tasks no responde, la operación se bloquea por seguridad conservadora — prefiere no completar a completar con tareas sin terminar.

> En ms-teams: al crear un equipo, el líder se agrega automáticamente como miembro con rol Tech Lead. En el BFF: al registrar un empleado, se crea automáticamente su cuenta de usuario con RUT como username."

---

**14. ¿Explica el procesamiento de datos?**
> "El flujo es: Frontend → BFF (valida JWT, activa Circuit Breaker) → Microservicio (valida datos en Factory, aplica lógica en Service, persiste con Prisma) → PostgreSQL. La respuesta sigue el camino inverso. El BFF nunca toca directamente las BDs de los microservicios — solo se comunica por HTTP."

---

**15. ¿Explica las validaciones?**
> "Cada microservicio tiene un Factory que valida antes de persistir. ProjectFactory: name y description obligatorios, estado inicial PLANNED. TaskFactory: name, projectId, area, assignedTo y teamId obligatorios, estado inicial PENDING. TeamFactory: name, description, area, leaderId obligatorios, estado inicial ACTIVE. Si falta un campo, el Factory lanza un error descriptivo antes de llegar a Prisma."

---

**16. ¿Explica los casos de uso específicos?**
> "ms-projects: crear proyecto, buscar por nombre/ID, asignar equipo, cambiar estado (con validación de tareas). ms-tasks: crear tarea asignada a un empleado, cambiar estado, agregar/leer/eliminar entradas de bitácora. ms-teams: registrar empleado con generación de usuario, crear equipo con auto-membresía del líder, agregar/eliminar integrantes."

---

**17. ¿Explica la estructura de carpetas?**
> "Todos los microservicios siguen el mismo arquetipo: `controllers/` maneja HTTP, `services/` contiene lógica de negocio y acceso a datos, `factories/` centraliza creación de entidades, `middleware/` valida JWT, `prisma/` gestiona el schema y migraciones, `app.ts` configura Express. Esta consistencia reduce la curva de aprendizaje — quien conoce uno, conoce todos."

---

**18. ¿Explica las dependencias?**
> "Express para el servidor HTTP, Prisma 5.22.0 (fijado sin ^) para el ORM, jsonwebtoken para validación JWT, axios para comunicación entre servicios, swagger-ui-express para documentación, cors para las políticas de origen. En el BFF: opossum para Circuit Breaker, bcryptjs para hashing de passwords."

---

**19. ¿Explica los controladores?**
> "Cada controlador tiene métodos que mapean a verbos HTTP. Por ejemplo en ProjectController: `getAll` → GET /projects, `getById` → GET /projects/:id, `create` → POST /projects, `update` → PUT /projects/:id, `updateStatus` → PATCH /projects/:id/status, `delete` → DELETE /projects/:id. El controlador extrae parámetros del request, llama al service y retorna el resultado con el HttpStatus correcto."

---

**20. ¿Explica los métodos de seguridad?**
> "Aplicamos Zero Trust: cada microservicio tiene su propio middleware que valida el JWT independientemente. El BFF no es el único punto de seguridad. Si el BFF fuera comprometido, los microservicios internos siguen rechazando peticiones sin token válido. Los passwords se hashean con bcrypt (saltRounds=10). El JWT_SECRET es dinámico — generado con crypto.randomBytes(64) al levantar el sistema."

---

**21. ¿Explica los patrones aplicados y dónde en el código?**

| Patrón | Dónde |
|--------|-------|
| Factory Method | `project.factory.ts`, `task.factory.ts`, `team.factory.ts` |
| BFF (Backend for Frontend) | `bff-gateway/src/` completo |
| Circuit Breaker | `bff-gateway/src/services/*.service.ts` con Opossum |
| Database per Service | Cada ms tiene su propio PostgreSQL |
| Zero Trust | `middleware/auth.middleware.ts` en cada microservicio |
| Repository | Implícito en Prisma — abstrae el acceso a datos |

---

**22. ¿Explica los archivos de configuración?**
> "Cada microservicio tiene: `.env` con DATABASE_URL y JWT_SECRET, `tsconfig.json` para la compilación TypeScript, `jest.config.ts` para las pruebas, `prisma/schema.prisma` para el modelo de datos. El `docker-compose.yml` en la raíz orquesta todos los servicios. El `.env` raíz contiene el JWT_SECRET compartido y la URL del BFF para el frontend."

---

**23. ¿Explica cómo levantar el microservicio?**
> "Con Docker: `docker compose up --build`. Para desarrollo local: crear el `.env` con DATABASE_URL apuntando a la BD local, `npm install`, `npx prisma migrate dev`, `npm run dev`. El healthcheck en cada contenedor verifica `/health` cada 15 segundos."

---

**24. ¿Explica el manejo de excepciones?**
> "Los controllers envuelven las llamadas al service en try/catch. Si el service lanza un error de validación (Factory), retorna 400 con el mensaje descriptivo. Si el recurso no existe, retorna 404. Errores inesperados retornan 500. En el BFF, si un microservicio no responde, el Circuit Breaker captura el timeout y retorna el fallback configurado en vez de propagar el error."

---

**25. ¿Explica las buenas prácticas en la creación de microservicios?**
> "Single Responsibility: cada microservicio tiene un solo dominio. Separation of Concerns: controller solo HTTP, service solo lógica, factory solo creación. Fail Fast: el Factory valida antes de persistir. Stateless: los microservicios no guardan estado en memoria — todo en BD. Health endpoint: `/health` en cada servicio para monitoreo. Conventional commits en git. HttpStatus semánticamente correctos: 201 para creación, 404 para no encontrado, 400 para validación."

---

**26. ¿Explica el Circuit Breaker?**
> "Implementado con Opossum en el BFF. Configuración: timeout 3 segundos, umbral de error 50%, reset 10 segundos. Tiene tres estados: CLOSED (normal, pasa las peticiones), OPEN (falla detectada, retorna fallback inmediato sin consultar el servicio), HALF-OPEN (prueba si el servicio se recuperó enviando una petición de prueba). Tenemos 11 circuit breakers distintos — uno por operación crítica. El fallback para GETs es array vacío `[]`, para mutaciones es un mensaje de error descriptivo."

---

**27. ¿Explica dónde se aplican buenos HttpStatus?**
> "201 Created al crear empleados, proyectos, tareas, equipos. 200 OK para lecturas y actualizaciones. 400 Bad Request para validaciones del Factory. 401 Unauthorized cuando falta el token. 403 Forbidden cuando el token es inválido o expirado. 404 Not Found cuando el recurso no existe. 500 Internal Server Error para errores inesperados. 409 Conflict cuando ya existe un usuario con ese RUT."

---

**28. ¿Tiene log interno?**
> "El BFF registra en consola: conexión a la BD de usuarios al iniciar, estado del JWT_SECRET (dinámico o desde .env), eventos del Circuit Breaker (open, close, half-open), errores al consultar microservicios. Los microservicios registran errores de validación y eventos críticos como el bloqueo de completar un proyecto con tareas pendientes."

---

**29. ¿Tiene métricas internas?**
> "ms-monitor consulta el endpoint `/health` de cada servicio cada 15 segundos y mide la latencia de respuesta. El dashboard en el puerto 4000 muestra estado UP/DOWN, latencia en ms y uptime. El endpoint `/whoami` del BFF permite verificar cuál réplica está respondiendo para demostrar el load balancing de Traefik."

---

**30. ¿Informa sobre las pruebas realizadas?**
> "Tenemos 112 pruebas automatizadas en dos capas: 81 pruebas Jest/Supertest que cubren unitarias (Factories y Services con mocks de Prisma), integración (flujo de login con Supertest) y E2E de negocio (flujo completo incluyendo Circuit Breaker y regla de tareas pendientes). 31 pruebas Cypress E2E que validan el frontend completo: flujo admin (empleados, equipos, proyectos, tareas, bitácora), flujo developer (proyectos propios, restricciones de edición, bitácora) y flujo lector (reportes completos, solo lectura)."

---

### SEGURIDAD

**31. ¿Justifica la aplicación de seguridad?**
> "Un sistema de gestión empresarial maneja información sensible: datos de empleados, proyectos internos y seguimiento de trabajo. Sin seguridad, cualquier persona podría modificar o eliminar datos. Implementamos JWT para autenticación stateless (no hay sesión en servidor), bcrypt para passwords (resistente a fuerza bruta), Zero Trust para que cada componente verifique identidad, y roles (admin/developer/reader) para control de acceso por nivel."

---

**32. ¿Explica cómo se genera el JWT?**
> "Al hacer login exitoso, el BFF genera un JWT con `jwt.sign()` usando el algoritmo HS256. El payload incluye: username, displayName, role, employeeId y service. El secret se genera dinámicamente con `crypto.randomBytes(64)` si no hay JWT_SECRET en el .env, o usa el secret del .env si está definido. El token expira en 24 horas."

---

**33. ¿Explica cómo se configura el JWT?**
> "En `bff-gateway/src/config/jwt.config.ts`: si existe `process.env.JWT_SECRET` se usa ese valor; si no, se genera uno con `crypto.randomBytes(64).toString('hex')`. Todos los microservicios reciben el mismo secret via la variable de entorno `JWT_SECRET` definida en el `docker-compose.yml` desde el `.env` raíz con `${JWT_SECRET}`."

---

**34. ¿Explica cómo se valida el JWT?**
> "Cada microservicio tiene `middleware/auth.middleware.ts`. Al recibir una petición, extrae el token del header `Authorization` (acepta con o sin prefijo Bearer). Llama a `jwt.verify()` con el secret compartido. Si el token es válido, agrega el payload al request y llama a `next()`. Si es inválido o expirado, retorna 403. Si falta el token, retorna 401."

---

**35. ¿Explica cómo se enruta la petición aplicando seguridad?**
> "El BFF tiene dos grupos de rutas: las rutas de auth (`/auth/login`, `/auth/users`) son públicas — no requieren JWT. Las rutas de negocio están bajo el prefijo `/api` y pasan por el middleware `verifyToken` antes de llegar al handler. El BFF propaga el JWT original al microservicio destino. El microservicio lo valida con su propio middleware."

---

### API GATEWAY

**36. ¿Explica el funcionamiento del API Gateway?**
> "El BFF Gateway es el único punto de entrada para el frontend. Recibe todas las peticiones HTTP, valida el JWT, activa el Circuit Breaker correspondiente, reenvía la petición al microservicio destino con axios incluyendo el JWT en el header, y retorna la respuesta. También expone Swagger en `/api-docs` con la documentación unificada de todos los endpoints."

---

**37. ¿Explica los componentes que integran el API Gateway?**
> "El BFF tiene: `auth/auth.routes.ts` para login y gestión de usuarios, `routes/projects.routes.ts`, `routes/tasks.routes.ts`, `routes/teams.routes.ts` para el enrutamiento a cada microservicio, `services/projects.service.ts`, `services/tasks.service.ts`, `services/teams.service.ts` que contienen los circuit breakers, `middleware/auth.middleware.ts` para validación JWT, `config/jwt.config.ts` para el secret dinámico, y la BD Prisma en `prisma/schema.prisma` para los usuarios."

---

**38. ¿Explica cómo filtra las peticiones?**
> "El BFF aplica tres filtros en orden: primero CORS (solo acepta peticiones de localhost:5173 y localhost), luego el middleware JWT en rutas protegidas bajo `/api`, y finalmente el Circuit Breaker antes de reenviar al microservicio. Si cualquier filtro rechaza, retorna el error apropiado sin continuar la cadena."

---

### MONITOREO

**39. ¿Justifica el monitoreo?**
> "En arquitectura de microservicios, un servicio puede caer sin que los demás se enteren. Sin monitoreo, el equipo descubriría el fallo cuando los usuarios reportan errores. Con ms-monitor, el sistema verifica proactivamente cada 15 segundos y el dashboard muestra el estado en tiempo real. En producción, esto permite alertas automáticas antes de que los usuarios sean impactados."

---

**40. ¿Explica las acciones si un microservicio falla?**
> "El Circuit Breaker del BFF detecta el fallo y entra en estado OPEN, retornando fallback inmediato para proteger el sistema. El ms-monitor marca el servicio como DOWN. El equipo de operaciones ve la alerta en el dashboard. Para recuperar: `docker compose restart ms-tasks` (o el servicio que falló). Después de 10 segundos, el Circuit Breaker pasa a HALF-OPEN y prueba si el servicio se recuperó."

---

**41. ¿Explica cómo se entera si un microservicio falla?**
> "Tres mecanismos: el healthcheck de Docker reinicia el contenedor si `/health` no responde en 3 intentos. Traefik retira del pool las réplicas del BFF que no pasan el healthcheck. ms-monitor detecta cuando un servicio no responde y lo marca como DOWN en el dashboard. El Circuit Breaker del BFF registra en consola cuando el circuito se abre."

---

**42. ¿Tiene seguimiento para mejoras en el monitoreo?**
> "El estado actual cubre disponibilidad y latencia básica. Como mejoras futuras identificamos: Prometheus + Grafana para métricas de CPU, memoria y throughput por endpoint, alertas por email o Slack cuando un servicio cae, y dashboards históricos para identificar patrones de degradación."

---

### FRONTEND

**43. ¿Explica la funcionalidad y por qué React?**
> "El frontend es una SPA (Single Page Application) con tres vistas según el rol: Admin gestiona el sistema completo, Developer gestiona sus proyectos y tareas, Reader visualiza reportes. React fue elegido por su modelo de componentes reutilizables, su ecosistema maduro, y la integración natural con TypeScript para tipado estricto end-to-end. Vite como bundler por su velocidad en desarrollo."

---

**44. ¿Explica las reglas de negocio del frontend?**
> "Tres reglas de negocio en el frontend: (1) El developer solo ve proyectos del equipo al que pertenece — filtrado por teamId. (2) Al crear una tarea desde la vista developer, se asigna automáticamente al developer logueado via employeeId — no hay campo manual. (3) El developer solo puede cambiar el estado de sus propias tareas — verificado comparando task.assignedTo === employeeId del JWT."

---

**45. ¿Explica las buenas prácticas?**
> "TypeScript en todo el proyecto para tipado estricto. Separación de vistas por responsabilidad (ProjectsView, TasksView, TeamsView, DeveloperView, ReaderView). Cliente HTTP centralizado en `bffClient.ts` con interceptor de axios para no repetir el header de autorización en cada llamada. Comandos convencionales de Cypress para reutilización (`login`, `logout`, `goToTab`). Variables de estado manejadas con useState y efectos con useEffect."

---

**46. ¿Explica la seguridad aplicada?**
> "El token JWT se guarda en localStorage al hacer login y se incluye automáticamente en cada petición via el interceptor de axios. El interceptor detecta respuestas 401/403, limpia el localStorage y redirige al login automáticamente — esto es lo que permite la demostración de resiliencia con JWT dinámico. El employeeId también se guarda en localStorage para que el DeveloperView pueda filtrar sin consultar el servidor."

---

**47. ¿Explica las acciones si una petición no recibe respuesta?**
> "El interceptor de axios en `bffClient.ts` captura errores 401 (token inválido) y 403 (expirado) y hace logout automático. Para errores de red o timeout, los componentes muestran mensajes de error en pantalla con un botón para cerrar. El Circuit Breaker del BFF retorna fallback antes de que el timeout llegue al frontend — en vez de esperar 30 segundos, el usuario recibe respuesta en máximo 3 segundos."

---

**48. ¿Explica cómo trabaja con los tiempos de respuesta?**
> "El Circuit Breaker del BFF tiene timeout de 3 segundos por llamada al microservicio. Traefik tiene healthcheck cada 10 segundos. El frontend no tiene timeout explícito — depende del BFF para gestionar tiempos. En Cypress, configuramos `defaultCommandTimeout: 10000ms` para dar tiempo suficiente a las operaciones lentas en el entorno de pruebas."

---

**49. ¿Define estándares de rendimiento y disponibilidad?**
> "Con Docker Swarm en producción, el BFF tiene 3 réplicas con rolling deploy — zero downtime en actualizaciones. Traefik balancea la carga entre réplicas. Si una réplica cae, las otras siguen sirviendo. El healthcheck de 15 segundos detecta caídas rápidamente. Para el frontend, Vite genera un bundle optimizado con tree-shaking y code splitting."

---

**50. ¿Tiene log interno?**
> "El frontend usa `console.error` en los bloques catch para registrar errores en la consola del navegador. El interceptor de bffClient registra cuándo limpia la sesión por 401/403. En producción, estos logs se podrían centralizar con un servicio como Sentry para monitoreo de errores del frontend."

---

**51. ¿Explica el manejo de mensajes ante excepciones?**
> "Cada vista tiene estados de error y éxito que muestran mensajes contextuales al usuario. Los mensajes de error vienen del backend cuando son de negocio (ej: 'Ya existe un usuario con ese RUT'), o son mensajes genéricos del frontend cuando es un error de red. Los mensajes de éxito se auto-ocultan después de 3 segundos. Los errores tienen un botón ✕ para cerrarlos manualmente."

---

**52. ¿Explica el manejo de excepciones?**
> "Todos los llamados a la API están en bloques try/catch. En el catch se extrae el mensaje de `err.response?.data?.error` (error del backend) o se usa un mensaje genérico. Los estados de error se muestran en un div rojo con el mensaje. Los estados de éxito en un div verde. En el useEffect de verificación de token, si el BFF no responde (503, timeout), se mantiene la sesión para no desloguear injustamente al usuario."

---

## VIDEO DE USO

**1. ¿Explica la problemática y cómo entrega una solución?**
> "Innovatech Solutions enfrenta el desafío de coordinar equipos de desarrollo distribuidos trabajando en múltiples proyectos simultáneos. La solución es un sistema de gestión con tres roles: el admin coordina todo el flujo operacional, los developers gestionan su trabajo con autonomía controlada, y los lectores hacen seguimiento sin riesgo de modificar datos."

---

**2. ¿Realiza una introducción de la solución?**
> "Mostrar la pantalla de login y presentar los tres usuarios demo: admin, developer (RUT del empleado) y lector. Explicar que cada rol ve una vista completamente distinta adaptada a sus necesidades."

---

**3. ¿Indica los requisitos del sistema?**
> "Docker Desktop instalado y corriendo. Node.js v22 para las migraciones iniciales. Git para clonar el repositorio. Un navegador moderno (Chrome recomendado). No se requiere instalar nada más — Docker construye todo dentro de los contenedores."

---

**4. ¿Explica la instalación y configuración?**
> Seguir el README.md paso a paso: generar JWT_SECRET con PowerShell, crear los .env de cada microservicio, `npm install` en bff-gateway, levantar BDs, ejecutar migraciones, `docker compose up --build`.

---

**5. ¿Indica cómo acceder al sistema?**
> "Frontend en http://localhost:5173. Admin con admin/admin123. Lector con lector/lector123. Developers con su RUT formateado (xx.xxx.xxx-x) y la clave asignada por el admin."

---

**6. ¿Realiza una descripción de la interfaz?**
> "Header con el nombre del sistema, nombre del usuario, badge de rol y botón de cerrar sesión. Barra de navegación con las tabs disponibles según el rol. Área principal con la vista activa. Modales para creación y edición. Mensajes de éxito y error contextuales."

---

**7-8. ¿Indica y explica las funcionalidades principales?**
> Demostrar el flujo completo: Admin crea empleado → equipo → proyecto → tarea → bitácora. Developer inicia sesión con RUT → ve sus proyectos → crea tarea → cambia estado → escribe bitácora. Lector ve reportes completos → bitácora en solo lectura.

---

**9. ¿Entrega conclusión y posibilidad de escalar?**
> "Innovatech Solutions demuestra que una arquitectura de microservicios bien diseñada es escalable por naturaleza. Agregar un nuevo microservicio requiere solo crear su carpeta, agregarlo al docker-compose y registrar sus rutas en el BFF. Con Docker Swarm, escalar horizontalmente es `docker service scale innovatech_bff=5`. Las mejoras futuras incluyen métricas con Prometheus, CI/CD con GitHub Actions y notificaciones en tiempo real con WebSockets."

---

*Innovatech Solutions | Parcial 3 | DuocUC 2026*
*Sebastián Escamilla · Livan Sepúlveda*
