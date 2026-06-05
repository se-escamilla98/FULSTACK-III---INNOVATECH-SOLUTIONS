"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectController = void 0;
const project_service_1 = require("../services/project.service");
const projectService = new project_service_1.ProjectService();
class ProjectController {
    async create(req, res) {
        try {
            const project = await projectService.createProject(req.body);
            res.status(201).json(project);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getAll(req, res) {
        try {
            const projects = await projectService.getAllProjects();
            res.json(projects);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getById(req, res) {
        try {
            const { id } = req.params;
            const project = await projectService.getProjectById(id);
            if (!project)
                return res.status(404).json({ error: "Proyecto no encontrado" });
            res.json(project);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const updated = await projectService.updateProject(id, req.body);
            res.json(updated);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status = '' } = req.body;
            // Pasamos el token para que el service pueda llamar a MS-Tasks con autenticación
            const token = req.headers['authorization'];
            const updated = await projectService.updateStatus(id, status, token);
            res.json(updated);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            await projectService.deleteProject(id);
            res.status(200).json({ message: "Proyecto eliminado correctamente" });
        }
        catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
}
exports.ProjectController = ProjectController;
