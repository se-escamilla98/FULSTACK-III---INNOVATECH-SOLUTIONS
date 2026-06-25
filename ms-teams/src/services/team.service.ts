import { PrismaClient, Team } from '@prisma/client';
import { TeamFactory } from '../factories/team.factory';

const prisma = new PrismaClient();

export class TeamService {

  // ==================== EMPLOYEES ====================

  async createEmployee(data: {
    rut: string;
    firstName: string;
    secondName?: string;
    lastName: string;
    motherLastName?: string;
    position: string;
    hireDate: string;
  }) {
    if (!data.firstName?.trim()) throw new Error('El nombre es obligatorio');
    if (!data.lastName?.trim())  throw new Error('El apellido paterno es obligatorio');
    if (!data.rut?.trim())       throw new Error('El RUT es obligatorio');
    if (!data.position?.trim())  throw new Error('El cargo es obligatorio');
    if (!data.hireDate)          throw new Error('La fecha de contratación es obligatoria');

    return await prisma.employee.create({
      data: {
        rut:           data.rut,
        firstName:     data.firstName,
        secondName:    data.secondName || null,
        lastName:      data.lastName,
        motherLastName: data.motherLastName || null,
        position:      data.position,
        hireDate:      new Date(data.hireDate),
      }
    });
  }

  async getAllEmployees() {
    return await prisma.employee.findMany({
      orderBy: { lastName: 'asc' }
    });
  }

  async deleteEmployee(id: string) {
    try {
      return await prisma.employee.delete({ where: { id } });
    } catch {
      throw new Error(`No se pudo eliminar el empleado con ID ${id}`);
    }
  }

  // ==================== TEAMS ====================

  async createTeam(data: {
  name: string;
  description: string;
  area: string;
  leaderId: string;
  members?: { employeeId: string; name: string; role: string }[];
}): Promise<Team> {
  const teamData = TeamFactory.create(data.name, data.description, data.area, data.leaderId);

  // Obtener datos del empleado líder para incluirlo como miembro
  const leaderEmployee = await prisma.employee.findUnique({ where: { id: data.leaderId } });
  const leaderName = leaderEmployee
    ? [leaderEmployee.firstName, leaderEmployee.secondName, leaderEmployee.lastName, leaderEmployee.motherLastName]
        .filter(Boolean).join(' ')
    : data.leaderId;

  // Construir lista de miembros incluyendo al líder si no está ya
  const membersList = data.members ? [...data.members] : [];
  const leaderAlreadyMember = membersList.some(m => m.employeeId === data.leaderId);
  if (!leaderAlreadyMember) {
    membersList.unshift({ // unshift para que aparezca primero
      employeeId: data.leaderId,
      name:       leaderName,
      role:       'Tech Lead',
    });
  }

  return await prisma.team.create({
    data: {
      ...(teamData as any),
      members: membersList.length > 0
        ? { create: membersList }
        : undefined,
    },
    include: { members: true },
  });
}

  async getTeamById(id: string): Promise<Team | null> {
    return await prisma.team.findUnique({
      where: { id },
      include: { members: true },
    });
  }

  async getAll(): Promise<Team[]> {
  return await prisma.team.findMany({
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

  async addMember(teamId: string, member: { employeeId: string; name: string; role: string }) {
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
    } catch {
      throw new Error(`No se pudo eliminar el equipo con ID ${id}. Verifique si existe.`);
    }
  }
}
