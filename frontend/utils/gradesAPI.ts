// frontend/utils/gradesAPI.ts

import apiClient from './apiClient';

export interface DisciplineClass {
  disciplineTeacherId: number;
  discipline: { id: number; name: string };
  class: { id: number; name: string };
}

export interface Pupil {
  id: number;
  user: {
    id: number;
    name: string;
    surname: string;
    patronymic: string;
  };
}

export interface Grade {
  id: number;
  disciplineTeacherId: number;
  classId: number;
  pupilId: number;
  mark: number;
  quarter: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  pupil: Pupil;
}

export const GradesAPI = {
  /** GET /api/grades/teacher-classes?teacherId=... */
  getTeacherClasses: (teacherId: number): Promise<DisciplineClass[]> =>
    apiClient
      .get<DisciplineClass[]>('/grades/teacher-classes', { params: { teacherId } })
      .then(res => res.data),

  /** GET /api/grades/pupils?classId=... */
  getPupilsByClass: (classId: number): Promise<Pupil[]> =>
    apiClient
      .get<Pupil[]>('/grades/pupils', { params: { classId } })
      .then(res => res.data),

  /** GET /api/grades?classId=...&disciplineTeacherId=...&quarter=... */
  getGrades: (
    classId: number,
    disciplineTeacherId: number,
    quarter: number
  ): Promise<Grade[]> =>
    apiClient
      .get<Grade[]>('/grades', {
        params: { classId, disciplineTeacherId, quarter },
      })
      .then(res => res.data),

  /** POST /api/grades */
  addOrUpdateGrade: (data: {
    classId: number;
    disciplineTeacherId: number;
    pupilId: number;
    quarter: number;
    mark: number;
  }): Promise<Grade> =>
    apiClient.post<Grade>('/grades', data).then(res => res.data),

  /** DELETE /api/grades/:id */
  softDeleteGrade: (id: number): Promise<Grade> =>
    apiClient.delete<Grade>(`/grades/${id}`).then(res => res.data),
};
