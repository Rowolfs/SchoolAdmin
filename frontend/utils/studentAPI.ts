// frontend/utils/studentAPI.ts
import apiClient from './apiClient';

export interface Student {
  id: number;           // id записи Pupil
  userId: number;       // id связанного User
  classId: number | null;
  user: {
    id: number;
    name: string;
    surname: string;
    patronymic: string;
    email?: string;
    role?: 'STUDENT';
  };
  createdAt?: string;
}

export const StudentAPI = {
  /**
   * Получить всех учеников (Pupil).
   * GET /api/students
   */
  getAll: (): Promise<Student[]> =>
    apiClient.get<Student[]>('/students').then((res) => res.data),

  /**
   * Поиск учеников по query (часть ФИО).
   * GET /api/students/search?query=…
   */
  search: (query: string): Promise<Student[]> =>
    apiClient.get<Student[]>('/students/search', { params: { query } }).then((res) => res.data),

  /**
   * Получить всех учеников, закреплённых за данным классом.
   * GET /api/students/class/:classId
   */
  getByClass: (classId: number): Promise<Student[]> =>
    apiClient.get<Student[]>(`/students/class/${classId}`).then((res) => res.data),
  
};
