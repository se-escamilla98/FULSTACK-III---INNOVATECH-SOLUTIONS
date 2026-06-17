import { TaskService } from '../../services/task.service';

jest.mock('@prisma/client', () => {
  const singleton = {
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => singleton) };
});

const { PrismaClient } = require('@prisma/client');
const mockPrisma = new PrismaClient();

const fakeTask = {
  id: 'task-001',
  name: 'Disenar login',
  description: 'Crear formulario',
  area: 'Frontend',
  status: 'PENDING',
  assignedTo: 'sebastian',
  teamId: 'team-001',
  projectId: 'proj-001',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const service = new TaskService();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TaskService', () => {

  describe('createTask', () => {
    it('debe crear una tarea con estado PENDING', async () => {
      mockPrisma.task.create.mockResolvedValue(fakeTask);

      const result = await service.createTask({
        name: 'Disenar login',
        description: 'Crear formulario',
        area: 'Frontend',
        assignedTo: 'sebastian',
        teamId: 'team-001',
        projectId: 'proj-001',
      });

      expect(mockPrisma.task.create).toHaveBeenCalledTimes(1);
      expect(result.name).toBe('Disenar login');
      expect(result.status).toBe('PENDING');
    });

    it('debe lanzar error si falta el nombre (via Factory)', async () => {
      await expect(
        service.createTask({ name: '', area: 'Dev', assignedTo: 'x', teamId: 't', projectId: 'p' })
      ).rejects.toThrow('nombre');

      expect(mockPrisma.task.create).not.toHaveBeenCalled();
    });

    it('debe lanzar error si falta el projectId (via Factory)', async () => {
      await expect(
        service.createTask({ name: 'Tarea', area: 'Dev', assignedTo: 'x', teamId: 't', projectId: '' })
      ).rejects.toThrow('Proyecto');

      expect(mockPrisma.task.create).not.toHaveBeenCalled();
    });
  });

  describe('getTasksByProject', () => {
    it('debe retornar las tareas de un proyecto', async () => {
      mockPrisma.task.findMany.mockResolvedValue([fakeTask]);

      const result = await service.getTasksByProject('proj-001');

      expect(result).toHaveLength(1);
      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: { projectId: 'proj-001' },
      });
    });

    it('debe retornar array vacio si no hay tareas', async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);

      const result = await service.getTasksByProject('proj-vacio');

      expect(result).toEqual([]);
    });
  });

  describe('getTaskById', () => {
    it('debe retornar la tarea si existe', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(fakeTask);

      const result = await service.getTaskById('task-001');

      expect(result).toBeDefined();
      expect((result as any).id).toBe('task-001');
    });

    it('debe retornar null si no existe', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      const result = await service.getTaskById('no-existe');

      expect(result).toBeNull();
    });
  });

  describe('updateTask', () => {
    it('debe actualizar la tarea', async () => {
      const updated = { ...fakeTask, status: 'COMPLETED' };
      mockPrisma.task.update.mockResolvedValue(updated);

      const result = await service.updateTask('task-001', { status: 'COMPLETED' } as any);

      expect(result.status).toBe('COMPLETED');
    });

    it('debe lanzar error si la tarea no existe', async () => {
      mockPrisma.task.update.mockRejectedValue(new Error('Not found'));

      await expect(
        service.updateTask('no-existe', { status: 'COMPLETED' } as any)
      ).rejects.toThrow('No se pudo actualizar');
    });
  });

  describe('deleteTask', () => {
    it('debe eliminar la tarea', async () => {
      mockPrisma.task.delete.mockResolvedValue(fakeTask);

      const result = await service.deleteTask('task-001');

      expect(result.id).toBe('task-001');
    });

    it('debe lanzar error si la tarea no existe', async () => {
      mockPrisma.task.delete.mockRejectedValue(new Error('Not found'));

      await expect(
        service.deleteTask('no-existe')
      ).rejects.toThrow('No se pudo eliminar');
    });
  });
});