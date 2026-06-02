import { Router, Request, Response } from 'express';
import { ProjectsService } from '../services/projects.service';

const router = Router();
const projectsService = new ProjectsService();
router.get('/projects', async (req: Request, res: Response) => {
  try {
    const projects = await projectsService.getAllProjects();
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/projects', async (req: Request, res: Response) => {
  try {
    const projectData = req.body as { name: string; description: string };
    const project = await projectsService.createProject(projectData);
    res.status(201).json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/projects/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { status } = req.body as { status: string };
    const project = await projectsService.updateStatus(id, status);
    res.json(project);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;