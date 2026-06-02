"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Innovatech Solutions - API Unificada del BFF Gateway',
            version: '1.0.0',
            description: 'Documentación consolidada de todos los microservicios del sistema (Proyectos, Tareas y Equipos) con soporte para autenticación JWT.',
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
                    description: 'Ingresa el token JWT generado por el endpoint de login para acceder a las rutas protegidas.',
                },
            },
        },
        // Aplica la seguridad JWT de forma global a todos los endpoints documentados
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // Escanea de forma automática los comentarios JSDoc de todos tus archivos de rutas
    apis: ['./src/routes/*.ts', './src/auth/*.ts'],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
//# sourceMappingURL=swagger.config.js.map