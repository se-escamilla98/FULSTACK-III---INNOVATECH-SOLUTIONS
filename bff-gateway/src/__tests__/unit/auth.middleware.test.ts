import jwt from 'jsonwebtoken';
import { verifyToken } from '../../middleware/auth.middleware';
import { JWT_CONFIG } from '../../config/jwt.config';

// Creamos un token real para las pruebas
const payload = {
  username: 'admin',
  displayName: 'Administrador',
  role: 'admin',
  service: 'innovatech-bff',
};
const validToken = jwt.sign(payload, JWT_CONFIG.secret, { expiresIn: '1h' });

// Helper: crea objetos mock de req, res y next
function mockReqResNext(authHeader?: string) {
  const req: any = {
    headers: {},
  };
  if (authHeader !== undefined) {
    req.headers['authorization'] = authHeader;
  }

  const res: any = {
    statusCode: 200,
    body: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.body = data;
      return this;
    },
  };

  const next = jest.fn();

  return { req, res, next };
}

describe('verifyToken middleware', () => {

  it('debe permitir acceso con token valido (Bearer)', () => {
    const { req, res, next } = mockReqResNext(`Bearer ${validToken}`);

    verifyToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.username).toBe('admin');
    expect(req.user.role).toBe('admin');
  });

  it('debe permitir acceso con token sin prefijo Bearer', () => {
    const { req, res, next } = mockReqResNext(validToken);

    verifyToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.username).toBe('admin');
  });

  it('debe retornar 401 si no se envia token', () => {
    const { req, res, next } = mockReqResNext();

    verifyToken(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toContain('Token requerido');
  });

  it('debe retornar 403 si el token es invalido', () => {
    const { req, res, next } = mockReqResNext('Bearer token-falso-12345');

    verifyToken(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toContain('Token invalido');
  });

  it('debe retornar 403 si el token esta expirado', () => {
    // Generamos un token que ya expiró
    const expiredToken = jwt.sign(payload, JWT_CONFIG.secret, { expiresIn: '0s' });
    const { req, res, next } = mockReqResNext(`Bearer ${expiredToken}`);

    verifyToken(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
  });

  it('debe ser tolerante a "bearer" en minusculas', () => {
    const { req, res, next } = mockReqResNext(`bearer ${validToken}`);

    verifyToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.username).toBe('admin');
  });
});