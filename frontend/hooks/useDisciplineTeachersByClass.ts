// frontend/hooks/useDisciplineTeachersByClass.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClassAPI, DisciplineTeacherPair } from '../utils/classAPI';

export function useDisciplineTeachersByClass(classId: number) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<DisciplineTeacherPair[], Error>(
    ['disciplineTeachersByClass', classId],
    () => ClassAPI.getDisciplineTeacherPairs(classId),
    { enabled: classId > 0 }
  );

  const search = useMutation<DisciplineTeacherPair[], Error, string>(
    (searchStr) => ClassAPI.searchDisciplineTeacherPairs(classId, searchStr)
  );

  const assign = useMutation<void, Error, { pairs: number[] }>(
    ({ pairs }) => ClassAPI.assignDisciplineTeacherPairs(classId, pairs),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['disciplineTeachersByClass', classId]);
      },
    }
  );

  return {
    data: data ?? [],
    isLoading,
    search,
    assign,
  };
}
