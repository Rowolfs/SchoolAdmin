// frontend/hooks/useDisciplines.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDisciplines,
  createDiscipline,
  deleteDiscipline,
  Discipline,
} from '../utils/disciplineAPI';

export function useDisciplines() {
  return useQuery<Discipline[], Error>(
    ['disciplines'],
    getDisciplines
  );
}

export function useCreateDiscipline() {
  const queryClient = useQueryClient();
  return useMutation(createDiscipline, {
    onSuccess: () => {
      queryClient.invalidateQueries(['disciplines']);
    },
  });
}

export function useDeleteDiscipline() {
  const queryClient = useQueryClient();
  return useMutation(deleteDiscipline, {
    onSuccess: () => {
      queryClient.invalidateQueries(['disciplines']);
    },
  });
}
