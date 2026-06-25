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
| 5. Frontend y roles de usuario | Sebastián | 3 min |
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

"La arquitectura tiene 11 componentes que se comunican así:

El usuario accede al frontend en React, que corre en el puerto 5173. El frontend envía todas sus peticiones a Traefik, nuestro load balancer, que escucha en el puerto 80. Traefik distribuye el tráfico entre las réplicas del BFF Gateway usando Round Robin.

El BFF es el cerebro del sistema. Es el único punto de entrada para el frontend. Cuando recibe una petición, primero valida el JWT del usuario, y luego la reenvía al microservicio correspondiente usando axios. Cada llamada está protegida por un Circuit Breaker.

Los tres microservicios son:
- ms-projects en el puerto 3002, con su propia base de datos PostgreSQL en el puerto 5434
- ms-tasks en el puerto 3001, con su BD en el 5433
- ms-teams en el puerto 3003, con su BD en el 5435

El BFF además tiene su propia base de datos — db-bff en el puerto 5436 — que almacena los usuarios del sistema. Esto permite crear cuentas de developer dinámicamente desde la vista de admin, sin hardcodear usuarios en el código.

Además tenemos ms-monitor en el puerto 4000, que consulta el estado de salud de cada servicio cada 15 segundos y lo muestra en un dashboard.

Cada componente corre en su propio contenedor Docker. Un solo comando — docker compose up --build — levanta todos los contenedores."

**Qué mostrar:** El `docker-compose.yml` en VS Code, y luego el terminal con `docker ps` mostrando todos los contenedores corriendo.

---

## BLOQUE 3 — MICROSERVICIOS EN DETALLE (Sebastián)

**Qué decir:**

"Los tres microservicios siguen exactamente la misma estructura interna. Esto es intencional — es lo que llamamos un arquetipo. Cada uno tiene 6 capas:

1. **Controller** — solo maneja HTTP. Recibe el request, extrae los parámetros y retorna la respuesta. No tiene lógica de negocio.

2. **Service** — contiene toda la lógica de negocio y es la única capa que accede a la base de datos a través de Prisma. Si mañana cambiamos PostgreSQL por MySQL, solo modificamos esta capa.

3. **Factory** — centraliza la creación de objetos. Antes de que un proyecto, tarea o equipo se guarde en la base de datos, pasa por su Factory que valida los campos obligatorios y asigna el estado inicial. ProjectFactory asigna PLANNED, TaskFactory asigna PENDING, TeamFactory asigna ACTIVE.

4. **Middleware** — verifica el JWT en cada petición. Esto es parte de nuestro modelo Zero Trust: cada microservicio valida el token independientemente. Si el BFF fuera comprometido, los microservicios internos siguen protegidos.

5. **Schema Prisma** — define los modelos de datos y gestiona las migraciones. Destacamos tres relaciones importantes: Employee tiene una relación con Member con onDelete Cascade — si se elimina un empleado, sus membresías en equipos se eliminan automáticamente. Task tiene una relación con TaskLog — la bitácora de cada tarea. Y Member tiene FK a Employee para garantizar integridad referencial.

6. **App.ts** — el punto de entrada que configura Express, las rutas, Swagger y el health check.

La regla de negocio más importante está en ms-projects: no se puede marcar un proyecto como COMPLETED si tiene tareas pendientes. Para verificar esto, ms-projects llama a ms-tasks via HTTP y revisa el estado de cada tarea."

**Qué mostrar:** Abrir en VS Code la estructura de carpetas de ms-projects. Mostrar el schema.prisma de ms-teams con las relaciones Employee-Member. Mostrar el `updateStatus` del ProjectService donde se verifica las tareas pendientes.

---

## BLOQUE 4 — BFF, CIRCUIT BREAKER Y SEGURIDAD (Livan)

**Qué decir:**

"El BFF Gateway tiene cuatro responsabilidades principales.

**Primera: Autenticación dinámica con bcrypt y BD propia.** El BFF tiene su propia base de datos de usuarios — db-bff. Cuando el admin registra un empleado, automáticamente se crea una cuenta de usuario: el RUT del empleado se convierte en su username y el admin define la contraseña. Los passwords se almacenan como hashes bcrypt — nunca en texto plano. Bcrypt es un algoritmo diseñado específicamente para passwords, intencionalmente lento para dificultar ataques de fuerza bruta. El admin y el lector son usuarios fijos del sistema; los developers son dinámicos, creados según las necesidades de la empresa.

**Segunda: JWT dinámico para resiliencia.** El JWT_SECRET no está hardcodeado. Se genera con crypto.randomBytes(64) al levantar el sistema desde el archivo .env. Esto significa que al reiniciar con un nuevo secret, todos los tokens anteriores quedan inválidos. El frontend detecta el 401 automáticamente gracias a un interceptor de axios y redirige al login. Esto es resiliencia real: el sistema se adapta a cambios de configuración sin intervención manual.

