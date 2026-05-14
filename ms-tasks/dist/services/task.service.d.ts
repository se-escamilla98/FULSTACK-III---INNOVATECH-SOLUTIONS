import { Task } from '@prisma/client';
export declare class TaskService {
    createTask(data: any): Promise<Task>;
    getTasksByProject(projectId: string): Promise<{
        name: string;
        id: string;
        description: string | null;
        area: string;
        status: import(".prisma/client").$Enums.TaskStatus;
        assignedTo: string;
        teamId: string;
        projectId: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    updateTask(id: string, data: Partial<Task>): Promise<Task>;
    deleteTask(id: string): Promise<Task>;
    getTaskById(id: string): Promise<Task | null>;
}
//# sourceMappingURL=task.service.d.ts.map