"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const team_controller_1 = require("./controllers/team.controller");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3003;
const teamController = new team_controller_1.TeamController();
app.use(express_1.default.json());
// CRUD completo
app.post('/teams', (req, res) => teamController.create(req, res));
app.get('/teams', (req, res) => teamController.getAll(req, res));
app.get('/teams/:id', (req, res) => teamController.getTeamById(req, res));
app.patch('/teams/:id', (req, res) => teamController.updateTeam(req, res));
app.patch('/teams/:id/status', (req, res) => teamController.updateStatus(req, res));
app.delete('/teams/:id', (req, res) => teamController.deleteTeam(req, res));
app.listen(port, () => {
    console.log(`🚀 MS-TEAMS corriendo en http://localhost:${port}`);
});
//# sourceMappingURL=app.js.map