import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';

const taskService = new TaskService();

export class TaskController {
  
  // Crear Tarea
  async createTask(req: Request, res: Response) {
    try {
      const task = await taskService.createTask(req.body);
      res.status(201).json(task);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Obtener Tareas por Proyecto
  async getTasksByProject(req: Request, res: Response) {
  try {
    const { projectId } = req.params; // <- era "taskId", estaba incorrecto
    const tasks = await taskService.getTasksByProject(projectId);
    res.status(200).json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

  async updateTask(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const data = req.body;
    const updatedTask = await taskService.updateTask(id, data);
    res.status(200).json(updatedTask);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
  async deleteTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await taskService.deleteTask(id);
      res.status(200).json({ message: "Tarea eliminada correctamente" });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async getTaskById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const task = await taskService.getTaskById(id);
      if (!task) return res.status(404).json({ error: "Tarea no encontrada" });
      res.status(200).json(task);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }


}