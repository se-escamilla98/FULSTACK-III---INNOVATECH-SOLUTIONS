import crypto from 'crypto';

// ─── JWT Secret compartido ────────────────────────────────────────────────────
//
//  El secret se lee desde JWT_SECRET (variable de entorno inyectada por Docker
//  Compose desde el archivo .env de la raíz del proyecto).
//
//  Si JWT_SECRET no está definido (desarrollo local sin Docker), se genera
//  uno aleatorio por proceso — las sesiones no persisten entre reinicios,
//  lo cual es el comportamiento correcto para resiliencia.
//
//  En producción con Docker: el script generate-env.ps1 genera un secret
//  nuevo antes de cada `docker compose up`, lo escribe en .env, y todos
//  los servicios lo comparten → mismo secret → JWT válido en toda la red.
//
const resolveSecret = (): string => {
  const envSecret = process.env.JWT_SECRET;
  if (envSecret && envSecret.trim() !== '') {
    return envSecret;
  }
  const dynamic = crypto.randomBytes(64).toString('hex');
  console.log('⚠️  JWT_SECRET no definido — usando secret dinámico de proceso');
  return dynamic;
};

export const JWT_CONFIG = {
  secret:    resolveSecret(),
  expiresIn: '24h',
};
