// frontend/utils/api.ts
import axios from 'axios';

const isServer = typeof window === 'undefined';

// Создаём Axios-экземпляр
const api = axios.create({
  baseURL: isServer
    ? process.env.INTERNAL_API_URL || 'http://backend:5000/api'  // SSR (Next.js сервер)
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api', // браузер// ваш бэкенд
  timeout: 5000,
  withCredentials: true,
});

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
  id: number;           // Pupil.id
  userId: number;       // User.id
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