**Tercera: Circuit Breaker con Opossum.** Cada operación del BFF hacia los microservicios está envuelta en un Circuit Breaker individual — tenemos 11 circuit breakers distintos. La configuración es: timeout de 3 segundos, si más del 50% de las llamadas fallan el circuito se abre, y después de 10 segundos pasa a half-open para probar si el servicio se recuperó. Cuando el circuito está abierto, las peticiones retornan inmediatamente con un fallback sin tocar el microservicio caído.

**Cuarta: Zero Trust con propagación del JWT.** El BFF no es un proxy confiable. Cuando reenvía una petición a un microservicio, incluye el JWT original. El microservicio destino lo valida con su propio middleware usando el mismo secreto compartido. Cada componente verifica la identidad por su cuenta."

**Qué mostrar:** Abrir `auth.routes.ts` y mostrar cómo se crea un usuario dinámico. Abrir `jwt.config.ts` y mostrar la generación dinámica del secret. Hacer demo en vivo: mostrar el .env con JWT_SECRET, cambiar el secret, reiniciar el BFF y demostrar que el frontend redirige al login automáticamente.

---

## BLOQUE 5 — FRONTEND Y ROLES (Sebastián)

**Qué decir:**

"El frontend está construido con React, Vite y TypeScript. Es una SPA con vistas distintas según el rol del usuario.

Implementamos control de acceso basado en roles con tres niveles completamente distintos:

**Admin** — tiene acceso completo. Puede registrar empleados y al hacerlo se crea automáticamente su cuenta de developer con RUT como username. Crea equipos y el líder se agrega automáticamente como miembro con rol Tech Lead. Gestiona proyectos con búsqueda por nombre o ID y asignación de equipo. Gestiona tareas con dropdown de miembros del equipo y acceso completo a la bitácora.

**Developer** — ve solo los proyectos del equipo al que pertenece. Al crear una tarea se asigna automáticamente a sí mismo por employeeId — sin campo manual de 'asignado a'. Solo puede cambiar el estado de sus propias tareas. Puede ver la bitácora de todas las tareas del proyecto, pero solo agregar o eliminar entradas en las suyas.

**Reader (Lector)** — vista de reportes completa: resumen con contadores, proyectos, tareas agrupadas por proyecto, equipos con integrantes, y tabla de trabajadores que muestra el área de trabajo cruzando con la tabla de miembros. Puede ver la bitácora de cualquier tarea en modo solo lectura.

La bitácora es el historial de cambios de cada tarea. Los developers documentan su trabajo y el lector puede hacer seguimiento del avance sin acceso de modificación.

La implementación de seguridad es en el frontend y backend: el employeeId viaja en el JWT, se guarda en localStorage al hacer login, y el DeveloperView lo usa para filtrar proyectos y restringir qué tareas puede modificar."

**Qué mostrar:** Demo en vivo completo:
1. Login como admin → crear empleado con clave → crear equipo → crear proyecto → asignar equipo al proyecto
2. Login como developer (con RUT) → ver solo el proyecto asignado → crear tarea → cambiar estado → agregar entrada a bitácora
3. Login como lector → ver Reportes → Tareas → leer la bitácora en modo solo lectura

---

## BLOQUE 6 — INFRAESTRUCTURA (Livan)

**Qué decir:**

"La infraestructura tiene tres niveles.

**Docker Compose para desarrollo.** Un solo archivo docker-compose.yml define todos los contenedores. Los microservicios incluyen un comando que ejecuta las migraciones de Prisma automáticamente antes de levantar el servicio — npx prisma migrate deploy. Esto garantiza que las tablas siempre existen al arrancar. Las bases de datos tienen volúmenes persistentes, por lo que los datos sobreviven reinicios. Todos los db tienen healthchecks con pg_isready para asegurar que PostgreSQL está listo antes de que el microservicio intente conectarse.

**Traefik como load balancer.** Traefik corre en el puerto 80 y distribuye el tráfico entre las réplicas del BFF. Tiene health checks que verifican /health cada 10 segundos. Si una réplica cae, Traefik la retira automáticamente del pool. El dashboard en el puerto 8080 muestra el estado en tiempo real.

**Docker Swarm para producción.** El archivo docker-stack.yml define la configuración para producción con 3 réplicas del BFF, auto-healing, rolling updates y sin puertos de BD expuestos al exterior. El script deploy-swarm.ps1 automatiza el despliegue.

**ms-monitor** consulta el health de cada servicio y muestra un dashboard HTML con el estado UP o DOWN, la latencia en milisegundos y el uptime de cada componente."

**Qué mostrar:** El dashboard de Traefik en localhost:8080. El endpoint /whoami del BFF ejecutado varias veces para demostrar el load balancing. El dashboard de ms-monitor en localhost:4000.

---

## BLOQUE 7 — PRUEBAS AUTOMATIZADAS (Sebastián)

**Qué decir:**

"Implementamos pruebas automatizadas con Jest y Supertest, organizadas en tres tipos:

**Pruebas unitarias** — validan las capas internas de cada microservicio. Testeamos las Factories verificando validaciones y estados por defecto. Testeamos los Services mockeando Prisma para no necesitar base de datos real.

