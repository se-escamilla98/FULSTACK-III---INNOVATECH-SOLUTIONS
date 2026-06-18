# DEFENSA ORAL — INNOVATECH SOLUTIONS
## Parcial 3 | Desarrollo FullStack III | DuocUC 2026
### Duración estimada: 15-20 minutos

---

## DISTRIBUCIÓN DE TEMAS

| Bloque | Expositor | Duración |
|--------|-----------|----------|
| 1. Introducción y problema | Sebastián | 2 min |
| 2. Arquitectura general | Livan | 3 min |
| 3. Microservicios en detalle | Sebastián | 3 min |
| 4. BFF, Circuit Breaker y seguridad | Livan | 3 min |
| 5. Frontend y roles de usuario | Sebastián | 2 min |
| 6. Infraestructura: Docker, Traefik, Swarm | Livan | 3 min |
| 7. Pruebas automatizadas | Sebastián | 2 min |
| 8. Cierre y mejoras futuras | Livan | 1 min |

---

## BLOQUE 1 — INTRODUCCIÓN Y PROBLEMA (Sebastián)

**Qué decir:**

"Buenos días, somos Sebastián y Livan, y vamos a presentar Innovatech Solutions, un sistema de gestión de proyectos, tareas y equipos construido con arquitectura de microservicios.

El problema que resolvemos es el siguiente: en una aplicación monolítica tradicional, si el módulo de tareas necesita escalarse porque recibe más tráfico, hay que escalar toda la aplicación. Si el módulo de equipos tiene un bug y se cae, se cae todo el sistema. Y si dos desarrolladores trabajan en módulos distintos, sus cambios pueden generar conflictos porque comparten el mismo código base.

Nuestra solución fue descomponer el sistema en tres dominios de negocio independientes: Proyectos, Tareas y Equipos. Cada uno es un microservicio con su propia base de datos, su propio código y su propio ciclo de vida. Si uno falla, los demás siguen funcionando."

**Qué mostrar:** Pantalla de login del frontend para dar contexto visual.

---

## BLOQUE 2 — ARQUITECTURA GENERAL (Livan)

**Qué decir:**

"La arquitectura tiene 10 componentes que se comunican así:

El usuario accede al frontend en React, que corre en el puerto 5173. El frontend envía todas sus peticiones a Traefik, nuestro load balancer, que escucha en el puerto 80. Traefik distribuye el tráfico entre 3 réplicas del BFF Gateway usando Round Robin.

El BFF es el cerebro del sistema. Es el único punto de entrada para el frontend. Cuando recibe una petición, primero valida el JWT del usuario, y luego la reenvía al microservicio correspondiente usando axios. Cada llamada está protegida por un Circuit Breaker.

Los tres microservicios son:
- ms-projects en el puerto 3002, con su propia base de datos PostgreSQL en el puerto 5434
- ms-tasks en el puerto 3001, con su BD en el 5433
- ms-teams en el puerto 3003, con su BD en el 5435

Además tenemos ms-monitor en el puerto 4000, que consulta el estado de salud de cada servicio cada 15 segundos y lo muestra en un dashboard.

Cada componente corre en su propio contenedor Docker. Un solo comando — docker compose up --build — levanta los 10 contenedores."

**Qué mostrar:** El `docker-compose.yml` en VS Code, y luego el terminal con `docker ps` mostrando los 10 contenedores corriendo.

---

## BLOQUE 3 — MICROSERVICIOS EN DETALLE (Sebastián)

**Qué decir:**

"Los tres microservicios siguen exactamente la misma estructura interna. Esto es intencional — es lo que llamamos un arquetipo. Cada uno tiene 6 capas:

1. **Controller** — solo maneja HTTP. Recibe el request, extrae los parámetros y retorna la respuesta. No tiene lógica de negocio.

2. **Service** — contiene toda la lógica de negocio y es la única capa que accede a la base de datos a través de Prisma. Si mañana cambiamos PostgreSQL por MySQL, solo modificamos esta capa.

3. **Factory** — centraliza la creación de objetos. Antes de que un proyecto, tarea o equipo se guarde en la base de datos, pasa por su Factory que valida los campos obligatorios y asigna el estado inicial. ProjectFactory asigna PLANNED, TaskFactory asigna PENDING, TeamFactory asigna ACTIVE.

4. **Middleware** — verifica el JWT en cada petición. Esto es parte de nuestro modelo Zero Trust: cada microservicio valida el token independientemente. Si el BFF fuera comprometido, los microservicios internos siguen protegidos.

5. **Schema Prisma** — define los modelos de datos y gestiona las migraciones.

6. **App.ts** — el punto de entrada que configura Express, las rutas, Swagger y el health check.

La regla de negocio más importante está en ms-projects: no se puede marcar un proyecto como COMPLETED si tiene tareas pendientes. Para verificar esto, ms-projects llama a ms-tasks via HTTP y revisa el estado de cada tarea. Si ms-tasks no está disponible, bloqueamos la operación por seguridad."

