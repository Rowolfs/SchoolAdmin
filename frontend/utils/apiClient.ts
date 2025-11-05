// frontend/utils/apiClient.ts

import axios from 'axios';
const isServer = typeof window === 'undefined';

/**
 * Общий Axios-экземпляр для всех API-запросов.
 * Базовый URL указывает на ваш Express-сервер.
 * withCredentials: true нужно, если вы храните JWT в HttpOnly‐cookie.
 */
const apiClient = axios.create({
  baseURL: isServer
    ? process.env.INTERNAL_API_URL   // SSR (Next.js сервер)
    : process.env.NEXT_PUBLIC_API_URL, // браузер// ваш бэкенд // <-- поменяйте на реальный адрес вашего бэкенда
  timeout: 5000,
  withCredentials: true,
});

export default apiClient;
