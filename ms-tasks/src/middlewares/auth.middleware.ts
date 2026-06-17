import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt.config';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Acceso denegado. Token requerido.' });
  }

  // Tolerante: acepta "Bearer xxx" o "bearer xxx" o el token directo
  const token = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.split(' ')[1]
    : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_CONFIG.secret);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token invalido o expirado.' });
  }
};