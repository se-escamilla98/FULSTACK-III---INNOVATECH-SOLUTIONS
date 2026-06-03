import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Innovatech Solutions - API rest del Ecosisttema de Microservicios',
      version: '2.0.0',
      description: 'Documentación consolidada del ecosistema de microservicios (Proyectos, Tareas y Equipos) y verificacion con JWT.',
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
          description: 'Introduce el token JWT obtenido del login para desbloquear las rutas protegidas.',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    paths: {
      // ==================== 🔐 AUTENTICACIÓN ====================
      '/auth/login': {
        post: {
          summary: 'Iniciar sesión y obtener token JWT',
          tags: ['Autenticación'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['apiKey', 'role'],
                  properties: {
                    apiKey: { type: 'string', example: 'admin-key-innovatech' },
                    role: { type: 'string', example: 'admin' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Login exitoso, retorna el token JWT' },
            401: { description: 'API Key inválida' }
          }
        }
      },

      // ==================== 📊 PROYECTOS (CRUD COMPLETO) ====================
      '/api/projects': {
        get: {
          summary: 'Obtener el listado completo de proyectos',
          tags: ['Proyectos'],
          responses: { 200: { description: 'Lista de proyectos obtenida con éxito' } }
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
                    description: { type: 'string', example: 'Desarrollo del sistema de gestión' }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Proyecto creado exitosamente' } }
        }
      },
      '/api/projects/{id}': {
        get: {
          summary: 'Obtener un proyecto por su ID',
          tags: ['Proyectos'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Proyecto encontrado' }, 404: { description: 'Proyecto no encontrado' } }
        },
        patch: {
          summary: 'Actualizar información básica del proyecto',
          tags: ['Proyectos'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { name: { type: 'string', example: 'Nombre Actualizado' }, description: { type: 'string', example: 'Descripción Actualizada' } }
                }
              }
            }
          },
          responses: { 200: { description: 'Proyecto actualizado' } }
        },
        delete: {
          summary: 'Eliminar un proyecto',
          tags: ['Proyectos'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Proyecto eliminado correctamente' } }
        }
      },
      '/api/projects/{id}/status': {
        patch: {
          summary: 'Cambiar el estado de un proyecto (Evalúa Circuit Breaker y Tareas)',
          tags: ['Proyectos'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object', required: ['status'], properties: { status: { type: 'string', example: 'COMPLETED' } } }
              }
            }
          },
          responses: { 200: { description: 'Estado actualizado' }, 400: { description: 'Error por tareas pendientes' } }
        }
      },

      // ==================== 📋 TAREAS (CRUD COMPLETO) ====================
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
                  required: ['name', 'projectId'],
                  properties: {
                    name: { type: 'string', example: 'Configurar contenedores Docker' },
                    description: { type: 'string', example: 'Mapear puertos y redes internas' },
                    area: { type: 'string', example: 'Backend' },
                    assignedTo: { type: 'string', example: 'dev-001' },
                    teamId: { type: 'string', example: 'team-001' },
                    projectId: { type: 'string', example: 'pega-aqui-el-uuid-del-proyecto' }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Tarea creada' } }
        }
      },
      '/api/tasks/{id}': {
        get: {
          summary: 'Obtener una tarea por su ID',
          tags: ['Tareas'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Tarea encontrada' } }
        },
        patch: {
          summary: 'Actualizar estado o datos de una tarea',
          tags: ['Tareas'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object', properties: { status: { type: 'string', example: 'COMPLETED' } } }
              }
            }
          },
          responses: { 200: { description: 'Tarea actualizada' } }
        },
        delete: {
          summary: 'Eliminar una tarea',
          tags: ['Tareas'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Tarea eliminada' } }
        }
      },
      '/api/tasks/project/{projectId}': {
        get: {
          summary: 'Listar todas las tareas pertenecientes a un proyecto',
          tags: ['Tareas'],
          parameters: [{ in: 'path', name: 'projectId', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Lista de tareas del proyecto' } }
        }
      },

      // ==================== 👥 EQUIPOS (CRUD COMPLETO) ====================
      '/api/teams': {
        get: {
          summary: 'Obtener todos los equipos de desarrollo',
          tags: ['Equipos'],
          responses: { 200: { description: 'Lista de equipos' } }
        },
        post: {
          summary: 'Crear un nuevo equipo de trabajo',
          tags: ['Equipos'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'area', 'leaderId'],
                  properties: {
                    name: { type: 'string', example: 'Equipo Backend Alpha' },
                    description: { type: 'string', example: 'Célula de desarrollo núcleo' },
                    area: { type: 'string', example: 'Backend' },
                    leaderId: { type: 'string', example: 'lider-001' }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Equipo creado' } }
        }
      },
      '/api/teams/{id}': {
        get: {
          summary: 'Obtener un equipo por su ID',
          tags: ['Equipos'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Equipo encontrado' } }
        },
        patch: {
          summary: 'Actualizar información del equipo',
          tags: ['Equipos'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object', properties: { name: { type: 'string', example: 'Nombre Equipo Actualizado' } } }
              }
            }
          },
          responses: { 200: { description: 'Equipo actualizado' } }
        },
        delete: {
          summary: 'Eliminar un equipo',
          tags: ['Equipos'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Equipo eliminado' } }
        }
      },
      '/api/teams/{id}/status': {
        patch: {
          summary: 'Cambiar el estado operativo de un equipo',
          tags: ['Equipos'],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object', required: ['status'], properties: { status: { type: 'string', example: 'INACTIVE' } } }
              }
            }
          },
          responses: { 200: { description: 'Estado del equipo actualizado' } }
        }
      }
    }
  },
  apis: []
};

export const swaggerSpec = swaggerJSDoc(options);