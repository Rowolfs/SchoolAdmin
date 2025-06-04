// frontend/hooks/useDisciplineHooks.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  searchTeachers,
  assignTeachers,
  getDisciplines,
  createDiscipline,
  deleteDiscipline,
  getTeachersByDiscipline,
} from '../utils/disciplineAPI';
import type { Discipline, Teacher } from '../utils/disciplineAPI';

//
//
// Хуки для дисциплин и преподавателей одной связанной группой
//
//

/**
 * Хук: получить список всех дисциплин
 */
export function useDisciplines() {
  return useQuery<Discipline[], Error>(
    ['disciplines'],
    () => getDisciplines()
  );
}

/**
 * Хук: создать новую дисциплину
 */
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

/**
 * Хук: удалить дисциплину по ID
 */
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

/**
 * Хук: получить преподавателей, назначенных на конкретную дисциплину
 */
export function useTeachersByDiscipline(disciplineId: number) {
  return useQuery<Teacher[], Error>(
    ['teachersByDiscipline', disciplineId],
    () => getTeachersByDiscipline(disciplineId),
    {
      enabled: disciplineId > 0,
    }
  );
}

/**
 * Хук: поиск преподавателей по ФИО и disciplineId
 */
export function useSearchTeachers(
  searchStr: string,
  disciplineId: number
) {
  return useQuery<Teacher[], Error>(
    ['searchTeachers', disciplineId, searchStr],
    () => searchTeachers(searchStr, disciplineId),
    {
      enabled: disciplineId > 0,
    }
  );
}

/**
 * Хук: назначить список преподавателей на дисциплину
 */
export function useAssignTeachers() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { disciplineId: number; teacherIds: number[] }>(
    ({ disciplineId, teacherIds }) => assignTeachers({ disciplineId, teacherIds }),
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries(['teachersByDiscipline', variables.disciplineId]);
        queryClient.invalidateQueries(['disciplines']);
      },
    }
  );
}
