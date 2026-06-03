import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: { 
      title: 'Innovatech Projects API (Microservicio Autónomo)',
      version: '2.0.0',
      description: 'Documentación local del microservicio. Implementa Zero Trust (Requiere JWT).' 
    },
    servers: [{ url: 'http://localhost:3002' }],
    // AGREGAMOS EL CANDADO DE SEGURIDAD
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingresa el token generado en el BFF para acceder a este microservicio directo.',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    // Mapeamos un par de rutas esenciales para la prueba individual
    paths: {
      '/projects': {
        get: {
          tags: ['Projects'],
          summary: 'Obtener todos los proyectos',
          responses: { 200: { description: 'Éxito' }, 401: { description: 'Token requerido' } }
        },
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
                    name: { type: 'string', example: 'Proyecto Directo' },
                    description: { type: 'string', example: 'Prueba sin BFF' }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Creado' }, 401: { description: 'No autorizado' } }
        }
      }
    }
  },
  apis: [],
};

const specs = swaggerJsDoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};