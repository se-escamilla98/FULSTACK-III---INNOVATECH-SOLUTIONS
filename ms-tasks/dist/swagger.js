"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const options = {
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
const specs = (0, swagger_jsdoc_1.default)(options);
const setupSwagger = (app) => {
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
    console.log('📖 Swagger Docs: http://localhost:3001/api-docs');
};
exports.setupSwagger = setupSwagger;
//# sourceMappingURL=swagger.js.map