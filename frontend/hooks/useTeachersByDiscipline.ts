// frontend/hooks/useTeachersByDiscipline.ts

import { useQuery } from '@tanstack/react-query';
import { getTeachersByDiscipline, Teacher } from '../utils/disciplineAPI';

export function useTeachersByDiscipline(disciplineId: number) {
  return useQuery<Teacher[], Error>(
    ['teachersByDiscipline', disciplineId],
    () => getTeachersByDiscipline(disciplineId),
    {
      // не делаем запрос, если ID некорректен
      enabled: disciplineId > 0,
    }
  );
}
