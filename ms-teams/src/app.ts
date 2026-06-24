import express from 'express';
import dotenv from 'dotenv';
import { TeamController } from './controllers/team.controller';
import { setupSwagger } from './swagger';
import { verifyToken } from './middlewares/auth.middleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 3003;
const teamController = new TeamController();

app.use(express.json());
setupSwagger(app);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ms-teams', uptime: Math.floor(process.uptime()) });
});

// ─── EMPLOYEES ────────────────────────────────────────────────────────────────
// Rutas protegidas con Zero Trust (mismo patrón que /teams)
app.use('/employees', verifyToken);

app.get('/employees',       (req, res) => teamController.getAllEmployees(req, res));
app.post('/employees',      (req, res) => teamController.createEmployee(req, res));
app.delete('/employees/:id',(req, res) => teamController.deleteEmployee(req, res));

// ─── TEAMS ────────────────────────────────────────────────────────────────────
app.use('/teams', verifyToken);

app.post('/teams',                                     (req, res) => teamController.create(req, res));
app.get('/teams',                                      (req, res) => teamController.getAll(req, res));
app.get('/teams/:id',                                  (req, res) => teamController.getTeamById(req, res));
app.patch('/teams/:id',                                (req, res) => teamController.updateTeam(req, res));
app.patch('/teams/:id/status',                         (req, res) => teamController.updateStatus(req, res));
app.delete('/teams/:id',                               (req, res) => teamController.deleteTeam(req, res));
app.post('/teams/:id/members',      verifyToken,       (req, res) => teamController.addMember(req, res));
app.delete('/teams/:id/members/:memberId', verifyToken,(req, res) => teamController.removeMember(req, res));

app.listen(port, () => {
  console.log(`🚀 MS-TEAMS corriendo en http://localhost:${port}`);
  console.log(`📖 Swagger en http://localhost:${port}/api-docs`);
});