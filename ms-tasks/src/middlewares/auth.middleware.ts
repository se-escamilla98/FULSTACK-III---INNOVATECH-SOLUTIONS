import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  try {
    // Definimos el secreto usando una lógica que TypeScript NO intentará validar a nivel de entorno
    // Accedemos a process.env como si fuera un objeto 'any' para evitar la validación estricta
    const secret = (process.env as any).JWT_SECRET || 'innovatech-secret-key-2026';
    
    const decoded = jwt.verify(token, secret);
    
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};