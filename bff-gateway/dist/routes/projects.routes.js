"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projects_service_1 = require("../services/projects.service");
const router = (0, express_1.Router)();
const projectsService = new projects_service_1.ProjectsService();
router.get('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const project = await projectsService.getProjectById(id);
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/api/projects', async (req, res) => {
    try {
        const projectData = req.body;
        const project = await projectsService.createProject(projectData);
        res.status(201).json(project);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.delete('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const project = await projectsService.deleteProject(id);
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.patch('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const projectData = req.body;
        const project = await projectsService.updateProject(id, projectData);
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.patch('/api/projects/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const project = await projectsService.updateStatus(id, status);
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=projects.routes.js.map