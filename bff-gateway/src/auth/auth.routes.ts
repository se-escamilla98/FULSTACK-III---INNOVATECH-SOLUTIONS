import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JWT_CONFIG } from '../config/jwt.config';

const router = Router();

// Usuarios del sistema con contraseñas hasheadas con bcrypt (saltRounds=10)
// Para agregar un usuario nuevo: bcrypt.hashSync('nueva_contraseña', 10)
const USERS: Record<string, { passwordHash: string; role: string; displayName: string }> = {
  admin: {
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    displayName: 'Administrador',
  },
  sebastian: {
    passwordHash: bcrypt.hashSync('duoc2026', 10),
    role: 'developer',
    displayName: 'Sebastián',
  },
  lector: {
    passwordHash: bcrypt.hashSync('lector123', 10),
    role: 'reader',
    displayName: 'Lector',
  },
};

router.post('/auth/login', async (req: Request, res: Response) => {
  const { username, password } = req.body as { username: string; password: string };

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
  }

  const user = USERS[username.toLowerCase().trim()];

  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas.' });
  }

  const passwordValid = await bcrypt.compare(password, user.passwordHash);

  if (!passwordValid) {
    return res.status(401).json({ error: 'Credenciales inválidas.' });
  }

  const token = jwt.sign(
    {
      username,
      displayName: user.displayName,
      role: user.role,
      service: 'innovatech-bff',
    },
    JWT_CONFIG.secret as string,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    username,
    displayName: user.displayName,
    role: user.role,
    expiresIn: '24h',
    message: `Bienvenido, ${user.displayName}`,
  });
});

export default router;
