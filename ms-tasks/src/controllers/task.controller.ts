import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';

const taskService = new TaskService();

export class TaskController {

  // ==================== TASKS ====================

  async createTask(req: Request, res: Response) {
    try {
      const task = await taskService.createTask(req.body);
      res.status(201).json(task);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getTasksByProject(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const tasks = await taskService.getTasksByProject(projectId);
      res.status(200).json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updatedTask = await taskService.updateTask(id, req.body);
      res.status(200).json(updatedTask);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async deleteTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await taskService.deleteTask(id);
      res.status(200).json({ message: 'Tarea eliminada correctamente' });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async getTaskById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const task = await taskService.getTaskById(id);
      if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
      res.status(200).json(task);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // ==================== BITÁCORA ====================

  async addLog(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const log = await taskService.addLog(id, req.body);
      res.status(201).json(log);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getLogsByTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const logs = await taskService.getLogsByTask(id);
      res.status(200).json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteLog(req: Request, res: Response) {
    try {
      const { logId } = req.params;
      await taskService.deleteLog(logId);
      res.status(200).json({ message: 'Entrada de bitácora eliminada' });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}
