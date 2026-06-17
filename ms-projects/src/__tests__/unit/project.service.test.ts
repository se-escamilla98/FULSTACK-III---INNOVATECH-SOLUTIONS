import { ProjectService } from '../../services/project.service';
import axios from 'axios';

// 1. Mock de axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// 2. Mock de Prisma: el mock se define DENTRO de jest.mock para evitar el error de hoisting
jest.mock('@prisma/client', () => {
  const singleton = {
    project: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => singleton) };
});

// 3. Obtenemos referencia al mock despues de que jest.mock se ejecuto
const { PrismaClient } = require('@prisma/client');
const mockPrisma = new PrismaClient();

// Datos de prueba
const fakeProject = {
  id: 'uuid-001',
  name: 'Proyecto Alpha',
  description: 'Sistema de gestion',
  status: 'PLANNED',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const service = new ProjectService();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ProjectService', () => {

  describe('createProject', () => {
    it('debe crear un proyecto con estado PLANNED', async () => {
      mockPrisma.project.create.mockResolvedValue(fakeProject);

      const result = await service.createProject({
        name: 'Proyecto Alpha',
        description: 'Sistema de gestion',
      });

      expect(mockPrisma.project.create).toHaveBeenCalledTimes(1);
      expect(result.name).toBe('Proyecto Alpha');
      expect(result.status).toBe('PLANNED');
    });

    it('debe lanzar error si el nombre esta vacio (via Factory)', async () => {
      await expect(
        service.createProject({ name: '', description: 'Desc' })
      ).rejects.toThrow('El nombre es obligatorio');

      expect(mockPrisma.project.create).not.toHaveBeenCalled();
    });
  });

  describe('getAllProjects', () => {
    it('debe retornar la lista de proyectos', async () => {
      mockPrisma.project.findMany.mockResolvedValue([fakeProject]);

      const result = await service.getAllProjects();

      expect(result).toHaveLength(1);
      expect((result[0] as any).name).toBe('Proyecto Alpha');
    });

    it('debe retornar array vacio si no hay proyectos', async () => {
      mockPrisma.project.findMany.mockResolvedValue([]);

      const result = await service.getAllProjects();

      expect(result).toEqual([]);
    });
  });

  describe('getProjectById', () => {
    it('debe retornar el proyecto si existe', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(fakeProject);

      const result = await service.getProjectById('uuid-001');

      expect(result).toBeDefined();
      expect((result as any).id).toBe('uuid-001');
    });

    it('debe retornar null si no existe', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      const result = await service.getProjectById('no-existe');

      expect(result).toBeNull();
    });
  });

  describe('updateProject', () => {
    it('debe actualizar nombre y descripcion', async () => {
      const updated = { ...fakeProject, name: 'Nuevo Nombre' };
      mockPrisma.project.findUnique.mockResolvedValue(fakeProject);
      mockPrisma.project.update.mockResolvedValue(updated);

      const result = await service.updateProject('uuid-001', { name: 'Nuevo Nombre' });

      expect(result.name).toBe('Nuevo Nombre');
    });

    it('debe lanzar error si el nombre queda vacio', async () => {
      await expect(
        service.updateProject('uuid-001', { name: '' })
      ).rejects.toThrow('El nombre no puede quedar vacío');
    });

    it('debe lanzar error si la descripcion queda vacia', async () => {
      await expect(
        service.updateProject('uuid-001', { description: '  ' })
      ).rejects.toThrow('La descripción no puede quedar vacía');
    });

    it('debe lanzar error si el proyecto no existe', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProject('no-existe', { name: 'Nuevo' })
      ).rejects.toThrow('no encontrado');
    });
  });

  describe('updateStatus', () => {
    it('debe cambiar estado a IN_PROGRESS sin validar tareas', async () => {
      const updated = { ...fakeProject, status: 'IN_PROGRESS' };
      mockPrisma.project.update.mockResolvedValue(updated);

      const result = await service.updateStatus('uuid-001', 'IN_PROGRESS');

      expect(result.status).toBe('IN_PROGRESS');
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('debe permitir COMPLETED si no hay tareas pendientes', async () => {
      mockedAxios.get.mockResolvedValue({
        data: [
          { id: '1', status: 'COMPLETED' },
          { id: '2', status: 'COMPLETED' },
        ],
      });
      const updated = { ...fakeProject, status: 'COMPLETED' };
      mockPrisma.project.update.mockResolvedValue(updated);

      const result = await service.updateStatus('uuid-001', 'COMPLETED', 'Bearer token');

      expect(result.status).toBe('COMPLETED');
      expect(mockedAxios.get).toHaveBeenCalled();
    });

    it('debe rechazar COMPLETED si hay tareas pendientes', async () => {
      mockedAxios.get.mockResolvedValue({
        data: [
          { id: '1', status: 'COMPLETED' },
          { id: '2', status: 'PENDING' },
        ],
      });

      await expect(
        service.updateStatus('uuid-001', 'COMPLETED', 'Bearer token')
      ).rejects.toThrow('tareas pendientes');
    });

    it('debe rechazar COMPLETED si ms-tasks no esta disponible', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Connection refused'));

      await expect(
        service.updateStatus('uuid-001', 'COMPLETED', 'Bearer token')
      ).rejects.toThrow('tareas pendientes');
    });
  });

  describe('deleteProject', () => {
    it('debe eliminar el proyecto', async () => {
      mockPrisma.project.delete.mockResolvedValue(fakeProject);

      const result = await service.deleteProject('uuid-001');

      expect(result.id).toBe('uuid-001');
    });

    it('debe lanzar error si el proyecto no existe', async () => {
      mockPrisma.project.delete.mockRejectedValue(new Error('Not found'));

      await expect(
        service.deleteProject('no-existe')
      ).rejects.toThrow('No se pudo eliminar');
    });
  });
});