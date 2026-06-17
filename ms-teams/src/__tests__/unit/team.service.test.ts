import { TeamService } from '../../services/team.service';

jest.mock('@prisma/client', () => {
  const singleton = {
    team: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => singleton),
    TeamStatus: { ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' },
  };
});

const { PrismaClient } = require('@prisma/client');
const mockPrisma = new PrismaClient();

const fakeTeam = {
  id: 'team-001',
  name: 'Equipo Alpha',
  description: 'Equipo de desarrollo',
  status: 'ACTIVE',
  area: 'TI',
  leaderId: 'leader-001',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const service = new TeamService();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TeamService', () => {

  describe('createTeam', () => {
    it('debe crear un equipo con estado ACTIVE', async () => {
      mockPrisma.team.create.mockResolvedValue(fakeTeam);

      const result = await service.createTeam({
        name: 'Equipo Alpha',
        description: 'Equipo de desarrollo',
        area: 'TI',
        leaderId: 'leader-001',
      });

      expect(mockPrisma.team.create).toHaveBeenCalledTimes(1);
      expect(result.name).toBe('Equipo Alpha');
      expect(result.status).toBe('ACTIVE');
    });

    it('debe lanzar error si falta el nombre (via Factory)', async () => {
      await expect(
        service.createTeam({ name: '', description: 'D', area: 'TI', leaderId: 'x' })
      ).rejects.toThrow('nombre');

      expect(mockPrisma.team.create).not.toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('debe retornar la lista de equipos', async () => {
      mockPrisma.team.findMany.mockResolvedValue([fakeTeam]);

      const result = await service.getAll();

      expect(result).toHaveLength(1);
      expect((result[0] as any).name).toBe('Equipo Alpha');
    });

    it('debe retornar array vacio si no hay equipos', async () => {
      mockPrisma.team.findMany.mockResolvedValue([]);

      const result = await service.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('getTeamById', () => {
    it('debe retornar el equipo si existe', async () => {
      mockPrisma.team.findUnique.mockResolvedValue(fakeTeam);

      const result = await service.getTeamById('team-001');

      expect(result).toBeDefined();
      expect((result as any).id).toBe('team-001');
    });

    it('debe retornar null si no existe', async () => {
      mockPrisma.team.findUnique.mockResolvedValue(null);

      const result = await service.getTeamById('no-existe');

      expect(result).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('debe cambiar el estado del equipo', async () => {
      const updated = { ...fakeTeam, status: 'INACTIVE' };
      mockPrisma.team.findUnique.mockResolvedValue(fakeTeam);
      mockPrisma.team.update.mockResolvedValue(updated);

      const result = await service.updateStatus('team-001', 'INACTIVE');

      expect(result.status).toBe('INACTIVE');
    });

    it('debe lanzar error si el equipo no existe', async () => {
      mockPrisma.team.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus('no-existe', 'INACTIVE')
      ).rejects.toThrow('no encontrado');
    });
  });

  describe('updateTeam', () => {
    it('debe actualizar datos del equipo', async () => {
      const updated = { ...fakeTeam, name: 'Equipo Beta' };
      mockPrisma.team.findUnique.mockResolvedValue(fakeTeam);
      mockPrisma.team.update.mockResolvedValue(updated);

      const result = await service.updateTeam('team-001', { name: 'Equipo Beta' });

      expect(result.name).toBe('Equipo Beta');
    });

    it('debe lanzar error si el equipo no existe', async () => {
      mockPrisma.team.findUnique.mockResolvedValue(null);

      await expect(
        service.updateTeam('no-existe', { name: 'Nuevo' })
      ).rejects.toThrow('no encontrado');
    });
  });

  describe('deleteTeam', () => {
    it('debe eliminar el equipo', async () => {
      mockPrisma.team.delete.mockResolvedValue(fakeTeam);

      const result = await service.deleteTeam('team-001');

      expect(result.id).toBe('team-001');
    });

    it('debe lanzar error si el equipo no existe', async () => {
      mockPrisma.team.delete.mockRejectedValue(new Error('Not found'));

      await expect(
        service.deleteTeam('no-existe')
      ).rejects.toThrow('No se pudo eliminar');
    });
  });
});