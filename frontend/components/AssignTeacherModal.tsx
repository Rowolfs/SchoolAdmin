// frontend/components/AssignTeacherModal.tsx
import React, { useState, useEffect } from 'react';
import { useTeachers } from '../hooks/useTeachers';
import { useAssignTeacher } from '../hooks/useAssignTeacher';

interface AssignTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: number;
  existingTeacherId: number | null;
}

export default function AssignTeacherModal({
  isOpen,
  onClose,
  classId,
  existingTeacherId,
}: AssignTeacherModalProps) {
  // Локальный state для выбранного teacherId
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(
    existingTeacherId
  );

  const { data: teachers = [], isLoading, isError } = useTeachers();
  const assignMutation = useAssignTeacher();

  // При открытии модалки синхронизируем локальное состояние
  useEffect(() => {
    if (isOpen) {
      setSelectedTeacherId(existingTeacherId);
    }
  }, [isOpen, existingTeacherId]);

  const handleSave = () => {
    assignMutation.mutate(
      { classId, teacherId: selectedTeacherId },
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Назначить преподавателя</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {isLoading ? (
          <p className="text-center py-4">Загрузка преподавателей...</p>
        ) : isError ? (
          <p className="text-center text-red-500 py-4">
            Ошибка загрузки списка преподавателей
          </p>
        ) : (
          <div className="flex flex-col border rounded mb-4 max-h-60 overflow-y-auto">
            {teachers.map((teacher) => {
              const fio = `${teacher.user.surname} ${teacher.user.name} ${teacher.user.patronymic}`;
              const isChecked = selectedTeacherId === teacher.id;
              return (
                <label
                  key={teacher.id}
                  className={`flex items-center justify-between px-3 py-2 cursor-pointer ${
                    isChecked ? 'bg-blue-100' : 'hover:bg-gray-100'
                  }`}
                >
                  <span>{fio}</span>
                  <input
                    type="radio"
                    name="teacher"
                    value={teacher.id}
                    checked={isChecked}
                    onChange={() => setSelectedTeacherId(teacher.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300"
                  />
                </label>
              );
            })}

            {/* Пункт «Без преподавателя» */}
            <label
              className={`flex items-center justify-between px-3 py-2 cursor-pointer ${
                selectedTeacherId === null ? 'bg-blue-100' : 'hover:bg-gray-100'
              }`}
            >
              <span>Без преподавателя</span>
              <input
                type="radio"
                name="teacher"
                value="null"
                checked={selectedTeacherId === null}
                onChange={() => setSelectedTeacherId(null)}
                className="w-4 h-4 text-blue-600 border-gray-300"
              />
            </label>
          </div>
        )}

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