**Qué mostrar:** Abrir en VS Code la estructura de carpetas de ms-projects. Mostrar el ProjectFactory con las validaciones. Mostrar el `updateStatus` del ProjectService donde se verifica las tareas pendientes.

---

## BLOQUE 4 — BFF, CIRCUIT BREAKER Y SEGURIDAD (Livan)

**Qué decir:**

"El BFF Gateway tiene tres responsabilidades principales.

**Primera: Autenticación con bcrypt.** Cuando el usuario hace login, envía username y password. El BFF compara el password contra un hash bcrypt almacenado. Bcrypt es un algoritmo de hashing diseñado específicamente para passwords — es lento a propósito para dificultar ataques de fuerza bruta. Si el password es correcto, generamos un JWT firmado con HS256 que expira en 24 horas. El JWT contiene el username, el displayName, el rol y el servicio que lo generó.

**Segunda: Circuit Breaker con Opossum.** Cada operación del BFF hacia los microservicios está envuelta en un Circuit Breaker individual. La configuración es: timeout de 3 segundos, si más del 50% de las llamadas fallan el circuito se abre, y después de 10 segundos pasa a half-open para probar si el servicio se recuperó. Cuando el circuito está abierto, las peticiones no se envían al microservicio — se responden inmediatamente con un fallback. Para los GET-all el fallback es un array vacío, para las otras operaciones es un mensaje de error descriptivo. Esto evita el fallo en cascada: si ms-tasks cae, el BFF sigue funcionando para proyectos y equipos.

**Tercera: Propagación del JWT.** El BFF no es un proxy confiable. Cuando reenvía una petición a un microservicio, incluye el JWT original en el header. El microservicio destino valida ese JWT con su propio middleware usando el mismo secreto. Esto es Zero Trust: cada componente verifica la identidad por su cuenta."

**Qué mostrar:** Abrir `auth.routes.ts` y mostrar los hashes bcrypt. Abrir `projects.service.ts` del BFF y mostrar la configuración del Circuit Breaker. Hacer una demo en vivo: tumbar ms-tasks con `docker stop` y mostrar que el BFF retorna fallback en vez de error.

---

## BLOQUE 5 — FRONTEND Y ROLES (Sebastián)

**Qué decir:**

"El frontend está construido con React, Vite y TypeScript. Es una SPA con tres vistas: Proyectos, Tareas y Equipos.

Implementamos control de acceso basado en roles con tres niveles:

- **admin** — tiene acceso completo a todo el sistema: puede crear, editar y eliminar proyectos, tareas y equipos. En el header se muestra con un badge azul que dice Admin.

- **developer** — puede crear, editar y eliminar tareas, pero solo puede ver proyectos y equipos sin modificarlos. Se muestra con un badge verde Developer.

- **reader** — solo puede ver la información, no puede crear, editar ni eliminar nada. Se muestra con un badge gris Lector.

La implementación es simple pero efectiva: después del login, guardamos el rol en localStorage. Cada vista recibe el rol como prop y usa una variable `canEdit` que determina si los botones de acción se muestran o se ocultan. En ProjectsView y TeamsView, `canEdit` es true solo para admin. En TasksView, `canEdit` es true para admin y developer.

El cliente HTTP usa un interceptor de axios que agrega automáticamente el Bearer token a cada petición, así no repetimos código en cada vista."

**Qué mostrar:** Demo en vivo: hacer login con admin (mostrar CRUD completo), cerrar sesión, login con sebastian (mostrar que solo puede gestionar tareas), cerrar sesión, login con lector (mostrar dashboard de solo lectura).

---

## BLOQUE 6 — INFRAESTRUCTURA (Livan)

**Qué decir:**

"La infraestructura tiene tres niveles.

**Docker Compose para desarrollo.** Un solo archivo docker-compose.yml define los 10 contenedores. Los microservicios usan la imagen node:22-alpine con Prisma generate y build de TypeScript. Cada contenedor tiene un HEALTHCHECK integrado que verifica el endpoint /health cada 15 segundos. Si un contenedor deja de responder, Docker lo reinicia automáticamente gracias a la política restart: always.

**Traefik como load balancer.** Traefik corre en el puerto 80 y distribuye el tráfico entre las réplicas del BFF. Tiene un health check configurado que verifica cada 10 segundos si cada réplica está viva. Si una réplica cae, Traefik la retira automáticamente del pool. El dashboard de Traefik en el puerto 8080 muestra el estado del balanceo en tiempo real. Podemos escalar el BFF con un solo comando: docker compose up --scale bff=3.

