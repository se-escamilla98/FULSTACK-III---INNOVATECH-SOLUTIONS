"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teams_service_1 = require("../services/teams.service");
const router = (0, express_1.Router)();
const teamsService = new teams_service_1.TeamsService();
router.get('/api/teams', async (req, res) => {
    try {
        const projects = await teamsService.getAllTeams();
        res.json(projects);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/api/teams/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const team = await teamsService.getTeamById(id);
        res.json(team);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/api/teams', async (req, res) => {
    try {
        const teamData = req.body;
        const team = await teamsService.createTeam(teamData);
        res.status(201).json(team);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.delete('/api/teams/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const team = await teamsService.deleteTeam(id);
        res.json(team);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.patch('/api/teams/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const teamData = req.body;
        const team = await teamsService.updateTeam(id, teamData);
        res.json(team);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.patch('/api/teams/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const team = await teamsService.updateStatus(id, status);
        res.json(team);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=teams.routes.js.map