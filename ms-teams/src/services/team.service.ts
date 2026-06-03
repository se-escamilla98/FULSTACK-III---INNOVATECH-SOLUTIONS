import { PrismaClient, Team } from '@prisma/client';
import { TeamFactory } from '../factories/team.factory';

const prisma = new PrismaClient();

export class TeamService {

  async createTeam(data: { name: string; description: string; area: string; leaderId: string }): Promise<Team> {
    const teamData = TeamFactory.create(data.name, data.description, data.area, data.leaderId);
    return await prisma.team.create({
      data: teamData as any
    });
  }

  async getAll(): Promise<Team[]> {
    return await prisma.team.findMany();
  }

  async getTeamById(id: string): Promise<Team | null> {
    return await prisma.team.findUnique({ where: { id } });
  }

  async updateStatus(id: string, newStatus: string): Promise<Team> {
    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) throw new Error(`Equipo con ID ${id} no encontrado`);

    return await prisma.team.update({
      where: { id },
      data: { status: newStatus as any }
    });
  }

  async updateTeam(id: string, data: { name?: string; description?: string; area?: string }): Promise<Team> {
    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) throw new Error(`Equipo con ID ${id} no encontrado`);

    return await prisma.team.update({
      where: { id },
      data: { ...data, updatedAt: new Date() }
    });
  }

  async deleteTeam(id: string): Promise<Team> {
    try {
      return await prisma.team.delete({ where: { id } });
    } catch (error) {
      throw new Error(`No se pudo eliminar el equipo con ID ${id}. Verifique si existe.`);
    }
  }
}