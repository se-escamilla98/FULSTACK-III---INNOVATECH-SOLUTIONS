import axios, { InternalAxiosRequestConfig } from 'axios';

const bffClient = axios.create({
  baseURL: 'http://localhost:3000/api', // Endpoints unificados del BFF
});

// Interceptor para inyectar de forma dinámica el JWT en rutas protegidas
bffClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('innovatech_token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  }, 
  (error: any) => {
    return Promise.reject(error);
  }
);

export default bffClient;