import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: { 
          title: 'Innovatech Projects API',
          version: '1.0.0',
          description: 'Documentación oficial del Microservicio de Proyectos' 
        },
    servers: [{ url: 'http://localhost:3002' }],
    // Define las rutas aquí directamente
    paths: {
  '/projects': {
    post: {
      tags: ['Projects'],
      summary: 'Crear proyecto',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'Mi Proyecto' },
                description: { type: 'string', example: 'Descripción aquí' }
              }
            }
          }
        }
      },
      responses: { 201: { description: 'Creado' } }
        }
      }
    }
  },
  apis: [], // Déjalo vacío si defines los paths arriba
};

const specs = swaggerJsDoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};