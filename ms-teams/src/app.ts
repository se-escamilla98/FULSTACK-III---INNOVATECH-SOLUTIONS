import express from 'express';
import dotenv from 'dotenv';
import { TeamController } from './controllers/team.controller'; // Ya en plural
import { setupSwagger } from './swagger';
import { verifyToken } from './middlewares/auth.middleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 3003;
const teamController = new TeamController();

app.use(express.json());
setupSwagger(app);

// ZERO TRUST MIDDLEWARE
app.use('/teams', verifyToken);

// CRUD protegido
app.post('/teams',              (req, res) => teamController.create(req, res));
app.get('/teams',               (req, res) => teamController.getAll(req, res));
app.get('/teams/:id',           (req, res) => teamController.getTeamById(req, res));
app.patch('/teams/:id',         (req, res) => teamController.updateTeam(req, res));
app.patch('/teams/:id/status',  (req, res) => teamController.updateStatus(req, res));
app.delete('/teams/:id',        (req, res) => teamController.deleteTeam(req, res));

app.listen(port, () => {
  console.log(`🚀 MS-TEAMS corriendo en http://localhost:${port}`);
  console.log(`📖 Swagger en http://localhost:${port}/api-docs`);
});