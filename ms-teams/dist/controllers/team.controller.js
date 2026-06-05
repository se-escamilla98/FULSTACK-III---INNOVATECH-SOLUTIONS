"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamController = void 0;
const team_service_1 = require("../services/team.service");
const teamService = new team_service_1.TeamService();
class TeamController {
    async create(req, res) {
        try {
            const team = await teamService.createTeam(req.body);
            res.status(201).json(team);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getAll(req, res) {
        try {
            const teams = await teamService.getAll();
            if (teams.length === 0) {
                return res.status(404).json({ error: 'No hay equipos registrados' });
            }
            res.json(teams);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getTeamById(req, res) {
        try {
            const { id } = req.params;
            const team = await teamService.getTeamById(id);
            if (!team) {
                return res.status(404).json({ error: 'Equipo no encontrado' });
            }
            res.json(team);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async updateTeam(req, res) {
        try {
            const { id } = req.params;
            const updated = await teamService.updateTeam(id, req.body);
            res.json(updated);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const updated = await teamService.updateStatus(id, status);
            res.json(updated);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async deleteTeam(req, res) {
        try {
            const { id } = req.params;
            await teamService.deleteTeam(id);
            res.status(200).json({ message: 'Equipo eliminado correctamente' });
        }
        catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
}
exports.TeamController = TeamController;
//# sourceMappingURL=team.controller.js.map