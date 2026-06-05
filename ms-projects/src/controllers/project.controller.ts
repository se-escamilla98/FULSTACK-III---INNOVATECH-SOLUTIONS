import { Request, Response } from 'express';
import { ProjectService } from '../services/project.service';

const projectService = new ProjectService();

export class ProjectController {
  async create(req: Request, res: Response) {
    try {
      const project = await projectService.createProject(req.body);
      res.status(201).json(project);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const projects = await projectService.getAllProjects();
      res.json(projects);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const project = await projectService.getProjectById(id);
      if (!project) return res.status(404).json({ error: "Proyecto no encontrado" });
      res.json(project);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const updated = await projectService.updateProject(id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      const { status = '' } = req.body as { status: string };
      // Pasamos el token para que el service pueda llamar a MS-Tasks con autenticación
      const token = req.headers['authorization'] as string;
      const updated = await projectService.updateStatus(id, status, token);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params as { id: string };
      await projectService.deleteProject(id);
      res.status(200).json({ message: "Proyecto eliminado correctamente" });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}