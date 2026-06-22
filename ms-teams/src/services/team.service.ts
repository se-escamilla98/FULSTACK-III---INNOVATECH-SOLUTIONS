import { PrismaClient, Team } from '@prisma/client';
import { TeamFactory } from '../factories/team.factory';

const prisma = new PrismaClient();

export class TeamService {

  async createTeam(data: {
    name: string;
    description: string;
    area: string;
    leaderId: string;
    members?: { name: string; role: string }[];
  }): Promise<Team> {
    const teamData = TeamFactory.create(data.name, data.description, data.area, data.leaderId);
    return await prisma.team.create({
      data: {
        ...(teamData as any),
        members: data.members && data.members.length > 0
          ? { create: data.members }
          : undefined,
      },
      include: { members: true },
    });
  }

  async getAll(): Promise<Team[]> {
    return await prisma.team.findMany({
      include: { members: true },
    });
  }

  async getTeamById(id: string): Promise<Team | null> {
    return await prisma.team.findUnique({
      where: { id },
      include: { members: true },
    });
  }

  async updateStatus(id: string, newStatus: string): Promise<Team> {
    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) throw new Error(`Equipo con ID ${id} no encontrado`);
    return await prisma.team.update({
      where: { id },
      data: { status: newStatus as any },
      include: { members: true },
    });
  }

  async updateTeam(id: string, data: { name?: string; description?: string; area?: string }): Promise<Team> {
    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) throw new Error(`Equipo con ID ${id} no encontrado`);
    return await prisma.team.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
      include: { members: true },
    });
  }

  async addMember(teamId: string, member: { name: string; role: string }) {
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new Error(`Equipo con ID ${teamId} no encontrado`);
    return await prisma.member.create({
      data: { ...member, teamId },
    });
  }

  async removeMember(memberId: string) {
    try {
      return await prisma.member.delete({ where: { id: memberId } });
    } catch {
      throw new Error(`No se pudo eliminar el miembro con ID ${memberId}`);
    }
  }

  async deleteTeam(id: string): Promise<Team> {
    try {
      return await prisma.team.delete({
        where: { id },
        include: { members: true },
      });
    } catch (error) {
      throw new Error(`No se pudo eliminar el equipo con ID ${id}. Verifique si existe.`);
    }
  }
}