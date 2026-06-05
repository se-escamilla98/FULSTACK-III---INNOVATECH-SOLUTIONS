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
const setupSwagger = (app) => {
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup((0, swagger_jsdoc_1.default)(options)));
};
exports.setupSwagger = setupSwagger;
//# sourceMappingURL=swagger.js.map