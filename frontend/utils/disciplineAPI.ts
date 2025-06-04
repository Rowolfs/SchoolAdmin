// frontend/utils/disciplineApi.ts

import api from './apiClient';

export interface Discipline {
  id: number;
  name: string;
  description: string;
  teachers: Teacher[];
}

export interface Teacher {
  id: number;
  user: {
    id: number;
    name: string;
    surname: string;
    patronymic: string;
  };
}

/**
 * Получить список всех дисциплин (с назначенными преподавателями)
 */
export async function getDisciplines(): Promise<Discipline[]> {
  const res = await api.get<Discipline[]>('/disciplines');
  return res.data;
}

/**
 * Создать новую дисциплину
 */
export async function createDiscipline(data: {
  name: string;
  description: string;
}): Promise<Discipline> {
  const res = await api.post<Discipline>('/disciplines', data);
  return res.data;
}

/**
 * Удалить дисциплину по ID
 */
export async function deleteDiscipline(id: number): Promise<void> {
  await api.delete(`/disciplines/${id}`);
}

/**
 * Получить список преподавателей, назначенных на конкретную дисциплину
 */
export async function getTeachersByDiscipline(
  disciplineId: number
): Promise<Teacher[]> {
  const res = await api.get<Teacher[]>(`/disciplines/${disciplineId}/teachers`);
  return res.data;
}

/**
 * Поиск преподавателей с учётом фильтра по ФИО и пометки уже назначенных
 */
export async function searchTeachers(
  searchStr: string,
  disciplineId: number
): Promise<Teacher[]> {
  const params: Record<string, string> = {};
  if (searchStr) params.search = searchStr;
  params.disciplineId = String(disciplineId);
  const res = await api.get<Teacher[]>('/teachers', { params });
  return res.data;
}

/**
 * Назначить список преподавателей на дисциплину
 */
export async function assignTeachers(params: {
  disciplineId: number;
  teacherIds: number[];
}): Promise<void> {
  const { disciplineId, teacherIds } = params;
  await api.put(`/disciplines/${disciplineId}/teachers`, { teacherIds });
}
