// frontend/pages/dashboard/disciplines.tsx
import React, { useMemo, useState } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Discipline } from '../../utils/disciplineAPI';
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
  const createMutation = useCreateDiscipline();
  const deleteMutation = useDeleteDiscipline();

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [activeDisciplineId, setActiveDisciplineId] = useState<number | null>(null);
  const { data: teachersOfDiscipline = [] } = useTeachersByDiscipline(activeDisciplineId ?? 0);

  const columns = useMemo<ColumnDef<Discipline>[]>(() => [
    { header: 'ID', accessorKey: 'id' },
    { header: 'Название', accessorKey: 'name' },
    { header: 'Описание', accessorKey: 'description' },
    {
      header: 'Преподаватели',
      accessorKey: 'teachers',
      cell: ({ row }) => {
        const count = row.original.teachers?.length ?? 0;
        return <span>{count}</span>;
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

  if (isError) {
    return (
      <DashboardLayout user={user}>
        <p className="text-red-500 p-4">Ошибка при загрузке дисциплин</p>
      </DashboardLayout>
    );
  }
  if (isLoading) {
    return (
      <DashboardLayout user={user}>
        <p className="p-4">Загрузка...</p>
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
            onClick={() => createMutation.mutate({ name: '', description: '' })}
          >
            Создать дисциплину
          </button>
        </div>

        <DataTable columns={columns} data={disciplines} isLoading={false} />

        {isAssignOpen && activeDisciplineId !== null && (
          <AssignTeachersModal
            isOpen={isAssignOpen}
            disciplineId={activeDisciplineId}
            existingTeacherIds={teachersOfDiscipline.map(t => t.id)}
            onClose={() => setIsAssignOpen(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const user = await verifyTokenOnServer(ctx);
  if (!user) return { redirect: { destination: '/auth/login', permanent: false } };
  if (user.role !== 'ADMIN') return { redirect: { destination: '/dashboard', permanent: false } };
  return { props: { user } };
};

export default DisciplinesPage;
