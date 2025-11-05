// frontend/utils/api.ts
import axios from 'axios';

const isServer = typeof window === 'undefined';

// Создаём Axios-экземпляр
const api = axios.create({
  baseURL: isServer
    ? process.env.INTERNAL_API_URL
    : process.env.NEXT_PUBLIC_API_URL, // ✅ ИСПРАВИЛ localhost
  timeout: 5000,
  withCredentials: true,
});

// ✅ Request interceptor - добавляет токен автоматически
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ✅ Response interceptor - обрабатывает 401 ошибки
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      
      // Публичные страницы где редирект НЕ нужен
      const publicPaths = [
        '/auth/login',
        '/auth/register',
        '/'
      ];
      
      const isPublicPage = publicPaths.some(path => currentPath.startsWith(path));
      
      if (!isPublicPage) {
        console.log('❌ 401 error on protected page, redirecting to login');
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
      } else {
        console.log('ℹ️ 401 error on public page, no redirect needed');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// =========================
//  Интерфейсы / типы  
// =========================

export interface User {
  id: number;
  name: string;
  surname: string;
  patronymic: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  createdAt: string;
}

export interface Student {
  id: number;
  userId: number;
  classId: number | null;
  user: {
    id: number;
    name: string;
    surname: string;
    patronymic: string;
    email: string;
    role: 'STUDENT';
  };
  createdAt: string;
}

export interface Class {
  id: number;
  name: string;
  classTeacher?: number | null;
  teacher?: {
    id: number;
    user: { name: string; surname: string; patronymic: string };
  } | null;
  pupils?: {
    id: number;
    userId: number;
    user: { name: string; surname: string; patronymic: string };
  }[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// =========================
//  API для пользователей
// =========================

export const UserAPI = {
  // Поиск по ФИО (возвращает массив User)
  search: (q: string) =>
    api.get<User[]>(`/users/search`, { params: { q } }).then((res) => res.data),
};

// =========================
//  API для студентов (Pupil)
// =========================

export const StudentAPI = {
  // Получить всех студентов
  getAllClasses: () => api.get<Student[]>('/students').then((res) => res.data),

  // Получить студентов по классу
  getByClass: (classId: number) =>
    api.get<Student[]>(`/students/class/${classId}`).then((res) => res.data),
};

// =========================
//  API для классов
// =========================
