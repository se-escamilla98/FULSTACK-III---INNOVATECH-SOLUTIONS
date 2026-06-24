import express from 'express';
import { TaskController } from './controllers/task.controller';
import { setupSwagger } from './swagger';
import { verifyToken } from './middlewares/auth.middleware';

const app = express();
const taskController = new TaskController();

app.use(express.json());
app.set('etag', false);
setupSwagger(app);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ms-tasks', uptime: Math.floor(process.uptime()) });
});

// ─── TASKS ────────────────────────────────────────────────────────────────────
app.use('/tasks', verifyToken);
app.use('/projects', verifyToken);

app.get('/projects/:projectId/tasks', (req, res) => taskController.getTasksByProject(req, res));
app.get('/tasks/:id',                 (req, res) => taskController.getTaskById(req, res));
app.post('/tasks',                    (req, res) => taskController.createTask(req, res));
app.patch('/tasks/:id',               (req, res) => taskController.updateTask(req, res));
app.delete('/tasks/:id',              (req, res) => taskController.deleteTask(req, res));

// ─── BITÁCORA ─────────────────────────────────────────────────────────────────
app.post('/tasks/:id/logs',           (req, res) => taskController.addLog(req, res));
app.get('/tasks/:id/logs',            (req, res) => taskController.getLogsByTask(req, res));
app.delete('/tasks/:id/logs/:logId',  (req, res) => taskController.deleteLog(req, res));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 MS-TASKS corriendo en http://localhost:${PORT}`);
  console.log(`📖 Swagger en http://localhost:${PORT}/api-docs`);
});

export default app;
