// frontend/utils/studentAPI.ts
import apiClient from './apiClient';

export interface Student {
  id: number;       
  userId: number;   
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
  getAll: (): Promise<Student[]> =>
    apiClient.get<Student[]>('/students').then(res => res.data),

  getByClass: (classId: number): Promise<Student[]> =>
    apiClient.get<Student[]>(`/students/class/${classId}`).then(res => res.data),

  create: (data: { userId: number; classId?: number }) =>
    apiClient.post<Student>('/students', data).then(res => res.data),

  update: (id: number, data: { classId?: number }) =>
    apiClient.patch<Student>(`/students/${id}`, data).then(res => res.data),

  deleteStudent: (id: number) =>
    apiClient.delete<void>(`/students/${id}`),

  /**
   * Поиск учеников по query.
   * GET /students/search?query=...
   */
  search: (query: string): Promise<Student[]> => {
    return apiClient
      .get<Student[]>('/students/search', { params: { query } })
      .then(res => res.data);
  },
};
