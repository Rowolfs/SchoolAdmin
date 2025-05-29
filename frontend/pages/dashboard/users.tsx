// frontend/pages/dashboard/users.tsx
import React, { useState, ReactElement } from 'react'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import DashboardLayout from '@/components/layout/DashboardLayout'
import DataTable from '@/components/DataTable'
import api from '@/utils/api'
import {
  useUsers,
  useUpdateUserRole,
  useDeleteUser,
  IUser,
  IFilter,
} from '@/hooks/useUsers'

interface CurrentUser {
  id: number
  name: string
  surname: string
  patronymic: string
  email: string
  role: 'ADMIN' | 'TEACHER' | 'STUDENT'
}

const UsersPage = ({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [search, setSearch] = useState<string>('')
  const [filter, setFilter] = useState<IFilter>({})
  const { data: users, isLoading } = useUsers(search, filter)
  const updateRole = useUpdateUserRole()
  const deleteUser = useDeleteUser()

  const columns = React.useMemo(
    () => [
      { header: 'ID', accessorKey: 'id' },
      {
        header: 'ФИО',
        accessorFn: (r: IUser) => `${r.surname} ${r.name} ${r.patronymic}`,
      },
      { header: 'Email', accessorKey: 'email' },
      {
        header: 'Роль',
        accessorKey: 'role',
        cell: ({ row }: any) => (
          <select
            className="border p-1 rounded"
            value={row.original.role}
            onChange={(e) =>
              updateRole.mutate({ id: row.original.id, role: e.target.value })
            }
          >
            <option value="ADMIN">ADMIN</option>
            <option value="TEACHER">TEACHER</option>
            <option value="STUDENT">STUDENT</option>
          </select>
        ),
      },
      {
        header: 'Дата создания',
        accessorFn: (r: IUser) =>
          new Date(r.createdAt).toLocaleDateString(),
      },
      {
        header: 'Действия',
        accessorKey: 'actions',
        cell: ({ row }: any) => (
          <button
            className="px-2 py-1 bg-red-600 text-white rounded disabled:opacity-50"
            onClick={() => {
              if (confirm('Удалить пользователя?')) {
                deleteUser.mutate(row.original.id)
              }
            }}
            disabled={deleteUser.isLoading}
          >
            Удалить
          </button>
        ),
      },
    ],
    [updateRole, deleteUser]
  )

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Управление пользователями</h1>

      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Поиск по ФИО..."
          className="border p-2 rounded flex-grow"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded">
          Поиск
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="date"
          className="border p-2 rounded"
          value={filter.dateFrom || ''}
          onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })}
        />
        <input
          type="date"
          className="border p-2 rounded"
          value={filter.dateTo || ''}
          onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })}
        />
        <select
          className="border p-2 rounded"
          value={filter.role || ''}
          onChange={(e) => setFilter({ ...filter, role: e.target.value })}
        >
          <option value="">Все роли</option>
          <option value="ADMIN">ADMIN</option>
          <option value="TEACHER">TEACHER</option>
          <option value="STUDENT">STUDENT</option>
        </select>
        <button className="px-4 py-2 bg-blue-600 text-white rounded">
          Применить
        </button>
        <button
          className="px-4 py-2 border rounded"
          onClick={() => {
            setFilter({})
            setSearch('')
          }}
        >
          Сброс
        </button>
      </div>

      <DataTable columns={columns} data={users || []} isLoading={isLoading} />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<{
  user: CurrentUser
}> = async (ctx) => {
  const cookie = ctx.req.headers.cookie || ''
  try {
    const { data: user } = await api.get<CurrentUser>('/users/me', {
      headers: { Cookie: cookie },
    })
    return { props: { user } }
  } catch {
    return { redirect: { destination: '/auth/login', permanent: false } }
  }
}

UsersPage.getLayout = (page: ReactElement) => (
  <DashboardLayout user={(page.props as any).user}>{page}</DashboardLayout>
)

export default UsersPage
