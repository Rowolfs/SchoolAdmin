// frontend/hooks/useDisciplineTeachersByClass.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ClassAPI,
  DisciplineTeacherPair,
} from '../utils/classAPI';

export function useDisciplineTeachersByClass(classId: number) {
  const qc = useQueryClient();

  const assignedQuery = useQuery<DisciplineTeacherPair[], Error>(
    ['classes', classId, 'disc-teachers'],
    () => ClassAPI.getDisciplineTeacherPairs(classId),
    { enabled: !!classId }
  );

  const searchMutation = useMutation<DisciplineTeacherPair[], Error, string>(
    search => ClassAPI.searchDisciplineTeacherPairs(classId, search)
  );

  const assignMutation = useMutation<void, Error, { pairs: number[] }>(
    ({ pairs }) =>
      ClassAPI.assignDisciplineTeacherPairs(classId, pairs),
    {
      onSuccess: () => {
        qc.invalidateQueries(['classes', classId, 'disc-teachers']);
        qc.invalidateQueries(['classes']);
      },
    }
  );

  return {
    data: assignedQuery.data ?? [],
    isLoading: assignedQuery.isLoading,

    search: {
      mutate: searchMutation.mutate,
      data: searchMutation.data,
      isLoading: searchMutation.isLoading,
    },

    assign: {
      mutate: assignMutation.mutate,
      isLoading: assignMutation.isLoading,
    },
  };
}
