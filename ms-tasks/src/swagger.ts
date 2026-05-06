import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Innovatech Tasks API',
      version: '1.0.0',
      description: 'Documentación oficial del Microservicio de Tareas',
    },
    servers: [{ url: 'http://localhost:3001' }],
    paths: {
      '/tasks': {
        post: {
          tags: ['Tasks'],
          summary: 'Crear una nueva tarea',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    projectId: { type: 'string' },
                    description: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Creado' } }
        }
      },
      '/tasks/project/{projectId}': {
        get: {
          tags: ['Tasks'],
          summary: 'Listar tareas por proyecto',
          parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'OK' } }
        }
      }
    }
  },
  apis: [], // Ya no necesitamos que lea comentarios de archivos externos
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  console.log('📖 Swagger Docs: http://localhost:3001/api-docs');
};