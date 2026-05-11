import { PrismaClient, Project } from '@prisma/client';
import { ProjectFactory } from '../factorie/project.factory';

const prisma = new PrismaClient();

export class ProjectService {
  
  // Registrar nuevos proyectos [cite: 16]
  async createProject(data: { name: string; description: string }): Promise<Project> {
    const projectData = ProjectFactory.create(data.name, data.description);
    return await prisma.project.create({
      data: projectData as any
    });
  }

  // Consultar listado de proyectos [cite: 17]
  async getAllProjects(): Promise<Project[]> {
    return await prisma.project.findMany();
  }

  // Consultar información detallada [cite: 18]
  async getProjectById(id: string): Promise<Project | null> {
    return await prisma.project.findUnique({ where: { id } });
  }

  // Cambiar el estado de un proyecto [cite: 20]
  async updateStatus(id: string, newStatus: string): Promise<Project> {
    // Regla de negocio: No se puede finalizar si hay tareas pendientes 
    if (newStatus === "COMPLETED") {
      const hasPendingTasks = await this.checkPendingTasks(id);
      if (hasPendingTasks) {
        throw new Error("No se puede marcar como finalizado: existen tareas pendientes");
      }
    }

    return await prisma.project.update({
      where: { id },
      data: { status: newStatus }
    });
  }

  private async checkPendingTasks(projectId: string): Promise<boolean> {
    // Nota: Aquí es donde se integrará con el MS de Tareas más adelante [cite: 32, 59]
    return false; 
  }
}