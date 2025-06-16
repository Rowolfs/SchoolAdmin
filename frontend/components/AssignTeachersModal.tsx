// frontend/components/AssignTeachersModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useTeachersByDiscipline } from '../hooks/useTeachersByDiscipline';
import type { Teacher } from '../utils/disciplineApi';

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
  const {
    data: assigned = [],
    isLoading,
    search: { mutate: searchMutate },
    assign: { mutate: assignMutate, isLoading: isAssigning },
  } = useTeachersByDiscipline(disciplineId);

  const [query, setQuery] = useState('');
  const [teachersList, setTeachersList] = useState<Teacher[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const debounceRef = useRef<NodeJS.Timeout>();

  // При открытии модалки и при смене дисциплины — сброс состояния и первичный запрос
  useEffect(() => {
    if (!isOpen) return;
    setSelected(new Set(existingTeacherIds));
    setQuery('');
    searchMutate('', {
      onSuccess(data) {
        setTeachersList(data);
      },
    });
  }, [isOpen, disciplineId, existingTeacherIds]);

  // Поиск в реальном времени с дебаунсом
  useEffect(() => {
    if (!isOpen) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchMutate(query.trim(), {
        onSuccess(data) {
          setTeachersList(data);
        },
      });
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, isOpen]);

  const toggle = (id: number) => {
    setSelected(prev => {
      const nxt = new Set(prev);
      nxt.has(id) ? nxt.delete(id) : nxt.add(id);
      return nxt;
    });
  };

  const onSave = () => {
    assignMutate(Array.from(selected), { onSuccess: onClose });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Назначить преподавателей</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Начните вводить — поиск идёт сразу"
          className="w-full border rounded-lg px-4 py-2 mb-4"
        />

        <div className="border rounded-lg mb-4 max-h-60 overflow-y-auto">
          {isLoading ? (
            <p className="text-center py-4">Загрузка…</p>
          ) : (
            teachersList.map(t => {
              const fio = `${t.user.surname} ${t.user.name} ${t.user.patronymic}`;
              const checked = selected.has(t.id);
              return (
                <label
                  key={t.id}
                  className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                    checked ? 'bg-blue-100' : 'hover:bg-gray-100'
                  }`}
                >
                  <span>{fio}</span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(t.id)}
                    className="w-4 h-4"
                  />
                </label>
              );
            })
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-2xl bg-gray-200 hover:bg-gray-300"
          >
            Отмена
          </button>
          <button
            onClick={onSave}
            disabled={isAssigning}
            className="px-4 py-2 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isAssigning ? 'Сохраняем…' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}
