// frontend/components/AssignTeachersModal.tsx

import React, { useState, useEffect } from 'react';
import { useSearchTeachers } from '../hooks/useSearchTeachers';
import { useTeachersByDiscipline } from '../hooks/useTeachersByDiscipline';
import { useAssignTeachers } from '../hooks/useDisciplines';

interface AssignTeachersModalProps {
  isOpen: boolean;
  onClose: () => void;
  disciplineId: number;
  existingTeacherIds: number[];
}

export default function AssignTeachersModal({
  isOpen,
  onClose,
  disciplineId,
  existingTeacherIds,
}: AssignTeachersModalProps) {
  // 1) Сразу получаем уже закреплённых за дисциплиной Teacher.id
  const {
    data: teachersOfDiscipline = [],
    isLoading: loadingAssigned,
  } = useTeachersByDiscipline(disciplineId);

  // 2) Локальное состояние строки поиска
  const [searchStr, setSearchStr] = useState<string>('');

  // 3) «Доступные» преподаватели (и занятые, и свободные)
  const {
    data: searchResults = [],
    isLoading: loadingSearchResults,
  } = useSearchTeachers(searchStr, disciplineId);

  // 4) Локальный массив «отмеченных» Teacher.id
  //    Инициализируется при открытии модалки
  const [checkedIds, setCheckedIds] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSearchStr('');
      setCheckedIds(teachersOfDiscipline.map(t => t.id));
    }
  }, [isOpen, teachersOfDiscipline]);

  // 5) Мутация для отправки списка
  const assignMutation = useAssignTeachers();

  // 6) Обработчик клика по чекбоксу
  const toggleCheck = (id: number) => {
    setCheckedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // 7) Сохранить изменения
  const handleSave = () => {
    assignMutation.mutate(
      { disciplineId, teacherIds: checkedIds },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96 max-h-[80vh] overflow-y-auto">
        {/* Заголовок и кнопка «закрыть» */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Назначить преподавателей</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Строка поиска */}
        <input
          type="text"
          placeholder="Поиск по ФИО..."
          value={searchStr}
          onChange={e => setSearchStr(e.target.value)}
          className="w-full border px-3 py-2 mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
        />

        {/* Список «доступных» + «назначенных» */}
        <div className="max-h-64 overflow-y-auto border rounded mb-4">
          {(loadingAssigned || loadingSearchResults) ? (
            <p className="p-2 text-center text-gray-400">Загрузка…</p>
          ) : searchResults.length === 0 ? (
            <p className="p-2 text-center text-gray-500">Ничего не найдено</p>
          ) : (
            searchResults.map(teacher => {
              const isChecked = checkedIds.includes(teacher.id);
              const fio = `${teacher.user.surname} ${teacher.user.name} ${teacher.user.patronymic}`;

              return (
                <label
                  key={teacher.id}
                  className={`flex items-center justify-between px-3 py-2 cursor-pointer ${
                    isChecked ? 'bg-blue-100' : 'hover:bg-gray-100'
                  }`}
                >
                  <span>{fio}</span>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCheck(teacher.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300"
                  />
                </label>
              );
            })
          )}
        </div>

        {/* Кнопки «Отмена» и «Сохранить» */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={assignMutation.isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {assignMutation.isLoading ? 'Сохраняем…' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}