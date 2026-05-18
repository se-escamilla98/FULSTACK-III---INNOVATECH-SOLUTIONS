import { Router, Request, Response } from 'express';
import { TeamsService } from '../services/teams.service';

const router = Router();
const teamsService = new TeamsService();

router.get('/api/teams/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const team = await teamsService.getTeamById(id);
        res.json(team);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/teams', async (req: Request, res: Response) => {
    try {
        const teamData = req.body as { name: string; description: string };
        const team = await teamsService.createTeam(teamData);
        res.status(201).json(team);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/api/teams/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const team = await teamsService.deleteTeam(id);
        res.json(team);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}); 

router.patch('/api/teams/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const teamData = req.body as { name: string; description: string };
        const team = await teamsService.updateTeam(id, teamData);
        res.json(team);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/api/teams/:id/status', async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const { status } = req.body;
        const team = await teamsService.updateStatus(id, status);
        res.json(team);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;