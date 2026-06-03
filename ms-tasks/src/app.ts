import express from 'express';
import { TaskController } from './controllers/task.controller';
import { setupSwagger } from './swagger';
import { verifyToken } from './middlewares/auth.middleware';

const app = express();
const taskController = new TaskController();

app.use(express.json());

// 1. Interfaz pública de Swagger
setupSwagger(app);

// 2. MIDDLEWARE ZERO TRUST: Protege todas las rutas de tareas
app.use('/tasks', verifyToken);

// 3. CRUD completo protegido
app.post('/tasks',                      (req, res) => taskController.createTask(req, res));
app.get('/tasks/:id',                   (req, res) => taskController.getTaskById(req, res));
app.get('/tasks/project/:projectId',    (req, res) => taskController.getTasksByProject(req, res));
app.patch('/tasks/:id',                 (req, res) => taskController.updateTask(req, res));
app.delete('/tasks/:id',                (req, res) => taskController.deleteTask(req, res));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 MS-TASKS corriendo en http://localhost:${PORT}`);
  console.log(`📖 Swagger en http://localhost:${PORT}/api-docs`);
});

export default app;