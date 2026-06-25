import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JWT_CONFIG } from '../config/jwt.config';
import { PrismaClient } from '@prisma/client';

const router  = Router();
const prisma  = new PrismaClient();

// ─── Usuarios fijos del sistema (admin y lector) ──────────────────────────────
//
//  Los developers se crean dinámicamente desde el panel de admin.
//  Admin y lector son usuarios fijos que no están en la BD.
//
const SYSTEM_USERS: Record<string, {
  passwordHash: string;
  role:         string;
  displayName:  string;
  employeeId:   string | null;
}> = {
  admin: {
    passwordHash: bcrypt.hashSync('admin123', 10),
    role:         'admin',
    displayName:  'Administrador',
    employeeId:   null,
  },
  lector: {
    passwordHash: bcrypt.hashSync('lector123', 10),
    role:         'reader',
    displayName:  'Lector',
    employeeId:   null,
  },
};

// ─── POST /auth/login ─────────────────────────────────────────────────────────
router.post('/auth/login', async (req: Request, res: Response) => {
  const { username, password } = req.body as { username: string; password: string };

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
  }

  const key = username.toLowerCase().trim();

  // 1. Buscar primero en usuarios fijos del sistema
  const systemUser = SYSTEM_USERS[key];
  if (systemUser) {
    const valid = await bcrypt.compare(password, systemUser.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas.' });

    const token = jwt.sign(
      { username: key, displayName: systemUser.displayName, role: systemUser.role, employeeId: null, service: 'innovatech-bff' },
      JWT_CONFIG.secret as string,
      { expiresIn: '24h' }
    );

    return res.json({
      token,
      username:    key,
      displayName: systemUser.displayName,
      role:        systemUser.role,
      employeeId:  null,
      expiresIn:   '24h',
      message:     `Bienvenido, ${systemUser.displayName}`,
    });
  }

  // 2. Buscar en BD de usuarios (developers creados por el admin)
  try {
    const dbUser = await prisma.user.findUnique({ where: { username: key } });

    if (!dbUser || !dbUser.active) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const valid = await bcrypt.compare(password, dbUser.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas.' });

    const token = jwt.sign(
      {
        username:    dbUser.username,
        displayName: dbUser.displayName,
        role:        dbUser.role,
        employeeId:  dbUser.employeeId,
        service:     'innovatech-bff',
      },
      JWT_CONFIG.secret as string,
      { expiresIn: '24h' }
    );

    return res.json({
      token,
      username:    dbUser.username,
      displayName: dbUser.displayName,
      role:        dbUser.role,
      employeeId:  dbUser.employeeId,
      expiresIn:   '24h',
      message:     `Bienvenido, ${dbUser.displayName}`,
    });

  } catch (err) {
    console.error('Error al consultar BD de usuarios:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ─── POST /auth/users — Crear usuario developer (solo admin) ──────────────────
router.post('/auth/users', async (req: Request, res: Response) => {
  const { username, password, displayName, employeeId } = req.body as {
    username:    string;
    password:    string;
    displayName: string;
    employeeId:  string;
  };

  if (!username?.trim() || !password?.trim() || !displayName?.trim()) {
    return res.status(400).json({ error: 'username, password y displayName son requeridos.' });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { username: username.trim() } });
    if (existing) {
      return res.status(409).json({ error: `Ya existe un usuario con el RUT ${username}.` });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username:    username.trim(),
        passwordHash,
        displayName: displayName.trim(),
        role:        'developer',
        employeeId:  employeeId || null,
      },
    });

    return res.status(201).json({
      id:          user.id,
      username:    user.username,
      displayName: user.displayName,
      role:        user.role,
      employeeId:  user.employeeId,
    });

  } catch (err) {
    console.error('Error al crear usuario:', err);
    return res.status(500).json({ error: 'Error al crear el usuario.' });
  }
});

// ─── GET /auth/users — Listar usuarios (solo admin) ───────────────────────────
router.get('/auth/users', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, displayName: true, role: true, employeeId: true, active: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener usuarios.' });
  }
});

// ─── DELETE /auth/users/:id — Desactivar usuario (solo admin) ─────────────────
router.delete('/auth/users/:id', async (req: Request, res: Response) => {
  try {
    await prisma.user.update({
      where: { id: req.params.id },
      data:  { active: false },
    });
    return res.json({ message: 'Usuario desactivado correctamente.' });
  } catch (err) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }
});

// ─── PATCH /auth/users/:id/password — Cambiar contraseña (solo admin) ────────
router.patch('/auth/users/:id/password', async (req: Request, res: Response) => {
  const { password } = req.body as { password: string };
  if (!password?.trim()) {
    return res.status(400).json({ error: 'La nueva contraseña es requerida.' });
  }
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: req.params.id },
      data:  { passwordHash },
    });
    return res.json({ message: 'Contraseña actualizada correctamente.' });
  } catch (err) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }
});

export default router;
