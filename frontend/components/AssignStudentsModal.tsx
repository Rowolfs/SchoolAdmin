// frontend/components/AssignStudentsModal.tsx
'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X as XIcon } from 'lucide-react';
import { useSearchUsers } from '../hooks/useUsers';
import { useAssignStudents } from '../hooks/useClasses';
import { User } from '../utils/api';

interface AssignStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: number;
  existingUserIds: number[]; // Массив User.id, которые уже прикреплены к классу
}

export default function AssignStudentsModal({
  isOpen,
  onClose,
  classId,
  existingUserIds,
}: AssignStudentsModalProps) {
  // Строка поиска
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Массив найденных пользователей (User[]), когда в поиске есть хотя бы 1 символ
  const {
    data: searchResults = [],
    refetch: refetchSearch,
    isFetching: isSearching,
  } = useSearchUsers(searchQuery);

  // Множество выбранных User.id (чекбоксы)
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());

  // Мутация для назначения/перезаписи учеников в класс
  const assignMutation = useAssignStudents();

  // При открытии модалки устанавливаем изначальные выбранные User.id
  useEffect(() => {
    if (isOpen) {
      setSelectedUserIds(new Set(existingUserIds));
      setSearchQuery('');
    }
  }, [isOpen, existingUserIds]);

  // Обработчик клика по чекбоксу
  const handleToggle = (userId: number) => {
    setSelectedUserIds(prev => {
      const copy = new Set(prev);
      if (copy.has(userId)) {
        copy.delete(userId);
      } else {
        copy.add(userId);
      }
      return copy;
    });
  };

  // Обработчик ввода в поле поиска
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // При изменении searchQuery подгружаем новые результаты (если длина > 0)
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      refetchSearch();
    }
  }, [searchQuery, refetchSearch]);

  // При клике «Сохранить» отправляем ассигнмент
  const handleSave = () => {
    assignMutation.mutate(
      {
        classId,
        studentIds: Array.from(selectedUserIds),
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        {/* Затемнение фона */}
        <Transition.Child
          as={Fragment}
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
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all">
                {/* Заголовок и кнопка закрытия */}
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-lg font-medium text-gray-900">
                    Назначить учеников
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={onClose}
                  >
                    <XIcon size={20} />
                  </button>
                </div>

                {/* Поле поиска */}
                <div className="mb-4">
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Поиск учеников по ФИО..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>

                {/* Список результатов поиска + чекбоксы */}
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded p-2">
                  {isSearching && <p className="text-gray-500">Поиск...</p>}
                  {!isSearching && searchQuery.trim().length === 0 && (
                    <p className="text-gray-500">Введите имя для поиска</p>
                  )}
                  {!isSearching && searchQuery.trim().length > 0 && searchResults.length === 0 && (
                    <p className="text-gray-500">Ничего не найдено</p>
                  )}

                  {!isSearching &&
                    searchResults.map((user: User) => (
                      <label
                        key={user.id}
                        className="flex items-center space-x-2 mb-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedUserIds.has(user.id)}
                          onChange={() => handleToggle(user.id)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-800">
                          {user.surname} {user.name} {user.patronymic} ({user.email})
                        </span>
                      </label>
                    ))}
                </div>

                {/* Кнопки */}
                <div className="mt-6 flex justify-end space-x-2">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    onClick={onClose}
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={handleSave}
                    disabled={assignMutation.isLoading}
                  >
                    {assignMutation.isLoading ? 'Сохраняем…' : 'Сохранить'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
