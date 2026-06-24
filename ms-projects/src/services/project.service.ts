import { PrismaClient, Project } from '@prisma/client';
import { ProjectFactory } from '../factories/project.factory';
import axios from 'axios';

const prisma = new PrismaClient();

export class ProjectService {

  // Registrar nuevos proyectos
  async createProject(data: {
    name: string;
    description: string;
    area?: string;
    teamId?: string;
  }): Promise<Project> {
    const projectData = ProjectFactory.create(data.name, data.description);
    return await prisma.project.create({
      data: {
        ...(projectData as any),
        area:   data.area   || 'General',
        teamId: data.teamId || null,
      }
    });
  }

  // Consultar listado de proyectos
  async getAllProjects(): Promise<Project[]> {
    return await prisma.project.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  // Consultar información detallada
  async getProjectById(id: string): Promise<Project | null> {
    return await prisma.project.findUnique({ where: { id } });
  }

  // Cambiar el estado de un proyecto
  async updateStatus(id: string, newStatus: string, token?: string): Promise<Project> {
    if (newStatus === 'COMPLETED') {
      const hasPendingTasks = await this.checkPendingTasks(id, token);
      if (hasPendingTasks) {
        throw new Error('No se puede marcar como finalizado: existen tareas pendientes');
      }
    }
    return await prisma.project.update({
      where: { id },
      data: { status: newStatus }
    });
  }

  private async checkPendingTasks(projectId: string, token?: string): Promise<boolean> {
    try {
      const MS_TASKS_URL = process.env.MS_TASKS_URL || 'http://ms-tasks:3001';
      const response = await axios.get(
        `${MS_TASKS_URL}/projects/${projectId}/tasks`,
        token ? { headers: { Authorization: token } } : {}
      );
      const tasks = response.data;
      return tasks.some((task: any) => task.status === 'PENDING');
    } catch (error) {
      console.error('MS-Tasks no disponible:', error);
      return true;
    }
  }

  // Actualizar información del proyecto (nombre, descripción, área, equipo)
  async updateProject(id: string, data: {
    name?: string;
    description?: string;
    area?: string;
    teamId?: string | null;
  }): Promise<Project> {
    if (data.name !== undefined && data.name.trim() === '') {
      throw new Error('El nombre no puede quedar vacío');
    }
    if (data.description !== undefined && data.description.trim() === '') {
      throw new Error('La descripción no puede quedar vacía');
    }
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw new Error(`Proyecto con ID ${id} no encontrado`);
    return await prisma.project.update({
      where: { id },
      data: { ...data, updatedAt: new Date() }
    });
  }

  // Eliminar proyecto
  async deleteProject(id: string): Promise<Project> {
    try {
      return await prisma.project.delete({ where: { id } });
    } catch {
      throw new Error(`No se pudo eliminar el proyecto con ID ${id}. Verifique si existe.`);
    }
  }
}