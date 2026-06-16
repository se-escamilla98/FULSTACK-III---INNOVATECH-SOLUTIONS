import { PrismaClient, Task } from '@prisma/client';
import { TaskFactory } from '../factories/task.factory';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

export class TaskService {

  // 1. CREAR TAREA (ahora usa TaskFactory como los otros microservicios)
  async createTask(data: any): Promise<Task> {
    const taskData = TaskFactory.create(data);
    return await prisma.task.create({
      data: taskData as any
    });
  }

  // 2. OBTENER POR PROYECTO
  async getTasksByProject(projectId: string) {
    return await prisma.task.findMany({
      where: { projectId }
    });
  }

  // 3. ACTUALIZAR TAREA (PATCH)
  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    try {
      return await prisma.task.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      throw new Error(`No se pudo actualizar la tarea con ID ${id}. Verifique si existe.`);
    }
  }

  // 4. ELIMINAR TAREA
  async deleteTask(id: string): Promise<Task> {
    try {
      return await prisma.task.delete({
        where: { id }
      });
    } catch (error) {
      throw new Error(`No se pudo eliminar la tarea con ID ${id}. Es posible que no exista.`);
    }
  }

  // 5. OBTENER POR ID
  async getTaskById(id: string): Promise<Task | null> {
    return await prisma.task.findUnique({ where: { id } });
  }
}