**Pruebas de integración** — validan el flujo de login completo usando Supertest contra el Express real del BFF. Verificamos login exitoso con los distintos usuarios, rechazo de credenciales inválidas, y validación del formato del JWT generado.

**Pruebas end-to-end** — validan el flujo completo de negocio: login, creación de proyecto, creación de tarea, intento de completar proyecto que falla por tarea pendiente, completar la tarea, completar el proyecto exitosamente, y verificación del fallback del Circuit Breaker.

Todas las pruebas se ejecutan sin necesidad de Docker ni base de datos — usan mocks de Prisma y de axios."

**Qué mostrar:** Ejecutar `npm test` en un microservicio y mostrar los resultados en verde.

---

## BLOQUE 8 — CIERRE Y MEJORAS FUTURAS (Livan)

**Qué decir:**

"Para cerrar, las decisiones arquitectónicas clave de Innovatech Solutions son: Database per Service para aislamiento, JWT dinámico Zero Trust para resiliencia y seguridad, Circuit Breaker para tolerancia a fallos, Factory Method para consistencia, y autenticación dinámica para escalar el equipo de trabajo sin modificar código.

Como mejoras futuras identificamos: agregar métricas con Prometheus y Grafana, implementar CI/CD con GitHub Actions, y agregar rate limiting para prevenir abuso de la API.

Eso es todo, estamos abiertos a preguntas."

---

## PREGUNTAS FRECUENTES (prepararse ambos)

**¿Por qué el BFF tiene su propia base de datos?**
"El BFF es responsable de la autenticación. Tiene sentido que gestione su propio almacén de usuarios — es su dominio. Esto sigue el principio Database per Service: el dominio de autenticación está separado del dominio de recursos humanos en ms-teams. Si ms-teams cae, los usuarios siguen pudiendo hacer login. Si quisiéramos escalar el sistema de auth de forma independiente, podemos hacerlo sin tocar ms-teams."

**¿Por qué no usar un servicio de autenticación externo como Auth0?**
"Auth0 o Keycloak son válidos en producción, pero para este proyecto implementar nuestro propio sistema demuestra comprensión de los conceptos: bcrypt, JWT, Zero Trust. El patrón que usamos es idéntico a cómo funcionan esos servicios internamente."

**¿Cómo funciona el JWT dinámico?**
"El JWT_SECRET se genera con crypto.randomBytes(64) al levantar el sistema. Si el .env no tiene un secret definido, cada reinicio genera uno nuevo. Al cambiar el secret, todos los tokens anteriores quedan criptográficamente inválidos porque la firma no coincide. El interceptor del frontend detecta el 401 y redirige al login automáticamente."

**¿Qué pasa si se cae el BFF?**
"Traefik detecta la caída en 10 segundos y la retira del pool. Las otras réplicas siguen respondiendo. En Swarm, Docker levanta automáticamente una nueva instancia."

**¿Por qué Prisma y no TypeORM?**
"Prisma genera tipos TypeScript directamente del schema, lo que da tipado estricto end-to-end. Los errores de tipo se detectan al compilar, no en producción. Fijamos la versión en 5.22.0 sin ^ para evitar breaking changes."

**¿Por qué bcrypt y no hashing simple?**
"Bcrypt está diseñado para passwords: es intencionalmente lento con saltRounds=10, lo que hace inviable un ataque de fuerza bruta. SHA256 es rápido, que es malo para passwords."

**¿Qué es el fallback del Circuit Breaker?**
"Es la respuesta predefinida cuando el circuito está abierto. Para listas retornamos array vacío, para operaciones individuales un mensaje de error descriptivo. El usuario ve datos parciales en vez de un error 500 genérico."

**¿Cómo sabe el developer qué tareas son suyas?**
"El employeeId viaja en el JWT al hacer login. Se guarda en localStorage. Al crear una tarea desde la vista developer, el campo assignedTo se llena automáticamente con el employeeId del usuario logueado. La vista filtra las tareas propias comparando task.assignedTo === employeeId del token."

**¿Por qué el líder del equipo se agrega automáticamente como miembro?**
"Para que el líder pueda ver los proyectos asignados a su equipo en la vista developer. El liderazgo y la membresía son dos relaciones distintas: leaderId es una referencia en Team, Member es una entidad separada con su propio rol. Al crear el equipo, el service busca los datos del empleado líder y lo crea como Member con rol Tech Lead automáticamente."

**¿Las pruebas necesitan Docker corriendo?**
"No. Todas las pruebas usan mocks — Prisma se mockea con jest.mock para no necesitar base de datos, y axios se mockea para no necesitar los microservicios corriendo. Se ejecutan en milisegundos."

**¿Cómo se rotan los secrets en producción?**
"Regeneramos el .env con el script PowerShell que usa crypto.randomBytes, luego hacemos docker compose up --build. Todos los servicios reciben el nuevo secret y todos los usuarios deben volver a hacer login. En producción real usaríamos un gestor de secrets como HashiCorp Vault."