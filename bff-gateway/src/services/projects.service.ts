import  axios  from 'axios';
import dotenv from 'dotenv';
import { TasksService } from './tasks.service'; // Importa el servicio de tareas para usarlo dentro del servicio de proyectos   
dotenv.config();  

export class ProjectsService {
    private readonly tasksService: TasksService; // Instancia del servicio de tareas para usar sus métodos
    private readonly PROJECTS_URL: string;  

    constructor() {
        this.tasksService = new TasksService();
        this.PROJECTS_URL = process.env.MS_PROJECTS_URL as string;
    }

    async getProjectById(id: string) {
        const response = await axios.get(`${this.PROJECTS_URL}/projects/${id}`);
        return response.data;
    }

    async getAllProjects() {
        const response = await axios.get(`${this.PROJECTS_URL}/projects`);
        return response.data;
    }

    async createProject(projectData: any) {
        const response = await axios.post(`${this.PROJECTS_URL}/projects`, projectData);
        return response.data;
    }

    async updateProject(id: string, projectData: any) {
        const response = await axios.patch(`${this.PROJECTS_URL}/projects/${id}`, projectData);
        return response.data;
    }

    async deleteProject(id: string) {
        const response = await axios.delete(`${this.PROJECTS_URL}/projects/${id}`);
        return response.data;
    }

    async updateStatus(id: string, status: string) {
    if (status === 'COMPLETED') {
        const tasks = await this.tasksService.getTasksByProject(id);
        const incompleteTasks = tasks.filter((task: any) => task.status !== 'COMPLETED');
        if (incompleteTasks.length > 0) {
            throw new Error('No se puede completar el proyecto con tareas pendientes');
        }
    }
    const response = await axios.patch(`${this.PROJECTS_URL}/projects/${id}/status`, { status });
    return response.data;
    }
}