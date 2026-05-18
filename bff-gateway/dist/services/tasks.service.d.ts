export declare class TasksService {
    private readonly TASKS_URL;
    constructor();
    getTaskById(id: string): Promise<any>;
    getTasksByProject(projectId: string): Promise<any>;
    createTask(taskData: any): Promise<any>;
    updateTask(id: string, taskData: any): Promise<any>;
    deleteTask(id: string): Promise<any>;
}
//# sourceMappingURL=tasks.service.d.ts.map