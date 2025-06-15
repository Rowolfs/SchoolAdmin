// frontend/utils/classAPI.ts
import apiClient from './apiClient';

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

export const ClassAPI = {
  /**
   * GET /api/classes
   */
  getAll: (): Promise<Class[]> => {
    return apiClient.get<Class[]>('/classes').then((res) => res.data);
  },

  /**
   * POST /api/classes
   */
  create: (data: { name: string; classTeacher?: number }): Promise<Class> => {
    return apiClient.post<Class>('/classes', data).then((res) => res.data);
  },

  /**
   * DELETE /api/classes/:id
   */
  remove: (id: number): Promise<void> => {
    return apiClient.delete(`/classes/${id}`).then(() => {});
  },

  /**
   * PATCH /api/classes/:id
   * Если data.classTeacher = null, будет отправлено { "classTeacher": null }
   */
  updateClass: (id: number, data: { classTeacher?: number | null }): Promise<Class> => {
    return apiClient
      .patch<Class>(`/classes/${id}`, data)
      .then((res) => res.data);
  },

  /**
   * POST /api/classes/:id/students
   */
  assignStudents: (classId: number, pupilIds: number[]): Promise<
    { id: number; user: { name: string; surname: string; patronymic: string } }[]
  > => {
    return apiClient
      .post<{ id: number; user: { name: string; surname: string; patronymic: string } }[]>(
        `/classes/${classId}/students`,
        { pupilIds }
      )
      .then((res) => res.data);
  },
};
