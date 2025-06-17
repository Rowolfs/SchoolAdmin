// frontend/hooks/useAssignTeachers.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignTeachers, searchTeachers } from '../utils/disciplineAPI';

export interface TeacherShort {
  id: number;
  user: {
    id: number;
    name: string;
    surname: string;
    patronymic: string;
  };
}

export function useAssignTeachers() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { disciplineId: number; teacherIds: number[] }>(
    ({ disciplineId, teacherIds }) => assignTeachers(disciplineId, teacherIds),
    {
      onSuccess: (_data, variables) => {
        // После успешного назначения инвалидируем кэши
        queryClient.invalidateQueries(['teachersByDiscipline', variables.disciplineId]);
        queryClient.invalidateQueries(['disciplines']);
      },
    }
  );
}

export function useSearchTeachers(searchStr: string, disciplineId: number) {
  return useQuery<TeacherShort[], Error>(
    ['searchTeachers', disciplineId, searchStr],
    () => searchTeachers(searchStr, disciplineId),
    {
      enabled: disciplineId > 0 && searchStr.trim().length > 0,
    }
  );
}
