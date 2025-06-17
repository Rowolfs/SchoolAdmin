// frontend/components/AssignDisciplineTeachersModal.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useDisciplineTeachersByClass } from '../hooks/useDisciplineTeachersByClass';
import type { DisciplineTeacherPair } from '../utils/classApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  classId: number;
}

export default function AssignDisciplineTeachersModal({
  isOpen,
  onClose,
  classId,
}: Props) {
  const {
    data,
    isLoading,
    search: { mutate: searchMutate, isLoading: isSearchLoading },
    assign: { mutate: assignMutate, isLoading: isAssigning },
  } = useDisciplineTeachersByClass(classId);

  const [query, setQuery] = useState('');
  const [list, setList] = useState<DisciplineTeacherPair[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isOpen) return;
    setSelected(new Set(data.filter(p => p.assigned).map(p => p.id)));
    setQuery('');
    searchMutate('', { onSuccess: setList });
  }, [isOpen, classId, data, searchMutate]);

  useEffect(() => {
    if (!isOpen) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchMutate(query.trim(), { onSuccess: setList });
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, isOpen, searchMutate]);

  const toggle = (p: DisciplineTeacherPair) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(p.id) ? next.delete(p.id) : next.add(p.id);
      return next;
    });
  };

  const onSave = () => {
    const selectedIds = list.filter(p => selected.has(p.id)).map(p => p.id);
    assignMutate({ pairs: selectedIds }, { onSuccess: onClose });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Назначить пары «дисциплина–учитель»</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Поиск по ФИО или дисциплине"
          className="w-full border rounded-lg px-4 py-2 mb-4"
        />

        <div className="border rounded-lg mb-4 max-h-64 overflow-y-auto">
          {(isLoading || isSearchLoading) ? (
            <p className="text-center py-4">Загрузка…</p>
          ) : (
            list.map(p => {
              const checked = selected.has(p.id);
              return (
                <label
                  key={p.id}
                  className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                    checked ? 'bg-blue-100' : 'hover:bg-gray-100'
                  }`}
                >
                  <span>
                    {p.discipline.name} — {p.teacher.user.surname} {p.teacher.user.name}
                  </span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(p)}
                    className="w-4 h-4"
                  />
                </label>
              );
            })
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 rounded-2xl bg-gray-200 hover:bg-gray-300">
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
