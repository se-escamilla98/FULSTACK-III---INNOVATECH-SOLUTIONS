"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const opossum_1 = __importDefault(require("opossum"));
dotenv_1.default.config();
class TasksService {
    constructor() {
        this.TASKS_URL = process.env.MS_TASKS_URL;
        const breakerOptions = {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000
        };
        // Instanciamos el breaker para obtener tareas por proyecto
        this.getTasksByProjectBreaker = new opossum_1.default(async (projectId) => {
            const response = await axios_1.default.get(`${this.TASKS_URL}/tasks/project/${projectId}`);
            return response.data;
        }, breakerOptions);
        // Instanciamos el breaker para obtener una tarea por ID
        this.getTaskByIdBreaker = new opossum_1.default(async (id) => {
            const response = await axios_1.default.get(`${this.TASKS_URL}/tasks/${id}`);
            return response.data;
        }, breakerOptions);
        // 2. CORREGIDO: Tipado explícito ': string' en los parámetros de los fallbacks
        this.getTasksByProjectBreaker.fallback((projectId) => {
            console.warn(`[Circuit Breaker] Fallback activado para tareas del proyecto: ${projectId}`);
            return [];
        });
        this.getTaskByIdBreaker.fallback((id) => {
            console.warn(`[Circuit Breaker] Fallback activado para la tarea ID: ${id}`);
            return { id, name: "Tarea no disponible temporalmente", status: "BLOCKED", isDegraded: true };
        });
        this.getTasksByProjectBreaker.on('open', () => console.error('🚨 [ms-tasks] CIRCUITO ABIERTO. Fallando peticiones.'));
        this.getTasksByProjectBreaker.on('close', () => console.log('🟢 [ms-tasks] CIRCUITO CERRADO. Conexión restaurada.'));
    }
    // 3. ACTUALIZADO: Cambiado para usar el disyuntor (.fire) en lugar de saltárselo
    async getTaskById(id) {
        return await this.getTaskByIdBreaker.fire(id);
    }
    async getTasksByProject(projectId) {
        return await this.getTasksByProjectBreaker.fire(projectId);
    }
    async createTask(taskData) {
        const response = await axios_1.default.post(`${this.TASKS_URL}/tasks`, taskData);
        return response.data;
    }
    async updateTask(id, taskData) {
        const response = await axios_1.default.patch(`${this.TASKS_URL}/tasks/${id}`, taskData);
        return response.data;
    }
    async deleteTask(id) {
        const response = await axios_1.default.delete(`${this.TASKS_URL}/tasks/${id}`);
        return response.data;
    }
}
exports.TasksService = TasksService;
//# sourceMappingURL=tasks.service.js.map