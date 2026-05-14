"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const client_1 = require("@prisma/client");
const project_factory_1 = require("../factorie/project.factory");
const axios_1 = __importDefault(require("axios"));
const prisma = new client_1.PrismaClient();
class ProjectService {
    // Registrar nuevos proyectos 
    async createProject(data) {
        const projectData = project_factory_1.ProjectFactory.create(data.name, data.description);
        return await prisma.project.create({
            data: projectData
        });
    }
    // Consultar listado de proyectos 
    async getAllProjects() {
        return await prisma.project.findMany();
    }
    // Consultar información detallada [
    async getProjectById(id) {
        return await prisma.project.findUnique({ where: { id } });
    }
    // Cambiar el estado de un proyecto 
    async updateStatus(id, newStatus) {
        // Regla de negocio: No se puede finalizar si hay tareas pendientes 
        if (newStatus === "COMPLETED") {
            const hasPendingTasks = await this.checkPendingTasks(id);
            if (hasPendingTasks) {
                throw new Error("No se puede marcar como finalizado: existen tareas pendientes");
            }
        }
        return await prisma.project.update({
            where: { id },
            data: { status: newStatus }
        });
    }
    async checkPendingTasks(projectId) {
        try {
            const response = await axios_1.default.get(`http://localhost:3001/tasks/project/${projectId}`);
            const tasks = response.data;
            return tasks.some((task) => task.status === 'PENDING');
        }
        catch (error) {
            // Si MS-Tasks está caído, bloqueamos por seguridad
            console.error('MS-Tasks no disponible:', error);
            return true; // ← bloquea el cambio a COMPLETED
        }
    }
    async updateProject(id, data) {
        if (data.name !== undefined && data.name.trim() === "") {
            throw new Error("El nombre no puede quedar vacío");
        }
        if (data.description !== undefined && data.description.trim() === "") {
            throw new Error("La descripción no puede quedar vacía");
        }
        const project = await prisma.project.findUnique({ where: { id } });
        if (!project)
            throw new Error(`Proyecto con ID ${id} no encontrado`);
        return await prisma.project.update({
            where: { id },
            data: { ...data, updatedAt: new Date() }
        });
    }
    async deleteProject(id) {
        try {
            return await prisma.project.delete({ where: { id } });
        }
        catch (error) {
            throw new Error(`No se pudo eliminar el proyecto con ID ${id}. Verifique si existe.`);
        }
    }
}
exports.ProjectService = ProjectService;
