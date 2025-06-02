// frontend/hooks/useClasses.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClassAPI, Class } from '../utils/classAPI';

export function useClasses() {
  console.log('[useClasses] Хук useClasses был вызван'); // <-- ЛОГ №1

  return useQuery<Class[]>(
    ['classes'],
    () => {
      console.log('[useClasses] Передаю управление ClassAPI.getAll()'); // <-- ЛОГ №2
      return ClassAPI.getAll();
    },

  );
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  console.log('[useCreateClass] Хук useCreateClass был вызван'); // <-- ЛОГ №3
  return useMutation(
    (newClass: { name: string; classTeacher?: number }) => {
      console.log('[useCreateClass] Вызов ClassAPI.create'); // <-- ЛОГ №4
      return ClassAPI.create(newClass);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['classes']);
      },
    }
  );
}

export function useDeleteClass() {
  const queryClient = useQueryClient();
  console.log('[useDeleteClass] Хук useDeleteClass был вызван'); // <-- ЛОГ №5
  return useMutation(
    (classId: number) => {
      console.log('[useDeleteClass] Вызов ClassAPI.remove для id =', classId); // <-- ЛОГ №6
      return ClassAPI.remove(classId);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['classes']);
      },
    }
  );
}