**Docker Swarm para producción.** El archivo docker-stack.yml define la configuración para producción. Las diferencias clave son: el BFF tiene 3 réplicas gestionadas por Swarm con auto-healing, las bases de datos no exponen puertos al exterior, los updates se hacen con rolling deploy con zero-downtime, y hay una política de restart con máximo 5 intentos. El script deploy-swarm.ps1 automatiza todo el despliegue.

**ms-monitor** consulta el health de cada servicio y muestra un dashboard HTML con el estado UP o DOWN, la latencia en milisegundos y el uptime de cada componente."

**Qué mostrar:** El dashboard de Traefik en localhost:8080. El endpoint /whoami del BFF ejecutado varias veces para demostrar que Traefik balancea entre instancias distintas. El dashboard de ms-monitor en localhost:4000. Opcionalmente, tumbar un servicio y mostrar cómo el monitor lo detecta.

---

## BLOQUE 7 — PRUEBAS AUTOMATIZADAS (Sebastián)

**Qué decir:**

"Implementamos 82 pruebas automatizadas con Jest y Supertest, organizadas en tres tipos:

**Pruebas unitarias** — 65 tests que validan las capas internas de cada microservicio. Testeamos las tres Factories verificando que validen campos obligatorios y asignen estados por defecto. Testeamos los tres Services mockeando Prisma para no necesitar base de datos. La prueba más importante del Service es la regla de negocio: verificamos que no se pueda completar un proyecto con tareas pendientes, incluso cuando ms-tasks no está disponible.

**Pruebas de integración** — 8 tests que validan el flujo de login completo usando Supertest contra el Express real del BFF. Verificamos login exitoso con los tres usuarios, rechazo de credenciales inválidas, y validación del formato del JWT generado.

**Pruebas end-to-end** — 8 tests que validan el flujo completo de negocio. El test E2E simula: login, verificación de ruta protegida, creación de proyecto, creación de tarea, intento de completar proyecto que falla por tarea pendiente, completar la tarea, completar el proyecto exitosamente, y verificación del fallback del Circuit Breaker cuando un microservicio cae.

Todas las pruebas se ejecutan sin necesidad de Docker ni base de datos — usan mocks de Prisma y de axios."

**Qué mostrar:** Ejecutar `npm test` en cada servicio y mostrar los resultados en verde. Destacar el test E2E que se lee como una historia paso a paso.

---

## BLOQUE 8 — CIERRE Y MEJORAS FUTURAS (Livan)

**Qué decir:**

"Para cerrar, las decisiones arquitectónicas clave de Innovatech Solutions son: Database per Service para aislamiento, JWT Zero Trust para seguridad en profundidad, Circuit Breaker para resiliencia, y Factory Method para consistencia en la creación de entidades.

Como mejoras futuras identificamos: implementar logging estructurado con Winston, agregar métricas con Prometheus y Grafana para monitorear CPU, memoria y latencia, implementar CI/CD con GitHub Actions para automatizar el build y deploy, y agregar rate limiting para prevenir abuso de la API.

El sistema está preparado para escalar: agregar un nuevo microservicio solo requiere crear su carpeta, agregarlo al docker-compose y registrar sus rutas en el BFF. Gracias a Docker Swarm, escalar horizontalmente es un solo comando: docker service scale.

Eso es todo, estamos abiertos a preguntas."

**Qué mostrar:** Nada específico, cierre verbal.

---

## PREGUNTAS FRECUENTES (prepararse ambos)

**¿Por qué no usaron Eureka o Consul para Service Discovery?**
"Docker DNS resuelve automáticamente los nombres de servicio a IPs internas. Para 4 servicios con comunicación punto a punto, agregar Eureka sería overengineering. Traefik complementa con health checks."

**¿Qué pasa si se cae el BFF?**
"Traefik detecta la caída en 10 segundos y la retira del pool. Las otras réplicas siguen respondiendo. En Swarm, Docker levanta automáticamente una nueva instancia."

**¿Por qué Prisma y no TypeORM?**
"Prisma genera tipos TypeScript directamente del schema, lo que da tipado estricto end-to-end. Los errores de tipo se detectan al compilar, no en producción. Además fijamos la versión en 5.22.0 sin ^ para evitar breaking changes."

**¿Por qué bcrypt y no hashing simple?**
"Bcrypt está diseñado para passwords: es intencionalmente lento (saltRounds=10), lo que hace inviable un ataque de fuerza bruta. SHA256 es rápido, que es malo para passwords."

**¿Qué es el fallback del Circuit Breaker?**
"Es la respuesta predefinida que se retorna cuando el circuito está abierto. Para las listas retornamos array vacío, para operaciones individuales un mensaje de error. El usuario ve datos parciales en vez de un error 500."

**¿Las pruebas necesitan Docker corriendo?**
"No. Todas las pruebas usan mocks — Prisma se mockea con jest.mock para no necesitar base de datos, y axios se mockea para no necesitar los microservicios corriendo. Se ejecutan en milisegundos."
