import { Router, Request, Response } from 'express';
import { TeamsService } from '../services/teams.service';

const router = Router();
const teamsService = new TeamsService();

const getToken = (req: Request) => req.headers['authorization'] as string | undefined;

router.get('/teams', async (req: Request, res: Response) => {
    try {
        const teams = await teamsService.getAllTeams(getToken(req));
        res.json(teams);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/teams/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const team = await teamsService.getTeamById(id, getToken(req));
        res.json(team);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/teams', async (req: Request, res: Response) => {
    try {
        const team = await teamsService.createTeam(req.body, getToken(req));
        res.status(201).json(team);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/teams/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const team = await teamsService.updateTeam(id, req.body, getToken(req));
        res.json(team);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/teams/:id/status', async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const { status } = req.body as { status: string };
        const team = await teamsService.updateStatus(id, status, getToken(req));
        res.json(team);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/teams/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        await teamsService.deleteTeam(id, getToken(req));
        res.status(200).json({ message: 'Equipo eliminado correctamente' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;