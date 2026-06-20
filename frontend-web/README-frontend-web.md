# Frontend Web — Innovatech Solutions

Aplicacion SPA (Single Page Application) con React, Vite y TypeScript. Implementa control de acceso basado en roles con tres niveles: admin, developer y reader.

## Tecnologias

- React 18 + TypeScript
- Vite 5
- Axios (cliente HTTP con interceptor JWT)

## Instalacion

```bash
npm install
```

## Ejecucion

```bash
npm run dev       # Desarrollo (hot reload)
npm run build     # Build para produccion
npm run preview   # Preview del build
```

El servicio inicia en el puerto **5173**.

## Estructura

```
src/
  api/bffClient.ts      → Cliente HTTP con interceptor JWT
  views/ProjectsView.tsx → Vista de proyectos (CRUD)
  views/TasksView.tsx    → Vista de tareas (CRUD)
  views/TeamsView.tsx    → Vista de equipos (CRUD)
  App.tsx                → Login + header + navegacion + roles
```

## Control de acceso por rol

| Usuario | Rol | Proyectos | Tareas | Equipos |
|---------|-----|-----------|--------|---------|
| admin | admin | CRUD completo | CRUD completo | CRUD completo |
| sebastian | developer | Solo lectura | CRUD completo | Solo lectura |
| lector | reader | Solo lectura | Solo lectura | Solo lectura |

## Variables de entorno

| Variable | Descripcion | Valor por defecto |
|----------|-------------|-------------------|
| VITE_BFF_URL | URL del BFF Gateway | http://localhost:3000 |
