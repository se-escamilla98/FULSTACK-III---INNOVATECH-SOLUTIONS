import { PrismaClient, Task } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

export class TaskService {
  
  // 1. CREAR TAREA
  async createTask(data: any): Promise<Task> {
    if (!data.name || data.name.trim() === "") {
      throw new Error("El nombre de la tarea es obligatorio");
    }
    if (!data.projectId) {
      throw new Error("Toda tarea debe estar asociada a un Proyecto");
    }

    return await prisma.task.create({
      data: {
        name: data.name,
        description: data.description,
        area: data.area,
        assignedTo: data.assignedTo,
        teamId: data.teamId,
        projectId: data.projectId,
        status: data.status || 'PENDING'
      }
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
  async deleteTask(id: string): Promise<Task> {
  try {
    return await prisma.task.delete({
      where: { id }
    });
  } catch (error) {
    throw new Error(`No se pudo eliminar la tarea con ID ${id}. Es posible que no exista.`);
  }
}

}