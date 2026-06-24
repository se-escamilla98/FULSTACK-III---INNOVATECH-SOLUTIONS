import axios, { InternalAxiosRequestConfig } from 'axios';

const BFF_BASE = import.meta.env.VITE_BFF_URL ?? 'http://localhost:3000';

const bffClient = axios.create({
  baseURL: `${BFF_BASE}/api`,
});

// ─── REQUEST: adjunta el token en cada llamada ───────────────────────────────
bffClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('innovatech_token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// ─── RESPONSE: auto-logout cuando el backend rechaza el token ────────────────
//
//  Escenarios cubiertos:
//   • 401 Unauthorized  → token expirado o inválido (ej: servicio reiniciado con nuevo secret)
//   • 403 Forbidden     → token válido pero el rol no tiene acceso
//
//  Qué hace:
//   1. Limpia todo el localStorage de la sesión
//   2. Recarga la página → App.tsx detecta que no hay token y muestra el login
//
bffClient.interceptors.response.use(
  response => response,          // respuestas 2xx pasan sin tocar
  error => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      // Limpiar sesión
      localStorage.removeItem('innovatech_token');
      localStorage.removeItem('innovatech_display');
      localStorage.removeItem('innovatech_role');

      // Forzar recarga → App.tsx vuelve a leer localStorage y muestra el login
      window.location.reload();
    }

    return Promise.reject(error);
  }
);

export { BFF_BASE };
export default bffClient;
