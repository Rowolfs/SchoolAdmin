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
  getAll: (): Promise<Class[]> => {
    return apiClient.get<Class[]>('/classes').then((res) => res.data);
  },

  create: (data: { name: string; classTeacher?: number }): Promise<Class> => {
    return apiClient.post<Class>('/classes', data).then((res) => res.data);
  },

  remove: (id: number): Promise<void> => {
    return apiClient.delete(`/classes/${id}`).then(() => {});
  },

  assignStudents: (classId: number, studentIds: number[]): Promise<Class> => {
    return apiClient
      .post<Class>(`/classes/${classId}/students`, { studentIds })
      .then((res) => res.data);
  },
};
