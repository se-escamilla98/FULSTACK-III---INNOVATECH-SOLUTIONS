"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const task_controller_1 = require("./controllers/task.controller");
const swagger_1 = require("./swagger");
const app = (0, express_1.default)();
const taskController = new task_controller_1.TaskController();
app.use(express_1.default.json());
// CRUD completo
app.post('/tasks', (req, res) => taskController.createTask(req, res));
app.get('/tasks/:id', (req, res) => taskController.getTaskById(req, res));
app.get('/tasks/project/:projectId', (req, res) => taskController.getTasksByProject(req, res));
app.patch('/tasks/:id', (req, res) => taskController.updateTask(req, res));
app.delete('/tasks/:id', (req, res) => taskController.deleteTask(req, res));
(0, swagger_1.setupSwagger)(app);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 MS-TASKS corriendo en puerto ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map