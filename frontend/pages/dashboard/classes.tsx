// frontend/pages/dashboard/classes.tsx
import React, { useMemo, useState } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import { parseCookies } from 'nookies';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { ClassAPI, Class } from '../../utils/api';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import AssignStudentsModal from '../../components/AssignStudentsModal';
import { verifyTokenOnServer } from '../../utils/auth';
import { Dialog, Transition } from '@headlessui/react';
import { X as XIcon } from 'lucide-react';

interface ClassesPageProps {}

const ClassesPage: NextPage<ClassesPageProps> = () => {
  const queryClient = useQueryClient();

  // 1) Получаем список всех классов
  const {
    data: classes,
    isLoading,
    error,
  } = useQuery<Class[]>(['classes'], () => ClassAPI.getAll().then((res) => res.data));

  // 2) Мутации: create, delete (soft-delete)
  const createMutation = useMutation(
    (newClass: { name: string; classTeacher?: number }) => ClassAPI.create(newClass).then((res) => res.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['classes']);
      },
    }
  );
  const deleteMutation = useMutation(
    (id: number) => ClassAPI.remove(id).then(() => id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['classes']);
      },
    }
  );

  // 3) Состояние для модалки создания класса
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassTeacherId, setNewClassTeacherId] = useState<number | ''>('');

  // 4) Состояние для модалки назначения учеников
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [activeClassId, setActiveClassId] = useState<number | null>(null);
  const [existingUserIds, setExistingUserIds] = useState<number[]>([]);

  // 5) Открыть/закрыть модалку создания
  const openCreateModal = () => {
    setNewClassName('');
    setNewClassTeacherId('');
    setIsCreateOpen(true);
  };
  const closeCreateModal = () => {
    setIsCreateOpen(false);
  };

  // 6) Обработчик создания класса
  const handleCreateClass = () => {
    if (!newClassName.trim()) return;
    createMutation.mutate(
      {
        name: newClassName.trim(),
        classTeacher: newClassTeacherId === '' ? undefined : newClassTeacherId,
      },
      {
        onSuccess: () => closeCreateModal(),
      }
    );
  };

  // 7) Открыть модалку назначения учеников, передав в неё текущий список userId
  const openAssignModal = (cls: Class) => {
    setActiveClassId(cls.id);
    const users = (cls.pupils ?? []).map((p) => p.userId);
    setExistingUserIds(users);
    setIsAssignOpen(true);
  };
  const closeAssignModal = () => {
    setActiveClassId(null);
    setExistingUserIds([]);
    setIsAssignOpen(false);
  };

  // 8) Определяем колонки для DataTable
  const columns = useMemo<ColumnDef<Class>[]>(
    () => [
      { header: 'ID', accessorKey: 'id' },
      { header: 'Название', accessorKey: 'name' },
      {
        header: 'Учитель',
        accessorKey: 'teacher',
        cell: ({ row }) => {
          const cls = row.original;
          if (cls.teacher) {
            return (
              <span>
                {cls.teacher.user.surname} {cls.teacher.user.name} {cls.teacher.user.patronymic}
              </span>
            );
          }
          return <span>-</span>;
        },
      },
      {
        header: 'Ученики',
        accessorKey: 'pupils',
        cell: ({ row }) => {
          const cnt = row.original.pupils?.length ?? 0;
          return <span>{cnt}</span>;
        },
      },
      {
        header: 'Действия',
        accessorKey: 'actions',
        cell: ({ row }) => {
          const cls = row.original;
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
          );
        },
      },
    ],
    [deleteMutation]
  );

  if (isLoading) return <p>Загрузка…</p>;
  if (error) return <p>Ошибка при загрузке классов</p>;

  return (
    <DashboardLayout>
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

        <DataTable columns={columns} data={classes ?? []} isLoading={false} />

        {/* Модалка создания класса */}
        <Transition.Root show={isCreateOpen} as={React.Fragment}>
          <Dialog as="div" className="relative z-10" onClose={closeCreateModal}>
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-50"
              leave="ease-in duration-200"
              leaveFrom="opacity-50"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={React.Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all">
                    {/* Заголовок и крестик */}
                    <div className="flex items-center justify-between mb-4">
                      <Dialog.Title className="text-lg font-medium text-gray-900">
                        Создать новый класс
                      </Dialog.Title>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600"
                        onClick={closeCreateModal}
                      >
                        <XIcon size={20} />
                      </button>
                    </div>

                    {/* Поля ввода */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Название класса
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newClassName}
                          onChange={(e) => setNewClassName(e.target.value)}
                          placeholder="Например, 10A"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ID учителя (опционально)
                        </label>
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={newClassTeacherId}
                          onChange={(e) =>
                            setNewClassTeacherId(e.target.value === '' ? '' : Number(e.target.value))
                          }
                          placeholder="Введите ID учителя"
                        />
                      </div>
                    </div>

                    {/* Кнопки */}
                    <div className="mt-6 flex justify-end space-x-2">
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        onClick={closeCreateModal}
                      >
                        Отмена
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={handleCreateClass}
                        disabled={createMutation.isLoading}
                      >
                        {createMutation.isLoading ? 'Создание…' : 'Создать'}
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Модалка назначения учеников */}
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
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const token = parseCookies(ctx).token || '';
  const user = await verifyTokenOnServer(token);
  if (!user) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }
  if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }
  return { props: {} };
};

export default ClassesPage;
