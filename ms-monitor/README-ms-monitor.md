# MS-Monitor — Innovatech Solutions

Servicio de monitoreo que consulta el estado de salud de cada microservicio cada 15 segundos y lo muestra en un dashboard HTML en tiempo real.

## Tecnologias

- Node.js v22 + TypeScript v5
- Express v4.19.2
- Axios (para health checks)

## Instalacion

```bash
npm install
```

## Ejecucion

```bash
npm run dev     # Desarrollo
npm start       # Produccion
```

El servicio inicia en el puerto **4000**.

## Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | / | Dashboard HTML con estado de servicios |
| GET | /status | JSON con estado de todos los servicios |
| GET | /health | Health check propio |

## Servicios monitoreados

| Servicio | URL de health check |
|----------|-------------------|
| BFF Gateway | http://bff:3000/health |
| ms-projects | http://ms-projects:3002/health |
| ms-tasks | http://ms-tasks:3001/health |
| ms-teams | http://ms-teams:3003/health |

## Informacion mostrada

Por cada servicio: nombre, descripcion, estado (UP/DOWN), latencia en milisegundos, uptime y ultima verificacion.
