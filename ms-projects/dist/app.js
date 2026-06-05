"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const project_controller_1 = require("./controllers/project.controller");
const swagger_1 = require("./swagger");
const auth_middleware_1 = require("./middlewares/auth.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3002;
const projectController = new project_controller_1.ProjectController();
app.use(express_1.default.json());
// 1. Interfaz de Swagger - Pública (Sin token)
(0, swagger_1.setupSwagger)(app);
// 2. MIDDLEWARE DE SEGURIDAD ZERO TRUST
// Protege automáticamente todo lo que empiece con /projects
app.use('/projects', auth_middleware_1.verifyToken);
// 3. CRUD completo (Ahora protegido por el token local)
app.post('/projects', (req, res) => projectController.create(req, res));
app.get('/projects', (req, res) => projectController.getAll(req, res));
app.get('/projects/:id', (req, res) => projectController.getById(req, res));
app.patch('/projects/:id', (req, res) => projectController.update(req, res));
app.patch('/projects/:id/status', (req, res) => projectController.updateStatus(req, res));
app.delete('/projects/:id', (req, res) => projectController.delete(req, res));
app.listen(port, () => {
    console.log(`🚀 MS-PROJECTS corriendo en http://localhost:${port}`);
    console.log(`📖 Swagger en http://localhost:${port}/api-docs`);
});
