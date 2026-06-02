"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express")); // <-- Importar
const swagger_config_1 = require("./config/swagger.config"); // <-- Importar
const projects_routes_1 = __importDefault(require("./routes/projects.routes"));
const teams_routes_1 = __importDefault(require("./routes/teams.routes"));
const tasks_routes_1 = __importDefault(require("./routes/tasks.routes"));
const auth_routes_1 = __importDefault(require("./auth/auth.routes"));
const auth_middleware_1 = require("./middleware/auth.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Montar la interfaz visual de Swagger (Accesible de forma pública)
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_config_1.swaggerSpec));
// Ruta pública - no requiere token
app.use(auth_routes_1.default);
// Rutas protegidas - requieren token válido
app.use(auth_middleware_1.verifyToken, projects_routes_1.default);
app.use(auth_middleware_1.verifyToken, teams_routes_1.default);
app.use(auth_middleware_1.verifyToken, tasks_routes_1.default);
app.listen(port, () => {
    console.log(`🚀 BFF-GATEWAY corriendo en http://localhost:${port}`);
    console.log(`📝 Swagger Unificado disponible en http://localhost:${port}/api-docs`);
    console.log(`🔐 Autenticación JWT activada`);
});
//# sourceMappingURL=app.js.map