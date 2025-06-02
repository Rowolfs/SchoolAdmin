// frontend/hooks/useStudentsByClass.ts
import { useQuery } from '@tanstack/react-query';
import { StudentAPI, Student } from '../utils/studentAPI';

/**
 * Хук для получения списка ученики́в, закреплённых за конкретным классом.
 * Запрашивает GET /api/students/class/:classId.
 */
export function useStudentsByClass(classId: number) {
  return useQuery<Student[]>({
    queryKey: ['studentsByClass', classId],
    queryFn: () => StudentAPI.getByClass(classId),
    enabled: classId > 0,       // Запускаем только при валидном classId
    staleTime: 1000 * 60 * 2,   // Кэшируем 2 минуты
  });
}
