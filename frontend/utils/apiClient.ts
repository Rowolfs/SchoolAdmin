// frontend/utils/apiClient.ts

import axios from 'axios';

/**
 * Общий Axios-экземпляр для всех API-запросов.
 * Базовый URL указывает на ваш Express-сервер.
 * withCredentials: true нужно, если вы храните JWT в HttpOnly‐cookie.
 */
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // <-- поменяйте на реальный адрес вашего бэкенда
  timeout: 5000,
  withCredentials: true,
});

export default apiClient;
