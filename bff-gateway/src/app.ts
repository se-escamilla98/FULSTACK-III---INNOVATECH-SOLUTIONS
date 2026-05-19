import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import projectsRouter from './routes/projects.routes';
import teamsRouter from './routes/teams.routes';
import tasksRouter from './routes/tasks.routes';
import authRouter from './auth/auth.routes';
import { verifyToken } from './middleware/auth.middleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Ruta publica - no requiere token
app.use(authRouter);

// Rutas protegidas - requieren token valido
app.use(verifyToken, projectsRouter);
app.use(verifyToken, teamsRouter);
app.use(verifyToken, tasksRouter);

app.listen(port, () => {
  console.log(`🚀 BFF-GATEWAY corriendo en http://localhost:${port}`);
  console.log(`🔐 Autenticacion JWT activada`);
});