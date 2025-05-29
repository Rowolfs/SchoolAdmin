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

export const useUsers = (search?: string, filter?: IFilter) =>
  useQuery<IUser[], Error>({
    queryKey: ['users', search, filter],
    queryFn: async () => {
      if (search) {
        const { data } = await api.get<IUser[]>(`/users/search?q=${encodeURIComponent(search)}`)
        return data
      }
      if (filter && (filter.dateFrom || filter.dateTo || filter.role)) {
        const { data } = await api.post<IUser[]>('/users/filter', filter)
        return data
      }
      const { data } = await api.get<IUser[]>('/users')
      return data
    },
    staleTime: 1000 * 60 * 5,
  })

export const useUpdateUserRole = () => {
  const qc = useQueryClient()
  return useMutation(
    ({ id, role }: { id: number; role: string }) =>
      api.patch(`/users/${id}/role`, { role }),
    { onSuccess: () => qc.invalidateQueries(['users']) }
  )
}

export const useDeleteUser = () => {
  const qc = useQueryClient()
  return useMutation(
    (id: number) => api.delete(`/users/${id}`),
    { onSuccess: () => qc.invalidateQueries(['users']) }
  )
}
