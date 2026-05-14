"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const task_service_1 = require("../services/task.service");
const taskService = new task_service_1.TaskService();
class TaskController {
    // Crear Tarea
    async createTask(req, res) {
        try {
            const task = await taskService.createTask(req.body);
            res.status(201).json(task);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    // Obtener Tareas por Proyecto
    async getTasksByProject(req, res) {
        try {
            const { taskId } = req.params;
            const tasks = await taskService.getTasksByProject(taskId);
            res.status(200).json(tasks);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // ACTUALIZAR Tarea (El que agregamos ahora)
    async updateTask(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const updatedTask = await taskService.updateTask(id, data);
            if (!id) {
                res.status(404).json({ error: "Tarea no Existe" });
            }
            res.status(200).json(updatedTask);
        }
        catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
    async deleteTask(req, res) {
        try {
            const { id } = req.params;
            await taskService.deleteTask(id);
            res.status(200).json({ message: "Tarea eliminada correctamente" });
        }
        catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
    async getTaskById(req, res) {
        try {
            const { id } = req.params;
            const task = await taskService.getTaskById(id);
            if (!task)
                return res.status(404).json({ error: "Tarea no encontrada" });
            res.status(200).json(task);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.TaskController = TaskController;
//# sourceMappingURL=task.controller.js.map