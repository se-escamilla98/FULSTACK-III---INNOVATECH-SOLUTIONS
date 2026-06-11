import express from 'express';
import dotenv from 'dotenv';
import { ProjectController } from './controllers/project.controller';
import { setupSwagger } from './swagger';
import { verifyToken } from './middlewares/auth.middleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;
const projectController = new ProjectController();

app.use(express.json());

// 1. Interfaz de Swagger - Pública (Sin token)
setupSwagger(app);

// 2. Health check público
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ms-projects', uptime: Math.floor(process.uptime()) });
});

// 3. MIDDLEWARE DE SEGURIDAD ZERO TRUST
// Protege automáticamente todo lo que empiece con /projects
app.use('/projects', verifyToken);

// 3. CRUD completo (Ahora protegido por el token local)
app.post('/projects',            (req, res) => projectController.create(req, res));
app.get('/projects',             (req, res) => projectController.getAll(req, res));
app.get('/projects/:id',         (req, res) => projectController.getById(req, res));
app.patch('/projects/:id',       (req, res) => projectController.update(req, res));
app.patch('/projects/:id/status',(req, res) => projectController.updateStatus(req, res));
app.delete('/projects/:id',      (req, res) => projectController.delete(req, res));

app.listen(port, () => {
  console.log(`🚀 MS-PROJECTS corriendo en http://localhost:${port}`);
  console.log(`📖 Swagger en http://localhost:${port}/api-docs`);
});