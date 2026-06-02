import { Router, Request, Response } from 'express';
import { TasksService } from '../services/tasks.service';

const router = Router();
const tasksService = new TasksService();

router.post('/tasks', async (req: Request, res: Response) => {
  try {
    const taskData = req.body;
    const task = await tasksService.createTask(taskData);
    res.status(201).json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;