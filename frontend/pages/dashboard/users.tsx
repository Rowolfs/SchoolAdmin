// frontend/pages/dashboard/users.tsx
'use client'
import React, { useState, ReactElement } from 'react'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import DashboardLayout from '@/components/layout/DashboardLayout'
import DataTable from '@/components/DataTable'
import api from '@/utils/api'
import { ColumnDef } from '@tanstack/react-table'
import { useUsers, useUpdateUser, useDeleteUser, IUser, IFilter } from '@/hooks/useUsers'

interface CurrentUser {
  id: number
  name: string
  surname: string
  patronymic: string
  email: string
  role: 'ADMIN' | 'TEACHER' | 'STUDENT'
}

const UsersPage = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [search, setSearch] = useState<string>('')
  const [filter, setFilter] = useState<IFilter>({})
  const { data: users, isLoading, refetch } = useUsers(search, filter)
  const updateUser = useUpdateUser(search, filter)
  const deleteUser = useDeleteUser()

  const columns = React.useMemo<ColumnDef<IUser>[]>(
    () => [
      { accessorKey: 'id', header: 'ID' },
      {
        accessorKey: 'surname',
        header: 'Фамилия',
        cell: ({ row }) => (
          <input
            className="border px-1 py-1 rounded w-full"
            defaultValue={row.original.surname}
            onBlur={e => updateUser.mutate({ id: row.original.id, changes: { surname: e.target.value } })}
          />
        ),
      },
      {
        accessorKey: 'name',
        header: 'Имя',
        cell: ({ row }) => (
          <input
            className="border px-1 py-1 rounded w-full"
            defaultValue={row.original.name}
            onBlur={e => updateUser.mutate({ id: row.original.id, changes: { name: e.target.value } })}
          />
        ),
      },
      {
        accessorKey: 'patronymic',
        header: 'Отчество',
        cell: ({ row }) => (
          <input
            className="border px-1 py-1 rounded w-full"
            defaultValue={row.original.patronymic}
            onBlur={e => updateUser.mutate({ id: row.original.id, changes: { patronymic: e.target.value } })}
          />
        ),
      },
      { accessorKey: 'email', header: 'Email',
         cell: ({ row }) => (
          <input
            className="border px-1 py-1 rounded w-full"
            defaultValue={row.original.email}
            onBlur={e => updateUser.mutate({ id: row.original.id, changes: { email: e.target.value } })}
          />
        ),
       },
      {
        accessorKey: 'role',
        header: 'Роль',
        cell: ({ row }) => (
          <select
            className="border p-1 rounded"
            value={row.original.role}
            onChange={e => {
            const newRole = e.currentTarget.value as IUser['role'];
            console.log('Попытка изменить роль у пользователя', row.original.id, 'с', row.original.role, 'на', newRole);
            updateUser.mutate(
              { id: row.original.id, changes: { role: newRole } },
              {
                onSuccess: () => {
                  console.log('Мутация прошла успешно, вызываем refetch()');
                  refetch();
                },
                onError: (error) => {
                  console.warn('Ошибка при updateUser:', error);
                }
              }
            );
          }}
            disabled={updateUser.isLoading}
          >
            <option value="ADMIN">ADMIN</option>
            <option value="TEACHER">TEACHER</option>
            <option value="STUDENT">STUDENT</option>
          </select>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Дата создания',
        cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
      },
      {
        accessorKey: 'actions',
        header: 'Действия',
        cell: ({ row }) => (
          <button
            className="px-2 py-1 bg-red-600 text-white rounded disabled:opacity-50"
            onClick={() => deleteUser.mutate(row.original.id)}
            disabled={deleteUser.isLoading}
          >
            Удалить
          </button>
        ),
      },
    ],
    [updateUser, deleteUser]
  )

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Управление пользователями</h1>

      {/* Поиск */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Поиск по ФИО..."
          className="border p-2 rounded flex-grow"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => refetch()}>
          Поиск
        </button>
      </div>

      {/* Фильтры */}
      <div className="flex items-center space-x-2">
        <label className="flex items-center space-x-1">
          <span>Дата от:</span>
          <input
            type="date"
            className="border p-2 rounded"
            value={filter.dateFrom || ''}
            onChange={e => setFilter({ ...filter, dateFrom: e.target.value })}
          />
        </label>
        <label className="flex items-center space-x-1">
          <span>Дата до:</span>
          <input
            type="date"
            className="border p-2 rounded"
            value={filter.dateTo || ''}
            onChange={e => setFilter({ ...filter, dateTo: e.target.value })}
          />
        </label>
        <select
          className="border p-2 rounded"
          value={filter.role || ''}
          onChange={e => setFilter({ ...filter, role: e.target.value })}
        >
          <option value="">Все роли</option>
          <option value="ADMIN">ADMIN</option>
          <option value="TEACHER">TEACHER</option>
          <option value="STUDENT">STUDENT</option>
        </select>
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => refetch()}>
          Применить
        </button>
        <button
          className="px-4 py-2 border rounded"
          onClick={() => {
            setFilter({})
            setSearch('')
            refetch()
          }}
        >
          Сброс
        </button>
      </div>

      <DataTable key={JSON.stringify(users)} columns={columns} data={users || []} isLoading={isLoading} />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<{ user: CurrentUser }> = async ctx => {
  const cookie = ctx.req.headers.cookie || ''
  try {
    const { data: user } = await api.get<CurrentUser>('/users/me', { headers: { Cookie: cookie } })
    return { props: { user } }
  } catch {
    return { redirect: { destination: '/auth/login', permanent: false } }
  }
}

UsersPage.getLayout = (page: ReactElement) => (
  <DashboardLayout user={(page.props as any).user}>{page}</DashboardLayout>
)

export default UsersPage
