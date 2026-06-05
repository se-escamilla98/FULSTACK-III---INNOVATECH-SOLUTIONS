import { Router, Request, Response } from 'express';
import { ProjectsService } from '../services/projects.service';

const router = Router();
const projectsService = new ProjectsService();

// Helper para extraer el token del request
const getToken = (req: Request) => req.headers['authorization'] as string | undefined;

router.get('/projects', async (req: Request, res: Response) => {
    try {
        const projects = await projectsService.getAllProjects(getToken(req));
        res.json(projects);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/projects/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const project = await projectsService.getProjectById(id, getToken(req));
        res.json(project);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/projects', async (req: Request, res: Response) => {
    try {
        const project = await projectsService.createProject(req.body, getToken(req));
        res.status(201).json(project);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/projects/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const project = await projectsService.updateProject(id, req.body, getToken(req));
        res.json(project);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/projects/:id/status', async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const { status } = req.body as { status: string };
        const project = await projectsService.updateStatus(id, status, getToken(req));
        res.json(project);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/projects/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        await projectsService.deleteProject(id, getToken(req));
        res.status(200).json({ message: 'Proyecto eliminado correctamente' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;