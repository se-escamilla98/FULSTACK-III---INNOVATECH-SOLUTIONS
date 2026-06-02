import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Innovatech Solutions - API Unificada del BFF Gateway',
      version: '1.0.0',
      description: 'Documentación consolidada del ecosistema de microservicios.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor BFF Local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingresa tu token JWT para habilitar los endpoints protegidos.',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    // DEFINIMOS LAS RUTAS DIRECTAMENTE AQUÍ PARA EVITAR ERRORES DE ESCANEO
    paths: {
      '/auth/login': {
        post: {
          summary: 'Iniciar sesion y obtener token JWT',
          tags: ['Autenticacion'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['apiKey', 'role'],
                  properties: {
                    apiKey: { type: 'string', example: 'admin-key-innovatech' },
                    role: { type: 'string', example: 'admin' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Login exitoso, retorna el token JWT' },
            401: { description: 'API Key invalida' },
          },
        },
      },
      '/api/projects': {
        get: {
          summary: 'Obtener el listado completo de proyectos',
          tags: ['Proyectos'],
          responses: {
            200: { description: 'Arreglo con todos los proyectos obtenidos con exito' },
            500: { description: 'Error interno del servidor' },
          },
        },
        post: {
          summary: 'Registrar un nuevo proyecto',
          tags: ['Proyectos'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'description'],
                  properties: {
                    name: { type: 'string', example: 'Proyecto Innovatech Alpha' },
                    description: { type: 'string', example: 'Desarrollo del sistema de gestion de proyectos' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Proyecto creado exitosamente' },
            500: { description: 'Error interno del servidor' },
          },
        },
      },
      '/api/projects/{id}/status': {
        patch: {
          summary: 'Cambiar el estado de un proyecto (Evalua Circuit Breaker)',
          tags: ['Proyectos'],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
              description: 'UUID del proyecto a actualizar',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: { type: 'string', example: 'COMPLETED' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Estado actualizado correctamente' },
            400: { description: 'Error de regla de negocio o Circuit Breaker abierto' },
            500: { description: 'Error interno del servidor' },
          },
        },
      },
      '/api/tasks': {
        post: {
          summary: 'Crear una nueva tarea asociada a un proyecto',
          tags: ['Tareas'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'description', 'projectId'],
                  properties: {
                    name: { type: 'string', example: 'Configurar contenedores Docker' },
                    description: { type: 'string', example: 'Mapear puertos y configurar redes internas' },
                    area: { type: 'string', example: 'Backend' },
                    assignedTo: { type: 'string', example: 'dev-001' },
                    teamId: { type: 'string', example: 'team-001' },
                    projectId: { type: 'string', example: 'pega-aqui-el-uuid-de-tu-proyecto' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Tarea creada de forma exitosa' },
            500: { description: 'Error de comunicacion o microservicio ms-tasks caido' },
          },
        },
      },
    },
  },
  // Al dejar el arreglo vacío, le decimos que NO escanee los archivos externos, evitando errores semánticos
  apis: [], 
};

export const swaggerSpec = swaggerJSDoc(options);