// frontend/hooks/useStudents.ts
import { useQuery } from '@tanstack/react-query';

// Интерфейс Student – подгоните под свой формат в utils/api.ts
export interface Student {
  id: number;           // Pupil.id
  userId: number;       // User.id
  classId: number | null;
  user: {
    id: number;
    name: string;
    surname: string;
    patronymic: string;
    email: string;
    role: string;       // 'STUDENT'
  };
  createdAt: string;
}

/**
 * Хук для получения всех студентов
 * GET /api/students
 */
export function useStudents() {
  return useQuery<Student[]>(['students'], () =>
    fetch('/api/students', { credentials: 'include' }).then((res) => {
      if (!res.ok) throw new Error('Ошибка при загрузке студентов');
      return res.json();
    })
  );
}

/**
 * Хук для получения студентов одного класса
 * GET /api/students/class/:classId
 * @param classId - ID класса
 */
export function useStudentsByClass(classId: number) {
  return useQuery<Student[]>(
    ['studentsByClass', classId],
    () =>
      fetch(`/api/students/class/${classId}`, { credentials: 'include' }).then((res) => {
        if (!res.ok) throw new Error('Ошибка при загрузке студентов для класса');
        return res.json();
      }),
    {
      enabled: classId !== undefined && classId !== null,
    }
  );
}
