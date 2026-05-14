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
const specs = (0, swagger_jsdoc_1.default)(options);
const setupSwagger = (app) => {
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
};
exports.setupSwagger = setupSwagger;
