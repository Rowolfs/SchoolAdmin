// frontend/hooks/useAssignTeacher.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ClassAPI } from '../utils/classAPI';

/**
 * Хук для назначения/смены преподавателя в классе.
 * Передаёт PATCH /api/classes/:classId с body { classTeacher: teacherId | null }.
 */
export function useAssignTeacher() {
  const queryClient = useQueryClient();

  return useMutation(
    (params: { classId: number; teacherId: number | null }) => {
      // Просто передаём тот же ключ classTeacher: либо число, либо null
      return ClassAPI.updateClass(params.classId, {
        classTeacher: params.teacherId,
      });
    },
    {
      onSuccess: (_data, variables) => {
        // Перезагружаем кеш списка классов, чтобы в таблице сразу обновился учитель
        queryClient.invalidateQueries(['classes']);
        // Если есть отдельный запрос ["classById", classId], тоже его инвалидируем:
        queryClient.invalidateQueries(['classById', variables.classId]);
      },
    }
  );
}
