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

export interface Discipline {
  id: number;
  name: string;
}

export interface Teacher {
  id: number;
  user: { id: number; name: string; surname: string; patronymic: string };
}

export interface DisciplineTeacherPair {
  id: number;
  disciplineId: number;
  teacherId: number;
  discipline: Discipline;
  teacher: Teacher;
  assigned: boolean;
}

export const ClassAPI = {
  /** GET /api/classes */
  getAll: (): Promise<Class[]> =>
    apiClient.get('/classes').then(res => res.data),

  /** POST /api/classes */
  create: (data: { name: string; classTeacher?: number }) =>
    apiClient.post('/classes', data).then(res => res.data),

  /** DELETE /api/classes/:id */
  remove: (id: number) =>
    apiClient.delete(`/classes/${id}`).then(() => {}),

  /** PATCH /api/classes/:id */
  updateClass: (id: number, data: { classTeacher?: number | null }) =>
    apiClient.patch(`/classes/${id}`, data).then(res => res.data),

  /** POST /api/classes/:id/students */
  assignStudents: (classId: number, pupilIds: number[]) =>
    apiClient.post(`/classes/${classId}/students`, { pupilIds }).then(res => res.data),

  /** GET /api/classes/:id/discipline-teachers */
  getDisciplineTeacherPairs: (classId: number): Promise<DisciplineTeacherPair[]> =>
    apiClient.get(`/classes/${classId}/discipline-teachers`).then(res => res.data),

  /** GET /api/classes/:id/discipline-teachers/search?search= */
  searchDisciplineTeacherPairs: (
    classId: number,
    search: string
  ): Promise<DisciplineTeacherPair[]> =>
    apiClient
      .get(`/classes/${classId}/discipline-teachers/search`, { params: { search } })
      .then(res => res.data),

  /** PUT /api/classes/:id/discipline-teachers */
  assignDisciplineTeacherPairs: (
    classId: number,
    pairs: number[]
  ) => apiClient.put(`/classes/${classId}/discipline-teachers`, { pairs }),
};
