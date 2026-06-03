import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Innovatech Tasks API', version: '2.0.0', description: 'Microservicio autónomo de Tareas (Requiere JWT)' },
    servers: [{ url: 'http://localhost:3001' }],
    components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
    security: [{ bearerAuth: [] }],
    paths: {
      '/tasks': {
        post: {
          tags: ['Tasks'], summary: 'Crear tarea',
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, projectId: { type: 'string' } } } } } },
          responses: { 201: { description: 'Creado' }, 401: { description: 'Token requerido' } }
        }
      }
    }
  },
  apis: [],
};

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(options)));
};