// frontend/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/utils/api'

export interface IUser {
  id: number
  surname: string
  name: string
  patronymic: string
  email: string
  role: 'ADMIN' | 'TEACHER' | 'STUDENT'
  createdAt: string
}

export interface IFilter {
  dateFrom?: string
  dateTo?: string
  role?: string
}

/**
 * Хук для загрузки списка пользователей с поиском и фильтрацией
 */
export const useUsers = (search?: string, filter?: IFilter) =>
  useQuery<IUser[], Error>({
    queryKey: ['users', search, filter],
    queryFn: async () => {
      if (search) {
        const { data } = await api.get<IUser[]>(
          `/users/search?q=${encodeURIComponent(search)}`
        )
        return data
      }
      if (filter && (filter.dateFrom || filter.dateTo || filter.role)) {
        const { data } = await api.post<IUser[]>('/users/filter', filter)
        return data
      }
      const { data } = await api.get<IUser[]>('/users')
      return data
    },
    staleTime: 0, // всегда stale, чтобы invalidateQueries сразу рефетчил
  })

/**
 * Хук для обновления полей пользователя
 */
export const useUpdateUser = (search?: string, filter?: IFilter) => {
  
  const qc = useQueryClient()
  const key = ['users', search, filter] as const

  return useMutation(
    ({ id, changes }: { id: number; changes: Partial<IUser> }) =>
      api.patch<IUser>(`/users/${id}`, changes),
    {
      onMutate: async ({ id, changes }) => {
        await qc.cancelQueries(key)
        const previous = qc.getQueryData<IUser[]>(key)
        qc.setQueryData<IUser[]>(key, old =>
          old?.map(u => (u.id === id ? { ...u, ...changes } : u))
        )
        return { previous }
      },
      onError: (_err, _vars, context: any) => {
        if (context?.previous) qc.setQueryData(key, context.previous)
      },
      onSettled: () => {
        qc.invalidateQueries(key, { refetchType: 'all' })
      },

    }
  )
}

/**
 * Хук для soft-delete пользователя
 */
export const useDeleteUser = () => {
  const qc = useQueryClient()
  return useMutation(
    (id: number) => api.delete(`/users/${id}`),
    {
      onSuccess: () => qc.invalidateQueries({ queryKey: ['users'], exact: false })
    }
  )
}