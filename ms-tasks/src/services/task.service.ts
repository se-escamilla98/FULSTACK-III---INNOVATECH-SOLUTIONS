import { PrismaClient, Task } from '@prisma/client';
import { TaskFactory } from '../factories/task.factory';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

export class TaskService {

  // ==================== TASKS ====================

  async createTask(data: any): Promise<Task> {
    const taskData = TaskFactory.create(data);
    return await prisma.task.create({
      data: taskData as any
    });
  }

  async getTasksByProject(projectId: string) {
    return await prisma.task.findMany({
      where: { projectId },
      include: { logs: true }
    });
  }

  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    try {
      return await prisma.task.update({
        where: { id },
        data: { ...data, updatedAt: new Date() }
      });
    } catch {
      throw new Error(`No se pudo actualizar la tarea con ID ${id}. Verifique si existe.`);
    }
  }

  async deleteTask(id: string): Promise<Task> {
    try {
      return await prisma.task.delete({ where: { id } });
    } catch {
      throw new Error(`No se pudo eliminar la tarea con ID ${id}. Es posible que no exista.`);
    }
  }

  async getTaskById(id: string): Promise<Task | null> {
    return await prisma.task.findUnique({
      where: { id },
      include: { logs: true } as any
    });
  }

  // ==================== BITÁCORA (TaskLog) ====================

  async addLog(taskId: string, data: {
    employeeId: string;
    authorName: string;
    comment: string;
  }) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new Error(`Tarea con ID ${taskId} no encontrada`);
    return await prisma.taskLog.create({
      data: { taskId, ...data }
    });
  }

  async getLogsByTask(taskId: string) {
    return await prisma.taskLog.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' }
    });
  }

  async deleteLog(logId: string) {
    try {
      return await prisma.taskLog.delete({ where: { id: logId } });
    } catch {
      throw new Error(`No se pudo eliminar la entrada de bitácora con ID ${logId}`);
    }
  }
}
