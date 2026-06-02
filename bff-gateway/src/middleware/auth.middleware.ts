import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt.config';

// Extender Request para agregar el payload del JWT
declare global {
  namespace Express {
    interface Request {
      user?: {
        role: string;
        service: string;
      };
    }
  }
}

// Middleware que verifica que el token es valido
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Acceso denegado. Token requerido.' });
  }

  // Tolerante: extrae el token limpiamente si empieza con "bearer " o "Bearer "
  const token = authHeader.toLowerCase().startsWith('bearer ') 
    ? authHeader.split(' ')[1] 
    : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_CONFIG.secret) as { role: string; service: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token invalido o expirado.' });
  }
};

// Middleware que verifica que el rol tiene permiso
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Acceso denegado. Se requiere rol: ${roles.join(' o ')}`
      });
    }
    next();
  };
};