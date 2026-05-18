import { Router, Request, Response } from 'express';
import { ProjectsService } from '../services/projects.service';

const router = Router();
const projectsService = new ProjectsService();

router.get('/api/projects/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const project = await projectsService.getProjectById(id);
        res.json(project);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/projects', async (req: Request, res: Response) => {
    try {
        const projectData = req.body as { name: string; description: string };
        const project = await projectsService.createProject(projectData);
        res.status(201).json(project);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/api/projects/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const project = await projectsService.deleteProject(id);
        res.json(project);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}); 

router.patch('/api/projects/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const projectData = req.body as { name: string; description: string };
        const project = await projectsService.updateProject(id, projectData);
        res.json(project);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/api/projects/:id/status', async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const { status } = req.body;
        const project = await projectsService.updateStatus(id, status);
        res.json(project);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;