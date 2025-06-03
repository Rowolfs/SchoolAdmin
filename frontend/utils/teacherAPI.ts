// frontend/utils/teacherAPI.ts
import apiClient from './apiClient';

export interface Teacher {
  id: number;
  user: {
    id: number;
    name: string;
    surname: string;
    patronymic: string;
    email: string;
    role: 'TEACHER';
  };
  classroomNumber: string | null;
  createdAt: string;
}

export const TeacherAPI = {
  /**
   * GET /api/teachers — получить всех активных преподавателей
   */
  getAll: (): Promise<Teacher[]> =>
    apiClient.get<Teacher[]>('/teachers').then(res => res.data),
};
