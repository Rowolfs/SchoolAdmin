// frontend/hooks/useAssignStudents.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ClassAPI } from '../utils/classAPI';

/**
 * Хук для назначения/перезаписи списка студентов в классе
 * POST /api/classes/:id/students
 */
export function useAssignStudents() {
  const queryClient = useQueryClient();

  return useMutation(
    (params: { classId: number; pupilsIds: number[] }) =>
      ClassAPI.assignStudents(params.classId, params.pupilsIds).then((res) => res.data),
    {
      onSuccess: (_data, variables) => {
        // Обновляем список классов и список студентов конкретного класса
        queryClient.invalidateQueries(['classes']);
        queryClient.invalidateQueries(['studentsByClass', variables.classId]);
      },
    }
  );
}
