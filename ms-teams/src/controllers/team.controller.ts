import { Request, Response } from 'express';
import { TeamService } from '../service/team.service';

const teamService = new TeamService();

export class TeamController {
  async create(req: Request, res: Response) {
    try {
      const team = await teamService.createTeam(req.body);
      res.status(201).json(team);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const teams = await teamService.getAll();
      if (teams.length === 0) {
        return res.status(404).json({ error: 'No hay equipos registrados' });
      }
      res.json(teams);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTeamById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const team = await teamService.getTeamById(id);
      if (!team) {
        return res.status(404).json({ error: 'Equipo no encontrado' });
      }
      res.json(team);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateTeam(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await teamService.updateTeam(id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await teamService.updateStatus(id, status);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteTeam(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await teamService.deleteTeam(id);
      res.status(200).json({ message: 'Equipo eliminado correctamente' });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}