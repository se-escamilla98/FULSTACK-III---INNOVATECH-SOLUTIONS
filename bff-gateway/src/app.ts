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

// 1. Interfaz de Swagger - Pública
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 2. Rutas de Autenticación - Públicas
app.use(authRouter);

// 3. Aplicar middleware de autenticación global para todo lo que empiece con /api
app.use('/api', verifyToken);

// 4. Montar los enrutadores limpios
app.use(projectsRouter);
app.use(teamsRouter);
app.use(tasksRouter);

app.listen(port, () => {
  console.log(`🚀 BFF-GATEWAY corriendo en http://localhost:${port}`);
  console.log(`📝 Swagger Unificado disponible en http://localhost:${port}/api-docs`);
  console.log(`🔐 Autenticación JWT activada`);
});