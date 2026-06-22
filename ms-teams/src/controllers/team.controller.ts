import { Request, Response } from 'express';
import { TeamService } from '../services/team.service';

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
      res.json(teams);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTeamById(req: Request, res: Response) {
    try {
      const team = await teamService.getTeamById(req.params.id);
      if (!team) return res.status(404).json({ error: 'Equipo no encontrado' });
      res.json(team);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateTeam(req: Request, res: Response) {
    try {
      const team = await teamService.updateTeam(req.params.id, req.body);
      res.json(team);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const team = await teamService.updateStatus(req.params.id, req.body.status);
      res.json(team);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async addMember(req: Request, res: Response) {
    try {
      const member = await teamService.addMember(req.params.id, req.body);
      res.status(201).json(member);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async removeMember(req: Request, res: Response) {
    try {
      await teamService.removeMember(req.params.memberId);
      res.json({ message: 'Miembro eliminado correctamente' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteTeam(req: Request, res: Response) {
    try {
      const team = await teamService.deleteTeam(req.params.id);
      res.json(team);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}