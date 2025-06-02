// frontend/hooks/useSearchStudents.ts
import { useQuery } from '@tanstack/react-query';
import { StudentAPI, Student } from '../utils/studentAPI';

export default function useSearchStudents(query: string) {
  return useQuery<Student[]>({
    queryKey: ['searchStudents', query],
    queryFn: async () => {
      if (!query || query.trim() === '') {
        return [];
      }
      return StudentAPI.search(query.trim());
    },
    // не запускаем запрос, пока строка поиска пустая
    enabled: query.trim().length > 0,
    // можно указать staleTime, если нужно
  });
}
