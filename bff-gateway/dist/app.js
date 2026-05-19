"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const projects_routes_1 = __importDefault(require("./routes/projects.routes"));
const teams_routes_1 = __importDefault(require("./routes/teams.routes"));
const tasks_routes_1 = __importDefault(require("./routes/tasks.routes"));
const auth_routes_1 = __importDefault(require("./auth/auth.routes"));
const auth_middleware_1 = require("./middleware/auth.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Ruta publica - no requiere token
app.use(auth_routes_1.default);
// Rutas protegidas - requieren token valido
app.use(auth_middleware_1.verifyToken, projects_routes_1.default);
app.use(auth_middleware_1.verifyToken, teams_routes_1.default);
app.use(auth_middleware_1.verifyToken, tasks_routes_1.default);
app.listen(port, () => {
    console.log(`🚀 BFF-GATEWAY corriendo en http://localhost:${port}`);
    console.log(`🔐 Autenticacion JWT activada`);
});
//# sourceMappingURL=app.js.map