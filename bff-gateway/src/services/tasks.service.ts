import axios from 'axios';
import CircuitBreaker from 'opossum';
import dotenv from 'dotenv';
dotenv.config();

const CIRCUIT_OPTIONS = {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 10000,
};

export class TasksService {
    private readonly TASKS_URL: string;
    private getTaskByIdBreaker: CircuitBreaker;
    private getTasksByProjectBreaker: CircuitBreaker;
    private createTaskBreaker: CircuitBreaker;
    private updateTaskBreaker: CircuitBreaker;
    private deleteTaskBreaker: CircuitBreaker;
    private addLogBreaker: CircuitBreaker;
    private getLogsBreaker: CircuitBreaker;
    private deleteLogBreaker: CircuitBreaker;

    constructor() {
        this.TASKS_URL = process.env.MS_TASKS_URL as string;

        this.getTaskByIdBreaker = new CircuitBreaker(
            (id: string, headers: any) => axios.get(`${this.TASKS_URL}/tasks/${id}`, headers),
            CIRCUIT_OPTIONS
        );
        // FIX: ruta correcta /projects/:id/tasks
        this.getTasksByProjectBreaker = new CircuitBreaker(
            (projectId: string, headers: any) => axios.get(`${this.TASKS_URL}/projects/${projectId}/tasks`, headers),
            CIRCUIT_OPTIONS
        );
        this.createTaskBreaker = new CircuitBreaker(
            (taskData: any, headers: any) => axios.post(`${this.TASKS_URL}/tasks`, taskData, headers),
            CIRCUIT_OPTIONS
        );
        this.updateTaskBreaker = new CircuitBreaker(
            (id: string, taskData: any, headers: any) => axios.patch(`${this.TASKS_URL}/tasks/${id}`, taskData, headers),
            CIRCUIT_OPTIONS
        );
        this.deleteTaskBreaker = new CircuitBreaker(
            (id: string, headers: any) => axios.delete(`${this.TASKS_URL}/tasks/${id}`, headers),
            CIRCUIT_OPTIONS
        );
        this.addLogBreaker = new CircuitBreaker(
            (taskId: string, data: any, headers: any) => axios.post(`${this.TASKS_URL}/tasks/${taskId}/logs`, data, headers),
            CIRCUIT_OPTIONS
        );
        this.getLogsBreaker = new CircuitBreaker(
            (taskId: string, headers: any) => axios.get(`${this.TASKS_URL}/tasks/${taskId}/logs`, headers),
            CIRCUIT_OPTIONS
        );
        this.deleteLogBreaker = new CircuitBreaker(
            (taskId: string, logId: string, headers: any) => axios.delete(`${this.TASKS_URL}/tasks/${taskId}/logs/${logId}`, headers),
            CIRCUIT_OPTIONS
        );

        this.getTaskByIdBreaker.fallback(() => ({ error: 'MS-Tasks no disponible.' }));
        this.getTasksByProjectBreaker.fallback(() => []);
        this.createTaskBreaker.fallback(() => ({ error: 'No se puede crear la tarea.' }));
        this.updateTaskBreaker.fallback(() => ({ error: 'No se puede actualizar la tarea.' }));
        this.deleteTaskBreaker.fallback(() => ({ error: 'No se puede eliminar la tarea.' }));
        this.addLogBreaker.fallback(() => ({ error: 'No se puede agregar la entrada de bitácora.' }));
        this.getLogsBreaker.fallback(() => []);
        this.deleteLogBreaker.fallback(() => ({ error: 'No se puede eliminar la entrada.' }));
    }

    private authHeaders(token?: string) {
        return token ? { headers: { Authorization: token } } : {};
    }

    async getTaskById(id: string, token?: string) {
        const response = await this.getTaskByIdBreaker.fire(id, this.authHeaders(token)) as any;
        return response.data ?? response;
    }
    async getTasksByProject(projectId: string, token?: string) {
        const response = await this.getTasksByProjectBreaker.fire(projectId, this.authHeaders(token)) as any;
        return response.data ?? response;
    }
    async createTask(taskData: any, token?: string) {
        const response = await this.createTaskBreaker.fire(taskData, this.authHeaders(token)) as any;
        return response.data ?? response;
    }
    async updateTask(id: string, taskData: any, token?: string) {
        const response = await this.updateTaskBreaker.fire(id, taskData, this.authHeaders(token)) as any;
        return response.data ?? response;
    }
    async deleteTask(id: string, token?: string) {
        const response = await this.deleteTaskBreaker.fire(id, this.authHeaders(token)) as any;
        return response.data ?? response;
    }
    async addLog(taskId: string, data: any, token?: string) {
        const response = await this.addLogBreaker.fire(taskId, data, this.authHeaders(token)) as any;
        return response.data ?? response;
    }
    async getLogs(taskId: string, token?: string) {
        const response = await this.getLogsBreaker.fire(taskId, this.authHeaders(token)) as any;
        return response.data ?? response;
    }
    async deleteLog(taskId: string, logId: string, token?: string) {
        const response = await this.deleteLogBreaker.fire(taskId, logId, this.authHeaders(token)) as any;
        return response.data ?? response;
    }
}