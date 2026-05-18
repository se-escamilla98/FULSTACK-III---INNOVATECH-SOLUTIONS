"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tasks_service_1 = require("../services/tasks.service");
const router = (0, express_1.Router)();
const tasksService = new tasks_service_1.TasksService();
router.get('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const task = await tasksService.getTaskById(id);
        res.json(task);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/api/tasks', async (req, res) => {
    try {
        const taskData = req.body;
        const task = await tasksService.createTask(taskData);
        res.status(201).json(task);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.delete('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const task = await tasksService.deleteTask(id);
        res.json(task);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.patch('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const taskData = req.body;
        const task = await tasksService.updateTask(id, taskData);
        res.json(task);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/api/projects/:projectId/tasks', async (req, res) => {
    try {
        const { projectId } = req.params;
        const tasks = await tasksService.getTasksByProject(projectId);
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=tasks.routes.js.map