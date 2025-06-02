// frontend/components/AssignStudentsModal.tsx
import React, { useState, useEffect } from 'react';
import { useSearchStudents } from '../hooks/useSearchStudents';
import { useStudentsByClass } from '../hooks/useStudentsByClass';
import { useAssignStudents } from '../hooks/useAssignStudents';

interface AssignStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: number;
}

export default function AssignStudentsModal({
  isOpen,
  onClose,
  classId,
}: AssignStudentsModalProps) {
  // 1) Сразу получаем массив уже закреплённых за классом Pupil.id
  const {
    data: pupilsOfClass = [],
    isLoading: loadingPupilsOfClass,
    isError: errorPupilsOfClass,
  } = useStudentsByClass(classId);

  // 2) Локальное состояние строки поиска
  const [searchStr, setSearchStr] = useState<string>('');

  // 3) Получаем «доступных» учеников — свободных и/или закреплённых за этим классом
  const {
    data: searchResults = [],
    isLoading: loadingSearchResults,
  } = useSearchStudents(searchStr, classId);

  // 4) Локальный массив «отмеченных» Pupil.id
  //    Инициализируем его при открытии модалки значением pupilsOfClass.map(p => p.id)
  const [checkedIds, setCheckedIds] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      // При каждом открытии модалки:
      setSearchStr(''); // сбросить строку поиска
      // Взять уже закреплённых за классом (запрашиваются в п.1)
      setCheckedIds(pupilsOfClass.map((p) => p.id));
    }
  }, [isOpen, pupilsOfClass]);

  // 5) Мутация для отправки списка checkedIds на сервер
  const assignMutation = useAssignStudents();

  // 6) Обработчик клика по одной строке (чекбоксу):
  const toggleCheck = (id: number) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // 7) По нажатию «Сохранить» вызываем мутацию
  const handleSave = () => {
    assignMutation.mutate(
      { classId, studentIds: checkedIds },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  // 8) Если модалка не открыта — ничего не рендерим
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white p-6 rounded shadow-lg w-96 max-h-[80vh] overflow-y-auto">
        {/* Заголовок и кнопка «закрыть» */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Назначить учеников</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* Строка поиска */}
        <input
          type="text"
          placeholder="Поиск по ФИО..."
          value={searchStr}
          onChange={(e) => setSearchStr(e.target.value)}
          className="w-full px-3 py-2 mb-3 rounded bg-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />

        {/* Если загрузка уже закреплённых ещё не завершилась */}
        {loadingPupilsOfClass && (
          <p className="p-2 text-center text-gray-400">Загрузка списка класса...</p>
        )}

        {/* Список результатов поиска / «свободных + своих» */}
        <div className="max-h-64 overflow-y-auto border border-gray-700 rounded mb-4">
          {(loadingSearchResults || loadingPupilsOfClass) ? (
            <p className="p-2 text-center text-gray-400">Загрузка…</p>
          ) : searchResults.length === 0 ? (
            <p className="p-2 text-center text-gray-500">Ничего не найдено</p>
          ) : (
            searchResults.map((pupil) => {
              const isChecked = checkedIds.includes(pupil.id);
              const fio = `${pupil.user.surname} ${pupil.user.name} ${pupil.user.patronymic}`;

              return (
                <label
                  key={pupil.id}
                  className={`flex items-center justify-between px-3 py-2 cursor-pointer ${
                    isChecked ? 'bg-blue-800' : 'hover:bg-gray-700'
                  }`}
                >
                  <span>{fio}</span>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCheck(pupil.id)}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
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
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
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
