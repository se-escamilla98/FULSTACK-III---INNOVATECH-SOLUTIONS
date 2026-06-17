// Variables de entorno ANTES de los imports
process.env.MS_PROJECTS_URL = 'http://ms-projects:3002';
process.env.MS_TASKS_URL = 'http://ms-tasks:3001';
process.env.MS_TEAMS_URL = 'http://ms-teams:3003';

import express from 'express';
import request from 'supertest';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

import authRouter from '../../auth/auth.routes';
import projectsRouter from '../../routes/projects.routes';
import tasksRouter from '../../routes/tasks.routes';
import { verifyToken } from '../../middleware/auth.middleware';

// App de test que replica la estructura real del BFF
const app = express();
app.use(express.json());
app.use(authRouter);
app.use('/api', verifyToken, [projectsRouter, tasksRouter]);

describe('E2E: Flujo completo de negocio', () => {
  let token: string;

  const fakeProject = {
    id: 'proj-e2e',
    name: 'Proyecto E2E',
    description: 'Test end to end',
    status: 'PLANNED',
  };

  const fakeTask = {
    id: 'task-e2e',
    name: 'Tarea E2E',
    area: 'Backend',
    status: 'PENDING',
    assignedTo: 'sebastian',
    teamId: 'team-001',
    projectId: 'proj-e2e',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Paso 1: Login y obtener JWT', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it('Paso 2: Ruta protegida rechaza acceso sin token', async () => {
    const res = await request(app).get('/api/projects');

    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Token requerido');
  });

  it('Paso 3: Crear proyecto via BFF', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: fakeProject });

    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Proyecto E2E', description: 'Test end to end' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Proyecto E2E');
    expect(res.body.status).toBe('PLANNED');
  });

  it('Paso 4: Crear tarea asociada al proyecto', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: fakeTask });

    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Tarea E2E',
        area: 'Backend',
        assignedTo: 'sebastian',
        teamId: 'team-001',
        projectId: 'proj-e2e',
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('PENDING');
    expect(res.body.projectId).toBe('proj-e2e');
  });

  it('Paso 5: Completar proyecto FALLA porque hay tarea pendiente', async () => {
    // El BFF consulta las tareas del proyecto antes de completar
    mockedAxios.get.mockResolvedValueOnce({
      data: [{ ...fakeTask, status: 'PENDING' }],
    });

    const res = await request(app)
      .patch('/api/projects/proj-e2e/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'COMPLETED' });

    expect(res.status).toBe(500);
    expect(res.body.error).toContain('tareas pendientes');
  });

  it('Paso 6: Completar la tarea primero', async () => {
    mockedAxios.patch.mockResolvedValueOnce({
      data: { ...fakeTask, status: 'COMPLETED' },
    });

    const res = await request(app)
      .patch('/api/tasks/task-e2e')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'COMPLETED' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('COMPLETED');
  });

  it('Paso 7: Ahora completar proyecto EXITOSO', async () => {
    // Consulta tareas: todas completadas
    mockedAxios.get.mockResolvedValueOnce({
      data: [{ ...fakeTask, status: 'COMPLETED' }],
    });
    // Actualiza estado del proyecto
    mockedAxios.patch.mockResolvedValueOnce({
      data: { ...fakeProject, status: 'COMPLETED' },
    });

    const res = await request(app)
      .patch('/api/projects/proj-e2e/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'COMPLETED' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('COMPLETED');
  });

  it('Paso 8: Circuit Breaker retorna fallback si MS cae', async () => {
    // Simulamos que ms-projects no responde
    mockedAxios.get.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${token}`);

    // El fallback del circuit breaker retorna array vacio en lugar de error
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});