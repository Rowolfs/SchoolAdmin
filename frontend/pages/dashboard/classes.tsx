// frontend/pages/dashboard/classes.tsx
import React, { useMemo, useState } from 'react'
import { NextPage, GetServerSideProps } from 'next'
import DashboardLayout from '../../components/layout/DashboardLayout'
import DataTable from '../../components/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { Class } from '../../utils/classAPI'
import { useQueryClient } from '@tanstack/react-query'
import { useClasses, useCreateClass, useDeleteClass } from '../../hooks/useClasses'
import AssignStudentsModal from '../../components/AssignStudentsModal'
import { verifyTokenOnServer, UserPayload } from '../../utils/authAPI'

interface ClassesPageProps {
  user: UserPayload
}

const ClassesPage: NextPage<ClassesPageProps> = ({ user }) => {
  const { data: classes = [], isLoading, isError } = useClasses()
  const queryClient = useQueryClient()
  const createMutation = useCreateClass()
  const deleteMutation = useDeleteClass()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [newClassTeacherId, setNewClassTeacherId] = useState<number | ''>('')
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [activeClassId, setActiveClassId] = useState<number | null>(null)
  const [existingUserIds, setExistingUserIds] = useState<number[]>([])

  const columns = useMemo<ColumnDef<Class>[]>(
    () => [
      { header: 'ID', accessorKey: 'id' },
      { header: 'Название', accessorKey: 'name' },
      {
        header: 'Учитель',
        accessorKey: 'teacher',
        cell: ({ row }) => {
          const cls = row.original
          if (cls.teacher) {
            return (
              <span>
                {cls.teacher.user.surname} {cls.teacher.user.name} {cls.teacher.user.patronymic}
              </span>
            )
          }
          return <span>-</span>
        },
      },
      {
        header: 'Ученики',
        accessorKey: 'pupils',
        cell: ({ row }) => <span>{row.original.pupils?.length ?? 0}</span>,
      },
      {
        header: 'Действия',
        accessorKey: 'actions',
        cell: ({ row }) => {
          const cls = row.original
          return (
            <div className="flex space-x-4">
              <button
                className="text-purple-600 hover:underline"
                onClick={() => openAssignModal(cls)}
              >
                Назначить учеников
              </button>
              <button
                className="text-red-600 hover:underline"
                onClick={() => deleteMutation.mutate(cls.id)}
              >
                Удалить
              </button>
            </div>
          )
        },
      },
    ],
    [deleteMutation]
  )

  const openCreateModal = () => {
    setNewClassName('')
    setNewClassTeacherId('')
    setIsCreateOpen(true)
  }

  const closeCreateModal = () => {
    setIsCreateOpen(false)
  }

  const handleCreateClass = () => {
    if (!newClassName.trim()) return

    createMutation.mutate(
      {
        name: newClassName.trim(),
        classTeacher: newClassTeacherId === '' ? undefined : newClassTeacherId,
      },
      {
        onSuccess: () => {
          closeCreateModal()
          setNewClassName('')
          setNewClassTeacherId('')
        },
      }
    )
  }

  const openAssignModal = (cls: Class) => {
    setActiveClassId(cls.id)
    setExistingUserIds(cls.pupils?.map((p) => p.userId) || [])
    setIsAssignOpen(true)
  }

  const closeAssignModal = () => {
    setActiveClassId(null)
    setExistingUserIds([])
    setIsAssignOpen(false)
  }

  if (isError) {
    return (
      <DashboardLayout user={user}>
        <div className="p-4">
          <p className="text-red-500">Ошибка при загрузке классов</p>
        </div>
      </DashboardLayout>
    )
  }

  if (isLoading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex h-64 items-center justify-center">
          <p>Загрузка...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Список классов</h1>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            onClick={openCreateModal}
          >
            Создать класс
          </button>
        </div>

        <DataTable columns={columns} data={classes} isLoading={false} />

        {isCreateOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg w-80">
              <h2 className="text-xl font-semibold mb-4">Новый класс</h2>
              <input
                type="text"
                placeholder="Название класса"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="w-full border px-3 py-2 mb-3 rounded"
              />
              <input
                type="number"
                placeholder="ID учителя (опционально)"
                value={newClassTeacherId}
                onChange={(e) =>
                  setNewClassTeacherId(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full border px-3 py-2 mb-4 rounded"
              />
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={closeCreateModal}
                >
                  Отмена
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={handleCreateClass}
                >
                  Создать
                </button>
              </div>
            </div>
          </div>
        )}

        {activeClassId !== null && (
          <AssignStudentsModal
            isOpen={isAssignOpen}
            onClose={closeAssignModal}
            classId={activeClassId}
            existingUserIds={existingUserIds}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const user: UserPayload | null = await verifyTokenOnServer(ctx)

  if (!user) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    }
  }
  if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    }
  }

  return {
    props: { user },
  }
}

export default ClassesPage
