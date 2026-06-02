import axios from 'axios';
import dotenv from 'dotenv';
import CircuitBreaker from 'opossum';

dotenv.config();  

export class TasksService {

    private readonly TASKS_URL: string;
    private getTaskByIdBreaker: CircuitBreaker;
    // 1. CORREGIDO: Nombre en plural para que coincida con toda la clase
    private getTasksByProjectBreaker: CircuitBreaker;

    constructor() {
        this.TASKS_URL = process.env.MS_TASKS_URL as string;

        const breakerOptions = {
            timeout: 5000, 
            errorThresholdPercentage: 50, 
            resetTimeout: 30000 
        };
        
        // Instanciamos el breaker para obtener tareas por proyecto
        this.getTasksByProjectBreaker = new CircuitBreaker(
            async (projectId: string) => {
                const response = await axios.get(`${this.TASKS_URL}/tasks/project/${projectId}`);
                return response.data;
            }, 
            breakerOptions
        );

        // Instanciamos el breaker para obtener una tarea por ID
        this.getTaskByIdBreaker = new CircuitBreaker(
            async (id: string) => {
                const response = await axios.get(`${this.TASKS_URL}/tasks/${id}`);
                return response.data;
            },
            breakerOptions
        );

        // 2. CORREGIDO: Tipado explícito ': string' en los parámetros de los fallbacks
        this.getTasksByProjectBreaker.fallback((projectId: string) => {
            console.warn(`[Circuit Breaker] Fallback activado para tareas del proyecto: ${projectId}`);
            return [];
        });

        this.getTaskByIdBreaker.fallback((id: string) => {
            console.warn(`[Circuit Breaker] Fallback activado para la tarea ID: ${id}`);
            return { id, name: "Tarea no disponible temporalmente", status: "BLOCKED", isDegraded: true };
        });

        this.getTasksByProjectBreaker.on('open', () => console.error('🚨 [ms-tasks] CIRCUITO ABIERTO. Fallando peticiones.'));
        this.getTasksByProjectBreaker.on('close', () => console.log('🟢 [ms-tasks] CIRCUITO CERRADO. Conexión restaurada.'));
    }

    // 3. ACTUALIZADO: Cambiado para usar el disyuntor (.fire) en lugar de saltárselo
    async getTaskById(id: string) {
        return await this.getTaskByIdBreaker.fire(id);
    }

    async getTasksByProject(projectId: string) {
        return await this.getTasksByProjectBreaker.fire(projectId);
    }

    async createTask(taskData: any) {
        const response = await axios.post(`${this.TASKS_URL}/tasks`, taskData);
        return response.data;
    }

    async updateTask(id: string, taskData: any) {
        const response = await axios.patch(`${this.TASKS_URL}/tasks/${id}`, taskData);
        return response.data;
    }   

    async deleteTask(id: string) {
        const response = await axios.delete(`${this.TASKS_URL}/tasks/${id}`);
        return response.data;
    }
}