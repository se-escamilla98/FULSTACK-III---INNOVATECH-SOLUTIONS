import  axios  from 'axios';
import dotenv from 'dotenv';
dotenv.config();  

export class TasksService {
    private readonly TASKS_URL: string;

    constructor() {
        this.TASKS_URL = process.env.MS_TASKS_URL as string; //disponible para todos los metofodos de esta clase
    }

    async getTaskById(id: string) {
        const response = await axios.get(`${this.TASKS_URL}/tasks/${id}`);
        return response.data;
    }

    async getTasksByProject(projectId: string) {
    const response = await axios.get(`${this.TASKS_URL}/tasks/project/${projectId}`);
    return response.data;
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