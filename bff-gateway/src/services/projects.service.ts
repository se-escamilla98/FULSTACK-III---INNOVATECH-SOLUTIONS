import axios from 'axios';
import dotenv from 'dotenv';
import { TasksService } from './tasks.service'; 

dotenv.config();  

export class ProjectsService {
    private readonly tasksService: TasksService; 
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
            // CORREGIDO: Forzamos el casteo de tipo a 'any[]' para permitir el uso seguro de .filter()
            const tasks = await this.tasksService.getTasksByProject(id) as any[];
            const incompleteTasks = tasks.filter((task: any) => task.status !== 'COMPLETED');
            if (incompleteTasks.length > 0) {
                throw new Error('No se puede completar el proyecto con tareas pendientes');
            }
        }
        const response = await axios.patch(`${this.PROJECTS_URL}/projects/${id}/status`, { status });
        return response.data;
    }
}