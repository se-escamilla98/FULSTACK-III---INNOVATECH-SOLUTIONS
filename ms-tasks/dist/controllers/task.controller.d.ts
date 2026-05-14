import { Request, Response } from 'express';
export declare class TaskController {
    createTask(req: Request, res: Response): Promise<void>;
    getTasksByProject(req: Request, res: Response): Promise<void>;
    updateTask(req: Request, res: Response): Promise<void>;
    deleteTask(req: Request, res: Response): Promise<void>;
    getTaskById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=task.controller.d.ts.map