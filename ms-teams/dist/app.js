"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const team_controller_1 = require("./controllers/team.controller"); // Ya en plural
const swagger_1 = require("./swagger");
const auth_middleware_1 = require("./middlewares/auth.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3003;
const teamController = new team_controller_1.TeamController();
app.use(express_1.default.json());
(0, swagger_1.setupSwagger)(app);
// ZERO TRUST MIDDLEWARE
app.use('/teams', auth_middleware_1.verifyToken);
// CRUD protegido
app.post('/teams', (req, res) => teamController.create(req, res));
app.get('/teams', (req, res) => teamController.getAll(req, res));
app.get('/teams/:id', (req, res) => teamController.getTeamById(req, res));
app.patch('/teams/:id', (req, res) => teamController.updateTeam(req, res));
app.patch('/teams/:id/status', (req, res) => teamController.updateStatus(req, res));
app.delete('/teams/:id', (req, res) => teamController.deleteTeam(req, res));
app.listen(port, () => {
    console.log(`🚀 MS-TEAMS corriendo en http://localhost:${port}`);
    console.log(`📖 Swagger en http://localhost:${port}/api-docs`);
});
//# sourceMappingURL=app.js.map