// frontend/hooks/useSearchStudents.ts
import { useQuery } from '@tanstack/react-query';
import { StudentAPI, Student } from '../utils/studentAPI';

/**
 * Хук для поиска учеников с учётом activeClassId:
 * 1) Если строка поиска (searchStr) непустая → делает запрос /api/students/search?query=…
 * 2) Если searchStr пустая → получает всех Pupil (GET /api/students),
 *    затем локально фильтрует тех, у кого classId === null ИЛИ classId === activeClassId.
 *
 * @param searchStr  — строка поиска ФИО.
 * @param activeClassId — id текущего класса.
 */
export function useSearchStudents(searchStr: string, activeClassId: number) {
  return useQuery<Student[]>({
    queryKey: ['searchStudents', activeClassId, searchStr],
    queryFn: async () => {
      const trimmed = searchStr.trim();
      if (trimmed.length > 0) {
        // Поиск по ФИО на бэкенде
        return StudentAPI.search(trimmed);
      }
      // Если строка поиска пустая — подгрузить всех Pupil и отфильтровать:
      const all = await StudentAPI.getAll();
      return all.filter(
        (pupil) =>
          pupil.classId === null || pupil.classId === activeClassId
      );
    },
    enabled: true,        // Всегда выполнять (чтобы при пустой строке отобразить «свободных» и «своих» учеников)
    staleTime: 1000 * 60, // Кэшируем 1 минуту
  });
}
