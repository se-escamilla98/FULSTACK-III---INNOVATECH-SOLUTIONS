"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const tasks_service_1 = require("./tasks.service");
dotenv_1.default.config();
class ProjectsService {
    constructor() {
        this.tasksService = new tasks_service_1.TasksService();
        this.PROJECTS_URL = process.env.MS_PROJECTS_URL;
    }
    async getProjectById(id) {
        const response = await axios_1.default.get(`${this.PROJECTS_URL}/projects/${id}`);
        return response.data;
    }
    async getAllProjects() {
        const response = await axios_1.default.get(`${this.PROJECTS_URL}/projects`);
        return response.data;
    }
    async createProject(projectData) {
        const response = await axios_1.default.post(`${this.PROJECTS_URL}/projects`, projectData);
        return response.data;
    }
    async updateProject(id, projectData) {
        const response = await axios_1.default.patch(`${this.PROJECTS_URL}/projects/${id}`, projectData);
        return response.data;
    }
    async deleteProject(id) {
        const response = await axios_1.default.delete(`${this.PROJECTS_URL}/projects/${id}`);
        return response.data;
    }
    async updateStatus(id, status) {
        if (status === 'COMPLETED') {
            // CORREGIDO: Forzamos el casteo de tipo a 'any[]' para permitir el uso seguro de .filter()
            const tasks = await this.tasksService.getTasksByProject(id);
            const incompleteTasks = tasks.filter((task) => task.status !== 'COMPLETED');
            if (incompleteTasks.length > 0) {
                throw new Error('No se puede completar el proyecto con tareas pendientes');
            }
        }
        const response = await axios_1.default.patch(`${this.PROJECTS_URL}/projects/${id}/status`, { status });
        return response.data;
    }
}
exports.ProjectsService = ProjectsService;
//# sourceMappingURL=projects.service.js.map