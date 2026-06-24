import { Router, Request, Response } from 'express';
import { TasksService } from '../services/tasks.service';

const router = Router();
const tasksService = new TasksService();

const getToken = (req: Request) => req.headers['authorization'] as string | undefined;

// ─── TASKS ────────────────────────────────────────────────────────────────────
router.post('/tasks', async (req: Request, res: Response) => {
    try {
        const task = await tasksService.createTask(req.body, getToken(req));
        res.status(201).json(task);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/tasks/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const task = await tasksService.getTaskById(id, getToken(req));
        res.json(task);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/projects/:projectId/tasks', async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const tasks = await tasksService.getTasksByProject(projectId, getToken(req));
        res.json(tasks);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/tasks/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const task = await tasksService.updateTask(id, req.body, getToken(req));
        res.json(task);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/tasks/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await tasksService.deleteTask(id, getToken(req));
        res.status(200).json({ message: 'Tarea eliminada correctamente' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ─── BITÁCORA ─────────────────────────────────────────────────────────────────
router.post('/tasks/:id/logs', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const log = await tasksService.addLog(id, req.body, getToken(req));
        res.status(201).json(log);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/tasks/:id/logs', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const logs = await tasksService.getLogs(id, getToken(req));
        res.json(logs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/tasks/:id/logs/:logId', async (req: Request, res: Response) => {
    try {
        const { id, logId } = req.params;
        await tasksService.deleteLog(id, logId, getToken(req));
        res.status(200).json({ message: 'Entrada eliminada correctamente' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;