import express from 'express';
import { TaskController } from './controllers/task.controller';
import { setupSwagger } from './swagger';

const app = express();
const taskController = new TaskController();

app.use(express.json());

// Rutas limpias
app.post('/tasks', (req, res) => taskController.createTask(req, res));
app.get('/tasks/project/:projectId', (req, res) => taskController.getTasksByProject(req, res));
app.patch('/tasks/:id', (req, res) => taskController.updateTask(req, res));
app.delete('/tasks/:id', (req, res) => taskController.deleteTask(req, res));

setupSwagger(app);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Microservicio de Tareas corriendo en puerto ${PORT}`);
});

export default app;