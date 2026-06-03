import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.config';
import projectsRouter from './routes/projects.routes';
import teamsRouter from './routes/teams.routes';
import tasksRouter from './routes/tasks.routes';
import authRouter from './auth/auth.routes';
import { verifyToken } from './middleware/auth.middleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 1. Interfaz de Swagger - Pública e independiente
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 2. Rutas de Autenticación - Públicas (No usan /api, entran directo por /auth/login)
app.use(authRouter);

// 3. ENCAPSULAR: Aplicamos el token y los enrutadores bajo el prefijo único '/api'
// De esta forma, todas las rutas de proyectos, tareas y equipos heredarán automáticamente el '/api' y la protección del JWT.
app.use('/api', verifyToken, [projectsRouter, teamsRouter, tasksRouter]);

app.listen(port, () => {
  console.log(`🚀 BFF-GATEWAY corriendo en http://localhost:${port}`);
  console.log(`📝 Swagger Unificado disponible en http://localhost:${port}/api-docs`);
  console.log(`🔐 Autenticación JWT activada`);
});