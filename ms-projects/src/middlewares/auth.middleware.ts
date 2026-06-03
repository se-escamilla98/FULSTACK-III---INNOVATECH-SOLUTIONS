import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  // Obtenemos el token
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  try {
    // FORZAMOS EL SECRETO: Usamos 'any' para que el compilador no valide el process.env
    const secret = (process.env as any).JWT_SECRET || 'innovatech-secret-key-2026';
    
    // VERIFICAMOS: Usamos 'any' en el verify
    const decoded = (jwt as any).verify(token, secret);
    
    // ASIGNAMOS: Usamos 'any' en el request
    (req as any).user = decoded;
    
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};