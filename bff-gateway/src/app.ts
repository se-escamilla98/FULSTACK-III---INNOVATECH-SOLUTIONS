import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import os from 'os';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.config';
import projectsRouter from './routes/projects.routes';
import teamsRouter    from './routes/teams.routes';
import tasksRouter    from './routes/tasks.routes';
import authRouter     from './auth/auth.routes';
import { verifyToken } from './middleware/auth.middleware';

dotenv.config();

const app  = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin:       ['http://localhost:5173', 'http://localhost'],
  credentials:  true,
  methods:      ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.set('etag', false);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'bff-gateway', uptime: Math.floor(process.uptime()) });
});

app.get('/whoami', (_req, res) => {
  res.json({
    hostname: os.hostname(),
    pid:      process.pid,
    service:  'bff-gateway',
    uptime:   Math.floor(process.uptime()),
    message:  'Cada refresh puede responder una instancia distinta del BFF',
  });
});

// ─── Auth (público) ───────────────────────────────────────────────────────────
app.use(authRouter);

// ─── Rutas protegidas bajo /api ───────────────────────────────────────────────
app.use('/api', verifyToken, [projectsRouter, teamsRouter, tasksRouter]);

app.listen(port, () => {
  console.log(`🚀 BFF-GATEWAY corriendo en http://localhost:${port}`);
  console.log(`📝 Swagger Unificado disponible en http://localhost:${port}/api-docs`);
  console.log(`🔐 Autenticación JWT activada`);
  console.log(`👥 BD de usuarios: ${process.env.BFF_DATABASE_URL ? 'conectada' : '⚠️ no configurada'}`);
});
