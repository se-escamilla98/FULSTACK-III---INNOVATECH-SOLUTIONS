import express from 'express';
import dotenv from 'dotenv';
import { ProjectController } from './controller/project.controller';
import { setupSwagger } from './swagger';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;
const projectController = new ProjectController();

app.use(express.json());
setupSwagger(app);

// CRUD completo
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