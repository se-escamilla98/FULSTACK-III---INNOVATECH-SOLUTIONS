export declare class TasksService {
    private readonly TASKS_URL;
    private getTaskByIdBreaker;
    private getTasksByProjectBreaker;
    constructor();
    getTaskById(id: string): Promise<unknown>;
    getTasksByProject(projectId: string): Promise<unknown>;
    createTask(taskData: any): Promise<any>;
    updateTask(id: string, taskData: any): Promise<any>;
    deleteTask(id: string): Promise<any>;
}
//# sourceMappingURL=tasks.service.d.ts.map