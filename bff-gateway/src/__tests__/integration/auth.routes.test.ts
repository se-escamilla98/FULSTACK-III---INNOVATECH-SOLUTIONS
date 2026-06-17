import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import authRouter from '../../auth/auth.routes';
import { JWT_CONFIG } from '../../config/jwt.config';

// Creamos una app de Express solo con las rutas de auth (sin levantar todo el BFF)
const app = express();
app.use(express.json());
app.use(authRouter);

describe('POST /auth/login', () => {

  it('debe autenticar con credenciales validas y retornar JWT', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.username).toBe('admin');
    expect(res.body.displayName).toBe('Administrador');
    expect(res.body.role).toBe('admin');
    expect(res.body.expiresIn).toBe('24h');

    // Verificar que el token es un JWT valido
    const decoded = jwt.verify(res.body.token, JWT_CONFIG.secret) as any;
    expect(decoded.username).toBe('admin');
    expect(decoded.service).toBe('innovatech-bff');
  });

  it('debe autenticar al usuario sebastian', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'sebastian', password: 'duoc2026' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.displayName).toBe('Sebastián');
    expect(res.body.role).toBe('admin');
  });

  it('debe autenticar al usuario lector con rol reader', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'lector', password: 'lector123' });

    expect(res.status).toBe(200);
    expect(res.body.role).toBe('reader');
  });

  it('debe rechazar password incorrecto con 401', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'admin', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Credenciales');
  });

  it('debe rechazar usuario inexistente con 401', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'hacker', password: 'admin123' });

    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Credenciales');
  });

  it('debe retornar 400 si falta username', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ password: 'admin123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('requeridos');
  });

  it('debe retornar 400 si falta password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'admin' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('requeridos');
  });

  it('debe ser case-insensitive con el username', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'ADMIN', password: 'admin123' });

    expect(res.status).toBe(200);
    expect(res.body.username).toBe('ADMIN');
  });
});