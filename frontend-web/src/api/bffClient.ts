import axios, { InternalAxiosRequestConfig } from 'axios';

const BFF_BASE = import.meta.env.VITE_BFF_URL ?? 'http://localhost:3000';

const bffClient = axios.create({
  baseURL: `${BFF_BASE}/api`,
});

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

export { BFF_BASE };
export default bffClient;
