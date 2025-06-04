// frontend/hooks/useSearchTeachers.ts

import { useQuery } from '@tanstack/react-query';
import {
  searchTeachers,
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
