// frontend/hooks/useTeachersByDiscipline.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTeachersByDiscipline,
  searchTeachersByDiscipline,
  assignTeachers,
  Teacher,
} from '../utils/disciplineAPI';

export function useTeachersByDiscipline(disciplineId: number) {
  const queryClient = useQueryClient();

  // 1) Запрашиваем текущих назначенных преподавателей
  const query = useQuery<Teacher[], Error>(
    ['disciplines', disciplineId, 'teachers'],
    () => getTeachersByDiscipline(disciplineId),
    { enabled: !!disciplineId }
  );

  // 2) Мутатор для поиска преподавателей
  const searchMutation = useMutation<Teacher[], Error, string>(
    (searchStr) => searchTeachersByDiscipline(searchStr, disciplineId)
  );

  // 3) Мутатор для сохранения списка назначенных
  const assignMutation = useMutation<void, Error, number[]>(
    (teacherIds) => assignTeachers(disciplineId, teacherIds),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['disciplines', disciplineId, 'teachers']);
        queryClient.invalidateQueries(['disciplines']);
      },
    }
  );

  return {
    // Совместимо с useQuery API
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,

    search: {
      mutate: searchMutation.mutate,
      data: searchMutation.data,
      isLoading: searchMutation.isLoading,
      isError: searchMutation.isError,
    },

    assign: {
      mutate: assignMutation.mutate,
      isLoading: assignMutation.isLoading,
      isError: assignMutation.isError,
    },
  };
}
