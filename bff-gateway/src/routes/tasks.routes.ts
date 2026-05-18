import { Router, Request, Response } from 'express';
import { TasksService } from '../services/tasks.service';

const router = Router();
const tasksService = new TasksService();

router.get('/api/tasks/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const task = await tasksService.getTaskById(id);
        res.json(task);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/tasks', async (req: Request, res: Response) => {
    try {
        const taskData = req.body as { title: string; description: string; projectId: string };
        const task = await tasksService.createTask(taskData);
        res.status(201).json(task);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/api/tasks/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const task = await tasksService.deleteTask(id);
        res.json(task);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}); 

router.patch('/api/tasks/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const taskData = req.body;
        const task = await tasksService.updateTask(id, taskData);
        res.json(task);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/api/projects/:projectId/tasks', async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params as { projectId: string };
        const tasks = await tasksService.getTasksByProject(projectId);
        res.json(tasks);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;