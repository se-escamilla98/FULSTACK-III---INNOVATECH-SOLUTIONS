import { Request, Response } from 'express';
import { ProjectService } from '../service/project.service';

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
    const projects = await projectService.getAllProjects();
    res.json(projects);
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await projectService.updateStatus(id, status);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}