// frontend/hooks/useSearchTeachers.ts

import { useQuery } from '@tanstack/react-query';
import {
  searchTeachers,
  assignTeachers
} from '../utils/disciplineAPI';

interface TeacherShort {
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
    ({ disciplineId, teacherIds }) => assignTeachers({ disciplineId, teacherIds }),
    {
      onSuccess: (_data, variables) => {
        // После назначения обновляем кэш учителей для этой дисциплины и сам список дисциплин
        queryClient.invalidateQueries(['teachersByDiscipline', variables.disciplineId]);
        queryClient.invalidateQueries(['disciplines']);
      },
    }
  );
}

export function useSearchTeachers(
  searchStr: string,
  disciplineId: number
) {
  return useQuery<TeacherShort[], Error>(
    ['searchTeachers', disciplineId, searchStr],
    () => searchTeachers(searchStr, disciplineId),
    {
      enabled: disciplineId > 0,
    }
  );
}
