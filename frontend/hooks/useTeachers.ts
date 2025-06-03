// frontend/hooks/useTeachers.ts
import { useQuery } from '@tanstack/react-query';
import { TeacherAPI, Teacher } from '../utils/teacherAPI';

export function useTeachers() {
  return useQuery<Teacher[]>({
    queryKey: ['teachers'],
    queryFn: () => TeacherAPI.getAll(),
    staleTime: 1000 * 60, // кэшируем на 60 секунд
  });
}
