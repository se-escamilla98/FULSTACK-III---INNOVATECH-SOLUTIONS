import axios from 'axios';
import CircuitBreaker from 'opossum';
import dotenv from 'dotenv';
import { TasksService } from './tasks.service';
dotenv.config();

const CIRCUIT_OPTIONS = {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 10000,
};

export class ProjectsService {
    private readonly PROJECTS_URL: string;
    private readonly tasksService: TasksService;
    private getAllProjectsBreaker: CircuitBreaker;
    private getProjectByIdBreaker: CircuitBreaker;
    private createProjectBreaker: CircuitBreaker;
    private updateProjectBreaker: CircuitBreaker;
    private deleteProjectBreaker: CircuitBreaker;
    private updateStatusBreaker: CircuitBreaker;

    constructor() {
        this.PROJECTS_URL = process.env.MS_PROJECTS_URL as string;
        this.tasksService = new TasksService();

        this.getAllProjectsBreaker = new CircuitBreaker(
            (headers: any) => axios.get(`${this.PROJECTS_URL}/projects`, headers),
            CIRCUIT_OPTIONS
        );
        this.getProjectByIdBreaker = new CircuitBreaker(
            (id: string, headers: any) => axios.get(`${this.PROJECTS_URL}/projects/${id}`, headers),
            CIRCUIT_OPTIONS
        );
        this.createProjectBreaker = new CircuitBreaker(
            (projectData: any, headers: any) => axios.post(`${this.PROJECTS_URL}/projects`, projectData, headers),
            CIRCUIT_OPTIONS
        );
        this.updateProjectBreaker = new CircuitBreaker(
            (id: string, projectData: any, headers: any) => axios.patch(`${this.PROJECTS_URL}/projects/${id}`, projectData, headers),
            CIRCUIT_OPTIONS
        );
        this.deleteProjectBreaker = new CircuitBreaker(
            (id: string, headers: any) => axios.delete(`${this.PROJECTS_URL}/projects/${id}`, headers),
            CIRCUIT_OPTIONS
        );
        this.updateStatusBreaker = new CircuitBreaker(
            (id: string, status: string, headers: any) => axios.patch(`${this.PROJECTS_URL}/projects/${id}/status`, { status }, headers),
            CIRCUIT_OPTIONS
        );

        this.getAllProjectsBreaker.fallback(() => []);
        this.getProjectByIdBreaker.fallback(() => ({ error: 'MS-Projects no disponible. Intente mas tarde.' }));
        this.createProjectBreaker.fallback(() => ({ error: 'No se puede crear el proyecto. MS-Projects no disponible.' }));
        this.updateProjectBreaker.fallback(() => ({ error: 'No se puede actualizar el proyecto. MS-Projects no disponible.' }));
        this.deleteProjectBreaker.fallback(() => ({ error: 'No se puede eliminar el proyecto. MS-Projects no disponible.' }));
        this.updateStatusBreaker.fallback(() => ({ error: 'No se puede cambiar el estado. MS-Projects no disponible.' }));
    }

    private authHeaders(token?: string) {
        return token ? { headers: { Authorization: token } } : {};
    }

    async getAllProjects(token?: string) {
        const response = await this.getAllProjectsBreaker.fire(this.authHeaders(token)) as any;
        return response.data ?? response;
    }

    async getProjectById(id: string, token?: string) {
        const response = await this.getProjectByIdBreaker.fire(id, this.authHeaders(token)) as any;
        return response.data ?? response;
    }

    async createProject(projectData: any, token?: string) {
        const response = await this.createProjectBreaker.fire(projectData, this.authHeaders(token)) as any;
        return response.data ?? response;
    }

    async updateProject(id: string, projectData: any, token?: string) {
        const response = await this.updateProjectBreaker.fire(id, projectData, this.authHeaders(token)) as any;
        return response.data ?? response;
    }

    async deleteProject(id: string, token?: string) {
        const response = await this.deleteProjectBreaker.fire(id, this.authHeaders(token)) as any;
        return response.data ?? response;
    }

    async updateStatus(id: string, status: string, token?: string) {
        if (status === 'COMPLETED') {
            const tasks = await this.tasksService.getTasksByProject(id, token) as any[];
            const incompleteTasks = tasks.filter((task: any) => task.status !== 'COMPLETED');
            if (incompleteTasks.length > 0) {
                throw new Error('No se puede completar el proyecto con tareas pendientes');
            }
        }
        const response = await this.updateStatusBreaker.fire(id, status, this.authHeaders(token)) as any;
        return response.data ?? response;
    }
}