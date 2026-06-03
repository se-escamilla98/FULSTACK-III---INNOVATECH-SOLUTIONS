import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Innovatech Teams API', version: '2.0.0', description: 'Microservicio autónomo de Equipos (Requiere JWT)' },
    servers: [{ url: 'http://localhost:3003' }],
    components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
    security: [{ bearerAuth: [] }],
    paths: {
      '/teams': {
        get: { tags: ['Teams'], summary: 'Obtener todos los equipos', responses: { 200: { description: 'Éxito' }, 401: { description: 'Token requerido' } } }
      }
    }
  },
  apis: [],
};

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJsDoc(options)));
};