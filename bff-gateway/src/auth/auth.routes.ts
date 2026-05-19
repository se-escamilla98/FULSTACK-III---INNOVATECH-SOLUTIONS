import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt.config';

const router = Router();

// POST /auth/login -> genera un JWT
router.post('/auth/login', (req: Request, res: Response) => {
  const { apiKey, role } = req.body as { apiKey: string; role: string };

  // Validar apiKey (en produccion esto vendria de una BD)
  const validKeys: Record<string, string> = {
    'admin-key-innovatech': 'admin',
    'reader-key-innovatech': 'reader'
  };

  if (!apiKey || !validKeys[apiKey]) {
    return res.status(401).json({ error: 'API Key invalida' });
  }

  const assignedRole = validKeys[apiKey];

  const token = jwt.sign(
  {
    role: assignedRole,
    service: 'innovatech-bff',
  },
  JWT_CONFIG.secret as string,
  { expiresIn: '24h' }
  );
  res.json({
    token,
    role: assignedRole,
    expiresIn: '24h',
    message: `Bienvenido, rol ${assignedRole} autorizado`
  });
});

export default router;