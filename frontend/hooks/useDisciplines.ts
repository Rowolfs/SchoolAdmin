// frontend/hooks/useDisciplineHooks.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDisciplines,
  createDiscipline,
  deleteDiscipline,
  getTeachersByDiscipline,
  searchTeachers,
  assignTeachers,
  Discipline,
  Teacher,
} from '../utils/disciplineAPI';

/**
 * Хуки для работы с дисциплинами и связанными операциями:
 * - Получение списка дисциплин
 * - Создание дисциплины
 * - Удаление дисциплины
 * - Получение преподавателей дисциплины
 * - Поиск преподавателей (с учётом фильтрации по ФИО + disciplineId)
 * - Назначение преподавателей на дисциплину
 */

export function useDisciplines() {
  return useQuery<Discipline[], Error>(
    ['disciplines'],
    () => getDisciplines()
  );
}

export function useCreateDiscipline() {
  const queryClient = useQueryClient();
  return useMutation<Discipline, Error, { name: string; description: string }>(
    (data) => createDiscipline(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['disciplines']);
      },
    }
  );
}

export function useDeleteDiscipline() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>(
    (id) => deleteDiscipline(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['disciplines']);
      },
    }
  );
}

export function useTeachersByDiscipline(disciplineId: number) {
  return useQuery<Teacher[], Error>(
    ['teachersByDiscipline', disciplineId],
    () => getTeachersByDiscipline(disciplineId),
    {
      enabled: disciplineId > 0,
    }
  );
}

export function useSearchTeachers(searchStr: string, disciplineId: number) {
  return useQuery<Teacher[], Error>(
    ['searchTeachers', disciplineId, searchStr],
    () => searchTeachers(searchStr, disciplineId),
    {
      enabled: disciplineId > 0,
    }
  );
}

export function useAssignTeachers() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { disciplineId: number; teacherIds: number[] }>(
    (params) => assignTeachers(params),
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries(['teachersByDiscipline', variables.disciplineId]);
        queryClient.invalidateQueries(['disciplines']);
      },
    }
  );
}
