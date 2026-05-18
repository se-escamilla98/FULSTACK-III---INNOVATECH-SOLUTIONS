"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class TasksService {
    constructor() {
        this.TASKS_URL = process.env.MS_TASKS_URL; //disponible para todos los metofodos de esta clase
    }
    async getTaskById(id) {
        const response = await axios_1.default.get(`${this.TASKS_URL}/tasks/${id}`);
        return response.data;
    }
    async getTasksByProject(projectId) {
        const response = await axios_1.default.get(`${this.TASKS_URL}/tasks/project/${projectId}`);
        return response.data;
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