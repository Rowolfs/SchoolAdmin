// frontend/pages/dashboard/disciplines.tsx

import React, { useMemo, useState } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Discipline } from '../../utils/disciplineAPI';
import { useQueryClient } from '@tanstack/react-query';
import {
  useDisciplines,
  useCreateDiscipline,
  useDeleteDiscipline,
} from '../../hooks/useDisciplines';
import { useTeachersByDiscipline } from '../../hooks/useTeachersByDiscipline';
import AssignTeachersModal from '../../components/AssignTeachersModal';
import { verifyTokenOnServer, UserPayload } from '../../utils/authAPI';

interface DisciplinesPageProps {
  user: UserPayload;
}

const DisciplinesPage: NextPage<DisciplinesPageProps> = ({ user }) => {
  const { data: disciplines = [], isLoading, isError } = useDisciplines();
  const queryClient = useQueryClient();
  const createMutation = useCreateDiscipline();
  const deleteMutation = useDeleteDiscipline();

  // Состояния для создания новой дисциплины
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newDisciplineName, setNewDisciplineName] = useState('');
  const [newDisciplineDesc, setNewDisciplineDesc] = useState('');

  // Состояния для AssignTeachersModal
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [activeDisciplineId, setActiveDisciplineId] = useState<number | null>(null);
  const { data: teachersOfDiscipline = [] } = useTeachersByDiscipline(
    activeDisciplineId ?? 0
  );

  // Определяем колонки таблицы
  const columns = useMemo<ColumnDef<Discipline>[]>(() => [
    { header: 'ID', accessorKey: 'id' },
    { header: 'Название', accessorKey: 'name' },
    { header: 'Описание', accessorKey: 'description' },
    {
      header: 'Преподаватели',
      accessorKey: 'teachers',
      cell: ({ row }) => {
        const disc = row.original;
        if (disc.teachers && disc.teachers.length > 0) {
          return <span>{disc.teachers.map(t => t.user.surname + ' ' + t.user.name).join(', ')}</span>;
        }
        return <span className="italic text-gray-500">—</span>;
      },
    },
    {
      header: 'Действия',
      accessorKey: 'actions',
      cell: ({ row }) => {
        const disc = row.original;
        return (
          <div className="flex flex-col space-y-1">
            <button
              className="text-blue-600 hover:underline"
              onClick={() => {
                setActiveDisciplineId(disc.id);
                setIsAssignOpen(true);
              }}
            >
              Назначить преподавателей
            </button>
            <button
              className="text-red-600 hover:underline"
              onClick={() => deleteMutation.mutate(disc.id)}
            >
              Удалить
            </button>
          </div>
        );
      },
    },
  ], [deleteMutation]);

  // Открытие/закрытие модалки создания дисциплины
  const openCreateModal = () => {
    setNewDisciplineName('');
    setNewDisciplineDesc('');
    setIsCreateOpen(true);
  };
  const closeCreateModal = () => setIsCreateOpen(false);

  // Создать новую дисциплину
  const handleCreateDiscipline = () => {
    if (!newDisciplineName.trim()) return;
    createMutation.mutate(
      {
        name: newDisciplineName.trim(),
        description: newDisciplineDesc.trim(),
      },
      {
        onSuccess: () => {
          closeCreateModal();
          setNewDisciplineName('');
          setNewDisciplineDesc('');
        },
      }
    );
  };

  // Закрыть AssignTeachersModal
  const closeAssignModal = () => {
    setActiveDisciplineId(null);
    setIsAssignOpen(false);
  };

  if (isError) {
    return (
      <DashboardLayout user={user}>
        <div className="p-4">
          <p className="text-red-500">Ошибка при загрузке дисциплин</p>
        </div>
      </DashboardLayout>
    );
  }
  if (isLoading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex h-64 items-center justify-center">
          <p>Загрузка...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Список дисциплин</h1>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            onClick={openCreateModal}
          >
            Создать дисциплину
          </button>
        </div>

        <DataTable columns={columns} data={disciplines} isLoading={false} />

        {/* Модалка создания */}
        {isCreateOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              <h2 className="text-xl font-semibold mb-4">Новая дисциплина</h2>
              <input
                type="text"
                placeholder="Название дисциплины"
                value={newDisciplineName}
                onChange={(e) => setNewDisciplineName(e.target.value)}
                className="w-full border px-3 py-2 mb-3 rounded"
              />
              <textarea
                placeholder="Описание"
                value={newDisciplineDesc}
                onChange={(e) => setNewDisciplineDesc(e.target.value)}
                className="w-full border px-3 py-2 mb-4 rounded h-24 resize-none"
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
                  onClick={handleCreateDiscipline}
                >
                  Создать
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Модалка AssignTeachersModal (мультивыбор) */}
        {isAssignOpen && activeDisciplineId !== null && (
          <AssignTeachersModal
            isOpen={isAssignOpen}
            onClose={closeAssignModal}
            disciplineId={activeDisciplineId}
            existingTeacherIds={teachersOfDiscipline.map(t => t.id)}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const user: UserPayload | null = await verifyTokenOnServer(ctx);
  if (!user) {
    return {
      redirect: { destination: '/auth/login', permanent: false },
    };
  }
  if (user.role !== 'ADMIN') {
    return {
      redirect: { destination: '/dashboard', permanent: false },
    };
  }
  return {
    props: { user },
  };
};

export default DisciplinesPage;