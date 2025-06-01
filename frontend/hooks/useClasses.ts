// frontend/hooks/useClasses.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClassAPI, Class } from '../utils/api';

export interface Class {
  id: number;
  name: string;
  classTeacher?: number | null;
  teacher?: {
    id: number;
    user: { name: string; surname: string; patronymic: string };
  } | null;
  pupils?: {
    id: number;
    userId: number;
    user: { name: string; surname: string; patronymic: string };
  }[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

/**
 * Получить список всех классов
 * GET /api/classes
 */
export function useClasses() {
  return useQuery<Class[]>(['classes'], () =>
    ClassAPI.getAll().then((res) => res.data)
  );
}

/**
 * Создать новый класс
 * POST /api/classes
 */
export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation(
    (newClass: { name: string; classTeacher?: number }) =>
      ClassAPI.create(newClass).then((res) => res.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['classes']);
      },
    }
  );
}

/**
 * Soft-delete класса
 * DELETE /api/classes/:id
 */
export function useDeleteClass() {
  const queryClient = useQueryClient();
  return useMutation(
    (classId: number) => ClassAPI.remove(classId).then(() => classId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['classes']);
      },
    }
  );
}
